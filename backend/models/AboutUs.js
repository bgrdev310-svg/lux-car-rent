const mongoose = require('mongoose');

const FeatureSchema = new mongoose.Schema({
    title: String,
    desc: String,
    image: String,
    icon: String, // Store icon name (e.g., 'Crown', 'Shield')
    colSpan: String,
    bg: String
});

const AboutUsSchema = new mongoose.Schema({
    hero: {
        title: { type: String, default: 'PRESTIGE' },
        subtitle: { type: String, default: 'Automotive Excellence' },
        mainImage: String // Not currently used in hero but good to have
    },
    story: {
        titlePart1: { type: String, default: 'Gold' },
        titlePart2: { type: String, default: 'In Every Detail.' },
        description1: { type: String, default: 'Founded in the heart of Dubai, Prestige Motors was born from a singular obsession: perfection. We understood that in a city of marvels, transportation must be more than just movement—it must be an event.' },
        description2: { type: String, default: 'Our collection is not merely a fleet; it is a curated gallery of engineering masterpieces. From the roar of a V12 to the silence of a Rolls Royce cabin, we curate moments that transcend the ordinary.' },
        stats: [{
            value: String,
            label: String
        }],
        image: { type: String, default: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?q=80&w=1000&auto=format&fit=crop' },
        quote: { type: String, default: '"We don\'t rent cars.\nWe hand over keys to a legacy."' }
    },
    features: {
        title: { type: String, default: 'The Prestige Standard' },
        subtitle: { type: String, default: 'Why Choose Us' },
        items: [FeatureSchema]
    },
    locations: {
        title: { type: String, default: 'Elite Destinations' },
        subtitle: { type: String, default: 'Serving Dubai\'s most prestigious locations with unmatched sophistication and prompt delivery.' },
        list: [String]
    },
    cta: {
        titlePart1: { type: String, default: 'READY TO' },
        titlePart2: { type: String, default: 'IGNITE?' },
        subtitle: { type: String, default: 'The streets of Dubai are waiting. Experience the thrill of true luxury today.' },
        buttonText: { type: String, default: 'Browse Fleet' }
    }
}, { timestamps: true });

// Prevent recompilation error
module.exports = mongoose.models.AboutUs || mongoose.model('AboutUs', AboutUsSchema);
