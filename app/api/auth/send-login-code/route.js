import { NextResponse } from 'next/server';
import axios from 'axios';
import { connectDB } from '../../../../lib/mongodb';
import ResetCode from '../../../../models/ResetCode';
import User from '../../../../models/User';

// Infobip API credentials
const INFOBIP_BASE_URL = process.env.INFOBIP_BASE_URL;
const INFOBIP_API_KEY = process.env.INFOBIP_API_KEY;
const INFOBIP_SENDER = process.env.INFOBIP_SENDER_NUMBER || '447860099299';

async function sendWhatsAppOTP(phone, code) {
  // Infobip requires phone without the '+' for some endpoints, but usually E.164 is fine.
  // The 'to' field usually expects format: "447123456789"
  const cleanPhone = phone.replace('+', '');

  const url = `https://${INFOBIP_BASE_URL}/whatsapp/1/message/text`;
  const data = {
    from: INFOBIP_SENDER,
    to: cleanPhone,
    content: {
      text: `Your Noble Verification Code is: ${code}\n\nWelcome to the Fleet.`
    }
  };

  console.log('--- sending Infobip WhatsApp ---');
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
  const { phone, mode } = await req.json();

  if (!INFOBIP_API_KEY || !INFOBIP_BASE_URL) {
    console.error('Missing Infobip environment variables.');
    return NextResponse.json(
      { error: 'Server is missing WhatsApp credentials.' },
      { status: 500 }
    );
  }

  if (!phone || !phone.startsWith('+')) {
    return NextResponse.json(
      { error: 'Phone must be in E.164 format starting with +' },
      { status: 400 }
    );
  }

  if (mode !== 'login' && mode !== 'signup') {
    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  }

  const existingUser = await User.findOne({ phone });
  if (mode === 'login' && !existingUser) {
    return NextResponse.json(
      { error: 'No account found for this phone. Please sign up.' },
      { status: 404 }
    );
  }
  if (mode === 'signup' && existingUser) {
    return NextResponse.json(
      { error: 'User already exists. Try logging in instead.' },
      { status: 409 }
    );
  }

  const code = Math.floor(1000 + Math.random() * 9000).toString();

  try {
    await ResetCode.findOneAndUpdate(
      { phone },
      { code, createdAt: new Date() },
      { upsert: true }
    );
  } catch (err) {
    return NextResponse.json({ error: 'Failed to persist code.' }, { status: 500 });
  }

  try {
    await sendWhatsAppOTP(phone, code);
    // If successful:
    return NextResponse.json({ success: true });
  } catch (err) {
    // DEV MODE BYPASS: If API fails (e.g., Unregistered Number), allow login anyway
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n\n\x1b[33m%s\x1b[0m', '!!! DEV MODE BYPASS - INFOBIP FAILED !!!');
      console.log('\x1b[36m%s\x1b[0m', `>>> OTP FOR ${phone} IS: ${code} <<<`);
      console.log('\x1b[33m%s\x1b[0m', '!!! ENTER THIS CODE TO LOGIN !!!\n\n');
      // Return success so the UI proceeds to the verification step
      return NextResponse.json({ success: true, message: 'Dev Mode: Code logged to console' });
    }

    console.error('Infobip API error (send-login-code):', err?.response?.data || err);
    return NextResponse.json({ error: 'Failed to send WhatsApp message via Infobip. Check server logs.' }, { status: 500 });
  }
}
