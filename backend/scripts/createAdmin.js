const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')
require('dotenv').config()

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB connecté')

    const User = require('../models/User')

    // Vérifier si l'admin existe déjà
    const existing = await User.findOne({ email: 'admin@recrutement.com' })

    if (existing) {
      // Admin existe → on met juste à jour le mot de passe
      const hash = await bcrypt.hash('Admin@2026!', 10)
      await User.findOneAndUpdate(
        { email: 'admin@recrutement.com' },
        { password: hash }
      )
      console.log('✅ Mot de passe admin mis à jour !')

    } else {
      // Admin n'existe pas → on le crée
      const hash = await bcrypt.hash('Admin@2026!', 10)
      await User.create({
        username:  'admin',
        email:     'admin@recrutement.com',
        password:  hash,
        role:      'ADMIN',
        firstname: 'Super',
        lastname:  'Admin',
        isActive:  true
      })
      console.log('✅ Admin créé avec succès !')
    }

  } catch (err) {
    console.error('❌ Erreur :', err.message)
  } finally {
    process.exit(0)
  }
}

createAdmin()