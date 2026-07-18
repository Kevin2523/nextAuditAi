# Biometric MFA — WebAuthn / FIDO2 (Face ID, Huella, Passkey)

## Vista General

Se implementa **WebAuthn (FIDO2)** como único estándar para cubrir los factores biométricos y de hardware solicitados:

| Factor biométrico | Cómo lo cubre WebAuthn |
|---|---|
| **Face ID** | Face ID de Apple / Windows Hello facial |
| **Huella dactilar** | Touch ID, Windows Hello fingerprint, lectores USB |
| **Llave USB (FIDO2)** | YubiKey, Google Titan, SoloKey y cualquier llavero USB de seguridad |
| **Passkey** | Sincronización cross-device vía iCloud Keychain, Google Password Manager, etc. |

No se necesita integración con SDKs de terceros (Nexmo, Twilio, etc.). Todo pasa por:
- **`navigator.credentials.create()`** — registro de passkey (el browser lanza el diálogo biométrico del SO)
- **`navigator.credentials.get()`** — autenticación con passkey (el browser pide Face ID / huella / PIN)

El backend solo maneja desafíos criptográficos (challenges) y almacena claves públicas. **Nunca toca datos biométricos crudos.**

### Decisión de diseño: Password O Passkey

El login funciona como **O contraseña O passkey**, no ambos. El usuario elige:
1. **Login tradicional:** email + password (con MFA TOTP si está habilitado)
2. **Login con passkey:** email → Face ID / huella / USB / PIN → acceso directo

No se exige contraseña cuando se usa passkey. Esto sigue el estándar de la industria (Google, Apple, GitHub, 1Password).

---

## Arquitectura

```
Frontend (Angular)                  Backend (NestJS)                 DB (PostgreSQL)
       │                                   │                              │
       │ POST /passkey/register/begin ─────>│                              │
       │<───── { challenge, rp, user, ... } │                              │
       │                                   │                              │
       │ navigator.credentials.create()    │                              │
       │ (Face ID / Touch ID / PIN)        │                              │
       │                                   │                              │
       │ POST /passkey/register/complete ──>│                              │
       │    { id, rawId, response }        │ ── verifica ──>              │
       │                                   │ ── INSERT passkey ──────────>│
       │<───── { ok }                      │                              │
       │                                   │                              │
       │ POST /passkey/login/begin ───────>│                              │
       │<───── { challenge, allowCredentials }                            │
       │                                   │                              │
       │ navigator.credentials.get()       │                              │
       │ (Face ID / Touch ID / PIN)        │                              │
       │                                   │                              │
       │ POST /passkey/login/complete ────>│                              │
       │    { id, rawId, response }        │ ── verifica ──>              │
       │                                   │ ── SELECT passkey ─────────>│
       │<───── { accessToken, refreshToken }                              │
```

---

## Modelo de datos (Prisma)

Agregar al archivo `backend/prisma/schema.prisma` dentro del esquema `iam`:

```prisma
model Passkey {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId          String    @map("user_id") @db.Uuid
  credentialId    String    @unique @map("credential_id")
  publicKey       Bytes     @map("public_key")
  counter         BigInt    @default(0) @map("counter")
  transports      String?   @map("transports")
  deviceName      String?   @map("device_name")
  deviceType      String?   @map("device_type")      // "single", "multi", "platform"
  backedUp        Boolean   @default(false) @map("backed_up")
  createdAt       DateTime  @default(now()) @map("created_at")
  lastUsedAt      DateTime? @map("last_used_at")

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("passkeys")
  @@schema("iam")
}
```

### Migración SQL

