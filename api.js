import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE;
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

export const checkConnection = () => 
  axios.get(`${API_BASE}/health`);

export const login = (number, password) =>
  axios.post(`${API_BASE}/api/login`, { phone, password });

export const register = (name, phone, password, role) =>
  axios.post(`${API_BASE}/api/register`, { name, phone, password, role });

export const calculateFare = async (pickup, dropoff) => {
  // mapbox geocode dropoff address
  const geo = await axios.get(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(dropoff)}.json?access_token=${MAPBOX_TOKEN}`
  );
  const coords = geo.data.features[0].center;
  const resp = await axios.post(`${API_BASE}/api/rides/fare`, { pickup, dropoff: coords });
  return resp.data;
};

export const requestRide = (pickup, dropoff, fare) =>
  axios.post(`${API_BASE}/api/rides/request`, { pickup, dropoff, fare });

export const fetchHistory = () =>
  axios.get(`${API_BASE}/api/rides/history`);

export const fetchPayments = () =>
  axios.get(`${API_BASE}/api/payments`);

export const fetchEarnings = () =>
  axios.get(`${API_BASE}/api/driver/earnings`);

export const initSocket = () => {
  const socket = require('socket.io-client')(API_BASE);
  return socket;}