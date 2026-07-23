import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client lazily or safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. City Search Geocoding Endpoint
app.get("/api/city-search", async (req, res) => {
  try {
    const query = (req.query.q as string || "").trim();
    if (!query || query.length < 2) {
      return res.json([]);
    }

    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
    const response = await fetch(geoUrl);
    if (!response.ok) {
      throw new Error(`Geocoding error ${response.status}`);
    }
    const data = await response.json();

    const results = (data.results || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      country: item.country || "",
      countryCode: item.country_code || "",
      admin1: item.admin1 || "",
      latitude: item.latitude,
      longitude: item.longitude,
      elevation: item.elevation,
      timezone: item.timezone || "UTC",
    }));

    return res.json(results);
  } catch (error: any) {
    console.error("City search failed:", error);
    return res.status(500).json({ error: "Failed to search cities." });
  }
});

// 2. Weather & Rain Likelihood Endpoint
app.get("/api/weather", async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);
    const cityName = (req.query.cityName as string) || "Location";
    const country = (req.query.country as string) || "";
    const admin1 = (req.query.admin1 as string) || "";

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: "Invalid coordinates." });
    }

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,uv_index_max&timezone=auto&forecast_days=7`;

    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) {
      throw new Error(`Weather API error ${weatherRes.status}`);
    }
    const raw = await weatherRes.json();

    // Map Current Weather
    const current = raw.current || {};
    const hourlyRaw = raw.hourly || {};
    const dailyRaw = raw.daily || {};

    // Get immediate or max current rain probability from next 3 hours
    const nextFewHoursProb = (hourlyRaw.precipitation_probability || []).slice(0, 3);
    const maxNextHoursProb = nextFewHoursProb.length ? Math.max(...nextFewHoursProb) : 0;

    // Process 24-hour hourly forecast
    const currentIdx = 0; // Starts from current hour
    const hourly = [];
    const hourlyTimes = hourlyRaw.time || [];
    const hourlyTemps = hourlyRaw.temperature_2m || [];
    const hourlyProbs = hourlyRaw.precipitation_probability || [];
    const hourlyPrecip = hourlyRaw.precipitation || [];
    const hourlyCodes = hourlyRaw.weather_code || [];

    for (let i = currentIdx; i < Math.min(hourlyTimes.length, currentIdx + 24); i++) {
      const timeStr = hourlyTimes[i];
      const hourDate = new Date(timeStr);
      const timeFormatted = hourDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

      hourly.push({
        time: timeFormatted,
        tempC: Math.round(hourlyTemps[i] ?? 0),
        rainProbability: Math.round(hourlyProbs[i] ?? 0),
        precipitationMm: Number((hourlyPrecip[i] ?? 0).toFixed(1)),
        weatherCode: hourlyCodes[i] ?? 0,
        conditionText: getWmoCondition(hourlyCodes[i] ?? 0),
      });
    }

    // Process 7-day daily forecast
    const daily = [];
    const dailyDates = dailyRaw.time || [];
    const dailyCodes = dailyRaw.weather_code || [];
    const dailyMaxTemps = dailyRaw.temperature_2m_max || [];
    const dailyMinTemps = dailyRaw.temperature_2m_min || [];
    const dailyMaxProbs = dailyRaw.precipitation_probability_max || [];
    const dailyPrecipSums = dailyRaw.precipitation_sum || [];
    const dailyUvs = dailyRaw.uv_index_max || [];

    for (let i = 0; i < dailyDates.length; i++) {
      const d = new Date(dailyDates[i] + 'T00:00:00');
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      daily.push({
        date: dailyDates[i],
        dayName: i === 0 ? 'Today' : dayName,
        tempMaxC: Math.round(dailyMaxTemps[i] ?? 0),
        tempMinC: Math.round(dailyMinTemps[i] ?? 0),
        rainProbabilityMax: Math.round(dailyMaxProbs[i] ?? 0),
        precipitationTotalMm: Number((dailyPrecipSums[i] ?? 0).toFixed(1)),
        weatherCode: dailyCodes[i] ?? 0,
        conditionText: getWmoCondition(dailyCodes[i] ?? 0),
        uvIndexMax: Math.round(dailyUvs[i] ?? 0),
      });
    }

    const currentRainProb = Math.max(
      Math.round(hourlyProbs[0] ?? 0),
      maxNextHoursProb
    );

    const result = {
      city: {
        id: Math.round(lat * 1000 + lon),
        name: cityName,
        country: country,
        admin1: admin1,
        latitude: lat,
        longitude: lon,
        timezone: raw.timezone || "UTC",
      },
      current: {
        tempC: Math.round(current.temperature_2m ?? 0),
        feelsLikeC: Math.round(current.apparent_temperature ?? 0),
        humidity: Math.round(current.relative_humidity_2m ?? 0),
        windSpeedKmH: Math.round(current.wind_speed_10m ?? 0),
        windDirectionDeg: Math.round(current.wind_direction_10m ?? 0),
        uvIndex: daily[0]?.uvIndexMax || 0,
        pressureHpa: Math.round(current.pressure_msl ?? 1013),
        cloudCoverPercent: Math.round(current.cloud_cover ?? 0),
        rainProbability: currentRainProb,
        precipitationMm: Number((current.precipitation ?? 0).toFixed(1)),
        weatherCode: current.weather_code ?? 0,
        conditionText: getWmoCondition(current.weather_code ?? 0),
        isDay: current.is_day === 1,
      },
      hourly,
      daily,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    return res.json(result);
  } catch (error: any) {
    console.error("Weather fetch failed:", error);
    return res.status(500).json({ error: "Failed to load weather data." });
  }
});

// 3. AI Climate Insights Endpoint
app.post("/api/ai-climate", async (req, res) => {
  try {
    const { cityName, country, tempC, rainProbability, humidity, windSpeed, conditionText, dailyMaxRain } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback response if API key is not present or configured yet
      return res.json({
        rainRiskVerdict: rainProbability > 50 
          ? `High chance of rain (${rainProbability}%) in ${cityName}. Carry an umbrella!`
          : `Low chance of rain (${rainProbability}%) in ${cityName}. Enjoy pleasant weather!`,
        umbrellaNeeded: rainProbability > 40,
        outdoorActivityScore: rainProbability > 60 ? 35 : 85,
        activityAdvice: rainProbability > 50 
          ? "Consider indoor activities, cafes, or museum visits during rain showers." 
          : "Great conditions for outdoor walks, sports, or sightseeing.",
        clothingTip: tempC < 15 
          ? "Wear layered warm clothing with a jacket." 
          : "Light clothing with a breathable rain shell or windbreaker.",
        seasonalProfile: {
          typicalClimateDescription: `${cityName} experiences variable climate with temperature around ${tempC}°C and humidity at ${humidity}%.`,
          rainiestMonths: ["July", "August", "November"],
          averageAnnualTempC: `${Math.round(tempC - 2)}°C to ${Math.round(tempC + 6)}°C`,
          bestTravelMonths: ["April", "May", "September", "October"],
        },
        funFact: `${cityName}'s local topography significantly influences its precipitation patterns and daily microclimate!`,
      });
    }

    const prompt = `You are an expert meteorologist and climate advisor.
Analyze the following weather data for ${cityName}, ${country || ''}:
- Current Temperature: ${tempC}°C
- Current Rain Likelihood (Probability): ${rainProbability}%
- Today's Max Rain Likelihood: ${dailyMaxRain || rainProbability}%
- Condition: ${conditionText}
- Humidity: ${humidity}%
- Wind Speed: ${windSpeed} km/h

Provide a JSON object summarizing climate insights with these exact keys:
1. "rainRiskVerdict": A concise, clear 1-sentence assessment of rain likelihood and recommendation.
2. "umbrellaNeeded": boolean (true if rain probability > 40% or rain condition expected, false otherwise).
3. "outdoorActivityScore": number from 0 to 100 (where 100 is perfect outdoor weather).
4. "activityAdvice": 1-2 sentence recommendation on outdoor vs indoor planning.
5. "clothingTip": What to wear based on current ${tempC}°C temperature and rain probability.
6. "seasonalProfile": an object with:
   - "typicalClimateDescription": short description of ${cityName}'s climate style (e.g. Oceanic, Mediterranean, Tropical, Continental).
   - "rainiestMonths": array of 2-3 months that are historically rainiest in ${cityName}.
   - "averageAnnualTempC": typical temperature range in °C annually for ${cityName}.
   - "bestTravelMonths": array of 2-3 pleasant travel months for ${cityName}.
7. "funFact": A fascinating, unique climate or weather fact about ${cityName}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rainRiskVerdict: { type: Type.STRING },
            umbrellaNeeded: { type: Type.BOOLEAN },
            outdoorActivityScore: { type: Type.NUMBER },
            activityAdvice: { type: Type.STRING },
            clothingTip: { type: Type.STRING },
            seasonalProfile: {
              type: Type.OBJECT,
              properties: {
                typicalClimateDescription: { type: Type.STRING },
                rainiestMonths: { type: Type.ARRAY, items: { type: Type.STRING } },
                averageAnnualTempC: { type: Type.STRING },
                bestTravelMonths: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
            funFact: { type: Type.STRING },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const defaultSeasonal = {
      typicalClimateDescription: `${cityName} experiences a distinct regional climate with average temperatures around ${tempC}°C.`,
      rainiestMonths: ["July", "August", "November"],
      averageAnnualTempC: `${Math.round(tempC - 4)}°C to ${Math.round(tempC + 5)}°C`,
      bestTravelMonths: ["April", "May", "September", "October"],
    };

    const normalized = {
      rainRiskVerdict: parsed.rainRiskVerdict || `Weather check complete for ${cityName}.`,
      umbrellaNeeded: typeof parsed.umbrellaNeeded === 'boolean' ? parsed.umbrellaNeeded : (rainProbability > 40),
      outdoorActivityScore: typeof parsed.outdoorActivityScore === 'number' ? parsed.outdoorActivityScore : (rainProbability > 60 ? 35 : 85),
      activityAdvice: parsed.activityAdvice || "Plan activities according to current precipitation forecasts.",
      clothingTip: parsed.clothingTip || "Dress comfortably for current temperature in Celsius.",
      seasonalProfile: {
        typicalClimateDescription: parsed.seasonalProfile?.typicalClimateDescription || defaultSeasonal.typicalClimateDescription,
        rainiestMonths: Array.isArray(parsed.seasonalProfile?.rainiestMonths) ? parsed.seasonalProfile.rainiestMonths : defaultSeasonal.rainiestMonths,
        averageAnnualTempC: parsed.seasonalProfile?.averageAnnualTempC || defaultSeasonal.averageAnnualTempC,
        bestTravelMonths: Array.isArray(parsed.seasonalProfile?.bestTravelMonths) ? parsed.seasonalProfile.bestTravelMonths : defaultSeasonal.bestTravelMonths,
      },
      funFact: parsed.funFact || `${cityName}'s location influences its daily microclimate and rainfall patterns.`,
    };

    return res.json(normalized);
  } catch (error: any) {
    console.error("AI Climate error:", error);
    // Fallback response
    return res.json({
      rainRiskVerdict: "Live weather check complete.",
      umbrellaNeeded: req.body.rainProbability > 40,
      outdoorActivityScore: 70,
      activityAdvice: "Check local hourly rain timeline for optimal outdoor timing.",
      clothingTip: "Dress comfortably for current temperature in Celsius.",
      seasonalProfile: {
        typicalClimateDescription: "Local climate profile based on regional geographical weather patterns.",
        rainiestMonths: ["Monsoon/Autumn periods"],
        averageAnnualTempC: "10°C to 28°C",
        bestTravelMonths: ["Spring", "Early Autumn"],
      },
      funFact: "Precipitation probability measures the likelihood of measurable rainfall occurring in the location.",
    });
  }
});

function getWmoCondition(code: number): string {
  switch (code) {
    case 0: return 'Clear Sky';
    case 1: return 'Mainly Clear';
    case 2: return 'Partly Cloudy';
    case 3: return 'Overcast';
    case 45: case 48: return 'Foggy';
    case 51: return 'Light Drizzle';
    case 53: return 'Moderate Drizzle';
    case 55: return 'Dense Drizzle';
    case 61: return 'Slight Rain';
    case 63: return 'Moderate Rain';
    case 65: return 'Heavy Rain';
    case 80: case 81: case 82: return 'Rain Showers';
    case 95: case 96: case 99: return 'Thunderstorm';
    case 71: case 73: case 75: case 77: case 85: case 86: return 'Snowfall';
    default: return 'Cloudy';
  }
}

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
