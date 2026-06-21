const express = require('express')
const router  = express.Router()
const { getOffres, getOffre } = require('../controllers/offresController')
const authMiddleware = require('../middlewares/authMiddleware')

// GET /api/offres → publique (pas besoin d'être connecté)
router.get('/', getOffres)

// GET /api/offres/:id → publique
router.get('/:id', getOffre)

module.exports = router