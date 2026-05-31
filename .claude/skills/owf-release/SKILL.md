---
name: owf-release
description: Cut a new OpenWorkflows desktop release — bump the version everywhere, build the Windows installer, regenerate the version.txt update manifest, commit/push, and publish a GitHub Release with the setup.exe attached. Use when the user says "release", "发版", "打包发布", "cut a release", or "ship a new version".
---

# OpenWorkflows Release

Automates the full release of the OpenWorkflows Tauri desktop app for
`wellingfeng/OpenWorkflows`. The in-app updater (see `app/src/lib/updateCheck.ts`)
reads `app/version.txt` from GitHub raw, so the manifest and the published
Release asset MUST stay in lockstep — this skill guarantees that.

## Inputs

- Target version: an explicit `x.y.z`, or `patch` / `minor` / `major` to bump
  from the current `app/package.json` version. If the user didn't specify,
  default to `patch` and confirm the resulting version with them before
  building (the build + publish steps are slow and outward-facing).

## Preconditions (check first, stop if any fail)

1. `gh auth status` — must be logged in to GitHub.
2. `git status --porcelain` — working tree should be clean (or only the intended
   release changes). Warn the user if there are unrelated modifications.
3. Rust + Node toolchains available (`cargo -V`, `node -v`). The build needs the
   MSVC toolchain (a `rust-toolchain.toml` pins it; GNU lacks `dlltool`).

## Steps

Run everything from the repo root unless noted. Prefer `rtk` prefixes for git.

### 1. Bump the version

```bash
cd app
node scripts/bump-version.mjs <version|patch|minor|major>
```

This updates `package.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`,
and regenerates `version.txt`. Capture the new version from the script's last
line (`VERSION=x.y.z`). Call it `$VER` below.

### 2. Build the installer

```bash
cd app
npm run package
```

Produces (under `app/src-tauri/target/release`):
- `bundle/nsis/OpenWorkflows_${VER}_x64-setup.exe`  ← the installer asset
- `OpenWorkflows.exe`                                ← standalone binary

The first build downloads the NSIS bundler and compiles crates (several
minutes). If it fails, stop and surface the log — do NOT publish.

Confirm the installer exists before continuing:

```bash
ls "app/src-tauri/target/release/bundle/nsis/OpenWorkflows_${VER}_x64-setup.exe"
```

### 3. Commit + push

```bash
rtk git add -A
rtk git commit -m "Release v${VER}"
rtk git push origin main
```

The push is what makes the raw `version.txt` visible to already-installed apps,
so it must land on `main`.

### 4. Publish the GitHub Release

```bash
gh release create "v${VER}" \
  --repo wellingfeng/OpenWorkflows \
  --title "OpenWorkflows v${VER}" \
  --notes "Release v${VER}" \
  "app/src-tauri/target/release/bundle/nsis/OpenWorkflows_${VER}_x64-setup.exe" \
  "app/src-tauri/target/release/OpenWorkflows.exe"
```

The asset filename MUST be `OpenWorkflows_${VER}_x64-setup.exe` — that is exactly
the URL `version.txt` points at. If you rename the asset, also fix `version.txt`.

### 5. Verify the update path end-to-end

```bash
# Manifest is live and matches the release:
rtk curl -s "https://raw.githubusercontent.com/wellingfeng/OpenWorkflows/main/app/version.txt"

# The download URL resolves (302 -> the asset):
rtk curl -sI -o /dev/null -w "%{http_code}\n" -L \
  "https://github.com/wellingfeng/OpenWorkflows/releases/download/v${VER}/OpenWorkflows_${VER}_x64-setup.exe"
```

The manifest `version` must equal `$VER`, and the download HEAD must end in
`200`. Report both to the user. The in-app download button / Settings → About
"检查更新" will now detect `$VER` for anyone on an older build.

## Notes

- Idempotency: if a step after the bump fails, the version files are already
  changed. Re-running `bump-version.mjs` with the same explicit version is safe.
- Never publish if the build failed or the installer is missing.
- Keep `tauri.conf.json`, `Cargo.toml`, `package.json`, and `version.txt`
  versions identical — `bump-version.mjs` is the single source that enforces it.
