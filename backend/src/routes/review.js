const express = require('express')
const { generate } = require('../controllers/reviewController')

const router = express.Router()
router.post('/generate', generate)

module.exports = router
