import axios from 'axios';
import { env } from '../../config/env.js';

export interface WeatherForecastDay {
  date: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  icon: string;
}

export interface WeatherData {
  city: string;
  currentTemp: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: WeatherForecastDay[];
}

export interface WeatherResponse {
  configured: boolean;
  message?: string;
  data?: WeatherData;
}

export class WeatherService {
  static isConfigured(): boolean {
    return Boolean(env.WEATHER_API_KEY && env.WEATHER_API_KEY.trim() !== '');
  }

  static async getWeather(destination: string): Promise<WeatherResponse> {
    if (!this.isConfigured()) {
      return {
        configured: false,
        message: 'Weather service is not configured. Add WEATHER_API_KEY (OpenWeatherMap API key) to your .env to see real-time forecasts.',
      };
    }

    try {
      // Call OpenWeatherMap 5 day / 3 hour forecast API
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
        destination
      )}&limit=1&appid=${env.WEATHER_API_KEY}`;
      
      const geoRes = await axios.get(geoUrl, { timeout: 5000 });
      if (!geoRes.data || geoRes.data.length === 0) {
        return {
          configured: true,
          message: `Location "${destination}" not found by weather provider.`,
        };
      }

      const { lat, lon, name } = geoRes.data[0];

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${env.WEATHER_API_KEY}`;
      const weatherRes = await axios.get(weatherUrl, { timeout: 5000 });
      const current = weatherRes.data;

      // Also fetch 5 day forecast
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${env.WEATHER_API_KEY}`;
      const forecastRes = await axios.get(forecastUrl, { timeout: 5000 });

      // Group forecast daily
      const dailyMap = new Map<string, { temps: number[]; conditions: string[]; icon: string }>();
      for (const item of forecastRes.data.list || []) {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyMap.has(date)) {
          dailyMap.set(date, {
            temps: [item.main.temp],
            conditions: [item.weather[0].main],
            icon: item.weather[0].icon,
          });
        } else {
          dailyMap.get(date)!.temps.push(item.main.temp);
        }
      }

      const forecast: WeatherForecastDay[] = Array.from(dailyMap.entries())
        .slice(0, 5)
        .map(([date, val]) => ({
          date,
          tempMax: Math.round(Math.max(...val.temps)),
          tempMin: Math.round(Math.min(...val.temps)),
          condition: val.conditions[0],
          icon: val.icon,
        }));

      return {
        configured: true,
        data: {
          city: name,
          currentTemp: Math.round(current.main.temp),
          feelsLike: Math.round(current.main.feels_like),
          condition: current.weather[0]?.description || 'Clear',
          humidity: current.main.humidity,
          windSpeed: Math.round(current.wind.speed * 3.6), // convert m/s to km/h
          forecast,
        },
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Weather lookup failed';
      return {
        configured: true,
        message: `Weather service error: ${msg}`,
      };
    }
  }
}
