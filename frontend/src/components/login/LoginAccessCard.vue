<script setup lang="ts">
import { computed } from 'vue';
import Button from 'primevue/button';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Password from 'primevue/password';
import Tag from 'primevue/tag';

// Este componente es "presentacional":
// recibe estado por props y notifica cambios por emits.
const props = defineProps<{
  username: string;
  password: string;
  cargando: boolean;
  puedeEnviar: boolean;
  estadoSeverity: 'success' | 'danger' | 'info';
  estadoIcono: string;
  estadoTexto: string;
  error: string;
}>();

// Eventos que el padre (LoginView) escucha para actualizar estado.
const emit = defineEmits<{
  (e: 'update:username', value: string): void;
  (e: 'update:password', value: string): void;
  (e: 'submit'): void;
}>();

// Puentes v-model internos para no mutar props directamente.
const usernameValue = computed({
  get: () => props.username,
  set: (value: string) => emit('update:username', value),
});

const passwordValue = computed({
  get: () => props.password,
  set: (value: string) => emit('update:password', value),
});

// Emite submit y delega validacion/logica al padre.
function onSubmit() {
  emit('submit');
}
</script>

<template>
  <!-- Formulario de login con componentes PrimeVue -->
  <Card class="access-card">
    <template #title>Acceso de plataforma</template>
    <template #subtitle>Ingresa tus credenciales corporativas</template>

    <template #content>
      <form class="form-grid" @submit.prevent="onSubmit">
        <div class="field">
          <label for="usuario">Usuario</label>
          <InputText
            id="usuario"
            v-model.trim="usernameValue"
            autocomplete="username"
            placeholder="Usuario corporativo"
          />
        </div>

        <div class="field">
          <label for="password">Password</label>
          <Password
            inputId="password"
            v-model="passwordValue"
            :feedback="false"
            toggleMask
            autocomplete="current-password"
            placeholder="Tu password"
          />
        </div>

        <div class="status-row">
          <Tag :severity="estadoSeverity" :icon="estadoIcono" :value="estadoTexto" />
        </div>

        <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

        <Button
          type="submit"
          icon="pi pi-sign-in"
          :label="cargando ? 'Ingresando...' : 'Entrar al panel'"
          :loading="cargando"
          :disabled="!puedeEnviar"
        />
      </form>
    </template>
  </Card>
</template>

<style scoped>
/* Layout local del formulario */
.access-card {
  height: 100%;
}

.form-grid {
  display: grid;
  gap: 1rem;
}

.field {
  display: grid;
  gap: 0.35rem;
}

.field label {
  font-weight: 600;
}

.status-row {
  display: flex;
}

:deep(.form-grid .p-inputtext),
:deep(.form-grid .p-password),
:deep(.form-grid .p-password-input) {
  width: 100%;
}
</style>
