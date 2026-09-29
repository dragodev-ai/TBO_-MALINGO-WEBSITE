import React from 'react';
import { BackgroundVideo } from './components/BackgroundVideo';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';

export const App: React.FC = () => {
  return (
    <main className="relative min-h-screen w-full bg-white text-black overflow-hidden select-none">
      {/* Background Video with Mouse-Scrubbing & Reference Image Poster */}
      <BackgroundVideo />

      {/* Fixed Navbar (z-index: 10) & Mobile Overlay (z-index: 9) */}
      <Navbar />

      {/* Hero Section (z-index: 1) */}
      <Hero />
    </main>
  );
};

export default App;
