const coordinates = listing.geometry?.coordinates || [77.209, 28.6139];
const mapElement = document.getElementById("map");

const map = L.map("map").setView([coordinates[1], coordinates[0]], 7);

const fallbackLabel = document.createElement("div");
fallbackLabel.className = "map-fallback-label";
fallbackLabel.innerHTML = `<strong>${listing.location || "Location"}</strong><span>${listing.country || "Approximate location"}</span>`;
mapElement.appendChild(fallbackLabel);

const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
});

tiles.on("tileload", () => {
  mapElement.classList.add("map-tiles-loaded");
});

tiles.addTo(map);

L.circleMarker([coordinates[1], coordinates[0]], {
  radius: 10,
  color: "#ffffff",
  weight: 3,
  fillColor: "#fe424d",
  fillOpacity: 1,
})
  .addTo(map)
  .bindPopup(`<h4>${listing.title}</h4><p>Exact location will be provided after booking</p>`);

setTimeout(() => map.invalidateSize(), 100);
