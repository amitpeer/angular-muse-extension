var backgroundScript = (function () {
  return {
    doNavigation: function (letter) {
      navigateContentScript('navigate', letter);
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
    goHome: function () {
      callContentScript('goHome');
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

function navigateContentScript(action, letter) {
  console.log('background::' + action);
  chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type: action, letter: letter}, function (response) {
      console.log('background::after' + action);
    });
  });
}
