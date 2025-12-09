import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, Target, Flame, BookOpen, Brain, Trophy, 
  Star, Sparkles, ChevronDown, ChevronUp, Clock,
  Award, Heart, Mountain, Crown, Zap, Download
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Generate AI chapter titles based on activity
const generateChapterTitle = (period, stats) => {
  if (stats.goals_completed > 3) return "The Breakthrough";
  if (stats.max_streak > 14) return "The Discipline Era";
  if (stats.journal_entries > 10) return "Deep Reflection";
  if (stats.exercises > 5) return "Mental Fortification";
  if (stats.goals_created > 5) return "The Ambitious Phase";
  if (stats.habits_started > 3) return "Building Foundations";
  return "The Journey Continues";
};

const TransformationTimeline = ({ token }) => {
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPeriod, setExpandedPeriod] = useState(null);

  useEffect(() => {
    fetchTimelineData();
  }, []);

  const fetchTimelineData = async () => {
    try {
      // Fetch all user data to build timeline
      const [goalsRes, habitsRes, journalRes, exercisesRes] = await Promise.all([
        axios.get(`${API}/goals`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/habits`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/journal`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/exercises`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      // Group events by month
      const events = [];
      
      // Process goals
      goalsRes.data.forEach(goal => {
        events.push({
          type: 'goal_created',
          title: `Set goal: ${goal.title}`,
          date: new Date(goal.created_at),
          icon: Target,
          color: 'from-amber-500 to-orange-500',
          description: goal.description,
          principle: goal.principle
        });
        if (goal.status === 'completed') {
          events.push({
            type: 'goal_completed',
            title: `Achieved: ${goal.title}`,
            date: new Date(goal.updated_at),
            icon: Trophy,
            color: 'from-yellow-500 to-amber-500',
            description: 'Goal completed!',
            isMilestone: true
          });
        }
      });

      // Process journal entries
      journalRes.data.forEach(entry => {
        events.push({
          type: 'journal',
          title: 'Journal Entry',
          date: new Date(entry.created_at),
          icon: BookOpen,
          color: 'from-purple-500 to-pink-500',
          description: entry.content.substring(0, 100) + '...',
          mood: entry.mood
        });
      });

      // Process exercises
      exercisesRes.data.forEach(exercise => {
        events.push({
          type: 'exercise',
          title: `Completed: ${exercise.exercise_type.replace('_', ' ')}`,
          date: new Date(exercise.created_at),
          icon: Brain,
          color: 'from-emerald-500 to-teal-500',
          description: 'Growth exercise completed'
        });
      });

      // Process habit streaks (add milestone events)
      habitsRes.data.forEach(habit => {
        if (habit.best_streak >= 7) {
          events.push({
            type: 'streak_milestone',
            title: `${habit.best_streak}-day streak: ${habit.name}`,
            date: new Date(habit.last_completed || habit.created_at),
            icon: Flame,
            color: 'from-red-500 to-orange-500',
            description: `Achieved a ${habit.best_streak}-day streak!`,
            isMilestone: true
          });
        }
      });

      // Sort by date
      events.sort((a, b) => b.date - a.date);

      // Group by month
      const grouped = {};
      events.forEach(event => {
        const monthKey = event.date.toISOString().substring(0, 7);
        if (!grouped[monthKey]) {
          grouped[monthKey] = {
            month: monthKey,
            label: event.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            events: [],
            stats: {
              goals_created: 0,
              goals_completed: 0,
              journal_entries: 0,
              exercises: 0,
              habits_started: 0,
              max_streak: 0
            }
          };
        }
        grouped[monthKey].events.push(event);
        
        // Update stats
        if (event.type === 'goal_created') grouped[monthKey].stats.goals_created++;
        if (event.type === 'goal_completed') grouped[monthKey].stats.goals_completed++;
        if (event.type === 'journal') grouped[monthKey].stats.journal_entries++;
        if (event.type === 'exercise') grouped[monthKey].stats.exercises++;
        if (event.type === 'streak_milestone' && event.title.includes('streak')) {
          const streak = parseInt(event.title);
          if (streak > grouped[monthKey].stats.max_streak) {
            grouped[monthKey].stats.max_streak = streak;
          }
        }
      });

      // Generate chapter titles and convert to array
      const timeline = Object.values(grouped).map(period => ({
        ...period,
        chapterTitle: generateChapterTitle(period.month, period.stats)
      }));

      setTimelineData(timeline);
    } catch (error) {
      toast.error('Failed to load timeline');
    } finally {
      setLoading(false);
    }
  };

  const exportTimeline = () => {
    // Generate PDF-like export (simplified as text)
    let content = "MY TRANSFORMATION STORY\n";
    content += "========================\n\n";
    
    timelineData.forEach(period => {
      content += `\n## Chapter: ${period.chapterTitle}\n`;
      content += `${period.label}\n`;
      content += `${"-".repeat(40)}\n`;
      
      period.events.forEach(event => {
        content += `\n${event.date.toLocaleDateString()}: ${event.title}\n`;
        if (event.description) content += `   ${event.description}\n`;
      });
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-transformation-story.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Timeline exported!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Clock className="w-16 h-16 mx-auto text-[#d4a574] animate-pulse" />
          <p className="text-gray-400">Loading your journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Transformation Timeline</h1>
            <p className="text-gray-400">Your complete journey of growth and achievement</p>
          </div>
          <Button
            onClick={exportTimeline}
            variant="outline"
            className="border-[#d4a574]/30 hover:bg-[#d4a574]/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Story
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#d4a574] via-[#d4a574]/50 to-transparent" />

        {timelineData.length === 0 ? (
          <Card className="glass border-[#d4a574]/20 p-12 text-center">
            <Sparkles className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Your Story Begins Now</h3>
            <p className="text-gray-500">Start creating goals, building habits, and journaling to see your transformation unfold.</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {timelineData.map((period, periodIndex) => (
              <div key={period.month} className="relative">
                {/* Month marker */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d4a574] to-[#e6b786] flex items-center justify-center z-10 relative shadow-lg">
                    <Calendar className="w-7 h-7 text-black" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#d4a574] to-[#e6b786]">
                      {period.chapterTitle}
                    </h2>
                    <p className="text-gray-400">{period.label}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedPeriod(expandedPeriod === period.month ? null : period.month)}
                    className="text-gray-400"
                  >
                    {expandedPeriod === period.month ? <ChevronUp /> : <ChevronDown />}
                    <span className="ml-1">{period.events.length} events</span>
                  </Button>
                </div>

                {/* Stats summary */}
                <div className="ml-20 mb-4 flex flex-wrap gap-3">
                  {period.stats.goals_completed > 0 && (
                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-sm flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> {period.stats.goals_completed} goals achieved
                    </span>
                  )}
                  {period.stats.journal_entries > 0 && (
                    <span className="px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full text-sm flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {period.stats.journal_entries} reflections
                    </span>
                  )}
                  {period.stats.max_streak > 0 && (
                    <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-sm flex items-center gap-1">
                      <Flame className="w-3 h-3" /> {period.stats.max_streak} day streak
                    </span>
                  )}
                </div>

                {/* Events (expandable) */}
                {(expandedPeriod === period.month || periodIndex === 0) && (
                  <div className="ml-20 space-y-3 animate-fade-in">
                    {period.events.slice(0, expandedPeriod === period.month ? undefined : 5).map((event, eventIndex) => {
                      const Icon = event.icon;
                      return (
                        <Card
                          key={`${event.type}-${eventIndex}`}
                          className={`p-4 border-l-4 transition-all hover:scale-[1.02] ${
                            event.isMilestone 
                              ? 'border-l-yellow-500 bg-yellow-500/5' 
                              : 'border-l-[#d4a574]/30 bg-[#1a1625]/50'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${event.color}/20`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-white">{event.title}</h4>
                                <span className="text-xs text-gray-500">
                                  {event.date.toLocaleDateString()}
                                </span>
                              </div>
                              {event.description && (
                                <p className="text-sm text-gray-400 mt-1">{event.description}</p>
                              )}
                              {event.isMilestone && (
                                <div className="mt-2 flex items-center gap-1 text-yellow-500">
                                  <Star className="w-4 h-4" />
                                  <span className="text-xs font-medium">Milestone!</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransformationTimeline;
