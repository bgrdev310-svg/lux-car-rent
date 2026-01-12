import { NextResponse } from 'next/server';
import axios from 'axios';
import { connectDB } from '../../../../lib/mongodb';
import ResetCode from '../../../../models/ResetCode';

// Infobip API credentials
const INFOBIP_BASE_URL = process.env.INFOBIP_BASE_URL;
const INFOBIP_API_KEY = process.env.INFOBIP_API_KEY;
const INFOBIP_SENDER = process.env.INFOBIP_SENDER_NUMBER || '447860099299';

async function sendWhatsAppOTP(phone, code) {
  const cleanPhone = phone.replace('+', '');

  const url = `https://${INFOBIP_BASE_URL}/whatsapp/1/message/text`;
  const data = {
    from: INFOBIP_SENDER,
    to: cleanPhone,
    content: {
      text: `Your Noble Password Reset Code is: ${code}\n\nIf you did not request this, please ignore.`
    }
  };

  console.log('--- sending Infobip Reset Code ---');
  console.log('To:', cleanPhone);
  console.log('From:', INFOBIP_SENDER);
  console.log('Payload:', JSON.stringify(data, null, 2));

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `App ${INFOBIP_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });
    console.log('Infobip Success Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error('Infobip API Error Response:', JSON.stringify(error.response.data, null, 2));
      console.error('Status:', error.response.status);
    } else {
      console.error('Infobip Network Error:', error.message);
    }
    throw error;
  }
}

export async function POST(req) {
  await connectDB();
  const { phone } = await req.json();

  if (!INFOBIP_API_KEY || !INFOBIP_BASE_URL) {
    console.error('Missing Infobip environment variables.');
    return NextResponse.json(
      { error: 'Server is missing WhatsApp credentials.' },
      { status: 500 }
    );
  }

  if (!phone || !phone.startsWith('+')) {
    return NextResponse.json({ error: 'Phone number must be in E.164 format (with + and country code).' }, { status: 400 });
  }

  const code = Math.floor(1000 + Math.random() * 9000).toString();

  try {
    await ResetCode.findOneAndUpdate(
      { phone },
      { code, createdAt: new Date() },
      { upsert: true }
    );
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save reset code.' }, { status: 500 });
  }

  try {
    await sendWhatsAppOTP(phone, code);
    // If successful (e.g. registered number)
    return NextResponse.json({ success: true });
  } catch (err) {
    // DEV MODE BYPASS: If API fails (e.g., Unregistered Number)
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n\n\x1b[33m%s\x1b[0m', '!!! DEV MODE BYPASS - INFOBIP FAILED !!!');
      console.log('\x1b[36m%s\x1b[0m', `>>> RESET CODE FOR ${phone} IS: ${code} <<<`);
      console.log('\x1b[33m%s\x1b[0m', '!!! ENTER THIS CODE TO RESET PASSWORD !!!\n\n');
      // Return success so the UI proceeds
      return NextResponse.json({ success: true, message: 'Dev Mode: Code logged to console' });
    }

    console.error('Infobip API error (send-reset-code):', err?.response?.data || err);
    return NextResponse.json({ error: 'Failed to send WhatsApp message via Infobip. Check server logs.' }, { status: 500 });
  }
}