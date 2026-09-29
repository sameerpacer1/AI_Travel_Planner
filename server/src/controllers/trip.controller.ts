import { Request, Response, NextFunction } from 'express';
import { DbService } from '../services/db.service.js';
import { GeminiService } from '../services/ai/gemini.service.js';
import { NotFoundError, UnauthorizedError, AIServiceError } from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';
import { CreateTripInput, UpdateTripInput, RegenerateTripInput } from '../schemas/trip.schema.js';

export class TripController {
  static async createTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();

      const tripData: CreateTripInput = req.body;
      const trip = await DbService.createTrip(req.user.id, tripData);

      sendSuccess(res, { trip }, 'Trip created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getTrips(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();

      const trips = await DbService.findTripsByUserId(req.user.id);
      sendSuccess(res, { trips });
    } catch (error) {
      next(error);
    }
  }

  static async getTripById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();

      const id = String(req.params.id);
      const trip = await DbService.findTripByIdAndUserId(id, req.user.id);
      if (!trip) {
        throw new NotFoundError('Trip not found or you do not have permission to view it');
      }

      sendSuccess(res, { trip });
    } catch (error) {
      next(error);
    }
  }

  static async updateTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();

      const id = String(req.params.id);
      const updateData: UpdateTripInput = req.body;

      const updated = await DbService.updateTrip(id, req.user.id, updateData);
      if (!updated) {
        throw new NotFoundError('Trip not found or you do not have permission to edit it');
      }

      sendSuccess(res, { trip: updated }, 'Trip updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();

      const id = String(req.params.id);
      const deleted = await DbService.deleteTrip(id, req.user.id);
      if (!deleted) {
        throw new NotFoundError('Trip not found or you do not have permission to delete it');
      }

      sendSuccess(res, null, 'Trip deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async generateItinerary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();

      const id = String(req.params.id);
      const trip = await DbService.findTripByIdAndUserId(id, req.user.id);
      if (!trip) {
        throw new NotFoundError('Trip not found');
      }

      const itinerary = await GeminiService.generateItinerary(trip);
      const updatedTrip = await DbService.updateTripItinerary(id, req.user.id, itinerary);

      sendSuccess(
        res,
        { trip: updatedTrip, itinerary },
        'AI Itinerary generated successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async regenerateItinerary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();

      const id = String(req.params.id);
      const { modifier, customPrompt }: RegenerateTripInput = req.body;

      const trip = await DbService.findTripByIdAndUserId(id, req.user.id);
      if (!trip) {
        throw new NotFoundError('Trip not found');
      }

      // Generate new itinerary while keeping previous one safe if generation fails
      const newItinerary = await GeminiService.generateItinerary(trip, modifier, customPrompt);
      const updatedTrip = await DbService.updateTripItinerary(id, req.user.id, newItinerary);

      sendSuccess(
        res,
        { trip: updatedTrip, itinerary: newItinerary },
        'Itinerary regenerated with updated preferences'
      );
    } catch (error) {
      next(error);
    }
  }
}
