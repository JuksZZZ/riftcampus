import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
      meta: { guest: true }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/RegisterView.vue'),
      meta: { guest: true }
    },
    {
      path: '/app',
      component: () => import('../views/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/app/swipe' },
        { path: 'swipe',       name: 'Swipe',       component: () => import('../views/SwipeView.vue') },
        { path: 'matches',     name: 'Matches',     component: () => import('../views/MatchesView.vue') },
        { path: 'teams',       name: 'Teams',       component: () => import('../views/TeamsView.vue') },
        { path: 'leaderboard', name: 'Leaderboard', component: () => import('../views/LeaderboardView.vue') },
        { path: 'profile',     name: 'Profile',     component: () => import('../views/ProfileView.vue') },
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) return next('/login')
  if (to.meta.guest && auth.isLoggedIn) return next('/app/swipe')
  next()
})

export default router
