// Entry point del frontend:
// - Crea la app Vue
// - Configura PrimeVue con tema global
// - Conecta el router y monta en #app
import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// Configuracion global de componentes/estilos PrimeVue.
app.use(PrimeVue, {
	ripple: true,
	theme: {
		preset: Aura,
	},
})

// Router con proteccion de rutas (login/dashboard).
app.use(router)
app.mount('#app')
