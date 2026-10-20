// Regenerates the token table in index.html and the subset glyph font from Accelerando-8192.
// usage: node tools/tokens.mjs <path to a gillverd/accelerando-8192 checkout>   (needs pyftsubset + brotli)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const acc = path.resolve(process.argv[2] || '');
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = path.join(root, 'index.html');
const { GlyphTokenizer } = await import(pathToFileURL(path.join(acc, 'docs/tokenizer.mjs')));
const tok = new GlyphTokenizer(JSON.parse(fs.readFileSync(path.join(acc, 'docs/data/alphabet.json'))));
const bytes = id => tok.bytes[id].length;

let src = fs.readFileSync(html, 'utf8');
const lines = JSON.parse(src.match(/const lines = (\[[\s\S]*?\]);/)[1].replace(/,\s*\]$/, ']'));

// [glyph id, chars covered] per token; the lines are ASCII so bytes == chars
const table = Object.fromEntries(lines.map(l => [l, tok.encode(l).map(id => [id, bytes(id)])]));
const ids = new Set([37, 54]); // F, W
for (const t of Object.values(table)) for (const [id] of t) ids.add(id);

src = src.replace(/const tokens = .*;/, `const tokens = ${JSON.stringify(table)};`);
fs.writeFileSync(html, src);

execFileSync('pyftsubset', [
  path.join(acc, 'docs/assets/accelerando-8192.ttf'),
  '--unicodes=' + [...ids].map(id => (0xF0000 + id).toString(16)).join(','),
  '--flavor=woff2', '--output-file=' + path.join(root, 'assets/accelerando-fw.woff2')
], { stdio: 'inherit' });
console.log(`${lines.length} lines, ${ids.size} glyphs`);
