import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Mail, Lock, Unlock, Crown, Brain, Shield,
  Download, Sparkles, Trophy, Flame, Target,
  ChevronRight, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

const mentors = [
  {
    id: 'hill',
    name: 'Napoleon Hill',
    title: 'Author of Think and Grow Rich',
    avatar: '📚',
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'clear',
    name: 'James Clear',
    title: 'Author of Atomic Habits',
    avatar: '⚛️',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'holiday',
    name: 'Ryan Holiday',
    title: 'Author of The Obstacle Is The Way',
    avatar: '🏛️',
    color: 'from-emerald-500 to-teal-600'
  }
];

const letterTemplates = {
  hill: {
    welcome: {
      title: 'A Letter on Beginning Your Journey',
      milestone: 'Account Created',
      content: `Dear Seeker of Success,

The very fact that you are reading this letter tells me something profound about your character — you possess the desire for self-improvement that separates the extraordinary from the ordinary.

I spent twenty years interviewing over 500 of the most successful individuals of my time, and I discovered one universal truth: Success begins with a BURNING DESIRE. Not a mere wish, but an all-consuming passion that transforms your thoughts into their physical equivalent.

You are about to embark on a journey that will test you. There will be moments when your faith wavers, when temporary defeat feels like permanent failure. But remember this: Every adversity, every failure, every heartache carries with it the seed of an equal or greater benefit.

Your first task is simple but profound: Define your DEFINITE CHIEF AIM. What is it you truly want? Be specific. Be bold. The universe has a way of manifesting that which we hold in our minds with unwavering certainty.

I believe in your potential. Now it is time for you to believe in yourself.

With faith in your success,
Napoleon Hill`
    },
    firstGoal: {
      title: 'On Achieving Your First Goal',
      milestone: 'First Goal Completed',
      content: `Dear Champion,

Congratulations! You have done what 97% of people never do — you set a goal, pursued it with determination, and achieved it.

This victory, however small it may seem, is proof positive that the principles work. Your thoughts, backed by faith and persistence, have manifested into reality. This is not luck or coincidence. This is the universal law of achievement in action.

I want you to understand the significance of this moment: You have just proven to your own subconscious mind that you are capable of achievement. This belief will compound. What seems difficult today will become easy tomorrow.

But heed this warning from one who has studied both success and failure: Do not rest on your laurels. Success is a journey, not a destination. The moment you stop climbing, you begin to slide.

Set your next goal immediately. Make it bigger. Make it bolder. Your capacity for achievement has just expanded.

To your continued success,
Napoleon Hill`
    },
    tenGoals: {
      title: 'A Letter to a True Achiever',
      milestone: '10 Goals Completed',
      content: `Dear Master of Achievement,

Ten goals completed. Ten dreams transformed into reality. Ten mountains climbed.

You have now entered the ranks of the truly exceptional. You have demonstrated not just capability, but consistency — the hallmark of all great achievers.

The Mastermind Principle teaches us that we become the average of those we associate with. By your actions, you have joined an invisible fellowship of achievers throughout history. Carnegie, Edison, Ford — they all walked this same path of relentless goal pursuit.

You are ready for a greater truth: The real treasure is not in the goals achieved, but in the person you have become while achieving them. You have developed faith, persistence, and specialized knowledge. You have transmuted desire into action.

What seemed impossible a year ago now seems merely challenging. This is growth. This is transformation. This is what it means to Think and Grow Rich — not just in wealth, but in character, in ability, in life.

With profound admiration,
Napoleon Hill`
    }
  },
  clear: {
    welcome: {
      title: 'Welcome to the 1% Better Journey',
      milestone: 'Account Created',
      content: `Hey there,

I'm genuinely excited that you're here. Not because this app is special (it's just a tool), but because you've made a decision that most people never make: to intentionally work on yourself.

Here's what I want you to understand from day one: You don't need to make dramatic changes to see dramatic results. The math is simple but profound — if you get 1% better each day for one year, you'll end up 37 times better by the time you're done. Small habits, done consistently, create remarkable results.

Forget about goals for a moment. Instead, focus on this question: "Who do I want to become?" Goals are about the results you want to achieve. Identity is about who you wish to become. And here's the secret: When you change your identity, the behaviors follow naturally.

Every action you take is a vote for the type of person you wish to become. Start casting votes today.

Looking forward to seeing your progress,
James`
    },
    streak7: {
      title: 'On Your 7-Day Streak',
      milestone: '7-Day Habit Streak',
      content: `Hey,

Seven days. In the grand scheme of things, it might not seem like much. But let me tell you what just happened from a neuroscience perspective: You've begun to rewire your brain.

The habit loop — cue, craving, response, reward — has started to form a neural pathway. Each repetition has made that pathway a little stronger, a little more automatic. You're not just building a habit; you're literally changing the structure of your brain.

But here's what I really want you to notice: How did it feel to show up, even on the days you didn't want to? There's a special kind of satisfaction that comes from keeping promises to yourself. That feeling is more valuable than any external reward.

The next seven days will be easier. And the seven after that, easier still. This is the Plateau of Latent Potential — results lag behind effort, but they're coming. Trust the process.

You've got this,
James`
    },
    streak30: {
      title: 'The 30-Day Milestone',
      milestone: '30-Day Habit Streak',
      content: `Congratulations,

Thirty days. You've officially moved past the point where most people give up. You're no longer in the valley of the Plateau of Latent Potential — you're climbing out the other side, where results start to become visible.

What you've demonstrated isn't just discipline (though you have that). You've demonstrated something more important: You've shown that you're the type of person who keeps their commitments. That identity shift is worth more than any single habit.

Here's my challenge to you now: Don't just do the habit. Notice the habit. Notice how you feel before, during, and after. What cues trigger it? What rewards reinforce it? This awareness is what separates someone who has a habit from someone who masters their habits.

You've proven the system works. Now it's time to stack: What new habit could you attach to this one?

Proud of you,
James`
    }
  },
  holiday: {
    welcome: {
      title: 'On Obstacles and Opportunity',
      milestone: 'Account Created',
      content: `Friend,

If you're reading this, you've decided to grow. That decision alone sets you apart. Most people spend their lives waiting for the "right time" or the "right circumstances." The Stoics knew better: There is never a right time. There is only now.

Let me be direct with you: The path you've chosen will not be easy. You will face obstacles. You will encounter setbacks. You will have days when you question why you started at all.

Good.

Because here's what Marcus Aurelius understood two thousand years ago: "The impediment to action advances action. What stands in the way becomes the way." Your obstacles are not blocking your path — they ARE your path.

Every challenge you face is an opportunity in disguise. Every setback carries the seed of an equal or greater advantage. This is not optimism. This is the cold, clear-eyed philosophy that built empires and shaped history.

You have everything you need to begin. Now begin.

With respect,
Ryan Holiday`
    },
    firstObstacle: {
      title: 'On Transforming Your First Obstacle',
      milestone: 'First Obstacle Transformed',
      content: `Well done.

You've just practiced what the ancient Stoics preached: You took an obstacle and transformed it. You didn't complain. You didn't make excuses. You found the opportunity hidden within the adversity.

This is the essence of what I call "The Obstacle Is The Way." It's not a clever phrase — it's a tactical approach to life that has been used by everyone from Marcus Aurelius to Abraham Lincoln to Amelia Earhart.

What you did today — examining your obstacle, reframing it, finding actionable steps — this is a skill. And like any skill, it gets stronger with practice. The next obstacle will be easier to transform. And the one after that, easier still.

Eventually, you'll reach a point where obstacles don't discourage you — they excite you. Because you'll know, with absolute certainty, that within every problem lies the solution, and within every setback lies your next breakthrough.

Keep going,
Ryan Holiday`
    },
    stoicLevel: {
      title: 'On Becoming a Stoic',
      milestone: 'Multiple Obstacles Transformed',
      content: `Practitioner,

You're developing something rare: Stoic resilience. The ability to face adversity not with blind optimism, but with clear-eyed acceptance and strategic action.

The Stoics had a practice called premeditatio malorum — the premeditation of evils. They would deliberately imagine worst-case scenarios, not to be pessimistic, but to be prepared. They understood that fortune is fickle, that life is unpredictable, and that the only thing we truly control is our response.

You've been practicing this. Every obstacle you've transformed has been a lesson in control — not controlling circumstances, but controlling yourself. Your perceptions. Your actions. Your will.

Remember what Epictetus taught: "It's not things that upset us, but our judgments about things." You're learning to judge things differently. You're learning to see obstacles as raw material for growth.

This is the path of the philosopher-warrior. Walk it with pride.

With admiration,
Ryan Holiday`
    }
  }
};

