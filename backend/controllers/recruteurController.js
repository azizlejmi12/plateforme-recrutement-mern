const User            = require('../models/User')
const Job             = require('../models/Job')
const Candidacy       = require('../models/Candidacy')
const Interview       = require('../models/Interview')
const CandidacyNote   = require('../models/CandidacyNote')
const InterviewNote   = require('../models/InterviewNote')
const Invitation      = require('../models/InvitationToApply')
const CV              = require('../models/CV')
const { sendInvitationEmail } = require('../config/email')


// =============================================
// PROFIL — GET
// =============================================
const getProfil = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -refreshToken -activationToken')

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' })
    }

    res.status(200).json(user)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// PROFIL — UPDATE
// =============================================
const updateProfil = async (req, res) => {
  try {
    const { firstname, lastname, civility, image } = req.body

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstname, lastname, civility, image },
      { new: true, runValidators: true }
    ).select('-password -refreshToken -activationToken')

    res.status(200).json(user)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// OFFRES — CREATE
// =============================================
const createOffre = async (req, res) => {
  try {
    const {
      title,
      level,
      salary,
      numberOfRecruits,
      gender,
      civilStatus,
      ageLimitMin,
      ageLimitMax,
      numberOfYearsOfExperience,
      expectedRecruitmentDate,
      applicationDeadline,
      startPublish,
      endPublish,
      sector,
      degree,
      languages,
      areasOfExpertise,
      specialities,
      duration,
      hideApply,
      fullCv,
      customForm,
      status
    } = req.body

    const offre = await Job.create({
      title,
      manager: req.user.id,   // le recruteur connecté
      level,
      salary,
      numberOfRecruits,
      gender,
      civilStatus,
      ageLimitMin,
      ageLimitMax,
      numberOfYearsOfExperience,
      expectedRecruitmentDate,
      applicationDeadline,
      startPublish,
      endPublish,
      sector,
      degree,
      languages,
      areasOfExpertise,
      specialities,
      duration,
      hideApply,
      fullCv,
      customForm,
      status: status || 0     // 0=brouillon par défaut
    })

    res.status(201).json(offre)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// OFFRES — GET MES OFFRES
// =============================================
const getMesOffres = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query

    const filter = { manager: req.user.id }
    if (status !== undefined) filter.status = Number(status)

    const skip = (page - 1) * limit

    const [offres, total] = await Promise.all([
      Job.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Job.countDocuments(filter)
    ])

    res.status(200).json({
      offres,
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
// OFFRES — GET ONE
// =============================================
const getOffre = async (req, res) => {
  try {
    const offre = await Job.findOne({
      _id:     req.params.id,
      manager: req.user.id      // s'assurer que c'est son offre
    })
      .populate('degree')
      .populate('languages')
      .populate('areasOfExpertise')
      .populate('specialities')

    if (!offre) {
      return res.status(404).json({ message: 'Offre non trouvée.' })
    }

    res.status(200).json(offre)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// OFFRES — UPDATE
// =============================================
const updateOffre = async (req, res) => {
  try {
    const offre = await Job.findOneAndUpdate(
      { _id: req.params.id, manager: req.user.id },
      req.body,
      { new: true, runValidators: true }
    )

    if (!offre) {
      return res.status(404).json({ message: 'Offre non trouvée.' })
    }

    res.status(200).json(offre)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// OFFRES — DELETE
// =============================================
const deleteOffre = async (req, res) => {
  try {
    const offre = await Job.findOneAndDelete({
      _id:     req.params.id,
      manager: req.user.id
    })

    if (!offre) {
      return res.status(404).json({ message: 'Offre non trouvée.' })
    }

    res.status(200).json({ message: 'Offre supprimée avec succès.' })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// CANDIDATURES — GET PAR OFFRE
// =============================================
const getCandidatures = async (req, res) => {
  try {
    // Vérifier que l'offre appartient au recruteur
    const offre = await Job.findOne({
      _id:     req.params.id,
      manager: req.user.id
    })

    if (!offre) {
      return res.status(404).json({ message: 'Offre non trouvée.' })
    }

    const { shortlisted, page = 1, limit = 10 } = req.query

    const filter = { job: req.params.id }
    if (shortlisted !== undefined) filter.shortlisted = shortlisted === 'true'

    const skip = (page - 1) * limit

    const [candidatures, total] = await Promise.all([
      Candidacy.find(filter)
        .populate('user', 'firstname lastname email civility')
        .populate('cv')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Candidacy.countDocuments(filter)
    ])

    res.status(200).json({
      candidatures,
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
// CANDIDATURES — SHORTLIST
// =============================================
const shortlistCandidat = async (req, res) => {
  try {
    const { shortlisted } = req.body  // true ou false

    // Vérifier que la candidature appartient à une offre du recruteur
    const candidature = await Candidacy.findById(req.params.id)
      .populate('job')

    if (!candidature) {
      return res.status(404).json({ message: 'Candidature non trouvée.' })
    }

    // Vérifier que l'offre appartient au recruteur
    if (candidature.job.manager.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé.' })
    }

    candidature.shortlisted = shortlisted
    await candidature.save()

    res.status(200).json({
      message: shortlisted ? 'Candidat présélectionné.' : 'Candidat retiré de la sélection.',
      candidature
    })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// INVITATIONS — CRÉER
// =============================================
const inviterCandidat = async (req, res) => {
  try {
    const { userId, jobId } = req.body

    // Vérifier que l'offre appartient au recruteur
    const offre = await Job.findOne({
      _id:     jobId,
      manager: req.user.id
    })

    if (!offre) {
      return res.status(404).json({ message: 'Offre non trouvée.' })
    }

    // Vérifier que le candidat existe
    const candidat = await User.findById(userId)
    if (!candidat || candidat.role !== 'CANDIDAT') {
      return res.status(404).json({ message: 'Candidat non trouvé.' })
    }

    // Vérifier que le candidat a un CV
    const cv = await CV.findOne({ user: userId })
    if (!cv) {
      return res.status(400).json({ message: 'Ce candidat n\'a pas de CV.' })
    }

    // Vérifier si déjà invité
    const existingInvitation = await Invitation.findOne({
      user: userId,
      job:  jobId
    })

    if (existingInvitation) {
      return res.status(400).json({ message: 'Ce candidat a déjà été invité.' })
    }

    // Créer l'invitation
    const invitation = await Invitation.create({
      user:     userId,
      job:      jobId,
      cv:       cv._id,
      notified: false,
      applied:  false
    })

    // Envoyer l'email de notification
    await sendInvitationEmail(
      candidat.email,
      candidat.firstname || candidat.username,
      offre.title
    )

    // Marquer comme notifié
    invitation.notified = true
    await invitation.save()

    res.status(201).json({
      message: 'Candidat invité et notifié avec succès.',
      invitation
    })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// ENTRETIENS — CRÉER
// =============================================
const planifierEntretien = async (req, res) => {
  try {
    const { userId, jobId, date, presence } = req.body

    // Vérifier que l'offre appartient au recruteur
    const offre = await Job.findOne({
      _id:     jobId,
      manager: req.user.id
    })

    if (!offre) {
      return res.status(404).json({ message: 'Offre non trouvée.' })
    }

    // Vérifier que le candidat a postulé
    const candidature = await Candidacy.findOne({
      user: userId,
      job:  jobId
    })

    if (!candidature) {
      return res.status(400).json({
        message: 'Ce candidat n\'a pas postulé à cette offre.'
      })
    }

    const entretien = await Interview.create({
      user:            userId,
      job:             jobId,
      createdBy:       req.user.id,
      date,
      presence:        presence || 0,
      statusCandidate: 0,   // en attente de réponse du candidat
      status:          0    // planifié
    })

    res.status(201).json({
      message: 'Entretien planifié avec succès.',
      entretien
    })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// ENTRETIENS — GET
// =============================================
const getMesEntretiens = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query

    const filter = { createdBy: req.user.id }
    if (status !== undefined) filter.status = Number(status)

    const skip = (page - 1) * limit

    const [entretiens, total] = await Promise.all([
      Interview.find(filter)
        .populate('user', 'firstname lastname email')
        .populate('job', 'title')
        .sort({ date: 1 })    // par date croissante
        .skip(skip)
        .limit(Number(limit)),
      Interview.countDocuments(filter)
    ])

    res.status(200).json({
      entretiens,
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
// ENTRETIENS — UPDATE
// =============================================
const updateEntretien = async (req, res) => {
  try {
    const entretien = await Interview.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true, runValidators: true }
    )

    if (!entretien) {
      return res.status(404).json({ message: 'Entretien non trouvé.' })
    }

    res.status(200).json(entretien)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// NOTES — CANDIDATURE
// =============================================
const addNoteCandidature = async (req, res) => {
  try {
    const { userId, jobId, type, description } = req.body

    // Vérifier que l'offre appartient au recruteur
    const offre = await Job.findOne({
      _id:     jobId,
      manager: req.user.id
    })

    if (!offre) {
      return res.status(403).json({ message: 'Accès refusé.' })
    }

    const note = await CandidacyNote.create({
      createdBy:   req.user.id,
      user:        userId,
      job:         jobId,
      type:        type || 0,
      description
    })

    res.status(201).json(note)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// NOTES — ENTRETIEN
// =============================================
const addNoteEntretien = async (req, res) => {
  try {
    const { interviewId, type, description } = req.body

    // Vérifier que l'entretien appartient au recruteur
    const entretien = await Interview.findOne({
      _id:       interviewId,
      createdBy: req.user.id
    })

    if (!entretien) {
      return res.status(403).json({ message: 'Accès refusé.' })
    }

    const note = await InterviewNote.create({
      createdBy:  req.user.id,
      interview:  interviewId,
      type:       type || 0,
      description
    })

    res.status(201).json(note)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}
// =============================================
// DASHBOARD STATS
// =============================================
const getDashboardStats = async (req, res) => {
  try {
    // Récupérer toutes les offres du recruteur
    const offres = await Job.find({ manager: req.user.id })
    const offreIds = offres.map(o => o._id)

    // Calculer toutes les stats en parallèle
    const [
      totalCandidatures,
      candidaturesEnAttente,
      candidaturesShortlisted,
      totalEntretiens,
      entretiensAVenir,
      entretiensEffectues,
      totalInvitations
    ] = await Promise.all([
      Candidacy.countDocuments({ job: { $in: offreIds } }),
      Candidacy.countDocuments({ job: { $in: offreIds }, status: 0 }),
      Candidacy.countDocuments({ job: { $in: offreIds }, shortlisted: true }),
      Interview.countDocuments({ createdBy: req.user.id }),
      Interview.countDocuments({ createdBy: req.user.id, date: { $gt: new Date() }, status: 0 }),
      Interview.countDocuments({ createdBy: req.user.id, status: 1 }),
      Invitation.countDocuments({ job: { $in: offreIds } })
    ])

    res.status(200).json({
      offres: {
        total:      offres.length,
        publiees:   offres.filter(o => o.status === 1).length,
        brouillons: offres.filter(o => o.status === 0).length,
        cloturees:  offres.filter(o => o.status === 2).length,
      },
      candidatures: {
        total:        totalCandidatures,
        enAttente:    candidaturesEnAttente,
        shortlisted:  candidaturesShortlisted,
      },
      entretiens: {
        total:     totalEntretiens,
        aVenir:    entretiensAVenir,
        effectues: entretiensEffectues,
      },
      invitations: {
        total: totalInvitations
      },
      // Dernières offres pour l'aperçu
      dernieresOffres: offres
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5)
    })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

module.exports = {
  getDashboardStats,
  getProfil,
  updateProfil,
  createOffre,
  getMesOffres,
  getOffre,
  updateOffre,
  deleteOffre,
  getCandidatures,
  shortlistCandidat,
  inviterCandidat,
  planifierEntretien,
  getMesEntretiens,
  updateEntretien,
  addNoteCandidature,
  addNoteEntretien
}