import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const PARTICLE_COUNT = 60;

interface ParticleData {
  id: number;
  x: number;
  y: number;
  z: number; // 0 (far) to 1 (near)
  size: number;
  color: string;
  duration: number;
  delay: number;
  opacity: number;
}

// Generate stable particles outside component to prevent hydration skips / jumping
const particles: ParticleData[] = [];
for (let i = 0; i < PARTICLE_COUNT; i++) {
  // Balanced color mix: mostly soft white/cream, some subtle emerald
  const isEmerald = Math.random() > 0.7; 
  // Power biased depth for more background particles
  const z = Math.pow(Math.random(), 2); 
  
  particles.push({
    id: i,
    x: Math.random() * 100, // % width
    y: Math.random() * 100, // % height
    z: z,
    size: z * 2.5 + 1.5, // Tiny sizes: 1.5px to 4px
    opacity: z * 0.3 + 0.15, // Semi-transparent 0.15 to 0.45
    color: isEmerald ? '#10b981' : '#f8fafc',
    duration: Math.random() * 20 + 20, // 20-40s drifting
    delay: -Math.random() * 20, // Random start
  });
}

export const AIFloralBackground: React.FC = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooths the mouse jumping, adding 'weight'
  const springConfig = { damping: 30, stiffness: 100, mass: 1 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize from -0.5 to 0.5 based on screen center
      mouseX.set((e.clientX / window.innerWidth) - 0.5);
      mouseY.set((e.clientY / window.innerHeight) - 0.5);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden mix-blend-screen opacity-90" style={{ perspective: '1000px' }}>
      
      {/* Soft gradient to act as the "glass" base layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/5 via-transparent to-white/5 backdrop-blur-[1px]" />

      {particles.map((p) => {
        // The closer the particle (z -> 1), the more it reacts to mouse (parallax)
        const parallaxStrength = (p.z + 0.2) * 60; 
        
        // Reverse mapping so particles move opposite to the mouse direction, creating depth
        const xOffset = useTransform(smoothMouseX, [-0.5, 0.5], [parallaxStrength, -parallaxStrength]);
        const yOffset = useTransform(smoothMouseY, [-0.5, 0.5], [parallaxStrength, -parallaxStrength]);

        // Farther away = more blur
        const blurAmount = (1 - p.z) * 1.5; 

        return (
          <motion.div
            key={p.id}
            className="absolute rounded-full flex items-center justify-center will-change-transform"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              x: xOffset,
              y: yOffset,
            }}
          >
            <motion.div
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                opacity: p.opacity,
                filter: `blur(${blurAmount}px)`,
                borderRadius: '50%',
                boxShadow: `0 0 ${p.size * 1.5}px ${p.color}`,
              }}
              animate={{
                // Gentle continuous drifting
                y: [0, p.z * 30 - 15, 0],
                x: [0, p.z * 20 - 10, 0],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: p.delay,
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};
