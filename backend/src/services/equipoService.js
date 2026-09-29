import pool from '../config/db.js'

const ROLES_VALIDOS = ['top', 'jungla', 'mid', 'adc', 'support']

// ── Crear equipo (RF15) ──────────────────────────────────────────────
export async function crearEquipo(userId, { nombre_equipo, roles_buscados, max_miembros }) {
  if (!nombre_equipo || !roles_buscados) {
    const err = new Error('nombre_equipo y roles_buscados son obligatorios.')
    err.status = 400
    throw err
  }

  let roles
  try {
    roles = typeof roles_buscados === 'string' ? JSON.parse(roles_buscados) : roles_buscados
  } catch {
    const err = new Error('Formato de roles_buscados inválido.')
    err.status = 400
    throw err
  }
  if (!Array.isArray(roles) || roles.length === 0 || roles.some(r => !ROLES_VALIDOS.includes(r))) {
    const err = new Error('roles_buscados debe ser una lista de roles válidos.')
    err.status = 400
    throw err
  }

  const maxMiembros = max_miembros ? parseInt(max_miembros) : 5
  if (isNaN(maxMiembros) || maxMiembros < 1 || maxMiembros > 5) {
    const err = new Error('max_miembros debe ser un número entre 1 y 5.')
    err.status = 400
    throw err
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO equipo (nombre_equipo, id_lider, roles_buscados, max_miembros)
       VALUES (?, ?, ?, ?)`,
      [nombre_equipo, userId, JSON.stringify(roles), maxMiembros]
    )
    // El líder queda aceptado automáticamente en su propio equipo
    await pool.query(
      `INSERT INTO usuario_equipo (id_usuario, id_equipo, estado, fecha_ingreso)
       VALUES (?, ?, 'aceptado', NOW())`,
      [userId, result.insertId]
    )
    return getEquipoById(result.insertId)
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      const err = new Error('Ya existe un equipo con ese nombre.')
      err.status = 409
      throw err
    }
    throw e
  }
}

// ── Listar equipos disponibles (para explorar) ───────────────────────
export async function listarEquipos({ page = 1, limit = 10, estado }) {
  const pageNum  = Math.max(1, parseInt(page) || 1)
  const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10))
  const offset   = (pageNum - 1) * limitNum
  const estadoFiltro = estado === 'completo' ? 'completo' : 'buscando'

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM equipo WHERE estado = ?`, [estadoFiltro]
  )

  const [equipos] = await pool.query(
    `SELECT e.id_equipo, e.nombre_equipo, e.roles_buscados, e.max_miembros, e.estado,
            e.fecha_creacion, u.nombre AS nombre_lider,
            (SELECT COUNT(*) FROM usuario_equipo ue
             WHERE ue.id_equipo = e.id_equipo AND ue.estado = 'aceptado') AS miembros_actuales
     FROM equipo e
     JOIN usuarios u ON u.id_usuario = e.id_lider
     WHERE e.estado = ?
     ORDER BY e.fecha_creacion DESC
     LIMIT ? OFFSET ?`,
    [estadoFiltro, limitNum, offset]
  )

  return {
    equipos: equipos.map(e => ({ ...e, roles_buscados: JSON.parse(e.roles_buscados) })),
    paginacion: { total, pagina_actual: pageNum, paginas_totales: Math.ceil(total / limitNum), por_pagina: limitNum }
  }
}

// ── Detalle de un equipo ──────────────────────────────────────────────
export async function getEquipoById(idEquipo) {
  const [equipos] = await pool.query(
    `SELECT e.*, u.nombre AS nombre_lider FROM equipo e
     JOIN usuarios u ON u.id_usuario = e.id_lider
     WHERE e.id_equipo = ?`,
    [idEquipo]
  )
  const equipo = equipos[0]
  if (!equipo) {
    const err = new Error('Equipo no encontrado.')
    err.status = 404
    throw err
  }

  const [miembros] = await pool.query(
    `SELECT u.id_usuario, u.nombre, p.summoner_name, p.avatar_url, ue.rol_en_equipo, ue.fecha_ingreso
     FROM usuario_equipo ue
     JOIN usuarios u ON u.id_usuario = ue.id_usuario
     LEFT JOIN perfil p ON p.id_usuario = u.id_usuario
     WHERE ue.id_equipo = ? AND ue.estado = 'aceptado'`,
    [idEquipo]
  )

  return { ...equipo, roles_buscados: JSON.parse(equipo.roles_buscados), miembros }
}

