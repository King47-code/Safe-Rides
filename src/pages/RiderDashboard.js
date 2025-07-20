// src/pages/RiderDashboard.js
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import { requestRide, fetchNearbyDrivers } from '../api';
import io from 'socket.io-client';
import '../styles.css';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

export default function RiderDashboard() {
  const mapContainer = useRef(null);
  const mapRef       = useRef(null);
  const directionsRef = useRef(null);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoff, setDropoff]           = useState('');
  const [fare, setFare]                 = useState(null);
  const [ride, setRide]                 = useState(null);
  const [drivers, setDrivers]           = useState([]);
  const [chat, setChat]                 = useState('');
  const [messages, setMessages]         = useState([]);
  const socketRef = useRef(null);

  // geolocate
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => setPickupCoords([pos.coords.longitude, pos.coords.latitude]),
      err => console.error(err),
      { enableHighAccuracy: true }
    );
  }, []);

  // init map & drivers
  useEffect(() => {
    if (!pickupCoords) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: pickupCoords,
      zoom: 13
    });

    directionsRef.current = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: 'metric',
      profile: 'mapbox/driving'
    });
    mapRef.current.addControl(directionsRef.current, 'top-left');
    directionsRef.current.setOrigin(pickupCoords);

    // show nearby drivers
    fetchNearbyDrivers().then(list => {
      setDrivers(list);
      list.forEach(d => {
        if (d.location) {
          const { lng, lat } = d.location;
          new mapboxgl.Marker({ color: 'blue' })
            .setLngLat([lng, lat])
            .addTo(mapRef.current);
        }
      });
      if (!list.length) {
        alert('No drivers available nearby.');
      }
    });
  }, [pickupCoords]);

  // sockets
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

  const handleRequestRide = async () => {
    if (!pickupCoords || !dropoff) {
      alert('Enter dropoff address.');
      return;
    }
    try {
      const res = await requestRide(pickupCoords, dropoff);
      setFare(res.estimated_fare);
      setRide(res);
      directionsRef.current.setDestination([res.dropoff_coords.lng, res.dropoff_coords.lat]);
    } catch (err) {
      console.error(err);
      alert('Request failed. Please try again.');
    }
  };

  const sendMessage = () => {
    if (!ride || !chat.trim()) return;
    socketRef.current.emit('chat_message', { rideId: ride.id, message: chat });
    setMessages(prev => [...prev, chat]);
    setChat('');
  };

  return (
    <div className="container">
      <header>
        <img src="/ridelogo.jpeg" className="logo" alt="Logo" />
        <h2>Rider Dashboard</h2>
      </header>

      <div style={{ marginBottom:'1rem' }}>
        <input
          value={dropoff}
          onChange={e=>setDropoff(e.target.value)}
          placeholder="Enter dropoff address"
          style={{ width:'70%', padding:'0.5rem' }}
        />
        <button onClick={handleRequestRide}>Request Ride</button>
        {fare !== null && <p>Fare: GHS {fare}</p>}
      </div>

      <div ref={mapContainer} className="map-container" />

      <div>
        <h3>Chat</h3>
        <div className="chat-box">
          {messages.map((m,i)=><div key={i}>{m}</div>)}
        </div>
        <div className="chat-controls">
          <input value={chat} onChange={e=>setChat(e.target.value)} placeholder="Message..." />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}
