import { createRouter, createWebHistory } from 'vue-router'
import { auth, homeFor } from './auth'
import AdminView from './views/AdminView.vue'
import LoginView from './views/LoginView.vue'
import ShopView from './views/ShopView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/shop' },
    { path: '/login', component: LoginView, meta: { public: true } },
    { path: '/shop', component: ShopView, meta: { role: 'USER' } },
    { path: '/admin', component: AdminView, meta: { role: 'ADMIN' } },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

router.beforeEach((to) => {
  if (to.meta.public) {
    return auth.user ? homeFor(auth.user.role) : true
  }
  if (!auth.user) {
    return '/login'
  }
  if (to.meta.role && auth.user.role !== to.meta.role) {
    return homeFor(auth.user.role)
  }
  return true
})

export default router
