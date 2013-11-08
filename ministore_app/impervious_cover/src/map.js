var map;
var geocoder;
var TILE_SIZE = 256;

var hucLayer;
var templayer;

//**************************
// API LOADER **************
//**************************
function mapSetup() {
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
    
    // initialize info window
    var coordInfoWindow = new google.maps.InfoWindow();
    google.maps.event.addListener(map, "rightclick", function(event) {
	    coordInfoWindow.setContent(createInfoWindowContent(event.latLng));
	    coordInfoWindow.setPosition(event.latLng);
	    coordInfoWindow.open(map);
	});

    // populate huc zone state drop down menu
    var statestring='<option value="null" selected="selected">Select State</option>';
    for (var i=0; i<hucStates.length; i++) {
	statestring+=('<option value="' + hucStates[i] + '">' + hucStates[i] + "</option>");
    }

    $('#state-select').html(statestring);
    
    // handle login info
    if (!jQuery.isEmptyObject(login_dat.subscriptions)) {
	list=login_dat.subscriptions;
	var optionsString='<option>' + list.join('</option><option>') + '</option>';
	$('#huc-subscriptions-list').html(optionsString);	    
    }
    if (!jQuery.isEmptyObject(login_dat.email)) {
	$('#testline').html("<br>Hi, " + login_dat.email + '!<br><a href="javascript:history.go(0)">Logout</a>');

    }
    else
	$('#testline').html('<br>Hi! To access additional features, please <a href="javascript:history.go(0)"> login</a>.');
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
var optionsString=[];

/*
function manageSubscriptions(cmd) {
    if (cmd == 'open') {
	setTableSettings();
	google.maps.event.clearListeners(hucLayer,'click');
	google.maps.event.addListener(hucLayer,'click',function(e) {
		var name = e.row['HUC12'].value;
		var idx = list.indexOf(name);
		var it = list.length;
		if (idx > -1)
		    list.splice(idx,1);
		else
		    list[it]=name;
		var wherestring = "HUC12 IN ('" + list.join("','") + "')";
		optionsString='<option>' + list.join('</option><option>') + '</option>';
		$('#huc-subscriptions-list').html(optionsString);
		$('#testline2').html(wherestring);
		hucLayers[i].setOptions({
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
				 ]
			    });
	    });
    }
    else if (cmd == 'close') {
	setDefaultTableSettings();
	saveSubscriptions();
    }
}


function setTableSettings() {
    var wherestring = "HUC12 IN ('" + list.join("','") + "')";
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
		     ]
		});
}

function setDefaultTableSettings() {
    
    hucLayer.setOptions({
	    styles: [{
		    polygonOptions: {
			fillColor: '#f8f8f8',
			    fillOpacity: 0.01,
			    strokeColor: '#ffffff'
			    }
		}]
		,
		suppressInfoWindows: true
		});
    google.maps.event.clearListeners(hucLayer,'click');
}
*/
function setMap() {
    //    $('#testline2').html("entered setmap()");
    var idx = jQuery.inArray($('#state-select').val(),hucStates);
    if (idx > -1) {
	var wherestring = "HUC12 IN ('" + list.join("','") + "')";
		
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
		    suppressInfoWindows: true
		    });
	if ($('#huc-zones').attr('disabled') == 'disabled') {
	    
	    google.maps.event.clearListeners(hucLayer,'click');
	    google.maps.event.addListener(hucLayer,'click',function(e) {
		    var name = e.row['HUC12'].value;
		    var idx = list.indexOf(name);
		    var it = list.length;
		    if (idx > -1)
			list.splice(idx,1);
		    else
			list[it]=name;
		    optionsString='<option>' + list.join('</option><option>') + '</option>';
		    $('#huc-subscriptions-list').html(optionsString);
		    
		    var wherestring = "HUC12 IN ('" + list.join("','") + "')";
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
				     ]
				});
		});
	}
	hucLayer.setMap(map);
    }
    else
	hucLayer.setMap(null);
}

function saveSubscriptions() {
    
    if (!jQuery.isEmptyObject(login_dat.email)) {
	var json_list = {email: login_dat.email, subscriptions: list};
	$.ajax({
		url: serverURL+'/cgi-bin/save_subscriptions.php',
		    type: 'post',
		    data: json_list,
		    async: false,
		    error: function(jqXHR, textStatus, errorThrown) {
		    alert("Error: " + textStatus + "\nHTTP Error: " + errorThrown);
		},
		    success: function(response) {
		    //$('#testline2').html("helloworld " + response);
		}
	    });
    }
    else
	$('#testline2').html("You are not logged in! Please log in to subscribe to areas.");
}

//**************************
// GUI EVENT LISTENER ******
//**************************
$('#geocoder-text').bind('keypress',function(e) {
	if(e.keyCode==13)
	    geocode($('#geocoder-text').val());
    });

$('#geocoder-button').click(function() {
	geocode($('#geocoder-text').val());
    });

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
	if (this.checked)
	    $('#ic-date').show();
	else
	    $('#ic-date').hide();
    });

$('#manage-subscriptions').click(function() {
	$('#manage-subscriptions').hide();
	$('#huc-subscriptions-list').show();
	$('#subscription-save').show();
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

document.addEventListener('DOMContentLoaded',function() {
	document.removeEventListener('DOMContentLoaded',arguments.callee,false);
	mapSetup();
    }, false);

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

/** @constructor */
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

  return [
	  'LatLng: ' + coords.lat() + ' , ' + coords.lng(),
    'World Coordinate: ' + worldCoordinate.x + ' , ' +
	  worldCoordinate.y,
	  'Pixel Coordinate: ' + Math.floor(pixelCoordinate.x) + ' , ' +
	  Math.floor(pixelCoordinate.y),
    'Tile Coordinate: ' + tileCoordinate.x + ' , ' +
	  tileCoordinate.y + ' at Zoom Level: ' + map.getZoom()
	  ].join('<br>');
}
