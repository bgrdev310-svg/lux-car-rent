const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const BASE_URL = process.env.INFOBIP_BASE_URL;
const API_KEY = process.env.INFOBIP_API_KEY;
const SENDER = process.env.INFOBIP_SENDER_NUMBER;
// Replace this with your actual phone number to test (e.g., '213555123456')
// Ensure it includes country code but NO plus sign if using the replace logic, 
// or just type it exactly as E.164 without plus.
const TEST_PHONE = '213697929428'; // I will ask user to update this or I can pick from recent logs if I had them. 
// For now I will leave it blank or use a placeholder and ask user to edit.
// Wait, I don't know the users phone number. I will start with a placeholder.

async function testSend() {
    console.log('--- Testing Infobip Config ---');
    console.log('Base URL:', BASE_URL);
    console.log('Sender:', SENDER);
    // console.log('API Key:', API_KEY ? 'Set' : 'Missing');

    if (!BASE_URL || !API_KEY || !SENDER) {
        console.error('Missing credentials in .env.local');
        return;
    }

    // Hardcode the specific number user might want to test OR allow arg
    const targetPhone = process.argv[2] || 'REPLACE_WITH_YOUR_PHONE_NUMBER';

    const url = `https://${BASE_URL}/whatsapp/1/message/text`;
    const data = {
        from: SENDER,
        to: targetPhone,
        content: {
            text: "Debug Test Message from Noble Luxury."
        }
    };

    try {
        console.log(`Sending to ${targetPhone}...`);
        const response = await axios.post(url, data, {
            headers: {
                'Authorization': `App ${API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error Occurred:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

testSend();
