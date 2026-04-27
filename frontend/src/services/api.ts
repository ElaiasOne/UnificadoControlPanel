// Tipos de datos compartidos entre frontend y backend.
export interface Usuario {
  id: number;
  username: string;
  nombre?: string;
  rol?: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface PerfilResponse {
  usuario: Usuario;
}

export interface EstadoResponse {
  ok: boolean;
  servicio: string;
  timestamp: string;
}

export interface Venta {
  ClienteWeb: string | number;
  Descripcion: string;
  Sucursal: string | number;
  Direccion?: string;
  Localidad?: string;
  Provincia?: string;
  Dias?: number;
}

export interface Cliente {
  ClienteWeb: number;
  Sucursal: number;
  Descripcion: string;
  Direccion: string;
  Localidad: number;
  Rubro: string;
  Habilitado: boolean;
}

export type ClientePayload = Cliente;

export interface FiltrosVentas {
  desde?: string;
  hasta?: string;
}

// URL base de API, configurable por entorno.
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

// Helper generico para:
// - ejecutar fetch
// - parsear JSON/texto
// - normalizar errores de backend
async function requestJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') || '';

  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload !== null && 'message' in payload
        ? String((payload as { message?: string }).message || 'Error inesperado')
        : `Error HTTP ${response.status}`;

    throw new Error(message);
  }

  return payload as T;
}

// Cabecera estandar para endpoints protegidos por JWT.
function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
  };
}

// Endpoint publico de salud del backend.
export function verificarEstadoBackend() {
  return requestJson<EstadoResponse>(`${API_BASE}/estado`);
}

// Login: devuelve token + datos de usuario.
export function login(username: string, password: string) {
  return requestJson<LoginResponse>(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
}

// Perfil autenticado (requiere Authorization Bearer).
export function obtenerPerfil(token: string) {
  return requestJson<PerfilResponse>(`${API_BASE}/auth/perfil`, {
    headers: authHeaders(token),
  });
}

// Consulta de ventas con filtros opcionales de fecha.
export function obtenerVentas(token: string, filtros: FiltrosVentas = {}) {
  const query = new URLSearchParams();

  if (filtros.desde) {
    query.set('desde', filtros.desde);
  }

  if (filtros.hasta) {
    query.set('hasta', filtros.hasta);
  }

  const queryString = query.toString();
  const endpoint = `${API_BASE}/vtas/vtas${queryString ? `?${queryString}` : ''}`;

  return requestJson<Venta[]>(endpoint, {
    headers: authHeaders(token),
  });
}

// ABM de clientes.
export function obtenerClientes(token: string) {
  return requestJson<Cliente[]>(`${API_BASE}/clientes`, {
    headers: authHeaders(token),
  });
}

export function crearCliente(token: string, payload: ClientePayload) {
  return requestJson<Cliente>(`${API_BASE}/clientes`, {
    method: 'POST',
    headers: {
      ...authHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export function actualizarCliente(
  token: string,
  clienteWeb: number,
  sucursal: number,
  payload: ClientePayload,
) {
  return requestJson<Cliente>(`${API_BASE}/clientes/${clienteWeb}/${sucursal}`, {
    method: 'PUT',
    headers: {
      ...authHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export function bajaCliente(token: string, clienteWeb: number, sucursal: number) {
  return requestJson<{ ClienteWeb: number; Sucursal: number; Habilitado: boolean }>(
    `${API_BASE}/clientes/${clienteWeb}/${sucursal}/baja`,
    {
      method: 'PATCH',
      headers: authHeaders(token),
    },
  );
}
