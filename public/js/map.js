console.log("map.js is loaded");

// ✅ Only select map once
const mapDiv = document.getElementById("map");
if (mapDiv) {
  const userLocation = mapDiv.dataset.location; // renamed from `location` to avoid conflict

  async function getCoords(locationText) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${locationText}`);
    const data = await response.json();
    if (data.length === 0) {
      console.error("No coordinates found");
      return [28.6139, 77.2090]; // fallback: Delhi
    }
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  }

  getCoords(userLocation).then((coords) => {
    const map = L.map('map').setView(coords, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    L.marker(coords).addTo(map).bindPopup(userLocation).openPopup();
  });
}
