import React, { useState } from 'react';
import { CloudRain, Clock, AlertTriangle, Droplets, Thermometer, ChevronRight } from 'lucide-react';
import { HourlyForecast } from '../types';

interface RainTimelineProps {
  hourly: HourlyForecast[];
}

export const RainTimeline: React.FC<RainTimelineProps> = ({ hourly }) => {
  const [selectedHour, setSelectedHour] = useState<HourlyForecast | null>(hourly[0] || null);

  // Find peak rain probability hour
  const peakRainHour = hourly.reduce((prev, curr) => 
    (curr.rainProbability > prev.rainProbability) ? curr : prev, hourly[0] || { rainProbability: 0, time: '' }
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl">
      
      {/* Header & Peak Rain Alert */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-white">
            <Clock className="w-5 h-5 text-cyan-400" />
            24-Hour Rain Likelihood & Temperature Timeline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Hourly rain probability (%) and temperature (°C) forecast
          </p>
        </div>

        {/* Peak Rain Highlight Card */}
        {peakRainHour && peakRainHour.rainProbability > 30 ? (
          <div className="bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-2 rounded-2xl flex items-center gap-2.5 text-xs">
            <AlertTriangle className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-slate-300">Peak Rain Chance: </span>
              <strong className="text-cyan-300">{peakRainHour.rainProbability}%</strong> at <span className="font-semibold text-white">{peakRainHour.time}</span> ({peakRainHour.tempC}°C)
            </div>
          </div>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 rounded-2xl flex items-center gap-2 text-xs text-emerald-400">
            <Droplets className="w-4 h-4 shrink-0" />
            <span>Low rain likelihood overall for the next 24 hours.</span>
          </div>
        )}
      </div>

      {/* Hourly Scroll Container */}
      <div className="overflow-x-auto pb-4 no-scrollbar">
        <div className="flex gap-3 min-w-max">
          {hourly.map((item, idx) => {
            const isSelected = selectedHour?.time === item.time;
            
            // Bar color calculation
            let barBg = 'bg-slate-700';
            let barBorder = 'border-slate-600';
            if (item.rainProbability >= 70) {
              barBg = 'bg-gradient-to-t from-red-600 to-orange-500';
              barBorder = 'border-red-400';
            } else if (item.rainProbability >= 40) {
              barBg = 'bg-gradient-to-t from-cyan-600 to-blue-500';
              barBorder = 'border-cyan-400';
            } else if (item.rainProbability >= 20) {
              barBg = 'bg-gradient-to-t from-sky-600 to-cyan-500';
              barBorder = 'border-sky-400';
            }

            return (
              <button
                key={idx}
                onClick={() => setSelectedHour(item)}
                className={`flex flex-col items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 w-20 text-center cursor-pointer ${
                  isSelected 
                    ? 'bg-slate-800 border-cyan-400 ring-2 ring-cyan-400/30 scale-105 shadow-lg' 
                    : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Hour */}
                <span className="text-xs font-semibold text-slate-300">{item.time}</span>

                {/* Rain Probability Height Bar */}
                <div className="w-full h-24 flex flex-col justify-end items-center my-2 relative">
                  <span className="text-[10px] font-bold text-cyan-300 mb-1">
                    {item.rainProbability}%
                  </span>
                  <div className="w-3.5 bg-slate-900 rounded-full h-16 relative overflow-hidden flex flex-col justify-end">
                    <div
                      style={{ height: `${Math.max(item.rainProbability, 6)}%` }}
                      className={`w-full rounded-full transition-all duration-500 ${barBg}`}
                    />
                  </div>
                </div>

                {/* Temperature in °C */}
                <div className="text-xs font-bold text-white flex items-center justify-center gap-0.5">
                  <span>{item.tempC}°</span>
                  <span className="text-[10px] text-cyan-400 font-medium">C</span>
                </div>

                {/* Precip mm */}
                {item.precipitationMm > 0 ? (
                  <span className="text-[9px] text-cyan-400 font-mono mt-1">
                    {item.precipitationMm}mm
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-500 mt-1">Dry</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Hour Details Strip */}
      {selectedHour && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 bg-slate-800/40 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 font-bold">
              {selectedHour.time}
            </div>
            <div>
              <span className="font-semibold text-white text-sm">{selectedHour.conditionText}</span>
              <div className="text-slate-400 text-xs">Detailed hourly metrics forecast</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400">Temp:</span>
              <strong className="text-white font-bold">{selectedHour.tempC}°C</strong>
            </div>

            <div className="flex items-center gap-1.5">
              <CloudRain className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400">Rain Likelihood:</span>
              <strong className="text-cyan-300 font-bold">{selectedHour.rainProbability}%</strong>
            </div>

            <div className="flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span className="text-slate-400">Precip Volume:</span>
              <strong className="text-white font-bold">{selectedHour.precipitationMm} mm</strong>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
