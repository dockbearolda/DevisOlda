import { useState, useMemo, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Shirt } from 'lucide-react'
import OrderForm from './components/OrderForm'
import TshirtMockup from './components/TshirtMockup'
import { generateOrderId, formatDateFr } from './utils/constants'
import { sendToGoogleSheets } from './utils/googleSheets'

// État initial d'une commande vierge
const createEmptyOrder = () => ({
  idCommande: generateOrderId(),
  date: formatDateFr(),
  clientName: '',
  telephone: '',
  collection: '',
  reference: '',
  echeance: '',
  taille: 'M',
  couleurTshirt: '#FFFFFF',
  couleurLogo: '#111827',
  logoAvant: null,
  logoArriere: null,
  prixTshirt: '',
  prixPerso: '',
  paye: false,
  design: '',
})

export default function App() {
  const [order, setOrder] = useState(createEmptyOrder)
  const [status, setStatus] = useState(null) // null | 'sending' | 'success' | 'error'

  // Validation : nom du client obligatoire + taille sélectionnée
  const isValid = useMemo(() => {
    return order.clientName.trim().length > 0 && order.taille
  }, [order.clientName, order.taille])

  // Total calculé
  const total = useMemo(() => {
    return ((parseFloat(order.prixTshirt) || 0) + (parseFloat(order.prixPerso) || 0)).toFixed(2)
  }, [order.prixTshirt, order.prixPerso])

  // Envoi de la commande
  const handleSubmit = useCallback(async () => {
    if (!isValid || status === 'sending') return

    setStatus('sending')

    // Préparer les données pour le Sheet (ordre des colonnes A-Q)
    const payload = {
      idCommande: order.idCommande,
      date: order.date,
      client: order.clientName,
      telephone: order.telephone,
      collection: order.collection,
      reference: order.reference,
      echeance: order.echeance,
      taille: order.taille,
      couleurTshirt: order.couleurTshirt,
      couleurLogo: order.couleurLogo,
      logoAvant: order.logoAvant ? 'Oui' : 'Non',
      logoArriere: order.logoArriere ? 'Oui' : 'Non',
      prixTshirt: order.prixTshirt || '0',
      prixPerso: order.prixPerso || '0',
      total: total,
      paye: order.paye ? 'Oui' : 'Non',
      design: order.design,
    }

    const result = await sendToGoogleSheets(payload)

    if (result.success) {
      setStatus('success')
      // Reset après 2s
      setTimeout(() => {
        setOrder(createEmptyOrder())
        setStatus(null)
      }, 2000)
    } else {
      setStatus('error')
      setTimeout(() => setStatus(null), 3000)
    }
  }, [order, isValid, status, total])

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <Shirt size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 tracking-tight">OLDA</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Prise de commande</p>
          </div>
        </div>
        <div className="text-xs text-gray-400">{formatDateFr()}</div>
      </header>

      {/* Split screen */}
      <div className="flex-1 flex min-h-0">
        {/* LEFT — Formulaire */}
        <div className="w-1/2 border-r border-gray-200 bg-white p-6 flex flex-col min-h-0">
          <OrderForm
            order={order}
            onChange={setOrder}
            onSubmit={handleSubmit}
            isValid={isValid && status !== 'sending'}
          />
        </div>

        {/* RIGHT — Mockup */}
        <div className="w-1/2 bg-gray-50 p-6 flex flex-col items-center justify-center relative">
          <TshirtMockup
            tshirtColor={order.couleurTshirt}
            logoColor={order.couleurLogo}
            frontLogo={order.logoAvant}
            backLogo={order.logoArriere}
          />

          {/* Récapitulatif rapide */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Client</p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {order.clientName || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Taille</p>
                  <p className="text-sm font-medium text-gray-900">{order.taille}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Réf.</p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {order.reference || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Total</p>
                  <p className="text-sm font-bold text-gray-900">{total} €</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {status && status !== 'sending' && (
        <div className={`
          fixed top-4 right-4 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg
          animate-fade-in z-50
          ${status === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}
        `}>
          {status === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">
            {status === 'success' ? 'Commande envoyée !' : 'Erreur — réessayez'}
          </span>
        </div>
      )}
    </div>
  )
}
