const componentLinks = {};
const components = {};
const KEYBOARD_SELECTOR = "gs_ok0";

var keyboard;
var keyboardIndex;

$(document).ready(function () {
  console.log("content.js");

  const abcLetters =
    ["A", "B", "C", "D", "E", "F", "G",
      "H", "I", "J", "K", "L", "M", "N",
      "O", "P", "Q", "R", "S", "T", "U",
      "V", "W", "X", "Y", "Z"];

  const aElements = $("a:visible");

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

function keyboardStart() {
  keyboard = window.document.body.getElementsByClassName("vk-btn");
  keyboardIndex = 0;
  keyChanged(keyboardIndex);
}

function keyChanged(index) {
  keyboard[keyboardIndex].style.background = "aqua";
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    switch (request.type) {
      case "navigate":
        console.log("content::Received letter from the extension:" + request.letter);
        // window.location.href = componentLinks[request.letter];
        components[request.letter].click();
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

      case "home":
        console.log("content::home");
        window.location.href = "https://www.google.com";
        break;

      case "keyboard":
        console.log("content::keyboard");
        const keyboard = window.document.getElementById(KEYBOARD_SELECTOR);
        keyboard.click();
        this.keyboardStart();
        break;
    }
  });
