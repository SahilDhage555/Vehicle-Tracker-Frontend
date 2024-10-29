
let map;
let vehicleMarker;
let routeCoordinates = [];
let animationSpeed = 30;
let stopDelay = 500;
let currentIndex = 0;
let vehiclePath = [];
let animationInterval;
let isAnimating = false;

// Initialize the Google Map
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 19.7675, lng: 74.475 },
    zoom: 14,
  });

  vehicleMarker = new google.maps.Marker({
    position: { lat: 19.7675, lng: 74.475 },
    map: map,
    icon: {
      url: "https://maps.google.com/mapfiles/kml/shapes/cabs.png",
      scaledSize: new google.maps.Size(50, 50),
    },
  });

  fetchVehicleData();
  updateDate(); // Call to display the current date

  document.getElementById("startBtn").addEventListener("click", startAnimation);
  document.getElementById("stopBtn").addEventListener("click", stopAnimation);
}

// Fetch vehicle movement data from the backend
function fetchVehicleData() {
  fetch("https://vehicle-tracker-backend.vercel.app/api/vehicle")
    .then((response) => response.json())
    .then((data) => {
      routeCoordinates = data.map((location) => ({
        lat: location.latitude,
        lng: location.longitude,
      }));
      drawRouteWithMarkers();
    })
    .catch((error) => console.error("Error fetching vehicle data:", error));
}

// Draw the full route with markers
function drawRouteWithMarkers() {
  new google.maps.Polyline({
    path: routeCoordinates,
    geodesic: true,
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 2,
    map: map,
  });

  routeCoordinates.forEach((position, index) => {
    new google.maps.Marker({
      position,
      map: map,
      label: { text: `${index + 1}`, color: "black", fontSize: "16px" },
    });
  });
}

// Start the vehicle animation
function startAnimation() {
  if (!isAnimating) {
    isAnimating = true;
    animateVehicle();
  }
}

// Stop the vehicle animation
function stopAnimation() {
  isAnimating = false;
  clearInterval(animationInterval);
}

// Animate the vehicle marker along the route
function animateVehicle() {
  if (!isAnimating || currentIndex >= routeCoordinates.length - 1) return;

  const start = routeCoordinates[currentIndex];
  const end = routeCoordinates[currentIndex + 1];
  let stepCount = 100;
  let step = 0;
  let deltaLat = (end.lat - start.lat) / stepCount;
  let deltaLng = (end.lng - start.lng) / stepCount;

  animationInterval = setInterval(() => {
    if (!isAnimating) {
      clearInterval(animationInterval);
      return;
    }

    step++;
    const nextLat = start.lat + deltaLat * step;
    const nextLng = start.lng + deltaLng * step;
    const nextPosition = { lat: nextLat, lng: nextLng };

    vehicleMarker.setPosition(nextPosition);
    map.panTo(nextPosition);

    vehiclePath.push(nextPosition);
    new google.maps.Polyline({
      path: vehiclePath,
      geodesic: true,
      strokeColor: "#0000FF",
      strokeOpacity: 0.6,
      strokeWeight: 2,
      map: map,
    });

    if (step === stepCount) {
      clearInterval(animationInterval);
      currentIndex++;
      setTimeout(() => animateVehicle(), stopDelay);
    }
  }, animationSpeed);
}

// Function to update the date display in the bottom section
function updateDate() {
  const dateElement = document.getElementById("date-section");

  // Set an interval to update date and time every second
  setInterval(() => {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();

    dateElement.textContent = `Date: ${date} | Time: ${time}`;
  }, 1000); // Update every second
}

// Call updateDate to start displaying date and time
updateDate();
