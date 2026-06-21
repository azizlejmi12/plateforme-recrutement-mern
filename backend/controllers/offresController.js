const Job = require('../models/Job')

// =============================================
// GET TOUTES LES OFFRES
// =============================================
const getOffres = async (req, res) => {
  try {
    // Récupérer les paramètres de filtrage depuis l'URL
    // ex: /api/offres?sector=1&level=3&page=2
    const {
      sector,
      level,
      page  = 1,    // page par défaut = 1
      limit = 10    // 10 offres par page par défaut
    } = req.query

    // Construire le filtre dynamiquement
    const filter = { status: 1 }  // uniquement les offres publiées

    if (sector) filter.sector = Number(sector)
    if (level)  filter.level  = Number(level)

    // Calculer le nombre d'offres à sauter
    // page 1 → skip 0
    // page 2 → skip 10
    // page 3 → skip 20
    const skip = (page - 1) * limit

    // Récupérer les offres + le total
    const [offres, total] = await Promise.all([
      Job.find(filter)
        .populate('manager', 'firstname lastname email')  // infos recruteur
        .populate('degree')                               // diplômes requis
        .populate('languages')                            // langues requises
        .sort({ createdAt: -1 })                         // plus récentes en premier
        .skip(skip)
        .limit(Number(limit)),
      Job.countDocuments(filter)
    ])

    res.status(200).json({
      offres,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

// =============================================
// GET UNE OFFRE PAR ID
// =============================================
const getOffre = async (req, res) => {
  try {
    const offre = await Job.findById(req.params.id)
      .populate('manager', 'firstname lastname email')
      .populate('degree')
      .populate('languages')
      .populate('areasOfExpertise')
      .populate('specialities')

    if (!offre) {
      return res.status(404).json({ message: 'Offre non trouvée.' })
    }

    // Récupérer les champs du formulaire personnalisé si l'offre en a
    let formFields = []
    if (offre.customForm) {
      const FormField = require('../models/FormField')
      formFields = await FormField.find({ job: offre._id, status: 1 })
        .sort({ position: 1 })  // dans l'ordre défini par le recruteur
    }

    res.status(200).json({ offre, formFields })

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message })
  }
}

module.exports = { getOffres, getOffre }