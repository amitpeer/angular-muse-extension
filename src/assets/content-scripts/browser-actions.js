(function () {

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
      }
    });
})();
