import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Cloud, Shield, Eye, Brain, Heart, Sparkles, 
  ChevronRight, ChevronLeft, Save, History, Trash2,
  Sun, Moon, Wind, Zap, Mountain, Flame, AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Guided prompts for the practice
const guidedPrompts = [
  {
    id: 'loss',
    title: 'Contemplating Loss',
    icon: Cloud,
    color: 'from-slate-500 to-gray-600',
    prompt: 'Imagine losing something you value deeply - a relationship, possession, or opportunity. What would that teach you about appreciation?',
    stoicQuote: '"We suffer more often in imagination than in reality." - Seneca',
    followUp: 'How does this contemplation change how you view what you have today?'
  },
  {
    id: 'failure',
    title: 'Embracing Failure',
    icon: AlertTriangle,
    color: 'from-amber-500 to-orange-600',
    prompt: 'Visualize your current goal failing completely. What would you do? What would remain?',
    stoicQuote: '"It is not that we have a short time to live, but that we waste a lot of it." - Seneca',
    followUp: 'What strengths would you discover in yourself through this failure?'
  },
  {
    id: 'mortality',
    title: 'Memento Mori',
    icon: Moon,
    color: 'from-purple-600 to-indigo-700',
    prompt: 'Reflect on the impermanence of life. If this were your last day, what would truly matter?',
    stoicQuote: '"Let us prepare our minds as if we\'d come to the very end of life." - Seneca',
    followUp: 'What changes would you make to live more fully right now?'
  },
  {
    id: 'rejection',
    title: 'Facing Rejection',
    icon: Shield,
    color: 'from-red-500 to-rose-600',
    prompt: 'Imagine being rejected by everyone whose opinion matters to you. What would remain of your sense of self?',
    stoicQuote: '"We are more often frightened than hurt; and we suffer more from imagination than from reality." - Seneca',
    followUp: 'How does this reveal the source of your true worth?'
  },
  {
    id: 'change',
    title: 'Radical Change',
    icon: Wind,
    color: 'from-cyan-500 to-blue-600',
    prompt: 'Visualize everything in your life changing overnight - job, home, relationships. What would you carry forward?',
    stoicQuote: '"Loss is nothing else but change, and change is Nature\'s delight." - Marcus Aurelius',
    followUp: 'What core values remain unchanged regardless of circumstances?'
  }
];

// Historical examples
const historicalExamples = [
  {
    figure: 'Marcus Aurelius',
    title: 'Emperor of Rome',
    practice: 'Every morning, Marcus reminded himself of the difficult people he would encounter and the challenges ahead, preparing his mind to respond with virtue.',
    lesson: 'Pre-visualization removes the shock of adversity'
  },
  {
    figure: 'Seneca',
    title: 'Roman Philosopher',
    practice: 'Seneca regularly lived as if he had lost everything - sleeping on hard floors, eating simple food - to prove to himself he could handle any reversal.',
    lesson: 'Practicing discomfort builds resilience'
  },
  {
    figure: 'Epictetus',
    title: 'Former Slave & Teacher',
    practice: 'Born a slave, Epictetus taught that imagining the worst frees us from the fear of it, allowing us to act with clarity and courage.',
    lesson: 'Freedom comes from accepting what we cannot control'
  }
];

