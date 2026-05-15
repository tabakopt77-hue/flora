import React from 'react';
import { motion } from 'framer-motion';
import { VoiceState } from '../hooks/useVoiceConversation';

interface VoiceVisualizerProps {
  state: VoiceState;
  audioLevel: number;
  transcript: string;
  onClose: () => void;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ state, audioLevel, transcript, onClose }) => {
  // Determine animation properties based on state
  const getOrbAnimation = () => {
    switch (state) {
      case 'listening':
        return {
          scale: [1, 1 + audioLevel * 0.5, 1],
          opacity: [0.6, 0.8 + audioLevel * 0.2, 0.6],
          boxShadow: [
            '0 0 20px rgba(0, 229, 255, 0.3)',
            `0 0 ${40 + audioLevel * 40}px rgba(0, 229, 255, 0.6)`,
            '0 0 20px rgba(0, 229, 255, 0.3)'
          ],
          transition: { duration: 0.3, repeat: Infinity, ease: 'easeInOut' as const }
        };
      case 'processing':
        return {
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360],
          borderRadius: ['50%', '40%', '50%'],
          boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)',
          backgroundColor: ['rgba(0, 229, 255, 0.2)', 'rgba(168, 85, 247, 0.4)', 'rgba(0, 229, 255, 0.2)'],
          transition: { duration: 2, repeat: Infinity, ease: 'linear' as const }
        };
      case 'speaking':
        return {
          scale: [1, 1 + audioLevel * 0.3, 1],
          opacity: [0.8, 1, 0.8],
          boxShadow: [
            '0 0 30px rgba(215, 255, 0, 0.4)',
            `0 0 ${50 + audioLevel * 50}px rgba(215, 255, 0, 0.8)`,
            '0 0 30px rgba(215, 255, 0, 0.4)'
          ],
          backgroundColor: 'rgba(215, 255, 0, 0.2)',
          transition: { duration: 0.2, repeat: Infinity, ease: 'easeInOut' as const }
        };
      default:
        return {
          scale: 1,
          opacity: 0.5,
          boxShadow: '0 0 10px rgba(0, 229, 255, 0.2)',
          transition: { duration: 0.5 }
        };
    }
  };

  const getStatusText = () => {
    switch (state) {
      case 'listening': return 'Слушаю вас...';
      case 'processing': return 'Flora думает...';
      case 'speaking': return 'Flora говорит...';
      default: return 'Готов';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
      exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 overflow-hidden"
    >
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      {/* Main Orb */}
      <div className="relative flex items-center justify-center w-64 h-64 mb-12">
        {/* Outer Glow Rings */}
        <motion.div 
          className="absolute inset-0 rounded-full border border-cyan-500/20"
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0 }}
        />
        <motion.div 
          className="absolute inset-0 rounded-full border border-cyan-500/20"
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1 }}
        />

        {/* The Orb */}
        <motion.div
          className="w-32 h-32 rounded-full bg-cyan-500/20 backdrop-blur-md border border-cyan-400/50 flex items-center justify-center"
          animate={getOrbAnimation()}
        >
          {/* Inner Core */}
          <motion.div 
            className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-300 to-blue-600"
            animate={state === 'speaking' ? { backgroundColor: ['#00E5FF', '#D7FF00', '#00E5FF'] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </div>

      {/* Status Text */}
      <motion.h2 
        className="text-2xl md:text-3xl font-serif text-white mb-4 tracking-wide"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {getStatusText()}
      </motion.h2>

      {/* Real-time Transcript */}
      <div className="h-24 px-8 max-w-lg text-center">
        <p className="text-cyan-100/80 text-lg md:text-xl font-light leading-relaxed">
          {transcript || (state === 'listening' ? '...' : '')}
        </p>
      </div>
    </motion.div>
  );
};
