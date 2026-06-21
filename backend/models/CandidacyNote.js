const mongoose = require('mongoose')

const CandidacyNoteSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true        // le recruteur qui écrit la note
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true        // le candidat concerné
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true        // l'offre concernée
  },
  type: {
    type: Number,
    default: 0            // 0=note générale, 1=note technique, 2=note RH
  },
  description: {
    type: String,
    required: true        // contenu de la note
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('CandidacyNote', CandidacyNoteSchema)