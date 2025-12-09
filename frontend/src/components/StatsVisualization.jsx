import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Trophy, Target, Flame, BookOpen, TrendingUp, Award } from 'lucide-react';

const StatsVisualization = ({ analytics }) => {
  const stats = useMemo(() => {
    if (!analytics) return [];

    return [
      {
        label: 'Goals Completed',
        value: analytics.goals?.completed || 0,
        max: Math.max(analytics.goals?.total || 10, 10),
        icon: Trophy,
        color: 'from-yellow-400 to-amber-600',
        bgColor: 'from-yellow-400/20 to-amber-600/20'
      },
      {
        label: 'Active Goals',
        value: analytics.goals?.active || 0,
        max: Math.max(analytics.goals?.total || 5, 5),
        icon: Target,
        color: 'from-blue-500 to-cyan-600',
        bgColor: 'from-blue-500/20 to-cyan-600/20'
      },
      {
        label: 'Longest Streak',
        value: analytics.habits?.max_streak || 0,
        max: Math.max(analytics.habits?.max_streak || 30, 30),
        icon: Flame,
        color: 'from-orange-500 to-red-600',
        bgColor: 'from-orange-500/20 to-red-600/20'
      },
      {
        label: 'Journal Entries',
        value: analytics.journal?.total_entries || 0,
        max: Math.max(analytics.journal?.total_entries || 20, 20),
        icon: BookOpen,
        color: 'from-purple-500 to-pink-600',
        bgColor: 'from-purple-500/20 to-pink-600/20'
      },
      {
        label: 'Exercises Done',
        value: analytics.exercises?.total_completed || 0,
        max: Math.max(analytics.exercises?.total_completed || 15, 15),
        icon: Award,
        color: 'from-emerald-500 to-teal-600',
        bgColor: 'from-emerald-500/20 to-teal-600/20'
      }
    ];
  }, [analytics]);

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const percentage = (stat.value / stat.max) * 100;

        return (
          <Card 
            key={stat.label}
            className="glass border-[#d4a574]/20 p-6 hover-lift"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`} />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-400">of {stat.max}</p>
              </div>
            </div>

            <p className="text-sm text-gray-300 mb-3">{stat.label}</p>

            {/* Progress Bar */}
            <div className="relative h-2 bg-[#1a1625] rounded-full overflow-hidden">
              <div 
                className={`absolute top-0 left-0 h-full bg-gradient-to-r ${stat.color} transition-all duration-1000 ease-out rounded-full`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>

            {/* Percentage */}
            <div className="mt-2 text-right">
              <span className={`text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
                {percentage.toFixed(0)}%
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsVisualization;
