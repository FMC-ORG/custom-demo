#!/usr/bin/env node
/** Resumable Content Hub upload entry point. See references/recovery.md. */
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import yaml from 'js-yaml';
import recovery from './lib/recovery.cjs';
import uploads from './lib/uploads.cjs';
import hub from './lib/content-hub.cjs';

const args = process.argv.slice(2);
const arg = (name, fallback = '') => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith('--') ? args[index + 1] : fallback;
};
if (!args.length || args.includes('--help')) {
  console.log(`Usage: node upload-to-content-hub.mjs --images-dir <directory> [--initialize] [--dry-run]

--initialize   Explicit NEW build only. Existing verified records are reused, never reset.
--dry-run      Inspect inputs without authentication, uploads, or checkpoint writes.
--host         Content Hub origin (or CH_HOST / local credential file).
--config       Upload configuration (default AssetUploadConfiguration).
--project-root App root containing the optional local credentials file.

Authentication: CH_TOKEN or existing --token, --user/--password,
--client-id/--client-secret options; otherwise the optional local credential file.
Credentials and remote response bodies are never printed.

Resume with the same command, without --initialize. Partial/blocked result exits 2.
Missing records require investigation, not automatic initialization.
`);
  process.exit(0);
}
try {
  const imagesDir = resolve(arg('images-dir'));
  if (!arg('images-dir')) throw new Error('Missing --images-dir');
  let credentials = {};
  try { credentials = yaml.load(readFileSync(join(arg('project-root', process.cwd()), 'docs/ai/config/credentials.local.yaml'), 'utf8'))?.contentHub || {}; }
  catch (error) { if (error.code !== 'ENOENT') throw new Error('Credential configuration is unreadable'); }
  const hostUrl = new URL(arg('host') || process.env.CH_HOST || credentials.host || '');
  if (hostUrl.protocol !== 'https:' || hostUrl.username || hostUrl.password || hostUrl.pathname !== '/' || hostUrl.search || hostUrl.hash) throw new Error('A credential-free HTTPS Content Hub origin is required');
  const host = hostUrl.origin;
  const manifest = JSON.parse(readFileSync(join(imagesDir, 'image-manifest.json'), 'utf8'));
  if (!Array.isArray(manifest)) throw new Error('Image manifest must be an array');
  if (args.includes('--dry-run')) {
    console.log(JSON.stringify({ mode: 'dry-run', images: manifest.length, note: 'No authentication or remote verification performed.' }, null, 2));
    process.exit(0);
  }
  let token = arg('token') || process.env.CH_TOKEN || credentials.token || '';
  if (!token) {
    const user = arg('user') || credentials.user;
    const password = arg('password') || credentials.password;
    const clientId = arg('client-id') || credentials.clientId;
    const clientSecret = arg('client-secret') || credentials.clientSecret;
    if (!user || !password) throw new Error('Authentication not configured; use the manual-upload handoff');
    const oauth = !!(clientId && clientSecret);
    const body = oauth ? new URLSearchParams({ grant_type: 'password', client_id: clientId, client_secret: clientSecret, username: user, password }) : JSON.stringify({ user_name: user, password });
    const response = await fetch(`${host}${oauth ? '/oauth/token' : '/api/authenticate'}`, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(30000), headers: { 'Content-Type': oauth ? 'application/x-www-form-urlencoded' : 'application/json' }, body });
    if (!response.ok) throw new Error('Content Hub authentication failed');
    const data = await response.json();
    token = oauth && data.access_token ? `Bearer ${data.access_token}` : data.token;
    if (!token) throw new Error('Authentication returned no usable token');
  }
  const uploadConfig = arg('config') || credentials.uploadConfig || 'AssetUploadConfiguration';
  const result = await uploads.uploadImages({ directory: imagesDir, manifest, environment: { host, uploadConfig }, initialize: args.includes('--initialize'), api: hub.contentHub({ host, token, directory: imagesDir, uploadConfig }) });
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.status === 'complete' ? 0 : 2;
} catch (error) {
  // Never echo arbitrary transport messages, command-line credentials, or remote response bodies.
  console.error(error instanceof recovery.Blocked ? error.message : 'Upload stopped: check local inputs/configuration and recovery records. No automatic reset was attempted.');
  process.exitCode = 2;
}
