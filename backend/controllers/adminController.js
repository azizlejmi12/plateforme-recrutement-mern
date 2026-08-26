const User           = require('../models/User')
const Job            = require('../models/Job')
const Candidacy      = require('../models/Candidacy')
const Degree         = require('../models/Degree')
const Skill          = require('../models/Skill')
const Language       = require('../models/Language')
const AreaOfExpertise = require('../models/AreaOfExpertise')
const Speciality     = require('../models/Speciality')

// =============================================
// UTILISATEURS — GET ALL
// =============================================
const getUsers = async (req, res) => {
  try {
    const { role, blocked, page = 1, limit = 10 } = req.query

    const filter = {}
    if (role)    filter.role    = role
    if (blocked) filter.blocked = blocked === 'true'

    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -refreshToken -activationToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter)
    ])

    res.status(200).json({
      users,
      pagination: {
        total,
        page:       Number(page),
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// UTILISATEURS — GET ONE
// =============================================
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -refreshToken -activationToken')

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' })
    }

    // Récupérer les stats de l'utilisateur
    const [candidatures, offres] = await Promise.all([
      Candidacy.countDocuments({ user: req.params.id }),
      Job.countDocuments({ manager: req.params.id })
    ])

    res.status(200).json({
      user,
      stats: { candidatures, offres }
    })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// UTILISATEURS — BLOQUER / DÉBLOQUER
// =============================================
const blockUser = async (req, res) => {
  try {
    const { blocked, endDateOfBlockage } = req.body

    // Empêcher l'admin de se bloquer lui-même
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Vous ne pouvez pas vous bloquer vous-même.' })
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        blocked,
        startDateOfBlockage: blocked ? new Date() : undefined,
        endDateOfBlockage:   blocked ? endDateOfBlockage : undefined
      },
      { new: true }
    ).select('-password -refreshToken -activationToken')

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' })
    }

    res.status(200).json({
      message: blocked ? `Utilisateur bloqué.` : `Utilisateur débloqué.`,
      user
    })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// UTILISATEURS — DELETE
// =============================================
const deleteUser = async (req, res) => {
  try {
    // Empêcher l'admin de se supprimer lui-même
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte.' })
    }

    const user = await User.findByIdAndDelete(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' })
    }

    res.status(200).json({ message: 'Utilisateur supprimé avec succès.' })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// STATS GLOBALES
// =============================================
const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCandidats,
      totalRecruteurs,
      totalOffres,
      totalCandidatures,
      offresPubliees,
      usersBlockes
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'CANDIDAT' }),
      User.countDocuments({ role: 'RECRUTEUR' }),
      Job.countDocuments(),
      Candidacy.countDocuments(),
      Job.countDocuments({ status: 1 }),
      User.countDocuments({ blocked: true })
    ])

    res.status(200).json({
      users: {
        total:      totalUsers,
        candidats:  totalCandidats,
        recruteurs: totalRecruteurs,
        bloques:    usersBlockes
      },
      offres: {
        total:    totalOffres,
        publiees: offresPubliees
      },
      candidatures: {
        total: totalCandidatures
      }
    })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// RÉFÉRENTIELS — FONCTION GÉNÉRIQUE
// =============================================
// Au lieu de répéter le même code pour Degree, Skill, Language...
// on crée une fonction qui prend le modèle en paramètre

const createReferentiel = (Model) => async (req, res) => {
  try {
    const doc = await Model.create(req.body)
    res.status(201).json(doc)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

const getReferentiels = (Model) => async (req, res) => {
  try {
    const { status } = req.query
    const filter = {}
    if (status !== undefined) filter.status = Number(status)

    const docs = await Model.find(filter).sort({ labelFr: 1 })
    res.status(200).json(docs)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

const updateReferentiel = (Model) => async (req, res) => {
  try {
    const doc = await Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!doc) return res.status(404).json({ message: 'Document non trouvé.' })
    res.status(200).json(doc)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

const deleteReferentiel = (Model) => async (req, res) => {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id)
    if (!doc) return res.status(404).json({ message: 'Document non trouvé.' })
    res.status(200).json({ message: 'Supprimé avec succès.' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

module.exports = {
  // Utilisateurs
  getUsers,
  getUser,
  blockUser,
  deleteUser,
  getStats,
  // Référentiels — Degrees
  createDegree:     createReferentiel(Degree),
  getDegrees:       getReferentiels(Degree),
  updateDegree:     updateReferentiel(Degree),
  deleteDegree:     deleteReferentiel(Degree),
  // Référentiels — Skills
  createSkill:      createReferentiel(Skill),
  getSkills:        getReferentiels(Skill),
  updateSkill:      updateReferentiel(Skill),
  deleteSkill:     deleteReferentiel(Skill),
  // Référentiels — Languages
  createLanguage:   createReferentiel(Language),
  getLanguages:     getReferentiels(Language),
  updateLanguage:   updateReferentiel(Language),
  deleteLanguage:   deleteReferentiel(Language),
  // Référentiels — Areas
  createArea:       createReferentiel(AreaOfExpertise),
  getAreas:         getReferentiels(AreaOfExpertise),
  updateArea:       updateReferentiel(AreaOfExpertise),
  deleteArea:       deleteReferentiel(AreaOfExpertise),
  // Référentiels — Specialities
  createSpeciality: createReferentiel(Speciality),
  getSpecialities:  getReferentiels(Speciality),
  updateSpeciality: updateReferentiel(Speciality),
  deleteSpeciality: deleteReferentiel(Speciality)
}