document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("personnages-container");
  const mapSelector = document.getElementById("map-selector");
  const mapImage = document.getElementById("map-image");
  const categorySelector = document.getElementById("category-selector");
  const conseilsContainer = document.getElementById("conseils-container");
  let personnages = [];
  let mapsData = [];
  let conseilsData = {};

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

  // Charger les conseils depuis un fichier JSON
  function chargerConseils() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", chrome.runtime.getURL("conseils.json"), true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        conseilsData = JSON.parse(xhr.responseText);
        remplirCategories();
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

  // Fonction pour remplir le sélecteur de catégories de conseils
  function remplirCategories() {
    categorySelector.innerHTML =
      '<option value="">--Sélectionnez une catégorie--</option>';
    for (const category in conseilsData) {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelector.appendChild(option);
    }
  }

  // Fonction pour afficher les conseils pour une catégorie sélectionnée
  function afficherConseils(category) {
    conseilsContainer.innerHTML = "";
    const conseils = conseilsData[category];
    conseils.forEach((conseil) => {
      const div = document.createElement("div");
      div.className = "conseil";

      const titre = document.createElement("h3");
      titre.textContent = conseil.idée;

      const note = document.createElement("p");
      note.textContent = `Note: ${conseil.note}`;

      const explication = document.createElement("p");
      explication.textContent = conseil.explication;

      div.appendChild(titre);
      div.appendChild(note);
      div.appendChild(explication);
      conseilsContainer.appendChild(div);
    });
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

    // Trier les personnages pour mettre les flasheurs en premier
    personnages.sort((a, b) => {
      if (a.flasheur && !b.flasheur) {
        return -1;
      } else if (!a.flasheur && b.flasheur) {
        return 1;
      } else {
        return 0;
      }
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

  // Ajoute un écouteur d'événements sur le sélecteur de catégorie de conseils
  categorySelector.addEventListener("change", () => {
    const selectedCategory = categorySelector.value;
    if (selectedCategory) {
      afficherConseils(selectedCategory);
    } else {
      conseilsContainer.innerHTML = "";
    }
  });

  // Charger les personnages, les cartes et les conseils au démarrage de la popup
  chargerCartes();
  chargerPersonnages();
  chargerConseils();
});
