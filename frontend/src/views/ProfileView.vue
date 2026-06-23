<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import api from '../services/api.js'
import DisponibilidadEditor from '../components/DisponibilidadEditor.vue'

const auth = useAuthStore()

const loading  = ref(false)
const saving   = ref(false)
const error    = ref('')
const success  = ref('')

// Campos del formulario
const summoner_name = ref('')
const rango         = ref('')
const objetivo      = ref('')
const descripcion   = ref('')
const rolesSelec    = ref([])
const avatarPreview = ref(null)
const avatarActual  = ref(null)
const avatarFile    = ref(null)

const rangos = [
  { value: 'hierro',       label: 'Hierro',        icon: '🔩' },
  { value: 'bronce',       label: 'Bronce',         icon: '🥉' },
  { value: 'plata',        label: 'Plata',          icon: '🥈' },
  { value: 'oro',          label: 'Oro',            icon: '🥇' },
  { value: 'platino',      label: 'Platino',        icon: '💎' },
  { value: 'esmeralda',    label: 'Esmeralda',      icon: '💚' },
  { value: 'diamante',     label: 'Diamante',       icon: '💠' },
  { value: 'maestro',      label: 'Maestro',        icon: '🔮' },
  { value: 'gran_maestro', label: 'Gran Maestro',   icon: '👑' },
  { value: 'challenger',   label: 'Challenger',     icon: '⚡' },
]

const roles = [
  { value: 'top',     label: 'Top',     icon: '🛡' },
  { value: 'jungla',  label: 'Jungla',  icon: '🌿' },
  { value: 'mid',     label: 'Mid',     icon: '⚡' },
  { value: 'adc',     label: 'ADC',     icon: '🏹' },
  { value: 'support', label: 'Support', icon: '💊' },
]

const objetivos = [
  { value: 'casual',       label: 'Casual',       desc: 'Jugar por diversión' },
  { value: 'rankear',      label: 'Rankear',       desc: 'Subir de rango' },
  { value: 'competitivo',  label: 'Competitivo',   desc: 'Torneos y competencia' },
]

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await api.get('/api/perfil')
    const p = data.perfil
    if (p.id_perfil) {
      summoner_name.value = p.summoner_name || ''
      rango.value         = p.rango || ''
      objetivo.value      = p.objetivo || ''
      descripcion.value   = p.descripcion || ''
      rolesSelec.value    = p.roles_preferidos || []
      avatarActual.value  = p.avatar_url
        ? `http://localhost:3000${p.avatar_url}`
        : null
      avatarPreview.value = avatarActual.value
    }
  } catch {
    // Sin perfil todavía, formulario vacío
  } finally {
    loading.value = false
  }
})

function toggleRol(rol) {
  const idx = rolesSelec.value.indexOf(rol)
  if (idx >= 0) {
    rolesSelec.value.splice(idx, 1)
  } else {
    rolesSelec.value.push(rol)
  }
}

function onAvatarChange(e) {
  const file = e.target.files[0]
  if (!file) return
  avatarFile.value = file
  avatarPreview.value = URL.createObjectURL(file)
}

