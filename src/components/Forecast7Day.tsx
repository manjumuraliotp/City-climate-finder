import React from 'react';
import { Calendar, CloudRain, Sun, Thermometer, Droplets } from 'lucide-react';
import { DailyForecast } from '../types';

interface Forecast7DayProps {
  daily: DailyForecast[];
}

export const Forecast7Day: React.FC<Forecast7DayProps> = ({ daily }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-white">
            <Calendar className="w-5 h-5 text-cyan-400" />
            7-Day Climate & Rain Forecast
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Daily max/min temperature in °C and maximum rain likelihood (%)
          </p>
        </div>

        <div className="text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full font-medium">
          Degrees Celsius (°C)
        </div>
      </div>

      <div className="space-y-3">
        {daily.map((item, idx) => {
          // Rain likelihood level color
          let probColor = 'text-slate-400 bg-slate-800 border-slate-700';
          if (item.rainProbabilityMax >= 70) {
            probColor = 'text-red-300 bg-red-500/20 border-red-500/40';
          } else if (item.rainProbabilityMax >= 40) {
            probColor = 'text-cyan-300 bg-cyan-500/20 border-cyan-500/40';
          } else if (item.rainProbabilityMax >= 20) {
            probColor = 'text-sky-300 bg-sky-500/15 border-sky-500/30';
          }

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                idx === 0 
                  ? 'bg-slate-800/80 border-cyan-500/40 shadow-md ring-1 ring-cyan-500/20' 
                  : 'bg-slate-800/40 border-slate-800/80 hover:bg-slate-800/60'
              }`}
            >
              {/* Day & Date */}
              <div className="w-32">
                <span className="font-bold text-white text-base block">{item.dayName}</span>
                <span className="text-xs text-slate-400">{item.date}</span>
              </div>

              {/* Condition */}
              <div className="flex-1 text-xs text-slate-300 flex items-center gap-2">
                <span className="font-medium text-slate-200">{item.conditionText}</span>
              </div>

              {/* Rain Likelihood Badge */}
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${probColor}`}>
                  <CloudRain className="w-3.5 h-3.5" />
                  <span>Rain: {item.rainProbabilityMax}%</span>
                  {item.precipitationTotalMm > 0 && (
                    <span className="text-[10px] opacity-80">({item.precipitationTotalMm}mm)</span>
                  )}
                </div>

                {/* Temp Max / Min °C */}
                <div className="flex items-center gap-2 text-sm w-36 justify-end font-mono">
                  <span className="font-bold text-white">{item.tempMaxC}°C</span>
                  <span className="text-slate-500">/</span>
                  <span className="text-slate-400">{item.tempMinC}°C</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
