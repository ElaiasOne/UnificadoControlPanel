# Unificado Control Panel

Aplicacion full stack para consultar actividad comercial y controlar cuantos dias tienen ventas registradas los clientes dentro de un periodo.

## Tecnologias utilizadas

### Backend
- Node.js
- Express 5
- mssql (SQL Server)
- jsonwebtoken (JWT)
- cors
- nodemon

### Frontend
- Vue 3
- TypeScript
- Vite
- Vue Router
- PrimeVue + PrimeIcons + tema Aura
- jsPDF + jspdf-autotable (exportacion PDF)

### Base de datos
- SQL Server

## Estructura general

- `backend/`: API REST, autenticacion y acceso a SQL Server.
- `frontend/`: interfaz web, login, dashboard, filtros y exportacion.

## Como funciona el programa

1. El usuario inicia sesion en el frontend.
2. El frontend envia credenciales a `POST /auth/login`.
3. El backend valida usuario y devuelve un JWT.
4. El frontend guarda el token y lo envia en `Authorization: Bearer <token>`.
5. Con token valido, se consume:
   - `GET /auth/perfil`
   - `GET /vtas/vtas?desde=YYYY-MM-DD&hasta=YYYY-MM-DD`
6. El backend consulta SQL Server, agrupa por cliente/sucursal y calcula `Dias` (cantidad de dias con ventas registradas).
7. El dashboard muestra los datos, permite filtrar, ordenar por dias (ascendente) y exportar a PDF.

## Endpoints principales

- `GET /` -> estado simple de API
- `GET /estado` -> estado del servicio
- `POST /auth/login` -> login y generacion de token
- `GET /auth/perfil` -> perfil autenticado
- `GET /vtas/vtas` -> ventas protegidas por JWT

## Ejecucion local

Requisitos:
- Node.js (recomendado: 20.19+ o 22.12+)
- npm

### Backend
```bash
cd backend
npm install
npm run dev
```

Backend por defecto en `http://localhost:3000`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend por defecto en `http://localhost:5173`.

## Configuracion

### Frontend
- Copiar `frontend/.env.example` a `frontend/.env`.
- Ajustar `VITE_API_URL` si el backend corre en otra URL.

### Backend
- `PORT` para puerto del servidor.
- `JWT_SECRET` para firma de token.
- Conexion SQL Server por variables de entorno (`DB_*`).

## Despliegue en Render

Este repositorio incluye un Blueprint listo para Render: `render.yaml`.

### 1) Preparar repositorio
- Subir el proyecto a GitHub/GitLab.
- Verificar que `render.yaml` este en la raiz.

### 2) Crear servicios desde Blueprint
- En Render: **New > Blueprint**.
- Conectar el repo y seleccionar la rama.
- Render creara 2 servicios:
   - `unificado-control-panel-backend` (Web Service Node)
   - `unificado-control-panel-frontend` (Static Site)

### 3) Variables requeridas al crear

Backend (obligatorias):
- `DB_USER`
- `DB_PASSWORD`
- `DB_SERVER`
- `DB_NAME`

Backend (ya configuradas por defecto en blueprint):
- `DB_PORT=1433`
- `DB_ENCRYPT=false`
- `DB_TRUST_SERVER_CERTIFICATE=false`
- `JWT_SECRET` se genera automaticamente.

Frontend:
- `VITE_API_URL` se conecta automaticamente al `RENDER_EXTERNAL_URL` del backend.

### 4) Rutas SPA

El frontend ya incluye rewrite en Render para Vue Router:
- `/* -> /index.html` (type: rewrite)

### 5) Verificacion post deploy
- Backend: `https://<backend>.onrender.com/estado`
- Frontend: `https://<frontend>.onrender.com/login`
- Login, carga de dashboard y exportacion PDF.

## Notas de produccion

- La fuente de usuarios autenticables esta actualmente definida en codigo (`backend/src/services/auth.service.js`).
- Para produccion, se recomienda mover autenticacion a base de datos con password hash y politicas de seguridad.
- Tambien se recomienda externalizar configuraciones sensibles de base de datos a variables de entorno.
