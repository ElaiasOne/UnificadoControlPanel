<script setup lang="ts">
import { computed } from 'vue';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Venta } from '../../services/api';

// Tipo extendido para asegurar campos listos para render.
type VentaPresentable = Venta & {
  Direccion: string;
  Localidad: string;
  Provincia: string;
  Dias: number;
};

const props = defineProps<{
  rows: VentaPresentable[];
  cargando: boolean;
}>();

// Orden por Dias ascendente (primero clientes con menos dias).
const rowsOrdenadasPorDias = computed(() =>
  [...props.rows].sort((a, b) => Number(a.Dias || 0) - Number(b.Dias || 0)),
);

// Exporta la tabla actual a PDF manteniendo el orden por Dias.
function exportarPdf() {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  doc.setFontSize(14);
  doc.text('Reporte de ventas por cliente', 40, 40);
  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleString('es-AR')}`, 40, 74);

  const body = rowsOrdenadasPorDias.value.map((item) => [
    String(item.ClienteWeb ?? ''),
    String(item.Descripcion ?? ''),
    String(item.Sucursal ?? ''),
    String(item.Direccion ?? ''),
    String(item.Localidad ?? ''),
    String(item.Provincia ?? ''),
    String(item.Dias ?? 0),
  ]);

  autoTable(doc, {
    startY: 88,
    head: [['Cliente', 'Descripcion', 'Sucursal', 'Direccion', 'Localidad', 'Provincia', 'Dias']],
    body,
    styles: {
      fontSize: 8,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [16, 111, 88],
    },
    columnStyles: {
      6: { halign: 'right' },
    },
  });

  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`ventas-por-dias-${stamp}.pdf`);
}
</script>

<template>
  <!-- Tabla principal del dashboard + accion de exportacion -->
  <Card>
    <template #title>
      <div class="table-header">
        <span>Detalle de ventas</span>
        <Button
          label="Exportar PDF"
          icon="pi pi-file-pdf"
          severity="danger"
          outlined
          :disabled="cargando || rowsOrdenadasPorDias.length === 0"
          @click="exportarPdf"
        />
      </div>
    </template>

    <template #content>
      <DataTable
        :value="rowsOrdenadasPorDias"
        :loading="cargando"
        sortField="Dias"
        :sortOrder="1"
        paginator
        :rows="50"
        :rowsPerPageOptions="[25, 50, 100, 150, 200]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        currentPageReportTemplate="{first} a {last} de {totalRecords} registros"
        stripedRows
        showGridlines
        scrollable
        scrollHeight="58vh"
        removableSort
        size="small"
      >
        <template #empty>No hay datos para los filtros aplicados.</template>
        <Column field="ClienteWeb" header="Cliente" sortable />
        <Column field="Descripcion" header="Descripcion" sortable />
        <Column field="Sucursal" header="Sucursal" sortable />
        <Column field="Direccion" header="Direccion" />
        <Column field="Localidad" header="Localidad" sortable />
        <Column field="Provincia" header="Provincia" sortable />
        <Column field="Dias" header="Dias" sortable />
      </DataTable>
    </template>
  </Card>
</template>

<style scoped>
/* Encabezado con titulo y boton PDF */
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}
</style>
