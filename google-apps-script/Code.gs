/**
 * Google Apps Script - DevisOlda v2
 * Recoit les commandes depuis l'appli et les insere dans Google Sheets
 */

const DRIVE_FOLDER_ID = ''

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
    var params = e.parameter

    // Log pour debug
    Logger.log('Params recus: ' + JSON.stringify(Object.keys(params)))

    var idCommande = params.idCommande || ''

    // Anti-doublon
    if (idCommande && isAlreadyExists(sheet, idCommande)) {
      return ContentService.createTextOutput('DOUBLON').setMimeType(ContentService.MimeType.TEXT)
    }

    // Ajouter la ligne (colonnes A a O, sans le design)
    sheet.appendRow([
      idCommande,
      params.client || '',
      params.tel || '',
      params.collection || '',
      params.reference || '',
      params.echeance || '',
      params.taille || '',
      params.couleurTshirt || '',
      params.couleurLogo || '',
      params.logoAvant || '',
      params.logoArriere || '',
      Number(params.prixTshirt) || 0,
      Number(params.prixPerso) || 0,
      Number(params.total) || 0,
      params.paye || 'Non'
    ])

    // Colonne P : design (formule IMAGE inseree separement pour que Sheets la reconnaisse)
    var lastRow = sheet.getLastRow()

    if (params.mockupBase64 && params.mockupBase64.length > 100) {
      var imageUrl = saveMockupToDrive(params.mockupBase64, idCommande)
      if (imageUrl) {
        sheet.getRange(lastRow, 16).setFormula('=IMAGE("' + imageUrl + '")')
      }
    }

    return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT)

  } catch (error) {
    Logger.log('Erreur doPost: ' + error.toString())
    return ContentService.createTextOutput('ERREUR: ' + error.toString()).setMimeType(ContentService.MimeType.TEXT)
  }
}

function isAlreadyExists(sheet, idCommande) {
  var data = sheet.getRange('A:A').getValues()
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === idCommande) return true
  }
  return false
}

/**
 * Sauvegarde le mockup dans Google Drive et retourne l'URL de l'image (pas la formule)
 */
function saveMockupToDrive(base64Data, idCommande) {
  try {
    var cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '')
    var blob = Utilities.newBlob(Utilities.base64Decode(cleanBase64), 'image/png', 'mockup_' + idCommande + '.png')

    var file
    if (DRIVE_FOLDER_ID) {
      file = DriveApp.getFolderById(DRIVE_FOLDER_ID).createFile(blob)
    } else {
      file = DriveApp.createFile(blob)
    }

    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)
    return 'https://drive.google.com/uc?export=view&id=' + file.getId()

  } catch (error) {
    Logger.log('Erreur saveMockup: ' + error.toString())
    return null
  }
}

function doGet(e) {
  return ContentService.createTextOutput('DevisOlda API OK v2').setMimeType(ContentService.MimeType.TEXT)
}
