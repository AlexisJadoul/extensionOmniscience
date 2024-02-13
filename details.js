document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('save-pdf').addEventListener('click', function() {
        // Utiliser html2canvas pour capturer le contenu de la page
        html2canvas(document.body).then(canvas => {
            // S'assurer que jsPDF est chargé correctement
            if (window.jspdf && window.jspdf.jsPDF) {
                // Utiliser la déstructuration pour accéder à jsPDF à partir de window.jspdf
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');
                
                // Calculer la largeur et la hauteur de l'image pour qu'elle s'adapte à la largeur de la page PDF
                const imgWidth = 210; // Largeur de la page A4 en mm
                const imgHeight = canvas.height * imgWidth / canvas.width;

                // Convertir le canvas en une DataURL de l'image
                const imgData = canvas.toDataURL('image/png');

                // Ajouter l'image au PDF
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

                // Sauvegarder le PDF
                pdf.save('detail-page.pdf');
            } else {
                console.error('jsPDF n\'est pas chargé correctement.');
            }
        }).catch(error => {
            console.error("Erreur lors de la capture avec html2canvas :", error);
        });
    });
});
