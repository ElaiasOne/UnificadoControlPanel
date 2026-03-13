# Frontend Unificado Control Panel

Frontend en Vue 3 + TypeScript para consumir el backend Express con autenticacion JWT.

## Configuracion

1. Copia `.env.example` como `.env`.
2. Ajusta `VITE_API_URL` si tu backend no corre en `http://localhost:3000`.

## Comandos

- `npm install`
- `npm run dev`
- `npm run build`

## Flujo implementado

1. Login en `/login` consumiendo `POST /auth/login`.
2. Dashboard en `/dashboard` consumiendo:
	- `GET /auth/perfil`
	- `GET /vtas/vtas`
3. Persistencia de sesion en `localStorage`.
4. Tabla de ventas con filtro y paginacion cliente para evitar renderizado masivo.
