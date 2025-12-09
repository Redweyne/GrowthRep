import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Image, Quote, Trash2, Sparkles, Star, Crown, Heart, Maximize2, X, Volume2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import PhilosophyIcon from '@/components/PhilosophyIcon';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Vision card colors based on type
const cardStyles = {
  text: 'from-amber-900/30 to-orange-900/30 border-amber-500/30',
  quote: 'from-purple-900/30 to-indigo-900/30 border-purple-500/30',
  image: 'from-blue-900/30 to-cyan-900/30 border-blue-500/30',
  affirmation: 'from-green-900/30 to-emerald-900/30 border-green-500/30'
};

const cardIcons = {
  text: Star,
  quote: Quote,
  image: Image,
  affirmation: Crown
};

const VisionBoard = ({ token }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(null);
  const [visionFlash, setVisionFlash] = useState(null);
  const boardRef = useRef(null);
  const [formData, setFormData] = useState({
    type: 'text',
    content: '',
  });

  // Vision Flash - show random item on load
  useEffect(() => {
    if (items.length > 0 && !visionFlash) {
      const hasSeenFlash = sessionStorage.getItem('visionFlashSeen');
      if (!hasSeenFlash) {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        setVisionFlash(randomItem);
        sessionStorage.setItem('visionFlashSeen', 'true');
        setTimeout(() => setVisionFlash(null), 5000);
      }
    }
  }, [items]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API}/vision-board`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(response.data);
    } catch (error) {
      toast.error('Failed to load vision board');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/vision-board`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Item added!');
      fetchItems();
      setDialogOpen(false);
      setFormData({ type: 'text', content: '' });
    } catch (error) {
      toast.error('Failed to add item');
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await axios.delete(`${API}/vision-board/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Item removed');
      fetchItems();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Vision Flash Modal */}
      {visionFlash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-2xl p-8 text-center">
            <button 
              onClick={() => setVisionFlash(null)}
              className="absolute top-0 right-0 text-white/50 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <Sparkles className="w-12 h-12 mx-auto text-[#d4a574] mb-6 animate-pulse" />
            <p className="text-sm text-[#d4a574] uppercase tracking-widest mb-4">Vision Flash</p>
            {visionFlash.type === 'image' ? (
              <img src={visionFlash.content} alt="Vision" className="max-h-64 mx-auto rounded-lg shadow-2xl" />
            ) : (
              <p className="text-3xl text-white font-light italic leading-relaxed">
                "{visionFlash.content}"
              </p>
            )}
            <p className="text-gray-500 mt-6 text-sm">Remember why you started...</p>
          </div>
        </div>
      )}

      {/* Focus Mode */}
      {focusMode && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg animate-fade-in cursor-pointer"
          onClick={() => setFocusMode(null)}
        >
          <div className="max-w-4xl p-12 text-center">
            {focusMode.type === 'image' ? (
              <img src={focusMode.content} alt="Vision" className="max-h-[70vh] mx-auto rounded-2xl shadow-2xl" />
            ) : (
              <div className="relative">
                <Quote className="w-16 h-16 mx-auto text-[#d4a574]/30 mb-8" />
                <p className="text-4xl md:text-5xl text-white font-light italic leading-relaxed">
                  "{focusMode.content}"
                </p>
              </div>
            )}
            <p className="text-gray-600 mt-12 text-sm">Click anywhere to close</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold gradient-text flex items-center gap-3" data-testid="vision-board-header">
            <Sparkles className="w-8 h-8 text-[#d4a574]" />
            Vision Board
            <PhilosophyIcon feature="visionBoard" />
          </h1>
          <p className="text-gray-400 mt-1">Your digital altar of dreams and aspirations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#d4a574] to-[#b8885f] shadow-lg shadow-[#d4a574]/20" data-testid="add-vision-item-button">
              <Plus size={20} className="mr-2" />
              Add Vision
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-[#d4a574]/20 text-white" data-testid="vision-item-dialog">
            <DialogHeader>
              <DialogTitle className="text-2xl gradient-text">Add to Vision Board</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label className="text-gray-300">Type</Label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  data-testid="vision-type-select"
                  className="w-full mt-2 p-2 bg-[#1a1625] border border-[#d4a574]/20 rounded-md text-white"
                >
                  <option value="text">Affirmation</option>
                  <option value="quote">Inspirational Quote</option>
                  <option value="image">Vision Image URL</option>
                </select>
              </div>
              <div>
                <Label className="text-gray-300">Content</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  data-testid="vision-content-input"
                  placeholder={formData.type === 'image' ? 'Enter image URL (from Unsplash, etc.)' : 'Enter your vision or quote...'}
                  required
                  rows={4}
                  className="mt-2 bg-[#1a1625] border-[#d4a574]/20 text-white"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-[#d4a574] to-[#b8885f]" data-testid="vision-submit-button">
                <Sparkles className="w-4 h-4 mr-2" />
                Manifest This Vision
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Banner */}
      {items.length > 0 && (
        <div className="flex items-center justify-center gap-8 py-4 px-6 rounded-xl bg-gradient-to-r from-[#1a1625] to-[#0f0d14] border border-[#d4a574]/10">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#d4a574]">{items.length}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Visions</div>
          </div>
          <div className="w-px h-8 bg-[#d4a574]/20"></div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{items.filter(i => i.type === 'quote').length}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Quotes</div>
          </div>
          <div className="w-px h-8 bg-[#d4a574]/20"></div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{items.filter(i => i.type === 'image').length}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Images</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <Sparkles className="w-8 h-8 mx-auto animate-spin text-[#d4a574]" />
          <p className="mt-4">Loading your visions...</p>
        </div>
      ) : items.length === 0 ? (
        <Card className="glass p-12 border-[#d4a574]/20 text-center" data-testid="no-vision-items">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <Sparkles className="w-48 h-48 text-[#d4a574]" />
            </div>
            <Image className="mx-auto text-[#d4a574] mb-6 relative z-10" size={64} />
          </div>
          <h3 className="text-2xl font-semibold text-gray-300 mb-2">Your Vision Board Awaits</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            Add affirmations, inspirational quotes, or images that represent your dreams and goals. 
            Visualize your future self every day.
          </p>
          <Button 
            onClick={() => setDialogOpen(true)}
            className="bg-gradient-to-r from-[#d4a574] to-[#b8885f]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Vision
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" ref={boardRef}>
          {items.map((item, index) => {
            const Icon = cardIcons[item.type] || Star;
            return (
              <Card 
                key={item.id} 
                className={`
                  relative overflow-hidden transition-all duration-500 cursor-pointer group
                  bg-gradient-to-br ${cardStyles[item.type] || cardStyles.text}
                  hover:scale-[1.02] hover:shadow-xl hover:shadow-[#d4a574]/10
                  animate-fade-in-up
                `}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setFocusMode(item)}
                data-testid={`vision-card-${item.id}`}
              >
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                  <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-[#d4a574]/20 to-transparent rotate-45"></div>
                </div>

                {/* Action buttons */}
                <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFocusMode(item);
                    }}
                    className="w-8 h-8 text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <Maximize2 size={14} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    data-testid={`delete-vision-${item.id}`}
                    className="w-8 h-8 text-red-400/60 hover:text-red-400 hover:bg-red-400/10"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>

                <div className="p-6">
                  {item.type === 'image' ? (
                    <div className="relative">
                      <img 
                        src={item.content} 
                        alt="Vision" 
                        className="w-full h-48 object-cover rounded-lg mb-4 transition-transform group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Icon className="w-8 h-8 text-[#d4a574]/60" />
                      <p className="text-gray-200 text-lg leading-relaxed line-clamp-4">
                        "{item.content}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d4a574] to-[#b8885f] opacity-50"></div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Inspiration tip */}
      {items.length > 0 && items.length < 9 && (
        <div className="text-center py-6 text-gray-500 text-sm">
          <Heart className="w-4 h-4 inline-block mr-2" />
          Tip: Add more visions to create a powerful visual representation of your future
        </div>
      )}
    </div>
  );
};

export default VisionBoard;
