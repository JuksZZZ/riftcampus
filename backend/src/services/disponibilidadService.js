import pool from '../config/db.js'

const DIAS = ['lun','mar','mie','jue','vie','sab','dom']
const RANGOS = ['hierro','bronce','plata','oro','platino','esmeralda','diamante','maestro','gran_maestro','challenger']

// ── Helpers de tiempo ────────────────────────────────────────

// Convierte "HH:MM" o "HH:MM:SS" a minutos desde medianoche
function toMinutos(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

// Minutos de solapamiento entre dos rangos [inicio1,fin1] y [inicio2,fin2]
function solapamiento(ini1, fin1, ini2, fin2) {
  const start = Math.max(ini1, ini2)
  const end   = Math.min(fin1, fin2)
  return Math.max(0, end - start)
}

// ── Algoritmo de compatibilidad ──────────────────────────────
// Rol × 0.4 + Rango × 0.3 + Horario × 0.2 + Objetivo × 0.1

export function calcularCompatibilidad(perfilA, perfilB, dispA, dispB) {

  // 1. Rol (0.4)
  // Roles diferentes → 1.0 | mismo rol → 0.2
  const rolesA = Array.isArray(perfilA.roles_preferidos)
    ? perfilA.roles_preferidos
    : JSON.parse(perfilA.roles_preferidos || '[]')
  const rolesB = Array.isArray(perfilB.roles_preferidos)
    ? perfilB.roles_preferidos
    : JSON.parse(perfilB.roles_preferidos || '[]')

  const hayRolComun = rolesA.some(r => rolesB.includes(r))
  const scoreRol = hayRolComun ? 0.2 : 1.0

  // 2. Rango (0.3)
  // diff 0→1.0 | diff 1→0.7 | diff 2→0.4 | diff ≥3→0.1
  const idxA = RANGOS.indexOf(perfilA.rango)
  const idxB = RANGOS.indexOf(perfilB.rango)
  const diff  = Math.abs(idxA - idxB)
  const scoreRangoMap = { 0: 1.0, 1: 0.7, 2: 0.4 }
  const scoreRango = scoreRangoMap[diff] ?? 0.1

  // 3. Horario (0.2)
  // Proporción de minutos coincidentes / total minutos disponibles entre los dos
  let minutosCoincidentes = 0
  let minutosTotal        = 0

  for (const diaA of dispA) {
    const ini1 = toMinutos(diaA.hora_inicio)
    const fin1 = toMinutos(diaA.hora_fin)
    const durA = fin1 - ini1

    for (const diaB of dispB) {
      if (diaA.dia !== diaB.dia) continue
      const ini2 = toMinutos(diaB.hora_inicio)
      const fin2 = toMinutos(diaB.hora_fin)
      minutosCoincidentes += solapamiento(ini1, fin1, ini2, fin2)
    }
    minutosTotal += durA
  }

  for (const diaB of dispB) {
    minutosTotal += toMinutos(diaB.hora_fin) - toMinutos(diaB.hora_inicio)
  }

  // Evitar división por cero; si ninguno tiene disponibilidad cargada → 0
  const scoreHorario = minutosTotal > 0
    ? Math.min(1, (minutosCoincidentes * 2) / minutosTotal)
    : 0

  // 4. Objetivo (0.1)
  const scoreObjetivo = perfilA.objetivo === perfilB.objetivo ? 1.0 : 0.3

  // ── Fórmula final ────────────────────────────────────────
  const compat =
    (scoreRol     * 0.4) +
    (scoreRango   * 0.3) +
    (scoreHorario * 0.2) +
    (scoreObjetivo * 0.1)

  return Math.round(compat * 100)
}

// ── CRUD de disponibilidad ───────────────────────────────────

export async function getDisponibilidad(userId) {
  const [rows] = await pool.query(
    `SELECT id_disponibilidad, dia, hora_inicio, hora_fin
     FROM disponibilidad
     WHERE id_usuario = ?
     ORDER BY FIELD(dia,'lun','mar','mie','jue','vie','sab','dom'), hora_inicio`,
    [userId]
  )
  return rows
}

export async function setDisponibilidad(userId, franjas) {
  // Validar estructura
  for (const f of franjas) {
    if (!DIAS.includes(f.dia)) {
      const err = new Error(`Día inválido: ${f.dia}`)
      err.status = 400
      throw err
    }
    if (!f.hora_inicio || !f.hora_fin) {
      const err = new Error('hora_inicio y hora_fin son obligatorios.')
      err.status = 400
      throw err
    }
    if (toMinutos(f.hora_inicio) >= toMinutos(f.hora_fin)) {
      const err = new Error(`hora_fin debe ser posterior a hora_inicio (${f.dia}).`)
      err.status = 400
      throw err
    }
  }

  // Reemplazar toda la disponibilidad del usuario (delete + insert)
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    await conn.query('DELETE FROM disponibilidad WHERE id_usuario = ?', [userId])

    if (franjas.length > 0) {
      const values = franjas.map(f => [userId, f.dia, f.hora_inicio, f.hora_fin])
      await conn.query(
        'INSERT INTO disponibilidad (id_usuario, dia, hora_inicio, hora_fin) VALUES ?',
        [values]
      )
    }
    await conn.commit()
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }

  return getDisponibilidad(userId)
}
