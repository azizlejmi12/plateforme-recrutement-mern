const mongoose = require('mongoose')

const DegreeSchema = new mongoose.Schema({
  labelAr: String,    // باكالوريا
  labelEn: String,    // Bachelor
  labelFr: String,    // Baccalauréat
  level: {
    type: Number,
    // 1=Bac, 2=Bac+2, 3=Licence, 4=Master, 5=Doctorat
  },
  status: {
    type: Number,
    default: 1        // 1=actif, 0=inactif
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Degree', DegreeSchema)