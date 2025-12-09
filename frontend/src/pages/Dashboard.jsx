import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target, TrendingUp, Flame, Brain, 
  Mountain, Crown, Sun, Moon, Sunrise, Sunset, CloudSun, 
  Calendar, Clock, ChevronRight, Quote, Trophy,
  Compass, PenTool, Layers, ArrowRight, Zap, Sparkles,
  Heart, Star, BookOpen, Eye, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Deeply meaningful quotes organized by philosophy and context
const powerQuotes = {
  think_and_grow_rich: [
    { 
      text: "Whatever the mind can conceive and believe, it can achieve.", 
      author: "Napoleon Hill", 
      context: "Your beliefs shape your reality. What you hold in your mind consistently becomes your experience.",
      principle: "The Law of Mind"
    },
    { 
      text: "The starting point of all achievement is desire. Keep this constantly in mind.", 
      author: "Napoleon Hill", 
      context: "Not a wish. Not a hope. A burning desire that consumes all doubt.",
      principle: "Burning Desire"
    },
    { 
      text: "Strength and growth come only through continuous effort and struggle.", 
      author: "Napoleon Hill", 
      context: "The resistance you feel is the very thing building your capacity.",
      principle: "Persistence"
    },
    { 
      text: "You are the master of your destiny. You can influence, direct and control your own environment.", 
      author: "Napoleon Hill", 
      context: "External circumstances bend to internal resolve.",
      principle: "Self-Determination"
    },
    { 
      text: "Set your mind on a definite goal and observe how quickly the world stands aside to let you pass.", 
      author: "Napoleon Hill", 
      context: "Clarity of purpose creates its own momentum.",
      principle: "Definiteness of Purpose"
    },
    { 
      text: "Every adversity, every failure, every heartache carries with it the seed of an equal or greater benefit.", 
      author: "Napoleon Hill", 
      context: "Look for the opportunity hidden within every setback.",
      principle: "Transmutation"
    },
  ],
  atomic_habits: [
    { 
      text: "You do not rise to the level of your goals. You fall to the level of your systems.", 
      author: "James Clear", 
      context: "Goals set direction. Systems determine progress. Build the machine.",
      principle: "Systems Thinking"
    },
    { 
      text: "Every action you take is a vote for the type of person you wish to become.", 
      author: "James Clear", 
      context: "Identity change happens one small vote at a time.",
      principle: "Identity-Based Habits"
    },
    { 
      text: "Habits are the compound interest of self-improvement.", 
      author: "James Clear", 
      context: "1% better daily = 37x better in a year. The math is on your side.",
      principle: "The Aggregation of Marginal Gains"
    },
    { 
      text: "Be the designer of your world and not merely the consumer of it.", 
      author: "James Clear", 
      context: "Environment shapes behavior. Shape your environment first.",
      principle: "Environment Design"
    },
    { 
      text: "The most effective way to change your habits is to focus on who you wish to become.", 
      author: "James Clear", 
      context: "Don't focus on what you want. Focus on who you want to be.",
      principle: "Identity Transformation"
    },
    { 
      text: "Success is the product of daily habits—not once-in-a-lifetime transformations.", 
      author: "James Clear", 
      context: "Small improvements compound into remarkable results.",
      principle: "The Plateau of Latent Potential"
    },
  ],
  obstacle_is_the_way: [
    { 
      text: "The impediment to action advances action. What stands in the way becomes the way.", 
      author: "Marcus Aurelius", 
      context: "Every obstacle contains the seed of an equal or greater benefit.",
      principle: "Obstacle as Opportunity"
    },
    { 
      text: "We suffer more in imagination than in reality.", 
      author: "Seneca", 
      context: "Most of your fears will never materialize. Act despite them.",
      principle: "Premeditatio Malorum"
    },
    { 
      text: "It is not because things are difficult that we do not dare; it is because we do not dare that they are difficult.", 
      author: "Seneca", 
      context: "Courage precedes confidence. Move first.",
      principle: "Courageous Action"
    },
    { 
      text: "The obstacle on the path becomes the path. Never forget, within every obstacle is an opportunity.", 
      author: "Ryan Holiday", 
      context: "Reframe every setback as training.",
      principle: "Perception Shift"
    },
    { 
      text: "Difficulties strengthen the mind, as labor does the body.", 
      author: "Seneca", 
      context: "What challenges you, changes you.",
      principle: "Voluntary Hardship"
    },
    { 
      text: "You have power over your mind — not outside events. Realize this, and you will find strength.", 
      author: "Marcus Aurelius", 
      context: "Focus only on what you can control.",
      principle: "The Dichotomy of Control"
    },
  ]
};

