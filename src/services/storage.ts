import { 
  Question, 
  QuestionAttempt, 
  ExamSession, 
  Bookmark, 
  MistakeRecord, 
  RevisionScheduleItem, 
  UserSettings, 
  DailyActivity 
} from '../types';
import { INITIAL_QUESTIONS } from '../data/initialQuestions';

const STORAGE_KEYS = {
  QUESTIONS: 'gjp_questions_v1',
  ATTEMPTS: 'gjp_attempts_v1',
  SESSIONS: 'gjp_sessions_v1',
  BOOKMARKS: 'gjp_bookmarks_v1',
  MISTAKES: 'gjp_mistakes_v1',
  REVISIONS: 'gjp_revisions_v1',
  SETTINGS: 'gjp_settings_v1',
  DAILY_ACTIVITY: 'gjp_daily_activity_v1',
};

export const DEFAULT_SETTINGS: UserSettings = {
  displayName: 'BCS Aspirant',
  preferredLanguage: 'bilingual',
  dailyTarget: 45,
  subjectQuotas: {
    Bangla: 15,
    Mathematics: 10,
    'General Knowledge': 10,
    English: 10,
  },
  difficultyMix: {
    Easy: 15,
    Medium: 20,
    Hard: 10,
  },
  examCategories: ['46th BCS', 'Primary Assistant Teacher', 'NTRCA', 'Combined Banks'],
  timerMinutes: 45,
  enableNegativeMarking: true,
  negativeMarkValue: 0.5, // 0.5 marks deduction for wrong answer in BCS standard
  dailyCompletionThreshold: 100,
  theme: 'neo-kinpaku-dark',
};

