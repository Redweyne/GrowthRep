import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sun, Moon, Sparkles, Zap, Target, CheckCircle2, Circle,
  RefreshCw, Calendar, Clock, Brain, Heart, Flame, Star,
  ChevronRight, Edit2, Plus, Trash2, Coffee, Sunrise
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Energy patterns based on time
const getEnergyLevel = (hour) => {
  if (hour >= 6 && hour < 9) return { level: 'rising', label: 'Rising Energy', icon: Sunrise, color: 'text-amber-400' };
  if (hour >= 9 && hour < 12) return { level: 'peak', label: 'Peak Energy', icon: Sun, color: 'text-yellow-400' };
  if (hour >= 12 && hour < 14) return { level: 'dip', label: 'Post-Lunch Dip', icon: Coffee, color: 'text-orange-400' };
  if (hour >= 14 && hour < 17) return { level: 'afternoon', label: 'Afternoon Focus', icon: Target, color: 'text-blue-400' };
  if (hour >= 17 && hour < 20) return { level: 'evening', label: 'Evening Wind-Down', icon: Heart, color: 'text-purple-400' };
  return { level: 'night', label: 'Rest & Recovery', icon: Moon, color: 'text-indigo-400' };
};

// Task templates based on philosophy
const taskTemplates = {
  think_and_grow_rich: [
    { name: 'Review Burning Desire Document', duration: 5, type: 'mindset', link: '/burning-desire' },
    { name: 'Visualize your definite chief aim', duration: 10, type: 'visualization' },
    { name: 'Practice auto-suggestion affirmations', duration: 5, type: 'mindset' },
    { name: 'Master Mind connection', duration: 15, type: 'networking' }
  ],
  atomic_habits: [
    { name: 'Review habit tracker', duration: 5, type: 'tracking', link: '/habits' },
    { name: '2-minute habit implementation', duration: 2, type: 'action' },
    { name: 'Environment design check', duration: 5, type: 'planning' },
    { name: 'Identity reinforcement', duration: 5, type: 'mindset', link: '/identity' }
  ],
  obstacle_is_the_way: [
    { name: 'Perception check - reframe challenges', duration: 5, type: 'mindset', link: '/obstacle' },
    { name: 'Action bias - choose one obstacle to tackle', duration: 10, type: 'action' },
    { name: 'Will training - practice discipline', duration: 10, type: 'discipline' },
    { name: 'Amor fati reflection', duration: 5, type: 'mindset' }
  ]
};

