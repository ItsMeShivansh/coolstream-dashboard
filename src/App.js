import React, { useState, useEffect, useRef, useCallback } from 'react';
import mqtt from 'mqtt';
import './App.css';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import ClimatePanel from './components/ClimatePanel';
import EnergyPanel from './components/EnergyPanel';
import StatusDisplay from './components/StatusDisplay';
import AnalyticsChart from './components/AnalyticsChart';
import ManualControl from './components/ManualControl';

// Helper Functions (moved outside component to avoid re-creation)
const calculateFeelsLike = (temp, hum) => {
  const T = temp;
  const RH = hum;

  // Heat Index polynomial in Celsius
  const HI = -8.78469475556 +
             1.61139411 * T +
             2.33854883889 * RH +
             -0.14611605 * T * RH +
             -0.012308094 * T * T +
             -0.0164248277778 * RH * RH +
             0.002211732 * T * T * RH +
             0.00072546 * T * RH * RH +
             -0.000003582 * T * T * RH * RH;

  // Blend factor: ramp from 15°C → 27°C (0 → 1)
  const w = Math.max(0, Math.min(1, (T - 15) / 12));
  const blended = T * (1 - w) + HI * w;

  const feels = Math.max(-20, Math.min(60, blended));
  return Math.round(feels * 10) / 10;
};

const calculateAutoRPM = (feelsLike) => {
  const map = [
    { t: 20, rpm: 0 },
    { t: 22, rpm: 40 },
    { t: 24, rpm: 80 },
    { t: 26, rpm: 110 },
    { t: 28, rpm: 140 },
    { t: 30, rpm: 170 },
    { t: 32, rpm: 200 },
    { t: 34, rpm: 220 },
    { t: 36, rpm: 240 },
    { t: 38, rpm: 250 }
  ];

  if (feelsLike <= map[0].t) return map[0].rpm;
  if (feelsLike >= map[map.length - 1].t) return map[map.length - 1].rpm;

  for (let i = 0; i < map.length - 1; i++) {
    const a = map[i];
    const b = map[i + 1];
    if (feelsLike >= a.t && feelsLike <= b.t) {
      const ratio = (feelsLike - a.t) / (b.t - a.t);
      return Math.round(a.rpm + ratio * (b.rpm - a.rpm));
    }
  }
  return 0;
};

const calculateMaxPowerFromCostRate = (costPerHour, pricePerKwh) => {
  return (costPerHour / pricePerKwh) * 1000;
};

const findMaxRPMForPower = (maxPowerWatts) => {
  const powerLevels = [
    { rpm: 0, watts: 0.5 },
    { rpm: 50, watts: 1.5 },
    { rpm: 80, watts: 2.4 },
    { rpm: 100, watts: 3.5 },
    { rpm: 150, watts: 5.6 },
    { rpm: 200, watts: 7.9 },
    { rpm: 250, watts: 10.6 }
  ];

  for (let i = powerLevels.length - 1; i >= 0; i--) {
    if (powerLevels[i].watts <= maxPowerWatts) {
      return powerLevels[i].rpm;
    }
  }
  return 0;
};

