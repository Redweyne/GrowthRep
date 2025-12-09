import { useEffect, useState, useMemo } from 'react';

const AtmosphericEffects = ({ intensity = 'medium', type = 'stars' }) => {
  const [particles, setParticles] = useState([]);

  const effectTypes = {
    stars: {
      count: intensity === 'low' ? 30 : intensity === 'medium' ? 50 : 80,
      color: '#ffffff',
      size: [1, 3],
      speed: [10, 30],
      twinkle: true
    },
    sparkles: {
      count: intensity === 'low' ? 20 : intensity === 'medium' ? 35 : 60,
      color: '#d4a574',
      size: [2, 5],
      speed: [5, 15],
      twinkle: true
    },
    fireflies: {
      count: intensity === 'low' ? 15 : intensity === 'medium' ? 25 : 40,
      color: '#fbbf24',
      size: [3, 6],
      speed: [8, 20],
      glow: true
    },
    snow: {
      count: intensity === 'low' ? 40 : intensity === 'medium' ? 70 : 120,
      color: '#ffffff',
      size: [2, 4],
      speed: [3, 8],
      sway: true
    }
  };

  const config = effectTypes[type] || effectTypes.stars;

  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < config.count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: config.size[0] + Math.random() * (config.size[1] - config.size[0]),
        speed: config.speed[0] + Math.random() * (config.speed[1] - config.speed[0]),
        delay: Math.random() * 5,
        opacity: 0.3 + Math.random() * 0.7
      });
    }
    setParticles(newParticles);
  }, [type, intensity]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {particles.map(particle => (
        <div
          key={particle.id}
          className={`absolute rounded-full ${config.twinkle ? 'animate-twinkle' : ''} ${config.glow ? 'blur-sm' : ''}`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: config.color,
            opacity: particle.opacity,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.speed}s`,
            boxShadow: config.glow ? `0 0 10px ${config.color}` : 'none'
          }}
        />
      ))}
    </div>
  );
};

export default AtmosphericEffects;
