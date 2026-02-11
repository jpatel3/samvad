/**
 * Chunk parsed Vachanamruts into ~10 minute readings.
 *
 * Usage: npx tsx scripts/chunk_readings.ts
 *
 * Target: ~2,200 words per reading (~10 min at 220 WPM).
 * Short discourses (<2,500 words): single reading.
 * Long discourses (>2,500 words): split at dialogue boundaries.
 */

import * as fs from 'fs';
import * as path from 'path';

const PARSED_DIR = path.join(import.meta.dirname, 'parsed');
const CHUNKED_DIR = path.join(import.meta.dirname, 'chunked');

const TARGET_WORDS = 2200;
const CHUNK_THRESHOLD = 2500;
const LANGUAGES = ['en', 'gu', 'hi'] as const;

interface DialogueExchange {
  speaker: string;
  type: 'question' | 'answer' | 'narrative';
  text: string;
}

interface ParsedVachanamrut {
  vachno: number;
  language: string;
  title: string;
  date: string;
  setting: string;
  dialogue: DialogueExchange[];
  footnotes: string[];
  wordCount: number;
}

interface ChunkedReading {
  vachno: number;
  chunkIndex: number;
  totalChunks: number;
  title: string;
  date: string;
  setting: string;
  dialogue: DialogueExchange[];
  wordCount: number;
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function chunkDialogue(parsed: ParsedVachanamrut): ChunkedReading[] {
  if (parsed.wordCount <= CHUNK_THRESHOLD) {
    return [{
      vachno: parsed.vachno,
      chunkIndex: 0,
      totalChunks: 1,
      title: parsed.title,
      date: parsed.date,
      setting: parsed.setting,
      dialogue: parsed.dialogue,
      wordCount: parsed.wordCount,
    }];
  }

  // Split at dialogue boundaries
  const chunks: ChunkedReading[] = [];
  let currentDialogue: DialogueExchange[] = [];
  let currentWords = 0;

  for (let i = 0; i < parsed.dialogue.length; i++) {
    const exchange = parsed.dialogue[i];
    const exchangeWords = countWords(exchange.text);

    // Check if adding this exchange would exceed target
    if (currentWords > 0 && currentWords + exchangeWords > TARGET_WORDS) {
      // Prefer splitting before a question
      if (exchange.type === 'question' || currentWords >= TARGET_WORDS * 0.8) {
        chunks.push({
          vachno: parsed.vachno,
          chunkIndex: chunks.length,
          totalChunks: 0, // Updated later
          title: parsed.title,
          date: parsed.date,
          setting: chunks.length === 0 ? parsed.setting : '',
          dialogue: [...currentDialogue],
          wordCount: currentWords,
        });
        currentDialogue = [];
        currentWords = 0;
      }
    }

    currentDialogue.push(exchange);
    currentWords += exchangeWords;
  }

  // Add remaining
  if (currentDialogue.length > 0) {
    chunks.push({
      vachno: parsed.vachno,
      chunkIndex: chunks.length,
      totalChunks: 0,
      title: parsed.title,
      date: parsed.date,
      setting: '',
      dialogue: currentDialogue,
      wordCount: currentWords,
    });
  }

  // Update totalChunks
  const total = chunks.length;
  for (const chunk of chunks) {
    chunk.totalChunks = total;
  }

  return chunks;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function chunkAll() {
  ensureDir(CHUNKED_DIR);

  for (const lang of LANGUAGES) {
    const parsedPath = path.join(PARSED_DIR, `parsed_${lang}.json`);

    if (!fs.existsSync(parsedPath)) {
      console.warn(`[missing] ${parsedPath} - run parser first`);
      continue;
    }

    console.log(`\nChunking ${lang.toUpperCase()}...`);
    const parsed: ParsedVachanamrut[] = JSON.parse(
      fs.readFileSync(parsedPath, 'utf-8')
    );

    const allChunks: ChunkedReading[] = [];

    for (const vach of parsed) {
      const chunks = chunkDialogue(vach);
      allChunks.push(...chunks);
    }

    const outputPath = path.join(CHUNKED_DIR, `chunked_${lang}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(allChunks, null, 2), 'utf-8');

    const multiChunk = allChunks.filter((c) => c.totalChunks > 1);
    console.log(`  Total readings: ${allChunks.length}`);
    console.log(`  Single: ${allChunks.length - multiChunk.length}`);
    console.log(`  Chunked: ${multiChunk.length} (from ${new Set(multiChunk.map((c) => c.vachno)).size} discourses)`);
    console.log(`  Avg words: ${Math.round(allChunks.reduce((s, c) => s + c.wordCount, 0) / allChunks.length)}`);
  }

  console.log('\n--- Chunking Complete ---');
}

chunkAll().catch(console.error);