// Time-based greetings with context
const getTimeData = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 9) return { 
    period: 'morning', 
    greeting: 'Good Morning', 
    icon: Sunrise, 
    message: 'The first hours shape the rest. Use them wisely.',
    suggestion: 'Start with your Morning Algorithm'
  };
  if (hour >= 9 && hour < 12) return { 
    period: 'midmorning', 
    greeting: 'Good Morning', 
    icon: Sun, 
    message: 'Peak cognitive hours. Deep work awaits.',
    suggestion: 'Focus on your most important goal'
  };
  if (hour >= 12 && hour < 17) return { 
    period: 'afternoon', 
    greeting: 'Good Afternoon', 
    icon: CloudSun, 
    message: 'Maintain momentum. Small progress is still progress.',
    suggestion: 'Check in on your habits'
  };
  if (hour >= 17 && hour < 21) return { 
    period: 'evening', 
    greeting: 'Good Evening', 
    icon: Sunset, 
    message: 'Reflect on today. Prepare for tomorrow.',
    suggestion: 'Write in your journal'
  };
  return { 
    period: 'night', 
    greeting: 'Good Evening', 
    icon: Moon, 
    message: 'Rest is part of the process. Recovery enables growth.',
    suggestion: 'Plan tomorrow before you sleep'
  };
};

