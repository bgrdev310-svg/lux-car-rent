"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaInstagram,
  FaFacebookF,
  FaTelegramPlane
} from "react-icons/fa";
import Navbar from "../components/homepage/navbar";
import { useContactData } from "../components/data/contactdata";
import FooterSection from "@/app/components/homepage/footer";

const ContactCard = ({ icon: Icon, title, value, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
    className="group relative p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-yellow-500/30 overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]"
  >
    {/* Hover Gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

    <div className="relative z-10 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-black border border-white/10 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
        <Icon className="text-2xl text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
      </div>

      <h3 className="text-xl font-bruno text-white mb-3 group-hover:text-yellow-400 transition-colors">
        {title}
      </h3>

      <p className="text-gray-400 font-sans text-sm leading-relaxed max-w-[200px] mx-auto break-words">
        {value || "Loading..."}
      </p>
    </div>
  </motion.div>
);

export default function ContactUs() {
  const { contactInfo, socialMedia } = useContactData();

  const cards = [
    {
      icon: FaPhoneAlt,
      title: "Call Us",
      value: contactInfo?.phone?.value
    },
    {
      icon: FaEnvelope,
      title: "Email Us",
      value: contactInfo?.email?.value
    },
    {
      icon: FaCalendarAlt,
      title: "Working Hours",
      value: contactInfo?.hours?.value
    },
    {
      icon: FaMapMarkerAlt,
      title: "Visit Us",
      value: contactInfo?.address?.value
    }
  ];

  return (
    <div className="bg-[#050505] min-h-screen font-sans selection:bg-yellow-500/30 flex flex-col">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 relative overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-yellow-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="text-center mb-20">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bruno text-white mb-6"
            >
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-[#FF9D00]">Touch</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed"
            >
              Experience the pinnacle of service. Whether for booking inquiries or special requests,
              our dedicated concierge team is at your disposal.
            </motion.p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-20">
            {cards.map((card, idx) => (
              <ContactCard key={idx} {...card} index={idx} />
            ))}
          </div>

          {/* Social Media */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-8 px-10 py-6 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
              {socialMedia?.filter(sm => sm.active).map((sm, idx) => {
                const Icon = sm.icon;
                return (
                  <a
                    key={idx}
                    href={sm.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-3xl text-gray-400 hover:text-yellow-500 transition-all duration-300 transform hover:scale-110 hover:drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                  >
                    {Icon && <Icon />}
                  </a>
                );
              })}
            </div>
            <p className="text-gray-500 text-sm mt-4 font-mono uppercase tracking-widest">Connect With Us</p>
          </motion.div>
        </div>
      </main>

      {/* Footer - Now moved OUTSIDE the main container to span full width */}
      <FooterSection />
    </div>
  );
}