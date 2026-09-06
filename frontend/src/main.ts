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

// Configuracion global de componentes/estilos PrimeVue en espanol.
app.use(PrimeVue, {
	ripple: true,
	theme: {
		preset: Aura,
	},
	locale: {
		firstDayOfWeek: 1,
		dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
		dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
		dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
		monthNames: [
			'Enero',
			'Febrero',
			'Marzo',
			'Abril',
			'Mayo',
			'Junio',
			'Julio',
			'Agosto',
			'Septiembre',
			'Octubre',
			'Noviembre',
			'Diciembre',
		],
		monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
		today: 'Hoy',
		clear: 'Limpiar',
		dateFormat: 'yy-mm-dd',
		weekHeader: 'Sm',
	},
})

// Router con proteccion de rutas (login/dashboard).
app.use(router)
app.mount('#app')
