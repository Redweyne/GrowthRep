import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Quote, Lightbulb, Target, Brain, Heart, Flame, Shield, Clock, Eye, Mountain, Layers, Sun, Skull, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const philosophyContent = {
  goals: {
    title: "The Philosophy Behind Goal Setting",
    subtitle: "Why defining your destination determines your destiny",
    icon: Target,
    color: "from-blue-500 to-cyan-500",
    intro: "Goal setting is not merely writing down wishes. It is the first step in transforming the invisible into the visible. Every achievement that humanity has ever accomplished began as a thought, crystallized into a goal.",
    sections: [
      {
        title: "Napoleon Hill on Definite Purpose",
        icon: Flame,
        quotes: [
          {
            text: "There is one quality which one must possess to win, and that is definiteness of purpose, the knowledge of what one wants, and a burning desire to possess it.",
            source: "Think and Grow Rich, Chapter 2"
          },
          {
            text: "A goal is a dream with a deadline.",
            source: "Napoleon Hill"
          },
          {
            text: "Set your mind on a definite goal and observe how quickly the world stands aside to let you pass.",
            source: "Think and Grow Rich"
          }
        ],
        explanation: "Hill discovered that every person who accumulated massive fortune did so by first fixing in their mind the exact amount they desired. Vagueness produces vague results. When you define your goal with precision, your subconscious mind begins working toward it even when your conscious mind is occupied elsewhere."
      },
      {
        title: "James Clear on Systems vs. Goals",
        icon: Layers,
        quotes: [
          {
            text: "You do not rise to the level of your goals. You fall to the level of your systems.",
            source: "Atomic Habits, Chapter 1"
          },
          {
            text: "Goals are good for setting a direction, but systems are best for making progress.",
            source: "Atomic Habits"
          },
          {
            text: "The purpose of setting goals is to win the game. The purpose of building systems is to continue playing the game.",
            source: "Atomic Habits, Chapter 1"
          }
        ],
        explanation: "Clear's insight revolutionized how we think about goals. While goals give direction, they can also create a yo-yo effect where you work hard, achieve, then slip back. Systems—daily habits and processes—ensure continuous improvement regardless of whether you hit specific targets."
      },
      {
        title: "The Stoic Perspective",
        icon: Shield,
        quotes: [
          {
            text: "If a man knows not to which port he sails, no wind is favorable.",
            source: "Seneca, Letters from a Stoic"
          },
          {
            text: "First say to yourself what you would be; and then do what you have to do.",
            source: "Epictetus, Discourses"
          }
        ],
        explanation: "The Stoics understood that while we cannot control outcomes, we can control our efforts. They advocated setting intentions while remaining unattached to specific results—working toward goals with full commitment while accepting whatever comes."
      }
    ],
    actionSteps: [
      "Write your goal as if it has already been achieved",
      "Attach a specific deadline to transform a dream into a goal",
      "Identify the ONE habit that would make achieving this goal inevitable",
      "Review your goal daily—the first 10 minutes of your day belong to your definite purpose"
    ],
    closingThought: "Your goals are not wishes to be granted by some external force. They are instructions to your own psyche about who you are becoming. Write them with the weight they deserve."
  },

  habits: {
    title: "Why Habits Shape Your Destiny",
    subtitle: "The invisible architecture of your future self",
    icon: Brain,
    color: "from-purple-500 to-pink-500",
    intro: "You are not what you do once. You are what you do repeatedly. Every action you take is a vote for the type of person you wish to become. Habits are the compound interest of self-improvement.",
    sections: [
      {
        title: "James Clear on Identity-Based Habits",
        icon: Brain,
        quotes: [
          {
            text: "Every action you take is a vote for the type of person you wish to become. No single instance will transform your beliefs, but as the votes build up, so does the evidence of your new identity.",
            source: "Atomic Habits, Chapter 2"
          },
          {
            text: "The most practical way to change who you are is to change what you do.",
            source: "Atomic Habits"
          },
          {
            text: "Habits are the compound interest of self-improvement. The same way that money multiplies through compound interest, the effects of your habits multiply as you repeat them.",
            source: "Atomic Habits, Introduction"
          }
        ],
        explanation: "Clear's breakthrough insight is that lasting change comes from identity change, not outcome change. Instead of 'I want to lose weight,' you declare 'I am a healthy person.' Then every healthy choice becomes evidence supporting your new identity. The goal is not to read a book—it's to become a reader."
      },
      {
        title: "Napoleon Hill on Auto-Suggestion",
        icon: Flame,
        quotes: [
          {
            text: "Any idea, plan, or purpose may be placed in the mind through repetition of thought.",
            source: "Think and Grow Rich, Chapter 4"
          },
          {
            text: "Your subconscious mind recognizes and acts only upon thoughts which have been well-mixed with emotion or feeling.",
            source: "Think and Grow Rich"
          }
        ],
        explanation: "Hill understood what modern neuroscience confirms: repeated thoughts become neural pathways, and neural pathways become automatic behaviors. Your habits are literally rewiring your brain. This is why consistency trumps intensity—it's not about one heroic effort but about showing up daily."
      },
      {
        title: "The Stoic View on Daily Practice",
        icon: Shield,
        quotes: [
          {
            text: "No man is free who is not master of himself.",
            source: "Epictetus"
          },
          {
            text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
            source: "Aristotle (often quoted by Stoics)"
          }
        ],
        explanation: "The Stoics practiced daily exercises in virtue—journaling, reflection, preparation for adversity. They understood that character is not formed in a moment but through consistent practice. Your habits are your character in action."
      }
    ],
    actionSteps: [
      "Ask yourself: 'What would a [healthy/successful/disciplined] person do?' before each decision",
      "Never miss twice—if you skip a habit once, return immediately the next day",
      "Stack new habits onto existing ones: 'After I [current habit], I will [new habit]'",
      "Make it obvious, attractive, easy, and satisfying (Clear's Four Laws)"
    ],
    closingThought: "You don't have to become a different person. You have to become the person you already are—but haven't allowed yourself to be. Your habits will either build or erode that person. Choose wisely."
  },

  journal: {
    title: "The Power of Written Reflection",
    subtitle: "How putting pen to paper transforms your mind",
    icon: BookOpen,
    color: "from-emerald-500 to-teal-500",
    intro: "Journaling is not mere record-keeping. It is the practice of conducting a deep investigation into your own mind. When you write, you think more clearly. When you think more clearly, you act more wisely.",
    sections: [
      {
        title: "The Stoic Practice of Self-Examination",
        icon: Shield,
        quotes: [
          {
            text: "I will keep constant watch over myself and—most usefully—will put each day up for review. For this is what makes us evil—that none of us looks back upon our own lives. We reflect upon only that which we are about to do.",
            source: "Seneca, On Anger"
          },
          {
            text: "Begin each day by telling yourself: Today I shall be meeting with interference, ingratitude, insolence, disloyalty, ill-will, and selfishness.",
            source: "Marcus Aurelius, Meditations"
          },
          {
            text: "When you arise in the morning, think of what a precious privilege it is to be alive—to breathe, to think, to enjoy, to love.",
            source: "Marcus Aurelius"
          }
        ],
        explanation: "Marcus Aurelius, one of Rome's greatest emperors, wrote his 'Meditations' as a private journal never meant for publication. This daily practice of self-examination was central to Stoic philosophy. By reviewing each day, you transform experience into wisdom."
      },
      {
        title: "Napoleon Hill on Auto-Suggestion Through Writing",
        icon: Flame,
        quotes: [
          {
            text: "Write out a clear, concise statement of what you intend to acquire, and read it aloud twice daily.",
            source: "Think and Grow Rich, Chapter 4"
          },
          {
            text: "The written word has the effect of deepening thought and clarifying purpose.",
            source: "Napoleon Hill"
          }
        ],
        explanation: "Hill prescribed writing as a tool for programming the subconscious mind. The act of writing forces clarity—you cannot write vaguely what you think clearly. Writing your goals and reflections daily creates a feedback loop that accelerates achievement."
      },
      {
        title: "Modern Science on Journaling",
        icon: Brain,
        quotes: [
          {
            text: "Writing about emotional experiences has been found to significantly improve physical and psychological health.",
            source: "James Pennebaker, Writing to Heal"
          }
        ],
        explanation: "Research shows that expressive writing reduces stress, improves immune function, and helps process trauma. When you write about your experiences, you're not just recording—you're processing, integrating, and finding meaning. Gratitude journaling specifically has been shown to increase happiness and life satisfaction."
      }
    ],
    actionSteps: [
      "Morning: Write your intentions and how you want to show up today",
      "Evening: Review your day—what went well, what could improve, what you learned",
      "Write three things you're grateful for—be specific, not generic",
      "When facing a difficult decision, write out both sides—clarity emerges through ink"
    ],
    closingThought: "Your journal is a mirror for your mind and a conversation with your future self. The pages you fill today become the wisdom you draw upon tomorrow."
  },

  visionBoard: {
    title: "Why Visualization Transforms Reality",
    subtitle: "The science and philosophy of seeing before achieving",
    icon: Eye,
    color: "from-pink-500 to-rose-500",
    intro: "Visualization is not wishful thinking—it is mental rehearsal. Every building that exists was first imagined. Every achievement began as a picture in someone's mind. Your vision board is not decoration; it is architecture for your future.",
    sections: [
      {
        title: "Napoleon Hill on the Power of Imagination",
        icon: Flame,
        quotes: [
          {
            text: "Whatever the mind can conceive and believe, it can achieve.",
            source: "Think and Grow Rich"
          },
          {
            text: "The imagination is literally the workshop wherein are fashioned all plans created by man.",
            source: "Think and Grow Rich, Chapter 6"
          },
          {
            text: "First comes thought; then organization of that thought into ideas and plans; then transformation of those plans into reality.",
            source: "Think and Grow Rich"
          }
        ],
        explanation: "Hill placed imagination at the center of achievement. He distinguished between 'synthetic imagination' (combining existing ideas) and 'creative imagination' (receiving hunches and inspiration). Your vision board activates both—combining images of what exists with your unique vision of what could be."
      },
      {
        title: "The Neuroscience of Visualization",
        icon: Brain,
        quotes: [
          {
            text: "The brain cannot distinguish between something real and something vividly imagined.",
            source: "Modern Neuroscience Research"
          }
        ],
        explanation: "When you visualize an action, your brain activates many of the same neural networks as when you physically perform it. Athletes have used visualization for decades because mental practice creates real neural pathways. Your vision board provides daily visual cues that trigger these same processes."
      },
      {
        title: "The Stoic Perspective on Vision",
        icon: Shield,
        quotes: [
          {
            text: "If you don't know what port you're sailing to, no wind is favorable.",
            source: "Seneca"
          },
          {
            text: "First say to yourself what you would be; and then do what you have to do.",
            source: "Epictetus"
          }
        ],
        explanation: "While Stoics cautioned against attachment to outcomes, they strongly advocated for clear vision. Knowing what you're working toward isn't attachment—it's direction. Your vision board clarifies that direction while your Stoic practice keeps you unattached to the specific timeline."
      }
    ],
    actionSteps: [
      "Review your vision board daily—ideally first thing in the morning",
      "Don't just look—feel. Imagine yourself already living that reality",
      "Include images for all areas: health, relationships, career, personal growth",
      "Update your board as you evolve—your vision should grow with you"
    ],
    closingThought: "You are always visualizing something—either what you want or what you fear. Your vision board ensures you're directing that power toward what you desire."
  },

  aiCoach: {
    title: "The Science of Mentorship",
    subtitle: "Why guidance accelerates transformation",
    icon: Lightbulb,
    color: "from-amber-500 to-orange-500",
    intro: "No one achieves greatness alone. Behind every transformation is guidance—a mentor who sees what we cannot yet see in ourselves, who holds us to standards we would not hold ourselves to, who has walked the path we seek to walk.",
    sections: [
      {
        title: "Napoleon Hill on the Mastermind",
        icon: Flame,
        quotes: [
          {
            text: "The 'Master Mind' may be defined as coordination of knowledge and effort, in a spirit of harmony, between two or more people, for the attainment of a definite purpose.",
            source: "Think and Grow Rich, Chapter 10"
          },
          {
            text: "No two minds ever come together without thereby creating a third, invisible intangible force, which may be likened to a third mind.",
            source: "Think and Grow Rich"
          }
        ],
        explanation: "Hill discovered that Andrew Carnegie attributed his entire fortune to the Mastermind principle. When you engage with a coach—even an AI trained on the wisdom of masters—you create a dialogue that produces insights neither party would reach alone."
      },
      {
        title: "The Socratic Method",
        icon: Brain,
        quotes: [
          {
            text: "I cannot teach anybody anything. I can only make them think.",
            source: "Socrates"
          },
          {
            text: "The unexamined life is not worth living.",
            source: "Socrates, in Plato's Apology"
          }
        ],
        explanation: "The greatest teacher in Western history didn't lecture—he questioned. The AI Coach follows this tradition, asking questions that force you to examine your own thinking, challenge your assumptions, and discover answers that were within you all along."
      },
      {
        title: "Ryan Holiday on Mentorship",
        icon: Shield,
        quotes: [
          {
            text: "A good mentor is like a good book—they introduce you to ideas and perspectives you would never have found on your own.",
            source: "Ryan Holiday"
          }
        ],
        explanation: "Holiday emphasizes that mentors don't just provide answers—they expand your frame of reference. They see blind spots you cannot see because they've already navigated where you're trying to go."
      }
    ],
    actionSteps: [
      "Come to your coaching sessions with specific challenges, not vague complaints",
      "Be radically honest—the coach can only help with what you reveal",
      "Implement advice before seeking more advice",
      "Use different mentor personalities for different challenges"
    ],
    closingThought: "A coach holds up a mirror and shows you not who you are, but who you are capable of becoming. This app's AI Coach embodies the wisdom of the greatest teachers in history—Hill, Clear, and Holiday. Use them."
  },

  analytics: {
    title: "Why Tracking Changes Everything",
    subtitle: "The power of measurement in personal transformation",
    icon: Target,
    color: "from-cyan-500 to-blue-500",
    intro: "What gets measured gets managed. What gets managed gets improved. Your analytics are not just numbers—they are the story of your transformation, told in data. They reveal patterns your conscious mind would miss.",
    sections: [
      {
        title: "James Clear on Measurement",
        icon: Layers,
        quotes: [
          {
            text: "You don't realize how much you eat until you track your calories. You don't realize how little you move until you track your steps. Tracking brings awareness.",
            source: "Atomic Habits"
          },
          {
            text: "Habit tracking is powerful because it leverages multiple Laws of Behavior Change. It simultaneously makes a behavior obvious, attractive, and satisfying.",
            source: "Atomic Habits, Chapter 16"
          }
        ],
        explanation: "Clear identifies tracking as a 'keystone habit'—one behavior that creates a cascade of positive effects. When you track, you create accountability. You make the invisible visible. You turn vague feelings into concrete data."
      },
      {
        title: "The Hawthorne Effect",
        icon: Brain,
        quotes: [
          {
            text: "The act of observation changes the behavior being observed.",
            source: "Psychological Research"
          }
        ],
        explanation: "Studies show that people perform better when they know they're being measured—even when they're measuring themselves. Your analytics page creates this effect: by observing your own behavior, you naturally improve it."
      },
      {
        title: "Peter Drucker on Measurement",
        icon: Target,
        quotes: [
          {
            text: "What gets measured gets managed.",
            source: "Peter Drucker"
          },
          {
            text: "If you can't measure it, you can't improve it.",
            source: "Peter Drucker"
          }
        ],
        explanation: "The father of modern management understood that measurement creates focus. Without data, improvement is guesswork. With data, it becomes systematic."
      }
    ],
    actionSteps: [
      "Review your analytics weekly—look for patterns, not just numbers",
      "Identify one metric to focus on improving this month",
      "Celebrate streaks and progress—let the data motivate you",
      "Use low points as data for improvement, not evidence of failure"
    ],
    closingThought: "Your analytics tell the truth when your feelings lie. On days when you feel like you're making no progress, let the data remind you how far you've come."
  },

  rituals: {
    title: "Why Rituals Create Transformation",
    subtitle: "The sacred power of intentional practice",
    icon: Clock,
    color: "from-violet-500 to-purple-500",
    intro: "A ritual is more than a routine. A routine is something you do. A ritual is something that transforms you in the doing. Every great culture has understood that deliberate, repeated practices shape the soul.",
    sections: [
      {
        title: "The Stoic Morning Ritual",
        icon: Shield,
        quotes: [
          {
            text: "When you arise in the morning, think of what a precious privilege it is to be alive—to breathe, to think, to enjoy, to love.",
            source: "Marcus Aurelius, Meditations"
          },
          {
            text: "Begin each day by telling yourself: Today I shall be meeting with interference, ingratitude, insolence, disloyalty, ill-will, and selfishness—all of them due to the offenders' ignorance of what is good or evil.",
            source: "Marcus Aurelius, Meditations, Book II"
          }
        ],
        explanation: "Marcus Aurelius began each day with deliberate mental preparation. He didn't hope for a good day—he prepared for a challenging one. This morning ritual of 'premeditatio malorum' (premeditation of evils) freed him from being disturbed by inevitable difficulties."
      },
      {
        title: "Napoleon Hill's Six Steps",
        icon: Flame,
        quotes: [
          {
            text: "Read your written statement aloud, twice daily, once just before retiring at night, and once after arising in the morning.",
            source: "Think and Grow Rich, Chapter 2"
          }
        ],
        explanation: "Hill prescribed a twice-daily ritual of reading your definite purpose statement with emotion and faith. This wasn't mere repetition—it was programming the subconscious mind through ritualized practice."
      },
      {
        title: "James Clear on Habit Rituals",
        icon: Layers,
        quotes: [
          {
            text: "Create a ritual. A ritual is a series of behaviors you perform before a specific habit. It's a trigger that gets you into the mood to perform the habit.",
            source: "Atomic Habits"
          }
        ],
        explanation: "Clear distinguishes between habits and rituals. A habit is automatic; a ritual is intentional. Rituals create the conditions for habits to flourish. Your morning and evening rituals are the bookends that hold your day together."
      }
    ],
    actionSteps: [
      "Design a morning ritual that sets your intention for the day",
      "Create an evening ritual that processes the day and prepares for rest",
      "Include elements of gratitude, visualization, and planning",
      "Protect your ritual times as sacred—they are not negotiable"
    ],
    closingThought: "Your rituals are the moments when you deliberately sculpt your character. Everyone else is on autopilot. You are awake."
  },

  wisdom: {
    title: "The Power of Ancient Wisdom",
    subtitle: "Why timeless truths transform modern lives",
    icon: BookOpen,
    color: "from-amber-500 to-yellow-500",
    intro: "The challenges you face are not new. For thousands of years, the wisest humans have grappled with the same questions: How do I live well? How do I overcome obstacles? How do I become who I'm capable of becoming? Their answers await you.",
    sections: [
      {
        title: "Standing on the Shoulders of Giants",
        icon: Mountain,
        quotes: [
          {
            text: "If I have seen further, it is by standing on the shoulders of giants.",
            source: "Isaac Newton"
          },
          {
            text: "Those who cannot remember the past are condemned to repeat it.",
            source: "George Santayana"
          }
        ],
        explanation: "Every generation faces similar fundamental challenges. The difference between those who thrive and those who merely survive is often access to accumulated wisdom. The insights that took Seneca a lifetime to learn are available to you in an afternoon."
      },
      {
        title: "The Stoic Wisdom Tradition",
        icon: Shield,
        quotes: [
          {
            text: "We should hunt out the helpful pieces of teaching, and the spirited and noble-minded sayings which are capable of immediate practical application—not far-fetched or archaic expressions—and learn them so well that words become works.",
            source: "Seneca, Letters from a Stoic"
          },
          {
            text: "Don't explain your philosophy. Embody it.",
            source: "Epictetus"
          }
        ],
        explanation: "The Stoics didn't collect wisdom as intellectual exercise—they practiced it. They memorized quotes not to sound smart but to have them ready when needed. A quote at the right moment can change everything."
      },
      {
        title: "Napoleon Hill on Applied Knowledge",
        icon: Flame,
        quotes: [
          {
            text: "Knowledge will not attract money, unless it is organized, and intelligently directed, through practical plans of action, to the definite end of accumulation of money.",
            source: "Think and Grow Rich, Chapter 5"
          },
          {
            text: "An educated man is not, necessarily, one who has an abundance of general or specialized knowledge. An educated man is one who has so developed the faculties of his mind that he may acquire anything he wants.",
            source: "Think and Grow Rich"
          }
        ],
        explanation: "Hill distinguished between general knowledge and applied knowledge. The quotes and wisdom in this library are valuable only when applied. Read not to know more, but to act differently."
      }
    ],
    actionSteps: [
      "Choose one quote each day and contemplate its meaning for your life",
      "When facing a challenge, search for wisdom on that specific topic",
      "Save quotes that resonate deeply—build your personal wisdom collection",
      "Test ancient wisdom against your modern experience"
    ],
    closingThought: "You have access to the accumulated wisdom of humanity's greatest minds. The only question is: will you use it?"
  },

  burningDesire: {
    title: "Napoleon Hill's Secret to Achievement",
    subtitle: "Why desire is the starting point of all achievement",
    icon: Flame,
    color: "from-red-500 to-orange-500",
    intro: "There is a difference between wishing for a thing and being ready to receive it. No one is ready for a thing until they believe they can acquire it. The state of mind must be BELIEF, not mere hope or wish. This burning desire is the starting point of all achievement.",
    sections: [
      {
        title: "The Six Steps to Transmute Desire into Gold",
        icon: Flame,
        quotes: [
          {
            text: "The starting point of all achievement is DESIRE. Keep this constantly in mind. Weak desire brings weak results, just as a small fire makes a small amount of heat.",
            source: "Think and Grow Rich, Chapter 2"
          },
          {
            text: "There is one quality which one must possess to win, and that is definiteness of purpose, the knowledge of what one wants, and a burning desire to possess it.",
            source: "Think and Grow Rich"
          },
          {
            text: "When your desires are strong enough, you will appear to possess superhuman powers to achieve.",
            source: "Napoleon Hill"
          }
        ],
        explanation: "Hill's research of 500+ successful people revealed that every single one possessed a burning, obsessive desire for their goal. Not a wish. Not a hope. An all-consuming, bridge-burning, definiteness of purpose that made failure unthinkable."
      },
      {
        title: "The Story of Edwin Barnes",
        icon: Target,
        quotes: [
          {
            text: "Barnes succeeded because he chose a definite goal, placed all his energy, all his willpower, all his effort, everything back of that goal.",
            source: "Think and Grow Rich, Chapter 1"
          }
        ],
        explanation: "Edwin Barnes arrived at Thomas Edison's laboratory with nothing but the burning desire to become Edison's business associate. He started as a lowly worker, but his desire was so intense that when opportunity came, he was ready. He became Edison's partner and made millions. His desire made it inevitable."
      },
      {
        title: "Burning Ships",
        icon: Shield,
        quotes: [
          {
            text: "Every person who wins in any undertaking must be willing to burn his ships and cut all sources of retreat. Only by so doing can one be sure of maintaining that state of mind known as a BURNING DESIRE TO WIN, essential to success.",
            source: "Think and Grow Rich, Chapter 2"
          }
        ],
        explanation: "The ancient warriors who burned their ships after landing knew a psychological truth: when retreat is impossible, victory becomes the only option. Your burning desire must be so strong that giving up is not an option you can consider."
      }
    ],
    actionSteps: [
      "Write your burning desire in specific, concrete terms",
      "Read it aloud twice daily with EMOTION—not mechanically",
      "Visualize already having achieved it—feel the feelings",
      "Make the decision that failure is not an option"
    ],
    closingThought: "The intensity of your desire determines the speed of your achievement. Is your fire a spark, or is it a furnace? Only you can decide."
  },

  identity: {
    title: "Why Identity Drives Behavior",
    subtitle: "The revolutionary insight that transforms lasting change",
    icon: Heart,
    color: "from-rose-500 to-pink-500",
    intro: "You do not rise to the level of your goals. You fall to the level of your identity. Every action you take is a vote for the type of person you wish to become. Real change is identity change.",
    sections: [
      {
        title: "James Clear's Identity-Based Habits",
        icon: Layers,
        quotes: [
          {
            text: "The ultimate form of intrinsic motivation is when a habit becomes part of your identity. It's one thing to say I'm the type of person who wants this. It's something very different to say I'm the type of person who is this.",
            source: "Atomic Habits, Chapter 2"
          },
          {
            text: "True behavior change is identity change. You might start a habit because of motivation, but the only reason you'll stick with one is that it becomes part of your identity.",
            source: "Atomic Habits"
          },
          {
            text: "The goal is not to read a book, the goal is to become a reader. The goal is not to run a marathon, the goal is to become a runner.",
            source: "Atomic Habits, Chapter 2"
          }
        ],
        explanation: "Clear's insight revolutionizes behavior change. Most people focus on outcomes (I want to lose 20 pounds) or processes (I want to go to the gym). But the most effective approach focuses on identity: I am a healthy person. When your identity shifts, behaviors follow naturally."
      },
      {
        title: "The Two-Step Process",
        icon: Brain,
        quotes: [
          {
            text: "1. Decide the type of person you want to be. 2. Prove it to yourself with small wins.",
            source: "James Clear, Atomic Habits"
          },
          {
            text: "Every action you take is a vote for the type of person you wish to become.",
            source: "Atomic Habits"
          }
        ],
        explanation: "Identity change isn't about massive transformations. It's about accumulating votes. Each time you choose the salad over the burger, you cast a vote for 'healthy person.' Each time you write a page, you vote for 'writer.' Enough votes and the election is won."
      },
      {
        title: "The Stoic Self",
        icon: Shield,
        quotes: [
          {
            text: "Waste no more time arguing about what a good man should be. Be one.",
            source: "Marcus Aurelius, Meditations"
          },
          {
            text: "Man is not worried by real problems so much as by his imagined anxieties about real problems.",
            source: "Epictetus"
          }
        ],
        explanation: "The Stoics understood that we become what we practice. Your identity is not fixed—it is forged through daily choices. You are not discovering who you are; you are deciding who you become."
      }
    ],
    actionSteps: [
      "Define your identity in 3-5 'I am' statements",
      "Before each decision, ask 'What would [identity] do?'",
      "Track evidence that supports your new identity",
      "Celebrate small wins as votes for your new self"
    ],
    closingThought: "You are not stuck with the identity you were born into or the identity others assigned you. Every moment is a chance to cast a new vote for who you want to become."
  },

  obstacle: {
    title: "The Stoic Art of Obstacle Transformation",
    subtitle: "Why the impediment to action advances action",
    icon: Mountain,
    color: "from-slate-500 to-zinc-500",
    intro: "The obstacle in the path becomes the path. What stands in the way becomes the way. This is not positive thinking—it is the profound Stoic insight that has enabled humans to triumph over adversity for two thousand years.",
    sections: [
      {
        title: "Marcus Aurelius on Obstacles",
        icon: Shield,
        quotes: [
          {
            text: "The impediment to action advances action. What stands in the way becomes the way.",
            source: "Marcus Aurelius, Meditations"
          },
          {
            text: "Our actions may be impeded... but there can be no impeding our intentions or dispositions. Because we can accommodate and adapt. The mind adapts and converts to its own purposes the obstacle to our acting.",
            source: "Meditations, Book V"
          },
          {
            text: "Choose not to be harmed—and you won't feel harmed. Don't feel harmed—and you haven't been.",
            source: "Meditations, Book IV"
          }
        ],
        explanation: "Marcus Aurelius, facing plagues, wars, betrayal, and the burden of ruling Rome, developed this insight: obstacles are not separate from the path—they ARE the path. Every problem carries within it the seeds of opportunity and growth."
      },
      {
        title: "Ryan Holiday's Framework",
        icon: Target,
        quotes: [
          {
            text: "There is good in everything, if only we look for it.",
            source: "The Obstacle Is The Way"
          },
          {
            text: "What blocks the path now is a path. Never forget that within every obstacle is an opportunity to improve our condition.",
            source: "The Obstacle Is The Way"
          },
          {
            text: "We decide what story to tell ourselves. Or whether we will tell one at all.",
            source: "The Obstacle Is The Way"
          }
        ],
        explanation: "Holiday distilled Stoic wisdom into a practical framework: Perception (how we see the obstacle), Action (how we act on it), and Will (how we endure if action fails). Master these three disciplines and no obstacle can defeat you."
      },
      {
        title: "The Three Disciplines",
        icon: Brain,
        quotes: [
          {
            text: "Objective judgment, now at this very moment. Unselfish action, now at this very moment. Willing acceptance—now at this very moment—of all external events.",
            source: "Marcus Aurelius"
          }
        ],
        explanation: "Perception: See the obstacle clearly, without fear or emotion clouding judgment. Action: Take focused, persistent action on what is within your control. Will: Accept what you cannot change while persisting in what you can. This triad is unbeatable."
      }
    ],
    actionSteps: [
      "Write down your current obstacle in objective, factual terms",
      "List three ways this obstacle could actually help you",
      "Identify what is within your control and focus only there",
      "Ask: 'How can I use this obstacle to become stronger?'"
    ],
    closingThought: "You don't overcome obstacles—you transform them into opportunities. The obstacle was never blocking your path. It was revealing your path."
  },

  habitStacking: {
    title: "James Clear's Compound Effect",
    subtitle: "How tiny changes create remarkable results",
    icon: Layers,
    color: "from-green-500 to-emerald-500",
    intro: "If you can get 1 percent better each day for one year, you'll end up thirty-seven times better by the time you're done. Conversely, if you get 1 percent worse each day for one year, you'll decline nearly down to zero. What starts as a small win or a minor setback accumulates into something much more.",
    sections: [
      {
        title: "The Mathematics of Improvement",
        icon: Layers,
        quotes: [
          {
            text: "Habits are the compound interest of self-improvement. The same way that money multiplies through compound interest, the effects of your habits multiply as you repeat them.",
            source: "Atomic Habits, Introduction"
          },
          {
            text: "1% better every day: 1.01^365 = 37.78. 1% worse every day: 0.99^365 = 0.03.",
            source: "Atomic Habits"
          },
          {
            text: "Success is the product of daily habits—not once-in-a-lifetime transformations.",
            source: "Atomic Habits"
          }
        ],
        explanation: "The math is irrefutable. Tiny gains compound exponentially. This is why habits matter more than heroic efforts. A single 1% improvement is negligible. A year of 1% improvements is transformational."
      },
      {
        title: "Habit Stacking Formula",
        icon: Brain,
        quotes: [
          {
            text: "After I [CURRENT HABIT], I will [NEW HABIT].",
            source: "Atomic Habits, Chapter 5"
          },
          {
            text: "The habit stacking formula creates a set of simple rules that guide your future behavior. It's like you always have a game plan for which action should come next.",
            source: "Atomic Habits"
          }
        ],
        explanation: "Habit stacking works by linking new behaviors to existing ones. Your current habits are already wired into your brain—they're neural pathways with strong connections. By attaching new habits to existing ones, you leverage that existing infrastructure."
      },
      {
        title: "The Plateau of Latent Potential",
        icon: Target,
        quotes: [
          {
            text: "Breakthrough moments are often the result of many previous actions, which build up the potential required to unleash a major change.",
            source: "Atomic Habits"
          },
          {
            text: "If you find yourself struggling to build a good habit or break a bad one, it is not because you have lost your ability to improve. It is often because you have not yet crossed the Plateau of Latent Potential.",
            source: "Atomic Habits, Chapter 1"
          }
        ],
        explanation: "This is why people quit: they expect linear progress but get no visible results for weeks. The ice cube doesn't melt at 31 degrees, 30 degrees, or even 32 degrees. But at 33 degrees, it melts. All that heating wasn't wasted—it was accumulating potential."
      }
    ],
    actionSteps: [
      "List your existing daily habits (wake up, brush teeth, pour coffee, etc.)",
      "Identify new habits you want to build",
      "Stack each new habit after an existing one",
      "Start incredibly small—2 minutes or less for new habits"
    ],
    closingThought: "You don't need to revolutionize your life overnight. You need to get 1% better today, and then again tomorrow, and then again. Trust the compound effect."
  },

  morning: {
    title: "Why Morning Routines Matter",
    subtitle: "Win the morning, win the day",
    icon: Sun,
    color: "from-yellow-500 to-amber-500",
    intro: "How you start your day determines how you live your day. And how you live your days is how you live your life. The morning is the rudder that steers the ship of your day. Control it, and you control everything that follows.",
    sections: [
      {
        title: "Napoleon Hill's Morning Practice",
        icon: Flame,
        quotes: [
          {
            text: "Read your written statement aloud, twice daily, once just before retiring at night, and once after arising in the morning.",
            source: "Think and Grow Rich, Chapter 2"
          },
          {
            text: "Set your mind on a definite goal and observe how quickly the world stands aside to let you pass.",
            source: "Think and Grow Rich"
          }
        ],
        explanation: "Hill prescribed a morning ritual of reading your purpose statement with emotion. The first thoughts of your day program your subconscious mind for everything that follows. Start with intention, and intention follows you."
      },
      {
        title: "The Stoic Morning",
        icon: Shield,
        quotes: [
          {
            text: "When you arise in the morning, think of what a precious privilege it is to be alive—to breathe, to think, to enjoy, to love.",
            source: "Marcus Aurelius"
          },
          {
            text: "Begin each day by telling yourself: Today I shall be meeting with interference, ingratitude, insolence, disloyalty, ill-will, and selfishness.",
            source: "Meditations, Book II"
          }
        ],
        explanation: "The Stoics practiced morning preparation not to be pessimistic, but to be unshakeable. By anticipating difficulties, they removed their power to disturb. Nothing could catch them off guard because they had already faced it mentally."
      },
      {
        title: "Modern Research on Mornings",
        icon: Brain,
        quotes: [
          {
            text: "Willpower is highest in the morning and depletes throughout the day.",
            source: "Psychological Research"
          }
        ],
        explanation: "Research confirms what high performers have known intuitively: willpower is a finite resource that depletes throughout the day. Your morning is when you have the most self-control, focus, and creative energy. Don't waste it."
      }
    ],
    actionSteps: [
      "Wake 30-60 minutes before your first obligation",
      "Avoid screens for the first hour—they hijack your attention",
      "Include: movement, intention-setting, and something that nourishes your mind",
      "Make your morning routine non-negotiable"
    ],
    closingThought: "The battle for your day is won or lost in the first hour. Design that hour deliberately, and watch the rest of your life transform."
  },

  premeditatio: {
    title: "The Stoic Practice of Negative Visualization",
    subtitle: "How contemplating adversity creates resilience",
    icon: Skull,
    color: "from-slate-600 to-gray-600",
    intro: "What can go wrong? The Stoics asked this not to breed anxiety, but to breed preparation. By contemplating adversity before it arrives, you rob it of its power to disturb you. This is the ancient practice of premeditatio malorum—the premeditation of evils.",
    sections: [
      {
        title: "Seneca on Preparation",
        icon: Shield,
        quotes: [
          {
            text: "What is quite unlooked for is more crushing in its effect, and unexpectedness adds to the weight of a disaster. The fact that it was unforeseen has never failed to intensify a person's grief. This is a reason for ensuring that nothing ever takes us by surprise. We should project our thoughts ahead of us at every turn and have in mind every possible eventuality instead of only the usual course of events.",
            source: "Letters from a Stoic, Letter 91"
          },
          {
            text: "It is in times of security that the spirit should be preparing itself for difficult times; while fortune is bestowing favors on it is then is the time for it to be strengthened against her rebuffs.",
            source: "Letters from a Stoic"
          }
        ],
        explanation: "Seneca practiced imagining loss—of wealth, of reputation, of loved ones—not to live in fear, but to appreciate what he had and prepare for what could come. When adversity arrived, he had already faced it mentally."
      },
      {
        title: "Marcus Aurelius on Daily Preparation",
        icon: Target,
        quotes: [
          {
            text: "Begin each day by telling yourself: Today I shall be meeting with interference, ingratitude, insolence, disloyalty, ill-will, and selfishness—all of them due to the offenders' ignorance of what is good or evil.",
            source: "Meditations, Book II"
          },
          {
            text: "Never let the future disturb you. You will meet it, if you have to, with the same weapons of reason which today arm you against the present.",
            source: "Meditations"
          }
        ],
        explanation: "The emperor of Rome began each day anticipating difficulties. Not because he was pessimistic, but because he was realistic. By the time he faced a difficult senator or rebellious general, he had already faced them in his mind."
      },
      {
        title: "The Psychological Benefits",
        icon: Brain,
        quotes: [
          {
            text: "He who fears death will never do anything worth of a man who is alive.",
            source: "Seneca"
          }
        ],
        explanation: "Modern psychology confirms what Stoics knew: confronting fears robs them of power. Anxiety grows when we avoid thinking about what frightens us. By deliberately facing potential adversity, we reduce its emotional charge and increase our ability to respond skillfully."
      }
    ],
    actionSteps: [
      "Each morning, briefly contemplate what could go wrong today",
      "For each potential difficulty, mentally rehearse your response",
      "Periodically contemplate larger losses—this builds appreciation for what you have",
      "Remember: the goal is preparation, not pessimism"
    ],
    closingThought: "The person who has already faced adversity in their mind cannot be surprised by it in reality. Premeditatio is not about expecting the worst—it's about being ready for anything."
  },

  legacy: {
    title: "Why Thinking About Legacy Clarifies Life",
    subtitle: "The power of the long view",
    icon: Crown,
    color: "from-amber-600 to-yellow-600",
    intro: "What do you want to be remembered for? This question, properly contemplated, has the power to clarify everything. It strips away the trivial and reveals the essential. It transforms how you spend your days when you realize your days are numbered.",
    sections: [
      {
        title: "The Stoic Memento Mori",
        icon: Skull,
        quotes: [
          {
            text: "You could leave life right now. Let that determine what you do and say and think.",
            source: "Marcus Aurelius, Meditations"
          },
          {
            text: "Let us prepare our minds as if we'd come to the very end of life. Let us postpone nothing. Let us balance life's books each day.",
            source: "Seneca, On the Shortness of Life"
          },
          {
            text: "Think of yourself as dead. You have lived your life. Now take what's left and live it properly.",
            source: "Marcus Aurelius"
          }
        ],
        explanation: "Memento mori—remember you will die—sounds morbid but is profoundly life-affirming. When you remember that your time is limited, you stop wasting it on trivialities. Every petty conflict, every grudge, every day of procrastination becomes clearly unacceptable."
      },
      {
        title: "Napoleon Hill on Contribution",
        icon: Flame,
        quotes: [
          {
            text: "It is literally true that you can succeed best and quickest by helping others to succeed.",
            source: "Think and Grow Rich"
          },
          {
            text: "Great achievement is usually born of great sacrifice, and is never the result of selfishness.",
            source: "Think and Grow Rich"
          }
        ],
        explanation: "Hill's research revealed that lasting success comes from contribution to others. The wealthiest individuals he studied were those who created massive value for others. Your legacy is not what you accumulate but what you contribute."
      },
      {
        title: "The Eulogy Exercise",
        icon: Heart,
        quotes: [
          {
            text: "To begin with the end in mind means to start with a clear understanding of your destination.",
            source: "Stephen Covey, 7 Habits"
          }
        ],
        explanation: "Imagine your own funeral. What do you want people to say about you? Not just achievements—character. Were you kind? Were you present? Did you help others become their best selves? This exercise, uncomfortable as it is, reveals what truly matters."
      }
    ],
    actionSteps: [
      "Write your own eulogy—what do you want people to say about you?",
      "Identify the gap between that eulogy and your current life",
      "Each morning, ask: 'If today were my last, would I be satisfied with how I'm living?'",
      "Make decisions that your 80-year-old self would be proud of"
    ],
    closingThought: "You are writing your legacy with every action you take. Make it a story worth telling."
  },

  dashboard: {
    title: "Your Command Center for Transformation",
    subtitle: "Why your dashboard is the cockpit of your life",
    icon: Target,
    color: "from-indigo-500 to-blue-500",
    intro: "A pilot doesn't fly blind. A CEO doesn't run a company without metrics. Your transformation deserves the same precision. This dashboard is not just information display—it is your command center for designing the life you want.",
    sections: [
      {
        title: "The Power of Visible Progress",
        icon: Target,
        quotes: [
          {
            text: "What gets measured gets managed.",
            source: "Peter Drucker"
          },
          {
            text: "Progress—not perfection—is what we should be asking of ourselves.",
            source: "Julia Cameron"
          }
        ],
        explanation: "Your dashboard makes invisible progress visible. On days when you feel like you're going nowhere, the data tells the truth: you are moving forward. This visibility transforms motivation from something you have to generate to something you can see."
      },
      {
        title: "Daily Intention Setting",
        icon: Flame,
        quotes: [
          {
            text: "Either you run the day, or the day runs you.",
            source: "Jim Rohn"
          },
          {
            text: "If you don't design your own life plan, chances are you'll fall into someone else's plan.",
            source: "Jim Rohn"
          }
        ],
        explanation: "Your dashboard is not passive. It's where you decide what matters today. Without this decision, you're reactive—responding to whatever demands attention. With it, you're proactive—directing attention toward what matters most."
      },
      {
        title: "The Compound Dashboard Effect",
        icon: Layers,
        quotes: [
          {
            text: "Success is the sum of small efforts repeated day in and day out.",
            source: "Robert Collier"
          }
        ],
        explanation: "Each metric on your dashboard represents a habit, a goal, a commitment. Individually, they're just numbers. Together, they paint a picture of a life being deliberately constructed. Over time, this dashboard becomes a record of your transformation."
      }
    ],
    actionSteps: [
      "Review your dashboard every morning before starting work",
      "Identify your ONE most important focus for the day",
      "Track completion of your daily habits",
      "Use analytics to identify patterns and optimize"
    ],
    closingThought: "This dashboard is not about perfection—it's about awareness. You cannot optimize what you cannot see. Now you can see everything."
  }
};

