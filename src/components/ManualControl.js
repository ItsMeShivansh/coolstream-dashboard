import React from 'react';
import './ManualControl.css';

function ManualControl({ manualRPM, setManualRPM }) {
  return (
    <div className="manual-control card">
      <h3 className="card-title">🎚️ Manual Control</h3>
      
      <div className="rpm-display">
        <div className="rpm-value">{manualRPM}</div>
        <div className="rpm-label">RPM</div>
      </div>

      <div className="manual-slider-container">
        <input
          type="range"
          min="0"
          max="250"
          step="10"
          value={manualRPM}
          onChange={(e) => setManualRPM(Number(e.target.value))}
          className="manual-slider"
        />
        <div className="slider-labels">
          <span>0</span>
          <span>250</span>
        </div>
      </div>

      <div className="quick-speeds">
        <button className="speed-btn" onClick={() => setManualRPM(0)}>
          Off
        </button>
        <button className="speed-btn" onClick={() => setManualRPM(80)}>
          Low
        </button>
        <button className="speed-btn" onClick={() => setManualRPM(150)}>
          Med
        </button>
        <button className="speed-btn" onClick={() => setManualRPM(250)}>
          High
        </button>
      </div>
    </div>
  );
}

export default ManualControl;
