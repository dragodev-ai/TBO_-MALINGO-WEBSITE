import React, { useState, useEffect } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';

const TYPEWRITER_TEXT =
  'Glad you stopped in. Good taste tends to find us. Now, what are we building?';

export const Hero: React.FC = () => {
  const { displayed, done } = useTypewriter(TYPEWRITER_TEXT, 38, 600);
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setButtonsVisible(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('hello@mainframe.co');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const actionButtons = [
    'Pitch us an idea',
    'Come work here',
    'Send a brief hello',
    'See how we operate',
  ];

  return (
    <section className="relative z-[1] h-screen w-full flex flex-col justify-end pb-12 md:justify-center md:pb-0 px-5 sm:px-8 md:px-10 overflow-hidden">
      <div className="max-w-xl relative z-10">
        {/* 1. Blurred intro label */}
        <div
          className="pointer-events-none select-none mb-5 sm:mb-6"
          style={{
            fontSize: 'clamp(18px, 4vw, 26px)',
            lineHeight: 1.3,
            fontWeight: 400,
            color: '#000',
            filter: 'blur(4px)',
          }}
        >
          Hey there, meet A.R.I.A,
          <br />
          Mainframe's Adaptive Response Interface Agent
        </div>

        {/* 2. Typewriter text */}
        <p
          className="text-black mb-5 sm:mb-6"
          style={{
            fontSize: 'clamp(18px, 4vw, 26px)',
            lineHeight: 1.35,
            fontWeight: 400,
            minHeight: '54px',
          }}
        >
          {displayed}
          {!done && (
            <span
              className="inline-block w-[2px] h-[1.1em] bg-black align-middle ml-[2px] animate-blink"
              aria-hidden="true"
            />
          )}
        </p>

        {/* 3. Action pill buttons */}
        <div
          className="flex flex-wrap gap-y-1"
          style={{
            opacity: buttonsVisible ? 1 : 0,
            transform: buttonsVisible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}
        >
          {actionButtons.map((label) => (
            <button
              key={label}
              type="button"
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer shadow-sm"
            >
              {label}
            </button>
          ))}

          {/* 1 outline pill button */}
          <button
            type="button"
            onClick={handleCopyEmail}
            title="Copy email to clipboard"
            className="inline-flex items-center justify-center text-black bg-white/40 border border-black rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap gap-2 sm:gap-3 hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer shadow-sm"
          >
            <span>
              Reach us:{' '}
              <span className="underline underline-offset-1">
                {copied ? 'Copied to clipboard!' : 'hello@mainframe.co'}
              </span>
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="inline-block shrink-0"
              aria-hidden="true"
            >
              <rect
                x="3.5"
                y="3.5"
                width="7"
                height="7"
                rx="1"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
              <path
                d="M2.5 8.5H2C1.44772 8.5 1 8.05228 1 7.5V2C1 1.44772 1.44772 1 2 1H7.5C8.05228 1 8.5 1.44772 8.5 2V2.5"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};
