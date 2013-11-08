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

	$('#first_name').bind('keypress',function(e) {
		if(e.keyCode==13)
		    checkInfo();
	    });
	
	$('#last_name').bind('keypress',function(e) {
		if(e.keyCode==13)
		    checkInfo();
	    });
	
	$('#submit').click(function() {
		checkInfo();
	    });

	$('#cancel').click(function() {
		window.location.href='app.html';
	    });
    });

function checkInfo() {
    var email = $('#email_address').val();
    var password = $('#password').val();
    var first_name = $('#first_name').val();
    var last_name = $('#last_name').val();

    if (validateEmail(email) && validatePassword(password) && validatePassword(first_name) && validatePassword(last_name)) {
        var registration_form = {email: email, password: password, first_name: first_name, last_name: last_name};
        sendRegistrationInfo(registration_form);
    }
    else {
        $('#registration-status-text').html("Invalid email, or empty fields. Please try again.");
        $('#registration-status-text').css({opacity:1});
        $('#registration-status-text').stop();
        $('#registration-status-text').fadeOut(3000, function() {
                $('#registration-status-text').html("");
                $('#registration-status-text').show();
            });
    }
}

function sendRegistrationInfo(registration_form) {
    $.ajax({
            url: serverURL+'/cgi-bin/register.php',
                type: 'post',
                data: registration_form,
		error: function(jqXHR,textStatus, errorThrown) {
                alert("Error: " + textStatus + "\nHTTP Error: " + errorThrown);
            },
                success: function(response) {
                if (!jQuery.isEmptyObject(response)) {
                    $('#registration-status-text').html("An account with this email address already exists. Please try again.");
                    $('#registration-status-text').css({opacity:1});
                    $('#registration-status-text').stop();
                    $('#registration-status-text').fadeOut(2000, function() {
                            $('#registration-status-text').html("");
                            $('#registration-status-text').show();
                        });
                }
                else {
                    $('#registration-status-text').html("Authenticated. Loading settings... " + response);
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