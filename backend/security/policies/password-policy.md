# Politica de Contrasenas

Politica SaaS inicial para desarrollo local y entornos piloto.

- Longitud minima: 12 caracteres.
- Almacenar solo hashes fuertes de contrasena.
- No registrar contrasenas ni tokens de recuperacion en logs.
- Preferir MFA para `super_admin` antes del lanzamiento comercial.
- Bloquear o limitar por rate limit los intentos repetidos de login fallidos.
