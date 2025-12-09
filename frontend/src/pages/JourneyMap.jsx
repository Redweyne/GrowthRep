import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Mountain, Flag, Star, Trophy, Flame, Target, 
  ChevronRight, Sparkles, Award, TrendingUp, 
  MapPin, Milestone, Crown, Zap, Heart,
  Cloud, Sun, Moon, Sunrise
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Milestones along the journey
const journeyMilestones = [
  { level: 0, name: 'Base Camp', description: 'Your journey begins', icon: MapPin, requirement: 0 },
  { level: 1, name: 'First Steps', description: 'Set your first goal', icon: Target, requirement: 1 },
  { level: 2, name: 'Building Momentum', description: 'Complete 3 exercises', icon: Zap, requirement: 5 },
  { level: 3, name: 'Habit Former', description: 'Start 3 habits', icon: Flame, requirement: 10 },
  { level: 4, name: 'Consistency Peak', description: '7-day streak achieved', icon: Star, requirement: 20 },
  { level: 5, name: 'Reflection Ridge', description: '10 journal entries', icon: Heart, requirement: 35 },
  { level: 6, name: 'Goal Crusher', description: 'Complete 5 goals', icon: Trophy, requirement: 50 },
  { level: 7, name: 'Transformation Point', description: '30-day streak', icon: Award, requirement: 75 },
  { level: 8, name: 'Summit of Growth', description: 'Master all areas', icon: Crown, requirement: 100 },
];

// Achievement badges
const achievementBadges = [
  { id: 'first_goal', name: 'Goal Setter', description: 'Set your first goal', icon: Target, check: (a) => a.goals?.total >= 1 },
  { id: 'goal_complete', name: 'Achiever', description: 'Complete a goal', icon: Trophy, check: (a) => a.goals?.completed >= 1 },
  { id: 'habit_starter', name: 'Habit Builder', description: 'Create 3 habits', icon: Zap, check: (a) => a.habits?.total >= 3 },
  { id: 'streak_7', name: 'Week Warrior', description: '7-day habit streak', icon: Flame, check: (a) => a.habits?.max_streak >= 7 },
  { id: 'streak_30', name: 'Monthly Master', description: '30-day habit streak', icon: Star, check: (a) => a.habits?.max_streak >= 30 },
  { id: 'journal_10', name: 'Reflector', description: '10 journal entries', icon: Heart, check: (a) => a.journal?.total_entries >= 10 },
  { id: 'exercise_20', name: 'Mind Trainer', description: '20 exercises done', icon: Award, check: (a) => a.exercises?.total_completed >= 20 },
  { id: 'goal_master', name: 'Goal Master', description: 'Complete 10 goals', icon: Crown, check: (a) => a.goals?.completed >= 10 },
];

