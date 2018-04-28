(function () {
  let keyboardElements = [];
  let keyboardIndex;
  let $write;
  let shift = false;
  let capslock = false;

  const specialKeys = {};
  const KEYBOARD_ELEMENTS_SELECTOR = 'li[name=muse-keyboard-element]';

  async function openKeyboard(id) {
    $write = $('#' + id);
    keyboardIndex = 0;
    clearSelectedInput();

    // perform GET call to get the keyboard's html as data
    await $.get(chrome.extension.getURL('assets/keyboard/keyboard-white.html'), function (data) {

      // inject keyboard's HTML into the DOM (as a brother of the pressed input)
      $(data).insertAfter($write);

      // add a link element to keyboard's CSS file (inside the <head> tag)
      var link = document.createElement("link");
      link.href = chrome.extension.getURL('assets/keyboard/keyboard-white.css');
      link.type = "text/css";
      link.rel = "stylesheet";
      link.id = "muse-keyboard-style";
      document.getElementsByTagName("head")[0].appendChild(link);
    });

    // catch all keyboard elements
    keyboardElements = $(KEYBOARD_ELEMENTS_SELECTOR);

    createSpecialKeysDictionary();

    // mark the first keyboard element (Esc)
    keyChanged();
  }

  function clearSelectedInput() {
    $write[0].value = '';
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
    if (keyboardIndex === keyboardElements.length - 1) {
      keyboardIndex = 0;
    } else {
      keyboardIndex++;
    }
  }

  function jumpLeft() {
    if (keyboardIndex === 0) {
      keyboardIndex = keyboardElements.length - 1;
    } else {
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
    if (keyboardIndex === specialKeys['ESC']) {
      removeKeyboard();
      sendResponse({close: true});
    } else {
      onKeyboardClickEvent();
    }
  }

  function removeKeyboard() {
    // remove keyboard from DOM
    let keyboard = $('#muse-keyboard-container')[0];
    keyboard.parentNode.removeChild(keyboard);

    // remove keyboard's style link from DOM
    let keyboardStyle = $('#muse-keyboard-style')[0];
    keyboardStyle.parentNode.removeChild(keyboardStyle);
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
        case "openKeyboard":
          console.log("content::openKeyboard");
          openKeyboard(request.param);
          break;

        case "moveOnKeyboard":
          console.log("content::keyboardRight");
          moveOnKeyboardTo(request.param);
          break;

        case "clickKeyboardLetter":
          console.log("content::clickKeyboardLetter");
          clickOnKeyboardLetter(sendResponse);
          break;
      }
    });

  function onKeyboardClickEvent() {
    var $this = $(keyboardElements[keyboardIndex]),
      character = $this.html(); // If it's a lowercase letter, nothing happens to this variable

    // Shift keys
    if ($this.hasClass('left-shift') || $this.hasClass('right-shift')) {
      $('.letter').toggleClass('uppercase');
      $('.symbol span').toggle();

      shift = (shift === true) ? false : true;
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
      var value = $write[0].value;

      $write[0].value = value.substring(0, value.length - 1);
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
    $write[0].value = $write[0].value + character;
  }
})();
