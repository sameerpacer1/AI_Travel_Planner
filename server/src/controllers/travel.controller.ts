import { Request, Response, NextFunction } from 'express';
import { WeatherService } from '../services/weather/weather.service.js';
import { MapsService } from '../services/maps/maps.service.js';
import { GeminiService } from '../services/ai/gemini.service.js';
import { sendSuccess } from '../utils/response.js';
import { ValidationError } from '../utils/errors.js';

export class TravelController {
  static async getWeather(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const destination = req.query.destination as string;
      if (!destination) {
        throw new ValidationError('Query parameter "destination" is required');
      }

      const weather = await WeatherService.getWeather(destination);
      sendSuccess(res, weather);
    } catch (error) {
      next(error);
    }
  }

  static async geocode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query.query as string;
      if (!query) {
        throw new ValidationError('Query parameter "query" is required');
      }

      const mapResult = await MapsService.geocode(query);
      sendSuccess(res, mapResult);
    } catch (error) {
      next(error);
    }
  }

  static async getServiceStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, {
        gemini: {
          configured: GeminiService.isConfigured(),
          provider: 'Google Gemini 1.5 Flash',
        },
        weather: {
          configured: WeatherService.isConfigured(),
          provider: 'OpenWeatherMap',
        },
        maps: {
          configured: MapsService.isConfigured(),
          provider: 'Google Maps Platform',
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
