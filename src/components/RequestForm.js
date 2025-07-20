import React, { useEffect, useState } from 'react';
import { calculateFare, requestRide } from '../api';

function RequestForm() {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const resp = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`
          );
          const data = await resp.json();
          const place = data.features[0]?.place_name;
          if (place) setPickup(place);
        } catch {
          setError('Could not detect location');
        }
      },
      () => setError('GPS permission denied')
    );
  }, []);

  const handleRequest = async () => {
    setLoading(true);
    setError('');
    try {
      const fareData = await calculateFare(pickup, dropoff);
      const { estimated_fare, coords } = fareData;
      await requestRide(coords.pickup, coords.dropoff, estimated_fare);
      alert(`Ride requested successfully! Estimated Fare: ₵${estimated_fare}`);
      setPickup('');
      setDropoff('');
    } catch (err) {
      console.error(err);
      setError('Ride request failed');
    }
    setLoading(false);
  };

  return (
    <div>
      <h3>Request a Ride</h3>
      <input
        placeholder="Pickup location"
        value={pickup}
        onChange={(e) => setPickup(e.target.value)}
      />
      <input
        placeholder="Dropoff location"
        value={dropoff}
        onChange={(e) => setDropoff(e.target.value)}
      />
      <button onClick={handleRequest} disabled={loading}>
        {loading ? 'Requesting...' : 'Request Ride'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default RequestForm;
