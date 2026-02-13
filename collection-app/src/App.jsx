import { useState, useMemo, useCallback } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import OrderForm from './components/OrderForm'
import TshirtMockup from './components/TshirtMockup'
import { generateOrderId, formatDateFr } from './utils/constants'
import { sendToGoogleSheets } from './utils/googleSheets'

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
  const [status, setStatus] = useState(null)

  const isValid = useMemo(() => {
    return order.clientName.trim().length > 0 && order.taille
  }, [order.clientName, order.taille])

  const total = useMemo(() => {
    return ((parseFloat(order.prixTshirt) || 0) + (parseFloat(order.prixPerso) || 0)).toFixed(2)
  }, [order.prixTshirt, order.prixPerso])

  const handleSubmit = useCallback(async () => {
    if (!isValid || status === 'sending') return
    setStatus('sending')

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
    <div className="h-screen flex flex-col bg-[#F5F5F7] overflow-hidden">
      {/* ─── Header style Apple ─── */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-[#D2D2D7] px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between safe-area-x">
        <div>
          <h1 className="text-[18px] sm:text-[22px] font-bold text-[#1D1D1F] tracking-tight">OLDA</h1>
          <p className="text-[11px] sm:text-[13px] text-[#86868B]">Nouvelle commande</p>
        </div>
        <div className="text-[11px] sm:text-[13px] text-[#86868B]">{formatDateFr()}</div>
      </header>

      {/* ─── Split Screen (vertical mobile / horizontal desktop) ─── */}
      <div className="flex-1 flex flex-col sm:flex-row min-h-0 overflow-hidden">
        {/* GAUCHE — Formulaire */}
        <div className="w-full sm:w-1/2 bg-[#F5F5F7] p-3 sm:p-5 flex flex-col min-h-0 overflow-hidden flex-1 sm:flex-none">
          <OrderForm
            order={order}
            onChange={setOrder}
            onSubmit={handleSubmit}
            isValid={isValid && status !== 'sending'}
          />
        </div>

        {/* DROITE — Mockup (caché en portrait mobile, visible en landscape et desktop) */}
        <div className="hidden landscape:flex sm:flex w-full sm:w-1/2 bg-[#F5F5F7] sm:border-l border-[#D2D2D7] flex-col items-center justify-center relative p-4 sm:p-6">
          <TshirtMockup
            tshirtColor={order.couleurTshirt}
            logoColor={order.couleurLogo}
            frontLogo={order.logoAvant}
            backLogo={order.logoArriere}
          />

          {/* Recap en bas */}
          <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-5 right-3 sm:right-5">
            <div className="bg-white rounded-2xl px-3 sm:px-5 py-2 sm:py-3 flex items-center justify-between">
              <Info label="Client" value={order.clientName || '—'} />
              <Separator />
              <Info label="Taille" value={order.taille} />
              <Separator />
              <Info label="Réf." value={order.reference || '—'} />
              <Separator />
              <Info label="Total" value={`${total} €`} bold />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Toast ─── */}
      {status && status !== 'sending' && (
        <div className={`
          fixed top-5 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-5 py-3
          rounded-2xl shadow-xl animate-fade-in z-50 backdrop-blur-xl
          ${status === 'success'
            ? 'bg-[#34C759]/95 text-white'
            : 'bg-[#FF3B30]/95 text-white'
          }
        `}>
          {status === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-[15px] font-medium">
            {status === 'success' ? 'Commande envoyée' : 'Erreur — réessayez'}
          </span>
        </div>
      )}
    </div>
  )
}

function Info({ label, value, bold }) {
  return (
    <div className="text-center min-w-0 flex-1">
      <p className="text-[9px] sm:text-[11px] text-[#86868B] uppercase">{label}</p>
      <p className={`text-[13px] sm:text-[15px] truncate ${bold ? 'font-bold text-[#1D1D1F]' : 'text-[#1D1D1F]'}`}>
        {value}
      </p>
    </div>
  )
}

function Separator() {
  return <div className="w-px h-8 bg-[#E5E5EA] shrink-0" />
}
