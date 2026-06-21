const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['CANDIDAT', 'RECRUTEUR', 'ADMIN'],
    default: 'CANDIDAT'
  },
  civility: {
    type: String,
    enum: ['M', 'Mme', 'Dr']
  },
  firstname: String,
  lastname:  String,
  image:     String,

  // Activation du compte
  isActive: {
    type: Boolean,
    default: false        // false jusqu'à confirmation email
  },
  activationToken:        String,  // token envoyé par email
  activationTokenExpire:  Date,    // expiration du token (24h)

  // Refresh Token
  refreshToken:           String,  // stocké en base pour vérification

  // Blocage
  blocked: {
    type: Boolean,
    default: false
  },
  startDateOfBlockage: Date,
  endDateOfBlockage:   Date,
  lastLogin:           Date,

  favoriteJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  status: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('User', UserSchema)