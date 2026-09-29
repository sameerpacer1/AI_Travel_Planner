import { Router } from 'express';
import { TripController } from '../controllers/trip.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createTripSchema, updateTripSchema, regenerateTripSchema } from '../schemas/trip.schema.js';

const router = Router();

// All trip endpoints require authentication
router.use(requireAuth);

router.post('/', validateRequest(createTripSchema), TripController.createTrip);
router.get('/', TripController.getTrips);
router.get('/:id', TripController.getTripById);
router.put('/:id', validateRequest(updateTripSchema), TripController.updateTrip);
router.delete('/:id', TripController.deleteTrip);

// AI Itinerary endpoints
router.post('/:id/generate', TripController.generateItinerary);
router.post('/:id/regenerate', validateRequest(regenerateTripSchema), TripController.regenerateItinerary);

export default router;
