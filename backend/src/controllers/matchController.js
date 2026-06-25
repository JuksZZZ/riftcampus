import { getMatches } from '../services/matchService.js'

export async function list(req, res) {
  try {
    const { page, limit } = req.query
    const result = await getMatches(req.user.sub, { page, limit })
    res.status(200).json(result)
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}
