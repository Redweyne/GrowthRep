import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Target, Trophy, Calendar, CheckCircle2, Trash2, 
  TrendingUp, Sparkles, ArrowRight, Star, Crown, Eye,
  ChevronRight, Flame, Mountain, Brain, Clock, Circle,
  Check, Zap, Edit3
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import PhilosophyIcon from '@/components/PhilosophyIcon';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Goal Categories with Philosophy
const goalCategories = [
  { value: 'career', label: 'Career & Work', icon: '💼', color: 'from-blue-500 to-indigo-500' },
  { value: 'health', label: 'Health & Energy', icon: '💪', color: 'from-green-500 to-emerald-500' },
  { value: 'finance', label: 'Financial', icon: '💰', color: 'from-amber-500 to-yellow-500' },
  { value: 'relationships', label: 'Relationships', icon: '❤️', color: 'from-pink-500 to-rose-500' },
  { value: 'personal', label: 'Personal Growth', icon: '🌱', color: 'from-purple-500 to-violet-500' },
  { value: 'skills', label: 'Skills & Learning', icon: '📚', color: 'from-cyan-500 to-blue-500' },
];

// Motivational quotes for empty state
const emptyStateQuotes = [
  { text: "Set your mind on a definite goal and observe how quickly the world stands aside to let you pass.", author: "Napoleon Hill" },
  { text: "If you don't know where you're going, you'll end up someplace else.", author: "Yogi Berra" },
  { text: "A goal without a plan is just a wish.", author: "Antoine de Saint-Exupéry" },
];

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

