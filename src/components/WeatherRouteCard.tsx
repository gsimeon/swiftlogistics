import React, { useState } from 'react';
import { 
  CloudRain, 
  Sun, 
  CloudLightning, 
  Wind, 
  Droplets, 
  Thermometer, 
  AlertTriangle, 
  RefreshCw, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  CloudSun 
} from 'lucide-react';

export interface RouteHourlyForecast {
  time: string;
  tempC: number;
  condition: 'Clear' | 'Partly Cloudy' | 'Heavy Rain' | 'Thunderstorm';
  rainProbPct: number;
  delayMins: number;
}

export interface WeatherInfo {
  city: string;
  temperatureC: number;
  condition: 'Clear' | 'Partly Cloudy' | 'Scattered Showers' | 'Tropical Thunderstorm' | 'Extreme Heat';
  rainProbabilityPct: number;
  humidityPct: number;
  windSpeedKmH: number;
  rainDelayMinutes: number;
  tempDelayMinutes: number;
  rainWarning?: string;
  tempWarning?: string;
}

interface WeatherRouteCardProps {
  locationName?: string;
}

export const WeatherRouteCard: React.FC<WeatherRouteCardProps> = ({
  locationName = 'Ikeja, Lagos, Nigeria (Computer Village Route)',
}) => {
  const [selectedPreset, setSelectedPreset] = useState<'rain' | 'heat' | 'clear'>('rain');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState('Just now');

  const [weather, setWeather] = useState<WeatherInfo>({
    city: 'Ikeja, Lagos',
    temperatureC: 31,
    condition: 'Scattered Showers',
    rainProbabilityPct: 75,
    humidityPct: 84,
    windSpeedKmH: 18,
    rainDelayMinutes: 7,
    tempDelayMinutes: 3,
    rainWarning: '🌧️ Rain Hazard: Moderate tropical downpour along Allen Ave & Mobolaji Bank Anthony Way — expect ~+7 mins transit delay.',
    tempWarning: '🌡️ Temperature Warning: High ambient heat (31°C / 88°F) along Ikeja route — monitor rider thermal comfort.',
  });

  const [hourlyForecast, setHourlyForecast] = useState<RouteHourlyForecast[]>([
    { time: '14:00', tempC: 31, condition: 'Clear', rainProbPct: 20, delayMins: 0 },
    { time: '15:00', tempC: 29, condition: 'Heavy Rain', rainProbPct: 85, delayMins: 8 },
    { time: '16:00', tempC: 27, condition: 'Thunderstorm', rainProbPct: 90, delayMins: 12 },
    { time: '17:00', tempC: 28, condition: 'Partly Cloudy', rainProbPct: 35, delayMins: 2 },
  ]);

  const handleApplyPreset = (preset: 'rain' | 'heat' | 'clear') => {
    setSelectedPreset(preset);
    setIsRefreshing(true);

    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdatedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      if (preset === 'rain') {
        setWeather({
          city: 'Ikeja, Lagos',
          temperatureC: 28,
          condition: 'Scattered Showers',
          rainProbabilityPct: 85,
          humidityPct: 88,
          windSpeedKmH: 22,
          rainDelayMinutes: 8,
          tempDelayMinutes: 0,
          rainWarning: '🌧️ Heavy Rain Warning: Waterlogging reported near Awolowo Way & Mobolaji Bank Anthony Way — rider speed reduced by ~25% (+8 mins delay).',
          tempWarning: undefined,
        });
        setHourlyForecast([
          { time: '14:30', tempC: 28, condition: 'Heavy Rain', rainProbPct: 85, delayMins: 8 },
          { time: '15:30', tempC: 27, condition: 'Thunderstorm', rainProbPct: 95, delayMins: 14 },
          { time: '16:30', tempC: 28, condition: 'Partly Cloudy', rainProbPct: 40, delayMins: 3 },
          { time: '17:30', tempC: 29, condition: 'Clear', rainProbPct: 15, delayMins: 0 },
        ]);
      } else if (preset === 'heat') {
        setWeather({
          city: 'Ikeja, Lagos',
          temperatureC: 35,
          condition: 'Extreme Heat',
          rainProbabilityPct: 10,
          humidityPct: 62,
          windSpeedKmH: 12,
          rainDelayMinutes: 0,
          tempDelayMinutes: 5,
          rainWarning: undefined,
          tempWarning: '🌡️ High Temperature Warning: Extreme ambient heat (35°C / 95°F) along Ikeja Computer Village corridor — +5 mins recommended cooling stops for motorcycle couriers.',
        });
        setHourlyForecast([
          { time: '14:30', tempC: 35, condition: 'Clear', rainProbPct: 10, delayMins: 5 },
          { time: '15:30', tempC: 36, condition: 'Clear', rainProbPct: 10, delayMins: 6 },
          { time: '16:30', tempC: 33, condition: 'Partly Cloudy', rainProbPct: 15, delayMins: 2 },
          { time: '17:30', tempC: 30, condition: 'Clear', rainProbPct: 10, delayMins: 0 },
        ]);
      } else {
        setWeather({
          city: 'Ikeja, Lagos',
          temperatureC: 29,
          condition: 'Clear',
          rainProbabilityPct: 15,
          humidityPct: 70,
          windSpeedKmH: 14,
          rainDelayMinutes: 0,
          tempDelayMinutes: 0,
          rainWarning: undefined,
          tempWarning: undefined,
        });
        setHourlyForecast([
          { time: '14:30', tempC: 29, condition: 'Clear', rainProbPct: 15, delayMins: 0 },
          { time: '15:30', tempC: 29, condition: 'Clear', rainProbPct: 15, delayMins: 0 },
          { time: '16:30', tempC: 28, condition: 'Clear', rainProbPct: 20, delayMins: 0 },
          { time: '17:30', tempC: 27, condition: 'Clear', rainProbPct: 10, delayMins: 0 },
        ]);
      }
    }, 400);
  };

  const getWeatherIcon = (cond: string) => {
    switch (cond) {
      case 'Clear':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'Partly Cloudy':
        return <CloudSun className="w-5 h-5 text-blue-400" />;
      case 'Extreme Heat':
        return <Thermometer className="w-5 h-5 text-red-500 animate-bounce" />;
      case 'Thunderstorm':
        return <CloudLightning className="w-5 h-5 text-purple-600 animate-pulse" />;
      default:
        return <CloudRain className="w-5 h-5 text-blue-500 animate-bounce" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            {getWeatherIcon(weather.condition)}
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800 flex items-center space-x-1.5">
              <span>Route Weather Telemetry & Forecast</span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono font-bold">
                Live Met
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">{locationName}</p>
          </div>
        </div>

        {/* Preset Simulator & Refresh Button */}
        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
            <button
              onClick={() => handleApplyPreset('rain')}
              className={`px-2 py-1 rounded transition-colors ${
                selectedPreset === 'rain' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌧️ Rain Warning
            </button>
            <button
              onClick={() => handleApplyPreset('heat')}
              className={`px-2 py-1 rounded transition-colors ${
                selectedPreset === 'heat' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌡️ Heat Warning
            </button>
            <button
              onClick={() => handleApplyPreset('clear')}
              className={`px-2 py-1 rounded transition-colors ${
                selectedPreset === 'clear' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ☀️ Clear
            </button>
          </div>

          <button
            onClick={() => handleApplyPreset(selectedPreset)}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600"
            title="Refresh Route Weather Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-center">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center justify-center space-x-1">
            <Thermometer className="w-3.5 h-3.5 text-red-500" />
            <span>Ambient Temp</span>
          </span>
          <span className="font-bold text-slate-800 text-sm font-mono mt-0.5 block">{weather.temperatureC}°C</span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center justify-center space-x-1">
            <CloudRain className="w-3.5 h-3.5 text-blue-500" />
            <span>Rain Risk</span>
          </span>
          <span className="font-bold text-blue-600 text-sm font-mono mt-0.5 block">{weather.rainProbabilityPct}%</span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center justify-center space-x-1">
            <Droplets className="w-3.5 h-3.5 text-cyan-500" />
            <span>Humidity</span>
          </span>
          <span className="font-bold text-slate-700 text-sm font-mono mt-0.5 block">{weather.humidityPct}%</span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center justify-center space-x-1">
            <Wind className="w-3.5 h-3.5 text-emerald-500" />
            <span>Wind Speed</span>
          </span>
          <span className="font-bold text-slate-700 text-sm font-mono mt-0.5 block">{weather.windSpeedKmH} km/h</span>
        </div>
      </div>

      {/* Rain Delay & Temperature Warning Banners */}
      <div className="space-y-2">
        {weather.rainWarning && (
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-blue-900 text-xs flex items-start space-x-2.5 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-blue-950 block">Route Rain Hazard Warning</span>
              <p className="text-[11px] text-blue-800 mt-0.5">{weather.rainWarning}</p>
            </div>
          </div>
        )}

        {weather.tempWarning && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900 text-xs flex items-start space-x-2.5 animate-fadeIn">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-amber-950 block">High Ambient Temperature Warning</span>
              <p className="text-[11px] text-amber-800 mt-0.5">{weather.tempWarning}</p>
            </div>
          </div>
        )}
      </div>

      {/* Hourly Route Forecast Timeline */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold uppercase tracking-wider">
          <span className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>4-Hour Route Weather Timeline</span>
          </span>
          <span className="text-[10px] text-slate-400 font-normal">Updated: {lastUpdatedTime}</span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
          {hourlyForecast.map((hour, idx) => (
            <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block font-mono">{hour.time}</span>
              <div className="flex justify-center my-1">{getWeatherIcon(hour.condition)}</div>
              <span className="font-bold text-slate-800 text-xs block font-mono">{hour.tempC}°C</span>
              {hour.delayMins > 0 ? (
                <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1 py-0.5 rounded border border-rose-200 block">
                  +{hour.delayMins}m delay
                </span>
              ) : (
                <span className="text-[9px] text-emerald-600 font-bold block">On Time</span>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
