import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  BarChart3,
  Calendar,
  Sparkles
} from 'lucide-react';
import { AppStorage } from '../services/storage';

export const Analytics: React.FC = () => {
  const [viewRange, setViewRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  
  const attempts = AppStorage.getAttempts();
  const sessions = AppStorage.getSessions();
  const questions = AppStorage.getQuestions();

  const totalAttempted = attempts.length;
  const totalCorrect = attempts.filter(a => a.isCorrect).length;
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const totalSeconds = attempts.reduce((acc, a) => acc + (a.timeSpentSeconds || 0), 0);
  const avgTimePerQuestion = totalAttempted > 0 ? Math.round(totalSeconds / totalAttempted) : 0;

  const subjectMap: Record<string, { total: number; correct: number }> = {
    Bangla: { total: 0, correct: 0 },
    Mathematics: { total: 0, correct: 0 },
    'General Knowledge': { total: 0, correct: 0 },
    English: { total: 0, correct: 0 },
  };

  const topicMap: Record<string, { total: number; correct: number }> = {};

  attempts.forEach(a => {
    const q = questions.find(item => item.id === a.questionId);
    if (q) {
      if (subjectMap[q.subject]) {
        subjectMap[q.subject].total += 1;
        if (a.isCorrect) subjectMap[q.subject].correct += 1;
      }
      if (q.topic) {
        if (!topicMap[q.topic]) topicMap[q.topic] = { total: 0, correct: 0 };
        topicMap[q.topic].total += 1;
        if (a.isCorrect) topicMap[q.topic].correct += 1;
      }
    }
  });

  const subjectChartData = Object.keys(subjectMap).map(sub => ({
    name: sub.replace('General Knowledge', 'GK'),
    Accuracy: subjectMap[sub].total > 0 ? Math.round((subjectMap[sub].correct / subjectMap[sub].total) * 100) : 0,
    Attempted: subjectMap[sub].total,
  }));

  const sessionsTrajectory = sessions.length > 0
    ? [...sessions].reverse().map((s, idx) => ({
        session: `#${idx + 1}`,
        score: s.score,
        accuracy: s.accuracy,
      }))
    : [
        { session: '#1', score: 26, accuracy: 58 },
        { session: '#2', score: 32, accuracy: 71 },
        { session: '#3', score: 35, accuracy: 77 },
        { session: '#4', score: 40, accuracy: 89 },
      ];

  const weakTopics = Object.keys(topicMap)
    .filter(t => topicMap[t].total >= 1)
    .map(t => ({
      topic: t,
      accuracy: Math.round((topicMap[t].correct / topicMap[t].total) * 100),
      total: topicMap[t].total,
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 4);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-[#0F172A]">
            Performance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Stored exam attempts & speed metrics
          </p>
        </div>

        <div className="flex bg-white border border-[#E2E8F0] p-1 rounded-full text-xs font-bold w-fit">
          {(['daily', 'weekly', 'monthly'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setViewRange(tab)}
              className={`px-3 sm:px-4 py-1.5 rounded-full capitalize cursor-pointer transition-all ${
                viewRange === tab ? 'bg-[#059669] text-white shadow-xs' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="premium-card rounded-2xl p-4 sm:p-5">
          <div className="text-[11px] sm:text-xs text-[#64748B] font-bold">MCQs Attempted</div>
          <div className="text-2xl sm:text-3xl font-black text-[#0F172A] my-1">{totalAttempted}</div>
          <div className="text-[10px] sm:text-[11px] text-[#059669] font-bold">{totalCorrect} correct</div>
        </div>

        <div className="premium-card rounded-2xl p-4 sm:p-5">
          <div className="text-[11px] sm:text-xs text-[#64748B] font-bold">Accuracy</div>
          <div className="text-2xl sm:text-3xl font-black text-[#059669] my-1">{overallAccuracy}%</div>
          <div className="text-[10px] sm:text-[11px] text-[#64748B]">Target &gt; 70%</div>
        </div>

        <div className="premium-card rounded-2xl p-4 sm:p-5">
          <div className="text-[11px] sm:text-xs text-[#64748B] font-bold">Speed / MCQ</div>
          <div className="text-2xl sm:text-3xl font-black text-[#0284C7] my-1">{avgTimePerQuestion}s</div>
          <div className="text-[10px] sm:text-[11px] text-[#64748B]">Benchmark &lt; 50s</div>
        </div>

        <div className="premium-card rounded-2xl p-4 sm:p-5">
          <div className="text-[11px] sm:text-xs text-[#64748B] font-bold">Exams Taken</div>
          <div className="text-2xl sm:text-3xl font-black text-[#0F172A] my-1">{sessions.length}</div>
          <div className="text-[10px] sm:text-[11px] text-[#64748B]">Daily & Drills</div>
        </div>
      </div>

      {/* Charts (Area & Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="premium-card rounded-2xl sm:rounded-3xl p-4 sm:p-6">
          <h2 className="text-sm sm:text-base font-bold text-[#0F172A] mb-3">
            Score Progression Trajectory
          </h2>
          <div className="h-52 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sessionsTrajectory}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="session" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', borderColor: '#E2E8F0', fontSize: '11px' }} 
                />
                <Area type="monotone" dataKey="accuracy" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-card rounded-2xl sm:rounded-3xl p-4 sm:p-6">
          <h2 className="text-sm sm:text-base font-bold text-[#0F172A] mb-3">
            Subject Accuracy (%)
          </h2>
          <div className="h-52 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChartData}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', borderColor: '#E2E8F0', fontSize: '11px' }} 
                />
                <Bar dataKey="Accuracy" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weak Topics */}
      {weakTopics.length > 0 && (
        <div className="premium-card rounded-2xl sm:rounded-3xl p-4 sm:p-6">
          <h2 className="text-sm sm:text-base font-bold text-[#0F172A] mb-3 flex items-center space-x-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <span>Topics Requiring Attention</span>
          </h2>
          <div className="divide-y divide-[#F1F5F9]">
            {weakTopics.map(w => (
              <div key={w.topic} className="py-2.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#0F172A] truncate pr-2">{w.topic}</span>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[#64748B] text-[11px]">{w.total} attempts</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    w.accuracy >= 65 ? 'bg-[#ECFDF5] text-[#065F46]' : 'bg-red-50 text-red-600'
                  }`}>
                    {w.accuracy}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
