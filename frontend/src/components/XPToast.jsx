import { Star, Trophy, Zap } from 'lucide-react';
import { toast } from 'sonner';

export const showXPToast = (amount, action) => {
  const actionIcons = {
    goal: Trophy,
    habit: Zap,
    journal: Star,
    exercise: Star
  };

  const Icon = actionIcons[action] || Star;

  toast.custom((t) => (
    <div className="bg-gradient-to-r from-[#d4a574] to-[#b8885f] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-scale-in">
      <div className="p-3 bg-white/20 rounded-full animate-rotate-bounce">
        <Icon size={24} />
      </div>
      <div>
        <p className="font-bold text-lg">+{amount} XP</p>
        <p className="text-sm opacity-90">Keep building momentum!</p>
      </div>
    </div>
  ), {
    duration: 3000,
    position: 'top-center'
  });
};

export const showStreakToast = (days) => {
  toast.custom((t) => (
    <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-scale-in">
      <div className="p-3 bg-white/20 rounded-full">
        <span className="text-3xl">🔥</span>
      </div>
      <div>
        <p className="font-bold text-lg">{days} Day Streak!</p>
        <p className="text-sm opacity-90">You're on fire! Keep going!</p>
      </div>
    </div>
  ), {
    duration: 4000,
    position: 'top-center'
  });
};

export const showAchievementToast = (title, description) => {
  toast.custom((t) => (
    <div className="bg-gradient-to-r from-yellow-400 to-amber-600 text-black px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-scale-in">
      <div className="p-3 bg-white/30 rounded-full animate-bounce-slow">
        <Trophy size={24} />
      </div>
      <div>
        <p className="font-bold text-lg">{title}</p>
        <p className="text-sm opacity-80">{description}</p>
      </div>
    </div>
  ), {
    duration: 5000,
    position: 'top-center'
  });
};

export default { showXPToast, showStreakToast, showAchievementToast };
