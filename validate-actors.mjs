import fs from 'node:fs';
import ts from 'typescript';

const root = new URL('.', import.meta.url);
const source = fs.readFileSync(new URL('./src/data/actors.ts', root), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { ACTORS } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const required = ['ø','b','p','m','f','d','t','n','l','z','c','s','zh','ch','sh','r','g','k','h','yi','bi','pi','mi','di','ti','ni','li','ji','qi','xi','wu','bu','pu','mu','fu','du','tu','nu','lu','zu','cu','su','zhu','chu','shu','ru','gu','ku','hu','yu','nü','lü','ju','qu','xu'];
const rows = Object.entries(ACTORS).flatMap(([key, actors]) => actors.map((actor, index) => ({ key, index, ...actor })));
const duplicates = field => {
  const groups = new Map();
  for (const row of rows) {
    const group = groups.get(row[field]) ?? [];
    group.push(row);
    groups.set(row[field], group);
  }
  return [...groups.entries()]
    .filter(([, values]) => values.length > 1)
    .map(([value, values]) => ({ value, entries: values.map(({key, index, name, wiki}) => ({key, index, name, wiki})) }));
};
const report = {
  expectedKeys: required.length,
  foundKeys: Object.keys(ACTORS).length,
  missingKeys: required.filter(key => !(key in ACTORS)),
  unexpectedKeys: Object.keys(ACTORS).filter(key => !required.includes(key)),
  counts: Object.fromEntries(Object.entries(ACTORS).map(([key, actors]) => [key, actors.length])),
  badCounts: Object.entries(ACTORS).filter(([, actors]) => actors.length < 12 || actors.length > 15).map(([key, actors]) => ({key, count: actors.length})),
  totalEntries: rows.length,
  duplicateNames: duplicates('name'),
  duplicateWikis: duplicates('wiki'),
};
fs.writeFileSync(new URL('./actor-validation-final.json', root), JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  expectedKeys: report.expectedKeys,
  foundKeys: report.foundKeys,
  missingKeys: report.missingKeys,
  unexpectedKeys: report.unexpectedKeys,
  badCounts: report.badCounts,
  totalEntries: report.totalEntries,
  duplicateNames: report.duplicateNames.length,
  duplicateWikis: report.duplicateWikis.length,
}, null, 2));
