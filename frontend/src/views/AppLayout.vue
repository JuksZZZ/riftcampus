<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()

const navItems = [
  { to: '/app/swipe',       icon: '⚡', label: 'Descubrir'   },
  { to: '/app/matches',     icon: '💬', label: 'Matches'     },
  { to: '/app/teams',       icon: '🛡', label: 'Equipos'     },
  { to: '/app/leaderboard', icon: '🏆', label: 'Ranking'     },
  { to: '/app/profile',     icon: '👤', label: 'Perfil'      },
]

function handleLogout() {
  auth.logout()
  router.push('/login')
}

function isActive(path) {
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span class="logo-icon">⚔</span>
        <span class="logo-text">RiftCampus</span>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ active: isActive(item.to) }"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
          <span v-if="isActive(item.to)" class="nav-indicator" />
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">
            {{ auth.user?.nombre?.charAt(0)?.toUpperCase() }}
          </div>
          <div class="user-details">
            <span class="user-name">{{ auth.user?.nombre }}</span>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout" title="Cerrar sesión">↩</button>
      </div>
    </aside>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  background: var(--bg-base);
  overflow: hidden; 
}

.main-content {
  flex: 1;
  overflow-y: auto;  
  padding: 32px;
}


.sidebar {
  width: 220px;
  min-width: 220px;
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  gap: 8px;
}
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px 20px;
  border-bottom: 1px solid var(--border-dim);
  margin-bottom: 8px;
}
.logo-icon { font-size: 20px; filter: drop-shadow(0 0 8px var(--gold)); }
.logo-text { font-family: var(--font-display); font-size: 16px; font-weight: 800; color: var(--gold); }
.sidebar-nav { display: flex; flex-direction: column; gap: 8px; } </style> 