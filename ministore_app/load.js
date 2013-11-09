$ = function(selector) { return document.querySelector(selector); }

$('#fullscreen-link').onclick = function(e) {
    setTimeout(chrome.app.window.current().fullscreen, 0);
}   

$('#restore-link').onclick = function(e) {
    setTimeout(chrome.app.window.current().restore, 0);
}