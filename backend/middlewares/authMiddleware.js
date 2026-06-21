const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {

  // 1. Récupérer le token depuis le header
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Accès refusé. Token manquant.' })
  }

  // 2. Extraire le token (enlever "Bearer ")
  const token = authHeader.split(' ')[1]

  try {
    // 3. Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // 4. Ajouter les infos de l'utilisateur à la requête
    req.user = decoded
    // req.user contient maintenant { id, role }
    // accessible dans tous les controllers suivants

    next()  // passer au controller

  } catch (err) {
    return res.status(401).json({ message: 'Token invalide ou expiré.' })
  }
}

module.exports = authMiddleware