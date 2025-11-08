import { createRouter, createWebHistory } from 'vue-router'
import Login from './pages/Login.vue'
import Signup from './pages/Signup.vue'
import ForgotPassword from './pages/ForgotPassword.vue' // ✅ Add this

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/signup', component: Signup },
  { path: '/forgot-password', component: ForgotPassword } // ✅ New route
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
