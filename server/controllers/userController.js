import User from '../models/User.js';
import Helper from '../models/Helper.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    // req.user is already set by authMiddleware
    if (req.user) {
        res.json(req.user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    const user = req.user;

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;

        if (req.body.password) {
            user.password = req.body.password;
        }

        // Helper specific updates
        if (user.role === 'helper' || user.serviceType) {
            user.serviceType = req.body.serviceType || user.serviceType;
            user.isAvailable = req.body.isAvailable !== undefined ? req.body.isAvailable : user.isAvailable;
        }

        try {
            const updatedUser = await user.save();

            // Return appropriate object based on role (cleaner way would be to use a DTO or separate methods, but this works for now)
            const response = {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role || 'helper',
            };

            if (updatedUser.role === 'helper' || updatedUser.serviceType) {
                response.serviceType = updatedUser.serviceType;
                response.points = updatedUser.points;
                response.level = updatedUser.level;
                response.isAvailable = updatedUser.isAvailable;
            } else {
                response.badges = updatedUser.badges;
                response.coupons = updatedUser.coupons;
            }

            // Re-generate token if needed, or just return user data
            // keeping it simple for now, frontend updates local state
            res.json(response);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }

    } else {
        res.status(404).json({ message: 'User not found' });
    }
};
