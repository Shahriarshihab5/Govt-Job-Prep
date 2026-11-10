import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Play, 
  ArrowRight 
} from 'lucide-react';
import { AppStorage } from '../services/storage';
import { Question } from '../types';

interface MistakeNotebookProps {
  onPracticeMistakes: (questions: Question[]) => void;
}

export const MistakeNotebook: React.FC<MistakeNotebookProps> = ({ onPracticeMistakes }) => {
  const mistakes = AppStorage.getMistakes();
  const allQuestions = AppStorage.getQuestions();

  const mistakeList = mistakes.map(m => {
    const q = allQuestions.find(item => item.id === m.questionId);
    return {
      record: m,
      question: q
    };
  }).filter(item => item.question !== undefined) as Array<{
    record: typeof mistakes[0];
    question: Question;
  }>;

  mistakeList.sort((a, b) => b.record.totalErrors - a.record.totalErrors);

  const handleStartRevisionSession = () => {
    const qs = mistakeList.map(m => m.question);
    if (qs.length === 0) return;
    onPracticeMistakes(qs);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#EAE3DC] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
        <div>
          <span className="text-[11px] font-bold uppercase px-3 py-1 rounded-full bg-[#EF4444]/15 text-[#EF4444]">
            Automated Error Logging
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111418] mt-2">
            Mistake Notebook ({mistakeList.length})
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-xl">
            Questions you missed during any daily exam or practice test are collected here with your selected wrong choice and complete answer key explanations.
          </p>
        </div>

        {mistakeList.length > 0 && (
          <button
            onClick={handleStartRevisionSession}
            className="flex items-center space-x-2 px-6 py-3 rounded-full bg-[#111418] text-white text-xs font-bold hover:bg-[#20232A] cursor-pointer shadow-xs shrink-0"
          >
            <Play size={14} className="fill-white" />
            <span>Retest All Mistakes</span>
          </button>
        )}
      </div>

      {mistakeList.length === 0 ? (
        <div className="bg-white border border-[#EAE3DC] rounded-3xl p-12 text-center space-y-2 shadow-xs">
          <CheckCircle2 size={36} className="mx-auto text-[#10B981]" />
          <h3 className="text-lg font-bold text-[#111418]">No Errors Recorded!</h3>
          <p className="text-xs text-[#64748B]">Take exams and any incorrect question will automatically be scheduled here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mistakeList.map(({ record, question: q }) => (
            <div 
              key={record.questionId}
              className="bg-white border border-[#EAE3DC] rounded-3xl p-5 space-y-3 shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EF4444]/15 text-[#EF4444] font-bold">
                    Missed {record.totalErrors} {record.totalErrors === 1 ? 'time' : 'times'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F8F5F2] font-semibold text-[#111418]">
                    {q.subject}
                  </span>
                  <span className="text-[#64748B]">{q.topic}</span>
                </div>
                <div className="text-[#64748B] text-[11px]">
                  Last attempted: {new Date(record.lastAttemptedAt).toLocaleDateString()}
                </div>
              </div>

              <h3 className="text-base font-semibold text-[#111418]">
                {q.questionText}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, optIdx) => {
                  const isCorrect = optIdx === q.correctOptionIndex;
                  const wasWrongPick = optIdx === record.lastSelectedOption && !isCorrect;

                  let style = 'bg-[#F8F5F2] border-[#EAE3DC] text-[#64748B]';
                  if (isCorrect) style = 'bg-[#10B981]/15 border-[#10B981] text-[#10B981] font-bold';
                  else if (wasWrongPick) style = 'bg-[#EF4444]/15 border-[#EF4444] text-[#EF4444] line-through';

                  return (
                    <div key={optIdx} className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${style}`}>
                      <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                      {isCorrect && <CheckCircle2 size={13} />}
                      {wasWrongPick && <XCircle size={13} />}
                    </div>
                  );
                })}
              </div>

              <div className="bg-[#F8F5F2] p-3 rounded-2xl text-xs text-[#64748B]">
                <span className="font-bold text-[#111418] mr-1">Explanation:</span>
                {q.explanation}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
