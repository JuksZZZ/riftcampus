<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api.js'

// ── Estado general ───────────────────────────────────────────
const modo        = ref('swipe')   // 'swipe' | 'explorar'
const candidatos  = ref([])
const loading     = ref(false)
const swipeando   = ref(false)
const sinJugadores = ref(false)

// ── Swipe ────────────────────────────────────────────────────
const indiceActual = ref(0)
const animacion    = ref('')   // 'like' | 'dislike' | ''

// ── Match popup ──────────────────────────────────────────────
const matchPopup  = ref(false)
const matchData   = ref(null)

// ── Filtros ──────────────────────────────────────────────────
const filtroRango    = ref('')
const filtroRol      = ref('')
const filtroObjetivo = ref('')

const rangos = ['hierro','bronce','plata','oro','platino','esmeralda','diamante','maestro','gran_maestro','challenger']
const roles  = ['top','jungla','mid','adc','support']
const objetivos = ['casual','rankear','competitivo']

// ── Jugador actual (modo swipe) ──────────────────────────────
const jugadorActual = computed(() => candidatos.value[indiceActual.value] || null)

// ── Jugadores filtrados (modo explorar) ─────────────────────
const jugadoresFiltrados = computed(() => {
  return candidatos.value.filter(c => {
    if (filtroRango.value    && c.rango    !== filtroRango.value)    return false
    if (filtroObjetivo.value && c.objetivo !== filtroObjetivo.value) return false
    if (filtroRol.value      && !c.roles_preferidos.includes(filtroRol.value)) return false
    return true
  })
})

// ── Cargar candidatos ────────────────────────────────────────
async function cargarCandidatos() {
  loading.value = true
  sinJugadores.value = false
  try {
    const { data } = await api.get('/api/swipe/candidatos')
    candidatos.value  = data.candidatos
    indiceActual.value = 0
    if (candidatos.value.length === 0) sinJugadores.value = true
  } catch (err) {
    if (err.response?.status === 400) sinJugadores.value = true
  } finally {
    loading.value = false
  }
}

onMounted(cargarCandidatos)

// ── Hacer swipe ──────────────────────────────────────────────
async function swipe(accion) {
  if (!jugadorActual.value || swipeando.value) return
  swipeando.value = true
  animacion.value = accion

  try {
    const { data } = await api.post('/api/swipe', {
      id_swiped: jugadorActual.value.id_usuario,
      accion
    })

    // Esperar animación antes de avanzar
    await delay(350)
    animacion.value = ''

    if (data.es_match) {
      matchData.value  = data.match
      matchPopup.value = true
    }

    indiceActual.value++
    if (indiceActual.value >= candidatos.value.length) {
      sinJugadores.value = true
    }
  } catch (err) {
    console.error(err)
    animacion.value = ''
  } finally {
    swipeando.value = false
  }
}

