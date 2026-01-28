import { useState, useMemo } from 'react'

// Formater la date
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Formater la date complete
const formatDateFull = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function Dashboard({ archive, onLoadFiche, onDeleteFiche }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, completed, in_progress, paid, unpaid
  const [sortBy, setSortBy] = useState('date_desc') // date_desc, date_asc, name

  // Filtrer et trier les commandes
  const filteredArchive = useMemo(() => {
    let result = [...archive]

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(fiche =>
        fiche.clientName?.toLowerCase().includes(term) ||
        fiche.clientPhone?.includes(term) ||
        fiche.reference?.toLowerCase().includes(term)
      )
    }

    // Filtre par statut
    if (filterStatus !== 'all') {
      result = result.filter(fiche => {
        switch (filterStatus) {
          case 'completed':
            return fiche.productionSteps?.completed
          case 'in_progress':
            return !fiche.productionSteps?.completed
          case 'paid':
            return fiche.isPaid
          case 'unpaid':
            return !fiche.isPaid
          default:
            return true
        }
      })
    }

    // Tri
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'date_asc':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'name':
          return (a.clientName || '').localeCompare(b.clientName || '')
        default:
          return 0
      }
    })

    return result
  }, [archive, searchTerm, filterStatus, sortBy])

  // Grouper par date
  const groupedByDate = useMemo(() => {
    const groups = {}
    filteredArchive.forEach(fiche => {
      const date = formatDateFull(fiche.createdAt)
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(fiche)
    })
    return groups
  }, [filteredArchive])

  // Statistiques
  const stats = useMemo(() => {
    const total = archive.length
    const completed = archive.filter(f => f.productionSteps?.completed).length
    const inProgress = total - completed
    const paid = archive.filter(f => f.isPaid).length
    const unpaid = total - paid
    const totalRevenue = archive.reduce((sum, f) => sum + (f.tshirtPrice || 0) + (f.personalizationPrice || 0), 0)
    const paidRevenue = archive.filter(f => f.isPaid).reduce((sum, f) => sum + (f.tshirtPrice || 0) + (f.personalizationPrice || 0), 0)

    return { total, completed, inProgress, paid, unpaid, totalRevenue, paidRevenue }
  }, [archive])

  return (
    <div className="animate-fade-in">
      {/* Header Dashboard */}
      <div className="mb-8">
        <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">
          Archive des Commandes
        </h2>
        <p className="text-stone-500">
          Historique et suivi de toutes les commandes validees
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-100">
          <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Total</p>
          <p className="text-2xl font-black text-stone-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-100">
          <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Terminees</p>
          <p className="text-2xl font-black text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-100">
          <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">En cours</p>
          <p className="text-2xl font-black text-stone-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-100">
          <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">CA Total</p>
          <p className="text-2xl font-black text-stone-900">{stats.totalRevenue} EUR</p>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-100 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher par nom, telephone, reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-stone-200 bg-white text-sm
                           focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtre statut */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 px-4 rounded-lg border border-stone-200 bg-white text-sm font-medium
                       focus:outline-none focus:ring-2 focus:ring-stone-900"
          >
            <option value="all">Tous les statuts</option>
            <option value="completed">Terminees</option>
            <option value="in_progress">En cours</option>
            <option value="paid">Payees</option>
            <option value="unpaid">Non payees</option>
          </select>

          {/* Tri */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 px-4 rounded-lg border border-stone-200 bg-white text-sm font-medium
                       focus:outline-none focus:ring-2 focus:ring-stone-900"
          >
            <option value="date_desc">Plus recentes</option>
            <option value="date_asc">Plus anciennes</option>
            <option value="name">Par nom</option>
          </select>
        </div>
      </div>

      {/* Liste des commandes */}
      {archive.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-stone-100 text-center">
          <svg className="w-16 h-16 mx-auto text-stone-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-stone-500 text-lg font-medium">Aucune commande archivee</p>
          <p className="text-stone-400 text-sm mt-1">Les commandes validees apparaitront ici</p>
        </div>
      ) : filteredArchive.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-stone-100 text-center">
          <p className="text-stone-500 text-lg font-medium">Aucun resultat</p>
          <p className="text-stone-400 text-sm mt-1">Essayez de modifier vos filtres</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([date, fiches]) => (
            <div key={date}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-stone-900 text-white text-xs font-bold rounded-full uppercase">
                  {date}
                </span>
                <span className="text-xs text-stone-400">
                  {fiches.length} commande{fiches.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Liste des fiches pour cette date */}
              <div className="space-y-2">
                {fiches.map(fiche => (
                  <FicheCard
                    key={fiche.id}
                    fiche={fiche}
                    onLoad={() => onLoadFiche(fiche.id)}
                    onDelete={() => onDeleteFiche(fiche.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Composant carte de fiche
function FicheCard({ fiche, onLoad, onDelete }) {
  const isCompleted = fiche.productionSteps?.completed
  const total = (fiche.tshirtPrice || 0) + (fiche.personalizationPrice || 0)

  // Calculer la progression du stepper
  const steps = ['validated', 'preparation', 'production', 'completed']
  const completedSteps = steps.filter(s => fiche.productionSteps?.[s]).length
  const progress = (completedSteps / steps.length) * 100

  return (
    <div
      className={`
        bg-white rounded-xl p-4 shadow-sm border transition-all duration-200
        hover:shadow-md cursor-pointer
        ${isCompleted ? 'border-green-200 bg-green-50/30' : 'border-stone-100'}
      `}
      onClick={onLoad}
    >
      <div className="flex items-center gap-4">
        {/* Indicateur de statut */}
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
          ${isCompleted ? 'bg-green-500' : 'bg-stone-200'}
        `}>
          {isCompleted ? (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span className="text-sm font-bold text-stone-600">{completedSteps}/{steps.length}</span>
          )}
        </div>

        {/* Infos client */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-stone-900 truncate">{fiche.clientName}</h3>
            {fiche.reference && (
              <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs font-medium rounded">
                {fiche.reference}
              </span>
            )}
          </div>
          <p className="text-sm text-stone-500">{fiche.clientPhone}</p>
        </div>

        {/* Taille */}
        <div className="hidden sm:block">
          <span className="px-3 py-1 bg-stone-100 text-stone-700 text-sm font-bold rounded-lg">
            {fiche.size || 'M'}
          </span>
        </div>

        {/* Prix */}
        <div className="text-right">
          <p className={`text-lg font-black ${fiche.isPaid ? 'text-green-600' : 'text-red-600'}`}>
            {total} EUR
          </p>
          <p className={`text-xs font-medium ${fiche.isPaid ? 'text-green-600' : 'text-red-500'}`}>
            {fiche.isPaid ? 'PAYE' : 'NON PAYE'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Barre de progression */}
      {!isCompleted && (
        <div className="mt-3 pt-3 border-t border-stone-100">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-stone-900 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-stone-500 font-medium">
              {completedSteps}/{steps.length} etapes
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
