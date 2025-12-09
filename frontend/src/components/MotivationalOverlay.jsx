import { useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const motivationalQuotes = [
  { 
    text: "Every small step compounds into extraordinary results.",
    author: "Your Future Self",
    gradient: "from-purple-500 to-pink-500"
  },
  { 
    text: "The obstacle in your path becomes your path.",
    author: "Marcus Aurelius",
    gradient: "from-emerald-500 to-teal-500"
  },
  { 
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
    gradient: "from-blue-500 to-indigo-500"
  },
  { 
    text: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier",
    gradient: "from-amber-500 to-orange-500"
  },
  { 
    text: "Your limitation—it's only your imagination.",
    author: "Growth Mindset",
    gradient: "from-[#d4a574] to-[#b8885f]"
  }
];

const MotivationalOverlay = ({ intervalMinutes = 15 }) => {
  const [show, setShow] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Don't show on first load, wait for the interval
    const showTimer = setTimeout(() => {
      if (!hasInteracted) {
        showRandomQuote();
      }
    }, intervalMinutes * 60 * 1000);

    return () => clearTimeout(showTimer);
  }, [intervalMinutes, hasInteracted]);

  const showRandomQuote = () => {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setCurrentQuote(randomQuote);
    setShow(true);

    // Auto-hide after 8 seconds
    setTimeout(() => {
      setShow(false);
    }, 8000);
  };

  const handleClose = () => {
    setShow(false);
    setHasInteracted(true);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Quote Card */}
      <div className={`relative max-w-2xl w-full bg-gradient-to-br ${currentQuote.gradient} p-1 rounded-3xl animate-scale-in`}>
        <div className="bg-[#0a0a0f] rounded-3xl p-8 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 opacity-20">
            <Sparkles size={40} className="text-white" />
          </div>
          <div className="absolute bottom-4 right-4 opacity-20">
            <Sparkles size={60} className="text-white" />
          </div>

          {/* Close button */}
          <Button
            onClick={handleClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
          >
            <X size={20} />
          </Button>

          {/* Content */}
          <div className="relative z-10 text-center space-y-6 pt-8">
            <div className="space-y-4">
              <p className="text-3xl md:text-4xl font-serif italic text-white leading-relaxed">
                "{currentQuote.text}"
              </p>
              <p className="text-xl text-gray-400 font-medium">
                — {currentQuote.author}
              </p>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleClose}
                className={`bg-gradient-to-r ${currentQuote.gradient} hover:opacity-90 transition-opacity text-white px-8 py-6 text-lg`}
              >
                Continue Your Journey
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotivationalOverlay;
