$(document).ready(function(){
	$('html').css('opacity', '0').fadeTo(500, 1,'swing');
	$('#login-trigger').click(function(){
		$(this).next('#login-content').slideToggle();
		$(this).toggleClass('active');
		
		if ($(this).hasClass('active')) $(this).find('span').html('&#x25B2;')
		    else $(this).find('span').html('&#x25BC;')
		});
	});