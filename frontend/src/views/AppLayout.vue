<script setup>
import { onMounted, computed } from 'vue'
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

// Trae el perfil completo (con avatar_url) al montar el layout
onMounted(() => {
  auth.fetchMe()
})

const avatarSrc = computed(() =>
  auth.user?.avatar_url
    ? `http://localhost:3000${auth.user.avatar_url}`
    : null
)

const inicial = computed(() =>
  auth.user?.nombre?.charAt(0)?.toUpperCase() ?? '?'
)

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
          <!-- Foto de perfil si existe, inicial si no -->
          <img
            v-if="avatarSrc"
            :src="avatarSrc"
            :alt="auth.user?.nombre"
            class="user-avatar user-avatar--img"
          />
          <div v-else class="user-avatar">
            {{ inicial }}
          </div>

          <div class="user-details">
            <span class="user-name">{{ auth.user?.nombre }}</span>
            <span v-if="auth.user?.summoner_name" class="user-summoner">
              {{ auth.user.summoner_name }}
            </span>
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

/* ── Sidebar ───────────────────────────────────────── */
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

/* ── Nav ───────────────────────────────────────────── */
.sidebar-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  position: relative;
  transition: background 0.15s, color 0.15s;
}
.nav-item:hover { background: var(--bg-hover); color: var(--text-primary); }
.nav-item.active {
  background: var(--purple-glow);
  color: var(--purple-lt);
  font-weight: 600;
}
.nav-icon { font-size: 16px; width: 20px; text-align: center; }
.nav-indicator {
  position: absolute;
  right: 0; top: 50%;
  transform: translateY(-50%);
  width: 3px; height: 20px;
  background: var(--purple-lt);
  border-radius: 2px 0 0 2px;
}

/* ── Footer ────────────────────────────────────────── */
.sidebar-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 8px 0;
  border-top: 1px solid var(--border-dim);
  margin-top: auto;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

/* Avatar con inicial (fallback) */
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--purple);
  color: #fff;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid var(--border-dim);
}

/* Avatar con foto real */
.user-avatar--img {
  object-fit: cover;
  background: var(--bg-surface);
}

.user-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-summoner {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 18px;
  cursor: pointer;
  padding: 6px;
  border-radius: var(--radius-sm);
  transition: color 0.2s, background 0.2s;
  flex-shrink: 0;
}
.logout-btn:hover {
  color: var(--red);
  background: rgba(228, 45, 41, 0.08);
}

/* ── Transición ────────────────────────────────────── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>