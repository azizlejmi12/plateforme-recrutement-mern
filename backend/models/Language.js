const mongoose = require('mongoose')

const LanguageSchema = new mongoose.Schema({
  labelAr: String,    // العربية
  labelEn: String,    // Arabic
  labelFr: String,    // Arabe
  code: {
    type: String,     // ar, fr, en, de...
    maxlength: 5
  },
  status: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Language', LanguageSchema)