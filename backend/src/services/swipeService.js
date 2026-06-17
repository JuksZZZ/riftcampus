import pool from '../config/db.js'

const RANGOS = ['hierro','bronce','plata','oro','platino','esmeralda','diamante','maestro','gran_maestro','challenger']

// ── Algoritmo de compatibilidad ──────────────────────────────
export function calcularCompatibilidad(perfilA, perfilB) {
  const rolesA = JSON.parse(perfilA.roles_preferidos || '[]')
  const rolesB = JSON.parse(perfilB.roles_preferidos || '[]')
  const comunes = rolesA.filter(r => rolesB.includes(r)).length
  const total   = new Set([...rolesA, ...rolesB]).size
  const scoreRol = total > 0 ? comunes / total : 0

  const idxA = RANGOS.indexOf(perfilA.rango)
  const idxB = RANGOS.indexOf(perfilB.rango)
  const scoreRango = 1 - Math.abs(idxA - idxB) / (RANGOS.length - 1)

  const scoreObjetivo = perfilA.objetivo === perfilB.objetivo ? 1 : 0

  return Math.round((scoreRol * 0.40 + scoreRango * 0.30 + scoreObjetivo * 0.30) * 100)
}

// ── Obtener candidatos con paginación ────────────────────────
export async function getCandidatos(userId, { rango, rol, objetivo, page = 1, limit = 10 }) {
  // Validar paginación
  const pageNum  = Math.max(1, parseInt(page) || 1)
  const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10))
  const offset   = (pageNum - 1) * limitNum

  // Perfil propio
  const [miPerfil] = await pool.query(
    'SELECT * FROM perfil WHERE id_usuario = ?', [userId]
  )
  if (!miPerfil[0]) {
    const err = new Error('Completá tu perfil antes de explorar.')
    err.status = 400
    throw err
  }

  // IDs ya vistos
  const [vistos] = await pool.query(
    'SELECT id_swiped FROM swipe WHERE id_swiper = ?', [userId]
  )
  const idsExcluir = [...vistos.map(v => v.id_swiped), userId]
  const placeholders = idsExcluir.map(() => '?').join(',')

  // Construir filtros dinámicos
  const filtros = []
  const params  = [...idsExcluir]

  if (rango) {
    filtros.push('AND p.rango = ?')
    params.push(rango)
  }
  if (objetivo) {
    filtros.push('AND p.objetivo = ?')
    params.push(objetivo)
  }

  // Query para contar el total (sin LIMIT/OFFSET)
  const [countResult] = await pool.query(
    `SELECT COUNT(*) as total
     FROM usuarios u
     JOIN perfil p ON p.id_usuario = u.id_usuario
     WHERE u.estado = 'activo'
     AND u.id_usuario NOT IN (${placeholders})
     ${filtros.join(' ')}`,
    params
  )
  let total = countResult[0].total

  // Query paginada
  const [candidatos] = await pool.query(
    `SELECT u.id_usuario, u.nombre,
            p.summoner_name, p.rango, p.roles_preferidos,
            p.descripcion, p.avatar_url, p.objetivo
     FROM   usuarios u
     JOIN   perfil p ON p.id_usuario = u.id_usuario
     WHERE  u.estado = 'activo'
     AND    u.id_usuario NOT IN (${placeholders})
     ${filtros.join(' ')}
     ORDER BY RAND()
     LIMIT ? OFFSET ?`,
    [...params, limitNum, offset]
  )

  // Calcular compatibilidad y filtrar por rol si aplica
  let resultado = candidatos.map(c => ({
    ...c,
    roles_preferidos: JSON.parse(c.roles_preferidos || '[]'),
    compatibilidad: calcularCompatibilidad(miPerfil[0], c)
  }))

  if (rol) {
    resultado = resultado.filter(c => c.roles_preferidos.includes(rol))
    total = resultado.length // reajustar total tras filtro en memoria
  }

  resultado.sort((a, b) => b.compatibilidad - a.compatibilidad)

  return {
    candidatos: resultado,
    paginacion: {
      total,
      pagina_actual:  pageNum,
      paginas_totales: Math.ceil(total / limitNum),
      por_pagina:     limitNum
    }
  }
}

// ── Registrar swipe y detectar match ────────────────────────
export async function registrarSwipe(swiperId, idSwiped, accion) {
  if (swiperId === parseInt(idSwiped)) {
    const err = new Error('No podés swipearte a vos mismo.')
    err.status = 400
    throw err
  }

  await pool.query(
    'INSERT IGNORE INTO swipe (id_swiper, id_swiped, accion) VALUES (?, ?, ?)',
    [swiperId, idSwiped, accion]
  )

  if (accion !== 'like') return { es_match: false }

  // Verificar match mutuo
  const [contraSwipe] = await pool.query(
    `SELECT id_swipe FROM swipe
     WHERE id_swiper = ? AND id_swiped = ? AND accion = 'like'`,
    [idSwiped, swiperId]
  )

  if (contraSwipe.length === 0) return { es_match: false }

  // Calcular compatibilidad
  const [perfilA] = await pool.query('SELECT * FROM perfil WHERE id_usuario = ?', [swiperId])
  const [perfilB] = await pool.query('SELECT * FROM perfil WHERE id_usuario = ?', [idSwiped])
  const compatibilidad = calcularCompatibilidad(perfilA[0], perfilB[0])

  // Crear match si no existe
  const [existeMatch] = await pool.query(
    `SELECT id_match FROM \`match\`
     WHERE (id_usuario_1 = ? AND id_usuario_2 = ?)
        OR (id_usuario_1 = ? AND id_usuario_2 = ?)`,
    [swiperId, idSwiped, idSwiped, swiperId]
  )

  if (existeMatch.length === 0) {
    await pool.query(
      'INSERT INTO `match` (id_usuario_1, id_usuario_2, compatibilidad) VALUES (?, ?, ?)',
      [swiperId, idSwiped, compatibilidad]
    )
  }

  // Datos del otro usuario para el popup
  const [otro] = await pool.query(
    `SELECT u.nombre, p.summoner_name, p.avatar_url, p.rango
     FROM usuarios u JOIN perfil p ON p.id_usuario = u.id_usuario
     WHERE u.id_usuario = ?`,
    [idSwiped]
  )

  return { es_match: true, match: { ...otro[0], compatibilidad } }
}
