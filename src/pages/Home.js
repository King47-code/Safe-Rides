
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';

function Home() {
  return (
    <div className="container">
      <img src="../ridelogo.jpeg" alt="logo" className="logo" />
      <h2>Welcome to Safe Ride</h2>
      <p>Fast and Affordable.</p>
      <nav>
        <Link to="/login"><button>Login</button></Link>
        <Link to="/register"><button>Register</button></Link>
      </nav>
    </div>
  );
}
export default Home;
