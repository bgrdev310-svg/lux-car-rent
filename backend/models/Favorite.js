const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: true
    },
    userId: {
        type: String, // Storing as string or ObjectId depending on how we handle auth later
        default: 'anonymous'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Favorite', favoriteSchema);
