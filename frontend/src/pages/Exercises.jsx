import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Zap, Target, Dumbbell, Brain, Sparkles, Mountain,
  Crown, Star, Award, CheckCircle, ArrowRight, ChevronRight,
  Quote, Eye, Sun, Flame, Shield, Clock, Calendar
} from 'lucide-react';
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

// Exercise types with rich context
const exerciseTypes = [
  {
    id: 'gratitude',
    name: 'Gratitude Practice',
    icon: Heart,
    color: 'from-pink-500 to-rose-600',
    bgColor: 'from-pink-500/20 to-rose-600/10',
    description: 'Shift your focus to abundance',
    philosophy: 'Napoleon Hill',
    quote: 'The grateful mind is constantly fixed upon the best. Therefore, it tends to become the best.',
    benefit: 'Rewires your brain to notice opportunities instead of obstacles',
    duration: '3 min'
  },
  {
    id: 'affirmations',
    name: 'Power Affirmations',
    icon: Zap,
    color: 'from-amber-500 to-yellow-600',
    bgColor: 'from-amber-500/20 to-yellow-600/10',
    description: 'Reprogram your subconscious mind',
    philosophy: 'Napoleon Hill',
    quote: 'Any idea, plan, or purpose may be placed in the mind through repetition of thought.',
    benefit: 'Auto-suggestion shapes your dominant thoughts and beliefs',
    duration: '5 min'
  },
  {
    id: 'obstacle',
    name: 'Obstacle Reframe',
    icon: Mountain,
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'from-emerald-500/20 to-teal-600/10',
    description: 'Turn challenges into opportunities',
    philosophy: 'Ryan Holiday',
    quote: 'The impediment to action advances action. What stands in the way becomes the way.',
    benefit: 'Transform obstacles from roadblocks to stepping stones',
    duration: '7 min'
  },
  {
    id: 'identity',
    name: 'Identity Declaration',
    icon: Crown,
    color: 'from-purple-500 to-indigo-600',
    bgColor: 'from-purple-500/20 to-indigo-600/10',
    description: 'Become who you want to be',
    philosophy: 'James Clear',
    quote: 'Every action you take is a vote for the type of person you wish to become.',
    benefit: 'Identity-based change is the most powerful form of transformation',
    duration: '5 min'
  },
  {
    id: 'visualization',
    name: 'Future Visualization',
    icon: Eye,
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'from-blue-500/20 to-cyan-600/10',
    description: 'See your success before it happens',
    philosophy: 'Napoleon Hill',
    quote: 'Cherish your visions and dreams as they are the children of your soul.',
    benefit: 'Your subconscious cannot distinguish between vivid imagination and reality',
    duration: '10 min'
  },
  {
    id: 'negative_visualization',
    name: 'Premeditatio Malorum',
    icon: Shield,
    color: 'from-slate-500 to-gray-600',
    bgColor: 'from-slate-500/20 to-gray-600/10',
    description: 'Prepare for adversity',
    philosophy: 'Ryan Holiday',
    quote: 'We must prepare in our minds for the possibility that things will not go as planned.',
    benefit: 'Reduces anxiety and builds resilience by mentally rehearsing challenges',
    duration: '5 min'
  },
];

