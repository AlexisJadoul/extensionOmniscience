let selectedCharacters = ["Astra", "Sova"]; // Supposons que ce soit les personnages sélectionnés
chrome.runtime.sendMessage({type: "saveSelection", data: selectedCharacters});
