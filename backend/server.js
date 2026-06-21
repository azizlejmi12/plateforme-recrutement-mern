require('dotenv').config()
const express    = require('express')
const cors       = require('cors')
const cookieParser = require('cookie-parser')
const connectDB  = require('./config/db')

connectDB()
require('./models/User')
require('./models/CV')
require('./models/Job')
require('./models/Candidacy')
require('./models/Interview')
require('./models/CandidacyNote')
require('./models/InterviewNote')
require('./models/InvitationToApply')
require('./models/FormField')
require('./models/Degree')
require('./models/Skill')
require('./models/Language')
require('./models/AreaOfExpertise')
require('./models/Speciality')

const app = express()

app.use(cors({
  origin:      process.env.FRONTEND_URL,  // autorise uniquement React
  credentials: true                        // autorise les cookies
}))
app.use(express.json())
app.use(cookieParser())    // permet de lire req.cookies

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/offres', require('./routes/offres')) 
app.use('/api/candidat',  require('./routes/candidat'))
app.use('/api/recruteur',  require('./routes/recruteur'))
app.use('/api/admin',     require('./routes/admin'))

app.get('/', (req, res) => res.json({ message: '🚀 API recrutement OK' }))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`))