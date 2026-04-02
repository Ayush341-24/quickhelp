import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Helper from '../models/Helper.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

            // Check if user or helper
            let user = await User.findById(decoded.id).select('-password');
            if (!user) {
                user = await Helper.findById(decoded.id).select('-password');
            }

            req.user = user;

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const helperOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'helper' || req.user.serviceType)) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a helper' });
    }
};
