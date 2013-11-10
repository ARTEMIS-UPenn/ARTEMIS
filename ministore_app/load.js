$ = function(selector) { return document.querySelector(selector); }

$('#fullscreen-link').onclick = function(e) {
    setTimeout(chrome.app.window.current().fullscreen, 0);
}   

$('#restore-link').onclick = function(e) {
    setTimeout(chrome.app.window.current().restore, 0);
}

document.addEventListener('DOMContentLoaded', function() {
    startTime();
});

function startTime() {
    var today=new Date();
    
    var day=today.getDate();
    var month=today.getMonth()+1;
    var year=today.getFullYear();

    var hour=today.getHours();
    var minute=today.getMinutes();
    var second=today.getSeconds();
    minute=checkTime(minute);
    second=checkTime(second);
    document.getElementById('time').innerHTML=month+"/"+day+"/"+year + '&nbsp' +hour+":"+minute+":"+second;
    t=setTimeout(function(){startTime()},500);
}

function checkTime(i) {
    if (i < 10)
	i="0" + i;
    return i;
}