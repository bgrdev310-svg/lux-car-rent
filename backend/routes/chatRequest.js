const express = require('express');
const router = express.Router();
const Car = require('../models/Car');

router.post('/', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const lowerMsg = message.toLowerCase();

        // Check for Gemini API Key
        const geminiApiKey = process.env.GEMINI_API_KEY;
        console.log("DEBUG: GEMINI_API_KEY status:", geminiApiKey ? "Present (starts with " + geminiApiKey.substring(0, 4) + ")" : "Missing");

        if (geminiApiKey) {
            try {
                // 1. Fetch available cars from DB
                const availableCars = await Car.find({ isAvailable: true }).select('name brand pricePerDay engine functionality year image');

                // Format cars for the prompt
                const carInventoryContext = availableCars.map(c =>
                    `- ${c.brand} ${c.name} (${c.year}): ${c.pricePerDay} AED/day. Engine: ${c.engine}. Best for: ${c.functionality}.`
                ).join('\n');

                const { GoogleGenerativeAI } = require("@google/generative-ai");
                const genAI = new GoogleGenerativeAI(geminiApiKey);
                let model;
                try {
                    // Based on available models list, using the latest alias
                    model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
                } catch (e) {
                    console.log("gemini-flash-latest failed, falling back to lite");
                    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05" });
                }

                const prompt = `
            You are an EXPERT Luxury Car Consultant for "Luxury Car Rental Noble".
            Your goal is to impress the user with your deep knowledge of cars and help them choose the perfect vehicle.

            USER QUESTION: "${message}"

            ### OUR EXCLUSIVE FLEET (Use this data to answer):
            ${carInventoryContext}

            ### INSTRUCTIONS:
            1. **Be an Expert**: Compare engines (V8, V10, V12), speed, and driving experience.
            2. **Recommend Specific Cars**: If the user asks generic questions (e.g., "fast cars"), recommend specific models from our fleet above.
            3. **Context Aware**: If the user asks about availability, ONLY list cars from the "OUR EXCLUSIVE FLEET" list.
            4. **Style**: distinctive, professional, expensive, and helpful.

            ### RESPONSE FORMAT:
            Return a JSON object with this EXACT format:
            {
              "text": "Your helpful, expert response here...",
              "action": { "type": "redirect", "url": "/..." } 
            }
            
            **Action Logic**:
            - If recommending specific cars -> "url": "/cars"
            - If discussing location -> "url": "/findus"
            - If discussing contact -> "url": "/contact"
            - Otherwise -> null

            Do NOT use markdown in the JSON. Just plain text.
            `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                // Clean up code blocks if Gemini returns them
                const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

                try {
                    const jsonResponse = JSON.parse(cleanText);
                    return res.json(jsonResponse);
                } catch (e) {
                    // Fallback if JSON parsing fails
                    console.error("Gemini JSON parse error", e);
                    return res.json({ text: text, action: null });
                }

            } catch (geminiError) {
                console.error("Gemini Error:", geminiError);
                // Fallback to rule-based if Gemini fails
            }
        }

        // Rule-based logic (Fallback)
        let responseText = "I'm here to help! You can ask me about booking cars, our location, or how to contact us.";
        let action = null;

        if (lowerMsg.includes('book') || lowerMsg.includes('rent') || lowerMsg.includes('price') || lowerMsg.includes('cost')) {
            responseText = "I can help you with that! Taking you to our exclusive car collection to see prices and availability...";
            action = { type: 'redirect', url: '/cars' };
        } else if (lowerMsg.includes('contact') || lowerMsg.includes('email') || lowerMsg.includes('phone') || lowerMsg.includes('call')) {
            responseText = "You can reach out to us directly. Redirecting you to our contact page...";
            action = { type: 'redirect', url: '/contact' };
        } else if (lowerMsg.includes('location') || lowerMsg.includes('where') || lowerMsg.includes('address') || lowerMsg.includes('find')) {
            responseText = "We are located in a prime spot. Let me show you where to find us...";
            action = { type: 'redirect', url: '/findus' };
        } else if (lowerMsg.includes('about') || lowerMsg.includes('who')) {
            responseText = "Learn more about our legacy and premium service. Redirecting to About Us...";
            action = { type: 'redirect', url: '/aboutus' };
        } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
            responseText = "Hello! Welcome to Luxury Rental. How may I assist you today?";
        }

        // Simulate a small delay for "thinking" feel (only for rule-based)
        res.json({
            text: responseText,
            action: action
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
