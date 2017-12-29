var backgroundScript = (function () {

  return {
    doNavigation: function (letter) {
      console.log('Background received letter - ' + letter);

      chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {letter: letter}, function (response) {
          console.log(response.farewell);
        });
      });
    }
  }

})(backgroundScript || {});
