# Repository Structure & OneDrive Sync

## OneDrive Folder Context

The `OneDrive/` folder visible in the GitHub repository (`https://github.com/DubuqueMainStreet/DFM_V2`) is synced from **another PC at home**. This is why it appears in the GitHub history.

## Current Local Setup

✅ **OneDrive folder is properly ignored**:
- Added to `.gitignore` (line 39: `OneDrive/`)
- No OneDrive files are tracked in local git
- Local repository structure is clean

## Repository Structure

### What Should Be in GitHub:
- `src/` - All Velo code (backend, pages, styles)
- `backend/` - Additional backend utilities
- Documentation files (`.md` files)
- Configuration files (`package.json`, `wix.config.json`, etc.)

### What Should NOT Be in GitHub:
- `OneDrive/` - Synced folder from another PC (should be ignored)
- `.cursor/` - IDE-specific files (already ignored)
- `node_modules/` - Dependencies (already ignored)

## Important Notes

1. **OneDrive in GitHub History**: The GitHub repository currently contains OneDrive files from previous commits made on the other PC. This is historical and won't affect future commits since it's now ignored.

2. **Multi-PC Workflow**: 
   - This PC: `c:\Users\david\Documents\DFM_V2-main`
   - Other PC: Has OneDrive sync folder
   - Both should connect to: `https://github.com/DubuqueMainStreet/DFM_V2.git`

3. **When Merging**: The OneDrive folder in GitHub's history won't cause conflicts since it's ignored locally. We can optionally clean it from GitHub history later if needed.

## Verification

```bash
# Check OneDrive is ignored
git check-ignore OneDrive/

# Verify no OneDrive files are tracked
git ls-files | grep OneDrive
# Should return nothing
```

## All Farmers Market Projects

All Dubuque Farmers Market projects should be tracked in:
**https://github.com/DubuqueMainStreet/DFM_V2.git**

This ensures:
- Single source of truth
- Version control for all changes
- Collaboration between PCs
- Backup and history
