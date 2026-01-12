const express = require('express'); // Server entry point (persistence removed)

const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: './.env' });
require('dotenv').config({ path: './.env.local' });
const Hero = require('./models/Hero');
const contactRoutes = require('./routes/contact');
const brandRoutes = require('./routes/brands');
const carsRoutes = require('./routes/cars');

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    'https://luxurycarrentnoble.pages.dev',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/luxurycar';

// Debug: Print masked URI
const maskedUri = MONGODB_URI.replace(/\/\/.*:.*@/, '//****:****@');
console.log('Attempting to connect to MongoDB with URI:', maskedUri);

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000
})
  .then(() => {
    console.log('Connected to MongoDB successfully');
    initializeDefaultData();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Initialize default data
async function initializeDefaultData() {
  try {
    // Initialize default brands
    const defaultBrands = [
      {
        name: "Mercedes",
        logo: "/img/Mercedes-Logo.png",
        description: "The epitome of German engineering and luxury, Mercedes-Benz combines performance with sophisticated elegance.",
        isActive: true
      },
      {
        name: "Ferrari",
        logo: "/img/ferrarilogo.png",
        description: "The prancing horse represents pure Italian passion, speed, and racing heritage in every curve and line.",
        isActive: true
      },
      {
        name: "Lamborghini",
        logo: "/img/lambologo.png",
        description: "No automotive brand is as alluring as Lamborghini. Scissor doors, V10 and V12 engines, howling exhaust notes — their exotic models are the very definition of ostentatious.",
        isActive: true
      },
      {
        name: "Cadillac",
        logo: "/img/cadillac.png",
        description: "American luxury redefined with bold design and cutting-edge technology for the modern driver.",
        isActive: true
      },
      {
        name: "Bentley",
        logo: "/img/bentley.png",
        description: "British craftsmanship at its finest, where handcrafted luxury meets extraordinary performance.",
        isActive: true
      }
    ];

    // Check if brands exist
    const existingBrands = await Brand.find();
    if (existingBrands.length === 0) {
      await Brand.insertMany(defaultBrands);
      console.log('Default brands initialized');
    }

    // Initialize default popular Dubai brands
    const defaultPopularDubaiBrands = [
      { name: "Rolls Royce", logo: "/img/rolls-royce-logo.png" },
      { name: "Bugatti", logo: "/img/bugatti-logo.png" },
      { name: "McLaren", logo: "/img/mclaren-logo.png" },
      { name: "Aston Martin", logo: "/img/aston-martin-logo.png" },
      { name: "Porsche", logo: "/img/porsche-logo.png" },
      { name: "Maserati", logo: "/img/maserati-logo.png" },
      { name: "BMW", logo: "/img/bmw-logo.png" },
      { name: "Audi", logo: "/img/audi-logo.png" },
      { name: "Jaguar", logo: "/img/jaguar-logo.png" },
      { name: "Land Rover", logo: "/img/land-rover-logo.png" }
    ];
    const PopularDubaiBrand = require('./models/PopularDubaiBrand');
    const existingPopularBrands = await PopularDubaiBrand.find();
    if (existingPopularBrands.length === 0) {
      await PopularDubaiBrand.insertMany(defaultPopularDubaiBrands);
      console.log('Default popular Dubai brands initialized');
    }

    // Initialize default hero section (new schema)
    const defaultHero = {
      backgroundImage: "/img/Lamborghini-Huracan-EVO.jpg",
      carCard: {
        title: "Lamborghini Huracan EVO",
        logo: "/img/lambologo.png",
        image: "/img/lambopng.png",
        specs: ["V10", "300 KM", "2022"]
      }
    };
    const existingHero = await Hero.findOne();
    if (!existingHero) {
      await Hero.create(defaultHero);
      console.log('Default hero section initialized');
    }
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
}

// Define Schemas for models that don't have separate files yet
const requestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  car: { type: String, required: true },
  carId: { type: String }, // Added to support aggregation
  dateFrom: { type: Date, required: true },
  dateTo: { type: Date, required: true },
  totalDays: { type: Number, required: true },
  rentalType: { type: String, required: true },
  totalPrice: { type: String, required: true },
  message: String,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  urgent: {
    type: Boolean,
    default: false
  }
});


// Create Models
const Request = mongoose.model('Request', requestSchema);

// API Routes
// Car Routes
app.use('/api/cars', carsRoutes);

// Brand Routes
app.use('/api/brands', brandRoutes);

// Contact Routes
app.use('/api/contact', contactRoutes);

// Dashboard Routes
const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRoutes);

// Request Routes
// Request Routes
const chatContent = require('./routes/chatRequest');
app.use('/api/chat', chatContent);

