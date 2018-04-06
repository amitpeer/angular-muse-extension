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
    backgroundSpan.style.opacity = 0.8;

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
        console.log("content::Received letter from the extension:" + request.letter);
        window.location.href = linksOfLetters[request.letter];
        sendResponse({farewell: "goodbye"});
        break;

      case "scrollDown":
        console.log("content::scroll down");
        window.scrollBy(0, 15);
        break;

      case "scrollUp":
        console.log("content::scroll up");
        window.scrollBy(0, -15);
        break;

      case "refresh":
        console.log("content::refresh");
        location.reload();
        break;

      case "back":
        console.log("content::back");
        window.history.go(-1);
        break;

      case "forward":
        console.log("content::forward");
        window.history.go(1);
        break;

      case "goHome":
        console.log("content::goHome");
        window.location.href = "https://www.google.com";
        break;
    }
  });
