chrome.app.runtime.onLaunched.addListener(function() {
	chrome.app.window.create('main.html', {
		'bounds': {
		    'width': 700,
		    'height': 650
		}
	    }/*,
	    function(win) {
		win.contentWindow.launchData = launchData;
		}*/);
    });