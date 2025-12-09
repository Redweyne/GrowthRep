import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sparkles, Send, User, Crown, Zap, Mountain, RefreshCw, 
  MessageCircle, Heart, Star, Lightbulb, Target, Flame,
  Quote, ChevronDown, Bot
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const mentorPersonalities = {
  hill: {
    name: 'Napoleon Hill',
    title: 'Master of the Mind',
    icon: Crown,
    avatar: '👑',
    color: 'from-amber-400 to-yellow-600',
    bgColor: 'from-amber-500/20 to-yellow-600/10',
    philosophy: 'Think and Grow Rich',
    description: 'Unlock the infinite potential of your mind',
    greeting: `Greetings, seeker of success.

I have spent my life studying the laws of achievement, interviewing over 500 of the world's most successful individuals. What I discovered changed everything.

*Whatever the mind can conceive and believe, it can achieve.*

Your thoughts are the seeds of your destiny. Your burning desire is the fuel. Today, let us explore the infinite power within you.

What definite chief aim burns within your heart?`,
    prompts: [
      "What's my definite chief aim?",
      "How do I develop a burning desire?",
      "Teach me about the mastermind principle",
      "How can I overcome fear?",
    ]
  },
  clear: {
    name: 'James Clear',
    title: 'Architect of Habits',
    icon: Zap,
    avatar: '⚡',
    color: 'from-blue-400 to-indigo-600',
    bgColor: 'from-blue-500/20 to-indigo-600/10',
    philosophy: 'Atomic Habits',
    description: 'Small changes, remarkable results',
    greeting: `Hey there!

I've spent years studying what actually makes habits stick—and what makes them fail. The truth? It's not about motivation or willpower.

*You do not rise to the level of your goals. You fall to the level of your systems.*

Every action you take is a vote for the type of person you wish to become. Small habits compound into remarkable results.

What habit are you trying to build or break?`,
    prompts: [
      "How do I make a habit stick?",
      "What's habit stacking?",
      "Help me design my environment",
      "How do I break a bad habit?",
    ]
  },
  holiday: {
    name: 'Ryan Holiday',
    title: 'Stoic Warrior',
    icon: Mountain,
    avatar: '🏔️',
    color: 'from-emerald-400 to-teal-600',
    bgColor: 'from-emerald-500/20 to-teal-600/10',
    philosophy: 'The Obstacle Is The Way',
    description: 'Turn obstacles into opportunities',
    greeting: `Welcome, fellow traveler.

The Stoics understood something profound: we don't control what happens to us, but we always control how we respond.

*The impediment to action advances action. What stands in the way becomes the way.*

Every obstacle you face contains within it the seed of an equal or greater opportunity. This is not optimism—it's strategy.

What obstacle stands before you today?`,
    prompts: [
      "How do I turn obstacles into opportunities?",
      "What is 'amor fati'?",
      "Help me with a challenge I'm facing",
      "Teach me about negative visualization",
    ]
  }
};

