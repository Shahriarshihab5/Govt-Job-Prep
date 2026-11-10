import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Question, QuestionAttempt, ExamSession, MistakeRecord, RevisionScheduleItem, UserSettings, DailyActivity, Bookmark } from '../types';
import { INITIAL_QUESTIONS } from '../data/initialQuestions';

interface AppDB extends DBSchema {
  questions: {
    key: string;
    value: Question;
    indexes: { 'by-subject': string; 'by-source': string; 'by-difficulty': string };
  };
  attempts: {
    key: string;
    value: QuestionAttempt;
    indexes: { 'by-session': string; 'by-question': string; 'by-date': string };
  };
  sessions: {
    key: string;
    value: ExamSession;
    indexes: { 'by-date': string; 'by-type': string };
  };
  bookmarks: {
    key: string;
    value: Bookmark;
    indexes: { 'by-question': string };
  };
  mistakes: {
    key: string;
    value: MistakeRecord;
  };
  revisions: {
    key: string;
    value: RevisionScheduleItem;
    indexes: { 'by-due': string; 'by-status': string };
  };
  dailyActivity: {
    key: string; // YYYY-MM-DD
    value: DailyActivity;
  };
  syncQueue: {
    key: string;
    value: { id: string; action: string; payload: any; timestamp: string };
  };
}

const DB_NAME = 'govt_job_prep_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<AppDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<AppDB>> {
  if (!dbPromise) {
    dbPromise = openDB<AppDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Questions store
        if (!db.objectStoreNames.contains('questions')) {
          const qStore = db.createObjectStore('questions', { keyPath: 'id' });
          qStore.createIndex('by-subject', 'subject');
          qStore.createIndex('by-source', 'sourceType');
          qStore.createIndex('by-difficulty', 'difficulty');
        }

        // Attempts store
        if (!db.objectStoreNames.contains('attempts')) {
          const attStore = db.createObjectStore('attempts', { keyPath: 'id' });
          attStore.createIndex('by-session', 'sessionId');
          attStore.createIndex('by-question', 'questionId');
          attStore.createIndex('by-date', 'attemptedAt');
        }

        // Sessions store
        if (!db.objectStoreNames.contains('sessions')) {
          const sessStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessStore.createIndex('by-date', 'date');
          sessStore.createIndex('by-type', 'sessionType');
        }

        // Bookmarks store
        if (!db.objectStoreNames.contains('bookmarks')) {
          const bmStore = db.createObjectStore('bookmarks', { keyPath: 'questionId' });
          bmStore.createIndex('by-question', 'questionId');
        }

        // Mistakes store
        if (!db.objectStoreNames.contains('mistakes')) {
          db.createObjectStore('mistakes', { keyPath: 'questionId' });
        }

        // Revisions store
        if (!db.objectStoreNames.contains('revisions')) {
          const revStore = db.createObjectStore('revisions', { keyPath: 'id' });
          revStore.createIndex('by-due', 'dueAt');
          revStore.createIndex('by-status', 'status');
        }

        // Daily Activity store
        if (!db.objectStoreNames.contains('dailyActivity')) {
          db.createObjectStore('dailyActivity', { keyPath: 'date' });
        }

        // Sync Queue store (for offline retry safety)
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export class IndexedDBStorage {
  static async initDefaults(): Promise<void> {
    const db = await getDB();
    const count = await db.count('questions');
    if (count === 0) {
      const tx = db.transaction('questions', 'readwrite');
      for (const q of INITIAL_QUESTIONS) {
        await tx.store.put(q);
      }
      await tx.done;
    }
  }

  static async getQuestions(): Promise<Question[]> {
    const db = await getDB();
    const list = await db.getAll('questions');
    if (list.length === 0) {
      await this.initDefaults();
      return db.getAll('questions');
    }
    return list;
  }

  static async saveQuestion(q: Question): Promise<void> {
    const db = await getDB();
    await db.put('questions', q);
  }

  static async getAttempts(): Promise<QuestionAttempt[]> {
    const db = await getDB();
    return db.getAll('attempts');
  }

  static async saveAttempts(attempts: QuestionAttempt[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('attempts', 'readwrite');
    for (const a of attempts) {
      await tx.store.put(a);
    }
    await tx.done;
  }

  static async getSessions(): Promise<ExamSession[]> {
    const db = await getDB();
    const list = await db.getAll('sessions');
    return list.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  static async saveSession(sess: ExamSession): Promise<void> {
    const db = await getDB();
    await db.put('sessions', sess);
  }

  static async enqueueSyncItem(action: string, payload: any): Promise<void> {
    const db = await getDB();
    await db.put('syncQueue', {
      id: 'sync_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      action,
      payload,
      timestamp: new Date().toISOString()
    });
  }

  static async getSyncQueueCount(): Promise<number> {
    const db = await getDB();
    return db.count('syncQueue');
  }

  static async clearSyncQueue(): Promise<void> {
    const db = await getDB();
    await db.clear('syncQueue');
  }
}

