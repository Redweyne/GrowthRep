import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Mountain, Sparkles, ArrowRight, Trophy, History,
  Lightbulb, Shield, Target, Flame, BookOpen, Brain,
  ChevronDown, Loader2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Historical examples of obstacle transformation
const historicalExamples = [
  {
    person: 'Thomas Edison',
    obstacle: 'Failed 10,000 times creating the light bulb',
    transformation: 'Each failure was a lesson. He said: "I have not failed. I\'ve just found 10,000 ways that won\'t work."',
    lesson: 'Reframe failure as data collection'
  },
  {
    person: 'Marcus Aurelius',
    obstacle: 'Plagued by war, betrayal, and a crumbling empire',
    transformation: 'Wrote Meditations while at war, turning adversity into philosophy that guides millions today.',
    lesson: 'Your struggles can become wisdom for others'
  },
  {
    person: 'Nelson Mandela',
    obstacle: '27 years in prison',
    transformation: 'Used imprisonment to educate himself and plan for a peaceful transition, emerging as a symbol of reconciliation.',
    lesson: 'Confinement can be used for preparation'
  },
  {
    person: 'Steve Jobs',
    obstacle: 'Fired from Apple, the company he founded',
    transformation: 'Created Pixar and NeXT, returning to Apple with fresh perspective to make it the world\'s most valuable company.',
    lesson: 'Being forced out can be a new beginning'
  }
];

