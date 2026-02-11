/**
 * Validate the built data files.
 *
 * Usage: npx tsx scripts/validate_data.ts
 *
 * Checks:
 * - All 3 language files exist and have the same number of readings
 * - All 273 Vachanamruts are represented
 * - All readings have required fields
 * - Quiz questions have correct structure
 * - Word counts are reasonable
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(import.meta.dirname, '..', 'src', 'data');
const LANGUAGES = ['en', 'gu', 'hi'] as const;
const TOTAL_VACHANAMRUTS = 273;

interface Reading {
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
  dialogue: { speaker: string; type: string; text: string }[];
  summary: string;
  keyTeaching: string;
  quiz: { id: string; type: string; question: string; options: string[]; correctAnswer: number }[];
  wordCount: number;
}

let errors = 0;
let warnings = 0;

function error(msg: string) {
  console.error(`  ❌ ${msg}`);
  errors++;
}

function warn(msg: string) {
  console.warn(`  ⚠️  ${msg}`);
  warnings++;
}

function ok(msg: string) {
  console.log(`  ✅ ${msg}`);
}

function validateLanguage(lang: string): Reading[] | null {
  const filePath = path.join(DATA_DIR, `vachanamrut_${lang}.json`);

  if (!fs.existsSync(filePath)) {
    error(`File not found: ${filePath}`);
    return null;
  }

  let readings: Reading[];
  try {
    readings = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    error(`Invalid JSON in ${filePath}`);
    return null;
  }

  ok(`${lang.toUpperCase()}: ${readings.length} readings loaded`);

  // Check all 273 vachanamruts are present
  const vachSet = new Set(readings.map((r) => r.vachno));
  for (let v = 1; v <= TOTAL_VACHANAMRUTS; v++) {
    if (!vachSet.has(v)) {
      error(`${lang}: Missing Vachanamrut ${v}`);
    }
  }
  ok(`${lang}: All ${vachSet.size} unique Vachanamruts present`);

  // Check sequential IDs
  for (let i = 0; i < readings.length; i++) {
    if (readings[i].id !== i + 1) {
      error(`${lang}: Reading at index ${i} has id ${readings[i].id}, expected ${i + 1}`);
      break;
    }
  }

  // Check required fields
  for (const reading of readings) {
    if (!reading.title) warn(`${lang}: Reading ${reading.id} missing title`);
    if (!reading.prakaran) warn(`${lang}: Reading ${reading.id} missing prakaran`);
    if (reading.dialogue.length === 0) warn(`${lang}: Reading ${reading.id} has no dialogue`);
    if (reading.wordCount < 100) warn(`${lang}: Reading ${reading.id} has very low word count (${reading.wordCount})`);
    if (reading.wordCount > 5000) warn(`${lang}: Reading ${reading.id} has very high word count (${reading.wordCount})`);

    // Validate quiz
    for (const q of reading.quiz) {
      if (!q.question) warn(`${lang}: Reading ${reading.id} has quiz question without text`);
      if (q.options.length < 2) warn(`${lang}: Reading ${reading.id} quiz has <2 options`);
      if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
        error(`${lang}: Reading ${reading.id} quiz correctAnswer out of range`);
      }
    }

    // Validate chunk consistency
    if (reading.chunkIndex >= reading.totalChunks) {
      error(`${lang}: Reading ${reading.id} chunkIndex >= totalChunks`);
    }
  }

  // Check dialogue speakers
  const speakers = new Set<string>();
  for (const r of readings) {
    for (const d of r.dialogue) {
      speakers.add(d.speaker);
    }
  }
  ok(`${lang}: ${speakers.size} unique speakers: ${[...speakers].slice(0, 5).join(', ')}...`);

  return readings;
}

async function validate() {
  console.log('Validating Vachanamrut data...\n');

  const results: Record<string, Reading[] | null> = {};

  for (const lang of LANGUAGES) {
    console.log(`\n--- ${lang.toUpperCase()} ---`);
    results[lang] = validateLanguage(lang);
  }

  // Cross-language checks
  console.log('\n--- Cross-Language Checks ---');
  const enReadings = results.en;
  const guReadings = results.gu;
  const hiReadings = results.hi;

  if (enReadings && guReadings) {
    if (enReadings.length === guReadings.length) {
      ok(`EN and GU have same reading count (${enReadings.length})`);
    } else {
      error(`EN (${enReadings.length}) and GU (${guReadings.length}) have different reading counts`);
    }
  }

  if (enReadings && hiReadings) {
    if (enReadings.length === hiReadings.length) {
      ok(`EN and HI have same reading count (${enReadings.length})`);
    } else {
      error(`EN (${enReadings.length}) and HI (${hiReadings.length}) have different reading counts`);
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Errors: ${errors}`);
  console.log(`Warnings: ${warnings}`);

  if (errors > 0) {
    process.exit(1);
  }
}

validate().catch(console.error);
