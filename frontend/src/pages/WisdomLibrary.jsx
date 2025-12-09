import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, Crown, Zap, Mountain, Heart, Star, 
  Bell, BellOff, Filter, Search, Sparkles, Quote,
  TrendingUp, Target, Flame, Award
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Wisdom quotes categorized by philosophy
const wisdomQuotes = {
  think_and_grow_rich: {
    name: 'Think and Grow Rich',
    author: 'Napoleon Hill',
    icon: Crown,
    color: 'from-[#d4a574] to-[#b8885f]',
    quotes: [
      { text: "Whatever the mind can conceive and believe, it can achieve.", category: "belief" },
      { text: "Strength and growth come only through continuous effort and struggle.", category: "persistence" },
      { text: "The starting point of all achievement is desire.", category: "desire" },
      { text: "Don't wait. The time will never be just right.", category: "action" },
      { text: "A quitter never wins and a winner never quits.", category: "persistence" },
      { text: "Set your mind on a definite goal and observe how quickly the world stands aside to let you pass.", category: "focus" },
      { text: "The way of success is the way of continuous pursuit of knowledge.", category: "learning" },
      { text: "You are the master of your destiny.", category: "control" },
      { text: "Great achievement is usually born of great sacrifice.", category: "dedication" },
      { text: "If you cannot do great things, do small things in a great way.", category: "excellence" }
    ]
  },
  atomic_habits: {
    name: 'Atomic Habits',
    author: 'James Clear',
    icon: Zap,
    color: 'from-[#6366f1] to-[#8b5cf6]',
    quotes: [
      { text: "You do not rise to the level of your goals. You fall to the level of your systems.", category: "systems" },
      { text: "Every action you take is a vote for the type of person you wish to become.", category: "identity" },
      { text: "Habits are the compound interest of self-improvement.", category: "compounding" },
      { text: "The most effective way to change your habits is to focus not on what you want to achieve, but on who you wish to become.", category: "identity" },
      { text: "You should be far more concerned with your current trajectory than with your current results.", category: "progress" },
      { text: "Success is the product of daily habits—not once-in-a-lifetime transformations.", category: "consistency" },
      { text: "The purpose of setting goals is to win the game. The purpose of building systems is to continue playing the game.", category: "systems" },
      { text: "The difference a tiny improvement can make over time is astounding.", category: "improvement" },
      { text: "Make it obvious. Make it attractive. Make it easy. Make it satisfying.", category: "framework" },
      { text: "Be the designer of your world and not merely the consumer of it.", category: "creation" }
    ]
  },
  obstacle_is_the_way: {
    name: 'The Obstacle Is The Way',
    author: 'Ryan Holiday',
    icon: Mountain,
    color: 'from-[#059669] to-[#10b981]',
    quotes: [
      { text: "The impediment to action advances action. What stands in the way becomes the way.", category: "obstacles" },
      { text: "What blocks the path, becomes the path.", category: "transformation" },
      { text: "The obstacle in the path becomes the path. Never forget, within every obstacle is an opportunity to improve our condition.", category: "opportunity" },
      { text: "We decide what we will make of each and every situation. We decide whether we'll break or whether we'll resist.", category: "choice" },
      { text: "There is no good or bad without us, there is only perception.", category: "perception" },
      { text: "It's okay to be discouraged. It's not okay to quit.", category: "resilience" },
      { text: "Focus on the moment, not the monsters that may or may not be up ahead.", category: "presence" },
      { text: "See things for what they are. Do what we can. Endure and bear what we must.", category: "acceptance" },
      { text: "True will is quiet humility, resilience, and flexibility; the other kind of will is weakness disguised by bluster and ambition.", category: "strength" },
      { text: "Where the head goes, the body follows. Perception precedes action.", category: "mindset" }
    ]
  }
};

const categories = [
  'all', 'belief', 'persistence', 'action', 'systems', 'identity', 
  'obstacles', 'mindset', 'growth', 'resilience'
];

