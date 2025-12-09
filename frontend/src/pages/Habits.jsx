import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Flame, CheckCircle, Trash2, Calendar, TrendingUp, 
  Zap, Star, Target, Award, Sparkles, ArrowRight, Clock,
  Heart, Brain, ChevronRight, Eye
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import PhilosophyIcon from '@/components/PhilosophyIcon';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Meaningful streak milestones with deeper context
const streakMilestones = [
  { days: 3, label: '3 Days', emoji: '🌱', description: 'The seed is planted. Most people quit here.', insight: 'You\'ve already beaten 60% of people who start.' },
  { days: 7, label: '1 Week', emoji: '🔥', description: 'The foundation is being laid.', insight: 'One week of consistency. The compound effect begins.' },
  { days: 14, label: '2 Weeks', emoji: '⚡', description: 'Momentum is building.', insight: 'Your brain is starting to expect this behavior.' },
  { days: 21, label: '21 Days', emoji: '🧠', description: 'The neural pathways are forming.', insight: 'Research shows habits begin forming around this mark.' },
  { days: 30, label: '1 Month', emoji: '💪', description: 'You\'re building real momentum.', insight: 'You\'ve proven you can sustain this. That\'s rare.' },
  { days: 66, label: '66 Days', emoji: '🏆', description: 'Automaticity achieved.', insight: 'Studies show this is when habits become automatic.' },
  { days: 100, label: '100 Days', emoji: '👑', description: 'True commitment demonstrated.', insight: 'You\'re in the top 1% of people who start habits.' },
  { days: 365, label: '1 Year', emoji: '🌟', description: 'This is now part of who you are.', insight: 'Identity transformation complete. You ARE this person now.' },
];

const getNextMilestone = (streak) => {
  for (let milestone of streakMilestones) {
    if (streak < milestone.days) return milestone;
  }
  return null;
};

