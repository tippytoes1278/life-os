const express = require('express')
const { generate, sendWhatsApp } = require('../controllers/reviewController')

const router = express.Router()
router.post('/generate',  generate)
router.post('/whatsapp',  sendWhatsApp)

module.exports = router
