import pool from '../config/db.js'

// ── Algoritmo de compatibilidad ──────────────────────────────
// Rol 40% | Rango 30% | Objetivo 30%

const RANGOS = ['hierro','bronce','plata','oro','platino','esmeralda','diamante','maestro','gran_maestro','challenger']

function calcularCompatibilidad(perfilA, perfilB) {
  // Rol: % de roles en común
  const rolesA = JSON.parse(perfilA.roles_preferidos || '[]')
  const rolesB = JSON.parse(perfilB.roles_preferidos || '[]')
  const rolesComunes = rolesA.filter(r => rolesB.includes(r)).length
  const totalRoles   = new Set([...rolesA, ...rolesB]).size
  const scoreRol     = totalRoles > 0 ? (rolesComunes / totalRoles) : 0

  // Rango: cercanía en la escala (0 = mismo rango, 9 = máxima diferencia)
  const idxA = RANGOS.indexOf(perfilA.rango)
  const idxB = RANGOS.indexOf(perfilB.rango)
  const diff = Math.abs(idxA - idxB)
  const scoreRango = 1 - (diff / (RANGOS.length - 1))

  // Objetivo: exactamente igual = 1, distinto = 0
  const scoreObjetivo = perfilA.objetivo === perfilB.objetivo ? 1 : 0

  const total = (scoreRol * 0.40) + (scoreRango * 0.30) + (scoreObjetivo * 0.30)
  return Math.round(total * 100)
}

// ── GET /api/swipe/candidatos ────────────────────────────────
// Devuelve jugadores con perfil que el usuario no haya visto aún
export async function getCandidatos(req, res) {
  const userId = req.user.sub
  const { rango, rol, objetivo, modo } = req.query

  // Perfil propio
  const [miPerfil] = await pool.query(
    'SELECT * FROM perfil WHERE id_usuario = ?', [userId]
  )
  if (!miPerfil[0]) {
    return res.status(400).json({ error: 'Completá tu perfil antes de explorar.' })
  }

  // IDs ya vistos (swipeados)
  const [vistos] = await pool.query(
    'SELECT id_swiped FROM swipe WHERE id_swiper = ?', [userId]
  )
  const idsVistos = vistos.map(v => v.id_swiped)
  idsVistos.push(userId) // excluir a sí mismo

  const placeholders = idsVistos.map(() => '?').join(',')
  const excludeClause = idsVistos.length > 0
    ? `AND u.id_usuario NOT IN (${placeholders})`
    : ''

  // Construir filtros opcionales
  const filtros = []
  const params  = [...idsVistos]

  if (rango) {
    filtros.push('AND p.rango = ?')
    params.push(rango)
  }
  if (objetivo) {
    filtros.push('AND p.objetivo = ?')
    params.push(objetivo)
  }

  const [candidatos] = await pool.query(
    `SELECT u.id_usuario, u.nombre,
            p.summoner_name, p.rango, p.roles_preferidos,
            p.descripcion, p.avatar_url, p.objetivo
     FROM   usuarios u
     JOIN   perfil p ON p.id_usuario = u.id_usuario
     WHERE  u.estado = 'activo'
     ${excludeClause}
     ${filtros.join(' ')}
     ORDER BY RAND()
     LIMIT 50`,
    params
  )

  // Calcular compatibilidad para cada candidato
  let resultado = candidatos.map(c => ({
    ...c,
    roles_preferidos: JSON.parse(c.roles_preferidos || '[]'),
    compatibilidad: calcularCompatibilidad(miPerfil[0], c)
  }))

  // Filtrar por rol si se especificó
  if (rol) {
    resultado = resultado.filter(c => c.roles_preferidos.includes(rol))
  }

  // Ordenar por compatibilidad descendente
  resultado.sort((a, b) => b.compatibilidad - a.compatibilidad)

  res.json({ candidatos: resultado })
}

// ── POST /api/swipe ──────────────────────────────────────────
export async function hacerSwipe(req, res) {
  const swiperId = req.user.sub
  const { id_swiped, accion } = req.body

  if (!id_swiped || !['like','dislike'].includes(accion)) {
    return res.status(422).json({ error: 'Datos inválidos.' })
  }
  if (swiperId === parseInt(id_swiped)) {
    return res.status(422).json({ error: 'No podés swipearte a vos mismo.' })
  }

  // Insertar swipe (ignorar si ya existe)
  await pool.query(
    `INSERT IGNORE INTO swipe (id_swiper, id_swiped, accion)
     VALUES (?, ?, ?)`,
    [swiperId, id_swiped, accion]
  )

  // Si fue like, verificar si hay match mutuo
  let esMatch = false
  let matchData = null

  if (accion === 'like') {
    const [contraSwipe] = await pool.query(
      `SELECT id_swipe FROM swipe
       WHERE id_swiper = ? AND id_swiped = ? AND accion = 'like'`,
      [id_swiped, swiperId]
    )

    if (contraSwipe.length > 0) {
      // ¡Match mutuo! Calcular compatibilidad
      const [perfilA] = await pool.query('SELECT * FROM perfil WHERE id_usuario = ?', [swiperId])
      const [perfilB] = await pool.query('SELECT * FROM perfil WHERE id_usuario = ?', [id_swiped])

      const compatibilidad = calcularCompatibilidad(perfilA[0], perfilB[0])

      // Crear match si no existe
      const [existeMatch] = await pool.query(
        `SELECT id_match FROM \`match\`
         WHERE (id_usuario_1 = ? AND id_usuario_2 = ?)
            OR (id_usuario_1 = ? AND id_usuario_2 = ?)`,
        [swiperId, id_swiped, id_swiped, swiperId]
      )

      if (existeMatch.length === 0) {
        await pool.query(
          `INSERT INTO \`match\` (id_usuario_1, id_usuario_2, compatibilidad)
           VALUES (?, ?, ?)`,
          [swiperId, id_swiped, compatibilidad]
        )
      }

      // Datos del match para el popup
      const [perfilOtro] = await pool.query(
        `SELECT u.nombre, p.summoner_name, p.avatar_url, p.rango
         FROM usuarios u JOIN perfil p ON p.id_usuario = u.id_usuario
         WHERE u.id_usuario = ?`,
        [id_swiped]
      )

      esMatch = true
      matchData = { ...perfilOtro[0], compatibilidad }
    }
  }

  res.json({ ok: true, es_match: esMatch, match: matchData })
}
