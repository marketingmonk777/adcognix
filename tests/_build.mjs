// Compiles the pure lib modules once for node:test and fixes ESM import extensions.
import { execSync } from 'node:child_process'; import fs from 'node:fs';
const OUT = '/tmp/acx-t';
const FILES = ['recommend', 'validate', 'types', 'campaign', 'copy', 'audience', 'templates', 'publisher', 'sim', 'rules', 'payments', 'plans', 'festivals', 'posts'];
if (!globalThis.__acxBuilt) {
  execSync(`npx tsc ${FILES.map(f => `lib/${f}.ts`).join(' ')} --outDir ${OUT} --module es2020 --target es2020 --skipLibCheck --types node --moduleResolution bundler --lib es2020,dom`, { stdio: 'inherit' });
  for (const f of fs.readdirSync(OUT)) if (f.endsWith('.js')) { const p = `${OUT}/${f}`; fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace(/from '(\.\/[^']+)'/g, (m, s) => (s.endsWith('.js') ? m : `from '${s}.js'`))); }
  globalThis.__acxBuilt = true;
}
export const load = (m) => import(`${OUT}/${m}.js`);
