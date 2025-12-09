import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Trophy, Star, Sparkles, Crown, Award, Target, 
  Flame, Zap, X, PartyPopper, Volume2, VolumeX
} from 'lucide-react';

const achievementTypes = {
  goal_completed: {
    icon: Trophy,
    color: 'from-yellow-400 to-amber-600',
    title: 'Goal Achieved!',
    particles: '🎉'
  },
  streak_milestone: {
    icon: Flame,
    color: 'from-orange-500 to-red-600',
    title: 'Streak Milestone!',
    particles: '🔥'
  },
  habit_formed: {
    icon: Zap,
    color: 'from-blue-500 to-purple-600',
    title: 'Habit Formed!',
    particles: '⚡'
  },
  level_up: {
    icon: Crown,
    color: 'from-[#d4a574] to-[#b8885f]',
    title: 'Level Up!',
    particles: '👑'
  },
  first_goal: {
    icon: Target,
    color: 'from-green-500 to-emerald-600',
    title: 'First Goal!',
    particles: '🎯'
  },
  perfect_week: {
    icon: Award,
    color: 'from-indigo-500 to-pink-600',
    title: 'Perfect Week!',
    particles: '✨'
  }
};

const CelebrationModal = ({ achievement, onClose }) => {
  const [show, setShow] = useState(false);
  const [particles, setParticles] = useState([]);
  const [confetti, setConfetti] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    if (achievement) {
      setShow(true);
      generateParticles();
      generateConfetti();
      
      // Play celebration sound
      if (soundEnabled && audioRef.current) {
        audioRef.current.play().catch(() => {
          // Ignore autoplay errors
        });
      }
      
      // Auto-close after 6 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [achievement]);

  const generateParticles = () => {
    const newParticles = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 3,
        scale: 0.5 + Math.random() * 1
      });
    }
    setParticles(newParticles);
  };

  const generateConfetti = () => {
    const newConfetti = [];
    const colors = ['#d4a574', '#e6b786', '#f5d9b8', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'];
    for (let i = 0; i < 60; i++) {
      newConfetti.push({
        id: i,
        x: 20 + Math.random() * 60,
        y: -10,
        rotation: Math.random() * 360,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    setConfetti(newConfetti);
  };

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!achievement) return null;

  const achievementData = achievementTypes[achievement.type] || achievementTypes.goal_completed;
  const Icon = achievementData.icon;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Confetti Rain */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confetti.map(piece => (
          <div
            key={`confetti-${piece.id}`}
            className="absolute w-3 h-3 animate-float-up"
            style={{
              left: `${piece.x}%`,
              top: `${piece.y}%`,
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              transform: `rotate(${piece.rotation}deg)`,
              borderRadius: Math.random() > 0.5 ? '50%' : '0'
            }}
          />
        ))}
      </div>

      {/* Celebration Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map(particle => (
          <div
            key={`particle-${particle.id}`}
            className="absolute text-4xl animate-float-up"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              transform: `scale(${particle.scale})`
            }}
          >
            {achievementData.particles}
          </div>
        ))}
      </div>

      {/* Content */}
      <Card className={`relative glass border-2 border-[#d4a574] p-8 max-w-md w-full transform transition-all duration-500 ${show ? 'scale-100 rotate-0' : 'scale-75 -rotate-12'} shadow-2xl shadow-[#d4a574]/50`}>
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            onClick={() => setSoundEnabled(!soundEnabled)}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </Button>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Hidden audio element for celebration sound */}
        <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSV9zPDThjMHHm7A7+OZSBEMUZDE8M97MwccbsrvzpJLEQ1Mje/xwHMlBSuEyvDXhzYIGmm+7OShUQ0NTJHs8bp3LAkifsn53Y4+ChlfuOzno1cMDkt/6vKxXycFKn/M7tGGOwoYabzs46NXDQ5LfOrypWAdBSh+zu7Tizn8DFWw5u+qWBQNS5ft8LtzJgUsgsrv1Ic0CBpqvuzkoVYQCUpgzo7LhDcJHnDA7t+WTxEOUI/w88FzJwYrgcrx2ogzAB1rvu7mnVEPDlGP8fTAcCQFLIHO8dqJMwAdbbzuztCGOwoXabTs5KFYEAxLfuzwoFYNDUqP7PG6dSwJIn7L8N+PQAkXabvs46FWEAxKfu3yrF0cBSd+ze/SkUcGF2e67OSgVRAMSn7s8qxeHAYmfdDv1JBHBhZpvOzloVYQC0p+7fKrXRsGJn3Q79SQRwYWabzs5aFWEAtLfu3yq10bBiZ90O/UkEcGFmm87OWhVhAMSn7t8qtdGwYmfdDv1JBHBhZpvOzloVYQC0p+7fKrXRsGJn3Q79SQRwYWabzs5aFWEAtLfu3yq10bBiZ90O/UkEcGFmm87OWhVhALSn7t8qpeGwYmfdDv1JBHBhZpvOzloVYQC0p+7fKrXRsGJn3Q79SQRwYWabzs5aFWEAtLfu3yq10bBiZ90O/UkEcGFmm87OWhVhALS37t8qtdGwYmfdDv1JBHBhZpvO3ko1gQC0t+7fKrXhsGJn3Q79SQRwYWabzt5KNYEAtLfu3yq14bBiZ90O/UkEcGFmm87eShWBALS37t8qteGwYmfdDv1JBHBhZpvO3ko1gQC0t+7fKrXhsGJn3Q79SQRwYWabzt5KNYEAtLfu3yq14bBiZ90O/UkEcGFmm87eShWBALS37t8qteGwYmfdDv1JBHBhZpvO3ko1gQC0t+7fKrXhsGJn3Q79SQRwYWab" preload="auto" />


        <div className="text-center space-y-6">
          {/* Icon with animation */}
          <div className="relative inline-block">
            <div className={`absolute inset-0 bg-gradient-to-r ${achievementData.color} opacity-20 blur-3xl animate-pulse`}></div>
            <div className={`relative p-6 rounded-full bg-gradient-to-r ${achievementData.color}/10 border-2 border-[#d4a574] animate-bounce-slow`}>
              <Icon className={`w-20 h-20 text-transparent bg-clip-text bg-gradient-to-r ${achievementData.color}`} />
            </div>
          </div>

          {/* Title */}
          <div>
            <h2 className={`text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r ${achievementData.color}`}>
              {achievementData.title}
            </h2>
            <p className="text-xl text-gray-200 font-semibold">
              {achievement.title}
            </p>
          </div>

          {/* Description */}
          {achievement.description && (
            <p className="text-gray-400 leading-relaxed">
              {achievement.description}
            </p>
          )}

          {/* Stats or rewards */}
          {achievement.reward && (
            <div className="bg-[#1a1625] border border-[#d4a574]/30 rounded-xl p-4">
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#d4a574]" />
                <span className="text-gray-300">{achievement.reward}</span>
              </div>
            </div>
          )}

          {/* CTA Button */}
          <Button
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-[#d4a574] to-[#b8885f] hover:from-[#e6b786] hover:to-[#d4a574] text-white"
          >
            Continue Your Journey
          </Button>

          {/* Motivational quote */}
          <p className="text-sm text-gray-500 italic">
            "{achievement.quote || 'Every achievement brings you one step closer to your dreams.'}"
          </p>
        </div>
      </Card>
    </div>
  );
};

export default CelebrationModal;
