import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const hostSource = fs.readFileSync(path.resolve('host/index.jsx'), 'utf8');

test('findActiveComp rejects generic Comp 1 fallback when AE reports it as the active item', () => {
  const context = {
    console,
    app: {
      project: {
        activeItem: { name: 'Comp 1', numLayers: 3, width: 1920, height: 1080, frameRate: 24, duration: 10 },
        selection: [{ name: 'Comp 1', numLayers: 3, width: 1920, height: 1080, frameRate: 24, duration: 10 }],
      },
      activeViewer: null,
    },
    ViewerType: { VIEWER_COMPOSITION: 1 },
    Date,
    Math,
    String,
    JSON,
    RegExp,
    Number,
    Object,
    Array,
    Boolean,
    parseInt,
    isNaN,
    File: function () { return { exists: false, execute() {} }; },
    Socket: function () { return { timeout: 0, open() { return false; }, write() {}, readln() { return ''; }, close() {} }; },
  };

  vm.runInNewContext(hostSource, context);

  const result = context.findActiveComp();
  assert.equal(result, null);
});
