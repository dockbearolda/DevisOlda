/**
 * ============================================================
 *  DevisOlda — Google Apps Script
 * ============================================================
 *
 *  COLONNES :
 *    A = Date (auto)         B = Client       C = Telephone
 *    D = Collection          E = Reference    F = Echeance
 *    G = Taille              H = Couleur T‑shirt   I = Couleur Logo
 *    J = Logo Avant          K = Logo Arriere
 *    L = Prix T‑shirt        M = Prix Perso   N = Total
 *    O = Paye                P = Design
 *
 *  INSTALLATION :
 *    1. Ouvrir votre Google Sheet
 *    2. Extensions  →  Apps Script
 *    3. SUPPRIMER tout le code existant, coller ce fichier
 *    4. Deployer  →  Nouveau deploiement
 *         - Type : Application Web
 *         - Executer en tant que : Moi
 *         - Acces : Tout le monde
 *    5. Copier l'URL generee
 *    6. Coller cette URL dans le fichier googleSheets.js
 *       (variable GOOGLE_SCRIPT_URL en haut du fichier)
 *
 * ============================================================
 */

// ─── Point d'entree POST (reception des commandes) ─────────
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var p = e.parameter;

    // --- Traitement du design (base64 → Google Drive) ---
    var designCell = '';
    var designRaw = p.design || '';

    if (designRaw.indexOf('data:image') === 0) {
      // Image en base64 → upload vers Google Drive
      designCell = uploadImageToDrive(designRaw, p.client || 'commande');
    } else if (designRaw.indexOf('http') === 0) {
      // Deja une URL (Firebase Storage par ex.)
      designCell = designRaw;
    }

    // --- Insertion de la ligne ---
    // Chaque champ est lu par NOM → impossible de se tromper de colonne
    sheet.appendRow([
      new Date(),                      // A — Date
      p.client        || '',           // B — Client
      p.tel           || '',           // C — Telephone
      p.collection    || '',           // D — Collection
      p.reference     || '',           // E — Reference
      p.echeance      || '',           // F — Echeance
      p.taille        || '',           // G — Taille
      p.couleurTshirt || '',           // H — Couleur T‑shirt
      p.couleurLogo   || '',           // I — Couleur Logo
      p.logoAvant     || '',           // J — Logo Avant
      p.logoArriere   || '',           // K — Logo Arriere
      p.prixTshirt    || '',           // L — Prix T‑shirt
      p.prixPerso     || '',           // M — Prix Perso
      p.total         || '',           // N — Total
      p.paye          || '',           // O — Paye
      designCell                       // P — Design
    ]);

    // --- Afficher l'image dans la cellule P si on a une URL ---
    if (designCell) {
      var lastRow = sheet.getLastRow();
      var cell = sheet.getRange(lastRow, 16); // colonne P = 16
      cell.setFormula('=IMAGE("' + designCell + '")');
      sheet.setRowHeight(lastRow, 80);
    }

    // --- Formatage auto de la colonne A en date FR ---
    var lastRow2 = sheet.getLastRow();
    sheet.getRange(lastRow2, 1).setNumberFormat('dd/MM/yyyy HH:mm');

    lock.releaseLock();

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', row: lastRow2 }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('ERREUR doPost: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ─── Point d'entree GET (test rapide) ──────────────────────
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'DevisOlda API active',
      version: '2.0'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── Upload base64 → Google Drive ──────────────────────────
function uploadImageToDrive(base64Data, clientName) {
  try {
    var parts   = base64Data.split(',');
    var mime    = parts[0].match(/:(.*?);/)[1];
    var bytes   = Utilities.base64Decode(parts[1]);
    var nomFichier = sanitize(clientName) + '_'
      + Utilities.formatDate(new Date(), 'Europe/Paris', 'yyyyMMdd_HHmmss')
      + '.png';

    var blob   = Utilities.newBlob(bytes, mime, nomFichier);
    var folder = getOrCreateFolder('DevisOlda_Mockups');
    var file   = folder.createFile(blob);

    // Rendre accessible pour que =IMAGE() fonctionne
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // URL directe compatible avec =IMAGE() dans Sheets
    return 'https://lh3.googleusercontent.com/d/' + file.getId();
  } catch (err) {
    Logger.log('Erreur upload image: ' + err.toString());
    return '';
  }
}

// ─── Utilitaires ───────────────────────────────────────────
function getOrCreateFolder(name) {
  var folders = DriveApp.getFoldersByName(name);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(name);
}

function sanitize(name) {
  return (name || 'mockup').replace(/[^a-zA-Z0-9_\- ]/g, '_').substring(0, 50);
}
