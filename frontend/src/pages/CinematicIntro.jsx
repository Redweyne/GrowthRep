import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CinematicIntro = ({ onComplete, userName }) => {
  const [phase, setPhase] = useState(0);
  const firstName = userName?.split(' ')[0] || 'Champion';

  const phases = [
    // Phase 0: Darkness awakens - let them settle in
    { duration: 2500 },
    // Phase 1: The question that starts it all - give time to absorb
    { duration: 7000 },
    // Phase 2: The uncomfortable truth - powerful quote needs breathing room
    { duration: 8000 },
    // Phase 3: The promise - this is the commitment, let it sink in
    { duration: 7000 },
    // Phase 4: Their name - recognition and personal connection
    { duration: 5000 },
    // Phase 5: The invitation - final moment before transformation
    { duration: 5000 },
  ];

  useEffect(() => {
    let elapsed = 0;
    const timers = phases.map((p, idx) => {
      elapsed += idx === 0 ? 0 : phases[idx - 1].duration;
      return setTimeout(() => setPhase(idx), elapsed);
    });

    // Final completion
    const totalTime = phases.reduce((sum, p) => sum + p.duration, 0);
    const completeTimer = setTimeout(() => onComplete(), totalTime);

    return () => {
      timers.forEach(t => clearTimeout(t));
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const skipIntro = useCallback(() => {
    onComplete();
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center overflow-hidden cursor-pointer" onClick={skipIntro}>
      {/* Deep space background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black" />
      
      {/* Breathing ambient glow */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.05, 0.12, 0.05]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: 'radial-gradient(circle, rgba(212,165,116,0.3) 0%, transparent 70%)' }}
      />

      {/* Particle field - subtle floating dots */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#d4a574]/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Main content container */}
      <div className="relative z-10 text-center px-8 max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {/* Phase 0: Darkness awakens - a single line */}
          {phase === 0 && (
            <motion.div
              key="phase0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="space-y-8"
            >
              <motion.div
                className="h-px w-0 mx-auto bg-gradient-to-r from-transparent via-[#d4a574] to-transparent"
                animate={{ width: 200 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </motion.div>
          )}

          {/* Phase 1: The question that starts everything */}
          {phase === 1 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="space-y-8"
            >
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.5 }}
                className="text-2xl md:text-4xl text-white/70 font-light leading-relaxed"
              >
                What if the only thing standing between you
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 2.2 }}
                className="text-2xl md:text-4xl text-white font-light leading-relaxed"
              >
                and the person you want to become...
              </motion.p>
              <motion.p
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 4.2 }}
                className="text-3xl md:text-5xl text-[#d4a574] font-semibold pt-4"
              >
                ...is showing up every day?
              </motion.p>
            </motion.div>
          )}

          {/* Phase 2: The uncomfortable truth */}
          {phase === 2 && (
            <motion.div
              key="phase2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="space-y-10"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="text-xl md:text-2xl text-white/50 font-light italic"
              >
                "We are what we repeatedly do.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 2.5 }}
                className="text-3xl md:text-5xl text-white font-bold leading-tight"
              >
                Excellence, then, is not an act,
              </motion.p>
              <motion.p
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 4.8 }}
                className="text-4xl md:text-6xl text-[#d4a574] font-bold"
              >
                but a habit."
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: 0.8, delay: 6.5 }}
                className="text-lg text-white/40 pt-4"
              >
                — Aristotle
              </motion.p>
            </motion.div>
          )}

          {/* Phase 3: The promise */}
          {phase === 3 && (
            <motion.div
              key="phase3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="space-y-12"
            >
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.5 }}
                className="text-2xl md:text-3xl text-white/70 font-light"
              >
                This is not another productivity app.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 2.5 }}
                className="text-3xl md:text-5xl text-white font-semibold leading-tight"
              >
                This is a system for becoming
              </motion.p>
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, delay: 4.5, type: "spring" }}
                className="text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-[#d4a574] via-[#e8c496] to-[#d4a574] font-bold"
              >
                who you were meant to be.
              </motion.p>
            </motion.div>
          )}

          {/* Phase 4: Their name - recognition */}
          {phase === 4 && (
            <motion.div
              key="phase4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="space-y-8"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="text-xl md:text-2xl text-white/50"
              >
                Welcome,
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.5, delay: 1.5, type: "spring", stiffness: 100 }}
                className="text-6xl md:text-9xl font-bold text-white tracking-tight"
              >
                {firstName}
              </motion.h1>
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 150, opacity: 1 }}
                transition={{ duration: 1, delay: 2.8 }}
                className="h-1 mx-auto bg-gradient-to-r from-transparent via-[#d4a574] to-transparent"
              />
            </motion.div>
          )}

          {/* Phase 5: The invitation */}
          {phase === 5 && (
            <motion.div
              key="phase5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="space-y-10"
            >
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.5 }}
                className="text-2xl md:text-4xl text-white font-light"
              >
                Your journey of transformation
              </motion.p>
              <motion.p
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, delay: 2 }}
                className="text-4xl md:text-6xl text-[#d4a574] font-bold"
              >
                begins now.
              </motion.p>
              
              {/* Loading indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3.5 }}
                className="pt-8"
              >
                <div className="flex items-center justify-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-[#d4a574]"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 3 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm text-white/30"
      >
        Click anywhere to skip
      </motion.p>

      {/* Elegant vignette overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_30%,_rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
};

export default CinematicIntro;
