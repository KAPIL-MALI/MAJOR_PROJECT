import fs from 'fs';

// Helper to convert title to slug
function getSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// 1. Read custom patterns from apply_custom_patterns.js
const applyCustomPatternsContent = fs.readFileSync('apply_custom_patterns.js', 'utf8');
const applyCustomSlugs = new Set();
const patternRegex = /'([a-z0-9-]+)':\s*`/g;
let match;
while ((match = patternRegex.exec(applyCustomPatternsContent)) !== null) {
  applyCustomSlugs.add(match[1]);
}

// 2. Read patterns from user_patterns.txt
const text = fs.readFileSync('user_patterns.txt', 'utf8');
const chunks = text.split('🟦');
const userPatterns = new Map(); // slug -> title

for (let i = 1; i < chunks.length; i++) {
  const chunk = chunks[i].trim();
  if (!chunk) continue;
  const lines = chunk.split('\n');
  const titleLine = lines[0].trim();
  const titleMatch = titleLine.match(/^\d+\.\s+(.*)$/);
  let title = titleLine;
  if (titleMatch) {
    title = titleMatch[1].trim();
  }
  userPatterns.set(getSlug(title), title);
}

console.log(`Loaded ${applyCustomSlugs.size} custom patterns from apply_custom_patterns.js`);
console.log(`Loaded ${userPatterns.size} patterns from user_patterns.txt`);

// 3. Compile all unique seed problems
const p1Content = fs.readFileSync('seed/problems.js', 'utf8');
const p1Slugs = [...p1Content.matchAll(/slug:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
const p1Titles = [...p1Content.matchAll(/title:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
const problems1 = p1Slugs.map((slug, idx) => ({ title: p1Titles[idx] || slug, slug }));

const p2Content = fs.readFileSync('seed/add50Problems.js', 'utf8');
const p2Titles = [...p2Content.matchAll(/title:\s*"([^"]+)"/g)].map(m => m[1]);
const problems2 = p2Titles.map(title => ({ title, slug: getSlug(title) }));

const p3Content = fs.readFileSync('seed/addRemainingProblems.js', 'utf8');
const p3Titles = [...p3Content.matchAll(/title:\s*"([^"]+)"/g)].map(m => m[1]);
const problems3 = p3Titles.map(title => ({ title, slug: getSlug(title) }));

const allProblems = new Map();
[...problems1, ...problems2, ...problems3].forEach(p => {
  allProblems.set(p.slug, p.title);
});

console.log(`Total unique seed problems: ${allProblems.size}`);

// Check which of these are covered
const missingAnyCustom = [];
const coveredByApplyCustom = [];
const coveredByUserPatterns = [];

for (const [slug, title] of allProblems.entries()) {
  if (applyCustomSlugs.has(slug)) {
    coveredByApplyCustom.push({ title, slug });
  } else if (userPatterns.has(slug)) {
    coveredByUserPatterns.push({ title, slug });
  } else {
    missingAnyCustom.push({ title, slug });
  }
}

console.log(`\n=== COVERED BY APPLY_CUSTOM_PATTERNS.JS (${coveredByApplyCustom.length}) ===`);
console.log(`\n=== COVERED BY USER_PATTERNS.TXT (${coveredByUserPatterns.length}) ===`);
coveredByUserPatterns.forEach(p => console.log(`  - ${p.title} (${p.slug})`));

console.log(`\n=== MISSING FROM BOTH (NO THEORY/PATTERN AT ALL) (${missingAnyCustom.length}) ===`);
missingAnyCustom.forEach((p, idx) => {
  console.log(`${idx + 1}. ${p.title} (${p.slug})`);
});
