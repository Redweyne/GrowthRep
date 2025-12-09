import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Link, Plus, Trash2, GripVertical, ArrowRight, Sparkles,
  Coffee, Sun, Book, Dumbbell, Zap, Brain, Heart, Moon,
  Clock, Calendar, TrendingUp, CheckCircle2, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const HABIT_ICONS = {
  coffee: Coffee,
  sun: Sun,
  book: Book,
  dumbbell: Dumbbell,
  zap: Zap,
  brain: Brain,
  heart: Heart,
  moon: Moon,
  clock: Clock
};

const HABIT_COLORS = [
  'from-amber-500 to-orange-500',
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-green-500 to-emerald-500',
  'from-red-500 to-rose-500',
  'from-indigo-500 to-violet-500'
];

const presetStacks = [
  {
    name: 'Morning Power Stack',
    habits: [
      { name: 'Wake up', icon: 'sun', duration: 1 },
      { name: 'Drink water', icon: 'coffee', duration: 2 },
      { name: 'Stretch/Exercise', icon: 'dumbbell', duration: 15 },
      { name: 'Meditate', icon: 'brain', duration: 10 },
      { name: 'Journal', icon: 'book', duration: 10 }
    ]
  },
  {
    name: 'Evening Wind-Down',
    habits: [
      { name: 'Set tomorrow\'s priorities', icon: 'clock', duration: 5 },
      { name: 'Gratitude reflection', icon: 'heart', duration: 5 },
      { name: 'Read', icon: 'book', duration: 20 },
      { name: 'Screen off', icon: 'moon', duration: 1 },
      { name: 'Sleep routine', icon: 'moon', duration: 10 }
    ]
  },
  {
    name: 'Work Focus Stack',
    habits: [
      { name: 'Clear desk', icon: 'zap', duration: 2 },
      { name: 'Review goals', icon: 'brain', duration: 3 },
      { name: 'Deep work session', icon: 'clock', duration: 50 },
      { name: 'Short break', icon: 'coffee', duration: 10 }
    ]
  }
];

