(function () {
  let keyboardElements = [];
  let keyboardIndex;
  let input;
  let keyboardInputElement;
  let shift = false;
  let capslock = false;
  let isUrlNavigation = false;

  const specialKeys = {};
  const KEYBOARD_ELEMENTS_SELECTOR = 'li[name=muse-keyboard-element]';
  const KEYBOARD_INPUT_SELECTOR = '#muse-write';

  async function openKeyboard(id) {
    keyboardIndex = 0;

    if (id === 'muse-nav-to-url') {
      // navigation to specific URL - no input required
      isUrlNavigation = true;
    } else {
      // opening keyboard to type into an input
      isUrlNavigation = false;
      input = $('#' + id + '> input');
      if (!input[0]) {
        input = $('#' + id + '> textarea');
      }
    }

    // perform GET call to get the keyboard's html as data
    await $.get(chrome.extension.getURL('assets/keyboard/keyboard-white.html'), function (data) {

      // inject keyboard in body element
      $(data).appendTo('body');

      // add a link element to keyboard's CSS file (inside the <head> tag)
      var link = document.createElement("link");
      link.href = chrome.extension.getURL('assets/keyboard/keyboard-white.css');
      link.type = "text/css";
      link.rel = "stylesheet";
      link.id = "muse-keyboard-style";
      document.getElementsByTagName("head")[0].appendChild(link);

      // because of render issues, the input's value is always back after injecting the keyboard
      // hence the timeout - clear the input after the render occurs
      // this way the input's original value is not re-appearing
      setTimeout(clearSelectedInput, 500);
    });

    // add search image in the proper place on keyboard
    $('#muse-search')[0].src = await chrome.extension.getURL("assets/icons/search_icon.png");

    // catch all keyboard elements
    keyboardElements = $(KEYBOARD_ELEMENTS_SELECTOR);

    // catch keyboard's unique input element
    keyboardInputElement = $(KEYBOARD_INPUT_SELECTOR);
    if (isUrlNavigation) {
      keyboardInputElement[0].value = 'https://www.';
    } else {
      // clear keyboard's input
      keyboardInputElement[0].value = '';
    }

    clearSelectedInput();
    createSpecialKeysDictionary();
    keyChanged();
  }

  function clearSelectedInput() {
    if (!isUrlNavigation) {
      input[0].value = '';
    }
  }

  function moveOnKeyboardTo(direction) {
    keyboardElements[keyboardIndex].style.background = "white";

    switch (direction) {
      case 'right':
        jumpRight();
        break;
      case 'left':
        jumpLeft();
        break;
      case 'up':
        jumpUp();
        break;
      case 'down':
        jumpDown();
        break;
    }

    keyChanged()
  }

  function jumpRight() {
    if (keyboardIndex < keyboardElements.length - 1) {
      keyboardIndex++
    }
  }

  function jumpLeft() {
    if (keyboardIndex > 0) {
      keyboardIndex--;
    }
  }

  function jumpUp() {
    if (getCurrentRow() === 0) {
      // first row - go to ESC
      keyboardIndex = specialKeys['ESC'];

    } else if (getCurrentRow() === 1 || getCurrentRow() === 2) {
      // second or third row
      if (keyboardIndex === specialKeys['RETURN']) {
        keyboardIndex = specialKeys['BACK_SLASH'];
      } else {
        keyboardIndex -= 14;
      }

    } else if (getCurrentRow() === 3) {
      // fourth row
      if (keyboardIndex === specialKeys['RIGHT_SHIFT']) {
        keyboardIndex = specialKeys['RETURN'];
      } else {
        keyboardIndex -= 13;
      }

    } else if (getCurrentRow() === 4) {
      // space element - go to letter 'n'
      keyboardIndex = specialKeys['n'];
    }
  }

  function jumpDown() {
    if (getCurrentRow() === 0 || getCurrentRow() === 1) {
      // first or second row
      if (keyboardIndex === specialKeys['BACK_SLASH']) {
        keyboardIndex = specialKeys['RETURN'];
      } else {
        keyboardIndex += 14;
      }

    } else if (getCurrentRow() === 2) {
      // third row
      if (keyboardIndex === specialKeys['RETURN']) {
        keyboardIndex = specialKeys['RIGHT_SHIFT'];
      } else {
        keyboardIndex += 13;
      }

    } else if (getCurrentRow() === 3) {
      // fourth row - go down to space element
      keyboardIndex = specialKeys['SPACE'];

    } else if (getCurrentRow() === 4) {
      // space element
      // first option: do nothing when attempting to go down

      // second option: go back to first element: ESC (make a circle)
      // keyboardIndex = specialKeys['ESC'];
    }
  }

  function keyChanged() {
    keyboardElements[keyboardIndex].style.background = "aqua";
  }

  function getCurrentRow() {
    if (keyboardIndex >= specialKeys['ESC'] && keyboardIndex <= specialKeys['DELETE']) {
      return 0;
    } else if (keyboardIndex >= specialKeys['TAB'] && keyboardIndex <= specialKeys['BACK_SLASH']) {
      return 1;
    } else if (keyboardIndex >= specialKeys['CAPS_LOCK'] && keyboardIndex <= specialKeys['RETURN']) {
      return 2;
    } else if (keyboardIndex >= specialKeys['LEFT_SHIFT'] && keyboardIndex <= specialKeys['RIGHT_SHIFT']) {
      return 3;
    } else if (keyboardIndex === specialKeys['SPACE']) {
      return 4;
    }
  }

  function clickOnKeyboardLetter(sendResponse) {
    onKeyboardClickEvent(sendResponse);
  }

  function removeKeyboard(sendResponse, responseType) {
    // remove keyboard from DOM
    let keyboard = $('#muse-keyboard-container')[0];
    keyboard.parentNode.removeChild(keyboard);

    // remove keyboard's style link from DOM
    let keyboardStyle = $('#muse-keyboard-style')[0];
    keyboardStyle.parentNode.removeChild(keyboardStyle);

    if (responseType === 'close')
      sendResponse({close: true});
    else if (responseType === 'search')
      sendResponse({search: true})
  }

  function createSpecialKeysDictionary() {
    specialKeys['ESC'] = 0;
    specialKeys['DELETE'] = 13;
    specialKeys['TAB'] = 14;
    specialKeys['BACK_SLASH'] = 27;
    specialKeys['CAPS_LOCK'] = 28;
    specialKeys['RETURN'] = 40;
    specialKeys['LEFT_SHIFT'] = 41;
    specialKeys['n'] = 47;
    specialKeys['RIGHT_SHIFT'] = 52;
    specialKeys['SPACE'] = keyboardElements.length - 1;
  }

  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      switch (request.type) {
        case "openGenericKeyboard":
          console.log("content::openKeyboard");
          openKeyboard(request.param);
          break;

        case "moveOnGenericKeyboard":
          console.log("content::moveOnGoogleKeyboard");
          moveOnKeyboardTo(request.param);
          break;

        case "clickGenericKeyboardLetter":
          console.log("content::clickGenericKeyboardLetter");
          clickOnKeyboardLetter(sendResponse);
          break;
      }
    });

  // KEYBOARD FUNCTIONALITY:

  function onKeyboardClickEvent(sendResponse) {
    var $this = $(keyboardElements[keyboardIndex]),
      character = $this.html(); // If it's a lowercase letter, nothing happens to this variable

    // Search
    if ($this.hasClass('search')) {
      if (isUrlNavigation) {
        let url = keyboardInputElement[0].value;
        window.location.href = url.startsWith('http') ? url : 'http://' + url;
      } else {
        let form = $('form');
        if (form) {
          form[0].submit();
        }
      }
      removeKeyboard(sendResponse, 'search');
      return;
    }

    // Close
    if ($this.hasClass('escape')) {
      removeKeyboard(sendResponse, 'close');
      return;
    }

    // Shift keys
    if ($this.hasClass('left-shift') || $this.hasClass('right-shift')) {
      $('.letter').toggleClass('uppercase');
      $('.symbol span').toggle();

      shift = !shift;
      capslock = false;
      return false;
    }

    // Caps lock
    if ($this.hasClass('capslock')) {
      $('.letter').toggleClass('uppercase');
      capslock = true;
      return false;
    }

    // Delete
    if ($this.hasClass('delete')) {
      deleteCharacterFromInputs();
      return false;
    }

    // Special characters
    if ($this.hasClass('symbol')) character = $('span:visible', $this).html();
    if ($this.hasClass('space')) character = ' ';
    if ($this.hasClass('tab')) character = "\t";
    if ($this.hasClass('return')) character = "\n";

    // Uppercase letter
    if ($this.hasClass('uppercase')) character = character.toUpperCase();

    // Remove shift once a key is clicked.
    if (shift === true) {
      $('.symbol span').toggle();
      if (capslock === false) $('.letter').toggleClass('uppercase');

      shift = false;
    }

    // Add the character
    addCharacterToInputs(character);
  }

  function addCharacterToInputs(character) {
    // add to the "real" input"
    if (!isUrlNavigation) {
      input[0].value = input[0].value + character;
    }

    // add to the keyboard's input
    keyboardInputElement[0].value = keyboardInputElement[0].value + character;
  }

  function deleteCharacterFromInputs() {
    // delete from the "real" input
    if (!isUrlNavigation) {
      var realInputValue = input[0].value;
      input[0].value = realInputValue.substring(0, realInputValue.length - 1);
    }

    // delete from the keyboard's input
    var keyboardInputValue = keyboardInputElement[0].value;
    keyboardInputElement[0].value = keyboardInputValue.substring(0, keyboardInputValue.length - 1);
  }

})();
