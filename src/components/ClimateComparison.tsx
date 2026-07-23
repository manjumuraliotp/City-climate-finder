import React, { useState } from 'react';
import { ArrowLeftRight, CloudRain, Search, Thermometer, Droplets, Wind, MapPin, X } from 'lucide-react';
import { WeatherData, CityResult } from '../types';

interface ClimateComparisonProps {
  primaryData: WeatherData;
}

export const ClimateComparison: React.FC<ClimateComparisonProps> = ({ primaryData }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CityResult[]>([]);
  const [comparingData, setComparingData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/city-search?q=${encodeURIComponent(val)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
        setIsOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectCompareCity = async (city: CityResult) => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setLoading(true);

    try {
      const res = await fetch(`/api/weather?lat=${city.latitude}&lon=${city.longitude}&cityName=${encodeURIComponent(city.name)}&country=${encodeURIComponent(city.country)}`);
      if (res.ok) {
        const data = await res.json();
        setComparingData(data);
      }
    } catch (err) {
      console.error('Failed to load comparison weather', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-white">
            <ArrowLeftRight className="w-5 h-5 text-cyan-400" />
            Compare City Climate & Rain Likelihood
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare temperature in °C and rain probability % side-by-side
          </p>
        </div>

        {/* Search for secondary city */}
        <div className="relative w-full sm:w-72">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Add city to compare..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {isOpen && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-700/50">
              {suggestions.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectCompareCity(c)}
                  className="w-full text-left px-3 py-2.5 hover:bg-cyan-500/10 text-xs flex items-center gap-2 text-slate-200"
                >
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{c.name}, {c.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* City A (Primary Selected) */}
        <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-5 relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">Primary City</span>
              <h4 className="text-xl font-bold text-white">{primaryData.city.name}</h4>
              <p className="text-xs text-slate-400">{primaryData.city.country}</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-white">{primaryData.current.tempC}°C</span>
              <p className="text-xs text-slate-400">{primaryData.current.conditionText}</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5"><CloudRain className="w-3.5 h-3.5 text-cyan-400" /> Rain Probability</span>
              <strong className="text-cyan-300 font-bold">{primaryData.current.rainProbability}%</strong>
            </div>

            <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5 text-blue-400" /> Humidity</span>
              <strong className="text-white font-bold">{primaryData.current.humidity}%</strong>
            </div>

            <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5"><Wind className="w-3.5 h-3.5 text-emerald-400" /> Wind Speed</span>
              <strong className="text-white font-bold">{primaryData.current.windSpeedKmH} km/h</strong>
            </div>
          </div>
        </div>

        {/* City B (Comparing City) */}
        {loading ? (
          <div className="bg-slate-800/30 border border-slate-800/80 rounded-2xl p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            Loading comparison climate data...
          </div>
        ) : comparingData ? (
          <div className="bg-slate-800/50 border border-cyan-500/30 rounded-2xl p-5 relative">
            <button
              onClick={() => setComparingData(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Compared City</span>
                <h4 className="text-xl font-bold text-white">{comparingData.city.name}</h4>
                <p className="text-xs text-slate-400">{comparingData.city.country}</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-extrabold text-white">{comparingData.current.tempC}°C</span>
                <p className="text-xs text-slate-400">{comparingData.current.conditionText}</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5"><CloudRain className="w-3.5 h-3.5 text-cyan-400" /> Rain Probability</span>
                <strong className="text-cyan-300 font-bold">{comparingData.current.rainProbability}%</strong>
              </div>

              <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5 text-blue-400" /> Humidity</span>
                <strong className="text-white font-bold">{comparingData.current.humidity}%</strong>
              </div>

              <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5"><Wind className="w-3.5 h-3.5 text-emerald-400" /> Wind Speed</span>
                <strong className="text-white font-bold">{comparingData.current.windSpeedKmH} km/h</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/20 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <ArrowLeftRight className="w-8 h-8 text-slate-600 mb-1" />
            <span className="text-sm font-semibold text-slate-300">Compare with another city</span>
            <span className="text-xs text-slate-500 max-w-xs">Use the search box above to add a second city for direct comparison.</span>
          </div>
        )}

      </div>
    </div>
  );
};
