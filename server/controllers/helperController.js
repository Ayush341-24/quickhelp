import Helper from '../models/Helper.js';

// @desc    Get all helpers or filter by service/location
// @route   GET /api/helpers
// @access  Public
export const getHelpers = async (req, res) => {
    const { serviceType, lat, lng, dist } = req.query;
    let query = { isAvailable: true };

    if (serviceType) {
        query.serviceType = serviceType;
    }

    if (lat && lng) {
        // GeoJSON query: find helpers within 'dist' km (default 10km)
        const distanceInMeters = (dist || 10) * 1000;
        query.location = {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [parseFloat(lng), parseFloat(lat)]
                },
                $maxDistance: distanceInMeters
            }
        };
    }

    try {
        const helpers = await Helper.find(query).select('-password');
        res.json(helpers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update helper location
// @route   PUT /api/helpers/location
// @access  Private (Helper only)
export const updateLocation = async (req, res) => {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
        return res.status(400).json({ message: 'Latitude and Longitude required' });
    }

    try {
        const helper = await Helper.findById(req.user.id);

        if (helper) {
            helper.location = {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)]
            };
            await helper.save();
            res.json({ message: 'Location updated' });
        } else {
            res.status(404).json({ message: 'Helper not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
