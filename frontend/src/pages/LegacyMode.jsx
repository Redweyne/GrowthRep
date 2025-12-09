import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Clock, Mail, Send, Calendar, Trash2, Eye,
  Sparkles, Heart, Gift, Timer, Archive, Inbox,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';

const deliveryOptions = [
  { id: '1month', label: '1 Month', days: 30 },
  { id: '3months', label: '3 Months', days: 90 },
  { id: '6months', label: '6 Months', days: 180 },
  { id: '1year', label: '1 Year', days: 365 },
  { id: '5years', label: '5 Years', days: 1825 },
];

const prompts = [
  "What do you hope to have achieved by then?",
  "What advice would you give yourself?",
  "What fears do you want to have conquered?",
  "Who do you want to have become?",
  "What will you be grateful for?",
  "What would make you proud?"
];

const LegacyMode = ({ token, user }) => {
  const [letters, setLetters] = useState([]);
  const [showCompose, setShowCompose] = useState(false);
  const [newLetter, setNewLetter] = useState({
    content: '',
    deliveryOption: '1year',
    title: ''
  });
  const [expandedLetter, setExpandedLetter] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState(prompts[0]);

  useEffect(() => {
    loadLetters();
    // Rotate prompts
    const interval = setInterval(() => {
      setCurrentPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadLetters = () => {
    const saved = localStorage.getItem('futureLetters');
    if (saved) {
      setLetters(JSON.parse(saved));
    }
  };

  const saveLetters = (newLetters) => {
    localStorage.setItem('futureLetters', JSON.stringify(newLetters));
    setLetters(newLetters);
  };

  const sendLetter = () => {
    if (!newLetter.content.trim()) {
      toast.error('Please write something to your future self');
      return;
    }

    const delivery = deliveryOptions.find(d => d.id === newLetter.deliveryOption);
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + delivery.days);

    const letter = {
      id: Date.now().toString(),
      title: newLetter.title || `Letter to Future Me`,
      content: newLetter.content,
      createdAt: new Date().toISOString(),
      deliveryDate: deliveryDate.toISOString(),
      deliveryOption: newLetter.deliveryOption,
      status: 'pending', // pending, delivered, read
      opened: false
    };

    saveLetters([...letters, letter]);
    setNewLetter({ content: '', deliveryOption: '1year', title: '' });
    setShowCompose(false);
    toast.success(`Letter sealed! It will be delivered on ${deliveryDate.toLocaleDateString()}`);
  };

  const deleteLetter = (letterId) => {
    saveLetters(letters.filter(l => l.id !== letterId));
    toast.success('Letter deleted');
  };

  const openLetter = (letterId) => {
    const updated = letters.map(l => 
      l.id === letterId ? { ...l, opened: true, status: 'read' } : l
    );
    saveLetters(updated);
  };

  const canOpenLetter = (letter) => {
    return new Date(letter.deliveryDate) <= new Date();
  };

  const getTimeUntilDelivery = (deliveryDate) => {
    const now = new Date();
    const delivery = new Date(deliveryDate);
    const diff = delivery - now;
    
    if (diff <= 0) return 'Ready to open!';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (years > 0) return `${years} year${years > 1 ? 's' : ''} remaining`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} remaining`;
    return `${days} day${days > 1 ? 's' : ''} remaining`;
  };

  const pendingLetters = letters.filter(l => !canOpenLetter(l));
  const deliveredLetters = letters.filter(l => canOpenLetter(l));

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center gap-3">
          <Clock className="text-[#d4a574]" />
          Legacy Mode
        </h1>
        <p className="text-gray-400 max-w-2xl">
          Write letters to your future self. Capture your hopes, dreams, and wisdom.
          They'll be waiting for you when the time comes.
        </p>
      </div>

      {/* Compose New Letter */}
      {!showCompose ? (
        <Card 
          className="glass border-[#d4a574]/30 p-8 mb-8 cursor-pointer hover:border-[#d4a574]/50 transition-all text-center"
          onClick={() => setShowCompose(true)}
        >
          <div className="p-4 rounded-full bg-gradient-to-br from-[#d4a574]/20 to-[#e6b786]/20 inline-block mb-4">
            <Mail className="w-10 h-10 text-[#d4a574]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Write to Your Future Self</h2>
          <p className="text-gray-400 mb-4 italic">"{currentPrompt}"</p>
          <Button className="bg-gradient-to-r from-[#d4a574] to-[#e6b786] text-black font-semibold">
            <Send className="w-4 h-4 mr-2" />
            Start Writing
          </Button>
        </Card>
      ) : (
        <Card className="glass border-[#d4a574]/30 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-6 h-6 text-[#d4a574]" />
            <h2 className="text-xl font-bold text-white">Letter to Future {user?.name || 'Me'}</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Title (optional)</label>
              <Input
                value={newLetter.title}
                onChange={(e) => setNewLetter({ ...newLetter, title: e.target.value })}
                placeholder="e.g., On turning 30, A year from now..."
                className="bg-[#1a1625] border-[#d4a574]/20"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Your Message</label>
              <Textarea
                value={newLetter.content}
                onChange={(e) => setNewLetter({ ...newLetter, content: e.target.value })}
                placeholder="Dear Future Me...\n\nI'm writing this letter to remind you of..."
                className="bg-[#1a1625] border-[#d4a574]/20 min-h-[200px]"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">When should this be delivered?</label>
              <div className="flex flex-wrap gap-2">
                {deliveryOptions.map((option) => (
                  <Button
                    key={option.id}
                    variant={newLetter.deliveryOption === option.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewLetter({ ...newLetter, deliveryOption: option.id })}
                    className={newLetter.deliveryOption === option.id 
                      ? 'bg-[#d4a574] text-black' 
                      : 'border-gray-600'
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <Calendar className="w-3 h-3 inline mr-1" />
                Will be delivered on {new Date(Date.now() + deliveryOptions.find(d => d.id === newLetter.deliveryOption).days * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 border-gray-600"
                onClick={() => {
                  setShowCompose(false);
                  setNewLetter({ content: '', deliveryOption: '1year', title: '' });
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-[#d4a574] to-[#e6b786] text-black font-semibold"
                onClick={sendLetter}
              >
                <Send className="w-4 h-4 mr-2" />
                Seal & Send to Future
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Delivered Letters */}
      {deliveredLetters.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Inbox className="w-5 h-5 text-green-500" />
            Ready to Open ({deliveredLetters.length})
          </h3>
          <div className="space-y-4">
            {deliveredLetters.map((letter) => (
              <Card
                key={letter.id}
                className={`glass border-green-500/30 overflow-hidden ${
                  letter.opened ? 'opacity-80' : 'animate-pulse-slow'
                }`}
              >
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => {
                    if (!letter.opened) openLetter(letter.id);
                    setExpandedLetter(expandedLetter === letter.id ? null : letter.id);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/20">
                        {letter.opened ? (
                          <Eye className="w-5 h-5 text-green-500" />
                        ) : (
                          <Gift className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{letter.title}</h4>
                        <p className="text-xs text-gray-500">
                          Written on {new Date(letter.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!letter.opened && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-full">
                          New!
                        </span>
                      )}
                      {expandedLetter === letter.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedLetter === letter.id && (
                  <div className="px-4 pb-4 border-t border-green-500/20 pt-4">
                    <div className="bg-[#1a1625]/50 rounded-lg p-4 mb-4">
                      <p className="text-gray-200 whitespace-pre-wrap">{letter.content}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        Traveled through time: {deliveryOptions.find(d => d.id === letter.deliveryOption)?.label}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteLetter(letter.id)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pending Letters */}
      {pendingLetters.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Timer className="w-5 h-5 text-[#d4a574]" />
            Traveling Through Time ({pendingLetters.length})
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {pendingLetters.map((letter) => (
              <Card
                key={letter.id}
                className="glass border-[#d4a574]/20 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#d4a574]/10">
                      <Archive className="w-5 h-5 text-[#d4a574]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">{letter.title}</h4>
                      <p className="text-xs text-gray-500">
                        {getTimeUntilDelivery(letter.deliveryDate)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteLetter(letter.id)}
                    className="text-gray-600 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#d4a574] to-[#e6b786] rounded-full transition-all"
                    style={{ 
                      width: `${Math.max(5, 100 - ((new Date(letter.deliveryDate) - new Date()) / (deliveryOptions.find(d => d.id === letter.deliveryOption).days * 86400000) * 100))}%` 
                    }}
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {letters.length === 0 && !showCompose && (
        <Card className="glass border-[#d4a574]/20 p-8 text-center">
          <Sparkles className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No Letters Yet</h3>
          <p className="text-gray-500 text-sm">Your future self is waiting to hear from you.</p>
        </Card>
      )}

      {/* Wisdom */}
      <div className="mt-8 p-6 bg-gradient-to-r from-[#d4a574]/5 to-transparent rounded-xl border border-[#d4a574]/10">
        <p className="text-center text-gray-300 italic">
          "The best time to plant a tree was 20 years ago. The second best time is now."
        </p>
        <p className="text-center text-[#d4a574] mt-2 text-sm">— Chinese Proverb</p>
      </div>
    </div>
  );
};

export default LegacyMode;
