/**
 * Generate quiz questions for each reading using Claude API.
 *
 * Usage: ANTHROPIC_API_KEY=sk-... npx tsx scripts/generate_quizzes.ts
 *
 * Generates 2 True/False + 2 MCQ questions per reading.
 * Rate limited to respect API limits.
 */

import * as fs from 'fs';
import * as path from 'path';

const CHUNKED_DIR = path.join(import.meta.dirname, 'chunked');
const QUIZ_DIR = path.join(import.meta.dirname, 'quizzes');

const API_KEY = process.env.ANTHROPIC_API_KEY;
const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-5-20250929';
const DELAY_MS = 1000;

interface ChunkedReading {
  vachno: number;
  chunkIndex: number;
  totalChunks: number;
  title: string;
  dialogue: { speaker: string; type: string; text: string }[];
  wordCount: number;
}

interface QuizQuestion {
  id: string;
  type: 'true_false' | 'mcq';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium';
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function generateQuiz(reading: ChunkedReading, index: number): Promise<QuizQuestion[]> {
  if (!API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable required');
  }

  const content = reading.dialogue.map((d) => `${d.speaker}: ${d.text}`).join('\n\n');

  const prompt = `You are generating quiz questions for a spiritual reading app based on the Vachanamrut, a scripture of Bhagwan Swaminarayan.

Based on the following reading (Vachanamrut ${reading.vachno}, ${reading.title}), generate exactly 4 quiz questions:
- 2 True/False questions (easy difficulty)
- 2 Multiple Choice questions with 4 options each (medium difficulty)

The questions should test comprehension of the key teachings discussed.

Reading content:
${content}

Respond in valid JSON array format:
[
  {
    "type": "true_false",
    "question": "...",
    "options": ["True", "False"],
    "correctAnswer": 0 or 1,
    "explanation": "Brief explanation...",
    "difficulty": "easy"
  },
  {
    "type": "mcq",
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0-3,
    "explanation": "Brief explanation...",
    "difficulty": "medium"
  }
]

Only output the JSON array, no other text.`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error ${response.status}: ${error}`);
  }

  const data = await response.json() as { content: { type: string; text: string }[] };
  const text = data.content[0].text.trim();

  // Parse JSON from response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No JSON array found in response');

  const questions: QuizQuestion[] = JSON.parse(jsonMatch[0]);

  // Add IDs
  return questions.map((q, i) => ({
    ...q,
    id: `v${reading.vachno}-c${reading.chunkIndex}-q${i + 1}`,
  }));
}

async function generateAll() {
  ensureDir(QUIZ_DIR);

  const chunkedPath = path.join(CHUNKED_DIR, 'chunked_en.json');

  if (!fs.existsSync(chunkedPath)) {
    console.error('Run chunk_readings.ts first');
    process.exit(1);
  }

  const readings: ChunkedReading[] = JSON.parse(
    fs.readFileSync(chunkedPath, 'utf-8')
  );

  console.log(`Generating quizzes for ${readings.length} readings...`);

  const results: Record<string, QuizQuestion[]> = {};
  let generated = 0;
  let errors = 0;

  for (let i = 0; i < readings.length; i++) {
    const reading = readings[i];
    const key = `${reading.vachno}-${reading.chunkIndex}`;

    // Check if already generated
    const quizPath = path.join(QUIZ_DIR, `quiz_${key}.json`);
    if (fs.existsSync(quizPath)) {
      results[key] = JSON.parse(fs.readFileSync(quizPath, 'utf-8'));
      console.log(`  [cached] ${key}`);
      continue;
    }

    try {
      const questions = await generateQuiz(reading, i);
      results[key] = questions;
      fs.writeFileSync(quizPath, JSON.stringify(questions, null, 2), 'utf-8');
      generated++;
      console.log(`  [generated] ${key} (${generated}/${readings.length})`);

      await new Promise((r) => setTimeout(r, DELAY_MS));
    } catch (err) {
      console.error(`  [error] ${key}:`, err);
      errors++;
    }
  }

  // Write combined output
  const outputPath = path.join(QUIZ_DIR, 'all_quizzes.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');

  console.log('\n--- Quiz Generation Complete ---');
  console.log(`Generated: ${generated}`);
  console.log(`Errors: ${errors}`);
}

generateAll().catch(console.error);
