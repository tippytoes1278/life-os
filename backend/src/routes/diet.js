const express = require('express')
const { list, create, remove, scanPhoto } = require('../controllers/dietController')

const router = express.Router()
router.get('/',             list)
router.post('/',            create)
router.delete('/:id',       remove)
router.post('/scan-photo',  scanPhoto)

module.exports = router
