import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, TrendingUp, BookOpen, Award, Calendar, Flame,
  Trophy, Sparkles, ArrowRight, ChevronRight, Brain,
  Heart, Zap, Mountain, Crown, Star, Eye, BarChart3,
  Clock, CheckCircle, Activity, PieChart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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

// Category colors
const categoryColors = {
  career: { bg: 'from-blue-500/20 to-blue-600/10', text: 'text-blue-400', icon: '💼' },
  health: { bg: 'from-green-500/20 to-green-600/10', text: 'text-green-400', icon: '💪' },
  finance: { bg: 'from-amber-500/20 to-amber-600/10', text: 'text-amber-400', icon: '💰' },
  relationships: { bg: 'from-pink-500/20 to-pink-600/10', text: 'text-pink-400', icon: '❤️' },
  personal: { bg: 'from-purple-500/20 to-purple-600/10', text: 'text-purple-400', icon: '🌱' },
  skills: { bg: 'from-cyan-500/20 to-cyan-600/10', text: 'text-cyan-400', icon: '📚' },
};

// Mood colors
const moodColors = {
  energized: { color: '#4ade80', label: 'Energized' },
  focused: { color: '#60a5fa', label: 'Focused' },
  calm: { color: '#a78bfa', label: 'Calm' },
  reflective: { color: '#d4a574', label: 'Reflective' },
  challenged: { color: '#f59e0b', label: 'Challenged' },
  drained: { color: '#6b7280', label: 'Drained' },
};

// Insight generator
const generateInsight = (analytics) => {
  if (!analytics) return null;
  
  const insights = [];
  
  // Habit insights
  if (analytics.habits?.max_streak >= 7) {
    insights.push({
      type: 'success',
      title: 'Consistency Champion',
      message: `Your ${analytics.habits.max_streak}-day streak shows real commitment. Studies show habits formed over 21 days become automatic.`,
      icon: Flame,
      color: 'text-orange-400'
    });
  }
  
  // Goal insights
  if (analytics.goals?.completed >= 3) {
    insights.push({
      type: 'success',
      title: 'Goal Crusher',
      message: `You've completed ${analytics.goals.completed} goals. Each one proves what your mind can conceive, it can achieve.`,
      icon: Trophy,
      color: 'text-yellow-400'
    });
  }
  
  // Journal insights
  if (analytics.journal?.current_streak >= 3) {
    insights.push({
      type: 'success',
      title: 'Reflective Mind',
      message: `${analytics.journal.current_streak} days of journaling. The unexamined life is not worth living - you're living deliberately.`,
      icon: BookOpen,
      color: 'text-purple-400'
    });
  }
  
  // Challenge insights
  if (analytics.habits?.total > 0 && analytics.habits?.max_streak < 3) {
    insights.push({
      type: 'challenge',
      title: 'Build Your Streak',
      message: 'Focus on completing your habits for the next 3 days. That\'s when momentum begins.',
      icon: Target,
      color: 'text-blue-400'
    });
  }
  
  if (analytics.goals?.active === 0 && analytics.goals?.completed === 0) {
    insights.push({
      type: 'challenge',
      title: 'Set Your First Goal',
      message: 'A goal without a deadline is just a dream. Define what you want to achieve.',
      icon: Mountain,
      color: 'text-emerald-400'
    });
  }
  
  return insights.length > 0 ? insights[Math.floor(Math.random() * insights.length)] : null;
};

