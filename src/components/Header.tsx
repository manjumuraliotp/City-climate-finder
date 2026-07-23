import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Sparkles, Navigation, X, CloudRain, Thermometer } from 'lucide-react';
import { CityResult } from '../types';

interface HeaderProps {
  onSelectCity: (city: CityResult) => void;
  onUseLocation: () => void;
  loadingLocation: boolean;
  selectedCityName: string;
  recentCities: CityResult[];
}

export const Header: React.FC<HeaderProps> = ({
  onSelectCity,
  onUseLocation,
  loadingLocation,
  selectedCityName,
  recentCities,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced Search
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/city-search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Failed to search cities', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city: CityResult) => {
    onSelectCity(city);
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <CloudRain className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  City Climate & Rain Finder
                </h1>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Thermometer className="w-3 h-3 text-cyan-400" /> Exact Temperature (°C) & Rain Probability (%)
                </p>
              </div>
            </div>

            {/* Celsius Unit Badge */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <span>Units:</span>
              <span className="text-white font-bold">°C</span>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative w-full md:w-96" ref={dropdownRef}>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.length >= 2 && setIsOpen(true)}
                placeholder="Search any city globally (e.g. Tokyo, London, Paris)..."
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-9 pr-20 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all shadow-inner"
              />
              {query && (
                <button
                  onClick={() => { setQuery(''); setSuggestions([]); }}
                  className="absolute right-12 p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={onUseLocation}
                disabled={loadingLocation}
                title="Use current geolocation"
                className="absolute right-1.5 p-2 bg-slate-700/60 hover:bg-cyan-600 text-slate-300 hover:text-white rounded-lg transition-all disabled:opacity-50"
              >
                <Navigation className={`w-4 h-4 ${loadingLocation ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {isOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto divide-y divide-slate-700/50">
                {loading ? (
                  <div className="p-4 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    Searching global cities...
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleSelect(city)}
                      className="w-full text-left px-4 py-3 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all flex items-center justify-between text-sm group"
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                        <div>
                          <span className="font-semibold text-slate-100">{city.name}</span>
                          {city.admin1 && <span className="text-slate-400 text-xs ml-1.5">({city.admin1})</span>}
                          <div className="text-xs text-slate-400">{city.country}</div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">
                        {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-slate-400">
                    No cities found matching "{query}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Searches Chips */}
        {recentCities.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs text-slate-400">
            <span className="whitespace-nowrap flex items-center gap-1 font-medium text-slate-500">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Recent:
            </span>
            {recentCities.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectCity(c)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-lg border transition-all ${
                  selectedCityName === c.name
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-medium'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-500 hover:text-white'
                }`}
              >
                {c.name}, {c.countryCode || c.country}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
