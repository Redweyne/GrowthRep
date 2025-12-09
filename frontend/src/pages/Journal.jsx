import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, BookOpen, Calendar, ChevronDown, ChevronUp, Sparkles,
  Heart, Sun, Moon, Cloud, Zap, Coffee, Battery, Brain,
  Flame, Star, TrendingUp, Eye, Quote, PenTool, Clock
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import PhilosophyIcon from '@/components/PhilosophyIcon';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Mood options with deeper meaning and colors
const moods = [
  { value: 'energized', label: 'Energized', icon: Zap, color: '#4ade80', bgColor: 'from-green-500/20 to-green-500/5', description: 'High energy, ready to conquer' },
  { value: 'focused', label: 'Focused', icon: Brain, color: '#60a5fa', bgColor: 'from-blue-500/20 to-blue-500/5', description: 'Clear mind, laser sharp' },
  { value: 'calm', label: 'Calm', icon: Cloud, color: '#a78bfa', bgColor: 'from-purple-500/20 to-purple-500/5', description: 'Peaceful, grounded' },
  { value: 'reflective', label: 'Reflective', icon: Moon, color: '#d4a574', bgColor: 'from-[#d4a574]/20 to-[#d4a574]/5', description: 'Thoughtful, introspective' },
  { value: 'challenged', label: 'Challenged', icon: Flame, color: '#f59e0b', bgColor: 'from-amber-500/20 to-amber-500/5', description: 'Facing obstacles, growing' },
  { value: 'drained', label: 'Drained', icon: Battery, color: '#6b7280', bgColor: 'from-gray-500/20 to-gray-500/5', description: 'Low energy, need rest' },
];

// Powerful reflection prompts categorized
const promptCategories = {
  growth: [
    "What's one thing you learned about yourself today?",
    "What habit served you well today?",
    "What would your future self thank you for doing today?",
    "How did you push beyond your comfort zone?",
  ],
  obstacles: [
    "What obstacle did you face, and how did you handle it?",
    "What are you avoiding that you know you should do?",
    "What fear held you back today? How can you face it tomorrow?",
    "What would the Stoics say about today's challenges?",
  ],
  gratitude: [
    "Who helped you today? How can you pay it forward?",
    "What small moment brought you unexpected joy?",
    "What do you have today that you once only dreamed of?",
    "What strength did you rely on today?",
  ],
  planning: [
    "What would make tomorrow a success?",
    "What's one thing you could let go of that's holding you back?",
    "If you could only accomplish one thing tomorrow, what would it be?",
    "What habit will you protect tomorrow, no matter what?",
  ],
};

