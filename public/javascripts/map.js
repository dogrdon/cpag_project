var map;
var pointsLayer;
var markerMap = {};

		$(document).ready(function(){
			map = new L.Map('mapContainer');
			var url = 'http://{s}.tiles.mapbox.com/v3/mapbox.mapbox-streets/{z}/{x}/{y}.png';
			//var url = 'http://{s}.tile.cloudmade.com/6d5ba945f5f146bd8c1e0ef1bf99eca4/997/256/{z}/{x}/{y}.png';
			var copyright = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade';
			var tileLayer = new L.TileLayer(url, {attribution:copyright});
			//var startPosition = new L.LatLng(42.33143, -83.04575);//detroit
			var startPosition = new L.LatLng(41.883333, -87.633333);//chicago
		
			map.on('load', function(e){
				requestUpdatedPoints(e.target.getBounds());
			});

			map.setView(startPosition, 13).addLayer(tileLayer);

			map.on('moveend', function(e){
				requestUpdatedPoints(e.target.getBounds());
			});
		});

		function requestUpdatedPoints(bounds){
			$.ajax({
				type: 'GET',
				url: '/SeeAll',
				dataType: 'json',
				data: JSON.stringify(bounds),
				contentType: 'application/json; charset=utf-8',
				success: function(result){
					parseNewPoints(result);
					addToList(result);
				},
				error: function(req, status, error){
					alert('what happen? did you lose conn. to server ?');
				}
			});
		}

		

		function addToList(data){


			for (var i = 0; i < data.features.length; i++){
				var art = data.features[i]; 
				$('div#infoContainer').append('<a href="#" class="list-link" data-artId="'+art.properties.gid+'" title="'+ art.properties.descfin + 
											'"><div class="info-list-item">' + '<div class="info-list-txt">' +
											   '<div class="title">'+ art.properties.wrknm +'</div>'+'<br />'+
											   art.properties.location + '</div>'
											   + '<div class="info-list-img">' +  art.properties.img_src + '</div>'  + '<br />' + '</div></a>'
											);
			}


			$('a.list-link').hover(function(e){
   				//Special stuff to do when this link is clicked...
   				//alert('this is what happens when you click on a link');
    			
   				var artId = $(this).attr('data-artId');
   				var marker = markerMap[artId];
   				// alert(artId);
    			marker.openPopup(marker.getLatLng());


				//map._layers[artId].openPopup();
    			// Cancel the default action
    			

    			e.preventDefault();
    			return false;
    		
			});

			
			
		}


		function parseNewPoints(data){
			if (pointsLayer != undefined){
				map.removeLayer(pointsLayer);
			}
			pointsLayer = new L.GeoJSON();
			var geojsonMarkerOptions = {
    			radius: 8,
    			fillColor: "#FF6788",
    			color: "YELLOW",
    			weight: 1,
    			opacity: 1,
    			fillOpacity: 0.5
			};

			L.geoJson(data, {
				pointToLayer: function(feature, latlng){
					var marker = new L.circleMarker(latlng, geojsonMarkerOptions);
					//marker._leaflet_id = feature.properties.gid;
					markerMap[feature.properties.gid] = marker;
					console.log(marker);
					return marker;
				},
				onEachFeature: function(feature, pointsLayer){
					pointsLayer.bindPopup(feature.properties.img_src + "<br />" + 
										  feature.properties.wrknm + "<br />" + 
										  feature.properties.artist + "<br />" + 
										  feature.properties.location + '<div class="description">' + 
										  feature.properties.descfin + '</div>');
				}

			}).addTo(map);

			
		}
		

