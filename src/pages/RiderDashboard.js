import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import { requestRide } from '../api';
import io from 'socket.io-client';
import '../styles.css';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

export default function RiderDashboard() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const directionsRef = useRef(null);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoff, setDropoff] = useState('');
  const [fare, setFare] = useState(null);
  const [ride, setRide] = useState(null);
  const [chat, setChat] = useState('');
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  // Initialize map & geolocation
  useEffect(() => {
    if (!mapContainer.current) return;
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = [pos.coords.longitude, pos.coords.latitude];
        setPickupCoords(coords);
        mapRef.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: coords,
          zoom: 13,
        });

        directionsRef.current = new MapboxDirections({
          accessToken: mapboxgl.accessToken,
          unit: 'metric',
          profile: 'mapbox/driving',
        });
        mapRef.current.addControl(directionsRef.current, 'top-left');
        directionsRef.current.setOrigin(coords);
      },
      err => console.error('Geolocation error:', err),
      { enableHighAccuracy: true }
    );
  }, []);

  // Socket.io listeners
  useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_API_BASE);

    socketRef.current.on('ride_accepted', data => {
      if (ride && data.rideId === ride.id) {
        alert('Your ride was accepted!');
        socketRef.current.emit('join_ride', ride.id);
      }
    });

    socketRef.current.on('chat_message', ({ message }) => {
      setMessages(prev => [...prev, message]);
    });

    return () => socketRef.current.disconnect();
  }, [ride]);

  // Request a ride
  const handleRequestRide = async () => {
    if (!pickupCoords || !dropoff) {
      alert('Allow location access and enter dropoff address.');
      return;
    }
    try {
      const res = await requestRide(pickupCoords, dropoff);
      setFare(res.estimated_fare);
      setRide(res);

      // normalize coords
      const dc = res.dropoff_coords;
      const dest = Array.isArray(dc) ? dc : [dc.lng, dc.lat];
      directionsRef.current.setDestination(dest);
    } catch (err) {
      console.error('Ride request failed:', err);
      alert('Ride request failed. Please try again.');
    }
  };

  // Send chat message
  const sendMessage = () => {
    if (!ride || !chat.trim()) return;
    socketRef.current.emit('chat_message', { rideId: ride.id, message: chat });
    setMessages(prev => [...prev, chat]);
    setChat('');
  };

  return (
    <div className="container">
      <header>
        <img src="/ridelogo.jpeg" alt="Safe Ride Logo" className="logo" />
        <h2>Rider Dashboard</h2>
      </header>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Enter dropoff location"
          value={dropoff}
          onChange={e => setDropoff(e.target.value)}
          style={{ width: '70%', padding: '0.5rem' }}
        />
        <button onClick={handleRequestRide}>Request Ride</button>
        {fare !== null && <p>Estimated Fare: GHS {fare}</p>}
      </div>

      <div ref={mapContainer} className="map-container" />

      <div>
        <h3>Chat</h3>
        <div className="chat-box">
          {messages.map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
        </div>
        <div className="chat-controls">
          <input
            type="text"
            value={chat}
            onChange={e => setChat(e.target.value)}
            placeholder="Type message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}
