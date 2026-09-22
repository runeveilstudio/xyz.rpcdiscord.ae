import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const hostSource = fs.readFileSync(path.resolve('host/index.jsx'), 'utf8');

test('sendCommand returns offline JSON when the bridge socket fails', () => {
    const context = {
      JSON,
      String,
      File: function () {},
      CompItem: function () {},
      alert() {},
      app: { project: null },
      Socket: function () {
        this.open = () => { throw new Error('offline'); };
        this.close = () => {};
      },
    };

    vm.runInNewContext(hostSource, context);

    const result = JSON.parse(context.sendCommand('STATUS', {
      project: 'Demo',
      comp: 'Comp 1',
    }));

    assert.equal(result.status, 'OFFLINE');
    assert.equal(result.message, 'Connection failed');
  });
