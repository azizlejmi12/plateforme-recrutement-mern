const mongoose = require('mongoose')

const CVSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  dateOfBirth:   Date,
  mobile:        String,
  phone:         String,
  fax:           String,
  civilStatus: {
    type: Number   // 0=célibataire, 1=marié, 2=divorcé, 3=veuf
  },
  driverLicense: {
    type: Boolean,
    default: false
  },
  skills:             [String],   // ← texte libre
  areaOfExpertise:    [String],   // ← texte libre
  preferredPositions: [String],
  birthProvinceId:    Number,
  addressProvinceId:  Number,
  status: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('CV', CVSchema)