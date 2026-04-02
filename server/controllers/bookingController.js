import Booking from '../models/Booking.js';
import Helper from '../models/Helper.js';

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
    const { serviceType, location, scheduledTime, notes } = req.body;

    if (!location || !location.lat || !location.lng) {
        return res.status(400).json({ message: 'Location is required' });
    }

    if (!serviceType) {
        return res.status(400).json({ message: 'Service type is required' });
    }

    try {
        const booking = new Booking({
            user: req.user._id,
            serviceType,
            location: {
                type: 'Point',
                coordinates: [location.lng, location.lat],
                address: location.address
            },
            scheduledTime: scheduledTime || Date.now(),
            notes,
            status: 'pending'
        });

        const createdBooking = await booking.save();

        // Auto-assignment logic (simplified)
        // Find nearest available helper
        const helpers = await Helper.find({
            serviceType,
            isAvailable: true,
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [location.lng, location.lat]
                    },
                    $maxDistance: 15000 // 15km
                }
            }
        });

        // In a real app, we would emit a socket event here to the nearest helper
        // For now, let's just assign the first one if found
        if (helpers.length > 0) {
            createdBooking.helper = helpers[0]._id;
            createdBooking.status = 'accepted'; // Auto-accept for demo
            await createdBooking.save();
        }

        res.status(201).json(createdBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('helper', 'name email phone serviceType location');

        if (booking) {
            res.json(booking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings/my
// @access  Private
export const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
