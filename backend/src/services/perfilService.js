import pool from '../config/db.js'
import fs from 'fs'

const RANGOS_VALIDOS   = ['hierro','bronce','plata','oro','platino','esmeralda','diamante','maestro','gran_maestro','challenger']
const ROLES_VALIDOS    = ['top','jungla','mid','adc','support']
const OBJETIVOS_VALIDOS = ['casual','rankear','competitivo']

// ── Obtener perfil por userId ────────────────────────────────
export async function getPerfilByUserId(userId) {
  const [rows] = await pool.query(
    `SELECT u.id_usuario, u.nombre, u.email,
            p.id_perfil, p.summoner_name, p.rango,
            p.roles_preferidos, p.descripcion, p.avatar_url, p.objetivo,
            tr.puntos_reputacion, tr.promedio_resenas, tr.partidas_jugadas
     FROM   usuarios u
     LEFT JOIN perfil p ON p.id_usuario = u.id_usuario
     LEFT JOIN tabla_ranking tr ON tr.id_usuario = u.id_usuario AND tr.temporada = 1
     WHERE  u.id_usuario = ?`,
    [userId]
  )
  if (!rows[0]) {
    const err = new Error('Usuario no encontrado.')
    err.status = 404
    throw err
  }
  return {
    ...rows[0],
    roles_preferidos: rows[0].roles_preferidos
      ? JSON.parse(rows[0].roles_preferidos)
      : []
  }
}

// ── Crear o actualizar perfil ────────────────────────────────
export async function upsertPerfil(userId, datos, archivoAvatar) {
  const { summoner_name, rango, objetivo, descripcion, avatar_url_actual } = datos

  // Validar campos obligatorios
  if (!summoner_name || !rango || !objetivo) {
    const err = new Error('Summoner name, rango y objetivo son obligatorios.')
    err.status = 400
    throw err
  }
  if (!RANGOS_VALIDOS.includes(rango)) {
    const err = new Error('Rango inválido.')
    err.status = 400
    throw err
  }
  if (!OBJETIVOS_VALIDOS.includes(objetivo)) {
    const err = new Error('Objetivo inválido.')
    err.status = 400
    throw err
  }

  // Parsear roles
  let roles = []
  try {
    roles = typeof datos.roles_preferidos === 'string'
      ? JSON.parse(datos.roles_preferidos)
      : datos.roles_preferidos
  } catch {
    const err = new Error('Formato de roles inválido.')
    err.status = 400
    throw err
  }

  if (!Array.isArray(roles) || roles.length === 0) {
    const err = new Error('Seleccioná al menos un rol.')
    err.status = 400
    throw err
  }
  if (roles.some(r => !ROLES_VALIDOS.includes(r))) {
    const err = new Error('Uno o más roles son inválidos.')
    err.status = 400
    throw err
  }

  // Manejar avatar
  let avatarUrl = avatar_url_actual || null
  if (archivoAvatar) {
    if (avatarUrl) {
      const oldPath = `.${avatarUrl}`
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
    }
    avatarUrl = `/uploads/avatars/${archivoAvatar.filename}`
  }

  // Upsert
  const [existing] = await pool.query(
    'SELECT id_perfil FROM perfil WHERE id_usuario = ?', [userId]
  )

  if (existing.length > 0) {
    await pool.query(
      `UPDATE perfil
       SET summoner_name=?, rango=?, roles_preferidos=?, descripcion=?, avatar_url=?, objetivo=?
       WHERE id_usuario=?`,
      [summoner_name, rango, JSON.stringify(roles), descripcion || null, avatarUrl, objetivo, userId]
    )
  } else {
    await pool.query(
      `INSERT INTO perfil (id_usuario, summoner_name, rango, roles_preferidos, descripcion, avatar_url, objetivo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, summoner_name, rango, JSON.stringify(roles), descripcion || null, avatarUrl, objetivo]
    )
  }

  return getPerfilByUserId(userId)
}
