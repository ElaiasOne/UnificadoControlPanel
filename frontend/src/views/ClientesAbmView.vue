<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Toolbar from 'primevue/toolbar';
import { TOKEN_KEY, USER_KEY } from '../constants/session';
import {
  actualizarCliente,
  bajaCliente,
  crearCliente,
  obtenerClientes,
  obtenerPerfil,
  type Cliente,
  type Usuario,
} from '../services/api';

const router = useRouter();

const cargando = ref(false);
const guardando = ref(false);
const error = ref('');
const exito = ref('');
const usuario = ref<Usuario | null>(null);
const clientes = ref<Cliente[]>([]);
const clienteEditando = ref<Cliente | null>(null);
const filtro = ref('');

const form = reactive({
  ClienteWeb: 0,
  Sucursal: 0,
  Descripcion: '',
  Direccion: '',
  Localidad: 0,
  Rubro: '',
  Habilitado: true,
});

const clientesFiltrados = computed(() => {
  const termino = filtro.value.trim().toLowerCase();

  if (!termino) {
    return clientes.value;
  }

  return clientes.value.filter((item) => {
    const campos = [
      item.ClienteWeb,
      item.Sucursal,
      item.Descripcion,
      item.Direccion,
      item.Localidad,
      item.Rubro,
      item.Habilitado ? 'si' : 'no',
    ];

    return campos.some((campo) => String(campo ?? '').toLowerCase().includes(termino));
  });
});

const tituloFormulario = computed(() =>
  clienteEditando.value ? 'Modificar cliente' : 'Alta de cliente',
);

function obtenerToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

function limpiarSesion() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function resetFormulario() {
  form.ClienteWeb = 0;
  form.Sucursal = 0;
  form.Descripcion = '';
  form.Direccion = '';
  form.Localidad = 0;
  form.Rubro = '';
  form.Habilitado = true;
  clienteEditando.value = null;
}

function cargarFormulario(cliente: Cliente) {
  form.ClienteWeb = cliente.ClienteWeb;
  form.Sucursal = cliente.Sucursal;
  form.Descripcion = cliente.Descripcion;
  form.Direccion = cliente.Direccion;
  form.Localidad = cliente.Localidad;
  form.Rubro = cliente.Rubro;
  form.Habilitado = Boolean(cliente.Habilitado);
  clienteEditando.value = cliente;
}

function validarFormulario() {
  if (!Number.isInteger(form.ClienteWeb) || form.ClienteWeb <= 0) {
    return 'ClienteWeb debe ser un entero mayor a 0';
  }

  if (!Number.isInteger(form.Sucursal) || form.Sucursal <= 0) {
    return 'Sucursal debe ser un entero mayor a 0';
  }

  if (!form.Descripcion.trim()) {
    return 'Descripcion es obligatoria';
  }

  if (!form.Direccion.trim()) {
    return 'Direccion es obligatoria';
  }

  if (!Number.isInteger(form.Localidad) || form.Localidad <= 0) {
    return 'Localidad debe ser un entero mayor a 0';
  }

  if (!form.Rubro.trim()) {
    return 'Rubro es obligatorio';
  }

  return '';
}

async function cargarDatos() {
  const token = obtenerToken();

  if (!token) {
    await router.replace('/login');
    return;
  }

  cargando.value = true;
  error.value = '';

  try {
    const [perfil, data] = await Promise.all([obtenerPerfil(token), obtenerClientes(token)]);
    usuario.value = perfil.usuario;
    clientes.value = data;
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : 'No se pudieron cargar los clientes';
    error.value = mensaje;

    if (/token|401|expirado|credenciales/i.test(mensaje)) {
      limpiarSesion();
      await router.replace('/login');
    }
  } finally {
    cargando.value = false;
  }
}

async function guardarCliente() {
  const token = obtenerToken();

  if (!token) {
    await router.replace('/login');
    return;
  }

  const errorValidacion = validarFormulario();

  if (errorValidacion) {
    error.value = errorValidacion;
    exito.value = '';
    return;
  }

  guardando.value = true;
  error.value = '';
  exito.value = '';

  try {
    const payload: Cliente = {
      ClienteWeb: form.ClienteWeb,
      Sucursal: form.Sucursal,
      Descripcion: form.Descripcion.trim(),
      Direccion: form.Direccion.trim(),
      Localidad: form.Localidad,
      Rubro: form.Rubro.trim(),
      Habilitado: Boolean(form.Habilitado),
    };

    if (clienteEditando.value) {
      await actualizarCliente(
        token,
        clienteEditando.value.ClienteWeb,
        clienteEditando.value.Sucursal,
        payload,
      );
      exito.value = 'Cliente modificado correctamente';
    } else {
      await crearCliente(token, payload);
      exito.value = 'Cliente creado correctamente';
    }

    resetFormulario();
    await cargarDatos();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo guardar el cliente';
  } finally {
    guardando.value = false;
  }
}

async function deshabilitarCliente(cliente: Cliente) {
  const token = obtenerToken();

  if (!token) {
    await router.replace('/login');
    return;
  }

  const confirmado = window.confirm(
    `Se deshabilitara el cliente ${cliente.ClienteWeb} sucursal ${cliente.Sucursal}. Continuar?`,
  );

  if (!confirmado) {
    return;
  }

  error.value = '';
  exito.value = '';

  try {
    await bajaCliente(token, cliente.ClienteWeb, cliente.Sucursal);
    exito.value = 'Cliente deshabilitado correctamente';
    await cargarDatos();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo deshabilitar el cliente';
  }
}

