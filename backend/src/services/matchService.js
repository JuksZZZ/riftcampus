import pool from '../config/db.js'

export async function getMatches(userId, { page = 1, limit = 10 }) {
  const pageNum  = Math.max(1, parseInt(page) || 1)
  const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10))
  const offset   = (pageNum - 1) * limitNum

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) as total FROM \`match\`
     WHERE (id_usuario_1 = ? OR id_usuario_2 = ?) AND estado = 'activo'`,
    [userId, userId]
  )

  const [rows] = await pool.query(
    `SELECT
       m.id_match, m.compatibilidad, m.fecha, m.estado,
       IF(m.id_usuario_1 = ?, m.id_usuario_2, m.id_usuario_1) AS id_otro,
       u.nombre,
       p.summoner_name, p.rango, p.roles_preferidos, p.avatar_url, p.objetivo
     FROM \`match\` m
     JOIN usuarios u ON u.id_usuario = IF(m.id_usuario_1 = ?, m.id_usuario_2, m.id_usuario_1)
     JOIN perfil   p ON p.id_usuario = u.id_usuario
     WHERE (m.id_usuario_1 = ? OR m.id_usuario_2 = ?)
       AND m.estado = 'activo'
     ORDER BY m.fecha DESC
     LIMIT ? OFFSET ?`,
    [userId, userId, userId, userId, limitNum, offset]
  )

  return {
    matches: rows.map(r => ({ ...r, roles_preferidos: JSON.parse(r.roles_preferidos || '[]') })),
    paginacion: { total, pagina_actual: pageNum, paginas_totales: Math.ceil(total / limitNum), por_pagina: limitNum }
  }
}