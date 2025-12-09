import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sunrise, Sun, Moon, Flame, CheckCircle2, Circle,
  Target, Heart, Brain, Sparkles, Clock, Play, Pause, 
  SkipForward, Volume2, VolumeX, Star
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Pre-defined ritual types
const ritualTypes = {
  morning: {
    id: 'morning',
    name: 'Morning Ritual',
    icon: Sunrise,
    color: 'from-amber-500 to-orange-500',
    bgGradient: 'from-amber-500/10 to-orange-500/10',
    description: 'Start your day with purpose and energy',
    defaultActivities: [
      { name: 'Gratitude Reflection', duration: 5, type: 'reflection' },
      { name: 'Goal Review', duration: 3, type: 'planning' },
      { name: 'Affirmations', duration: 2, type: 'mindset' },
      { name: 'Quick Exercise', duration: 10, type: 'movement' }
    ]
  },
  midday: {
    id: 'midday',
    name: 'Midday Reset',
    icon: Sun,
    color: 'from-yellow-400 to-yellow-600',
    bgGradient: 'from-yellow-400/10 to-yellow-600/10',
    description: 'Recharge and refocus your energy',
    defaultActivities: [
      { name: 'Progress Check', duration: 3, type: 'reflection' },
      { name: 'Breathing Exercise', duration: 5, type: 'mindfulness' },
      { name: 'Energy Boost', duration: 7, type: 'movement' }
    ]
  },
  evening: {
    id: 'evening',
    name: 'Evening Reflection',
    icon: Moon,
    color: 'from-indigo-500 to-purple-600',
    bgGradient: 'from-indigo-500/10 to-purple-600/10',
    description: 'Review your day and prepare for tomorrow',
    defaultActivities: [
      { name: 'Day Review', duration: 5, type: 'reflection' },
      { name: 'Wins Celebration', duration: 3, type: 'gratitude' },
      { name: 'Tomorrow Planning', duration: 5, type: 'planning' },
      { name: 'Evening Wind Down', duration: 7, type: 'relaxation' }
    ]
  },
  focus: {
    id: 'focus',
    name: 'Deep Focus',
    icon: Flame,
    color: 'from-red-500 to-pink-600',
    bgGradient: 'from-red-500/10 to-pink-600/10',
    description: 'Enter a state of peak productivity',
    defaultActivities: [
      { name: 'Clear Your Mind', duration: 2, type: 'mindfulness' },
      { name: 'Set Intention', duration: 3, type: 'planning' },
      { name: 'Deep Work Session', duration: 25, type: 'focus' },
      { name: 'Quick Break', duration: 5, type: 'rest' }
    ]
  }
};

