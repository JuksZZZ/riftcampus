<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Ranking preview estático (en producción conectar al backend)
const topPlayers = ref([
  { pos: 1, summoner: 'NightbladeX', rango: 'Challenger', puntos: 1240, avatar: null },
  { pos: 2, summoner: 'SolarisMid',  rango: 'Gran Maestro', puntos: 980, avatar: null },
  { pos: 3, summoner: 'VoidHunter',  rango: 'Maestro',    puntos: 870, avatar: null },
])

// Partículas del hero
const particulas = ref([])
onMounted(() => {
  particulas.value = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 3,
    delay: Math.random() * 4,
    dur: 3 + Math.random() * 4,
  }))
})

const features = [
  {
    icon: '⚡',
    titulo: 'Swipe & Match',
    desc: 'Descubrí jugadores compatibles y conectá con un like mutuo. Como Tinder, pero para rankear.',
  },
  {
    icon: '🧮',
    titulo: 'Compatibilidad real',
    desc: 'Nuestro algoritmo cruza rango, roles, horarios y objetivos para mostrarte quién realmente te complementa.',
  },
  {
    icon: '🛡',
    titulo: 'Equipos universitarios',
    desc: 'Formá o sumate a un equipo de hasta 5 jugadores y representá tu facultad en torneos.',
  },
  {
    icon: '🏆',
    titulo: 'Reputación',
    desc: 'Las reseñas de tus compañeros construyen tu perfil. Los mejores suben al ranking global.',
  },
]

const pasos = [
  { n: '01', titulo: 'Creá tu perfil', desc: 'Cargá tu summoner name, rango actual, roles preferidos y disponibilidad horaria.' },
  { n: '02', titulo: 'Explorá jugadores', desc: 'El sistema calcula tu compatibilidad con cada jugador y te muestra los mejores primero.' },
  { n: '03', titulo: 'Conectá', desc: 'Si hay like mutuo es un match. Contactate por Discord y empezá a jugar.' },
]
</script>

