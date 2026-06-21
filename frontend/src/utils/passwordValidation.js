export const passwordRules = [
  {
    label: 'Au moins 8 caractères',
    test: (password) => password.length >= 8
  },
  {
    label: 'Une lettre majuscule',
    test: (password) => /[A-Z]/.test(password)
  },
  {
    label: 'Une lettre minuscule',
    test: (password) => /[a-z]/.test(password)
  },
  {
    label: 'Un chiffre',
    test: (password) => /[0-9]/.test(password)
  },
  {
    label: 'Un caractère spécial (!@#$...)',
    test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
]

// Vérifie si TOUTES les règles sont respectées
export const isPasswordValid = (password) => {
  return passwordRules.every(rule => rule.test(password))
}