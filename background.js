chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.action === "saveSelection") {
        chrome.storage.local.set({selectedCharacters: request.data}, function() {
          console.log("Sélection sauvegardée.");
        });
      }
    }
  );
  