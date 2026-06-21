const mongoose = require('mongoose')

const InvitationToApplySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true        // le candidat invité
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true        // l'offre pour laquelle on invite
  },
  cv: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CV',
    required: true        // le CV du candidat que le recruteur a vu
  },
  source: {
    type: Number,
    default: 0            // 0=plateforme, 1=externe
  },
  notified: {
    type: Boolean,
    default: false        // true = candidat a reçu la notification
  },
  applied: {
    type: Boolean,
    default: false        // true = candidat a accepté et postulé
  }
}, {
  timestamps: true
})

// un candidat ne peut être invité qu'une seule fois par offre
InvitationToApplySchema.index({ user: 1, job: 1 }, { unique: true })

module.exports = mongoose.model('InvitationToApply', InvitationToApplySchema)