<template>
  <div class="landing">

    <!-- ── NAV ──────────────────────────────────────────────── -->
    <nav class="nav">
      <div class="nav-logo">
        <span class="nav-logo-icon">⚔</span>
        <span class="nav-logo-text">RiftCampus</span>
      </div>
      <div class="nav-actions">
        <router-link to="/login" class="btn-ghost">Iniciar sesión</router-link>
        <router-link to="/register" class="btn-primary-sm">Registrarse</router-link>
      </div>
    </nav>

    <!-- ── HERO ─────────────────────────────────────────────── -->
    <section class="hero">
      <!-- Partículas de fondo -->
      <div class="hero-particles" aria-hidden="true">
        <div
          v-for="p in particulas"
          :key="p.id"
          class="particle"
          :style="{
            left: p.x + '%',
            top: p.y + '%',
            width: p.size + 'px',
            height: p.size + 'px',
            animationDelay: p.delay + 's',
            animationDuration: p.dur + 's',
          }"
        />
      </div>

      <!-- Glow de fondo -->
      <div class="hero-glow-left"  aria-hidden="true" />
      <div class="hero-glow-right" aria-hidden="true" />

      <div class="hero-content">
        <!-- Texto -->
        <div class="hero-text">
          <div class="hero-eyebrow">🎓 Para jugadores universitarios</div>
          <h1 class="hero-titulo">
            Encontrá tu<br />
            <span class="hero-titulo-gold">equipo ideal</span><br />
            en la Rift
          </h1>
          <p class="hero-desc">
            RiftCampus conecta estudiantes que juegan League of Legends
            según rango, roles y disponibilidad horaria. Sin matchmaking aleatorio,
            con compañeros que realmente te complementan.
          </p>
          <div class="hero-ctas">
            <router-link to="/register" class="btn-primary-lg">
              Empezar gratis
            </router-link>
            <router-link to="/login" class="btn-outline-lg">
              Ya tengo cuenta →
            </router-link>
          </div>
          <div class="hero-stats">
            <div class="stat">
              <span class="stat-num">10</span>
              <span class="stat-label">Rangos soportados</span>
            </div>
            <div class="stat-divider" />
            <div class="stat">
              <span class="stat-num">5</span>
              <span class="stat-label">Roles del juego</span>
            </div>
            <div class="stat-divider" />
            <div class="stat">
              <span class="stat-num">4</span>
              <span class="stat-label">Factores de compatibilidad</span>
            </div>
          </div>
        </div>

        <!-- Mockup -->
        <div class="hero-mockup" aria-hidden="true">
          <div class="mockup-phone">
            <!-- Header de la app -->
            <div class="mockup-header">
              <span class="mockup-logo">⚔ RiftCampus</span>
            </div>

            <!-- Card de swipe -->
            <div class="mockup-card">
              <div class="mockup-avatar">N</div>
              <div class="mockup-compat">
                <span class="mockup-compat-pct">87%</span>
                <span class="mockup-compat-label">compatibilidad</span>
              </div>
              <div class="mockup-info">
                <p class="mockup-summoner">NightbladeX</p>
                <p class="mockup-sub">Diamante · Mid</p>
              </div>
              <div class="mockup-tags">
                <span class="mockup-tag">⚡ Mid</span>
                <span class="mockup-tag">🌿 Jungla</span>
              </div>
              <div class="mockup-horario">🕐 Lun–Vie 20:00–23:00</div>
              <div class="mockup-btns">
                <div class="mockup-btn-no">✗</div>
                <div class="mockup-btn-si">♥</div>
              </div>
            </div>

            <!-- Match notification -->
            <div class="mockup-match-badge">
              ⚡ ¡Es un match!
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── FEATURES ──────────────────────────────────────────── -->
    <section class="section features-section">
      <div class="section-inner">
        <div class="section-label">Funcionalidades</div>
        <h2 class="section-titulo">Todo lo que necesitás para encontrar tu equipo</h2>

        <div class="features-grid">
          <div v-for="f in features" :key="f.titulo" class="feature-card">
            <div class="feature-icon">{{ f.icon }}</div>
            <h3 class="feature-titulo">{{ f.titulo }}</h3>
            <p class="feature-desc">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── CÓMO FUNCIONA ─────────────────────────────────────── -->
    <section class="section como-section">
      <div class="section-inner">
        <div class="section-label">Proceso</div>
        <h2 class="section-titulo">De cero a equipo en tres pasos</h2>

        <div class="pasos-grid">
          <div v-for="p in pasos" :key="p.n" class="paso">
            <div class="paso-num">{{ p.n }}</div>
            <div class="paso-content">
              <h3 class="paso-titulo">{{ p.titulo }}</h3>
              <p class="paso-desc">{{ p.desc }}</p>
            </div>
            <div class="paso-connector" />
          </div>
        </div>

        <!-- Algoritmo visual -->
        <div class="algoritmo-card">
          <div class="algo-titulo">¿Cómo calculamos la compatibilidad?</div>
          <div class="algo-formula">
            <div class="algo-factor">
              <span class="algo-factor-icon">🛡</span>
              <span class="algo-factor-nombre">Roles</span>
              <span class="algo-factor-peso">× 0.4</span>
            </div>
            <span class="algo-plus">+</span>
            <div class="algo-factor">
              <span class="algo-factor-icon">📊</span>
              <span class="algo-factor-nombre">Rango</span>
              <span class="algo-factor-peso">× 0.3</span>
            </div>
            <span class="algo-plus">+</span>
            <div class="algo-factor">
              <span class="algo-factor-icon">🕐</span>
              <span class="algo-factor-nombre">Horario</span>
              <span class="algo-factor-peso">× 0.2</span>
            </div>
            <span class="algo-plus">+</span>
            <div class="algo-factor">
              <span class="algo-factor-icon">🎯</span>
              <span class="algo-factor-nombre">Objetivo</span>
              <span class="algo-factor-peso">× 0.1</span>
            </div>
          </div>
          <p class="algo-nota">
            Los roles complementarios suman más que los idénticos. El rango cercano pesa fuerte.
            Los horarios que se solapan definen si realmente pueden jugar juntos.
          </p>
        </div>
      </div>
    </section>

    <!-- ── RANKING PREVIEW ───────────────────────────────────── -->
    <section class="section ranking-section">
      <div class="section-inner">
        <div class="section-label">Comunidad</div>
        <h2 class="section-titulo">Los mejores jugadores de RiftCampus</h2>

        <div class="ranking-preview">
          <div
            v-for="p in topPlayers"
            :key="p.pos"
            class="ranking-row"
            :class="{ 'rank-1': p.pos===1, 'rank-2': p.pos===2, 'rank-3': p.pos===3 }"
          >
            <span class="rank-pos">
              {{ p.pos === 1 ? '🥇' : p.pos === 2 ? '🥈' : '🥉' }}
            </span>
            <div class="rank-avatar">{{ p.summoner.charAt(0) }}</div>
            <div class="rank-info">
              <span class="rank-summoner">{{ p.summoner }}</span>
              <span class="rank-rango">{{ p.rango }}</span>
            </div>
            <span class="rank-puntos">{{ p.puntos }} pts</span>
          </div>
          <div class="ranking-cta">
            <router-link to="/register" class="btn-ghost-sm">
              Ver ranking completo →
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- ── CTA FINAL ─────────────────────────────────────────── -->
    <section class="section cta-section">
      <div class="cta-inner">
        <div class="cta-glow" aria-hidden="true" />
        <h2 class="cta-titulo">¿Listo para encontrar tu equipo?</h2>
        <p class="cta-desc">
          Creá tu perfil en menos de 2 minutos y empezá a conectar con
          jugadores universitarios que encajan con tu estilo de juego.
        </p>
        <router-link to="/register" class="btn-primary-lg">
          Crear cuenta gratis
        </router-link>
      </div>
    </section>

    <!-- ── FOOTER ────────────────────────────────────────────── -->
    <footer class="footer">
      <div class="footer-logo">
        <span>⚔</span>
        <span>RiftCampus</span>
      </div>
      <p class="footer-copy">
        Proyecto académico · Prácticas Profesionalizantes 2026
      </p>
    </footer>

  </div>