const Goals = ({ token }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [celebrationGoal, setCelebrationGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal',
    target_date: '',
    milestones: ['', '', ''],
    why: '',
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await axios.get(`${API}/goals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals(response.data);
    } catch (error) {
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'personal',
      target_date: '',
      milestones: ['', '', ''],
      why: '',
    });
    setEditingGoal(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please enter a goal title');
      return;
    }

    const milestones = formData.milestones
      .filter(m => m.trim())
      .map(text => ({ text, completed: false }));

    const payload = {
      ...formData,
      milestones,
    };

    try {
      if (editingGoal) {
        await axios.put(`${API}/goals/${editingGoal.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Goal updated successfully');
      } else {
        await axios.post(`${API}/goals`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Goal created! Your journey begins.');
      }
      fetchGoals();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(`Failed to ${editingGoal ? 'update' : 'create'} goal`);
    }
  };

  const handleMilestoneToggle = async (goalId, milestoneIndex) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newMilestones = [...goal.milestones];
    newMilestones[milestoneIndex].completed = !newMilestones[milestoneIndex].completed;

    const allCompleted = newMilestones.every(m => m.completed);

    try {
      await axios.put(`${API}/goals/${goalId}`, {
        ...goal,
        milestones: newMilestones,
        status: allCompleted ? 'completed' : goal.status,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (allCompleted && goal.status !== 'completed') {
        setCelebrationGoal(goal);
      }

      fetchGoals();
    } catch (error) {
      toast.error('Failed to update milestone');
    }
  };

  const handleStatusChange = async (goalId, newStatus) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      await axios.put(`${API}/goals/${goalId}`, {
        ...goal,
        status: newStatus,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (newStatus === 'completed') {
        setCelebrationGoal(goal);
      }

      toast.success(`Goal marked as ${newStatus}`);
      fetchGoals();
    } catch (error) {
      toast.error('Failed to update goal status');
    }
  };

  const handleDelete = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await axios.delete(`${API}/goals/${goalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Goal deleted');
      fetchGoals();
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  const openEditDialog = (goal) => {
    setFormData({
      title: goal.title,
      description: goal.description || '',
      category: goal.category || 'personal',
      target_date: goal.target_date?.split('T')[0] || '',
      milestones: goal.milestones?.length 
        ? [...goal.milestones.map(m => m.text), '', ''].slice(0, 3)
        : ['', '', ''],
      why: goal.why || '',
    });
    setEditingGoal(goal);
    setDialogOpen(true);
  };

  const getCategoryInfo = (category) => 
    goalCategories.find(c => c.value === category) || goalCategories[4];

  const calculateProgress = (goal) => {
    if (!goal.milestones?.length) return goal.status === 'completed' ? 100 : 0;
    const completed = goal.milestones.filter(m => m.completed).length;
    return Math.round((completed / goal.milestones.length) * 100);
  };

  const getDaysRemaining = (targetDate) => {
    if (!targetDate) return null;
    const target = new Date(targetDate);
    const today = new Date();
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Stats
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const totalProgress = goals.length > 0 
    ? Math.round(goals.reduce((acc, g) => acc + calculateProgress(g), 0) / goals.length)
    : 0;

  const randomQuote = emptyStateQuotes[Math.floor(Math.random() * emptyStateQuotes.length)];

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
            <Target className="w-6 h-6 text-[#d4a574]/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-500 text-sm">Loading your goals...</p>
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
        {celebrationGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setCelebrationGoal(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-[#1a1625] to-[#0d0d0d] border border-[#d4a574]/30 rounded-3xl p-10 max-w-md text-center"
              onClick={e => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="text-8xl mb-6"
              >
                🎯
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-3">Goal Achieved!</h2>
              <p className="text-xl text-[#d4a574] font-medium mb-4">
                {celebrationGoal.title}
              </p>
              <p className="text-gray-400 mb-6">
                You set your mind on a definite goal, and you achieved it. 
                This is proof of what you're capable of.
              </p>
              <div className="bg-[#d4a574]/10 border border-[#d4a574]/20 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-300 italic">
                  "Whatever the mind can conceive and believe, it can achieve."
                </p>
                <p className="text-xs text-gray-500 mt-1">— Napoleon Hill</p>
              </div>
              <Button
                onClick={() => setCelebrationGoal(null)}
                className="bg-[#d4a574] hover:bg-[#c49464] text-black font-semibold"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Celebrate & Continue
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-100 flex items-center gap-3" data-testid="goals-header">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4a574]/20 to-[#d4a574]/5 flex items-center justify-center">
              <Target className="w-5 h-5 text-[#d4a574]" />
            </div>
            Goals
            <PhilosophyIcon feature="goals" />
          </h1>
          <p className="text-gray-500 text-lg">
            Your definite chief aims. Clarity creates action.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-[#d4a574] to-[#c49464] hover:from-[#c49464] hover:to-[#b38454] text-black font-semibold shadow-lg shadow-[#d4a574]/20"
              data-testid="create-goal-button"
            >
              <Plus className="mr-2 w-4 h-4" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0d0d0d] border-[#d4a574]/20 text-white max-w-lg max-h-[90vh] overflow-y-auto" data-testid="goal-dialog">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-100 flex items-center gap-3">
                <Target className="w-6 h-6 text-[#d4a574]" />
                {editingGoal ? 'Edit Goal' : 'Define Your Goal'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              {/* Goal Title */}
              <div>
                <Label className="text-gray-400 text-sm font-medium">What do you want to achieve?</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  data-testid="goal-title-input"
                  placeholder="e.g., Launch my side business"
                  required
                  className="mt-2 bg-black/30 border-gray-800 text-white h-12 text-base"
                />
              </div>

              {/* Category Selection */}
              <div>
                <Label className="text-gray-400 text-sm font-medium">Life Area</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {goalCategories.map((cat) => (
                    <motion.button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.value })}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        formData.category === cat.value
                          ? 'border-[#d4a574] bg-[#d4a574]/10'
                          : 'border-gray-800 hover:border-gray-700 bg-black/20'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-2xl block mb-1">{cat.icon}</span>
                      <span className="text-xs text-gray-400">{cat.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Why */}
              <div>
                <Label className="text-gray-400 text-sm font-medium flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#d4a574]" />
                  Why does this matter to you?
                </Label>
                <p className="text-xs text-gray-600 mt-1 mb-2">
                  Your "why" fuels your persistence when motivation fades.
                </p>
                <Textarea
                  value={formData.why}
                  onChange={(e) => setFormData({ ...formData, why: e.target.value })}
                  data-testid="goal-why-input"
                  placeholder="This goal matters to me because..."
                  rows={2}
                  className="bg-black/30 border-gray-800 text-white"
                />
              </div>

              {/* Target Date */}
              <div>
                <Label className="text-gray-400 text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Target completion date
                </Label>
                <Input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  data-testid="goal-date-input"
                  className="mt-2 bg-black/30 border-gray-800 text-white h-11"
                />
              </div>

              {/* Milestones */}
              <div>
                <Label className="text-gray-400 text-sm font-medium flex items-center gap-2">
                  <Mountain className="w-4 h-4" />
                  Key milestones (optional)
                </Label>
                <p className="text-xs text-gray-600 mt-1 mb-3">
                  Break your goal into checkpoints to track progress.
                </p>
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Circle className="w-4 h-4 text-gray-600 shrink-0" />
                      <Input
                        value={formData.milestones[i]}
                        onChange={(e) => {
                          const newMilestones = [...formData.milestones];
                          newMilestones[i] = e.target.value;
                          setFormData({ ...formData, milestones: newMilestones });
                        }}
                        data-testid={`milestone-input-${i}`}
                        placeholder={i === 0 ? "e.g., Complete market research" : ""}
                        className="flex-1 bg-black/30 border-gray-800 text-white h-10"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-[#d4a574] to-[#c49464] hover:from-[#c49464] hover:to-[#b38454] text-black font-semibold text-base"
                data-testid="goal-submit-button"
              >
                <Target className="w-4 h-4 mr-2" />
                {editingGoal ? 'Update Goal' : 'Set This Goal'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats */}
      {goals.length > 0 && (
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
          {[
            { label: 'Active Goals', value: activeGoals, icon: Target, color: 'text-[#d4a574]' },
            { label: 'Completed', value: completedGoals, icon: Trophy, color: 'text-green-400' },
            { label: 'Overall Progress', value: `${totalProgress}%`, icon: TrendingUp, color: 'text-blue-400' },
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

      {/* Goals List */}
      {goals.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="p-12 border-[#d4a574]/10 bg-[#0d0d0d] text-center" data-testid="no-goals-message">
            <div className="max-w-md mx-auto">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#d4a574]/20 to-[#d4a574]/5 flex items-center justify-center mx-auto mb-6"
              >
                <Target className="w-10 h-10 text-[#d4a574]/60" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-200 mb-4">No goals yet</h3>
              <blockquote className="text-gray-400 text-lg italic mb-2">
                "{randomQuote.text}"
              </blockquote>
              <p className="text-gray-600 text-sm mb-8">— {randomQuote.author}</p>
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-gradient-to-r from-[#d4a574] to-[#c49464] hover:from-[#c49464] hover:to-[#b38454] text-black font-semibold"
              >
                <Plus className="mr-2 w-4 h-4" />
                Define Your First Goal
              </Button>
            </div>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="space-y-4">
          {goals.map((goal) => {
            const category = getCategoryInfo(goal.category);
            const progress = calculateProgress(goal);
            const daysRemaining = getDaysRemaining(goal.target_date);
            const isCompleted = goal.status === 'completed';

            return (
              <motion.div
                key={goal.id}
                variants={itemVariants}
                layout
                whileHover={{ scale: 1.005 }}
              >
                <Card
                  className={`p-6 border transition-all duration-300 ${
                    isCompleted 
                      ? 'border-green-500/30 bg-gradient-to-br from-green-500/5 to-[#0d0d0d]' 
                      : 'border-[#d4a574]/10 bg-[#0d0d0d] hover:border-[#d4a574]/30'
                  }`}
                  data-testid={`goal-card-${goal.id}`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl shrink-0`}>
                          {category.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className={`text-xl font-bold ${
                              isCompleted ? 'text-green-400' : 'text-gray-100'
                            }`}>
                              {goal.title}
                            </h3>
                            {isCompleted && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                                <Trophy className="w-3 h-3" />
                                Achieved
                              </span>
                            )}
                          </div>
                          {goal.why && (
                            <p className="text-gray-500 text-sm mt-1 line-clamp-1">
                              {goal.why}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(goal)}
                          className="text-gray-500 hover:text-[#d4a574] hover:bg-[#d4a574]/10"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(goal.id)}
                          className="text-gray-500 hover:text-red-400 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Progress</span>
                        <span className={`font-semibold ${
                          isCompleted ? 'text-green-400' : 'text-[#d4a574]'
                        }`}>{progress}%</span>
                      </div>
                      <div className="relative h-2.5 bg-gray-800/50 rounded-full overflow-hidden">
                        <motion.div 
                          className={`absolute inset-y-0 left-0 rounded-full ${
                            isCompleted 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
                              : 'bg-gradient-to-r from-[#d4a574] to-[#e6b786]'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    {/* Milestones */}
                    {goal.milestones?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Milestones</p>
                        <div className="space-y-2">
                          {goal.milestones.map((milestone, idx) => (
                            <motion.div
                              key={idx}
                              className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                                milestone.completed 
                                  ? 'bg-green-500/10 border border-green-500/20' 
                                  : 'bg-gray-800/30 border border-gray-800 hover:border-[#d4a574]/30'
                              }`}
                              onClick={() => !isCompleted && handleMilestoneToggle(goal.id, idx)}
                              whileHover={{ x: 4 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                                milestone.completed 
                                  ? 'bg-green-500' 
                                  : 'border-2 border-gray-600'
                              }`}>
                                {milestone.completed && <Check className="w-3 h-3 text-black" />}
                              </div>
                              <span className={`text-sm ${
                                milestone.completed ? 'text-gray-400 line-through' : 'text-gray-300'
                              }`}>
                                {milestone.text}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between flex-wrap gap-4 pt-2 border-t border-gray-800/50">
                      <div className="flex items-center gap-4 text-sm">
                        {daysRemaining !== null && (
                          <span className={`flex items-center gap-1.5 ${
                            daysRemaining < 0 ? 'text-red-400' : 
                            daysRemaining <= 7 ? 'text-amber-400' : 'text-gray-500'
                          }`}>
                            <Clock className="w-4 h-4" />
                            {daysRemaining < 0 
                              ? `${Math.abs(daysRemaining)} days overdue`
                              : daysRemaining === 0 
                                ? 'Due today'
                                : `${daysRemaining} days left`}
                          </span>
                        )}
                        <span className="text-gray-600 flex items-center gap-1.5">
                          {category.icon} {category.label}
                        </span>
                      </div>
                      {!isCompleted && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(goal.id, 'completed')}
                          className="bg-green-500/20 hover:bg-green-500/30 text-green-400"
                        >
                          <Trophy className="w-4 h-4 mr-2" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Insight */}
      {completedGoals >= 1 && (
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-[#d4a574]/20 bg-gradient-to-br from-[#d4a574]/5 to-[#0d0d0d]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4a574]/20 to-[#d4a574]/5 flex items-center justify-center shrink-0">
                <Crown className="w-6 h-6 text-[#d4a574]" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#d4a574]" />
                  You're Proving It's Possible
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  You've completed {completedGoals} goal{completedGoals > 1 ? 's' : ''}. 
                  Each one is proof that your mind can conceive, believe, and achieve. 
                  Napoleon Hill would be proud.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Goals;
