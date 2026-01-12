const express = require('express');
const router = express.Router();
const AboutUs = require('../models/AboutUs');

// Initialize default data helper
const defaultData = {
    hero: {
        title: 'PRESTIGE',
        subtitle: 'Automotive Excellence'
    },
    story: {
        titlePart1: 'Gold',
        titlePart2: 'In Every Detail.',
        description1: 'Founded in the heart of Dubai, Prestige Motors was born from a singular obsession: perfection. We understood that in a city of marvels, transportation must be more than just movement—it must be an event.',
        description2: 'Our collection is not merely a fleet; it is a curated gallery of engineering masterpieces. From the roar of a V12 to the silence of a Rolls Royce cabin, we curate moments that transcend the ordinary.',
        stats: [
            { value: '50+', label: 'Exotic Cars' },
            { value: '24/7', label: 'Concierge' }
        ],
        image: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?q=80&w=1000&auto=format&fit=crop',
        quote: '"We don\'t rent cars.\nWe hand over keys to a legacy."'
    },
    features: {
        title: 'The Prestige Standard',
        subtitle: 'Why Choose Us',
        items: [
            {
                icon: 'Crown',
                title: 'Royalty Treatment',
                desc: 'Every client is treated as a VIP, with white-glove service standard on all rentals.',
                colSpan: 'md:col-span-2',
                bg: 'bg-gradient-to-br from-yellow-900/20 to-black',
                image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1000&auto=format&fit=crop'
            },
            {
                icon: 'Shield',
                title: 'Platinum Insurance',
                desc: 'Comprehensive coverage for complete peace of mind.',
                colSpan: 'md:col-span-1',
                bg: 'bg-[#0a0a0a]',
                image: 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?q=80&w=1000&auto=format&fit=crop'
            },
            {
                icon: 'Zap',
                title: 'Instant Delivery',
                desc: 'From signing to driving in under 30 minutes. Anywhere in Dubai.',
                colSpan: 'md:col-span-1',
                bg: 'bg-[#0a0a0a]',
                image: 'https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=1000&auto=format&fit=crop'
            },
            {
                icon: 'Star',
                title: 'Mint Condition',
                desc: 'Our fleet is maintained to showroom standards daily.',
                colSpan: 'md:col-span-2',
                bg: 'bg-gradient-to-tl from-zinc-900 to-black',
                image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1000&auto=format&fit=crop'
            }
        ]
    },
    locations: {
        title: 'Elite Destinations',
        subtitle: "Serving Dubai's most prestigious locations with unmatched sophistication and prompt delivery.",
        list: [
            "Palm Jumeirah", "Downtown Dubai", "Dubai Marina", "Burj Al Arab",
            "DXB Airport", "Jumeirah Beach", "Dubai Mall", "Atlantis Resort",
            "DIFC", "Emirates Hills", "Dubai Creek", "Business Bay",
            "Madinat Jumeirah", "JBR Walk", "City Walk", "La Mer"
        ]
    },
    cta: {
        titlePart1: 'READY TO',
        titlePart2: 'IGNITE?',
        subtitle: 'The streets of Dubai are waiting. Experience the thrill of true luxury today.',
        buttonText: 'Browse Fleet'
    }
};

// GET /api/about
router.get('/', async (req, res) => {
    try {
        let aboutData = await AboutUs.findOne();

        // Initialize if not exists
        if (!aboutData) {
            aboutData = await AboutUs.create(defaultData);
        }

        res.json(aboutData);
    } catch (error) {
        console.error('Error fetching About Us data:', error);
        res.status(500).json({ message: error.message });
    }
});

// POST /api/about (Full Update/Create)
router.post('/', async (req, res) => {
    try {
        // We maintain only one document, so delete any existing and create new, or update existing.
        // Ideally update existing to preserve ID but simplicity works here.

        const existing = await AboutUs.findOne();
        if (existing) {
            Object.assign(existing, req.body);
            const updated = await existing.save();
            res.json(updated);
        } else {
            const newData = await AboutUs.create(req.body);
            res.status(201).json(newData);
        }
    } catch (error) {
        console.error('Error saving About Us data:', error);
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
