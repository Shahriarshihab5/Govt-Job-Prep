import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ExamEngineView } from './components/ExamEngineView';
import { QuestionBank } from './components/QuestionBank';
import { MistakeNotebook } from './components/MistakeNotebook';
import { PracticeTest } from './components/PracticeTest';
import { RevisionCenter } from './components/RevisionCenter';
import { Analytics } from './components/Analytics';
import { AIGenerator } from './components/AIGenerator';
import { WeeklyMock } from './components/WeeklyMock';
import { SettingsView } from './components/SettingsView';
import { ExamEngine } from './services/examEngine';
import { Question } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  const [examActive, setExamActive] = useState<boolean>(false);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [examSessionType, setExamSessionType] = useState<'daily' | 'mock' | 'custom' | 'revision'>('daily');
  const [examTimeLimit, setExamTimeLimit] = useState<number>(45);

  const startDailyExam = () => {
    const generated = ExamEngine.generateDailyExam();
    setExamQuestions(generated.questions);
    setExamSessionType('daily');
    setExamTimeLimit(45);
    setExamActive(true);
  };

  const startCustomExam = (questions: Question[], timeLimitMinutes: number) => {
    setExamQuestions(questions);
    setExamSessionType('custom');
    setExamTimeLimit(timeLimitMinutes);
    setExamActive(true);
  };

  const startRevisionExam = (questions: Question[]) => {
    setExamQuestions(questions);
    setExamSessionType('revision');
    setExamTimeLimit(Math.max(10, questions.length));
    setExamActive(true);
  };

  const handleFinishExam = () => {
    setExamActive(false);
    setActiveTab('dashboard');
  };

  const handleCancelExam = () => {
    const confirmCancel = window.confirm('Exit the current examination? Answers will not be recorded.');
    if (confirmCancel) {
      setExamActive(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-body selection:bg-[#059669] selection:text-white">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        examInProgress={examActive} 
        onQuickStartDaily={startDailyExam}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {examActive ? (
          <ExamEngineView
            questions={examQuestions}
            sessionType={examSessionType}
            timeLimitMinutes={examTimeLimit}
            onFinish={handleFinishExam}
            onCancel={handleCancelExam}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard 
                setActiveTab={setActiveTab} 
                onStartDailyExam={startDailyExam} 
              />
            )}

            {activeTab === 'daily-exam' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="premium-card rounded-3xl p-8 sm:p-10 text-center space-y-5">
                  <span className="text-xs font-extrabold uppercase px-3.5 py-1 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                    Official Examination Simulator
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
                    Start Today's 45-Question Test
                  </h2>
                  <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
                    Automatically assembled with 15 Bangla, 10 Mathematics, 10 General Knowledge, and 10 English questions. Standard negative marking (-0.5) enforced.
                  </p>
                  <button
                    onClick={startDailyExam}
                    className="emerald-btn text-white font-black text-sm px-8 py-4 rounded-full cursor-pointer shadow-xl hover:scale-105 transition-transform"
                  >
                    Launch 45 MCQ Daily Exam Now
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'practice-test' && (
              <PracticeTest onStartExam={startCustomExam} />
            )}

            {activeTab === 'question-bank' && (
              <QuestionBank />
            )}

            {activeTab === 'mistake-notebook' && (
              <MistakeNotebook onPracticeMistakes={startRevisionExam} />
            )}

            {activeTab === 'revision-center' && (
              <RevisionCenter onPracticeRevision={startRevisionExam} />
            )}

            {activeTab === 'analytics' && (
              <Analytics />
            )}

            {activeTab === 'ai-generator' && (
              <AIGenerator />
            )}

            {activeTab === 'weekly-mock' && (
              <WeeklyMock onStartExam={startCustomExam} />
            )}

            {activeTab === 'settings' && (
              <SettingsView />
            )}
          </>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white/70 backdrop-blur-md py-4 text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#059669]" />
            <span>GovtPrep BD • High Performance Study Platform</span>
          </div>
          <div className="font-medium text-[#64748B]">
            PWA Mobile Optimized • IndexedDB Offline Storage • 100% Free Tier
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
