let linksOfLetters = {};

$(document).ready(function () {
  console.log("content.js");

  let abcLetters = ["A", "B", "C", "D", "E", "F", "G",
    "H", "I", "J", "K", "L", "M", "N",
    "O", "P", "Q", "R", "S", "T", "U",
    "V", "W", "X", "Y", "Z"];

  let aElements = $("a:visible");

  for (let i = 0; i < abcLetters.length; i++) {
    let letter = document.createTextNode(" " + abcLetters[i]);
    let backgroundSpan = document.createElement("span");
    backgroundSpan.style.backgroundColor = "red";
    backgroundSpan.style.border = "thin dotted blue";
    backgroundSpan.style.opacity = 0.6;

    let letterSpan = document.createElement("span");
    letterSpan.style.fontSize = "20px";
    letterSpan.style.opacity = 1;
    letterSpan.style.color = "green";

    letterSpan.appendChild(letter);
    backgroundSpan.appendChild(letterSpan);
    aElements[i].appendChild(backgroundSpan);

    linksOfLetters[abcLetters[i]] = aElements[i].href;
  }
});

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    switch (request.type) {
      case "navigate":
        console.log("Received letter from the extension:" + request.letter);
        // window.location.href = linksOfLetters[request.letter];
        sendResponse({farewell: "goodbye"});
        break;
      case "openModal":
        console.log("open modal");
        // window.open("..\\index.html", "extension_popup", "width=300,height=400,status=no,scrollbars=no,resizable=no");
        break;
    }
  });
