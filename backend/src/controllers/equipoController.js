import {
  crearEquipo, listarEquipos, getEquipoById,
  solicitarUnirse, listarSolicitudes, resolverSolicitud, expulsarMiembro
} from '../services/equipoService.js'

// POST /api/equipos
export async function create(req, res) {
  try {
    const equipo = await crearEquipo(req.user.sub, req.body)
    res.status(201).json({ message: 'Equipo creado correctamente.', equipo })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

// GET /api/equipos
export async function list(req, res) {
  try {
    const { page, limit, estado } = req.query
    const resultado = await listarEquipos({ page, limit, estado })
    res.status(200).json(resultado)
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

// GET /api/equipos/:id
export async function detail(req, res) {
  try {
    const equipo = await getEquipoById(req.params.id)
    res.status(200).json({ equipo })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

// POST /api/equipos/:id/solicitudes
export async function solicitar(req, res) {
  try {
    const resultado = await solicitarUnirse(req.user.sub, req.params.id, req.body.rol_en_equipo)
    res.status(201).json(resultado)
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

// GET /api/equipos/:id/solicitudes
export async function verSolicitudes(req, res) {
  try {
    const solicitudes = await listarSolicitudes(req.user.sub, req.params.id)
    res.status(200).json({ solicitudes })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

// PUT /api/equipos/:id/solicitudes/:idSolicitante
export async function resolver(req, res) {
  try {
    const resultado = await resolverSolicitud(
      req.user.sub, req.params.id, req.params.idSolicitante, req.body.accion
    )
    res.status(200).json(resultado)
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

// DELETE /api/equipos/:id/miembros/:idMiembro
export async function expulsar(req, res) {
  try {
    const resultado = await expulsarMiembro(req.user.sub, req.params.id, req.params.idMiembro)
    res.status(200).json(resultado)
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}
