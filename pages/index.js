import { useState } from "react";
import Tesseract from "tesseract.js";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function Home() {
  const [image, setImage] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [mapUrl, setMapUrl] = useState("");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    setImage(URL.createObjectURL(file));

    const {
      data: { text },
    } = await Tesseract.recognize(file, "eng");
    const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
    setAddresses(lines);
  };

  const optimizeRoute = async () => {
    const waypoints = addresses.map((addr) => `optimize:true|${encodeURIComponent(addr)}`).join("|");
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
      start
    )}&destination=${encodeURIComponent(end)}&waypoints=optimize:true|${addresses
      .map((addr) => encodeURIComponent(addr))
      .join("|")}&key=${API_KEY}`;

    const res = await fetch("/api/optimizeRoute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    const optimized = data.optimizedOrder.map((i) => addresses[i]);
    const gmapsLink = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      start
    )}&destination=${encodeURIComponent(end)}&travelmode=driving&waypoints=${optimized
      .map((a) => encodeURIComponent(a))
      .join("|")}`;

    setMapUrl(gmapsLink);
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h1>📍 Tobi's Route Planner</h1>

      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {image && <img src={image} alt="preview" style={{ maxWidth: "100%", marginTop: 10 }} />}

      <div>
        <input
          placeholder="Startadresse"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          style={{ width: "100%", margin: "10px 0" }}
        />
        <input
          placeholder="Zieladresse"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />
      </div>

      <button onClick={optimizeRoute} style={{ padding: 10, width: "100%" }}>
        Route optimieren
      </button>

      {mapUrl && (
        <div style={{ marginTop: 20 }}>
          <a href={mapUrl} target="_blank" rel="noopener noreferrer">
            🗺️ Route in Google Maps öffnen
          </a>
        </div>
      )}
    </div>
  );
}
