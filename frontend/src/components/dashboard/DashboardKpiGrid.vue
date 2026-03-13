<script setup lang="ts">
// Tarjetas KPI del dashboard (resumen rapido de datos).
import Card from 'primevue/card';

defineProps<{
  registros: number;
  clientesUnicos: number;
  totalDias: number;
  ultimaActualizacion: string;
}>();
</script>

<template>
  <!-- Grilla de indicadores principales -->
  <section class="kpi-grid">
    <Card>
      <template #content>
        <p class="kpi-label">Registros</p>
        <h3 class="kpi-value">{{ registros }}</h3>
      </template>
    </Card>

    <Card>
      <template #content>
        <p class="kpi-label">Clientes unicos</p>
        <h3 class="kpi-value">{{ clientesUnicos }}</h3>
      </template>
    </Card>

    <Card>
      <template #content>
        <p class="kpi-label">Dias acumulados</p>
        <h3 class="kpi-value">{{ totalDias }}</h3>
      </template>
    </Card>

    <Card>
      <template #content>
        <p class="kpi-label">Ultima actualizacion</p>
        <h3 class="kpi-value small">{{ ultimaActualizacion }}</h3>
      </template>
    </Card>
  </section>
</template>

<style scoped>
/* Distribucion responsive de KPIs */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.kpi-label {
  margin: 0;
  opacity: 0.8;
}

.kpi-value {
  margin: 0.4rem 0 0;
  font-size: 1.5rem;
  line-height: 1.2;
}

.kpi-value.small {
  font-size: 1rem;
}

@media (max-width: 1100px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>
