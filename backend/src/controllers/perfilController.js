import { getPerfilByUserId, upsertPerfil } from '../services/perfilService.js'

// GET /api/perfil
// GET /api/perfil/:id
export async function getPerfil(req, res) {
  try {
    const userId = req.params.id ? parseInt(req.params.id) : req.user.sub
    const perfil = await getPerfilByUserId(userId)
    res.status(200).json({ perfil })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

// POST /api/perfil
export async function savePerfil(req, res) {
  try {
    const perfil = await upsertPerfil(req.user.sub, req.body, req.file)
    res.status(200).json({ message: 'Perfil guardado correctamente.', perfil })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}
