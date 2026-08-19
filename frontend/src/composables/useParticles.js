import { onMounted, onUnmounted } from 'vue'

/**

 * @param {import('vue').Ref<HTMLCanvasElement|null>} canvasRef
 * @param {object} opts
 */
export function useParticles(canvasRef, opts = {}) {
  const {
    density = 90,          // partículas por cada 1.000.000 px²
    maxParticles = 220,
    colors = ['#c8aa6e', '#e2c98f', '#8B7EE8'],
    minRadius = 0.6,
    maxRadius = 2.2,
    speed = 0.18,
    drift = true,           // leve movimiento horizontal tipo "polvo flotando"
    glow = true,
    connect = false,        // líneas sutiles entre partículas cercanas (constelación)
    connectDistance = 110,
  } = opts

  let ctx = null
  let raf = null
  let particles = []
  let w = 0, h = 0, dpr = 1
  let running = false
  let ro = null

  const reduced = typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  function rand(min, max) { return Math.random() * (max - min) + min }

  function makeParticle() {
    return {
      x: rand(0, w),
      y: rand(0, h),
      r: rand(minRadius, maxRadius),
      vx: drift ? rand(-speed, speed) : 0,
      vy: rand(-speed * 1.4, -speed * 0.4),
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: rand(0.25, 0.85),
      pulse: rand(0, Math.PI * 2),
      pulseSpeed: rand(0.006, 0.018),
    }
  }

  function computeCount() {
    const area = w * h
    const base = Math.round((area / 1_000_000) * density)
    const target = reduced ? Math.round(base * 0.25) : base
    return Math.min(target, reduced ? 40 : maxParticles)
  }

  function resize() {
    const canvas = canvasRef.value
    if (!canvas) return
    const rect = canvas.parentElement?.getBoundingClientRect() || canvas.getBoundingClientRect()
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = Math.max(1, Math.floor(rect.width))
    h = Math.max(1, Math.floor(rect.height))
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const target = computeCount()
    if (particles.length < target) {
      while (particles.length < target) particles.push(makeParticle())
    } else {
      particles.length = target
    }
  }

  function step() {
    if (!ctx) return
    ctx.clearRect(0, 0, w, h)

    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy
      p.pulse += p.pulseSpeed

      if (p.y < -10) { p.y = h + 10; p.x = rand(0, w) }
      if (p.x < -10) p.x = w + 10
      if (p.x > w + 10) p.x = -10

      const flicker = (Math.sin(p.pulse) + 1) / 2
      const a = p.alpha * (0.55 + flicker * 0.45)

      ctx.beginPath()
      if (glow) {
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4)
        grad.addColorStop(0, hexToRgba(p.color, a))
        grad.addColorStop(1, hexToRgba(p.color, 0))
        ctx.fillStyle = grad
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2)
      } else {
        ctx.fillStyle = hexToRgba(p.color, a)
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      }
      ctx.fill()
    }

    if (connect) {
      ctx.lineWidth = 0.6
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < connectDistance) {
            ctx.strokeStyle = hexToRgba('#c8aa6e', (1 - dist / connectDistance) * 0.12)
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }
    }

    if (running) raf = requestAnimationFrame(step)
  }

  function hexToRgba(hex, a) {
    const c = hex.replace('#', '')
    const r = parseInt(c.substring(0, 2), 16)
    const g = parseInt(c.substring(2, 4), 16)
    const b = parseInt(c.substring(4, 6), 16)
    return `rgba(${r},${g},${b},${a})`
  }

  function start() {
    if (running) return
    running = true
    raf = requestAnimationFrame(step)
  }

  function stop() {
    running = false
    if (raf) cancelAnimationFrame(raf)
    raf = null
  }

  function handleVisibility() {
    if (document.hidden) stop()
    else start()
  }

  onMounted(() => {
    const canvas = canvasRef.value
    if (!canvas) return
    ctx = canvas.getContext('2d')
    resize()
    start()

    ro = new ResizeObserver(() => resize())
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    document.addEventListener('visibilitychange', handleVisibility)
  })

  onUnmounted(() => {
    stop()
    ro?.disconnect()
    document.removeEventListener('visibilitychange', handleVisibility)
  })

  return { start, stop }
}
