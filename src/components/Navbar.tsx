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
  Target
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
  onQuickStartDaily: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  examInProgress,
  onQuickStartDaily 
}) => {
  const streakStats = AppStorage.getStreakStats();

  // Core high-frequency navigation tabs
  const primaryNavItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={15} /> },
    { id: 'daily-exam', label: 'Daily 45', icon: <Target size={15} /> },
    { id: 'practice-test', label: 'Drills', icon: <Award size={15} /> },
    { id: 'question-bank', label: 'Questions', icon: <BookOpen size={15} /> },
    { id: 'mistake-notebook', label: 'Mistakes', icon: <NotebookPen size={15} /> },
    { id: 'revision-center', label: 'SRS Queue', icon: <CalendarClock size={15} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={15} /> },
    { id: 'weekly-mock', label: '100 Mock', icon: <FileSpreadsheet size={15} /> },
    { id: 'ai-generator', label: 'AI Gen', icon: <Sparkles size={15} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={15} /> },
  ];

  const handleNavClick = (tabId: ActiveTab) => {
    if (examInProgress && tabId !== activeTab) {
      const confirmLeave = window.confirm('An exam is in progress. Navigating away will not submit your score. Continue?');
      if (!confirmLeave) return;
    }
    setActiveTab(tabId);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-[#E2E8F0] shadow-[0_4px_20px_-4px_rgba(6,78,59,0.05)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Brand Logo with Forest Emerald Glow */}
          <div 
            className="flex items-center space-x-3 cursor-pointer shrink-0 select-none group" 
            onClick={() => handleNavClick('dashboard')}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#059669] via-[#047857] to-[#064E3B] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(5,150,105,0.35)] group-hover:scale-105 transition-transform duration-200">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-black text-xl sm:text-2xl tracking-tight text-[#0F172A]">
                  GovtPrep<span className="text-[#059669]">.</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] font-medium hidden md:block -mt-0.5">
                Bangladesh Civil & Public Exam Mastery
              </p>
            </div>
          </div>

          {/* Desktop Fluid Navigation Pill Group */}
          <nav className="hidden xl:flex items-center space-x-1 bg-[#F1F5F9]/80 p-1.5 rounded-full border border-[#E2E8F0]">
            {primaryNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#059669] to-[#047857] text-white shadow-[0_2px_10px_rgba(5,150,105,0.3)]'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/80'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar: Streak Badge + Instant Exam CTA */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Streak Status Pill */}
            <div 
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] shadow-xs text-xs font-bold text-[#065F46]"
              title={`Consistency: ${streakStats.currentStreak} day streak`}
            >
              <Flame size={15} className="text-[#EA580C] fill-[#EA580C]" />
              <span className="font-extrabold text-[#0F172A]">{streakStats.currentStreak}</span>
              <span className="text-[10px] uppercase text-[#059669] hidden sm:inline">Days</span>
            </div>

            {/* Instant Start Exam Hero CTA (Visible everywhere for instant action) */}
            <button
              onClick={onQuickStartDaily}
              className="emerald-btn text-white text-xs sm:text-sm font-extrabold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full flex items-center space-x-1.5 cursor-pointer"
            >
              <Zap size={14} className="fill-white" />
              <span>Start Daily 45</span>
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Quick Bar */}
        <nav className="flex xl:hidden space-x-1.5 overflow-x-auto no-scrollbar py-2.5 border-t border-[#E2E8F0]/70 text-xs font-bold">
          {primaryNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all duration-150 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#059669] to-[#047857] text-white shadow-xs'
                    : 'bg-white/90 text-[#64748B] border border-[#E2E8F0]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
