<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api.js'

const matches    = ref([])
const loading    = ref(false)
const paginacion = ref(null)
const pagina     = ref(1)

async function cargar(p = 1) {
  loading.value = true
  pagina.value  = p
  try {
    const { data } = await api.get(`/api/matches?page=${p}&limit=10`)
    matches.value    = data.matches
    paginacion.value = data.paginacion
  } catch (err) { console.error(err) }
  finally { loading.value = false }
}

onMounted(() => cargar())

function compatColor(pct) {
  if (pct >= 70) return 'var(--green)'
  if (pct >= 40) return 'var(--amber)'
  return 'var(--red)'
}
function rangoLabel(r) {
  return r ? r.charAt(0).toUpperCase() + r.slice(1).replace('_', ' ') : ''
}
function fechaRelativa(fecha) {
  const dias = Math.floor((Date.now() - new Date(fecha).getTime()) / 86400000)
  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Ayer'
  return `Hace ${dias} días`
}
</script>

<template>
  <div class="matches-page">
    <div class="page-header">
      <h1 class="page-title">Matches</h1>
      <p class="page-subtitle">Jugadores que también te dieron like</p>
    </div>

    <div v-if="loading" class="estado-vacio">
      <div class="spinner" /><p>Cargando matches...</p>
    </div>

    <div v-else-if="matches.length === 0" class="estado-vacio">
      <div class="vacio-icon">💬</div>
      <h2>Sin matches todavía</h2>
      <p>Seguí explorando jugadores en la sección Descubrir.</p>
    </div>

    <div v-else>
      <div class="matches-grid">
        <div v-for="m in matches" :key="m.id_match" class="match-card card">
          <div class="compat-badge" :style="{ background: compatColor(m.compatibilidad) }">
            {{ m.compatibilidad }}%
          </div>
          <div class="mcard-top">
            <div class="mcard-avatar-wrap">
              <img v-if="m.avatar_url" :src="`http://localhost:3000${m.avatar_url}`" class="mcard-avatar" />
              <div v-else class="mcard-avatar-ph">{{ m.nombre?.charAt(0)?.toUpperCase() }}</div>
            </div>
            <div class="mcard-info">
              <h3 class="mcard-summoner">{{ m.summoner_name }}</h3>
              <p class="mcard-nombre">{{ m.nombre }}</p>
              <div class="mcard-tags">
                <span class="tag tag-rango">{{ rangoLabel(m.rango) }}</span>
                <span class="tag tag-obj">{{ m.objetivo }}</span>
              </div>
            </div>
          </div>
          <div class="mcard-roles">
            <span v-for="rol in m.roles_preferidos" :key="rol" class="rol-chip">{{ rol }}</span>
          </div>
          <div class="mcard-footer">
            <span class="mcard-fecha">{{ fechaRelativa(m.fecha) }}</span>
            <a href="https://discord.com" target="_blank" class="btn-discord">💬 Contactar</a>
          </div>
        </div>
      </div>

      <div v-if="paginacion && paginacion.paginas_totales > 1" class="paginacion">
        <button class="pag-btn" :disabled="pagina === 1" @click="cargar(pagina - 1)">← Anterior</button>
        <span class="pag-info">Página {{ paginacion.pagina_actual }} de {{ paginacion.paginas_totales }}</span>
        <button class="pag-btn" :disabled="pagina === paginacion.paginas_totales" @click="cargar(pagina + 1)">Siguiente →</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.matches-page { max-width: 900px; margin: 0 auto; }
.page-header  { margin-bottom: 28px; }
.page-title   { font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--gold); }
.page-subtitle { color: var(--text-secondary); font-size: 14px; margin-top: 4px; }
.estado-vacio { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 360px; gap: 12px; color: var(--text-secondary); text-align: center; }
.vacio-icon { font-size: 48px; }
.estado-vacio h2 { font-family: var(--font-display); font-size: 22px; color: var(--text-primary); }
.spinner { width: 36px; height: 36px; border: 3px solid var(--border-dim); border-top-color: var(--purple-lt); border-radius: 50%; animation: spin 0.8s linear infinite; }
.matches-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px; }
.match-card { padding: 20px; display: flex; flex-direction: column; gap: 14px; position: relative; transition: border-color 0.2s, transform 0.2s; }
.match-card:hover { border-color: var(--gold-dim); transform: translateY(-2px); }
.compat-badge { position: absolute; top: 14px; right: 14px; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; color: #fff; }
.mcard-top { display: flex; gap: 14px; align-items: center; }
.mcard-avatar { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border); }
.mcard-avatar-ph { width: 56px; height: 56px; border-radius: 50%; background: var(--purple); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 22px; font-weight: 800; color: #fff; }
.mcard-info { display: flex; flex-direction: column; gap: 5px; }
.mcard-summoner { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--gold); }
.mcard-nombre { font-size: 12px; color: var(--text-secondary); }
.mcard-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.tag { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 20px; text-transform: capitalize; }
.tag-rango { background: rgba(200,170,110,0.12); color: var(--gold-dim); border: 1px solid rgba(200,170,110,0.2); }
.tag-obj   { background: rgba(102,85,192,0.12); color: var(--purple-lt); border: 1px solid rgba(102,85,192,0.2); }
.mcard-roles { display: flex; gap: 5px; flex-wrap: wrap; }
.rol-chip { font-size: 11px; padding: 3px 9px; border-radius: 20px; background: var(--bg-surface); border: 1px solid var(--border-dim); color: var(--text-secondary); text-transform: capitalize; }
.mcard-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; padding-top: 12px; border-top: 1px solid var(--border-dim); }
.mcard-fecha { font-size: 11px; color: var(--text-muted); }
.btn-discord { padding: 7px 14px; background: rgba(88,101,242,0.15); border: 1px solid rgba(88,101,242,0.3); border-radius: var(--radius-sm); color: #8b9cf8; font-size: 12px; font-weight: 600; text-decoration: none; transition: background 0.2s; }
.btn-discord:hover { background: rgba(88,101,242,0.25); }
.paginacion { display: flex; align-items: center; justify-content: center; gap: 20px; padding: 16px 0; }
.pag-btn { padding: 8px 18px; background: var(--bg-card); border: 1px solid var(--border-dim); border-radius: var(--radius-md); color: var(--text-secondary); font-family: var(--font-body); font-size: 13px; cursor: pointer; transition: border-color 0.2s, color 0.2s; }
.pag-btn:hover:not(:disabled) { border-color: var(--purple); color: var(--purple-lt); }
.pag-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pag-info { font-size: 13px; color: var(--text-muted); }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
