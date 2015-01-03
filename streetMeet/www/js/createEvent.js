angular.module('sm-meetApp.createEvents',  ["firebase", 'ngCookies'])

.controller('CreateEventsCtrl', function($scope, $firebase, $cookieStore, EventCreator) {
   angular.extend($scope, EventCreator);
   $scope.createEvent = function(eventTitle, eventDescription, eventCapacity, eventCategory, eventMinCapacity){

     EventCreator.createEvent($cookieStore.get('currentUser'), eventTitle, eventDescription, eventCapacity, eventCategory, eventMinCapacity);
   };


})
.factory('Events', function ($q, $cookieStore) {
  var ref = new Firebase("https://boiling-torch-2747.firebaseio.com/");
  var locRef = new Firebase("https://boiling-torch-2747.firebaseio.com/locations");
  var geoFire = new GeoFire(locRef);
  var createEvent = function(owner ,eventTitle, eventDescription, eventCapacity, eventCategory, eventMinCapacity) {
    geoFire.set($cookieStore.get('currentUser'), [$cookieStore.get('eventLoc').k, $cookieStore.get('eventLoc').D]).then(function() {
        console.log("Provided key has been added to GeoFire");
      }, function(error) {
        console.log("Error: " + error);
      });
    var eventData ={
      user_id: owner,
      title: eventTitle,
      description: eventDescription,
      capacity: eventCapacity,
      category: eventCategory,
      min_capacity: eventMinCapacity
    };
    var id = ref.child("/events").push();
     id.set(eventData, function(error) {
       if (error) {
         alert("Data could not be saved." + error);
       } else {
         var name = id.key();
         ref.child("/users/" + eventData.user + "/events/" + name).set(true);
         alert("Data saved successfully.");
       }
    });
  }
  return{
    createEvent: createEvent
  };
 });
