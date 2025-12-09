import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, Trophy, Flame, Target, Heart, Share2,
  Users, Eye, EyeOff, TrendingUp, Star, Crown,
  CheckCircle, Zap, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

// Simulated anonymous wins from the community
const generateInspirations = () => {
  const inspirations = [
    { type: 'streak', text: 'Someone just hit a 30-day habit streak!', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { type: 'goal', text: 'A user achieved their goal: "Launch my side project"', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { type: 'streak', text: 'Someone maintained a 100-day meditation streak!', icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { type: 'goal', text: 'A user completed: "Read 50 books this year"', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { type: 'streak', text: 'Someone built a 14-day journaling streak!', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { type: 'goal', text: 'A user achieved: "Save $10,000 emergency fund"', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { type: 'milestone', text: 'Someone just reached Level 10 - Legend status!', icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { type: 'goal', text: 'A user completed: "Run a marathon"', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { type: 'streak', text: 'Someone achieved a 60-day workout streak!', icon: Flame, color: 'text-red-500', bg: 'bg-red-500/10' },
    { type: 'goal', text: 'A user hit their goal: "Learn a new language"', icon: Star, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { type: 'milestone', text: 'Someone completed 500 identity votes!', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    { type: 'streak', text: 'Someone built a 45-day no-social-media streak!', icon: Flame, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  ];
  
  // Shuffle and return random subset
  return inspirations.sort(() => Math.random() - 0.5).slice(0, 6);
};

const InspirationFeed = ({ token }) => {
  const [inspirations, setInspirations] = useState([]);
  const [contributeEnabled, setContributeEnabled] = useState(
    localStorage.getItem('contributeAnonymousWins') === 'true'
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInspirations();
  }, []);

  const loadInspirations = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setInspirations(generateInspirations());
      setLoading(false);
    }, 500);
  };

  const toggleContribute = () => {
    const newValue = !contributeEnabled;
    setContributeEnabled(newValue);
    localStorage.setItem('contributeAnonymousWins', String(newValue));
    toast.success(newValue 
      ? 'Your wins will inspire others anonymously!' 
      : 'Your wins are now private'
    );
  };

  const refreshFeed = () => {
    loadInspirations();
    toast.success('Feed refreshed!');
  };

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center gap-3">
              <Users className="text-[#d4a574]" />
              Inspiration Feed
            </h1>
            <p className="text-gray-400 max-w-2xl">
              See real wins from fellow travelers on the path of growth. 
              No profiles, no followers — just pure inspiration.
            </p>
          </div>
          <Button
            onClick={refreshFeed}
            variant="outline"
            className="border-[#d4a574]/30 hover:bg-[#d4a574]/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Contribute Toggle */}
      <Card className="glass border-[#d4a574]/30 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#d4a574]/20 to-[#e6b786]/20">
              <Share2 className="w-6 h-6 text-[#d4a574]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Contribute Your Wins</h2>
              <p className="text-sm text-gray-400">
                Anonymously share your achievements to inspire others
              </p>
            </div>
          </div>
          <Button
            onClick={toggleContribute}
            variant={contributeEnabled ? 'default' : 'outline'}
            className={contributeEnabled 
              ? 'bg-gradient-to-r from-[#d4a574] to-[#e6b786] text-black' 
              : 'border-gray-600'
            }
          >
            {contributeEnabled ? (
              <><Eye className="w-4 h-4 mr-2" /> Contributing</>
            ) : (
              <><EyeOff className="w-4 h-4 mr-2" /> Private</>
            )}
          </Button>
        </div>
      </Card>

      {/* Inspiration Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 mx-auto text-[#d4a574] animate-pulse" />
            <p className="text-gray-400 mt-4">Loading inspiration...</p>
          </div>
        ) : (
          inspirations.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={index}
                className="glass border-[#d4a574]/10 p-5 hover:border-[#d4a574]/30 transition-all hover:scale-[1.01] cursor-default"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${item.bg}`}>
                    <Icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.floor(Math.random() * 12) + 1} hours ago
                    </p>
                  </div>
                  <Heart 
                    className="w-5 h-5 text-gray-600 hover:text-red-500 cursor-pointer transition-colors" 
                    onClick={() => toast.success('Sent encouragement!')}
                  />
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Statistics */}
      <Card className="glass border-[#d4a574]/20 p-6 mt-8">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#d4a574]" />
          Community Stats (This Week)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-black/20 rounded-lg">
            <p className="text-2xl font-bold text-[#d4a574]">{Math.floor(Math.random() * 500) + 200}</p>
            <p className="text-xs text-gray-400">Goals Completed</p>
          </div>
          <div className="text-center p-4 bg-black/20 rounded-lg">
            <p className="text-2xl font-bold text-orange-500">{Math.floor(Math.random() * 1000) + 500}</p>
            <p className="text-xs text-gray-400">Streak Days</p>
          </div>
          <div className="text-center p-4 bg-black/20 rounded-lg">
            <p className="text-2xl font-bold text-purple-500">{Math.floor(Math.random() * 800) + 300}</p>
            <p className="text-xs text-gray-400">Journal Entries</p>
          </div>
          <div className="text-center p-4 bg-black/20 rounded-lg">
            <p className="text-2xl font-bold text-emerald-500">{Math.floor(Math.random() * 2000) + 1000}</p>
            <p className="text-xs text-gray-400">Identity Votes</p>
          </div>
        </div>
      </Card>

      {/* Wisdom */}
      <div className="mt-8 p-6 bg-gradient-to-r from-[#d4a574]/5 to-transparent rounded-xl border border-[#d4a574]/10">
        <p className="text-center text-gray-300 italic">
          "You are not alone in this journey. Every person here is fighting their own battles, 
          climbing their own mountains. Let their victories remind you that yours is possible."
        </p>
      </div>
    </div>
  );
};

export default InspirationFeed;
