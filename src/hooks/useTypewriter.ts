import { useState, useEffect } from 'react';

/**
 * Custom hook to type out text character by character.
 * @param text The full string to be typed out
 * @param speed Speed in ms per character (default: 38ms)
 * @param startDelay Delay in ms before typing starts (default: 600ms)
 * @returns Object containing current displayed text and completion boolean
 */
export function useTypewriter(
  text: string,
  speed: number = 38,
  startDelay: number = 600
): { displayed: string; done: boolean } {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let intervalId: ReturnType<typeof setInterval>;
    let currentIndex = 0;

    setDisplayed('');
    setDone(false);

    timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        currentIndex++;
        if (currentIndex <= text.length) {
          setDisplayed(text.slice(0, currentIndex));
        }
        if (currentIndex >= text.length) {
          setDone(true);
          clearInterval(intervalId);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}