const PremeditatioPractice = ({ token }) => {
  const [step, setStep] = useState(0); // 0: intro, 1: selection, 2: practice, 3: reflection, 4: insights
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [responses, setResponses] = useState({
    visualization: '',
    feelings: '',
    insights: '',
    actionPlan: ''
  });
  const [savedPractices, setSavedPractices] = useState([]);
  const [breathCount, setBreathCount] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Load saved practices from localStorage
    const saved = JSON.parse(localStorage.getItem('premeditatioPractices') || '[]');
    setSavedPractices(saved);
  }, []);

  // Breathing exercise timer
  useEffect(() => {
    if (isBreathing && breathCount < 3) {
      const interval = setInterval(() => {
        setBreathPhase(prev => {
          if (prev === 'inhale') return 'hold';
          if (prev === 'hold') return 'exhale';
          setBreathCount(c => c + 1);
          return 'inhale';
        });
      }, prev => prev === 'hold' ? 2000 : 4000);
      return () => clearInterval(interval);
    } else if (breathCount >= 3) {
      setIsBreathing(false);
    }
  }, [isBreathing, breathCount, breathPhase]);

  const startBreathing = () => {
    setIsBreathing(true);
    setBreathCount(0);
    setBreathPhase('inhale');
  };

  const savePractice = () => {
    const practice = {
      id: Date.now(),
      date: new Date().toISOString(),
      prompt: selectedPrompt,
      responses,
    };
    const updated = [practice, ...savedPractices].slice(0, 20); // Keep last 20
    setSavedPractices(updated);
    localStorage.setItem('premeditatioPractices', JSON.stringify(updated));
    toast.success('Practice saved successfully');
  };

  const deletePractice = (id) => {
    const updated = savedPractices.filter(p => p.id !== id);
    setSavedPractices(updated);
    localStorage.setItem('premeditatioPractices', JSON.stringify(updated));
  };

  const renderIntro = () => (
    <div className="min-h-[600px] flex flex-col items-center justify-center text-center space-y-8">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-indigo-500/30 blur-3xl animate-pulse"></div>
        <div className="relative p-6 rounded-full bg-[#1a1625]/60 border border-purple-500/30">
          <Eye className="w-16 h-16 text-purple-400" />
        </div>
      </div>
      
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Premeditatio Malorum
        </h1>
        <p className="text-xl text-gray-400">
          The Stoic Art of Negative Visualization
        </p>
        <p className="text-gray-500 leading-relaxed">
          This ancient practice prepares your mind for adversity by imagining worst-case scenarios.
          Rather than breeding fear, it builds resilience, gratitude, and the courage to act.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 max-w-3xl mt-8">
        {[
          { icon: Shield, title: 'Build Resilience', desc: 'Prepare for any challenge' },
          { icon: Heart, title: 'Deepen Gratitude', desc: 'Appreciate what you have' },
          { icon: Zap, title: 'Act with Courage', desc: 'Face fears head-on' }
        ].map((item, i) => (
          <div key={i} className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <item.icon className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>

      <Button 
        onClick={() => setStep(1)}
        className="mt-8 px-8 py-4 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
      >
        Begin Practice <ChevronRight className="w-5 h-5 ml-2" />
      </Button>

      <button 
        onClick={() => setShowHistory(true)}
        className="text-sm text-gray-500 hover:text-purple-400 transition-colors"
      >
        <History className="w-4 h-4 inline mr-2" />
        View Past Practices ({savedPractices.length})
      </button>
    </div>
  );

  const renderSelection = () => (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Choose Your Contemplation</h2>
        <p className="text-gray-400">Select a scenario to explore mindfully</p>
      </div>

      <div className="grid gap-4">
        {guidedPrompts.map((prompt) => {
          const Icon = prompt.icon;
          const isSelected = selectedPrompt?.id === prompt.id;
          return (
            <button
              key={prompt.id}
              onClick={() => setSelectedPrompt(prompt)}
              className={`
                relative p-6 rounded-2xl text-left transition-all duration-300 overflow-hidden
                ${isSelected 
                  ? 'ring-2 ring-purple-500 bg-[#1a1625]/80 scale-[1.02]' 
                  : 'bg-[#1a1625]/40 hover:bg-[#1a1625]/60 hover:scale-[1.01]'
                }
              `}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${prompt.color} opacity-10`}></div>
              <div className="relative flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${prompt.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{prompt.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2">{prompt.prompt}</p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={() => setStep(0)}>
          <ChevronLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button 
          onClick={() => setStep(2)} 
          disabled={!selectedPrompt}
          className="bg-gradient-to-r from-purple-600 to-indigo-600"
        >
          Begin Practice <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderPractice = () => {
    const Icon = selectedPrompt.icon;
    return (
      <div className="space-y-8">
        {/* Breathing Exercise */}
        {breathCount < 3 && (
          <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border-purple-500/30 p-8">
            <div className="text-center space-y-6">
              <h3 className="text-xl font-semibold text-white">Center Your Mind</h3>
              <p className="text-gray-400">Take three deep breaths before beginning</p>
              
              {!isBreathing ? (
                <Button onClick={startBreathing} className="bg-purple-600 hover:bg-purple-500">
                  Start Breathing
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className={`
                    w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-[4000ms]
                    ${breathPhase === 'inhale' ? 'scale-125 bg-purple-500/40' : 
                      breathPhase === 'hold' ? 'scale-125 bg-purple-600/50' : 
                      'scale-100 bg-purple-400/30'}
                  `}>
                    <span className="text-2xl font-bold text-white capitalize">{breathPhase}</span>
                  </div>
                  <p className="text-gray-400">Breath {breathCount + 1} of 3</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Main Practice */}
        <Card className="bg-[#1a1625]/60 border-purple-500/20 p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${selectedPrompt.color}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedPrompt.title}</h3>
                <p className="text-sm text-purple-400 italic">{selectedPrompt.stoicQuote}</p>
              </div>
            </div>

            <div className="bg-[#0f0d14] rounded-xl p-6 border border-purple-500/20">
              <p className="text-lg text-gray-300 leading-relaxed">{selectedPrompt.prompt}</p>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-400">Your Visualization</span>
                <Textarea
                  value={responses.visualization}
                  onChange={(e) => setResponses({...responses, visualization: e.target.value})}
                  placeholder="Describe what you see in your mind's eye..."
                  className="mt-2 min-h-[120px] bg-[#0f0d14] border-purple-500/30 focus:border-purple-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-400">How does this make you feel?</span>
                <Textarea
                  value={responses.feelings}
                  onChange={(e) => setResponses({...responses, feelings: e.target.value})}
                  placeholder="Notice your emotions without judgment..."
                  className="mt-2 min-h-[100px] bg-[#0f0d14] border-purple-500/30 focus:border-purple-500"
                />
              </label>
            </div>
          </div>
        </Card>

        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => setStep(1)}>
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button 
            onClick={() => setStep(3)} 
            disabled={!responses.visualization}
            className="bg-gradient-to-r from-purple-600 to-indigo-600"
          >
            Continue to Reflection <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  const renderReflection = () => (
    <div className="space-y-8">
      <Card className="bg-[#1a1625]/60 border-purple-500/20 p-8">
        <div className="space-y-6">
          <div className="text-center">
            <Brain className="w-12 h-12 mx-auto text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-white">Deeper Reflection</h3>
            <p className="text-gray-400 mt-2">{selectedPrompt.followUp}</p>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-400">What insights emerged?</span>
              <Textarea
                value={responses.insights}
                onChange={(e) => setResponses({...responses, insights: e.target.value})}
                placeholder="What did this exercise reveal to you?"
                className="mt-2 min-h-[120px] bg-[#0f0d14] border-purple-500/30 focus:border-purple-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-400">How will you act differently?</span>
              <Textarea
                value={responses.actionPlan}
                onChange={(e) => setResponses({...responses, actionPlan: e.target.value})}
                placeholder="What concrete changes will you make?"
                className="mt-2 min-h-[100px] bg-[#0f0d14] border-purple-500/30 focus:border-purple-500"
              />
            </label>
          </div>
        </div>
      </Card>

      {/* Historical Examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Learn from the Stoics</h3>
        <div className="grid gap-4">
          {historicalExamples.map((example, i) => (
            <Card key={i} className="bg-[#1a1625]/40 border-purple-500/10 p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Mountain className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{example.figure}</h4>
                  <p className="text-xs text-purple-400 mb-2">{example.title}</p>
                  <p className="text-sm text-gray-400">{example.practice}</p>
                  <p className="text-sm text-purple-300 mt-2 italic">"{example.lesson}"</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => setStep(2)}>
          <ChevronLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button 
          onClick={() => setStep(4)} 
          disabled={!responses.insights}
          className="bg-gradient-to-r from-purple-600 to-indigo-600"
        >
          Complete Practice <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderCompletion = () => (
    <div className="min-h-[500px] flex flex-col items-center justify-center text-center space-y-8">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-emerald-500/30 blur-3xl animate-pulse"></div>
        <div className="relative p-6 rounded-full bg-[#1a1625]/60 border border-green-500/30">
          <Sparkles className="w-16 h-16 text-green-400" />
        </div>
      </div>

      <div className="space-y-4 max-w-2xl">
        <h2 className="text-3xl font-bold text-white">Practice Complete</h2>
        <p className="text-gray-400">
          You've strengthened your resilience through the ancient wisdom of negative visualization.
        </p>
        <blockquote className="text-lg italic text-purple-300 border-l-4 border-purple-500 pl-4">
          "It is not death that a man should fear, but he should fear never beginning to live."
          <span className="block text-sm text-gray-500 mt-2">— Marcus Aurelius</span>
        </blockquote>
      </div>

      <div className="flex gap-4">
        <Button 
          onClick={savePractice}
          className="bg-gradient-to-r from-green-600 to-emerald-600"
        >
          <Save className="w-4 h-4 mr-2" /> Save Practice
        </Button>
        <Button 
          onClick={() => {
            setStep(0);
            setSelectedPrompt(null);
            setResponses({ visualization: '', feelings: '', insights: '', actionPlan: '' });
            setBreathCount(0);
          }}
          variant="outline"
          className="border-purple-500/50"
        >
          New Practice
        </Button>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Past Practices</h2>
        <Button variant="ghost" onClick={() => setShowHistory(false)}>
          Back to Practice
        </Button>
      </div>

      {savedPractices.length === 0 ? (
        <Card className="bg-[#1a1625]/40 p-8 text-center">
          <History className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-500">No saved practices yet</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {savedPractices.map((practice) => {
            const prompt = guidedPrompts.find(p => p.id === practice.prompt?.id);
            const Icon = prompt?.icon || Eye;
            return (
              <Card key={practice.id} className="bg-[#1a1625]/40 border-purple-500/10 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${prompt?.color || 'from-purple-500 to-indigo-500'}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{prompt?.title || 'Practice'}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(practice.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                        {practice.responses?.insights || practice.responses?.visualization}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deletePractice(practice.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress indicator */}
        {step > 0 && step < 4 && !showHistory && (
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {['Select', 'Practice', 'Reflect', 'Complete'].map((label, i) => (
                <span 
                  key={i} 
                  className={`text-xs ${i < step ? 'text-purple-400' : i === step ? 'text-white' : 'text-gray-600'}`}
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="h-1 bg-[#1a1625] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {showHistory ? renderHistory() : (
          <>
            {step === 0 && renderIntro()}
            {step === 1 && renderSelection()}
            {step === 2 && renderPractice()}
            {step === 3 && renderReflection()}
            {step === 4 && renderCompletion()}
          </>
        )}
      </div>
    </div>
  );
};

export default PremeditatioPractice;
