import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { CloudSun, Wind, Droplets, ExternalLink, RefreshCw } from 'lucide-react';
import { WeatherData } from '../../types/index.js';

interface WeatherWidgetProps {
  destination: string;
}

export function WeatherWidget({ destination }: WeatherWidgetProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchWeather = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await api.get(`/weather?destination=${encodeURIComponent(destination)}`);
      if (res.data.success) {
        if (res.data.data.data) {
          setWeatherData(res.data.data.data);
        } else {
          setErrorMessage(res.data.data.message || 'Forecast temporarily unavailable');
        }
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.error?.message || 'Unable to connect to weather service'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (destination) {
      fetchWeather();
    }
  }, [destination]);

  return (
    <Card className="border-slate-200/80 shadow-subtle overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CloudSun className="w-4 h-4 text-amber-500" />
          <CardTitle className="text-sm">Destination Weather</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={weatherData ? 'success' : 'outline'} className="text-[10px]">
            {weatherData ? 'Live Forecast' : 'Weather Sync'}
          </Badge>
          <button
            onClick={fetchWeather}
            disabled={isLoading}
            title="Refresh Weather"
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-3 gap-2 pt-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ) : weatherData ? (
          /* Live Weather Data from OpenWeatherMap / Open-Meteo */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {weatherData.currentTemp}°C
                </span>
                <p className="text-xs font-medium text-slate-500 capitalize">
                  {weatherData.condition} • Feels like {weatherData.feelsLike}°C
                </p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{weatherData.city}</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-slate-600">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                <span>
                  Humidity: <strong>{weatherData.humidity}%</strong>
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-slate-600">
                <Wind className="w-3.5 h-3.5 text-teal-500" />
                <span>
                  Wind: <strong>{weatherData.windSpeed} km/h</strong>
                </span>
              </div>
            </div>

            {/* 5-day daily forecast */}
            {weatherData.forecast && weatherData.forecast.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  5-Day Trend
                </p>
                <div className="grid grid-cols-5 gap-1 text-center">
                  {weatherData.forecast.map((day, idx) => (
                    <div key={idx} className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-500 block">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="text-xs font-bold text-slate-800 block my-0.5">
                        {day.tempMax}°
                      </span>
                      <span className="text-[9px] text-slate-400 capitalize block truncate">
                        {day.condition}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Graceful Fallback with Instant Retry & External Link */
          <div className="py-6 px-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <CloudSun className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Weather Forecast</h4>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                {errorMessage || `Click below to load live weather conditions for ${destination}.`}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
              <button
                onClick={fetchWeather}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Weather</span>
              </button>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(
                  `weather in ${destination}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span>Google Weather</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
