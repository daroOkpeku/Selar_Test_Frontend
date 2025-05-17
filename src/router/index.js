import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/dashboard',
      name: 'dashboard',
      component: ()=>import('@/views/Dashboard.vue'),
    },
    {
      path: '/',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
    },
    {
      path: '/verify_email',
      name: 'verify_email',
      
      component: () => import('@/views/Verify_Email.vue'),
    },
    {
      path: '/login',
      name: 'login',

      component: () => import('@/views/LoginView.vue'),
    },
  ],
})

export default router
