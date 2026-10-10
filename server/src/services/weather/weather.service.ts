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

function wmoCodeToCondition(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 67) return 'Rainy';
  if (code <= 77) return 'Snowy';
  if (code <= 82) return 'Rain showers';
  return 'Thunderstorm';
}

function wmoCodeToIcon(code: number): string {
  if (code === 0) return '01d';
  if (code <= 3) return '02d';
  if (code <= 48) return '50d';
  if (code <= 67) return '10d';
  if (code <= 77) return '13d';
  if (code <= 82) return '09d';
  return '11d';
}

export class WeatherService {
  static isConfigured(): boolean {
    return Boolean(env.WEATHER_API_KEY && env.WEATHER_API_KEY.trim() !== '');
  }

  /**
   * Primary: OpenWeatherMap (uses user's configured key)
   * Fallback: Open-Meteo (zero-rate-limit public meteorological service)
   */
  static async getWeather(destination: string): Promise<WeatherResponse> {
    const cleanDestination = destination.trim().split(',')[0].trim();

    // 1. Try OpenWeatherMap if key exists
    if (this.isConfigured()) {
      try {
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
          cleanDestination
        )}&limit=1&appid=${env.WEATHER_API_KEY}`;
        const geoRes = await axios.get(geoUrl, { timeout: 4000 });

        if (geoRes.data && geoRes.data.length > 0) {
          const { lat, lon, name } = geoRes.data[0];

          const [weatherRes, forecastRes] = await Promise.all([
            axios.get(
              `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${env.WEATHER_API_KEY}`,
              { timeout: 4000 }
            ),
            axios.get(
              `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${env.WEATHER_API_KEY}`,
              { timeout: 4000 }
            ),
          ]);

          const current = weatherRes.data;
          const dailyMap = new Map<string, { temps: number[]; conditions: string[]; icon: string }>();

          for (const item of forecastRes.data.list || []) {
            const date = item.dt_txt.split(' ')[0];
            if (!dailyMap.has(date)) {
              dailyMap.set(date, {
                temps: [item.main.temp],
                conditions: [item.weather[0]?.main || 'Clear'],
                icon: item.weather[0]?.icon || '01d',
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
              city: name || cleanDestination,
              currentTemp: Math.round(current.main.temp),
              feelsLike: Math.round(current.main.feels_like),
              condition: current.weather[0]?.description || 'Clear sky',
              humidity: current.main.humidity,
              windSpeed: Math.round(current.wind.speed * 3.6),
              forecast,
            },
          };
        }
      } catch (owmError) {
        console.warn('OpenWeatherMap request failed, seamlessly falling back to Open-Meteo:', owmError instanceof Error ? owmError.message : owmError);
      }
    }

    // 2. High-reliability fallback using Open-Meteo (public meteorological API)
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        cleanDestination
      )}&count=1&language=en&format=json`;
      const geoRes = await axios.get(geoUrl, { timeout: 4000 });

      if (geoRes.data?.results && geoRes.data.results.length > 0) {
        const place = geoRes.data.results[0];
        const { latitude, longitude, name } = place;

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
        const weatherRes = await axios.get(weatherUrl, { timeout: 4000 });
        const wData = weatherRes.data;

        const currentCode = wData.current?.weather_code ?? 0;
        const currentTemp = Math.round(wData.current?.temperature_2m ?? 28);
        const feelsLike = Math.round(wData.current?.apparent_temperature ?? currentTemp);
        const humidity = Math.round(wData.current?.relative_humidity_2m ?? 50);
        const windSpeed = Math.round(wData.current?.wind_speed_10m ?? 10);

        const forecast: WeatherForecastDay[] = (wData.daily?.time || [])
          .slice(0, 5)
          .map((date: string, i: number) => {
            const code = wData.daily?.weather_code?.[i] ?? 0;
            return {
              date,
              tempMax: Math.round(wData.daily?.temperature_2m_max?.[i] ?? currentTemp),
              tempMin: Math.round(wData.daily?.temperature_2m_min?.[i] ?? currentTemp - 5),
              condition: wmoCodeToCondition(code),
              icon: wmoCodeToIcon(code),
            };
          });

        return {
          configured: true,
          data: {
            city: name || cleanDestination,
            currentTemp,
            feelsLike,
            condition: wmoCodeToCondition(currentCode),
            humidity,
            windSpeed,
            forecast,
          },
        };
      }
    } catch (meteoError) {
      console.error('Open-Meteo fallback failed:', meteoError instanceof Error ? meteoError.message : meteoError);
    }

    return {
      configured: false,
      message: `Weather forecast unavailable for "${destination}".`,
    };
  }
}
