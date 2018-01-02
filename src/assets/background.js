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
    openMatrix: function () {
      // window.open("index.html", "extension_popup", "width=300,height=400,status=no,scrollbars=no,resizable=no");
      chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: "openModal"});
      })
    },
    minimize: function () {
      document.body.style.visibility = "hidden";
      document.body.style.width = 0;
      document.body.style.height = 0;
    },
    maximize: function () {
      document.body.style.visibility = "visible";
      document.body.style.width = "120px";
      document.body.style.height = "120px";
    }
  }

})(backgroundScript || {});

// chrome.contextMenus.onClicked.addListener(function (clickData) {
//   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     chrome.tabs.sendMessage(tabs[0].id, {type: "openModal"});
//   });
// });