async function handleSave() {
  error.value   = ''
  success.value = ''

  if (!summoner_name.value || !rango.value || !objetivo.value) {
    error.value = 'Summoner name, rango y objetivo son obligatorios.'
    return
  }
  if (rolesSelec.value.length === 0) {
    error.value = 'Seleccioná al menos un rol.'
    return
  }

  saving.value = true
  try {
    const form = new FormData()
    form.append('summoner_name',   summoner_name.value)
    form.append('rango',           rango.value)
    form.append('objetivo',        objetivo.value)
    form.append('descripcion',     descripcion.value)
    form.append('roles_preferidos', JSON.stringify(rolesSelec.value))
    if (avatarFile.value) {
      form.append('avatar', avatarFile.value)
    } else if (avatarActual.value) {
      form.append('avatar_url_actual', avatarActual.value.replace('http://localhost:3000', ''))
    }

    const { data } = await api.post('/api/perfil', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    success.value = '¡Perfil guardado correctamente!'
    await auth.fetchMe()

    // Actualizar avatar actual
    if (data.perfil.avatar_url) {
      avatarActual.value = `http://localhost:3000${data.perfil.avatar_url}`
    }
    avatarFile.value = null

  } catch (err) {
    error.value = err.response?.data?.error || 'Error al guardar el perfil.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="profile-page">
    <div class="page-header">
      <h1 class="page-title">Mi Perfil</h1>
      <p class="page-subtitle">Configurá tu identidad en RiftCampus</p>
    </div>

    <div v-if="loading" class="loading">Cargando perfil...</div>

    <div v-else class="profile-grid">

      <!-- Columna izquierda: avatar + nombre -->
      <div class="col-left">
        <div class="avatar-card card">
          <div class="avatar-wrapper">
            <img
              v-if="avatarPreview"
              :src="avatarPreview"
              class="avatar-img"
              alt="Avatar"
            />
            <div v-else class="avatar-placeholder">
              {{ auth.user?.nombre?.charAt(0)?.toUpperCase() }}
            </div>
            <label class="avatar-upload-btn" title="Cambiar foto">
              📷
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style="display:none"
                @change="onAvatarChange"
              />
            </label>
          </div>
          <div class="avatar-name">{{ auth.user?.nombre }}</div>
          <div class="avatar-email">{{ auth.user?.email }}</div>
        </div>
      </div>

      <!-- Columna derecha: formulario -->
      <div class="col-right">
        <div class="form-card card">

          <!-- Summoner Name -->
          <div class="field">
            <label>Summoner Name</label>
            <input
              v-model="summoner_name"
              type="text"
              placeholder="Tu nombre en League of Legends"
              maxlength="50"
            />
          </div>

          <!-- Rango -->
          <div class="field">
            <label>Rango actual</label>
            <div class="rango-grid">
              <button
                v-for="r in rangos"
                :key="r.value"
                class="rango-btn"
                :class="{ selected: rango === r.value }"
                @click="rango = r.value"
                type="button"
              >
                <span>{{ r.icon }}</span>
                <span>{{ r.label }}</span>
              </button>
            </div>
          </div>

          <!-- Roles -->
          <div class="field">
            <label>Roles preferidos <span class="label-hint">(podés elegir más de uno)</span></label>
            <div class="roles-row">
              <button
                v-for="rol in roles"
                :key="rol.value"
                class="rol-btn"
                :class="{ selected: rolesSelec.includes(rol.value) }"
                @click="toggleRol(rol.value)"
                type="button"
              >
                <span class="rol-icon">{{ rol.icon }}</span>
                <span>{{ rol.label }}</span>
              </button>
            </div>
          </div>

          <!-- Objetivo -->
          <div class="field">
            <label>Objetivo</label>
            <div class="objetivo-grid">
              <button
                v-for="obj in objetivos"
                :key="obj.value"
                class="objetivo-btn"
                :class="{ selected: objetivo === obj.value }"
                @click="objetivo = obj.value"
                type="button"
              >
                <span class="obj-label">{{ obj.label }}</span>
                <span class="obj-desc">{{ obj.desc }}</span>
              </button>
            </div>
          </div>

          <!-- Descripción -->
          <div class="field">
            <label>Descripción <span class="label-hint">(opcional)</span></label>
            <textarea
              v-model="descripcion"
              placeholder="Contá algo sobre vos o cómo jugás..."
              rows="3"
              maxlength="300"
            />
            <span class="char-count">{{ descripcion.length }}/300</span>
          </div>

          <!-- Feedback -->
          <p v-if="error"   class="msg-error">{{ error }}</p>
          <p v-if="success" class="msg-success">{{ success }}</p>

          <!-- Guardar -->
          <button class="btn-save" :disabled="saving" @click="handleSave">
            <span v-if="saving" class="spinner" />
            <span v-else>💾 Guardar perfil</span>
          </button>

          <div class="divider" />
          <DisponibilidadEditor />

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-header { margin-bottom: 28px; }
.page-title {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 800;
  color: var(--gold);
}
.page-subtitle { color: var(--text-secondary); font-size: 14px; margin-top: 4px; }

.loading { color: var(--text-secondary); padding: 40px 0; text-align: center; }

/* ── Grid ───────────────────────────────────────────── */
.profile-grid {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
  align-items: start;
}

/* ── Avatar card ────────────────────────────────────── */
.avatar-card {
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
}

.avatar-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--gold-dim);
}

.avatar-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: var(--purple);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 800;
  color: #fff;
  border: 2px solid var(--purple-lt);
}

