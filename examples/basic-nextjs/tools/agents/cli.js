#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { run } = require('./index');

const appRoot = path.resolve(__dirname, '..', '..');
const { exitCode, messages } = run(process.argv.slice(2), { cwd: appRoot });

for (const { level, rule, file, message } of messages) {
  const where = file ? `${file}: ` : '';
  const line = rule === 'usage' ? message : `${where}[${rule}] ${message}`;
  (level === 'error' ? console.error : console.log)(line);
}

const errors = messages.filter((m) => m.level === 'error').length;
if (errors) console.error(`\n${errors} problem(s) found.`);
process.exitCode = exitCode;
