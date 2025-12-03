import React from 'react';
import './Header.css';

function Header({ connected }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo-icon">❄️</div>
          <div>
            <h1 className="logo-text">CoolStream</h1>
            <p className="tagline">Intelligent Climate Control</p>
          </div>
        </div>
        
        <div className="connection-status">
          <div className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}></div>
          <span className="status-text">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </header>
  );
}

export default Header;
