/**
 * Phase 0 – Baseline Audit Script
 * Scans the app/ directory and reports every file that contains "use client" or "use server",
 * helping to identify incorrect boundaries before refactoring starts.
 *
 * Usage:  node analysis/check-client-boundaries.mjs
 */

import { readdir, readFile } from 'fs/promises';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..', 'app');

const results = {
  useClient: [],
  useServer: [],
  neither: [],
  total: 0,
};

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      yield fullPath;
    }
  }
}

for await (const filePath of walk(ROOT)) {
  const content = await readFile(filePath, 'utf8');
  const relPath = relative(join(__dirname, '..'), filePath).replace(/\\/g, '/');
  results.total++;

  const firstLines = content.slice(0, 200);
  if (/"use client"/.test(firstLines)) {
    results.useClient.push(relPath);
  } else if (/"use server"/.test(firstLines)) {
    results.useServer.push(relPath);
  } else {
    results.neither.push(relPath);
  }
}

console.log('\n=== Client Boundary Audit ===\n');
console.log(`Total files scanned: ${results.total}`);
console.log(`"use client" files:  ${results.useClient.length}`);
console.log(`"use server" files:  ${results.useServer.length}`);
console.log(`Implicit server:     ${results.neither.length}`);

console.log('\n--- "use client" files ---');
results.useClient.forEach(f => console.log('  ' + f));

console.log('\n--- "use server" files ---');
results.useServer.forEach(f => console.log('  ' + f));

console.log('\n--- Implicit server / no directive ---');
results.neither.forEach(f => console.log('  ' + f));

console.log('\n--- Summary ---');
const ratio = ((results.useClient.length / results.total) * 100).toFixed(1);
console.log(`Client ratio: ${ratio}%  (target after refactor: <30%)`);
