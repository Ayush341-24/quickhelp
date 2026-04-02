import express from 'express';
const router = express.Router();
import { createBooking, getBooking, getMyBookings } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/')
    .post(protect, createBooking);

router.route('/my')
    .get(protect, getMyBookings);

router.route('/:id')
    .get(protect, getBooking);

export default router;
