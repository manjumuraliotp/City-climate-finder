export interface CityResult {
  id: number;
  name: string;
  country: string;
  countryCode?: string;
  admin1?: string; // State or region
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone?: string;
}

export interface HourlyForecast {
  time: string; // ISO string or format e.g. "14:00"
  tempC: number;
  rainProbability: number; // percentage 0 - 100
  precipitationMm: number; // in mm
  weatherCode: number;
  conditionText: string;
}

export interface DailyForecast {
  date: string; // YYYY-MM-DD
  dayName: string; // e.g. "Thu", "Fri"
  tempMaxC: number;
  tempMinC: number;
  rainProbabilityMax: number; // percentage
  precipitationTotalMm: number;
  weatherCode: number;
  conditionText: string;
  uvIndexMax?: number;
}

export interface WeatherData {
  city: CityResult;
  current: {
    tempC: number;
    feelsLikeC: number;
    humidity: number;
    windSpeedKmH: number;
    windDirectionDeg: number;
    uvIndex: number;
    pressureHpa: number;
    cloudCoverPercent: number;
    rainProbability: number; // Current hour rain chance %
    precipitationMm: number;
    weatherCode: number;
    conditionText: string;
    isDay: boolean;
  };
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  updatedAt: string;
}

export interface AiClimateInsights {
  rainRiskVerdict: string; // e.g. "Heavy Rain Likely - Bring Waterproof Gear"
  umbrellaNeeded: boolean;
  outdoorActivityScore: number; // 0 to 100
  activityAdvice: string;
  clothingTip: string;
  seasonalProfile: {
    typicalClimateDescription: string;
    rainiestMonths: string[];
    averageAnnualTempC: string;
    bestTravelMonths: string[];
  };
  funFact: string;
}
