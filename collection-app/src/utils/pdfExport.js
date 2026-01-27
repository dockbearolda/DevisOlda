import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

/**
 * Exporte un element HTML en PDF
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

    // Creer le canvas a partir de l'element
    const canvas = await html2canvas(element, {
      scale: 2, // Meilleure qualite
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

    // Calculer les dimensions du PDF
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    // Creer le PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgData = canvas.toDataURL('image/jpeg', 0.95)

    // Ajouter l'image au PDF (gerer plusieurs pages si necessaire)
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Si le contenu depasse une page, ajouter des pages supplementaires
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Ajouter un pied de page avec la date
    const totalPages = pdf.internal.getNumberOfPages()
    const date = new Date().toLocaleDateString('fr-FR')

    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFontSize(8)
      pdf.setTextColor(150)
      pdf.text(
        `OLDA Collections - Genere le ${date} - Page ${i}/${totalPages}`,
        105,
        290,
        { align: 'center' }
      )
    }

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
