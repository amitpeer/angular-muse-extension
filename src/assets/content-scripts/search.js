(function () {
  const KEYBOARD_ICON_SELECTOR = '#gs_ok0';
  const KEYBOARD_CLOSE_SELECTOR = '.vk-t-btn-o';
  const LETTERS_SELECTOR = '.vk-btn';
  const SEARCH_BUTTON_SELECTOR = 'btnK';
  const KEYBOARD_CONTAINER_SELECTOR = '#kbd';
  const SEARCH_INPUT_SELECTOR = "input[name='q']";

  const KEYBOARD_JUMP = 14;
  const SEARCH_INDEX = 40;
  const DELETE_INDEX = 14;

  var keyboard = [];
  var keyboardIndex;

  function openKeyboard() {
    const keyboardIcon = $(KEYBOARD_ICON_SELECTOR);

    // check if keyboard icon exists
    if (!keyboardIcon[0]) {
      return false;
    }

    keyboardIndex = 0;
    keyboard = [];
    keyboardIcon.click();

    clearSearchInput();
    waitForKeyboardToExist(setKeyboardArray);
  }

  function waitForKeyboardToExist(callback) {
    var checkExist = setInterval(function () {
      if ($(KEYBOARD_CONTAINER_SELECTOR)) {
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
    if (!$("#added_search_button")[0]) {
      const searchElement = document.createElement("span");
      const searchTextNode = document.createTextNode("Search");

      searchElement.setAttribute("id", "added_search_button");
      searchElement.appendChild(searchTextNode);

      letters[SEARCH_INDEX].appendChild(searchElement);
      letters[SEARCH_INDEX].style.visibility = 'visible';
    }

    if (!$("#added_delete_button")[0]) {
      const deleteElement = document.createElement("span");
      const deleteTextNode = document.createTextNode("Delete");

      deleteElement.setAttribute("id", "added_delete_button");
      deleteElement.appendChild(deleteTextNode);

      letters[DELETE_INDEX].appendChild(deleteElement);
      letters[DELETE_INDEX].style.visibility = 'visible';
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
        if (keyboardIndex - KEYBOARD_JUMP < 0) {
          keyboardIndex = 0;
        } else {
          keyboardIndex -= KEYBOARD_JUMP;
        }
        break;
      case 'down':
        if (keyboardIndex + KEYBOARD_JUMP > keyboard.length - 1) {
          keyboardIndex = keyboard.length - 1;
        } else {
          keyboardIndex += KEYBOARD_JUMP;
        }
        break;
    }

    keyChanged(direction)
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

  function clickOnKeyboardLetter() {
    keyboard[keyboardIndex].click();
    if (keyboardIndex === 0) {
      clearSearchInput();
      closeKeyboard();
      return 'close';
    } else if (keyboardIndex === SEARCH_INDEX + 1) { // +1 because close button was added to keyboard array
      search();
      return 'search';
    } else if (keyboardIndex === DELETE_INDEX + 1) { // +1 because close button was added to keyboard array
      clearSearchInput();
    }
  }

  function closeKeyboard() {
    document.body.click();
  }

  function search() {
    keyboardIndex = 0;
    var searchButton = window.document.getElementsByName(SEARCH_BUTTON_SELECTOR)[0];
    searchButton.click();
  }

  function clearSearchInput() {
    $(SEARCH_INPUT_SELECTOR)[0].value = '';
  }

  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      switch (request.type) {
        case "openKeyboard":
          console.log("content::openKeyboard");
          const openKeyboardResponse = openKeyboard();
          if (openKeyboardResponse === false) {
            sendResponse({keyboardNotFound: true})
          }
          break;

        case "moveOnKeyboard":
          console.log("content::keyboardRight");
          moveOnKeyboardTo(request.param);
          break;

        case "clickKeyboardLetter":
          console.log("content::clickKeyboardLetter");
          const clickResponse = clickOnKeyboardLetter();
          if (clickResponse === 'close') {
            sendResponse({close: true});
          } else if (clickResponse === 'search') {
            sendResponse({search: true});
          }
          break;
      }
    });
})();
