require('dotenv').config()
const express = require('express')
const cors = require('cors')

const checkinRoutes = require('./routes/checkin')
const habitsRoutes  = require('./routes/habits')
const fitnessRoutes = require('./routes/fitness')
const reviewRoutes  = require('./routes/review')
const dietRoutes    = require('./routes/diet')

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.use('/api/checkins', checkinRoutes)
app.use('/api/habits',   habitsRoutes)
app.use('/api/fitness',  fitnessRoutes)
app.use('/api/review',   reviewRoutes)
app.use('/api/diet',     dietRoutes)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`))
