import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Star, Crown, Flame, Zap, Award, Trophy, Sparkles, 
  TrendingUp, Shield, Gem, Medal, Target, Heart
} from 'lucide-react';

// Level definitions with unlock rewards
const levels = [
  { level: 1, name: 'Awakening', xpRequired: 0, icon: Star, color: 'from-gray-400 to-gray-500', unlock: 'Basic Features' },
  { level: 2, name: 'Seeker', xpRequired: 100, icon: Target, color: 'from-green-400 to-emerald-500', unlock: 'Goal Templates' },
  { level: 3, name: 'Apprentice', xpRequired: 300, icon: Zap, color: 'from-blue-400 to-indigo-500', unlock: 'Custom Rituals' },
  { level: 4, name: 'Journeyman', xpRequired: 600, icon: Flame, color: 'from-orange-400 to-red-500', unlock: 'Advanced Analytics' },
  { level: 5, name: 'Adept', xpRequired: 1000, icon: Shield, color: 'from-purple-400 to-pink-500', unlock: 'AI Memory' },
  { level: 6, name: 'Expert', xpRequired: 1500, icon: Medal, color: 'from-yellow-400 to-amber-500', unlock: 'Mentor Customization' },
  { level: 7, name: 'Master', xpRequired: 2500, icon: Award, color: 'from-teal-400 to-cyan-500', unlock: 'Weekly Challenges' },
  { level: 8, name: 'Sage', xpRequired: 4000, icon: Gem, color: 'from-pink-400 to-rose-500', unlock: 'Exclusive Wisdom' },
  { level: 9, name: 'Champion', xpRequired: 6000, icon: Trophy, color: 'from-amber-400 to-yellow-500', unlock: 'Achievement Badges' },
  { level: 10, name: 'Legend', xpRequired: 10000, icon: Crown, color: 'from-[#d4a574] to-[#e6b786]', unlock: 'Legend Status' },
];

// XP rewards for different actions
export const XP_REWARDS = {
  COMPLETE_GOAL: 50,
  CREATE_GOAL: 10,
  COMPLETE_HABIT: 15,
  MAINTAIN_STREAK_7: 100,
  MAINTAIN_STREAK_30: 500,
  JOURNAL_ENTRY: 20,
  COMPLETE_EXERCISE: 25,
  COMPLETE_RITUAL: 30,
  AI_COACH_SESSION: 10,
  FIRST_GOAL: 50,
  PERFECT_WEEK: 200,
};

// Calculate level from XP
export const calculateLevel = (xp) => {
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].xpRequired) {
      return levels[i];
    }
  }
  return levels[0];
};

// Calculate progress to next level
export const calculateProgress = (xp) => {
  const currentLevel = calculateLevel(xp);
  const currentIndex = levels.findIndex(l => l.level === currentLevel.level);
  const nextLevel = levels[currentIndex + 1];
  
  if (!nextLevel) return 100; // Max level
  
  const xpInCurrentLevel = xp - currentLevel.xpRequired;
  const xpNeededForNext = nextLevel.xpRequired - currentLevel.xpRequired;
  
  return Math.round((xpInCurrentLevel / xpNeededForNext) * 100);
};

// Get XP needed for next level
export const getXPToNextLevel = (xp) => {
  const currentLevel = calculateLevel(xp);
  const currentIndex = levels.findIndex(l => l.level === currentLevel.level);
  const nextLevel = levels[currentIndex + 1];
  
  if (!nextLevel) return 0; // Max level
  
  return nextLevel.xpRequired - xp;
};

// Level Badge Component
export const LevelBadge = ({ xp, size = 'md', showName = true }) => {
  const level = calculateLevel(xp);
  const Icon = level.icon;
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className={`relative ${sizeClasses[size]} rounded-full bg-gradient-to-br ${level.color} flex items-center justify-center shadow-lg`}>
        <Icon className="text-white" size={size === 'sm' ? 16 : size === 'md' ? 24 : 32} />
        <div className="absolute -bottom-1 -right-1 bg-black/80 text-white text-xs font-bold px-1.5 rounded-full border border-white/20">
          {level.level}
        </div>
      </div>
      {showName && (
        <div>
          <p className={`font-semibold text-transparent bg-clip-text bg-gradient-to-r ${level.color}`}>
            {level.name}
          </p>
          <p className="text-xs text-gray-500">Level {level.level}</p>
        </div>
      )}
    </div>
  );
};

