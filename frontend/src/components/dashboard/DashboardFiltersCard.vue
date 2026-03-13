<script setup lang="ts">
// Componente de filtros:
// - rango de fechas
// - busqueda textual
// - accion para refrescar datos
import Button from 'primevue/button';
import Card from 'primevue/card';
import DatePicker from 'primevue/datepicker';
import InputText from 'primevue/inputtext';

defineProps<{
  fechaDesde: Date | null;
  fechaHasta: Date | null;
  filtro: string;
  cargando: boolean;
}>();

// Eventos hacia el padre para mantener una sola fuente de verdad en DashboardView.
const emit = defineEmits<{
  (e: 'update:fechaDesde', value: Date | null): void;
  (e: 'update:fechaHasta', value: Date | null): void;
  (e: 'update:filtro', value: string): void;
  (e: 'aplicar'): void;
}>();

// Locale manual para que el calendario se muestre en espanol.
const localeEs = {
  firstDayOfWeek: 1,
  dayNames: ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'],
  dayNamesShort: ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'],
  dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  monthNames: [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ],
  monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  today: 'Hoy',
  clear: 'Limpiar',
};
</script>

<template>
  <!-- Tarjeta de filtros del dashboard -->
  <Card>
    <template #title>Filtros de consulta</template>
    <template #content>
      <div class="filter-grid">
        <div class="field">
          <label for="fechaDesde">Desde</label>
          <DatePicker
            id="fechaDesde"
            :modelValue="fechaDesde"
            dateFormat="yy-mm-dd"
            :locale="localeEs"
            showIcon
            @update:modelValue="emit('update:fechaDesde', ($event as Date | null) ?? null)"
          />
        </div>

        <div class="field">
          <label for="fechaHasta">Hasta</label>
          <DatePicker
            id="fechaHasta"
            :modelValue="fechaHasta"
            dateFormat="yy-mm-dd"
            :locale="localeEs"
            showIcon
            @update:modelValue="emit('update:fechaHasta', ($event as Date | null) ?? null)"
          />
        </div>

        <div class="field wide">
          <label for="busqueda">Busqueda</label>
          <InputText
            id="busqueda"
            :modelValue="filtro"
            placeholder="Cliente, descripcion, localidad, provincia..."
            @update:modelValue="emit('update:filtro', String($event ?? '').trim())"
          />
        </div>

        <div class="actions">
          <Button
            label="Aplicar periodo"
            icon="pi pi-filter"
            :loading="cargando"
            @click="emit('aplicar')"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
/* Grilla responsive de campos de filtro */
.filter-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(170px, 1fr));
  gap: 0.75rem;
  align-items: end;
}

.field {
  display: grid;
  gap: 0.35rem;
}

.field label {
  font-weight: 600;
}

.field.wide {
  grid-column: span 2;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

:deep(.filter-grid .p-inputtext),
:deep(.filter-grid .p-datepicker) {
  width: 100%;
}

@media (max-width: 1100px) {
  .filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .field.wide {
    grid-column: span 2;
  }
}

@media (max-width: 700px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }

  .field.wide {
    grid-column: auto;
  }

  .actions {
    justify-content: stretch;
  }

  .actions :deep(.p-button) {
    width: 100%;
  }
}
</style>
