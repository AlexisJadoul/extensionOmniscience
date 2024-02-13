document.addEventListener('DOMContentLoaded', function() {
    // Récupération et affichage des personnages sélectionnés
    const container = document.getElementById('agents-container');

    // Supposons que vous ayez une fonction pour obtenir les personnages sélectionnés
    // Cette fonction devrait être asynchrone si elle récupère les données à partir d'une API ou d'une source externe
    async function loadAndDisplayPersonnages() {
        // Utilisez chrome.storage.local.get pour récupérer les personnages
        chrome.storage.local.get('selectedPersonnages', function(data) {
            const personnages = data.selectedPersonnages || [];
            const container = document.getElementById('agents-container');
    
            if (personnages.length > 0) {
                personnages.forEach(personnage => {
                    const div = document.createElement('div');
                    const img = document.createElement('img');
                    const nom = document.createElement('h3');
                    const role = document.createElement('p');
    
                    if (personnage.image) {
                        img.src = personnage.image;
                        img.alt = `Image de ${personnage.nom}`;
                        img.style.width = '100px';
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
    }
    

    // Appel de la fonction pour charger et afficher les personnages
    loadAndDisplayPersonnages().then(() => {
        // Une fois les personnages chargés, rendre le bouton cliquable
        document.getElementById('save-pdf').addEventListener('click', function() {
            html2canvas(document.body).then(canvas => {
                if (window.jspdf && window.jspdf.jsPDF) {
                    const { jsPDF } = window.jspdf;
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const imgWidth = 210;
                    const imgHeight = canvas.height * imgWidth / canvas.width;
                    const imgData = canvas.toDataURL('image/png');
                    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                    pdf.save('detail-page.pdf');
                } else {
                    console.error('jsPDF n\'est pas chargé correctement.');
                }
            }).catch(error => {
                console.error("Erreur lors de la capture avec html2canvas :", error);
            });
        });
    }).catch(error => {
        console.error("Erreur lors du chargement des personnages :", error);
    });
});
