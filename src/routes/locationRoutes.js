import express from 'express';
import LocationController from '../controllers/locationController.js';

const router = express.Router();


router.get('/location', LocationController.getCurrentLocation);
router.post('/location', LocationController.addLocation);

export default router;