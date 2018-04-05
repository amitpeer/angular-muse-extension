var backgroundScript = (function () {

  return {
    doNavigation: function (letter) {
      console.log('Background received letter - ' + letter);
      chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: "navigate", letter: letter}, function (response) {
          console.log(response.farewell);
        });
      });
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
    },
    scrollDown: function () {
      console.log('background::scrollDown');
      chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: "scrollDown"}, function (response) {
          console.log("after scroll down");
        });
      });
    },
    scrollUp: function () {
      console.log('background::scrollUp');
      chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: "scrollUp"}, function (response) {
          console.log('after scroll up');
        });
      });
    },
    refresh: function () {
      console.log("refresh");
      chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: "refresh"}, function (response) {
          console.log('after refresh');
        });
      });
    }
  }

})(backgroundScript || {});

// chrome.contextMenus.onClicked.addListener(function (clickData) {
//   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     chrome.tabs.sendMessage(tabs[0].id, {type: "openModal"});
//   });
// });
