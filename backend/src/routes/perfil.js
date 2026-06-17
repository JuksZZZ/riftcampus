// src/routes/perfil.js
import { Router } from 'express'
import { getPerfil, savePerfil } from '../controllers/perfilController.js'
import { requireAuth } from '../middleware/auth.js'
import { uploadAvatar } from '../middleware/upload.js'

const router = Router()
router.get('/',    requireAuth, getPerfil)
router.get('/:id', requireAuth, getPerfil)
router.post('/',   requireAuth, uploadAvatar, savePerfil)
export default router
