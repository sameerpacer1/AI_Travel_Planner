import { Router } from 'express';
import { TravelController } from '../controllers/travel.controller.js';

const router = Router();

router.get('/weather', TravelController.getWeather);
router.get('/geocode', TravelController.geocode);
router.get('/route', TravelController.getRoute);
router.get('/services-status', TravelController.getServiceStatus);

export default router;
