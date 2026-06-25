import pool from '../config/db.js'

export async function getLeaderboard({ page = 1, limit = 10 }) {
  const pageNum  = Math.max(1, parseInt(page) || 1)
  const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10))
  const offset   = (pageNum - 1) * limitNum

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) as total FROM tabla_ranking tr
     JOIN usuarios u ON u.id_usuario = tr.id_usuario
     JOIN perfil   p ON p.id_usuario = u.id_usuario
     WHERE tr.temporada = 1 AND u.estado = 'activo'`
  )

  const [rows] = await pool.query(
    `SELECT tr.id_ranking, tr.puntos_reputacion, tr.promedio_resenas, tr.partidas_jugadas,
            u.id_usuario, u.nombre,
            p.summoner_name, p.rango, p.avatar_url, p.objetivo, p.roles_preferidos
     FROM tabla_ranking tr
     JOIN usuarios u ON u.id_usuario = tr.id_usuario
     JOIN perfil   p ON p.id_usuario = u.id_usuario
     WHERE tr.temporada = 1 AND u.estado = 'activo'
     ORDER BY tr.puntos_reputacion DESC
     LIMIT ? OFFSET ?`,
    [limitNum, offset]
  )

  return {
    ranking: rows.map((r, idx) => ({ ...r, roles_preferidos: JSON.parse(r.roles_preferidos || '[]'), posicion: offset + idx + 1 })),
    paginacion: { total, pagina_actual: pageNum, paginas_totales: Math.ceil(total / limitNum), por_pagina: limitNum }
  }
}