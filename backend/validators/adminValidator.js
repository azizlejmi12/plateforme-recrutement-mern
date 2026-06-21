const { body } = require('express-validator')

const blockUserValidator = [
  body('blocked')
    .notEmpty().withMessage('Le champ blocked est requis.')
    .isBoolean().withMessage('blocked doit être true ou false.'),

  body('endDateOfBlockage')
    .optional()
    .isDate().withMessage('Date de fin de blocage invalide.')
]

const referentielValidator = [
  body('labelFr')
    .trim()
    .notEmpty().withMessage('Le libellé en français est requis.')
    .isLength({ min: 2 }).withMessage('Le libellé doit contenir au moins 2 caractères.'),

  body('labelEn')
    .optional()
    .trim(),

  body('labelAr')
    .optional()
    .trim(),

  body('status')
    .optional()
    .isIn([0, 1]).withMessage('Statut invalide. 0=inactif, 1=actif.')
]

module.exports = { blockUserValidator, referentielValidator }