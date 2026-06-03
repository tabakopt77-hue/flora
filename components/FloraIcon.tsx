import React from 'react';

export const FloraIcon = ({ className = "w-12 h-12 md:w-14 md:h-14" }) => {
  return (
    <div className={`relative flex items-center justify-center pointer-events-none drop-shadow-[0_4px_12px_rgba(255,255,255,0.2)] ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_40s_linear_infinite]" preserveAspectRatio="xMidYMid meet">
            <defs>
                <radialGradient id="centerGrad" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="40%" stopColor="#facc15" />
                    <stop offset="100%" stopColor="#ca8a04" />
                </radialGradient>
                <filter id="drop-shadow" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.4"/>
                </filter>
            </defs>

            {/* Bloom Glow */}
            <circle cx="50" cy="50" r="40" fill="#ffffff" opacity="0.1" filter="blur(10px)" />

            {/* Petals */}
            <g filter="url(#drop-shadow)">
                {[...Array(16)].map((_, i) => (
                <path 
                    key={i}
                    d="M 46 40 C 42 15, 46 2, 50 2 C 54 2, 58 15, 54 40 Z"
                    fill="#ffffff"
                    transform={`rotate(${i * 22.5} 50 50)`}
                />
                ))}
            </g>
            
            {/* Center pistil body */}
            <circle cx="50" cy="50" r="16" fill="url(#centerGrad)" filter="url(#drop-shadow)" />
            
            {/* Center texture spots */}
            <g opacity="0.6">
                {[...Array(60)].map((_, i) => {
                    const angle = Math.random() * Math.PI * 2;
                    const r = Math.sqrt(Math.random()) * 13;
                    return (
                        <circle 
                            key={`dot-${i}`}
                            cx={50 + Math.cos(angle) * r}
                            cy={50 + Math.sin(angle) * r}
                            r={0.8 + Math.random()}
                            fill="#713f12"
                        />
                    );
                })}
                {/* Highlight layer */}
                {[...Array(30)].map((_, i) => {
                    const angle = Math.random() * Math.PI * 2;
                    const r = Math.sqrt(Math.random()) * 14;
                    if(r < 8) {
                        return (
                           <circle 
                               key={`hdot-${i}`}
                               cx={50 + Math.cos(angle) * r - 2}
                               cy={50 + Math.sin(angle) * r - 2}
                               r={0.5 + Math.random()}
                               fill="#fef08a"
                           />
                        );
                    }
                    return null;
                })}
            </g>
        </svg>
    </div>
  );
};

