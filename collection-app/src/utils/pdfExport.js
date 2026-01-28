import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

/**
 * Exporte un element HTML en PDF - Optimise pour une seule page A4
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

    // Attendre un court instant pour que les styles soient appliques
    await new Promise(resolve => setTimeout(resolve, 100))

    // Creer le canvas a partir de l'element - echelle reduite pour tenir sur A4
    const canvas = await html2canvas(element, {
      scale: 1.5, // Echelle reduite pour optimiser la taille
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    })

    // Restaurer les elements masques
    noPrintElements.forEach(el => {
      el.style.display = ''
    })

    // Dimensions A4 en mm
    const pdfWidth = 210
    const pdfHeight = 297

    // Marges en mm
    const marginX = 8
    const marginY = 8

    // Zone imprimable
    const printableWidth = pdfWidth - (marginX * 2)
    const printableHeight = pdfHeight - (marginY * 2) - 10 // Reserve pour le footer

    // Calculer le ratio pour faire tenir sur une page
    const canvasRatio = canvas.width / canvas.height
    const pageRatio = printableWidth / printableHeight

    let imgWidth, imgHeight

    if (canvasRatio > pageRatio) {
      // L'image est plus large que la page
      imgWidth = printableWidth
      imgHeight = printableWidth / canvasRatio
    } else {
      // L'image est plus haute que la page
      imgHeight = printableHeight
      imgWidth = printableHeight * canvasRatio
    }

    // Centrer l'image
    const offsetX = marginX + (printableWidth - imgWidth) / 2
    const offsetY = marginY

    // Creer le PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgData = canvas.toDataURL('image/jpeg', 0.92)

    // Ajouter l'image centree sur une seule page
    pdf.addImage(imgData, 'JPEG', offsetX, offsetY, imgWidth, imgHeight)

    // Ajouter un pied de page elegant
    const date = new Date().toLocaleDateString('fr-FR')
    pdf.setFontSize(7)
    pdf.setTextColor(180)
    pdf.text(
      `Commande T-shirt OLDA - ${date}`,
      pdfWidth / 2,
      pdfHeight - 5,
      { align: 'center' }
    )

    // Nettoyer le nom de fichier
    const cleanFilename = filename
      .replace(/[^a-zA-Z0-9\u00C0-\u024F\s-]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50)

    // Telecharger le PDF
    pdf.save(`${cleanFilename}_${formatDate(new Date())}.pdf`)

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
