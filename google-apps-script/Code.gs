/**
 * Google Apps Script - DevisOlda
 * Recoit les commandes depuis l'appli et les insere dans Google Sheets
 *
 * INSTRUCTIONS :
 * 1. Ouvrir Google Sheets > Extensions > Apps Script
 * 2. Supprimer tout le code existant
 * 3. Coller ce code
 * 4. Cliquer "Deployer" > "Nouveau deploiement"
 * 5. Type = "Application Web", Acces = "Tout le monde"
 * 6. Copier l'URL et la mettre dans googleSheets.js
 */

// ID du dossier Google Drive pour sauvegarder les mockups (creer un dossier et mettre son ID ici)
const DRIVE_FOLDER_ID = '' // Laisser vide pour utiliser le dossier racine

/**
 * Gere les requetes POST depuis l'appli
 */
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
    var params = e.parameter

    // Anti-doublon : verifier si l'ID commande existe deja
    var idCommande = params.idCommande || ''
    if (idCommande && isAlreadyExists(sheet, idCommande)) {
      return ContentService.createTextOutput('DOUBLON')
        .setMimeType(ContentService.MimeType.TEXT)
    }

    // Traiter le mockup base64 si present
    var designValue = ''
    if (params.mockupBase64 && params.mockupBase64.length > 100) {
      designValue = saveMockupToDrive(params.mockupBase64, idCommande)
    }

    // Ajouter la ligne (colonnes A a P)
    sheet.appendRow([
      idCommande,                         // A - ID Commande
      params.client || '',                // B - Client
      params.tel || '',                   // C - Telephone
      params.collection || '',            // D - Collection
      params.reference || '',             // E - Reference
      params.echeance || '',              // F - Echeance
      params.taille || '',                // G - Taille
      params.couleurTshirt || '',         // H - Couleur T-shirt
      params.couleurLogo || '',           // I - Couleur Logo
      params.logoAvant || '',             // J - Logo Avant
      params.logoArriere || '',           // K - Logo Arriere
      Number(params.prixTshirt) || 0,     // L - Prix T-shirt
      Number(params.prixPerso) || 0,      // M - Prix Perso
      Number(params.total) || 0,          // N - Total
      params.paye || 'Non',              // O - Paye
      designValue                         // P - Design (image ou vide)
    ])

    return ContentService.createTextOutput('OK')
      .setMimeType(ContentService.MimeType.TEXT)

  } catch (error) {
    // Log l'erreur pour debug
    Logger.log('Erreur doPost: ' + error.toString())
    return ContentService.createTextOutput('ERREUR: ' + error.toString())
      .setMimeType(ContentService.MimeType.TEXT)
  }
}

/**
 * Verifie si un ID commande existe deja dans la colonne A
 */
function isAlreadyExists(sheet, idCommande) {
  var data = sheet.getRange('A:A').getValues()
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === idCommande) {
      return true
    }
  }
  return false
}

/**
 * Sauvegarde le mockup base64 dans Google Drive et retourne la formule IMAGE()
 */
function saveMockupToDrive(base64Data, idCommande) {
  try {
    // Nettoyer le base64 (enlever le header data:image/png;base64, si present)
    var cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '')
    var blob = Utilities.newBlob(Utilities.base64Decode(cleanBase64), 'image/png', 'mockup_' + idCommande + '.png')

    // Sauvegarder dans Google Drive
    var file
    if (DRIVE_FOLDER_ID) {
      var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID)
      file = folder.createFile(blob)
    } else {
      file = DriveApp.createFile(blob)
    }

    // Rendre le fichier accessible publiquement (necessaire pour IMAGE())
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)

    // Construire l'URL directe de l'image
    var fileId = file.getId()
    var imageUrl = 'https://drive.google.com/uc?export=view&id=' + fileId

    // Retourner la formule IMAGE() pour afficher dans la cellule
    return '=IMAGE("' + imageUrl + '")'

  } catch (error) {
    Logger.log('Erreur saveMockup: ' + error.toString())
    return 'Erreur image: ' + error.toString()
  }
}

/**
 * Gere les requetes GET (test)
 */
function doGet(e) {
  return ContentService.createTextOutput('DevisOlda API OK - ' + new Date().toISOString())
    .setMimeType(ContentService.MimeType.TEXT)
}
