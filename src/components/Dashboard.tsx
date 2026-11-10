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
  ShieldCheck,
  ChevronRight,
  Sparkles
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

  // Real chart trajectory data
  const chartTrajectory = sessions.length > 0
    ? [...sessions].reverse().map((s, idx) => ({
        label: `Test ${idx + 1}`,
        score: s.score,
        accuracy: s.accuracy,
      }))
    : [
        { label: 'W1', score: 28, accuracy: 62 },
        { label: 'W2', score: 32, accuracy: 71 },
        { label: 'W3', score: 35, accuracy: 78 },
        { label: 'W4', score: 38, accuracy: 84 },
        { label: 'W5', score: 41, accuracy: 91 },
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
    <div className="space-y-6">
      {/* Title & Date Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111418]">
            Study Workspace
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Bangladesh Government Recruitment Platform • 45 Daily MCQs Target
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onStartDailyExam}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#111418] text-white text-xs font-bold hover:bg-[#20232A] transition-all shadow-sm cursor-pointer"
          >
            <Play size={14} className="fill-white" />
            <span>Launch Daily 45 MCQ Test</span>
          </button>
        </div>
      </div>

      {/* Hero Grid Section (Matching Deodel Reference Card Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col (2-Spans): Vibrant Coral/Violet Gradient Chart Hero Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#EAE3DC] shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          
          {/* Card Header with Top Gradient Banner */}
          <div className="rounded-2xl p-5 text-white bg-gradient-to-r from-[#FF5E5B] via-[#D84374] to-[#4A4DE6] shadow-sm mb-6">
            <div className="flex items-center justify-between text-xs font-medium opacity-90 mb-3">
              <span className="font-bold tracking-wide uppercase text-[11px]">Examination Preparedness & Trajectory</span>
              <span className="text-[11px] bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Metric Numbers */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-2xl sm:text-3xl font-black">{overallAccuracy}%</span>
                  <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded-full font-bold">+2.4%</span>
                </div>
                <div className="text-[11px] opacity-80 font-medium">Overall Accuracy</div>
              </div>

              <div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-2xl sm:text-3xl font-black">{todayActivity.completedCount}/{todayActivity.targetCount}</span>
                  <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded-full font-bold">Target</span>
                </div>
                <div className="text-[11px] opacity-80 font-medium">Today's Completed</div>
              </div>

              <div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-2xl sm:text-3xl font-black">{streakStats.currentStreak}d</span>
                  <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded-full font-bold">Streak</span>
                </div>
                <div className="text-[11px] opacity-80 font-medium">Consecutive Days</div>
              </div>
            </div>
          </div>

          {/* Smooth Area Chart (like Reference Graphic) */}
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartTrajectory}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FD6960" stopOpacity={0.28}/>
                    <stop offset="95%" stopColor="#4A4DE6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: '12px', 
                    borderColor: '#EAE3DC', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    fontSize: '12px' 
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#FD6960" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#scoreGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#F1EAE5] text-xs text-[#64748B]">
            <span>Benchmark: Standard 70%+ score for BCS Preliminary qualification</span>
            <button 
              onClick={() => setActiveTab('analytics')}
              className="text-[#111418] font-bold hover:underline flex items-center space-x-1"
            >
              <span>View Full Diagnostic</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Right Col: Goal Focus & Modern Architectural Badge Card */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Target Progress Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#EAE3DC] shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#64748B] mb-2 font-medium">
              <span>Daily Target Completion</span>
              <button 
                onClick={() => setActiveTab('daily-exam')}
                className="w-7 h-7 rounded-full bg-[#F8F5F2] hover:bg-[#F1EAE5] flex items-center justify-center text-[#111418]"
              >
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="my-2">
              <div className="text-4xl font-extrabold text-[#111418]">
                {Math.round((todayActivity.completedCount / todayActivity.targetCount) * 100)}%
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                {todayActivity.completedCount} of {todayActivity.targetCount} MCQs finished today
              </p>
            </div>

            {/* Custom Multi-Segment Progress Bar */}
            <div className="mt-4">
              <div className="w-full h-3 rounded-full bg-[#F1EAE5] overflow-hidden flex">
                <div 
                  className="h-full bg-gradient-to-r from-[#FD6960] to-[#8054F2] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (todayActivity.completedCount / todayActivity.targetCount) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Revision Callout */}
          <div className="bg-white rounded-3xl p-6 border border-[#EAE3DC] shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#64748B] mb-2 font-medium">
              <span>Spaced Revision Queue</span>
              <button 
                onClick={() => setActiveTab('revision-center')}
                className="w-7 h-7 rounded-full bg-[#F8F5F2] hover:bg-[#F1EAE5] flex items-center justify-center text-[#111418]"
              >
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="my-2">
              <div className="text-4xl font-extrabold text-[#111418]">
                {dueRevisionsCount} <span className="text-sm font-normal text-[#64748B]">Due Today</span>
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                {mistakes.length} mistakes saved in smart notebook
              </p>
            </div>

            <button
              onClick={() => setActiveTab('revision-center')}
              className="mt-3 w-full py-2.5 rounded-full bg-[#F8F5F2] hover:bg-[#F1EAE5] text-[#111418] text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
            >
              <RotateCcw size={13} />
              <span>Review Missed Questions</span>
            </button>
          </div>
        </div>

      </div>

      {/* Bento Grid: 4 Core Subjects Preparedness Cards (Clean Light aesthetic) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: 'Bangla', quota: '15 Q', key: 'Bangla' as const, color: '#FD6960' },
          { name: 'Mathematics', quota: '10 Q', key: 'Mathematics' as const, color: '#4A4DE6' },
          { name: 'General Knowledge', quota: '10 Q', key: 'General Knowledge' as const, color: '#10B981' },
          { name: 'English', quota: '10 Q', key: 'English' as const, color: '#F59E0B' },
        ].map((sub) => {
          const stat = subjectStats[sub.key];
          const acc = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;

          return (
            <div 
              key={sub.name}
              className="bg-white rounded-3xl p-5 border border-[#EAE3DC] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs font-medium text-[#64748B] mb-2">
                <span className="font-bold text-[#111418]">{sub.name}</span>
                <span className="bg-[#F8F5F2] px-2 py-0.5 rounded-full text-[10px] font-bold">{sub.quota}</span>
              </div>

              <div className="my-2">
                <div className="text-3xl font-extrabold text-[#111418]">{acc}%</div>
                <div className="text-[11px] text-[#64748B] mt-0.5">
                  {stat.correct}/{stat.total} Correct
                </div>
              </div>

              <div className="w-full h-1.5 rounded-full bg-[#F1EAE5] mt-2 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ width: `${acc}%`, backgroundColor: sub.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Provenance and Integrity Banner */}
      <div className="bg-white rounded-2xl p-4 border border-[#EAE3DC] flex items-center justify-between text-xs text-[#64748B] shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center font-bold">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <span className="font-bold text-[#111418]">Authentic Provenance: </span>
            Verified BCS, Primary Teacher, and Bank questions are prioritized. AI practice questions are strictly tagged.
          </div>
        </div>
        <div className="hidden sm:block text-[11px] font-bold text-[#111418] bg-[#F8F5F2] px-3 py-1 rounded-full">
          Free Tier • IndexedDB Powered
        </div>
      </div>
    </div>
  );
};
