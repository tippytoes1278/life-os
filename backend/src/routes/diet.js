const express = require('express')
const { list, create, remove } = require('../controllers/dietController')

const router = express.Router()
router.get('/',    list)
router.post('/',   create)
router.delete('/:id', remove)

module.exports = router
