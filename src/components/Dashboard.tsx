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

  const chartTrajectory = sessions.length > 0
    ? [...sessions].reverse().slice(-8).map((s, idx) => ({
        label: `T${idx + 1}`,
        score: s.score,
        accuracy: s.accuracy,
      }))
    : [
        { label: 'S1', score: 28, accuracy: 62 },
        { label: 'S2', score: 32, accuracy: 71 },
        { label: 'S3', score: 35, accuracy: 78 },
        { label: 'S4', score: 38, accuracy: 84 },
        { label: 'S5', score: 42, accuracy: 93 },
      ];

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
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      
      {/* Responsive Hero Command Center */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#064E3B] via-[#065F46] to-[#022C22] text-white p-4 sm:p-8 shadow-[0_12px_40px_-8px_rgba(6,78,59,0.3)] border border-[#059669]/30">
        
        <div className="absolute -top-20 -right-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-[#10B981]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 sm:gap-6">
          
          {/* Left Message */}
          <div className="space-y-2 sm:space-y-3">
            <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-extrabold uppercase tracking-wider text-[#6EE7B7]">
              <Sparkles size={12} className="text-[#34D399]" />
              <span>Target 46th BCS & Recruitment</span>
            </div>

            <h1 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl tracking-tight leading-snug">
              Master Bangladesh Govt Job MCQs.
            </h1>

            <p className="text-xs sm:text-sm text-[#D1FAE5]/85 font-medium leading-relaxed max-w-xl">
              Daily 45 MCQs, spaced repetition review, and automatic mistake tracking on your phone.
            </p>

            <div className="pt-1 flex flex-wrap gap-1.5 text-[11px] font-semibold text-[#A7F3D0]">
              <span className="bg-black/20 px-2.5 py-0.5 rounded-full border border-white/10">
                ✓ 15 Bangla • 10 Math • 10 GK • 10 English
              </span>
              <span className="bg-black/20 px-2.5 py-0.5 rounded-full border border-white/10">
                ✓ Negative mark -0.5
              </span>
            </div>
          </div>

          {/* Right Action Box */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col justify-between w-full lg:w-80 shrink-0">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-[#A7F3D0] mb-1 uppercase tracking-wider">
                <span>Today's Quota</span>
                <span className="bg-[#10B981]/30 text-white px-2 py-0.5 rounded-full text-[10px]">
                  {todayActivity.completedCount >= todayActivity.targetCount ? 'Achieved ✓' : 'Incomplete'}
                </span>
              </div>

              <div className="flex items-baseline space-x-2 my-1">
                <span className="text-3xl sm:text-4xl font-black text-white">
                  {todayActivity.completedCount}
                </span>
                <span className="text-base text-[#A7F3D0] font-bold">
                  / {todayActivity.targetCount} MCQs
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden my-2">
                <div 
                  className="h-full bg-gradient-to-r from-[#34D399] to-[#6EE7B7] rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (todayActivity.completedCount / todayActivity.targetCount) * 100)}%` }}
                />
              </div>

              <p className="text-[11px] text-[#D1FAE5]/80">
                {todayActivity.targetCount - todayActivity.completedCount > 0 
                  ? `${todayActivity.targetCount - todayActivity.completedCount} questions left today.`
                  : 'Daily target achieved! Streak updated.'}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-2">
              <button
                onClick={onStartDailyExam}
                className="w-full py-3 px-4 rounded-xl sm:rounded-2xl bg-white text-[#064E3B] hover:bg-[#ECFDF5] font-black text-xs sm:text-sm transition-all shadow-md active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Play size={15} className="fill-[#064E3B]" />
                <span>Start Daily 45 Exam</span>
              </button>

              <button
                onClick={() => setActiveTab('practice-test')}
                className="w-full py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Quick 20 Drill</span>
                <ChevronRight size={13} />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* 4 Feature Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
        {[
          {
            title: 'Mistakes',
            count: mistakes.length,
            unit: 'Logged',
            desc: 'Review errors',
            icon: <NotebookPen size={18} className="text-[#059669]" />,
            tab: 'mistake-notebook' as const,
            badge: 'Recall'
          },
          {
            title: 'Spaced SRS',
            count: dueRevisionsCount,
            unit: 'Due',
            desc: 'Retention queue',
            icon: <BrainCircuit size={18} className="text-[#059669]" />,
            tab: 'revision-center' as const,
            badge: dueRevisionsCount > 0 ? 'Urgent' : 'Clear'
          },
          {
            title: 'Questions',
            count: questions.length,
            unit: 'MCQs',
            desc: 'Verified past sets',
            icon: <BookOpen size={18} className="text-[#059669]" />,
            tab: 'question-bank' as const,
            badge: 'Verified'
          },
          {
            title: '100 Mock',
            count: '100',
            unit: 'Grand',
            desc: 'Full simulation',
            icon: <Award size={18} className="text-[#059669]" />,
            tab: 'weekly-mock' as const,
            badge: 'Timed'
          },
        ].map((hub) => (
          <div
            key={hub.title}
            onClick={() => setActiveTab(hub.tab)}
            className="premium-card rounded-2xl p-3.5 sm:p-5 cursor-pointer flex flex-col justify-between active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center">
                {hub.icon}
              </div>
              <span className={`text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                hub.badge === 'Urgent' ? 'bg-amber-100 text-amber-800' : 'bg-[#ECFDF5] text-[#065F46]'
              }`}>
                {hub.badge}
              </span>
            </div>

            <div>
              <div className="flex items-baseline space-x-1">
                <span className="text-xl sm:text-3xl font-black text-[#0F172A]">{hub.count}</span>
                <span className="text-[10px] sm:text-xs font-bold text-[#64748B]">{hub.unit}</span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] mt-0.5 truncate">{hub.title}</h3>
            </div>

            <div className="mt-2 pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] font-bold text-[#059669]">
              <span>Open</span>
              <ArrowUpRight size={13} />
            </div>
          </div>
        ))}
      </div>

      {/* Analytics & Subject Breakdown Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Progress Graph */}
        <div className="lg:col-span-2 premium-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-extrabold text-[#059669] uppercase">
                <TrendingUp size={13} />
                <span>Accuracy Trend</span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-[#0F172A]">
                Score Velocity
              </h2>
            </div>

            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
              Avg: {overallAccuracy}%
            </span>
          </div>

          <div className="h-44 sm:h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartTrajectory}>
                <defs>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: '12px', 
                    borderColor: '#A7F3D0', 
                    fontSize: '11px',
                    fontWeight: 600,
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#059669" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#emeraldGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9] text-xs text-[#64748B]">
            <span>{sessions.length} sessions logged</span>
            <button 
              onClick={() => setActiveTab('analytics')}
              className="text-[#059669] font-bold hover:underline flex items-center space-x-0.5 cursor-pointer"
            >
              <span>Full Analytics</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* 4 Subjects Quota Bars */}
        <div className="premium-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm sm:text-base font-extrabold text-[#0F172A] flex items-center space-x-1.5">
                <Target size={15} className="text-[#059669]" />
                <span>Subject Quotas</span>
              </h2>
              <span className="text-[11px] text-[#64748B]">45 Target</span>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Bangla', quota: '15 Q', key: 'Bangla' as const, color: '#059669' },
                { name: 'Mathematics', quota: '10 Q', key: 'Mathematics' as const, color: '#0284C7' },
                { name: 'General Knowledge', quota: '10 Q', key: 'General Knowledge' as const, color: '#D97706' },
                { name: 'English', quota: '10 Q', key: 'English' as const, color: '#7C3AED' },
              ].map(sub => {
                const stat = subjectStats[sub.key];
                const acc = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;

                return (
                  <div key={sub.name} className="bg-[#F8FAF9] p-2.5 rounded-xl border border-[#E2E8F0]/80">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-[#0F172A]">{sub.name}</span>
                        <span className="text-[10px] text-[#64748B] font-semibold">{sub.quota}</span>
                      </div>
                      <span className="font-black text-xs text-[#0F172A]">{acc}%</span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
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
            className="mt-4 w-full py-2 rounded-xl bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#065F46] font-bold text-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer border border-[#A7F3D0]"
          >
            <span>Subject Drill</span>
            <ChevronRight size={13} />
          </button>
        </div>

      </div>

    </div>
  );
};
