import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import authRoutes   from './src/routes/auth.js'
import perfilRoutes from './src/routes/perfil.js'
import swipeRoutes  from './src/routes/swipe.js'

const app = express()

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use('/uploads', express.static('./uploads'))

app.use('/api/auth',   authRoutes)
app.use('/api/perfil', perfilRoutes)
app.use('/api/swipe',  swipeRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT ?? 3000
app.listen(PORT, () => console.log(`🚀 Backend corriendo en http://localhost:${PORT}`))
