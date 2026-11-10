import React, { useState } from 'react';
import { 
  Play, 
  Award, 
  Clock 
} from 'lucide-react';
import { Question } from '../types';
import { ExamEngine } from '../services/examEngine';
import { AppStorage } from '../services/storage';

interface WeeklyMockProps {
  onStartExam: (questions: Question[], timeLimitMinutes: number, title: string) => void;
}

export const WeeklyMock: React.FC<WeeklyMockProps> = ({ onStartExam }) => {
  const settings = AppStorage.getSettings();

  const handleStart100Mock = () => {
    const set = ExamEngine.generateDailyExam({
      targetCount: 50,
      subjectQuotas: {
        Bangla: 15,
        Mathematics: 12,
        'General Knowledge': 12,
        English: 11
      }
    });

    const fullMock: Question[] = [
      ...set.questions,
      ...set.questions.map((q, i) => ({ ...q, id: `${q.id}_mock_part2_${i}` }))
    ].slice(0, 100);

    onStartExam(fullMock, 100, 'Weekly 100-Question Grand Mock Test');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#EAE3DC] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase px-3 py-1 rounded-full bg-[#111418] text-white">
            Weekly 7-Day Target
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111418]">
            100-Question Grand Mock Test
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-xl">
            A full-length timed simulation covering all 4 core subjects in authentic proportion. 
            Measures readiness under strict time constraints.
          </p>
        </div>

        <button
          onClick={handleStart100Mock}
          className="flex items-center space-x-2 px-6 py-3.5 rounded-full bg-[#FD6960] text-white font-bold text-xs hover:bg-[#F25C54] shadow-sm cursor-pointer transition-all shrink-0"
        >
          <Play size={16} className="fill-white" />
          <span>Start 100 MCQ Mock</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white rounded-3xl p-5 border border-[#EAE3DC] shadow-xs">
          <div className="text-[#64748B] font-medium">Questions</div>
          <div className="text-3xl font-black text-[#111418] my-1">100 MCQs</div>
          <p className="text-[11px] text-[#64748B]">Bangla, Math, GK & English</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#EAE3DC] shadow-xs">
          <div className="text-[#64748B] font-medium">Time Limit</div>
          <div className="text-3xl font-black text-[#4A4DE6] my-1">100 Mins</div>
          <p className="text-[11px] text-[#64748B]">1 min per question pace</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#EAE3DC] shadow-xs">
          <div className="text-[#64748B] font-medium">Negative Marking</div>
          <div className="text-3xl font-black text-[#EF4444] my-1">
            {settings.enableNegativeMarking ? `-${settings.negativeMarkValue}` : 'None'}
          </div>
          <p className="text-[11px] text-[#64748B]">Official PSC standard</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#EAE3DC] shadow-xs">
          <div className="text-[#64748B] font-medium">Cutoff Target</div>
          <div className="text-3xl font-black text-[#10B981] my-1">65+ Marks</div>
          <p className="text-[11px] text-[#64748B]">Preliminary benchmark</p>
        </div>
      </div>
    </div>
  );
};
