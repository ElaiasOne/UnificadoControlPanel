<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import LoginAccessCard from '../components/login/LoginAccessCard.vue';
import LoginIntroCard from '../components/login/LoginIntroCard.vue';
import { TOKEN_KEY, USER_KEY } from '../constants/session';
import { login, verificarEstadoBackend } from '../services/api';

const router = useRouter();

// Estado local de formulario y estado operativo del backend.
const username = ref('');
const password = ref('');
const cargando = ref(false);
const error = ref('');
const estadoBackend = ref<'comprobando' | 'online' | 'offline'>('comprobando');
const estadoTexto = ref('Comprobando conexion con backend...');

// Habilita envio solo cuando hay datos minimos y no hay request en curso.
const puedeEnviar = computed(
  () => username.value.trim().length > 0 && password.value.trim().length > 0 && !cargando.value,
);

// Mapea estado tecnico a severidad visual para Tag de PrimeVue.
const estadoSeverity = computed(() => {
  if (estadoBackend.value === 'online') {
    return 'success';
  }

  if (estadoBackend.value === 'offline') {
    return 'danger';
  }

  return 'info';
});

// Icono dinamico para comunicar conexion online/offline.
const estadoIcono = computed(() => {
  if (estadoBackend.value === 'online') {
    return 'pi pi-check-circle';
  }

  if (estadoBackend.value === 'offline') {
    return 'pi pi-times-circle';
  }

  return 'pi pi-spin pi-spinner';
});

// Valida que el backend este disponible antes de login.
async function comprobarBackend() {
  try {
    const estado = await verificarEstadoBackend();
    estadoBackend.value = estado.ok ? 'online' : 'offline';
    estadoTexto.value = estado.ok
      ? `Conexion activa`
      : 'Backend respondio con estado no valido';
  } catch (_error) {
    estadoBackend.value = 'offline';
    estadoTexto.value = 'No se pudo conectar al backend';
  }
}

// Flujo de login:
// 1) envia credenciales
// 2) guarda token/usuario
// 3) navega a dashboard
async function iniciarSesion() {
  if (!puedeEnviar.value) {
    return;
  }

  cargando.value = true;
  error.value = '';

  try {
    const data = await login(username.value.trim(), password.value);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
    await router.push('/dashboard');
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo iniciar sesion';
  } finally {
    cargando.value = false;
  }
}

// Al abrir pantalla, consulta estado del backend.
onMounted(() => {
  void comprobarBackend();
});
</script>

<template>
  <main class="page-shell">
    <!-- Vista compuesta por 2 componentes: descripcion + formulario -->
    <section class="login-layout">
      <LoginIntroCard />
      <LoginAccessCard
        :username="username"
        :password="password"
        :cargando="cargando"
        :puede-enviar="puedeEnviar"
        :estado-severity="estadoSeverity"
        :estado-icono="estadoIcono"
        :estado-texto="estadoTexto"
        :error="error"
        @update:username="username = $event"
        @update:password="password = $event"
        @submit="iniciarSesion"
      />
    </section>
  </main>
</template>

<style scoped>
.page-shell {
  min-height: 100vh;
  padding: 1.25rem;
  display: grid;
  place-items: center;
}

.login-layout {
  width: min(1100px, 100%);
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 1rem;
}

@media (max-width: 960px) {
  .page-shell {
    padding: 0.9rem;
    place-items: start;
  }

  .login-layout {
    grid-template-columns: 1fr;
  }
}
</style>
