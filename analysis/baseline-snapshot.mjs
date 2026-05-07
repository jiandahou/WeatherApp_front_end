/**
 * Phase 0 – Baseline Snapshot Script
 * Generates a JSON snapshot of key code health indicators BEFORE any refactoring.
 * Run once now (before Phase 1) and again after each phase to track progress.
 *
 * Usage:  node analysis/baseline-snapshot.mjs
 * Output: analysis/snapshots/baseline-<timestamp>.json
 */

import { readdir, readFile, mkdir, writeFile, stat } from 'fs/promises';
import { join, relative, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const FRONT_ROOT = join(__dirname, '..');
const APP_DIR = join(FRONT_ROOT, 'app');

// ── helpers ───────────────────────────────────────────────────────────────────

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

async function readJSON(p) {
  try { return JSON.parse(await readFile(p, 'utf8')); }
  catch { return null; }
}

// ── collect metrics ───────────────────────────────────────────────────────────

const metrics = {
  capturedAt: new Date().toISOString(),
  files: { total: 0, tsx: 0, ts: 0, css: 0, json: 0 },
  directives: { useClient: [], useServer: [], apiRoutes: [] },
  patterns: {
    useEffect_fetches: [],
    consoleLog_in_component: [],
    hardcoded_env: [],
    dotenv_import: [],
  },
  dependencies: { production: {}, devDependencies: {} },
  nextConfig: {},
  typecheck: { strictMode: false },
};

// Scan source files
for await (const filePath of walk(APP_DIR)) {
  const ext = extname(filePath);
  if (!['.ts', '.tsx', '.js', '.jsx', '.css', '.json'].includes(ext)) continue;

  metrics.files.total++;
  if (ext === '.tsx') metrics.files.tsx++;
  else if (ext === '.ts') metrics.files.ts++;
  else if (ext === '.css') metrics.files.css++;
  else if (ext === '.json') metrics.files.json++;

  const rel = relative(FRONT_ROOT, filePath).replace(/\\/g, '/');
  if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) continue;

  const content = await readFile(filePath, 'utf8');
  const head = content.slice(0, 300);

  if (/"use client"/.test(head)) metrics.directives.useClient.push(rel);
  if (/"use server"/.test(head)) metrics.directives.useServer.push(rel);
  if (/route\.(ts|js)$/.test(filePath)) metrics.directives.apiRoutes.push(rel);

  // Problematic patterns
  if (/useEffect\([\s\S]{0,200}fetch\(/.test(content))
    metrics.patterns.useEffect_fetches.push(rel);
  if (/console\.log/.test(content))
    metrics.patterns.consoleLog_in_component.push(rel);
  if (/require\('dotenv'\)|import dotenv|dotenv\.config/.test(content))
    metrics.patterns.dotenv_import.push(rel);
  if (/['"]http:\/\/localhost/.test(content) || /NEXT_PUBLIC_BACKEND_URL.*localhost/.test(content))
    metrics.patterns.hardcoded_env.push(rel);
}

// package.json
const pkg = await readJSON(join(FRONT_ROOT, 'package.json'));
if (pkg) {
  metrics.dependencies.production = pkg.dependencies ?? {};
  metrics.dependencies.devDependencies = pkg.devDependencies ?? {};
}

// next.config
const nextConfigPath = join(FRONT_ROOT, 'next.config.mjs');
try {
  const raw = await readFile(nextConfigPath, 'utf8');
  metrics.nextConfig.reactStrictMode = /reactStrictMode:\s*true/.test(raw);
  metrics.nextConfig.outputStandalone = /output.*standalone/.test(raw);
  metrics.nextConfig.hasBundleAnalyzer = /@next\/bundle-analyzer/.test(raw);
} catch { /* no config */ }

// tsconfig
const tsConfig = await readJSON(join(FRONT_ROOT, 'tsconfig.json'));
metrics.typecheck.strictMode = tsConfig?.compilerOptions?.strict === true;

// ── summary ───────────────────────────────────────────────────────────────────

const summary = {
  'Files scanned': metrics.files.total,
  '"use client" count': metrics.directives.useClient.length,
  '"use server" count': metrics.directives.useServer.length,
  'API routes': metrics.directives.apiRoutes.length,
  'useEffect+fetch pattern': metrics.patterns.useEffect_fetches.length,
  'dotenv import (bad)': metrics.patterns.dotenv_import.length,
  'console.log in source': metrics.patterns.consoleLog_in_component.length,
  'reactStrictMode enabled': metrics.nextConfig.reactStrictMode,
  'TypeScript strict': metrics.typecheck.strictMode,
};

console.log('\n=== Baseline Snapshot ===\n');
console.table(summary);

// ── write snapshot ────────────────────────────────────────────────────────────

const snapshotsDir = join(__dirname, 'snapshots');
await mkdir(snapshotsDir, { recursive: true });

const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const outPath = join(snapshotsDir, `baseline-${ts}.json`);
await writeFile(outPath, JSON.stringify({ summary, metrics }, null, 2));

console.log(`\nSnapshot saved → analysis/snapshots/baseline-${ts}.json`);
console.log('\nRun this script again after each phase to track improvement.\n');
