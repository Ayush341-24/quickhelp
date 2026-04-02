import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Helper from '../models/Helper.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    const { name, email, password, phone, role, serviceType, location } = req.body;

    if (!name || !email || !password || !phone) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    try {
        const userExists = await User.findOne({ email });
        const helperExists = await Helper.findOne({ email });

        if (userExists || helperExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        if (role === 'helper') {
            const helper = await Helper.create({
                name,
                email,
                password,
                phone,
                serviceType,
                location: { type: 'Point', coordinates: location || [0, 0] },
            });

            if (helper) {
                res.status(201).json({
                    _id: helper._id,
                    name: helper.name,
                    email: helper.email,
                    role: 'helper',
                    token: generateToken(helper._id),
                });
            }
        } else {
            const user = await User.create({
                name,
                email,
                password,
                phone,
            });

            if (user) {
                res.status(201).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: 'user',
                    token: generateToken(user._id),
                });
            }
        }
    } catch (error) {
        let message = error.message;
        if (error.code === 11000) {
            message = 'User with this email already exists';
        }
        res.status(500).json({ message });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    try {
        // Check for user
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: 'user',
                token: generateToken(user._id),
            });
        }

        // Check for helper
        const helper = await Helper.findOne({ email });
        if (helper && (await helper.matchPassword(password))) {
            return res.json({
                _id: helper._id,
                name: helper.name,
                email: helper.email,
                role: 'helper',
                token: generateToken(helper._id),
            });
        }

        res.status(401).json({ message: 'Invalid email or password' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};
