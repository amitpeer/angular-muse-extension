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
      backgroundSpan.setAttribute("class", "sighs-component");
      backgroundSpan.style.backgroundColor = "red";
      backgroundSpan.style.border = "thin dotted blue";
      backgroundSpan.style.opacity = '0.8';

      const letterSpan = document.createElement("span");
      letterSpan.style.fontSize = "20px";
      letterSpan.style.opacity = '1';
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
          console.log("painter::Received letter from the extension:" + request.param);
          // window.location.href = componentLinks[request.letter];
          components[request.param].click();
          sendResponse({farewell: "goodbye"});
          break;
      }
    });

  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      switch (request.type) {
        case "matrixLetterChange":
          console.log("painter::Received matrixMovement from the extension:" + request.param);
          components[request.param[0]].getElementsByClassName("sighs-component")[0].style.backgroundColor = 'red';
          components[request.param[1]].getElementsByClassName("sighs-component")[0].style.backgroundColor = 'yellow';
          sendResponse({farewell: "lighting"});
          break;
      }
    });
})();
