import { registerUser, loginUser, getUserById, generateToken } from '../services/authService.js'

// POST /api/auth/register
export async function register(req, res) {
  try {
    const { nombre, email, contrasena } = req.body

    if (!nombre || !email || !contrasena)
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios.' })
    if (contrasena.length < 6)
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: 'El email no tiene un formato válido.' })

    const user  = await registerUser({ nombre, email, contrasena })
    const token = generateToken(user)

    res.status(201).json({ message: 'Usuario registrado exitosamente.', token, user })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, contrasena } = req.body

    if (!email || !contrasena)
      return res.status(400).json({ error: 'Email y contraseña son obligatorios.' })

    const { user, has_profile } = await loginUser({ email, contrasena })
    const token = generateToken(user)

    res.status(200).json({
      token,
      has_profile,
      user: { id_usuario: user.id_usuario, nombre: user.nombre, rol_usuario: user.rol_usuario }
    })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

// GET /api/auth/me
export async function me(req, res) {
  try {
    const user = await getUserById(req.user.sub)
    res.status(200).json({ user })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}
