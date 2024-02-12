document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("personnages-container");
    let personnages = [];

    // Fonction pour charger les personnages depuis un fichier JSON
    function chargerPersonnages() {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", chrome.runtime.getURL("personnages.json"), true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                personnages = JSON.parse(xhr.responseText);
                afficherPersonnages(personnages);
            } else {
                console.error("Erreur lors du chargement du fichier JSON:", xhr.statusText);
            }
        };
        xhr.onerror = function () {
            console.error("Erreur réseau lors de la tentative de chargement du fichier JSON.");
        };
        xhr.send();
    }

    // Fonction pour afficher les personnages dans la popup
    function afficherPersonnages(personnages) {
        personnages.forEach((personnage) => {
            const div = document.createElement("div");
            div.className = "personnage";

            const img = document.createElement("img");
            img.src = personnage.image;
            img.alt = personnage.nom;
            img.width = 50;
            img.height = 50;

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = personnage.id;
            checkbox.value = personnage.id;

            const label = document.createElement("label");
            label.htmlFor = personnage.id;
            label.textContent = `${personnage.nom} (${personnage.role})`;

            div.appendChild(img);
            div.appendChild(label);
            div.appendChild(checkbox);
            container.appendChild(div);
        });

        // Charger les sélections précédentes et cocher les checkboxes correspondantes
        chargerSelectionsPrecedentes();
    }

    // Fonction pour charger les sélections précédentes du stockage local
    function chargerSelectionsPrecedentes() {
        chrome.storage.local.get("selectedPersonnages", function (result) {
            if (result.selectedPersonnages) {
                result.selectedPersonnages.forEach((personnage) => {
                    const checkbox = document.getElementById(personnage.id);
                    if (checkbox) checkbox.checked = true;
                });
            }
        });
    }

    // Ajoute un écouteur d'événements sur le bouton "Sauvegarder"
    document.getElementById("save-selection").addEventListener("click", function() {
        const selectedPersonnages = [...document.querySelectorAll("#personnages-container input:checked")].map(checkbox => {
            return personnages.find(p => p.id === checkbox.value);
        });

        chrome.storage.local.set({ 'selectedPersonnages': selectedPersonnages }, function() {
            console.log('Sélection sauvegardée avec succès.');

            // Redirection vers details.html après la sauvegarde
            chrome.tabs.create({ url: chrome.runtime.getURL('details.html') });
        });
    });

    // Charge les personnages au démarrage de la popup
    chargerPersonnages();
});