const Exercises = ({ token }) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeExercise, setActiveExercise] = useState(null);
  const [completedToday, setCompletedToday] = useState(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Form states
  const [gratitudeItems, setGratitudeItems] = useState(['', '', '']);
  const [affirmations, setAffirmations] = useState(['', '', '']);
  const [obstacle, setObstacle] = useState({ challenge: '', reframe: '', action: '' });
  const [identity, setIdentity] = useState({ currentSelf: '', futureSelf: '', bridges: '' });
  const [visualization, setVisualization] = useState({ scene: '', feelings: '', actions: '' });
  const [premeditatio, setPremeditatio] = useState({ worstCase: '', response: '', acceptance: '' });

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await axios.get(`${API}/exercises`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExercises(response.data);
      
      // Check which exercises were completed today
      const today = new Date().toISOString().split('T')[0];
      const todayExercises = response.data
        .filter(e => e.date?.startsWith(today))
        .map(e => e.exercise_type);
      setCompletedToday(new Set(todayExercises));
    } catch (error) {
      toast.error('Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  const submitExercise = async (type, content) => {
    try {
      await axios.post(
        `${API}/exercises`,
        { exercise_type: type, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
      
      toast.success('Exercise completed! Your mind grows stronger.');
      fetchExercises();
      resetForm(type);
      setActiveExercise(null);
    } catch (error) {
      toast.error('Failed to save exercise');
    }
  };

  const resetForm = (type) => {
    switch(type) {
      case 'gratitude':
        setGratitudeItems(['', '', '']);
        break;
      case 'affirmations':
        setAffirmations(['', '', '']);
        break;
      case 'obstacle':
        setObstacle({ challenge: '', reframe: '', action: '' });
        break;
      case 'identity':
        setIdentity({ currentSelf: '', futureSelf: '', bridges: '' });
        break;
      case 'visualization':
        setVisualization({ scene: '', feelings: '', actions: '' });
        break;
      case 'negative_visualization':
        setPremeditatio({ worstCase: '', response: '', acceptance: '' });
        break;
    }
  };

  // Stats
  const totalExercises = exercises.length;
  const todayCount = completedToday.size;
  const streak = useMemo(() => {
    // Calculate exercise streak
    const dates = [...new Set(exercises.map(e => e.date?.split('T')[0]))].sort().reverse();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < dates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      if (dates[i] === expectedDate.toISOString().split('T')[0]) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [exercises]);

  const renderExerciseForm = () => {
    if (!activeExercise) return null;
    
    const exercise = exerciseTypes.find(e => e.id === activeExercise);
    const IconComponent = exercise.icon;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={() => setActiveExercise(null)}
      >
        <motion.div 
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
          initial={{ y: 20 }}
          animate={{ y: 0 }}
        >
          <Card className={`border-[#d4a574]/30 bg-[#0d0d0d] overflow-hidden`}>
            {/* Header */}
            <div className={`p-6 bg-gradient-to-r ${exercise.bgColor} border-b border-gray-800/50`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${exercise.color} flex items-center justify-center shadow-lg`}>
                  <IconComponent className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-100">{exercise.name}</h2>
                  <p className="text-gray-400 text-sm">{exercise.philosophy} • {exercise.duration}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                <Quote className="w-4 h-4 text-[#d4a574] mb-2" />
                <p className="text-gray-300 italic text-sm">{exercise.quote}</p>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-6">
              {activeExercise === 'gratitude' && (
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm mb-4">
                    Close your eyes. Think about today. What three things, big or small, are you genuinely grateful for?
                  </p>
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                      <Label className="text-gray-300 text-sm">Gratitude {i + 1}</Label>
                      <Input
                        value={gratitudeItems[i]}
                        onChange={(e) => {
                          const newItems = [...gratitudeItems];
                          newItems[i] = e.target.value;
                          setGratitudeItems(newItems);
                        }}
                        data-testid={`gratitude-item-${i}`}
                        placeholder="I am grateful for..."
                        className="bg-gray-900/50 border-[#d4a574]/20 text-white focus:border-[#d4a574]/50"
                      />
                    </div>
                  ))}
                  <Button
                    onClick={() => submitExercise('gratitude', { items: gratitudeItems.filter(i => i) })}
                    disabled={gratitudeItems.filter(i => i).length < 1}
                    data-testid="gratitude-submit"
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Exercise
                  </Button>
                </div>
              )}

              {activeExercise === 'affirmations' && (
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm mb-4">
                    Write statements about yourself as if they are already true. Use "I am" statements. Feel them as you write.
                  </p>
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                      <Label className="text-gray-300 text-sm">Affirmation {i + 1}</Label>
                      <Textarea
                        value={affirmations[i]}
                        onChange={(e) => {
                          const newAffirmations = [...affirmations];
                          newAffirmations[i] = e.target.value;
                          setAffirmations(newAffirmations);
                        }}
                        data-testid={`affirmation-item-${i}`}
                        placeholder="I am..."
                        rows={2}
                        className="bg-gray-900/50 border-[#d4a574]/20 text-white focus:border-[#d4a574]/50"
                      />
                    </div>
                  ))}
                  <Button
                    onClick={() => submitExercise('affirmations', { affirmations: affirmations.filter(a => a) })}
                    disabled={affirmations.filter(a => a).length < 1}
                    data-testid="affirmation-submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Exercise
                  </Button>
                </div>
              )}

              {activeExercise === 'obstacle' && (
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm mb-4">
                    The Stoics knew that obstacles contain hidden opportunities. Let's transform your challenge.
                  </p>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">What obstacle are you facing?</Label>
                    <Textarea
                      value={obstacle.challenge}
                      onChange={(e) => setObstacle({ ...obstacle, challenge: e.target.value })}
                      data-testid="obstacle-challenge"
                      placeholder="Describe the challenge honestly..."
                      rows={3}
                      className="bg-gray-900/50 border-[#d4a574]/20 text-white focus:border-[#d4a574]/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">How can this obstacle make you stronger?</Label>
                    <Textarea
                      value={obstacle.reframe}
                      onChange={(e) => setObstacle({ ...obstacle, reframe: e.target.value })}
                      data-testid="obstacle-reframe"
                      placeholder="What opportunity lies within this challenge?"
                      rows={3}
                      className="bg-gray-900/50 border-[#d4a574]/20 text-white focus:border-[#d4a574]/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">What one action can you take right now?</Label>
                    <Input
                      value={obstacle.action}
                      onChange={(e) => setObstacle({ ...obstacle, action: e.target.value })}
                      data-testid="obstacle-action"
                      placeholder="My next action is..."
                      className="bg-gray-900/50 border-[#d4a574]/20 text-white focus:border-[#d4a574]/50"
                    />
                  </div>
                  <Button
                    onClick={() => submitExercise('obstacle', obstacle)}
                    disabled={!obstacle.challenge || !obstacle.reframe}
                    data-testid="obstacle-submit"
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Exercise
                  </Button>
                </div>
              )}

              {activeExercise === 'identity' && (
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm mb-4">
                    True change is identity change. Let's bridge who you are to who you're becoming.
                  </p>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">Who are you today? (Be honest)</Label>
                    <Textarea
                      value={identity.currentSelf}
                      onChange={(e) => setIdentity({ ...identity, currentSelf: e.target.value })}
                      data-testid="identity-current"
                      placeholder="Currently, I am someone who..."
                      rows={3}
                      className="bg-gray-900/50 border-[#d4a574]/20 text-white focus:border-[#d4a574]/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">Who do you want to become?</Label>
                    <Textarea
                      value={identity.futureSelf}
                      onChange={(e) => setIdentity({ ...identity, futureSelf: e.target.value })}
                      data-testid="identity-future"
                      placeholder="I am becoming someone who..."
                      rows={3}
                      className="bg-gray-900/50 border-[#d4a574]/20 text-white focus:border-[#d4a574]/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">What small actions would that person take daily?</Label>
                    <Textarea
                      value={identity.bridges}
                      onChange={(e) => setIdentity({ ...identity, bridges: e.target.value })}
                      data-testid="identity-bridges"
                      placeholder="That person would..."
                      rows={3}
                      className="bg-gray-900/50 border-[#d4a574]/20 text-white focus:border-[#d4a574]/50"
                    />
                  </div>
                  <Button
                    onClick={() => submitExercise('identity', identity)}
                    disabled={!identity.currentSelf || !identity.futureSelf}
                    data-testid="identity-submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Exercise
                  </Button>
                </div>
              )}

              {activeExercise === 'visualization' && (
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm mb-4">
                    Close your eyes. Take three deep breaths. Now, imagine your ideal future has already happened...
                  </p>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">Describe the scene in vivid detail</Label>
                    <Textarea
                      value={visualization.scene}
                      onChange={(e) => setVisualization({ ...visualization, scene: e.target.value })}
                      data-testid="visualization-scene"
                      placeholder="I see myself... Where are you? What do you see around you?"
                      rows={4}
                      className="bg-gray-900/50 border-[#d4a574]/20 text-white focus:border-[#d4a574]/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">What emotions do you feel?</Label>
                    <Textarea
                      value={visualization.feelings}
                      onChange={(e) => setVisualization({ ...visualization, feelings: e.target.value })}
                      data-testid="visualization-feelings"
                      placeholder="I feel... (pride, peace, excitement, gratitude...)"
                      rows={3}
                      className="bg-gray-900/50 border-[#d4a574]/20 text-white focus:border-[#d4a574]/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">What does your future self do daily?</Label>
                    <Textarea
                      value={visualization.actions}
                      onChange={(e) => setVisualization({ ...visualization, actions: e.target.value })}
                      data-testid="visualization-actions"
                      placeholder="In this future, I wake up and..."
                      rows={3}
                      className="bg-gray-900/50 border-[#d4a574]/20 text-white focus:border-[#d4a574]/50"
                    />
                  </div>
                  <Button
                    onClick={() => submitExercise('visualization', visualization)}
                    disabled={!visualization.scene || !visualization.feelings}
                    data-testid="visualization-submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Exercise
                  </Button>
                </div>
              )}

              {activeExercise === 'negative_visualization' && (
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm mb-4">
                    The Stoics practiced negative visualization not to be pessimistic, but to build resilience and appreciate what they have.
                  </p>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">What's the worst that could happen?</Label>
                    <Textarea
                      value={premeditatio.worstCase}
                      onChange={(e) => setPremeditatio({ ...premeditatio, worstCase: e.target.value })}
                      data-testid="premeditatio-worst"
                      placeholder="The worst case scenario is..."
                      rows={3}
                      className="bg-gray-900/50 border-[#d4a574]/20 text-white focus:border-[#d4a574]/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">How would you respond?</Label>
                    <Textarea
                      value={premeditatio.response}
                      onChange={(e) => setPremeditatio({ ...premeditatio, response: e.target.value })}
                      data-testid="premeditatio-response"
                      placeholder="If that happened, I would..."
                      rows={3}
                      className="bg-gray-900/50 border-[#d4a574]/20 text-white focus:border-[#d4a574]/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">What do you realize you should appreciate more?</Label>
                    <Textarea
                      value={premeditatio.acceptance}
                      onChange={(e) => setPremeditatio({ ...premeditatio, acceptance: e.target.value })}
                      data-testid="premeditatio-acceptance"
                      placeholder="This makes me appreciate..."
                      rows={3}
                      className="bg-gray-900/50 border-[#d4a574]/20 text-white focus:border-[#d4a574]/50"
                    />
                  </div>
                  <Button
                    onClick={() => submitExercise('negative_visualization', premeditatio)}
                    disabled={!premeditatio.worstCase || !premeditatio.response}
                    data-testid="premeditatio-submit"
                    className="w-full bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Exercise
                  </Button>
                </div>
              )}
            </div>

            {/* Close button */}
            <div className="p-4 border-t border-gray-800/50">
              <Button 
                variant="ghost" 
                className="w-full text-gray-400 hover:text-white"
                onClick={() => setActiveExercise(null)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    );
  };

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
            <Brain className="w-6 h-6 text-[#d4a574]/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-500 text-sm">Preparing your growth exercises...</p>
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
      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <Award className="w-24 h-24 mx-auto text-[#d4a574] mb-4" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">Mind Strengthened</h2>
              <p className="text-gray-400">Every exercise compounds into transformation</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Stats */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-100 flex items-center gap-3" data-testid="exercises-header">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4a574]/20 to-[#d4a574]/5 flex items-center justify-center">
                <Brain className="w-5 h-5 text-[#d4a574]" />
              </div>
              Growth Exercises
            </h1>
            <p className="text-gray-500 text-lg">
              Practice principles from the masters of personal development
            </p>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-4">
            <Card className="px-5 py-3 border-[#d4a574]/20 bg-gradient-to-br from-[#d4a574]/10 to-[#0d0d0d]">
              <p className="text-xs text-gray-500 mb-1">Today</p>
              <p className="text-2xl font-bold text-[#d4a574]">{todayCount}</p>
            </Card>
            <Card className="px-5 py-3 border-[#d4a574]/20 bg-gradient-to-br from-orange-500/10 to-[#0d0d0d]">
              <p className="text-xs text-gray-500 mb-1">Streak</p>
              <div className="flex items-center gap-1">
                <Flame className="w-5 h-5 text-orange-400" />
                <p className="text-2xl font-bold text-orange-400">{streak}</p>
              </div>
            </Card>
            <Card className="px-5 py-3 border-[#d4a574]/20 bg-gradient-to-br from-purple-500/10 to-[#0d0d0d]">
              <p className="text-xs text-gray-500 mb-1">Total</p>
              <p className="text-2xl font-bold text-purple-400">{totalExercises}</p>
            </Card>
          </div>
        </div>
      </motion.div>

      {/* Daily Insight */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 border-[#d4a574]/20 bg-gradient-to-br from-[#d4a574]/5 to-[#0d0d0d]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4a574]/20 to-[#d4a574]/5 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-[#d4a574]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-200 mb-2">The Science of Practice</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                These exercises aren't just feel-good activities. They physically rewire your brain through neuroplasticity. 
                Each practice strengthens neural pathways that support your goals, making success-oriented thinking automatic.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Exercise Grid */}
      <motion.div variants={itemVariants}>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exerciseTypes.map((exercise) => {
            const IconComponent = exercise.icon;
            const isCompletedToday = completedToday.has(exercise.id);
            
            return (
              <motion.div 
                key={exercise.id}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`p-5 border-[#d4a574]/10 bg-[#0d0d0d] cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                    isCompletedToday ? 'border-green-500/30' : 'hover:border-[#d4a574]/30'
                  }`}
                  onClick={() => setActiveExercise(exercise.id)}
                  data-testid={`exercise-card-${exercise.id}`}
                >
                  {/* Background gradient on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${exercise.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  {/* Completed badge */}
                  {isCompletedToday && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400">Done</span>
                    </div>
                  )}
                  
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${exercise.color} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-200 mb-1">{exercise.name}</h3>
                    <p className="text-gray-500 text-sm mb-3">{exercise.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">{exercise.philosophy}</span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {exercise.duration}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent History */}
      {exercises.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-[#d4a574]/20 bg-[#0d0d0d] overflow-hidden">
            <div className="p-6 border-b border-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4a574]/20 to-[#d4a574]/5 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#d4a574]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-200">Exercise History</h2>
                  <p className="text-sm text-gray-500">Your recent mindset training</p>
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-800/50">
              {exercises.slice(0, 7).map((exercise, index) => {
                const typeInfo = exerciseTypes.find(e => e.id === exercise.exercise_type) || exerciseTypes[0];
                const IconComponent = typeInfo.icon;
                
                return (
                  <div 
                    key={exercise.id} 
                    className="p-4 flex items-center gap-4 hover:bg-gray-900/30 transition-colors"
                    data-testid={`exercise-history-${exercise.id}`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${typeInfo.bgColor} flex items-center justify-center`}>
                      <IconComponent className="w-5 h-5 text-[#d4a574]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-200">{typeInfo.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(exercise.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500/50" />
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Exercise Modal */}
      <AnimatePresence>
        {activeExercise && renderExerciseForm()}
      </AnimatePresence>
    </motion.div>
  );
};

export default Exercises;