async function cerrarSesion() {
  limpiarSesion();
  await router.push('/login');
}

onMounted(() => {
  void cargarDatos();
});
</script>

<template>
  <main class="clientes-shell">
    <Toolbar>
      <template #start>
        <div class="toolbar-copy">
          <h2>ABM de clientes</h2>
          <p>Alta, modificacion y baja logica de clientes del sistema</p>
        </div>
      </template>

      <template #end>
        <div class="toolbar-actions">
          <span class="usuario-label">{{ usuario?.username || 'operador' }}</span>
          <Button label="Dashboard" icon="pi pi-chart-bar" outlined @click="router.push('/dashboard')" />
          <Button label="Cerrar sesion" icon="pi pi-sign-out" severity="danger" outlined @click="cerrarSesion" />
        </div>
      </template>
    </Toolbar>

    <div class="clientes-grid">
      <Card>
        <template #title>{{ tituloFormulario }}</template>
        <template #content>
          <form class="clientes-form" @submit.prevent="guardarCliente">
            <div class="form-row">
              <label for="clienteWeb">ClienteWeb</label>
              <InputNumber
                id="clienteWeb"
                v-model="form.ClienteWeb"
                :min="1"
                :use-grouping="false"
                :disabled="Boolean(clienteEditando)"
              />
            </div>

            <div class="form-row">
              <label for="sucursal">Sucursal</label>
              <InputNumber
                id="sucursal"
                v-model="form.Sucursal"
                :min="1"
                :use-grouping="false"
                :disabled="Boolean(clienteEditando)"
              />
            </div>

            <div class="form-row">
              <label for="descripcion">Descripcion</label>
              <InputText id="descripcion" v-model.trim="form.Descripcion" maxlength="120" />
            </div>

            <div class="form-row">
              <label for="direccion">Direccion</label>
              <InputText id="direccion" v-model.trim="form.Direccion" maxlength="200" />
            </div>

            <div class="form-row">
              <label for="localidad">Localidad</label>
              <InputNumber id="localidad" v-model="form.Localidad" :min="1" :use-grouping="false" />
            </div>

            <div class="form-row">
              <label for="rubro">Rubro</label>
              <InputText id="rubro" v-model.trim="form.Rubro" maxlength="120" />
            </div>

            <div class="checkbox-row">
              <Checkbox id="habilitado" v-model="form.Habilitado" binary />
              <label for="habilitado">Habilitado</label>
            </div>

            <div class="form-actions">
              <Button type="submit" :label="clienteEditando ? 'Guardar cambios' : 'Crear cliente'" :loading="guardando" />
              <Button
                type="button"
                label="Cancelar"
                severity="secondary"
                outlined
                @click="resetFormulario"
              />
            </div>
          </form>
        </template>
      </Card>

      <Card>
        <template #title>Clientes</template>
        <template #content>
          <div class="table-header">
            <InputText v-model="filtro" placeholder="Buscar por cliente, sucursal, descripcion o rubro" />
          </div>

          <DataTable
            :value="clientesFiltrados"
            data-key="ClienteWeb"
            paginator
            :rows="10"
            :rows-per-page-options="[10, 20, 50]"
            :loading="cargando"
            responsive-layout="scroll"
            size="small"
          >
            <Column field="ClienteWeb" header="ClienteWeb" sortable />
            <Column field="Sucursal" header="Sucursal" sortable />
            <Column field="Descripcion" header="Descripcion" sortable />
            <Column field="Direccion" header="Direccion" />
            <Column field="Localidad" header="Localidad" sortable />
            <Column field="Rubro" header="Rubro" sortable />
            <Column field="Habilitado" header="Habilitado" sortable>
              <template #body="{ data }">
                <span>{{ data.Habilitado ? 'Si' : 'No' }}</span>
              </template>
            </Column>
            <Column header="Acciones">
              <template #body="{ data }">
                <div class="row-actions">
                  <Button label="Editar" icon="pi pi-pencil" size="small" text @click="cargarFormulario(data)" />
                  <Button
                    label="Baja"
                    icon="pi pi-ban"
                    size="small"
                    text
                    severity="danger"
                    @click="deshabilitarCliente(data)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>

    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
    <Message v-if="exito" severity="success" :closable="false">{{ exito }}</Message>
  </main>
</template>

<style scoped>
.clientes-shell {
  min-height: 100vh;
  padding: 1rem;
  display: grid;
  gap: 1rem;
}

.toolbar-copy h2 {
  margin: 0;
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

.usuario-label {
  font-weight: 600;
  opacity: 0.85;
}

.clientes-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 360px minmax(0, 1fr);
}

.clientes-form {
  display: grid;
  gap: 0.75rem;
}

.form-row {
  display: grid;
  gap: 0.3rem;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.table-header {
  margin-bottom: 0.8rem;
}

.row-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

@media (max-width: 980px) {
  .clientes-grid {
    grid-template-columns: 1fr;
  }
}
</style>
