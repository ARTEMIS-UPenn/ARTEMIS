$(document).ready(function() {
	$('html').css('opacity', '0').fadeTo(500, 1,'swing'); 
	
	$('#email_address').bind('keypress',function(e) {
		if(e.keyCode==13)
		    checkInfo();
	    });

	$('#password').bind('keypress',function(e) {
		if(e.keyCode==13)
		    checkInfo();
	    });

	$('#submit').click(function() {
		checkInfo();
	    });
	$('#cancel').click(function() {
		window.location.href='app.html';
	    });
	loggedIn();
	
    });

function loggedIn() {
    $.ajax({
	    url: serverURL + '/cgi-bin/checkSession.php',
		type: 'get',
		error: function(jqXHR, textStatus, errorThrown) {
		alert("Error: " + textStatus + "\nHTTP Error: " + errorThrown);
	    },
		success: function(response) {
		if(response != "")
		    window.location.replace("mapapp.html");
	    }
	});
}

function checkInfo() {
    var email = $('#email_address').val();
    var password = $('#password').val();
    if (validateEmail(email) && validatePassword(password)) {
	var login_form = {email: email, password: password};
	sendLoginInfo(login_form);
    }

    else {
	$('#login-status-text').html("Invalid email or password. Please try again.");
	$('#login-status-text').css({opacity:1});
	$('#login-status-text').stop();
	$('#login-status-text').fadeOut(2000, function() {
		$('#login-status-text').html("");
		$('#login-status-text').show();
	    });
    }
}

function sendLoginInfo(login_form) {
    $.ajax({
	    url: serverURL+'/cgi-bin/login.php',
		type: 'post',
		data: login_form,
		async: false,
		error: function(jqXHR,textStatus, errorThrown) {
		alert("Error: " + textStatus + "\nHTTP Error: " + errorThrown);
	    },
		success: function(response) {
		if (jQuery.isEmptyObject(response)) {
		    $('#login-status-text').html("Incorrect email address or password. Please try again.");
		    $('#login-status-text').css({opacity:1});
		    $('#login-status-text').stop();
		    $('#login-status-text').fadeOut(2000, function() {
			    $('#login-status-text').html("");
			    $('#login-status-text').show();
			});
		}
		else {
		    $('#login-status-text').html("Authenticated. Loading settings... " + response);
		    window.location.replace("mapapp.html");
		    }
	    }
	});
}

function validatePassword(password) {
    if (!jQuery.isEmptyObject(password))
	return true;
    else
	return false;
}

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
