import React from 'react';
import './EnergyPanel.css';

function EnergyPanel({ electricityPrice, setElectricityPrice, maxCostRate, setMaxCostRate, todayEnergy, todayCost, maxAllowedPower, currentPower }) {
  // Instantaneous spending rate from current power draw
  const currentCostRate = (currentPower / 1000) * electricityPrice; // ₹/hour
  const rateUsagePercent = maxCostRate > 0 ? (currentCostRate / maxCostRate) * 100 : 0;

  return (
    <div className="energy-panel card">
      <h3 className="card-title">💰 Energy & Budget</h3>
      
      <div className="energy-inputs">
        <div className="input-group">
          <label className="input-label">Electricity Price (₹/kWh)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={electricityPrice}
            onChange={(e) => setElectricityPrice(Number(e.target.value))}
            className="energy-input"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Max Cost Rate (₹/hour)</label>
          <input
            type="number"
            step="0.001"
            min="0"
            value={maxCostRate}
            onChange={(e) => setMaxCostRate(Number(e.target.value))}
            className="energy-input"
          />
          <div className="input-hint">Maximum spending rate while running</div>
        </div>
      </div>

      <div className="budget-display">
        <div className="budget-header">
          <span>Current Cost Rate</span>
          <span className={rateUsagePercent > 100 ? 'over-budget' : 'within-budget'}>
            ₹{currentCostRate.toFixed(4)}/hr
          </span>
        </div>
      </div>

      <div className="energy-stats">
        <div className="stat-card">
          <div className="stat-label">Energy Used</div>
          <div className="stat-value">{todayEnergy.toFixed(3)} kWh</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Total Cost</div>
          <div className="stat-value">₹{todayCost.toFixed(2)}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Max Rate</div>
          <div className="stat-value">₹{maxCostRate.toFixed(2)}/hr</div>
        </div>
      </div>

      <div className="power-limit-info">
        <div className="info-icon">⚡</div>
        <div>
          <div className="info-title">Power Capped At</div>
          <div className="info-value">{maxAllowedPower.toFixed(1)} W</div>
          <div className="info-desc">To maintain cost rate limit</div>
        </div>
      </div>
    </div>
  );
}

export default EnergyPanel;