// ── Swipe desde explorar ─────────────────────────────────────
async function swipeDesdeExplorar(candidato, accion) {
  try {
    const { data } = await api.post('/api/swipe', {
      id_swiped: candidato.id_usuario,
      accion
    })
    // Remover de la lista
    candidatos.value = candidatos.value.filter(c => c.id_usuario !== candidato.id_usuario)

    if (data.es_match) {
      matchData.value  = data.match
      matchPopup.value = true
    }
  } catch (err) {
    console.error(err)
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function cerrarMatch() {
  matchPopup.value = false
  matchData.value  = null
}

function compatibilidadColor(pct) {
  if (pct >= 70) return 'var(--green)'
  if (pct >= 40) return 'var(--amber)'
  return 'var(--red)'
}

function rangoLabel(r) {
  return r ? r.charAt(0).toUpperCase() + r.slice(1).replace('_', ' ') : ''
}
</script>

<template>
  <div class="swipe-page">

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Descubrir</h1>
        <p class="page-subtitle">Encontrá tu compañero ideal</p>
      </div>

      <!-- Toggle modo -->
      <div class="modo-toggle">
        <button
          class="modo-btn"
          :class="{ active: modo === 'swipe' }"
          @click="modo = 'swipe'"
        >⚡ Swipe</button>
        <button
          class="modo-btn"
          :class="{ active: modo === 'explorar' }"
          @click="modo = 'explorar'"
        >🔍 Explorar</button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="estado-vacio">
      <div class="spinner-grande" />
      <p>Buscando jugadores...</p>
    </div>

    <!-- Sin perfil / sin jugadores -->
    <div v-else-if="sinJugadores && candidatos.length === 0" class="estado-vacio">
      <div class="vacio-icon">🎮</div>
      <h2>Sin jugadores disponibles</h2>
      <p>Completá tu perfil o volvé más tarde para ver nuevos jugadores.</p>
    </div>

    <template v-else>

      <!-- ════════════════════════════════════════════════════
           MODO SWIPE
      ════════════════════════════════════════════════════ -->
      <div v-if="modo === 'swipe'" class="swipe-area">

        <!-- Sin más jugadores -->
        <div v-if="sinJugadores" class="estado-vacio">
          <div class="vacio-icon">✅</div>
          <h2>¡Viste todos los jugadores!</h2>
          <p>Volvé más tarde para ver nuevos perfiles.</p>
          <button class="btn-recargar" @click="cargarCandidatos">Recargar</button>
        </div>

        <!-- Card del jugador actual -->
        <div
          v-else-if="jugadorActual"
          class="swipe-card-wrapper"
        >
          <!-- Card siguiente (apilada atrás) -->
          <div
            v-if="candidatos[indiceActual + 1]"
            class="player-card card card-back"
          />

          <!-- Card principal -->
          <div
            class="player-card card"
            :class="{
              'anim-like':    animacion === 'like',
              'anim-dislike': animacion === 'dislike'
            }"
          >
            <!-- Badge de animación -->
            <div v-if="animacion === 'like'"    class="badge-like">LIKE ✓</div>
            <div v-if="animacion === 'dislike'" class="badge-dislike">PASS ✗</div>

            <!-- Avatar -->
            <div class="card-avatar-wrap">
              <img
                v-if="jugadorActual.avatar_url"
                :src="`http://localhost:3000${jugadorActual.avatar_url}`"
                class="card-avatar"
                alt="avatar"
              />
              <div v-else class="card-avatar-placeholder">
                {{ jugadorActual.nombre?.charAt(0)?.toUpperCase() }}
              </div>

              <!-- Ring de compatibilidad -->
              <div
                class="compat-ring"
                :style="{ '--color': compatibilidadColor(jugadorActual.compatibilidad) }"
              >
                <span class="compat-pct">{{ jugadorActual.compatibilidad }}%</span>
              </div>
            </div>

            <!-- Info -->
            <div class="card-body">
              <h2 class="card-nombre">{{ jugadorActual.summoner_name }}</h2>
              <p class="card-usuario">{{ jugadorActual.nombre }}</p>

              <div class="card-tags">
                <span class="tag tag-rango">{{ rangoLabel(jugadorActual.rango) }}</span>
                <span class="tag tag-objetivo">{{ jugadorActual.objetivo }}</span>
              </div>

              <div class="card-roles">
                <span
                  v-for="rol in jugadorActual.roles_preferidos"
                  :key="rol"
                  class="rol-chip"
                >{{ rol }}</span>
              </div>

              <!-- Horarios -->
              <div v-if="jugadorActual.disponibilidad?.length" class="card-horarios">
                <div
                  v-for="f in jugadorActual.disponibilidad"
                  :key="f.dia + f.hora_inicio"
                  class="horario-chip"
                >
                  <span class="horario-dia">{{ f.dia.toUpperCase() }}</span>
                  <span class="horario-horas">{{ f.hora_inicio.slice(0,5) }} – {{ f.hora_fin.slice(0,5) }}</span>
                </div>
              </div>

              <p v-if="jugadorActual.descripcion" class="card-desc">
                {{ jugadorActual.descripcion }}
              </p>
            </div>
          </div>

          <!-- Botones -->
          <div class="swipe-btns">
            <button
              class="btn-dislike"
              :disabled="swipeando"
              @click="swipe('dislike')"
              title="Pasar"
            >✗</button>

            <div class="contador">
              {{ indiceActual + 1 }} / {{ candidatos.length }}
            </div>

            <button
              class="btn-like"
              :disabled="swipeando"
              @click="swipe('like')"
              title="Like"
            >♥</button>
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════
           MODO EXPLORAR
      ════════════════════════════════════════════════════ -->
      <div v-else class="explorar-area">

        <!-- Filtros -->
        <div class="filtros card">
          <div class="filtro-grupo">
            <label>Rango</label>
            <select v-model="filtroRango">
              <option value="">Todos</option>
              <option v-for="r in rangos" :key="r" :value="r">
                {{ rangoLabel(r) }}
              </option>
            </select>
          </div>

          <div class="filtro-grupo">
            <label>Rol</label>
            <select v-model="filtroRol">
              <option value="">Todos</option>
              <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>

          <div class="filtro-grupo">
            <label>Objetivo</label>
            <select v-model="filtroObjetivo">
              <option value="">Todos</option>
              <option v-for="o in objetivos" :key="o" :value="o">{{ o }}</option>
            </select>
          </div>

          <div class="filtro-resultado">
            {{ jugadoresFiltrados.length }} jugadores
          </div>
        </div>

        <!-- Grid de jugadores -->
        <div v-if="jugadoresFiltrados.length === 0" class="estado-vacio">
          <p>No hay jugadores con esos filtros.</p>
        </div>

        <div v-else class="jugadores-grid">
          <div
            v-for="jugador in jugadoresFiltrados"
            :key="jugador.id_usuario"
            class="jugador-card card"
          >
            <!-- Compat badge -->
            <div
              class="compat-badge"
              :style="{ background: compatibilidadColor(jugador.compatibilidad) }"
            >
              {{ jugador.compatibilidad }}%
            </div>

            <!-- Avatar -->
            <div class="jcard-avatar-wrap">
              <img
                v-if="jugador.avatar_url"
                :src="`http://localhost:3000${jugador.avatar_url}`"
                class="jcard-avatar"
                alt="avatar"
              />
              <div v-else class="jcard-avatar-placeholder">
                {{ jugador.nombre?.charAt(0)?.toUpperCase() }}
              </div>
            </div>

            <!-- Info -->
            <div class="jcard-info">
              <h3 class="jcard-summoner">{{ jugador.summoner_name }}</h3>
              <p class="jcard-nombre">{{ jugador.nombre }}</p>
              <div class="jcard-tags">
                <span class="tag tag-rango">{{ rangoLabel(jugador.rango) }}</span>
                <span class="tag tag-objetivo">{{ jugador.objetivo }}</span>
              </div>
              <div class="jcard-roles">
                <span v-for="rol in jugador.roles_preferidos" :key="rol" class="rol-chip-sm">
                  {{ rol }}
                </span>
              </div>

              <div v-if="jugador.disponibilidad?.length" class="jcard-horarios">
                <span
                  v-for="f in jugador.disponibilidad.slice(0,3)"
                  :key="f.dia"
                  class="horario-chip-sm"
                >{{ f.dia.toUpperCase() }} {{ f.hora_inicio.slice(0,5) }}–{{ f.hora_fin.slice(0,5) }}</span>
                <span v-if="jugador.disponibilidad.length > 3" class="horario-chip-sm muted">
                  +{{ jugador.disponibilidad.length - 3 }} más
                </span>
              </div>
            </div>

            <!-- Acciones -->
            <div class="jcard-acciones">
              <button
                class="jbtn-dislike"
                @click="swipeDesdeExplorar(jugador, 'dislike')"
              >✗</button>
              <button
                class="jbtn-like"
                @click="swipeDesdeExplorar(jugador, 'like')"
              >♥</button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════════
         POPUP DE MATCH
    ══════════════════════════════════════════════════════ -->
    <transition name="fade">
      <div v-if="matchPopup" class="match-overlay" @click.self="cerrarMatch">
        <div class="match-popup">
          <div class="match-particles">
            <span v-for="i in 12" :key="i" class="particle" :style="`--i:${i}`">⚡</span>
          </div>

          <div class="match-titulo">¡Es un Match!</div>

          <div class="match-avatares">
            <div class="match-avatar-wrap">
              <div class="match-avatar-placeholder">Yo</div>
            </div>
            <div class="match-corazon">♥</div>
            <div class="match-avatar-wrap">
              <img
                v-if="matchData?.avatar_url"
                :src="`http://localhost:3000${matchData.avatar_url}`"
                class="match-avatar-img"
                alt="match"
              />
              <div v-else class="match-avatar-placeholder">
                {{ matchData?.nombre?.charAt(0)?.toUpperCase() }}
              </div>
            </div>
          </div>

          <p class="match-nombre">{{ matchData?.summoner_name }}</p>
          <p class="match-sub">{{ matchData?.nombre }} · {{ rangoLabel(matchData?.rango) }}</p>

          <div class="match-compat">
            <span class="match-compat-label">Compatibilidad</span>
            <span
              class="match-compat-pct"
              :style="{ color: compatibilidadColor(matchData?.compatibilidad) }"
            >{{ matchData?.compatibilidad }}%</span>
          </div>

          <p class="match-hint">Podés encontrar este match en tu sección de Matches</p>

          <button class="btn-cerrar-match" @click="cerrarMatch">
            ¡Genial! 🎮
          </button>
        </div>
      </div>
    </transition>

  </div>
</template>

<style scoped>
.swipe-page { max-width: 1000px; margin: 0 auto; }

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 12px;
}
.page-title { font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--gold); }
.page-subtitle { color: var(--text-secondary); font-size: 14px; margin-top: 4px; }

