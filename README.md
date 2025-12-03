# 🌬️ CoolStream - Intelligent Climate Control Dashboard

**CoolStream** transforms your PID-controlled motor into a smart, energy-aware climate control system. This IoT-enabled dashboard provides climate simulation, energy budgeting, and real-time analytics for intelligent fan management.

---

## 🎯 Project Overview

### What is CoolStream?

CoolStream is a **software wrapper** built on top of your existing ESP32 PID motor controller. Instead of just controlling motor speed, it now:

- **Simulates climate conditions** (temperature & humidity)
- **Calculates "Feels Like" temperature** using Heat Index
- **Auto-adjusts fan speed** based on comfort levels
- **Tracks energy consumption** and cost in real-time
- **Enforces daily budget limits** to control spending
- **Provides analytics** with historical graphs and insights

### Key Innovation

The hardware remains **unchanged** - we've added a sophisticated software layer that:
1. Models power consumption from PWM values
2. Implements intelligent control algorithms
3. Provides a beautiful, intuitive dashboard interface

---

## ✨ Features

### 🎚️ Manual Mode
- **Direct Speed Control**: Slider and preset buttons (Off, Low, Med, High)
- **Real-time RPM Display**: Large, colorful speedometer-style indicator
- **Quick Controls**: One-click speed presets

### 🤖 Auto Mode
- **Climate Simulation**: Adjust temperature (10-40°C) and humidity (20-90%)
- **Heat Index Calculation**: Shows "Feels Like" temperature
- **Smart Response**: Fan speed automatically adjusts based on comfort zones:
  - < 22°C: Off
  - 22-25°C: Low (80 RPM)
  - 25-29°C: Medium (150 RPM)
  - 29-32°C: High (200 RPM)
  - > 32°C: Max (250 RPM)
- **Climate Presets**: Sunny, Humid, Cool, Hot scenarios

### 💲 Budget Mode
- **Cost-Conscious Operation**: Combines Auto mode with spending limits
- **Daily Budget**: Set maximum daily cost (e.g., $0.10/day)
- **Power Limiting**: Automatically caps fan speed to stay within budget
- **Electricity Pricing**: Configure your local $/kWh rate
- **Real-time Tracking**: 
  - Energy used (kWh)
  - Cost today ($)
  - Budget remaining
  - Progress bar with over-budget warnings

### 📊 Analytics & Monitoring
- **Real-time Graph**: Dual-axis chart showing:
  - Feels Like temperature (°C)
  - Fan Speed (RPM)
- **Historical Data**: Last 60 data points (1-minute window)
- **Insight Cards**:
  - Average RPM
  - Average Feels Like temperature
  - Data point count
- **Status Display**:
  - Current RPM with color-coded indicator
  - Operating mode
  - Power draw (Watts)
  - PWM output value
  - Motor state (Idle/Running/Tuning)

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────┐
│          CoolStream Dashboard (React)            │
│  ┌───────────┐  ┌──────────┐  ┌──────────────┐ │
│  │  Manual   │  │   Auto   │  │    Budget    │ │
│  │   Mode    │  │   Mode   │  │     Mode     │ │
│  └───────────┘  └──────────┘  └──────────────┘ │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │      Real-time Analytics & Charts         │  │
│  └──────────────────────────────────────────┘  │
└────────────┬──────────────────┬─────────────────┘
             │                  │
         MQTT over WSS      (Control Logic)
             │                  │
┌────────────▼──────────────────▼─────────────────┐
│         ESP32 Firmware (Arduino)                 │
│  ┌──────────────┐  ┌──────────────────────┐    │
│  │ PID Control  │  │  Power Model         │    │
│  │   System     │  │  (PWM → Watts)       │    │
│  └──────────────┘  └──────────────────────┘    │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │    MQTT Publisher (motor/status)         │  │
│  │    {"actualRPM": 150, "power": 5.6}      │  │
│  └──────────────────────────────────────────┘  │
└────────────┬─────────────────────────────────────┘
             │
        ┌────▼────┐
        │  Motor  │
        │ Hardware│
        └─────────┘
```

### Data Flow

1. **Dashboard → ESP32**: Publishes target RPM to `motor/command/setpoint`
2. **ESP32 → Dashboard**: Publishes status to `motor/status` with RPM, PWM, and **power**
3. **Dashboard Logic**: 
   - In Manual mode: Uses slider value
   - In Auto mode: Calculates RPM from Heat Index
   - In Budget mode: Caps RPM to stay within power budget

---

## 🚀 Getting Started

### Prerequisites

- ESP32 with motor control hardware (already set up)
- Node.js (v18 or higher)
- MQTT broker access (EMQX cloud)

### Installation

1. **Update ESP32 Firmware**:
   - The firmware in `ESP32_Code/code.ino` has been updated with power modeling
   - Upload to your ESP32 via Arduino IDE

2. **Install Dashboard Dependencies**:
   ```bash
   cd coolstream-dashboard
   npm install
   ```

3. **Start the Dashboard**:
   ```bash
   npm start
   ```
   
4. **Access the Dashboard**:
   - Opens automatically at `http://localhost:3000`

### Configuration

#### MQTT Settings (in `src/App.js`):
```javascript
const mqttClient = mqtt.connect('wss://a0066190.ala.asia-southeast1.emqxsl.com:8084/mqtt', {
  username: 'shiv',
  password: 'shiv',
  protocol: 'wss'
});
```

#### Power Model Calibration (in `ESP32_Code/code.ino`):

The example power values are estimates. For accurate energy tracking:

1. **Measure Actual Current**:
   - Use a multimeter in series with motor power
   - Test at different PWM values (0, 50, 100, 150, 200, 255)
   - Calculate Watts = 12V × Current