const WisdomLibrary = ({ token }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhilosophy, setSelectedPhilosophy] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [dailyQuote, setDailyQuote] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    fetchFavorites();
    selectDailyQuote();
    checkNotificationPermission();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await axios.get(`${API}/wisdom/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(response.data.map(f => f.quote_id));
    } catch (error) {
      console.error('Failed to fetch favorites');
    }
  };

  const selectDailyQuote = () => {
    // Get a random quote for daily inspiration
    const philosophies = Object.values(wisdomQuotes);
    const randomPhilosophy = philosophies[Math.floor(Math.random() * philosophies.length)];
    const randomQuote = randomPhilosophy.quotes[Math.floor(Math.random() * randomPhilosophy.quotes.length)];
    
    setDailyQuote({
      ...randomQuote,
      philosophy: randomPhilosophy.name,
      author: randomPhilosophy.author,
      icon: randomPhilosophy.icon,
      color: randomPhilosophy.color
    });
  };

  const checkNotificationPermission = () => {
    const enabled = localStorage.getItem('wisdomNotifications') === 'true';
    setNotificationsEnabled(enabled);
  };

  const toggleFavorite = async (quoteId) => {
    try {
      if (favorites.includes(quoteId)) {
        await axios.delete(`${API}/wisdom/favorites/${quoteId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFavorites(favorites.filter(id => id !== quoteId));
        toast.success('Removed from favorites');
      } else {
        await axios.post(
          `${API}/wisdom/favorites`,
          { quote_id: quoteId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavorites([...favorites, quoteId]);
        toast.success('Added to favorites');
      }
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  const toggleNotifications = async () => {
    try {
      const newState = !notificationsEnabled;
      
      if (newState) {
        // Request notification permission
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            localStorage.setItem('wisdomNotifications', 'true');
            setNotificationsEnabled(true);
            toast.success('Daily wisdom notifications enabled!');
            
            // Save preference to backend
            await axios.post(
              `${API}/wisdom/notifications`,
              { enabled: true },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } else {
            toast.error('Notification permission denied');
          }
        } else {
          toast.error('Notifications not supported in this browser');
        }
      } else {
        localStorage.setItem('wisdomNotifications', 'false');
        setNotificationsEnabled(false);
        toast.success('Daily wisdom notifications disabled');
        
        await axios.post(
          `${API}/wisdom/notifications`,
          { enabled: false },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      toast.error('Failed to update notification settings');
    }
  };

  // Filter quotes
  const getFilteredQuotes = () => {
    let allQuotes = [];
    
    Object.entries(wisdomQuotes).forEach(([key, philosophy]) => {
      if (selectedPhilosophy === 'all' || selectedPhilosophy === key) {
        philosophy.quotes.forEach((quote, idx) => {
          allQuotes.push({
            id: `${key}-${idx}`,
            ...quote,
            philosophy: philosophy.name,
            author: philosophy.author,
            icon: philosophy.icon,
            color: philosophy.color,
            philosophyKey: key
          });
        });
      }
    });

    // Filter by category
    if (selectedCategory !== 'all') {
      allQuotes = allQuotes.filter(q => q.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      allQuotes = allQuotes.filter(q => 
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.philosophy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return allQuotes;
  };

  const filteredQuotes = getFilteredQuotes();

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Wisdom Library</h1>
            <p className="text-gray-400">Timeless insights to guide your journey</p>
          </div>
          
          <Button
            onClick={toggleNotifications}
            variant="outline"
            className={`border-[#d4a574]/30 ${notificationsEnabled ? 'bg-[#d4a574]/10' : ''}`}
          >
            {notificationsEnabled ? <Bell className="w-5 h-5 mr-2 text-[#d4a574]" /> : <BellOff className="w-5 h-5 mr-2" />}
            Daily Wisdom
          </Button>
        </div>

        {/* Daily Quote Card */}
        {dailyQuote && (
          <Card className="glass border-[#d4a574]/30 p-6 mb-6 hover-lift">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${dailyQuote.color.replace('to-', 'to-')}/10`}>
                <Sparkles className={`w-8 h-8 text-transparent bg-clip-text bg-gradient-to-r ${dailyQuote.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="w-4 h-4 text-[#d4a574]" />
                  <span className="text-sm text-[#d4a574] font-semibold">Quote of the Day</span>
                </div>
                <p className="text-xl text-gray-200 mb-3 leading-relaxed italic">
                  "{dailyQuote.text}"
                </p>
                <p className="text-sm text-gray-400">
                  — {dailyQuote.author}, <span className="text-gray-500">{dailyQuote.philosophy}</span>
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search wisdom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#1a1625] border-[#d4a574]/20 text-white"
          />
        </div>

        {/* Philosophy Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setSelectedPhilosophy('all')}
            variant={selectedPhilosophy === 'all' ? 'default' : 'outline'}
            size="sm"
            className={selectedPhilosophy === 'all' ? 'bg-[#d4a574]' : 'border-[#d4a574]/30'}
          >
            All Philosophies
          </Button>
          {Object.entries(wisdomQuotes).map(([key, phil]) => {
            const Icon = phil.icon;
            return (
              <Button
                key={key}
                onClick={() => setSelectedPhilosophy(key)}
                variant={selectedPhilosophy === key ? 'default' : 'outline'}
                size="sm"
                className={selectedPhilosophy === key ? `bg-gradient-to-r ${phil.color}` : 'border-[#d4a574]/30'}
              >
                <Icon className="w-4 h-4 mr-1" />
                {phil.name.split(' ').slice(-2).join(' ')}
              </Button>
            );
          })}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? 'default' : 'ghost'}
              size="sm"
              className={selectedCategory === category ? 'bg-[#d4a574]/20 text-[#d4a574]' : 'text-gray-400'}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Quotes Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredQuotes.map((quote) => {
          const Icon = quote.icon;
          const isFavorite = favorites.includes(quote.id);

          return (
            <Card
              key={quote.id}
              className="glass border-[#d4a574]/20 p-5 hover-lift group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${quote.color}/10`}>
                  <Icon className={`w-5 h-5 text-transparent bg-clip-text bg-gradient-to-r ${quote.color}`} />
                </div>
                <Button
                  onClick={() => toggleFavorite(quote.id)}
                  variant="ghost"
                  size="sm"
                  className="hover:bg-transparent"
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'
                    }`}
                  />
                </Button>
              </div>

              <Quote className="w-6 h-6 text-gray-700 mb-2" />
              <p className="text-gray-200 leading-relaxed mb-3 italic">
                {quote.text}
              </p>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">— {quote.author}</span>
                <span className="text-xs text-gray-600 bg-gray-800 px-2 py-1 rounded">
                  {quote.category}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredQuotes.length === 0 && (
        <Card className="glass border-[#d4a574]/20 p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No quotes found matching your filters</p>
        </Card>
      )}
    </div>
  );
};

export default WisdomLibrary;
