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
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award
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

    const answeredCount = Object.keys(selectedAnswers).length;
    const confirmSubmit = window.confirm(
      `You answered ${answeredCount} of ${questions.length} questions. Finalize and submit?`
    );
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
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPct = Math.round(((currentIndex + 1) / questions.length) * 100);

  if (isSubmitted && submittedSession) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Results Card with Emerald Theme */}
        <div className="premium-card rounded-3xl p-6 sm:p-10 text-center space-y-5 border-emerald-500/20 shadow-xl">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-black text-[#065F46] uppercase">
            <Award size={15} className="text-[#059669]" />
            <span>Official Examination Evaluation</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#0F172A] tracking-tight">
            Net Score: <span className="text-[#059669]">{submittedSession.score}</span> <span className="text-xl sm:text-2xl text-[#64748B]">/ {questions.length}</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#64748B] max-w-lg mx-auto">
            {submittedSession.accuracy >= 70 
              ? '🎉 Outstanding work! Your score meets the BCS Preliminary qualification target.'
              : 'Keep practicing! Incorrect questions have been scheduled into your Spaced Revision Queue.'}
          </p>

          {/* 4 Score Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-[#F8FAF9] p-4 rounded-2xl border border-[#E2E8F0]">
              <div className="text-xs text-[#64748B] font-bold uppercase">Correct</div>
              <div className="text-2xl sm:text-3xl font-black text-[#059669] mt-1">{submittedSession.rawCorrect}</div>
              <div className="text-[11px] text-[#64748B]">+1 per question</div>
            </div>

            <div className="bg-[#F8FAF9] p-4 rounded-2xl border border-[#E2E8F0]">
              <div className="text-xs text-[#64748B] font-bold uppercase">Incorrect</div>
              <div className="text-2xl sm:text-3xl font-black text-[#EF4444] mt-1">{submittedSession.rawIncorrect}</div>
              <div className="text-[11px] text-[#64748B]">-{settings.negativeMarkValue} per error</div>
            </div>

            <div className="bg-[#F8FAF9] p-4 rounded-2xl border border-[#E2E8F0]">
              <div className="text-xs text-[#64748B] font-bold uppercase">Accuracy</div>
              <div className="text-2xl sm:text-3xl font-black text-[#0284C7] mt-1">{submittedSession.accuracy}%</div>
              <div className="text-[11px] text-[#64748B]">Target &gt; 70%</div>
            </div>

            <div className="bg-[#F8FAF9] p-4 rounded-2xl border border-[#E2E8F0]">
              <div className="text-xs text-[#64748B] font-bold uppercase">Time Spent</div>
              <div className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-1">{formatTime(submittedSession.durationSeconds)}</div>
              <div className="text-[11px] text-[#64748B]">Avg {Math.round(submittedSession.durationSeconds / questions.length)}s / MCQ</div>
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <button
              onClick={onFinish}
              className="emerald-btn text-white text-sm font-black px-8 py-3.5 rounded-full cursor-pointer shadow-lg hover:scale-105 transition-transform"
            >
              Return to Command Center
            </button>
          </div>
        </div>

        {/* Detailed Solutions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg sm:text-xl font-black text-[#0F172A]">
              Detailed Solutions & Rationales ({questions.length})
            </h2>
            <span className="text-xs text-[#64748B] font-bold">Review explanations carefully</span>
          </div>

          {questions.map((q, idx) => {
            const userChoice = selectedAnswers[idx];
            const isUnans = userChoice === undefined;
            const isCorr = !isUnans && userChoice === q.correctOptionIndex;

            return (
              <div 
                key={q.id}
                className={`premium-card rounded-3xl p-5 sm:p-6 space-y-3 ${
                  isCorr 
                    ? 'border-emerald-500/40 bg-emerald-50/20' 
                    : isUnans 
                      ? 'border-[#E2E8F0]' 
                      : 'border-red-500/40 bg-red-50/20'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-[#0F172A]">Question {idx + 1}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] font-bold">
                      {q.subject}
                    </span>
                    <span className="text-[#64748B]">• {q.topic}</span>
                  </div>

                  <span className={`font-black ${isCorr ? 'text-[#059669]' : isUnans ? 'text-[#64748B]' : 'text-[#EF4444]'}`}>
                    {isCorr ? '✓ Correct (+1.0)' : isUnans ? '○ Skipped (0.0)' : `✕ Wrong (-${settings.negativeMarkValue})`}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#0F172A] leading-relaxed">
                  {q.questionText}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = userChoice === optIdx;
                    const isRight = optIdx === q.correctOptionIndex;

                    let optStyle = 'bg-white border-[#E2E8F0] text-[#64748B]';
                    if (isRight) {
                      optStyle = 'bg-[#ECFDF5] border-[#10B981] text-[#065F46] font-bold shadow-xs';
                    } else if (isSelected && !isRight) {
                      optStyle = 'bg-red-50 border-[#EF4444] text-[#B91C1C] line-through';
                    }

                    return (
                      <div key={optIdx} className={`p-3 rounded-2xl border text-xs sm:text-sm flex items-center justify-between ${optStyle}`}>
                        <div className="flex items-center space-x-2.5">
                          <span className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs bg-[#F1F5F9]">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isRight && <CheckCircle2 size={16} className="text-[#059669] shrink-0" />}
                        {isSelected && !isRight && <XCircle size={16} className="text-[#EF4444] shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                <div className="bg-[#F8FAF9] p-3.5 rounded-2xl text-xs sm:text-sm text-[#334155] border border-[#E2E8F0]">
                  <span className="font-extrabold text-[#059669] mr-1.5">Official Rationale:</span>
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
      {/* Sticky Tactical Header */}
      <div className="premium-card rounded-2xl p-4 flex items-center justify-between shadow-md sticky top-16 sm:top-20 z-40">
        <div className="flex items-center space-x-3">
          <div className="flex items-baseline space-x-1 text-xs font-bold text-[#64748B]">
            <span>Question</span>
            <span className="text-lg font-black text-[#059669]">{currentIndex + 1}</span>
            <span>of {questions.length}</span>
          </div>

          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
            {currentQ.subject}
          </span>
        </div>

        {/* Floating Timer Pill */}
        {timeLimitMinutes > 0 && (
          <div className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full font-mono text-xs font-extrabold shadow-sm ${
            secondsRemaining < 300 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-[#064E3B] text-white'
          }`}>
            <Clock size={14} className="text-[#34D399]" />
            <span className="tracking-wider">{formatTime(secondsRemaining)}</span>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <button
            onClick={onCancel}
            className="text-xs font-bold text-[#64748B] hover:text-[#0F172A] px-3 py-1.5 rounded-full border border-[#E2E8F0] cursor-pointer"
          >
            Leave
          </button>
          <button
            onClick={handleSubmitExam}
            className="emerald-btn text-white text-xs font-black px-4 py-1.5 rounded-full flex items-center space-x-1 cursor-pointer"
          >
            <Send size={12} />
            <span>Submit</span>
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#059669] to-[#10B981] transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Main Focus Card */}
      <div className="premium-card rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1F5F9] pb-4 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-[#64748B] font-bold">Topic:</span>
            <span className="font-extrabold text-[#0F172A]">{currentQ.topic}</span>
            <span className="px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] font-bold">
              {currentQ.difficulty}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleBookmark(currentQ.id)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                bookmarkedMap[currentQ.id] 
                  ? 'bg-[#ECFDF5] text-[#059669] border-[#059669]' 
                  : 'border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
              }`}
              title="Bookmark question"
            >
              <Bookmark size={15} className={bookmarkedMap[currentQ.id] ? "fill-current" : ""} />
            </button>

            <button
              onClick={toggleReviewMark}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                markedForReview[currentIndex] 
                  ? 'bg-amber-50 text-amber-700 border-amber-300 font-extrabold' 
                  : 'border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Flag size={13} />
              <span>Mark Review</span>
            </button>
          </div>
        </div>

        {/* Question Text with High Contrast Typography */}
        <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] leading-relaxed">
          {currentQ.questionText}
        </h2>

        {/* 4 Interactive Option Cards */}
        <div className="space-y-3 pt-2">
          {currentQ.options.map((opt, optIdx) => {
            const isSelected = selectedAnswers[currentIndex] === optIdx;

            return (
              <button
                key={optIdx}
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-150 flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-[#064E3B] text-white border-[#064E3B] shadow-md translate-x-1'
                    : 'bg-white hover:bg-[#F8FAF9] border-[#E2E8F0] text-[#0F172A] hover:border-[#A7F3D0]'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isSelected ? 'bg-white text-[#064E3B]' : 'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]'
                  }`}>
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                  <span className="text-sm sm:text-base font-bold">{opt}</span>
                </div>

                {isSelected && <CheckCircle2 size={18} className="text-[#34D399] shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-[#F1F5F9]">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] disabled:opacity-40 text-xs font-bold cursor-pointer"
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
            className="emerald-btn text-white text-xs font-bold px-6 py-2.5 rounded-xl flex items-center space-x-1.5 disabled:opacity-40 cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Question Palette with Status Dots */}
      <div className="premium-card rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 text-xs font-bold text-[#64748B]">
          <span>QUESTION PALETTE</span>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#059669]" /> Answered</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Flagged</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#E2E8F0]" /> Remaining</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
          {questions.map((_, idx) => {
            const isAnswered = selectedAnswers[idx] !== undefined;
            const isFlagged = markedForReview[idx];
            const isCurrent = currentIndex === idx;

            let style = 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]';
            if (isAnswered) style = 'bg-[#059669] text-white border-[#059669] font-black';
            else if (isFlagged) style = 'bg-amber-100 text-amber-800 border-amber-300 font-extrabold';

            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-xl text-xs font-bold border transition-all cursor-pointer ${style} ${
                  isCurrent ? 'ring-2 ring-[#059669] ring-offset-2' : ''
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
