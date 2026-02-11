/**
 * Parse raw HTML files into structured dialogue content.
 *
 * Usage: npx tsx scripts/parse_content.ts
 *
 * Reads cached HTML from scripts/raw/ and produces structured JSON
 * with speaker detection, dialogue classification, and metadata extraction.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';

const RAW_DIR = path.join(import.meta.dirname, 'raw');
const OUTPUT_DIR = path.join(import.meta.dirname, 'parsed');

const LANGUAGES = ['en', 'gu', 'hi'] as const;
const TOTAL_VACHANAMRUTS = 273;

// Speaker detection patterns per language
const SPEAKER_PATTERNS: Record<string, RegExp[]> = {
  en: [
    /^(Shriji Maharaj|Shreeji Maharaj|Bhagwan Swaminarayan)\s+(said|asked|replied|spoke|continued|then said|explained|stated|answered)[:\s]/i,
    /^(Muktanand Swami|Gopalanand Swami|Nityanand Swami|Brahmanand Swami|Shukanand Swami|Akhandanand Swami|Nishkulanand Swami)\s+(said|asked|replied|spoke|then asked|questioned)[:\s]/i,
    /^(A paramhansa|The paramhansas|A devotee|One devotee|A santo|The santos)\s+(said|asked|replied|spoke)[:\s]/i,
  ],
  gu: [
    /^(શ્રીજી મહારાજ|ભગવાન સ્વામિનારાયણ)\s+(બોલ્યા|કહ્યું|પૂછ્યું|જવાબ આપ્યો)[:\s]/,
    /^(મુક્તાનંદ સ્વામી|ગોપાળાનંદ સ્વામી|નિત્યાનંદ સ્વામી|બ્રહ્માનંદ સ્વામી)\s+(બોલ્યા|કહ્યું|પૂછ્યું)[:\s]/,
  ],
  hi: [
    /^(श्रीजी महाराज|भगवान स्वामिनारायण)\s+(बोले|कहा|पूछा|उत्तर दिया)[:\s]/,
    /^(मुक्तानंद स्वामी|गोपालानंद स्वामी|नित्यानंद स्वामी|ब्रह्मानंद स्वामी)\s+(बोले|कहा|पूछा)[:\s]/,
  ],
};

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

function detectSpeaker(text: string, lang: string): { speaker: string; rest: string } | null {
  const patterns = SPEAKER_PATTERNS[lang] || SPEAKER_PATTERNS.en;

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const speaker = match[1];
      const rest = text.slice(match[0].length).trim();
      return { speaker, rest };
    }
  }

  return null;
}

function classifyExchange(speaker: string, text: string): 'question' | 'answer' | 'narrative' {
  const maharajNames = ['Shriji Maharaj', 'Shreeji Maharaj', 'Bhagwan Swaminarayan',
    'શ્રીજી મહારાજ', 'ભગવાન સ્વામિનારાયણ',
    'श्रीजी महाराज', 'भगवान स्वामिनारायण'];

  const isMaharaj = maharajNames.some((n) => speaker.includes(n));

  // Check for question indicators
  const hasQuestion = text.includes('?') || text.includes('？');

  if (hasQuestion && !isMaharaj) return 'question';
  if (isMaharaj) return 'answer';
  return 'narrative';
}

function parseHTML(html: string, lang: string, vachno: number): ParsedVachanamrut {
  const $ = cheerio.load(html);

  // Extract metadata from var vach = {...}
  let title = `Vachanamrut ${vachno}`;
  let date = '';

  const scriptMatch = html.match(/var\s+vach\s*=\s*\{([^}]+)\}/);
  if (scriptMatch) {
    const titleMatch = scriptMatch[1].match(/title\s*:\s*['"]([^'"]+)['"]/);
    if (titleMatch) title = titleMatch[1];
  }

  // Extract date (usually in first paragraph or header)
  const dateEl = $('.vach-date, .date').first();
  if (dateEl.length) {
    date = dateEl.text().trim();
  }

  // Extract setting/assembly description
  let setting = '';
  const settingEl = $('.vach-setting, .setting, .assembly').first();
  if (settingEl.length) {
    setting = settingEl.text().trim();
  }

  // Extract main content paragraphs
  const contentEl = $('.vach-content, .content, #content, .vachanamrut-text').first();
  const paragraphs: string[] = [];

  if (contentEl.length) {
    contentEl.find('p').each((_, el) => {
      const text = $(el).text().trim();
      if (text) paragraphs.push(text);
    });
  } else {
    // Fallback: get all paragraphs from body
    $('p').each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 20) paragraphs.push(text);
    });
  }

  // Extract footnotes
  const footnotes: string[] = [];
  $('.footnote, .vach-footnote').each((_, el) => {
    footnotes.push($(el).text().trim());
  });

  // Parse paragraphs into dialogue exchanges
  const dialogue: DialogueExchange[] = [];
  let currentSpeaker = 'Narrator';
  let currentType: 'question' | 'answer' | 'narrative' = 'narrative';
  let currentText = '';

  for (const para of paragraphs) {
    const detected = detectSpeaker(para, lang);

    if (detected) {
      // Save previous exchange
      if (currentText.trim()) {
        dialogue.push({
          speaker: currentSpeaker,
          type: currentType,
          text: currentText.trim(),
        });
      }

      currentSpeaker = detected.speaker;
      currentType = classifyExchange(detected.speaker, detected.rest);
      currentText = detected.rest;
    } else {
      // Continue current speaker's text
      currentText += '\n\n' + para;
    }
  }

  // Save last exchange
  if (currentText.trim()) {
    dialogue.push({
      speaker: currentSpeaker,
      type: currentType,
      text: currentText.trim(),
    });
  }

  // If no dialogue detected, treat entire content as narrative
  if (dialogue.length === 0 && paragraphs.length > 0) {
    dialogue.push({
      speaker: 'Narrator',
      type: 'narrative',
      text: paragraphs.join('\n\n'),
    });
  }

  const allText = dialogue.map((d) => d.text).join(' ');
  const wordCount = allText.split(/\s+/).filter(Boolean).length;

  return {
    vachno,
    language: lang,
    title,
    date,
    setting,
    dialogue,
    footnotes,
    wordCount,
  };
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function parseAll() {
  ensureDir(OUTPUT_DIR);

  for (const lang of LANGUAGES) {
    console.log(`\nParsing ${lang.toUpperCase()}...`);
    const results: ParsedVachanamrut[] = [];

    for (let vachno = 1; vachno <= TOTAL_VACHANAMRUTS; vachno++) {
      const htmlPath = path.join(RAW_DIR, `${lang}_${vachno}.html`);

      if (!fs.existsSync(htmlPath)) {
        console.warn(`  [missing] ${lang}/${vachno} - run scraper first`);
        continue;
      }

      const html = fs.readFileSync(htmlPath, 'utf-8');
      const parsed = parseHTML(html, lang, vachno);
      results.push(parsed);

      if (vachno % 50 === 0) {
        console.log(`  Parsed ${vachno}/${TOTAL_VACHANAMRUTS}`);
      }
    }

    const outputPath = path.join(OUTPUT_DIR, `parsed_${lang}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`  Wrote ${results.length} entries to ${outputPath}`);
  }

  console.log('\n--- Parse Complete ---');
}

parseAll().catch(console.error);
