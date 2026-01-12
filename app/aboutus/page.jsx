"use client";
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Navbar from "../components/homepage/navbar";
import FooterSection from "@/app/components/homepage/footer";

// Dynamic Imports for Performance
const AboutHero = dynamic(() => import('../components/about/AboutHero'));
const AboutStory = dynamic(() => import('../components/about/AboutStory'));
const AboutFeatures = dynamic(() => import('../components/about/AboutFeatures'));
const AboutCallToAction = dynamic(() => import('../components/about/AboutStats'));
const AboutLocations = dynamic(() => import('../components/about/AboutLocations'));

export default function AboutUs() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/about`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch About Us data:", error);
      }
    };
    fetchData();
  }, []);

  if (!data) return (
    <div className="bg-[#050505] min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-yellow-500 font-bruno text-xl">Creating Legacy...</div>
    </div>
  );

  return (
    <div className="bg-[#050505] text-white min-h-screen selection:bg-yellow-500/30">
      <Navbar />

      <main>
        <AboutHero data={data.hero} />
        <AboutStory data={data.story} />
        <AboutFeatures data={data.features} />
        <AboutLocations data={data.locations} />
        <AboutCallToAction data={data.cta} />
      </main>

      <FooterSection />
    </div>
  );
}