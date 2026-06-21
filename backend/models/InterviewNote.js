const mongoose = require('mongoose')

const InterviewNoteSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true        // le recruteur qui écrit la note
  },
  interview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true        // l'entretien concerné
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

module.exports = mongoose.model('InterviewNote', InterviewNoteSchema)