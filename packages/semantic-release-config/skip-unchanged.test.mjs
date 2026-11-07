import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, it } from 'node:test';
import { isSamePackedContent } from './skip-unchanged.mjs';

const dirs = [];
const make = (files) => {
  const dir = mkdtempSync(join(tmpdir(), 'skip-unchanged-test-'));
  dirs.push(dir);
  for (const [name, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, name)), { recursive: true });
    writeFileSync(join(dir, name), content);
  }
  return dir;
};
const manifest = (extra = {}) =>
  JSON.stringify({
    name: 'pkg',
    version: '1.0.0',
    dependencies: { a: '1.0.0' },
    devDependencies: { b: '1.0.0' },
    ...extra,
  });

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true });
});

describe('isSamePackedContent', () => {
  it('is true for identical content', () => {
    const files = { 'package.json': manifest(), 'dist/a.js': 'a' };
    assert.equal(isSamePackedContent(make(files), make(files)), true);
  });

  it('ignores version, devDependencies and registry fields', () => {
    const a = make({ 'package.json': manifest(), 'dist/a.js': 'a' });
    const b = make({
      'package.json': manifest({
        version: '1.0.1',
        devDependencies: { b: '2.0.0' },
        gitHead: 'abc',
        _id: 'pkg@1.0.1',
      }),
      'dist/a.js': 'a',
    });
    assert.equal(isSamePackedContent(a, b), true);
  });

  it('detects dependencies and other manifest changes', () => {
    const a = make({ 'package.json': manifest() });
    assert.equal(
      isSamePackedContent(
        a,
        make({ 'package.json': manifest({ dependencies: { a: '2.0.0' } }) }),
      ),
      false,
    );
    assert.equal(
      isSamePackedContent(
        a,
        make({ 'package.json': manifest({ engines: { node: '>=20' } }) }),
      ),
      false,
    );
  });

  it('detects changed, added and removed files', () => {
    const base = { 'package.json': manifest(), 'dist/a.js': 'a' };
    const a = make(base);
    assert.equal(
      isSamePackedContent(a, make({ ...base, 'dist/a.js': 'b' })),
      false,
    );
    assert.equal(
      isSamePackedContent(a, make({ ...base, 'dist/b.js': 'a' })),
      false,
    );
    assert.equal(
      isSamePackedContent(a, make({ 'package.json': manifest() })),
      false,
    );
  });
});
