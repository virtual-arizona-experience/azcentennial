GeojsonWfsLayer = function(serviceUrl, featureType, popupObj, filter) {
	this.getFeatureUrl = serviceUrl + "?request=GetFeature&typeName=" + featureType + "&outputformat=json";
	if (filter instanceof DateFilter) { this.filterByDate(filter); }
	
	this.jsonLayer = new L.GeoJSON(null, {
	    pointToLayer: function (latlng) {
	        return new L.Marker(latlng, {
			    icon: new L.Icon({ 
			    	iconUrl: "./style/images/celebrate.svg",
			    	iconSize: new L.Point(70,70)
			    })
			});
	    }
	});
	this.jsonLayer.on("featureparse", function(e) {
		if (e.properties) {
			e.layer.bindPopup(popupObj.generatePopupContent(e), popupObj.options);
		}
	});
	this.jsonData = null;	
};

GeojsonWfsLayer.prototype.toGeographicCoords = function() {
	function projectPoint(coordinates /* [x,y] */, inputCrs) {
		var source = new Proj4js.Proj(inputCrs || "EPSG:900913"),
			dest = new Proj4js.Proj("EPSG:4326"),
			x = coordinates[0], 
			y = coordinates[1],
			p = new Proj4js.Point(x,y);
		Proj4js.transform(source, dest, p);
		return [p.x, p.y];
	}
	
	features = this.jsonData.features;
	for (var f in features || []) {
		switch (features[f].geometry.type) {
			case "Point":
				projectedCoords = projectPoint(features[f].geometry.coordinates);
				features[f].geometry.coordinates = projectedCoords;
				break;
			case "MultiPoint":
				for (var p in features[f].geometry.coordinates) {
					projectedCoords = projectPoint(features[f].geometry.coordinates[p]);
					features[f].geometry.coordinates[p] = projectedCoords;
				}
				break;
		}
	}
};

GeojsonWfsLayer.prototype.getFeature = function(callback) {
	var that = this;
	$.ajax({
		url: this.getFeatureUrl,
		type: "GET",
		success: function(response) {
			that.jsonData = response;
			that.toGeographicCoords();
			callback();
		},
		dataType: "json"
	});
	
	/*$.get(this.getFeatureUrl, function(response) {
		//that.jsonData = typeof response == "string" ? JSON.parse(response) : response;
		that.jsonData = response;
		that.toGeographicCoords();
		callback();
	}, "json");*/
};

GeojsonWfsLayer.prototype.filterByDate = function(filter) {
	this.getFeatureUrl += "&CQL_FILTER=" + filter.cql;
};

GeojsonWfsLayer.prototype.addToMap = function(map) {
	var that = this;
	this.getFeature(function() {
		map.addLayer(that.jsonLayer);
		that.jsonLayer.addGeoJSON(that.jsonData);
	})
};