const JourneyMap = ({ token }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/analytics/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to load journey data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate journey progress (0-100)
  const journeyProgress = useMemo(() => {
    if (!analytics) return 0;
    
    let points = 0;
    // Goals points (max 30)
    points += Math.min((analytics.goals?.completed || 0) * 3, 30);
    // Active goals points (max 10)
    points += Math.min((analytics.goals?.active || 0) * 2, 10);
    // Streak points (max 30)
    points += Math.min((analytics.habits?.max_streak || 0), 30);
    // Journal points (max 15)
    points += Math.min((analytics.journal?.total_entries || 0), 15);
    // Exercise points (max 15)
    points += Math.min((analytics.exercises?.total_completed || 0) * 0.75, 15);
    
    return Math.min(points, 100);
  }, [analytics]);

  // Current milestone
  const currentMilestone = useMemo(() => {
    for (let i = journeyMilestones.length - 1; i >= 0; i--) {
      if (journeyProgress >= journeyMilestones[i].requirement) {
        return journeyMilestones[i];
      }
    }
    return journeyMilestones[0];
  }, [journeyProgress]);

  // Next milestone
  const nextMilestone = useMemo(() => {
    const currentIndex = journeyMilestones.findIndex(m => m.level === currentMilestone.level);
    return journeyMilestones[currentIndex + 1] || null;
  }, [currentMilestone]);

  // Earned badges
  const earnedBadges = useMemo(() => {
    if (!analytics) return [];
    return achievementBadges.filter(badge => badge.check(analytics));
  }, [analytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Mountain className="w-16 h-16 mx-auto text-[#d4a574] animate-pulse" />
          <p className="text-gray-400">Loading your journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden">
        {/* Mountain Background SVG */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1625] via-[#0f0a1a] to-[#0a0a0f]">
          <svg className="absolute bottom-0 w-full h-64 opacity-30" viewBox="0 0 1200 300" preserveAspectRatio="none">
            {/* Back mountains */}
            <path d="M0,300 L0,200 L150,100 L300,180 L450,80 L600,150 L750,50 L900,120 L1050,70 L1200,160 L1200,300 Z" fill="#2a2035" />
            {/* Middle mountains */}
            <path d="M0,300 L0,220 L200,120 L400,200 L500,100 L700,180 L850,90 L1000,170 L1200,130 L1200,300 Z" fill="#1a1525" />
            {/* Front mountains */}
            <path d="M0,300 L0,250 L100,180 L250,230 L400,150 L550,220 L700,160 L850,210 L1000,170 L1100,200 L1200,180 L1200,300 Z" fill="#0f0a15" />
          </svg>
          
          {/* Stars */}
          <div className="absolute top-10 left-[10%] w-1 h-1 bg-white rounded-full animate-twinkle"></div>
          <div className="absolute top-20 left-[30%] w-1.5 h-1.5 bg-white rounded-full animate-twinkle" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-8 left-[50%] w-1 h-1 bg-white rounded-full animate-twinkle" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-16 left-[70%] w-1 h-1 bg-white rounded-full animate-twinkle" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-24 left-[85%] w-1.5 h-1.5 bg-white rounded-full animate-twinkle" style={{ animationDelay: '2s' }}></div>
          
          {/* Moon/Sun */}
          <div className="absolute top-8 right-12 w-12 h-12 rounded-full bg-gradient-to-br from-[#d4a574] to-[#e6b786] opacity-80 blur-sm"></div>
          <div className="absolute top-8 right-12 w-12 h-12 rounded-full bg-gradient-to-br from-[#d4a574] to-[#e6b786] opacity-60"></div>
        </div>

        <div className="relative z-10 p-8 lg:p-12">
          <div className="flex items-center gap-3 mb-4">
            <Mountain className="text-[#d4a574]" size={32} />
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-100">Your Journey</h1>
          </div>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl">
            Every goal completed, every habit maintained, and every reflection written brings you closer to the summit.
          </p>

          {/* Current Position */}
          <div className="flex items-center gap-6 flex-wrap">
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-[#d4a574]/30">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#d4a574] to-[#e6b786]">
                  {currentMilestone.icon && <currentMilestone.icon className="text-black" size={32} />}
                </div>
                <div>
                  <p className="text-sm text-[#d4a574] uppercase tracking-wider font-semibold">Current Position</p>
                  <h2 className="text-2xl font-bold text-white">{currentMilestone.name}</h2>
                  <p className="text-gray-400 text-sm">{currentMilestone.description}</p>
                </div>
              </div>
            </div>

            {nextMilestone && (
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-xl bg-gray-700/50">
                    {nextMilestone.icon && <nextMilestone.icon className="text-gray-400" size={32} />}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Next Milestone</p>
                    <h2 className="text-xl font-bold text-gray-300">{nextMilestone.name}</h2>
                    <p className="text-gray-500 text-sm">{nextMilestone.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Journey Progress Bar */}
      <Card className="border-[#d4a574]/20 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-200">Journey Progress</h3>
            <span className="text-2xl font-bold text-[#d4a574]">{Math.round(journeyProgress)}%</span>
          </div>
          
          {/* Progress track with milestones */}
          <div className="relative">
            <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#d4a574] via-[#e6b786] to-[#d4a574] rounded-full transition-all duration-1000 relative"
                style={{ width: `${journeyProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
            
            {/* Milestone markers */}
            <div className="absolute top-0 left-0 right-0 h-4 flex items-center">
              {journeyMilestones.map((milestone, index) => (
                <div 
                  key={milestone.level}
                  className="absolute transform -translate-x-1/2"
                  style={{ left: `${milestone.requirement}%` }}
                >
                  <button
                    onClick={() => setSelectedMilestone(milestone)}
                    className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-125 ${
                      journeyProgress >= milestone.requirement 
                        ? 'bg-[#d4a574] border-[#e6b786]' 
                        : 'bg-gray-700 border-gray-600'
                    }`}
                  >
                    {journeyProgress >= milestone.requirement && (
                      <Star className="w-3 h-3 mx-auto text-black" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Milestone labels */}
          <div className="mt-8 grid grid-cols-3 lg:grid-cols-9 gap-2">
            {journeyMilestones.map((milestone) => {
              const Icon = milestone.icon;
              const isReached = journeyProgress >= milestone.requirement;
              const isCurrent = currentMilestone.level === milestone.level;
              return (
                <button
                  key={milestone.level}
                  onClick={() => setSelectedMilestone(milestone)}
                  className={`p-3 rounded-xl text-center transition-all hover:scale-105 ${
                    isCurrent ? 'bg-[#d4a574]/20 border border-[#d4a574]' :
                    isReached ? 'bg-gray-800/50 border border-gray-700' : 
                    'bg-gray-900/50 border border-gray-800 opacity-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 mx-auto mb-1 ${isReached ? 'text-[#d4a574]' : 'text-gray-600'}`} />
                  <p className={`text-xs truncate ${isReached ? 'text-gray-300' : 'text-gray-600'}`}>
                    {milestone.name.split(' ')[0]}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Selected Milestone Detail */}
      {selectedMilestone && (
        <Card className="border-[#d4a574]/20 bg-gradient-to-br from-[#d4a574]/5 to-transparent">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl ${
                  journeyProgress >= selectedMilestone.requirement 
                    ? 'bg-gradient-to-br from-[#d4a574] to-[#e6b786]' 
                    : 'bg-gray-700'
                }`}>
                  <selectedMilestone.icon className={journeyProgress >= selectedMilestone.requirement ? 'text-black' : 'text-gray-400'} size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-100">{selectedMilestone.name}</h3>
                    {journeyProgress >= selectedMilestone.requirement && (
                      <span className="px-2 py-0.5 bg-[#d4a574]/20 text-[#d4a574] text-xs rounded-full">Unlocked</span>
                    )}
                  </div>
                  <p className="text-gray-400">{selectedMilestone.description}</p>
                  <p className="text-sm text-gray-500 mt-1">Required: {selectedMilestone.requirement}% journey progress</p>
                </div>
              </div>
              <button onClick={() => setSelectedMilestone(null)} className="text-gray-500 hover:text-gray-300">
                ×
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Achievement Badges */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-200 flex items-center gap-3">
            <Award className="text-[#d4a574]" />
            Achievement Badges
          </h2>
          <span className="text-[#d4a574] font-semibold">{earnedBadges.length} / {achievementBadges.length}</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievementBadges.map((badge) => {
            const Icon = badge.icon;
            const isEarned = earnedBadges.some(b => b.id === badge.id);
            return (
              <Card 
                key={badge.id}
                className={`p-6 text-center transition-all duration-300 ${
                  isEarned 
                    ? 'border-[#d4a574]/50 bg-gradient-to-br from-[#d4a574]/10 to-transparent' 
                    : 'border-gray-800 opacity-50 grayscale'
                }`}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  isEarned 
                    ? 'bg-gradient-to-br from-[#d4a574] to-[#e6b786]' 
                    : 'bg-gray-800'
                }`}>
                  <Icon className={isEarned ? 'text-black' : 'text-gray-600'} size={28} />
                </div>
                <h3 className={`font-semibold mb-1 ${isEarned ? 'text-[#d4a574]' : 'text-gray-500'}`}>
                  {badge.name}
                </h3>
                <p className="text-xs text-gray-500">{badge.description}</p>
                {isEarned && (
                  <div className="mt-3 flex items-center justify-center gap-1 text-[#d4a574]">
                    <Sparkles size={12} />
                    <span className="text-xs">Earned!</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Stats Breakdown */}
      <Card className="border-[#d4a574]/20">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-200 mb-6 flex items-center gap-3">
            <TrendingUp className="text-[#d4a574]" />
            Journey Statistics
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-amber-500/10 to-orange-600/10 rounded-xl">
              <Target className="w-8 h-8 mx-auto mb-2 text-amber-500" />
              <p className="text-3xl font-bold text-amber-500">{analytics?.goals?.completed || 0}</p>
              <p className="text-sm text-gray-400">Goals Completed</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl">
              <Flame className="w-8 h-8 mx-auto mb-2 text-red-500" />
              <p className="text-3xl font-bold text-red-500">{analytics?.habits?.max_streak || 0}</p>
              <p className="text-sm text-gray-400">Day Best Streak</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl">
              <Heart className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <p className="text-3xl font-bold text-purple-500">{analytics?.journal?.total_entries || 0}</p>
              <p className="text-sm text-gray-400">Reflections</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl">
              <Award className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              <p className="text-3xl font-bold text-emerald-500">{analytics?.exercises?.total_completed || 0}</p>
              <p className="text-sm text-gray-400">Exercises Done</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Call to Action */}
      <Card className="border-[#d4a574]/20 bg-gradient-to-r from-[#d4a574]/10 to-[#e6b786]/10">
        <div className="p-8 text-center">
          <Flag className="w-12 h-12 mx-auto mb-4 text-[#d4a574]" />
          <h2 className="text-2xl font-bold text-gray-100 mb-2">Keep Climbing!</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            {nextMilestone 
              ? `You're ${nextMilestone.requirement - Math.round(journeyProgress)}% away from reaching "${nextMilestone.name}"`
              : "You've reached the summit! But the journey never truly ends..."}
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/goals">
              <Button className="bg-gradient-to-r from-[#d4a574] to-[#e6b786] text-black font-semibold px-6 py-3">
                <Target className="mr-2" size={18} />
                Set New Goal
              </Button>
            </Link>
            <Link to="/habits">
              <Button variant="outline" className="border-[#d4a574] text-[#d4a574] px-6 py-3">
                <Flame className="mr-2" size={18} />
                Build Streaks
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default JourneyMap;
