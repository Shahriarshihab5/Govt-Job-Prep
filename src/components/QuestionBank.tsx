import React, { useState } from 'react';
import { 
  Search, 
  Bookmark, 
  Plus, 
  CheckCircle2, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { Question, SubjectType, DifficultyLevel, SourceType } from '../types';
import { AppStorage } from '../services/storage';

export const QuestionBank: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>(() => AppStorage.getQuestions());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | 'All'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'All'>('All');
  const [selectedSourceType, setSelectedSourceType] = useState<SourceType | 'All'>('All');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    subject: 'Bangla' as SubjectType,
    topic: '',
    questionText: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    explanation: '',
    difficulty: 'Medium' as DifficultyLevel,
    examName: '',
    examYear: 2023,
    sourceType: 'User-Created Question' as SourceType,
  });

  const [addError, setAddError] = useState<string | null>(null);

  const bookmarks = AppStorage.getBookmarks();
  const bookmarkedIds = new Set(bookmarks.map(b => b.questionId));

  const handleToggleBookmark = (id: string) => {
    AppStorage.toggleBookmark(id);
    setQuestions([...AppStorage.getQuestions()]);
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    if (!newQuestion.topic.trim()) {
      setAddError('Please enter a topic name');
      return;
    }
    if (!newQuestion.questionText.trim()) {
      setAddError('Please enter the question text');
      return;
    }
    if (newQuestion.options.some(o => !o.trim())) {
      setAddError('Please fill in all 4 options');
      return;
    }
    if (!newQuestion.explanation.trim()) {
      setAddError('Please provide an explanatory rationale');
      return;
    }

    try {
      const q: Question = {
        id: 'usr_' + Date.now(),
        subject: newQuestion.subject,
        topic: newQuestion.topic.trim(),
        questionText: newQuestion.questionText.trim(),
        options: [
          newQuestion.options[0].trim(),
          newQuestion.options[1].trim(),
          newQuestion.options[2].trim(),
          newQuestion.options[3].trim()
        ],
        correctOptionIndex: newQuestion.correctOptionIndex,
        explanation: newQuestion.explanation.trim(),
        difficulty: newQuestion.difficulty,
        language: newQuestion.subject === 'English' ? 'en' : 'bn',
        sourceType: newQuestion.sourceType,
        examName: newQuestion.examName.trim() || undefined,
        examYear: newQuestion.examYear || undefined,
        verificationStatus: 'Pending Review',
        createdAt: new Date().toISOString()
      };

      AppStorage.addQuestion(q);
      setQuestions(AppStorage.getQuestions());
      setShowAddModal(false);
    } catch (err: any) {
      setAddError(err.message);
    }
  };

  const filtered = questions.filter(q => {
    if (selectedSubject !== 'All' && q.subject !== selectedSubject) return false;
    if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) return false;
    if (selectedSourceType !== 'All' && q.sourceType !== selectedSourceType) return false;
    if (onlyBookmarked && !bookmarkedIds.has(q.id)) return false;
    if (searchQuery.trim()) {
      const text = `${q.questionText} ${q.topic} ${q.examName || ''} ${q.explanation}`.toLowerCase();
      if (!text.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111418]">
            Question Bank
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            {questions.length} questions cataloged • Verified recruitment past papers & practice
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-5 py-2.5 rounded-full bg-[#111418] text-white text-xs font-bold hover:bg-[#20232A] cursor-pointer shadow-xs"
        >
          <Plus size={14} />
          <span>Add New Question</span>
        </button>
      </div>

      {/* Filter Surface */}
      <div className="bg-white border border-[#EAE3DC] rounded-3xl p-5 space-y-3 shadow-xs">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3.5 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search questions by topic, BCS year, or keyword..."
            className="w-full bg-[#F8F5F2] border border-[#EAE3DC] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#111418] placeholder-[#64748B] focus:outline-none focus:border-[#111418]"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value as any)}
            className="bg-[#F8F5F2] border border-[#EAE3DC] rounded-xl p-2.5 font-medium text-[#111418] focus:outline-none"
          >
            <option value="All">All Subjects</option>
            <option value="Bangla">Bangla</option>
            <option value="Mathematics">Mathematics</option>
            <option value="General Knowledge">General Knowledge</option>
            <option value="English">English</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value as any)}
            className="bg-[#F8F5F2] border border-[#EAE3DC] rounded-xl p-2.5 font-medium text-[#111418] focus:outline-none"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            value={selectedSourceType}
            onChange={e => setSelectedSourceType(e.target.value as any)}
            className="bg-[#F8F5F2] border border-[#EAE3DC] rounded-xl p-2.5 font-medium text-[#111418] focus:outline-none"
          >
            <option value="All">All Sources</option>
            <option value="Verified Past Question">Verified Past Paper</option>
            <option value="AI-Generated Practice">AI-Generated</option>
            <option value="User-Created Question">User Created</option>
          </select>

          <button
            onClick={() => setOnlyBookmarked(!onlyBookmarked)}
            className={`p-2.5 rounded-xl border flex items-center justify-center space-x-1.5 font-bold transition-all ${
              onlyBookmarked 
                ? 'bg-[#111418] text-white border-[#111418]' 
                : 'bg-[#F8F5F2] text-[#64748B] border-[#EAE3DC]'
            }`}
          >
            <Bookmark size={13} className={onlyBookmarked ? "fill-current" : ""} />
            <span>Saved ({bookmarks.length})</span>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((q, idx) => {
          const isBookmarked = bookmarkedIds.has(q.id);

          return (
            <div 
              key={q.id}
              className="bg-white border border-[#EAE3DC] rounded-3xl p-5 space-y-3 shadow-xs hover:border-[#111418]/30 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-[#64748B]">#{idx + 1}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F8F5F2] font-semibold text-[#111418]">
                    {q.subject}
                  </span>
                  <span className="text-[#64748B]">{q.topic}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F8F5F2] text-[10px] font-bold text-[#64748B]">
                    {q.examName ? `${q.examName} (${q.examYear || ''})` : q.sourceType}
                  </span>
                  <button
                    onClick={() => handleToggleBookmark(q.id)}
                    className={`p-1.5 rounded-full border ${
                      isBookmarked ? 'bg-[#FD6960]/15 text-[#FD6960] border-[#FD6960]' : 'border-[#EAE3DC] text-[#64748B]'
                    }`}
                  >
                    <Bookmark size={13} className={isBookmarked ? "fill-current" : ""} />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-semibold text-[#111418] leading-relaxed">
                {q.questionText}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, optIdx) => {
                  const isCorrect = optIdx === q.correctOptionIndex;
                  return (
                    <div 
                      key={optIdx} 
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                        isCorrect ? 'bg-[#10B981]/15 border-[#10B981] text-[#10B981] font-bold' : 'bg-[#F8F5F2] border-[#EAE3DC] text-[#64748B]'
                      }`}
                    >
                      <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                      {isCorrect && <CheckCircle2 size={13} />}
                    </div>
                  );
                })}
              </div>

              <div className="text-xs text-[#64748B] bg-[#F8F5F2] p-3 rounded-2xl">
                <span className="font-bold text-[#111418] mr-1">Rationale:</span>
                {q.explanation}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F1EAE5] pb-3">
              <h2 className="text-lg font-bold text-[#111418]">Add MCQ to Question Bank</h2>
              <button onClick={() => setShowAddModal(false)} className="text-[#64748B] hover:text-[#111418] font-bold">✕</button>
            </div>

            {addError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">
                {addError}
              </div>
            )}

            <form onSubmit={handleCreateQuestion} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#64748B] font-bold block mb-1">Subject</label>
                  <select
                    value={newQuestion.subject}
                    onChange={e => setNewQuestion({ ...newQuestion, subject: e.target.value as any })}
                    className="w-full bg-[#F8F5F2] border border-[#EAE3DC] rounded-xl p-2 font-medium"
                  >
                    <option value="Bangla">Bangla</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="General Knowledge">General Knowledge</option>
                    <option value="English">English</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#64748B] font-bold block mb-1">Difficulty</label>
                  <select
                    value={newQuestion.difficulty}
                    onChange={e => setNewQuestion({ ...newQuestion, difficulty: e.target.value as any })}
                    className="w-full bg-[#F8F5F2] border border-[#EAE3DC] rounded-xl p-2 font-medium"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#64748B] font-bold block mb-1">Topic</label>
                <input
                  type="text"
                  placeholder="e.g. বাংলা ব্যাকরণ (সমাস)"
                  value={newQuestion.topic}
                  onChange={e => setNewQuestion({ ...newQuestion, topic: e.target.value })}
                  className="w-full bg-[#F8F5F2] border border-[#EAE3DC] rounded-xl p-2 text-[#111418]"
                />
              </div>

              <div>
                <label className="text-[#64748B] font-bold block mb-1">Question Text</label>
                <textarea
                  rows={2}
                  placeholder="Enter the question text..."
                  value={newQuestion.questionText}
                  onChange={e => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                  className="w-full bg-[#F8F5F2] border border-[#EAE3DC] rounded-xl p-2 text-[#111418]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#64748B] font-bold block">4 Options (Select radio for correct):</label>
                {newQuestion.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="corr"
                      checked={newQuestion.correctOptionIndex === idx}
                      onChange={() => setNewQuestion({ ...newQuestion, correctOptionIndex: idx })}
                      className="accent-[#111418]"
                    />
                    <span className="font-bold text-[#64748B]">{String.fromCharCode(65 + idx)}</span>
                    <input
                      type="text"
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={e => {
                        const next = [...newQuestion.options];
                        next[idx] = e.target.value;
                        setNewQuestion({ ...newQuestion, options: next });
                      }}
                      className="flex-1 bg-[#F8F5F2] border border-[#EAE3DC] rounded-xl p-1.5 text-[#111418]"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-[#64748B] font-bold block mb-1">Explanation</label>
                <textarea
                  rows={2}
                  placeholder="Detailed rationale..."
                  value={newQuestion.explanation}
                  onChange={e => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                  className="w-full bg-[#F8F5F2] border border-[#EAE3DC] rounded-xl p-2 text-[#111418]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#F1EAE5]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full bg-[#F8F5F2] text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#111418] text-white font-bold"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
