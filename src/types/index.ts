export type TrackId = 'vachanamrut' | 'gita';

export interface DialogueExchange {
  speaker: string;
  type: 'question' | 'answer' | 'narrative';
  text: string;
}

export interface QuizQuestion {
  id: string;
  type: 'true_false' | 'mcq';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium';
}

export interface VachanamrutReading {
  id: number;
  vachno: number;
  chunkIndex: number;
  totalChunks: number;
  prakaran: string;
  prakaranIndex: number;
  prakaranVachno: number;
  title: string;
  date: string;
  setting: string;
  dialogue: DialogueExchange[];
  summary: string;
  keyTeaching: string;
  quiz: QuizQuestion[];
  wordCount: number;
}

// Generic reading type alias (same shape as VachanamrutReading for now)
export type Reading = VachanamrutReading;

export type Language = 'en' | 'gu' | 'hi';

export type Theme = 'light' | 'dark';

export type ReadingLockState = 'review' | 'current' | 'next_day' | 'future';

export type FontSize = 'small' | 'medium' | 'large';

export interface StreakData {
  current: number;
  longest: number;
  lastReadDate: string | null;
  freezesAvailable: number;
  freezesUsed: string[];
}

export interface ReadingHistory {
  [date: string]: number;
}

export interface QuizResult {
  readingId: number;
  score: number;
  totalQuestions: number;
  xpEarned: number;
  date: string;
}

export interface UserSettings {
  fontSize: FontSize;
  theme: Theme;
  language: Language;
  showSetting: boolean;
}

export interface TrackProgress {
  currentReading: number;
  completedReadings: number[];
  readingHistory: ReadingHistory;
  quizResults: QuizResult[];
}

export interface AppState {
  activeTrack: TrackId;
  tracks: Partial<Record<TrackId, TrackProgress>>;
  streak: StreakData;
  settings: UserSettings;
  xp: number;
  startDate: string | null;
}

export interface Section {
  index: number;
  name: string;
  nameGu: string;
  nameHi: string;
  totalItems: number;
  range: [number, number];
}

// Backward compat alias
export type Prakaran = Section & {
  totalVachanamruts: number;
  vachnoRange: [number, number];
};

export interface TrackDefinition {
  id: TrackId;
  name: string;
  nameGu: string;
  nameHi: string;
  description: string;
  sections: Section[];
  totalReadings: number;
  icon: string;
  comingSoon?: boolean;
}
