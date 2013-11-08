var map;
var geocoder;
var TILE_SIZE = 256;

var hucLayer;
var icLayer;
var name="Guest";
var subscriptions=[];

//**************************
// API LOADER **************
//**************************
function mapSetup() {
    //initMap();
    google.load('maps','3', {other_params: 'key=' + mapKey + '&sensor=true', callback: initMap});
}

//**************************
// MAP/LAYER INITIALIZER ***
//**************************
function initMap() {
    // initialize map
    var mapOptions = {
	center: new google.maps.LatLng(25,-90),
	zoom: 6,
	mapTypeId: google.maps.MapTypeId.HYBRID
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    // initialize geocoder
    geocoder = new google.maps.Geocoder();

    // initialize huc zone boundary layer
    hucLayer=new google.maps.FusionTablesLayer();

    //initialize impervious cover image overlay layer
    var icOptions = {
	getTileUrl: function(coord,zoom) {
	    var normalizedCoord = getNormalizedCoord(coord,zoom);
	    if (!normalizedCoord)
		return null;

	    var date=$('#date-picker').val().split('-');
	    
	    var year = date[0];
	    var month = date[1];
	    var day = date[2];
	    var bound = Math.pow(2,zoom);
	    var imgpath = "../assets/map_tiles/"+year+"/"+zoom+"/"+normalizedCoord.x+"/"+(bound-normalizedCoord.y-1)+".png";

	    $('#testline3').html(imgpath);
	    return imgpath;
	},
	tileSize: new google.maps.Size(TILE_SIZE,TILE_SIZE),
	opacity: 0.6,
	name: "IC"
    };
 
    icLayer = new google.maps.ImageMapType(icOptions);

    var coordInfoWindow = new google.maps.InfoWindow();
    google.maps.event.addListener(map, "rightclick", function(event) {
	    coordInfoWindow.setContent(createInfoWindowContent(event.latLng));
	    coordInfoWindow.setPosition(event.latLng);
	    coordInfoWindow.open(map);
	});
    google.maps.event.addListener(map, "click", function(event) {
	    coordInfoWindow.close();
	});
    // populate huc zone state drop down menu
    var statestring='<option value="null" selected="selected">Select State</option>';
    for (var i=0; i<hucStates.length; i++) {
	statestring+=('<option value="' + hucStates[i] + '">' + hucStates[i] + "</option>");
    }
    $('#state-select').html(statestring);
    
    // handle login info
    loggedIn();
}

//**************************
// MAP WINDOW LOCALIZATION *
//**************************
function getNormalizedCoord(coord, zoom) {
    var y = coord.y;
    var x = coord.x;
    
    // tile range in one direction range is dependent on zoom level
    // 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
    var tileRange = 1 << zoom;
    
    // don't repeat across y-axis (vertically)
    if (y < 0 || y >= tileRange) {
	return null;
    }
    
    // repeat across x-axis
    if (x < 0 || x >= tileRange) {
	x = (x % tileRange + tileRange) % tileRange;
    }
    
    return {
	x: x,
	    y: y
	    };
}

function getYear() {
    return "2008";
}
				  
//**************************
// GEOCODER ****************
//**************************
function geocode(address) {
    geocoder.geocode({'address':address},function(results,status) {
	    if (status == google.maps.GeocoderStatus.OK)
		map.setCenter(results[0].geometry.location);
	});
}

//**************************
// SUBSCRIPTION MANAGER ****
//**************************
var list=[];
var namelist=[];
var optionsString=[];
function setMap() {
    var idx = jQuery.inArray($('#state-select').val(),hucStates);
    if (idx > -1) {
	var wherestring = "Name IN ('" + namelist.join("','") + "')";

	if ($('#huc-zones').attr('disabled') != 'disabled') {
	    hucLayer.setOptions({
		    query: {
			select: "geometry",
			    from: hucTables[idx],
			    },
			styles: [{
			    polygonOptions: {
				fillColor: '#f8f8f8',
				    fillOpacity: 0.01,
				    strokeColor: '#ffffff'
				    }
			}],
			suppressInfoWindows: true,
			clickable: false
			});
	}
	if ($('#huc-zones').attr('disabled') == 'disabled') {

	    hucLayer.setOptions({
		    query: {
			select: "geometry",
			    from: hucTables[idx],
			    },
			styles: [{
			    polygonOptions: {
				fillColor: '#f8f8f8',
				    fillOpacity: 0.01,
				    strokeColor: '#ffffff'
				    }
			}],
			suppressInfoWindows: true,
			clickable: true
			});
	    google.maps.event.clearListeners(hucLayer,'click');
	    google.maps.event.addListener(hucLayer,'click',function(e) {
		    var hucname=e.row['Name'].value;
		    var idx = subscriptions.indexOf(hucname);
		    var it = subscriptions.length;
		    if (idx > -1)
			subscriptions.splice(idx,1);
		    else
			subscriptions[it]=hucname;
		    optionsString='<option>' + subscriptions.join('</option><option>') + '</option>';
		    $('#huc-subscriptions-list').html(optionsString);

		    var wherestring = "Name IN ('" + subscriptions.join("','") + "')";
		    hucLayer.setOptions({
			    styles: [
				     {
					 polygonOptions: {
					     fillColor: '#f8f8f8',
						 fillOpacity: 0.01,
						 strokeColor: '#ffffff'
						 }
				     },
				     {
					 where: wherestring,
					     polygonOptions: {
					     fillColor: '#f8f8f8',
						 fillOpacity: 0.3,
						 strokeColor: '#ffffff'
						 }
				     }
				     ]//,
				//clickable: true
				     });
		});
	}
	hucLayer.setMap(map);
    }
    else
	hucLayer.setMap(null);
}

function saveSubscriptions() {
    if (name == "Guest") {
	subscriptions = [];
	var optionsString='<option>' + subscriptions.join('</option><option>') + '</option>';
	$('#huc-subscriptions-list').html(optionsString);
	//alert("You must be logged in to use this feature!");
    }
    else {
	var json_list = {subscriptions: subscriptions.join(',')};
	//alert(name + " is logged in!");
	$.ajax({
	  url: serverURL+'/cgi-bin/save_subscriptions.php',
		    type: 'post',
		    data: json_list,
		    //async: false,
		    error: function(jqXHR, textStatus, errorThrown) {
		    //alert("Error: " + textStatus + "\nHTTP Error: " + errorThrown);
		},
		    success: function(response) {
		    //alert(response);
		}
	    });
    }
}

//**************************
// GUI EVENT LISTENER ******
//**************************
function accordion_expand_all()
{
    var sections = $('#accordion').find("h3");
    sections.each(function(index, section){
	    if ($(section).hasClass('ui-state-default')) {
		$(section).click();
	    }
	});
}

$(document).ready(function() {
	// nice little effect when you load the page
	$('html').css('opacity', '0').fadeTo(500, 1,'swing');

	// accordion menu items
	$('#accordion').accordion({
		active: false,
		collapsible: true,
		    heightStyle: 'content',
		    beforeActivate: function(event, ui) {
		    // The accordion believes a panel is being opened
		    if (ui.newHeader[0]) {
			var currHeader  = ui.newHeader;
			var currContent = currHeader.next('.ui-accordion-content');
			// The accordion believes a panel is being closed
		    } else {
			var currHeader  = ui.oldHeader;
			var currContent = currHeader.next('.ui-accordion-content');
		    }
		    // Since we've changed the default behavior, this detects the actual status
		    var isPanelSelected = currHeader.attr('aria-selected') == 'true';
		    
		    // Toggle the panel's header
		    currHeader.toggleClass('ui-corner-all',isPanelSelected).toggleClass('accordion-header-active ui-state-active ui-corner-top',!isPanelSelected).attr('aria-selected',((!isPanelSelected).toString()));

		    // Toggle the panel's icon
		    currHeader.children('.ui-icon').toggleClass('ui-icon-triangle-1-e',isPanelSelected).toggleClass('ui-icon-triangle-1-s',!isPanelSelected);
		    
		    // Toggle the panel's content
		    currContent.toggleClass('accordion-content-active',!isPanelSelected)    
			if (isPanelSelected) { currContent.slideUp(); }  else { currContent.slideDown(); }

		    return false; // Cancels the default action
		}
	    });
	accordion_expand_all();

	// help menu
	$("#help").click(function( event ) {
		$("#dialog").dialog( "open" );
		event.preventDefault();
	    });
	
	$( "#help" ).hover(function() {
		$( this ).addClass( "ui-state-hover" );
	    },
	    function() {
		$( this ).removeClass( "ui-state-hover" );
	    });

	$('#dialog').dialog({
		autoOpen: false,
		    width: 400,
		    buttons: [
			      {
				  text: "Ok",
				      click: function() {
				      $(this).dialog("close");
				  }
			      },
			      {
				  text: "Cancel",
				      click: function() {
				      $(this).dialog("close");
				  }
			      }
			      ]
		    });
	
	// going to address
	$('#geocoder-text').bind('keypress',function(e) {
		if(e.keyCode==13)
		    geocode($('#geocoder-text').val());
	    });
	
	$('#geocoder-button').click(function() {
		geocode($('#geocoder-text').val());
	    });
	
	// huc zone stuff
	$('#state-select').change(function() {
		setMap();
	    });
	
	$('#huc-zones').change(function() {
		if (this.checked) {
		    $('#huc-zone-state').show();
		    setMap();
		}
		else {
		    if (hucLayer.getMap() != null)
			hucLayer.setMap(null);
		    $('#huc-zone-state').hide();
		}
	    });
	
	$('#impervious-cover').change(function() {
		if (this.checked) {
		    $('#ic-date').show();
		    map.overlayMapTypes.push(icLayer);
		}	
		else {
		    $('#ic-date').hide();
		    map.overlayMapTypes.pop(icLayer);
		}
	    });

	$('#ic-select').change(function() {
		var op=$('#ic-select').val();
		if (op=='specific-date') {
		    $('#specific-date').show();
		    $('#diff-date').hide();
		}
		else if (op == 'diff-date') {
		    $('#diff-date').show();
		    $('#specific-date').hide();
		}
		else {
		    $('#diff-date').hide();
		    $('#specific-date').hide();
		}
	    });
		
	$('#manage-subscriptions').click(function() {
		$('#manage-subscriptions').hide();
		$('#huc-subscriptions-list').fadeIn(500);
		$('#subscription-save').fadeIn(500);
		$('#huc-zones').prop('checked',true);
		$('#huc-zones').trigger('change');
		$('#huc-zones').attr('disabled',true);
		setMap();
	    });
	
	$('#subscription-save').click(function() {
		$('#subscription-save').hide();
		$('#huc-subscriptions-list').hide();
		$('#manage-subscriptions').show();
		$('#huc-zones').removeAttr("disabled");
		google.maps.event.clearListeners(hucLayer,'click');
		setMap();
		saveSubscriptions();
	    });
	
	$('#logout').click(function() {
		$.ajax({
			url: serverURL+'/cgi-bin/logout.php',
			    type: 'get',
			    error: function(jqXHR,textStatus, errorThrown) {
			    //alert("Error: " + textStatus + "\nHTTP Error: " + errorThrown);
			},
			    success: function(response) {
			    if (response == '0')
				location.reload();
			}
		    });
		$('#logout').hide();
	    });
	$('#login').click(function() {
		location.replace('login.html');
	    });
    });


//**************************
// POINT TO TILE CONVERTER *
//**************************
function bound(value, opt_min, opt_max) {
    if (opt_min != null) value = Math.max(value, opt_min);
    if (opt_max != null) value = Math.min(value, opt_max);
    return value;
}

function degreesToRadians(deg) {
    return deg * (Math.PI / 180);
}

function radiansToDegrees(rad) {
    return rad / (Math.PI / 180);
}

function MercatorProjection() {
    this.pixelOrigin_ = new google.maps.Point(TILE_SIZE / 2,
					      TILE_SIZE / 2);
    this.pixelsPerLonDegree_ = TILE_SIZE / 360;
    this.pixelsPerLonRadian_ = TILE_SIZE / (2 * Math.PI);
}

MercatorProjection.prototype.fromLatLngToPoint = function(latLng,
							  opt_point) {
    var me = this;
    var point = opt_point || new google.maps.Point(0, 0);
    var origin = me.pixelOrigin_;

    point.x = origin.x + latLng.lng() * me.pixelsPerLonDegree_;

    // Truncating to 0.9999 effectively limits latitude to 89.189. This is
    // about a third of a tile past the edge of the world tile.
    var siny = bound(Math.sin(degreesToRadians(latLng.lat())), -0.9999,
		     0.9999);
    point.y = origin.y + 0.5 * Math.log((1 + siny) / (1 - siny)) *
    -me.pixelsPerLonRadian_;
    return point;}
    ;

MercatorProjection.prototype.fromPointToLatLng = function(point) {
    var me = this;
    var origin = me.pixelOrigin_;
    var lng = (point.x - origin.x) / me.pixelsPerLonDegree_;
    var latRadians = (point.y - origin.y) / -me.pixelsPerLonRadian_;
    var lat = radiansToDegrees(2 * Math.atan(Math.exp(latRadians)) -
			       Math.PI / 2);
    return new google.maps.LatLng(lat, lng);
};

function createInfoWindowContent(coords) {
    
    var numTiles = 1 << map.getZoom();
    var projection = new MercatorProjection();
    var worldCoordinate = projection.fromLatLngToPoint(coords);
    var pixelCoordinate = new google.maps.Point(
    						worldCoordinate.x * numTiles,
    						worldCoordinate.y * numTiles);
    var tileCoordinate = new google.maps.Point(
    					       Math.floor(pixelCoordinate.x / TILE_SIZE),
    					       Math.floor(pixelCoordinate.y / TILE_SIZE));
    
	
    var zoom = map.getZoom();
    
    var	tilePix = new google.maps.Point(pixelCoordinate.x-tileCoordinate.x*TILE_SIZE,pixelCoordinate.y-tileCoordinate.y*TILE_SIZE);
    
    //var tilePix = new google.maps.Point(pixelCoordinate.x-tileCoordinate.x*TILE_SIZE,(Math.pow(2,zoom)-1)-tileCoordinate.y);
    //////////////////////////////////////////////////////////////////
    var contentStart = '<style type="text/css">' +
	'#content {' +
	'color: #555;' +
	'font-family: Arial, Helvetica, sans-serif;' +
	'font-size: 12px;' +
	'padding: .5em 1em' +
	'}' +
	'</style>' +
	'<div id="content">';
    var contentEnd = '</div>';

    var content = [
		   'LatLng: ' + coords.lat() + ' , ' + coords.lng(),
		   'World Coordinate: ' + worldCoordinate.x + ' , ' + worldCoordinate.y,
		   'Pixel Coordinate: ' + Math.floor(pixelCoordinate.x) + ' , ' +  Math.floor(pixelCoordinate.y),
		   'Tile Coordinate: ' + tileCoordinate.x + ' , ' + ((Math.pow(2,zoom)-1)-tileCoordinate.y) + ' at Zoom Level: ' + map.getZoom(),
		   'Number of tiles: ' + numTiles,
		   'Pixel on tile: ' + Math.floor(tilePix.x) + ' , ' + Math.floor(tilePix.y)
		   ].join('<br>');
    var date=$('#date-picker').val().split('-');
	        
    var ic_json={
	year: date[0],
	month: date[1],
	day: date[2],
	zoom: map.getZoom(),
	tile: {
	    x:Math.floor(tileCoordinate.x),
	    y:Math.floor(tileCoordinate.y)
	},
	pixel: {
	    x:Math.floor(tilePix.x),
	    y:Math.floor(tilePix.y)
	}
    };
    
    var ajaxresponse = $.ajax({
	    url: serverURL+'cgi-bin/getICInfo.php',
	    type: 'post',
	    data: ic_json//,
	    //async: false//,
	}).responseText;
    var out = ajaxresponse.split('\n');
    return contentStart + content + contentEnd + '<br>' + ' ' + out[1];
}

//**************************
// LOGIN CHECKER ***********
//**************************

function loggedIn() {
    $.ajax({
	    url: serverURL+'cgi-bin/checkSession.php',
		type: 'get',
		error: function(jqXHR,textStatus, errorThrown) {
		//alert("Error: " + textStatus + "\nHTTP Error: " + errorThrown);
	    },
		success: function(response) {
		if (response != "") {
		    var obj = JSON.parse(response);
		    name = obj.first_name;
		    if (obj.subscriptions != null) {
			obj.subscriptions = obj.subscriptions.replace(/"/g,""); //"
			subscriptions = obj.subscriptions.split(',');
			var optionsString='<option>' + subscriptions.join('</option><option>') + '</option>';
			$('#huc-subscriptions-list').html(optionsString);
		    }
		    $('#notification').html("Hi, " + name + "!");
		    $('#logout').show();
		    $('#login').hide();
		}
		else {
		    $('#notification').html("Hi, " + name + "!");
		}
	    }
	});
}

document.addEventListener('DOMContentLoaded',function() {
	document.removeEventListener('DOMContentLoaded',arguments.callee,false);
	mapSetup();
    }, false);
