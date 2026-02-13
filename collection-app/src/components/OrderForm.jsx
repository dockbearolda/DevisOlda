import { useRef } from 'react'
import { ChevronRight, Camera } from 'lucide-react'
import ColorPicker from './ColorPicker'
import { TSHIRT_COLORS, LOGO_COLORS, SIZES, formatDateFr } from '../utils/constants'

/**
 * Formulaire style iOS Settings — 1 champ par ligne
 */
export default function OrderForm({ order, onChange, onSubmit, isValid }) {
  const update = (field, value) => onChange({ ...order, [field]: value })
  const frontLogoRef = useRef(null)
  const backLogoRef = useRef(null)

  const handleFile = (field, ref) => (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => update(field, ev.target.result)
    reader.readAsDataURL(file)
  }

  const total = ((parseFloat(order.prixTshirt) || 0) + (parseFloat(order.prixPerso) || 0)).toFixed(2)

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit() }} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-8 pb-4">

        {/* ─── COMMANDE ─── */}
        <Section title="Commande">
          <Row label="N° Commande">
            <span className="text-[17px] text-[#8E8E93] font-mono">{order.idCommande}</span>
          </Row>
          <Row label="Date" last>
            <span className="text-[17px] text-[#8E8E93]">{formatDateFr()}</span>
          </Row>
        </Section>

        {/* ─── CLIENT ─── */}
        <Section title="Client">
          <Row label="Nom" required>
            <input
              type="text"
              value={order.clientName}
              onChange={(e) => update('clientName', e.target.value)}
              placeholder="Jean Dupont"
              autoComplete="off"
            />
          </Row>
          <Row label="Téléphone" last>
            <input
              type="tel"
              value={order.telephone}
              onChange={(e) => update('telephone', e.target.value)}
              placeholder="0690 12 34 56"
              autoComplete="off"
            />
          </Row>
        </Section>

        {/* ─── PRODUIT ─── */}
        <Section title="Produit">
          <Row label="Collection">
            <input
              type="text"
              value={order.collection}
              onChange={(e) => update('collection', e.target.value)}
              placeholder="Été 2026"
            />
          </Row>
          <Row label="Référence">
            <input
              type="text"
              value={order.reference}
              onChange={(e) => update('reference', e.target.value)}
              placeholder="TS-001"
            />
          </Row>
          <Row label="Échéance">
            <input
              type="date"
              value={order.echeance}
              onChange={(e) => update('echeance', e.target.value)}
            />
          </Row>
          <Row label="Taille" last>
            <div className="flex gap-0.5 sm:gap-1 flex-wrap justify-end">
              {SIZES.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => update('taille', size)}
                  className={`
                    px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-[13px] font-semibold transition-all
                    ${order.taille === size
                      ? 'bg-[#007AFF] text-white'
                      : 'bg-[#F2F2F7] text-[#1D1D1F]'
                    }
                  `}
                >
                  {size}
                </button>
              ))}
            </div>
          </Row>
        </Section>

        {/* ─── COULEURS ─── */}
        <Section title="Couleurs">
          <div className="px-3 sm:px-4 py-2.5 sm:py-3">
            <p className="text-[14px] sm:text-[15px] text-[#1D1D1F] mb-2 sm:mb-3">Couleur T-shirt</p>
            <ColorPicker
              colors={TSHIRT_COLORS}
              selected={order.couleurTshirt}
              onChange={(hex) => update('couleurTshirt', hex)}
            />
          </div>
          <Divider />
          <div className="px-3 sm:px-4 py-2.5 sm:py-3">
            <p className="text-[14px] sm:text-[15px] text-[#1D1D1F] mb-2 sm:mb-3">Couleur Logo</p>
            <ColorPicker
              colors={LOGO_COLORS}
              selected={order.couleurLogo}
              onChange={(hex) => update('couleurLogo', hex)}
            />
          </div>
        </Section>

        {/* ─── LOGOS ─── */}
        <Section title="Logos">
          <input ref={frontLogoRef} type="file" accept="image/*" className="hidden" onChange={handleFile('logoAvant', frontLogoRef)} />
          <input ref={backLogoRef} type="file" accept="image/*" className="hidden" onChange={handleFile('logoArriere', backLogoRef)} />

          <Row
            label="Logo Avant"
            onClick={() => frontLogoRef.current?.click()}
            chevron
          >
            {order.logoAvant ? (
              <div className="flex items-center gap-2">
                <img src={order.logoAvant} alt="" className="w-8 h-8 rounded object-contain" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); update('logoAvant', null) }}
                  className="text-[13px] text-[#FF3B30]"
                >
                  Supprimer
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[#007AFF]">
                <Camera size={16} />
                <span className="text-[15px]">Ajouter</span>
              </div>
            )}
          </Row>
          <Row
            label="Logo Arrière"
            onClick={() => backLogoRef.current?.click()}
            chevron
            last
          >
            {order.logoArriere ? (
              <div className="flex items-center gap-2">
                <img src={order.logoArriere} alt="" className="w-8 h-8 rounded object-contain" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); update('logoArriere', null) }}
                  className="text-[13px] text-[#FF3B30]"
                >
                  Supprimer
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[#007AFF]">
                <Camera size={16} />
                <span className="text-[15px]">Ajouter</span>
              </div>
            )}
          </Row>
        </Section>

        {/* ─── PRIX ─── */}
        <Section title="Prix">
          <Row label="Prix T-shirt">
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                step="0.01"
                value={order.prixTshirt}
                onChange={(e) => update('prixTshirt', e.target.value)}
                placeholder="25.00"
                className="w-24"
              />
              <span className="text-[#8E8E93] text-[15px]">€</span>
            </div>
          </Row>
          <Row label="Personnalisation">
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                step="0.01"
                value={order.prixPerso}
                onChange={(e) => update('prixPerso', e.target.value)}
                placeholder="0.00"
                className="w-24"
              />
              <span className="text-[#8E8E93] text-[15px]">€</span>
            </div>
          </Row>
          <Row label="Total" last>
            <span className="text-[20px] font-bold text-[#1D1D1F]">{total} €</span>
          </Row>
        </Section>

        {/* ─── PAIEMENT ─── */}
        <Section title="Paiement">
          <Row label="Payé" last>
            <Toggle checked={order.paye} onChange={(val) => update('paye', val)} />
          </Row>
        </Section>

        {/* ─── DESIGN ─── */}
        <Section title="Design">
          <Row label="Lien / Notes" last>
            <input
              type="text"
              value={order.design}
              onChange={(e) => update('design', e.target.value)}
              placeholder="https://..."
            />
          </Row>
        </Section>
      </div>

      {/* ─── BOUTON ENVOYER ─── */}
      <div className="pt-4 pb-2 safe-area-bottom">
        <button
          type="submit"
          disabled={!isValid}
          className={`
            w-full py-3.5 sm:py-4 rounded-2xl text-[15px] sm:text-[17px] font-semibold transition-all duration-200
            ${isValid
              ? 'bg-[#007AFF] text-white active:bg-[#0056CC] active:scale-[0.98]'
              : 'bg-[#E5E5EA] text-[#C7C7CC] cursor-not-allowed'
            }
          `}
        >
          Envoyer la commande
        </button>
      </div>
    </form>
  )
}

