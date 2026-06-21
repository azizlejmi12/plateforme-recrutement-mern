const { body } = require('express-validator')

const cvValidator = [
  body('mobile')
    .optional()
    .isMobilePhone().withMessage('Numéro de téléphone invalide.'),

  body('dateOfBirth')
    .optional()
    .isDate().withMessage('Date de naissance invalide.')
    .custom(value => {
      // Vérifier que la date est dans le passé
      if (new Date(value) >= new Date()) {
        throw new Error('La date de naissance doit être dans le passé.')
      }
      return true
    }),

  body('civilStatus')
    .optional()
    .isInt({ min: 0, max: 3 }).withMessage('Statut civil invalide.'),

  body('driverLicense')
    .optional()
    .isBoolean().withMessage('Permis de conduire doit être true ou false.')
]

const postulerValidator = [
  body('jobId')
    .notEmpty().withMessage('L\'ID de l\'offre est requis.')
    .isMongoId().withMessage('ID de l\'offre invalide.')
]

const repondreInvitationValidator = [
  body('reponse')
    .notEmpty().withMessage('La réponse est requise.')
    .isBoolean().withMessage('La réponse doit être true (accepter) ou false (refuser).')
]

module.exports = { cvValidator, postulerValidator, repondreInvitationValidator }