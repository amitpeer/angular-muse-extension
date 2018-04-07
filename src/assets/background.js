var backgroundScript = (function () {
  return {
    doNavigation: function (letter) {
      callContentScriptWithParam('navigate', letter);
    },
    scrollDown: function () {
      callContentScript('scrollDown');
    },
    scrollUp: function () {
      callContentScript('scrollUp');
    },
    refresh: function () {
      callContentScript('refresh');
    },
    back: function () {
      callContentScript('back');
    },
    forward: function () {
      callContentScript('forward');
    },
    home: function () {
      callContentScript('home');
    },
    openKeyboard: function () {
      callContentScript('openKeyboard');
    },
    clickKeyboardLetter: function () {
      callContentScript('clickKeyboardLetter');
    },
    moveOnKeyboard: function (direction) {
      callContentScriptWithParam('moveOnKeyboard', direction);
    },
    minimize: function () {
      document.body.style.visibility = "hidden";
      document.body.style.width = 0;
      document.body.style.height = 0;
    },
    maximize: function () {
      document.body.style.visibility = "visible";
      document.body.style.width = "20%";
      document.body.style.height = "20%";
    }
  }

})(backgroundScript || {});

function callContentScript(action) {
  console.log('background::' + action);
  chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type: action}, function (response) {
      console.log('background::after' + action);
    });
  });
}

function callContentScriptWithParam(action, additionalParam) {
  console.log('background::' + action);
  chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type: action, param: additionalParam}, function (response) {
      console.log('background::after' + action);
    });
  });
}
