import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

// Define available themes with unlock requirements
export const themes = [
  {
    id: 'obsidian',
    name: 'Obsidian',
    description: 'Dark, minimal, powerful',
    colors: {
      primary: '#d4a574',
      secondary: '#e6b786',
      background: '#0a0a0f',
      surface: '#1a1625',
      accent: '#d4a574'
    },
    unlockRequirement: null, // Default theme
    unlockDescription: 'Default theme'
  },
  {
    id: 'dawn',
    name: 'Dawn',
    description: 'Warm gradients for new beginnings',
    colors: {
      primary: '#f97316',
      secondary: '#fb923c',
      background: '#0f0805',
      surface: '#1a1510',
      accent: '#f97316'
    },
    unlockRequirement: { type: 'streak', value: 7 },
    unlockDescription: 'Achieve a 7-day streak'
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Ethereal northern lights',
    colors: {
      primary: '#8b5cf6',
      secondary: '#a78bfa',
      background: '#050510',
      surface: '#0f0f20',
      accent: '#8b5cf6'
    },
    unlockRequirement: { type: 'streak', value: 30 },
    unlockDescription: 'Achieve a 30-day streak'
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Deep greens of growth',
    colors: {
      primary: '#10b981',
      secondary: '#34d399',
      background: '#050a08',
      surface: '#0a1510',
      accent: '#10b981'
    },
    unlockRequirement: { type: 'goals', value: 5 },
    unlockDescription: 'Complete 5 goals'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Calm blue depths',
    colors: {
      primary: '#3b82f6',
      secondary: '#60a5fa',
      background: '#030508',
      surface: '#0a1015',
      accent: '#3b82f6'
    },
    unlockRequirement: { type: 'journal', value: 20 },
    unlockDescription: 'Write 20 journal entries'
  },
  {
    id: 'ember',
    name: 'Ember',
    description: 'Burning passion',
    colors: {
      primary: '#ef4444',
      secondary: '#f87171',
      background: '#0a0505',
      surface: '#150a0a',
      accent: '#ef4444'
    },
    unlockRequirement: { type: 'exercises', value: 30 },
    unlockDescription: 'Complete 30 exercises'
  },
  {
    id: 'legend',
    name: 'Legend',
    description: 'Gold accents for the elite',
    colors: {
      primary: '#eab308',
      secondary: '#facc15',
      background: '#0a0805',
      surface: '#151008',
      accent: '#eab308'
    },
    unlockRequirement: { type: 'level', value: 10 },
    unlockDescription: 'Reach Level 10'
  }
];

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children, analytics }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('selectedTheme');
    return saved || 'obsidian';
  });
  const [unlockedThemes, setUnlockedThemes] = useState(['obsidian']);

  // Check which themes are unlocked based on analytics
  useEffect(() => {
    if (!analytics) return;

    const userLevel = parseInt(localStorage.getItem('userLevel') || '1');
    const unlocked = ['obsidian']; // Always unlocked

    themes.forEach(theme => {
      if (!theme.unlockRequirement) return;
      
      const req = theme.unlockRequirement;
      let isUnlocked = false;

      switch (req.type) {
        case 'streak':
          isUnlocked = (analytics.habits?.max_streak || 0) >= req.value;
          break;
        case 'goals':
          isUnlocked = (analytics.goals?.completed || 0) >= req.value;
          break;
        case 'journal':
          isUnlocked = (analytics.journal?.total_entries || 0) >= req.value;
          break;
        case 'exercises':
          isUnlocked = (analytics.exercises?.total_completed || 0) >= req.value;
          break;
        case 'level':
          isUnlocked = userLevel >= req.value;
          break;
        default:
          break;
      }

      if (isUnlocked) {
        unlocked.push(theme.id);
      }
    });

    setUnlockedThemes(unlocked);
    localStorage.setItem('unlockedThemes', JSON.stringify(unlocked));
  }, [analytics]);

  // Apply theme to CSS variables
  useEffect(() => {
    const theme = themes.find(t => t.id === currentTheme) || themes[0];
    const root = document.documentElement;

    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-accent', theme.colors.accent);

    // Update body background
    document.body.style.background = `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`;

    localStorage.setItem('selectedTheme', currentTheme);
  }, [currentTheme]);

  const selectTheme = (themeId) => {
    if (!unlockedThemes.includes(themeId)) {
      toast.error('This theme is locked!');
      return;
    }
    setCurrentTheme(themeId);
    toast.success(`Theme changed to ${themes.find(t => t.id === themeId)?.name}`);
  };

  const value = {
    currentTheme,
    themes,
    unlockedThemes,
    selectTheme,
    getTheme: () => themes.find(t => t.id === currentTheme) || themes[0]
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
