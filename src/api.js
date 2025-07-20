  import axios from 'axios';

  const API_BASE = process.env.REACT_APP_API_BASE;
  const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

  // ✅ Health check
  export const checkConnection = () =>
    axios.get(`${API_BASE}/health`);
    
  // ✅ Login using phone
  export const login = (phone, password) =>
    axios.post(`${API_BASE}/api/login`, { phone, password });

  // ✅ Register using phone
  export const register = (name, phone, password, role) =>
    axios.post(`${API_BASE}/api/register`, { name, phone, password, role });

  // ✅ Calculate fare using Mapbox + backend
  export const calculateFare = async (pickup, dropoff) => {
    const geo = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(dropoff)}.json?access_token=${MAPBOX_TOKEN}`
    );
    const coords = geo.data.features[0].center;
    const resp = await axios.post(`${API_BASE}/api/rides/fare`, { pickup, dropoff: coords }, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    return resp.data;
  };

  // ✅ Request ride
  export const requestRide = (pickup, dropoff, fare) =>
    axios.post(`${API_BASE}/api/rides/request`, { pickup, dropoff, fare }, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });

  // ✅ Get ride history
  export const fetchHistory = () =>
    axios.get(`${API_BASE}/api/rides/history`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });

  // ✅ Get payments
  export const fetchPayments = () =>
    axios.get(`${API_BASE}/api/payments`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });

  // ✅ Get driver earnings
  export const fetchEarnings = () =>
    axios.get(`${API_BASE}/api/driver/earnings`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });

  // ✅ Initialize socket connection
  export const initSocket = () => {
    const socket = require('socket.io-client')(API_BASE);
    return socket;
  };

  // ✅ Helper: Get token
  const getToken = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token || '';
  };
