// src/api.js
import axios from 'axios';

const API_BASE       = process.env.REACT_APP_API_BASE;

// Helper to retrieve stored JWT
function getToken() {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token || '';
}

// Authorization headers
const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
});

export const register = (name, phone, password, role) =>
  axios.post(`${API_BASE}/api/register`, { name, phone, password, role });

export const login = (phone, password) =>
  axios.post(`${API_BASE}/api/login`, { phone, password });

// Fare estimation
export const fetchFare = (pickup, dropoff) =>
  axios.post(`${API_BASE}/api/rides/fare`, { pickup, dropoff }, authHeaders())
       .then(r => r.data);

// Request a ride
export const requestRide = (pickup, dropoff) =>
  axios.post(`${API_BASE}/api/rides/request`, { pickup, dropoff }, authHeaders())
       .then(r => r.data);

// Ride history
export const fetchHistory = () =>
  axios.get(`${API_BASE}/api/rides/history`, authHeaders())
       .then(r => r.data);

// **Nearby drivers** (added)
export const fetchNearbyDrivers = () =>
  axios.get(`${API_BASE}/api/drivers/nearby`, authHeaders())
       .then(r => r.data);

// Driver location update
export const updateDriverLocation = (lng, lat) =>
  axios.post(`${API_BASE}/api/drivers/location`, { lng, lat }, authHeaders());

// Payments & earnings
export const fetchPayments = () =>
  axios.get(`${API_BASE}/api/payments`, authHeaders())
       .then(r => r.data);

export const fetchEarnings = () =>
  axios.get(`${API_BASE}/api/driver/earnings`, authHeaders())
       .then(r => r.data);

// Real‑time socket.io
export const initSocket = () => {
  const token = getToken();
  return require('socket.io-client')(API_BASE, {
    query: { token }
  });
};