</template>

<style scoped>
/* ── Base ───────────────────────────────────────────────────── */
.landing {
  min-height: 100vh;
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: var(--font-body);
}

/* ── Nav ────────────────────────────────────────────────────── */
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 48px;
  background: rgba(9, 9, 15, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-dim);
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}
.nav-logo-icon { font-size: 20px; filter: drop-shadow(0 0 8px var(--gold)); }
.nav-logo-text {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 800;
  color: var(--gold);
}

.nav-actions { display: flex; align-items: center; gap: 12px; }

.btn-ghost {
  padding: 8px 18px;
  background: transparent;
  border: 1px solid var(--border-dim);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: border-color 0.2s, color 0.2s;
}
.btn-ghost:hover { border-color: var(--purple); color: var(--purple-lt); }

.btn-primary-sm {
  padding: 8px 18px;
  background: var(--purple);
  border: none;
  border-radius: var(--radius-md);
  color: #fff;
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s, box-shadow 0.2s;
}
.btn-primary-sm:hover {
  background: var(--purple-lt);
  box-shadow: 0 4px 16px var(--purple-glow);
}

/* ── Hero ───────────────────────────────────────────────────── */
.hero {
  position: relative;
  min-height: 92vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 80px 48px;
}

.hero-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.particle {
  position: absolute;
  border-radius: 50%;
  background: var(--gold);
  opacity: 0.15;
  animation: flotar linear infinite alternate;
}
@keyframes flotar {
  from { transform: translateY(0) scale(1); opacity: 0.1; }
  to   { transform: translateY(-20px) scale(1.3); opacity: 0.25; }
}

.hero-glow-left {
  position: absolute;
  width: 500px; height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(102,85,192,0.18) 0%, transparent 70%);
  left: -100px; top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}
.hero-glow-right {
  position: absolute;
  width: 400px; height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(200,170,110,0.1) 0%, transparent 70%);
  right: 100px; top: 30%;
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 80px;
  align-items: center;
}

