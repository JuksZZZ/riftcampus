import { Router } from 'express'
import {
  create, list, detail, solicitar, verSolicitudes, resolver, expulsar
} from '../controllers/equipoController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/',                              requireAuth, create)
router.get('/',                                requireAuth, list)
router.get('/:id',                             requireAuth, detail)
router.post('/:id/solicitudes',                requireAuth, solicitar)
router.get('/:id/solicitudes',                 requireAuth, verSolicitudes)
router.put('/:id/solicitudes/:idSolicitante',  requireAuth, resolver)
router.delete('/:id/miembros/:idMiembro',      requireAuth, expulsar)

export default router
