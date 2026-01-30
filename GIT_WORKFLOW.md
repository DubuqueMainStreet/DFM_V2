# Git Workflow Guide

## Current Status
✅ Git repository initialized  
✅ All current code committed  
✅ `.gitignore` configured (excludes OneDrive, .cursor, node_modules, etc.)

## Workflow: Committing Changes

### After Making Code Changes

1. **Check what changed:**
   ```bash
   git status
   ```

2. **Review specific changes:**
   ```bash
   git diff
   ```

3. **Stage all changes:**
   ```bash
   git add .
   ```
   Or stage specific files:
   ```bash
   git add src/pages/SIGNUP- NFP.owt61.js
   ```

4. **Commit with descriptive message:**
   ```bash
   git commit -m "Brief description of changes

   - Detail 1
   - Detail 2
   - Detail 3"
   ```

5. **Check commit history:**
   ```bash
   git log --oneline
   ```

## Best Practices

- ✅ **Commit frequently** - After each logical change or bug fix
- ✅ **Write clear commit messages** - Describe what changed and why
- ✅ **Review changes before committing** - Use `git diff` to verify
- ✅ **Commit related changes together** - Group related files in one commit

## Example Commit Messages

```
Fix date availability calculation in backend

- Fixed dateRef handling to support both string and object formats
- Added case-insensitive status filtering
- Added comprehensive error logging
```

```
Update styling for date repeater items

- Changed default background from beige to white
- Added unified applyDateItemStyling function
- Improved visual feedback for selected/full dates
```

## Setting Up Git User (One-Time)

If you want to set your name and email for commits:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Remote Repository (Optional)

If you want to push to GitHub/GitLab:

1. Create a repository on GitHub/GitLab
2. Add remote:
   ```bash
   git remote add origin https://github.com/yourusername/repo-name.git
   ```
3. Push:
   ```bash
   git push -u origin master
   ```

## Current Commit

Latest commit includes:
- Date availability fixes
- Styling improvements
- Enhanced logging
- All source code files
