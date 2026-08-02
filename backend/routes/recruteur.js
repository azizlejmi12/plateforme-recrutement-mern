const express = require('express')
const router  = express.Router()
const {
  getDashboardStats, getProfil, updateProfil, createOffre, getMesOffres, getOffre,
  updateOffre, deleteOffre, getCandidatures, shortlistCandidat,updateStatusCandidature,
  inviterCandidat, planifierEntretien, getMesEntretiens,
  updateEntretien, addNoteCandidature, addNoteEntretien,getCVtheque
} = require('../controllers/recruteurController')
const authMiddleware = require('../middlewares/authMiddleware')
const roleMiddleware = require('../middlewares/roleMiddleware')
const validate       = require('../middlewares/validateMiddleware')
const { offreValidator, planifierEntretienValidator, noteValidator } = require('../validators/recruteurValidator')

router.use(authMiddleware)
router.use(roleMiddleware('RECRUTEUR'))

// ── Routes spécifiques AVANT /:id ──────────────────
router.get('/dashboard',                     getDashboardStats)
router.get('/profil',                        getProfil)
router.put('/profil',                        updateProfil)
router.get('/cvtheque', getCVtheque)

// ── Entretiens ─────────────────────────────────────
router.post('/entretiens',                   planifierEntretienValidator, validate, planifierEntretien)
router.get('/entretiens',                    getMesEntretiens)
router.put('/entretiens/:id',                updateEntretien)

// ── Candidatures ───────────────────────────────────
router.put('/candidatures/:id/shortlist',    shortlistCandidat)
router.put('/candidatures/:id/status',   updateStatusCandidature)

// ── Invitations ────────────────────────────────────
router.post('/invitations',                  inviterCandidat)

// ── Notes ──────────────────────────────────────────
router.post('/notes/candidature',            noteValidator, validate, addNoteCandidature)
router.post('/notes/entretien',              noteValidator, validate, addNoteEntretien)

// ── Offres — routes avec /:id EN DERNIER ───────────
router.post('/',                             offreValidator, validate, createOffre)
router.get('/',                              getMesOffres)
router.get('/:id/candidatures',              getCandidatures)
router.get('/:id',                           getOffre)
router.put('/:id',                           updateOffre)
router.delete('/:id',                        deleteOffre)

module.exports = router