import React from 'react';
import { 
  CloudRain, 
  Droplets, 
  Wind, 
  Sun, 
  Cloud, 
  CloudDrizzle, 
  CloudLightning, 
  CloudSnow, 
  Gauge, 
  Eye, 
  Umbrella, 
  MapPin, 
  Clock,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { WeatherData } from '../types';
import { getWeatherInfo, getRainRiskLevel } from '../utils/weather';

interface CurrentClimateProps {
  data: WeatherData;
  onRefresh?: () => void;
}

export const CurrentClimate: React.FC<CurrentClimateProps> = ({ data }) => {
  const { city, current } = data;
  const weatherInfo = getWeatherInfo(current.weatherCode, current.isDay);
  const rainRisk = getRainRiskLevel(current.rainProbability);

  // Icon mapping
  const renderWeatherIcon = (iconName: string, className = "w-16 h-16") => {
    switch (iconName) {
      case 'sun':
        return <Sun className={`${className} text-amber-400 animate-spin-slow`} />;
      case 'cloud-sun':
        return <Sun className={`${className} text-amber-300`} />;
      case 'cloud-rain':
        return <CloudRain className={`${className} text-cyan-400 animate-bounce-slow`} />;
      case 'cloud-drizzle':
        return <CloudDrizzle className={`${className} text-blue-400`} />;
      case 'cloud-lightning':
        return <CloudLightning className={`${className} text-purple-400`} />;
      case 'cloud-snow':
        return <CloudSnow className={`${className} text-sky-200`} />;
      default:
        return <Cloud className={`${className} text-slate-300`} />;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800/90 shadow-2xl p-6 sm:p-8 text-white">
      {/* Background Subtle Gradient Overlay based on Weather */}
      <div className={`absolute inset-0 bg-gradient-to-br ${weatherInfo.bgGradient} opacity-30 pointer-events-none`} />

      {/* Top Bar: City Details & Local Time */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium">
            <MapPin className="w-4 h-4" />
            <span>{city.country ? `${city.country}` : 'Global Location'}</span>
            {city.admin1 && <span className="text-slate-400">• {city.admin1}</span>}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-0.5 tracking-tight">
            {city.name}
          </h2>
        </div>

        <div className="flex items-center gap-3 bg-slate-800/60 backdrop-blur border border-slate-700/60 px-4 py-2 rounded-2xl text-xs text-slate-300">
          <Clock className="w-4 h-4 text-cyan-400" />
          <div>
            <div>Updated: <span className="font-semibold text-white">{data.updatedAt}</span></div>
            <div className="text-slate-400 text-[10px]">Timezone: {city.timezone}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Climate (Temperature in °C) & Rain Likelihood Meter */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column (5 cols): Temperature in °C Focus */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="flex items-center gap-5">
            {renderWeatherIcon(weatherInfo.icon, "w-20 h-20 sm:w-24 sm:h-24 filter drop-shadow-md")}
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-6xl sm:text-7xl font-black text-white tracking-tighter">
                  {current.tempC}
                </span>
                <span className="text-3xl sm:text-4xl font-bold text-cyan-400">°C</span>
              </div>
              <div className="text-sm font-medium text-slate-300 mt-1">
                Feels like <span className="font-semibold text-white">{current.feelsLikeC}°C</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-sm font-medium text-slate-200">
              {current.conditionText}
            </span>
          </div>
        </div>

        {/* Right Column (7 cols): PROMINENT LIKELIHOOD OF RAINING GAUGE & ADVISORY */}
        <div className="lg:col-span-7 bg-slate-800/50 backdrop-blur border border-slate-700/70 rounded-2xl p-5 sm:p-6 relative overflow-hidden">
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
                <CloudRain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Likelihood of Raining</h3>
                <p className="text-xs text-slate-400">Real-time precipitation chance</p>
              </div>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${rainRisk.badgeBg}`}>
              {rainRisk.badgeText}
            </span>
          </div>

          {/* Percentage Ring / Progress Meter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            
            {/* Meter Graphic */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-900/60 rounded-xl border border-slate-800 relative">
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* SVG Radial Gauge */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800 stroke-current"
                    strokeWidth="3.5"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`stroke-current ${rainRisk.color} transition-all duration-1000 ease-out`}
                    strokeDasharray={`${current.rainProbability}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className={`text-3xl font-black ${rainRisk.color}`}>
                    {current.rainProbability}%
                  </span>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Rain Chance</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span>Precipitation Rate: <strong className="text-white">{current.precipitationMm} mm/h</strong></span>
              </div>
            </div>

            {/* Advisory Info Box */}
            <div className="flex flex-col justify-between space-y-3">
              <div className={`p-3.5 rounded-xl border ${rainRisk.bgColor} flex items-start gap-3`}>
                {current.rainProbability >= 40 ? (
                  <Umbrella className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Rain Advisory</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {rainRisk.advice}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Cloud Cover</span>
                  <span className="font-bold text-white text-sm">{current.cloudCoverPercent}%</span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Humidity</span>
                  <span className="font-bold text-cyan-400 text-sm">{current.humidity}%</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Bottom Grid: 5 Detailed Climate Indicators */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-800/80">
        
        {/* Humidity */}
        <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Humidity</span>
            <span className="text-lg font-bold text-white">{current.humidity}%</span>
          </div>
        </div>

        {/* Wind Speed */}
        <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Wind Speed</span>
            <span className="text-lg font-bold text-white">{current.windSpeedKmH} <span className="text-xs font-normal text-slate-400">km/h</span></span>
          </div>
        </div>

        {/* UV Index */}
        <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Max UV Index</span>
            <span className="text-lg font-bold text-white">{current.uvIndex} <span className="text-xs font-normal text-slate-400">/ 11</span></span>
          </div>
        </div>

        {/* Pressure */}
        <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Pressure</span>
            <span className="text-lg font-bold text-white">{current.pressureHpa} <span className="text-xs font-normal text-slate-400">hPa</span></span>
          </div>
        </div>

        {/* Cloud Cover */}
        <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Cloudiness</span>
            <span className="text-lg font-bold text-white">{current.cloudCoverPercent}%</span>
          </div>
        </div>

      </div>
    </div>
  );
};
