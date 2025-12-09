import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, Zap, Mountain, ArrowRight, Check,
  Target, Flame, BookOpen, TrendingUp, Clock,
  Brain, Heart, Star, Sparkles, Sun, Moon,
  Coffee, Dumbbell, PenLine, Users, Lightbulb
} from 'lucide-react';

// Rich, meaningful content for each step
const JOURNEY_STEPS = [
  {
    id: 'awakening',
    type: 'reflection',
    question: "Before we begin, take a breath.",
    subtext: "This moment matters. You're not just opening an app — you're making a decision about who you want to become.",
    duration: 7000,
    ambient: 'pulse'
  },
  {
    id: 'core-desire',
    type: 'choice',
    question: "What's pulling you forward right now?",
    subtext: "Not what you should want. What you actually want.",
    options: [
      { 
        id: 'mastery', 
        icon: Crown, 
        title: 'Mastery & Achievement',
        description: 'Becoming excellent at something that matters',
        gradient: 'from-amber-500 to-orange-600'
      },
      { 
        id: 'freedom', 
        icon: Sparkles, 
        title: 'Freedom & Energy',
        description: 'Taking back control of my time, health, and life',
        gradient: 'from-emerald-500 to-teal-600'
      },
      { 
        id: 'impact', 
        icon: Users, 
        title: 'Impact & Legacy',
        description: 'Building something bigger than myself',
        gradient: 'from-blue-500 to-indigo-600'
      },
      { 
        id: 'clarity', 
        icon: Lightbulb, 
        title: 'Clarity & Purpose',
        description: "Finding direction when everything feels unclear",
        gradient: 'from-purple-500 to-pink-600'
      }
    ]
  },
  {
    id: 'obstacle',
    type: 'choice',
    question: "What has stopped you before?",
    subtext: "Naming it takes away its power.",
    options: [
      { 
        id: 'consistency', 
        icon: Clock, 
        title: 'Starting Strong, Fading Fast',
        description: "I begin with motivation but can't sustain it"
      },
      { 
        id: 'overwhelm', 
        icon: Brain, 
        title: 'Too Much, Too Fast',
        description: 'I try to change everything and burn out'
      },
      { 
        id: 'clarity', 
        icon: Target, 
        title: 'Lack of Clear Direction',
        description: "I don't know what to focus on first"
      },
      { 
        id: 'belief', 
        icon: Heart, 
        title: 'Self-Doubt',
        description: "Part of me doesn't believe I can really change"
      }
    ]
  },
  {
    id: 'philosophy',
    type: 'philosophy',
    question: "Choose your guide.",
    subtext: "Three masters. Three paths. One destination: Transformation.",
    options: [
      { 
        id: 'think_and_grow_rich', 
        icon: Crown,
        author: 'Napoleon Hill',
        book: 'Think and Grow Rich',
        philosophy: 'The Power of Burning Desire',
        keyIdea: "Whatever the mind can conceive and believe, it can achieve.",
        approach: 'Start with your deepest desire. Build unwavering faith. Take persistent action.',
        gradient: 'from-amber-500 via-yellow-500 to-orange-500',
        color: '#d4a574'
      },
      { 
        id: 'atomic_habits', 
        icon: Zap,
        author: 'James Clear',
        book: 'Atomic Habits',
        philosophy: 'The Power of Systems',
        keyIdea: "You do not rise to the level of your goals. You fall to the level of your systems.",
        approach: 'Forget goals. Build identity. Make good habits obvious, attractive, easy, satisfying.',
        gradient: 'from-blue-500 via-indigo-500 to-purple-500',
        color: '#6366f1'
      },
      { 
        id: 'obstacle_is_the_way', 
        icon: Mountain,
        author: 'Ryan Holiday',
        book: 'The Obstacle Is The Way',
        philosophy: 'The Power of Stoicism',
        keyIdea: "The impediment to action advances action. What stands in the way becomes the way.",
        approach: 'See obstacles as opportunities. Control your perceptions. Take disciplined action.',
        gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
        color: '#14b8a6'
      }
    ]
  },
  {
    id: 'commitment',
    type: 'commitment',
    question: "How will you show up?",
    subtext: "Consistency beats intensity. Small daily actions compound into extraordinary results.",
    options: [
      { 
        id: '5min', 
        time: '5 minutes',
        daily: 'Quick reflection & one habit',
        yearly: '30+ hours of focused growth',
        compound: 'The starting point. Builds the foundation.',
        intensity: 1
      },
      { 
        id: '15min', 
        time: '15 minutes',
        daily: 'Journal, habits, and review',
        yearly: '91+ hours of focused growth',
        compound: 'The sweet spot. Where real change happens.',
        intensity: 2
      },
      { 
        id: '30min', 
        time: '30 minutes',
        daily: 'Deep work on goals and habits',
        yearly: '182+ hours of focused growth',
        compound: 'Serious commitment. Accelerated transformation.',
        intensity: 3
      },
      { 
        id: '60min', 
        time: '60+ minutes',
        daily: 'Full ritual: reflect, plan, execute',
        yearly: '365+ hours of focused growth',
        compound: 'All in. For those ready to transform everything.',
        intensity: 4
      }
    ]
  },
  {
    id: 'covenant',
    type: 'covenant',
    question: "Your commitment.",
    subtext: "This is your contract with yourself."
  }
];

