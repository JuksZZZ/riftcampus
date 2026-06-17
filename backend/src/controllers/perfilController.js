import pool from '../config/db.js'
import fs from 'fs'

// GET /api/perfil/:id?  (sin id = perfil propio)
export async function getPerfil(req, res) {
  const userId = req.params.id ? parseInt(req.params.id) : req.user.sub

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

  if (!rows[0]) return res.status(404).json({ error: 'Usuario no encontrado.' })

  const perfil = {
    ...rows[0],
    roles_preferidos: rows[0].roles_preferidos
      ? JSON.parse(rows[0].roles_preferidos)
      : []
  }

  res.json({ perfil })
}

// POST /api/perfil  (crear o actualizar - upsert)
export async function upsertPerfil(req, res) {
  const userId = req.user.sub
  const { summoner_name, rango, roles_preferidos, descripcion, objetivo } = req.body

  // Validaciones
  if (!summoner_name || !rango || !objetivo)
    return res.status(422).json({ error: 'Summoner name, rango y objetivo son obligatorios.' })

  const rolesValidos = ['top', 'jungla', 'mid', 'adc', 'support']
  let roles = []
  try {
    roles = typeof roles_preferidos === 'string'
      ? JSON.parse(roles_preferidos)
      : roles_preferidos
  } catch {
    return res.status(422).json({ error: 'Formato de roles inválido.' })
  }

  if (!Array.isArray(roles) || roles.length === 0)
    return res.status(422).json({ error: 'Seleccioná al menos un rol.' })

  if (roles.some(r => !rolesValidos.includes(r)))
    return res.status(422).json({ error: 'Rol inválido.' })

  // Si se subió un avatar nuevo, construir la URL
  let avatarUrl = req.body.avatar_url_actual || null
  if (req.file) {
    // Borrar avatar anterior si existe
    if (avatarUrl) {
      const oldPath = `.${avatarUrl}`
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
    }
    avatarUrl = `/uploads/avatars/${req.file.filename}`
  }

  // Verificar si ya tiene perfil
  const [existing] = await pool.query(
    'SELECT id_perfil FROM perfil WHERE id_usuario = ?', [userId]
  )

  if (existing.length > 0) {
    // UPDATE
    await pool.query(
      `UPDATE perfil
       SET summoner_name = ?, rango = ?, roles_preferidos = ?,
           descripcion = ?, avatar_url = ?, objetivo = ?
       WHERE id_usuario = ?`,
      [summoner_name, rango, JSON.stringify(roles), descripcion || null, avatarUrl, objetivo, userId]
    )
  } else {
    // INSERT
    await pool.query(
      `INSERT INTO perfil (id_usuario, summoner_name, rango, roles_preferidos, descripcion, avatar_url, objetivo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, summoner_name, rango, JSON.stringify(roles), descripcion || null, avatarUrl, objetivo]
    )
  }

  // Devolver perfil actualizado
  const [updated] = await pool.query(
    `SELECT * FROM perfil WHERE id_usuario = ?`, [userId]
  )

  const perfil = {
    ...updated[0],
    roles_preferidos: JSON.parse(updated[0].roles_preferidos)
  }

  res.json({ message: 'Perfil guardado correctamente.', perfil })
}
