import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import authRoutes  from './src/routes/auth.js'
import perfilRoutes from './src/routes/perfil.js'

const app = express()

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// Servir avatares como archivos estáticos
app.use('/uploads', express.static('./uploads'))

app.use('/api/auth',   authRoutes)
app.use('/api/perfil', perfilRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT ?? 3000
app.listen(PORT, () => console.log(`🚀 Backend corriendo en http://localhost:${PORT}`))
