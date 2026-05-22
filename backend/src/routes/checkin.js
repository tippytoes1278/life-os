const express = require('express')
const { list, getTodayMorning, getTodayEvening, createMorning, createEvening } = require('../controllers/checkinController')

const router = express.Router()
router.get('/',         list)
router.get('/morning',  getTodayMorning)
router.get('/evening',  getTodayEvening)
router.post('/morning', createMorning)
router.post('/evening', createEvening)

module.exports = router
