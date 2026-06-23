import { getDisponibilidad, setDisponibilidad } from '../services/disponibilidadService.js'

// GET /api/disponibilidad
// GET /api/disponibilidad/:id
export async function get(req, res) {
  try {
    const userId = req.params.id ? parseInt(req.params.id) : req.user.sub
    const franjas = await getDisponibilidad(userId)
    res.status(200).json({ disponibilidad: franjas })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

// PUT /api/disponibilidad
// Body: { franjas: [{ dia, hora_inicio, hora_fin }] }
export async function set(req, res) {
  try {
    const { franjas } = req.body
    if (!Array.isArray(franjas)) {
      return res.status(400).json({ error: 'El campo "franjas" debe ser un array.' })
    }
    const result = await setDisponibilidad(req.user.sub, franjas)
    res.status(200).json({ message: 'Disponibilidad guardada correctamente.', disponibilidad: result })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}
