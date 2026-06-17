import pool from '../config/db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const RANGOS = ['hierro','bronce','plata','oro','platino','esmeralda','diamante','maestro','gran_maestro','challenger']

// ── Token ────────────────────────────────────────────────────
export function generateToken(user) {
  return jwt.sign(
    { sub: user.id_usuario, nombre: user.nombre, rol: user.rol_usuario },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  )
}

// ── Registro ─────────────────────────────────────────────────
export async function registerUser({ nombre, email, contrasena }) {
  const [existing] = await pool.query(
    'SELECT id_usuario FROM usuarios WHERE email = ?',
    [email.toLowerCase()]
  )
  if (existing.length > 0) {
    const err = new Error('Ya existe una cuenta con ese email.')
    err.status = 409
    throw err
  }

  const hash = await bcrypt.hash(contrasena, 10)
  const [result] = await pool.query(
    'INSERT INTO usuarios (nombre, email, contrasena) VALUES (?, ?, ?)',
    [nombre, email.toLowerCase(), hash]
  )
  const userId = result.insertId

  await pool.query(
    'INSERT INTO tabla_ranking (id_usuario, temporada) VALUES (?, 1)',
    [userId]
  )

  return { id_usuario: userId, nombre, email: email.toLowerCase(), rol_usuario: 'usuario' }
}

// ── Login ────────────────────────────────────────────────────
export async function loginUser({ email, contrasena }) {
  const [rows] = await pool.query(
    'SELECT id_usuario, nombre, contrasena, rol_usuario, estado FROM usuarios WHERE email = ?',
    [email.toLowerCase()]
  )
  const user = rows[0]

  if (!user || !(await bcrypt.compare(contrasena, user.contrasena))) {
    const err = new Error('Credenciales incorrectas.')
    err.status = 401
    throw err
  }
  if (user.estado === 'suspendido') {
    const err = new Error('Tu cuenta ha sido suspendida.')
    err.status = 403
    throw err
  }

  const [perfil] = await pool.query(
    'SELECT id_perfil FROM perfil WHERE id_usuario = ?',
    [user.id_usuario]
  )

  return { user, has_profile: perfil.length > 0 }
}

// ── Me ───────────────────────────────────────────────────────
export async function getUserById(id) {
  const [rows] = await pool.query(
    `SELECT u.id_usuario, u.nombre, u.email, u.rol_usuario, u.estado,
            p.id_perfil, p.summoner_name, p.rango, p.avatar_url, p.objetivo
     FROM   usuarios u
     LEFT JOIN perfil p ON p.id_usuario = u.id_usuario
     WHERE  u.id_usuario = ?`,
    [id]
  )
  if (!rows[0]) {
    const err = new Error('Usuario no encontrado.')
    err.status = 404
    throw err
  }
  return rows[0]
}