/* ── Toggle ───────────────────────────────────────────── */
.modo-toggle {
  display: flex;
  background: var(--bg-card);
  border: 1px solid var(--border-dim);
  border-radius: var(--radius-md);
  padding: 4px;
  gap: 4px;
}
.modo-btn {
  padding: 8px 18px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.modo-btn.active {
  background: var(--purple);
  color: #fff;
}

/* ── Estado vacío ─────────────────────────────────────── */
.estado-vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 12px;
  color: var(--text-secondary);
  text-align: center;
}
.vacio-icon { font-size: 48px; }
.estado-vacio h2 { font-family: var(--font-display); font-size: 22px; color: var(--text-primary); }
.spinner-grande {
  width: 40px; height: 40px;
  border: 3px solid var(--border-dim);
  border-top-color: var(--purple-lt);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.btn-recargar {
  margin-top: 8px;
  padding: 10px 24px;
  background: var(--purple);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-recargar:hover { background: var(--purple-lt); }

/* ── Swipe area ───────────────────────────────────────── */
.swipe-area {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}
.swipe-card-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  position: relative;
}

/* ── Player card ──────────────────────────────────────── */
.player-card {
  width: 340px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  position: relative;
  transition: transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.35s;
  user-select: none;
}
.card-back {
  position: absolute;
  width: 320px;
  height: 100%;
  top: 8px;
  z-index: 0;
  opacity: 0.4;
  pointer-events: none;
}
.anim-like    { transform: translateX(120px) rotate(15deg); opacity: 0; }
.anim-dislike { transform: translateX(-120px) rotate(-15deg); opacity: 0; }

/* Badges */
.badge-like, .badge-dislike {
  position: absolute;
  top: 20px;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
  padding: 6px 14px;
  border-radius: var(--radius-md);
  border: 3px solid;
  transform: rotate(-15deg);
  z-index: 10;
}
.badge-like    { left: 20px; color: var(--green); border-color: var(--green); }
.badge-dislike { right: 20px; color: var(--red);   border-color: var(--red); transform: rotate(15deg); }

/* Avatar con ring */
.card-avatar-wrap {
  position: relative;
  width: 100px;
  height: 100px;
}
.card-avatar {
  width: 100px; height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--border);
}
.card-avatar-placeholder {
  width: 100px; height: 100px;
  border-radius: 50%;
  background: var(--purple);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-size: 36px; font-weight: 800; color: #fff;
}
.compat-ring {
  position: absolute;
  bottom: -6px; right: -6px;
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 2px solid var(--color);
  display: flex; align-items: center; justify-content: center;
}
.compat-pct { font-size: 9px; font-weight: 700; color: var(--color); }

