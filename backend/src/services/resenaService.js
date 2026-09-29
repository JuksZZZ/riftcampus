import pool from '../config/db.js'

// Lista básica de términos a bloquear (RN08). Es un filtro simple:
// para producción real conviene una librería dedicada, pero cumple
// el requisito de "rechazar lenguaje inapropiado antes de guardar".
const PALABRAS_PROHIBIDAS = ['boludo', 'pelotudo', 'idiota', 'basura', 'inutil']

function contieneLenguajeInapropiado(texto) {
  if (!texto) return false
  const normalizado = texto.toLowerCase()
  return PALABRAS_PROHIBIDAS.some(palabra => normalizado.includes(palabra))
}

// ── Crear reseña (RF13, RN07, RN08) ──────────────────────────────────
export async function crearResena(emisorId, { id_match, id_receptor, puntaje, contenido }) {
  if (!id_match || !id_receptor || !puntaje) {
    const err = new Error('id_match, id_receptor y puntaje son obligatorios.')
    err.status = 400
    throw err
  }

  const puntajeNum = parseInt(puntaje)
  if (isNaN(puntajeNum) || puntajeNum < 1 || puntajeNum > 5) {
    const err = new Error('El puntaje debe ser un número entre 1 y 5.')
    err.status = 400
    throw err
  }

  if (contieneLenguajeInapropiado(contenido)) {
    const err = new Error('El comentario contiene lenguaje inapropiado.')
    err.status = 400
    throw err
  }

  // RN07: el match debe existir y el emisor debe ser parte de él
  const [matches] = await pool.query(
    `SELECT id_usuario_1, id_usuario_2 FROM \`match\` WHERE id_match = ?`,
    [id_match]
  )
  const match = matches[0]
  if (!match) {
    const err = new Error('El match indicado no existe.')
    err.status = 404
    throw err
  }
  const participantes = [match.id_usuario_1, match.id_usuario_2]
  if (!participantes.includes(emisorId)) {
    const err = new Error('No formás parte de este match.')
    err.status = 403
    throw err
  }
  if (!participantes.includes(parseInt(id_receptor))) {
    const err = new Error('El receptor indicado no forma parte de este match.')
    err.status = 400
    throw err
  }
  if (parseInt(id_receptor) === emisorId) {
    const err = new Error('No podés calificarte a vos mismo.')
    err.status = 400
    throw err
  }

  try {
    await pool.query(
      `INSERT INTO resena (id_emisor, id_receptor, id_match, puntaje, contenido)
       VALUES (?, ?, ?, ?, ?)`,
      [emisorId, id_receptor, id_match, puntajeNum, contenido || null]
    )
  } catch (e) {
    // uq_resena_emisor_match salta si ya existe reseña de este emisor para este match
    if (e.code === 'ER_DUP_ENTRY') {
      const err = new Error('Ya dejaste una reseña para este match.')
      err.status = 409
      throw err
    }
    throw e
  }

  await actualizarReputacion(id_receptor)

  return { message: 'Reseña guardada correctamente.' }
}

// ── Recalcular reputación del receptor (RN11) ────────────────────────
async function actualizarReputacion(userId) {
  const [[{ promedio }]] = await pool.query(
    `SELECT COALESCE(AVG(puntaje), 0) AS promedio FROM resena WHERE id_receptor = ?`,
    [userId]
  )
  const [[{ cantidadMatches }]] = await pool.query(
    `SELECT COUNT(*) AS cantidadMatches FROM \`match\`
     WHERE (id_usuario_1 = ? OR id_usuario_2 = ?) AND estado = 'activo'`,
    [userId, userId]
  )

  const puntosReputacion = Math.round(promedio * 100) + cantidadMatches * 10

  await pool.query(
    `UPDATE tabla_ranking
     SET promedio_resenas = ?, partidas_jugadas = ?, puntos_reputacion = ?,
         ultima_actualizacion = NOW()
     WHERE id_usuario = ? AND temporada = 1`,
    [promedio, cantidadMatches, puntosReputacion, userId]
  )
}

// ── Reseñas recibidas por un usuario (RF14) ──────────────────────────
export async function getResenasRecibidas(userId) {
  const [rows] = await pool.query(
    `SELECT r.id_resena, r.puntaje, r.contenido, r.fecha,
            u.id_usuario AS id_emisor, u.nombre, p.summoner_name, p.avatar_url
     FROM resena r
     JOIN usuarios u ON u.id_usuario = r.id_emisor
     LEFT JOIN perfil p ON p.id_usuario = u.id_usuario
     WHERE r.id_receptor = ?
     ORDER BY r.fecha DESC`,
    [userId]
  )
  return rows
}
