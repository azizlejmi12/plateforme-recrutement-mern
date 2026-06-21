const mongoose = require('mongoose')

const CVSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true        // un seul CV par utilisateur
  },
  dateOfBirth: Date,
  mobile:  String,
  phone:   String,
  fax:     String,
  civilStatus: {
    type: Number        // 0=célibataire, 1=marié, 2=divorcé...
  },
  driverLicense: {
    type: Boolean,
    default: false
  },
  skills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'        // relation vers le modèle Skill
  }],
  areaOfExpertise: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AreaOfExpertise'
  }],
  preferredPositions: [String],   // liste de postes souhaités
  birthProvinceId:   Number,
  addressProvinceId: Number,
  status: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('CV', CVSchema)