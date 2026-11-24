const axios = require('axios');

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // Cache 5 phút

async function fetchWithRetry(url, params, retries = 1) {
  const startTime = Date.now();
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await axios.get(url, {
        params,
        timeout: 8000,
        headers: {
          'User-Agent': 'WeatherApp-Lab4/1.0'
        }
      });
      const duration = Date.now() - startTime;
      console.log(`External API call (${url}) took ${duration}ms`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw error;
      }
      if (i === retries) {
        throw error;
      }
      console.log(`Retrying external API call... (Attempt ${i + 2})`);
    }
  }
}

async function getCoordinatesForCity(city) {
  const data = await fetchWithRetry('https://geocoding-api.open-meteo.com/v1/search', {
    name: city,
    count: 1
  });

  const result = data && data.results && data.results[0];
  if (!result) {
    const err = new Error(`City "${city}" was not found`);
    err.status = 404;
    throw err;
  }

  return {
    latitude: result.latitude,
    longitude: result.longitude,
    resolvedName: result.name,
    country: result.country
  };
}

async function getCurrentWeather(city) {
  const cacheKey = city.trim().toLowerCase();
  const cachedData = cache.get(cacheKey);

  if (cachedData && (Date.now() - cachedData.timestamp < CACHE_TTL)) {
    console.log(`Cache hit for city: ${city}`);
    return { ...cachedData.data, fromCache: true };
  }

  const { latitude, longitude, resolvedName, country } = await getCoordinatesForCity(city);
  const data = await fetchWithRetry('https://api.open-meteo.com/v1/forecast', {
    latitude,
    longitude,
    current_weather: true,
    current: 'temperature_2m,wind_speed_10m'
  });

  // Hỗ trợ cả định dạng current_weather và current của Open-Meteo
  const current = data.current_weather || (data.current ? {
    temperature: data.current.temperature_2m,
    windspeed: data.current.wind_speed_10m,
    time: data.current.time
  } : {});

  const result = {
    city: country ? `${resolvedName}, ${country}` : resolvedName,
    temperatureC: current.temperature !== undefined ? current.temperature : null,
    windSpeedKmh: current.windspeed !== undefined ? current.windspeed : null,
    observedAt: current.time || new Date().toISOString(),
    fromCache: false
  };

  cache.set(cacheKey, { timestamp: Date.now(), data: result });
  return result;
}

module.exports = { getCurrentWeather };