/* Hero texto */
.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--purple-lt);
  background: rgba(102,85,192,0.12);
  border: 1px solid rgba(102,85,192,0.25);
  border-radius: 20px;
  padding: 5px 14px;
  margin-bottom: 24px;
}

.hero-titulo {
  font-family: var(--font-display);
  font-size: clamp(36px, 5vw, 58px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -1px;
  color: var(--text-primary);
  margin-bottom: 20px;
}
.hero-titulo-gold {
  color: var(--gold);
  position: relative;
}

.hero-desc {
  font-size: 16px;
  line-height: 1.7;
  color: var(--text-secondary);
  max-width: 480px;
  margin-bottom: 32px;
}

.hero-ctas {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.btn-primary-lg {
  padding: 14px 28px;
  background: var(--purple);
  border: none;
  border-radius: var(--radius-md);
  color: #fff;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
  display: inline-flex;
  align-items: center;
}
.btn-primary-lg:hover {
  background: var(--purple-lt);
  box-shadow: 0 6px 24px var(--purple-glow);
  transform: translateY(-1px);
}

.btn-outline-lg {
  padding: 14px 24px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  transition: border-color 0.2s, color 0.2s;
}
.btn-outline-lg:hover { border-color: var(--gold-dim); color: var(--gold); }

.hero-stats {
  display: flex;
  align-items: center;
  gap: 24px;
}
.stat { display: flex; flex-direction: column; gap: 2px; }
.stat-num {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 800;
  color: var(--gold);
}
.stat-label { font-size: 11px; color: var(--text-muted); }
.stat-divider { width: 1px; height: 36px; background: var(--border-dim); }

/* Hero mockup */
.hero-mockup {
  display: flex;
  justify-content: center;
  filter: drop-shadow(0 24px 48px rgba(0,0,0,0.5));
}

.mockup-phone {
  width: 280px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0;
  box-shadow: 0 0 60px rgba(102,85,192,0.15);
}

.mockup-header {
  padding: 14px 18px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-dim);
}
.mockup-logo {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 800;
  color: var(--gold);
}

.mockup-card {
  padding: 20px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.mockup-avatar {
  width: 72px; height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--purple), var(--purple-lt));
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-size: 28px; font-weight: 800; color: #fff;
  border: 2px solid var(--gold-dim);
}

.mockup-compat {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.mockup-compat-pct {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
  color: var(--green);
}
.mockup-compat-label { font-size: 11px; color: var(--text-muted); }

.mockup-info { text-align: center; }
.mockup-summoner {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--gold);
}
.mockup-sub { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }

.mockup-tags { display: flex; gap: 6px; }
.mockup-tag {
  font-size: 10px;
  padding: 3px 9px;
  border-radius: 20px;
  background: var(--bg-surface);
  border: 1px solid var(--border-dim);
  color: var(--text-secondary);
}

.mockup-horario {
  font-size: 11px;
  color: var(--blue);
  background: rgba(19,165,222,0.08);
  border: 1px solid rgba(19,165,222,0.15);
  border-radius: var(--radius-sm);
  padding: 4px 12px;
}

.mockup-btns {
  display: flex;
  gap: 20px;
  margin-top: 4px;
}
.mockup-btn-no, .mockup-btn-si {
  width: 48px; height: 48px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
  cursor: default;
}
.mockup-btn-no { background: rgba(228,45,41,0.1); color: var(--red); border: 1.5px solid var(--red); }
.mockup-btn-si { background: rgba(62,191,144,0.1); color: var(--green); border: 1.5px solid var(--green); }

.mockup-match-badge {
  margin: 0 18px 18px;
  padding: 10px;
  text-align: center;
  background: linear-gradient(90deg, rgba(102,85,192,0.2), rgba(200,170,110,0.15));
  border: 1px solid var(--gold-dim);
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  color: var(--gold);
  animation: pulsar 2s ease-in-out infinite alternate;
}
@keyframes pulsar {
  from { opacity: 0.7; }
  to   { opacity: 1; box-shadow: 0 0 16px rgba(200,170,110,0.2); }
}

/* ── Secciones genéricas ────────────────────────────────────── */
.section { padding: 96px 48px; }
.section-inner { max-width: 1000px; margin: 0 auto; }