// ── Solicitar unirse (RF16) ───────────────────────────────────────────
export async function solicitarUnirse(userId, idEquipo, rolDeseado) {
  const equipo = await getEquipoById(idEquipo)

  if (equipo.estado === 'completo') {
    const err = new Error('El equipo ya está completo.')
    err.status = 400
    throw err
  }
  if (rolDeseado && !ROLES_VALIDOS.includes(rolDeseado)) {
    const err = new Error('Rol inválido.')
    err.status = 400
    throw err
  }

  const [existentes] = await pool.query(
    `SELECT estado FROM usuario_equipo WHERE id_usuario = ? AND id_equipo = ?`,
    [userId, idEquipo]
  )
  if (existentes[0]) {
    const err = new Error(
      existentes[0].estado === 'pendiente'
        ? 'Ya tenés una solicitud pendiente para este equipo.'
        : 'Ya sos miembro de este equipo.'
    )
    err.status = 409
    throw err
  }

  await pool.query(
    `INSERT INTO usuario_equipo (id_usuario, id_equipo, rol_en_equipo, estado)
     VALUES (?, ?, ?, 'pendiente')`,
    [userId, idEquipo, rolDeseado || null]
  )

  return { message: 'Solicitud enviada correctamente.' }
}

// ── Listar solicitudes pendientes (solo líder) ────────────────────────
export async function listarSolicitudes(userId, idEquipo) {
  await verificarLider(userId, idEquipo)

  const [solicitudes] = await pool.query(
    `SELECT u.id_usuario, u.nombre, p.summoner_name, p.rango, p.avatar_url,
            ue.rol_en_equipo, ue.fecha_solicitud
     FROM usuario_equipo ue
     JOIN usuarios u ON u.id_usuario = ue.id_usuario
     LEFT JOIN perfil p ON p.id_usuario = u.id_usuario
     WHERE ue.id_equipo = ? AND ue.estado = 'pendiente'`,
    [idEquipo]
  )
  return solicitudes
}

// ── Aprobar / rechazar solicitud (RF17, RN09, RN10) ───────────────────
export async function resolverSolicitud(userId, idEquipo, idSolicitante, accion) {
  await verificarLider(userId, idEquipo)

  if (!['aprobar', 'rechazar'].includes(accion)) {
    const err = new Error('La acción debe ser "aprobar" o "rechazar".')
    err.status = 400
    throw err
  }

  const [solicitudes] = await pool.query(
    `SELECT * FROM usuario_equipo WHERE id_usuario = ? AND id_equipo = ? AND estado = 'pendiente'`,
    [idSolicitante, idEquipo]
  )
  if (!solicitudes[0]) {
    const err = new Error('No existe una solicitud pendiente de ese usuario.')
    err.status = 404
    throw err
  }

  if (accion === 'rechazar') {
    await pool.query(
      `DELETE FROM usuario_equipo WHERE id_usuario = ? AND id_equipo = ?`,
      [idSolicitante, idEquipo]
    )
    return { message: 'Solicitud rechazada.' }
  }

  // accion === 'aprobar' → RN09: no superar max_miembros
  const [[{ actuales }]] = await pool.query(
    `SELECT COUNT(*) AS actuales FROM usuario_equipo WHERE id_equipo = ? AND estado = 'aceptado'`,
    [idEquipo]
  )
  const [[equipo]] = await pool.query(`SELECT max_miembros FROM equipo WHERE id_equipo = ?`, [idEquipo])

  if (actuales >= equipo.max_miembros) {
    const err = new Error('El equipo ya alcanzó el máximo de miembros.')
    err.status = 400
    throw err
  }

  await pool.query(
    `UPDATE usuario_equipo SET estado = 'aceptado', fecha_ingreso = NOW()
     WHERE id_usuario = ? AND id_equipo = ?`,
    [idSolicitante, idEquipo]
  )

  if (actuales + 1 >= equipo.max_miembros) {
    await pool.query(`UPDATE equipo SET estado = 'completo' WHERE id_equipo = ?`, [idEquipo])
  }

  return { message: 'Solicitud aprobada.' }
}

// ── Expulsar miembro (RN10) ───────────────────────────────────────────
export async function expulsarMiembro(userId, idEquipo, idMiembro) {
  await verificarLider(userId, idEquipo)

  if (parseInt(idMiembro) === userId) {
    const err = new Error('El líder no puede expulsarse a sí mismo.')
    err.status = 400
    throw err
  }

  const [result] = await pool.query(
    `DELETE FROM usuario_equipo WHERE id_usuario = ? AND id_equipo = ? AND estado = 'aceptado'`,
    [idMiembro, idEquipo]
  )
  if (result.affectedRows === 0) {
    const err = new Error('Ese usuario no es miembro del equipo.')
    err.status = 404
    throw err
  }

  // Si estaba completo, vuelve a estar buscando miembros
  await pool.query(`UPDATE equipo SET estado = 'buscando' WHERE id_equipo = ? AND estado = 'completo'`, [idEquipo])

  return { message: 'Miembro expulsado correctamente.' }
}

// ── Helper: valida que el usuario sea el líder del equipo (RN10) ─────
async function verificarLider(userId, idEquipo) {
  const [equipos] = await pool.query(`SELECT id_lider FROM equipo WHERE id_equipo = ?`, [idEquipo])
  if (!equipos[0]) {
    const err = new Error('Equipo no encontrado.')
    err.status = 404
    throw err
  }
  if (equipos[0].id_lider !== userId) {
    const err = new Error('Solo el líder del equipo puede realizar esta acción.')
    err.status = 403
    throw err
  }
}
