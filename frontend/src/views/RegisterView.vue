<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const auth   = useAuthStore()

const nombre     = ref('')
const email      = ref('')
const contrasena = ref('')
const confirmar  = ref('')
const error      = ref('')
const loading    = ref(false)

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
    <div class="bg-glow" />
    <div class="auth-container">
      <div class="logo">
        <div class="logo-icon">⚔</div>
        <h1 class="logo-text">RiftCampus</h1>
      </div>
      <p class="subtitle">Creá tu cuenta y encontrá tu equipo</p>
      <div class="auth-card">
        <h2 class="form-title">Crear cuenta</h2>
        <div class="field">
          <label>Nombre</label>
          <input v-model="nombre" type="text" placeholder="Tu nombre" />
        </div>
        <div class="field">
          <label>Email</label>
          <input v-model="email" type="email" placeholder="tu@email.com" />
        </div>
        <div class="field">
          <label>Contraseña</label>
          <input v-model="contrasena" type="password" placeholder="Mínimo 6 caracteres" />
        </div>
        <div class="field">
          <label>Confirmar contraseña</label>
          <input v-model="confirmar" type="password" placeholder="Repetí tu contraseña" @keyup.enter="handleRegister" />
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <button class="btn-primary" :disabled="loading" @click="handleRegister">
          <span v-if="loading" class="spinner" />
          <span v-else>Crear cuenta</span>
        </button>
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
  background: radial-gradient(circle, rgba(200,170,110,0.08) 0%, transparent 70%);
  top: 50%; left: 50%;
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
.logo { display: flex; align-items: center; gap: 10px; }
.logo-icon { font-size: 28px; filter: drop-shadow(0 0 12px var(--gold)); }
.logo-text { font-family: var(--font-display); font-size: 28px; font-weight: 800; color: var(--gold); }
.subtitle { color: var(--text-secondary); font-size: 14px; margin-bottom: 8px; }
.auth-card {
  width: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.form-title { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--text-primary); }
.field { display: flex; flex-direction: column; gap: 8px; }
.field label { font-size: 13px; font-weight: 500; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
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
.field input::placeholder { color: var(--text-muted); }
.field input:focus { border-color: var(--purple); box-shadow: 0 0 0 3px var(--purple-glow); }
.error-msg {
  font-size: 13px; color: var(--red);
  background: rgba(228,45,41,0.08);
  border: 1px solid rgba(228,45,41,0.2);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
}
.btn-primary {
  width: 100%; padding: 14px;
  background: var(--purple); color: #fff; border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-display); font-size: 15px; font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.btn-primary:hover:not(:disabled) { background: var(--purple-lt); box-shadow: 0 4px 20px var(--purple-glow); }
.btn-primary:active:not(:disabled) { transform: scale(0.98); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.switch-link { text-align: center; font-size: 14px; color: var(--text-secondary); }
.switch-link a { color: var(--gold); text-decoration: none; font-weight: 500; }
.switch-link a:hover { text-decoration: underline; }
</style>