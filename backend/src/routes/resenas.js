import { Router } from 'express'
import { create, listRecibidas } from '../controllers/resenaController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/',    requireAuth, create)
router.get('/',     requireAuth, listRecibidas)
router.get('/:id',  requireAuth, listRecibidas)

export default router
