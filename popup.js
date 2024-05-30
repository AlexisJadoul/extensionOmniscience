document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("personnages-container");
  const mapSelector = document.getElementById("map-selector");
  const mapImage = document.getElementById("map-image");
  const resetButton = document.getElementById("reset-selection");
  let personnages = [];
  let mapsData = [];

  // Charger les personnages depuis un fichier JSON
  function chargerPersonnages() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", chrome.runtime.getURL("personnages.json"), true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        personnages = JSON.parse(xhr.responseText);
        afficherPersonnages(personnages);
      } else {
        console.error(
          "Erreur lors du chargement du fichier JSON:",
          xhr.statusText
        );
      }
    };
    xhr.onerror = function () {
      console.error(
        "Erreur réseau lors de la tentative de chargement du fichier JSON."
      );
    };
    xhr.send();
  }

  // Charger les cartes depuis un fichier JSON
  function chargerCartes() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", chrome.runtime.getURL("maps.json"), true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        mapsData = JSON.parse(xhr.responseText).maps;
      } else {
        console.error(
          "Erreur lors du chargement du fichier JSON:",
          xhr.statusText
        );
      }
    };
    xhr.onerror = function () {
      console.error(
        "Erreur réseau lors de la tentative de chargement du fichier JSON."
      );
    };
    xhr.send();
  }

  // Fonction pour afficher les personnages dans la popup
  function afficherPersonnages(personnages) {
    container.innerHTML = "";
    const selectedMap = mapSelector.value;
    const mapData = mapsData.find((map) => map.name === selectedMap);
    const bestAgents = mapData ? mapData.best_agents : [];

    // Mettre à jour l'image de la carte
    if (selectedMap) {
      mapImage.src = chrome.runtime.getURL(`images/maps/${selectedMap}.png`);
      mapImage.style.display = "block";
    } else {
      mapImage.style.display = "none";
    }

    // Trier les personnages pour mettre les best agents pour la carte en premier, puis les flasheurs
    personnages.sort((a, b) => {
      if (bestAgents.includes(a.nom) && !bestAgents.includes(b.nom)) return -1;
      if (!bestAgents.includes(a.nom) && bestAgents.includes(b.nom)) return 1;
      if (a.flasheur && !b.flasheur) return -1;
      if (!a.flasheur && b.flasheur) return 1;
      return 0;
    });

    personnages.forEach((personnage) => {
      const div = document.createElement("div");
      div.className = "personnage";

      // Appliquer la classe flasheur si c'est un flasheur
      if (personnage.flasheur) {
        div.classList.add("flasheur");
      }

      // Appliquer la classe highlight si le personnage est recommandé pour la carte sélectionnée
      if (bestAgents.includes(personnage.nom)) {
        div.classList.add("highlight");
      }

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

      // Ajout de l'écouteur de clic sur toute la div
      div.addEventListener("click", function () {
        checkbox.checked = !checkbox.checked;
      });
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
  document
    .getElementById("save-selection")
    .addEventListener("click", function () {
      const selectedPersonnages = [
        ...document.querySelectorAll("#personnages-container input:checked"),
      ].map((checkbox) => {
        return personnages.find((p) => p.id === checkbox.value);
      });

      chrome.storage.local.set(
        { selectedPersonnages: selectedPersonnages },
        function () {
          console.log("Sélection sauvegardée avec succès.");
          document.getElementById("confirmation-message").style.display =
            "block";

          // Redirection vers details.html après la sauvegarde
          chrome.tabs.create({ url: chrome.runtime.getURL("details.html") });
        }
      );
    });

  // Ajoute un écouteur d'événements sur le sélecteur de carte
  mapSelector.addEventListener("change", () =>
    afficherPersonnages(personnages)
  );

  // Ajoute un écouteur d'événements sur le bouton "Réinitialiser"
  resetButton.addEventListener("click", function () {
    document
      .querySelectorAll("#personnages-container input:checked")
      .forEach((checkbox) => {
        checkbox.checked = false;
      });
    chrome.storage.local.remove("selectedPersonnages", function () {
      console.log("Sélection réinitialisée avec succès.");
    });
  });

  // Charger les personnages et les cartes au démarrage de la popup
  chargerCartes();
  chargerPersonnages();
});
