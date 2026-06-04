import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import mascotImg from '../src/assets/images/3d_mascot_cat_1780590928827.png';

interface FloramosMascotProps {
  className?: string;
  message?: string;
}

export default function FloramosMascot({ className, message = "Жду тебя в команде! 🐾" }: FloramosMascotProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // 3D Parallax effect properties
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 200, mass: 1 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-15, 15]);

  useEffect(() => {
    // Reveal the mascot after a delay
    const appearTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => clearTimeout(appearTimer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const hoverX = (e.clientX - rect.left) / width - 0.5;
    const hoverY = (e.clientY - rect.top) / height - 0.5;
    x.set(hoverX);
    y.set(hoverY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  if (!isVisible) return null;

  return (
    <div className={`pointer-events-none flex items-end relative ${className || ''}`}>
      <motion.div
        className="relative w-36 h-40 sm:w-48 sm:h-52 shrink-0 cursor-pointer pointer-events-auto"
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: 1200 }}
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          animate={{
            y: isHovered ? [0, -5, 0] : [0, 5, 0]
          }}
          transition={{
            duration: isHovered ? 2 : 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-full h-full drop-shadow-2xl flex items-center justify-center relative rounded-full overflow-hidden"
        >
          {/* Shadow underneath */}
          <motion.div 
             className="absolute bottom-2 w-[60%] h-4 bg-black rounded-[100%] blur-xl opacity-50"
             animate={{ scale: isHovered ? [1, 0.9, 1] : [1, 1.1, 1], opacity: isHovered ? 0.3 : 0.5 }}
             transition={{ duration: isHovered ? 2 : 4, repeat: Infinity, ease: "easeInOut" }}
             style={{ transform: "translateZ(-30px)" }}
          />

          <img 
            src={mascotImg}
            alt="Floramos 3D Mascot"
            className="w-full h-full object-cover scale-[1.15]"
            style={{ 
               transform: "translateZ(auto)",
               // Use a radial gradient mask to softly clip the image if it has a non-transparent background
               maskImage: "radial-gradient(circle at center, black 65%, transparent 75%)",
               WebkitMaskImage: "radial-gradient(circle at center, black 65%, transparent 75%)"
            }}
            draggable="false"
          />
        </motion.div>
      </motion.div>

      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
             initial={{ opacity: 0, scale: 0.8, x: -10 }}
             animate={{ opacity: 1, scale: 1, x: 0 }}
             exit={{ opacity: 0, scale: 0.8 }}
             transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 15 }}
             className="absolute right-[75%] bottom-[75%] bg-white text-slate-800 px-5 py-3 rounded-2xl rounded-br-none shadow-[0_15px_30px_rgba(0,0,0,0.15)] font-bold text-sm whitespace-nowrap mb-4 pointer-events-auto z-20 border border-slate-100"
          >
            {message}
            <div className="absolute -bottom-2 right-2 w-4 h-4 bg-white transform rotate-45 border-b border-r border-slate-100"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
