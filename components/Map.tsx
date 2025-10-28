"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for missing default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

type HealthCenter = {
  id: string;
  name: string;
  lat: number;
  lon: number;
};

export default function HealthCentersByPincode() {
  const [pincode, setPincode] = useState(""); // no default pincode
  const [centerCoords, setCenterCoords] = useState<[number, number] | null>(
    null
  );
  const [healthCenters, setHealthCenters] = useState<HealthCenter[]>([]);
  const [loading, setLoading] = useState(false);

  // Step 1: Convert Pincode → Coordinates (Geocoding)
  const fetchCoordinates = async (code: string) => {
    if (!code.trim()) {
      alert("Please enter a valid pincode.");
      return;
    }

    setLoading(true);
    setHealthCenters([]);
    setCenterCoords(null);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${code}&country=India&format=json`
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        const coords: [number, number] = [parseFloat(lat), parseFloat(lon)];
        setCenterCoords(coords);
        await fetchHealthCenters(coords[0], coords[1]);
      } else {
        alert("Could not find location for this pincode.");
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      alert("Something went wrong while fetching location.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Fetch nearby health centers using Overpass API
  const fetchHealthCenters = async (lat: number, lon: number) => {
    const overpassQuery = `
      [out:json];
      (
        node["amenity"="hospital"](around:10000,${lat},${lon});
        node["amenity"="clinic"](around:10000,${lat},${lon});
        node["amenity"="doctors"](around:10000,${lat},${lon});
      );
      out center;
    `;

    try {
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: overpassQuery,
      });
      const json = await res.json();

      const centers = json.elements.map((el: any) => ({
        id: el.id,
        name: el.tags.name || "Unnamed Health Center",
        lat: el.lat,
        lon: el.lon,
      }));

      setHealthCenters(centers);
    } catch (error) {
      console.error("Error fetching health centers:", error);
      alert("Failed to load health centers. Try again later.");
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Input for Pincode */}
      <div className="flex gap-2">
        <input
          type="text"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          className="border px-3 py-2 rounded-lg w-40"
          placeholder="Enter pincode"
        />
        <button
          onClick={() => fetchCoordinates(pincode)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          disabled={loading}
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {/* Map */}
      <div className="w-full h-[500px]">
        {centerCoords ? (
          <MapContainer
            center={centerCoords}
            zoom={13}
            scrollWheelZoom={true}
            className="w-full h-full rounded-lg"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            />

            {/* Center Marker */}
            <Marker position={centerCoords}>
              <Popup>Pincode Center: {pincode}</Popup>
            </Marker>

            {/* 10 km Radius Circle */}
            <Circle
              center={centerCoords}
              radius={10000}
              color="blue"
              fillColor="blue"
              fillOpacity={0.1}
            />

            {/* Health Centers */}
            {healthCenters.map((hc) => (
              <Marker key={hc.id} position={[hc.lat, hc.lon]}>
                <Popup>
                  <strong>{hc.name}</strong>
                  <br />
                  Within 10 km of {pincode}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <p className="text-center text-gray-600 mt-4">
            {loading
              ? "Fetching location..."
              : "Enter a pincode above and click Search."}
          </p>
        )}
      </div>
    </div>
  );
}
