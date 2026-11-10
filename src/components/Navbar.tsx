import React from 'react';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  BookOpen, 
  NotebookPen, 
  CalendarClock, 
  BarChart3, 
  Award, 
  Settings, 
  Sparkles,
  Flame,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { AppStorage } from '../services/storage';

export type ActiveTab = 
  | 'dashboard' 
  | 'daily-exam' 
  | 'question-bank' 
  | 'mistake-notebook' 
  | 'practice-test' 
  | 'revision-center' 
  | 'analytics' 
  | 'weekly-mock' 
  | 'ai-generator'
  | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  examInProgress: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, examInProgress }) => {
  const streakStats = AppStorage.getStreakStats();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { id: 'daily-exam', label: 'Daily Exam', icon: <FileSpreadsheet size={16} />, badge: '45 MCQs' },
    { id: 'practice-test', label: 'Custom Test', icon: <Award size={16} /> },
    { id: 'question-bank', label: 'Question Bank', icon: <BookOpen size={16} /> },
    { id: 'mistake-notebook', label: 'Mistakes', icon: <NotebookPen size={16} /> },
    { id: 'revision-center', label: 'Spaced Revision', icon: <CalendarClock size={16} /> },
    { id: 'weekly-mock', label: 'Weekly Mock', icon: <Award size={16} />, badge: '100 Q' },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} /> },
    { id: 'ai-generator', label: 'AI Practice', icon: <Sparkles size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
  ];

  const handleNavClick = (tabId: ActiveTab) => {
    if (examInProgress && tabId !== activeTab) {
      const confirmLeave = window.confirm('An exam is currently running. Leaving now will not submit your score. Continue?');
      if (!confirmLeave) return;
    }
    setActiveTab(tabId);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#EAE3DC] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with clean dark pill branding like reference */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick('dashboard')}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1E2024] to-[#3B424D] flex items-center justify-center text-white shadow-sm font-bold text-sm">
              <Zap size={16} className="text-[#F25C54] fill-[#F25C54]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-extrabold text-xl tracking-tight text-[#111418]">
                  GovtPrep
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#111418] text-white">
                  BD
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Pill Group (like reference image) */}
          <nav className="hidden lg:flex items-center space-x-1 bg-[#F1EAE5]/60 p-1 rounded-full border border-[#EAE3DC]">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#111418] text-white shadow-sm'
                      : 'text-[#64748B] hover:text-[#111418] hover:bg-white/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Controls: Streak Pill & User Profile */}
          <div className="flex items-center space-x-2">
            <div 
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EAE3DC] shadow-xs text-xs font-semibold"
              title={`Streak: ${streakStats.currentStreak} Days`}
            >
              <Flame size={15} className="text-[#F25C54] fill-[#F25C54]" />
              <span className="text-[#111418]">{streakStats.currentStreak}d</span>
              <span className="text-[#64748B] text-[10px] uppercase font-bold">Streak</span>
            </div>

            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FD6960] to-[#8054F2] p-[1.5px] cursor-pointer" onClick={() => handleNavClick('settings')}>
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs font-bold text-[#111418]">
                BCS
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Navigation Scroll */}
        <nav className="flex lg:hidden space-x-1 overflow-x-auto no-scrollbar py-2 border-t border-[#EAE3DC]/60 text-xs font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-150 shrink-0 ${
                  isActive
                    ? 'bg-[#111418] text-white shadow-xs font-bold'
                    : 'bg-white/70 text-[#64748B] border border-[#EAE3DC]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#F1EAE5] text-[#64748B]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
