import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, Target, Flame, Check, Plus, Trash2, 
  Sparkles, Award, TrendingUp, Star, Crown,
  Brain, Heart, Zap, Shield, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

// Identity archetypes with their characteristics
const identityArchetypes = [
  { id: 'disciplined', name: 'Disciplined Person', icon: Shield, color: 'from-blue-500 to-indigo-600', traits: ['Consistent', 'Focused', 'Reliable'] },
  { id: 'achiever', name: 'Achiever', icon: Trophy, color: 'from-amber-500 to-orange-600', traits: ['Goal-oriented', 'Ambitious', 'Driven'] },
  { id: 'learner', name: 'Lifelong Learner', icon: Brain, color: 'from-purple-500 to-pink-600', traits: ['Curious', 'Open-minded', 'Growth-focused'] },
  { id: 'healthy', name: 'Healthy Person', icon: Heart, color: 'from-red-500 to-rose-600', traits: ['Energetic', 'Mindful', 'Balanced'] },
  { id: 'leader', name: 'Leader', icon: Crown, color: 'from-yellow-500 to-amber-600', traits: ['Inspiring', 'Decisive', 'Visionary'] },
  { id: 'creative', name: 'Creative', icon: Sparkles, color: 'from-pink-500 to-purple-600', traits: ['Innovative', 'Imaginative', 'Artistic'] },
  { id: 'stoic', name: 'Stoic', icon: Mountain, color: 'from-emerald-500 to-teal-600', traits: ['Resilient', 'Calm', 'Wise'] },
  { id: 'entrepreneur', name: 'Entrepreneur', icon: Zap, color: 'from-cyan-500 to-blue-600', traits: ['Risk-taker', 'Resourceful', 'Persistent'] },
];

import { Mountain, Trophy } from 'lucide-react';

