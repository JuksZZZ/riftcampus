<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import ParticleField from '../components/ParticleField.vue'
import RiftButton from '../components/RiftButton.vue'

const router = useRouter()
const auth   = useAuthStore()

const nombre     = ref('')
const email      = ref('')
const contrasena = ref('')
const confirmar  = ref('')
const error      = ref('')
const loading    = ref(false)
const showPass   = ref(false)

async function handleRegister() {
  error.value = ''
  if (contrasena.value !== confirmar.value) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }
  if (contrasena.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres.'
    return
  }
  loading.value = true
  try {
    await auth.register(nombre.value, email.value, contrasena.value)
    router.push('/app/swipe')
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al registrarse.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <ParticleField :density="70" :max-particles="140" :colors="['#8B7EE8', '#c8aa6e', '#e2c98f']" />

    <div class="auth-container">
      <router-link to="/" class="logo">
        <div class="logo-crest">
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 7l2 4.2-2 6.8-2-6.8z" fill="currentColor"/></svg>
        </div>
        <h1 class="logo-text">RiftMatch</h1>
      </router-link>

      <p class="subtitle">Creá tu cuenta y armá tu quinteto ideal.</p>

      <div class="auth-card">
        <div class="card-glow" />
        <h2 class="form-title">Crear cuenta</h2>
        <p class="form-hint">Tu viaje en la Grieta empieza acá.</p>

        <div class="field">
          <label>Nombre</label>
          <div class="input-wrap">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.4" stroke="currentColor" stroke-width="1.5"/><path d="M5 20c1.3-3.3 4-5 7-5s5.7 1.7 7 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            <input v-model="nombre" type="text" placeholder="Tu nombre" />
          </div>
        </div>

        <div class="field">
          <label>Email</label>
          <div class="input-wrap">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none"><path d="M4 6h16v12H4z" stroke="currentColor" stroke-width="1.5"/><path d="M4 7l8 6 8-6" stroke="currentColor" stroke-width="1.5"/></svg>
            <input v-model="email" type="email" placeholder="tu@email.com" />
          </div>
        </div>

        <div class="field">
          <label>Contraseña</label>
          <div class="input-wrap">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none"><rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" stroke-width="1.5"/></svg>
            <input v-model="contrasena" :type="showPass ? 'text' : 'password'" placeholder="Mínimo 6 caracteres" />
            <button type="button" class="toggle-pass" @click="showPass = !showPass">
              <svg v-if="!showPass" viewBox="0 0 24 24" fill="none"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="none"><path d="M3 3l18 18M10.6 10.6a3 3 0 004.2 4.2M9.9 5.1A10.6 10.6 0 0112 5c6 0 10 7 10 7a15.6 15.6 0 01-3.2 3.9M6.6 6.6C4 8.3 2 12 2 12s4 7 10 7a9.7 9.7 0 004.9-1.3" stroke="currentColor" stroke-width="1.5"/></svg>
            </button>
          </div>
        </div>

        <div class="field">
          <label>Confirmar contraseña</label>
          <div class="input-wrap">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <input v-model="confirmar" :type="showPass ? 'text' : 'password'" placeholder="Repetí tu contraseña" @keyup.enter="handleRegister" />
          </div>
        </div>

        <transition name="fade">
          <p v-if="error" class="error-msg">{{ error }}</p>
        </transition>

        <RiftButton variant="gold" size="lg" block :loading="loading" @click="handleRegister">
          Crear cuenta
        </RiftButton>

        <p class="switch-link">
          ¿Ya tenés cuenta?
          <router-link to="/login">Iniciá sesión</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-base);
  position: relative;
  overflow: hidden;
  padding: 24px;
}

.auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 430px;
  z-index: 1;
}

.logo { display: flex; align-items: center; gap: 10px; }
.logo-crest { width: 34px; height: 34px; color: var(--gold); filter: drop-shadow(0 0 14px var(--gold-glow-strong)); }
.logo-text {
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--gold-lt), var(--gold-dim));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle { color: var(--text-secondary); font-size: var(--fs-sm); margin-bottom: 14px; text-align: center; }

.auth-card {
  position: relative;
  width: 100%;
  background: linear-gradient(180deg, var(--bg-card) 0%, var(--bg-surface) 100%);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}
.card-glow {
  position: absolute;
  top: -60%; left: 50%;
  transform: translateX(-50%);
  width: 300px; height: 220px;
  background: radial-gradient(ellipse, var(--purple-glow) 0%, transparent 70%);
  pointer-events: none;
}

.form-title { font-size: var(--fs-xl); font-weight: 800; color: var(--text-primary); position: relative; }
.form-hint { font-size: var(--fs-sm); color: var(--text-tertiary); margin-top: -12px; position: relative; }

.field { display: flex; flex-direction: column; gap: 8px; position: relative; }
.field label { font-size: 11.5px; font-weight: 700; color: var(--gold-dim); text-transform: uppercase; letter-spacing: 0.08em; }

.input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-inset);
  border: 1px solid var(--border-dim);
  border-radius: var(--radius-md);
  padding: 0 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.input-wrap:focus-within { border-color: var(--purple); box-shadow: 0 0 0 3px var(--purple-glow); }
.input-icon { width: 17px; height: 17px; color: var(--text-tertiary); flex-shrink: 0; }
.input-wrap input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  padding: 13px 0;
  color: var(--text-primary);
  font-size: var(--fs-base);
}
.input-wrap input::placeholder { color: var(--text-muted); }
.toggle-pass { color: var(--text-tertiary); display: flex; padding: 4px; }
.toggle-pass svg { width: 17px; height: 17px; }
.toggle-pass:hover { color: var(--text-secondary); }

.error-msg {
  font-size: 13px;
  color: var(--red);
  background: var(--red-glow);
  border: 1px solid rgba(228, 45, 41, 0.25);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
}

.switch-link { text-align: center; font-size: var(--fs-sm); color: var(--text-secondary); position: relative; }
.switch-link a { color: var(--gold); font-weight: 700; transition: color 0.2s; }
.switch-link a:hover { color: var(--gold-lt); text-decoration: underline; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from { opacity: 0; transform: translateY(-4px); }
</style>