const ObstacleTransformer = ({ token }) => {
  const [obstacle, setObstacle] = useState('');
  const [transformation, setTransformation] = useState(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [savedTrophies, setSavedTrophies] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedExample, setSelectedExample] = useState(null);

  useEffect(() => {
    loadTrophies();
  }, []);

  const loadTrophies = () => {
    const saved = localStorage.getItem('obstacleTriophies');
    if (saved) {
      setSavedTrophies(JSON.parse(saved));
    }
  };

  const transformObstacle = async () => {
    if (!obstacle.trim()) {
      toast.error('Please describe your obstacle');
      return;
    }

    setIsTransforming(true);
    setTransformation(null);

    try {
      const response = await axios.post(
        `${API}/ai-coach`,
        {
          message: `I'm facing this obstacle: "${obstacle}"

Please help me transform this obstacle using Stoic philosophy and the wisdom from "The Obstacle Is The Way". Provide:
1. A reframed perspective on this obstacle
2. The hidden opportunity within it
3. 3 specific actionable steps I can take
4. A powerful quote that relates to this situation

Be direct, practical, and inspiring.`,
          context: { mentor_personality: 'holiday' }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTransformation({
        obstacle: obstacle,
        response: response.data.response,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      toast.error('Failed to transform obstacle. Please try again.');
    } finally {
      setIsTransforming(false);
    }
  };

  const saveTrophy = () => {
    if (!transformation) return;

    const trophy = {
      id: Date.now().toString(),
      obstacle: transformation.obstacle,
      transformation: transformation.response,
      savedAt: new Date().toISOString()
    };

    const updated = [...savedTrophies, trophy];
    localStorage.setItem('obstacleTriophies', JSON.stringify(updated));
    setSavedTrophies(updated);
    toast.success('Trophy of Resilience saved!');
  };

  const deleteTrophy = (trophyId) => {
    const updated = savedTrophies.filter(t => t.id !== trophyId);
    localStorage.setItem('obstacleTriophies', JSON.stringify(updated));
    setSavedTrophies(updated);
    toast.success('Trophy removed');
  };

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Obstacle Transformer</h1>
        <p className="text-gray-400 max-w-2xl">
          "The impediment to action advances action. What stands in the way becomes the way."
          <span className="text-[#d4a574]"> — Marcus Aurelius</span>
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Transformer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input Card */}
          <Card className="glass border-[#d4a574]/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20">
                <Mountain className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">What obstacle are you facing?</h2>
                <p className="text-sm text-gray-400">Describe the challenge blocking your path</p>
              </div>
            </div>

            <Textarea
              value={obstacle}
              onChange={(e) => setObstacle(e.target.value)}
              placeholder="e.g., I keep procrastinating on important tasks, I'm afraid of failure, I lost my job..."
              className="bg-[#1a1625] border-[#d4a574]/20 min-h-[120px] mb-4"
            />

            <Button
              onClick={transformObstacle}
              disabled={isTransforming || !obstacle.trim()}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-6"
            >
              {isTransforming ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Transforming Obstacle...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Transform This Obstacle
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </Card>

          {/* Transformation Result */}
          {transformation && (
            <Card className="glass border-emerald-500/30 p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                    <Lightbulb className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h2 className="text-xl font-bold text-white">The Transformation</h2>
                </div>
                <Button
                  onClick={saveTrophy}
                  variant="outline"
                  size="sm"
                  className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Save as Trophy
                </Button>
              </div>

              <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/20">
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {transformation.response}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-[#d4a574]/10 rounded-lg">
                <p className="text-sm text-[#d4a574] italic">
                  "The obstacle is not only the way, it's the ONLY way." — Ryan Holiday
                </p>
              </div>
            </Card>
          )}

          {/* Trophies of Resilience */}
          {savedTrophies.length > 0 && (
            <Card className="glass border-[#d4a574]/20 p-6">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between mb-4"
              >
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <h2 className="text-xl font-bold text-white">Trophies of Resilience</h2>
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-xs rounded-full">
                    {savedTrophies.length}
                  </span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
              </button>

              {showHistory && (
                <div className="space-y-4">
                  {savedTrophies.map((trophy) => (
                    <div
                      key={trophy.id}
                      className="p-4 bg-black/30 rounded-lg border border-yellow-500/10"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white font-medium mb-2">
                            <span className="text-gray-500">Obstacle:</span> {trophy.obstacle}
                          </p>
                          <p className="text-gray-400 text-sm line-clamp-3">
                            {trophy.transformation.substring(0, 200)}...
                          </p>
                          <p className="text-xs text-gray-600 mt-2">
                            Transformed on {new Date(trophy.savedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTrophy(trophy.id)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Historical Examples Sidebar */}
        <div className="space-y-6">
          <Card className="glass border-[#d4a574]/20 p-6">
            <div className="flex items-center gap-3 mb-4">
              <History className="w-5 h-5 text-[#d4a574]" />
              <h3 className="text-lg font-bold text-white">Historical Examples</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Learn from those who turned their greatest obstacles into their greatest advantages.
            </p>

            <div className="space-y-3">
              {historicalExamples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedExample(selectedExample === index ? null : index)}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    selectedExample === index
                      ? 'bg-[#d4a574]/10 border border-[#d4a574]/30'
                      : 'bg-black/20 hover:bg-black/30'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-full bg-[#d4a574]/10">
                      <Shield className="w-4 h-4 text-[#d4a574]" />
                    </div>
                    <span className="font-semibold text-white">{example.person}</span>
                  </div>
                  
                  {selectedExample === index && (
                    <div className="mt-3 space-y-2 animate-fade-in">
                      <p className="text-sm text-red-400">
                        <strong>Obstacle:</strong> {example.obstacle}
                      </p>
                      <p className="text-sm text-emerald-400">
                        <strong>Transformation:</strong> {example.transformation}
                      </p>
                      <p className="text-sm text-[#d4a574] italic">
                        💡 {example.lesson}
                      </p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </Card>

          {/* Quick Tips */}
          <Card className="glass border-[#d4a574]/20 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#d4a574]" />
              Stoic Principles
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-black/20 rounded-lg">
                <p className="text-sm text-white font-medium">Perception</p>
                <p className="text-xs text-gray-400">Control how you see and interpret events</p>
              </div>
              <div className="p-3 bg-black/20 rounded-lg">
                <p className="text-sm text-white font-medium">Action</p>
                <p className="text-xs text-gray-400">Focus only on what you can control</p>
              </div>
              <div className="p-3 bg-black/20 rounded-lg">
                <p className="text-sm text-white font-medium">Will</p>
                <p className="text-xs text-gray-400">Accept what you cannot change with grace</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ObstacleTransformer;