/* ═══════════════════════════════════════
   SOUS-COMPOSANTS STYLE iOS
   ═══════════════════════════════════════ */

/** Section avec titre gris uppercase */
function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-[11px] sm:text-[13px] font-normal text-[#86868B] uppercase px-3 sm:px-4 mb-1.5">
        {title}
      </h3>
      <div className="bg-white rounded-2xl overflow-hidden">
        {children}
      </div>
    </div>
  )
}

/** Ligne de formulaire style iOS */
function Row({ label, required, children, onClick, chevron, last }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <>
      <Tag
        type={onClick ? 'button' : undefined}
        onClick={onClick}
        className={`
          w-full flex items-center justify-between px-3 sm:px-4 min-h-[44px] sm:min-h-[52px]
          ${onClick ? 'active:bg-[#F2F2F7] cursor-pointer' : ''}
        `}
      >
        <span className="text-[15px] sm:text-[17px] text-[#1D1D1F] shrink-0 mr-3 sm:mr-4">
          {label}
          {required && <span className="text-[#FF3B30] ml-0.5">*</span>}
        </span>
        <div className="flex items-center gap-1 min-w-0 justify-end">
          {children}
          {chevron && <ChevronRight size={16} className="text-[#C7C7CC] shrink-0 ml-1" />}
        </div>
      </Tag>
      {!last && <Divider />}
    </>
  )
}

/** Séparateur fin iOS */
function Divider() {
  return <div className="h-px bg-[#E5E5EA] ml-4" />
}

/** Toggle switch style iOS */
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`
        relative w-[51px] h-[31px] rounded-full transition-colors duration-200
        ${checked ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'}
      `}
    >
      <span
        className={`
          absolute top-[2px] w-[27px] h-[27px] rounded-full bg-white shadow-md
          transition-transform duration-200
          ${checked ? 'translate-x-[22px]' : 'translate-x-[2px]'}
        `}
      />
    </button>
  )
}
