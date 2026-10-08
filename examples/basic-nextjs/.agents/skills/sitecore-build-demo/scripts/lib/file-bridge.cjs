'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { atomicJson, fingerprint, Blocked, AwaitingTool } = require('./recovery.cjs');
const ALLOWED = new Map([
  ['get_content_item_by_path', false], ['get_content_item_by_id', false], ['get_components_on_page', false],
  ['create_content_item', true], ['update_fields_on_item', true], ['add_component_on_page', true], ['set_component_datasource', true],
]);

/** Durable, file-in/file-out MCP adapter. It has no credentials and cannot call Sitecore itself. */
class FileBridge {
  constructor({ file, identity, initialize = false }) {
    this.file = file;
    const workspace = path.resolve(path.dirname(file));
    if (fs.existsSync(file)) {
      try { this.state = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { throw new Blocked('transport', 'unreadable MCP transport record'); }
      if (!this.state || this.state.version !== 1 || this.state.identity !== identity || this.state.workspace !== workspace || !this.state.requests || !this.state.cache || Array.isArray(this.state.requests) || Array.isArray(this.state.cache) || Object.values(this.state.requests).some(request => !request || !request.id || !ALLOWED.has(request.tool) || ALLOWED.get(request.tool) !== request.mutation || !['ready', 'issued', 'done'].includes(request.state))) throw new Blocked('transport', 'changed environment/plan/workspace or invalid transport record');
    } else {
      if (!initialize) throw new Blocked('transport', 'missing transport record');
      this.state = { version: 1, identity, workspace, session: randomUUID(), requests: {}, cache: {} }; this.save();
    }
  }
  save() {
    if (this.poisoned) throw new Blocked('checkpoint', 'transport persistence failed; stop writes');
    try { atomicJson(this.file, this.state); } catch {
      this.poisoned = true;
      throw new Blocked('checkpoint', 'transport persistence failed; stop writes');
    }
  }
  begin() {
    this.state.session = randomUUID();
    this.state.cache = {};
    for (const [key, request] of Object.entries(this.state.requests)) if (!request.mutation) delete this.state.requests[key];
    this.save();
  }
  finish() {
    this.state.session = randomUUID();
    this.state.cache = {};
    for (const [key, request] of Object.entries(this.state.requests)) if (request.consumed) delete this.state.requests[key];
    this.save();
  }
  async call(tool, args, mutation) {
    if (this.poisoned) throw new Blocked('checkpoint', 'transport persistence failed; stop writes');
    if (!ALLOWED.has(tool) || ALLOWED.get(tool) !== mutation) throw new Blocked('transport', 'tool not in the read/write allowlist');
    const key = fingerprint({ tool, args });
    if (!mutation && Object.hasOwn(this.state.cache, key)) return this.state.cache[key];
    let request = this.state.requests[key];
    if (!request) {
      request = { id: randomUUID(), tool, args, mutation, state: 'ready' };
      this.state.requests[key] = request; this.save();
    }
    if (request.state === 'done') {
      request.consumed = true;
      if (!mutation) this.state.cache[key] = request.response;
      this.save();
      return request.response;
    }
    if (request.state === 'issued' && mutation) {
      // A claim without a recorded response is uncertain. It must never return an executable request again.
      throw new Error('Claimed MCP mutation has no recorded response');
    }
    const awaiting = new AwaitingTool({ id: request.id, tool, args, mutation, action: 'Claim this request durably before executing the MCP tool.' });
    awaiting.confirmReady = () => { request.readySession = this.state.session; this.save(); };
    throw awaiting;
  }
  claim(requestId) {
    const request = Object.values(this.state.requests).find(x => x.id === requestId);
    if (!request || request.state === 'done' || (request.mutation && (request.state !== 'ready' || request.readySession !== this.state.session))) throw new Blocked('transport', 'request already issued or not claimable; do not repeat it');
    request.state = 'issued';
    if (request.mutation) {
      this.state.cache = {};
      // Old read responses must not survive a mutation, even in a restarted Node process.
      for (const [key, entry] of Object.entries(this.state.requests)) if (!entry.mutation) delete this.state.requests[key];
    }
    this.save();
    return { id: request.id, tool: request.tool, args: request.args, mutation: request.mutation };
  }
  reply(requestId, response) {
    const request = Object.values(this.state.requests).find(x => x.id === requestId);
    if (!request || request.state !== 'issued') throw new Blocked('transport', 'response does not match an issued request');
    request.response = response;
    request.state = 'done';
    if (request.mutation) this.state.cache = {};
    this.save();
  }
}
module.exports = { FileBridge };
