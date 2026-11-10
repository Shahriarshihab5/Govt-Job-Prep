import React, { useState } from 'react';
import { 
  Play, 
  SlidersHorizontal 
} from 'lucide-react';
import { SubjectType, DifficultyLevel, Question } from '../types';
import { ExamEngine } from '../services/examEngine';

interface PracticeTestProps {
  onStartExam: (questions: Question[], timeLimitMinutes: number, title: string) => void;
}

export const PracticeTest: React.FC<PracticeTestProps> = ({ onStartExam }) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | 'All'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'All'>('All');
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [timedMode, setTimedMode] = useState<boolean>(true);
  const [timeMinutes, setTimeMinutes] = useState<number>(20);

  const handleStartCustom = () => {
    const questions = ExamEngine.generateCustomPractice({
      subject: selectedSubject,
      difficulty: selectedDifficulty,
      count: questionCount,
    });

    if (questions.length === 0) {
      alert('No questions match this selection in the question bank.');
      return;
    }

    onStartExam(questions, timedMode ? timeMinutes : 0, `${selectedSubject} Practice Test`);
  };

  const handleQuickMiniTest = (subject: SubjectType | 'All') => {
    const questions = ExamEngine.generateCustomPractice({
      subject,
      difficulty: 'All',
      count: 20,
    });
    onStartExam(questions, 20, `Quick 20-Question ${subject === 'All' ? 'Mixed' : subject} Mini-Exam`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111418]">
          Custom Practice & Mini Exams
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Configure untimed practice sessions or quick 20-question blitz tests.
        </p>
      </div>

      {/* Preset Mini Tests */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Mixed 20 Mini Test', count: 20, time: 20, subject: 'All' as const, desc: 'BCS 4-subject blend' },
          { label: 'Bangla Rapid Test', count: 20, time: 20, subject: 'Bangla' as const, desc: 'Grammar & Literature' },
          { label: 'Math Intensive', count: 20, time: 25, subject: 'Mathematics' as const, desc: 'Arithmetic & Formulas' },
          { label: 'GK & English Drill', count: 20, time: 18, subject: 'General Knowledge' as const, desc: 'High yield questions' },
        ].map((preset, idx) => (
          <div 
            key={idx}
            className="bg-white rounded-3xl p-5 border border-[#EAE3DC] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#64748B] mb-2">
                <span>PRESET MINI</span>
                <span className="text-[#FD6960]">{preset.count} Qs</span>
              </div>
              <h3 className="text-base font-bold text-[#111418]">{preset.label}</h3>
              <p className="text-xs text-[#64748B] mt-1">{preset.desc}</p>
            </div>

            <button
              onClick={() => handleQuickMiniTest(preset.subject)}
              className="mt-4 w-full py-2.5 rounded-full bg-[#111418] text-white hover:bg-[#20232A] text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Play size={13} className="fill-white" />
              <span>Launch Drill</span>
            </button>
          </div>
        ))}
      </div>

      {/* Builder */}
      <div className="bg-white border border-[#EAE3DC] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <h2 className="text-lg font-bold text-[#111418] flex items-center space-x-2">
          <SlidersHorizontal size={18} className="text-[#FD6960]" />
          <span>Custom Test Configuration</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-[#64748B] font-bold block mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value as any)}
              className="w-full bg-[#F8F5F2] border border-[#EAE3DC] rounded-xl p-3 font-medium text-[#111418]"
            >
              <option value="All">All 4 Subjects Combined</option>
              <option value="Bangla">Bangla</option>
              <option value="Mathematics">Mathematics</option>
              <option value="General Knowledge">General Knowledge</option>
              <option value="English">English</option>
            </select>
          </div>

          <div>
            <label className="text-[#64748B] font-bold block mb-1">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={e => setSelectedDifficulty(e.target.value as any)}
              className="w-full bg-[#F8F5F2] border border-[#EAE3DC] rounded-xl p-3 font-medium text-[#111418]"
            >
              <option value="All">Mixed Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="text-[#64748B] font-bold block mb-1">Number of Questions</label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 20, 30, 50].map(cnt => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => {
                    setQuestionCount(cnt);
                    setTimeMinutes(cnt);
                  }}
                  className={`py-2 rounded-xl border text-center font-bold ${
                    questionCount === cnt ? 'bg-[#111418] text-white border-[#111418]' : 'bg-[#F8F5F2] text-[#64748B] border-[#EAE3DC]'
                  }`}
                >
                  {cnt} Q
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[#64748B] font-bold block mb-1">Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTimedMode(true)}
                className={`py-2 rounded-xl border text-center font-bold ${
                  timedMode ? 'bg-[#111418] text-white border-[#111418]' : 'bg-[#F8F5F2] text-[#64748B] border-[#EAE3DC]'
                }`}
              >
                Timed ({timeMinutes} min)
              </button>
              <button
                type="button"
                onClick={() => setTimedMode(false)}
                className={`py-2 rounded-xl border text-center font-bold ${
                  !timedMode ? 'bg-[#111418] text-white border-[#111418]' : 'bg-[#F8F5F2] text-[#64748B] border-[#EAE3DC]'
                }`}
              >
                Untimed Practice
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#F1EAE5]">
          <button
            onClick={handleStartCustom}
            className="flex items-center space-x-2 px-6 py-3 rounded-full bg-[#111418] text-white font-bold text-xs hover:bg-[#20232A] cursor-pointer shadow-xs"
          >
            <Play size={14} className="fill-white" />
            <span>Generate & Start Test</span>
          </button>
        </div>
      </div>
    </div>
  );
};
