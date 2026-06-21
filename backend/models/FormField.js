const mongoose = require('mongoose')

const FormFieldOptionSchema = new mongoose.Schema({
  labelAr: String,          // libellé en arabe
  labelEn: String,          // libellé en anglais
  labelFr: String,          // libellé en français
  status: {
    type: Number,
    default: 1
  }
})

const FormFieldSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true          // l'offre à laquelle appartient ce champ
  },
  labelAr: String,          // question en arabe
  labelEn: String,          // question en anglais
  labelFr: String,          // question en français
  type: {
    type: Number,
    required: true
    // 0=texte libre
    // 1=nombre
    // 2=oui/non
    // 3=choix unique (radio)
    // 4=choix multiple (checkbox)
    // 5=date
  },
  required: {
    type: Boolean,
    default: false           // question obligatoire ou optionnelle
  },
  position: {
    type: Number,
    default: 0               // ordre d'affichage des questions
  },
  options: [FormFieldOptionSchema],  // choix possibles (si type 3 ou 4)
  status: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('FormField', FormFieldSchema)