const HabitStackingVisualizer = ({ token }) => {
  const [stacks, setStacks] = useState([]);
  const [selectedStack, setSelectedStack] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', icon: 'sun', duration: 5 });
  const [projectionYears, setProjectionYears] = useState(1);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const stackRef = useRef(null);

  useEffect(() => {
    // Load saved stacks
    const saved = JSON.parse(localStorage.getItem('habitStacks') || '[]');
    setStacks(saved.length > 0 ? saved : presetStacks.map((p, i) => ({
      ...p,
      id: Date.now() + i,
      createdAt: new Date().toISOString()
    })));
  }, []);

  const saveStacks = (newStacks) => {
    setStacks(newStacks);
    localStorage.setItem('habitStacks', JSON.stringify(newStacks));
  };

  const createNewStack = () => {
    const newStack = {
      id: Date.now(),
      name: 'New Habit Stack',
      habits: [],
      createdAt: new Date().toISOString()
    };
    const updated = [...stacks, newStack];
    saveStacks(updated);
    setSelectedStack(newStack);
    setIsEditing(true);
  };

  const updateStackName = (name) => {
    if (!selectedStack) return;
    const updated = stacks.map(s => 
      s.id === selectedStack.id ? { ...s, name } : s
    );
    saveStacks(updated);
    setSelectedStack({ ...selectedStack, name });
  };

  const addHabitToStack = () => {
    if (!newHabit.name.trim() || !selectedStack) return;
    const habit = {
      ...newHabit,
      id: Date.now(),
      color: HABIT_COLORS[selectedStack.habits.length % HABIT_COLORS.length]
    };
    const updatedStack = {
      ...selectedStack,
      habits: [...selectedStack.habits, habit]
    };
    const updated = stacks.map(s => 
      s.id === selectedStack.id ? updatedStack : s
    );
    saveStacks(updated);
    setSelectedStack(updatedStack);
    setNewHabit({ name: '', icon: 'sun', duration: 5 });
    toast.success('Habit added to stack');
  };

  const removeHabitFromStack = (habitIndex) => {
    if (!selectedStack) return;
    const updatedHabits = selectedStack.habits.filter((_, i) => i !== habitIndex);
    const updatedStack = { ...selectedStack, habits: updatedHabits };
    const updated = stacks.map(s => 
      s.id === selectedStack.id ? updatedStack : s
    );
    saveStacks(updated);
    setSelectedStack(updatedStack);
  };

  const deleteStack = (stackId) => {
    const updated = stacks.filter(s => s.id !== stackId);
    saveStacks(updated);
    if (selectedStack?.id === stackId) {
      setSelectedStack(null);
    }
    toast.success('Stack deleted');
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newHabits = [...selectedStack.habits];
    const draggedHabit = newHabits[draggedIndex];
    newHabits.splice(draggedIndex, 1);
    newHabits.splice(index, 0, draggedHabit);
    
    setDraggedIndex(index);
    const updatedStack = { ...selectedStack, habits: newHabits };
    setSelectedStack(updatedStack);
  };

  const handleDragEnd = () => {
    if (selectedStack) {
      const updated = stacks.map(s => 
        s.id === selectedStack.id ? selectedStack : s
      );
      saveStacks(updated);
    }
    setDraggedIndex(null);
  };

  const calculateCompoundEffect = (stack, years) => {
    if (!stack || stack.habits.length === 0) return null;
    
    const dailyMinutes = stack.habits.reduce((sum, h) => sum + (h.duration || 5), 0);
    const daysInYear = 365;
    
    return {
      daily: dailyMinutes,
      weekly: dailyMinutes * 7,
      monthly: dailyMinutes * 30,
      yearly: dailyMinutes * daysInYear,
      projected: dailyMinutes * daysInYear * years,
      hours: Math.round((dailyMinutes * daysInYear * years) / 60),
      books: Math.round((dailyMinutes * daysInYear * years) / 300), // ~5 hours per book
      workouts: Math.round((dailyMinutes * daysInYear * years) / 45)
    };
  };

  const renderStackChain = (stack) => {
    if (!stack || stack.habits.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <Link className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p>Add habits to build your chain</p>
        </div>
      );
    }

    return (
      <div className="relative py-4" ref={stackRef}>
        {stack.habits.map((habit, index) => {
          const Icon = HABIT_ICONS[habit.icon] || Zap;
          const isFirst = index === 0;
          const isLast = index === stack.habits.length - 1;
          
          return (
            <div key={habit.id || index} className="relative">
              {/* Connection line */}
              {!isLast && (
                <div className="absolute left-8 top-full w-0.5 h-8 bg-gradient-to-b from-[#d4a574] to-[#d4a574]/30 z-0" />
              )}
              
              {/* Habit node */}
              <div
                draggable={isEditing}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  relative flex items-center gap-4 p-4 mb-8 rounded-xl
                  bg-gradient-to-r ${habit.color || HABIT_COLORS[index % HABIT_COLORS.length]}
                  transition-all duration-300 z-10
                  ${isEditing ? 'cursor-grab hover:scale-[1.02]' : ''}
                  ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
                `}
              >
                {isEditing && (
                  <GripVertical className="w-5 h-5 text-white/60 cursor-grab" />
                )}
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{habit.name}</h4>
                  <p className="text-sm text-white/80">{habit.duration} minutes</p>
                </div>
                {isEditing && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeHabitFromStack(index)}
                    className="text-white/80 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                
                {/* Cue indicator */}
                {!isFirst && (
                  <div className="absolute -top-6 left-8 text-xs text-[#d4a574] flex items-center">
                    <ArrowRight className="w-3 h-3 mr-1" />
                    After completing above
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCompoundEffect = () => {
    const effect = calculateCompoundEffect(selectedStack, projectionYears);
    if (!effect) return null;

    return (
      <Card className="bg-gradient-to-br from-[#1a1625] to-[#0f0d14] border-[#d4a574]/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#d4a574]" />
          Compound Effect Projection
        </h3>
        
        <div className="flex items-center gap-4 mb-6">
          <span className="text-gray-400">Project over:</span>
          {[1, 3, 5, 10].map(year => (
            <Button
              key={year}
              variant={projectionYears === year ? 'default' : 'outline'}
              size="sm"
              onClick={() => setProjectionYears(year)}
              className={projectionYears === year ? 'bg-[#d4a574] text-black' : 'border-[#d4a574]/30'}
            >
              {year} year{year > 1 ? 's' : ''}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0f0d14] rounded-xl p-4 text-center">
            <Clock className="w-6 h-6 mx-auto text-[#d4a574] mb-2" />
            <div className="text-2xl font-bold text-white">{effect.daily}</div>
            <div className="text-xs text-gray-500">Minutes/Day</div>
          </div>
          <div className="bg-[#0f0d14] rounded-xl p-4 text-center">
            <Calendar className="w-6 h-6 mx-auto text-[#d4a574] mb-2" />
            <div className="text-2xl font-bold text-white">{effect.hours.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Hours in {projectionYears}y</div>
          </div>
          <div className="bg-[#0f0d14] rounded-xl p-4 text-center">
            <Book className="w-6 h-6 mx-auto text-[#d4a574] mb-2" />
            <div className="text-2xl font-bold text-white">{effect.books}</div>
            <div className="text-xs text-gray-500">Books worth</div>
          </div>
          <div className="bg-[#0f0d14] rounded-xl p-4 text-center">
            <Dumbbell className="w-6 h-6 mx-auto text-[#d4a574] mb-2" />
            <div className="text-2xl font-bold text-white">{effect.workouts.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Workout sessions</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-[#d4a574]/10 rounded-xl border border-[#d4a574]/20">
          <p className="text-sm text-gray-300">
            <Sparkles className="w-4 h-4 inline mr-2 text-[#d4a574]" />
            <strong>If you do this daily for {projectionYears} year{projectionYears > 1 ? 's' : ''}</strong>, 
            you'll invest <span className="text-[#d4a574] font-bold">{effect.hours.toLocaleString()} hours</span> in self-improvement. 
            That's equivalent to reading approximately <span className="text-[#d4a574] font-bold">{effect.books} books</span> or 
            completing <span className="text-[#d4a574] font-bold">{effect.workouts.toLocaleString()} workout sessions</span>.
          </p>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Link className="w-8 h-8 text-[#d4a574]" />
            Habit Stacking Visualizer
          </h1>
          <p className="text-gray-400">
            Build powerful habit chains using the "After I [CURRENT HABIT], I will [NEW HABIT]" formula
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Stacks List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Your Stacks</h2>
              <Button onClick={createNewStack} size="sm" className="bg-[#d4a574] text-black hover:bg-[#c9a07a]">
                <Plus className="w-4 h-4 mr-1" /> New Stack
              </Button>
            </div>

            <div className="space-y-2">
              {stacks.map(stack => (
                <Card
                  key={stack.id}
                  onClick={() => {
                    setSelectedStack(stack);
                    setIsEditing(false);
                  }}
                  className={`
                    p-4 cursor-pointer transition-all duration-200
                    ${selectedStack?.id === stack.id 
                      ? 'bg-[#1a1625] border-[#d4a574]/50 ring-1 ring-[#d4a574]/30' 
                      : 'bg-[#1a1625]/50 border-[#d4a574]/10 hover:border-[#d4a574]/30'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{stack.name}</h3>
                      <p className="text-sm text-gray-500">{stack.habits.length} habits</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteStack(stack.id);
                      }}
                      className="text-gray-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* James Clear Quote */}
            <Card className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-500/20 p-4">
              <p className="text-sm italic text-blue-300">
                "One of the best ways to build a new habit is to identify a current habit you already do each day and then stack your new behavior on top."
              </p>
              <p className="text-xs text-gray-500 mt-2">— James Clear, Atomic Habits</p>
            </Card>
          </div>

          {/* Stack Editor */}
          <div className="lg:col-span-2 space-y-6">
            {selectedStack ? (
              <>
                <Card className="bg-[#1a1625]/60 border-[#d4a574]/20 p-6">
                  <div className="flex items-center justify-between mb-6">
                    {isEditing ? (
                      <Input
                        value={selectedStack.name}
                        onChange={(e) => updateStackName(e.target.value)}
                        className="text-xl font-semibold bg-transparent border-[#d4a574]/30 max-w-xs"
                      />
                    ) : (
                      <h2 className="text-xl font-semibold text-white">{selectedStack.name}</h2>
                    )}
                    <Button
                      variant={isEditing ? 'default' : 'outline'}
                      onClick={() => setIsEditing(!isEditing)}
                      className={isEditing ? 'bg-[#d4a574] text-black' : 'border-[#d4a574]/30'}
                    >
                      {isEditing ? <CheckCircle2 className="w-4 h-4 mr-2" /> : null}
                      {isEditing ? 'Done' : 'Edit Stack'}
                    </Button>
                  </div>

                  {/* Habit Chain */}
                  {renderStackChain(selectedStack)}

                  {/* Add New Habit */}
                  {isEditing && (
                    <div className="mt-6 p-4 bg-[#0f0d14] rounded-xl border border-dashed border-[#d4a574]/30">
                      <h4 className="text-sm font-medium text-gray-400 mb-3">Add Habit to Chain</h4>
                      <div className="flex flex-wrap gap-3">
                        <Input
                          placeholder="Habit name"
                          value={newHabit.name}
                          onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                          className="flex-1 min-w-[200px] bg-[#1a1625] border-[#d4a574]/30"
                        />
                        <select
                          value={newHabit.icon}
                          onChange={(e) => setNewHabit({...newHabit, icon: e.target.value})}
                          className="px-3 py-2 bg-[#1a1625] border border-[#d4a574]/30 rounded-md text-white"
                        >
                          {Object.keys(HABIT_ICONS).map(icon => (
                            <option key={icon} value={icon}>{icon}</option>
                          ))}
                        </select>
                        <Input
                          type="number"
                          placeholder="Minutes"
                          value={newHabit.duration}
                          onChange={(e) => setNewHabit({...newHabit, duration: parseInt(e.target.value) || 5})}
                          className="w-24 bg-[#1a1625] border-[#d4a574]/30"
                        />
                        <Button onClick={addHabitToStack} className="bg-[#d4a574] text-black">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Compound Effect */}
                {selectedStack.habits.length > 0 && renderCompoundEffect()}

                {/* Habit Stacking Tips */}
                <Card className="bg-[#1a1625]/40 border-[#d4a574]/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-[#d4a574]" />
                    Habit Stacking Formula
                  </h3>
                  <div className="space-y-3">
                    <p className="text-gray-400">
                      <strong className="text-[#d4a574]">The Formula:</strong> After I [CURRENT HABIT], I will [NEW HABIT].
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-[#0f0d14] rounded-lg">
                        <h4 className="text-sm font-medium text-green-400 mb-2">✓ Good Examples</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                          <li>• After I pour my coffee, I will meditate for 1 minute</li>
                          <li>• After I sit down for dinner, I will say one thing I'm grateful for</li>
                          <li>• After I close my laptop, I will write tomorrow's to-do list</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-[#0f0d14] rounded-lg">
                        <h4 className="text-sm font-medium text-red-400 mb-2">✗ Poor Examples</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                          <li>• I will meditate more (too vague)</li>
                          <li>• I will exercise 2 hours daily (too ambitious to start)</li>
                          <li>• I will read when I have time (no specific cue)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="bg-[#1a1625]/40 border-[#d4a574]/10 p-12 text-center">
                <Link className="w-16 h-16 mx-auto text-[#d4a574]/40 mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">Select a Stack</h3>
                <p className="text-gray-500">Choose a habit stack from the list or create a new one</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitStackingVisualizer;
