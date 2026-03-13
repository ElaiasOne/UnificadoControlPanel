<script setup lang="ts">
// Tarjeta informativa: resume objetivo del sistema en pantalla de login.
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import logoSrc from '../../assets/tecnolar-logo.svg';
</script>

<template>
  <!-- Bloque institucional/descriptivo -->
  <Card class="intro-card">
    <template #title>
      <div class="title-row">
        <div class="brand-block">
          <img class="brand-logo" :src="logoSrc" alt="Logo de Tecnolar Unificado" />
          <span>Unificado Control Panel</span>
        </div>
        <Tag value="Acceso interno" severity="success" />
      </div>
    </template>

    <template #content>
      <p class="intro-copy">
        Este sistema permite consultar la actividad comercial y controlar cuántos días tienen
        ventas registradas los clientes dentro de un período. Con esa información se puede
        detectar continuidad de compra, baja frecuencia y necesidad de seguimiento.
      </p>
    </template>
  </Card>
</template>

<style scoped>
/* Este componente solo define layout local de su propia tarjeta */
.intro-card {
  height: 100%;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.brand-logo {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  box-shadow: 0 3px 10px rgba(11, 93, 138, 0.24);
}

.intro-copy {
  margin: 0;
  line-height: 1.55;
}
</style>