const Analytics = ({ token }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

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
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const insight = useMemo(() => generateInsight(analytics), [analytics]);

  // Calculate overall score (0-100)
  const overallScore = useMemo(() => {
    if (!analytics) return 0;
    let score = 0;
    // Goals contribution (max 25)
    score += Math.min((analytics.goals?.completed || 0) * 5, 25);
    // Habit streak contribution (max 30)
    score += Math.min((analytics.habits?.max_streak || 0) * 2, 30);
    // Journal contribution (max 20)
    score += Math.min((analytics.journal?.total_entries || 0), 20);
    // Exercise contribution (max 25)
    score += Math.min((analytics.exercises?.total_completed || 0), 25);
    return Math.min(score, 100);
  }, [analytics]);

  // Get level based on score
  const getLevel = (score) => {
    if (score >= 90) return { name: 'Master', icon: Crown, color: 'text-yellow-400' };
    if (score >= 70) return { name: 'Champion', icon: Trophy, color: 'text-purple-400' };
    if (score >= 50) return { name: 'Rising Star', icon: Star, color: 'text-blue-400' };
    if (score >= 25) return { name: 'Seeker', icon: Target, color: 'text-emerald-400' };
    return { name: 'Beginner', icon: Sparkles, color: 'text-gray-400' };
  };

  const level = getLevel(overallScore);
  const LevelIcon = level.icon;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="relative">
            <div className="w-14 h-14 border-2 border-[#d4a574]/20 border-t-[#d4a574] rounded-full animate-spin mx-auto" />
            <BarChart3 className="w-6 h-6 text-[#d4a574]/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-500 text-sm">Analyzing your progress...</p>
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
      {/* Header with Overall Score */}
      <motion.div variants={itemVariants} className="relative">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-100 flex items-center gap-3" data-testid="analytics-header">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4a574]/20 to-[#d4a574]/5 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#d4a574]" />
              </div>
              Your Progress
            </h1>
            <p className="text-gray-500 text-lg">
              Track your transformation with profound insights
            </p>
          </div>

          {/* Overall Score Card */}
          <Card className="p-6 border-[#d4a574]/20 bg-gradient-to-br from-[#d4a574]/10 to-[#0d0d0d] min-w-[280px]">
            <div className="flex items-center gap-4">
              <div className="relative">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40" cy="40" r="36"
                    className="stroke-gray-800"
                    strokeWidth="6"
                    fill="none"
                  />
                  <motion.circle
                    cx="40" cy="40" r="36"
                    className="stroke-[#d4a574]"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 226" }}
                    animate={{ strokeDasharray: `${(overallScore / 100) * 226} 226` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#d4a574]">{overallScore}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <LevelIcon className={`w-5 h-5 ${level.color}`} />
                  <span className={`font-semibold ${level.color}`}>{level.name}</span>
                </div>
                <p className="text-sm text-gray-500">Growth Score</p>
                <p className="text-xs text-gray-600 mt-1">Keep going to level up!</p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Personalized Insight */}
      {insight && (
        <motion.div variants={itemVariants}>
          <Card className={`p-6 border-[#d4a574]/20 bg-gradient-to-br ${
            insight.type === 'success' ? 'from-emerald-500/5' : 'from-blue-500/5'
          } to-[#0d0d0d]`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                insight.type === 'success' ? 'from-emerald-500/20 to-emerald-500/5' : 'from-blue-500/20 to-blue-500/5'
              } flex items-center justify-center shrink-0`}>
                <insight.icon className={`w-6 h-6 ${insight.color}`} />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-200 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#d4a574]" />
                  {insight.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {insight.message}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Main Stats Grid */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Goals Completed', 
            value: analytics?.goals?.completed || 0, 
            total: analytics?.goals?.total,
            icon: Trophy, 
            color: 'text-yellow-400',
            bgColor: 'from-yellow-500/20 to-yellow-600/5',
            href: '/goals'
          },
          { 
            label: 'Best Streak', 
            value: `${analytics?.habits?.best_streak_ever || analytics?.habits?.max_streak || 0}`, 
            suffix: 'days',
            icon: Flame, 
            color: 'text-orange-400',
            bgColor: 'from-orange-500/20 to-orange-600/5',
            href: '/habits'
          },
          { 
            label: 'Journal Entries', 
            value: analytics?.journal?.total_entries || 0, 
            icon: BookOpen, 
            color: 'text-purple-400',
            bgColor: 'from-purple-500/20 to-purple-600/5',
            href: '/journal'
          },
          { 
            label: 'Exercises Done', 
            value: analytics?.exercises?.total_completed || 0, 
            icon: Award, 
            color: 'text-emerald-400',
            bgColor: 'from-emerald-500/20 to-emerald-600/5',
            href: '/exercises'
          },
        ].map((stat, i) => (
          <motion.div key={i} whileHover={{ scale: 1.02, y: -4 }}>
            <Link to={stat.href}>
              <Card className="p-5 border-[#d4a574]/10 hover:border-[#d4a574]/30 bg-[#0d0d0d] transition-all duration-300 cursor-pointer group relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                    <stat.icon className={`w-5 h-5 ${stat.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-gray-100">{stat.value}</p>
                    {stat.suffix && <span className="text-gray-500 text-sm">{stat.suffix}</span>}
                    {stat.total && stat.total > 0 && (
                      <span className="text-gray-600 text-sm">/ {stat.total}</span>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Goals Performance */}
      <motion.div variants={itemVariants}>
        <Card className="border-[#d4a574]/20 bg-[#0d0d0d] overflow-hidden">
          <div className="p-6 border-b border-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4a574]/20 to-[#d4a574]/5 flex items-center justify-center">
                  <Target className="w-5 h-5 text-[#d4a574]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-200">Goals Overview</h2>
                  <p className="text-sm text-gray-500">Track your achievement journey</p>
                </div>
              </div>
              <Link to="/goals" className="text-sm text-[#d4a574] hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div data-testid="total-goals-stat">
                <p className="text-sm text-gray-500 mb-1">Total Goals</p>
                <p className="text-4xl font-bold text-[#d4a574]">{analytics?.goals?.total || 0}</p>
              </div>
              <div data-testid="active-goals-stat">
                <p className="text-sm text-gray-500 mb-1">Active</p>
                <p className="text-4xl font-bold text-blue-400">{analytics?.goals?.active || 0}</p>
              </div>
              <div data-testid="completed-goals-stat">
                <p className="text-sm text-gray-500 mb-1">Completed</p>
                <p className="text-4xl font-bold text-green-400">{analytics?.goals?.completed || 0}</p>
              </div>
            </div>
            
            {/* Completion Rate */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Completion Rate</span>
                <span className="text-[#d4a574] font-semibold">{analytics?.goals?.completion_rate || 0}%</span>
              </div>
              <div className="h-3 bg-gray-800/50 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#d4a574] to-[#e6b786] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${analytics?.goals?.completion_rate || 0}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Goals by Category */}
            {analytics?.goals?.by_category && Object.keys(analytics.goals.by_category).length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-800/50">
                <p className="text-sm text-gray-500 mb-4">Goals by Life Area</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(analytics.goals.by_category).map(([category, data]) => {
                    const config = categoryColors[category] || categoryColors.personal;
                    return (
                      <div 
                        key={category}
                        className={`p-3 rounded-xl bg-gradient-to-br ${config.bg} border border-gray-800/50`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{config.icon}</span>
                          <span className="text-sm text-gray-400 capitalize">{category}</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-xl font-bold ${config.text}`}>{data.completed}</span>
                          <span className="text-gray-600 text-sm">/ {data.total}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Habits Performance */}
      <motion.div variants={itemVariants}>
        <Card className="border-[#d4a574]/20 bg-[#0d0d0d] overflow-hidden">
          <div className="p-6 border-b border-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/5 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-200">Habits Performance</h2>
                  <p className="text-sm text-gray-500">Your consistency metrics</p>
                </div>
              </div>
              <Link to="/habits" className="text-sm text-[#d4a574] hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid md:grid-cols-4 gap-6 mb-6">
              <div data-testid="total-habits-stat">
                <p className="text-sm text-gray-500 mb-1">Active Habits</p>
                <p className="text-4xl font-bold text-[#d4a574]">{analytics?.habits?.total || 0}</p>
              </div>
              <div data-testid="max-streak-stat">
                <p className="text-sm text-gray-500 mb-1">Current Best</p>
                <p className="text-4xl font-bold text-orange-400">{analytics?.habits?.max_streak || 0} <span className="text-lg text-gray-500">days</span></p>
              </div>
              <div data-testid="avg-streak-stat">
                <p className="text-sm text-gray-500 mb-1">All-Time Best</p>
                <p className="text-4xl font-bold text-yellow-400">{analytics?.habits?.best_streak_ever || analytics?.habits?.max_streak || 0} <span className="text-lg text-gray-500">days</span></p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Check-ins</p>
                <p className="text-4xl font-bold text-emerald-400">{analytics?.habits?.total_completions || 0}</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 7-Day Activity */}
      {analytics?.habit_completions_7_days && analytics.habit_completions_7_days.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-[#d4a574]/20 bg-[#0d0d0d] overflow-hidden">
            <div className="p-6 border-b border-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-200">Last 7 Days</h2>
                  <p className="text-sm text-gray-500">Daily habit completion</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-7 gap-3">
                {[...analytics.habit_completions_7_days].reverse().map((day, index) => {
                  const percentage = day.total > 0 ? (day.completed / day.total) * 100 : 0;
                  const isToday = index === 6;
                  return (
                    <div key={index} className="text-center" data-testid={`day-activity-${index}`}>
                      <p className={`text-xs mb-2 ${isToday ? 'text-[#d4a574] font-semibold' : 'text-gray-500'}`}>
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <div className="relative h-28 bg-gray-800/50 rounded-xl overflow-hidden">
                        <motion.div 
                          className="absolute bottom-0 w-full bg-gradient-to-t from-[#d4a574] to-[#e6b786] rounded-b-xl"
                          initial={{ height: 0 }}
                          animate={{ height: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                        />
                        {isToday && (
                          <div className="absolute inset-0 border-2 border-[#d4a574] rounded-xl" />
                        )}
                      </div>
                      <p className="text-xs mt-2 font-medium text-gray-400">
                        {day.completed}/{day.total}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Journal & Mood */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
        {/* Journal Stats */}
        <Card className="border-[#d4a574]/20 bg-[#0d0d0d] overflow-hidden">
          <div className="p-6 border-b border-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/5 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-200">Journal Insights</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div data-testid="journal-count">
                <p className="text-sm text-gray-500 mb-1">Total Entries</p>
                <p className="text-4xl font-bold text-purple-400">{analytics?.journal?.total_entries || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Current Streak</p>
                <p className="text-4xl font-bold text-[#d4a574]">{analytics?.journal?.current_streak || 0} <span className="text-lg text-gray-500">days</span></p>
              </div>
            </div>
            
            {/* Mood Distribution */}
            {analytics?.journal?.mood_distribution && Object.keys(analytics.journal.mood_distribution).length > 0 && (
              <div className="pt-4 border-t border-gray-800/50">
                <p className="text-sm text-gray-500 mb-3">Mood Distribution</p>
                <div className="space-y-2">
                  {Object.entries(analytics.journal.mood_distribution).map(([mood, count]) => {
                    const config = moodColors[mood] || { color: '#6b7280', label: mood };
                    const total = Object.values(analytics.journal.mood_distribution).reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={mood} className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full shrink-0" 
                          style={{ backgroundColor: config.color }}
                        />
                        <span className="text-sm text-gray-400 w-20 capitalize">{config.label}</span>
                        <div className="flex-1 h-2 bg-gray-800/50 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full rounded-full"
                            style={{ backgroundColor: config.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-12 text-right">{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Exercises Stats */}
        <Card className="border-[#d4a574]/20 bg-[#0d0d0d] overflow-hidden">
          <div className="p-6 border-b border-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 flex items-center justify-center">
                <Award className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-200">Growth Exercises</h2>
            </div>
          </div>
          <div className="p-6">
            <p className="text-5xl font-bold text-emerald-400 mb-2" data-testid="exercises-count">
              {analytics?.exercises?.total_completed || 0}
            </p>
            <p className="text-sm text-gray-500 mb-6">Total exercises completed</p>
            
            <div className="space-y-3">
              <Link to="/exercises">
                <Button className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400">
                  <Zap className="w-4 h-4 mr-2" />
                  Do an Exercise
                </Button>
              </Link>
              <p className="text-xs text-gray-600 text-center">
                Gratitude, affirmations, obstacle reframing, and more
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Motivational Quote */}
      <motion.div variants={itemVariants}>
        <Card className="border-[#d4a574]/20 bg-gradient-to-br from-[#d4a574]/5 to-[#0d0d0d] p-8 text-center">
          <Brain className="w-10 h-10 mx-auto text-[#d4a574]/50 mb-4" />
          <blockquote className="text-xl text-gray-300 italic max-w-2xl mx-auto mb-3">
            "Success is the sum of small efforts, repeated day in and day out."
          </blockquote>
          <cite className="text-gray-500 text-sm">— Robert Collier</cite>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Analytics;
