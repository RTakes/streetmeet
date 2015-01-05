angular.module('sm-meetApp.map',  ['firebase'])

.controller('MapCtrl', function($scope, $firebase, Map) {
  angular.extend($scope, Map);

  var ref = new Firebase("https://boiling-torch-2747.firebaseio.com/");
  var geoFire = new GeoFire(ref);

  // Get the current user's location
  Map.getLocation();
  Map.geolocationUpdate();
})

.factory('Map', function ($q, $location, $window, $rootScope, $cookieStore) {
  var ref = new Firebase("https://boiling-torch-2747.firebaseio.com/locations");
  var geoFire = new GeoFire(ref);
  var center = new google.maps.LatLng(47.785326, -122.405696);
  var globalLatLng;
  var marker = null;
  var mapOptions = {
    zoom: 15,
    center: center,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  // }

  // google.maps.event.addDomListener(window, 'load', initialize);

  var createEvent = function() {
    $('<div/>').addClass('centerMarker').appendTo(map.getDiv())
    .click(function(){
      $cookieStore.put('eventLoc', map.getCenter());
      console.log($cookieStore.get('eventLoc'), 'stored!')
      $rootScope.$apply(function() {
        $location.path("/createEvent");
        console.log($location.path());
      });
    });
  };


  var getLocation = function() {
    if (typeof navigator !== "undefined" && typeof navigator.geolocation !== "undefined") {
      console.log("Asking user to get their location");
      navigator.geolocation.getCurrentPosition(geolocationCallbackQuery, errorHandler);
    } else {
      console.log("Your browser does not support the HTML5 Geolocation API")
    }
  };

  /* Callback method from the geolocation API which receives the current user's location */
  var geolocationCallbackQuery = function(location) {
    var latitude = location.coords.latitude;
    var longitude = location.coords.longitude;
    var center = new google.maps.LatLng(latitude, longitude);
    var geoQuery = geoFire.query({
      center: [latitude, longitude],
      radius: 10
    });
    map.setCenter(center);
    var onKeyEnteredRegistration = geoQuery.on("key_entered", function(key, location) {
      console.log(key + " entered the query. Hi " + key + " at " + location);
    });

    console.log("Retrieved user's location: [" + latitude + ", " + longitude + "]");

  }

  /* Handles any errors from trying to get the user's current location */
  var errorHandler = function(error) {
    if (error.code == 1) {
      console.log("Error: PERMISSION_DENIED: User denied access to their location");
    } else if (error.code === 2) {
      console.log("Error: POSITION_UNAVAILABLE: Network is down or positioning satellites cannot be reached");
    } else if (error.code === 3) {
      console.log("Error: TIMEOUT: Calculating the user's location too took long");
    } else {
      console.log("Unexpected error code")
    }
  };

  

  var showLocation = function(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    var myLatlng = new google.maps.LatLng(latitude, longitude);
    globalLatLng = myLatlng;
    
    //updates marker position by removing the old one and adding the new one
    if (marker == null) {
        marker = new google.maps.Marker({
        position: myLatlng,
        icon: '/img/blue_beer.png',
        draggable: false
      });
    } else {
      marker.setPosition(myLatlng);
    }

    if (marker && marker.setMap) {
      marker.setMap(null);
    }
    marker.setMap(map);
    console.log("Latitude : " + latitude + " Longitude: " + longitude);
  }

  var errorHandler = function(err) {
    if(err.code == 1) {
      console.log("Error: Access is denied!");
    }else if( err.code == 2) {
      console.log("Error: Position is unavailable!");
    }
  }

  //Updates user location on movement
  var geolocationUpdate = function() {
    if(navigator.geolocation) {
      //var updateTimeout = {timeout: 1000};
      var geoLoc = navigator.geolocation;
      var watchID = geoLoc.watchPosition(showLocation, errorHandler)
    } else {
      throw new Error("geolocation not supported!");
    }
  }

  var centerMapLocation = function(position) {
    map.setCenter(globalLatLng);
    console.log(mapOptions.center);
  }

    //Update the query's criteria every time the circle is dragged
    // var updateCriteria = _.debounce(function() {
    //   var latLng = circle.getCenter();
    //   geoQuery.updateCriteria({
    //     center: [latLng.lat(), latLng.lng()],
    //     radius: radiusInKm
    //   });
    // }, 10);
    // google.maps.event.addListener(circle, "drag", updateCriteria);


  return {
    getLocation: getLocation,
    geolocationCallbackQuery : geolocationCallbackQuery,
    errorHandler: errorHandler,
    createEvent: createEvent,
    map: map,
    geolocationUpdate: geolocationUpdate,
    centerMapLocation: centerMapLocation
  }

});