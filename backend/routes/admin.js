const express = require('express')
const router  = express.Router()
const {
  getUsers, getUser, blockUser, deleteUser, getStats,
  createDegree, getDegrees, updateDegree, deleteDegree,
  createSkill, getSkills, updateSkill,
  createLanguage, getLanguages, updateLanguage,
  createArea, getAreas, updateArea,
  createSpeciality, getSpecialities, updateSpeciality
} = require('../controllers/adminController')
const authMiddleware       = require('../middlewares/authMiddleware')
const roleMiddleware       = require('../middlewares/roleMiddleware')
const validate             = require('../middlewares/validateMiddleware')
const { blockUserValidator, referentielValidator } = require('../validators/adminValidator')

router.use(authMiddleware)
router.use(roleMiddleware('ADMIN'))

router.get('/stats',                           getStats)
router.get('/users',                           getUsers)
router.get('/users/:id',                       getUser)
router.put('/users/:id/block',                 blockUserValidator,   validate, blockUser)
router.delete('/users/:id',                    deleteUser)
router.post('/referentiels/degrees',           referentielValidator, validate, createDegree)
router.get('/referentiels/degrees',            getDegrees)
router.put('/referentiels/degrees/:id',        referentielValidator, validate, updateDegree)
router.delete('/referentiels/degrees/:id',     deleteDegree)
router.post('/referentiels/skills',            referentielValidator, validate, createSkill)
router.get('/referentiels/skills',             getSkills)
router.put('/referentiels/skills/:id',         referentielValidator, validate, updateSkill)
router.post('/referentiels/languages',         referentielValidator, validate, createLanguage)
router.get('/referentiels/languages',          getLanguages)
router.put('/referentiels/languages/:id',      referentielValidator, validate, updateLanguage)
router.post('/referentiels/areas',             referentielValidator, validate, createArea)
router.get('/referentiels/areas',              getAreas)
router.put('/referentiels/areas/:id',          referentielValidator, validate, updateArea)
router.post('/referentiels/specialities',      referentielValidator, validate, createSpeciality)
router.get('/referentiels/specialities',       getSpecialities)
router.put('/referentiels/specialities/:id',   referentielValidator, validate, updateSpeciality)

module.exports = router