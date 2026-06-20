'use client';

import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import FeaturedBusinesses from '@/components/FeaturedBusinesses';
import Features from '@/components/Features';
import SocialCommerceSection from '@/components/SocialCommerceSection';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Categories />
        <FeaturedBusinesses />
        <Features />
        <SocialCommerceSection />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
