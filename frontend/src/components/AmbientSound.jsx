import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

// Ambient soundscapes that change based on time and user state
const soundscapes = {
  morning: {
    name: 'Morning Energy',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c5f3c3e9.mp3', // Uplifting ambient
    color: 'from-orange-500 to-yellow-500'
  },
  afternoon: {
    name: 'Focus Flow',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3', // Concentrated focus
    color: 'from-blue-500 to-cyan-500'
  },
  evening: {
    name: 'Reflection',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_12b08c6b29.mp3', // Calm reflection
    color: 'from-purple-500 to-pink-500'
  },
  night: {
    name: 'Deep Rest',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d1718ab41b.mp3', // Peaceful night
    color: 'from-indigo-500 to-purple-500'
  },
  highStreak: {
    name: 'Victory',
    url: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe25f21.mp3', // Triumphant
    color: 'from-yellow-500 to-red-500'
  }
};

const AmbientSound = ({ timeOfDay = 'morning', streakPower = 0 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(30);
  const [showControls, setShowControls] = useState(false);
  const audioRef = useRef(null);

  // Select soundscape based on time and streak
  const currentSoundscape = streakPower > 70 ? soundscapes.highStreak : soundscapes[timeOfDay] || soundscapes.morning;

  useEffect(() => {
    // Check if user has enabled ambient sound
    const enabled = localStorage.getItem('ambientSoundEnabled') === 'true';
    setIsPlaying(enabled);
    
    const savedVolume = localStorage.getItem('ambientVolume');
    if (savedVolume) {
      setVolume(parseInt(savedVolume));
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          // Auto-play blocked, will need user interaction
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, volume]);

  const togglePlay = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    localStorage.setItem('ambientSoundEnabled', newState.toString());
  };

  const handleVolumeChange = (value) => {
    setVolume(value[0]);
    localStorage.setItem('ambientVolume', value[0].toString());
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowControls(!showControls)}
          className="rounded-full w-14 h-14 bg-gradient-to-r border-[#d4a574]/30 hover:border-[#d4a574] shadow-lg backdrop-blur-lg"
          data-testid="ambient-sound-toggle"
        >
          {isPlaying ? (
            <Volume2 className="text-[#d4a574] animate-pulse" size={24} />
          ) : (
            <VolumeX className="text-gray-400" size={24} />
          )}
        </Button>

        {showControls && (
          <div className="absolute bottom-16 left-0 bg-[#1a1625]/95 backdrop-blur-xl border border-[#d4a574]/20 rounded-2xl p-4 w-64 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${currentSoundscape.color}`}>
                <Music className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-200">{currentSoundscape.name}</p>
                <p className="text-xs text-gray-400">Ambient Soundscape</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-[#d4a574] hover:bg-[#d4a574]/10"
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                <span className="text-xs text-gray-400">{volume}%</span>
              </div>

              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Auto-adjusts to your journey
            </p>
          </div>
        )}
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={currentSoundscape.url}
        loop
        preload="auto"
      />
    </div>
  );
};

export default AmbientSound;
