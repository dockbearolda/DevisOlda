import IOSSelect from './IOSSelect'
import TshirtMockup from './TshirtMockup'
import {
  TSHIRT_COLORS,
  LOGO_COLORS,
  SIZES,
  COLLECTIONS,
  PRESET_LOGOS,
  formatDateFr,
} from '../utils/constants'

/**
 * Formulaire complet style iOS Settings — Design Apple natif
 */
export default function OrderForm({ order, onChange, onSubmit, isValid, total }) {
  const update = (field, value) => onChange({ ...order, [field]: value })

  // Options formatées pour les Selects
  const collectionOptions = COLLECTIONS
  const sizeOptions = SIZES.map(s => ({ value: s, label: s }))
  const tshirtColorOptions = TSHIRT_COLORS.map(c => ({ value: c.hex, label: c.name, hex: c.hex }))
  const logoColorOptions = LOGO_COLORS.map(c => ({ value: c.hex, label: c.name, hex: c.hex }))
  const logoOptions = PRESET_LOGOS.map(l => ({ value: l, label: l }))

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit() }} className="space-y-6">

      {/* ─── COMMANDE ─── */}
      <Section title="Commande">
        <Row label="N° Commande">
          <span className="text-[15px] sm:text-[17px] text-[#007AFF] font-mono font-semibold">
            {order.idCommande}
          </span>
        </Row>
        <Row label="Date" last>
          <span className="text-[15px] sm:text-[17px] text-[#86868B]">{formatDateFr()}</span>
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
        <SelectRow label="Collection">
          <IOSSelect
            value={order.collection}
            onValueChange={(v) => update('collection', v)}
            options={collectionOptions}
            placeholder="Choisir"
          />
        </SelectRow>
        <SelectRow label="Taille">
          <IOSSelect
            value={order.taille}
            onValueChange={(v) => update('taille', v)}
            options={sizeOptions}
            placeholder="M"
          />
        </SelectRow>
        <SelectRow label="Couleur T-shirt">
          <IOSSelect
            value={order.couleurTshirt}
            onValueChange={(v) => update('couleurTshirt', v)}
            options={tshirtColorOptions}
            placeholder="Blanc"
            colorDot
          />
        </SelectRow>
        <SelectRow label="Couleur Logo" last>
          <IOSSelect
            value={order.couleurLogo}
            onValueChange={(v) => update('couleurLogo', v)}
            options={logoColorOptions}
            placeholder="Noir"
            colorDot
          />
        </SelectRow>
      </Section>

      {/* ─── VISUALISATION ─── */}
      <Section title="Visualisation">
        <div className="px-4 py-5">
          <TshirtMockup
            tshirtColor={order.couleurTshirt}
            logoFront={order.logoAvant}
            logoBack={order.logoArriere}
          />
        </div>
        <Divider />
        <SelectRow label="Logo Avant">
          <IOSSelect
            value={order.logoAvant}
            onValueChange={(v) => update('logoAvant', v)}
            options={logoOptions}
            placeholder="Choisir"
          />
        </SelectRow>
        <SelectRow label="Logo Arrière" last>
          <IOSSelect
            value={order.logoArriere}
            onValueChange={(v) => update('logoArriere', v)}
            options={logoOptions}
            placeholder="Aucun"
          />
        </SelectRow>
      </Section>

      {/* ─── NOTE ─── */}
      <Section title="Note">
        <div className="px-3 sm:px-4 py-3">
          <textarea
            value={order.note}
            onChange={(e) => update('note', e.target.value)}
            placeholder="Instructions spécifiques, lien vers un design..."
            rows={3}
            className="w-full bg-transparent text-[16px] text-[#1D1D1F] placeholder-[#C7C7CC]
                       outline-none resize-none leading-relaxed"
          />
        </div>
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

      {/* ─── BOUTON ENVOYER ─── */}
      <div className="pt-2 pb-4 safe-area-bottom">
        <button
          type="submit"
          disabled={!isValid}
          className={`
            w-full py-4 rounded-2xl text-[17px] font-semibold transition-all duration-200
            ${isValid
              ? 'bg-[#007AFF] text-white active:bg-[#0056CC] active:scale-[0.98] shadow-lg shadow-[#007AFF]/25'
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
      <h3 className="text-[11px] sm:text-[13px] font-medium text-[#86868B] uppercase tracking-wide px-4 mb-1.5">
        {title}
      </h3>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm shadow-black/[0.03]">
        {children}
      </div>
    </div>
  )
}

/** Ligne de formulaire standard (inputs texte) */
function Row({ label, required, children, last }) {
  return (
    <>
      <div className="flex items-center justify-between px-3 sm:px-4 min-h-[48px] sm:min-h-[52px]">
        <span className="text-[15px] sm:text-[17px] text-[#1D1D1F] shrink-0 mr-3 sm:mr-4">
          {label}
          {required && <span className="text-[#FF3B30] ml-0.5">*</span>}
        </span>
        <div className="flex items-center gap-1 min-w-0 justify-end">
          {children}
        </div>
      </div>
      {!last && <Divider />}
    </>
  )
}

/** Ligne pour les Selects Radix (pas de wrapper button) */
function SelectRow({ label, children, last }) {
  return (
    <>
      <div className="flex items-center justify-between px-3 sm:px-4 min-h-[48px] sm:min-h-[52px]">
        <span className="text-[15px] sm:text-[17px] text-[#1D1D1F] shrink-0 mr-3 sm:mr-4">
          {label}
        </span>
        <div className="flex items-center min-w-0 justify-end">
          {children}
        </div>
      </div>
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
