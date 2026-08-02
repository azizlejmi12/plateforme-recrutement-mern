import { useState, useEffect } from 'react'
import api from '../../services/api'
import Layout from '../../components/Layout'
import { navItems } from './Dashboard'
import { Search, MapPin, Code, Briefcase, Send } from 'lucide-react'

// Gouvernorats tunisiens
const gouvernorats = {
  1: 'Ariana', 2: 'Béja', 3: 'Ben Arous', 4: 'Bizerte',
  5: 'Gabès', 6: 'Gafsa', 7: 'Jendouba', 8: 'Kairouan',
  9: 'Kasserine', 10: 'Kébili', 11: 'Le Kef', 12: 'Mahdia',
  13: 'Manouba', 14: 'Médenine', 15: 'Monastir', 16: 'Nabeul',
  17: 'Sfax', 18: 'Sidi Bouzid', 19: 'Siliana', 20: 'Sousse',
  21: 'Tataouine', 22: 'Tozeur', 23: 'Tunis', 24: 'Zaghouan'
}

function CVtheque() {

  // ─────────────────────────────────────────────
  // STATES
  // ─────────────────────────────────────────────
  const [cvs, setCvs]               = useState([])
  const [offres, setOffres]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [expandedId, setExpandedId] = useState(null)

  // Filtres
  const [skills, setSkills]         = useState('')
  const [gouvernorat, setGouvernorat] = useState('')
  const [poste, setPoste]           = useState('')

  // Invitation
  const [inviting, setInviting]           = useState(null)   // ID CV en cours
  const [selectedOffre, setSelectedOffre] = useState({})     // { cvId: offreId }
  const [inviteSuccess, setInviteSuccess] = useState({})     // { cvId: true/false }


  // ─────────────────────────────────────────────
  // CHARGEMENT
  // ─────────────────────────────────────────────
  useEffect(() => {
    fetchCVs()
  }, [page])

  useEffect(() => {
    fetchOffres()
  }, [])

  const fetchCVs = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 8 }
      if (skills)      params.skills      = skills
      if (gouvernorat) params.gouvernorat = gouvernorat
      if (poste)       params.poste       = poste

      const res = await api.get('/recruteur/cvtheque', { params })
      setCvs(res.data.cvs || [])
      setTotalPages(res.data.pagination?.totalPages || 1)
    } catch (err) {
      setError('Impossible de charger la CVthèque.')
    } finally {
      setLoading(false)
    }
  }

  const fetchOffres = async () => {
    try {
      const res = await api.get('/recruteur', { params: { limit: 100, status: 1 } })
      setOffres(res.data.offres || [])
    } catch (err) {
      console.error('Erreur chargement offres')
    }
  }

  // Rechercher avec les filtres
  const handleSearch = () => {
    setPage(1)
    fetchCVs()
  }

  const handleReset = () => {
    setSkills('')
    setGouvernorat('')
    setPoste('')
    setPage(1)
    fetchCVs()
  }


  // ─────────────────────────────────────────────
  // ENVOYER UNE INVITATION
  // ─────────────────────────────────────────────
  const handleInviter = async (cv) => {
    const jobId = selectedOffre[cv._id]
    if (!jobId) {
      alert('Veuillez sélectionner une offre.')
      return
    }

    setInviting(cv._id)
    try {
      await api.post('/recruteur/invitations', {
        userId: cv.user._id,
        jobId
      })
      setInviteSuccess(prev => ({ ...prev, [cv._id]: true }))
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de l\'invitation.'
      alert(msg)
    } finally {
      setInviting(null)
    }
  }


  // ─────────────────────────────────────────────
  // RENDU JSX
  // ─────────────────────────────────────────────
  return (
    <Layout navItems={navItems}>

      {/* ── En-tête ── */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-gray-900 font-semibold">
          CVthèque
        </h1>
        <p className="text-gray-500 mt-1">
          Parcourez les profils des candidats et invitez-les à postuler.
        </p>
      </div>

      {/* ── Filtres ── */}
      <div className="bg-white border border-border rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">

          {/* Filtre compétences */}
          <div className="relative">
            <Code size={15} className="absolute left-3 top-1/2 -translate-y-1/2
                                       text-gray-400" />
            <input
              type="text"
              placeholder="Compétence (ex: React)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border
                         text-sm focus:outline-none focus:ring-2 focus:ring-primary/30
                         focus:border-primary transition"
            />
          </div>

          {/* Filtre gouvernorat */}
          <div className="relative">
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2
                                          text-gray-400" />
            <select
              value={gouvernorat}
              onChange={(e) => setGouvernorat(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border
                         text-sm text-gray-600 focus:outline-none
                         focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            >
              <option value="">Tous les gouvernorats</option>
              {Object.entries(gouvernorats).map(([id, nom]) => (
                <option key={id} value={id}>{nom}</option>
              ))}
            </select>
          </div>

          {/* Filtre poste souhaité */}
          <div className="relative">
            <Briefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2
                                             text-gray-400" />
            <input
              type="text"
              placeholder="Poste souhaité (ex: Dev React)"
              value={poste}
              onChange={(e) => setPoste(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border
                         text-sm focus:outline-none focus:ring-2 focus:ring-primary/30
                         focus:border-primary transition"
            />
          </div>

        </div>

        {/* Boutons recherche */}
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white
                       rounded-lg text-sm font-medium hover:bg-primary/90 transition"
          >
            <Search size={15} />
            Rechercher
          </button>
          {(skills || gouvernorat || poste) && (
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-border text-gray-500 rounded-lg
                         text-sm hover:bg-gray-50 transition"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* ── Chargement ── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent
                          rounded-full animate-spin" />
        </div>
      )}

      {/* ── Erreur ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700
                        px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {/* ── Liste des CVs ── */}
      {!loading && !error && (
        <>
          {cvs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">Aucun profil trouvé.</p>
              <p className="text-gray-400 text-sm mt-1">
                Essayez de modifier vos filtres de recherche.
              </p>
            </div>
          ) : (
            <div className="space-y-3">

              <p className="text-sm text-gray-500 font-mono mb-4">
                {cvs.length} profil{cvs.length > 1 ? 's' : ''} trouvé{cvs.length > 1 ? 's' : ''}
              </p>

              {cvs.map((cv) => (
                <div
                  key={cv._id}
                  className="bg-white border border-border rounded-xl overflow-hidden"
                >

                  {/* ── Ligne principale ── */}
                  <div
                    className="flex items-center gap-4 px-5 py-4 cursor-pointer
                                hover:bg-gray-50 transition"
                    onClick={() => setExpandedId(
                      prev => prev === cv._id ? null : cv._id
                    )}
                  >

                    {/* Initiales */}
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary
                                    flex items-center justify-center font-semibold
                                    text-sm flex-shrink-0">
                      {cv.user?.firstname?.[0]?.toUpperCase() || '?'}
                      {cv.user?.lastname?.[0]?.toUpperCase() || ''}
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">
                        {cv.user?.civility} {cv.user?.firstname} {cv.user?.lastname}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {cv.user?.email}
                      </p>
                    </div>

                    {/* Gouvernorat */}
                    {cv.addressProvinceId && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={12} />
                        {gouvernorats[cv.addressProvinceId]}
                      </div>
                    )}

                    {/* Compétences preview */}
                    {cv.skills?.length > 0 && (
                      <div className="hidden md:flex gap-1.5">
                        {cv.skills.slice(0, 3).map((skill, i) => (
                          <span key={i}
                                className="px-2 py-0.5 bg-primary/10 text-primary
                                           rounded-full text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                        {cv.skills.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500
                                           rounded-full text-xs">
                            +{cv.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <span className="text-gray-400 text-xs">
                      {expandedId === cv._id ? '▲' : '▼'}
                    </span>

                  </div>

                  {/* ── Détail expandable ── */}
                  {expandedId === cv._id && (
                    <div className="border-t border-border px-5 py-4 bg-gray-50 space-y-4">

                      {/* Infos CV */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {cv.mobile && (
                          <CVItem label="Mobile" value={cv.mobile} />
                        )}
                        {cv.linkedin && (
                          <CVItem label="LinkedIn" value={cv.linkedin} />
                        )}
                        {cv.github && (
                          <CVItem label="GitHub" value={cv.github} />
                        )}
                        {cv.dateOfBirth && (
                          <CVItem
                            label="Date de naissance"
                            value={new Date(cv.dateOfBirth).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'long', year: 'numeric'
                            })}
                          />
                        )}
                        {cv.addressProvinceId && (
                          <CVItem
                            label="Gouvernorat de résidence"
                            value={gouvernorats[cv.addressProvinceId]}
                          />
                        )}
                        {cv.birthProvinceId && (
                          <CVItem
                            label="Gouvernorat de naissance"
                            value={gouvernorats[cv.birthProvinceId]}
                          />
                        )}
                      </div>

                      {/* Compétences */}
                      {cv.skills?.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1.5">Compétences</p>
                          <div className="flex flex-wrap gap-1.5">
                            {cv.skills.map((skill, i) => (
                              <span key={i}
                                    className="px-2 py-0.5 bg-primary/10 text-primary
                                               rounded-full text-xs font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Domaines */}
                      {cv.areaOfExpertise?.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1.5">
                            Domaines d'expertise
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {cv.areaOfExpertise.map((area, i) => (
                              <span key={i}
                                    className="px-2 py-0.5 bg-accent/10 text-accent
                                               rounded-full text-xs font-medium">
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Postes souhaités */}
                      {cv.preferredPositions?.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1.5">Postes souhaités</p>
                          <div className="flex flex-wrap gap-1.5">
                            {cv.preferredPositions.map((pos, i) => (
                              <span key={i}
                                    className="px-2 py-0.5 bg-success/10 text-success
                                               rounded-full text-xs font-medium">
                                {pos}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ── Inviter ── */}
                      <div className="pt-3 border-t border-border">
                        {inviteSuccess[cv._id] ? (
                          <p className="text-sm text-success font-medium flex
                                        items-center gap-1.5">
                            ✅ Invitation envoyée avec succès !
                          </p>
                        ) : (
                          <div className="flex items-center gap-3">
                            <select
                              value={selectedOffre[cv._id] || ''}
                              onChange={(e) => setSelectedOffre(prev => ({
                                ...prev,
                                [cv._id]: e.target.value
                              }))}
                              className="flex-1 px-3 py-2 rounded-lg border border-border
                                         text-sm focus:outline-none focus:ring-2
                                         focus:ring-primary/30 focus:border-primary transition"
                            >
                              <option value="">Sélectionner une offre...</option>
                              {offres.map((offre) => (
                                <option key={offre._id} value={offre._id}>
                                  {offre.title}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleInviter(cv)}
                              disabled={inviting === cv._id || !selectedOffre[cv._id]}
                              className="flex items-center gap-1.5 px-4 py-2 bg-accent
                                         text-white rounded-lg text-sm font-medium
                                         hover:bg-accent/90 transition
                                         disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Send size={14} />
                              {inviting === cv._id ? 'Envoi...' : 'Inviter'}
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-6">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg border border-border text-sm
                               hover:bg-gray-50 disabled:opacity-40 transition"
                  >
                    ← Précédent
                  </button>
                  <span className="text-sm font-mono text-gray-600">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-border text-sm
                               hover:bg-gray-50 disabled:opacity-40 transition"
                  >
                    Suivant →
                  </button>
                </div>
              )}

            </div>
          )}
        </>
      )}

    </Layout>
  )
}

function CVItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 font-mono uppercase mb-0.5">{label}</p>
      <p className="text-sm text-gray-700 truncate">{value || '—'}</p>
    </div>
  )
}

export default CVtheque