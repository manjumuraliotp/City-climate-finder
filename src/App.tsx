import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { CurrentClimate } from './components/CurrentClimate';
import { RainTimeline } from './components/RainTimeline';
import { Forecast7Day } from './components/Forecast7Day';
import { AiClimateAnalysis } from './components/AiClimateAnalysis';
import { PopularCities } from './components/PopularCities';
import { ClimateComparison } from './components/ClimateComparison';
import { CityResult, WeatherData } from './types';
import { CloudRain, AlertCircle, RefreshCw } from 'lucide-react';

const DEFAULT_CITY: CityResult = {
  id: 2643743,
  name: 'London',
  country: 'United Kingdom',
  countryCode: 'GB',
  latitude: 51.5074,
  longitude: -0.1278,
  timezone: 'Europe/London',
};

const RECENT_STORAGE_KEY = 'city_climate_recent_cities_v1';

export default function App() {
  const [selectedCity, setSelectedCity] = useState<CityResult>(DEFAULT_CITY);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);
  const [recentCities, setRecentCities] = useState<CityResult[]>([]);

  // Load Recent Cities from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_STORAGE_KEY);
      if (saved) {
        setRecentCities(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse recent cities', e);
    }
  }, []);

  // Save city to recent list
  const saveRecentCity = useCallback((city: CityResult) => {
    setRecentCities((prev) => {
      const filtered = prev.filter((c) => c.id !== city.id && c.name.toLowerCase() !== city.name.toLowerCase());
      const updated = [city, ...filtered].slice(0, 6);
      try {
        localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  }, []);

  // Fetch Weather Data for selected city
  const fetchWeather = useCallback(async (city: CityResult) => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/weather?lat=${city.latitude}&lon=${city.longitude}&cityName=${encodeURIComponent(city.name)}&country=${encodeURIComponent(city.country || '')}&admin1=${encodeURIComponent(city.admin1 || '')}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch weather data.');
      }
      const data: WeatherData = await response.json();
      setWeatherData(data);
      setSelectedCity(data.city);
      saveRecentCity(data.city);
    } catch (err: any) {
      console.error('Error fetching weather:', err);
      setError(err.message || 'Unable to load climate and rain forecast for this city.');
    } finally {
      setLoading(false);
    }
  }, [saveRecentCity]);

  // Initial Fetch
  useEffect(() => {
    fetchWeather(selectedCity);
  }, []);

  // Handle Select City from search or chips
  const handleSelectCity = (city: CityResult) => {
    setSelectedCity(city);
    fetchWeather(city);
  };

  // Handle Geolocation Lookup
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse lookup or custom location object
          const locationCity: CityResult = {
            id: Math.round(latitude * 1000 + longitude),
            name: 'My Current Location',
            country: 'Detected via GPS',
            latitude,
            longitude,
          };
          await fetchWeather(locationCity);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingLocation(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setLoadingLocation(false);
        alert('Could not detect location. Please search for your city manually.');
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col">
      
      {/* Sticky Navigation Header */}
      <Header
        onSelectCity={handleSelectCity}
        onUseLocation={handleUseLocation}
        loadingLocation={loadingLocation}
        selectedCityName={selectedCity.name}
        recentCities={recentCities}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {loading && !weatherData ? (
          /* Loading Skeleton */
          <div className="space-y-6 animate-pulse">
            <div className="h-96 bg-slate-900 rounded-3xl border border-slate-800" />
            <div className="h-64 bg-slate-900 rounded-3xl border border-slate-800" />
            <div className="h-64 bg-slate-900 rounded-3xl border border-slate-800" />
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-8 text-center max-w-lg mx-auto my-12">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Weather Data Unavailable</h3>
            <p className="text-sm text-slate-400 mb-6">{error}</p>
            <button
              onClick={() => fetchWeather(selectedCity)}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" /> Retry Lookup
            </button>
          </div>
        ) : weatherData ? (
          <>
            {/* 1. Main Current Climate (°C) & Rain Likelihood Meter */}
            <CurrentClimate
              data={weatherData}
              onRefresh={() => fetchWeather(selectedCity)}
            />

            {/* 2. 24-Hour Rain Likelihood & Temp Timeline */}
            <RainTimeline hourly={weatherData.hourly} />

            {/* 3. AI Climate & Rain Risk Insights */}
            <AiClimateAnalysis weatherData={weatherData} />

            {/* 4. 7-Day Extended Forecast */}
            <Forecast7Day daily={weatherData.daily} />

            {/* 5. Compare Climate Side-By-Side */}
            <ClimateComparison primaryData={weatherData} />

            {/* 6. Popular Global Cities Quick Select */}
            <PopularCities
              onSelectCity={handleSelectCity}
              selectedCityName={selectedCity.name}
            />
          </>
        ) : null}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">City Climate & Rain Finder</span>
            <span>— Temperature in Celsius (°C) & Rain Likelihood (%)</span>
          </div>
          <div>
            Powered by Open-Meteo Weather Engine & Gemini AI
          </div>
        </div>
      </footer>

    </div>
  );
}
