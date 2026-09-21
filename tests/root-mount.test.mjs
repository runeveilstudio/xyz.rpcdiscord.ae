import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const html = fs.readFileSync(path.resolve('ui/index.html'), 'utf8');
const mainSource = fs.readFileSync(path.resolve('ui/src/main.jsx'), 'utf8');

test('panel HTML loads CSInterface and app script after root exists', () => {
  assert.match(html, /<div id="root"><\/div>/);
  assert.match(html, /script src="\.\.\/lib\/CSInterface\.js" defer/);
  assert.match(html, /script type="module" src="\/src\/main\.jsx" defer/);
  assert.match(mainSource, /function mountApp\(\)/);
  assert.match(mainSource, /document\.getElementById\('root'\)/);
  assert.match(mainSource, /DOMContentLoaded/);
});
