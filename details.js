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

    document.getElementById('save-pdf').addEventListener('click', function() {
        const jsPDF = window.jspdf.jsPDF; // Correction ici
        const doc = new jsPDF();
    
        doc.text("Hello world!", 10, 10);
        doc.save("a4.pdf");
    });
});
