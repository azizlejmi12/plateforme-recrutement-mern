const mongoose = require('mongoose')

const SkillSchema = new mongoose.Schema({
  labelAr: String,    // جافاسكريبت
  labelEn: String,    // JavaScript
  labelFr: String,    // JavaScript
  status: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Skill', SkillSchema)