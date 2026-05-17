const express = require('express')
const { list, create, remove, addCompletion, removeCompletion } = require('../controllers/habitsController')

const router = express.Router()
router.get('/',                          list)
router.post('/',                         create)
router.delete('/:id',                    remove)
router.post('/:id/completions',          addCompletion)
router.delete('/:id/completions/:date',  removeCompletion)

module.exports = router
