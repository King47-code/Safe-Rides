import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { calculateFare, requestRide } from '../api';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

export default function MapView() {
  const mapRef = useRef(null);
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState('');
  const [fare, setFare] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!navigator.geolocation) {
      setMessage('⚠️ GPS not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = [pos.coords.longitude, pos.coords.latitude];
        setPickup(coords);

        const map = new mapboxgl.Map({
          container: mapRef.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: coords,
          zoom: 13,
        });
        new mapboxgl.Marker().setLngLat(coords).addTo(map);
      },
      () => setMessage('⚠️ Unable to retrieve location'),
      { enableHighAccuracy: true }
    );
  }, []);

  const handleCalculate = async () => {
    if (!pickup || !dropoff) return setMessage('Enter drop‑off address');
    try {
      const data = await calculateFare(pickup, dropoff);
      setFare(data.estimated_fare);
      setMessage(`📏 Distance: ${data.distance_km}`);
    } catch {
      setMessage('❌ Error calculating fare');
    }
  };

  const handleRequest = async () => {
    if (!fare) return setMessage('Calculate fare first');
    try {
      await requestRide(pickup, dropoff, fare);
      setMessage('✅ Ride requested!');
    } catch {
      setMessage('❌ Request failed');
    }
  };

  return (
    <div>
      <div ref={mapRef} className="map-container" />
      <input
        type="text"
        placeholder="Drop‑off address"
        value={dropoff}
        onChange={e => setDropoff(e.target.value)}
      />
      <button onClick={handleCalculate}>Calculate Fare</button>
      {fare && <p>Estimated Fare: {fare}</p>}
      <button onClick={handleRequest}>Request Ride</button>
      <p>{message}</p>
    </div>
  );
}
