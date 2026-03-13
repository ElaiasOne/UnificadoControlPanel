import { createRouter, createWebHistory } from 'vue-router';
import { TOKEN_KEY } from '../constants/session';
import DashboardView from '../views/DashboardView.vue';
import LoginView from '../views/LoginView.vue';

// Definicion de rutas principales del frontend.
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      // Redireccion inicial segun sesion activa.
      path: '/',
      redirect: () => (localStorage.getItem(TOKEN_KEY) ? '/dashboard' : '/login'),
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      // Marca de ruta protegida para el guard global.
      meta: { requiresAuth: true },
    },
    {
      // Cualquier ruta inexistente vuelve al inicio.
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});

// Guard de navegacion:
// - Si la ruta requiere auth y no hay token, envia a login.
// - Si ya hay token e intenta abrir login, envia a dashboard.
router.beforeEach((to) => {
  const hasToken = Boolean(localStorage.getItem(TOKEN_KEY));

  if (to.meta.requiresAuth && !hasToken) {
    return '/login';
  }

  if (to.path === '/login' && hasToken) {
    return '/dashboard';
  }

  return true;
});

export default router;
