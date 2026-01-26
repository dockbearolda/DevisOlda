document.addEventListener("DOMContentLoaded", function() {
    // Initialisation du Canvas
    const canvas = new fabric.Canvas('tshirt-canvas', {
        width: 450,
        height: 550,
        selection: false // Désactive la sélection multiple pour plus de clarté
    });

    // Zone d'impression maximale (coordonnées relatives au canvas)
    const printArea = { top: 120, left: 130, width: 190, height: 280 };

    // Fonction pour charger le logo
    function loadLogo(url) {
        fabric.Image.fromURL(url, function(img) {
            img.scaleToWidth(80); // Taille initiale
            img.set({
                left: 225,
                top: 250,
                originX: 'center',
                originY: 'center',
                transparentCorners: false,
                cornerColor: '#000000',
                cornerStrokeColor: '#ffffff',
                cornerSize: 8,
                cornerStyle: 'circle', // Poignées élégantes
                borderColor: '#000000',
                borderDashArray: [3, 3]
            });

            // Contrainte : Empêcher de sortir de la zone d'impression
            img.on('moving', function() {
                if (this.top < printArea.top) this.top = printArea.top;
                if (this.left < printArea.left) this.left = printArea.left;
                if (this.top > printArea.top + printArea.height) this.top = printArea.top + printArea.height;
                if (this.left > printArea.left + printArea.width) this.left = printArea.left + printArea.width;
            });

            canvas.add(img);
            canvas.setActiveObject(img);
        });
    }

    // Gestion du changement de vue (Front/Back)
    window.switchView = function(view) {
        const imgElement = document.getElementById('tshirt-template');
        const btnFront = document.getElementById('btn-front');
        const btnBack = document.getElementById('btn-back');

        // Animation de transition fluide
        imgElement.style.opacity = 0;
        
        setTimeout(() => {
            if(view === 'front') {
                imgElement.src = 'votre-tshirt-front.png';
                btnFront.classList.add('active');
                btnBack.classList.remove('active');
            } else {
                imgElement.src = 'votre-tshirt-back.png';
                btnBack.classList.add('active');
                btnFront.classList.remove('active');
            }
            imgElement.style.opacity = 1;
        }, 300);

        // Ici, tu peux aussi sauvegarder/charger les logos spécifiques à chaque face
    };

    // Exemple d'appel : charger le logo par défaut
    loadLogo('votre-logo-hd.png');
});
