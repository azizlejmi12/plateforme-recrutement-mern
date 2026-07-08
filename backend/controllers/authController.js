const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { sendActivationEmail } = require('../config/email')

// =============================================
// FONCTIONS UTILITAIRES
// =============================================

// Générer un Access Token (courte durée)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }   // 15m
  )
}

// Générer un Refresh Token (longue durée)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE }  // 7d
  )
}

// Envoyer le Refresh Token dans un cookie HTTP-Only
const sendRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,     // inaccessible au JavaScript du navigateur
    secure:   false,    // true en production (HTTPS)
    sameSite: 'lax', // protection CSRF
    maxAge:   7 * 24 * 60 * 60 * 1000  // 7 jours en millisecondes
  })
}

// =============================================
// REGISTER
// =============================================
const register = async (req, res) => {
  try {
    const { username, email, password, role, firstname, lastname, civility } = req.body

    // 1. Vérifier si email déjà utilisé
    const existingEmail = await User.findOne({ email })
    if (existingEmail) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' })
    }

    // 2. Vérifier si username déjà utilisé
    const existingUsername = await User.findOne({ username })
    if (existingUsername) {
      return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà pris.' })
    }

    // 3. Chiffrer le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // 4. Générer le token d'activation
    // crypto.randomBytes génère des octets aléatoires sécurisés
    // .toString('hex') les convertit en chaîne hexadécimale
    const activationToken = crypto.randomBytes(32).toString('hex')
    const activationTokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000) // +24h

    // 5. Créer l'utilisateur
    const user = await User.create({
      username,
      email,
      password:              hashedPassword,
      role:                  role || 'CANDIDAT',
      firstname,
      lastname,
      civility,
      isActive:              false,
      activationToken,
      activationTokenExpire
    })

    // 6. Envoyer l'email d'activation
    sendActivationEmail(email, firstname || username, activationToken)

    // 7. Répondre (sans token — compte pas encore actif)
    res.status(201).json({
      message: 'Compte créé ! Vérifie ton email pour activer ton compte.'
    })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// ACTIVATION DU COMPTE
// =============================================
const activateAccount = async (req, res) => {
  try {
    const { token } = req.params

    // 1. Chercher l'utilisateur avec ce token
    const user = await User.findOne({
      activationToken: token,
      activationTokenExpire: { $gt: new Date() }  // token pas encore expiré
      // $gt = "greater than" = supérieur à la date actuelle
    })

    if (!user) {
      return res.status(400).json({
        message: 'Token d\'activation invalide ou expiré.'
      })
    }

    // 2. Activer le compte
    user.isActive              = true
    user.activationToken       = undefined  // supprimer le token
    user.activationTokenExpire = undefined  // supprimer l'expiration
    await user.save()

    res.status(200).json({
      message: 'Compte activé avec succès ! Tu peux maintenant te connecter.'
    })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// LOGIN
// =============================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // 1. Chercher l'utilisateur
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect.' })
    }

    // 2. Vérifier si compte actif
    if (!user.isActive) {
      return res.status(403).json({
        message: 'Compte non activé. Vérifie ton email.'
      })
    }

    // 3. Vérifier si compte bloqué
    if (user.blocked) {
      return res.status(403).json({
        message: 'Compte bloqué. Contacte l\'administrateur.'
      })
    }

    // 4. Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect.' })
    }

    // 5. Générer les tokens
    const accessToken  = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    // 6. Sauvegarder le refresh token en base
    user.refreshToken = refreshToken
    user.lastLogin    = new Date()
    await user.save()

    // 7. Envoyer le refresh token dans un cookie
    sendRefreshTokenCookie(res, refreshToken)

    // 8. Répondre avec l'access token
    res.status(200).json({
      accessToken,
      user: {
        id:        user._id,
        username:  user.username,
        email:     user.email,
        role:      user.role,
        firstname: user.firstname,
        lastname:  user.lastname
      }
    })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// REFRESH TOKEN
// =============================================
const refresh = async (req, res) => {
  try {
    // 1. Récupérer le refresh token depuis le cookie
    const { refreshToken } = req.cookies

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token manquant.' })
    }

    // 2. Vérifier le refresh token
    let decoded
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    } catch {
      return res.status(401).json({ message: 'Refresh token invalide ou expiré.' })
    }

    // 3. Chercher l'utilisateur et vérifier que le token correspond
    const user = await User.findById(decoded.id)
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Refresh token non reconnu.' })
    }

    // 4. Générer un nouvel access token
    const newAccessToken  = generateAccessToken(user)

    // 5. Rotation du refresh token (sécurité supplémentaire)
    // On génère un nouveau refresh token à chaque fois
    const newRefreshToken = generateRefreshToken(user)
    user.refreshToken     = newRefreshToken
    await user.save()
    sendRefreshTokenCookie(res, newRefreshToken)

    res.status(200).json({ accessToken: newAccessToken })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// LOGOUT
// =============================================
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies

    if (refreshToken) {
      // Supprimer le refresh token en base
      await User.findOneAndUpdate(
        { refreshToken },
        { refreshToken: undefined }
      )
    }

    // Supprimer le cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure:   false,
      sameSite: 'strict'
    })

    res.status(200).json({ message: 'Déconnexion réussie.' })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// ME (profil connecté)
// =============================================
const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken -activationToken')
    // .select('-champ') = exclure ces champs sensibles de la réponse

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' })
    }

    res.status(200).json(user)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

module.exports = { register, activateAccount, login, refresh, logout, me }