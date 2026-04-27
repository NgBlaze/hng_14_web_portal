import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/login',     component: () => import('../views/LoginView.vue'),         meta: { public: true } },
  { path: '/dashboard', component: () => import('../views/DashboardView.vue'),     meta: { requiresAuth: true } },
  { path: '/profiles',  component: () => import('../views/ProfilesView.vue'),      meta: { requiresAuth: true } },
  { path: '/profiles/:id', component: () => import('../views/ProfileDetailView.vue'), meta: { requiresAuth: true } },
  { path: '/search',    component: () => import('../views/SearchView.vue'),         meta: { requiresAuth: true } },
  { path: '/account',   component: () => import('../views/AccountView.vue'),        meta: { requiresAuth: true } },
  { path: '/',          redirect: '/dashboard' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  if (to.meta.public) return true

  const auth = useAuthStore()
  if (!auth.checked) await auth.fetchUser()

  if (to.meta.requiresAuth && !auth.user) {
    return { path: '/login' }
  }
})

export default router
