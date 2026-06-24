const { body } = require('express-validator')

const offreValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Le titre de l\'offre est requis.')
    .isLength({ min: 5 }).withMessage('Le titre doit contenir au moins 5 caractères.')
    .isLength({ max: 100 }).withMessage('Le titre ne peut pas dépasser 100 caractères.'),

  body('numberOfRecruits')
    .optional()
    .isInt({ min: 1 }).withMessage('Le nombre de recrues doit être au moins 1.'),

  body('applicationDeadline')
    .optional()
    .isDate().withMessage('Date limite invalide.')
    .custom(value => {
      if (new Date(value) <= new Date()) {
        throw new Error('La date limite doit être dans le futur.')
      }
      return true
    }),

  body('status')
    .optional()
    .isIn([0, 1, 2]).withMessage('Statut invalide. 0=brouillon, 1=publié, 2=clôturé.')
]

const planifierEntretienValidator = [
  body('userId')
    .notEmpty().withMessage('L\'ID du candidat est requis.')
    .isMongoId().withMessage('ID du candidat invalide.'),

  body('jobId')
    .notEmpty().withMessage('L\'ID de l\'offre est requis.')
    .isMongoId().withMessage('ID de l\'offre invalide.'),

  body('date')
    .notEmpty().withMessage('La date de l\'entretien est requise.')
    .isISO8601().withMessage('Format de date invalide.')
    .custom(value => {
      if (new Date(value) <= new Date()) {
        throw new Error('La date de l\'entretien doit être dans le futur.')
      }
      return true
    }),

  body('presence')
    .optional()
    .isIn([0, 1, 2]).withMessage('Mode invalide. 0=présentiel, 1=visio, 2=téléphone.')
]

const noteValidator = [
  body('description')
    .trim()
    .notEmpty().withMessage('La description est requise.')
    .isLength({ min: 10 }).withMessage('La note doit contenir au moins 10 caractères.')
]

module.exports = { offreValidator, planifierEntretienValidator, noteValidator }