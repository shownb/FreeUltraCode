#!/usr/bin/env node
/**
 * Bump the OpenWorkflows version across every place it is declared and
 * regenerate the update manifest (app/version.txt).
 *
 * Touches:
 *   - app/package.json            ("version")
 *   - app/src-tauri/tauri.conf.json ("version")
 *   - app/src-tauri/Cargo.toml     ([package] version)
 *   - app/version.txt              (JSON manifest consumed by updateCheck.ts)
 *
 * Usage:
 *   node scripts/bump-version.mjs <x.y.z>        # set an explicit version
 *   node scripts/bump-version.mjs patch|minor|major
 *
 * Prints the new version on the last line as "VERSION=<x.y.z>" so callers
 * (e.g. the owf-release skill) can capture it.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const REPO = 'wellingfeng/OpenWorkflows';
const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, '..'); // app/

const pkgPath = join(appDir, 'package.json');
const confPath = join(appDir, 'src-tauri', 'tauri.conf.json');
const cargoPath = join(appDir, 'src-tauri', 'Cargo.toml');
const versionTxtPath = join(appDir, 'version.txt');

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const current = String(pkg.version);

function bump(v, kind) {
  const [a, b, c] = v.split('.').map((n) => parseInt(n, 10) || 0);
  if (kind === 'major') return `${a + 1}.0.0`;
  if (kind === 'minor') return `${a}.${b + 1}.0`;
  return `${a}.${b}.${c + 1}`;
}

const arg = process.argv[2];
if (!arg) {
  console.error('usage: node scripts/bump-version.mjs <version|patch|minor|major>');
  process.exit(1);
}

const next = ['patch', 'minor', 'major'].includes(arg)
  ? bump(current, arg)
  : arg.replace(/^v/, '');

if (!/^\d+\.\d+\.\d+$/.test(next)) {
  console.error(`invalid version: ${next}`);
  process.exit(1);
}

// package.json
pkg.version = next;
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

// tauri.conf.json
const conf = JSON.parse(readFileSync(confPath, 'utf8'));
conf.version = next;
writeFileSync(confPath, `${JSON.stringify(conf, null, 2)}\n`);

// Cargo.toml — only the first line-anchored `version = "..."` ([package]).
let cargo = readFileSync(cargoPath, 'utf8');
cargo = cargo.replace(/^version = "[^"]*"/m, `version = "${next}"`);
writeFileSync(cargoPath, cargo);

// version.txt manifest
const manifest = {
  version: next,
  url: `https://github.com/${REPO}/releases/download/v${next}/OpenWorkflows_${next}_x64-setup.exe`,
  notes: `OpenWorkflows v${next}`,
  pubDate: new Date().toISOString().slice(0, 10),
};
writeFileSync(versionTxtPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`bumped ${current} -> ${next}`);
console.log('  updated: package.json, tauri.conf.json, Cargo.toml, version.txt');
console.log(`  installer asset: OpenWorkflows_${next}_x64-setup.exe`);
console.log(`VERSION=${next}`);
