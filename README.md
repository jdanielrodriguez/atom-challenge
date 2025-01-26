# **Atom Challenge - Fullstack Application**

Este proyecto es una aplicación de lista de tareas desarrollada con **Angular** para el frontend, **Express** en el backend, y utilizando **Firebase** para la base de datos y autenticación. Está configurado para ejecutarse en contenedores Docker y utiliza **Yarn** como gestor de paquetes en el frontend y **npm** en el backend.

---

## **Características Principales**

1. **Frontend**:
   - Construido con Angular 17.
   - Uso de Angular Material para una interfaz moderna y responsiva.
   - Administración de estados reactiva mediante RxJS.
   - Comunicación segura con el backend usando interceptores HTTP.
   - Implementación de encriptación RSA para proteger las contraseñas en tránsito.

2. **Backend**:
   - API REST desarrollada con Express y TypeScript.
   - Autenticación y gestión de usuarios mediante Firebase Admin SDK.
   - Middleware de autenticación para proteger las rutas privadas.
   - Encriptación y desencriptación de contraseñas utilizando claves RSA.

3. **Firebase**:
   - Uso del emulador para desarrollo local.
   - Configuración para Firestore, Authentication y Realtime Database.
   - Generación de tokens personalizados para gestionar la autenticación.

---

## **Requisitos Previos**

Asegúrate de tener instalado lo siguiente en tu sistema:

- **Node.js** (versión 18 o superior).
- **Yarn** como gestor de paquetes.
- **Docker** y **Docker Compose**.
- Una cuenta de Google Cloud configurada para Firebase.

---
## **Creación del Proyecto Firebase desde Cero**

### **1. Crear el Proyecto en Google Cloud**

