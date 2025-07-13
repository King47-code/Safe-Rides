require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN_HERE';

app.use(bodyParser.json());

function haversineDistance(coord1, coord2) {
  const toRad = (val) => (val * Math.PI) / 180;
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

app.post('/api/rides/fare', async (req, res) => {
  try {
    const { pickup, dropoff } = req.body;

    if (!pickup || !Array.isArray(pickup) || pickup.length !== 2) {
      return res.status(400).json({ error: 'Invalid pickup coordinates' });
    }

    if (!dropoff || typeof dropoff !== 'string') {
      return res.status(400).json({ error: 'Dropoff must be a valid address' });
    }

    const geoUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(dropoff)}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
    const geoResponse = await axios.get(geoUrl);

    if (!geoResponse.data.features.length) {
      return res.status(404).json({ error: 'Dropoff address not found' });
    }

    const dropoffCoords = geoResponse.data.features[0].center;
    const dropoffPlaceName = geoResponse.data.features[0].place_name;

    const distance = haversineDistance(pickup, dropoffCoords);

    const baseFare = 5;
    const ratePerKm = 2;
    const totalFare = parseFloat((baseFare + ratePerKm * distance).toFixed(2));

    res.json({
      message: 'Fare calculated successfully',
      dropoff: dropoffPlaceName,
      distance_km: `${distance.toFixed(2)} km`,
      estimated_fare: `₵${totalFare.toFixed(2)}`
    });

  } catch (err) {
    console.error('Error calculating fare:', err);
    res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Safe Ride API is running on port ${PORT}`);
});
