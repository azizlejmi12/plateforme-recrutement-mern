const { body } = require('express-validator')

const registerValidator = [
  body('username')
    .trim()
    .notEmpty().withMessage('Le nom d\'utilisateur est requis.')
    .isLength({ min: 3 }).withMessage('Le nom d\'utilisateur doit contenir au moins 3 caractères.')
    .isLength({ max: 30 }).withMessage('Le nom d\'utilisateur ne peut pas dépasser 30 caractères.'),

  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis.')
    .isEmail().withMessage('L\'email n\'est pas valide.'),

  body('password')
  .notEmpty().withMessage('Le mot de passe est requis.')
  .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères.')
  .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir une majuscule.')
  .matches(/[a-z]/).withMessage('Le mot de passe doit contenir une minuscule.')
  .matches(/[0-9]/).withMessage('Le mot de passe doit contenir un chiffre.')
  .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Le mot de passe doit contenir un caractère spécial.'),

  body('role')
    .optional()
    .isIn(['CANDIDAT', 'RECRUTEUR']).withMessage('Rôle invalide. Choisir CANDIDAT ou RECRUTEUR.'),

  body('civility')
    .optional()
    .isIn(['M', 'Mme', 'Dr']).withMessage('Civilité invalide.')
]

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis.')
    .isEmail().withMessage('L\'email n\'est pas valide.'),

  body('password')
    .notEmpty().withMessage('Le mot de passe est requis.')
]

module.exports = { registerValidator, loginValidator }