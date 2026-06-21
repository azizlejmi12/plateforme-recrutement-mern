const express = require('express')
const router  = express.Router()
const {
  getProfil, updateProfil, createOffre, getMesOffres, getOffre,
  updateOffre, deleteOffre, getCandidatures, shortlistCandidat,
  inviterCandidat, planifierEntretien, getMesEntretiens,
  updateEntretien, addNoteCandidature, addNoteEntretien
} = require('../controllers/recruteurController')
const authMiddleware = require('../middlewares/authMiddleware')
const roleMiddleware = require('../middlewares/roleMiddleware')
const validate       = require('../middlewares/validateMiddleware')
const { offreValidator, planifierEntretienValidator, noteValidator } = require('../validators/recruteurValidator')

router.use(authMiddleware)
router.use(roleMiddleware('RECRUTEUR'))

router.get('/profil',                        getProfil)
router.put('/profil',                        updateProfil)
router.post('/',                             offreValidator,               validate, createOffre)
router.get('/',                              getMesOffres)
router.get('/:id',                           getOffre)
router.put('/:id',                           updateOffre)
router.delete('/:id',                        deleteOffre)
router.get('/:id/candidatures',              getCandidatures)
router.put('/candidatures/:id/shortlist',    shortlistCandidat)
router.post('/invitations',                  inviterCandidat)
router.post('/entretiens',                   planifierEntretienValidator,  validate, planifierEntretien)
router.get('/entretiens',                    getMesEntretiens)
router.put('/entretiens/:id',                updateEntretien)
router.post('/notes/candidature',            noteValidator,                validate, addNoteCandidature)
router.post('/notes/entretien',              noteValidator,                validate, addNoteEntretien)

module.exports = router