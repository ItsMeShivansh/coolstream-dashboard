import React from 'react';
import './ClimatePanel.css';

function ClimatePanel({ temperature, setTemperature, humidity, setHumidity, feelsLike, onPreset }) {
  return (
    <div className="climate-panel card">
      <h3 className="card-title">🌡️ Climate Simulation</h3>
      
      <div className="climate-controls">
        <div className="control-group">
          <label className="control-label">
            Temperature: <span className="value-display">{temperature}°C</span>
          </label>
          <input
            type="range"
            min="10"
            max="40"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="slider temperature-slider"
          />
          <div className="slider-labels">
            <span>10°C</span>
            <span>40°C</span>
          </div>
        </div>

        <div className="control-group">
          <label className="control-label">
            Humidity: <span className="value-display">{humidity}%</span>
          </label>
          <input
            type="range"
            min="20"
            max="90"
            value={humidity}
            onChange={(e) => setHumidity(Number(e.target.value))}
            className="slider humidity-slider"
          />
          <div className="slider-labels">
            <span>20%</span>
            <span>90%</span>
          </div>
        </div>
      </div>

      <div className="feels-like-display">
        <div className="feels-like-label">Feels Like</div>
        <div className="feels-like-value">{feelsLike}°C</div>
        <div className="feels-like-desc">
          {feelsLike < 22 && '😌 Comfortable'}
          {feelsLike >= 22 && feelsLike < 25 && '🙂 Pleasant'}
          {feelsLike >= 25 && feelsLike < 29 && '😅 Warm'}
          {feelsLike >= 29 && feelsLike < 32 && '🥵 Hot'}
          {feelsLike >= 32 && '🔥 Very Hot'}
        </div>
      </div>

      <div className="preset-buttons">
        <button className="preset-btn sunny" onClick={() => onPreset('sunny')}>
          ☀️ Sunny
        </button>
        <button className="preset-btn humid" onClick={() => onPreset('humid')}>
          💧 Humid
        </button>
        <button className="preset-btn cool" onClick={() => onPreset('cool')}>
          🌙 Cool
        </button>
        <button className="preset-btn hot" onClick={() => onPreset('hot')}>
          🔥 Hot
        </button>
      </div>
    </div>
  );
}

export default ClimatePanel;
