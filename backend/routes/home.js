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
            Hero.findOne().sort({ updatedAt: -1 }).lean(),
            Brand.find({ isActive: true }).select('name logo description isActive isVisible').lean(),
            Car.find({}).sort({ createdAt: -1 }).limit(10).select('title image mainImage logo specs price pricing _id').lean(),
            PopularDubaiBrand.find({}).lean()
        ]);

        // Default Hero if none exists
        const defaultHero = {
            backgroundImage: '/img/Lamborghini-Huracan-EVO.jpg',
            title: 'Luxury Car Rental',
            subtitle: 'Experience the thrill of driving premium vehicles',
            carCard: {
                title: 'Lamborghini Huracán',
                logo: '/img/lambologo.png',
                image: '/img/Lamborghini-Huracan-EVO.jpg',
                specs: ['V10 Engine', '640 HP', '0-100 in 2.9s']
            }
        };

        // If hero from DB is missing carCard properties, use defaults
        const finalHero = hero ? {
            ...hero,
            mainImage: hero.backgroundImage || hero.mainImage || defaultHero.backgroundImage,
            carCard: hero.carCard && hero.carCard.logo ? hero.carCard : defaultHero.carCard
        } : defaultHero;

        res.json({
            hero: finalHero,
            brands: brands || [],
            cars: cars || [],
            popularBrands: popularBrands || [],
            logo: null,
            gallery: null
        });
    } catch (error) {
        console.error('GET /api/home Error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
