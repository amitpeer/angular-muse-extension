(function () {
  const KEYBOARD_ICON_SELECTOR = 'gs_ok0';
  const KEYBOARD_CLOSE_SELECTOR = '.vk-t-btn-o';
  const LETTERS_SELECTOR = '.vk-btn';
  const SEARCH_BUTTON_SELECTOR = 'btnK';
  const KEYBOARD_CONTAINER_SELECTOR = '#kbd';
  const SEARCH_INPUT_SELECTOR = "input[name='q']";
  const SUGGESTIONS_SELECTOR = '.gstl_0';

  const indexOfKey = mapKeyToIndex();
  const SEARCH_INDEX = 40;
  const DELETE_INDEX = 14;
  const JUMP_DOWN = [1, 14, 14, 13, 13, 13];
  const JUMP_UP = [0, 13, 14, 14, 13];

  var keyboard = [];
  var keyboardIndex;
  var pressedKeysCounter;

  function openKeyboard(sendResponse) {
    const keyboardIcon = window.document.getElementById(KEYBOARD_ICON_SELECTOR);

    if (!keyboardIcon) {
      //keyboard icon does not exist
      console.log("key board not found");
      sendResponse({keyboardNotFound: true})
    } else {
      //keyboard icon exists
      keyboardIndex = 0;
      pressedKeysCounter = 0;
      keyboard = [];
      keyboardIcon.click();

      clearSearchInput();
      waitForKeyboardToExist(setKeyboardArray);
    }
  }

  function waitForKeyboardToExist(callback) {
    var checkExist = setInterval(function () {
      if ($(KEYBOARD_CONTAINER_SELECTOR)[0]) {
        clearInterval(checkExist);
        callback();
      }
    }, 100);
  }

  function setKeyboardArray() {
    const letters = $(LETTERS_SELECTOR);
    const keyboardCloseButton = $(KEYBOARD_CLOSE_SELECTOR)[0];

    addCustomButtonsToKeyboard(letters);

    keyboard.push(keyboardCloseButton);
    for (let i = 0; i < letters.length; i++) {
      keyboard.push(letters[i])
    }

    keyChanged();
  }

  function addCustomButtonsToKeyboard(letters) {
    addCustomButtonToKeyboard(letters, 'added_search_button', 'Search', SEARCH_INDEX);
    addCustomButtonToKeyboard(letters, 'added_delete_button', 'Delete', DELETE_INDEX);
  }

  function addCustomButtonToKeyboard(letters, selector, text, indexToInsert) {
    if (!$('#' + selector)[0]) {
      const element = document.createElement("span");
      const textNode = document.createTextNode(text);

      element.setAttribute("id", selector);
      element.appendChild(textNode);

      letters[indexToInsert].appendChild(element);
      letters[indexToInsert].style.visibility = 'visible';
    }
  }

  function moveOnKeyboardTo(direction) {
    keyboard[keyboardIndex].style.background = "white";

    switch (direction) {
      case 'right':
        if (keyboardIndex === keyboard.length - 1) {
          keyboardIndex = 0;
        } else {
          keyboardIndex++;
        }
        break;
      case 'left':
        if (keyboardIndex === 0) {
          keyboardIndex = keyboard.length - 1;
        } else {
          keyboardIndex--;
        }
        break;
      case 'up':
        jumpUp();
        break;
      case 'down':
        jumpDown();
        break;
    }

    keyChanged(direction)
  }

  function jumpUp() {
    if (keyboardIndex === indexOfKey['ctrl-alt-left']) {
      keyboardIndex = indexOfKey['shift-left'];
    } else if (keyboardIndex === indexOfKey['space']) {
      keyboardIndex = indexOfKey['n-hebrew'];
    } else if (keyboardIndex === indexOfKey['ctrl-alt-right']) {
      keyboardIndex = indexOfKey['shift-right'];
    } else if (keyboardIndex === indexOfKey['shift-right']) {
      keyboardIndex = indexOfKey['search'];
    } else if (keyboardIndex === indexOfKey['search']) {
      keyboardIndex = indexOfKey['backslash'];
    }

    else {
      const numberOfKeysToJump = JUMP_UP[getCurrentRow()];
      if (keyboardIndex - numberOfKeysToJump < 0) {
        keyboardIndex = 0;
      } else {
        keyboardIndex -= numberOfKeysToJump;
      }
    }
  }

  function jumpDown() {
    if (keyboardIndex === indexOfKey['backslash']) {
      keyboardIndex = indexOfKey['search'];
    } else if (keyboardIndex === indexOfKey['search']) {
      keyboardIndex = indexOfKey['shift-right'];
    } else if (keyboardIndex === indexOfKey['shift-left']) {
      keyboardIndex = indexOfKey['ctrl-alt-left'];
    } else if (keyboardIndex >= indexOfKey['z-hebrew'] && keyboardIndex <= indexOfKey['dot']) {
      keyboardIndex = indexOfKey['space'];
    } else if (keyboardIndex === indexOfKey['shift-right']) {
      keyboardIndex = indexOfKey['ctrl-alt-right'];
    }

    else {
      const numberOfKeysToJump = JUMP_DOWN[getCurrentRow()];
      if (keyboardIndex + numberOfKeysToJump > keyboard.length - 1) {
        keyboardIndex = keyboard.length - 1;
      } else {
        keyboardIndex += numberOfKeysToJump;
      }
    }
  }

  function keyChanged(direction = undefined) {
    skipHiddenKeyboardElement(direction);
    keyboard[keyboardIndex].style.background = "aqua";
  }

  function skipHiddenKeyboardElement(direction) {
    const keyboardElement = keyboard[keyboardIndex];
    if (keyboardElement.style.visibility === "hidden") {
      if (direction === 'right') {
        keyboardIndex++;
      } else {
        keyboardIndex--;
      }
    }
  }

  function clickOnKeyboardLetter(sendResponse) {
    pressedKeysCounter++;
    enableSuggestionBox();
    keyboard[keyboardIndex].click();
    if (keyboardIndex === 0) {
      clearSearchInput();
      disableSuggestionBox();
      sendResponse({close: true});
    } else if (keyboardIndex === SEARCH_INDEX + 1) { // +1 because close button was added to keyboard array
      search();
      sendResponse({search: true});
    } else if (keyboardIndex === DELETE_INDEX + 1) { // +1 because close button was added to keyboard array
      disableSuggestionBox();
      clearSearchInput();
    }
  }

  function search() {
    keyboardIndex = 0;
    var searchButton = window.document.getElementsByName(SEARCH_BUTTON_SELECTOR)[0];
    searchButton.click();
  }

  function clearSearchInput() {
    $(SEARCH_INPUT_SELECTOR)[0].value = '';
    for (let i = 0; i < pressedKeysCounter; i++) {
      keyboard[indexOfKey['backspace']].click();
    }
  }

  function enableSuggestionBox() {
    try {
      const suggestionBox = $(SUGGESTIONS_SELECTOR)[1];
      if (suggestionBox && suggestionBox.style.visibility != "visible") {
        suggestionBox.style.visibility = "visible";
      }
    } catch (err) {
    }
  }

  function disableSuggestionBox() {
    try {
      const suggestionBox = $(SUGGESTIONS_SELECTOR)[1];
      if (suggestionBox && suggestionBox.style.visibility != "hidden") {
        suggestionBox.style.visibility = "hidden";
      }
    } catch (err) {
    }
  }

  function getCurrentRow() {
    if (keyboardIndex === 0) {
      return 0;
    } else if (keyboardIndex >= 1 && keyboardIndex <= 14) {
      return 1;
    } else if (keyboardIndex >= 15 && keyboardIndex <= 28) {
      return 2;
    } else if (keyboardIndex >= 29 && keyboardIndex <= 41) {
      return 3;
    } else if (keyboardIndex >= 42 && keyboardIndex <= 53) {
      return 4;
    } else if (keyboardIndex >= 54 && keyboardIndex <= 56) {
      return 5;
    }
  }

  function mapKeyToIndex() {
    const indexOfKey = {};

    indexOfKey['backspace'] = 14;
    indexOfKey['backslash'] = 28;
    indexOfKey['search'] = 41;
    indexOfKey['shift-left'] = 42;
    indexOfKey['z-hebrew'] = 43;
    indexOfKey['n-hebrew'] = 47;
    indexOfKey['dot'] = 52;
    indexOfKey['shift-right'] = 53;
    indexOfKey['ctrl-alt-left'] = 54;
    indexOfKey['space'] = 55;
    indexOfKey['ctrl-alt-right'] = 56;

    return indexOfKey;
  }

  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      switch (request.type) {
        case "openGoogleKeyboard":
          console.log("content::openGoogleKeyboard");
          openKeyboard(sendResponse);
          break;

        case "moveOnGoogleKeyboard":
          console.log("content::moveOnGoogleKeyboard");
          moveOnKeyboardTo(request.param);
          break;

        case "clickGoogleKeyboardLetter":
          console.log("content::clickGoogleKeyboardLetter");
          clickOnKeyboardLetter(sendResponse);
          break;
      }
    });
})();
