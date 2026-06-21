const mongoose = require('mongoose')

const InterviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true        // le candidat convoqué
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true        // l'offre concernée
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true        // le recruteur qui a planifié
  },
  date: {
    type: Date,
    required: true        // date et heure de l'entretien
  },
  presence: {
    type: Number,
    default: 0            // 0=présentiel, 1=visio, 2=téléphone
  },
  source: {
    type: Number,
    default: 0            // 0=plateforme, 1=externe
  },
  statusAtct: {
    type: Number,
    default: 0            // statut côté administration
  },
  statusCandidate: {
    type: Number,
    default: 0            // 0=en attente, 1=accepté, 2=refusé
    // c'est le candidat qui répond à l'invitation
  },
  status: {
    type: Number,
    default: 0            // 0=planifié, 1=effectué, 2=annulé
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Interview', InterviewSchema)