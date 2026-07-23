import React, { useEffect, useState } from 'react';
import { Sparkles, Umbrella, Compass, Shirt, Sun, Calendar, Info, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { WeatherData, AiClimateInsights } from '../types';

interface AiClimateAnalysisProps {
  weatherData: WeatherData;
}

export const AiClimateAnalysis: React.FC<AiClimateAnalysisProps> = ({ weatherData }) => {
  const [insights, setInsights] = useState<AiClimateInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchAiInsights = async () => {
      setLoading(true);
      setError(false);
      try {
        const { city, current, daily } = weatherData;
        const res = await fetch('/api/ai-climate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cityName: city.name,
            country: city.country,
            tempC: current.tempC,
            rainProbability: current.rainProbability,
            humidity: current.humidity,
            windSpeed: current.windSpeedKmH,
            conditionText: current.conditionText,
            dailyMaxRain: daily[0]?.rainProbabilityMax || current.rainProbability,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) setInsights(data);
        } else {
          if (isMounted) setError(true);
        }
      } catch (err) {
        console.error('Failed to load AI climate insights', err);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAiInsights();
    return () => { isMounted = false; };
  }, [weatherData.city.id, weatherData.current.tempC, weatherData.current.rainProbability]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl text-white shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Gemini AI Climate & Rain Analysis
            </h3>
            <p className="text-xs text-slate-400">
              Intelligent climate profiling & rain recommendations for {weatherData.city.name}
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          Powered by Gemini AI
        </span>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">Analyzing local climate patterns & rain likelihood for {weatherData.city.name}...</p>
        </div>
      ) : insights ? (
        <div className="space-y-6">
          
          {/* Top Alert: Rain Verdict & Umbrella Check */}
          <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            insights.umbrellaNeeded 
              ? 'bg-cyan-500/10 border-cyan-500/30' 
              : 'bg-emerald-500/10 border-emerald-500/30'
          }`}>
            <div className="flex items-start gap-3.5">
              <div className={`p-3 rounded-xl shrink-0 ${
                insights.umbrellaNeeded ? 'bg-cyan-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
              }`}>
                <Umbrella className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Rain Verdict</h4>
                <p className="text-sm text-slate-200 mt-0.5 leading-relaxed font-medium">
                  {insights.rainRiskVerdict}
                </p>
              </div>
            </div>

            <div className="shrink-0 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 text-xs text-center w-full sm:w-auto">
              <span className="text-slate-400 block text-[10px]">Umbrella Status</span>
              <span className={`font-bold text-sm ${insights.umbrellaNeeded ? 'text-cyan-300' : 'text-emerald-400'}`}>
                {insights.umbrellaNeeded ? '☔ Yes, Carry Umbrella' : '☀️ No Umbrella Needed'}
              </span>
            </div>
          </div>

          {/* Activity Score & Clothing Tip Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Outdoor Activity Suitability */}
            <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-cyan-400" /> Outdoor Activity Rating
                </span>
                <span className="text-sm font-black text-cyan-300">{insights.outdoorActivityScore} / 100</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden mb-3">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-700" 
                  style={{ width: `${insights.outdoorActivityScore}%` }}
                />
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {insights.activityAdvice}
              </p>
            </div>

            {/* Clothing & Attire Tip */}
            <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                <Shirt className="w-4 h-4 text-amber-400" /> Clothing & Attire Tip ({weatherData.current.tempC}°C)
              </span>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                {insights.clothingTip}
              </p>
            </div>

          </div>

          {/* Seasonal Profile Box */}
          <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Seasonal Climate Profile for {weatherData.city.name}
            </h4>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              {insights.seasonalProfile?.typicalClimateDescription || `${weatherData.city.name} experiences a variable climate throughout the year.`}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Rainiest Months</span>
                <span className="font-semibold text-cyan-300 mt-0.5 block">
                  {insights.seasonalProfile?.rainiestMonths?.join(', ') || 'Seasonal Monsoons'}
                </span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Annual Temp Range</span>
                <span className="font-semibold text-amber-300 mt-0.5 block">
                  {insights.seasonalProfile?.averageAnnualTempC || '10°C to 28°C'}
                </span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Best Travel Months</span>
                <span className="font-semibold text-emerald-300 mt-0.5 block">
                  {insights.seasonalProfile?.bestTravelMonths?.join(', ') || 'Spring & Autumn'}
                </span>
              </div>
            </div>
          </div>

          {/* Local Fun Fact */}
          {insights.funFact && (
            <div className="bg-cyan-500/5 border border-cyan-500/20 p-4 rounded-2xl text-xs text-slate-300 flex items-start gap-3">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-cyan-300 font-semibold block mb-0.5">Microclimate Insight</strong>
                {insights.funFact}
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="text-center py-6 text-slate-400 text-xs">
          AI climate analysis unavailable at this moment.
        </div>
      )}
    </div>
  );
};
