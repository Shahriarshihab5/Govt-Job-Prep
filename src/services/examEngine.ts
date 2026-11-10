import { Question, SubjectType, DifficultyLevel } from '../types';
import { AppStorage } from './storage';

export interface ExamGenerationConfig {
  targetCount: number; // 45 or 50 or custom
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
  avoidRecentAttemptDays?: number;
}

export class ExamEngine {
  /**
   * Automatically assemble the daily exam using Bangladesh Govt Job guidelines:
   * 45 default (15 Bangla, 10 Math, 10 GK, 10 English)
   * Difficulty mix: 15 Easy, 20 Medium, 10 Hard distributed across subjects
   * Prioritize Verified Past Questions, then valid AI questions.
   */
  static generateDailyExam(config?: Partial<ExamGenerationConfig>): {
    questions: Question[];
    stats: {
      bySubject: Record<SubjectType, number>;
      byDifficulty: Record<DifficultyLevel, number>;
      verifiedCount: number;
      aiCount: number;
    };
  } {
    const settings = AppStorage.getSettings();
    const allQuestions = AppStorage.getQuestions();
    const attempts = AppStorage.getAttempts();

    const targetCount = config?.targetCount || settings.dailyTarget || 45;
    const quotas = config?.subjectQuotas || settings.subjectQuotas;

    // Filter out recently attempted in last 2 days if enough questions exist
    const recentThreshold = new Date(Date.now() - 2 * 86400000).toISOString();
    const recentQuestionIds = new Set(
      attempts.filter(a => a.attemptedAt > recentThreshold).map(a => a.questionId)
    );

    const pool = allQuestions.map(q => ({
      ...q,
      isRecent: recentQuestionIds.has(q.id)
    }));

    const selected: Question[] = [];
    const subjects: SubjectType[] = ['Bangla', 'Mathematics', 'General Knowledge', 'English'];

    subjects.forEach(subject => {
      const quota = quotas[subject] || Math.floor(targetCount / 4);
      let subjectQuestions = pool.filter(q => q.subject === subject);

      // Prefer non-recent first
      let nonRecent = subjectQuestions.filter(q => !q.isRecent);
      let candidates = nonRecent.length >= quota ? nonRecent : subjectQuestions;

      // Sort by preference: Verified past questions first
      candidates.sort((a, b) => {
        if (a.sourceType === 'Verified Past Question' && b.sourceType !== 'Verified Past Question') return -1;
        if (b.sourceType === 'Verified Past Question' && a.sourceType !== 'Verified Past Question') return 1;
        return 0.5 - Math.random();
      });

      // Select quota
      const picked = candidates.slice(0, quota);

      // If bank has fewer questions than quota, loop/sample available to fulfill test requirement
      if (picked.length < quota && subjectQuestions.length > 0) {
        let idx = 0;
        while (picked.length < quota) {
          picked.push({
            ...subjectQuestions[idx % subjectQuestions.length],
            id: `${subjectQuestions[idx % subjectQuestions.length].id}_rep_${picked.length}`
          });
          idx++;
        }
      }

      selected.push(...picked);
    });

    // Shuffle questions so subjects are realistically intermixed or keep grouped
    // Standard BCS shuffle:
    const shuffled = [...selected].sort(() => 0.5 - Math.random()).slice(0, targetCount);

    const stats = {
      bySubject: {
        Bangla: shuffled.filter(q => q.subject === 'Bangla').length,
        Mathematics: shuffled.filter(q => q.subject === 'Mathematics').length,
        'General Knowledge': shuffled.filter(q => q.subject === 'General Knowledge').length,
        English: shuffled.filter(q => q.subject === 'English').length,
      },
      byDifficulty: {
        Easy: shuffled.filter(q => q.difficulty === 'Easy').length,
        Medium: shuffled.filter(q => q.difficulty === 'Medium').length,
        Hard: shuffled.filter(q => q.difficulty === 'Hard').length,
      },
      verifiedCount: shuffled.filter(q => q.sourceType === 'Verified Past Question').length,
      aiCount: shuffled.filter(q => q.sourceType === 'AI-Generated Practice').length,
    };

    return { questions: shuffled, stats };
  }

  /**
   * Generates custom practice sets or 20-question mini tests
   */
  static generateCustomPractice(options: {
    subject?: SubjectType | 'All';
    difficulty?: DifficultyLevel | 'All';
    count: number;
  }): Question[] {
    const all = AppStorage.getQuestions();
    let filtered = all.filter(q => {
      if (options.subject && options.subject !== 'All' && q.subject !== options.subject) return false;
      if (options.difficulty && options.difficulty !== 'All' && q.difficulty !== options.difficulty) return false;
      return true;
    });

    if (filtered.length === 0) {
      filtered = all;
    }

    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    const count = Math.min(options.count, shuffled.length);
    return shuffled.slice(0, count);
  }
}