1. Ve a Google Cloud Console: [`https://console.cloud.google.com/`](https://console.cloud.google.com/).
2. Haz clic en **Seleccionar Proyecto** en la parte superior izquierda.
3. Haz clic en **Nuevo Proyecto**.
   - **Nombre del proyecto**: Ingresa un nombre como `atom-challenge`.
   - **ID del proyecto**: Personaliza o utiliza el que se genere automáticamente.
   - Haz clic en **Crear**.

### **2. Habilitar APIs Necesarias**

Habilita las siguientes APIs desde la biblioteca de APIs de Google Cloud:

1. **Firebase Management API**: [`https://console.cloud.google.com/apis/library/firebase.googleapis.com`](https://console.cloud.google.com/apis/library/firebase.googleapis.com)
2. **Cloud Firestore API**: [`https://console.cloud.google.com/apis/library/firestore.googleapis.com`](https://console.cloud.google.com/apis/library/firestore.googleapis.com)
3. **Cloud Functions API** (si usas funciones): [`https://console.cloud.google.com/apis/library/cloudfunctions.googleapis.com`](https://console.cloud.google.com/apis/library/cloudfunctions.googleapis.com)

### **3. Configurar Firebase**

1. Ve a la consola de Firebase: [`https://console.firebase.google.com/`](https://console.firebase.google.com/).
2. Selecciona el proyecto que creaste en Google Cloud.
3. Configura las siguientes herramientas:
   - **Authentication**: Ve a "Authentication" > "Métodos de Inicio de Sesión" y habilita el método de correo electrónico y contraseña.
   - **Firestore**: Ve a "Firestore Database", haz clic en "Crear Base de Datos", selecciona el **modo de producción** y configura la región.

---

## **Instalación**

1. **Clonar el Repositorio**:
   ```bash
   git clone https://github.com/jdanielrodriguez/atom-challenge
   cd atom-challenge
   ```

2. **Obtener las Credenciales de Firebase**:

   1. Ve a [Google Cloud Console](https://console.cloud.google.com/).
   2. Selecciona tu proyecto de Firebase.
   3. Navega a **Configuración del Proyecto** > **Cuentas de servicio**.
   4. Haz clic en **Generar nueva clave privada**.
   5. Descarga el archivo JSON y guárdalo en `infra/firebase/service-account.json`.

   6. Para las variables de entorno del backend y frontend, accede a la consola de Firebase y obtén los valores desde la sección "Configuración del Proyecto" > "Tus apps". Copia los siguientes valores para cada entorno:
      - **API Key** (`FIREBASE_API_KEY` / `NG_APP_FIREBASE_API_KEY`).
      - **Auth Domain** (`FIREBASE_AUTH_DOMAIN` / `NG_APP_FIREBASE_AUTH_DOMAIN`).
      - **Project ID** (`FIREBASE_PROJECT_ID` / `NG_APP_FIREBASE_PROJECT_ID`).
      - **Storage Bucket** (`FIREBASE_STORAGE_BUCKET` / `NG_APP_FIREBASE_STORAGE_BUCKET`).
      - **Messaging Sender ID** (`FIREBASE_MESSAGING_SENDER_ID` / `NG_APP_FIREBASE_MESSAGING_SENDER_ID`).
      - **App ID** (`FIREBASE_APP_ID` / `NG_APP_FIREBASE_APP_ID`).
      - **Measurement ID** (`FIREBASE_MEASUREMENT_ID` / `NG_APP_FIREBASE_MEASUREMENT_ID`).

   > **Nota**: No subas este archivo ni los valores de entorno sensibles al repositorio. Usa ejemplos como `service-account.json.example` y `.env.example`.

3. **Configurar el Archivo `.env`**:
   Crea un archivo `.env` en `apps/backend/` basado en el ejemplo proporcionado (`.env.example`):

   ```env
   NODE_ENV=development
   GOOGLE_APPLICATION_CREDENTIALS=/app/service-account.json
   PORT=3000
   USE_FIRESTORE_EMULATOR=true
   MAIL_HOST=192.168.100.6
   MAIL_PORT=1025
   MAIL_FROM=no-reply@atom-challenge.local
   FIREBASE_API_KEY=FIREBASE_API_KEY_VALUE
   FIREBASE_AUTH_DOMAIN=FIREBASE_AUTH_DOMAIN_VALUE
   FIREBASE_PROJECT_ID=FIREBASE_PROJECT_ID_VALUE
   FIREBASE_STORAGE_BUCKET=FIREBASE_STORAGE_BUCKET_VALUE
   FIREBASE_MESSAGING_SENDER_ID=FIREBASE_MESSAGING_SENDER_ID_VALUE
   FIREBASE_APP_ID=FIREBASE_APP_ID_VALUE
   FIREBASE_MEASUREMENT_ID=FIREBASE_MEASUREMENT_ID_VALUE
   PRIVATE_KEY=PRIVATE_KEY_VALUE
   ```

   Crea un archivo `.env` en `apps/frontend/` basado en el ejemplo proporcionado (`.env.example`):

   ```env
   NG_APP_FIREBASE_API_KEY=NG_APP_FIREBASE_API_KEY_VALUE
   NG_APP_FIREBASE_AUTH_DOMAIN=NG_APP_FIREBASE_AUTH_DOMAIN_VALUE
   NG_APP_FIREBASE_PROJECT_ID=NG_APP_FIREBASE_PROJECT_ID_VALUE
   NG_APP_FIREBASE_STORAGE_BUCKET=NG_APP_FIREBASE_STORAGE_BUCKET_VALUE
   NG_APP_FIREBASE_MESSAGING_SENDER_ID=NG_APP_FIREBASE_MESSAGING_SENDER_ID_VALUE
   NG_APP_FIREBASE_APP_ID=NG_APP_FIREBASE_APP_ID_VALUE
   NG_APP_FIREBASE_MEASUREMENT_ID=NG_APP_FIREBASE_MEASUREMENT_ID_VALUE
   NG_APP_PUBLIC_KEY=NG_APP_PUBLIC_KEY_VALUE
   ```

4. **Actualizar Docker Compose y Firebase Config**:
   - Asegúrate de actualizar el **ID del Proyecto** en los siguientes archivos:
     
     **Docker Compose** (`infra/docker-compose.yml`):
     ```yaml
     entrypoint:
       [
         "firebase",
         "emulators:start",
         "--only",
         "firestore,functions,auth,database",
         "--project=${FIREBASE_PROJECT_ID}"
       ]
     ```

     **Firebase Config** (`infra/firebase/.firebaserc`):
     ```json
     {
       "projects": {
         "default": "${FIREBASE_PROJECT_ID}"
       }
     }
     ```

     > Nota: Si usas `.env`, puedes usar un script para inyectar las variables en estos archivos antes de levantar los servicios.

5. **Instalar Dependencias**:

   - En el **frontend**:
     ```bash
     cd apps/frontend
     yarn install
     ```

   - En el **backend**:
     ```bash
     cd apps/backend
     npm install
     ```

   - En el **firebase**:
     ```bash
     cd infra/firebase/functions
     npm install
     ```

6. **Levantar los Servicios con Docker**:

   Desde la raíz del proyecto, ejecuta:
   ```bash
   make up
   ```

   Esto construirá y levantará los contenedores:
   - **Frontend**: Disponible en `http://localhost:4201`.
   - **Backend**: Disponible en `http://localhost:3000`.
   - **Firebase Emulator UI**: Disponible en `http://localhost:4000`.

---

## **Estructura del Proyecto**

```
root/
├── apps/
│   ├── frontend/        # Código del frontend en Angular.
│   ├── backend/         # Código del backend en Express.
├── infra/
│   ├── docker/          # Archivos Docker para cada servicio.
│   ├── firebase/        # Configuración de Firebase y emuladores.
│   │   ├── service-account.json.example
│   │   ├── firebase.json
│   │   ├── functions/
│   │   │   └── index.js
│   └── docker-compose.yml
├── Makefile             # Comandos para manejar los servicios.
```

---

## **Comandos Disponibles**

### **Con `make`**
- `make up`: Levanta todos los contenedores.
- `make down`: Detiene y elimina los contenedores.

### **Sin `make`**
Si prefieres usar Docker Compose directamente:

```bash
docker-compose -f infra/docker-compose.yml up -d
docker-compose -f infra/docker-compose.yml down
```

---

## **Pruebas**

1. **Verifica que todos los contenedores están funcionando**:
   ```bash
   docker ps
   ```

2. **Endpoints disponibles**:
   - **Backend Health Check**: `http://localhost:3000/api/health`
   - **Frontend**: `http://localhost:4201`
   - **Firebase Emulator UI**: `http://localhost:4000`

---

## **Consideraciones de Seguridad**

- Todas las contraseñas se encriptan utilizando RSA antes de enviarse al backend.
- Asegúrate de que las claves públicas y privadas utilizadas en el frontend y backend estén correctamente configuradas.
- Para generar las claves públicas y privadas necesarias para el sistema:

  1. **Usa OpenSSL para generar un par de claves RSA:**

     ```bash
     openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048
     openssl rsa -pubout -in private_key.pem -out public_key.pem
     ```

     Esto generará:
     - `private_key.pem`: Clave privada que debes configurar en el backend (`PRIVATE_KEY` en el `.env`).
     - `public_key.pem`: Clave pública que debes configurar en el frontend (`NG_APP_PUBLIC_KEY` en el `.env`).

  2. **Protege tu clave privada:**
     - Asegúrate de que el archivo de la clave privada no sea subido al repositorio.
     - Establece permisos restringidos:

       ```bash
       chmod 600 private_key.pem
       ```

  3. **Verifica las claves:**
     - Puedes revisar el contenido de las claves generadas para asegurarte de que son válidas:

       ```bash
       cat private_key.pem
       cat public_key.pem
       ```

  4. **Copiar las claves en las configuraciones correspondientes:**
     - **Frontend:** Incluye el contenido de `public_key.pem` en el archivo `.env` del frontend bajo `NG_APP_PUBLIC_KEY`.
     - **Backend:** Incluye el contenido de `private_key.pem` en el archivo `.env` del backend bajo `PRIVATE_KEY`.

---

## **Contribuir**

1. Realiza un fork del repositorio.
2. Crea una nueva rama para tu funcionalidad:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. Realiza tus cambios y envía un Pull Request.

---

## **Licencia**

Este proyecto está bajo la licencia MIT.