/* Card body */
.card-body { display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%; }
.card-nombre { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--gold); }
.card-usuario { font-size: 13px; color: var(--text-secondary); }
.card-tags { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.tag {
  font-size: 11px; font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  text-transform: capitalize;
}
.tag-rango    { background: rgba(200,170,110,0.12); color: var(--gold-dim); border: 1px solid rgba(200,170,110,0.2); }
.tag-objetivo { background: rgba(102,85,192,0.12);  color: var(--purple-lt); border: 1px solid rgba(102,85,192,0.2); }

.card-roles { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
.rol-chip {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 20px;
  background: var(--bg-surface);
  border: 1px solid var(--border-dim);
  color: var(--text-secondary);
  text-transform: capitalize;
}
.card-desc {
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.5;
  margin-top: 4px;
}

/* Botones swipe */
.swipe-btns {
  display: flex;
  align-items: center;
  gap: 32px;
  z-index: 2;
}
.btn-dislike, .btn-like {
  width: 60px; height: 60px;
  border-radius: 50%;
  border: 2px solid;
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.btn-dislike {
  background: rgba(228,45,41,0.08);
  border-color: var(--red);
  color: var(--red);
}
.btn-like {
  background: rgba(62,191,144,0.08);
  border-color: var(--green);
  color: var(--green);
}
.btn-dislike:hover:not(:disabled) { transform: scale(1.1); box-shadow: 0 0 16px rgba(228,45,41,0.3); }
.btn-like:hover:not(:disabled)    { transform: scale(1.1); box-shadow: 0 0 16px rgba(62,191,144,0.3); }
.btn-dislike:disabled, .btn-like:disabled { opacity: 0.5; cursor: not-allowed; }
.contador { font-size: 13px; color: var(--text-muted); font-family: var(--font-display); }

/* ── Explorar ─────────────────────────────────────────── */
.explorar-area { display: flex; flex-direction: column; gap: 20px; }

.filtros {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 20px;
  flex-wrap: wrap;
}
.filtro-grupo { display: flex; flex-direction: column; gap: 6px; }
.filtro-grupo label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.filtro-grupo select {
  background: var(--bg-surface);
  border: 1px solid var(--border-dim);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 13px;
  outline: none;
  cursor: pointer;
}
.filtro-grupo select:focus { border-color: var(--purple); }
.filtro-resultado { margin-left: auto; font-size: 13px; color: var(--text-secondary); }

.jugadores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.jugador-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  transition: border-color 0.2s, transform 0.2s;
}
.jugador-card:hover { border-color: var(--purple); transform: translateY(-2px); }

.compat-badge {
  position: absolute;
  top: 14px; right: 14px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
}

.jcard-avatar-wrap { display: flex; align-items: center; gap: 12px; }
.jcard-avatar {
  width: 52px; height: 52px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border);
}
.jcard-avatar-placeholder {
  width: 52px; height: 52px;
  border-radius: 50%;
  background: var(--purple);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-size: 20px; font-weight: 800; color: #fff;
}

.jcard-info { display: flex; flex-direction: column; gap: 6px; }
.jcard-summoner { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--gold); }
.jcard-nombre   { font-size: 12px; color: var(--text-secondary); }
.jcard-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.jcard-roles { display: flex; gap: 4px; flex-wrap: wrap; }
.rol-chip-sm {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 20px;
  background: var(--bg-surface);
  border: 1px solid var(--border-dim);
  color: var(--text-muted);
  text-transform: capitalize;
  
}

