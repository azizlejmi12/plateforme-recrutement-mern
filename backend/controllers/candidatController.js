const User       = require('../models/User')
const CV         = require('../models/CV')
const Job        = require('../models/Job')
const Candidacy  = require('../models/Candidacy')
const Invitation = require('../models/InvitationToApply')
const Interview  = require('../models/Interview')

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
    // Champs autorisés à modifier
    const { firstname, lastname, civility, image } = req.body

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstname, lastname, civility, image },
      {
        new:          true,   // retourner le document mis à jour
        runValidators: true   // vérifier les validations du schéma
      }
    ).select('-password -refreshToken -activationToken')

    res.status(200).json(user)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// CV — CREATE
// =============================================
const createCV = async (req, res) => {
  try {
    // Vérifier si le candidat a déjà un CV
    const existingCV = await CV.findOne({ user: req.user.id })
    if (existingCV) {
      return res.status(400).json({
        message: 'Tu as déjà un CV. Utilise la route PUT pour le modifier.'
      })
    }

    const {
      dateOfBirth,
      mobile,
      github,
      linkedin,
      civilStatus,
      driverLicense,
      skills,
      areaOfExpertise,
      preferredPositions
    } = req.body

    const cv = await CV.create({
      user: req.user.id,
      dateOfBirth,
      mobile,
      github,
      linkedin,
      civilStatus,
      driverLicense,
      skills,
      areaOfExpertise,
      preferredPositions
    })

    res.status(201).json(cv)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// CV — UPDATE
// =============================================
const updateCV = async (req, res) => {
  try {
    const cv = await CV.findOneAndUpdate(
      { user: req.user.id },    // chercher le CV de cet utilisateur
      req.body,                  // mettre à jour avec les données envoyées
      { new: true, runValidators: true }
    )
      .populate('skills')
      .populate('areaOfExpertise')

    if (!cv) {
      return res.status(404).json({
        message: 'CV non trouvé. Crée d\'abord un CV avec POST.'
      })
    }

    res.status(200).json(cv)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// CV — GET
// =============================================
const getCV = async (req, res) => {
  try {
    const cv = await CV.findOne({ user: req.user.id })
      .populate('skills')
      .populate('areaOfExpertise')

    if (!cv) {
      return res.status(404).json({ message: 'Aucun CV trouvé.' })
    }

    res.status(200).json(cv)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// POSTULER À UNE OFFRE
// =============================================
const postuler = async (req, res) => {
  try {
    const { jobId, data } = req.body
    // data = réponses au formulaire personnalisé (optionnel)

    // 1. Vérifier que l'offre existe et est publiée
    const job = await Job.findById(jobId)
    if (!job || job.status !== 1) {
      return res.status(404).json({ message: 'Offre non trouvée ou clôturée.' })
    }

    // 2. Vérifier que la deadline n'est pas dépassée
    if (job.applicationDeadline && new Date() > job.applicationDeadline) {
      return res.status(400).json({ message: 'La date limite de candidature est dépassée.' })
    }

    // 3. Vérifier que le candidat a un CV
    const cv = await CV.findOne({ user: req.user.id })
    if (!cv) {
      return res.status(400).json({
        message: 'Tu dois créer un CV avant de postuler.'
      })
    }

    // 4. Vérifier si déjà postulé (géré aussi par l'index unique)
    const existingCandidacy = await Candidacy.findOne({
      user: req.user.id,
      job:  jobId
    })
    if (existingCandidacy) {
      return res.status(400).json({ message: 'Tu as déjà postulé à cette offre.' })
    }

    // 5. Créer la candidature
    const candidacy = await Candidacy.create({
      user:   req.user.id,
      job:    jobId,
      cv:     cv._id,
      data,             // réponses formulaire personnalisé
      status: 0         // en attente
    })

    res.status(201).json({
      message: 'Candidature envoyée avec succès !',
      candidacy
    })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// MES CANDIDATURES
// =============================================
const getMesCandidatures = async (req, res) => {
  try {
    const candidatures = await Candidacy.find({ user: req.user.id })
      .populate('job', 'title sector level applicationDeadline status')
      .populate('cv')
      .sort({ createdAt: -1 })  // plus récentes en premier

    res.status(200).json(candidatures)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// DÉTAIL D'UNE CANDIDATURE
// =============================================
const getCandidature = async (req, res) => {
  try {
    const candidature = await Candidacy.findOne({
      _id:  req.params.id,
      user: req.user.id    // s'assurer que c'est bien sa candidature
    })
      .populate('job')
      .populate('cv')

    if (!candidature) {
      return res.status(404).json({ message: 'Candidature non trouvée.' })
    }

    res.status(200).json(candidature)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// FAVORIS — AJOUTER
// =============================================
const addFavori = async (req, res) => {
  try {
    const { jobId } = req.params

    // Vérifier que l'offre existe
    const job = await Job.findById(jobId)
    if (!job) {
      return res.status(404).json({ message: 'Offre non trouvée.' })
    }

    // $addToSet = ajouter uniquement si pas déjà dans le tableau
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { favoriteJobs: jobId } },
      { new: true }
    ).select('favoriteJobs')

    res.status(200).json({
      message: 'Offre ajoutée aux favoris.',
      favoriteJobs: user.favoriteJobs
    })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// FAVORIS — RETIRER
// =============================================
const removeFavori = async (req, res) => {
  try {
    const { jobId } = req.params

    // $pull = retirer un élément du tableau
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { favoriteJobs: jobId } },
      { new: true }
    ).select('favoriteJobs')

    res.status(200).json({
      message: 'Offre retirée des favoris.',
      favoriteJobs: user.favoriteJobs
    })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// FAVORIS — GET
// =============================================
const getMesFavoris = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'favoriteJobs',
        match: { status: 1 },  // uniquement les offres encore publiées
        populate: {
          path:   'manager',
          select: 'firstname lastname'
        }
      })
      .select('favoriteJobs')

    res.status(200).json(user.favoriteJobs)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// INVITATIONS — GET
// =============================================
const getMesInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({ user: req.user.id })
      .populate('job', 'title sector level applicationDeadline')
      .populate('cv')
      .sort({ createdAt: -1 })

    res.status(200).json(invitations)

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// INVITATIONS — RÉPONDRE
// =============================================
const repondreInvitation = async (req, res) => {
  try {
    const { reponse } = req.body
    // reponse = true (accepter) ou false (refuser)

    const invitation = await Invitation.findOne({
      _id:  req.params.id,
      user: req.user.id
    })

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation non trouvée.' })
    }

    if (invitation.applied) {
      return res.status(400).json({ message: 'Tu as déjà répondu à cette invitation.' })
    }

    if (reponse === true) {
      // Accepter → créer une candidature automatiquement
      const existingCandidacy = await Candidacy.findOne({
        user: req.user.id,
        job:  invitation.job
      })

      if (!existingCandidacy) {
        await Candidacy.create({
          user:   req.user.id,
          job:    invitation.job,
          cv:     invitation.cv,
          source: 1,    // 1 = via invitation
          status: 0
        })
      }

      invitation.applied = true
      await invitation.save()

      res.status(200).json({ message: 'Invitation acceptée ! Candidature créée.' })

    } else {
      // Refuser → juste marquer l'invitation
      invitation.applied = false
      await invitation.save()

      res.status(200).json({ message: 'Invitation refusée.' })
    }

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

const getMesEntretiens = async (req, res) => {
  try {
    const entretiens = await Interview.find({ user: req.user.id })
      .populate('job', 'title')
      .populate('createdBy', 'firstname lastname email')
      .sort({ date: 1 })
    res.status(200).json(entretiens)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

const repondreEntretien = async (req, res) => {
  try {
    const { reponse } = req.body
    const entretien = await Interview.findOne({ _id: req.params.id, user: req.user.id })
    if (!entretien) return res.status(404).json({ message: 'Entretien non trouvé.' })
    if (entretien.statusCandidate !== 0) return res.status(400).json({ message: 'Vous avez déjà répondu.' })
    entretien.statusCandidate = reponse
    await entretien.save()
    res.status(200).json({ message: reponse === 1 ? 'Entretien accepté !' : 'Entretien refusé.', entretien })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

module.exports = {
  getProfil,
  updateProfil,
  createCV,
  updateCV,
  getCV,
  postuler,
  getMesCandidatures,
  getCandidature,
  addFavori,
  removeFavori,
  getMesFavoris,
  getMesInvitations,
  repondreInvitation,
  getMesEntretiens,
  repondreEntretien
}