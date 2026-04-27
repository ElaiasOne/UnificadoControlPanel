<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import DashboardFiltersCard from '../components/dashboard/DashboardFiltersCard.vue';
import DashboardKpiGrid from '../components/dashboard/DashboardKpiGrid.vue';
import DashboardTopBar from '../components/dashboard/DashboardTopBar.vue';
import DashboardVentasTable from '../components/dashboard/DashboardVentasTable.vue';
import Message from 'primevue/message';
import { TOKEN_KEY, USER_KEY } from '../constants/session';
import { obtenerPerfil, obtenerVentas, type Usuario, type Venta } from '../services/api';

const router = useRouter();

// Estado principal del dashboard.
const cargando = ref(false);
const error = ref('');
const usuario = ref<Usuario | null>(null);
const ventas = ref<Venta[]>([]);
const filtro = ref('');
const ultimaActualizacion = ref('-');
const fechaHasta = ref<Date | null>(new Date());
const fechaDesde = ref<Date | null>(new Date(Date.now() - 1000 * 60 * 60 * 24 * 30));

// Valores mostrados en barra superior.
const usuarioNombre = computed(() => usuario.value?.username || 'operador');
const usuarioRol = computed(() => usuario.value?.rol || 'sin rol');

// Filtro textual en cliente (sobre resultado ya traido por API).
const ventasFiltradas = computed(() => {
  const termino = filtro.value.trim().toLowerCase();

  if (!termino) {
    return ventas.value;
  }

  return ventas.value.filter((item) => {
    const campos = [
      item.ClienteWeb,
      item.Descripcion,
      item.Sucursal,
      item.Direccion,
      item.Localidad,
      item.Provincia,
      item.Dias,
    ];

    return campos.some((campo) => String(campo ?? '').toLowerCase().includes(termino));
  });
});

// Normaliza campos opcionales para simplificar render de tabla.
const ventasPresentables = computed(() =>
  ventasFiltradas.value.map((item) => ({
    ...item,
    Direccion: item.Direccion || '-',
    Localidad: item.Localidad || '-',
    Provincia: item.Provincia || '-',
    Dias: item.Dias ?? 0,
  })),
);

// KPIs de cabecera.
const clientesUnicos = computed(() => {
  const set = new Set(ventasFiltradas.value.map((item) => String(item.ClienteWeb)));
  return set.size;
});

const totalDias = computed(() =>
  ventasFiltradas.value.reduce((acc, item) => acc + Number(item.Dias || 0), 0),
);

// Convierte Date a formato esperado por backend (YYYY-MM-DD).
function aFechaApi(fecha: Date | null): string | undefined {
  if (!fecha) {
    return undefined;
  }

  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Helpers de sesion local.
function obtenerToken(): string {
  return localStorage.getItem(TOKEN_KEY) || '';
}

function limpiarSesion() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Cierre de sesion y regreso a login.
async function cerrarSesion() {
  limpiarSesion();
  await router.push('/login');
}

async function irAClientes() {
  await router.push('/clientes');
}

// Carga coordinada de perfil + ventas.
async function cargarDatos() {
  const token = obtenerToken();

  if (!token) {
    await router.replace('/login');
    return;
  }

  // Validacion basica del rango de fechas antes de consultar.
  if (fechaDesde.value && fechaHasta.value && fechaDesde.value.getTime() > fechaHasta.value.getTime()) {
    error.value = 'La fecha desde no puede ser mayor que la fecha hasta';
    return;
  }

  cargando.value = true;
  error.value = '';

  try {
    const [perfil, dataVentas] = await Promise.all([
      obtenerPerfil(token),
      obtenerVentas(token, {
        desde: aFechaApi(fechaDesde.value),
        hasta: aFechaApi(fechaHasta.value),
      }),
    ]);

    usuario.value = perfil.usuario;
    ventas.value = dataVentas;
    localStorage.setItem(USER_KEY, JSON.stringify(perfil.usuario));
    ultimaActualizacion.value = new Date().toLocaleString();
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : 'No se pudieron cargar los datos';
    error.value = mensaje;

    // Si token esta vencido/invalido, se forza cierre de sesion.
    if (/token|401|expirado|credenciales/i.test(mensaje)) {
      await cerrarSesion();
      return;
    }
  } finally {
    cargando.value = false;
  }
}

// Hidratacion inicial: intenta levantar usuario cacheado y luego refresca desde API.
onMounted(() => {
  const usuarioGuardado = localStorage.getItem(USER_KEY);

  if (usuarioGuardado) {
    try {
      usuario.value = JSON.parse(usuarioGuardado) as Usuario;
    } catch (_error) {
      localStorage.removeItem(USER_KEY);
    }
  }

  void cargarDatos();
});
</script>

<template>
  <main class="dashboard-shell">
    <!-- Header operativo con acciones de recarga y cierre de sesion -->
    <DashboardTopBar
      :usuario-nombre="usuarioNombre"
      :usuario-rol="usuarioRol"
      :cargando="cargando"
      @recargar="cargarDatos"
      @abrir-clientes="irAClientes"
      @cerrar-sesion="cerrarSesion"
    />

    <!-- KPIs rapidos construidos desde los datos actuales -->
    <DashboardKpiGrid
      :registros="ventasFiltradas.length"
      :clientes-unicos="clientesUnicos"
      :total-dias="totalDias"
      :ultima-actualizacion="ultimaActualizacion"
    />

    <!-- Filtros de fecha y busqueda -->
    <DashboardFiltersCard
      :fecha-desde="fechaDesde"
      :fecha-hasta="fechaHasta"
      :filtro="filtro"
      :cargando="cargando"
      @update:fecha-desde="fechaDesde = $event"
      @update:fecha-hasta="fechaHasta = $event"
      @update:filtro="filtro = $event"
      @aplicar="cargarDatos"
    />

    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

    <!-- Tabla principal con orden por dias y exportacion PDF -->
    <DashboardVentasTable :rows="ventasPresentables" :cargando="cargando" />
  </main>
</template>

<style scoped>
.dashboard-shell {
  min-height: 100vh;
  padding: 1rem;
  display: grid;
  gap: 1rem;
}

@media (max-width: 700px) {
  .dashboard-shell {
    padding: 0.75rem;
  }
}
</style>
