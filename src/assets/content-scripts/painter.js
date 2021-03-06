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

  // $(document).ready(function () {
  //   retrieveClickableElements();
  // });

  window.onload = retrieveClickableElements;

  function retrieveClickableElements() {
    let aElements = $('a:visible');
    let textInputElements = $('input:visible');
    let textareas = $('textarea:visible');
    let buttons = $('button:visible');

    let inputsAndLinks = $.merge(textInputElements, aElements);
    let withTextAreas = $.merge(inputsAndLinks, textareas);
    clickableElements = $.merge(withTextAreas, buttons);

    clickableElements = filterElements(clickableElements);

    // because of render issues, sometimes the letter is changing location after we put it in DOM
    // hence the timeout - add the letter to DOM after the render occurred
    setTimeout(paintNextClickableElement, 300);
  }

  function isExcludedElement(element) {
    return element.getAttribute('aria-label') === 'כלי הזנה' || element.id === 'logo'
      || element.className.includes('ab_button')
  }

  function isVisible(element) {
    return element.style.opacity !== '0' && element.style.visibility !== 'hidden';
  }

  function isGoogleHiddenInput(element) {
    if (!isVisible(element) || element.getAttribute('aria-hidden')) {
      return true;
    }
    return false
  }

  function filterElements(inputs) {
    let visibleInputs = [];

    for (let i = 0; i < inputs.length; i++) {
      if (!isGoogleHiddenInput(inputs[i]) && !isExcludedElement(inputs[i])) {
        visibleInputs.push(inputs[i])
      }
    }

    return visibleInputs
  }

  function paintNextClickableElement() {
    const numberOfJumps = firstElementIndex / NEXT_N_LETTERS;
    for (let i = firstElementIndex; i < NEXT_N_LETTERS + firstElementIndex && i < clickableElements.length; i++) {
      const letterIndex = i - numberOfJumps * NEXT_N_LETTERS;
      const letter = document.createTextNode(" " + abcLetters[letterIndex]);
      const backgroundSpan = document.createElement("span");

      const letterSpan = document.createElement("span");
      letterSpan.style.fontSize = "20px";
      letterSpan.style.opacity = '1';
      letterSpan.style.color = "white";
      letterSpan.style.backgroundColor = "blue";
      letterSpan.style.opacity = '0.9';
      letterSpan.style.fontWeight = 'bold';
      letterSpan.style.alignItems = 'center';
      letterSpan.style.border = '1px solid aqua';

      letterSpan.appendChild(letter);
      backgroundSpan.appendChild(letterSpan);
      backgroundSpan.setAttribute("id", "letter-component-" + abcLetters[letterIndex]);

      setLetters(letterIndex, backgroundSpan, clickableElements[i]);
    }
  }

  function setLetters(letterIndex, backgroundSpan, clickableElement) {
    components[abcLetters[letterIndex]] = addLetterToElement(clickableElement, backgroundSpan);
    componentLinks[abcLetters[letterIndex]] = clickableElement.href;
  }

  function addLetterToElement(element, letter) {
    let father;
    if (isFreeTextElement(element.tagName)) {
      let parent = element.parentNode;
      if (parent) {
        letter.setAttribute("class", CLASS_FATHER);
        parent.replaceChild(letter, element);
        letter.appendChild(element);
        father = letter;
      }
    } else {
      letter.setAttribute("class", CLASS_CHILD);
      letter.style.display = 'inline-flex';
      element.appendChild(letter);
      father = element;
    }
    return father;
  }

  function isFatherComponent(component) {
    return component.className === CLASS_FATHER
  }

  function getCorrectLetterChildByLetter(letter) {
    let children = components[letter].getElementsByClassName(CLASS_CHILD);
    for (let i = 0; i < children.length; i++) {
      if (children[i].id.endsWith(letter)) {
        return children[i];
      }
    }
  }

  function safeGetLetterElement(letter) {
    return isFatherComponent(components[letter]) ? components[letter]
      : getCorrectLetterChildByLetter(letter);
  }

  function safeGetConcreteElement(letter) {
    return isFatherComponent(components[letter]) ? components[letter].childNodes[1] : components[letter];
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
      : clickableElements.length - firstElementIndex;
    for (let i = 0; i < numberOfLettersToRemove; i++) {
      let comp = components[abcLetters[i]];
      if (comp) {
        const spanToRemove = safeGetLetterElement(abcLetters[i]);
        safeRemove(spanToRemove, abcLetters[i]);
      }
    }
  }

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

  function notANavigatedClick(element) {
    return element.getAttribute("role") === "button";
  }

  function click(letter) {
    // window.location.href = componentLinks[letter];
    safeGetConcreteElement(letter).click();
    if (notANavigatedClick(safeGetConcreteElement(letter))) {
      clearLastClickableElements();
      retrieveClickableElements();
    }

  }

  function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
  }

  function paintLetterElementAccordingToMatrix(nextLetter, lastLetter) {
    if (isLetter(nextLetter)) {
      let coloredWithNewColor = safeGetLetterElement(nextLetter);
      coloredWithNewColor.childNodes[0].style.backgroundColor = 'darkorange';
    }
    if (isLetter(lastLetter)) {
      let coloredWithDefaultColor = safeGetLetterElement(lastLetter);
      coloredWithDefaultColor.childNodes[0].style.backgroundColor = 'blue';
    }
  }

  function isFreeTextElement(tag) {
    return tag === "INPUT" || tag === 'TEXTAREA'
  }

  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      switch (request.type) {
        case "navigate":
          console.log("painter::Received letter from the extension:" + request.param);
          let tag = getComponentTag(request.param);
          if (tag === "A" || tag === "BUTTON") {
            click(request.param);
          } else if (isFreeTextElement(tag)) {
            let type = getComponentType(request.param);
            if (type === "submit" || type === "checkbox") {
              click(request.param);
            }
            else {
              sendResponse({input: components[request.param].id});
            }
          }
          break;
        case "matrixLetterChange":
          console.log("painter::Received matrixMovement from the extension:" + request.param);
          paintLetterElementAccordingToMatrix(request.param[1], request.param[0]);
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
