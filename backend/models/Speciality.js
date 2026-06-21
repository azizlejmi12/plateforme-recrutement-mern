const mongoose = require('mongoose')

const SpecialitySchema = new mongoose.Schema({
  labelAr: String,    // تطوير الويب
  labelEn: String,    // Web Development
  labelFr: String,    // Développement Web
  level: Number,
  areaOfExpertise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AreaOfExpertise'  // une spécialité appartient à un domaine
  },
  status: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Speciality', SpecialitySchema)