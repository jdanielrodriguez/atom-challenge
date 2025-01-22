# **Atom Challenge - Fullstack Application**

Este proyecto es una aplicación de lista de tareas desarrollada con **Angular** para el frontend, **Express** en el backend, y utilizando **Firebase** para la base de datos y autenticación. Todo está configurado para correr en contenedores Docker y utiliza **Yarn** como gestor de paquetes.

---

## **Características Principales**

1. **Frontend**:
   - Construido con Angular 17.
   - Administración de estado con NgRx.
   - Interfaz moderna usando Angular Material.
   - Comunicación con el backend a través de HTTP Interceptors.

2. **Backend**:
   - API REST desarrollada con Express y TypeScript.
   - Integración con Firebase Admin SDK para Firestore y autenticación.
   - Middleware de autenticación para proteger las rutas privadas.

3. **Firebase**:
   - Uso del emulador para desarrollo local.
   - Configuración para Firestore, Authentication y Realtime Database.

---

## **Requisitos Previos**

Asegúrate de tener instalado lo siguiente en tu sistema:

- **Node.js** (versión 18).
- **Yarn** como gestor de paquetes.
- **Docker** y **Docker Compose**.
- Una cuenta de Google Cloud configurada para Firebase.

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

   > **Nota**: No subas este archivo al repositorio. Usa el ejemplo `service-account.json.example`.

3. **Configurar el Archivo `.env`**:
   Crea un archivo `.env` en `apps/backend/` basado en el ejemplo proporcionado (`.env.example`):

   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=/app/service-account.json
   PORT=3000
   ```

4. **Instalar Dependencias**:

   En lugar de `npm`, este proyecto utiliza Yarn. Ejecuta los siguientes comandos:

   ```bash
   yarn install
   ```

   Repite este comando en las carpetas `apps/frontend` y `apps/backend`.

5. **Levantar los Servicios con Docker**:

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
