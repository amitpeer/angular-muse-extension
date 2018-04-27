(function () {
  const NEXT_N_LETTERS = 26;
  const componentLinks = {};
  const components = {};

  let clickableElements;
  let firstElementIndex = 0;

  const abcLetters =
    ["A", "B", "C", "D", "E", "F", "G",
      "H", "I", "J", "K", "L", "M", "N",
      "O", "P", "Q", "R", "S", "T", "U",
      "V", "W", "X", "Y", "Z"];

  function paintNextLetter() {
    const numberOfJumps = firstElementIndex / NEXT_N_LETTERS;
    for (let i = firstElementIndex; i < NEXT_N_LETTERS + firstElementIndex && i < clickableElements.length; i++) {
      const letterIndex = i - numberOfJumps * NEXT_N_LETTERS;
      const letter = document.createTextNode(" " + abcLetters[letterIndex]);
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
      addLetterToElement(clickableElements[i], backgroundSpan);
      // clickableElements[i].appendChild(backgroundSpan);

      components[abcLetters[letterIndex]] = clickableElements[i];
      componentLinks[abcLetters[letterIndex]] = clickableElements[i].href;
    }
  }

  function addLetterToElement(element, letter) {
    if (element.tagName === 'INPUT') {
      var parent = element.parentNode;
      parent.replaceChild(letter, element);
      letter.appendChild(element);
    } else {
      element.appendChild(letter);
    }
  }

  function clearLastPaintedLetter() {
    for (let i = 0; i < NEXT_N_LETTERS; i++) {
      const spanToRemove = components[abcLetters[i]].getElementsByClassName("sighs-component")[0];
      components[abcLetters[i]].removeChild(spanToRemove);
    }
  }

  window.onload = function () {
    let aElements = $('a:visible');
    let textInputElements = $("input:text, input:password");
    clickableElements = $.merge(textInputElements, aElements);
    paintNextLetter();
  };

  function openKeyboard(location) {
    $.get(chrome.extension.getURL('assets/keyboard/keyboard-white.html'), function (data) {
      $(data).appendTo(location);
      var link = document.createElement("link");
      link.href = chrome.extension.getURL('assets/keyboard/keyboard-white.css');
      link.type = "text/css";
      link.rel = "stylesheet";
      document.getElementsByTagName("head")[0].appendChild(link);
    });
  }

  function gapLetters() {
    firstElementIndex = firstElementIndex + NEXT_N_LETTERS;
    clearLastPaintedLetter();
    paintNextLetter();
  }

  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      switch (request.type) {
        case "navigate":
          console.log("painter::Received letter from the extension:" + request.param);
          // window.location.href = componentLinks[request.letter];
          components[request.param].click();
          sendResponse({farewell: "goodbye"});
          break;
        case "matrixLetterChange":
          console.log("painter::Received matrixMovement from the extension:" + request.param);
          components[request.param[0]].getElementsByClassName("sighs-component")[0].style.backgroundColor = 'red';
          components[request.param[1]].getElementsByClassName("sighs-component")[0].style.backgroundColor = 'yellow';
          sendResponse({farewell: "lighting"});
          break;
        case "gapLetters":
          console.log("painter::Received gapLetters from the extension:" + request.param);
          gapLetters();
          sendResponse({farewell: "lighting"});
          break;
      }
    });
})();
