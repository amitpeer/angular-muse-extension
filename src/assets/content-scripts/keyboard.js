function openKeyboard(location) {
  $.get(chrome.extension.getURL('assets/keyboard/keyboard-white.html'), function (data) {
    $(data).appendTo(location);
    var link = document.createElement("link");
    link.href = chrome.extension.getURL('assets/keyboard/keyboard-white.css');
    link.type = "text/css";
    link.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(link);
  });
}
