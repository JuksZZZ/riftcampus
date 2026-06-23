<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api.js'

const DIAS = [
  { value: 'lun', label: 'Lunes'     },
  { value: 'mar', label: 'Martes'    },
  { value: 'mie', label: 'Miércoles' },
  { value: 'jue', label: 'Jueves'    },
  { value: 'vie', label: 'Viernes'   },
  { value: 'sab', label: 'Sábado'    },
  { value: 'dom', label: 'Domingo'   },
]

const franjas  = ref([])   // [{ dia, hora_inicio, hora_fin }]
const saving   = ref(false)
const success  = ref('')
const error    = ref('')

onMounted(async () => {
  try {
    const { data } = await api.get('/api/disponibilidad')
    franjas.value = data.disponibilidad.map(f => ({
      dia:         f.dia,
      hora_inicio: f.hora_inicio.slice(0, 5),  // "HH:MM"
      hora_fin:    f.hora_fin.slice(0, 5),
    }))
  } catch { /* sin disponibilidad cargada todavía */ }
})

function agregarFranja() {
  franjas.value.push({ dia: 'lun', hora_inicio: '18:00', hora_fin: '22:00' })
}

function eliminarFranja(idx) {
  franjas.value.splice(idx, 1)
}

async function guardar() {
  error.value   = ''
  success.value = ''

  // Validación simple en frontend
  for (const f of franjas.value) {
    if (f.hora_inicio >= f.hora_fin) {
      error.value = `En ${f.dia}: la hora de fin debe ser posterior a la de inicio.`
      return
    }
  }

  saving.value = true
  try {
    await api.put('/api/disponibilidad', { franjas: franjas.value })
    success.value = '¡Disponibilidad guardada!'
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al guardar.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="disp-editor">
    <div class="disp-header">
      <div>
        <h3 class="disp-title">Disponibilidad horaria</h3>
        <p class="disp-sub">Agregá los días y horarios en los que solés jugar</p>
      </div>
      <button class="btn-agregar" @click="agregarFranja" type="button">
        + Agregar franja
      </button>
    </div>

    <!-- Lista de franjas -->
    <div v-if="franjas.length === 0" class="disp-empty">
      <span>⏰</span>
      <p>Sin franjas cargadas. Agregá al menos una para mejorar tu compatibilidad.</p>
    </div>

    <div v-else class="franjas-lista">
      <div
        v-for="(franja, idx) in franjas"
        :key="idx"
        class="franja-row"
      >
        <!-- Día -->
        <select v-model="franja.dia" class="franja-select">
          <option v-for="d in DIAS" :key="d.value" :value="d.value">
            {{ d.label }}
          </option>
        </select>

        <!-- Hora inicio -->
        <div class="franja-time">
          <label>Desde</label>
          <input v-model="franja.hora_inicio" type="time" class="franja-input" />
        </div>

        <!-- Hora fin -->
        <div class="franja-time">
          <label>Hasta</label>
          <input v-model="franja.hora_fin" type="time" class="franja-input" />
        </div>

        <!-- Eliminar -->
        <button class="btn-eliminar" @click="eliminarFranja(idx)" type="button" title="Eliminar">
          ✕
        </button>
      </div>
    </div>

    <!-- Feedback -->
    <p v-if="error"   class="msg-error">{{ error }}</p>
    <p v-if="success" class="msg-success">{{ success }}</p>

    <!-- Guardar -->
    <button class="btn-guardar" :disabled="saving" @click="guardar" type="button">
      <span v-if="saving" class="spinner" />
      <span v-else>💾 Guardar disponibilidad</span>
    </button>
  </div>
</template>

<style scoped>
.disp-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.disp-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.disp-title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.disp-sub {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 3px;
}

.btn-agregar {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--purple);
  border-radius: var(--radius-sm);
  color: var(--purple-lt);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}
.btn-agregar:hover { background: var(--purple-glow); }

.disp-empty {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  background: var(--bg-surface);
  border: 1px dashed var(--border-dim);
  border-radius: var(--radius-md);
  color: var(--text-muted);
  font-size: 13px;
}
.disp-empty span { font-size: 20px; }

.franjas-lista {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.franja-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.franja-select,
.franja-input {
  background: var(--bg-surface);
  border: 1px solid var(--border-dim);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 13px;
  padding: 8px 12px;
  outline: none;
  transition: border-color 0.2s;
  cursor: pointer;
}
.franja-select { min-width: 120px; }
.franja-input  { width: 120px; }

.franja-select:focus,
.franja-input:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 2px var(--purple-glow);
}

.franja-time {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.franja-time label {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.btn-eliminar {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 14px;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: color 0.2s, background 0.2s;
  margin-left: auto;
}
.btn-eliminar:hover {
  color: var(--red);
  background: rgba(228,45,41,0.1);
}

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

.btn-guardar {
  padding: 12px;
  background: var(--purple);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn-guardar:hover:not(:disabled) {
  background: var(--purple-lt);
  box-shadow: 0 4px 16px var(--purple-glow);
}
.btn-guardar:disabled { opacity: 0.6; cursor: not-allowed; }

.spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
