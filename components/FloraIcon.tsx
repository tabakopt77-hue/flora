import React from 'react';

// Pre-calculate aster petals
const PETAL_COUNT = 45;
const petals = Array.from({ length: PETAL_COUNT }).map((_, i) => {
  const angle = (i * 360) / PETAL_COUNT;
  // Alternate petal lengths for a more natural look
  const length = i % 2 === 0 ? 42 : 36;
  const width = i % 2 === 0 ? 3 : 2.5;
  return { angle, length, width };
});

// Pre-calculate inner petals
const INNER_PETAL_COUNT = 30;
const innerPetals = Array.from({ length: INNER_PETAL_COUNT }).map((_, i) => {
  const angle = (i * 360) / INNER_PETAL_COUNT + 5; // Offset slightly
  const length = i % 2 === 0 ? 25 : 20;
  const width = 2;
  return { angle, length, width };
});

export const FloraIcon = ({ className = "w-6 h-6" }) => {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="asterCenter" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="70%" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="petalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="innerPetalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Outer ambient glow */}
      <circle cx="50" cy="50" r="48" fill="url(#asterCenter)" opacity="0.15" className="animate-pulse" style={{ animationDuration: '3s' }} />

      {/* Outer Petals (Clockwise slow rotation) */}
      <g className="origin-center animate-[spin_40s_linear_infinite]">
        {petals.map((petal, i) => (
          <path
            key={`outer-${i}`}
            d={`M 50 50 Q ${50 + petal.width * 2} ${50 - petal.length / 2} 50 ${50 - petal.length} Q ${50 - petal.width * 2} ${50 - petal.length / 2} 50 50`}
            fill="url(#petalGradient)"
            transform={`rotate(${petal.angle} 50 50)`}
            opacity="0.8"
          />
        ))}
      </g>

      {/* Inner Petals (Counter-clockwise slow rotation) */}
      <g className="origin-center animate-[spin_30s_linear_infinite_reverse]">
        {innerPetals.map((petal, i) => (
          <path
            key={`inner-${i}`}
            d={`M 50 50 Q ${50 + petal.width * 2} ${50 - petal.length / 2} 50 ${50 - petal.length} Q ${50 - petal.width * 2} ${50 - petal.length / 2} 50 50`}
            fill="url(#innerPetalGradient)"
            transform={`rotate(${petal.angle} 50 50)`}
            opacity="0.9"
          />
        ))}
      </g>

      {/* Aster Center (Pulsing) */}
      <circle 
        cx="50" 
        cy="50" 
        r="8" 
        fill="url(#asterCenter)" 
        className="origin-center animate-pulse" 
        style={{ animationDuration: '2s' }} 
      />
      
      {/* Center dots (seeds/disc florets) */}
      <g className="origin-center animate-[spin_15s_linear_infinite]">
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 360) / 12;
          const r = 4;
          return (
            <circle
              key={`seed-${i}`}
              cx={50 + Math.cos((angle * Math.PI) / 180) * r}
              cy={50 + Math.sin((angle * Math.PI) / 180) * r}
              r="1"
              fill="#FFFFFF"
              opacity="0.8"
            />
          );
        })}
      </g>
    </svg>
  );
};
