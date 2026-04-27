<script setup lang="ts">
// Barra superior del dashboard con:
// - contexto de usuario
// - acciones globales (recargar / cerrar sesion)
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Toolbar from 'primevue/toolbar';
import logoSrc from '../../assets/tecnolar-logo.svg';

defineProps<{
  usuarioNombre: string;
  usuarioRol: string;
  cargando: boolean;
}>();

const emit = defineEmits<{
  (e: 'recargar'): void;
  (e: 'abrirClientes'): void;
  (e: 'cerrarSesion'): void;
}>();
</script>

<template>
  <!-- Contenedor superior del dashboard -->
  <Toolbar class="main-toolbar">
    <template #start>
      <div class="toolbar-copy">
        <div class="brand-title">
          <img class="brand-logo" :src="logoSrc" alt="Logo de Tecnolar Unificado" />
          <h2>Tecnolar Unificado</h2>
        </div>
        <p>Consulta cuantos dias tienen registradas ventas los clientes</p>
      </div>
    </template>

    <template #end>
      <div class="toolbar-actions">
        <Tag :value="`Usuario: ${usuarioNombre}`" icon="pi pi-user" />
        <Tag :value="`Rol: ${usuarioRol}`" severity="info" />
        <Button
          label="Recargar"
          icon="pi pi-refresh"
          severity="secondary"
          :loading="cargando"
          @click="emit('recargar')"
        />
        <Button
          label="Clientes"
          icon="pi pi-users"
          outlined
          @click="emit('abrirClientes')"
        />
        <Button
          label="Cerrar sesion"
          icon="pi pi-sign-out"
          severity="danger"
          outlined
          @click="emit('cerrarSesion')"
        />
      </div>
    </template>
  </Toolbar>
</template>

<style scoped>
/* Estilos locales para distribuir texto y acciones */
.toolbar-copy h2 {
  margin: 0;
}

.brand-title {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.brand-logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(11, 93, 138, 0.24);
}

.toolbar-copy p {
  margin: 0.2rem 0 0;
  opacity: 0.75;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}
</style>
