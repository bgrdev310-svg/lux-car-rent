const express = require('express');
const router = express.Router();
const Hero = require('../models/Hero');
const Brand = require('../models/Brand');
const Car = require('../models/Car');
const PopularDubaiBrand = require('../models/PopularDubaiBrand');

router.get('/', async (req, res) => {
    try {
        // Fetch all data in parallel
        const [hero, brands, cars, popularBrands] = await Promise.all([
            Hero.findOne({ isActive: true }).sort({ updatedAt: -1 }),
            Brand.find({ isActive: true }),
            Car.find({}).sort({ createdAt: -1 }).limit(10),
            PopularDubaiBrand.find({})
        ]);

        // Default Hero if none exists
        const defaultHero = {
            mainImage: '/img/Lamborghini-Huracan-EVO.jpg',
            title: 'Luxury Car Rental',
            subtitle: 'Experience the thrill of driving premium vehicles',
            carCard: []
        };

        res.json({
            hero: hero || defaultHero,
            brands: brands || [],
            cars: cars || [],
            popularBrands: popularBrands || [],
            logo: null, // Placeholder if frontend expects it
            gallery: null // Placeholder if frontend expects it
        });
    } catch (error) {
        console.error('GET /api/home Error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