const philosophyConfig = {
  think_and_grow_rich: { 
    icon: Crown, 
    label: 'Think & Grow Rich',
    theme: 'wealth',
    color: 'from-amber-400 to-yellow-600'
  },
  atomic_habits: { 
    icon: Layers, 
    label: 'Atomic Habits',
    theme: 'systems',
    color: 'from-blue-400 to-indigo-600'
  },
  obstacle_is_the_way: { 
    icon: Mountain, 
    label: 'Stoic Philosophy',
    theme: 'resilience',
    color: 'from-emerald-400 to-teal-600'
  }
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const Dashboard = ({ token, user, userPreferences }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState(null);
  const [timeData, setTimeData] = useState(getTimeData());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isQuoteChanging, setIsQuoteChanging] = useState(false);

  const preferredPhilosophy = userPreferences?.preferredPhilosophy || 'think_and_grow_rich';
  const philosophy = philosophyConfig[preferredPhilosophy];
  const PhilosophyIcon = philosophy?.icon || Crown;

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setTimeData(getTimeData());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchAnalytics();
    selectQuote();
  }, [preferredPhilosophy]);

  const selectQuote = useCallback(() => {
    setIsQuoteChanging(true);
    setTimeout(() => {
      const quotes = powerQuotes[preferredPhilosophy] || powerQuotes.think_and_grow_rich;
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
      setIsQuoteChanging(false);
    }, 300);
  }, [preferredPhilosophy]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/analytics/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const TimeIcon = timeData.icon;
  const userName = user?.name?.split(' ')[0] || 'Seeker';

  // Calculate meaningful metrics
  const goalsActive = analytics?.goals?.active || 0;
  const goalsCompleted = analytics?.goals?.completed || 0;
  const completionRate = analytics?.goals?.completion_rate || 0;
  const currentStreak = analytics?.habits?.max_streak || 0;
  const totalHabits = analytics?.habits?.total || 0;
  const journalEntries = analytics?.journal?.total_entries || 0;

  // Calculate today's habit completion
  const todayHabits = analytics?.habit_completions_7_days?.[0] || { completed: 0, total: 0 };
  const todayProgress = todayHabits.total > 0 ? Math.round((todayHabits.completed / todayHabits.total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <motion.div 
          className="text-center space-y-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="w-16 h-16 border-2 border-[#d4a574]/20 border-t-[#d4a574] rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#d4a574]/50" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-gray-400 text-sm">Preparing your journey...</p>
            <p className="text-gray-600 text-xs">Loading progress data</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-8 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section - Personal & Meaningful */}
      <motion.div variants={itemVariants} className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#d4a574]/5 via-transparent to-transparent rounded-3xl" />
        
        <div className="relative space-y-4 py-6">
          {/* Time & Date Context */}
          <div className="flex items-center gap-3 text-gray-500">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#d4a574]/10 border border-[#d4a574]/20">
              <TimeIcon className="w-4 h-4 text-[#d4a574]" />
              <span className="text-sm text-[#d4a574]">{timeData.greeting}</span>
            </div>
            <span className="text-sm">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>

          {/* Personal Greeting */}
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-100 tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-[#d4a574] to-[#e6b786] bg-clip-text text-transparent">{userName}</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl">{timeData.message}</p>
          </div>

          {/* Quick Suggestion */}
          <motion.div 
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#d4a574] cursor-pointer transition-colors"
            whileHover={{ x: 5 }}
          >
            <Sparkles className="w-4 h-4" />
            <span>{timeData.suggestion}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid - Clean, Meaningful Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Active Goals', 
            value: goalsActive, 
            subtext: `${goalsCompleted} completed`,
            icon: Target,
            href: '/goals',
            color: 'text-[#d4a574]',
            bgColor: 'from-[#d4a574]/20 to-[#d4a574]/5'
          },
          { 
            label: 'Current Streak', 
            value: `${currentStreak}`, 
            subtext: currentStreak === 1 ? 'day strong' : 'days strong',
            icon: Flame,
            href: '/habits',
            color: 'text-orange-400',
            bgColor: 'from-orange-500/20 to-orange-500/5'
          },
          { 
            label: 'Today\'s Habits', 
            value: `${todayProgress}%`, 
            subtext: `${todayHabits.completed}/${todayHabits.total} done`,
            icon: TrendingUp,
            href: '/habits',
            color: 'text-emerald-400',
            bgColor: 'from-emerald-500/20 to-emerald-500/5'
          },
          { 
            label: 'Reflections', 
            value: journalEntries, 
            subtext: 'journal entries',
            icon: PenTool,
            href: '/journal',
            color: 'text-purple-400',
            bgColor: 'from-purple-500/20 to-purple-500/5'
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to={stat.href}>
              <Card className="p-5 border-[#d4a574]/10 hover:border-[#d4a574]/30 bg-[#0d0d0d] transition-all duration-300 cursor-pointer group relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                    <stat.icon className={`w-5 h-5 ${stat.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                  </div>
                  <p className="text-3xl font-bold text-gray-100 mb-1">{stat.value}</p>
                  <p className="text-gray-600 text-xs">{stat.subtext}</p>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Daily Wisdom - The Heart of Inspiration */}
      <motion.div variants={itemVariants}>
        <Card className="border-[#d4a574]/20 bg-gradient-to-br from-[#0d0d0d] to-[#0a0a0f] overflow-hidden relative">
          {/* Subtle animated background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4a574]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#d4a574]/5 rounded-full blur-2xl" />
          </div>
          
          <div className="relative p-8 lg:p-10">
            <div className="flex items-start gap-6">
              {/* Quote Icon */}
              <motion.div 
                className="hidden sm:flex shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4a574]/20 to-[#d4a574]/5 items-center justify-center border border-[#d4a574]/20"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Quote className="w-6 h-6 text-[#d4a574]" />
              </motion.div>
              
              <div className="flex-1 space-y-5">
                {/* Philosophy Badge */}
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${philosophy?.color || 'from-[#d4a574] to-[#e6b786]'} bg-opacity-10`}>
                    <PhilosophyIcon className="w-4 h-4 text-white/80" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                      {philosophy?.label}
                    </span>
                  </div>
                  {quote?.principle && (
                    <span className="text-xs text-gray-500 hidden md:block">
                      {quote.principle}
                    </span>
                  )}
                </div>
                
                {/* Quote Text */}
                <AnimatePresence mode="wait">
                  <motion.blockquote
                    key={quote?.text}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-2xl lg:text-3xl text-gray-100 font-light leading-relaxed"
                  >
                    "{quote?.text}"
                  </motion.blockquote>
                </AnimatePresence>
                
                {/* Author & Action */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <cite className="text-gray-400 not-italic font-medium">— {quote?.author}</cite>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={selectQuote}
                    disabled={isQuoteChanging}
                    className="text-[#d4a574] hover:text-[#e6b786] hover:bg-[#d4a574]/10"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    New wisdom
                  </Button>
                </div>
                
                {/* Context - Deeper Understanding */}
                {quote?.context && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="pt-4 border-t border-[#d4a574]/10"
                  >
                    <p className="text-gray-500 text-sm leading-relaxed flex items-start gap-3">
                      <Eye className="w-4 h-4 text-[#d4a574]/50 shrink-0 mt-0.5" />
                      {quote.context}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Action Grid - Clear Purpose */}
      <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-6">
        {/* Primary Actions */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4" />
            Continue Your Journey
          </h2>
          
          <div className="space-y-3">
            {[
              {
                to: '/morning-algorithm',
                icon: Sunrise,
                iconBg: 'from-[#d4a574]/20 to-[#d4a574]/5',
                iconColor: 'text-[#d4a574]',
                title: 'Morning Algorithm',
                subtitle: 'Start your day with intention'
              },
              {
                to: '/habits',
                icon: Flame,
                iconBg: 'from-orange-500/20 to-orange-500/5',
                iconColor: 'text-orange-400',
                title: 'Daily Habits',
                subtitle: totalHabits > 0 ? `${totalHabits} habits to check` : 'Build your systems'
              },
              {
                to: '/journal',
                icon: PenTool,
                iconBg: 'from-purple-500/20 to-purple-500/5',
                iconColor: 'text-purple-400',
                title: 'Daily Reflection',
                subtitle: 'Process today\'s experiences'
              }
            ].map((action, i) => (
              <motion.div key={i} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                <Link to={action.to}>
                  <Card className="p-5 border-[#d4a574]/10 hover:border-[#d4a574]/30 bg-[#0d0d0d] transition-all duration-300 cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.iconBg} flex items-center justify-center`}>
                          <action.icon className={`w-6 h-6 ${action.iconColor}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-200 group-hover:text-[#d4a574] transition-colors">{action.title}</h3>
                          <p className="text-sm text-gray-500">{action.subtitle}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-[#d4a574] group-hover:translate-x-1 transition-all" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Coach & Guidance */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Get Guidance
          </h2>
          
          <Link to="/ai-coach">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card className="p-6 border-[#d4a574]/20 bg-gradient-to-br from-[#d4a574]/10 to-[#0d0d0d] hover:from-[#d4a574]/15 transition-all duration-300 cursor-pointer group h-full">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#d4a574]/30 to-[#d4a574]/10 flex items-center justify-center border border-[#d4a574]/20">
                      <Brain className="w-7 h-7 text-[#d4a574]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-200">AI Growth Coach</h3>
                      <p className="text-sm text-gray-500">Personalized wisdom & guidance</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm flex-1 leading-relaxed">
                    Get insights tailored to your goals from Napoleon Hill, James Clear, or Ryan Holiday. Overcome obstacles with timeless wisdom.
                  </p>
                  <div className="flex items-center gap-2 mt-5 text-[#d4a574] font-medium group-hover:gap-3 transition-all">
                    <Sparkles className="w-4 h-4" />
                    <span>Start a conversation</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Progress Overview */}
      {(goalsActive > 0 || currentStreak > 0) && (
        <motion.div variants={itemVariants}>
          <Card className="border-[#d4a574]/10 bg-[#0d0d0d]">
            <div className="p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#d4a574]" />
                  Your Progress
                </h2>
                <Link to="/analytics" className="text-sm text-[#d4a574] hover:underline flex items-center gap-1 group">
                  View details 
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Goal Progress */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm font-medium">Goal Completion</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-[#d4a574] to-[#e6b786] bg-clip-text text-transparent">
                      {completionRate}%
                    </span>
                  </div>
                  <div className="relative h-3 bg-gray-800/50 rounded-full overflow-hidden">
                    <motion.div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#d4a574] to-[#e6b786] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${completionRate}%` }}
                      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {goalsCompleted} of {goalsActive + goalsCompleted} goals completed
                  </p>
                </div>

                {/* Streak Visual */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm font-medium">Consistency Streak</span>
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span className="text-xl font-bold text-orange-400">{currentStreak} days</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {[...Array(7)].map((_, i) => (
                      <motion.div 
                        key={i} 
                        className={`flex-1 h-3 rounded-full ${
                          i < Math.min(currentStreak, 7) 
                            ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                            : 'bg-gray-800/50'
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + (i * 0.1) }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {currentStreak >= 7 
                      ? "A week of consistency. Your systems are working." 
                      : currentStreak > 0 
                        ? "Building momentum. Keep showing up."
                        : "Start your streak today."}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Quick Navigation for Deep Features */}
      <motion.div variants={itemVariants}>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Explore More
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Vision Board', href: '/vision-board', icon: Compass, color: 'group-hover:text-blue-400' },
            { label: 'Journey Map', href: '/journey', icon: Mountain, color: 'group-hover:text-emerald-400' },
            { label: 'Obstacles', href: '/obstacle', icon: Shield, color: 'group-hover:text-amber-400' },
            { label: 'Wisdom Library', href: '/wisdom', icon: Crown, color: 'group-hover:text-purple-400' },
          ].map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to={item.href}>
                <Card className="p-4 border-[#d4a574]/10 hover:border-[#d4a574]/20 bg-[#0d0d0d] transition-all cursor-pointer group text-center">
                  <item.icon className={`w-6 h-6 text-gray-600 ${item.color} mx-auto mb-2 transition-colors`} />
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors font-medium">{item.label}</p>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
