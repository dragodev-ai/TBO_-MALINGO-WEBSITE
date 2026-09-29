import React, { useState } from 'react';

export const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 w-full z-10 px-5 sm:px-8 py-4 sm:py-5 flex justify-between items-center">
        {/* Logo (left) */}
        <div className="flex items-center gap-3">
          <span
            className="text-[21px] sm:text-[26px] tracking-tight text-black select-none"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Mainframe®
          </span>
          <span
            className="text-[25px] sm:text-[30px] text-black select-none leading-none"
            style={{ letterSpacing: '-0.02em' }}
            aria-hidden="true"
          >
            ✳︎
          </span>
        </div>

        {/* Desktop Nav Links (center, hidden below md) */}
        <div className="hidden md:flex items-center text-[23px] text-black">
          <a href="#labs" className="hover:opacity-60 transition-opacity">
            Labs
          </a>
          <span>, </span>
          <a href="#studio" className="hover:opacity-60 transition-opacity">
            Studio
          </a>
          <span>, </span>
          <a href="#openings" className="hover:opacity-60 transition-opacity">
            Openings
          </a>
          <span>, </span>
          <a href="#shop" className="hover:opacity-60 transition-opacity">
            Shop
          </a>
        </div>

        {/* Desktop CTA (right, hidden below md) */}
        <div className="hidden md:block">
          <a
            href="#contact"
            className="text-[23px] text-black underline underline-offset-2 hover:opacity-60 transition-opacity"
          >
            Get in touch
          </a>
        </div>

        {/* Mobile Hamburger (visible below md) */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="md:hidden flex flex-col justify-center items-center gap-[5px] z-20 cursor-pointer p-1"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span
            className={`w-6 h-[2px] bg-black transition-all duration-300 ease-in-out ${
              menuOpen ? 'rotate-45 translate-y-[7px]' : ''
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-black transition-all duration-300 ease-in-out ${
              menuOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-black transition-all duration-300 ease-in-out ${
              menuOpen ? '-rotate-45 -translate-y-[7px]' : ''
            }`}
          />
        </button>
      </nav>

      {/* Mobile Overlay (z-index: 9) */}
      <div
        className={`fixed inset-0 z-[9] bg-white/95 backdrop-blur-sm flex flex-col justify-center items-start px-8 gap-8 transition-opacity duration-300 md:hidden ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <a
          href="#labs"
          onClick={() => setMenuOpen(false)}
          className="text-[32px] font-medium text-black hover:opacity-60 transition-opacity"
        >
          Labs
        </a>
        <a
          href="#studio"
          onClick={() => setMenuOpen(false)}
          className="text-[32px] font-medium text-black hover:opacity-60 transition-opacity"
        >
          Studio
        </a>
        <a
          href="#openings"
          onClick={() => setMenuOpen(false)}
          className="text-[32px] font-medium text-black hover:opacity-60 transition-opacity"
        >
          Openings
        </a>
        <a
          href="#shop"
          onClick={() => setMenuOpen(false)}
          className="text-[32px] font-medium text-black hover:opacity-60 transition-opacity"
        >
          Shop
        </a>
        <a
          href="#contact"
          onClick={() => setMenuOpen(false)}
          className="text-[32px] font-medium text-black underline underline-offset-2 hover:opacity-60 transition-opacity"
        >
          Get in touch
        </a>
      </div>
    </>
  );
};
