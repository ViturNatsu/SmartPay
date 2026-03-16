import React from 'react';
import { Link } from 'react-router-dom';
import './Forbidden.css';

export default function Forbidden() {
  return (
    <div className="forbidden-page">
      <h1>403 - Forbidden</h1>
      <p>You do not have permission to view this page.</p>
      <div className="actions">
        <Link to="/" className="btn-primary">
          Go to Home
        </Link>
        <Link to="/login" className="btn-secondary">
          Switch Accounts
        </Link>
      </div>
    </div>
  );
}
