import React, { useEffect, useState } from 'react';
import { fetchPayments } from '../api';

export default function Payment() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchPayments()
      .then(res => setPayments(res.data))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h3>Payments</h3>
      <ul>
        {payments.map(p => (
          <li key={p.id}>
            Ride {p.ride_id}: {p.amount} — {p.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
