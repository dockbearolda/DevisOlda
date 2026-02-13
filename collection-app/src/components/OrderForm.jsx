import { Hash, Calendar, User, Phone, Tag, FileText, CalendarClock, Ruler, Palette, Euro, CreditCard, Link2 } from 'lucide-react'
import FormField from './FormField'
import ColorPicker from './ColorPicker'
import FileUpload from './FileUpload'
import { TSHIRT_COLORS, LOGO_COLORS, SIZES, formatDateFr } from '../utils/constants'

/**
 * Formulaire de commande — 17 champs dans l'ordre exact du Google Sheet
 */
export default function OrderForm({ order, onChange, onSubmit, isValid }) {
  const update = (field, value) => onChange({ ...order, [field]: value })

  const inputClass = `
    w-full px-4 py-3 rounded-xl border border-gray-200 bg-white
    text-gray-900 text-sm placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
    transition-all duration-150
  `

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit() }}
      className="flex flex-col gap-5 h-full"
    >
      {/* Scroll container */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-6 scrollbar-hide">

        {/* ─── Bloc 1 : Commande (auto) ─── */}
        <Section title="Commande">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="ID Commande">
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
                <Hash size={14} className="text-gray-400" />
                <span className="text-sm font-mono text-gray-700">{order.idCommande}</span>
              </div>
            </FormField>
            <FormField label="Date">
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-sm text-gray-700">{formatDateFr()}</span>
              </div>
            </FormField>
          </div>
        </Section>

        {/* ─── Bloc 2 : Client ─── */}
        <Section title="Client">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Nom du client" required>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={order.clientName}
                  onChange={(e) => update('clientName', e.target.value)}
                  placeholder="Jean Dupont"
                  className={`${inputClass} pl-10`}
                  autoComplete="off"
                />
              </div>
            </FormField>
            <FormField label="Téléphone">
              <div className="relative">
                <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={order.telephone}
                  onChange={(e) => update('telephone', e.target.value)}
                  placeholder="0690 12 34 56"
                  className={`${inputClass} pl-10`}
                  autoComplete="off"
                />
              </div>
            </FormField>
          </div>
        </Section>

        {/* ─── Bloc 3 : Produit ─── */}
        <Section title="Produit">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Collection">
              <div className="relative">
                <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={order.collection}
                  onChange={(e) => update('collection', e.target.value)}
                  placeholder="Été 2026"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </FormField>
            <FormField label="Référence">
              <div className="relative">
                <FileText size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={order.reference}
                  onChange={(e) => update('reference', e.target.value)}
                  placeholder="TS-001"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <FormField label="Échéance">
              <div className="relative">
                <CalendarClock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={order.echeance}
                  onChange={(e) => update('echeance', e.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </FormField>
            <FormField label="Taille" required>
              <div className="flex gap-1.5">
                {SIZES.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => update('taille', size)}
                    className={`
                      flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-150
                      ${order.taille === size
                        ? 'bg-gray-900 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </FormField>
          </div>
        </Section>

        {/* ─── Bloc 4 : Personnalisation ─── */}
        <Section title="Personnalisation">
          <FormField label="Couleur T-shirt">
            <ColorPicker
              colors={TSHIRT_COLORS}
              selected={order.couleurTshirt}
              onChange={(hex) => update('couleurTshirt', hex)}
            />
          </FormField>
          <FormField label="Couleur Logo" className="mt-4">
            <ColorPicker
              colors={LOGO_COLORS}
              selected={order.couleurLogo}
              onChange={(hex) => update('couleurLogo', hex)}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <FormField label="Logo Avant">
              <FileUpload
                label="Avant"
                preview={order.logoAvant}
                onChange={(val) => update('logoAvant', val)}
              />
            </FormField>
            <FormField label="Logo Arrière">
              <FileUpload
                label="Arrière"
                preview={order.logoArriere}
                onChange={(val) => update('logoArriere', val)}
              />
            </FormField>
          </div>
        </Section>

        {/* ─── Bloc 5 : Prix ─── */}
        <Section title="Prix">
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Prix T-shirt">
              <div className="relative">
                <Euro size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={order.prixTshirt}
                  onChange={(e) => update('prixTshirt', e.target.value)}
                  placeholder="25.00"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </FormField>
            <FormField label="Prix Perso.">
              <div className="relative">
                <Euro size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={order.prixPerso}
                  onChange={(e) => update('prixPerso', e.target.value)}
                  placeholder="10.00"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </FormField>
            <FormField label="Total TTC">
              <div className="flex items-center justify-center gap-1 px-4 py-3 rounded-xl bg-gray-900 text-white">
                <Euro size={14} />
                <span className="text-sm font-bold">
                  {((parseFloat(order.prixTshirt) || 0) + (parseFloat(order.prixPerso) || 0)).toFixed(2)}
                </span>
              </div>
            </FormField>
          </div>
          <div className="mt-3">
            <FormField label="Payé">
              <button
                type="button"
                onClick={() => update('paye', !order.paye)}
                className={`
                  w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200
                  ${order.paye
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }
                `}
              >
                <CreditCard size={14} className="inline mr-2" />
                {order.paye ? 'Payé ✓' : 'Non payé'}
              </button>
            </FormField>
          </div>
        </Section>

        {/* ─── Bloc 6 : Design ─── */}
        <Section title="Design">
          <FormField label="Lien fichier / Notes">
            <div className="relative">
              <Link2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={order.design}
                onChange={(e) => update('design', e.target.value)}
                placeholder="https://drive.google.com/... ou note"
                className={`${inputClass} pl-10`}
              />
            </div>
          </FormField>
        </Section>
      </div>

      {/* ─── Bouton Envoyer (sticky bottom) ─── */}
      <div className="pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={!isValid}
          className={`
            w-full py-4 rounded-2xl text-sm font-bold uppercase tracking-wider
            transition-all duration-200
            ${isValid
              ? 'bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98] shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Envoyer la commande
        </button>
      </div>
    </form>
  )
}

/* Bloc section avec titre */
function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
        {title}
      </h3>
      {children}
    </div>
  )
}
