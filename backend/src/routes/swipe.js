import { Router } from 'express'
import { candidatos, hacerSwipe } from '../controllers/swipeController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.get('/candidatos', requireAuth, candidatos)
router.post('/',          requireAuth, hacerSwipe)
export default router