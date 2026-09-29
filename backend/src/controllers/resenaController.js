import { crearResena, getResenasRecibidas } from '../services/resenaService.js'

// POST /api/resenas
export async function create(req, res) {
  try {
    const resultado = await crearResena(req.user.sub, req.body)
    res.status(201).json(resultado)
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

// GET /api/resenas  (mías)
// GET /api/resenas/:id  (de otro usuario, para perfil público)
export async function listRecibidas(req, res) {
  try {
    const userId = req.params.id ? parseInt(req.params.id) : req.user.sub
    const resenas = await getResenasRecibidas(userId)
    res.status(200).json({ resenas })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}
