# Guía paso a paso: adherirse como desarrollador al proyecto

Esta guía te lleva desde **no tener cuenta en GitHub** hasta **hacer tu primer pull request** en el repositorio **AI-Compliance Real-Time Sentinel**. Sigue los pasos en orden; si ya tienes algo hecho, salta al siguiente bloque.

---

## Índice

1. [Crear y configurar tu cuenta en GitHub](#1-crear-y-configurar-tu-cuenta-en-github)
2. [Instalar y configurar Git en tu máquina](#2-instalar-y-configurar-git-en-tu-máquina)
3. [Acceder al repositorio del proyecto](#3-acceder-al-repositorio-del-proyecto)
4. [Clonar el repositorio en tu equipo](#4-clonar-el-repositorio-en-tu-equipo)
5. [Configurar las ramas y el flujo de trabajo](#5-configurar-las-ramas-y-el-flujo-de-trabajo)
6. [Hacer tu primer cambio y abrir un PR](#6-hacer-tu-primer-cambio-y-abrir-un-pr)
7. [Siguientes pasos](#7-siguientes-pasos)

---

## 1. Crear y configurar tu cuenta en GitHub

### 1.1 Crear la cuenta (si no tienes)

1. Entra en **[github.com](https://github.com)** y pulsa **Sign up**.
2. Indica tu **email**, **contraseña** y **nombre de usuario** (ej. `tu-usuario`).
3. Verifica tu email con el enlace que GitHub te envía.
4. Completa el asistente inicial (puedes saltar preguntas si quieres).

### 1.2 Configuración recomendada

- **Perfil:** Añade nombre y (opcional) foto para que el equipo te reconozca en issues y PRs.
- **Autenticación en dos factores (2FA):** En **Settings → Password and authentication** activa 2FA. Es buena práctica y a veces exigida en organizaciones.
- **SSH (opcional pero útil):** Si prefieres no escribir usuario/contraseña en cada `git push`, configura una clave SSH (ver [Documentación de GitHub sobre SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)).

---

## 2. Instalar y configurar Git en tu máquina

### 2.1 Instalar Git

- **Windows:** Descarga [Git for Windows](https://git-scm.com/download/win) e instala (opción por defecto está bien).
- **macOS:** `xcode-select --install` o instala con Homebrew: `brew install git`.
- **Linux (Debian/Ubuntu):** `sudo apt update && sudo apt install git`.

Comprueba que está instalado:

```bash
git --version
```

### 2.2 Configurar nombre y email (obligatorio)

Estos datos aparecen en cada commit. Usa el **mismo email** que en tu cuenta de GitHub:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"
```

Comprueba:

```bash
git config --global user.name
git config --global user.email
```

---

## 3. Acceder al repositorio del proyecto

### 3.1 Encontrar el repositorio

- **URL del proyecto:**  
  **https://github.com/maurorosero/nextaudit-ai**
- Abre el enlace en el navegador e inicia sesión en GitHub si no lo has hecho.

### 3.2 Permisos: colaborador vs fork

- **Si te han añadido como colaborador:** Verás el repo en tu cuenta o te habrán pasado el enlace. Puedes clonar directamente y hacer push a ramas (según las reglas del repo).
- **Si aún no eres colaborador:** Puedes hacer un **fork** (botón **Fork** arriba a la derecha), clonar tu fork y luego proponer cambios al repo original mediante **Pull Requests**. Para participar de forma continuada, solicita al mantenedor que te añada como colaborador (ver siguiente apartado).

### 3.3 Cómo solicitar ser colaborador

Si quieres que el mantenedor te añada como **colaborador** del repositorio (para poder hacer push a ramas sin usar fork), puedes hacerlo de estas formas:

| Forma | Pasos |
| ----- | ----- |
| **Issue en el repo** | 1. Ve a [Issues](https://github.com/maurorosero/nextaudit-ai/issues). 2. **New issue**. 3. Título ej.: *Solicitud: añadir como colaborador*. 4. En el cuerpo indica tu **nombre de usuario de GitHub** (ej. `tu-usuario`), tu **rol** en el equipo si ya lo tienes (Infra, Data & Sensors, AI & ChatOps, Security & AI-Docs) y una línea de presentación. 5. Asigna la etiqueta `question` o la que use el equipo. 6. **Submit new issue**. |
| **Contacto directo** | Si conoces al mantenedor (email, Slack, etc.), escríbele indicando: *"Me gustaría ser colaborador del repo nextaudit-ai. Mi usuario de GitHub es: [tu-usuario]."* Así puede añadirte sin tener que buscar tu perfil. |
| **Tras un PR aceptado** | En el comentario del PR o en un issue de seguimiento, puedes pedir: *"Cuando mergees, ¿puedes añadirme como colaborador? Mi usuario es [tu-usuario]."* |

**Qué hace el mantenedor:** En el repositorio, **Settings → Collaborators → Add people** (o *Invite a collaborator*), escribe tu usuario de GitHub y asigna el permiso (por ejemplo *Write*). Tú recibirás una invitación por email; al aceptarla, podrás clonar el repo y hacer push a las ramas permitidas (respetando siempre la protección de `main` y `testing`, que exigen PR).

**Mientras no seas colaborador:** Sigue pudiendo contribuir con **fork + Pull Request**. No es obligatorio ser colaborador para participar.

---

## 4. Clonar el repositorio en tu equipo

Abre una terminal en la carpeta donde quieras tener el proyecto (ej. `~/developers` o `~/proyectos`).

### 4.1 Clonar por HTTPS (más simple)

```bash
cd ~/developers   # o la ruta que uses
git clone https://github.com/maurorosero/nextaudit-ai.git
cd nextaudit-ai
```

La primera vez que hagas `git push` te pedirá usuario y contraseña de GitHub. Para contraseña, usa un **Personal Access Token** (no la contraseña de la cuenta): [Crear token](https://github.com/settings/tokens) con al menos el permiso `repo`.

### 4.2 Clonar por SSH (si ya tienes clave SSH en GitHub)

```bash
git clone git@github.com:maurorosero/nextaudit-ai.git
cd nextaudit-ai
```

Comprueba que estás en el repo y en la rama `main`:

```bash
git status
git branch -a
```

Deberías ver `main`, `develop` y `testing` en `remotes/origin/`.

---

## 5. Configurar las ramas y el flujo de trabajo

El proyecto usa el flujo **develop → testing → main**. Trabaja siempre desde `develop` para nuevas funcionalidades.

### 5.1 Actualizar y traer todas las ramas

```bash
git fetch origin
```

### 5.2 Crear la rama local `develop` y usarla por defecto para desarrollo

```bash
git checkout develop
```

Si es la primera vez y no tienes `develop` local:

```bash
git checkout -b develop origin/develop
```

### 5.3 Comprobar que ves las tres ramas

```bash
git branch -a
```

Deberías ver algo como:

- `* develop`
- `main`
- `testing`
- `remotes/origin/develop`
- `remotes/origin/main`
- `remotes/origin/testing`

A partir de aquí, para empezar a trabajar **siempre** crea una rama nueva desde `develop` (paso 6).

---

## 6. Hacer tu primer cambio y abrir un PR

### 6.1 Asegurarte de estar en `develop` y actualizado

```bash
git checkout develop
git pull origin develop
```

### 6.2 Crear una rama para tu cambio

Usa prefijos según el tipo de cambio: `feature/`, `fix/`, `docs/`, `infra/`.

Ejemplo para una pequeña mejora de documentación:

```bash
git checkout -b docs/mi-primer-cambio
```

### 6.3 Hacer un cambio de prueba

Por ejemplo, edita `README.md` o crea un archivo en `docs/` (un typo, una línea de documentación, etc.). Guarda el archivo.

### 6.4 Ver qué ha cambiado y hacer commit

```bash
git status
git diff
```

Añade los archivos y haz commit con un mensaje claro:

```bash
git add README.md   # o los archivos que hayas tocado (ej. docs/..., .github/...)
git commit -m "docs: ejemplo de primer commit (onboarding)"
```

### 6.5 Subir tu rama y abrir el Pull Request

```bash
git push -u origin docs/mi-primer-cambio
```

1. Ve al repositorio en GitHub: **https://github.com/maurorosero/nextaudit-ai**
2. Verás un aviso **“Compare & pull request”**; haz clic.
3. **Base:** `develop` — **Compare:** `docs/mi-primer-cambio`.
4. Rellena **título** y **descripción** (qué cambias y por qué).
5. Pulsa **Create pull request**.

El CI se ejecutará automáticamente. Cuando pase y alguien apruebe (si aplica), se puede hacer merge a `develop`.

---

## 7. Siguientes pasos

- **Leer [CONTRIBUTING.md](../CONTRIBUTING.md):** Roles, tareas por semana, reglas de oro y criterios de colaboración.
- **Leer [README.md](../README.md):** Visión del proyecto, casos de uso y flujo de ramas.
- **Revisar los [Issues](https://github.com/maurorosero/nextaudit-ai/issues)** y los **Milestones** para ver en qué puedes trabajar según tu rol.
- **Respetar siempre las reglas de oro:** Zero Manual Touch, No Secrets in Code, Docker Everywhere.

Si tienes dudas, abre un **Issue** en el repositorio o contacta al equipo según indique el mantenedor.

---

*AI-Compliance Real-Time Sentinel — v16.0*
