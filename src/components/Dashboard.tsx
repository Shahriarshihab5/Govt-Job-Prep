import React from 'react';
import { 
  Play, 
  Flame, 
  Target, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  RotateCcw, 
  BookOpen, 
  ArrowUpRight, 
  Award, 
  Zap, 
  ChevronRight,
  ShieldCheck,
  BrainCircuit,
  Compass,
  FileCheck2,
  Sparkles,
  NotebookPen
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { AppStorage } from '../services/storage';
import { ActiveTab } from './Navbar';

interface DashboardProps {
  setActiveTab: (tab: ActiveTab) => void;
  onStartDailyExam: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, onStartDailyExam }) => {
  const settings = AppStorage.getSettings();
  const streakStats = AppStorage.getStreakStats();
  const attempts = AppStorage.getAttempts();
  const sessions = AppStorage.getSessions();
  const dailyActivities = AppStorage.getDailyActivities();
  const mistakes = AppStorage.getMistakes();
  const revisions = AppStorage.getRevisionSchedule();
  const questions = AppStorage.getQuestions();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayActivity = dailyActivities[todayStr] || {
    date: todayStr,
    targetCount: settings.dailyTarget,
    completedCount: 0,
    isCompleted: false,
    studyDurationSeconds: 0,
    sessionsCount: 0,
  };

  const totalQuestionsAttempted = attempts.length;
  const correctCount = attempts.filter(a => a.isCorrect).length;
  const overallAccuracy = totalQuestionsAttempted > 0 
    ? Math.round((correctCount / totalQuestionsAttempted) * 100) 
    : 0;

  const dueRevisionsCount = revisions.filter(r => r.status === 'due' || new Date(r.dueAt) <= new Date()).length;

  // Chart data
  const chartTrajectory = sessions.length > 0
    ? [...sessions].reverse().slice(-8).map((s, idx) => ({
        label: `Test ${idx + 1}`,
        score: s.score,
        accuracy: s.accuracy,
      }))
    : [
        { label: 'Set 1', score: 28, accuracy: 62 },
        { label: 'Set 2', score: 32, accuracy: 71 },
        { label: 'Set 3', score: 35, accuracy: 78 },
        { label: 'Set 4', score: 38, accuracy: 84 },
        { label: 'Set 5', score: 42, accuracy: 93 },
      ];

  // Subject statistics
  const subjectStats: Record<string, { total: number; correct: number }> = {
    Bangla: { total: 0, correct: 0 },
    Mathematics: { total: 0, correct: 0 },
    'General Knowledge': { total: 0, correct: 0 },
    English: { total: 0, correct: 0 },
  };

  attempts.forEach(att => {
    const q = questions.find(item => item.id === att.questionId);
    if (q && subjectStats[q.subject]) {
      subjectStats[q.subject].total += 1;
      if (att.isCorrect) subjectStats[q.subject].correct += 1;
    }
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* 🌟 ULTRA LUXURY HERO COMMAND CENTER: Emerald Deep & Glow */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064E3B] via-[#065F46] to-[#022C22] text-white p-6 sm:p-10 shadow-[0_20px_50px_-10px_rgba(6,78,59,0.35)] border border-[#059669]/30">
        
        {/* Soft background ambient glow orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#10B981]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#34D399]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          
          {/* Left Hero Message */}
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-extrabold uppercase tracking-widest text-[#6EE7B7]">
              <Sparkles size={13} className="text-[#34D399]" />
              <span>Target 46th BCS & Recruitment Mastery</span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.15]">
              Ace Your Government Recruitment Exam.
            </h1>

            <p className="text-sm sm:text-base text-[#D1FAE5]/85 font-medium leading-relaxed max-w-xl">
              Daily authentic 45-MCQ test engine, scientific spaced repetition, and automatic error diagnostics—all engineered to guarantee retention.
            </p>

            {/* Quick Badges */}
            <div className="pt-2 flex flex-wrap gap-2 text-xs font-semibold text-[#A7F3D0]">
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full border border-white/10">
                <CheckCircle2 size={14} className="text-[#34D399]" /> 15 Bangla • 10 Math • 10 GK • 10 English
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full border border-white/10">
                <ShieldCheck size={14} className="text-[#34D399]" /> Negative mark -0.5 enforced
              </span>
            </div>
          </div>

          {/* Right Hero Action Card (Glassmorphic) */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between min-w-[320px] max-w-sm shrink-0">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#A7F3D0] mb-2 uppercase tracking-wider">
                <span>Today's Quota</span>
                <span className="bg-[#10B981]/30 text-white px-2.5 py-0.5 rounded-full text-[11px]">
                  {todayActivity.completedCount >= todayActivity.targetCount ? 'Achieved ✓' : 'Incomplete'}
                </span>
              </div>

              <div className="flex items-baseline space-x-2 my-2">
                <span className="text-4xl sm:text-5xl font-black text-white">
                  {todayActivity.completedCount}
                </span>
                <span className="text-xl text-[#A7F3D0] font-bold">
                  / {todayActivity.targetCount} MCQs
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 rounded-full bg-white/15 overflow-hidden my-3 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-[#34D399] to-[#6EE7B7] rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${Math.min(100, (todayActivity.completedCount / todayActivity.targetCount) * 100)}%` }}
                />
              </div>

              <p className="text-xs text-[#D1FAE5]/80">
                {todayActivity.targetCount - todayActivity.completedCount > 0 
                  ? `${todayActivity.targetCount - todayActivity.completedCount} questions remaining to maintain streak.`
                  : 'Daily target fully finished! Consistency streak updated.'}
              </p>
            </div>

            {/* Big Launch Button */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-2.5">
              <button
                onClick={onStartDailyExam}
                className="w-full py-3.5 px-6 rounded-2xl bg-white text-[#064E3B] hover:bg-[#ECFDF5] font-black text-sm transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Play size={16} className="fill-[#064E3B]" />
                <span>Start Daily 45 Exam</span>
              </button>

              <button
                onClick={() => setActiveTab('practice-test')}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Launch Quick 20 Practice Drill</span>
                <ChevronRight size={14} />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* 🚀 QUICK ACCESS HUBS (Eliminating boring UI with distinct purpose tiles) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            title: 'Mistake Notebook',
            count: mistakes.length,
            unit: 'Saved Errors',
            desc: 'Review questions you missed',
            icon: <NotebookPen size={20} className="text-[#059669]" />,
            tab: 'mistake-notebook' as const,
            badge: 'Active Recall'
          },
          {
            title: 'Spaced Revision',
            count: dueRevisionsCount,
            unit: 'Due Today',
            desc: 'Scientific memory booster',
            icon: <BrainCircuit size={20} className="text-[#059669]" />,
            tab: 'revision-center' as const,
            badge: dueRevisionsCount > 0 ? 'Urgent' : 'Clear'
          },
          {
            title: 'Question Bank',
            count: questions.length,
            unit: 'Curated MCQs',
            desc: 'Verified past BCS & Bank',
            icon: <BookOpen size={20} className="text-[#059669]" />,
            tab: 'question-bank' as const,
            badge: 'Verified'
          },
          {
            title: 'Weekly 100 Mock',
            count: '100',
            unit: 'Grand Test',
            desc: 'Full-length simulation',
            icon: <Award size={20} className="text-[#059669]" />,
            tab: 'weekly-mock' as const,
            badge: 'Timed'
          },
        ].map((hub) => (
          <div
            key={hub.title}
            onClick={() => setActiveTab(hub.tab)}
            className="premium-card premium-card-hover rounded-3xl p-5 cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center group-hover:scale-110 transition-transform">
                {hub.icon}
              </div>
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                hub.badge === 'Urgent' ? 'bg-amber-100 text-amber-800' : 'bg-[#ECFDF5] text-[#065F46]'
              }`}>
                {hub.badge}
              </span>
            </div>

            <div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-black text-[#0F172A]">{hub.count}</span>
                <span className="text-xs font-bold text-[#64748B]">{hub.unit}</span>
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] mt-1">{hub.title}</h3>
              <p className="text-xs text-[#64748B] mt-0.5">{hub.desc}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-bold text-[#059669] group-hover:translate-x-0.5 transition-transform">
              <span>Open Module</span>
              <ArrowUpRight size={14} />
            </div>
          </div>
        ))}
      </div>

      {/* 📊 ANALYTICS TRAJECTORY & CORE PERFORMANCE BENTO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Historical Progress Area Graph */}
        <div className="lg:col-span-2 premium-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-extrabold text-[#059669] uppercase tracking-wider">
                <TrendingUp size={14} />
                <span>Accuracy & Score Velocity</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] mt-1">
                Recent Examination Performance Trend
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                Overall Accuracy: {overallAccuracy}%
              </span>
            </div>
          </div>

          {/* Smooth Recharts Area Graph with Emerald Glow */}
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartTrajectory}>
                <defs>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: '16px', 
                    borderColor: '#A7F3D0', 
                    boxShadow: '0 10px 25px -5px rgba(6,78,59,0.1)',
                    fontSize: '12px',
                    fontWeight: 600,
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#059669" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#emeraldGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#F1F5F9] text-xs text-[#64748B]">
            <span>Continuous tracking across {sessions.length} recorded exam attempts</span>
            <button 
              onClick={() => setActiveTab('analytics')}
              className="text-[#059669] font-extrabold hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>Full Analytics Report</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Right Col: 4 Core Subjects Preparedness Radar */}
        <div className="premium-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-[#0F172A] flex items-center space-x-1.5">
                <Target size={16} className="text-[#059669]" />
                <span>Subject Mastery</span>
              </h2>
              <span className="text-xs text-[#64748B] font-bold">Standard Quotas</span>
            </div>

            <div className="space-y-4">
              {[
                { name: 'Bangla', quota: '15 Qs', key: 'Bangla' as const, color: '#059669' },
                { name: 'Mathematics', quota: '10 Qs', key: 'Mathematics' as const, color: '#0284C7' },
                { name: 'General Knowledge', quota: '10 Qs', key: 'General Knowledge' as const, color: '#D97706' },
                { name: 'English', quota: '10 Qs', key: 'English' as const, color: '#7C3AED' },
              ].map(sub => {
                const stat = subjectStats[sub.key];
                const acc = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;

                return (
                  <div key={sub.name} className="bg-[#F8FAF9] p-3 rounded-2xl border border-[#E2E8F0]/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-[#0F172A]">{sub.name}</span>
                        <span className="text-[10px] text-[#64748B] font-semibold">{sub.quota}</span>
                      </div>
                      <span className="font-black text-xs text-[#0F172A]">{acc}%</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${acc}%`, backgroundColor: sub.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('practice-test')}
            className="mt-6 w-full py-2.5 rounded-xl bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#065F46] font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer border border-[#A7F3D0]"
          >
            <span>Custom Subject Drill</span>
            <ChevronRight size={14} />
          </button>
        </div>

      </div>

    </div>
  );
};
