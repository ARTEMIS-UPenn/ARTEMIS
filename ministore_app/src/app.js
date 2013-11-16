$(document).ready(function() {
    $('#report-text').bind('keypress',function(e) {
	var code = e.keyCorde || e.which;
	if(code == 13) {
	    $('#report-button').trigger('click');
	}
    });

    $('#report-button').click(function() {
	// ajax something something something
	$('#confirmation-text').show();
	$('#confirmation-text').css({'opacity':1});
	$('#confirmation-text').html("Thanks! So, a walrus and a penguin walk down the street. There's no joke here. We'll work on it.");
	$('#confirmation-text').stop().delay(2000).fadeOut(3000,function() {
	    $('#confirmation-text').html("");
	});
	$('#report-text').val('');
    });
});