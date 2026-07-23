import React from 'react';
import { Globe2, MapPin, Sparkles } from 'lucide-react';
import { CityResult } from '../types';

const POPULAR_CITIES: CityResult[] = [
  { id: 2643743, name: 'London', country: 'United Kingdom', countryCode: 'GB', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { id: 1850147, name: 'Tokyo', country: 'Japan', countryCode: 'JP', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
  { id: 5128581, name: 'New York', country: 'United States', countryCode: 'US', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
  { id: 2988507, name: 'Paris', country: 'France', countryCode: 'FR', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
  { id: 1880252, name: 'Singapore', country: 'Singapore', countryCode: 'SG', latitude: 1.3521, longitude: 103.8198, timezone: 'Asia/Singapore' },
  { id: 1275339, name: 'Mumbai', country: 'India', countryCode: 'IN', latitude: 19.0760, longitude: 72.8777, timezone: 'Asia/Kolkata' },
  { id: 2147714, name: 'Sydney', country: 'Australia', countryCode: 'AU', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
  { id: 3413829, name: 'Reykjavik', country: 'Iceland', countryCode: 'IS', latitude: 64.1466, longitude: -21.9426, timezone: 'Atlantic/Reykjavik' },
  { id: 292223, name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
  { id: 3451190, name: 'Rio de Janeiro', country: 'Brazil', countryCode: 'BR', latitude: -22.9068, longitude: -43.1729, timezone: 'America/Sao_Paulo' },
  { id: 360630, name: 'Cairo', country: 'Egypt', countryCode: 'EG', latitude: 30.0444, longitude: 31.2357, timezone: 'Africa/Cairo' },
  { id: 6167865, name: 'Toronto', country: 'Canada', countryCode: 'CA', latitude: 43.6532, longitude: -79.3832, timezone: 'America/Toronto' },
];

interface PopularCitiesProps {
  onSelectCity: (city: CityResult) => void;
  selectedCityName: string;
}

export const PopularCities: React.FC<PopularCitiesProps> = ({ onSelectCity, selectedCityName }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 text-white">
            <Globe2 className="w-5 h-5 text-cyan-400" />
            Explore World Cities
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Quickly check temperature (°C) and rain likelihood (%) for top destinations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {POPULAR_CITIES.map((city) => {
          const isSelected = selectedCityName === city.name;
          return (
            <button
              key={city.id}
              onClick={() => onSelectCity(city)}
              className={`p-3 rounded-2xl border text-left transition-all duration-200 group flex flex-col justify-between ${
                isSelected
                  ? 'bg-cyan-500/20 border-cyan-400 ring-2 ring-cyan-400/30'
                  : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {city.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {city.countryCode}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 truncate mt-1">
                {city.country}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