const getRandomPrompt = () => {
  const categories = Object.values(promptCategories);
  const allPrompts = categories.flat();
  return allPrompts[Math.floor(Math.random() * allPrompts.length)];
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

const Journal = ({ token }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [selectedPromptCategory, setSelectedPromptCategory] = useState(null);
  const [formData, setFormData] = useState({
    content: '',
    mood: 'reflective',
    gratitude: ['', '', ''],
  });

  useEffect(() => {
    fetchEntries();
    setCurrentPrompt(getRandomPrompt());
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await axios.get(`${API}/journal`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(response.data);
    } catch (error) {
      toast.error('Failed to load journal');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      toast.error('Please write something before saving');
      return;
    }
    try {
      const gratitudeList = formData.gratitude.filter(g => g.trim() !== '');
      await axios.post(
        `${API}/journal`,
        { ...formData, gratitude: gratitudeList },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Entry saved. Your reflection matters.');
      fetchEntries();
      setDialogOpen(false);
      setFormData({ content: '', mood: 'reflective', gratitude: ['', '', ''] });
      setCurrentPrompt(getRandomPrompt());
    } catch (error) {
      toast.error('Failed to save entry');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getMoodInfo = (moodValue) => moods.find(m => m.value === moodValue) || moods[3];

  // Calculate stats
  const totalEntries = entries.length;
  const thisMonthEntries = entries.filter(e => {
    const d = new Date(e.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Calculate streak
  const calculateStreak = () => {
    let streak = 0;
    const today = new Date();
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (entryDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };
  const streak = calculateStreak();

  const totalGratitude = entries.reduce((acc, e) => acc + (e.gratitude?.length || 0), 0);

  // Group entries by month
  const groupedEntries = entries.reduce((acc, entry) => {
    const date = new Date(entry.date);
    const monthKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(entry);
    return acc;
  }, {});

  // Has entry today
  const hasEntryToday = entries.some(e => 
    new Date(e.date).toDateString() === new Date().toDateString()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="relative">
            <div className="w-14 h-14 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto" />
            <PenTool className="w-6 h-6 text-purple-400/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-500 text-sm">Loading your reflections...</p>
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
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-100 flex items-center gap-3" data-testid="journal-header">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>
            Journal
            <PhilosophyIcon feature="journal" />
          </h1>
          <p className="text-gray-500 text-lg">
            The unexamined life is not worth living. — Socrates
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-purple-500/20"
              data-testid="new-journal-button"
            >
              <Plus className="mr-2 w-4 h-4" />
              {hasEntryToday ? 'Add Another Entry' : 'Write Today\'s Entry'}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0d0d0d] border-[#d4a574]/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="journal-dialog">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-100 flex items-center gap-3">
                <Moon className="w-6 h-6 text-purple-400" />
                Today's Reflection
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              {/* Mood Selection */}
              <div>
                <Label className="text-gray-400 text-sm font-medium">How are you feeling?</Label>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {moods.map((mood) => {
                    const MoodIcon = mood.icon;
                    return (
                      <motion.button
                        key={mood.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, mood: mood.value })}
                        data-testid={`mood-${mood.value}`}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          formData.mood === mood.value
                            ? 'border-[#d4a574] bg-gradient-to-br ' + mood.bgColor
                            : 'border-gray-800 hover:border-gray-700 bg-black/20'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${mood.color}20` }}>
                            <MoodIcon className="w-4 h-4" style={{ color: mood.color }} />
                          </div>
                          <div>
                            <span className="text-sm text-gray-200 font-medium">{mood.label}</span>
                            <p className="text-xs text-gray-500">{mood.description}</p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
              
              {/* Reflection Prompt */}
              <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border border-purple-500/20 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-purple-400 uppercase tracking-wider font-medium mb-2">Reflection prompt</p>
                    <p className="text-gray-200 text-lg leading-relaxed">{currentPrompt}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPrompt(getRandomPrompt())}
                      className="mt-3 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 text-xs"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Different prompt
                    </Button>
                  </div>
                </div>
              </div>

              {/* Main Entry */}
              <div>
                <Label className="text-gray-400 text-sm font-medium">Your thoughts</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  data-testid="journal-content-input"
                  placeholder="Write freely. This is your private space for reflection..."
                  required
                  rows={8}
                  className="mt-2 bg-black/30 border-gray-800 text-white resize-none text-base leading-relaxed"
                />
                <p className="text-xs text-gray-600 mt-2">
                  {formData.content.length} characters
                </p>
              </div>
              
              {/* Gratitude */}
              <div>
                <Label className="text-gray-400 text-sm font-medium flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-400" />
                  Three things I'm grateful for
                </Label>
                <p className="text-xs text-gray-600 mt-1 mb-3">
                  Gratitude rewires your brain for positivity. Be specific.
                </p>
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-pink-400/50 text-sm font-medium w-4">{i + 1}.</span>
                      <Input
                        value={formData.gratitude[i]}
                        onChange={(e) => {
                          const newGratitude = [...formData.gratitude];
                          newGratitude[i] = e.target.value;
                          setFormData({ ...formData, gratitude: newGratitude });
                        }}
                        data-testid={`gratitude-input-${i}`}
                        placeholder={i === 0 ? "e.g., A conversation that made me think" : ""}
                        className="flex-1 bg-black/30 border-gray-800 text-white h-11"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold text-base" 
                data-testid="journal-submit-button"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Save Entry
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Today's Prompt (if no entry today) */}
      {!hasEntryToday && entries.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card 
            className="p-6 border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-[#0d0d0d] cursor-pointer hover:border-purple-500/40 transition-all"
            onClick={() => setDialogOpen(true)}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/10 flex items-center justify-center">
                <PenTool className="w-7 h-7 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-purple-400 font-medium mb-1">Today's Reflection Awaits</p>
                <p className="text-gray-300">"{currentPrompt}"</p>
              </div>
              <Button className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400">
                Write Now
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Stats */}
      {entries.length > 0 && (
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Entries', value: totalEntries, icon: BookOpen, color: 'text-purple-400' },
            { label: 'This Month', value: thisMonthEntries, icon: Calendar, color: 'text-blue-400' },
            { label: 'Current Streak', value: `${streak} days`, icon: Flame, color: 'text-orange-400' },
            { label: 'Gratitude Items', value: totalGratitude, icon: Heart, color: 'text-pink-400' },
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

      {/* Entries */}
      {entries.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="p-12 border-[#d4a574]/10 bg-[#0d0d0d] text-center" data-testid="no-journal-entries">
            <div className="max-w-md mx-auto">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/10 flex items-center justify-center mx-auto mb-6"
              >
                <BookOpen className="w-10 h-10 text-purple-400/60" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-200 mb-3">Start Your Journal</h3>
              <p className="text-gray-500 mb-2 text-lg">
                "The unexamined life is not worth living."
              </p>
              <p className="text-gray-600 text-sm mb-8">
                Daily reflection is one of the most powerful tools for growth. Take 5 minutes to capture your thoughts and gratitude.
              </p>
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold"
              >
                <Plus className="mr-2 w-4 h-4" />
                Write Your First Entry
              </Button>
            </div>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="space-y-8">
          {Object.entries(groupedEntries).map(([month, monthEntries]) => (
            <motion.div key={month} variants={itemVariants}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {month}
              </h2>
              <div className="space-y-3">
                {monthEntries.map((entry) => {
                  const mood = getMoodInfo(entry.mood);
                  const MoodIcon = mood.icon;
                  const isExpanded = expandedEntry === entry.id;

                  return (
                    <motion.div
                      key={entry.id}
                      layout
                      whileHover={{ scale: 1.005 }}
                    >
                      <Card 
                        className="border-[#d4a574]/10 bg-[#0d0d0d] overflow-hidden cursor-pointer hover:border-[#d4a574]/20 transition-all"
                        data-testid={`journal-entry-${entry.id}`}
                      >
                        <div 
                          className="p-5"
                          onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div 
                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${mood.color}15` }}
                              >
                                <MoodIcon className="w-5 h-5" style={{ color: mood.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                  <p className="text-gray-200 font-semibold">{formatDate(entry.date)}</p>
                                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${mood.color}15`, color: mood.color }}>
                                    {mood.label}
                                  </span>
                                </div>
                                {!isExpanded && (
                                  <p className="text-gray-400 text-sm line-clamp-2">
                                    {entry.content}
                                  </p>
                                )}
                              </div>
                            </div>
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            </motion.div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-5 space-y-4 border-t border-gray-800/50 pt-4">
                                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-base">
                                  {entry.content}
                                </p>
                                
                                {entry.gratitude && entry.gratitude.length > 0 && (
                                  <div className="bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20 rounded-xl p-4">
                                    <p className="text-sm text-pink-400 font-medium mb-3 flex items-center gap-2">
                                      <Heart className="w-4 h-4" />
                                      Grateful for:
                                    </p>
                                    <ul className="space-y-2">
                                      {entry.gratitude.map((item, i) => (
                                        <li key={i} className="text-sm text-gray-300 flex items-start gap-3">
                                          <span className="text-pink-400/60">{i + 1}.</span>
                                          {item}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Insight */}
      {streak >= 3 && (
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-[#0d0d0d]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center shrink-0">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Insight: The Power of Reflection
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {streak >= 14 
                    ? "Two weeks of daily reflection. You're building deep self-awareness. Studies show consistent journaling improves emotional intelligence and decision-making."
                    : streak >= 7
                      ? "A week of reflection. You're developing a powerful habit of self-examination. The Stoics practiced this daily — it's called 'evening review'."
                      : "You're building a reflection habit. Marcus Aurelius wrote his Meditations as a daily practice. You're following in the footsteps of philosophers."}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Journal;
