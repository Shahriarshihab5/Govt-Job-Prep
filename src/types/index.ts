export type SubjectType = 'Bangla' | 'Mathematics' | 'General Knowledge' | 'English';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export type SourceType = 
  | 'Verified Past Question' 
  | 'Imported/Unverified Past Question' 
  | 'AI-Generated Practice' 
  | 'User-Created Question';

export type VerificationStatus = 'Verified' | 'Pending Review' | 'Community Reported' | 'Rejected';

export interface Question {
  id: string;
  subject: SubjectType;
  topic: string;
  subtopic?: string;
  questionText: string;
  options: [string, string, string, string]; // exactly 4 options
  correctOptionIndex: number; // 0, 1, 2, or 3
  explanation: string;
  difficulty: DifficultyLevel;
  language: 'bn' | 'en' | 'bilingual';
  sourceType: SourceType;
  examName?: string; // e.g. "45th BCS Preliminary", "Primary Assistant Teacher 2022"
  examYear?: number;
  sourceReference?: string;
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface QuestionAttempt {
  id: string;
  sessionId: string;
  questionId: string;
  selectedOptionIndex: number | null; // null if skipped/unanswered
  isCorrect: boolean;
  isUnanswered: boolean;
  timeSpentSeconds: number;
  attemptedAt: string;
  scoreContribution: number;
}

export type SessionType = 'daily' | 'mock' | 'custom' | 'revision';

export interface ExamSession {
  id: string;
  sessionType: SessionType;
  date: string; // YYYY-MM-DD
  targetCount: number;
  startedAt: string;
  submittedAt?: string;
  durationSeconds: number;
  totalTimeLimitSeconds: number; // 0 if untimed practice
  negativeMarkingEnabled: boolean;
  negativeMarkRatio: number; // e.g. 0.25 or 0.5
  rawCorrect: number;
  rawIncorrect: number;
  rawUnanswered: number;
  score: number;
  accuracy: number;
  questionIds: string[];
}

export interface Bookmark {
  questionId: string;
  savedAt: string;
  note?: string;
}

export interface MistakeRecord {
  questionId: string;
  totalErrors: number;
  lastAttemptedAt: string;
  lastSelectedOption: number | null;
  history: Array<{
    attemptedAt: string;
    selectedOption: number | null;
    isCorrect: boolean;
  }>;
}

export interface RevisionScheduleItem {
  id: string;
  questionId: string;
  dueAt: string; // ISO date string
  intervalDays: number; // 1, 2, 7, 15, 30
  level: number; // 0 to 4
  reviewCount: number;
  lastReviewedAt?: string;
  status: 'due' | 'upcoming' | 'completed';
}

export interface UserSettings {
  displayName: string;
  preferredLanguage: 'bn' | 'en' | 'bilingual';
  dailyTarget: number; // 45 or 50
  subjectQuotas: {
    Bangla: number;
    Mathematics: number;
    'General Knowledge': number;
    English: number;
  };
  difficultyMix: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
  examCategories: string[]; // ['BCS', 'Primary', 'NTRCA', 'Bank', 'Ministry/Others']
  timerMinutes: number; // default 45 mins
  enableNegativeMarking: boolean;
  negativeMarkValue: number; // 0.25, 0.5
  dailyCompletionThreshold: number; // % required to award streak, e.g. 100%
  geminiApiKey?: string;
  theme: 'neo-kinpaku-dark' | 'lacquer-midnight';
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  targetCount: number;
  completedCount: number;
  isCompleted: boolean;
  studyDurationSeconds: number;
  sessionsCount: number;
}