const Onboarding = ({ user, onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [selections, setSelections] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const firstName = user?.name?.split(' ')[0] || 'Champion';

  const currentStep = JOURNEY_STEPS[stepIndex];
  const isLastStep = stepIndex === JOURNEY_STEPS.length - 1;

  useEffect(() => {
    // For reflection steps, auto-advance after duration
    if (currentStep.type === 'reflection') {
      setShowContent(true);
      const timer = setTimeout(() => {
        goToNextStep();
      }, currentStep.duration);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => setShowContent(true), 300);
    }
  }, [stepIndex]);

  const goToNextStep = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setShowContent(false);
    
    setTimeout(() => {
      if (isLastStep) {
        completeOnboarding();
      } else {
        setStepIndex(prev => prev + 1);
        setIsTransitioning(false);
      }
    }, 500);
  }, [isLastStep, isTransitioning]);

  const handleSelect = useCallback((optionId) => {
    setSelections(prev => ({
      ...prev,
      [currentStep.id]: optionId
    }));

    // Longer delay to let the selection feel meaningful
    setTimeout(goToNextStep, 1200);
  }, [currentStep, goToNextStep]);

  const completeOnboarding = () => {
    const preferences = {
      ...selections,
      primaryGoal: selections['core-desire'],
      obstacle: selections['obstacle'],
      preferredPhilosophy: selections['philosophy'],
      dailyCommitment: selections['commitment'],
      onboardingCompleted: true,
      completedAt: new Date().toISOString()
    };
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    onComplete(preferences);
  };

  // Get the selected philosophy for the covenant
  const selectedPhilosophy = JOURNEY_STEPS.find(s => s.id === 'philosophy')?.options.find(o => o.id === selections['philosophy']);
  const selectedCommitment = JOURNEY_STEPS.find(s => s.id === 'commitment')?.options.find(o => o.id === selections['commitment']);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-black relative overflow-hidden">
      {/* Deep ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black" />
      
      {/* Breathing glow */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.08, 0.15, 0.08]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: 'radial-gradient(circle, rgba(212,165,116,0.4) 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-4xl relative z-10">
        {/* Progress indicator - elegant dots */}
        <div className="flex items-center justify-center gap-3 mb-12">
          {JOURNEY_STEPS.filter(s => s.type !== 'reflection').map((step, idx) => {
            const actualIdx = JOURNEY_STEPS.findIndex(s => s.id === step.id);
            const isActive = stepIndex === actualIdx;
            const isComplete = stepIndex > actualIdx;
            
            return (
              <motion.div
                key={step.id}
                className={`rounded-full transition-all duration-500 ${
                  isActive 
                    ? 'w-8 h-2 bg-[#d4a574]' 
                    : isComplete 
                      ? 'w-2 h-2 bg-[#d4a574]/60' 
                      : 'w-2 h-2 bg-white/10'
                }`}
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 40 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Reflection Step */}
            {currentStep.type === 'reflection' && (
              <div className="text-center py-20">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.5 }}
                  className="text-3xl md:text-5xl text-white font-light leading-relaxed mb-10"
                >
                  {currentStep.question}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 0.6, y: 0 }}
                  transition={{ duration: 1.5, delay: 1.8 }}
                  className="text-xl md:text-2xl text-white/50 max-w-3xl mx-auto leading-relaxed"
                >
                  {currentStep.subtext}
                </motion.p>
                {/* Breathing indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ duration: 1, delay: 4 }}
                  className="mt-16"
                >
                  <motion.div
                    className="w-16 h-16 mx-auto rounded-full border-2 border-[#d4a574]/30"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </motion.div>
              </div>
            )}

            {/* Choice Step */}
            {currentStep.type === 'choice' && (
              <div className="space-y-10">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl md:text-5xl font-bold text-white">
                    {currentStep.question}
                  </h2>
                  <p className="text-xl text-white/50">{currentStep.subtext}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
                  {currentStep.options.map((option, idx) => {
                    const Icon = option.icon;
                    const isSelected = selections[currentStep.id] === option.id;
                    
                    return (
                      <motion.button
                        key={option.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          scale: isSelected ? 1.02 : 1
                        }}
                        transition={{ duration: 0.5, delay: idx * 0.15 }}
                        onClick={() => handleSelect(option.id)}
                        disabled={isTransitioning}
                        className={`
                          relative p-6 md:p-8 rounded-2xl text-left transition-all duration-500 group
                          ${isSelected 
                            ? 'ring-2 ring-[#d4a574] bg-[#d4a574]/20 shadow-2xl shadow-[#d4a574]/20' 
                            : 'bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 hover:shadow-xl'
                          }
                          ${isTransitioning && !isSelected ? 'opacity-30' : ''}
                        `}
                      >
                        {/* Selection glow effect */}
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#d4a574]/10 to-transparent"
                          />
                        )}
                        
                        <div className="flex items-start gap-5 relative z-10">
                          <motion.div 
                            className={`p-4 rounded-xl bg-gradient-to-br ${option.gradient || 'from-gray-600 to-gray-700'} shadow-lg shrink-0 transition-transform duration-300`}
                            animate={{
                              scale: isSelected ? 1.1 : 1,
                              rotate: isSelected ? [0, -5, 5, 0] : 0
                            }}
                            transition={{ duration: 0.5 }}
                          >
                            <Icon className="w-6 h-6 text-white" />
                          </motion.div>
                          
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#d4a574] transition-colors">
                              {option.title}
                            </h3>
                            <p className="text-white/60 group-hover:text-white/80 transition-colors">
                              {option.description}
                            </p>
                          </div>

                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-7 h-7 rounded-full bg-[#d4a574] flex items-center justify-center shrink-0"
                            >
                              <Check className="w-4 h-4 text-black" strokeWidth={3} />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Philosophy Step - Special treatment */}
            {currentStep.type === 'philosophy' && (
              <div className="space-y-10">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl md:text-5xl font-bold text-white">
                    {currentStep.question}
                  </h2>
                  <p className="text-xl text-white/50">{currentStep.subtext}</p>
                </div>

                <div className="space-y-4 mt-10">
                  {currentStep.options.map((option, idx) => {
                    const Icon = option.icon;
                    const isSelected = selections[currentStep.id] === option.id;
                    
                    return (
                      <motion.button
                        key={option.id}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.15 }}
                        onClick={() => handleSelect(option.id)}
                        className={`
                          w-full relative p-6 md:p-8 rounded-2xl text-left transition-all duration-300 group overflow-hidden
                          ${isSelected 
                            ? 'ring-2 ring-[#d4a574]' 
                            : 'bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10'
                          }
                        `}
                        style={{
                          background: isSelected ? `linear-gradient(135deg, rgba(212,165,116,0.15) 0%, rgba(0,0,0,0.8) 100%)` : undefined
                        }}
                      >
                        {/* Gradient accent line */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${option.gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />
                        
                        <div className="flex items-start gap-6 pl-4">
                          <div className={`p-4 rounded-xl bg-gradient-to-br ${option.gradient} shadow-lg shrink-0`}>
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            <div>
                              <h3 className="text-2xl font-bold text-white">{option.author}</h3>
                              <p className="text-white/40 text-sm italic">{option.book}</p>
                            </div>
                            <p className="text-lg font-semibold" style={{ color: option.color }}>{option.philosophy}</p>
                            <p className="text-white/80 text-lg italic">"{option.keyIdea}"</p>
                            <p className="text-white/50 text-sm pt-2">{option.approach}</p>
                          </div>

                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-8 h-8 rounded-full bg-[#d4a574] flex items-center justify-center shrink-0"
                            >
                              <Check className="w-5 h-5 text-black" strokeWidth={3} />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Commitment Step */}
            {currentStep.type === 'commitment' && (
              <div className="space-y-10">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl md:text-5xl font-bold text-white">
                    {currentStep.question}
                  </h2>
                  <p className="text-xl text-white/50">{currentStep.subtext}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                  {currentStep.options.map((option, idx) => {
                    const isSelected = selections[currentStep.id] === option.id;
                    
                    return (
                      <motion.button
                        key={option.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.1 }}
                        onClick={() => handleSelect(option.id)}
                        className={`
                          relative p-6 rounded-2xl text-center transition-all duration-300 group
                          ${isSelected 
                            ? 'ring-2 ring-[#d4a574] bg-[#d4a574]/15' 
                            : 'bg-white/5 hover:bg-white/10 border border-white/5'
                          }
                        `}
                      >
                        {/* Intensity indicator */}
                        <div className="flex justify-center gap-1 mb-4">
                          {[...Array(4)].map((_, i) => (
                            <div 
                              key={i} 
                              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                i < option.intensity 
                                  ? 'bg-[#d4a574]' 
                                  : 'bg-white/10'
                              }`} 
                            />
                          ))}
                        </div>
                        
                        <h3 className="text-3xl font-bold text-white mb-2">{option.time}</h3>
                        <p className="text-white/60 text-sm mb-4">{option.daily}</p>
                        <div className="pt-4 border-t border-white/10">
                          <p className="text-[#d4a574] font-semibold">{option.yearly}</p>
                        </div>
                        <p className="text-white/40 text-xs mt-3">{option.compound}</p>

                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#d4a574] flex items-center justify-center"
                          >
                            <Check className="w-4 h-4 text-black" strokeWidth={3} />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Covenant Step - The Contract */}
            {currentStep.type === 'covenant' && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl md:text-5xl font-bold text-white">
                    {currentStep.question}
                  </h2>
                  <p className="text-xl text-white/50">{currentStep.subtext}</p>
                </div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-white/10 to-transparent border border-[#d4a574]/30 backdrop-blur-sm"
                >
                  {/* Decorative corner */}
                  <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-[#d4a574]/30 rounded-tl-3xl" />
                  <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-[#d4a574]/30 rounded-br-3xl" />
                  
                  <div className="space-y-8 text-center">
                    <p className="text-white/60 text-lg">I, <span className="text-[#d4a574] font-semibold text-xl">{firstName}</span>, commit to</p>
                    
                    <p className="text-white text-2xl md:text-3xl font-light leading-relaxed">
                      dedicating <span className="text-[#d4a574] font-semibold">{selectedCommitment?.time || '...'}</span> every day
                    </p>
                    
                    <p className="text-white text-2xl md:text-3xl font-light leading-relaxed">
                      to my transformation, guided by the wisdom of
                    </p>
                    
                    <p className="text-[#d4a574] text-3xl md:text-4xl font-bold">
                      {selectedPhilosophy?.author || '...'}
                    </p>
                    
                    <div className="pt-6 space-y-4">
                      <p className="text-white/50 italic text-lg">
                        "{selectedPhilosophy?.keyIdea || '...'}"
                      </p>
                    </div>
                    
                    <div className="pt-8">
                      <p className="text-white/40 text-sm mb-6">In one year, this equals <span className="text-[#d4a574]">{selectedCommitment?.yearly || '...'}</span></p>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={completeOnboarding}
                        className="px-12 py-4 rounded-xl bg-gradient-to-r from-[#d4a574] to-[#b8885f] text-black font-bold text-lg shadow-lg shadow-[#d4a574]/20 hover:shadow-xl hover:shadow-[#d4a574]/30 transition-all duration-300"
                      >
                        Begin My Journey
                        <ArrowRight className="inline-block ml-2 w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Skip option - subtle */}
        {currentStep.type !== 'covenant' && currentStep.type !== 'reflection' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-12"
          >
            <button
              onClick={completeOnboarding}
              className="text-white/30 hover:text-white/50 text-sm transition-colors"
            >
              Skip onboarding →
            </button>
          </motion.div>
        )}
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.5)_100%)]" />
    </div>
  );
};

export default Onboarding;