const IdentityEvolution = ({ token }) => {
  const [identities, setIdentities] = useState([]);
  const [showAddIdentity, setShowAddIdentity] = useState(false);
  const [newIdentity, setNewIdentity] = useState({ name: '', description: '', archetype: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIdentities();
  }, []);

  const loadIdentities = () => {
    // Load from localStorage (in production, this would be from backend)
    const saved = localStorage.getItem('userIdentities');
    if (saved) {
      setIdentities(JSON.parse(saved));
    }
    setLoading(false);
  };

  const saveIdentities = (newIdentities) => {
    localStorage.setItem('userIdentities', JSON.stringify(newIdentities));
    setIdentities(newIdentities);
  };

  const addIdentity = () => {
    if (!newIdentity.name.trim()) {
      toast.error('Please enter an identity name');
      return;
    }

    const archetype = identityArchetypes.find(a => a.id === newIdentity.archetype);
    const identity = {
      id: Date.now().toString(),
      name: newIdentity.name,
      description: newIdentity.description,
      archetype: newIdentity.archetype,
      icon: archetype?.id || 'custom',
      color: archetype?.color || 'from-[#d4a574] to-[#e6b786]',
      votes: 0,
      habits: [],
      createdAt: new Date().toISOString()
    };

    saveIdentities([...identities, identity]);
    setNewIdentity({ name: '', description: '', archetype: null });
    setShowAddIdentity(false);
    toast.success('New identity target created!');
  };

  const castVote = (identityId) => {
    const updated = identities.map(id => {
      if (id.id === identityId) {
        const newVotes = id.votes + 1;
        // Celebrate milestones
        if (newVotes === 10) toast.success('10 votes! You\'re building momentum!');
        if (newVotes === 50) toast.success('50 votes! Your identity is taking shape!');
        if (newVotes === 100) toast.success('100 votes! You ARE this person now!');
        return { ...id, votes: newVotes };
      }
      return id;
    });
    saveIdentities(updated);
  };

  const deleteIdentity = (identityId) => {
    saveIdentities(identities.filter(id => id.id !== identityId));
    toast.success('Identity removed');
  };

  const getIdentityLevel = (votes) => {
    if (votes >= 100) return { level: 'Embodied', color: 'text-yellow-500', progress: 100 };
    if (votes >= 50) return { level: 'Becoming', color: 'text-purple-500', progress: 75 };
    if (votes >= 20) return { level: 'Developing', color: 'text-blue-500', progress: 50 };
    if (votes >= 5) return { level: 'Emerging', color: 'text-green-500', progress: 25 };
    return { level: 'Starting', color: 'text-gray-500', progress: 10 };
  };

  const getIconComponent = (iconId) => {
    const archetype = identityArchetypes.find(a => a.id === iconId);
    return archetype?.icon || User;
  };

  const totalVotes = identities.reduce((sum, id) => sum + id.votes, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <User className="w-16 h-16 mx-auto text-[#d4a574] animate-pulse" />
          <p className="text-gray-400">Loading your identity evolution...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Identity Evolution</h1>
        <p className="text-gray-400 max-w-2xl">
          "Every action you take is a vote for the type of person you wish to become." 
          <span className="text-[#d4a574]"> — James Clear</span>
        </p>
      </div>

      {/* Total Votes Summary */}
      <Card className="glass border-[#d4a574]/30 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-[#d4a574] to-[#e6b786]">
              <Award className="w-8 h-8 text-black" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">{totalVotes.toLocaleString()}</h2>
              <p className="text-gray-400">Total identity votes cast</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Active Identities</p>
            <p className="text-2xl font-bold text-[#d4a574]">{identities.length}</p>
          </div>
        </div>
      </Card>

      {/* Identity Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {identities.map((identity) => {
          const Icon = getIconComponent(identity.icon);
          const levelInfo = getIdentityLevel(identity.votes);
          
          return (
            <Card 
              key={identity.id}
              className="glass border-[#d4a574]/20 overflow-hidden hover-lift"
            >
              {/* Progress bar at top */}
              <div className="h-1 bg-gray-800">
                <div 
                  className={`h-full bg-gradient-to-r ${identity.color} transition-all duration-500`}
                  style={{ width: `${levelInfo.progress}%` }}
                />
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${identity.color}/20`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{identity.name}</h3>
                      <span className={`text-sm font-medium ${levelInfo.color}`}>
                        {levelInfo.level}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteIdentity(identity.id)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {identity.description && (
                  <p className="text-gray-400 text-sm mb-4">{identity.description}</p>
                )}

                {/* Vote Counter */}
                <div className="bg-black/30 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Votes Cast</span>
                    <span className="text-2xl font-bold text-[#d4a574]">{identity.votes}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${identity.color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(identity.votes, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {100 - identity.votes > 0 
                      ? `${100 - identity.votes} more votes to fully embody this identity`
                      : 'You have fully embodied this identity! 🎉'}
                  </p>
                </div>

                {/* Cast Vote Button */}
                <Button
                  onClick={() => castVote(identity.id)}
                  className={`w-full bg-gradient-to-r ${identity.color} hover:opacity-90 text-white font-semibold`}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Cast Vote (I acted like a {identity.name} today)
                </Button>
              </div>
            </Card>
          );
        })}

        {/* Add New Identity Card */}
        {!showAddIdentity ? (
          <Card 
            className="glass border-[#d4a574]/20 border-dashed p-6 flex items-center justify-center cursor-pointer hover:border-[#d4a574]/50 transition-colors min-h-[300px]"
            onClick={() => setShowAddIdentity(true)}
          >
            <div className="text-center">
              <div className="p-4 rounded-full bg-[#d4a574]/10 inline-block mb-4">
                <Plus className="w-8 h-8 text-[#d4a574]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">Add New Identity</h3>
              <p className="text-gray-500 text-sm">Who do you want to become?</p>
            </div>
          </Card>
        ) : (
          <Card className="glass border-[#d4a574]/30 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Create New Identity</h3>
            
            {/* Archetype Selection */}
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-2 block">Choose an archetype (optional)</label>
              <div className="grid grid-cols-4 gap-2">
                {identityArchetypes.map((archetype) => {
                  const ArchIcon = archetype.icon;
                  return (
                    <button
                      key={archetype.id}
                      onClick={() => setNewIdentity({ ...newIdentity, archetype: archetype.id, name: archetype.name })}
                      className={`p-3 rounded-lg border transition-all ${
                        newIdentity.archetype === archetype.id
                          ? 'border-[#d4a574] bg-[#d4a574]/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <ArchIcon className="w-5 h-5 mx-auto text-gray-400" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Identity Name</label>
                <Input
                  value={newIdentity.name}
                  onChange={(e) => setNewIdentity({ ...newIdentity, name: e.target.value })}
                  placeholder="e.g., Disciplined Person, Early Riser"
                  className="bg-[#1a1625] border-[#d4a574]/20"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Description (optional)</label>
                <Textarea
                  value={newIdentity.description}
                  onChange={(e) => setNewIdentity({ ...newIdentity, description: e.target.value })}
                  placeholder="What does this identity mean to you?"
                  className="bg-[#1a1625] border-[#d4a574]/20"
                  rows={2}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-600"
                  onClick={() => {
                    setShowAddIdentity(false);
                    setNewIdentity({ name: '', description: '', archetype: null });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-[#d4a574] to-[#e6b786] text-black font-semibold"
                  onClick={addIdentity}
                >
                  Create Identity
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* How It Works */}
      <Card className="glass border-[#d4a574]/20 p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#d4a574]" />
          How Identity Voting Works
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="p-3 rounded-full bg-[#d4a574]/10 inline-block mb-3">
              <Target className="w-6 h-6 text-[#d4a574]" />
            </div>
            <h4 className="font-semibold text-white mb-1">1. Define Your Identity</h4>
            <p className="text-sm text-gray-400">Choose who you want to become, not just what you want to achieve.</p>
          </div>
          <div className="text-center">
            <div className="p-3 rounded-full bg-[#d4a574]/10 inline-block mb-3">
              <Check className="w-6 h-6 text-[#d4a574]" />
            </div>
            <h4 className="font-semibold text-white mb-1">2. Cast Daily Votes</h4>
            <p className="text-sm text-gray-400">Each time you act in alignment with your identity, cast a vote.</p>
          </div>
          <div className="text-center">
            <div className="p-3 rounded-full bg-[#d4a574]/10 inline-block mb-3">
              <Crown className="w-6 h-6 text-[#d4a574]" />
            </div>
            <h4 className="font-semibold text-white mb-1">3. Become That Person</h4>
            <p className="text-sm text-gray-400">With enough consistent votes, you embody your new identity.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default IdentityEvolution;
