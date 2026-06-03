import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloramosMascotProps {
  className?: string;
  message?: string;
}

export default function FloramosMascot({ className, message = "Жду тебя в команде! 🐾" }: FloramosMascotProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Reveal the mascot after a delay
    const appearTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => clearTimeout(appearTimer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`pointer-events-none flex items-end relative ${className || ''}`}>
      <motion.div
        className="relative w-32 h-32 sm:w-40 sm:h-40 drop-shadow-2xl shrink-0 cursor-pointer pointer-events-auto overflow-visible"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl overflow-visible">
          
          {/* Shadow */}
          <ellipse cx="100" cy="185" rx="55" ry="10" fill="#000000" opacity="0.3" />

          {/* TAIL */}
          <motion.path
            fill="none"
            stroke="#f8fafc"
            strokeWidth="16"
            strokeLinecap="round"
            animate={isHovered ? {
               d: [
                 "M 135 170 C 190 175, 160 90, 195 70",
                 "M 135 170 C 170 185, 180 80, 210 90",
                 "M 135 170 C 200 165, 150 100, 185 60",
                 "M 135 170 C 190 175, 160 90, 195 70"
               ]
            } : {
               d: [
                 "M 135 170 C 180 180, 160 90, 190 70",
                 "M 135 170 C 185 175, 165 95, 195 75",
                 "M 135 170 C 180 180, 160 90, 190 70"
               ]
            }}
            transition={{ duration: isHovered ? 0.8 : 3, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* BODY */}
          <motion.path
            d="M 60 180 C 60 130 140 130 140 180 Z"
            fill="#f8fafc"
            animate={{ scaleY: [1, 0.97, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "100px", originY: "180px" }}
          />

          {/* HEAD GROUP */}
          <motion.g
            style={{ originX: "100px", originY: "120px" }}
            animate={isHovered ? { rotate: [-4, 4, -4] } : { y: [0, 3, 0] }}
            transition={{ duration: isHovered ? 0.6 : 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Left Ear */}
            <path d="M 65 92 L 48 42 L 95 62 Z" fill="#f8fafc" />
            <path d="M 65 85 L 55 52 L 85 67 Z" fill="#fbcfe8" />
            
            {/* Right Ear */}
            <path d="M 135 92 L 152 42 L 105 62 Z" fill="#f8fafc" />
            <path d="M 135 85 L 145 52 L 115 67 Z" fill="#fbcfe8" />
            
            {/* Head Base */}
            <ellipse cx="100" cy="95" rx="46" ry="36" fill="#f8fafc" />
            <ellipse cx="100" cy="115" rx="52" ry="25" fill="#f8fafc" /> 
            
            {/* Eyes Group (Blinking) */}
            <motion.g
              animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
              transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 0.98, 1] }}
              style={{ originY: "90px" }}
            >
               {/* Left Eye */}
               <circle cx="80" cy="90" r="7" fill="#0f172a" />
               <circle cx="82" cy="88" r="2.5" fill="#ffffff" />
               <circle cx="77" cy="92" r="1" fill="#ffffff" />
               
               {/* Right Eye */}
               <circle cx="120" cy="90" r="7" fill="#0f172a" />
               <circle cx="122" cy="88" r="2.5" fill="#ffffff" />
               <circle cx="117" cy="92" r="1" fill="#ffffff" />
            </motion.g>

            {/* Cheeks */}
            <ellipse cx="68" cy="102" rx="7" ry="4" fill="#fbcfe8" opacity="0.7" />
            <ellipse cx="132" cy="102" rx="7" ry="4" fill="#fbcfe8" opacity="0.7" />

            {/* Nose */}
            <ellipse cx="100" cy="102" rx="4.5" ry="3" fill="#f472b6" />

            {/* Mouth */}
            <path d="M 92 108 C 96 112 100 108 100 108 C 100 108 104 112 108 108" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
            
            {/* Whiskers Left */}
            <path d="M 60 98 L 35 94" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            <path d="M 60 105 L 30 105" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            
            {/* Whiskers Right */}
            <path d="M 140 98 L 165 94" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            <path d="M 140 105 L 170 105" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />

          </motion.g>

          {/* BOW TIE */}
          <motion.g
            style={{ originX: "100px", originY: "138px" }}
            animate={isHovered ? { scale: [1, 1.25, 1], rotate: [0, 15, -15, 0] } : { scale: 1 }}
            transition={{ duration: 0.5, repeat: isHovered ? Infinity : 0 }}
          >
            <path d="M 100 138 L 75 120 L 75 156 Z" fill="#10b981" />
            <path d="M 100 138 L 125 120 L 125 156 Z" fill="#10b981" />
            <circle cx="100" cy="138" r="9" fill="#059669" />
          </motion.g>

          {/* Front Paws */}
          <motion.g
            style={{ originX: "80px", originY: "180px" }}
            animate={isHovered ? { x: [0, 15, 0], y: [0, -35, 0], rotate: [0, 20, 0] } : { y: 0, x: 0, rotate: 0 }}
            transition={{ duration: 0.4, repeat: isHovered ? Infinity : 0, repeatDelay: 0.1 }}
          >
            <path d="M 72 195 C 72 165 88 165 88 195 Z" fill="#ffffff" />
            <path d="M 72 195 C 72 165 88 165 88 195" fill="none" stroke="#cbd5e1" strokeWidth="2" />
            <path d="M 77 185 L 77 173" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            <path d="M 83 185 L 83 173" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
          </motion.g>

          <motion.g
            style={{ originX: "120px", originY: "180px" }}
            animate={isHovered ? { x: [0, -15, 0], y: [0, -35, 0], rotate: [0, -20, 0] } : { y: 0, x: 0, rotate: 0 }}
            transition={{ duration: 0.4, repeat: isHovered ? Infinity : 0, repeatDelay: 0.1 }}
          >
            <path d="M 112 195 C 112 165 128 165 128 195 Z" fill="#ffffff" />
            <path d="M 112 195 C 112 165 128 165 128 195" fill="none" stroke="#cbd5e1" strokeWidth="2" />
            <path d="M 117 185 L 117 173" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            <path d="M 123 185 L 123 173" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
          </motion.g>

        </svg>

      </motion.div>

      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
             initial={{ opacity: 0, scale: 0.8, x: -10 }}
             animate={{ opacity: 1, scale: 1, x: 0 }}
             exit={{ opacity: 0, scale: 0.8 }}
             transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 15 }}
             className="absolute right-[70%] bottom-[70%] bg-white text-slate-900 px-5 py-3 rounded-2xl rounded-br-none shadow-2xl font-bold text-sm whitespace-nowrap mb-4 pointer-events-auto z-20"
          >
            {message}
            <div className="absolute -bottom-2 right-2 w-4 h-4 bg-white transform rotate-45 border-b border-r border-slate-100"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