.avatar-upload-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 30px;
  height: 30px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}
.avatar-upload-btn:hover { background: var(--bg-hover); }

.avatar-name {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}
.avatar-email { font-size: 12px; color: var(--text-muted); }

/* ── Form card ──────────────────────────────────────── */
.form-card {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
}

.field label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.label-hint {
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  color: var(--text-muted);
}

.field input,
.field textarea {
  background: var(--bg-surface);
  border: 1px solid var(--border-dim);
  border-radius: var(--radius-md);
  padding: 11px 14px;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  resize: none;
}
.field input::placeholder,
.field textarea::placeholder { color: var(--text-muted); }
.field input:focus,
.field textarea:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 3px var(--purple-glow);
}

.char-count {
  align-self: flex-end;
  font-size: 11px;
  color: var(--text-muted);
}

/* ── Rango grid ─────────────────────────────────────── */
.rango-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.rango-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  background: var(--bg-surface);
  border: 1px solid var(--border-dim);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 11px;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.2s;
}
.rango-btn:hover { border-color: var(--purple); color: var(--text-primary); }
.rango-btn.selected {
  background: var(--purple-glow);
  border-color: var(--purple-lt);
  color: var(--purple-lt);
  font-weight: 600;
}

/* ── Roles row ──────────────────────────────────────── */
.roles-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.rol-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border-dim);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 13px;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.2s;
}
.rol-btn:hover { border-color: var(--purple); color: var(--text-primary); }
.rol-btn.selected {
  background: var(--purple-glow);
  border-color: var(--purple-lt);
  color: var(--purple-lt);
  font-weight: 600;
}
.rol-icon { font-size: 15px; }

/* ── Objetivo grid ──────────────────────────────────── */
.objetivo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.objetivo-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 10px;
  background: var(--bg-surface);
  border: 1px solid var(--border-dim);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  font-family: var(--font-body);
  text-align: center;
}
.objetivo-btn:hover { border-color: var(--gold-dim); }
.objetivo-btn.selected {
  background: var(--gold-glow);
  border-color: var(--gold-dim);
}
.obj-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}
.objetivo-btn.selected .obj-label { color: var(--gold); }
.obj-desc { font-size: 11px; color: var(--text-muted); }

/* ── Feedback ───────────────────────────────────────── */
.msg-error {
  font-size: 13px;
  color: var(--red);
  background: rgba(228,45,41,0.08);
  border: 1px solid rgba(228,45,41,0.2);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
}
.msg-success {
  font-size: 13px;
  color: var(--green);
  background: rgba(62,191,144,0.08);
  border: 1px solid rgba(62,191,144,0.2);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
}

/* ── Botón guardar ──────────────────────────────────── */
.btn-save {
  padding: 13px;
  background: var(--purple);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn-save:hover:not(:disabled) {
  background: var(--purple-lt);
  box-shadow: 0 4px 20px var(--purple-glow);
}
.btn-save:active:not(:disabled) { transform: scale(0.98); }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

.spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.divider {
  height: 1px;
  background: var(--border-dim);
  margin: 8px 0;
}
</style>
