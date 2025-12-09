import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Palette, Lock, Check, Sparkles, Flame, 
  Sun, Moon, Leaf, Waves, Gem, Crown
} from 'lucide-react';
import { useTheme, themes } from '@/components/ThemeProvider';
import { toast } from 'sonner';

const themeIcons = {
  obsidian: Moon,
  dawn: Sun,
  aurora: Sparkles,
  forest: Leaf,
  ocean: Waves,
  ember: Flame,
  legend: Crown
};

const ThemeSettings = ({ analytics }) => {
  const { currentTheme, unlockedThemes, selectTheme } = useTheme();

  const getProgressToUnlock = (theme) => {
    if (!theme.unlockRequirement || !analytics) return 100;
    
    const req = theme.unlockRequirement;
    let current = 0;
    
    switch (req.type) {
      case 'streak':
        current = analytics.habits?.max_streak || 0;
        break;
      case 'goals':
        current = analytics.goals?.completed || 0;
        break;
      case 'journal':
        current = analytics.journal?.total_entries || 0;
        break;
      case 'exercises':
        current = analytics.exercises?.total_completed || 0;
        break;
      case 'level':
        current = parseInt(localStorage.getItem('userLevel') || '1');
        break;
      default:
        return 0;
    }
    
    return Math.min((current / req.value) * 100, 100);
  };

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center gap-3">
          <Palette className="text-[#d4a574]" />
          Theme Gallery
        </h1>
        <p className="text-gray-400">
          Unlock new themes as you progress on your journey
        </p>
      </div>

      {/* Current Theme */}
      <Card className="glass border-[#d4a574]/30 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: themes.find(t => t.id === currentTheme)?.colors.primary }}
            >
              {(() => {
                const Icon = themeIcons[currentTheme] || Moon;
                return <Icon className="w-8 h-8 text-white" />;
              })()}
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Theme</p>
              <h2 className="text-2xl font-bold text-white">
                {themes.find(t => t.id === currentTheme)?.name}
              </h2>
              <p className="text-sm text-gray-400">
                {themes.find(t => t.id === currentTheme)?.description}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Unlocked Themes</p>
            <p className="text-2xl font-bold text-[#d4a574]">
              {unlockedThemes.length} / {themes.length}
            </p>
          </div>
        </div>
      </Card>

      {/* Theme Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => {
          const Icon = themeIcons[theme.id] || Moon;
          const isUnlocked = unlockedThemes.includes(theme.id);
          const isSelected = currentTheme === theme.id;
          const progress = getProgressToUnlock(theme);

          return (
            <Card
              key={theme.id}
              className={`overflow-hidden transition-all cursor-pointer ${
                isSelected 
                  ? 'ring-2 ring-[#d4a574] border-[#d4a574]/50' 
                  : isUnlocked 
                    ? 'border-gray-700 hover:border-gray-600' 
                    : 'border-gray-800 opacity-60'
              }`}
              onClick={() => isUnlocked && selectTheme(theme.id)}
            >
              {/* Theme Preview Bar */}
              <div 
                className="h-24 relative"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.colors.background}, ${theme.colors.surface})` 
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: theme.colors.primary }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                {/* Color swatches */}
                <div className="absolute bottom-2 left-2 flex gap-1">
                  <div 
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ background: theme.colors.primary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ background: theme.colors.secondary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ background: theme.colors.accent }}
                  />
                </div>

                {/* Lock/Selected indicator */}
                <div className="absolute top-2 right-2">
                  {isSelected ? (
                    <div className="p-1 rounded-full bg-green-500">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : !isUnlocked ? (
                    <div className="p-1 rounded-full bg-gray-600">
                      <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Theme Info */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-1">{theme.name}</h3>
                <p className="text-sm text-gray-400 mb-3">{theme.description}</p>

                {!isUnlocked && theme.unlockRequirement && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        {theme.unlockDescription}
                      </span>
                      <span className="text-[#d4a574]">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${progress}%`,
                          background: theme.colors.primary 
                        }}
                      />
                    </div>
                  </div>
                )}

                {isUnlocked && !isSelected && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-[#d4a574]/30 hover:bg-[#d4a574]/10"
                    onClick={() => selectTheme(theme.id)}
                  >
                    Apply Theme
                  </Button>
                )}

                {isSelected && (
                  <div className="flex items-center justify-center gap-2 text-green-500 text-sm">
                    <Check className="w-4 h-4" />
                    Currently Active
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tips */}
      <Card className="glass border-[#d4a574]/20 p-6 mt-8">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#d4a574]" />
          Unlock More Themes
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-3 bg-black/20 rounded-lg">
            <p className="text-sm text-white font-medium">Build Streaks</p>
            <p className="text-xs text-gray-400">Maintain habit streaks to unlock Dawn and Aurora themes</p>
          </div>
          <div className="p-3 bg-black/20 rounded-lg">
            <p className="text-sm text-white font-medium">Complete Goals</p>
            <p className="text-xs text-gray-400">Achieve your goals to unlock the Forest theme</p>
          </div>
          <div className="p-3 bg-black/20 rounded-lg">
            <p className="text-sm text-white font-medium">Journal Regularly</p>
            <p className="text-xs text-gray-400">Write journal entries to unlock the Ocean theme</p>
          </div>
          <div className="p-3 bg-black/20 rounded-lg">
            <p className="text-sm text-white font-medium">Reach Legend Status</p>
            <p className="text-xs text-gray-400">Reach Level 10 to unlock the prestigious Legend theme</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ThemeSettings;