const AICoach = ({ token }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [selectedMentor, setSelectedMentor] = useState('hill');
  const [showMentorSelector, setShowMentorSelector] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message based on selected mentor
    const mentor = mentorPersonalities[selectedMentor];
    setMessages([{
      role: 'assistant',
      content: mentor.greeting,
      mentor: selectedMentor
    }]);
    setShowMentorSelector(false);
  }, [selectedMentor]);

  const handleSend = async (customMessage = null) => {
    const messageToSend = customMessage || input;
    if (!messageToSend.trim()) return;

    if (!customMessage) setInput('');
    setMessages(prev => [...prev, { role: 'user', content: messageToSend }]);
    setLoading(true);
    setIsTyping(true);

    try {
      const response = await axios.post(
        `${API}/ai-coach`,
        { 
          message: messageToSend, 
          context: { 
            session_id: sessionId,
            mentor_personality: selectedMentor
          } 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Simulate typing effect
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.response,
        mentor: selectedMentor
      }]);
    } catch (error) {
      toast.error('Failed to get response');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try again.',
        mentor: selectedMentor
      }]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const switchMentor = (mentorKey) => {
    setSelectedMentor(mentorKey);
    toast.success(`Now speaking with ${mentorPersonalities[mentorKey].name}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const mentor = mentorPersonalities[selectedMentor];
  const MentorIcon = mentor.icon;

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      {/* Header */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3" data-testid="ai-coach-header">
              <span className="text-4xl">{mentor.avatar}</span>
              AI Growth Coach
            </h1>
            <p className="text-gray-400 mt-1">Wisdom from three transformative philosophies</p>
          </div>
          <Button
            onClick={() => setShowMentorSelector(!showMentorSelector)}
            variant="outline"
            className="border-[#d4a574]/30 hover:border-[#d4a574] text-[#d4a574]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Switch Mentor
          </Button>
        </div>

        {/* Mentor Selector */}
        <AnimatePresence>
          {showMentorSelector && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid md:grid-cols-3 gap-4 mt-4 overflow-hidden"
            >
              {Object.entries(mentorPersonalities).map(([key, m]) => {
                const Icon = m.icon;
                const isSelected = key === selectedMentor;
                
                return (
                  <motion.div
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      onClick={() => switchMentor(key)}
                      className={`p-5 cursor-pointer transition-all border-2 ${
                        isSelected 
                          ? `border-transparent bg-gradient-to-br ${m.bgColor}` 
                          : 'border-gray-800 hover:border-gray-700 bg-gray-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${m.color}`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{m.name}</h3>
                          <p className="text-xs text-gray-400">{m.title}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">{m.description}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300">
                          {m.philosophy}
                        </span>
                        {isSelected && (
                          <span className="text-xs px-2 py-1 rounded-full bg-[#d4a574]/20 text-[#d4a574] flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden border-[#d4a574]/20 bg-gradient-to-br from-gray-900/80 to-gray-900/40">
        {/* Current Mentor Banner */}
        <div className={`px-6 py-3 bg-gradient-to-r ${mentor.bgColor} border-b border-white/10 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{mentor.avatar}</span>
            <div>
              <p className="font-semibold text-white text-sm">{mentor.name}</p>
              <p className="text-xs text-gray-400">{mentor.philosophy}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Online
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6" data-testid="chat-messages">
          {messages.map((message, index) => {
            const msgMentor = message.mentor ? mentorPersonalities[message.mentor] : mentor;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                data-testid={`message-${index}`}
              >
                {message.role === 'assistant' && (
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${msgMentor.color} shrink-0`}>
                    <span className="text-xl">{msgMentor.avatar}</span>
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-[#d4a574] to-[#b8885f] text-black rounded-2xl rounded-br-md px-5 py-3'
                      : 'bg-gray-800/80 border border-gray-700/50 rounded-2xl rounded-bl-md px-5 py-4'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <p className={`text-xs font-semibold mb-2 bg-gradient-to-r ${msgMentor.color} bg-clip-text text-transparent`}>
                      {msgMentor.name}
                    </p>
                  )}
                  <div className="whitespace-pre-wrap leading-relaxed text-gray-100">
                    {message.content.split('\n').map((line, i) => {
                      // Style italics
                      if (line.startsWith('*') && line.endsWith('*')) {
                        return (
                          <p key={i} className="italic text-[#d4a574] my-2 text-lg">
                            {line.slice(1, -1)}
                          </p>
                        );
                      }
                      return <p key={i} className={line ? '' : 'h-4'}>{line}</p>;
                    })}
                  </div>
                </div>
                
                {message.role === 'user' && (
                  <div className="p-2 rounded-xl bg-[#d4a574]/20 shrink-0">
                    <User className="w-5 h-5 text-[#d4a574]" />
                  </div>
                )}
              </motion.div>
            );
          })}
          
          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-3"
            >
              <div className={`p-2 rounded-xl bg-gradient-to-br ${mentor.color}`}>
                <span className="text-xl">{mentor.avatar}</span>
              </div>
              <div className="bg-gray-800/80 border border-gray-700/50 rounded-2xl px-5 py-4">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-[#d4a574]"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="px-6 pb-4">
            <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {mentor.prompts.map((prompt, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSend(prompt)}
                  className="px-3 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 border border-gray-700 transition-colors"
                >
                  {prompt}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-gray-700/50 bg-gray-900/50">
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              data-testid="ai-coach-input"
              placeholder={`Ask ${mentor.name} anything...`}
              rows={2}
              className="flex-1 bg-gray-800/50 border-gray-700 text-white resize-none placeholder:text-gray-500 focus:border-[#d4a574]"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                data-testid="send-message-button"
                className={`h-full px-6 bg-gradient-to-r ${mentor.color} hover:opacity-90 text-white`}
              >
                <Send className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AICoach;
