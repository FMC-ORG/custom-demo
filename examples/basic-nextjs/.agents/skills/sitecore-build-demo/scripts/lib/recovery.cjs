'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { createHash, randomUUID } = require('node:crypto');

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])]));
  return value;
}
const fingerprint = value => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const copy = value => JSON.parse(JSON.stringify(value));

function atomicText(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${randomUUID()}.tmp`;
  let fd;
  try {
    fd = fs.openSync(temporary, 'wx', 0o600);
    fs.writeFileSync(fd, content);
    fs.fsyncSync(fd);
    fs.closeSync(fd); fd = undefined;
    fs.renameSync(temporary, file);
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}

const atomicJson = (file, value) => atomicText(file, `${JSON.stringify(value, null, 2)}\n`);

class Blocked extends Error {
  constructor(operation, reason = 'needs reconciliation') { super(`${operation}: ${reason}`); this.code = 'BLOCKED'; this.operation = operation; }
}
class ConfirmedFailure extends Error {
  // Only adapters with affirmative evidence of rejection may use this type.
  constructor(code = 'REJECTED') { super('Remote operation was definitively rejected'); this.code = 'REJECTED'; this.reason = code; }
}
class AwaitingTool extends Error {
  constructor(request) { super('Awaiting marketer MCP result'); this.code = 'AWAITING_TOOL'; this.request = request; }
}

class Recovery {
  constructor({ file, intent, environment, initialize = false, attempts = 3, observationSession }) {
    this.file = file;
    this.observationSession = observationSession;
    this.attempts = attempts;
    this.poisoned = false;
    const identity = fingerprint({ intent, environment, workspace: path.resolve(path.dirname(file)) });
    if (fs.existsSync(file)) {
      try { this.state = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { throw new Blocked('build', 'unreadable recovery record; do not recreate it'); }
      if (!this.state || this.state.version !== 1 || this.state.identity !== identity || typeof this.state.buildId !== 'string' ||
          !this.state.operations || Array.isArray(this.state.operations) || typeof this.state.operations !== 'object' ||
          !Array.isArray(this.state.exceptions) || Object.values(this.state.operations).some(entry =>
            !entry || !['attempted', 'verified', 'failed', 'needs-reconciliation'].includes(entry.status) || !Object.hasOwn(entry, 'before') || (entry.status === 'verified' && !Object.hasOwn(entry, 'value')))) {
        throw new Blocked('build', 'incompatible record or changed approved inputs/environment');
      }
    } else {
      if (!initialize) throw new Blocked('build', 'missing recovery record; explicit fresh initialization required');
      this.state = { version: 1, identity, buildId: randomUUID(), operations: {}, exceptions: [] };
      this.save();
    }
    this.running = new Set();
  }
  save() {
    if (this.poisoned) throw new Blocked('checkpoint', 'persistence failed; stop writes');
    try { atomicJson(this.file, this.state); } catch {
      this.poisoned = true;
      throw new Blocked('checkpoint', 'persistence failed; stop writes');
    }
  }
  exception(key, details) {
    if (!this.state.exceptions.some(x => x.key === key)) {
      this.state.exceptions.push({ key, at: new Date().toISOString(), ...details });
      this.save();
    }
  }
  async operation(key, { before, write, verify }) {
    if (this.poisoned) throw new Blocked('checkpoint', 'persistence failed; stop writes');
    if (this.running.has(key)) throw new Blocked(key, 'operation already running');
    this.running.add(key);
    try {
      let entry = this.state.operations[key];
      // A file-transport handoff spans many Node processes. Reuse observations only
      // inside that explicit single-worker session; begin/finish rotate the session.
      if (this.observationSession && entry?.status === 'verified' && entry.observationSession === this.observationSession) return copy(entry.value);
      if (!entry || entry.status === 'failed' || entry.awaitingTool) {
        if (!entry || !entry.awaitingTool) {
          const snapshot = await before();
          entry = { status: 'attempted', before: copy(snapshot), at: new Date().toISOString() };
          this.state.operations[key] = entry;
          this.save(); // Write-ahead intent, even if the process dies before receiving an ID.
        }
        try {
          // File transport may only collect a response here, never redispatch an issued mutation.
          const result = await write(copy(entry.before));
          delete entry.awaitingTool;
          entry.result = result === undefined ? null : copy(result);
          this.save(); // Save returned identity before any subsequent remote work.
        } catch (error) {
          if (error.code === 'AWAITING_TOOL') {
            entry.awaitingTool = true;
            this.save();
            if (error.request?.mutation && error.confirmReady) {
              // A ready transport request has not been issued. Recheck preconditions
              // before allowing its claim, including after a fresh observation session.
              const current = await before();
              if (fingerprint(current) !== fingerprint(entry.before)) throw new Blocked(key, 'pre-write state changed while awaiting the MCP handoff');
              error.confirmReady();
            }
            throw error;
          }
          if (this.poisoned) throw error;
          delete entry.awaitingTool;
          if (error.code === 'REJECTED') {
            entry.status = 'failed';
            entry.reason = 'confirmed rejection';
            this.save();
            throw error;
          }
          // Never persist raw transport errors: they can contain tokens or response bodies.
          entry.reason = 'write outcome unknown';
          this.save();
        }
      }
      const previouslyVerified = entry.status === 'verified';
      for (let attempt = 0; attempt < this.attempts; attempt++) {
        let observed;
        try { observed = await verify(entry.result, copy(entry.before), entry.value); } catch (error) {
          if (error.code === 'AWAITING_TOOL' || this.poisoned) throw error;
          observed = { state: 'unknown' };
        }
        if (observed?.state === 'verified') {
          entry.status = 'verified';
          entry.value = copy(observed.value ?? null);
          if (this.observationSession) entry.observationSession = this.observationSession;
          delete entry.reason;
          this.save();
          return copy(entry.value);
        }
        if (observed?.state === 'conflict' || previouslyVerified) break;
      }
      entry.status = 'needs-reconciliation';
      this.save();
      throw new Blocked(key);
    } finally { this.running.delete(key); }
  }
  summary() {
    const operations = copy(this.state.operations);
    const unresolved = Object.entries(operations).filter(([, x]) => x.status !== 'verified').map(([key, x]) => ({ key, status: x.status }));
    return { buildId: this.state.buildId, status: unresolved.length ? 'partial' : 'complete', unresolved, exceptions: copy(this.state.exceptions) };
  }
}
module.exports = { Recovery, Blocked, ConfirmedFailure, AwaitingTool, atomicJson, atomicText, fingerprint };
