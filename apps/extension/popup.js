/**
 * Popup: try selected text first, then tab URL/title; build handoff URL and open.
 */
(function () {
  const button = document.getElementById("open");
  const hint = document.getElementById("hint");

  button.addEventListener("click", function () {
    button.disabled = true;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      if (!tab) {
        hint.textContent = "No tab.";
        button.disabled = false;
        return;
      }

      function send(text) {
        const chosen = window.chooseHandoffText(text, tab.url, tab.title);
        const url = window.buildHandoffUrl(chosen);
        if (url) {
          window.location.href = url;
        } else {
          hint.textContent = "No selection, URL, or title to send.";
        }
        button.disabled = false;
      }

      chrome.scripting.executeScript(
        { target: { tabId: tab.id }, func: function () { return window.getSelection().toString().trim(); } },
        function (results) {
          if (chrome.runtime.lastError) {
            send("");
            return;
          }
          const selection = (results && results[0] && results[0].result != null) ? results[0].result : "";
          send(selection);
        }
      );
    });
  });
})();
