import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    helper: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Helper',
    },
    serviceType: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'],
        default: 'pending',
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
        },
        address: String,
    },
    scheduledTime: {
        type: Date,
        default: Date.now,
    },
    price: {
        type: Number,
    },
    notes: String,
}, {
    timestamps: true,
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
