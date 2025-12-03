import React from 'react';
import './StatusDisplay.css';

function StatusDisplay({ motorData, operatingMode, todayEnergy, todayCost, autoRPM, budgetCapRPM }) {
  const getStatusColor = () => {
    if (motorData.actualRPM < 10) return 'idle';
    if (motorData.actualRPM < 100) return 'low';
    if (motorData.actualRPM < 200) return 'medium';
    return 'high';
  };

  return (
    <div className="status-display card">
      <h3 className="card-title">📊 System Status</h3>
      
      <div className="rpm-comparison">
        <div className="rpm-box target">
          <div className="rpm-box-label">Target</div>
          <div className="rpm-box-value">{Math.round(motorData.targetRPM || 0)}</div>
          <div className="rpm-box-unit">RPM</div>
        </div>
        
        <div className="rpm-arrow">→</div>
        
        <div className={`rpm-box actual ${getStatusColor()}`}>
          <div className="rpm-box-label">Actual</div>
          <div className="rpm-box-value">{Math.round(motorData.actualRPM)}</div>
          <div className="rpm-box-unit">RPM</div>
        </div>
      </div>

      <div className="status-grid">
        {typeof autoRPM === 'number' && (
          <div className="status-item">
            <div className="status-item-label">Auto Target</div>
            <div className="status-item-value">{Math.round(autoRPM)} RPM</div>
          </div>
        )}

        {operatingMode === 'budget' && typeof budgetCapRPM === 'number' && (
          <div className="status-item">
            <div className="status-item-label">Budget Cap</div>
            <div className="status-item-value">{Math.round(budgetCapRPM)} RPM</div>
          </div>
        )}

        <div className="status-item">
          <div className="status-item-label">Mode</div>
          <div className="status-item-value">
            {operatingMode === 'manual' && '🎚️ Manual'}
            {operatingMode === 'auto' && '🤖 Auto'}
            {operatingMode === 'budget' && '💲 Budget'}
          </div>
        </div>

        <div className="status-item">
          <div className="status-item-label">Power Draw</div>
          <div className="status-item-value">{motorData.power.toFixed(1)} W</div>
        </div>

        <div className="status-item">
          <div className="status-item-label">PWM Output</div>
          <div className="status-item-value">{Math.abs(motorData.pwm || 0)}</div>
        </div>

        <div className="status-item">
          <div className="status-item-label">Motor State</div>
          <div className="status-item-value">
            {motorData.mode === 'IDLE' && '⏸️ Idle'}
            {motorData.mode === 'RUNNING' && '▶️ Running'}
            {motorData.mode === 'AUTOTUNING' && '🎯 Tuning'}
          </div>
        </div>
      </div>

      <div className="energy-summary">
        <div className="energy-summary-item">
          <span className="summary-icon">⚡</span>
          <div>
            <div className="summary-label">Energy Today</div>
            <div className="summary-value">{todayEnergy.toFixed(3)} kWh</div>
          </div>
        </div>
        
        <div className="energy-summary-item">
          <span className="summary-icon">💵</span>
          <div>
            <div className="summary-label">Cost Today</div>
            <div className="summary-value">₹{todayCost.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatusDisplay;
