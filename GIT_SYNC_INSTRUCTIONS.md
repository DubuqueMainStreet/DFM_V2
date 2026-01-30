# Git Repository Sync Instructions

## Repository Connection ✅

**Local Repository**: `DFM_V2-main`  
**GitHub Repository**: https://github.com/DubuqueMainStreet/DFM_V2.git  
**Status**: Remote configured, ready to sync

## Current Status

- ✅ Remote `origin` added: `https://github.com/DubuqueMainStreet/DFM_V2.git`
- ✅ Local branch renamed: `master` → `main` (to match GitHub)
- ✅ Branch tracking configured: `main` tracks `origin/main`
- ⚠️ Network connectivity needed to fetch/push

## Next Steps (When Online)

### 1. Fetch from GitHub to see what's there:
```bash
git fetch origin
```

### 2. Check what's different:
```bash
# See commits on GitHub that aren't local
git log HEAD..origin/main --oneline

# See commits local that aren't on GitHub
git log origin/main..HEAD --oneline
```

### 3. Sync Strategy Options:

**Option A: If GitHub has important changes you want to keep:**
```bash
# Pull and merge GitHub changes
git pull origin main --allow-unrelated-histories
# Resolve any conflicts, then commit
```

**Option B: If your local changes are the latest (force push):**
```bash
# ⚠️ WARNING: This overwrites GitHub history
git push origin main --force
```

**Option C: Merge both histories (recommended):**
```bash
# Fetch GitHub changes
git fetch origin

# Merge without fast-forward to combine histories
git merge origin/main --allow-unrelated-histories

# Resolve any conflicts, then push
git push origin main
```

## Current Local Commits

1. `49fe6fe` - Add git workflow documentation
2. `f7efa8c` - Fix date availability and styling for signup portals

## GitHub Repository Info

- **URL**: https://github.com/DubuqueMainStreet/DFM_V2
- **Branch**: `main`
- **Commits**: 131 commits (as of last check)
- **Description**: DFM site repository 1/26/2026

## Future Workflow

After initial sync, all future changes should:

1. **Commit locally** (I'll do this automatically)
2. **Push to GitHub**:
   ```bash
   git push origin main
   ```

This ensures the GitHub repository stays up-to-date with all local changes.
