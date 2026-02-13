import { useState, useMemo, useCallback } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import OrderForm from './components/OrderForm'
import { generateOrderId, formatDateFr } from './utils/constants'
import { sendToGoogleSheets } from './utils/googleSheets'

const createEmptyOrder = () => ({
  idCommande: generateOrderId(),
  date: formatDateFr(),
  clientName: '',
  telephone: '',
  collection: '',
  taille: 'M',
  couleurTshirt: '#FFFFFF',
  couleurLogo: '#111827',
  logoAvant: '',
  logoArriere: '',
  prixTshirt: '',
  prixPerso: '',
  paye: false,
  note: '',
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
      taille: order.taille,
      couleurTshirt: order.couleurTshirt,
      couleurLogo: order.couleurLogo,
      logoAvant: order.logoAvant || 'Non',
      logoArriere: order.logoArriere || 'Non',
      prixTshirt: order.prixTshirt || '0',
      prixPerso: order.prixPerso || '0',
      total: total,
      paye: order.paye ? 'Oui' : 'Non',
      note: order.note,
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
    <div className="h-screen flex flex-col bg-[#F2F2F7] overflow-hidden">
      {/* ─── Header Glassmorphism ─── */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-black/5 safe-area-x shrink-0">
        <div className="flex items-center justify-between px-6 py-3">
          <div>
            <h1 className="text-[20px] sm:text-[22px] font-bold text-[#1D1D1F] tracking-tight">
              Atelier OLDA
            </h1>
            <p className="text-[11px] sm:text-[13px] text-[#86868B]">Nouvelle commande</p>
          </div>
          <div className="text-[13px] text-[#86868B] font-medium">{formatDateFr()}</div>
        </div>
      </header>

      {/* ─── Contenu scrollable ─── */}
      <main className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
        <div className="max-w-lg mx-auto px-4 py-5 pb-8">
          <OrderForm
            order={order}
            onChange={setOrder}
            onSubmit={handleSubmit}
            isValid={isValid && status !== 'sending'}
            total={total}
          />
        </div>
      </main>

      {/* ─── Toast notifications ─── */}
      <AnimatePresence>
        {status && status !== 'sending' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`
              fixed top-5 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-5 py-3
              rounded-2xl shadow-xl z-50 backdrop-blur-xl
              ${status === 'success'
                ? 'bg-[#34C759]/95 text-white'
                : 'bg-[#FF3B30]/95 text-white'
              }
            `}
          >
            {status === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-[15px] font-medium">
              {status === 'success' ? 'Commande envoyée' : 'Erreur — réessayez'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
