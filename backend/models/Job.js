const mongoose = require('mongoose')

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true        // le recruteur qui a créé l'offre
  },
  level: Number,          // niveau d'expérience requis
  salary: {
    amount: Number,
    currency: Number      // 0=TND, 1=EUR, 2=USD...
  },
  numberOfRecruits: {
    type: Number,
    default: 1
  },
  civilStatus:  Number,
  gender:       Number,   // 0=tous, 1=homme, 2=femme
  ageLimitMin:  Number,
  ageLimitMax:  Number,
  numberOfYearsOfExperience: Number,
  expectedRecruitmentDate: Date,
  applicationDeadline:     Date,
  startPublish:            Date,
  endPublish:              Date,
  endDateOfTreatment:      Date,
  sector:      Number,
  degree: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Degree'         // diplômes requis
  }],
  languages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Language'       // langues requises
  }],
  areasOfExpertise: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AreaOfExpertise'
  }],
  specialities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Speciality'
  }],
  duration: {
    value:  Number,       // ex: 6
    unit:   String        // ex: "mois", "ans"
  },
  hideApply: {
    type: Boolean,
    default: false        // cacher le bouton "postuler"
  },
  fullCv: {
    type: Boolean,
    default: false        // exiger un CV complet
  },
  customForm: {
    type: Boolean,
    default: false        // l'offre a un formulaire personnalisé
  },
  displayProposed: {
    type: Boolean,
    default: false
  },
  statusRecruiter: {
    type: Number,
    default: 0
  },
  statusAtct: {
    type: Number,
    default: 0
  },
  status: {
    type: Number,
    default: 0            // 0=brouillon, 1=publié, 2=clôturé
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Job', JobSchema)