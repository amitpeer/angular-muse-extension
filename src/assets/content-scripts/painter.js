(function () {
  const componentLinks = {};
  const components = {};

  $(document).ready(function () {
    const abcLetters =
      ["A", "B", "C", "D", "E", "F", "G",
        "H", "I", "J", "K", "L", "M", "N",
        "O", "P", "Q", "R", "S", "T", "U",
        "V", "W", "X", "Y", "Z"];

    const aElements = $('a:visible');

    for (let i = 0; i < abcLetters.length; i++) {
      const letter = document.createTextNode(" " + abcLetters[i]);
      const backgroundSpan = document.createElement("span");
      backgroundSpan.style.backgroundColor = "red";
      backgroundSpan.style.border = "thin dotted blue";
      backgroundSpan.style.opacity = 0.8;

      const letterSpan = document.createElement("span");
      letterSpan.style.fontSize = "20px";
      letterSpan.style.opacity = 1;
      letterSpan.style.color = "green";

      letterSpan.appendChild(letter);
      backgroundSpan.appendChild(letterSpan);
      aElements[i].appendChild(backgroundSpan);

      components[abcLetters[i]] = aElements[i];
      componentLinks[abcLetters[i]] = aElements[i].href;
    }
  });

  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      switch (request.type) {
        case "navigate":
          console.log("content::Received letter from the extension:" + request.letter);
          // window.location.href = componentLinks[request.letter];
          components[request.param].click();
          sendResponse({farewell: "goodbye"});
          break;
      }
    });
})();
