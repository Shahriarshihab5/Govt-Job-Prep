import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Flag,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, ExamSession, QuestionAttempt } from '../types';
import { AppStorage } from '../services/storage';

interface ExamEngineViewProps {
  questions: Question[];
  sessionType: 'daily' | 'mock' | 'custom' | 'revision';
  timeLimitMinutes?: number;
  onFinish: () => void;
  onCancel: () => void;
}

export const ExamEngineView: React.FC<ExamEngineViewProps> = ({
  questions,
  sessionType,
  timeLimitMinutes = 45,
  onFinish,
  onCancel,
}) => {
  const settings = AppStorage.getSettings();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [questionTimeTracker, setQuestionTimeTracker] = useState<Record<number, number>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(timeLimitMinutes * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedSession, setSubmittedSession] = useState<ExamSession | null>(null);

  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const bMap: Record<string, boolean> = {};
    questions.forEach(q => {
      bMap[q.id] = AppStorage.isBookmarked(q.id);
    });
    setBookmarkedMap(bMap);
  }, [questions]);

  useEffect(() => {
    if (isSubmitted || timeLimitMinutes <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });

      setQuestionTimeTracker(prev => ({
        ...prev,
        [currentIndex]: (prev[currentIndex] || 0) + 1
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, currentIndex, timeLimitMinutes]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (optIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => {
      if (prev[currentIndex] === optIndex) {
        const next = { ...prev };
        delete next[currentIndex];
        return next;
      }
      return { ...prev, [currentIndex]: optIndex };
    });
  };

  const toggleReviewMark = () => {
    setMarkedForReview(prev => ({
      ...prev,
      [currentIndex]: !prev[currentIndex]
    }));
  };

  const toggleBookmark = (qId: string) => {
    const updated = AppStorage.toggleBookmark(qId);
    setBookmarkedMap(prev => ({ ...prev, [qId]: updated }));
  };

  const handleSubmitExam = () => {
    if (isSubmitted) return;

    const confirmSubmit = window.confirm('Ready to submit your examination answers?');
    if (!confirmSubmit && secondsRemaining > 0) return;

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const totalDurationSeconds = (timeLimitMinutes * 60) - secondsRemaining;
    const sessionId = 'ses_' + Date.now();
    const attempts: QuestionAttempt[] = [];

    questions.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      const isUnans = selected === undefined;
      const isCorr = !isUnans && selected === q.correctOptionIndex;
      
      if (isUnans) {
        unansweredCount++;
      } else if (isCorr) {
        correctCount++;
      } else {
        incorrectCount++;
      }

      let scoreContrib = 0;
      if (isCorr) {
        scoreContrib = 1;
      } else if (!isUnans && settings.enableNegativeMarking) {
        scoreContrib = -settings.negativeMarkValue;
      }

      const attempt: QuestionAttempt = {
        id: 'att_' + Date.now() + '_' + idx,
        sessionId,
        questionId: q.id,
        selectedOptionIndex: isUnans ? null : selected,
        isCorrect: isCorr,
        isUnanswered: isUnans,
        timeSpentSeconds: questionTimeTracker[idx] || 0,
        attemptedAt: new Date().toISOString(),
        scoreContribution: scoreContrib,
      };
      attempts.push(attempt);

      if (!isCorr) {
        AppStorage.recordMistake(q.id, isUnans ? null : selected, false);
      } else {
        AppStorage.recordMistake(q.id, selected, true);
      }
    });

    AppStorage.saveAttempts(attempts);

    const negativeDeductions = settings.enableNegativeMarking 
      ? incorrectCount * settings.negativeMarkValue 
      : 0;
    const netScore = Math.max(0, correctCount - negativeDeductions);
    const accuracy = (correctCount + incorrectCount) > 0 
      ? Math.round((correctCount / (correctCount + incorrectCount)) * 100) 
      : 0;

    const session: ExamSession = {
      id: sessionId,
      sessionType,
      date: new Date().toISOString().split('T')[0],
      targetCount: questions.length,
      startedAt: new Date(Date.now() - totalDurationSeconds * 1000).toISOString(),
      submittedAt: new Date().toISOString(),
      durationSeconds: totalDurationSeconds,
      totalTimeLimitSeconds: timeLimitMinutes * 60,
      negativeMarkingEnabled: settings.enableNegativeMarking,
      negativeMarkRatio: settings.negativeMarkValue,
      rawCorrect: correctCount,
      rawIncorrect: incorrectCount,
      rawUnanswered: unansweredCount,
      score: Number(netScore.toFixed(2)),
      accuracy,
      questionIds: questions.map(q => q.id),
    };

    AppStorage.saveSession(session);

    if (sessionType === 'daily') {
      AppStorage.recordDailyExamCompletion(questions.length, totalDurationSeconds);
    }

    setSubmittedSession(session);
    setIsSubmitted(true);

    if (accuracy >= 60) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isSubmitted && submittedSession) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Results Header Card */}
        <div className="bg-white border border-[#EAE3DC] rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] text-center space-y-4">
          <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-[#10B981]/15 text-[#10B981]">
            Official Evaluation Complete
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111418]">
            Exam Score: {submittedSession.score} / {questions.length}
          </h1>
          <p className="text-xs text-[#64748B]">
            Accuracy: {submittedSession.accuracy}% • Time: {formatTime(submittedSession.durationSeconds)} • Negative marking: -{settings.negativeMarkValue} per error
          </p>

          {/* KPI grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-[#F8F5F2] p-4 rounded-2xl text-center">
              <div className="text-xs text-[#64748B]">Correct</div>
              <div className="text-2xl font-black text-[#10B981]">{submittedSession.rawCorrect}</div>
            </div>
            <div className="bg-[#F8F5F2] p-4 rounded-2xl text-center">
              <div className="text-xs text-[#64748B]">Incorrect</div>
              <div className="text-2xl font-black text-[#EF4444]">{submittedSession.rawIncorrect}</div>
            </div>
            <div className="bg-[#F8F5F2] p-4 rounded-2xl text-center">
              <div className="text-xs text-[#64748B]">Skipped</div>
              <div className="text-2xl font-black text-[#64748B]">{submittedSession.rawUnanswered}</div>
            </div>
            <div className="bg-[#F8F5F2] p-4 rounded-2xl text-center">
              <div className="text-xs text-[#64748B]">Accuracy</div>
              <div className="text-2xl font-black text-[#4A4DE6]">{submittedSession.accuracy}%</div>
            </div>
          </div>

          <button
            onClick={onFinish}
            className="px-6 py-2.5 rounded-full bg-[#111418] text-white text-xs font-bold hover:bg-[#20232A] cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>

        {/* Detailed Solutions */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#111418]">
            Answer Review & Solutions ({questions.length})
          </h2>

          {questions.map((q, idx) => {
            const userChoice = selectedAnswers[idx];
            const isUnans = userChoice === undefined;
            const isCorr = !isUnans && userChoice === q.correctOptionIndex;

            return (
              <div 
                key={q.id}
                className={`bg-white border rounded-2xl p-5 space-y-3 shadow-xs ${
                  isCorr 
                    ? 'border-[#10B981]/50' 
                    : isUnans 
                      ? 'border-[#EAE3DC]' 
                      : 'border-[#EF4444]/50'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#111418]">#{idx + 1}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F8F5F2] font-semibold text-[#64748B]">
                      {q.subject}
                    </span>
                    <span className="text-[#64748B]">{q.topic}</span>
                  </div>

                  <span className={`font-bold ${isCorr ? 'text-[#10B981]' : isUnans ? 'text-[#64748B]' : 'text-[#EF4444]'}`}>
                    {isCorr ? '✓ Correct (+1)' : isUnans ? 'Skipped (0)' : `✕ Wrong (-${settings.negativeMarkValue})`}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-[#111418]">
                  {q.questionText}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = userChoice === optIdx;
                    const isRight = optIdx === q.correctOptionIndex;

                    let optStyle = 'bg-[#F8F5F2] border-[#EAE3DC] text-[#64748B]';
                    if (isRight) {
                      optStyle = 'bg-[#10B981]/15 border-[#10B981] text-[#10B981] font-bold';
                    } else if (isSelected && !isRight) {
                      optStyle = 'bg-[#EF4444]/15 border-[#EF4444] text-[#EF4444] line-through';
                    }

                    return (
                      <div key={optIdx} className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optStyle}`}>
                        <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                        {isRight && <CheckCircle2 size={15} />}
                        {isSelected && !isRight && <XCircle size={15} />}
                      </div>
                    );
                  })}
                </div>

                <div className="bg-[#F8F5F2] p-3 rounded-xl text-xs text-[#64748B]">
                  <span className="font-bold text-[#111418] mr-1">Explanation:</span>
                  {q.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Sticky Exam Top Bar */}
      <div className="bg-white border border-[#EAE3DC] rounded-2xl p-4 flex items-center justify-between shadow-xs sticky top-16 z-30">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-[#64748B]">
            Q <span className="text-base text-[#111418]">{currentIndex + 1}</span> of {questions.length}
          </span>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F8F5F2] text-[#111418]">
            {currentQ.subject}
          </span>
        </div>

        {timeLimitMinutes > 0 && (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#111418] text-white font-mono text-xs font-bold">
            <Clock size={13} />
            <span>{formatTime(secondsRemaining)}</span>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <button
            onClick={onCancel}
            className="text-xs text-[#64748B] hover:text-[#111418] px-3 py-1.5 rounded-full border border-[#EAE3DC]"
          >
            Quit
          </button>
          <button
            onClick={handleSubmitExam}
            className="flex items-center space-x-1 text-xs font-bold px-4 py-1.5 rounded-full bg-[#FD6960] text-white shadow-xs hover:bg-[#F25C54] cursor-pointer"
          >
            <Send size={12} />
            <span>Submit</span>
          </button>
        </div>
      </div>

      {/* Main Question Card (Clean White with Soft Shadows) */}
      <div className="bg-white border border-[#EAE3DC] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1EAE5] pb-3 text-xs">
          <span className="text-[#64748B] font-medium">Topic: {currentQ.topic}</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleBookmark(currentQ.id)}
              className={`p-1.5 rounded-full border ${
                bookmarkedMap[currentQ.id] ? 'bg-[#FD6960]/15 text-[#FD6960] border-[#FD6960]' : 'border-[#EAE3DC] text-[#64748B]'
              }`}
            >
              <Bookmark size={14} className={bookmarkedMap[currentQ.id] ? "fill-current" : ""} />
            </button>
            <button
              onClick={toggleReviewMark}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold border ${
                markedForReview[currentIndex] ? 'bg-[#FD6960]/15 text-[#FD6960] border-[#FD6960]' : 'border-[#EAE3DC] text-[#64748B]'
              }`}
            >
              <Flag size={12} />
              <span>Review</span>
            </button>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-[#111418] leading-relaxed">
          {currentQ.questionText}
        </h2>

        {/* 4 Clean Options */}
        <div className="space-y-3">
          {currentQ.options.map((opt, optIdx) => {
            const isSelected = selectedAnswers[currentIndex] === optIdx;

            return (
              <button
                key={optIdx}
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-[#111418] text-white border-[#111418] shadow-md'
                    : 'bg-[#F8F5F2]/80 hover:bg-[#F1EAE5] border-[#EAE3DC] text-[#111418]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    isSelected ? 'bg-white text-[#111418]' : 'bg-white text-[#64748B] border border-[#EAE3DC]'
                  }`}>
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                  <span className="text-sm sm:text-base font-medium">{opt}</span>
                </div>
                {isSelected && <CheckCircle2 size={16} className="text-[#FD6960]" />}
              </button>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center justify-between pt-4 border-t border-[#F1EAE5]">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex items-center space-x-1 px-4 py-2 rounded-full bg-[#F8F5F2] hover:bg-[#F1EAE5] text-[#111418] disabled:opacity-40 text-xs font-bold"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <span className="text-xs text-[#64748B] font-bold">
            {Object.keys(selectedAnswers).length} answered
          </span>

          <button
            onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
            disabled={currentIndex === questions.length - 1}
            className="flex items-center space-x-1 px-4 py-2 rounded-full bg-[#111418] text-white hover:bg-[#20232A] disabled:opacity-40 text-xs font-bold"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Question Palette */}
      <div className="bg-white border border-[#EAE3DC] rounded-2xl p-4 shadow-xs">
        <div className="text-xs font-bold text-[#64748B] mb-2 uppercase">Question Palette</div>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
          {questions.map((_, idx) => {
            const isAnswered = selectedAnswers[idx] !== undefined;
            const isFlagged = markedForReview[idx];
            const isCurrent = currentIndex === idx;

            let style = 'bg-[#F8F5F2] text-[#64748B] border-[#EAE3DC]';
            if (isAnswered) style = 'bg-[#111418] text-white border-[#111418] font-bold';
            else if (isFlagged) style = 'bg-[#FD6960]/20 text-[#FD6960] border-[#FD6960] font-bold';

            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-bold border transition-all ${style} ${
                  isCurrent ? 'ring-2 ring-[#FD6960]' : ''
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
