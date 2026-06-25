import { getCandidatos, registrarSwipe } from '../services/swipeService.js'

export async function candidatos(req, res) {
  try {
    const { page, limit, rango, rol, objetivo } = req.query
    const resultado = await getCandidatos(req.user.sub, { page, limit, rango, rol, objetivo })
    res.status(200).json(resultado)
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

export async function hacerSwipe(req, res) {
  try {
    const { id_swiped, accion } = req.body
    if (!id_swiped || !accion)
      return res.status(400).json({ error: 'id_swiped y accion son obligatorios.' })
    if (!['like', 'dislike'].includes(accion))
      return res.status(400).json({ error: 'La acción debe ser "like" o "dislike".' })
    const resultado = await registrarSwipe(req.user.sub, id_swiped, accion)
    res.status(200).json({ ok: true, ...resultado })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}