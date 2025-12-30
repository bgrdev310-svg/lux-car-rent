const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const Car = require('../models/Car');

// GET favorites (populate cars)
router.get('/', async (req, res) => {
    try {
        // For now, return all favorites since we don't have robust auth in this step
        // In production, filter by req.user.id
        const favorites = await Favorite.find().populate('carId').sort({ createdAt: -1 });

        // Transform to return list of cars inside 'favorites' key to match frontend expectation
        // Frontend expects { favorites: [carObjects...] }
        const favoriteCars = favorites.map(f => f.carId).filter(Boolean); // Filter out nulls if car deleted

        res.json({ favorites: favoriteCars });
    } catch (error) {
        console.error('GET /api/favorites Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// POST toggle favorite
router.post('/', async (req, res) => {
    try {
        const { carId } = req.body;

        // Check if exists
        const existing = await Favorite.findOne({ carId });

        if (existing) {
            await Favorite.findByIdAndDelete(existing._id);
        } else {
            await Favorite.create({ carId });
        }

        // Return updated list
        const favorites = await Favorite.find().populate('carId').sort({ createdAt: -1 });
        const favoriteCars = favorites.map(f => f.carId).filter(Boolean);

        res.json({ favorites: favoriteCars });
    } catch (error) {
        console.error('POST /api/favorites Error:', error);
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
