"use client";

import { useState, useEffect } from 'react';

type TypewriterProps = {
  text: string;
  speed?: number;
};

const Typewriter = ({ text, speed = 50 }: TypewriterProps) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, speed);

    return () => {
      clearInterval(typingInterval);
    };
  }, [text, speed]);

  return (
    <>
      {displayedText}
      <span className="animate-ping">_</span>
    </>
  );
};

export default Typewriter;
