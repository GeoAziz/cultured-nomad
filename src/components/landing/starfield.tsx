"use client";

import React, { useState, useEffect, useRef } from 'react';

const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();
    
    const stars: { x: number; y: number; z: number }[] = [];
    const numStars = 800;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * canvas.width,
      });
    }

    const draw = () => {
      ctx.fillStyle = 'hsl(288 56% 4%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const star of stars) {
        star.z -= 0.5;
        if (star.z <= 0) {
          star.x = Math.random() * canvas.width;
          star.y = Math.random() * canvas.height;
          star.z = canvas.width;
        }

        const sx = (star.x - canvas.width / 2) * (canvas.width / star.z) + canvas.width / 2;
        const sy = (star.y - canvas.height / 2) * (canvas.width / star.z) + canvas.height / 2;
        const r = Math.max(0.1, (1 - star.z / canvas.width) * 2);

        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, 2 * Math.PI);
        const opacity = 1 - star.z / canvas.width;
        
        // Add a glow effect
        const random = Math.random();
        if (random > 0.99) {
          ctx.fillStyle = `rgba(41, 160, 236, ${opacity})`; // Accent glow
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(41, 160, 236, 0.8)';
        } else if (random > 0.98) {
          ctx.fillStyle = `rgba(190, 41, 236, ${opacity})`; // Primary glow
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(190, 41, 236, 0.8)';
        } else {
          ctx.fillStyle = `rgba(242, 239, 243, ${opacity})`; // Standard star
          ctx.shadowBlur = 0;
        }

        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow for next star
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full -z-10" />;
};

export default Starfield;
