const mongoose = require('mongoose')

const AreaOfExpertiseSchema = new mongoose.Schema({
  labelAr: String,    // تكنولوجيا المعلومات
  labelEn: String,    // Information Technology
  labelFr: String,    // Informatique
  status: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('AreaOfExpertise', AreaOfExpertiseSchema)