app.get('/api/requests', async (req, res) => {
  try {
    const requests = await Request.find().sort({ timestamp: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/requests', async (req, res) => {
  try {
    const request = new Request(req.body);
    const savedRequest = await request.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.patch('/api/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedRequest = await Request.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(updatedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Home Aggregation Route
const homeRoutes = require('./routes/home');
app.use('/api/home', homeRoutes);

// Favorites Routes
const favoritesRoutes = require('./routes/favorites');
app.use('/api/favorites', favoritesRoutes);

// About Us Routes
const aboutRoutes = require('./routes/about');
app.use('/api/about', aboutRoutes);

// Hero Section Routes
app.get('/api/hero', async (req, res) => {
  try {
    const hero = await Hero.findOne({ isActive: true }).sort({ updatedAt: -1 });
    console.log('GET /api/hero - Found hero:', hero);
    res.json(hero || {
      mainImage: '/img/Lamborghini-Huracan-EVO.jpg',
      title: 'Luxury Car Rental',
      subtitle: 'Experience the thrill of driving premium vehicles',
      carCards: []
    });
  } catch (error) {
    console.error('GET /api/hero - Error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/hero', async (req, res) => {
  try {
    console.log('POST /api/hero - Received data:', req.body);

    // Validate required fields
    const { mainImage, title, subtitle } = req.body;
    if (!mainImage || !title || !subtitle) {
      throw new Error('Missing required fields: mainImage, title, and subtitle are required');
    }

    // Set all existing hero sections to inactive
    await Hero.updateMany({}, { isActive: false });

    // Create new hero section
    const hero = new Hero({
      ...req.body,
      mainImage: req.body.mainImage || req.body.backgroundImage, // Handle both field names
      isActive: true
    });

    const savedHero = await hero.save();
    console.log('POST /api/hero - Saved hero:', savedHero);
    res.status(201).json(savedHero);
  } catch (error) {
    console.error('POST /api/hero - Error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Mount routes
const Brand = require('./models/Brand');
const FAQ = require('./models/Faq');
const popularDubaiBrandsRouter = require('./routes/popularDubaiBrands');

// Brand Routes
app.get('/api/brands', async (req, res) => {
  try {
    const brands = await Brand.find({ isActive: true });
    console.log('GET /api/brands - Found brands:', brands);
    res.json(brands);
  } catch (error) {
    console.error('GET /api/brands - Error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/brands', async (req, res) => {
  try {
    console.log('POST /api/brands - Received data:', req.body);
    const brand = new Brand(req.body);
    const savedBrand = await brand.save();
    console.log('POST /api/brands - Saved brand:', savedBrand);
    res.status(201).json(savedBrand);
  } catch (error) {
    console.error('POST /api/brands - Error:', error);
    res.status(400).json({ message: error.message });
  }
});

app.patch('/api/brands/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedBrand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    res.json(updatedBrand);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/brands/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    res.json(brand);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// FAQ Routes
app.get('/api/faqs', async (req, res) => {
  try {
    console.log('GET /api/faqs - Fetching FAQs');
    const faqs = await FAQ.find().sort({ createdAt: -1 });
    console.log('GET /api/faqs - Found FAQs:', faqs);
    res.json(faqs);
  } catch (error) {
    console.error('GET /api/faqs - Error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/faqs', async (req, res) => {
  try {
    console.log('POST /api/faqs - Received data:', req.body);
    const faq = new FAQ(req.body);
    const savedFaq = await faq.save();
    console.log('POST /api/faqs - Saved FAQ:', savedFaq);
    res.status(201).json(savedFaq);
  } catch (error) {
    console.error('POST /api/faqs - Error:', error);
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/faqs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`PUT /api/faqs/${id} - Updating FAQ with data:`, req.body);
    const updatedFaq = await FAQ.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedFaq) {
      console.log(`PUT /api/faqs/${id} - FAQ not found`);
      return res.status(404).json({ message: 'FAQ not found' });
    }

    console.log(`PUT /api/faqs/${id} - Updated FAQ:`, updatedFaq);
    res.json(updatedFaq);
  } catch (error) {
    console.error(`PUT /api/faqs/${id} - Error:`, error);
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/faqs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`DELETE /api/faqs/${id} - Deleting FAQ`);
    const deletedFaq = await FAQ.findByIdAndDelete(id);

    if (!deletedFaq) {
      console.log(`DELETE /api/faqs/${id} - FAQ not found`);
      return res.status(404).json({ message: 'FAQ not found' });
    }

    console.log(`DELETE /api/faqs/${id} - Deleted FAQ:`, deletedFaq);
    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error(`DELETE /api/faqs/${id} - Error:`, error);
    res.status(400).json({ message: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 