const getCurrentMilestone = (streak) => {
  let current = null;
  for (let milestone of streakMilestones) {
    if (streak >= milestone.days) current = milestone;
    else break;
  }
  return current;
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const Habits = ({ token }) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [completingHabit, setCompletingHabit] = useState(null);
  const [celebrationHabit, setCelebrationHabit] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily',
  });

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await axios.get(`${API}/habits`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHabits(response.data);
    } catch (error) {
      toast.error('Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a habit name');
      return;
    }
    try {
      await axios.post(`${API}/habits`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Habit created! Your journey begins.');
      fetchHabits();
      setDialogOpen(false);
      setFormData({ name: '', description: '', frequency: 'daily' });
    } catch (error) {
      toast.error('Failed to create habit');
    }
  };

  const handleComplete = async (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    if (isCompletedToday(habit)) {
      toast.info('Already completed today!');
      return;
    }

    setCompletingHabit(habitId);
    try {
      const response = await axios.post(
        `${API}/habits/${habitId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const newStreak = response.data.streak;
      const milestone = streakMilestones.find(m => m.days === newStreak);
      
      if (milestone) {
        setCelebrationHabit({ habit, milestone, streak: newStreak });
      } else {
        toast.success(`Day ${newStreak} complete! Every vote counts.`);
      }
      
      fetchHabits();
    } catch (error) {
      toast.error('Failed to mark habit complete');
    } finally {
      setCompletingHabit(null);
    }
  };

  const handleDelete = async (habitId) => {
    if (!window.confirm('Remove this habit? Your streak data will be lost.')) return;
    try {
      await axios.delete(`${API}/habits/${habitId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Habit removed');
      fetchHabits();
    } catch (error) {
      toast.error('Failed to delete habit');
    }
  };

  const isCompletedToday = (habit) => {
    const today = new Date().toISOString().split('T')[0];
    return habit.completion_dates?.includes(today);
  };

  const getWeeklyCompletion = (habit) => {
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        completed: habit.completion_dates?.includes(dateStr) || false,
        isToday: i === 0
      });
    }
    return days;
  };

  // Calculate stats
  const totalHabits = habits.length;
  const completedToday = habits.filter(isCompletedToday).length;
  const maxStreak = Math.max(...habits.map(h => h.streak || 0), 0);
  const bestStreak = Math.max(...habits.map(h => h.best_streak || 0), 0);
  const totalCompletions = habits.reduce((acc, h) => acc + (h.completion_dates?.length || 0), 0);
  const todayProgress = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative">
            <div className="w-14 h-14 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto" />
            <Flame className="w-6 h-6 text-orange-400/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-500 text-sm">Loading your habits...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-8 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Celebration Modal */}
      <AnimatePresence>
        {celebrationHabit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setCelebrationHabit(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-[#1a1625] to-[#0d0d0d] border border-[#d4a574]/30 rounded-3xl p-8 max-w-md text-center"
              onClick={e => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="text-7xl mb-6"
              >
                {celebrationHabit.milestone.emoji}
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {celebrationHabit.milestone.label} Streak!
              </h2>
              <p className="text-xl text-[#d4a574] mb-4">
                {celebrationHabit.habit.name}
              </p>
              <p className="text-gray-300 mb-4">
                {celebrationHabit.milestone.description}
              </p>
              <div className="bg-[#d4a574]/10 border border-[#d4a574]/20 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-400">
                  <Eye className="w-4 h-4 inline mr-2 text-[#d4a574]" />
                  {celebrationHabit.milestone.insight}
                </p>
              </div>
              <Button
                onClick={() => setCelebrationHabit(null)}
                className="bg-[#d4a574] hover:bg-[#c49464] text-black font-semibold"
              >
                Continue Building
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-100 flex items-center gap-3" data-testid="habits-header">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            Daily Habits
            <PhilosophyIcon feature="habits" />
          </h1>
          <p className="text-gray-500 text-lg">
            Every action is a vote for the person you want to become.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-[#d4a574] to-[#c49464] hover:from-[#c49464] hover:to-[#b38454] text-black font-semibold shadow-lg shadow-[#d4a574]/20"
              data-testid="create-habit-button"
            >
              <Plus className="mr-2 w-4 h-4" />
              New Habit
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0d0d0d] border-[#d4a574]/20 text-white max-w-md" data-testid="habit-dialog">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-100 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-[#d4a574]" />
                Create New Habit
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div>
                <Label className="text-gray-400 text-sm font-medium">What habit do you want to build?</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="habit-name-input"
                  placeholder="e.g., Morning meditation, Read 10 pages"
                  required
                  className="mt-2 bg-black/30 border-gray-800 text-white h-12 text-base"
                />
              </div>
              <div>
                <Label className="text-gray-400 text-sm font-medium">Why does this habit matter to you?</Label>
                <p className="text-xs text-gray-600 mt-1 mb-2">
                  Connecting to your "why" makes habits 3x more likely to stick.
                </p>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  data-testid="habit-description-input"
                  placeholder="This matters because..."
                  rows={3}
                  className="bg-black/30 border-gray-800 text-white"
                />
              </div>
              <div className="bg-[#d4a574]/10 border border-[#d4a574]/20 rounded-xl p-4">
                <p className="text-sm text-gray-300 flex items-start gap-2">
                  <Brain className="w-4 h-4 text-[#d4a574] shrink-0 mt-0.5" />
                  <span><strong>James Clear:</strong> "Focus on who you wish to become, not what you want to achieve."</span>
                </p>
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-[#d4a574] to-[#c49464] hover:from-[#c49464] hover:to-[#b38454] text-black font-semibold text-base"
                data-testid="habit-submit-button"
              >
                <Flame className="w-4 h-4 mr-2" />
                Start This Habit
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Today's Progress Banner */}
      {habits.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-[#d4a574]/20 bg-gradient-to-br from-[#d4a574]/10 to-[#0d0d0d] relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
            </div>
            <div className="relative flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-400 uppercase tracking-wider font-medium">Today's Progress</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-bold text-white">{completedToday}</span>
                  <span className="text-2xl text-gray-500">/ {totalHabits}</span>
                  <span className="text-gray-500">habits completed</span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-32">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Progress</span>
                    <span className="text-[#d4a574] font-semibold">{todayProgress}%</span>
                  </div>
                  <div className="h-3 bg-gray-800/50 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-[#d4a574] to-orange-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${todayProgress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
                {completedToday === totalHabits && totalHabits > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full"
                  >
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-semibold">All Done!</span>
                  </motion.div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Stats Overview */}
      {habits.length > 0 && (
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Habits', value: totalHabits, icon: Target, color: 'text-[#d4a574]' },
            { label: 'Current Best', value: `${maxStreak} days`, icon: Flame, color: 'text-orange-400' },
            { label: 'All-Time Best', value: `${bestStreak} days`, icon: Trophy, color: 'text-yellow-400' },
            { label: 'Total Check-ins', value: totalCompletions, icon: CheckCircle, color: 'text-emerald-400' },
          ].map((stat, i) => (
            <Card key={i} className="p-4 border-[#d4a574]/10 bg-[#0d0d0d]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <stat.icon className={`w-4 h-4 ${stat.color} opacity-60`} />
              </div>
              <p className="text-2xl font-bold text-gray-100">{stat.value}</p>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Habits List */}
      {habits.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="p-12 border-[#d4a574]/10 bg-[#0d0d0d] text-center" data-testid="no-habits-message">
            <div className="max-w-md mx-auto">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/10 flex items-center justify-center mx-auto mb-6"
              >
                <Flame className="w-10 h-10 text-orange-400/60" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-200 mb-3">No habits yet</h3>
              <p className="text-gray-500 mb-2 text-lg">
                "Success is the sum of small efforts, repeated day in and day out."
              </p>
              <p className="text-gray-600 text-sm mb-8">
                Start with ONE habit that matters. Master it before adding more.
              </p>
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-gradient-to-r from-[#d4a574] to-[#c49464] hover:from-[#c49464] hover:to-[#b38454] text-black font-semibold"
              >
                <Plus className="mr-2 w-4 h-4" />
                Create Your First Habit
              </Button>
            </div>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="space-y-4">
          {habits.map((habit, index) => {
            const completedToday = isCompletedToday(habit);
            const weeklyData = getWeeklyCompletion(habit);
            const nextMilestone = getNextMilestone(habit.streak || 0);
            const currentMilestone = getCurrentMilestone(habit.streak || 0);
            const weeklyCompletions = weeklyData.filter(d => d.completed).length;

            return (
              <motion.div
                key={habit.id}
                variants={itemVariants}
                layout
                whileHover={{ scale: 1.01 }}
              >
                <Card
                  className={`p-6 border transition-all duration-300 ${
                    completedToday 
                      ? 'border-green-500/30 bg-gradient-to-br from-green-500/5 to-[#0d0d0d]' 
                      : 'border-[#d4a574]/10 bg-[#0d0d0d] hover:border-[#d4a574]/30'
                  }`}
                  data-testid={`habit-card-${habit.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      {/* Header */}
                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            completedToday 
                              ? 'bg-green-500/20' 
                              : 'bg-gradient-to-br from-orange-500/20 to-red-500/10'
                          }`}
                        >
                          {completedToday ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <Flame className="w-5 h-5 text-orange-400" />
                          )}
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-100">{habit.name}</h3>
                          {habit.description && (
                            <p className="text-sm text-gray-500 line-clamp-1">{habit.description}</p>
                          )}
                        </div>
                        {completedToday && (
                          <span className="text-xs text-green-400 bg-green-400/10 px-3 py-1 rounded-full font-medium">
                            ✓ Done today
                          </span>
                        )}
                      </div>

                      {/* Weekly Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 uppercase tracking-wider">Last 7 days</span>
                          <span className="text-xs text-gray-400 font-medium">
                            {weeklyCompletions}/7 days
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {weeklyData.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <motion.div 
                                className={`w-full h-10 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                                  day.completed 
                                    ? 'bg-gradient-to-b from-[#d4a574] to-[#b38454] text-black' 
                                    : day.isToday
                                      ? 'bg-gray-800 border-2 border-dashed border-gray-600 text-gray-500'
                                      : 'bg-gray-800/50 text-gray-600'
                                }`}
                                whileHover={{ scale: 1.1 }}
                              >
                                {day.completed ? '✓' : day.dayNum}
                              </motion.div>
                              <span className={`text-[10px] ${
                                day.isToday ? 'text-[#d4a574] font-semibold' : 'text-gray-600'
                              }`}>
                                {day.dayName}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Streak Info */}
                      <div className="flex items-center gap-6 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Flame className={`w-4 h-4 ${(habit.streak || 0) > 0 ? 'text-orange-400' : 'text-gray-600'}`} />
                          <span className="text-gray-300">
                            <span className="font-bold text-lg">{habit.streak || 0}</span>
                            <span className="text-gray-500 ml-1">day streak</span>
                          </span>
                          {currentMilestone && (
                            <span className="text-lg" title={currentMilestone.label}>
                              {currentMilestone.emoji}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Best: <span className="text-gray-400 font-medium">{habit.best_streak || 0}</span> days
                        </div>
                        {nextMilestone && (habit.streak || 0) > 0 && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            <span className="text-gray-400">{nextMilestone.days - (habit.streak || 0)}</span> to {nextMilestone.label}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-3">
                      {completedToday ? (
                        <div className="flex items-center gap-2 text-green-400 px-4 py-2">
                          <CheckCircle className="w-6 h-6" />
                          <span className="font-semibold">Complete</span>
                        </div>
                      ) : (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => handleComplete(habit.id)}
                            disabled={completingHabit === habit.id}
                            data-testid={`complete-habit-${habit.id}`}
                            className="bg-gradient-to-r from-[#d4a574] to-[#c49464] hover:from-[#c49464] hover:to-[#b38454] text-black font-semibold shadow-lg shadow-[#d4a574]/20"
                          >
                            {completingHabit === habit.id ? (
                              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="mr-2 w-4 h-4" />
                                Mark Complete
                              </>
                            )}
                          </Button>
                        </motion.div>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(habit.id)}
                        data-testid={`delete-habit-${habit.id}`}
                        className="text-gray-500 hover:text-red-400 hover:bg-red-400/10 text-xs"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Insight Card */}
      {habits.length > 0 && maxStreak >= 3 && (
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-[#d4a574]/20 bg-gradient-to-br from-[#d4a574]/5 to-[#0d0d0d]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4a574]/20 to-[#d4a574]/5 flex items-center justify-center shrink-0">
                <Brain className="w-6 h-6 text-[#d4a574]" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#d4a574]" />
                  Insight: Building Momentum
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {maxStreak >= 66 
                    ? "You've achieved automaticity. This habit is now part of your identity. James Clear calls this the 'Plateau of Latent Potential' breakthrough."
                    : maxStreak >= 21 
                      ? "You're past the 21-day mark where neural pathways strengthen. The habit is becoming automatic. Keep protecting this momentum."
                      : maxStreak >= 7
                        ? "A full week of consistency. Research shows the first week is about showing up, not perfection. You're building the foundation."
                        : "You've started building a streak. Remember: you're not just building a habit, you're casting votes for your new identity."}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Habits;
