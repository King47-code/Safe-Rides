import React, { useEffect, useState } from 'react';
import { fetchHistory } from '../api';

export default function RideHistory({ role }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory()
      .then(res => setHistory(res.data))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h3>{role === 'driver' ? 'Drive History' : 'Ride History'}</h3>
      <ul>
        {history.map(r => (
          <li key={r.id}>
            {r.dropoff} — {r.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
