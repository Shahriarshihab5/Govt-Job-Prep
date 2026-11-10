import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  Database 
} from 'lucide-react';
import { SubjectType, DifficultyLevel, Question } from '../types';
import { AIService } from '../services/aiService';
import { AppStorage } from '../services/storage';

export const AIGenerator: React.FC = () => {
  const [subject, setSubject] = useState<SubjectType>('Bangla');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [apiKey, setApiKey] = useState(() => AppStorage.getSettings().geminiApiKey || '');
  const [loading, setLoading] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] = useState<Question | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const quota = AIService.getQuotaStatus();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setGeneratedQuestion(null);

    try {
      const q = await AIService.generateQuestions({
        subject,
        topic: topic.trim() || undefined,
        difficulty,
        apiKey: apiKey.trim() || undefined,
      });

      setGeneratedQuestion(q);
      setSuccessMsg('MCQ generated and passed deterministic validation checks!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToBank = () => {
    if (!generatedQuestion) return;
    try {
      AppStorage.addQuestion(generatedQuestion);
      setSuccessMsg('Successfully saved to Question Bank with AI provenance tag!');
      setGeneratedQuestion(null);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111418]">
          AI Practice Generator & Validator
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Synthesize curriculum-aligned practice questions • Free tier with strict 4-option validation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-[#EAE3DC] shadow-xs">
          <div className="text-xs text-[#64748B] font-medium">Daily Free Quota</div>
          <div className="text-3xl font-extrabold text-[#111418] my-1">
            {quota.remaining} <span className="text-xs font-normal text-[#64748B]">/ {quota.dailyLimit} remaining</span>
          </div>
          <div className="text-[11px] text-[#10B981] font-bold">100% Free • Rate-limit protected</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#EAE3DC] shadow-xs md:col-span-2 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#111418]">Zero-Cost Pattern Synthesis</span>
            <p className="text-xs text-[#64748B]">
              Works immediately offline using high-frequency PSC question templates or with your free Gemini API key.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#EAE3DC] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <form onSubmit={handleGenerate} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[#64748B] font-bold block mb-1">Subject</label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value as any)}
                className="w-full bg-[#F8F5F2] border border-[#EAE3DC] rounded-xl p-2.5 font-medium text-[#111418]"
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
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
                className="w-full bg-[#F8F5F2] border border-[#EAE3DC] rounded-xl p-2.5 font-medium text-[#111418]"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="text-[#64748B] font-bold block mb-1">Topic</label>
              <input
                type="text"
                placeholder="e.g. শতকরা or সমাস"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full bg-[#F8F5F2] border border-[#EAE3DC] rounded-xl p-2.5 text-[#111418]"
              />
            </div>
          </div>

          <div>
            <label className="text-[#64748B] font-bold block mb-1">Gemini API Key (Optional Free Key)</label>
            <div className="relative">
              <Key size={14} className="absolute left-3.5 top-3.5 text-[#64748B]" />
              <input
                type="password"
                placeholder="Leave blank to use built-in offline recruitment synthesizer"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="w-full bg-[#F8F5F2] border border-[#EAE3DC] rounded-xl pl-9 pr-3 py-2.5 text-[#111418]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || quota.remaining <= 0}
              className="flex items-center space-x-1.5 px-6 py-3 rounded-full bg-[#111418] text-white font-bold text-xs hover:bg-[#20232A] cursor-pointer shadow-xs disabled:opacity-40"
            >
              <Sparkles size={14} />
              <span>{loading ? 'Synthesizing...' : 'Generate Validated MCQ'}</span>
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-green-50 text-green-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={15} />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {generatedQuestion && (
        <div className="bg-white border-2 border-[#111418] rounded-3xl p-6 sm:p-8 space-y-4 shadow-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-[#111418] text-white font-bold">
              AI-Generated Practice
            </span>
            <span className="text-[#64748B]">{generatedQuestion.subject} • {generatedQuestion.topic}</span>
          </div>

          <h3 className="text-lg font-bold text-[#111418]">
            {generatedQuestion.questionText}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {generatedQuestion.options.map((opt, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  idx === generatedQuestion.correctOptionIndex 
                    ? 'bg-[#10B981]/15 border-[#10B981] text-[#10B981] font-bold' 
                    : 'bg-[#F8F5F2] border-[#EAE3DC] text-[#64748B]'
                }`}
              >
                <span>{String.fromCharCode(65 + idx)}. {opt}</span>
                {idx === generatedQuestion.correctOptionIndex && <CheckCircle2 size={14} />}
              </div>
            ))}
          </div>

          <div className="bg-[#F8F5F2] p-3 rounded-2xl text-xs text-[#64748B]">
            <span className="font-bold text-[#111418] mr-1">Rationale:</span>
            {generatedQuestion.explanation}
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setGeneratedQuestion(null)}
              className="px-4 py-2 rounded-full bg-[#F8F5F2] text-[#64748B] text-xs font-bold"
            >
              Discard
            </button>
            <button
              onClick={handleSaveToBank}
              className="px-5 py-2 rounded-full bg-[#111418] text-white font-bold text-xs hover:bg-[#20232A]"
            >
              Save to Question Bank
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
