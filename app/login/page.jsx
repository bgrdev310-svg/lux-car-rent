"use client"
import { getApiUrl } from '@/lib/api-config';;
import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PhoneInput from 'react-phone-input-2';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import Navbar from "../components/homepage/navbar";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [signupData, setSignupData] = useState({
    fullName: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  // WhatsApp OTP modal state
  const [waOpen, setWaOpen] = useState(false);
  const [waPhone, setWaPhone] = useState('');
  const [waStep, setWaStep] = useState(1); // 1: phone, 2: code
  const [waCode, setWaCode] = useState('');
  const [waMode, setWaMode] = useState('login'); // 'login' | 'signup'

  // Helper to validate Algerian phone numbers
  function isValidAlgerianPhone(phone) {
    // Remove spaces and dashes
    const clean = phone.replace(/\D/g, '');
    // Should start with 213 and have 9 digits after
    return clean.startsWith('213') && clean.length === 12;
  }

  // Handle login form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  // Handle signup form changes
  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData({
      ...signupData,
      [name]: value
    });
  };

  // Handle phone input changes
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Check if we're in signup mode
    if (showSignup) {
      setSignupData({
        ...signupData,
        phone: value
      });
    } else {
      setFormData({
        ...formData,
        phone: value
      });
    }
  };

  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validate phone number
    const cleanedLoginPhone = formData.phone.replace(/\s+/g, '');
    const e164LoginPhone = cleanedLoginPhone.startsWith('+') ? cleanedLoginPhone : `+${cleanedLoginPhone}`;
    const phoneNumber = parsePhoneNumberFromString(e164LoginPhone);
    if (!phoneNumber || !phoneNumber.isValid()) {
      setError("Please enter a valid phone number for the selected country.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: e164LoginPhone,
          password: formData.password
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Invalid credentials. Please try again.");
        setIsLoading(false);
        return;
      }
      // Store JWT token (for demo; use httpOnly cookie in production)
      localStorage.setItem("token", data.token);
      router.push(redirect);
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle signup submission
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validate phone number
    const cleanedSignupPhone = signupData.phone.replace(/\s+/g, '');
    const e164SignupPhone = cleanedSignupPhone.startsWith('+') ? cleanedSignupPhone : `+${cleanedSignupPhone}`;
    const phoneNumber = parsePhoneNumberFromString(e164SignupPhone);
    if (!phoneNumber || !phoneNumber.isValid()) {
      setError("Please enter a valid phone number for the selected country.");
      setIsLoading(false);
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    if (signupData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(getApiUrl('/api/auth/signup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupData.fullName,
          phone: e164SignupPhone,
          password: signupData.password
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }
      alert("Account created successfully! Please log in.");
      setShowSignup(false);
      setError("");
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // WhatsApp: send OTP
  const handleWaSend = async (mode) => {
    setWaMode(mode);
    // For signup, require name input
    if (mode === 'signup' && !signupData.fullName.trim()) {
      setError('Please enter your full name before continuing with WhatsApp.');
      return;
    }
    setError("");
    setIsLoading(true);

    const cleaned = waPhone.replace(/\s+/g, '');
    const e164 = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
    const phoneNumber = parsePhoneNumberFromString(e164);
    if (!phoneNumber || !phoneNumber.isValid()) {
      setError('Please enter a valid phone number for the selected country.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(getApiUrl('/api/auth/send-login-code'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: e164, mode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send WhatsApp code.');
        setIsLoading(false);
        return;
      }
      setWaStep(2);
    } catch (err) {
      setError('Failed to send WhatsApp code.');
    } finally {
      setIsLoading(false);
    }
  };

  // WhatsApp: verify OTP
  const handleWaVerify = async () => {
    setError("");
    setIsLoading(true);
    const cleaned = waPhone.replace(/\s+/g, '');
    const e164 = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
    try {
      const res = await fetch(getApiUrl('/api/auth/whatsapp-verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: e164,
          code: waCode,
          mode: waMode,
          name: waMode === 'signup' ? signupData.fullName : undefined
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid code.');
        setIsLoading(false);
        return;
      }
      localStorage.setItem('token', data.token);
      setWaOpen(false);
      setWaStep(1);
      setWaCode('');
      router.push(redirect);
    } catch (err) {
      setError('Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update forgot password: send code
  const handleSendForgotCode = async () => {
    setForgotError('');
    setIsLoading(true);
    const cleanedForgotPhone = forgotPhone.replace(/\s+/g, '');
    const e164ForgotPhone = cleanedForgotPhone.startsWith('+') ? cleanedForgotPhone : `+${cleanedForgotPhone}`;
    const phoneNumber = parsePhoneNumberFromString(e164ForgotPhone);
    console.log('DEBUG: cleanedForgotPhone:', e164ForgotPhone, 'phoneNumber:', phoneNumber, 'isValid:', phoneNumber && phoneNumber.isValid());
    if (!phoneNumber || !phoneNumber.isValid()) {
      setForgotError('Please enter a valid phone number for the selected country.');
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(getApiUrl('/api/auth/send-reset-code'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: e164ForgotPhone })
      });
      const data = await response.json();
      if (!response.ok) {
        setForgotError(data.error || 'Failed to send WhatsApp message.');
        setIsLoading(false);
        return;
      }
      setForgotStep(2);
    } catch (err) {
      setForgotError('Failed to send WhatsApp message.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update forgot password: verify code
  const handleVerifyForgotCode = async () => {
    setForgotError('');
    setIsLoading(true);
    const cleanedForgotPhone = forgotPhone.replace(/\s+/g, '');
    const e164ForgotPhone = cleanedForgotPhone.startsWith('+') ? cleanedForgotPhone : `+${cleanedForgotPhone}`;
    console.log('Calling verify-reset-code with:', e164ForgotPhone, forgotCode);
    try {
      const response = await fetch(getApiUrl('/api/auth/verify-reset-code'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: e164ForgotPhone, code: forgotCode })
      });
      const data = await response.json();
      console.log('verify-reset-code response:', data);
      if (!response.ok) {
        setForgotError(data.error || 'Invalid code.');
        setIsLoading(false);
        return;
      }
      setForgotStep(3);
    } catch (err) {
      setForgotError('Verification failed.');
      console.error('Verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setForgotError('');
    if (newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotError("Passwords don't match.");
      return;
    }
    // Actually reset the password via API
    const cleanedForgotPhone = forgotPhone.replace(/\s+/g, '');
    const e164ForgotPhone = cleanedForgotPhone.startsWith('+') ? cleanedForgotPhone : `+${cleanedForgotPhone}`;
    try {
      const response = await fetch(getApiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: e164ForgotPhone, newPassword })
      });
      const data = await response.json();
      if (!response.ok) {
        setForgotError(data.error || 'Failed to reset password.');
        return;
      }
      setForgotStep(4);
    } catch (err) {
      setForgotError('Failed to reset password.');
    }
  };

  // Update PhoneInput styling for all usages:
  // Add custom style prop to PhoneInput for consistent look
  const phoneInputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '0.75rem',
    color: 'white',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    marginBottom: '0.25rem',
  };

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden font-sans selection:bg-yellow-500/30">
      {/* Cinematic Background - Darkened with subtle zoom effect */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] scale-110 animate-subtle-zoom"
        style={{
          backgroundImage: "url('/img/lambologinphoto.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-black/60"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
      </div>

      {/* Decorative Ambient Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-600/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-900/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-20">
        <div className="w-full max-w-[460px] perspective-1000">

          {/* Main Auth Card */}
          <div className="relative group">
            {/* Multi-layered Glass Card */}
            <div className="absolute -inset-[1px] bg-gradient-to-b from-white/10 to-transparent rounded-[2.5rem] blur-[2px]"></div>

            <div className="relative bg-[#0a0a0a]/80 backdrop-blur-[40px] border-t border-white/10 border-b border-black/50 border-x border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)]">

              {/* Card Header */}
              <div className="text-center mb-10">
                <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-transparent via-yellow-900/20 to-transparent border-y border-yellow-500/10 mb-6">
                  <span className="bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#BF953F] bg-clip-text text-transparent text-[10px] font-bruno uppercase tracking-[0.3em] shadow-yellow-500/20 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">
                    Noble Luxury Services
                  </span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bruno font-bold mb-3 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {showSignup ? (
                    <>
                      JOIN THE <span className="bg-gradient-to-b from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">FLEET</span>
                    </>
                  ) : (
                    <>
                      WELCOME <span className="bg-gradient-to-b from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">BACK</span>
                    </>
                  )}
                </h2>
                <p className="text-gray-400 text-xs tracking-[0.15em] font-light uppercase opacity-80">
                  {showSignup ? "Begin your ultra-premium journey" : "Sign in to access your luxury profile"}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 animate-shake">
                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 backdrop-blur-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]"></div>
                    <p className="text-red-400 text-xs font-medium tracking-wide">{error}</p>
                  </div>
                </div>
              )}

              {/* Form Switching logic */}
              {showSignup ? (
                <form className="space-y-5" onSubmit={handleSignup}>
                  <div className="space-y-4">
                    <div className="relative group/input">
                      <input
                        type="text"
                        name="fullName"
                        placeholder="Full Name"
                        value={signupData.fullName}
                        onChange={handleSignupChange}
                        className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/5 text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/30 focus:shadow-[inset_0_0_20px_rgba(0,0,0,1),0_0_15px_rgba(234,179,8,0.1)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] transition-all duration-500 font-medium tracking-wide"
                        required
                      />
                    </div>

                    <div className="group/phone">
                      <PhoneInput
                        country={'dz'}
                        value={signupData.phone}
                        onChange={phone => setSignupData({ ...signupData, phone })}
                        inputStyle={{
                          width: '100%',
                          height: '60px',
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '0.75rem',
                          color: 'white',
                          fontSize: '1rem',
                          paddingLeft: '50px',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
                        }}
                        buttonStyle={{
                          background: 'transparent',
                          border: 'none',
                          paddingLeft: '15px'
                        }}
                        dropdownStyle={{ background: '#0a0a0a', color: 'white', border: '1px solid #333' }}
                        containerClass="luxury-phone-input"
                        inputProps={{ name: 'phone', required: true, placeholder: 'Phone Number' }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={signupData.password}
                        onChange={handleSignupChange}
                        className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/5 text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/30 focus:shadow-[inset_0_0_20px_rgba(0,0,0,1),0_0_15px_rgba(234,179,8,0.1)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] transition-all duration-500"
                        required
                        minLength="6"
                      />
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm"
                        value={signupData.confirmPassword}
                        onChange={handleSignupChange}
                        className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/5 text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/30 focus:shadow-[inset_0_0_20px_rgba(0,0,0,1),0_0_15px_rgba(234,179,8,0.1)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] transition-all duration-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="group relative w-full py-4 overflow-hidden rounded-xl font-bruno font-bold uppercase tracking-widest text-sm transition-all duration-500 transform hover:-translate-y-0.5"
                    disabled={isLoading}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#BF953F] opacity-100 group-hover:opacity-90 transition-opacity"></div>
                    <div className="absolute inset-0 bg-[url('/img/grain.png')] opacity-10 mix-blend-overlay"></div>
                    <span className="relative text-black drop-shadow-sm group-hover:drop-shadow-md">
                      {isLoading ? "PROVISIONING..." : "CREATE LUXURY ACCOUNT"}
                    </span>
                  </button>

                  <div className="pt-2 text-center">
                    <p className="text-gray-500 text-[10px] tracking-widest uppercase">
                      Already a Member? {" "}
                      <button type="button" onClick={() => setShowSignup(false)} className="text-[#BF953F] hover:text-[#FCF6BA] transition-colors font-bold ml-1">
                        Access Portal
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                <form className="space-y-5" onSubmit={handleLogin}>
                  <div className="space-y-4">
                    <div className="group/phone">
                      <PhoneInput
                        country={'dz'}
                        value={formData.phone}
                        onChange={phone => setFormData({ ...formData, phone })}
                        inputStyle={{
                          width: '100%',
                          height: '60px',
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '0.75rem',
                          color: 'white',
                          fontSize: '1rem',
                          paddingLeft: '50px',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
                        }}
                        buttonStyle={{
                          background: 'transparent',
                          border: 'none',
                          paddingLeft: '15px'
                        }}
                        dropdownStyle={{ background: '#0a0a0a', color: 'white', border: '1px solid #333' }}
                        containerClass="luxury-phone-input"
                        inputProps={{ name: 'phone', required: true, placeholder: 'Phone Number' }}
                      />
                    </div>

                    <div className="relative group/pass">
                      <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/5 text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/30 focus:shadow-[inset_0_0_20px_rgba(0,0,0,1),0_0_15px_rgba(234,179,8,0.1)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] transition-all duration-500 pr-20"
                        required
                      />
                      <button
                        type="button"
                        onClick={e => { e.preventDefault(); setForgotOpen(true); }}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-[#BF953F]/60 hover:text-[#FCF6BA] transition-colors uppercase tracking-widest"
                      >
                        Recovery
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <label className="flex items-center gap-3 text-[10px] text-gray-500 cursor-pointer group/check uppercase tracking-widest hover:text-gray-300 transition-colors">
                      <div className="relative w-4 h-4 rounded bg-black/40 border border-white/10 flex items-center justify-center transition-all group-hover/check:border-[#BF953F]/50">
                        <input
                          type="checkbox"
                          name="rememberMe"
                          checked={formData.rememberMe}
                          onChange={handleChange}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        {formData.rememberMe && <div className="w-2 h-2 bg-[#BF953F] rounded-[1px] shadow-[0_0_8px_rgba(191,149,63,0.8)]" />}
                      </div>
                      Remember Key
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="group relative w-full py-4 overflow-hidden rounded-xl font-bruno font-bold uppercase tracking-widest text-sm transition-all duration-500 transform hover:-translate-y-0.5"
                    disabled={isLoading}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#BF953F] opacity-100 group-hover:opacity-90 transition-opacity"></div>
                    <div className="absolute inset-0 bg-[url('/img/grain.png')] opacity-10 mix-blend-overlay"></div>
                    <span className="relative text-black drop-shadow-sm group-hover:drop-shadow-md">
                      {isLoading ? "AUTHENTICATING..." : "SECURE ENTRY"}
                    </span>
                  </button>

                  {/* Trust Signal Divider */}
                  <div className="relative flex items-center gap-4 py-2 opacity-50">
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20" />
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.3em]">Or Continue With</span>
                    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20" />
                  </div>

                  {/* WhatsApp Priority Sign-in */}
                  <button
                    type="button"
                    onClick={() => { setWaMode('login'); setWaOpen(true); }}
                    className="group relative w-full py-4 bg-[#25D366]/10 border border-[#25D366]/20 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:bg-[#25D366]/20 hover:border-[#25D366]/40 hover:shadow-[0_0_20px_rgba(37,211,102,0.1)]"
                  >
                    <img src="/img/whatsapp.webp" alt="WA" className="w-5 h-5 opacity-90 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-white font-medium text-xs tracking-wider uppercase group-hover:text-[#25D366] transition-colors">WhatsApp Secure Login</span>
                  </button>

                  <div className="pt-4 text-center">
                    <p className="text-gray-500 text-[10px] tracking-widest uppercase">
                      Not in the fleet? {" "}
                      <button type="button" onClick={() => setShowSignup(true)} className="text-[#BF953F] hover:text-[#FCF6BA] transition-colors font-bold ml-1">
                        Apply Now
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* Secure Badges */}
              <div className="mt-12 flex items-center justify-center gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-80 transition-all duration-700">
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-4 h-4 text-[#BF953F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-[7px] text-[#BF953F] font-bold tracking-[0.2em] uppercase">AES-256</span>
                </div>
                <div className="w-[1px] h-6 bg-white/10"></div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-[#BF953F]/50 flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#BF953F] rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-[7px] text-[#BF953F] font-bold tracking-[0.2em] uppercase">Live</span>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Footer Credit */}
          <p className="mt-8 text-center text-gray-600 text-[9px] tracking-[0.4em] uppercase opacity-60 hover:opacity-100 transition-opacity cursor-default">
            Noble Digital Agency &copy; 2026
          </p>
        </div>
      </div>

      {/* LUXURY DIALOGS (Refined) */}
      <Dialog open={waOpen} onOpenChange={setWaOpen}>
        <DialogContent className="max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-0 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]">
          <div className="bg-[#25D366]/5 p-8 border-b border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#25D366]/10 rounded-full blur-[50px] pointer-events-none"></div>
            <div className="relative z-10 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#25D366]/10 flex items-center justify-center border border-[#25D366]/20 shadow-[0_0_20px_rgba(37,211,102,0.1)]">
                <img src="/img/whatsapp.webp" alt="WA" className="w-8 h-8" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bruno text-white mb-1">
                  {waMode === 'login' ? 'WhatsApp Verify' : 'Instant Signup'}
                </DialogTitle>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">End-to-End Encrypted</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6 bg-black/90 backdrop-blur-xl">
            {waStep === 1 ? (
              <div className="space-y-5">
                <div className="group/phone">
                  <PhoneInput
                    country={'dz'}
                    value={waPhone}
                    onChange={setWaPhone}
                    inputStyle={{
                      width: '100%',
                      height: '60px',
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '1rem',
                      color: 'white',
                      fontSize: '1rem',
                      paddingLeft: '50px',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
                    }}
                    buttonStyle={{
                      background: 'transparent',
                      border: 'none',
                      paddingLeft: '15px'
                    }}
                    dropdownStyle={{ background: '#111', color: 'white' }}
                    containerClass="luxury-phone-input"
                    inputProps={{ name: 'waPhone', required: true, autoFocus: true, placeholder: 'WhatsApp Number' }}
                  />
                </div>
                {error && <div className="text-red-400 text-[10px] text-center font-bold tracking-wider uppercase bg-red-900/10 py-2 rounded border border-red-500/20">{error}</div>}
                <button
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-bruno font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(37,211,102,0.2)] hover:shadow-[0_0_30px_rgba(37,211,102,0.4)] text-xs uppercase tracking-widest"
                  onClick={() => handleWaSend(waMode)}
                  disabled={isLoading}
                >
                  {isLoading ? 'ENCRYPTING...' : 'SEND SECURE CODE'}
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex justify-center">
                  {/* Simplified Code Input Display */}
                  <input
                    type="text"
                    value={waCode}
                    onChange={e => setWaCode(e.target.value)}
                    maxLength={4}
                    className="w-full max-w-[240px] text-center text-4xl font-bruno py-4 rounded-2xl bg-black/60 border border-white/10 text-[#25D366] focus:outline-none focus:border-[#25D366]/50 shadow-[inset_0_0_30px_rgba(0,0,0,1)] tracking-[1rem]"
                    placeholder="••••"
                  />
                </div>
                {error && <div className="text-red-400 text-xs text-center">{error}</div>}
                <button
                  className="w-full bg-white hover:bg-gray-200 text-black font-bruno font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] text-xs uppercase tracking-widest"
                  onClick={handleWaVerify}
                  disabled={isLoading}
                >
                  {isLoading ? 'VERIFYING...' : 'CONFIRM IDENTITY'}
                </button>
                <div className="text-center">
                  <button onClick={() => setWaStep(1)} className="text-[9px] uppercase tracking-widest text-gray-600 hover:text-white transition-colors">Wrong Number?</button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Dialog (Refined) */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-0 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]">
          <div className="bg-[#BF953F]/10 p-8 border-b border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#BF953F]/10 rounded-full blur-[50px] pointer-events-none"></div>
            <DialogTitle className="text-xl font-bruno text-white relative z-10">Reset Access</DialogTitle>
            <p className="text-[10px] text-[#BF953F] mt-1 uppercase tracking-widest relative z-10">Identity Verification</p>
          </div>

          <div className="p-8 bg-black/90 backdrop-blur-xl">
            {forgotStep === 1 && (
              <div className="space-y-6">
                <div className="group/phone">
                  <PhoneInput
                    country={'dz'}
                    value={forgotPhone}
                    onChange={setForgotPhone}
                    inputStyle={{
                      width: '100%',
                      height: '60px',
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '1rem',
                      color: 'white',
                      fontSize: '1rem',
                      paddingLeft: '50px',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
                    }}
                    buttonStyle={{
                      background: 'transparent',
                      border: 'none',
                      paddingLeft: '15px'
                    }}
                    dropdownStyle={{ background: '#111', color: 'white' }}
                    containerClass="luxury-phone-input"
                    inputProps={{ name: 'forgotPhone', required: true, autoFocus: true, placeholder: 'Verified Phone' }}
                  />
                </div>
                {forgotError && <div className="text-red-400 text-xs text-center">{forgotError}</div>}
                <button className="w-full bg-gradient-to-r from-[#BF953F] to-[#B38728] text-black font-bruno font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(191,149,63,0.2)] text-xs uppercase tracking-widest hover:brightness-110 transition-all" onClick={handleSendForgotCode}>REQUEST CODE</button>
              </div>
            )}
            {forgotStep === 2 && (
              <div className="space-y-6">
                <p className="text-center text-gray-500 text-[10px] uppercase tracking-widest">Enter the security code sent to your WhatsApp</p>
                <input
                  type="text"
                  value={forgotCode}
                  onChange={e => setForgotCode(e.target.value)}
                  maxLength={4}
                  className="w-full text-center text-3xl font-bold py-4 rounded-xl bg-black/60 border border-white/10 text-[#BF953F] tracking-[1rem] shadow-inner focus:outline-none focus:border-[#BF953F]/50"
                  placeholder="••••"
                />
                {forgotError && <div className="text-red-400 text-xs text-center">{forgotError}</div>}
                <button className="w-full bg-gradient-to-r from-[#BF953F] to-[#B38728] text-black font-bruno font-bold py-4 rounded-xl shadow-lg text-xs uppercase tracking-widest hover:brightness-110 transition-all" onClick={handleVerifyForgotCode}>VALIDATE</button>
              </div>
            )}
            {forgotStep === 3 && (
              <div className="space-y-4">
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-5 py-4 rounded-xl bg-black/60 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#BF953F]/50" placeholder="New Password" />
                <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className="w-full px-5 py-4 rounded-xl bg-black/60 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#BF953F]/50" placeholder="Confirm Password" />
                {forgotError && <div className="text-red-400 text-xs text-center">{forgotError}</div>}
                <button className="w-full bg-white text-black font-bruno font-bold py-4 rounded-xl shadow-lg text-xs uppercase tracking-widest hover:bg-gray-200 transition-all" onClick={handleResetPassword}>UPDATE CREDENTIALS</button>
              </div>
            )}
            {forgotStep === 4 && (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-white font-bruno text-lg tracking-wider">ACCESS RESTORED</div>
                <button className="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl border border-white/10 transition-all text-xs uppercase tracking-widest" onClick={() => { setForgotOpen(false); setForgotStep(1); }}>RETURN TO LOGIN</button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @keyframes subtle-zoom {
          0% { transform: scale(1.05); }
          50% { transform: scale(1.10); }
          100% { transform: scale(1.05); }
        }
        .animate-subtle-zoom {
          animation: subtle-zoom 20s ease-in-out infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        /* Custom Scrollbar for aesthetic */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #050505;
        }
        ::-webkit-scrollbar-thumb {
          background: #262626;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-[#BF953F] font-bruno animate-pulse">LOADING LUXURY ASSETS...</div>}>
      <LoginPageInner />
    </Suspense>
  );
}
