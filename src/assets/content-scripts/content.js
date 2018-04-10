(function () {
  const KEYBOARD_ICON_SELECTOR = '#gs_ok0';
  const KEYBOARD_CLOSE_SELECTOR = 'vk-t-btn-o';
  const LETTERS_SELECTOR = '.vk-btn';
  const SEARCH_SELECTOR = 'btnK';
  const keyboardJump = 14;

  var keyboard = [];
  var keyboardIndex;

  function openKeyboard() {
    const keyboardIcon = $(KEYBOARD_ICON_SELECTOR);
    keyboardIndex = 0;
    keyboardIcon.click();

    waitForKeyboardToExist(setKeyboardArray);
  }

  function setKeyboardArray() {
    const letters = $(LETTERS_SELECTOR);
    const keyboardCloseButton = window.document.getElementsByClassName(KEYBOARD_CLOSE_SELECTOR)[0];

    keyboard.push(keyboardCloseButton);
    for (let i = 0; i < letters.length; i++) {
      keyboard.push(letters[i])
    }

    keyChanged();
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
        if (keyboardIndex - keyboardJump < 0) {
          keyboardIndex = 0;
        } else {
          keyboardIndex -= keyboardJump;
        }
        break;
      case 'down':
        if (keyboardIndex + keyboardJump > keyboard.length - 1) {
          keyboardIndex = keyboard.length - 1;
        } else {
          keyboardIndex += keyboardJump;
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

  function clickKeyboardLetter() {
    keyboard[keyboardIndex].click();
    if (keyboardIndex === 0) {
      return 'close';
    }
  }

  function waitForKeyboardToExist(callback) {
    var checkExist = setInterval(function () {
      if (window.document.getElementById("kbd")) {
        clearInterval(checkExist);
        callback();
      }
    }, 100);
  }

  function search() {
    var searchButton = window.document.getElementsByName(SEARCH_SELECTOR)[0];
    searchButton.click();
  }

  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      switch (request.type) {
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

        case "openKeyboard":
          console.log("content::openKeyboard");
          openKeyboard();
          break;

        case "moveOnKeyboard":
          console.log("content::keyboardRight");
          moveOnKeyboardTo(request.param);
          break;

        case "clickKeyboardLetter":
          console.log("content::clickKeyboardLetter");
          const response = clickKeyboardLetter();
          if (response === 'close') {
            sendResponse({close: 'true'});
          }
          break;

        case "search":
          console.log("content::search");
          search();
      }
    });
})();
