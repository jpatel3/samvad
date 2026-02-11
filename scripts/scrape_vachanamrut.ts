/**
 * Scrape all 273 Vachanamruts from Anirdesh.com in EN, GU, HI.
 *
 * Usage: npx tsx scripts/scrape_vachanamrut.ts
 *
 * Fetches from: https://www.anirdesh.com/vachanamrut/index.php?format=[en|gu|hi]&vachno=[1-273]
 * Extracts `var vach = {...}` metadata and full HTML content.
 * Caches raw HTML in scripts/raw/ to avoid re-fetching.
 * 500ms delay between requests.
 */

import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://www.anirdesh.com/vachanamrut/index.php';
const LANGUAGES = ['en', 'gu', 'hi'] as const;
const TOTAL_VACHANAMRUTS = 273;
const DELAY_MS = 500;
const RAW_DIR = path.join(import.meta.dirname, 'raw');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getCachePath(lang: string, vachno: number): string {
  return path.join(RAW_DIR, `${lang}_${vachno}.html`);
}

function isCached(lang: string, vachno: number): boolean {
  return fs.existsSync(getCachePath(lang, vachno));
}

async function fetchVachanamrut(lang: string, vachno: number): Promise<string> {
  const cachePath = getCachePath(lang, vachno);

  if (isCached(lang, vachno)) {
    console.log(`  [cached] ${lang}/${vachno}`);
    return fs.readFileSync(cachePath, 'utf-8');
  }

  const url = `${BASE_URL}?format=${lang}&vachno=${vachno}`;
  console.log(`  [fetch] ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  const html = await response.text();
  fs.writeFileSync(cachePath, html, 'utf-8');

  // Rate limit
  await new Promise((r) => setTimeout(r, DELAY_MS));

  return html;
}

interface VachMetadata {
  vachno: number;
  secno: number;
  loc: string;
  place: string;
  title: string;
  md5: string;
}

function extractMetadata(html: string): VachMetadata | null {
  const match = html.match(/var\s+vach\s*=\s*\{([^}]+)\}/);
  if (!match) return null;

  try {
    // Parse the JS object (not strictly JSON, may have unquoted keys)
    const objStr = `{${match[1]}}`;
    // Convert JS-style to JSON
    const jsonStr = objStr
      .replace(/(\w+)\s*:/g, '"$1":')
      .replace(/'/g, '"');
    return JSON.parse(jsonStr);
  } catch {
    console.warn('  Failed to parse metadata');
    return null;
  }
}

async function scrapeAll() {
  ensureDir(RAW_DIR);

  const stats = { total: 0, fetched: 0, cached: 0, errors: 0 };

  for (const lang of LANGUAGES) {
    console.log(`\nScraping ${lang.toUpperCase()}...`);

    for (let vachno = 1; vachno <= TOTAL_VACHANAMRUTS; vachno++) {
      stats.total++;

      try {
        const wasCached = isCached(lang, vachno);
        await fetchVachanamrut(lang, vachno);

        if (wasCached) {
          stats.cached++;
        } else {
          stats.fetched++;
        }
      } catch (err) {
        console.error(`  [error] ${lang}/${vachno}:`, err);
        stats.errors++;
      }
    }
  }

  console.log('\n--- Scrape Complete ---');
  console.log(`Total: ${stats.total}`);
  console.log(`Fetched: ${stats.fetched}`);
  console.log(`Cached: ${stats.cached}`);
  console.log(`Errors: ${stats.errors}`);
}

scrapeAll().catch(console.error);
