<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api.js'

const ranking    = ref([])
const loading    = ref(false)
const paginacion = ref(null)
const pagina     = ref(1)

async function cargar(p = 1) {
  loading.value = true
  pagina.value  = p
  try {
    const { data } = await api.get(`/api/leaderboard?page=${p}&limit=10`)
    ranking.value    = data.ranking
    paginacion.value = data.paginacion
  } catch (err) { console.error(err) }
  finally { loading.value = false }
}

onMounted(() => cargar())

function medallaIcon(pos) {
  if (pos === 1) return '🥇'
  if (pos === 2) return '🥈'
  if (pos === 3) return '🥉'
  return pos
}
function rangoLabel(r) {
  return r ? r.charAt(0).toUpperCase() + r.slice(1).replace('_', ' ') : ''
}
</script>

<template>
  <div class="lb-page">
    <div class="page-header">
      <h1 class="page-title">Ranking</h1>
      <p class="page-subtitle">Los jugadores con mejor reputación en RiftCampus</p>
    </div>

    <div v-if="loading" class="estado-vacio">
      <div class="spinner" /><p>Cargando ranking...</p>
    </div>

    <div v-else-if="ranking.length === 0" class="estado-vacio">
      <div class="vacio-icon">🏆</div>
      <h2>El ranking está vacío</h2>
      <p>Completá matches y recibí reseñas para aparecer acá.</p>
    </div>

    <div v-else class="lb-tabla card">
      <div class="lb-header-row">
        <span class="col-pos">Pos.</span>
        <span class="col-jugador">Jugador</span>
        <span class="col-stat">Partidas</span>
        <span class="col-stat">Promedio</span>
        <span class="col-pts">Puntos</span>
      </div>

      <div
        v-for="r in ranking"
        :key="r.id_ranking"
        class="lb-row"
        :class="{ 'top-1': r.posicion===1, 'top-2': r.posicion===2, 'top-3': r.posicion===3 }"
      >
        <div class="col-pos pos-badge">{{ medallaIcon(r.posicion) }}</div>
        <div class="col-jugador jugador-info">
          <div class="lb-avatar-wrap">
            <img v-if="r.avatar_url" :src="`http://localhost:3000${r.avatar_url}`" class="lb-avatar" />
            <div v-else class="lb-avatar-ph">{{ r.nombre?.charAt(0)?.toUpperCase() }}</div>
          </div>
          <div>
            <p class="lb-summoner">{{ r.summoner_name }}</p>
            <p class="lb-rango">{{ rangoLabel(r.rango) }}</p>
          </div>
        </div>
        <div class="col-stat stat-val">{{ r.partidas_jugadas }}</div>
        <div class="col-stat stat-val">
          <span v-if="r.promedio_resenas">⭐ {{ Number(r.promedio_resenas).toFixed(1) }}</span>
          <span v-else class="muted">—</span>
        </div>
        <div class="col-pts puntos-val">{{ r.puntos_reputacion }}</div>
      </div>
    </div>

    <div v-if="paginacion && paginacion.paginas_totales > 1" class="paginacion">
      <button class="pag-btn" :disabled="pagina === 1" @click="cargar(pagina - 1)">← Anterior</button>
      <span class="pag-info">Página {{ paginacion.pagina_actual }} de {{ paginacion.paginas_totales }}</span>
      <button class="pag-btn" :disabled="pagina === paginacion.paginas_totales" @click="cargar(pagina + 1)">Siguiente →</button>
    </div>
  </div>
</template>

<style scoped>
.lb-page { max-width: 800px; margin: 0 auto; }
.page-header  { margin-bottom: 28px; }
.page-title   { font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--gold); }
.page-subtitle { color: var(--text-secondary); font-size: 14px; margin-top: 4px; }
.estado-vacio { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 360px; gap: 12px; color: var(--text-secondary); text-align: center; }
.vacio-icon { font-size: 48px; }
.estado-vacio h2 { font-family: var(--font-display); font-size: 22px; color: var(--text-primary); }
.spinner { width: 36px; height: 36px; border: 3px solid var(--border-dim); border-top-color: var(--gold-dim); border-radius: 50%; animation: spin 0.8s linear infinite; }
.lb-tabla { overflow: hidden; }
.lb-header-row { display: grid; grid-template-columns: 60px 1fr 90px 90px 90px; padding: 12px 20px; border-bottom: 1px solid var(--border-dim); font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.lb-row { display: grid; grid-template-columns: 60px 1fr 90px 90px 90px; padding: 14px 20px; border-bottom: 1px solid var(--border-dim); align-items: center; transition: background 0.2s; }
.lb-row:last-child { border-bottom: none; }
.lb-row:hover { background: var(--bg-hover); }
.lb-row.top-1 { background: rgba(200,170,110,0.06); }
.lb-row.top-2 { background: rgba(180,180,180,0.04); }
.lb-row.top-3 { background: rgba(180,110,60,0.04); }
.col-pos { display: flex; align-items: center; justify-content: center; }
.pos-badge { font-size: 18px; font-weight: 800; color: var(--text-secondary); }
.jugador-info { display: flex; align-items: center; gap: 12px; }
.lb-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border); }
.lb-avatar-ph { width: 40px; height: 40px; border-radius: 50%; background: var(--purple); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 16px; font-weight: 800; color: #fff; }
.lb-summoner { font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--text-primary); }
.lb-rango    { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.col-stat { text-align: center; }
.stat-val { font-size: 14px; color: var(--text-secondary); }
.muted    { color: var(--text-muted); }
.col-pts { text-align: right; }
.puntos-val { font-family: var(--font-display); font-size: 16px; font-weight: 800; color: var(--gold); }
.paginacion { display: flex; align-items: center; justify-content: center; gap: 20px; padding: 20px 0; }
.pag-btn { padding: 8px 18px; background: var(--bg-card); border: 1px solid var(--border-dim); border-radius: var(--radius-md); color: var(--text-secondary); font-family: var(--font-body); font-size: 13px; cursor: pointer; transition: border-color 0.2s, color 0.2s; }
.pag-btn:hover:not(:disabled) { border-color: var(--purple); color: var(--purple-lt); }
.pag-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pag-info { font-size: 13px; color: var(--text-muted); }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
