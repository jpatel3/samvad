/**
 * Generate summaries and key teachings for each reading using Claude API.
 *
 * Usage: ANTHROPIC_API_KEY=sk-... npx tsx scripts/generate_summaries.ts
 *
 * Generates a 2-3 sentence summary + 1-line key teaching per reading.
 */

import * as fs from 'fs';
import * as path from 'path';

const CHUNKED_DIR = path.join(import.meta.dirname, 'chunked');
const SUMMARY_DIR = path.join(import.meta.dirname, 'summaries');

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
}

interface Summary {
  vachno: number;
  chunkIndex: number;
  summary: string;
  keyTeaching: string;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function generateSummary(reading: ChunkedReading): Promise<Summary> {
  if (!API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable required');
  }

  const content = reading.dialogue.map((d) => `${d.speaker}: ${d.text}`).join('\n\n');

  const prompt = `Summarize this Vachanamrut reading (a spiritual discourse by Bhagwan Swaminarayan).

Reading: Vachanamrut ${reading.vachno}, ${reading.title}
${reading.totalChunks > 1 ? `(Part ${reading.chunkIndex + 1} of ${reading.totalChunks})` : ''}

Content:
${content}

Provide:
1. "summary": A 2-3 sentence summary of the main points discussed.
2. "keyTeaching": A single sentence capturing the most important takeaway.

Respond in JSON format:
{"summary": "...", "keyTeaching": "..."}

Only output JSON, no other text.`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error ${response.status}: ${error}`);
  }

  const data = await response.json() as { content: { type: string; text: string }[] };
  const text = data.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in response');

  const result = JSON.parse(jsonMatch[0]);

  return {
    vachno: reading.vachno,
    chunkIndex: reading.chunkIndex,
    summary: result.summary,
    keyTeaching: result.keyTeaching,
  };
}

async function generateAll() {
  ensureDir(SUMMARY_DIR);

  const chunkedPath = path.join(CHUNKED_DIR, 'chunked_en.json');

  if (!fs.existsSync(chunkedPath)) {
    console.error('Run chunk_readings.ts first');
    process.exit(1);
  }

  const readings: ChunkedReading[] = JSON.parse(
    fs.readFileSync(chunkedPath, 'utf-8')
  );

  console.log(`Generating summaries for ${readings.length} readings...`);

  const results: Summary[] = [];
  let generated = 0;

  for (const reading of readings) {
    const key = `${reading.vachno}-${reading.chunkIndex}`;
    const cachePath = path.join(SUMMARY_DIR, `summary_${key}.json`);

    if (fs.existsSync(cachePath)) {
      results.push(JSON.parse(fs.readFileSync(cachePath, 'utf-8')));
      console.log(`  [cached] ${key}`);
      continue;
    }

    try {
      const summary = await generateSummary(reading);
      results.push(summary);
      fs.writeFileSync(cachePath, JSON.stringify(summary, null, 2), 'utf-8');
      generated++;
      console.log(`  [generated] ${key}`);

      await new Promise((r) => setTimeout(r, DELAY_MS));
    } catch (err) {
      console.error(`  [error] ${key}:`, err);
    }
  }

  const outputPath = path.join(SUMMARY_DIR, 'all_summaries.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');

  console.log(`\nGenerated: ${generated}, Total: ${results.length}`);
}

generateAll().catch(console.error);
