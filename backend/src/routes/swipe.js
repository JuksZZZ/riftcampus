import { Router } from 'express'
import { getCandidatos, hacerSwipe } from '../controllers/swipeController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/candidatos', requireAuth, getCandidatos)
router.post('/',          requireAuth, hacerSwipe)

export default router
