const express = require('express')
const router  = express.Router()
const { register, activateAccount, login, refresh, logout, me } = require('../controllers/authController')
const authMiddleware = require('../middlewares/authMiddleware')
const validate       = require('../middlewares/validateMiddleware')
const { registerValidator, loginValidator } = require('../validators/authValidator')

router.post('/register',          registerValidator, validate, register)
router.get('/activate/:token',    activateAccount)
router.post('/login',             loginValidator,   validate, login)
router.post('/refresh',           refresh)
router.post('/logout',            logout)
router.get('/me',                 authMiddleware, me)

module.exports = router