```sql
-- backend/prisma/migrations/XXXXXX_add_passkeys/migration.sql
CREATE TABLE iam.passkeys (
    id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         uuid        NOT NULL REFERENCES iam.users(id) ON DELETE CASCADE,
    credential_id   text        NOT NULL UNIQUE,
    public_key      bytea       NOT NULL,
    counter         bigint      DEFAULT 0 NOT NULL,
    transports      text,
    device_name     text,
    device_type     text,
    backed_up       boolean     DEFAULT false NOT NULL,
    created_at      timestamptz DEFAULT now() NOT NULL,
    last_used_at    timestamptz
);

CREATE INDEX idx_passkeys_user_id ON iam.passkeys(user_id);
```

---

## Dependencias

### Backend (package.json)

```json
"@simplewebauthn/server": "^10.0.0"
```

### Frontend (package.json)

```json
"@simplewebauthn/browser": "^10.0.0"
```

---

## Endpoints de API

### 1. `POST /api/v1/auth/passkey/register/begin`

Inicia el registro de una nueva passkey. Requiere JWT (usuario autenticado).

**Payload:**
```json
{
  "deviceName": "Mi laptop personal"
}
```

**Respuesta (200):**
```json
{
  "options": {
    "rp": {
      "name": "NextAudit AI",
      "id": "nextaudit.local"
    },
    "user": {
      "id": "base64-uuid",
      "name": "admin@nextaudit.local",
      "displayName": "Administrador Local"
    },
    "challenge": "base64-challenge",
    "pubKeyCredParams": [
      { "type": "public-key", "alg": -7 },
      { "type": "public-key", "alg": -257 }
    ],
    "timeout": 60000,
    "attestation": "none",
    "authenticatorSelection": {
      "residentKey": "preferred",
      "userVerification": "preferred"
    }
  }
}
```

**Backend:**
- Genera un `challenge` con `@simplewebauthn/server`
- Lo guarda en sesión/memoria temporal asociada al `userId`

---

### 2. `POST /api/v1/auth/passkey/register/complete`

Completa el registro con la respuesta del navegador. Requiere JWT.

**Payload:**
```json
{
  "id": "base64-credential-id",
  "rawId": "base64-raw-id",
  "response": {
    "clientDataJSON": "base64",
    "attestationObject": "base64"
  },
  "deviceName": "Mi laptop personal"
}
```

**Respuesta (201):**
```json
{
  "id": "uuid-passkey",
  "deviceName": "Mi laptop personal",
  "createdAt": "2026-06-15T12:00:00.000Z"
}
```

**Backend:**
- Verifica la respuesta con `@simplewebauthn/server`
- Extrae `credentialId`, `publicKey`, `counter`, `transports`, `deviceType`, `backedUp`
- Persiste en `iam.passkeys`

---

### 3. `POST /api/v1/auth/passkey/login/begin`

Inicia autenticación con passkey. NO requiere JWT.

**Payload:**
```json
{
  "email": "admin@nextaudit.local"
}
```

**Respuesta (200):**
```json
{
  "options": {
    "challenge": "base64-challenge",
    "timeout": 60000,
    "allowCredentials": [
      {
        "id": "base64-credential-id",
        "type": "public-key",
        "transports": ["internal", "usb", "nfc", "ble"]
      }
    ],
    "userVerification": "preferred"
  }
}
```

**Backend:**
- Busca todas las passkeys del usuario por email
- Genera un challenge
- Lo guarda en sesión temporal asociada al `email`

---

### 4. `POST /api/v1/auth/passkey/login/complete`

Completa la autenticación con passkey. NO requiere JWT.

**Payload:**
```json
{
  "id": "base64-credential-id",
  "rawId": "base64-raw-id",
  "response": {
    "clientDataJSON": "base64",
    "authenticatorData": "base64",
    "signature": "base64",
    "userHandle": "base64"
  }
}
```

**Respuesta (200):**
```json
{
  "accessToken": "jwt",
  "refreshToken": "token_opaco",
  "tokenType": "Bearer",
  "user": {
    "id": "uuid",
    "email": "admin@nextaudit.local",
    "displayName": "Administrador Local",
    "role": "super_admin",
    "tenantId": "uuid",
    "isMfaEnabled": true
  }
}
```

