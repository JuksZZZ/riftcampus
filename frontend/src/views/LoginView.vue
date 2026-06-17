<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const auth   = useAuthStore()

const email     = ref('')
const contrasena = ref('')
const error     = ref('')
const loading   = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, contrasena.value)
    router.push('/app/swipe')
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al iniciar sesión.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <!-- Fondo con efecto -->
    <div class="bg-glow" />

    <div class="auth-container">
      <!-- Logo -->
      <div class="logo">
        <div class="logo-icon">⚔</div>
        <h1 class="logo-text">RiftCampus</h1>
      </div>

      <p class="subtitle">Encontrá tu equipo universitario</p>

      <!-- Card del form -->
      <div class="auth-card">
        <h2 class="form-title">Iniciar sesión</h2>

        <div class="field">
          <label>Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="tu@email.com"
            @keyup.enter="handleLogin"
          />
        </div>

        <div class="field">
          <label>Contraseña</label>
          <input
            v-model="contrasena"
            type="password"
            placeholder="••••••••"
            @keyup.enter="handleLogin"
          />
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <button class="btn-primary" :disabled="loading" @click="handleLogin">
          <span v-if="loading" class="spinner" />
          <span v-else>Entrar</span>
        </button>

        <p class="switch-link">
          ¿No tenés cuenta?
          <router-link to="/register">Registrate</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-base);
  position: relative;
  overflow: hidden;
}

.bg-glow {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(102,85,192,0.12) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 420px;
  padding: 24px;
  z-index: 1;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 28px;
  filter: drop-shadow(0 0 12px var(--gold));
}

.logo-text {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 800;
  color: var(--gold);
  letter-spacing: -0.5px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 8px;
}

.auth-card {
  width: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field input {
  background: var(--bg-surface);
  border: 1px solid var(--border-dim);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
}

.field input::placeholder {
  color: var(--text-muted);
}

.field input:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 3px var(--purple-glow);
}

.error-msg {
  font-size: 13px;
  color: var(--red);
  background: rgba(228, 45, 41, 0.08);
  border: 1px solid rgba(228, 45, 41, 0.2);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: var(--purple);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary:hover:not(:disabled) {
  background: var(--purple-lt);
  box-shadow: 0 4px 20px var(--purple-glow);
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.switch-link {
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
}

.switch-link a {
  color: var(--gold);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
} 

.switch-link a:hover {
  color: var(--gold-dim);
  text-decoration: underline;
}
</style>
