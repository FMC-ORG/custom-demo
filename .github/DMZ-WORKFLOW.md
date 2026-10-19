# DMZ Git Workflow - Complete Implementation Guide

## Table of Contents

- [Overview](#overview)
- [Branch Structure](#branch-structure)
- [Workflow Architecture](#workflow-architecture)
- [How It Prevents Duplicate Commits](#how-it-prevents-duplicate-commits)
- [Developer Workflow](#developer-workflow)
- [Common Issues and Solutions](#common-issues-and-solutions)
- [Security Requirements](#security-requirements)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Why This Workflow?](#why-this-workflow)
- [Testing the Solution](#testing-the-solution)
- [Support](#support)

## Overview

This repository uses a DMZ integration branch and two validation stages before promotion to `main`. Passing code checks is not a guarantee of live Sitecore connectivity or deployment readiness.

**Current gates:** both the PR and DMZ workflows run the same credential-free checks against `examples/basic-nextjs` only. Neither builds the reference starters or connects to Sitecore/Content Hub, and neither requires repository secrets. Live integration and deployment must be verified separately.



## Branch Structure

```
main (clean, deployable)
  ↑
dmz (integration branch)
  ↑
feature branches (developer forks)
```

### Key Principles

- **Main branch is always clean**: Never accepts direct PRs from developers
- **DMZ branch is the integration point**: All PRs target the `dmz` branch
- **Automated validation**: All changes are validated before reaching `main`
- **Manual merge commits**: `main` is updated via manual merge commits from `dmz`
- **Manual rollback**: Failed builds can be reverted using the revert workflow

## Workflow Architecture

### Gate 1: PR Validation (`.github/workflows/pr-validation.yml`)

**Triggers:** a pull request opened or updated against `dmz`. The check name remains **Validate Pull Request** for compatibility with existing required-check settings.

**Blocking checks:**
- The PR head (not GitHub's synthetic merge commit) must be based on the latest `main` HEAD.
- The same offline `basic-nextjs` checks as Gate 2: `npm ci`, offline type-check fixtures, `agents:check`, `agents:validate`, unit tests and `type-check`.

**Permissions:** read-only repository contents, with checkout credentials not persisted. The workflow no longer posts or edits PR comments; results appear in the check and its job summary. It uses `pull_request`, never `pull_request_target`, so fork PRs do not run with write access or secrets.

**Not run:** the same exclusions as Gate 2 (no live builds, deployment, reference starters, lint/format or GEO tests). Merge conflicts with `dmz` are reported by GitHub's own mergeability check, not by this workflow.

**Result:**
- If validation fails → fix the PR before merging.
- If validation passes → the offline code checks passed; review and squash merge as usual.

### Gate 2: DMZ Validation (`.github/workflows/dmz-validation.yml`)

**Triggers:** a push to `dmz`, or manual workflow dispatch. The check name remains **Validate DMZ Branch** for compatibility with existing required-check settings.

**Scope:** only the active app, `examples/basic-nextjs`. The job uses Node 24, npm dependency caching, a 15-minute timeout, and read-only repository permissions. It requires no user-supplied Sitecore or Content Hub secrets.

**Blocking checks:**
- `npm ci` installs the locked dependencies.
- `npm run agents:check` verifies canonical skills and generated agent configuration.
- `npm run agents:validate` verifies component registrations and confirmed content-pattern rules. Existing uncertain-expression review warnings remain non-blocking.
- `npm test -- --runInBand --silent --no-cache` runs UI and agent-tooling unit tests with controlled service fixtures.
- `npm run type-check` checks TypeScript without emitting files.

Before checking types, `node tools/ci/prepare-typecheck.cjs` creates labelled offline `sites.json`/`metadata.json` fixtures only when those ignored files are missing. It never overwrites existing configuration, component maps, import maps or `next-env.d.ts`; fixture values are not live site configuration.

**Not run:** live Sitecore-connected builds, deployment, reference-starter builds, GEO server tests, Content Hub operations, or model-powered routing evaluations. Lint/format checks are also outside this lightweight gate; the pre-existing ESLint configuration issue must not be represented as a passing lint result.

**Result:** failure blocks promotion under this workflow's policy. Success confirms these offline code checks only. Review live integration and deployment separately before promoting `dmz` to `main` with a merge commit. No branch-protection settings are changed by this workflow update.

### Gate 3: DMZ Revert (`.github/workflows/revert-dmz.yml`)

**Triggers**: Manual workflow dispatch only

**What it does**:
- Reverts specified commits from `dmz` branch
- Creates tracking issues for reverted commits
- Notifies related PRs about the revert
- Provides detailed revert information

**Key Features**:
- **Flexible commit targeting**: Can revert specific commits or latest commit
- **Automatic tracking**: Creates issues to track revert reasons and fixes
- **PR notification**: Comments on related PRs about the revert
- **Detailed documentation**: Provides comprehensive revert information

## How It Prevents Duplicate Commits

### The Old Problem

```
Timeline:
1. Developer A creates feature-a from main (commit A→B→C)
2. Developer A adds commits D, E
3. Developer A's PR is squash merged to dmz as commit F
4. Main is fast-forwarded to include F
5. Developer B created feature-b from main at step 1 (has A→B→C)
6. Developer B's PR shows commits D, E, G, H ❌
   - D and E are from Developer A
   - G and H are from Developer B
   - GitHub doesn't know D and E were squashed into F
```

### The New Solution

```
Timeline:
1. Developer A creates feature-a from main (commit A→B→C)
2. Developer A adds commits D, E
3. Developer A's PR validation checks: based on latest main? ✅
4. PR is squash merged to dmz as commit F
5. dmz is manually merged into main (creates merge commit M)
6. Developer B created feature-b from main at step 1 (has A→B→C)
7. Developer B's PR validation checks: based on latest main? ❌
8. PR is REJECTED with clear instructions
9. Developer B rebases: git rebase origin/main
10. Now Developer B's branch has A→B→C→F→M→G→H
11. Developer B's PR validation checks: based on latest main? ✅
12. Developer B's PR shows only commits G, H ✅
```

## Developer Workflow

### 1. Create a Feature Branch

**Always create feature branches from the latest `main`:**

```bash
# Ensure you have the latest main
git checkout main
git pull origin main

# Create your feature branch
git checkout -b feature/my-feature
```

### 2. Work on Your Feature

Make your commits as usual:

```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature
```

### 3. Create a Pull Request to `dmz`

1. Go to GitHub and create a PR
2. **Important**: Set the base branch to `dmz` (not `main`)
3. The PR validation workflow will automatically check:
   - ✅ Your branch is based on the latest `main`
   - ✅ `basic-nextjs` agent configuration and component registrations are valid
   - ✅ Unit tests pass
   - ✅ TypeScript type checking passes (offline fixtures)
   - GitHub separately reports merge conflicts with `dmz`. Lint, formatting, full builds and live Sitecore integration are not checked.

### 4. If Validation Fails: "Not Based on Latest Main"

If you see this error, it means `main` was updated after you created your branch. Fix it:

```bash
# Fetch the latest main
git fetch origin main

# Rebase your branch onto the latest main
git checkout feature/my-feature
git rebase origin/main

# If there are conflicts, resolve them, then:
git add .
git rebase --continue

# Force push (use --force-with-lease for safety)
git push --force-with-lease origin feature/my-feature
```

### 5. Merge to `dmz` (Reviewers Only)

Once approved, reviewers will:
1. **Use "Squash and merge"** (this is required)
2. Ensure the squash commit message is descriptive
3. Delete the feature branch after merging

### 6. Manual Merge to Main

After merging to `dmz`:
1. The DMZ validation workflow runs the **final offline code gate for basic-nextjs** (agent configuration, components, unit tests and TypeScript; not live integration)
2. If validation passes: Manually merge `dmz` into `main` using a merge commit via GitHub web interface
3. If validation fails: `dmz` can be rebased to remove the problematic commits

**Note**: Since PR validation already checked everything, dmz validation should almost always pass. This is a safety net in case something changes between PR approval and merge.

**To merge dmz to main using GitHub web interface:**
1. Go to the repository on GitHub
2. Create a Pull Request from `dmz` to `main`
3. Review the changes (if needed)
4. Click **"Merge pull request"**
5. **Important**: Select **"Create a merge commit"** (not "Squash and merge" or "Rebase and merge")
6. Click **"Confirm merge"**
7. Delete the PR branch if prompted (optional, since dmz is a permanent branch)

This creates a merge commit in `main` that preserves the history from `dmz` while clearly showing when the merge occurred.

### 7. Keep Your Branches Updated

If you have a long-running feature branch, regularly update it:

```bash
# Fetch the latest main
git fetch origin main

# Rebase your branch
git checkout feature/my-feature
git rebase origin/main
git push --force-with-lease origin feature/my-feature
```

## Common Issues and Solutions

### Issue: "Previous commits showing in my PR"

**Cause**: Your branch was created from an outdated `main` before other PRs were merged.

**Solution**: Rebase your branch onto the latest `main` (see Step 4 above).

### Issue: "Merge conflicts with dmz"

**Cause**: Another PR changed the same files you're working on.

**Solution**:
```bash
git fetch origin main
git rebase origin/main
# Resolve conflicts
git add .
git rebase --continue
git push --force-with-lease origin feature/my-feature
```

### Issue: "My PR includes commits from other PRs"

**Cause**: You created your branch from `dmz` or another feature branch instead of `main`.

**Solution**: Create a new branch from `main` and cherry-pick your commits:
```bash
git checkout main
git pull origin main
git checkout -b feature/my-feature-fixed

# Cherry-pick only YOUR commits
git cherry-pick <commit-hash-1> <commit-hash-2>
git push origin feature/my-feature-fixed
```

## Security Requirements

### Required Branch Protection Rules

To ensure the DMZ workflow provides maximum security, the following branch protection rules **MUST** be configured:

#### For `main` branch:

- **Require Pull Request Before Merging**: ENABLED (for merging dmz to main via web interface)
  - **Require Approvals**: Optional (recommended for additional review)
  - **Merge Strategy**: 
    - **Allow Merge Commits**: ENABLED (required - use "Create a merge commit" option)
    - **Allow Squash Merging**: DISABLED (not used for dmz→main merges)
    - **Allow Rebase Merging**: DISABLED (not used for dmz→main merges)
- **Require Status Checks**: Optional (DMZ validation already ensures quality)
- **Restrict Push Access**: ENABLED
  - Add: Repository admins (for manual merges and emergency fixes)
- **Require Linear History**: DISABLED (allows merge commits from dmz)
- **Do Not Allow Force Pushes**: ENABLED (protects history)
- **Allow Deletions**: DISABLED

#### For `dmz` branch:

- **Require Pull Request Before Merging**: ENABLED
  - **Require Approvals**: ENABLED (at least 1 approval recommended)
  - **Dismiss Stale Pull Request Approvals**: ENABLED
- **Require Status Checks**: ENABLED
  - Required checks:
    - ✅ `Validate Pull Request` (from pr-validation.yml)
- **Merge Strategy**:
  - **Allow Squash Merging**: ENABLED (required for DMZ workflow)
  - **Allow Merge Commits**: DISABLED (enforces squash only)
  - **Allow Rebase Merging**: DISABLED (enforces squash only)
- **Require Linear History**: ENABLED
- **Do Not Allow Force Pushes**: ENABLED
  - Exception: Allow repository admins to force push (for rebasing out bad commits)

### Configuration Steps

1. **Go to Repository Settings** > Branches
2. **Add rule** for `main` branch
3. **Add rule** for `dmz` branch
4. **Configure all settings** listed above
5. **Save changes**

⚠️ **Important**: Without these branch protection rules, the DMZ workflow can be bypassed by direct pushes to the main branch.

## Configuration

### Environment Variables

The workflows use the following environment variables:

- `NODE_VERSION`: Set to `24.14.1` (matches xmcloud.build.json, required by `@sitecore-content-sdk/*@2.0.2` which needs Node `>=24`)
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

### Starter Applications

PR and DMZ validation target only `examples/basic-nextjs`, the active rendering host. Other `examples/kit-nextjs-*` directories remain reference starters and are not tested by either workflow.

### Required npm Commands

The active app must provide `agents:check`, `agents:validate`, `test` and `type-check`. To reproduce the lightweight gate from `examples/basic-nextjs` without live credentials:

```bash
npm ci
node tools/ci/prepare-typecheck.cjs
npm run agents:check
npm run agents:validate
npm test -- --runInBand --silent --no-cache
npm run type-check
```

The helper's fixtures are ignored local outputs. Do not commit them, copy deployment credentials into CI, or describe this command sequence as a live build/deployment test.

## Troubleshooting

### Common Issues

#### PR Validation Fails

Reproduce the failing step locally from `examples/basic-nextjs` with the command sequence under [Required npm Commands](#required-npm-commands).

- **Not based on latest main:** rebase onto `origin/main` and push with `--force-with-lease`.
- **Agent configuration:** edit canonical `.agents/` sources, then run `npm run agents:sync`; never hand-edit generated files.
- **Component validation, tests or type errors:** fix the reported file and rerun that command.

#### DMZ Validation Fails

1. **Check the workflow logs** for specific error details
2. **Fix issues** in the `dmz` branch
3. **Push fixes** to trigger re-validation
4. **Use revert workflow** if needed to remove problematic commits

#### Merge to Main Issues

1. **Check if `dmz` is ahead** of `main`
2. **Verify validation passed** before merging
3. **Fix validation failures** - no bypassing allowed
4. **Check for merge conflicts** when creating the PR
5. **Ensure you use "Create a merge commit"** option in GitHub web interface (not "Squash and merge" or "Rebase and merge")

### Emergency Procedures

#### Immediate Rollback

1. **Use revert workflow** to remove problematic commits
2. **Specify the commit SHA** that caused issues
3. **Provide clear reason** for the revert
4. **Monitor the revert process**

#### Handling Validation Failures

1. **Fix the underlying issues** causing validation failures
2. **Push fixes to dmz branch** to trigger re-validation
3. **Use revert workflow** if commits need to be removed
4. **No bypassing allowed** - all tests must pass

## Best Practices

1. **Always branch from `main`**, never from `dmz` or other feature branches
2. **Keep feature branches short-lived** (merge within 1-2 days if possible)
3. **Rebase frequently** if you have a long-running branch
4. **Squash is mandatory** - don't use regular merge commits for PRs to `dmz`
5. **Clean up**: Delete feature branches after they're merged
6. **Communication**: Coordinate with team if working on overlapping areas

## Why This Workflow?

### Two-Tier Validation

This workflow uses **defense in depth** with two validation layers:

1. **PR Validation** (before merge to dmz):
   - Checks if branch is based on latest main
   - Runs the offline `basic-nextjs` checks (agents, components, tests, type-check)
   - Catches issues early, before they reach dmz
   - Provides fast feedback to developers

2. **DMZ Validation** (after merge to dmz, before manual merge to main):
   - Re-runs the same offline checks on the squash-merged result
   - Safety net in case something changes between PR approval and merge
   - Indicates when dmz is ready for manual merge to main
   - Protects main from any issues that slip through

### Benefits

| Benefit | Description |
|---------|-------------|
| **No Duplicate Commits** | PRs only show new changes, not previous squashed commits |
| **Early Feedback** | Issues caught at PR time, not after merge |
| **Always Clean Main** | Two validation gates ensure main never breaks |
| **Manual Control** | Manual merge commits provide explicit control over main updates |
| **Clean History** | Squash merge creates one commit per feature |
| **Safety Net** | Two tiers of validation catch issues before they reach main |
| **Clear Process** | Automated checks guide developers with clear messages |

### Why Squash and Merge?

- Creates a single commit per feature
- Clean, linear history on `main`
- Easy to revert entire features
- Removes "fix typo" and "address review comments" noise

### Why Manual Merge Commits?

- **Explicit merge commits** provide clear history of when dmz was merged to main
- **Easy to understand** what's deployed
- **Allows for merge commit messages** documenting the merge
- **Maintains clear separation** between dmz integration and main deployment
- **Allows testing on dmz** (automatic+manual tests) before merging to main
- **Done via GitHub web interface** using "Create a merge commit" option for consistency and audit trail

## Testing the Solution

### 1. Test PR Validation - Happy Path

```bash
# Create branch from latest main
git checkout main
git pull origin main
git checkout -b test-feature

# Make a change
echo "test" >> README.md
git add README.md
git commit -m "test: happy path"
git push origin test-feature

# Create PR to dmz on GitHub
# Expected: ✅ All checks pass
```

### 2. Test PR Validation - Outdated Branch

```bash
# Create branch from old main
git checkout -b test-outdated <old-commit-hash>

# Make a change
echo "test" >> README.md
git add README.md
git commit -m "test: outdated branch"
git push origin test-outdated

# Create PR to dmz on GitHub
# Expected: ❌ "Not based on latest main" error

# Fix it
git fetch origin main
git rebase origin/main
git push --force-with-lease origin test-outdated

# Expected: ✅ Now checks pass
```

### 3. Test DMZ Validation

```bash
# After merging a PR to dmz
# Check Actions tab on GitHub
# Expected: ✅ DMZ validation passes
# Then manually merge dmz to main using GitHub web interface:
# 1. Create PR from dmz to main
# 2. Select "Create a merge commit" option
# 3. Confirm merge
```




## Support

For questions or issues with the DMZ Git Flow:

1. **Check this documentation** for common solutions
2. **Review workflow logs** for specific error details
3. **Create an issue** with detailed information about the problem
4. **Contact the maintainers** for urgent issues

---

_This documentation is automatically updated with the workflow implementations._