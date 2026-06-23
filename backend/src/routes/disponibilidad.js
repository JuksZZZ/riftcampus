import { Router } from 'express'
import { get, set } from '../controllers/disponibilidadController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/',     requireAuth, get)
router.get('/:id',  requireAuth, get)
router.put('/',     requireAuth, set)

export default router
