import React, { useEffect, useState } from 'react';
import { fetchEarnings } from '../api';

export default function Earnings() {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchEarnings()
      .then(res => setTotal(res.data.total))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h3>Total Earnings</h3>
      <p>₵{total}</p>
    </div>
  );
}
