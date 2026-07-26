const express = require('express')
const router  = express.Router()
const {
  getProfil, updateProfil, createCV, updateCV, getCV,
  postuler, getMesCandidatures, getCandidature,
  addFavori, removeFavori, getMesFavoris,
  getMesInvitations, repondreInvitation,
  getMesEntretiens, repondreEntretien
} = require('../controllers/candidatController')
const authMiddleware = require('../middlewares/authMiddleware')
const roleMiddleware = require('../middlewares/roleMiddleware')
const validate       = require('../middlewares/validateMiddleware')
const { cvValidator, postulerValidator, repondreInvitationValidator } = require('../validators/candidatValidator')

router.use(authMiddleware)
router.use(roleMiddleware('CANDIDAT'))

router.get('/profil',                getProfil)
router.put('/profil',                updateProfil)
router.get('/cv',                    getCV)
router.post('/cv',                   cvValidator,                  validate, createCV)
router.put('/cv',                    cvValidator,                  validate, updateCV)
router.post('/candidatures',         postulerValidator,            validate, postuler)
router.get('/candidatures',          getMesCandidatures)
router.get('/candidatures/:id',      getCandidature)
router.get('/favoris',               getMesFavoris)
router.post('/favoris/:jobId',       addFavori)
router.delete('/favoris/:jobId',     removeFavori)
router.get('/invitations',           getMesInvitations)
router.put('/invitations/:id',       repondreInvitationValidator,  validate, repondreInvitation)
router.get('/entretiens',            getMesEntretiens)
router.put('/entretiens/:id',        repondreEntretien)

module.exports = router