import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, Target, Flame, BookOpen, Brain, Trophy, 
  Clock, CheckCircle2, Gift, Sparkles, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Weekly challenge definitions
const challengeTypes = [
  {
    id: 'goal_setter',
    name: 'Goal Setter',
    description: 'Create 3 new goals this week',
    icon: Target,
    color: 'from-amber-500 to-orange-500',
    target: 3,
    xpReward: 150,
    metric: 'goals_created'
  },
  {
    id: 'habit_hero',
    name: 'Habit Hero',
    description: 'Complete all habits for 5 days',
    icon: Flame,
    color: 'from-red-500 to-pink-500',
    target: 5,
    xpReward: 200,
    metric: 'perfect_habit_days'
  },
  {
    id: 'journal_journey',
    name: 'Journal Journey',
    description: 'Write 4 journal entries',
    icon: BookOpen,
    color: 'from-purple-500 to-indigo-500',
    target: 4,
    xpReward: 120,
    metric: 'journal_entries'
  },
  {
    id: 'mind_master',
    name: 'Mind Master',
    description: 'Complete 5 growth exercises',
    icon: Brain,
    color: 'from-emerald-500 to-teal-500',
    target: 5,
    xpReward: 175,
    metric: 'exercises_completed'
  },
  {
    id: 'consistency_king',
    name: 'Consistency King',
    description: 'Log in and take action 7 days in a row',
    icon: Calendar,
    color: 'from-blue-500 to-cyan-500',
    target: 7,
    xpReward: 250,
    metric: 'active_days'
  },
];

// Get week start date (Monday)
const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

