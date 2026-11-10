import React from 'react';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';
import { AppStorage } from '../services/storage';
import { Question } from '../types';

interface RevisionCenterProps {
  onPracticeRevision: (questions: Question[]) => void;
}

export const RevisionCenter: React.FC<RevisionCenterProps> = ({ onPracticeRevision }) => {
  const revisions = AppStorage.getRevisionSchedule();
  const allQuestions = AppStorage.getQuestions();
  const now = new Date();

  const mappedList = revisions.map(r => {
    const q = allQuestions.find(item => item.id === r.questionId);
    const dueDate = new Date(r.dueAt);
    const isDue = dueDate <= now;
    return {
      schedule: r,
      question: q,
      isDue,
      dueDate,
    };
  }).filter(item => item.question !== undefined) as Array<{
    schedule: typeof revisions[0];
    question: Question;
    isDue: boolean;
    dueDate: Date;
  }>;

  const dueItems = mappedList.filter(item => item.isDue);
  const upcomingItems = mappedList.filter(item => !item.isDue);

  const handleStartDueRevision = () => {
    const qs = dueItems.map(d => d.question);
    if (qs.length === 0) return;
    onPracticeRevision(qs);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#EAE3DC] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
        <div>
          <span className="text-[11px] font-bold uppercase px-3 py-1 rounded-full bg-[#10B981]/15 text-[#10B981]">
            Spaced Repetition Engine (SRS)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111418] mt-2">
            Revision Center
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-xl">
            Missed questions are resurfaced scientifically: Day 1 → Day 2 → Day 7 → Day 15 → Day 30.
          </p>
        </div>

        {dueItems.length > 0 && (
          <button
            onClick={handleStartDueRevision}
            className="flex items-center space-x-2 px-6 py-3 rounded-full bg-[#111418] text-white text-xs font-bold hover:bg-[#20232A] cursor-pointer shadow-xs shrink-0"
          >
            <Play size={14} className="fill-white" />
            <span>Practice Due ({dueItems.length})</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-[#EAE3DC] shadow-xs text-center">
          <div className="text-xs text-[#64748B] font-medium">Due Today</div>
          <div className="text-3xl font-extrabold text-[#FD6960] my-1">{dueItems.length}</div>
          <div className="text-[11px] text-[#64748B]">Active recall pending</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#EAE3DC] shadow-xs text-center">
          <div className="text-xs text-[#64748B] font-medium">Upcoming Retention Queue</div>
          <div className="text-3xl font-extrabold text-[#10B981] my-1">{upcomingItems.length}</div>
          <div className="text-[11px] text-[#64748B]">Scheduled for later days</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#EAE3DC] shadow-xs text-center">
          <div className="text-xs text-[#64748B] font-medium">Interval Stages</div>
          <div className="text-3xl font-extrabold text-[#111418] my-1">5 Levels</div>
          <div className="text-[11px] text-[#64748B]">Up to 30 days retention</div>
        </div>
      </div>

      {dueItems.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-[#111418]">Due Today ({dueItems.length})</h2>
          {dueItems.map(({ schedule, question: q }) => (
            <div key={schedule.id} className="bg-white border border-[#EAE3DC] rounded-3xl p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FD6960]/15 text-[#FD6960] font-bold">
                  {schedule.intervalDays} day interval
                </span>
                <span className="text-[#64748B]">{q.subject} • {q.topic}</span>
              </div>
              <p className="text-sm font-semibold text-[#111418]">{q.questionText}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#EAE3DC] rounded-3xl p-8 text-center text-xs text-[#64748B] shadow-xs">
          <CheckCircle2 size={24} className="mx-auto text-[#10B981] mb-2" />
          No reviews due at the moment! Everything is retained according to schedule.
        </div>
      )}
    </div>
  );
};
