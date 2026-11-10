import React, { useState } from 'react';
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
  Target,
  Menu,
  X
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-[0_2px_12px_-2px_rgba(6,78,59,0.05)]">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20 gap-2">
          
          {/* Brand Logo & Mobile Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9] md:hidden cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div 
              className="flex items-center space-x-2 cursor-pointer select-none" 
              onClick={() => handleNavClick('dashboard')}
            >
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#059669] via-[#047857] to-[#064E3B] flex items-center justify-center text-white shadow-sm shrink-0">
                <Zap size={16} className="text-white fill-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-display font-black text-lg sm:text-2xl tracking-tight text-[#0F172A]">
                    GovtPrep<span className="text-[#059669]">.</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.2 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                    PRO
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Pill Group */}
          <nav className="hidden lg:flex items-center space-x-1 bg-[#F1F5F9]/80 p-1 rounded-full border border-[#E2E8F0]">
            {primaryNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#059669] to-[#047857] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/80'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            {/* Streak Status Pill */}
            <div 
              className="flex items-center space-x-1 px-2.5 py-1 sm:py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-bold text-[#065F46]"
            >
              <Flame size={14} className="text-[#EA580C] fill-[#EA580C]" />
              <span className="font-extrabold text-[#0F172A]">{streakStats.currentStreak}</span>
              <span className="text-[10px] uppercase text-[#059669] hidden xs:inline">d</span>
            </div>

            {/* Instant Start Exam CTA */}
            <button
              onClick={onQuickStartDaily}
              className="emerald-btn text-white text-xs sm:text-sm font-black px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full flex items-center space-x-1 cursor-pointer whitespace-nowrap"
            >
              <Zap size={13} className="fill-white" />
              <span className="hidden xs:inline">Start Daily 45</span>
              <span className="xs:hidden">Daily 45</span>
            </button>
          </div>
        </div>

        {/* Mobile Flyout Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-[#E2E8F0] space-y-1 animate-in fade-in duration-150">
            <div className="grid grid-cols-2 gap-1.5">
              {primaryNavItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                      isActive
                        ? 'bg-[#059669] text-white'
                        : 'bg-[#F8FAF9] text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Mobile Horizontal Quick Bar (when menu closed) */}
        {!mobileMenuOpen && (
          <nav className="flex lg:hidden space-x-1 overflow-x-auto no-scrollbar py-2 border-t border-[#E2E8F0]/70 text-xs font-bold">
            {primaryNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-150 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#059669] text-white shadow-xs'
                      : 'bg-white text-[#64748B] border border-[#E2E8F0]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
};
