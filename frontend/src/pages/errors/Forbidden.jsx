import React from 'react';
import { Link } from 'react-router-dom';
import './Forbidden.css';
import { useAuth } from '../../context/AuthContext';

export default function Forbidden() {

  const {user} = useAuth()

  return (
    <div className="forbidden-page">
      <h1>403 - Forbidden</h1>
      <p>You do not have permission to view this page.</p>
      <div className="actions">
        <Link to={user?.role?.toUpperCase() === "ADMIN" ? "/admin" : "/"} className="btn-primary">
          Go to Home
        </Link>
        <Link to="/login" className="btn-secondary">
          Switch Accounts
        </Link>
      </div>
    </div>
  );
}
