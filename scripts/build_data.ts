/**
 * Build final data files for the app.
 *
 * Usage: npx tsx scripts/build_data.ts
 *
 * Combines chunked readings, quizzes, and summaries into the final
 * vachanamrut_[lang].json files for the app's src/data/ directory.
 */

import * as fs from 'fs';
import * as path from 'path';

const CHUNKED_DIR = path.join(import.meta.dirname, 'chunked');
const QUIZ_DIR = path.join(import.meta.dirname, 'quizzes');
const SUMMARY_DIR = path.join(import.meta.dirname, 'summaries');
const OUTPUT_DIR = path.join(import.meta.dirname, '..', 'src', 'data');

const LANGUAGES = ['en', 'gu', 'hi'] as const;

// Prakaran definitions for mapping vachno to prakaran
const PRAKARANS = [
  { index: 1, name: 'Gadhada I', nameGu: 'ગઢડા પ્રથમ', nameHi: 'गढ़डा प्रथम', range: [1, 78] },
  { index: 2, name: 'Sarangpur', nameGu: 'સારંગપુર', nameHi: 'सारंगपुर', range: [79, 96] },
  { index: 3, name: 'Kariyani', nameGu: 'કારિયાણી', nameHi: 'कारियाणी', range: [97, 108] },
  { index: 4, name: 'Loya', nameGu: 'લોયા', nameHi: 'लोया', range: [109, 126] },
  { index: 5, name: 'Panchala', nameGu: 'પંચાળા', nameHi: 'पंचाला', range: [127, 133] },
  { index: 6, name: 'Gadhada II', nameGu: 'ગઢડા મધ્ય', nameHi: 'गढ़डा मध्य', range: [134, 200] },
  { index: 7, name: 'Vartal', nameGu: 'વરતાલ', nameHi: 'वरताल', range: [201, 220] },
  { index: 8, name: 'Amdavad', nameGu: 'અમદાવાદ', nameHi: 'अहमदाबाद', range: [221, 223] },
  { index: 9, name: 'Gadhada III', nameGu: 'ગઢડા અંત્ય', nameHi: 'गढ़डा अंत्य', range: [224, 262] },
  { index: 10, name: 'Supplementary', nameGu: 'અનુવૃત્તિ', nameHi: 'अनुवृत्ति', range: [263, 273] },
] as const;

function getPrakaran(vachno: number) {
  const p = PRAKARANS.find((p) => vachno >= p.range[0] && vachno <= p.range[1]);
  return p || PRAKARANS[0];
}

function getPrakaranVachno(vachno: number): number {
  const p = getPrakaran(vachno);
  return vachno - p.range[0] + 1;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

interface ChunkedReading {
  vachno: number;
  chunkIndex: number;
  totalChunks: number;
  title: string;
  date: string;
  setting: string;
  dialogue: { speaker: string; type: string; text: string }[];
  wordCount: number;
}

async function buildAll() {
  ensureDir(OUTPUT_DIR);

  // Load quizzes and summaries (English-based, shared across languages)
  let quizzes: Record<string, any[]> = {};
  const quizPath = path.join(QUIZ_DIR, 'all_quizzes.json');
  if (fs.existsSync(quizPath)) {
    quizzes = JSON.parse(fs.readFileSync(quizPath, 'utf-8'));
  }

  let summaries: Record<string, { summary: string; keyTeaching: string }> = {};
  const summaryPath = path.join(SUMMARY_DIR, 'all_summaries.json');
  if (fs.existsSync(summaryPath)) {
    const summaryArr: { vachno: number; chunkIndex: number; summary: string; keyTeaching: string }[] =
      JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
    for (const s of summaryArr) {
      summaries[`${s.vachno}-${s.chunkIndex}`] = s;
    }
  }

  for (const lang of LANGUAGES) {
    const chunkedPath = path.join(CHUNKED_DIR, `chunked_${lang}.json`);

    if (!fs.existsSync(chunkedPath)) {
      console.warn(`[missing] ${chunkedPath}`);
      continue;
    }

    console.log(`Building ${lang.toUpperCase()}...`);
    const chunks: ChunkedReading[] = JSON.parse(fs.readFileSync(chunkedPath, 'utf-8'));

    const readings = chunks.map((chunk, index) => {
      const prakaran = getPrakaran(chunk.vachno);
      const key = `${chunk.vachno}-${chunk.chunkIndex}`;
      const quiz = quizzes[key] || [];
      const summary = summaries[key] || { summary: '', keyTeaching: '' };

      return {
        id: index + 1,
        vachno: chunk.vachno,
        chunkIndex: chunk.chunkIndex,
        totalChunks: chunk.totalChunks,
        prakaran: lang === 'gu' ? prakaran.nameGu : lang === 'hi' ? prakaran.nameHi : prakaran.name,
        prakaranIndex: prakaran.index,
        prakaranVachno: getPrakaranVachno(chunk.vachno),
        title: chunk.title,
        date: chunk.date,
        setting: chunk.setting,
        dialogue: chunk.dialogue,
        summary: summary.summary,
        keyTeaching: summary.keyTeaching,
        quiz,
        wordCount: chunk.wordCount,
      };
    });

    const outputPath = path.join(OUTPUT_DIR, `vachanamrut_${lang}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(readings, null, 2), 'utf-8');
    console.log(`  Wrote ${readings.length} readings to ${outputPath}`);
  }

  console.log('\n--- Build Complete ---');
}

buildAll().catch(console.error);
