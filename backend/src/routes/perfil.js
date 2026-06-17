import { Router } from 'express'
import { getPerfil, upsertPerfil } from '../controllers/perfilController.js'
import { requireAuth } from '../middleware/auth.js'
import { uploadAvatar } from '../middleware/upload.js'

const router = Router()

// Todas requieren auth
router.get('/',     requireAuth, getPerfil)
router.get('/:id',  requireAuth, getPerfil)
router.post('/',    requireAuth, uploadAvatar, upsertPerfil)

export default router
