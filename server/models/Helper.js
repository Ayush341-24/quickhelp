import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const helperSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    serviceType: {
        type: String,
        enum: ['Plumbing', 'Electrical', 'Cleaning', 'Painting', 'Moving', 'Cooking', 'Repairs'],
        required: true,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            required: true, // [longitude, latitude]
        },
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    rating: {
        type: Number,
        default: 5.0,
    },
    completedJobs: {
        type: Number,
        default: 0,
    },
    points: {
        type: Number,
        default: 0,
    },
    level: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
        default: 'Bronze',
    },
}, {
    timestamps: true,
});

// Configure for geospatial queries
helperSchema.index({ location: '2dsphere' });

helperSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

helperSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Helper = mongoose.model('Helper', helperSchema);
export default Helper;