export class AppStorage {
  // Questions
  static getQuestions(): Question[] {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
      return INITIAL_QUESTIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_QUESTIONS;
    }
  }

  static saveQuestions(questions: Question[]): void {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  }

  static addQuestion(q: Question): void {
    const list = this.getQuestions();
    // duplicate check
    const exists = list.some(item => item.questionText.trim().toLowerCase() === q.questionText.trim().toLowerCase());
    if (exists) {
      throw new Error('A question with identical text already exists in the question bank.');
    }
    list.unshift(q);
    this.saveQuestions(list);
  }

  static updateQuestionVerification(questionId: string, status: Question['verificationStatus']): void {
    const list = this.getQuestions();
    const target = list.find(q => q.id === questionId);
    if (target) {
      target.verificationStatus = status;
      this.saveQuestions(list);
    }
  }

  // Settings
  static getSettings(): UserSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: UserSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // Bookmarks
  static getBookmarks(): Bookmark[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static toggleBookmark(questionId: string, note?: string): boolean {
    let list = this.getBookmarks();
    const index = list.findIndex(b => b.questionId === questionId);
    let bookmarked = false;
    if (index >= 0) {
      list.splice(index, 1);
      bookmarked = false;
    } else {
      list.push({
        questionId,
        savedAt: new Date().toISOString(),
        note
      });
      bookmarked = true;
    }
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(list));
    return bookmarked;
  }

  static isBookmarked(questionId: string): boolean {
    return this.getBookmarks().some(b => b.questionId === questionId);
  }

  // Attempts
  static getAttempts(): QuestionAttempt[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveAttempts(newAttempts: QuestionAttempt[]): void {
    const existing = this.getAttempts();
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify([...existing, ...newAttempts]));
  }

  // Exam Sessions
  static getSessions(): ExamSession[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveSession(session: ExamSession): void {
    const existing = this.getSessions();
    existing.unshift(session);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(existing));
  }

  // Mistake Notebook
  static getMistakes(): MistakeRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MISTAKES);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static recordMistake(questionId: string, selectedOption: number | null, isCorrect: boolean): void {
    let mistakes = this.getMistakes();
    let record = mistakes.find(m => m.questionId === questionId);
    const now = new Date().toISOString();

    if (!isCorrect) {
      if (!record) {
        record = {
          questionId,
          totalErrors: 1,
          lastAttemptedAt: now,
          lastSelectedOption: selectedOption,
          history: [{ attemptedAt: now, selectedOption, isCorrect: false }]
        };
        mistakes.push(record);
      } else {
        record.totalErrors += 1;
        record.lastAttemptedAt = now;
        record.lastSelectedOption = selectedOption;
        record.history.push({ attemptedAt: now, selectedOption, isCorrect: false });
      }
      this.scheduleRevision(questionId, false);
    } else if (record) {
      record.lastAttemptedAt = now;
      record.lastSelectedOption = selectedOption;
      record.history.push({ attemptedAt: now, selectedOption, isCorrect: true });
      this.scheduleRevision(questionId, true);
    }

    localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(mistakes));
  }

  // Spaced Repetition Schedule (Intervals: 1 day, 2 days, 7 days, 15 days, 30 days)
  static getRevisionSchedule(): RevisionScheduleItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REVISIONS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static scheduleRevision(questionId: string, solvedCorrectly: boolean): void {
    const intervals = [1, 2, 7, 15, 30];
    let revisions = this.getRevisionSchedule();
    let item = revisions.find(r => r.questionId === questionId);
    const now = new Date();

    if (!item) {
      // First mistake, schedule for tomorrow (Day 1)
      const due = new Date();
      due.setDate(due.getDate() + 1);
      revisions.push({
        id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        questionId,
        dueAt: due.toISOString(),
        intervalDays: 1,
        level: 0,
        reviewCount: 0,
        status: 'due',
      });
    } else {
      if (solvedCorrectly) {
        // promote level
        const nextLevel = Math.min(item.level + 1, intervals.length - 1);
        const days = intervals[nextLevel];
        const nextDue = new Date();
        nextDue.setDate(nextDue.getDate() + days);

        item.level = nextLevel;
        item.intervalDays = days;
        item.dueAt = nextDue.toISOString();
        item.reviewCount += 1;
        item.lastReviewedAt = now.toISOString();
        item.status = 'upcoming';
      } else {
        // Demote back to Day 1 review
        const nextDue = new Date();
        nextDue.setDate(nextDue.getDate() + 1);
        item.level = 0;
        item.intervalDays = 1;
        item.dueAt = nextDue.toISOString();
        item.reviewCount += 1;
        item.lastReviewedAt = now.toISOString();
        item.status = 'due';
      }
    }

    localStorage.setItem(STORAGE_KEYS.REVISIONS, JSON.stringify(revisions));
  }

  // Daily Activity & Streaks
  static getDailyActivities(): Record<string, DailyActivity> {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_ACTIVITY);
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  static recordDailyExamCompletion(questionsCount: number, durationSeconds: number): void {
    const today = new Date().toISOString().split('T')[0];
    const settings = this.getSettings();
    const activities = this.getDailyActivities();

    const current: DailyActivity = activities[today] || {
      date: today,
      targetCount: settings.dailyTarget,
      completedCount: 0,
      isCompleted: false,
      studyDurationSeconds: 0,
      sessionsCount: 0,
    };

    current.completedCount += questionsCount;
    current.studyDurationSeconds += durationSeconds;
    current.sessionsCount += 1;

    // A day counts towards streak only when configured daily target is completed!
    if (current.completedCount >= current.targetCount) {
      current.isCompleted = true;
    }

    activities[today] = current;
    localStorage.setItem(STORAGE_KEYS.DAILY_ACTIVITY, JSON.stringify(activities));
  }

  static getStreakStats(): { currentStreak: number; longestStreak: number; totalCompletedDays: number } {
    const activities = this.getDailyActivities();
    const dates = Object.keys(activities).sort();
    if (dates.length === 0) {
      return { currentStreak: 0, longestStreak: 0, totalCompletedDays: 0 };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let totalCompletedDays = 0;

    // Check today and yesterday
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Compute streak backwards from today or yesterday
    let checkDate = new Date();
    // If today is completed, start from today, else if yesterday was completed start from yesterday
    const todayCompleted = activities[today]?.isCompleted;
    const yesterdayCompleted = activities[yesterday]?.isCompleted;

    if (todayCompleted) {
      checkDate = new Date();
    } else if (yesterdayCompleted) {
      checkDate = new Date(Date.now() - 86400000);
    } else {
      currentStreak = 0;
    }

    if (todayCompleted || yesterdayCompleted) {
      while (true) {
        const dStr = checkDate.toISOString().split('T')[0];
        if (activities[dStr] && activities[dStr].isCompleted) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Longest streak
    dates.forEach(d => {
      if (activities[d]?.isCompleted) {
        totalCompletedDays++;
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    });

    return {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      totalCompletedDays,
    };
  }

  // Export / Backup
  static exportAllData(): string {
    const data = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      questions: this.getQuestions(),
      attempts: this.getAttempts(),
      sessions: this.getSessions(),
      bookmarks: this.getBookmarks(),
      mistakes: this.getMistakes(),
      revisions: this.getRevisionSchedule(),
      settings: this.getSettings(),
      dailyActivity: this.getDailyActivities(),
    };
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.questions) this.saveQuestions(data.questions);
      if (data.settings) this.saveSettings(data.settings);
      if (data.attempts) localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(data.attempts));
      if (data.sessions) localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(data.sessions));
      if (data.bookmarks) localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(data.bookmarks));
      if (data.mistakes) localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(data.mistakes));
      if (data.revisions) localStorage.setItem(STORAGE_KEYS.REVISIONS, JSON.stringify(data.revisions));
      if (data.dailyActivity) localStorage.setItem(STORAGE_KEYS.DAILY_ACTIVITY, JSON.stringify(data.dailyActivity));
      return true;
    } catch {
      return false;
    }
  }
}