const MentorLetters = ({ token }) => {
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [unlockedLetters, setUnlockedLetters] = useState({});

  useEffect(() => {
    // Load unlocked letters from localStorage
    const saved = localStorage.getItem('unlockedMentorLetters');
    if (saved) {
      setUnlockedLetters(JSON.parse(saved));
    } else {
      // Default: welcome letters are unlocked
      const defaults = {
        hill: ['welcome'],
        clear: ['welcome'],
        holiday: ['welcome']
      };
      setUnlockedLetters(defaults);
      localStorage.setItem('unlockedMentorLetters', JSON.stringify(defaults));
    }
  }, []);

  const getLettersForMentor = (mentorId) => {
    return Object.entries(letterTemplates[mentorId] || {}).map(([key, letter]) => ({
      id: key,
      ...letter,
      unlocked: (unlockedLetters[mentorId] || []).includes(key)
    }));
  };

  const downloadLetter = (mentorName, letter) => {
    const content = `═══════════════════════════════════════════
        LETTER FROM ${mentorName.toUpperCase()}
═══════════════════════════════════════════

${letter.title}
Milestone: ${letter.milestone}

${letter.content}

═══════════════════════════════════════════
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `letter-from-${mentorName.toLowerCase().replace(' ', '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Letter downloaded!');
  };

  if (selectedLetter) {
    return (
      <div className="animate-fade-in-up max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setSelectedLetter(null)}
          className="mb-6 text-gray-400"
        >
          ← Back to Letters
        </Button>

        <Card className="glass border-[#d4a574]/30 p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">
              {mentors.find(m => m.id === selectedMentor)?.avatar}
            </div>
            <h2 className="text-2xl font-bold text-white">{selectedLetter.title}</h2>
            <p className="text-sm text-[#d4a574] mt-2">
              From {mentors.find(m => m.id === selectedMentor)?.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Unlocked at: {selectedLetter.milestone}
            </p>
          </div>

          <div className="prose prose-invert max-w-none">
            <div className="bg-[#1a1625]/50 rounded-xl p-6 border border-[#d4a574]/10">
              <p className="text-gray-200 whitespace-pre-wrap leading-relaxed font-serif">
                {selectedLetter.content}
              </p>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <Button
              onClick={() => downloadLetter(
                mentors.find(m => m.id === selectedMentor)?.name,
                selectedLetter
              )}
              variant="outline"
              className="border-[#d4a574]/30"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Letter
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (selectedMentor) {
    const mentor = mentors.find(m => m.id === selectedMentor);
    const letters = getLettersForMentor(selectedMentor);

    return (
      <div className="animate-fade-in-up">
        <Button
          variant="ghost"
          onClick={() => setSelectedMentor(null)}
          className="mb-6 text-gray-400"
        >
          ← Back to Mentors
        </Button>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{mentor.avatar}</div>
          <h2 className="text-3xl font-bold text-white">{mentor.name}</h2>
          <p className="text-gray-400">{mentor.title}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {letters.map((letter) => (
            <Card
              key={letter.id}
              className={`glass p-6 transition-all ${
                letter.unlocked 
                  ? 'border-[#d4a574]/30 hover:border-[#d4a574]/50 cursor-pointer hover:scale-[1.02]'
                  : 'border-gray-800 opacity-60'
              }`}
              onClick={() => letter.unlocked && setSelectedLetter(letter)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${mentor.color}/20`}>
                  <Mail className="w-6 h-6 text-white" />
                </div>
                {letter.unlocked ? (
                  <Unlock className="w-5 h-5 text-green-500" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-600" />
                )}
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{letter.title}</h3>
              <p className="text-sm text-gray-500 mb-4">
                Milestone: {letter.milestone}
              </p>

              {letter.unlocked ? (
                <div className="flex items-center text-[#d4a574] text-sm">
                  Read Letter <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">
                  Complete the milestone to unlock
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center gap-3">
          <Mail className="text-[#d4a574]" />
          Mentor Letters
        </h1>
        <p className="text-gray-400 max-w-2xl">
          Personal letters from the masters themselves, written as if responding to YOUR specific journey.
          Unlock new letters as you reach milestones.
        </p>
      </div>

      {/* Mentor Selection */}
      <div className="grid md:grid-cols-3 gap-6">
        {mentors.map((mentor) => {
          const letters = getLettersForMentor(mentor.id);
          const unlockedCount = letters.filter(l => l.unlocked).length;

          return (
            <Card
              key={mentor.id}
              className="glass border-[#d4a574]/20 p-6 cursor-pointer hover:border-[#d4a574]/50 transition-all hover:scale-[1.02]"
              onClick={() => setSelectedMentor(mentor.id)}
            >
              <div className="text-center">
                <div className="text-5xl mb-4">{mentor.avatar}</div>
                <h3 className="text-xl font-bold text-white mb-1">{mentor.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{mentor.title}</p>
                
                <div className="flex items-center justify-center gap-2 text-[#d4a574]">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">
                    {unlockedCount} / {letters.length} letters unlocked
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Info */}
      <Card className="glass border-[#d4a574]/20 p-6 mt-8">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#d4a574]" />
          How Mentor Letters Work
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-black/20 rounded-lg text-center">
            <Trophy className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-sm text-white font-medium">Reach Milestones</p>
            <p className="text-xs text-gray-400">Complete goals, build streaks, transform obstacles</p>
          </div>
          <div className="p-4 bg-black/20 rounded-lg text-center">
            <Unlock className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <p className="text-sm text-white font-medium">Unlock Letters</p>
            <p className="text-xs text-gray-400">New letters become available at each milestone</p>
          </div>
          <div className="p-4 bg-black/20 rounded-lg text-center">
            <Sparkles className="w-8 h-8 mx-auto text-purple-500 mb-2" />
            <p className="text-sm text-white font-medium">Receive Wisdom</p>
            <p className="text-xs text-gray-400">Personalized advice from the masters themselves</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MentorLetters;