2. **Update Power Table**:
   ```cpp
   float power_calibPWM[] = {0, 50, 100, 150, 200, 255};
   float power_calibWatts[] = {0.5, 1.2, 3.5, 6.2, 8.9, 11.0};
   ```

---

## 📱 User Guide

### Using Manual Mode

1. Select **Manual** mode
2. Use the slider or preset buttons to set desired RPM
3. Monitor real-time RPM, power, and cost

### Using Auto Mode

1. Select **Auto** mode
2. Adjust **Temperature** and **Humidity** sliders
3. Watch the **Feels Like** temperature update
4. Fan speed automatically adjusts based on comfort zones
5. Try preset scenarios: Sunny, Humid, Cool, Hot

### Using Budget Mode

1. Select **Budget** mode
2. Set your **Electricity Price** ($/kWh)
3. Set your **Daily Budget** ($)
4. Adjust temperature/humidity as in Auto mode
5. Dashboard will automatically limit fan speed to stay within budget
6. Monitor the budget progress bar and remaining balance

### Understanding the Display

#### Status Indicator Colors:
- **Gray**: Idle (RPM < 10)
- **Green**: Low speed (RPM < 100)
- **Orange**: Medium speed (RPM < 200)
- **Red**: High speed (RPM ≥ 200)

#### Budget Progress Bar:
- **Green**: Within budget
- **Red (pulsing)**: Over budget

---

## 🔧 Technical Details

### ESP32 Firmware Updates

#### 1. Power Model Function
```cpp
float wattsFromPWM(int pwm) {
  int absPwm = abs(pwm);
  if (absPwm == 0) return 0.5; // Base power (ESP32 + LCD)
  return interpolate((float)absPwm, power_calibWatts, power_calibPWM, power_tableSize);
}
```

#### 2. Enhanced MQTT Status
```cpp
float currentPower = wattsFromPWM(lastPwmValue);
snprintf(msg, 256, 
  "{\"mode\":\"RUNNING\", \"targetRPM\":%.1f, \"actualRPM\":%.1f, \"pwm\":%d, \"power\":%.2f}",
  (float)targetRPM, rpmFiltered, lastPwmValue, currentPower);
```

### Dashboard Control Logic

#### Heat Index Calculation
Simplified formula for "Feels Like" temperature:
```javascript
const calculateFeelsLike = (temp, hum) => {
  if (temp < 27) return temp;
  // Simplified Heat Index formula
  const HI = -8.78469 + 1.61139*T + 2.33855*RH + ...
  return HI;
};
```

#### Budget Mode Power Limiting
```javascript
const maxPower = (dailyBudget / electricityPrice * 1000) / 24; // Watts
const maxRPM = findMaxRPMForPower(maxPower);
finalRPM = Math.min(calculatedRPM, maxRPM);
```

---

## 📊 Analytics Features

### Real-time Graph
- **Chart.js** with react-chartjs-2
- Dual Y-axis (Temperature °C and RPM)
- Auto-scrolling with 60-point history
- Smooth transitions and fills

### Insight Cards
- **Average RPM**: Mean of all recorded RPM values
- **Avg Feels Like**: Mean perceived temperature
- **Data Points**: Number of samples collected

---

## 🎨 Design Philosophy

### Color Scheme
- **Primary**: Blue gradient (#667eea → #764ba2)
- **Accent**: Various contextual colors
  - Green: Eco/within budget
  - Orange: Warning/medium
  - Red: High/over budget

### Responsive Design
- **Desktop**: Multi-column grid layout
- **Tablet**: 2-column layout
- **Mobile**: Single-column stacked layout

### User Experience
- **Immediate Feedback**: Real-time updates every second
- **Visual Hierarchy**: Large numbers, clear labels
- **Intuitive Controls**: Sliders, presets, one-click modes
- **Progressive Enhancement**: Works with basic features, enhanced with full data

---

## 🔮 Future Enhancements

### Possible Additions:
1. **Schedule Mode**: Time-based automation
2. **Weather Integration**: Use actual weather API
3. **Machine Learning**: Learn user preferences
4. **Multi-Room**: Control multiple fans
5. **Voice Control**: Alexa/Google Home integration
6. **Historical Reports**: Weekly/monthly summaries
7. **Energy Optimization**: AI-powered efficiency suggestions
8. **Mobile App**: React Native version

---

## 🐛 Troubleshooting

### Dashboard won't connect
- Check MQTT broker URL and credentials
- Verify ESP32 is online and publishing to `motor/status`
- Check browser console for errors

### Energy values seem incorrect
- Calibrate the power model by measuring actual current
- Update `power_calibWatts` array in ESP32 code
- Ensure voltage is actually 12V (measure with multimeter)

### Budget mode doesn't limit speed
- Verify `electricityPrice` is set correctly
- Check `dailyBudget` is reasonable (not too high)
- Ensure power model is accurate

### Graph not updating
- Check MQTT connection status indicator
- Verify ESP32 is publishing every second
- Refresh the browser page

---

## 📄 License

This project is part of an educational embedded systems project.

---

## 🙏 Acknowledgments

- **React** & **Chart.js** for frontend framework
- **MQTT.js** for real-time communication
- **EMQX Cloud** for MQTT broker service
- **Arduino** ecosystem for ESP32 development

---

## 📞 Support

For issues or questions about CoolStream:
1. Check the troubleshooting section
2. Review the code comments in `App.js` and `code.ino`
3. Test with Manual mode first, then Auto, then Budget

---

**Built with ❄️ by the ESW Project Team**

*Transforming simple motor control into intelligent climate management*
