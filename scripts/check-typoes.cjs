// Dev utility: scan source files for common typos introduced during editing.
const { readFileSync, readdirSync, statSync } = require("node:fs");
const { join } = require("node:path");

const ROOTS = ["app", "components", "lib"];
const BAD = /emlail|passwrod|Passwrod|emlaill|confimPassword|recieve|seperate|occured|thier/g;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "generated" || entry === "node_modules" || entry === ".next") continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx|mjs|css)$/.test(entry)) out.push(full);
  }
  return out;
}

let found = 0;
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(BAD)) {
      const line = text.slice(0, match.index).split("\n").length;
      console.log(`${file}:${line}: ${match[0]}`);
      found++;
    }
  }
}
console.log(found === 0 ? "CLEAN" : `FOUND ${found} typo(s)`);
