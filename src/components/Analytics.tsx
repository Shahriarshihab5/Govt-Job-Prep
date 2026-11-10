import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
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

  // Subject Analytics
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111418]">
            Progress Analytics & Past Score Insights
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Computed automatically from your stored exam attempts • 100% Free
          </p>
        </div>

        <div className="flex bg-white border border-[#EAE3DC] p-1 rounded-full text-xs font-bold">
          {(['daily', 'weekly', 'monthly'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setViewRange(tab)}
              className={`px-4 py-1.5 rounded-full capitalize cursor-pointer transition-all ${
                viewRange === tab ? 'bg-[#111418] text-white shadow-xs' : 'text-[#64748B] hover:text-[#111418]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid (Clean White Card Design) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-[#EAE3DC] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="text-xs text-[#64748B] font-medium">Total MCQs Attempted</div>
          <div className="text-3xl font-extrabold text-[#111418] my-1">{totalAttempted}</div>
          <div className="text-[11px] text-[#10B981] font-bold">{totalCorrect} correct answers</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#EAE3DC] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="text-xs text-[#64748B] font-medium">Overall Accuracy</div>
          <div className="text-3xl font-extrabold text-[#4A4DE6] my-1">{overallAccuracy}%</div>
          <div className="text-[11px] text-[#64748B]">Target: &gt; 70% threshold</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#EAE3DC] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="text-xs text-[#64748B] font-medium">Avg Speed / MCQ</div>
          <div className="text-3xl font-extrabold text-[#FD6960] my-1">{avgTimePerQuestion}s</div>
          <div className="text-[11px] text-[#64748B]">PSC pace: &lt; 55s</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#EAE3DC] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="text-xs text-[#64748B] font-medium">Exams Taken</div>
          <div className="text-3xl font-extrabold text-[#111418] my-1">{sessions.length}</div>
          <div className="text-[11px] text-[#64748B]">Daily & custom sessions</div>
        </div>
      </div>

      {/* Charts (Area & Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trajectory */}
        <div className="bg-white rounded-3xl p-6 border border-[#EAE3DC] shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          <h2 className="text-base font-bold text-[#111418] mb-4">
            Historical Score & Accuracy Progression
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sessionsTrajectory}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A4DE6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#4A4DE6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="session" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', borderColor: '#EAE3DC', fontSize: '12px' }} 
                />
                <Area type="monotone" dataKey="accuracy" stroke="#4A4DE6" strokeWidth={3} fillOpacity={1} fill="url(#scoreColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Comparison */}
        <div className="bg-white rounded-3xl p-6 border border-[#EAE3DC] shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          <h2 className="text-base font-bold text-[#111418] mb-4">
            Subject-Wise Accuracy Comparison (%)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChartData}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', borderColor: '#EAE3DC', fontSize: '12px' }} 
                />
                <Bar dataKey="Accuracy" fill="#FD6960" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weak Topics Diagnostic */}
      {weakTopics.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-[#EAE3DC] shadow-xs">
          <h2 className="text-base font-bold text-[#111418] mb-3 flex items-center space-x-2">
            <AlertTriangle size={16} className="text-[#FD6960]" />
            <span>Target Attention Topics (Lowest Performing Areas)</span>
          </h2>
          <div className="divide-y divide-[#F1EAE5]">
            {weakTopics.map(w => (
              <div key={w.topic} className="py-3 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#111418]">{w.topic}</span>
                <div className="flex items-center space-x-3">
                  <span className="text-[#64748B]">{w.total} attempted</span>
                  <span className={`px-2.5 py-1 rounded-full font-bold ${
                    w.accuracy >= 65 ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#EF4444]/15 text-[#EF4444]'
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