function App() {
  // MQTT Connection
  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);

  // Operating Mode: 'manual', 'auto', 'budget'
  const [operatingMode, setOperatingMode] = useState('manual');

  // Climate Simulation
  const [temperature, setTemperature] = useState(25);
  const [humidity, setHumidity] = useState(50);
  const [feelsLike, setFeelsLike] = useState(25);

  // Manual Control
  const [manualRPM, setManualRPM] = useState(0);
  
  // Track commanded setpoint (what dashboard sends)
  const [commandedRPM, setCommandedRPM] = useState(0);

  // Energy & Budget
  const [electricityPrice, setElectricityPrice] = useState(8.0); // ₹/kWh
  const [maxCostRate, setMaxCostRate] = useState(1.0); // ₹ per hour
  const [todayEnergy, setTodayEnergy] = useState(0); // kWh
  const [todayCost, setTodayCost] = useState(0); // $

  // Motor Status (from ESP32)
  const [motorData, setMotorData] = useState({
    mode: 'IDLE',
    actualRPM: 0,
    targetRPM: 0,
    pwm: 0,
    power: 0.5 // Watts
  });

  // Analytics Data
  const [analyticsData, setAnalyticsData] = useState({
    timestamps: [],
    feelsLikeHistory: [],
    rpmHistory: [],
    costHistory: []
  });

  const lastEnergyUpdate = useRef(Date.now());
  const lastPublishedRef = useRef(null);
  const lastModeRef = useRef(operatingMode);

  // MQTT Connection
  useEffect(() => {
    // Allow override via env vars; fallback to ESP32 firmware settings
    const brokerUrl = process.env.REACT_APP_MQTT_URL || 'wss://a0066190.ala.asia-southeast1.emqxsl.com:8084/mqtt';
    const brokerUser = process.env.REACT_APP_MQTT_USERNAME || 'esp32-client';
    const brokerPass = process.env.REACT_APP_MQTT_PASSWORD || 'esp32-client';

    const mqttClient = mqtt.connect(brokerUrl, {
      username: brokerUser,
      password: brokerPass,
      protocol: 'wss',
      reconnectPeriod: 3000,
      keepalive: 60,
      connectTimeout: 15_000,
      clientId: `coolstream-dashboard-${Math.random().toString(16).slice(2)}`,
      clean: true
    });

    mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker');
      setConnected(true);
      mqttClient.subscribe('motor/status', (err) => {
        if (err) console.error('Subscription error:', err);
      });
    });

    mqttClient.on('message', (topic, message) => {
      if (topic === 'motor/status') {
        try {
          const data = JSON.parse(message.toString());
          setMotorData(data);
        } catch (e) {
          console.error('Error parsing motor status:', e);
        }
      }
    });

    mqttClient.on('error', (err) => {
      console.error('MQTT Error:', err);
      setConnected(false);
    });

    mqttClient.on('reconnect', () => {
      console.warn('MQTT reconnecting...');
    });

    mqttClient.on('close', () => {
      console.warn('MQTT connection closed');
      setConnected(false);
    });

    setClient(mqttClient);

    return () => {
      if (mqttClient) {
        mqttClient.end();
      }
    };
  }, []);

  // Memoized callbacks to avoid dependency issues (defined before useEffects that use them)
  const publishSetpoint = useCallback((rpm) => {
    if (client && connected) {
      client.publish('motor/command/setpoint', rpm.toString());
      setCommandedRPM(rpm); // Track what we commanded
    }
  }, [client, connected]);

  const updateAnalytics = useCallback((feels, rpm, cost) => {
    const now = new Date().toLocaleTimeString();
    
    setAnalyticsData(prev => {
      const maxDataPoints = 60; // Keep last 60 data points (1 minute)
      
      return {
        timestamps: [...prev.timestamps, now].slice(-maxDataPoints),
        feelsLikeHistory: [...prev.feelsLikeHistory, feels].slice(-maxDataPoints),
        rpmHistory: [...prev.rpmHistory, rpm].slice(-maxDataPoints),
        costHistory: [...prev.costHistory, cost].slice(-maxDataPoints)
      };
    });
  }, []);

  // Calculate "Feels Like" temperature (Heat Index)
  useEffect(() => {
    const calculated = calculateFeelsLike(temperature, humidity);
    setFeelsLike(calculated);
  }, [temperature, humidity]);

  // Main Control Logic - runs when mode or climate changes
  useEffect(() => {
    if (!client || !connected) return;

    let finalRPM = 0;
    const autoRPM = calculateAutoRPM(feelsLike);
    let budgetCapRPM = null;

    if (operatingMode === 'manual') {
      finalRPM = manualRPM;
    } else if (operatingMode === 'auto') {
      finalRPM = autoRPM;
    }

    // Budget mode caps the speed based on cost rate
    if (operatingMode === 'budget') {
      const maxPower = calculateMaxPowerFromCostRate(maxCostRate, electricityPrice);
      budgetCapRPM = findMaxRPMForPower(maxPower);
      finalRPM = Math.min(autoRPM, budgetCapRPM);
    }

    // Quantize to fixed step size (env override: REACT_APP_RPM_STEP, default 5)
    const step = Number(process.env.REACT_APP_RPM_STEP || 5);
    const quantized = Math.max(0, Math.min(250, Math.round(finalRPM / step) * step));
    
    // Check if mode changed or value changed
    const modeChanged = lastModeRef.current !== operatingMode;
    
    // Always publish when values change OR when mode switches
    if (lastPublishedRef.current !== quantized || modeChanged) {
      console.log(`[Control] mode=${operatingMode}, feelsLike=${feelsLike}, manualRPM=${manualRPM} → targetRPM=${quantized}${modeChanged ? ' (mode changed)' : ''}`);
      publishSetpoint(quantized);
      lastPublishedRef.current = quantized;
      lastModeRef.current = operatingMode;
    }

  }, [operatingMode, feelsLike, manualRPM, maxCostRate, electricityPrice, client, connected, publishSetpoint]);

  // Energy tracking - update every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedHours = (now - lastEnergyUpdate.current) / (1000 * 60 * 60);
      lastEnergyUpdate.current = now;

      const energyConsumed = motorData.power * elapsedHours; // Wh
      const newTodayEnergy = todayEnergy + (energyConsumed / 1000); // kWh
      const newTodayCost = newTodayEnergy * electricityPrice;

      setTodayEnergy(newTodayEnergy);
      setTodayCost(newTodayCost);

    }, 1000);

    return () => clearInterval(interval);
  }, [motorData.power, todayEnergy, electricityPrice]);

  // Update analytics when motor data changes (for real-time graph updates)
  useEffect(() => {
    updateAnalytics(feelsLike, motorData.actualRPM, todayCost);
  }, [motorData.actualRPM, feelsLike, todayCost, updateAnalytics]);

  const handlePreset = (presetName) => {
    const presets = {
      sunny: { temp: 32, humidity: 40 },
      humid: { temp: 27, humidity: 80 },
      cool: { temp: 20, humidity: 50 },
      hot: { temp: 35, humidity: 60 }
    };
    
    if (presets[presetName]) {
      setTemperature(presets[presetName].temp);
      setHumidity(presets[presetName].humidity);
    }
  };

  return (
    <div className="App">
      <Header connected={connected} />
      
      <div className="main-container">
        <ModeSelector 
          operatingMode={operatingMode}
          setOperatingMode={setOperatingMode}
        />

        <div className="control-grid">
          {operatingMode === 'manual' && (
            <ManualControl 
              manualRPM={manualRPM}
              setManualRPM={setManualRPM}
            />
          )}

          {(operatingMode === 'auto' || operatingMode === 'budget') && (
            <ClimatePanel
              temperature={temperature}
              setTemperature={setTemperature}
              humidity={humidity}
              setHumidity={setHumidity}
              feelsLike={feelsLike}
              onPreset={handlePreset}
            />
          )}

          {operatingMode === 'budget' && (
            <EnergyPanel
              electricityPrice={electricityPrice}
              setElectricityPrice={setElectricityPrice}
              maxCostRate={maxCostRate}
              setMaxCostRate={setMaxCostRate}
              todayEnergy={todayEnergy}
              todayCost={todayCost}
              maxAllowedPower={calculateMaxPowerFromCostRate(maxCostRate, electricityPrice)}
              currentPower={motorData.power}
            />
          )}

          <StatusDisplay 
            motorData={{...motorData, targetRPM: commandedRPM}} // Use commanded RPM instead of motor's reported target
            operatingMode={operatingMode}
            autoRPM={calculateAutoRPM(feelsLike)}
            budgetCapRPM={operatingMode === 'budget' ? findMaxRPMForPower(calculateMaxPowerFromCostRate(maxCostRate, electricityPrice)) : null}
            todayEnergy={todayEnergy}
            todayCost={todayCost}
          />
        </div>

        <AnalyticsChart data={analyticsData} />
      </div>
    </div>
  );
}

export default App;
