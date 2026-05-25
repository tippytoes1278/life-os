const express = require('express')
const { list, create, allHistory, exerciseHistory } = require('../controllers/fitnessController')

const router = express.Router()
router.get('/history',               allHistory)       // all exercises in one shot
router.get('/history/:exerciseName', exerciseHistory)  // single exercise
router.get('/',  list)
router.post('/', create)

module.exports = router
