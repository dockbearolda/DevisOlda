/**
 * CONFIGURATEUR DE COLLECTION HAUT DE GAMME
 * Gestion de la personnalisation (Drag & Drop + Resize)
 */

document.addEventListener("DOMContentLoaded", function() {
    // 1. Initialisation du Canvas Fabric.js
    // On l'adapte à la taille de l'image de votre t-shirt
    const canvas = new fabric.Canvas('tshirt-canvas', {
        width: 450,
        height: 550,
        selection: false,
        preserveObjectStacking: true
    });

    // 2. Définition de la Zone d'Impression (Contraintes)
    // Le logo ne pourra pas sortir de ce rectangle imaginaire sur le torse
    const printArea = {
        top: 140,
        left: 130,
        width: 190,
        height: 250
    };

    // 3. Chemins des images (Basés sur vos captures d'écran)
    const imagesPath = {
        front: 'assets/images/tshirt-front-blanc.png.PNG',
        logoDefault: 'assets/images/logo-placeholder.png' // À remplacer par votre logo
    };

    /**
     * Fonction pour ajouter/charger un logo sur le canvas
     */
    window.loadLogo = function(url) {
        fabric.Image.fromURL(url, function(img) {
            img.scaleToWidth(100); // Taille initiale élégante
            
            img.set({
                left: 225, // Centré horizontalement
                top: 250,  // Positionné sur la poitrine
                originX: 'center',
                originY: 'center',
                transparentCorners: false,
                cornerColor: '#000000', // Noir minimaliste
                cornerStrokeColor: '#ffffff',
                cornerSize: 10,
                cornerStyle: 'circle', // Poignées rondes "High-End"
                borderColor: '#000000',
                borderDashArray: [3, 3],
                padding: 10
            });

            // Gestion des limites (ne pas sortir du t-shirt)
            img.on('moving', function() {
                // Limite Haut
                if (this.top < printArea.top) this.top = printArea.top;
                // Limite Gauche
                if (this.left < printArea.left) this.left = printArea.left;
                // Limite Bas
                if (this.top > printArea.top + printArea.height) {
                    this.top = printArea.top + printArea.height;
                }
                // Limite Droite
                if (this.left > printArea.left + printArea.width) {
                    this.left = printArea.left + printArea.width;
                }
            });

            // Supprimer l'ancien logo s'il existe avant d'ajouter le nouveau
            canvas.clear();
            canvas.add(img);
            canvas.setActiveObject(img);
        });
    };

    /**
     * Gestion du changement de vue (Avant/Arrière)
     */
    window.switchView = function(view) {
        const tshirtElement = document.getElementById('tshirt-template');
        
        // Effet de transition fluide
        tshirtElement.style.opacity = "0.3";
        
        setTimeout(() => {
            if (view === 'front') {
                tshirtElement.src = imagesPath.front;
                // Vous pouvez ajouter ici le chargement du logo spécifique face avant
            } else {
                // tshirtElement.src = 'assets/images/votre-tshirt-dos.png';
            }
            tshirtElement.style.opacity = "1";
        }, 300);
    };

    /**
     * Sauvegarde de la configuration pour le panier
     */
    window.saveConfiguration = function() {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            const config = {
                positionX: activeObject.left,
                positionY: activeObject.top,
                scale: activeObject.scaleX,
                rotation: activeObject.angle
            };
            console.log("Configuration de la Collection sauvegardée :", config);
            // Ici, vous envoyez 'config' à votre base de données ou votre panier
            return config;
        }
    };

    // Chargement initial
    loadLogo(imagesPath.logoDefault);
});
