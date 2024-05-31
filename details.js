document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("agents-container");
  const conseilsContainer = document.getElementById("conseils-container");

  async function loadAndDisplayPersonnages() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get("selectedPersonnages", function (data) {
        let personnages = data.selectedPersonnages || [];
        container.innerHTML = ""; // Effacer le contenu précédent

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

        if (personnages.length > 0) {
          personnages.forEach(async (personnage) => {
            const div = document.createElement("div");
            div.className = "personnage";
            const nom = document.createElement("h4");
            const role = document.createElement("p");

            if (personnage.image) {
              // Convertir l'image en base64
              const base64Image = await getImageAsBase64(personnage.image);
              if (base64Image) {
                // Intégrer l'image en base64 dans la page HTML
                const img = document.createElement("img");
                img.src = base64Image;
                img.alt = `Image de ${personnage.nom}`;
                img.style.width = "100px";
                div.appendChild(img);
              }
            }

            if (personnage.nom) {
              nom.textContent = personnage.nom;
              div.appendChild(nom);
            }

            if (personnage.role) {
              role.textContent = `Rôle: ${personnage.role}`;
              div.appendChild(role);
            }

            // Ajouter la classe flasheur si c'est un flasheur
            if (personnage.flasheur) {
              div.classList.add("flasheur");
            }

            // Ajouter la classe best-agent si c'est un meilleur agent pour la carte sélectionnée
            if (personnage.bestAgent) {
              div.classList.add("best-agent");
            }

            container.appendChild(div);
          });
          resolve(); // Résoudre la promesse une fois que tout est affiché
        } else {
          container.textContent = "Aucun agent sélectionné.";
          resolve(); // Résoudre même si aucun agent n'est trouvé
        }
      });
    });
  }

  // Fonction pour convertir une image en base64
  function getImageAsBase64(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        const reader = new FileReader();
        reader.onloadend = function () {
          resolve(reader.result);
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.onerror = function () {
        reject(new Error("Erreur lors du chargement de l'image en base64"));
      };
      xhr.open("GET", url);
      xhr.responseType = "blob";
      xhr.send();
    });
  }

  // Fonction pour charger et afficher les conseils
  async function loadAndDisplayConseils() {
    try {
      const response = await fetch(chrome.runtime.getURL("conseils.json"));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const conseils = await response.json();

      // for (const [category, conseilsArray] of Object.entries(conseils)) {
      //   const categoryTitle = document.createElement("h3");
      //   categoryTitle.textContent = category;
      //   conseilsContainer.appendChild(categoryTitle);

      //   const sectionContent = document.createElement("div");
      //   sectionContent.className = "section-content";
      //   conseilsContainer.appendChild(sectionContent);

      //   conseilsArray.forEach((conseil) => {
      //     const conseilDiv = document.createElement("div");
      //     conseilDiv.className = "conseil";

      //     const idee = document.createElement("h4");
      //     idee.textContent = conseil.idée;
      //     conseilDiv.appendChild(idee);

      //     const note = document.createElement("p");
      //     note.textContent = `Note: ${conseil.note}`;
      //     conseilDiv.appendChild(note);

      //     const explication = document.createElement("p");
      //     explication.textContent = conseil.explication;
      //     conseilDiv.appendChild(explication);

      //     sectionContent.appendChild(conseilDiv);
      //   });
      // }
    } catch (error) {
      console.error("Erreur lors du chargement des conseils :", error);
    }
  }

  // Appel des fonctions pour charger et afficher les personnages et les conseils
  loadAndDisplayPersonnages()
    .then(() => {
      // Une fois les personnages chargés, rendre le bouton cliquable
      document
        .getElementById("save-pdf")
        .addEventListener("click", function () {
          html2canvas(document.body)
            .then((canvas) => {
              if (window.jspdf && window.jspdf.jsPDF) {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF("p", "mm", "a4");
                const imgWidth = 210;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                const imgData = canvas.toDataURL("image/png");
                pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
                pdf.save("detail-page.pdf");
              } else {
                console.error("jsPDF n'est pas chargé correctement.");
              }
            })
            .catch((error) => {
              console.error(
                "Erreur lors de la capture avec html2canvas :",
                error
              );
            });
        });
    })
    .catch((error) => {
      console.error("Erreur lors du chargement des personnages :", error);
    });

  loadAndDisplayConseils().catch((error) => {
    console.error("Erreur lors du chargement des conseils :", error);
  });
});
