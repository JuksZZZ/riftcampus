import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import authRoutes           from './src/routes/auth.js'
import perfilRoutes         from './src/routes/perfil.js'
import swipeRoutes          from './src/routes/swipe.js'
import disponibilidadRoutes from './src/routes/disponibilidad.js'
import matchRoutes          from './src/routes/match.js'
import leaderboardRoutes    from './src/routes/leaderboard.js'
import equiposRoutes        from './src/routes/equipos.js'
import resenasRoutes        from './src/routes/resenas.js'

const app = express()

const ORIGENES_PERMITIDOS = [
  'http://localhost:5173',      // tu frontend Vue en desarrollo (Vite)
  'https://editor.swagger.io',  // para probar la doc en vivo
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ORIGENES_PERMITIDOS.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('No permitido por CORS'))
    }
  }
}))
app.use(express.json())
app.use('/uploads', express.static('./uploads'))

app.use('/api/auth',           authRoutes)
app.use('/api/perfil',         perfilRoutes)
app.use('/api/swipe',          swipeRoutes)
app.use('/api/disponibilidad', disponibilidadRoutes)
app.use('/api/matches',        matchRoutes)
app.use('/api/leaderboard',    leaderboardRoutes)
app.use('/api/equipos',        equiposRoutes)
app.use('/api/resenas',        resenasRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT ?? 3000
app.listen(PORT, () => console.log(`Backend corriendo en http://localhost:${PORT}`))