// Priority levels
const priorities = {
  critical: { label: 'Critical', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  high: { label: 'High', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  medium: { label: 'Medium', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  low: { label: 'Low', color: 'bg-green-500/20 text-green-400 border-green-500/30' }
};

const MorningAlgorithm = ({ token, userPreferences }) => {
  const [dailyPlan, setDailyPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [customTasks, setCustomTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [newTask, setNewTask] = useState({ name: '', duration: 15, priority: 'medium' });

  const currentHour = new Date().getHours();
  const energy = getEnergyLevel(currentHour);
  const philosophy = userPreferences?.preferredPhilosophy || 'think_and_grow_rich';

  useEffect(() => {
    fetchUserData();
    loadTodaysPlan();
  }, [token]);

  const fetchUserData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [goalsRes, habitsRes, analyticsRes] = await Promise.all([
        axios.get(`${API}/goals`, { headers }),
        axios.get(`${API}/habits`, { headers }),
        axios.get(`${API}/analytics/overview`, { headers })
      ]);
      setGoals(goalsRes.data);
      setHabits(habitsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const loadTodaysPlan = () => {
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem('morningPlan') || 'null');
    if (saved && saved.date === today) {
      setDailyPlan(saved.plan);
      setCompletedTasks(saved.completed || []);
      setCustomTasks(saved.custom || []);
    }
  };

  const savePlan = (plan, completed = completedTasks, custom = customTasks) => {
    const today = new Date().toDateString();
    localStorage.setItem('morningPlan', JSON.stringify({
      date: today,
      plan,
      completed,
      custom
    }));
  };

  const generateDailyPlan = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      // Analyze user's patterns
      const activeGoals = goals.filter(g => g.status === 'active');
      const habitsAtRisk = habits.filter(h => {
        const today = new Date().toISOString().split('T')[0];
        return !h.completion_dates?.includes(today);
      });
      const avgStreak = analytics?.habits?.avg_streak || 0;

      // Build personalized plan
      const plan = {
        greeting: getGreeting(),
        energyAdvice: getEnergyAdvice(energy),
        focusAreas: [],
        tasks: [],
        ritualSuggestion: getRitualSuggestion()
      };

      // Add focus areas based on data
      if (habitsAtRisk.length > 0) {
        plan.focusAreas.push({
          type: 'habits',
          title: 'Habits at Risk',
          description: `${habitsAtRisk.length} habit${habitsAtRisk.length > 1 ? 's' : ''} not completed today`,
          priority: 'high',
          icon: Flame
        });
      }

      if (activeGoals.length > 0) {
        const urgentGoals = activeGoals.filter(g => {
          if (!g.deadline) return false;
          const daysLeft = Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24));
          return daysLeft <= 7;
        });
        if (urgentGoals.length > 0) {
          plan.focusAreas.push({
            type: 'goals',
            title: 'Urgent Goals',
            description: `${urgentGoals.length} goal${urgentGoals.length > 1 ? 's' : ''} with deadlines this week`,
            priority: 'critical',
            icon: Target
          });
        }
      }

      // Add philosophy-based tasks
      const philosophyTasks = taskTemplates[philosophy] || taskTemplates.think_and_grow_rich;
      plan.tasks = [
        ...philosophyTasks.slice(0, 2).map(t => ({ ...t, priority: 'high' })),
        ...habitsAtRisk.slice(0, 3).map(h => ({
          name: `Complete: ${h.name}`,
          duration: 10,
          type: 'habit',
          priority: 'critical',
          habitId: h.id
        })),
        ...activeGoals.slice(0, 2).map(g => ({
          name: `Progress on: ${g.title}`,
          duration: 30,
          type: 'goal',
          priority: g.deadline ? 'high' : 'medium',
          goalId: g.id
        })),
        ...philosophyTasks.slice(2)
      ];

      // Add custom tasks
      if (customTasks.length > 0) {
        plan.tasks = [...customTasks, ...plan.tasks];
      }

      setDailyPlan(plan);
      savePlan(plan);
      setIsGenerating(false);
      toast.success('Your personalized plan is ready!');
    }, 1500);
  };

  const getGreeting = () => {
    const hour = currentHour;
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    if (hour < 12) return `Good morning! It's ${dayOfWeek} - time to conquer.`;
    if (hour < 17) return `Good afternoon! ${dayOfWeek} is still yours to own.`;
    return `Good evening! Let's make the most of ${dayOfWeek}.`;
  };

  const getEnergyAdvice = (energy) => {
    const advice = {
      rising: 'Your energy is building. Perfect time for important decisions and creative work.',
      peak: 'You\'re at peak performance. Tackle your most challenging tasks now.',
      dip: 'Natural energy dip. Do administrative tasks or take a short walk.',
      afternoon: 'Second wind approaching. Good for collaborative work and meetings.',
      evening: 'Winding down. Focus on reflection, planning, and light tasks.',
      night: 'Rest is productive. Your mind consolidates learning during sleep.'
    };
    return advice[energy.level];
  };

  const getRitualSuggestion = () => {
    const hour = currentHour;
    if (hour < 10) return { type: 'morning', name: 'Morning Ritual', link: '/rituals' };
    if (hour > 17) return { type: 'evening', name: 'Evening Reflection', link: '/rituals' };
    return { type: 'focus', name: 'Deep Focus Session', link: '/rituals' };
  };

  const toggleTaskCompletion = (taskIndex) => {
    const newCompleted = completedTasks.includes(taskIndex)
      ? completedTasks.filter(i => i !== taskIndex)
      : [...completedTasks, taskIndex];
    setCompletedTasks(newCompleted);
    savePlan(dailyPlan, newCompleted, customTasks);
    
    if (!completedTasks.includes(taskIndex)) {
      toast.success('Task completed! Keep going!');
    }
  };

  const addCustomTask = () => {
    if (!newTask.name.trim()) return;
    const task = { ...newTask, id: Date.now(), type: 'custom' };
    const updated = [...customTasks, task];
    setCustomTasks(updated);
    if (dailyPlan) {
      const updatedPlan = { ...dailyPlan, tasks: [task, ...dailyPlan.tasks] };
      setDailyPlan(updatedPlan);
      savePlan(updatedPlan, completedTasks, updated);
    }
    setNewTask({ name: '', duration: 15, priority: 'medium' });
    toast.success('Task added to your plan');
  };

  const removeCustomTask = (taskId) => {
    const updated = customTasks.filter(t => t.id !== taskId);
    setCustomTasks(updated);
    if (dailyPlan) {
      const updatedPlan = { 
        ...dailyPlan, 
        tasks: dailyPlan.tasks.filter(t => t.id !== taskId) 
      };
      setDailyPlan(updatedPlan);
      savePlan(updatedPlan, completedTasks, updated);
    }
  };

  const completionPercentage = dailyPlan 
    ? Math.round((completedTasks.length / dailyPlan.tasks.length) * 100) 
    : 0;

  const EnergyIcon = energy.icon;

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-[#d4a574]" />
              Morning Algorithm
            </h1>
            <p className="text-gray-400">Your personalized daily blueprint for success</p>
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-2 ${energy.color}`}>
              <EnergyIcon className="w-5 h-5" />
              <span className="font-medium">{energy.label}</span>
            </div>
            <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', month: 'long', day: 'numeric' 
            })}</p>
          </div>
        </div>

        {/* Energy & Advice Banner */}
        <Card className={`bg-gradient-to-r ${
          energy.level === 'peak' ? 'from-yellow-900/30 to-amber-900/30 border-yellow-500/30' :
          energy.level === 'rising' ? 'from-orange-900/30 to-amber-900/30 border-orange-500/30' :
          energy.level === 'dip' ? 'from-orange-900/30 to-red-900/30 border-orange-500/30' :
          energy.level === 'afternoon' ? 'from-blue-900/30 to-cyan-900/30 border-blue-500/30' :
          'from-purple-900/30 to-indigo-900/30 border-purple-500/30'
        } p-4`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${
              energy.level === 'peak' ? 'bg-yellow-500/20' :
              energy.level === 'rising' ? 'bg-orange-500/20' :
              energy.level === 'dip' ? 'bg-orange-500/20' :
              energy.level === 'afternoon' ? 'bg-blue-500/20' :
              'bg-purple-500/20'
            }`}>
              <EnergyIcon className={`w-6 h-6 ${energy.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-white">{energy.label}</h3>
              <p className="text-sm text-gray-400">{getEnergyAdvice(energy)}</p>
            </div>
          </div>
        </Card>

        {!dailyPlan ? (
          /* Generate Plan CTA */
          <Card className="bg-[#1a1625]/60 border-[#d4a574]/20 p-12 text-center">
            <Sunrise className="w-16 h-16 mx-auto text-[#d4a574] mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Start Your Day Right</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              Generate a personalized daily plan based on your goals, habits, energy patterns, and philosophy.
            </p>
            <Button 
              onClick={generateDailyPlan}
              disabled={isGenerating}
              className="px-8 py-4 text-lg bg-gradient-to-r from-[#d4a574] to-[#b8885f] text-black hover:from-[#c9a07a] hover:to-[#a8785a]"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing your patterns...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Generate My Plan
                </>
              )}
            </Button>
          </Card>
        ) : (
          <>
            {/* Progress & Greeting */}
            <Card className="bg-[#1a1625]/60 border-[#d4a574]/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">{dailyPlan.greeting}</h2>
                  <p className="text-sm text-gray-500">
                    {completedTasks.length} of {dailyPlan.tasks.length} tasks completed
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowCustomize(!showCustomize)}
                    className="text-gray-400"
                  >
                    <Edit2 className="w-4 h-4 mr-1" /> Customize
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={generateDailyPlan}
                    className="text-gray-400"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" /> Regenerate
                  </Button>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="h-2 bg-[#0f0d14] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#d4a574] to-[#b8885f] transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="text-right text-sm text-[#d4a574] mt-1">{completionPercentage}%</p>
            </Card>

            {/* Add Custom Task */}
            {showCustomize && (
              <Card className="bg-[#1a1625]/40 border-[#d4a574]/10 p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Add Custom Task</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Task name"
                    value={newTask.name}
                    onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                    className="flex-1 px-3 py-2 bg-[#0f0d14] border border-[#d4a574]/30 rounded-md text-white"
                  />
                  <input
                    type="number"
                    placeholder="Min"
                    value={newTask.duration}
                    onChange={(e) => setNewTask({...newTask, duration: parseInt(e.target.value) || 15})}
                    className="w-20 px-3 py-2 bg-[#0f0d14] border border-[#d4a574]/30 rounded-md text-white"
                  />
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="px-3 py-2 bg-[#0f0d14] border border-[#d4a574]/30 rounded-md text-white"
                  >
                    {Object.entries(priorities).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                  <Button onClick={addCustomTask} className="bg-[#d4a574] text-black">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )}

            {/* Focus Areas */}
            {dailyPlan.focusAreas?.length > 0 && (
              <div className="grid md:grid-cols-2 gap-4">
                {dailyPlan.focusAreas.map((area, i) => {
                  const Icon = area.icon;
                  return (
                    <Card 
                      key={i} 
                      className={`p-4 ${
                        area.priority === 'critical' ? 'bg-red-900/20 border-red-500/30' :
                        area.priority === 'high' ? 'bg-orange-900/20 border-orange-500/30' :
                        'bg-[#1a1625]/40 border-[#d4a574]/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${
                          area.priority === 'critical' ? 'text-red-400' :
                          area.priority === 'high' ? 'text-orange-400' :
                          'text-[#d4a574]'
                        }`} />
                        <div>
                          <h4 className="font-medium text-white">{area.title}</h4>
                          <p className="text-sm text-gray-400">{area.description}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Task List */}
            <Card className="bg-[#1a1625]/60 border-[#d4a574]/20 divide-y divide-[#d4a574]/10">
              {dailyPlan.tasks.map((task, index) => {
                const isCompleted = completedTasks.includes(index);
                const priorityStyle = priorities[task.priority] || priorities.medium;
                
                return (
                  <div 
                    key={task.id || index}
                    className={`p-4 flex items-center gap-4 transition-all ${
                      isCompleted ? 'opacity-50' : ''
                    }`}
                  >
                    <button 
                      onClick={() => toggleTaskCompletion(index)}
                      className="flex-shrink-0"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-600 hover:text-[#d4a574]" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium ${isCompleted ? 'line-through text-gray-500' : 'text-white'}`}>
                          {task.name}
                        </h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityStyle.color}`}>
                          {priorityStyle.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{task.duration} minutes • {task.type}</p>
                    </div>

                    {task.link && (
                      <Link to={task.link}>
                        <Button variant="ghost" size="sm" className="text-[#d4a574]">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}

                    {task.type === 'custom' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeCustomTask(task.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </Card>

            {/* Ritual Suggestion */}
            <Card className="bg-gradient-to-r from-[#d4a574]/10 to-[#b8885f]/10 border-[#d4a574]/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-[#d4a574]" />
                  <div>
                    <h4 className="font-medium text-white">Suggested Ritual</h4>
                    <p className="text-sm text-gray-400">{dailyPlan.ritualSuggestion.name}</p>
                  </div>
                </div>
                <Link to={dailyPlan.ritualSuggestion.link}>
                  <Button className="bg-[#d4a574] text-black hover:bg-[#c9a07a]">
                    Start Ritual <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default MorningAlgorithm;
