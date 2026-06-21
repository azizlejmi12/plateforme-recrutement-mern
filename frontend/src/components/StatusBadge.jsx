function StatusBadge({ status, type = 'candidacy' }) {

  // Configuration des statuts selon le contexte (candidature, offre, entretien)
  const configs = {
    candidacy: {
      0: { label: 'En attente', color: '#C8762A' },
      1: { label: 'Vue',        color: '#1E3A5F' },
      2: { label: 'Acceptée',   color: '#2D6A4F' },
      3: { label: 'Refusée',    color: '#B91C1C' }
    },
    job: {
      0: { label: 'Brouillon',  color: '#6B7280' },
      1: { label: 'Publiée',    color: '#2D6A4F' },
      2: { label: 'Clôturée',   color: '#B91C1C' }
    },
    interview: {
      0: { label: 'Planifié',   color: '#1E3A5F' },
      1: { label: 'Effectué',   color: '#2D6A4F' },
      2: { label: 'Annulé',     color: '#B91C1C' }
    }
  }

  const config = configs[type]?.[status] || { label: 'Inconnu', color: '#6B7280' }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-white border"
          style={{ borderColor: config.color, color: config.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }} />
      {config.label}
    </span>
  )
}

export default StatusBadge