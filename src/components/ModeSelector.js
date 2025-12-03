import React from 'react';
import './ModeSelector.css';

function ModeSelector({ operatingMode, setOperatingMode }) {
  const modes = [
    { id: 'manual', label: 'Manual', icon: '🎚️', desc: 'Direct speed control' },
    { id: 'auto', label: 'Auto', icon: '🤖', desc: 'Climate-based control' },
    { id: 'budget', label: 'Budget', icon: '💲', desc: 'Rate-limited operation' }
  ];

  return (
    <div className="mode-selector">
      <h2 className="mode-title">Operating Mode</h2>
      <div className="mode-buttons">
        {modes.map(mode => (
          <button
            key={mode.id}
            className={`mode-button ${operatingMode === mode.id ? 'active' : ''}`}
            onClick={() => setOperatingMode(mode.id)}
          >
            <span className="mode-icon">{mode.icon}</span>
            <span className="mode-label">{mode.label}</span>
            <span className="mode-desc">{mode.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ModeSelector;
