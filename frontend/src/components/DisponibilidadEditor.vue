<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api.js'


const BLOQUES = [
  { key: 'madrugada', label: 'Madrugada', hint: '00:00 - 06:00', hora_inicio: '00:00', hora_fin: '06:00' },
  { key: 'manana',    label: 'Mañana',    hint: '06:00 - 12:00', hora_inicio: '06:00', hora_fin: '12:00' },
  { key: 'tarde',     label: 'Tarde',     hint: '12:00 - 18:00', hora_inicio: '12:00', hora_fin: '18:00' },
  { key: 'noche',     label: 'Noche',     hint: '18:00 - 23:59', hora_inicio: '18:00', hora_fin: '23:59' },
]

const DIAS = [
  { key: 'lun', label: 'Lun' },
  { key: 'mar', label: 'Mar' },
  { key: 'mie', label: 'Mié' },
  { key: 'jue', label: 'Jue' },
  { key: 'vie', label: 'Vie' },
  { key: 'sab', label: 'Sáb' },
  { key: 'dom', label: 'Dom' },
]

const loading = ref(true)
const saving  = ref(false)
const error   = ref('')
const success = ref('')


const selected = ref(
  Object.fromEntries(DIAS.map(d => [d.key, Object.fromEntries(BLOQUES.map(b => [b.key, false]))]))
)

function toMinutos(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}


function matchBloque(franja) {
  const ini = toMinutos(franja.hora_inicio)
  const fin = toMinutos(franja.hora_fin)
  return BLOQUES.find(b => toMinutos(b.hora_inicio) === ini && toMinutos(b.hora_fin) === fin)
}

async function cargarDisponibilidad() {
  loading.value = true
  try {
    const { data } = await api.get('/api/disponibilidad')
    for (const franja of data.disponibilidad || []) {
      const bloque = matchBloque(franja)
      if (bloque && selected.value[franja.dia]) {
        selected.value[franja.dia][bloque.key] = true
      }
    }
  } catch (err) {
    error.value = 'No se pudo cargar tu disponibilidad actual.'
  } finally {
    loading.value = false
  }
}

function toggle(dia, bloque) {
  selected.value[dia][bloque] = !selected.value[dia][bloque]
}

async function guardar() {
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    const franjas = []
    for (const dia of DIAS) {
      for (const bloque of BLOQUES) {
        if (selected.value[dia.key][bloque.key]) {
          franjas.push({ dia: dia.key, hora_inicio: bloque.hora_inicio, hora_fin: bloque.hora_fin })
        }
      }
    }
    await api.put('/api/disponibilidad', { franjas })
    success.value = 'Disponibilidad guardada correctamente.'
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al guardar la disponibilidad.'
  } finally {
    saving.value = false
  }
}

onMounted(cargarDisponibilidad)
</script>

<template>
  <div class="disp-editor">
    <div class="disp-header">
      <h3 class="disp-title">Disponibilidad horaria</h3>
      <p class="disp-subtitle">Marcá los bloques en los que sueles estar disponible para jugar.</p>
    </div>

    <div v-if="loading" class="disp-loading">Cargando...</div>

    <div v-else class="disp-grid">
      <div class="disp-grid-corner"></div>
      <div v-for="bloque in BLOQUES" :key="bloque.key" class="disp-col-header" :title="bloque.hint">
        {{ bloque.label }}
      </div>

      <template v-for="dia in DIAS" :key="dia.key">
        <div class="disp-row-header">{{ dia.label }}</div>
        <button
          v-for="bloque in BLOQUES"
          :key="bloque.key"
          type="button"
          class="disp-cell"
          :class="{ active: selected[dia.key][bloque.key] }"
          @click="toggle(dia.key, bloque.key)"
        >
          <span v-if="selected[dia.key][bloque.key]">✓</span>
        </button>
      </template>
    </div>

    <p v-if="error" class="msg-error">{{ error }}</p>
    <p v-if="success" class="msg-success">{{ success }}</p>

    <button class="btn-save" :disabled="saving || loading" @click="guardar">
      <span v-if="saving" class="spinner" />
      <span v-else> Guardar disponibilidad</span>
    </button>
  </div>
</template>

<style scoped>
.disp-editor {
  margin-top: 8px;
}
.disp-header {
  margin-bottom: 16px;
}
.disp-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 800;
  color: var(--gold);
}
.disp-subtitle {
  font-size: var(--fs-sm);
  color: var(--text-secondary);
  margin-top: 4px;
}
.disp-loading {
  color: var(--text-secondary);
  font-size: var(--fs-sm);
  padding: 12px 0;
}
.disp-grid {
  display: grid;
  grid-template-columns: 56px repeat(4, 1fr);
  gap: 6px;
  margin-bottom: 16px;
}
.disp-grid-corner {
  background: transparent;
}
.disp-col-header {
  text-align: center;
  font-size: var(--fs-xs);
  font-weight: 600;
  color: var(--text-tertiary);
  padding-bottom: 4px;
}
.disp-row-header {
  display: flex;
  align-items: center;
  font-size: var(--fs-xs);
  font-weight: 600;
  color: var(--text-secondary);
}
.disp-cell {
  height: 40px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-dim);
  background: var(--bg-inset);
  color: var(--gold-lt);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s var(--ease-out);
}
.disp-cell:hover {
  border-color: var(--border-strong);
  background: var(--bg-hover);
}
.disp-cell.active {
  background: var(--purple-glow);
  border-color: var(--purple);
  color: var(--purple-lt);
}
.msg-error {
  color: #e45151;
  font-size: var(--fs-sm);
  margin-bottom: 8px;
}
.msg-success {
  color: #3ebf90;
  font-size: var(--fs-sm);
  margin-bottom: 8px;
}
.btn-save {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  border-radius: var(--radius-md);
  border: none;
  background: linear-gradient(135deg, var(--purple-lt), var(--purple));
  color: #fff;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: var(--fs-base);
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>