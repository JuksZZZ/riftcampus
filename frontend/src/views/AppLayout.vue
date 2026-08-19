<script setup>
import { onMounted, computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()

const navItems = [
  { to: '/app/swipe',       label: 'Descubrir',   icon: 'zap' },
  { to: '/app/matches',     label: 'Matches',     icon: 'chat' },
  { to: '/app/teams',       label: 'Equipos',     icon: 'shield' },
  { to: '/app/leaderboard', label: 'Ranking',     icon: 'trophy' },
  { to: '/app/profile',     label: 'Perfil',      icon: 'user' },
]

const mobileNavItems = [
  ...navItems.slice(0, 4),
  { to: '/app/notifications', label: 'Avisos', icon: 'bell' },
]

const collapsed = ref(false)
const notifOpen = ref(false)

onMounted(() => {
  auth.fetchMe()
})

const avatarSrc = computed(() =>
  auth.user?.avatar_url ? `http://localhost:3000${auth.user.avatar_url}` : null
)

const inicial = computed(() => auth.user?.nombre?.charAt(0)?.toUpperCase() ?? '?')

function handleLogout() {
  auth.logout()
  router.push('/login')
}

function isActive(path) {
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="layout" :class="{ 'is-collapsed': collapsed }">
    <!-- ═══════════ SIDEBAR DESKTOP ═══════════ -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-crest">
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 7l2 4.2-2 6.8-2-6.8z" fill="currentColor"/></svg>
        </div>
        <div class="logo-text-group">
          <span class="logo-text">RiftMatch</span>
          <span class="logo-sub">Encuentra tu equipo!</span>
        </div>
        <button class="collapse-btn" @click="collapsed = !collapsed" title="Colapsar menú">
          <svg viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ active: isActive(item.to) }"
        >
          <span class="nav-item__bar" />
          <span class="nav-icon">
            <svg v-if="item.icon === 'zap'" viewBox="0 0 24 24" fill="none"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
            <svg v-else-if="item.icon === 'chat'" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.5 8.5 0 01-8.9 8.49 8.7 8.7 0 01-3.3-.66L3 21l1.7-5.7A8.5 8.5 0 1121 11.5z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
            <svg v-else-if="item.icon === 'shield'" viewBox="0 0 24 24" fill="none"><path d="M12 2l8 4v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6l8-4z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
            <svg v-else-if="item.icon === 'trophy'" viewBox="0 0 24 24" fill="none"><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 01-10 0V4z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 5H4v2a3 3 0 003 3M17 5h3v2a3 3 0 01-3 3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.6" stroke="currentColor" stroke-width="1.7"/><path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
          </span>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <router-link to="/app/profile" class="user-info">
          <img v-if="avatarSrc" :src="avatarSrc" :alt="auth.user?.nombre" class="user-avatar user-avatar--img" />
          <div v-else class="user-avatar">{{ inicial }}</div>
          <div class="user-details">
            <span class="user-name">{{ auth.user?.nombre }}</span>
            <span v-if="auth.user?.summoner_name" class="user-summoner">{{ auth.user.summoner_name }}</span>
          </div>
        </router-link>
        <button class="logout-btn" @click="handleLogout" title="Cerrar sesión">
          <svg viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </aside>

    <!-- ═══════════ CONTENIDO ═══════════ -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="route" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- ═══════════ BOTTOM NAV MOBILE ═══════════ -->
    <nav class="bottom-nav">
      <router-link
        v-for="item in mobileNavItems"
        :key="item.to"
        :to="item.to"
        class="bnav-item"
        :class="{ active: isActive(item.to) }"
      >
        <span class="bnav-icon">
          <svg v-if="item.icon === 'zap'" viewBox="0 0 24 24" fill="none"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
          <svg v-else-if="item.icon === 'chat'" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.5 8.5 0 01-8.9 8.49 8.7 8.7 0 01-3.3-.66L3 21l1.7-5.7A8.5 8.5 0 1121 11.5z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
          <svg v-else-if="item.icon === 'shield'" viewBox="0 0 24 24" fill="none"><path d="M12 2l8 4v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6l8-4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
          <svg v-else-if="item.icon === 'trophy'" viewBox="0 0 24 24" fill="none"><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 01-10 0V4z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="none"><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
        <span class="bnav-label">{{ item.label }}</span>
        <span v-if="isActive(item.to)" class="bnav-dot" />
      </router-link>
    </nav>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  background:
    radial-gradient(ellipse 60% 40% at 15% 0%, rgba(102,85,192,0.06) 0%, transparent 55%),
    var(--bg-base);
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 32px 36px;
  position: relative;
}

