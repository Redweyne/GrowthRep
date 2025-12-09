import { useState } from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const PhilosophyIcon = ({ feature, className = "" }) => {
  const tooltipMessages = {
    goals: "The Philosophy Behind Goal Setting",
    habits: "Why Habits Shape Your Destiny",
    journal: "The Power of Written Reflection",
    visionBoard: "Why Visualization Transforms Reality",
    aiCoach: "The Science of Mentorship",
    analytics: "Why Tracking Changes Everything",
    exercises: "The Philosophy of Deliberate Practice",
    rituals: "Why Rituals Create Transformation",
    wisdom: "The Power of Ancient Wisdom",
    burningDesire: "Napoleon Hill's Secret to Achievement",
    identity: "Why Identity Drives Behavior",
    obstacle: "The Stoic Art of Obstacle Transformation",
    habitStacking: "James Clear's Compound Effect",
    morning: "Why Morning Routines Matter",
    premeditatio: "The Stoic Practice of Negative Visualization",
    legacy: "Why Thinking About Legacy Clarifies Life",
    dashboard: "Your Command Center for Transformation"
  };

  const handleClick = () => {
    // Open philosophy page in new tab with the feature parameter
    window.open(`/philosophy/${feature}`, '_blank');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className={`inline-flex items-center justify-center p-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 group ${className}`}
            data-testid={`philosophy-icon-${feature}`}
          >
            <Sparkles className="w-4 h-4 text-amber-400 group-hover:text-amber-300 transition-colors" />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="bg-zinc-900 border-amber-500/30 text-amber-100 max-w-xs"
        >
          <p className="text-sm font-medium">{tooltipMessages[feature] || "Discover Why This Works"}</p>
          <p className="text-xs text-amber-400/70 mt-1">Click to explore the philosophy</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PhilosophyIcon;