// Get week end date (Sunday)
const getWeekEnd = () => {
  const weekStart = getWeekStart();
  const sunday = new Date(weekStart);
  sunday.setDate(sunday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
};

// Calculate days remaining in week
const getDaysRemaining = () => {
  const now = new Date();
  const weekEnd = getWeekEnd();
  const diff = weekEnd.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const WeeklyChallenges = ({ token, analytics, onXPEarned }) => {
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const daysRemaining = getDaysRemaining();

  useEffect(() => {
    // Initialize challenges for this week
    const weekKey = getWeekStart().toISOString().split('T')[0];
    const savedChallengeIds = localStorage.getItem(`challenges_${weekKey}`);
    
    if (savedChallengeIds) {
      // Restore challenges from IDs (icons can't be stored in localStorage)
      const ids = JSON.parse(savedChallengeIds);
      const restored = ids.map(id => challengeTypes.find(c => c.id === id)).filter(Boolean);
      setChallenges(restored);
    } else {
      // Select 3 random challenges
      const shuffled = [...challengeTypes].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3);
      setChallenges(selected);
      // Store only IDs in localStorage
      localStorage.setItem(`challenges_${weekKey}`, JSON.stringify(selected.map(c => c.id)));
    }
    
    // Load completed challenges
    const completed = JSON.parse(localStorage.getItem(`completed_challenges_${weekKey}`) || '[]');
    setCompletedChallenges(completed);
  }, []);

  const getChallengeProgress = (challenge) => {
    if (!analytics) return 0;
    
    switch (challenge.metric) {
      case 'goals_created':
        // Count goals created this week
        return analytics.goals?.total || 0;
      case 'perfect_habit_days':
        // Count perfect habit days
        return analytics.habit_completions_7_days?.filter(d => 
          d.completed === d.total && d.total > 0
        ).length || 0;
      case 'journal_entries':
        return analytics.journal?.total_entries || 0;
      case 'exercises_completed':
        return analytics.exercises?.total_completed || 0;
      case 'active_days':
        // Count active days this week
        return analytics.habit_completions_7_days?.filter(d => d.completed > 0).length || 0;
      default:
        return 0;
    }
  };

  const claimReward = async (challenge) => {
    const weekKey = getWeekStart().toISOString().split('T')[0];
    const completed = [...completedChallenges, challenge.id];
    
    setCompletedChallenges(completed);
    localStorage.setItem(`completed_challenges_${weekKey}`, JSON.stringify(completed));
    
    toast.success(`+${challenge.xpReward} XP earned!`, {
      description: `Challenge "${challenge.name}" completed!`,
      icon: <Trophy className="w-5 h-5 text-yellow-500" />,
    });
    
    if (onXPEarned) {
      onXPEarned(challenge.xpReward);
    }
    
    setSelectedChallenge(null);
  };

  return (
    <Card className="glass border-[#d4a574]/20 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#d4a574]/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#d4a574]/20 to-[#e6b786]/20">
              <Trophy className="w-6 h-6 text-[#d4a574]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Weekly Challenges</h2>
              <p className="text-sm text-gray-400">Complete for bonus XP</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full">
            <Clock className="w-4 h-4 text-[#d4a574]" />
            <span className="text-sm text-gray-300">{daysRemaining} days left</span>
          </div>
        </div>
      </div>

      {/* Challenges */}
      <div className="p-4 space-y-3">
        {challenges.map((challenge) => {
          const Icon = challenge.icon;
          const progress = getChallengeProgress(challenge);
          const progressPercent = Math.min((progress / challenge.target) * 100, 100);
          const isCompleted = progress >= challenge.target;
          const isClaimed = completedChallenges.includes(challenge.id);

          return (
            <div
              key={challenge.id}
              onClick={() => !isClaimed && setSelectedChallenge(challenge)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isClaimed 
                  ? 'border-green-500/30 bg-green-500/5' 
                  : isCompleted 
                    ? 'border-[#d4a574]/50 bg-[#d4a574]/5 hover:bg-[#d4a574]/10' 
                    : 'border-gray-700/50 hover:border-gray-600/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${challenge.color}/20`}>
                    <Icon className={`w-5 h-5 bg-gradient-to-r ${challenge.color} bg-clip-text`} style={{ color: 'inherit' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{challenge.name}</h3>
                    <p className="text-sm text-gray-400">{challenge.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  {isClaimed ? (
                    <div className="flex items-center gap-1 text-green-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm">Claimed</span>
                    </div>
                  ) : isCompleted ? (
                    <div className="flex items-center gap-1 text-[#d4a574] animate-pulse">
                      <Gift className="w-5 h-5" />
                      <span className="text-sm font-medium">Claim!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[#d4a574]">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm">+{challenge.xpReward} XP</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Progress</span>
                  <span className={isCompleted ? 'text-green-400' : 'text-gray-400'}>
                    {Math.min(progress, challenge.target)} / {challenge.target}
                  </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isClaimed 
                        ? 'bg-green-500' 
                        : isCompleted 
                          ? 'bg-gradient-to-r from-[#d4a574] to-[#e6b786]' 
                          : 'bg-gray-600'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Claim Modal */}
      {selectedChallenge && getChallengeProgress(selectedChallenge) >= selectedChallenge.target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <Card className="glass border-[#d4a574]/50 p-8 text-center max-w-sm animate-scale-in">
            {(() => {
              const ChallengeIcon = selectedChallenge.icon;
              return (
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r ${selectedChallenge.color} flex items-center justify-center`}>
                  <ChallengeIcon className="w-10 h-10 text-white" />
                </div>
              );
            })()}
            
            <h2 className="text-2xl font-bold text-white mb-2">Challenge Complete!</h2>
            <p className="text-gray-400 mb-4">{selectedChallenge.name}</p>
            
            <div className="bg-[#d4a574]/10 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-[#d4a574]" />
                <span className="text-2xl font-bold text-[#d4a574]">+{selectedChallenge.xpReward} XP</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 border-gray-600"
                onClick={() => setSelectedChallenge(null)}
              >
                Later
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-[#d4a574] to-[#e6b786] text-black font-semibold"
                onClick={() => claimReward(selectedChallenge)}
              >
                <Gift className="w-4 h-4 mr-2" />
                Claim Reward
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
};

export default WeeklyChallenges;
