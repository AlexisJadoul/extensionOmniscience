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

    document.getElementById('save-pdf').addEventListener('click', function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text('Agents Sélectionnés:', 10, 10);

        let yPos = 20;
        personnages.forEach(personnage => {
            doc.text(`${personnage.nom} (${personnage.role})`, 10, yPos);
            yPos += 10;
        });

        if (personnages.length === 0) {
            doc.text('Aucun agent sélectionné.', 10, yPos);
        }

        doc.save('agents-selectionnes.pdf');
    });
});