const RitualMode = ({ token }) => {
  const [selectedRitual, setSelectedRitual] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [completedRituals, setCompletedRituals] = useState([]);

  useEffect(() => {
    fetchCompletedRituals();
  }, []);

  useEffect(() => {
    let interval;
    if (isActive && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleStepComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused, timeRemaining]);

  const fetchCompletedRituals = async () => {
    try {
      const response = await axios.get(`${API}/rituals/completed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompletedRituals(response.data);
    } catch (error) {
      console.error('Failed to fetch completed rituals');
    }
  };

  const startRitual = (ritualType) => {
    setSelectedRitual(ritualType);
    setCurrentStep(0);
    setTimeRemaining(ritualType.defaultActivities[0].duration * 60);
    setIsActive(true);
    setIsPaused(false);
    
    if (soundEnabled) {
      // Play start sound (placeholder)
      toast.success(`${ritualType.name} started!`);
    }
  };

  const handleStepComplete = () => {
    const ritual = selectedRitual;
    const nextStep = currentStep + 1;

    if (nextStep < ritual.defaultActivities.length) {
      setCurrentStep(nextStep);
      setTimeRemaining(ritual.defaultActivities[nextStep].duration * 60);
      
      if (soundEnabled) {
        toast.success('Step completed! Moving to next activity.');
      }
    } else {
      completeRitual();
    }
  };

  const completeRitual = async () => {
    try {
      await axios.post(
        `${API}/rituals/complete`,
        { 
          ritual_type: selectedRitual.id,
          completed_at: new Date().toISOString()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`${selectedRitual.name} completed! 🎉`);
      setIsActive(false);
      setSelectedRitual(null);
      fetchCompletedRituals();
    } catch (error) {
      toast.error('Failed to save ritual completion');
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const skipStep = () => {
    handleStepComplete();
  };

  const exitRitual = () => {
    setIsActive(false);
    setSelectedRitual(null);
    setCurrentStep(0);
    setTimeRemaining(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTodayCompletedCount = () => {
    const today = new Date().toDateString();
    return completedRituals.filter(r => 
      new Date(r.completed_at).toDateString() === today
    ).length;
  };

  if (isActive && selectedRitual) {
    const currentActivity = selectedRitual.defaultActivities[currentStep];
    const progress = ((currentStep / selectedRitual.defaultActivities.length) * 100);
    const Icon = selectedRitual.icon;

    return (
      <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-2xl w-full">
          {/* Ritual Header */}
          <div className="text-center mb-8">
            <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${selectedRitual.bgGradient} mb-4 animate-pulse-slow`}>
              <Icon className={`w-12 h-12 text-transparent bg-clip-text bg-gradient-to-r ${selectedRitual.color}`} />
            </div>
            <h1 className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${selectedRitual.color}`}>
              {selectedRitual.name}
            </h1>
            <p className="text-gray-400 mt-2">Step {currentStep + 1} of {selectedRitual.defaultActivities.length}</p>
          </div>

          {/* Main Activity Card */}
          <Card className="glass border-[#d4a574]/30 p-8 mb-6">
            <div className="text-center space-y-6">
              {/* Current Activity */}
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">{currentActivity.name}</h2>
                <p className="text-gray-400 capitalize">{currentActivity.type}</p>
              </div>

              {/* Timer */}
              <div className="py-8">
                <div className="text-7xl font-bold gradient-text mb-4">
                  {formatTime(timeRemaining)}
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${selectedRitual.color} transition-all duration-1000`}
                    style={{ width: `${((currentActivity.duration * 60 - timeRemaining) / (currentActivity.duration * 60)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center items-center space-x-4">
                <Button
                  onClick={togglePause}
                  variant="outline"
                  size="lg"
                  className="border-[#d4a574]/30 hover:bg-[#d4a574]/10"
                >
                  {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                </Button>
                
                <Button
                  onClick={skipStep}
                  variant="outline"
                  size="lg"
                  className="border-[#d4a574]/30 hover:bg-[#d4a574]/10"
                >
                  <SkipForward className="w-6 h-6" />
                </Button>

                <Button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  variant="outline"
                  size="lg"
                  className="border-[#d4a574]/30 hover:bg-[#d4a574]/10"
                >
                  {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                </Button>
              </div>

              <Button
                onClick={exitRitual}
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                Exit Ritual
              </Button>
            </div>
          </Card>

          {/* Progress Indicator */}
          <div className="flex justify-center space-x-2">
            {selectedRitual.defaultActivities.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx < currentStep
                    ? `bg-gradient-to-r ${selectedRitual.color}`
                    : idx === currentStep
                    ? `bg-gradient-to-r ${selectedRitual.color} animate-pulse`
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Ritual Modes</h1>
        <p className="text-gray-400">Transform your day with intentional practices</p>
        
        {/* Today's Stats */}
        <div className="mt-4 inline-flex items-center space-x-2 bg-[#d4a574]/10 px-4 py-2 rounded-full">
          <Star className="w-5 h-5 text-[#d4a574]" />
          <span className="text-gray-300">{getTodayCompletedCount()} rituals completed today</span>
        </div>
      </div>

      {/* Ritual Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {Object.values(ritualTypes).map((ritual) => {
          const Icon = ritual.icon;
          const todayCount = completedRituals.filter(r => 
            r.ritual_type === ritual.id && 
            new Date(r.completed_at).toDateString() === new Date().toDateString()
          ).length;

          return (
            <Card
              key={ritual.id}
              className="glass border-[#d4a574]/20 p-6 hover-lift cursor-pointer group"
              onClick={() => startRitual(ritual)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${ritual.bgGradient}`}>
                  <Icon className={`w-8 h-8 text-transparent bg-clip-text bg-gradient-to-r ${ritual.color}`} />
                </div>
                {todayCount > 0 && (
                  <div className="flex items-center space-x-1 bg-green-500/20 px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">{todayCount}</span>
                  </div>
                )}
              </div>

              <h3 className={`text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r ${ritual.color}`}>
                {ritual.name}
              </h3>
              <p className="text-gray-400 mb-4">{ritual.description}</p>

              {/* Activities Preview */}
              <div className="space-y-2 mb-4">
                {ritual.defaultActivities.map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Circle className="w-3 h-3 text-gray-600" />
                      <span className="text-gray-300">{activity.name}</span>
                    </div>
                    <span className="text-gray-500">{activity.duration}m</span>
                  </div>
                ))}
              </div>

              <Button className={`w-full bg-gradient-to-r ${ritual.color} hover:opacity-90 group-hover:scale-105 transition-transform`}>
                <Play className="w-4 h-4 mr-2" />
                Start Ritual
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Recent Completions */}
      {completedRituals.length > 0 && (
        <Card className="glass border-[#d4a574]/20 p-6 mt-8">
          <h3 className="text-xl font-semibold mb-4 text-white">Recent Completions</h3>
          <div className="space-y-2">
            {completedRituals.slice(0, 5).map((ritual, idx) => {
              const ritualType = ritualTypes[ritual.ritual_type];
              const Icon = ritualType?.icon || Sparkles;
              
              return (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-[#d4a574]" />
                    <span className="text-gray-300">{ritualType?.name || 'Ritual'}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(ritual.completed_at).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default RitualMode;
