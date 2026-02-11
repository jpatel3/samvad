export const config = {
  wordsPerMinute: 220,
  targetReadingMinutes: 10,
  targetWordsPerReading: 2200,
  chunkThreshold: 2500,

  xp: {
    readingComplete: 10,
    quizCorrectEasy: 5,
    quizCorrectMedium: 10,
    quizPerfectScore: 15,
    streakBonus7: 20,
    streakBonus30: 50,
  },

  milestones: {
    days: [1, 3, 7, 14, 30, 50, 100, 200, 273],
    prakaranComplete: true,
  },

  maxStreakFreezes: 3,
  freezeRefillDays: 30,
} as const;