**Backend:**
- Busca la passkey por `credentialId`
- Verifica la firma con `@simplewebauthn/server`
- Actualiza `counter` y `lastUsedAt`
- Si el contador no coincide → posible clonado, rechazar
- Emite JWT y refresh token

---

### 5. `GET /api/v1/auth/passkey`

Lista las passkeys del usuario autenticado. Requiere JWT.

**Respuesta (200):**
```json
[
  {
    "id": "uuid-passkey",
    "deviceName": "Mi laptop personal",
    "deviceType": "platform",
    "createdAt": "2026-06-15T12:00:00.000Z",
    "lastUsedAt": "2026-06-15T14:30:00.000Z"
  }
]
```

---

### 6. `DELETE /api/v1/auth/passkey/:id`

Elimina una passkey. Requiere JWT (solo dueño o super_admin).

**Respuesta (204):** sin contenido

---

## Flujo de login combinado (contraseña + MFA + passkey)

```
POST /api/v1/auth/login ───────────────> verifica credenciales
                                           │
                                           ├─ ¿MFA desactivado y sin passkeys?
                                           │   └─ accessToken + refreshToken
                                           │
                                           ├─ ¿MFA TOTP activado?
                                           │   └─ { mfaRequired: true, tempToken }
                                           │
                                           └─ ¿Tiene passkeys registradas?
                                               └─ { passkeysAvailable: true, tempToken }
```

El frontend puede mostrar:
- Input OTP de 6 dígitos (si `mfaRequired`)
- Botón "Usar Face ID / Huella / Passkey" (si `passkeysAvailable`)

---

## Diagrama de carpetas (Backend)

```
backend/apps/api/src/modules/auth/
├── auth.controller.ts
├── auth.module.ts
├── dto/
│   ├── mfa.dto.ts                        ← existente
│   └── passkey.dto.ts                    ← NUEVO
├── services/
│   ├── auth.service.ts                   ← existente
│   ├── auth-token.service.ts             ← existente
│   └── passkey.service.ts                ← NUEVO
└── strategies/
    └── passkey.strategy.ts               ← NUEVO (estrategia opcional para Passport)
```

---

## Esquema del servicio (passkey.service.ts)

```
PasskeyService
├── generateRegistrationOptions(user)    → PublicKeyCredentialCreationOptions
├── verifyRegistrationResponse(user, body) → { verified, passkey }
├── generateLoginOptions(email)          → PublicKeyCredentialRequestOptions
├── verifyLoginResponse(body)            → { verified, user }
├── listPasskeys(userId)                 → Passkey[]
├── deletePasskey(id, userId)            → void
├── getChallenge(sessionId)              → string (de Redis / memoria local)
└── clearChallenge(sessionId)            → void
```

### Manejo de challenges

Los challenges deben guardarse **por sesión** entre el `begin` y el `complete`. Opciones:

| Opción | Pros | Contras |
|--------|------|---------|
| **Redis** | Persistente, escalable, TTL automático | Requiere Redis corriendo |
| **Map en memoria** | Simple, sin dependencias | No escala horizontalmente, se pierde al reiniciar |
| **JWT de un solo uso** | Stateless, no requiere almacenamiento | Complejidad adicional |

**Recomendación inicial:** Map en memoria (con TTL de 5 min). Migrar a Redis cuando sea necesario.

```typescript
class ChallengeStore {
  private store = new Map<string, { challenge: string; email?: string; userId?: string }>();

  set(sessionId: string, data: { challenge: string; email?: string; userId?: string }) {
    this.store.set(sessionId, data);
    setTimeout(() => this.store.delete(sessionId), 5 * 60 * 1000); // TTL 5 min
  }

  get(sessionId: string) {
    const data = this.store.get(sessionId);
    this.store.delete(sessionId); // single-use
    return data;
  }
}
```

---

## Seguridad adicional