.section-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--purple-lt);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 12px;
}

.section-titulo {
  font-family: var(--font-display);
  font-size: clamp(24px, 3.5vw, 36px);
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 52px;
  max-width: 600px;
  line-height: 1.2;
}

/* ── Features ───────────────────────────────────────────────── */
.features-section { background: var(--bg-surface); }

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.feature-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: border-color 0.2s, transform 0.2s;
}
.feature-card:hover { border-color: var(--purple); transform: translateY(-3px); }

.feature-icon { font-size: 28px; }
.feature-titulo {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}
.feature-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }

/* ── Cómo funciona ──────────────────────────────────────────── */
.pasos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  margin-bottom: 48px;
  position: relative;
}

.paso {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 32px 0 0;
  position: relative;
}

.paso-num {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 800;
  color: var(--border);
  line-height: 1;
}

.paso-titulo {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--gold);
}

.paso-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }

.paso-connector {
  position: absolute;
  top: 20px;
  right: 0;
  width: 32px;
  height: 1px;
  background: linear-gradient(90deg, var(--border-dim), transparent);
}
.paso:last-child .paso-connector { display: none; }

/* Algoritmo */
.algoritmo-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 32px 36px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.algo-titulo {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.algo-formula {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.algo-factor {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: var(--bg-surface);
  border: 1px solid var(--border-dim);
  border-radius: var(--radius-md);
  padding: 12px 20px;
  min-width: 90px;
}
.algo-factor-icon { font-size: 20px; }
.algo-factor-nombre { font-size: 12px; color: var(--text-secondary); font-weight: 500; }
.algo-factor-peso {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 800;
  color: var(--purple-lt);
}
.algo-plus { font-size: 20px; color: var(--text-muted); }
.algo-nota { font-size: 13px; color: var(--text-muted); line-height: 1.6; }

/* ── Ranking preview ────────────────────────────────────────── */
.ranking-section { background: var(--bg-surface); }

.ranking-preview {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  max-width: 560px;
}

.ranking-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-dim);
  transition: background 0.2s;
}
.ranking-row:hover { background: var(--bg-hover); }
.rank-1 { background: rgba(200,170,110,0.06); }
.rank-2 { background: rgba(180,180,180,0.03); }
.rank-3 { background: rgba(180,110,60,0.03); }

.rank-pos { font-size: 20px; width: 32px; text-align: center; }

.rank-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: var(--purple);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-size: 16px; font-weight: 800; color: #fff;
}

.rank-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.rank-summoner {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}
.rank-rango { font-size: 11px; color: var(--text-muted); }

.rank-puntos {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 800;
  color: var(--gold);
}

.ranking-cta {
  padding: 16px 24px;
  text-align: center;
}

.btn-ghost-sm {
  font-size: 13px;
  color: var(--purple-lt);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}
.btn-ghost-sm:hover { color: var(--gold); }

/* ── CTA Final ──────────────────────────────────────────────── */
.cta-section { padding: 96px 48px; }

.cta-inner {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.cta-glow {
  position: absolute;
  width: 400px; height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(102,85,192,0.12) 0%, transparent 70%);
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.cta-titulo {
  font-family: var(--font-display);
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 800;
  color: var(--gold);
  line-height: 1.15;
  position: relative;
}

.cta-desc {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.7;
  position: relative;
}

/* ── Footer ─────────────────────────────────────────────────── */
.footer {
  padding: 32px 48px;
  border-top: 1px solid var(--border-dim);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--gold-dim);
}

.footer-copy { font-size: 12px; color: var(--text-muted); }

/* ── Responsive ─────────────────────────────────────────────── */
@media (max-width: 768px) {
  .nav { padding: 14px 20px; }
  .hero { padding: 60px 20px; min-height: auto; }
  .hero-content { grid-template-columns: 1fr; gap: 48px; }
  .hero-mockup { display: none; }
  .section { padding: 64px 20px; }
  .pasos-grid { grid-template-columns: 1fr; gap: 32px; }
  .paso-connector { display: none; }
  .algo-formula { justify-content: center; }
  .footer { padding: 24px 20px; }
}
</style>
