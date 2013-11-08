//********************************
// TWITTER LOGIN OPTION **********
//********************************
var cb;
var screen_name;

$(document).ready(function (){
	$('body').css('opacity', '0').fadeTo(1500, 1,'swing'); 
    });

//********************************
// ICDMT Create Account
//********************************
var login_dat={email: "", subscriptions: ""};

$('#email-register-button').click(function() {
	$('#login-options').hide();
	$('#new-account-form').show();
    });


$('#register-email').bind('keypress', function (e) {
	if(e.keyCode==13)
	    validateRegistration();
    });

$('#register-password').bind('keypress', function(e) {
	if(e.keyCode==13)
	    validateRegistration();
    });


$('#register-first-name').bind('keypress', function (e) {
	if(e.keyCode==13)
	    validateRegistration();
    });

$('#register-last-name').bind('keypress', function(e) {
	if(e.keyCode==13)
	    validateRegistration();
    });

$('#email-register-submit-button').click(function() {
	validateRegistration();
    });

function sendRegisterInfo(register_form) {

    $.ajax({
	    url: serverURL+'/cgi-bin/register.php',
		type: 'post',
		data: register_form,
		//async: false,
		error: function(jqXHR,textStatus, errorThrown) {
		//alert("Error: " + textStatus + "\nHTTP Error: " + errorThrown);
	    },
		success: function(response) {
		if (jQuery.isEmptyObject(response)) {
		    $('#login-status-text').html("Registration complete! Redirecting to app with login info...");
		    login_dat.email = register_form.email;
		    window.setTimeout(switchDisplay(),400);
		}
		else {
		    var obj = JSON.parse(response);
		    $('#login-status-text').html("Sorry. This email address has already been registered. Please try a different one.");
		}
	    }
	});
}

function validateRegistration() {
    var email = $('#register-email').val();
    var password = $('#register-password').val();
    var first_name= $('#register-first-name').val();
    var last_name = $('#register-last-name').val();

    if (validateEmail(email) && validatePassword(password) && validateName(first_name,last_name)) {
	var register_form = {email: email, password: password, first_name: first_name, last_name: last_name};
	sendRegisterInfo(register_form);
    }
    else
	$('#login-status-text').html("The information you provided was invalid or incomplete. Please try again.");
}


//********************************
// ICDMT Account Login
//********************************

$('#email-login-button').click(function() {
	$('#login-options').hide();
	$('#email-form').show();
    });

$('#login-email').bind('keypress', function (e) {
	if(e.keyCode==13)
	    checkInfo();
    });

$('#login-password').bind('keypress', function(e) {
	if(e.keyCode==13)
	    checkInfo();
    });


$('#email-login-submit-button').click(function() {
	checkInfo();
    });

function sendLoginInfo(login_form) {
    $.ajax({
	    url: serverURL+'/cgi-bin/login.php',
		type: 'post',
		data: login_form,
		//async: false,
		error: function(jqXHR,textStatus, errorThrown) {
		//alert("Error: " + textStatus + "\nHTTP Error: " + errorThrown);
	    },
		success: function(response) {
		if (jQuery.isEmptyObject(response))
		    $('#login-status-text').html("Incorrect email address or password. Please try again.");
		else {
		    var obj = JSON.parse(response);
		    $('#login-status-text').html("Authenticated. Loading settings...");
		    login_dat.email=obj.email_address;
		    if (jQuery.isEmptyObject(obj.subscriptions)) {
			login_dat.subscriptions="";
		    }
		    else {
			login_dat.subscriptions=obj.subscriptions;
			$('#testline2').html(hucTables[1]);
		    }
		    switchDisplay();
		}
	    }
	});
}

//********************************
// EMAIL AND PASSWORD VALIDATION *
//********************************
function checkInfo() {
    var email = $('#login-email').val();
    var password = $('#login-password').val();
    if (validateEmail(email) && validatePassword(password)) {
	var login_form = {email: email, password: password};
	sendLoginInfo(login_form);
	login_email=email;
    }
    else {
	$('#login-status-text').html("Invalid email or password. Please try again.");

	$('#login-status-text').fadeOut(2000, function() {
		$('#login-status-text').html("");
		$('#login-status-text').show();
	    });
    }
}

function validateName(first_name,last_name) {
    if (!jQuery.isEmptyObject(first_name) && !jQuery.isEmptyObject(last_name))
	return true;
    else
	return false;
}

function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} 

function validatePassword(password) {
    if (!jQuery.isEmptyObject(password))
	return true;
    else
	return false;
}
		
//********************************
// NO LOGIN **********************
//********************************
$('#no-login-button').click(function() {
	switchDisplay();
    });
//********************************
function switchDisplay() {
    $('.login').hide();
    $('.map-area').show();
    mapSetup();
}