.jcard-acciones {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}
.jbtn-dislike, .jbtn-like {
  flex: 1;
  padding: 8px;
  border-radius: var(--radius-sm);
  border: 1px solid;
  font-size: 16px;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  font-family: var(--font-body);
}
.jbtn-dislike { background: rgba(228,45,41,0.08); border-color: var(--red); color: var(--red); }
.jbtn-like    { background: rgba(62,191,144,0.08); border-color: var(--green); color: var(--green); }
.jbtn-dislike:hover, .jbtn-like:hover { transform: scale(1.05); }

/* ── Match Popup ──────────────────────────────────────── */
.match-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}
.match-popup {
  background: var(--bg-card);
  border: 1px solid var(--gold-dim);
  border-radius: var(--radius-xl);
  padding: 40px 36px;
  max-width: 380px;
  width: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
  text-align: center;
  box-shadow: 0 0 60px rgba(200,170,110,0.15);
}

/* Partículas */
.match-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.particle {
  position: absolute;
  font-size: 14px;
  animation: flotar calc(1.5s + var(--i) * 0.1s) ease-in-out infinite alternate;
  left: calc(var(--i) * 8%);
  top: calc(10% + var(--i) * 5%);
  opacity: 0.3;
}
@keyframes flotar {
  from { transform: translateY(0) rotate(0deg); }
  to   { transform: translateY(-20px) rotate(20deg); }
}

