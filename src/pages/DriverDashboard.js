import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import io from 'socket.io-client';
import { FaCheckCircle, FaCommentDots } from 'react-icons/fa';
import '../styles.css';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

export default function DriverDashboard() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [ride, setRide] = useState(null);
  const [chat, setChat] = useState('');
  const [messages, setMessages] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const socketRef = useRef(null);

  // Initialize map & geolocation
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(pos => {
      const coords = [pos.coords.longitude, pos.coords.latitude];
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: coords,
        zoom: 13,
      });
    });
  }, []);

  // Socket.io listeners
  useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_API_BASE);

    socketRef.current.on('ride_requested', data => {
      if (!ride) {
        setShowNotification(true);
        const confirmRide = window.confirm(
          `Accept ride to ${data.dropoff_coords.lat},${data.dropoff_coords.lng}?`
        );
        if (confirmRide) {
          fetch(`${process.env.REACT_APP_API_BASE}/api/rides/accept`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}`,
            },
            body: JSON.stringify({ rideId: data.id }),
          })
            .then(r => r.json())
            .then(() => {
              setRide(data);
              socketRef.current.emit('join_ride', data.id);
              setShowNotification(false);
            })
            .catch(err => console.error('Error accepting ride:', err));
        } else {
          setShowNotification(false);
        }
      }
    });

    socketRef.current.on('chat_message', ({ message }) => {
      setMessages(prev => [...prev, message]);
    });

    return () => socketRef.current.disconnect();
  }, [ride]);

  // Send chat message
  const sendMessage = () => {
    if (ride && chat.trim()) {
      socketRef.current.emit('chat_message', { rideId: ride.id, message: chat });
      setMessages(prev => [...prev, chat]);
      setChat('');
    }
  };

  // Complete ride
  const completeRide = () => {
    alert('Ride marked completed. Thanks!');
    setRide(null);
    setMessages([]);
    setChat('');
  };

  return (
    <div className="container">
      <header>
        <img src="/ridelogo.jpeg" alt="Safe Ride Logo" className="logo" />
        <h2>Driver Dashboard</h2>
      </header>

      {showNotification && (
        <div className="notification-popup">
          <FaCheckCircle /> New ride request received!
        </div>
      )}

      <div ref={mapContainer} className="map-container" />

      {ride && (
        <div className="ride-info">
          <h3>Trip Details</h3>
          <p>
            <strong>Destination:</strong>{' '}
            {ride.dropoff_location || `${ride.dropoff_coords.lat}, ${ride.dropoff_coords.lng}`}
          </p>
          <p>
            <strong>Fare:</strong> GHS {ride.fare}
          </p>
          <button className="complete-button" onClick={completeRide}>
            Complete Ride
          </button>
        </div>
      )}

      <div className="chat-section">
        <h3>
          <FaCommentDots /> Chat
        </h3>
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