const PhilosophyPage = () => {
  const { feature } = useParams();
  const navigate = useNavigate();
  
  const content = philosophyContent[feature];
  
  if (!content) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Philosophy Not Found</h1>
          <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
        </div>
      </div>
    );
  }

  const IconComponent = content.icon;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className={`relative bg-gradient-to-br ${content.color} py-16 px-6`}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => window.close()}
            className="mb-6 text-white/80 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Close
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <IconComponent className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{content.title}</h1>
          <p className="text-xl text-white/80 max-w-2xl">{content.subtitle}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <p className="text-lg text-zinc-300 leading-relaxed italic border-l-4 border-amber-500 pl-6">
            {content.intro}
          </p>
        </motion.div>

        {/* Sections */}
        {content.sections.map((section, idx) => {
          const SectionIcon = section.icon;
          return (
            <motion.section
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-6">
                <SectionIcon className="w-6 h-6 text-amber-400" />
                <h2 className="text-2xl font-bold">{section.title}</h2>
              </div>

              {/* Quotes */}
              <div className="space-y-4 mb-6">
                {section.quotes.map((quote, qIdx) => (
                  <div key={qIdx} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                    <div className="flex gap-3">
                      <Quote className="w-5 h-5 text-amber-400 shrink-0 mt-1" />
                      <div>
                        <p className="text-lg text-zinc-200 mb-2">"{quote.text}"</p>
                        <p className="text-sm text-amber-400/80">— {quote.source}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Explanation */}
              <p className="text-zinc-400 leading-relaxed pl-4 border-l-2 border-zinc-700">
                {section.explanation}
              </p>
            </motion.section>
          );
        })}

        <Separator className="my-12 bg-zinc-800" />

        {/* Action Steps */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-bold">Put This Into Practice</h2>
          </div>
          
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
            <ul className="space-y-3">
              {content.actionSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-zinc-300">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.section>

        {/* Closing Thought */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={`bg-gradient-to-br ${content.color} rounded-xl p-8 text-center`}>
            <p className="text-xl font-medium text-white leading-relaxed">
              {content.closingThought}
            </p>
          </div>
        </motion.section>

        {/* Return Button */}
        <div className="mt-12 text-center">
          <Button 
            onClick={() => window.close()}
            size="lg"
            className="bg-amber-500 hover:bg-amber-600 text-black"
          >
            Return to Your Journey
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PhilosophyPage;