| Medida | Detalle |
|--------|---------|
| **Counter monotónico** | El `counter` en DB debe coincidir con el reportado por el autenticador. Si es menor → posible clonado del dispositivo, rechazar y alertar |
| **User verification** | Forzar `userVerification: "required"` en login para asegurar que el SO pidió Face ID / huella / PIN |
| **Attestation** | Usar `attestation: "none"` para simplificar (no verificar certificados del fabricante del dispositivo) |
| **Challenge TTL** | 5 minutos máximo entre `begin` y `complete` |
| **Rate limiting** | Aplicar rate limit a `/login/begin` y `/login/complete` (ej: 5 intentos por email cada 15 min) |

---

## UX en el Frontend (Angular)

### Registro de passkey

```
Dashboard → Seguridad → "Agregar Face ID / Huella"
    │
    └─ click → llama auth.passkeyRegisterBegin(deviceName)
             → navigator.credentials.create(options)
             → muestra diálogo del SO (Face ID / Touch ID / PIN)
             → llama auth.passkeyRegisterComplete(response)
             → muestra "Passkey registrada exitosamente"
```

### Login con passkey

```
Login → "Iniciar sesión con Face ID / Huella"
    │
    └─ click → ingresa email → auth.passkeyLoginBegin(email)
             → navigator.credentials.get(options)
             → muestra diálogo del SO (Face ID / Touch ID / PIN)
             → auth.passkeyLoginComplete(response)
             → redirige al dashboard
```

### Componentes sugeridos

```
frontend/nextaudit-app/src/app/features/auth/
├── login.ts / login.html                  ← existente (agregar botón passkey)
├── passkey-login.ts / passkey-login.html  ← NUEVO (modal/flujo passkey)
├── passkey-register.ts / passkey-register.html ← NUEVO

frontend/nextaudit-app/src/app/services/
├── auth.service.ts                        ← existente (agregar métodos passkey)
├── webauthn.service.ts                    ← NUEVO (wrappers navigator.credentials)
```

---

## Resumen de implementación

| # | Tarea | Estado |
|---|-------|--------|
| 1 | Agregar dependencia `@simplewebauthn/server` | ✅ `backend/package.json` |
| 2 | Agregar modelo `Passkey` a Prisma | ✅ `schema.prisma` — ejecutar `npx prisma migrate dev --name add_passkeys` |
| 3 | Crear `PasskeyService` + ChallengeStore | ✅ `services/passkey.service.ts` |
| 4 | Crear DTOs de passkey | ✅ `dto/passkey.dto.ts` |
| 5 | Agregar endpoints al controller | ✅ `auth.controller.ts` |
| 6 | Registrar `PasskeyService` en módulo | ✅ `auth.module.ts` |
| 7 | Agregar dependencia `@simplewebauthn/browser` | ✅ `frontend/package.json` |
| 8 | Crear `WebAuthnService` (wrappers browser) | ✅ `services/webauthn.service.ts` |
| 9 | Agregar botón "Passkey" al login | ✅ `login.html` + `login.ts` |
| 10 | Agregar UI de registro de passkey en Dashboard | ✅ `dashboard.html` + `dashboard.ts` |
| 11 | Agregar gestión de passkeys al Dashboard | ✅ `dashboard.html` + `dashboard.ts` |
| 12 | Actualizar `auth.service.ts` frontend | ✅ Métodos passkey agregados |
| — | **Pendiente:** `npm install` de dependencias | ⏳ Ejecutar `npm install` en backend y frontend |
| — | **Pendiente:** Prisma migrate | ⏳ Ejecutar `npx prisma migrate dev --name add_passkeys` |

---

## Referencias

- [WebAuthn W3C Spec](https://www.w3.org/TR/webauthn-3/)
- [@simplewebauthn/server docs](https://simplewebauthn.dev/docs/packages/server)
- [@simplewebauthn/browser docs](https://simplewebauthn.dev/docs/packages/browser)
- [FIDO2 Alliance](https://fidoalliance.org/fido2/)
- [MDN: Web Authentication API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API)
