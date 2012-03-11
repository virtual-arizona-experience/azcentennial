var wfsUrl = "http://opengis.azexperience.org/geoserver/wfs";
var featureTypeName = "vae:azcentennial";
var popupContent = new PopupContent("templates/popup.jade", function(feature) {
	return {
		title: feature.properties.name,
		date: feature.properties.first_displaydate,
		location: feature.properties.first_city,
		details: feature.properties.first_description
	};
}, { maxWidth: 600 });
currentWfsLayer = null;

function init(){
	var map = new L.Map("map");
	setupCalendar(map);
	
	/* Tilestream is accessible:
	var historicUrl = "http://opengis.azexperience.org/tiles/v2/azHistoric1880/{z}/{x}/{y}.png",
		historicLayer = new L.TileLayer(historicUrl, {maxZoom: 10}); */
	
	/* ESRI tiled service accessibility
	var	baseurl = "http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}.png",
		baseattrib = "National Geographic, Esri, DeLorme, NAVTEQ",
		baseLayer = new L.TileLayer(baseurl, {maxZoom: 16, attribution: baseattrib}); */
	
	var bingLayer = new L.TileLayer.Bing("Ag_G9YGvTnWtqqSsQ5S4s44ddrRS7GmC7WO94Vo-NoL_p1TiWdwsYcIDirB3_5q-", "Road", {});
	var wfsLayer = currentWfsLayer = new GeojsonWfsLayer(wfsUrl, featureTypeName, popupContent);
	
	var center = new L.LatLng(34.1618, -111.53332);
	map.setView(center, 7).addLayer(bingLayer);
	wfsLayer.addToMap(map);											
}

function setupCalendar(map) {
	$("#back-year").click(function() {
		$(this).parent("ul").children("li").each(function() { $(this).removeClass("selected"); });
		$(".year-switcher").each(function() { $(this).html(parseInt($(this).html()) - 1); });
	});
	$("#forward-year").click(function() {
		$(this).parent("ul").children("li").each(function() { $(this).removeClass("selected"); });
		$(".year-switcher").each(function() { $(this).html(parseInt($(this).html()) + 1); });
	});
	$("#calendar > ul > li.month").click(function() {
		$(this).parent("ul").children("li").each(function() { $(this).removeClass("selected"); });
		$(this).addClass("selected");
		
		map.removeLayer(currentWfsLayer.jsonLayer);		
		
		var start = new Date([$(this).html(), "01", $("#current-year").html(), "00:00:00"].join(" "));
		var end = new Date([$(this).html(), "01", $("#current-year").html(), "00:00:00"].join(" "));
		end.setMonth(end.getMonth() + 1);
		
		var theFilter = new DateFilter("timedate", start, end);
		var newWfsLayer = currentWfsLayer = new GeojsonWfsLayer(wfsUrl, featureTypeName, popupContent, theFilter);
		newWfsLayer.addToMap(map);
	});
}