.match-titulo {
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 800;
  color: var(--gold);
  z-index: 1;
}

.match-avatares {
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 1;
}
.match-corazon {
  font-size: 28px;
  color: var(--green);
  animation: latir 0.8s ease-in-out infinite alternate;
}
@keyframes latir {
  from { transform: scale(1); }
  to   { transform: scale(1.2); }
}
.match-avatar-img {
  width: 72px; height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--gold-dim);
}
.match-avatar-placeholder {
  width: 72px; height: 72px;
  border-radius: 50%;
  background: var(--purple);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-size: 24px; font-weight: 800; color: #fff;
  border: 3px solid var(--gold-dim);
}

.match-nombre { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--text-primary); z-index: 1; }
.match-sub    { font-size: 13px; color: var(--text-secondary); z-index: 1; }

.match-compat {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-surface);
  border: 1px solid var(--border-dim);
  border-radius: var(--radius-md);
  padding: 10px 20px;
  z-index: 1;
}
.match-compat-label { font-size: 13px; color: var(--text-secondary); }
.match-compat-pct   { font-family: var(--font-display); font-size: 22px; font-weight: 800; }

.match-hint { font-size: 12px; color: var(--text-muted); z-index: 1; }

.btn-cerrar-match {
  width: 100%;
  padding: 13px;
  background: var(--purple);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  z-index: 1;
}
.btn-cerrar-match:hover {
  background: var(--purple-lt);
  box-shadow: 0 4px 20px var(--purple-glow);
}

/* ── Animaciones globales ─────────────────────────────── */
@keyframes spin { to { transform: rotate(360deg); } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.card-horarios {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  margin-top: 4px;
}
.horario-chip {
  display: flex;
  gap: 5px;
  align-items: center;
  background: var(--bg-surface);
  border: 1px solid var(--border-dim);
  border-radius: 20px;
  padding: 3px 10px;
  font-size: 11px;
}
.horario-dia  { color: var(--blue); font-weight: 700; }
.horario-horas { color: var(--text-secondary); }

.jcard-horarios { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.horario-chip-sm {
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 20px;
  background: var(--bg-surface);
  border: 1px solid var(--border-dim);
  color: var(--text-secondary);
}
.horario-chip-sm.muted { color: var(--text-muted); }
</style>
