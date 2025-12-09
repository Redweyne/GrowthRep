import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Target, Trash2, Edit, CheckCircle, Calendar, Mountain, Crown, Layers, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const principles = [
  { value: 'think_and_grow_rich', label: 'Think and Grow Rich', icon: Crown, description: 'Wealth, desire, and definiteness of purpose' },
  { value: 'atomic_habits', label: 'Atomic Habits', icon: Layers, description: 'Systems, identity, and 1% improvement' },
  { value: 'obstacle_is_the_way', label: 'Stoic Philosophy', icon: Mountain, description: 'Obstacles as opportunities, resilience' },
];

const Goals = ({ token }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showGuidedSetup, setShowGuidedSetup] = useState(false);
  const [guidedStep, setGuidedStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    principle: 'atomic_habits',
    deadline: '',
    // Enhanced fields for depth
    emotionalWhy: '',
    actionSteps: ['', '', ''],
    identityStatement: '',
    burningDesireLevel: 5,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        await axios.put(`${API}/goals/${editingGoal.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Goal updated');
      } else {
        await axios.post(`${API}/goals`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Goal created');
      }
      fetchGoals();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (goalId) => {
    try {
      await axios.delete(`${API}/goals/${goalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Goal removed');
      fetchGoals();
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  const handleProgressUpdate = async (goalId, progress) => {
    try {
      await axios.put(
        `${API}/goals/${goalId}`,
        { progress: parseInt(progress) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchGoals();
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const handleStatusChange = async (goalId, status) => {
    try {
      await axios.put(
        `${API}/goals/${goalId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (status === 'completed') {
        toast.success('Goal completed! Well done.');
      }
      fetchGoals();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const openEditDialog = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      principle: goal.principle,
      deadline: goal.deadline || '',
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      principle: 'atomic_habits',
      deadline: '',
    });
    setEditingGoal(null);
  };

  const getPrincipleInfo = (value) => principles.find(p => p.value === value) || principles[1];

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Stats
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const completionRate = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-[#d4a574]/30 border-t-[#d4a574] rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-100" data-testid="goals-header">Goals</h1>
          <p className="text-gray-500 mt-1">
            A goal properly set is halfway reached.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button 
              className="bg-[#d4a574] hover:bg-[#c49464] text-black font-medium"
              data-testid="create-goal-button"
            >
              <Plus className="mr-2 w-4 h-4" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0d0d0d] border-[#d4a574]/20 text-white max-w-lg" data-testid="goal-dialog">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-100">
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div>
                <Label className="text-gray-400 text-sm">What do you want to achieve?</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  data-testid="goal-title-input"
                  placeholder="Be specific and measurable"
                  required
                  className="mt-2 bg-black/30 border-gray-800 text-white h-11"
                />
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Why does this matter?</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  data-testid="goal-description-input"
                  placeholder="Connect to your deeper purpose..."
                  required
                  rows={3}
                  className="mt-2 bg-black/30 border-gray-800 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Guiding Framework</Label>
                <Select value={formData.principle} onValueChange={(value) => setFormData({ ...formData, principle: value })}>
                  <SelectTrigger className="mt-2 bg-black/30 border-gray-800 text-white h-11" data-testid="goal-principle-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0d0d0d] border-gray-800 text-white">
                    {principles.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        <div className="flex items-center gap-2">
                          <p.icon className="w-4 h-4 text-[#d4a574]" />
                          {p.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Deadline (optional)</Label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  data-testid="goal-deadline-input"
                  className="mt-2 bg-black/30 border-gray-800 text-white h-11"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 bg-[#d4a574] hover:bg-[#c49464] text-black font-medium" 
                data-testid="goal-submit-button"
              >
                {editingGoal ? 'Save Changes' : 'Create Goal'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      {goals.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 border-[#d4a574]/10 bg-[#0d0d0d]">
            <p className="text-gray-500 text-sm">Active</p>
            <p className="text-2xl font-semibold text-gray-100 mt-1">{activeGoals}</p>
          </Card>
          <Card className="p-4 border-[#d4a574]/10 bg-[#0d0d0d]">
            <p className="text-gray-500 text-sm">Completed</p>
            <p className="text-2xl font-semibold text-gray-100 mt-1">{completedGoals}</p>
          </Card>
          <Card className="p-4 border-[#d4a574]/10 bg-[#0d0d0d]">
            <p className="text-gray-500 text-sm">Success Rate</p>
            <p className="text-2xl font-semibold text-gray-100 mt-1">{completionRate}%</p>
          </Card>
        </div>
      )}

      {/* Goals List */}
      {goals.length === 0 ? (
        <Card className="p-12 border-[#d4a574]/10 bg-[#0d0d0d] text-center" data-testid="no-goals-message">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#d4a574]/10 flex items-center justify-center mx-auto mb-6">
              <Target className="w-8 h-8 text-[#d4a574]/50" />
            </div>
            <h3 className="text-xl font-semibold text-gray-200 mb-2">Set Your First Goal</h3>
            <p className="text-gray-500 mb-6">
              "A goal without a plan is just a wish." Define what you want to achieve and why it matters.
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-[#d4a574] hover:bg-[#c49464] text-black font-medium"
            >
              <Plus className="mr-2 w-4 h-4" />
              Create Your First Goal
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const principle = getPrincipleInfo(goal.principle);
            const PrincipleIcon = principle.icon;
            const isCompleted = goal.status === 'completed';
            const daysRemaining = getDaysRemaining(goal.deadline);

            return (
              <Card 
                key={goal.id} 
                className={`p-6 border transition-all ${
                  isCompleted 
                    ? 'border-green-500/30 bg-green-500/5' 
                    : 'border-[#d4a574]/10 bg-[#0d0d0d] hover:border-[#d4a574]/20'
                }`}
                data-testid={`goal-card-${goal.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-2">
                      <PrincipleIcon className="w-5 h-5 text-[#d4a574]" />
                      <h3 className="text-lg font-medium text-gray-100">{goal.title}</h3>
                      {isCompleted && (
                        <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded">
                          Completed
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-500 text-sm mb-4 ml-8">{goal.description}</p>

                    {/* Progress */}
                    {!isCompleted && (
                      <div className="ml-8 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Progress</span>
                          <span className="text-sm text-gray-300 font-medium">{goal.progress}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={goal.progress}
                          onChange={(e) => handleProgressUpdate(goal.id, e.target.value)}
                          data-testid={`progress-slider-${goal.id}`}
                          className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#d4a574]"
                        />
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 ml-8 text-sm">
                      <span className="text-gray-600">{principle.label}</span>
                      {goal.deadline && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {daysRemaining !== null && daysRemaining >= 0 
                              ? `${daysRemaining} days left` 
                              : daysRemaining < 0 
                                ? 'Overdue' 
                                : new Date(goal.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2">
                    {isCompleted ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">Done</span>
                      </div>
                    ) : (
                      <>
                        {goal.progress >= 100 ? (
                          <Button
                            onClick={() => handleStatusChange(goal.id, 'completed')}
                            data-testid={`complete-goal-${goal.id}`}
                            className="bg-green-600 hover:bg-green-700 text-white font-medium"
                          >
                            <CheckCircle className="mr-2 w-4 h-4" />
                            Mark Complete
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => openEditDialog(goal)}
                            data-testid={`edit-goal-${goal.id}`}
                            className="border-gray-700 text-gray-300 hover:bg-gray-800"
                          >
                            <Edit className="mr-2 w-4 h-4" />
                            Edit
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(goal.id)}
                          data-testid={`delete-goal-${goal.id}`}
                          className="text-gray-500 hover:text-red-400 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Goals;
