import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

/**
 * Exporte un element HTML en PDF - Optimise pour une seule page A4
 * Centrage vertical et horizontal de tous les elements
 * @param {HTMLElement} element - L'element a exporter
 * @param {string} filename - Le nom du fichier (sans extension)
 * @returns {Promise<void>}
 */
export async function exportToPdf(element, filename = 'fiche') {
  if (!element) {
    console.error('Element non trouve pour l\'export PDF')
    return
  }

  try {
    // Masquer les elements non imprimables temporairement
    const noPrintElements = element.querySelectorAll('.no-print')
    noPrintElements.forEach(el => {
      el.style.display = 'none'
    })

    // Ajouter des styles temporaires pour le centrage optimal
    const originalStyles = {
      textAlign: element.style.textAlign,
      display: element.style.display
    }

    // Corriger les SVGs avec currentColor pour html2canvas
    const svgs = element.querySelectorAll('svg')
    svgs.forEach(svg => {
      const computedColor = window.getComputedStyle(svg).color
      svg.querySelectorAll('[stroke="currentColor"]').forEach(el => {
        el.setAttribute('stroke', computedColor)
        el.dataset.originalStroke = 'currentColor'
      })
      svg.querySelectorAll('[fill="currentColor"]').forEach(el => {
        el.setAttribute('fill', computedColor)
        el.dataset.originalFill = 'currentColor'
      })
    })

    // Attendre un court instant pour que les styles soient appliques
    await new Promise(resolve => setTimeout(resolve, 150))

    // Creer le canvas a partir de l'element avec qualite optimale
    const canvas = await html2canvas(element, {
      scale: 2, // Haute qualite pour un rendu net
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      // Optimiser le rendu pour le centrage
      x: 0,
      y: 0
    })

    // Restaurer les elements masques
    noPrintElements.forEach(el => {
      el.style.display = ''
    })

    // Restaurer les styles originaux
    element.style.textAlign = originalStyles.textAlign
    element.style.display = originalStyles.display

    // Restaurer les SVGs avec currentColor
    svgs.forEach(svg => {
      svg.querySelectorAll('[data-original-stroke]').forEach(el => {
        el.setAttribute('stroke', el.dataset.originalStroke)
        delete el.dataset.originalStroke
      })
      svg.querySelectorAll('[data-original-fill]').forEach(el => {
        el.setAttribute('fill', el.dataset.originalFill)
        delete el.dataset.originalFill
      })
    })

    // Dimensions A4 en mm
    const pdfWidth = 210
    const pdfHeight = 297

    // Marges equilibrees pour un rendu centre
    const marginX = 10
    const marginTop = 12
    const marginBottom = 15

    // Zone imprimable
    const printableWidth = pdfWidth - (marginX * 2)
    const printableHeight = pdfHeight - marginTop - marginBottom

    // Calculer le ratio pour faire tenir sur une page tout en centrant
    const canvasRatio = canvas.width / canvas.height
    const pageRatio = printableWidth / printableHeight

    let imgWidth, imgHeight

    if (canvasRatio > pageRatio) {
      // L'image est plus large que la page - ajuster par la largeur
      imgWidth = printableWidth
      imgHeight = printableWidth / canvasRatio
    } else {
      // L'image est plus haute que la page - ajuster par la hauteur
      imgHeight = printableHeight
      imgWidth = printableHeight * canvasRatio
    }

    // Centrage horizontal
    const offsetX = marginX + (printableWidth - imgWidth) / 2

    // Centrage vertical dans la zone imprimable
    const offsetY = marginTop + (printableHeight - imgHeight) / 2

    // Creer le PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgData = canvas.toDataURL('image/jpeg', 0.95)

    // Ajouter l'image centree verticalement et horizontalement
    pdf.addImage(imgData, 'JPEG', offsetX, offsetY, imgWidth, imgHeight)

    // Ligne decorative subtile en haut
    pdf.setDrawColor(200, 200, 200)
    pdf.setLineWidth(0.2)
    pdf.line(marginX, 8, pdfWidth - marginX, 8)

    // Ligne decorative subtile en bas
    pdf.line(marginX, pdfHeight - 10, pdfWidth - marginX, pdfHeight - 10)

    // Pied de page elegant et centre
    const date = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    pdf.setFontSize(8)
    pdf.setTextColor(150, 150, 150)
    pdf.text(
      `Commande T-shirt OLDA`,
      pdfWidth / 2,
      pdfHeight - 6,
      { align: 'center' }
    )

    pdf.setFontSize(7)
    pdf.setTextColor(180, 180, 180)
    pdf.text(
      date,
      pdfWidth / 2,
      pdfHeight - 3,
      { align: 'center' }
    )

    // Nettoyer le nom de fichier
    const cleanFilename = filename
      .replace(/[^a-zA-Z0-9\u00C0-\u024F\s-]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50)

    // Generer le PDF et l'ouvrir dans un nouvel onglet (compatible mobile)
    const pdfBlob = pdf.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)

    // Ouvrir dans un nouvel onglet - l'utilisateur peut telecharger depuis la
    const newWindow = window.open(pdfUrl, '_blank')

    // Si le popup est bloque, fallback sur le telechargement direct
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      // Creer un lien de telechargement
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = `${cleanFilename}_${formatDate(new Date())}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    // Nettoyer l'URL apres un delai
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000)

  } catch (error) {
    console.error('Erreur lors de l\'export PDF:', error)
    alert('Une erreur est survenue lors de la generation du PDF. Veuillez reessayer.')
  }
}

/**
 * Formate une date en YYYYMMDD
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

export default exportToPdf