/* ══════════════ SIDEBAR ══════════════ */
.sidebar {
  width: var(--sidebar-w);
  min-width: var(--sidebar-w);
  background: linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-void) 100%);
  border-right: 1px solid var(--border-dim);
  display: flex;
  flex-direction: column;
  padding: 22px 14px;
  gap: 6px;
  position: relative;
  transition: width 0.25s var(--ease-out), min-width 0.25s var(--ease-out);
}
.sidebar::after {
  content: '';
  position: absolute;
  top: 0; right: -1px; bottom: 0;
  width: 1px;
  background: linear-gradient(180deg, transparent, var(--gold-glow) 40%, var(--gold-glow) 60%, transparent);
}
.is-collapsed .sidebar { width: var(--sidebar-w-collapsed); min-width: var(--sidebar-w-collapsed); }
.is-collapsed .logo-text-group,
.is-collapsed .nav-label,
.is-collapsed .user-details { display: none; }
.is-collapsed .sidebar-logo { justify-content: center; }
.is-collapsed .user-info { justify-content: center; }
.is-collapsed .collapse-btn svg { transform: rotate(180deg); }

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 6px 20px;
  border-bottom: 1px solid var(--border-dim);
  margin-bottom: 10px;
  position: relative;
}
.logo-crest {
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  color: var(--gold);
  filter: drop-shadow(0 0 10px var(--gold-glow-strong));
  flex-shrink: 0;
}
.logo-crest svg { width: 26px; height: 26px; }
.logo-text-group { display: flex; flex-direction: column; min-width: 0; }
.logo-text {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.01em;
  background: linear-gradient(135deg, var(--gold-lt), var(--gold-dim));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.logo-sub {
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-tertiary);
}
.collapse-btn {
  position: absolute;
  right: -22px;
  top: 6px;
  width: 22px; height: 22px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-dim);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-tertiary);
  transition: color 0.2s, border-color 0.2s;
}
.collapse-btn svg { width: 12px; height: 12px; transition: transform 0.25s; }
.collapse-btn:hover { color: var(--gold); border-color: var(--border-strong); }

.sidebar-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--fs-sm);
  font-weight: 600;
  position: relative;
  transition: background 0.2s, color 0.2s;
}
.nav-item__bar {
  position: absolute;
  left: -14px; top: 50%; transform: translateY(-50%);
  width: 3px; height: 0;
  background: linear-gradient(180deg, var(--gold-lt), var(--purple-lt));
  border-radius: 0 3px 3px 0;
  transition: height 0.25s var(--ease-out);
}
.nav-item:hover { background: var(--bg-hover); color: var(--text-primary); }
.nav-item.active {
  background: linear-gradient(90deg, var(--purple-glow), transparent);
  color: var(--gold-lt);
}
.nav-item.active .nav-item__bar { height: 22px; }
.nav-item.active .nav-icon { color: var(--gold-lt); }

.nav-icon { width: 20px; height: 20px; flex-shrink: 0; color: var(--text-tertiary); transition: color 0.2s; }
.nav-icon svg { width: 100%; height: 100%; }
.nav-item:hover .nav-icon { color: var(--text-primary); }

.sidebar-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 14px 6px 0;
  border-top: 1px solid var(--border-dim);
  margin-top: auto;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
  border-radius: var(--radius-md);
  padding: 6px;
  margin: -6px;
  transition: background 0.2s;
}
.user-info:hover { background: var(--bg-hover); }

.user-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--purple-lt), var(--purple));
  color: #fff;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  border: 2px solid var(--border-strong);
}
.user-avatar--img { object-fit: cover; background: var(--bg-surface); }

.user-details { display: flex; flex-direction: column; min-width: 0; }
.user-name { font-size: 13px; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-summoner { font-size: 11px; color: var(--gold-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.logout-btn {
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-tertiary);
  border-radius: var(--radius-sm);
  transition: color 0.2s, background 0.2s;
  flex-shrink: 0;
}
.logout-btn svg { width: 17px; height: 17px; }
.logout-btn:hover { color: var(--red); background: var(--red-glow); }

/* ══════════════ BOTTOM NAV (mobile) ══════════════ */
.bottom-nav { display: none; }

/* ══════════════ RESPONSIVE ══════════════ */
@media (max-width: 1024px) {
  .sidebar { width: var(--sidebar-w-collapsed); min-width: var(--sidebar-w-collapsed); }
  .logo-text-group, .nav-label, .user-details { display: none; }
  .sidebar-logo { justify-content: center; }
  .user-info { justify-content: center; }
  .collapse-btn { display: none; }
}

@media (max-width: 768px) {
  .layout { flex-direction: column; height: 100dvh; }
  .sidebar { display: none; }
  .main-content { padding: 20px 16px calc(var(--bottomnav-h) + 24px); }

  .bottom-nav {
    display: flex;
    align-items: stretch;
    justify-content: space-around;
    height: var(--bottomnav-h);
    background: rgba(14, 14, 24, 0.92);
    backdrop-filter: blur(18px) saturate(140%);
    -webkit-backdrop-filter: blur(18px) saturate(140%);
    border-top: 1px solid var(--border-dim);
    padding-bottom: env(safe-area-inset-bottom);
    position: relative;
    z-index: 20;
  }
  .bottom-nav::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold-glow-strong), transparent);
  }
  .bnav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    color: var(--text-tertiary);
    position: relative;
    transition: color 0.2s;
  }
  .bnav-icon { width: 22px; height: 22px; transition: transform 0.2s var(--ease-spring); }
  .bnav-icon svg { width: 100%; height: 100%; }
  .bnav-label { font-size: 9.5px; font-weight: 600; letter-spacing: 0.01em; }
  .bnav-item.active { color: var(--gold-lt); }
  .bnav-item.active .bnav-icon { transform: translateY(-2px) scale(1.08); filter: drop-shadow(0 0 8px var(--gold-glow-strong)); }
  .bnav-dot {
    position: absolute;
    top: 2px;
    width: 4px; height: 4px;
    border-radius: 50%;
    background: var(--gold-lt);
    box-shadow: 0 0 6px var(--gold-lt);
  }
}
</style>
