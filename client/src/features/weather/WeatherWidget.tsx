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
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWeather = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await api.get(`/weather?destination=${encodeURIComponent(destination)}`);
      if (res.data.success) {
        setIsConfigured(res.data.data.configured);
        if (res.data.data.data) {
          setWeatherData(res.data.data.data);
        } else if (res.data.data.message) {
          setErrorMessage(res.data.data.message);
        }
      }
    } catch (err) {
      setIsConfigured(false);
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
        <Badge variant={isConfigured && weatherData ? 'success' : isConfigured ? 'info' : 'outline'}>
          {isConfigured && weatherData
            ? 'Live Forecast'
            : isConfigured
            ? 'Key Configured'
            : 'Weather API Unconfigured'}
        </Badge>
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
        ) : isConfigured && weatherData ? (
          /* Live Weather Data from OpenWeatherMap */
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
                <span>Humidity: <strong>{weatherData.humidity}%</strong></span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-slate-600">
                <Wind className="w-3.5 h-3.5 text-teal-500" />
                <span>Wind: <strong>{weatherData.windSpeed} km/h</strong></span>
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
                      <p className="text-[10px] text-slate-400 font-medium">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <p className="text-xs font-bold text-slate-800 my-0.5">
                        {day.tempMax}°
                      </p>
                      <p className="text-[9px] text-slate-500 truncate">
                        {day.condition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : isConfigured ? (
          /* Key Configured, Waiting for Activation or Provider Response */
          <div className="py-6 px-4 rounded-xl bg-blue-50/50 border border-blue-100 text-center space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-brand-600 flex items-center justify-center mx-auto">
              <CloudSun className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Weather API Key Configured</h4>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                {errorMessage || 'OpenWeatherMap key is configured. If newly registered, OpenWeatherMap keys typically take 10-30 minutes to activate globally.'}
              </p>
            </div>
            <div className="pt-1 flex items-center justify-center gap-2">
              <button
                onClick={fetchWeather}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-brand-600 hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Check Again</span>
              </button>
              <a
                href={`https://www.google.com/search?q=weather+in+${encodeURIComponent(destination)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <span>Live on Google</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          /* Unconfigured State */
          <div className="py-6 px-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <CloudSun className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Weather API Not Configured</h4>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                Real-time temperatures and forecasts require <code>WEATHER_API_KEY</code> in the server <code>.env</code> file.
              </p>
            </div>
            <div className="pt-1">
              <a
                href={`https://www.google.com/search?q=weather+in+${encodeURIComponent(destination)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-brand-600 hover:bg-slate-50 transition-colors"
              >
                <span>Check live weather on Google</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
