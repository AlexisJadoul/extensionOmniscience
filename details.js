document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('agents-container');

    chrome.storage.local.get('selectedPersonnages', function(data) {
        const personnages = data.selectedPersonnages || [];
        if (personnages.length > 0) {
            personnages.forEach(personnage => {
                const div = document.createElement('div');
                const img = document.createElement('img');
                const nom = document.createElement('h3');
                const role = document.createElement('p');

                if (personnage.image) {
                    img.src = personnage.image;
                    img.alt = `Image de ${personnage.nom}`;
                    img.style.width = '100px'; // Exemple de style
                    div.appendChild(img);
                }

                if (personnage.nom) {
                    nom.textContent = personnage.nom;
                    div.appendChild(nom);
                }

                if (personnage.role) {
                    role.textContent = `Rôle: ${personnage.role}`;
                    div.appendChild(role);
                }

                container.appendChild(div);
            });
        } else {
            container.textContent = 'Aucun agent sélectionné.';
        }
    });

    
    if (window.jspdf && window.jspdf.jsPDF) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        document.getElementById('save-pdf').addEventListener('click', function() {
            const jsPDF = window.jspdf.jsPDF; // Correction ici
            const doc = new jsPDF();
        
            doc.text("Hello world!", 10, 10);
            doc.save("a4.pdf");
        });
    } else {
        console.error('jsPDF n\'est pas chargé correctement.');
    }

   // Fonction hypothétique pour charger une image et la convertir en Data URL
function loadImageAsDataURL(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        var reader = new FileReader();
        reader.onloadend = function() {
            callback(reader.result);
        }
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
}

document.getElementById('save-pdf').addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    chrome.storage.local.get('selectedPersonnages', function(data) {
        const personnages = data.selectedPersonnages || [];
        let yPos = 20;

        // Fonction asynchrone pour ajouter chaque personnage au PDF
        async function addPersonnagesToPDF(personnages) {
            for (const personnage of personnages) {
                // Ajouter le texte
                doc.text(`${personnage.nom} (${personnage.role})`, 10, yPos);
                yPos += 10;

                // Charger et ajouter l'image
                if (personnage.image) {
                    await new Promise((resolve, reject) => {
                        loadImageAsDataURL(personnage.image, function(dataUrl) {
                            // Ajouter l'image au PDF
                            doc.addImage(dataUrl, 'JPEG', 10, yPos, 30, 30);
                            yPos += 35; // Ajuster l'espace pour la prochaine entrée
                            resolve();
                        });
                    });
                }
            }

            // Tous les personnages ont été ajoutés, sauvegarder le PDF
            doc.save('agents-selectionnes.pdf');
        }

        addPersonnagesToPDF(personnages).catch(console.error);
    });
});

});
