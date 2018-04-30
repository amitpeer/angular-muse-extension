(function () {
  const componentLinks = {};
  const components = {};
  const CLASS_FATHER = "sighs-component-father";
  const CLASS_CHILD = "sighs-component-child";
  let NEXT_N_LETTERS = 26;
  let clickableElements;
  let firstElementIndex = 0;

  const abcLetters =
    ["A", "B", "C", "D", "E", "F", "G",
      "H", "I", "J", "K", "L", "M", "N",
      "O", "P", "Q", "R", "S", "T", "U",
      "V", "W", "X", "Y", "Z"];

  function paintNextClickableElement() {
    const numberOfJumps = firstElementIndex / NEXT_N_LETTERS;
    for (let i = firstElementIndex; i < NEXT_N_LETTERS + firstElementIndex && i < clickableElements.length; i++) {
      const letterIndex = i - numberOfJumps * NEXT_N_LETTERS;
      const letter = document.createTextNode(" " + abcLetters[letterIndex]);
      const backgroundSpan = document.createElement("span");
      backgroundSpan.style.backgroundColor = "red";
      backgroundSpan.style.border = "thin dotted blue";
      backgroundSpan.style.opacity = '0.8';

      const letterSpan = document.createElement("span");
      letterSpan.style.fontSize = "20px";
      letterSpan.style.opacity = '1';
      letterSpan.style.color = "green";

      letterSpan.appendChild(letter);
      backgroundSpan.appendChild(letterSpan);
      backgroundSpan.setAttribute("id", "letter-component-" + abcLetters[letterIndex]);
      // clickableElements[i].appendChild(backgroundSpan);

      components[abcLetters[letterIndex]] = addLetterToElement(clickableElements[i], backgroundSpan);
      componentLinks[abcLetters[letterIndex]] = clickableElements[i].href;
    }
  }

  function addLetterToElement(element, letter) {
    let father;
    if (element.tagName === 'INPUT') {
      let parent = element.parentNode;
      letter.setAttribute("class", CLASS_FATHER);
      parent.replaceChild(letter, element);
      letter.appendChild(element);
      father = letter;
    } else {
      letter.setAttribute("class", CLASS_CHILD);
      element.appendChild(letter);
      father = element;
    }
    return father;
  }

  function isFatherComponent(component) {
    return component.className === CLASS_FATHER
  }

  function isChildComponent(component) {
    return component.className === CLASS_CHILD
  }

  function safeGetLetterElement(letter) {
    return isFatherComponent(components[letter]) ? components[letter]
      : components[letter].getElementsByClassName(CLASS_CHILD)[0];
  }

  function safeGetConcreteElement(letter) {
    return isFatherComponent(components[letter]) ? components[letter].childNodes[1]
      : components[letter];
  }

  function safeRemove(spanToRemove, letter) {
    if (isFatherComponent(spanToRemove)) {
      let cnt = spanToRemove.childNodes[1];
      spanToRemove.replaceWith(cnt);
    }
    else {
      components[letter].removeChild(spanToRemove);
    }
  }

  function clearLastClickableElements() {
    let numberOfLettersToRemove = firstElementIndex + NEXT_N_LETTERS <= clickableElements.length ? NEXT_N_LETTERS
      : clickableElements.length - firstElementIndex - 1;
    for (let i = 0; i < numberOfLettersToRemove; i++) {
      const spanToRemove = safeGetLetterElement(abcLetters[i]);
      safeRemove(spanToRemove, abcLetters[i]);
    }
  }

  $(document).ready(function () {
    let aElements = $('a:visible');
    let textInputElements = $("input:visible");
    let buttons = $('button');
    clickableElements = $.merge(textInputElements, aElements);
    paintNextClickableElement();
  });

  function gapLetters() {
    firstElementIndex = firstElementIndex + NEXT_N_LETTERS >= clickableElements.length ? 0 : firstElementIndex + NEXT_N_LETTERS;
    clearLastClickableElements();
    paintNextClickableElement();
  }

  function getComponentTag(letter) {
    return safeGetConcreteElement(letter).tagName;
  }

  function getComponentType(letter) {
    return safeGetConcreteElement(letter).type;

  }

  function click(letter) {
    // window.location.href = componentLinks[letter];
    safeGetConcreteElement(letter).click()
  }

  function painedLetterCollatedWithMatrix(nextLetter, lastLetter) {
    let coloredWithNewColor = safeGetLetterElement(nextLetter);
    let coloredWithDefaultColor = safeGetLetterElement(lastLetter);

    coloredWithDefaultColor.style.backgroundColor = 'red';
    coloredWithNewColor.style.backgroundColor = 'yellow';

  }

  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      switch (request.type) {
        case "navigate":
          console.log("painter::Received letter from the extension:" + request.param);
          let tag = getComponentTag(request.param);
          if (tag === "A" || tag === "BUTTON") {
            click(request.param);
          } else if (tag === "INPUT") {
            let type = getComponentType(request.param);
            if(type === "submit" || type === "checkbox"){
              click(request.param);
            }
            else {
              sendResponse({input: components[request.param].id});
            }
          }
          break;
        case "matrixLetterChange":
          console.log("painter::Received matrixMovement from the extension:" + request.param);
          painedLetterCollatedWithMatrix(request.param[1], request.param[0]);
          sendResponse({farewell: "lighting"});
          break;
        case "gapLetters":
          console.log("painter::Received gapLetters from the extension:" + request.param);
          gapLetters();
          sendResponse({farewell: "g  aping"});
          break;
      }
    });
})();
