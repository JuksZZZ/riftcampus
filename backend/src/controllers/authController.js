import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

function generateToken(user) {
  return jwt.sign(
    { sub: user.id_usuario, nombre: user.nombre, rol: user.rol_usuario },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export async function register(req, res) {
  const { nombre, email, contrasena } = req.body;

  if (!nombre || !email || !contrasena)
    return res.status(422).json({ error: 'Nombre, email y contraseña son obligatorios.' });
  if (contrasena.length < 6)
    return res.status(422).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });

  const [existing] = await pool.query(
    'SELECT id_usuario FROM usuarios WHERE email = ?', [email.toLowerCase()]
  );
  if (existing.length > 0)
    return res.status(409).json({ error: 'Ya existe una cuenta con ese email.' });

  const hash = await bcrypt.hash(contrasena, 10);
  const [result] = await pool.query(
    'INSERT INTO usuarios (nombre, email, contrasena) VALUES (?, ?, ?)',
    [nombre, email.toLowerCase(), hash]
  );
  const userId = result.insertId;

  await pool.query(
    'INSERT INTO tabla_ranking (id_usuario, temporada) VALUES (?, 1)', [userId]
  );

  const token = generateToken({ id_usuario: userId, nombre, rol_usuario: 'usuario' });

  res.status(201).json({
    message: 'Usuario registrado exitosamente.',
    token,
    user: { id_usuario: userId, nombre, email: email.toLowerCase(), rol_usuario: 'usuario' },
  });
}

export async function login(req, res) {
  const { email, contrasena } = req.body;

  if (!email || !contrasena)
    return res.status(422).json({ error: 'Email y contraseña son obligatorios.' });

  const [rows] = await pool.query(
    'SELECT id_usuario, nombre, contrasena, rol_usuario, estado FROM usuarios WHERE email = ?',
    [email.toLowerCase()]
  );

  const user = rows[0];

  if (!user || !(await bcrypt.compare(contrasena, user.contrasena)))
    return res.status(401).json({ error: 'Credenciales incorrectas.' });
  if (user.estado === 'suspendido')
    return res.status(403).json({ error: 'Tu cuenta ha sido suspendida.' });

  const [perfil] = await pool.query(
    'SELECT id_perfil FROM perfil WHERE id_usuario = ?', [user.id_usuario]
  );

  const token = generateToken(user);

  res.json({
    token,
    has_profile: perfil.length > 0,
    user: { id_usuario: user.id_usuario, nombre: user.nombre, rol_usuario: user.rol_usuario },
  });
}

export async function me(req, res) {
  const [rows] = await pool.query(
    `SELECT u.id_usuario, u.nombre, u.email, u.rol_usuario, u.estado,
            p.id_perfil, p.summoner_name, p.rango, p.avatar_url, p.objetivo
     FROM   usuarios u
     LEFT JOIN perfil p ON p.id_usuario = u.id_usuario
     WHERE  u.id_usuario = ?`,
    [req.user.sub]
  );

  if (!rows[0]) return res.status(404).json({ error: 'Usuario no encontrado.' });
  res.json({ user: rows[0] });
}