const mongoose = require('mongoose')

const CandidacySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true        // le candidat qui postule
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true        // l'offre concernée
  },
  cv: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CV',
    required: true        // le CV utilisé pour postuler
  },
  source: {
    type: Number,
    default: 0            // 0=plateforme, 1=invitation, 2=externe
  },
  data: {
    type: mongoose.Schema.Types.Mixed  
    // réponses au formulaire personnalisé de l'offre
    // ex: { "question1": "réponse", "question2": 42 }
  },
  shortlisted: {
    type: Boolean,
    default: false        // recruteur a présélectionné ce candidat
  },
  proposed: {
    type: Boolean,
    default: false        // candidat proposé pour un entretien
  },
  status: {
    type: Number,
    default: 0
    // 0=en attente, 1=vue, 2=acceptée, 3=refusée
  }
}, {
  timestamps: true
})

// Empêche un candidat de postuler deux fois à la même offre
CandidacySchema.index({ user: 1, job: 1 }, { unique: true })

module.exports = mongoose.model('Candidacy', CandidacySchema)