// XP Progress Bar Component
export const XPProgressBar = ({ xp, showDetails = true }) => {
  const level = calculateLevel(xp);
  const progress = calculateProgress(xp);
  const xpToNext = getXPToNextLevel(xp);
  const currentIndex = levels.findIndex(l => l.level === level.level);
  const nextLevel = levels[currentIndex + 1];
  
  return (
    <div className="space-y-2">
      {showDetails && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">{xp.toLocaleString()} XP</span>
          {nextLevel && (
            <span className="text-gray-500">{xpToNext.toLocaleString()} XP to {nextLevel.name}</span>
          )}
        </div>
      )}
      <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${level.color} rounded-full transition-all duration-1000 relative overflow-hidden`}
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
};

// Level Up Notification Component
export const LevelUpNotification = ({ newLevel, onClose }) => {
  const level = levels.find(l => l.level === newLevel);
  if (!level) return null;
  
  const Icon = level.icon;

  // Generate particles once with useMemo
  const particles = useMemo(() => 
    [...Array(20)].map((_, i) => ({
      id: i,
      left: 50 + (Math.random() - 0.5) * 100,
      top: 50 + (Math.random() - 0.5) * 100,
      delay: Math.random() * 0.5,
      duration: 1 + Math.random(),
    })), []
  );
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative">
        {/* Particle effects */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-[#d4a574] rounded-full animate-float-particle"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
        
        <Card className="glass border-[#d4a574]/50 p-8 text-center max-w-md animate-scale-in">
          <div className="mb-6">
            <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${level.color} flex items-center justify-center animate-pulse-slow shadow-2xl`}>
              <Icon className="text-white" size={48} />
            </div>
          </div>
          
          <Sparkles className="w-8 h-8 mx-auto text-[#d4a574] mb-4 animate-bounce" />
          
          <h2 className="text-3xl font-bold text-white mb-2">Level Up!</h2>
          <p className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${level.color} mb-4`}>
            {level.name}
          </p>
          
          <div className="bg-[#d4a574]/10 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400 mb-1">New Unlock:</p>
            <p className="text-[#d4a574] font-semibold">{level.unlock}</p>
          </div>
          
          <Button 
            onClick={onClose}
            className="bg-gradient-to-r from-[#d4a574] to-[#e6b786] text-black font-semibold px-8"
          >
            Continue Journey
          </Button>
        </Card>
      </div>
    </div>
  );
};

// Full Level Card Component
const LevelSystem = ({ xp = 0, onLevelUp }) => {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevelReached, setNewLevelReached] = useState(null);
  const level = calculateLevel(xp);
  const progress = calculateProgress(xp);
  
  // Track level changes - use a ref to avoid unnecessary state updates
  useEffect(() => {
    const previousXP = parseInt(localStorage.getItem('previousXP') || '0');
    const previousLevel = calculateLevel(previousXP);
    
    // Store current XP first
    localStorage.setItem('previousXP', xp.toString());
    
    // Then check if we leveled up (only trigger notification if going from lower to higher level)
    if (level.level > previousLevel.level && previousXP > 0) {
      // Use setTimeout to avoid calling setState during render
      setTimeout(() => {
        setNewLevelReached(level.level);
        setShowLevelUp(true);
      }, 0);
    }
  }, [xp, level.level]);
  
  const Icon = level.icon;
  
  return (
    <>
      <Card className="glass border-[#d4a574]/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${level.color} flex items-center justify-center shadow-lg relative`}>
              <Icon className="text-white" size={32} />
              <div className="absolute -bottom-1 -right-1 bg-black text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-[#d4a574]">
                {level.level}
              </div>
            </div>
            <div>
              <p className={`text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${level.color}`}>
                {level.name}
              </p>
              <p className="text-sm text-gray-400">Level {level.level} • {xp.toLocaleString()} XP</p>
            </div>
          </div>
          
          <div className="text-right">
            <TrendingUp className="w-5 h-5 text-[#d4a574] inline-block mb-1" />
            <p className="text-xs text-gray-500">Journey Progress</p>
          </div>
        </div>
        
        <XPProgressBar xp={xp} />
        
        {/* Unlock info */}
        <div className="mt-4 p-3 bg-[#d4a574]/10 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Current Unlock:</p>
          <p className="text-sm text-[#d4a574] font-medium flex items-center gap-2">
            <Sparkles size={14} />
            {level.unlock}
          </p>
        </div>
      </Card>
      
      {showLevelUp && newLevelReached && (
        <LevelUpNotification 
          newLevel={newLevelReached} 
          onClose={() => {
            setShowLevelUp(false);
            setNewLevelReached(null);
            onLevelUp && onLevelUp(newLevelReached);
          }} 
        />
      )}
    </>
  );
};

export default LevelSystem;
export { levels };
