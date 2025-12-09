import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Flame, Save, Play, Pause, Volume2, VolumeX, 
  Edit3, Calendar, Sparkles, Crown, Target,
  Bell, Clock, FileText, Download, Share2
} from 'lucide-react';
import { toast } from 'sonner';

const BurningDesire = ({ token }) => {
  const [document, setDocument] = useState({
    definiteChiefAim: '',
    whyItMatters: '',
    whatIWillGive: '',
    deadline: '',
    dailyAffirmation: '',
    createdAt: null,
    lastReadAt: null,
    readCount: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [showReminder, setShowReminder] = useState(false);
  
  useEffect(() => {
    loadDocument();
  }, []);

  const loadDocument = () => {
    const saved = localStorage.getItem('burningDesireDocument');
    if (saved) {
      setDocument(JSON.parse(saved));
    } else {
      setIsEditing(true);
    }
  };

  const saveDocument = () => {
    const updated = {
      ...document,
      createdAt: document.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('burningDesireDocument', JSON.stringify(updated));
    setDocument(updated);
    setIsEditing(false);
    toast.success('Your Burning Desire Document has been saved!');
  };

  const startReading = () => {
    setIsReading(true);
    setCurrentSection(0);
    
    // Update read count
    const updated = {
      ...document,
      lastReadAt: new Date().toISOString(),
      readCount: (document.readCount || 0) + 1
    };
    localStorage.setItem('burningDesireDocument', JSON.stringify(updated));
    setDocument(updated);
  };

  const readingSections = [
    {
      title: 'My Definite Chief Aim',
      content: document.definiteChiefAim,
      instruction: 'Read this with absolute conviction:'
    },
    {
      title: 'Why This Matters',
      content: document.whyItMatters,
      instruction: 'Feel the emotion behind these words:'
    },
    {
      title: 'What I Will Give In Return',
      content: document.whatIWillGive,
      instruction: 'Commit to this exchange:'
    },
    {
      title: 'My Deadline',
      content: document.deadline ? `I will achieve this by ${new Date(document.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` : '',
      instruction: 'Fix this date in your mind:'
    },
    {
      title: 'Daily Affirmation',
      content: document.dailyAffirmation,
      instruction: 'Repeat with burning desire:'
    }
  ].filter(s => s.content);

  const nextSection = () => {
    if (currentSection < readingSections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      setIsReading(false);
      toast.success('Reading complete! Your desire grows stronger.');
    }
  };

  const exportDocument = () => {
    let content = "═══════════════════════════════════════════\n";
    content += "         MY BURNING DESIRE DOCUMENT\n";
    content += "═══════════════════════════════════════════\n\n";
    content += "MY DEFINITE CHIEF AIM\n";
    content += "─────────────────────\n";
    content += document.definiteChiefAim + "\n\n";
    content += "WHY THIS MATTERS\n";
    content += "─────────────────────\n";
    content += document.whyItMatters + "\n\n";
    content += "WHAT I WILL GIVE IN RETURN\n";
    content += "─────────────────────\n";
    content += document.whatIWillGive + "\n\n";
    if (document.deadline) {
      content += "MY DEADLINE\n";
      content += "─────────────────────\n";
      content += new Date(document.deadline).toLocaleDateString() + "\n\n";
    }
    content += "DAILY AFFIRMATION\n";
    content += "─────────────────────\n";
    content += document.dailyAffirmation + "\n\n";
    content += "═══════════════════════════════════════════\n";
    content += `Created: ${new Date(document.createdAt).toLocaleDateString()}\n`;
    content += `Times Read: ${document.readCount}\n`;
    content += "═══════════════════════════════════════════\n";

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'burning-desire-document.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Document exported!');
  };

  // Reading Mode UI
  if (isReading) {
    const section = readingSections[currentSection];
    return (
      <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-2xl w-full">
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {readingSections.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentSection ? 'w-8 bg-[#d4a574]' : 
                  idx < currentSection ? 'w-4 bg-[#d4a574]/50' : 'w-4 bg-gray-700'
                }`}
              />
            ))}
          </div>

          <Card className="glass border-[#d4a574]/30 p-8 md:p-12 text-center">
            {/* Flame Animation */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent blur-3xl animate-pulse" />
              <Flame className="w-20 h-20 mx-auto text-orange-500 animate-bounce-slow" />
            </div>

            <p className="text-sm text-[#d4a574] uppercase tracking-wider mb-4">
              {section.instruction}
            </p>

            <h2 className="text-2xl font-bold text-white mb-6">{section.title}</h2>

            <p className="text-xl md:text-2xl text-gray-200 leading-relaxed mb-8 font-serif italic">
              "{section.content}"
            </p>

            <Button
              onClick={nextSection}
              className="bg-gradient-to-r from-[#d4a574] to-[#e6b786] text-black font-semibold px-8 py-6"
            >
              {currentSection < readingSections.length - 1 ? 'Continue' : 'Complete Reading'}
            </Button>

            <Button
              variant="ghost"
              onClick={() => setIsReading(false)}
              className="mt-4 text-gray-500"
            >
              Exit
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center gap-3">
              <Flame className="text-orange-500" />
              Burning Desire Document
            </h1>
            <p className="text-gray-400 max-w-2xl">
              Napoleon Hill's most powerful concept: Write out your definite chief aim and read it aloud twice daily.
            </p>
          </div>
          {document.createdAt && !isEditing && (
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="border-[#d4a574]/30"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={exportDocument}
                variant="outline"
                className="border-[#d4a574]/30"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      {document.createdAt && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="glass border-[#d4a574]/20 p-4 text-center">
            <Calendar className="w-5 h-5 mx-auto text-[#d4a574] mb-2" />
            <p className="text-xs text-gray-500">Created</p>
            <p className="text-sm text-white">{new Date(document.createdAt).toLocaleDateString()}</p>
          </Card>
          <Card className="glass border-[#d4a574]/20 p-4 text-center">
            <FileText className="w-5 h-5 mx-auto text-[#d4a574] mb-2" />
            <p className="text-xs text-gray-500">Times Read</p>
            <p className="text-sm text-white font-bold">{document.readCount || 0}</p>
          </Card>
          <Card className="glass border-[#d4a574]/20 p-4 text-center">
            <Clock className="w-5 h-5 mx-auto text-[#d4a574] mb-2" />
            <p className="text-xs text-gray-500">Last Read</p>
            <p className="text-sm text-white">
              {document.lastReadAt ? new Date(document.lastReadAt).toLocaleDateString() : 'Never'}
            </p>
          </Card>
        </div>
      )}

      {isEditing ? (
        /* Editing Mode */
        <Card className="glass border-[#d4a574]/30 p-6 md:p-8">
          <div className="space-y-6">
            {/* Section 1: Definite Chief Aim */}
            <div>
              <label className="flex items-center gap-2 text-lg font-semibold text-white mb-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                My Definite Chief Aim
              </label>
              <p className="text-sm text-gray-400 mb-3">
                What is the ONE thing you desire most? Be specific about amount, position, or achievement.
              </p>
              <Textarea
                value={document.definiteChiefAim}
                onChange={(e) => setDocument({ ...document, definiteChiefAim: e.target.value })}
                placeholder="e.g., I will earn $1,000,000 by building a software company that helps 100,000 people achieve their goals..."
                className="bg-[#1a1625] border-[#d4a574]/20 min-h-[120px]"
              />
            </div>

            {/* Section 2: Why It Matters */}
            <div>
              <label className="flex items-center gap-2 text-lg font-semibold text-white mb-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Why This Matters To Me
              </label>
              <p className="text-sm text-gray-400 mb-3">
                Connect to the deep emotion. Why must you achieve this?
              </p>
              <Textarea
                value={document.whyItMatters}
                onChange={(e) => setDocument({ ...document, whyItMatters: e.target.value })}
                placeholder="e.g., Because I want to provide my family with security, because I want to prove to myself..."
                className="bg-[#1a1625] border-[#d4a574]/20 min-h-[100px]"
              />
            </div>

            {/* Section 3: What I Will Give */}
            <div>
              <label className="flex items-center gap-2 text-lg font-semibold text-white mb-2">
                <Target className="w-5 h-5 text-emerald-500" />
                What I Will Give In Return
              </label>
              <p className="text-sm text-gray-400 mb-3">
                Nothing is free. What service, effort, or value will you provide?
              </p>
              <Textarea
                value={document.whatIWillGive}
                onChange={(e) => setDocument({ ...document, whatIWillGive: e.target.value })}
                placeholder="e.g., I will dedicate 4 hours every day to deliberate practice, I will provide exceptional value to my customers..."
                className="bg-[#1a1625] border-[#d4a574]/20 min-h-[100px]"
              />
            </div>

            {/* Section 4: Deadline */}
            <div>
              <label className="flex items-center gap-2 text-lg font-semibold text-white mb-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                My Deadline
              </label>
              <p className="text-sm text-gray-400 mb-3">
                A goal without a deadline is just a dream.
              </p>
              <Input
                type="date"
                value={document.deadline}
                onChange={(e) => setDocument({ ...document, deadline: e.target.value })}
                className="bg-[#1a1625] border-[#d4a574]/20 max-w-xs"
              />
            </div>

            {/* Section 5: Daily Affirmation */}
            <div>
              <label className="flex items-center gap-2 text-lg font-semibold text-white mb-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Daily Affirmation
              </label>
              <p className="text-sm text-gray-400 mb-3">
                A powerful statement you will repeat morning and night.
              </p>
              <Textarea
                value={document.dailyAffirmation}
                onChange={(e) => setDocument({ ...document, dailyAffirmation: e.target.value })}
                placeholder="e.g., I am becoming the person who achieves their goals. Every day I grow stronger, wiser, and more capable..."
                className="bg-[#1a1625] border-[#d4a574]/20 min-h-[80px]"
              />
            </div>

            {/* Save Button */}
            <div className="flex gap-4 pt-4">
              {document.createdAt && (
                <Button
                  variant="outline"
                  onClick={() => {
                    loadDocument();
                    setIsEditing(false);
                  }}
                  className="flex-1 border-gray-600"
                >
                  Cancel
                </Button>
              )}
              <Button
                onClick={saveDocument}
                className="flex-1 bg-gradient-to-r from-[#d4a574] to-[#e6b786] text-black font-semibold py-6"
              >
                <Save className="w-5 h-5 mr-2" />
                Save My Burning Desire Document
              </Button>
            </div>
          </div>
        </Card>
      ) : document.createdAt ? (
        /* View Mode */
        <div className="space-y-6">
          {/* Start Reading Button */}
          <Card className="glass border-orange-500/30 p-8 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent blur-2xl" />
              <Flame className="w-16 h-16 mx-auto text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Ready to Read Your Document?</h2>
            <p className="text-gray-400 mb-6">
              Napoleon Hill recommended reading your definite chief aim aloud, twice daily
            </p>
            <Button
              onClick={startReading}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold px-8 py-6 text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Begin Reading Ritual
            </Button>
          </Card>

          {/* Document Preview */}
          <Card className="glass border-[#d4a574]/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Document Preview</h3>
            <div className="space-y-4">
              {document.definiteChiefAim && (
                <div className="p-4 bg-black/20 rounded-lg">
                  <p className="text-xs text-[#d4a574] uppercase tracking-wider mb-1">Definite Chief Aim</p>
                  <p className="text-gray-300">{document.definiteChiefAim}</p>
                </div>
              )}
              {document.deadline && (
                <div className="p-4 bg-black/20 rounded-lg">
                  <p className="text-xs text-[#d4a574] uppercase tracking-wider mb-1">Deadline</p>
                  <p className="text-gray-300">{new Date(document.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      ) : null}

      {/* Napoleon Hill Quote */}
      <Card className="glass border-[#d4a574]/20 p-6 mt-8">
        <p className="text-center text-gray-300 italic">
          "There is one quality which one must possess to win, and that is definiteness of purpose, 
          the knowledge of what one wants, and a burning desire to possess it."
        </p>
        <p className="text-center text-[#d4a574] mt-2">— Napoleon Hill, Think and Grow Rich</p>
      </Card>
    </div>
  );
};

export default BurningDesire;
