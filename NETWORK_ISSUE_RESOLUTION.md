# Network Connectivity Issue - Git Fetch

## Problem
Unable to fetch from GitHub due to network/proxy configuration issues:
- Proxy environment variables set to `http://127.0.0.1:9`
- Git cannot connect to `github.com` port 443

## Current Status
✅ Repository configured: `https://github.com/DubuqueMainStreet/DFM_V2.git`  
✅ Local branch: `main`  
✅ Ready to sync once connectivity is resolved

## Solutions

### Option 1: Fix Proxy Settings (Recommended)

**In PowerShell (as Administrator):**
```powershell
# Unset proxy environment variables
[Environment]::SetEnvironmentVariable("HTTP_PROXY", $null, "User")
[Environment]::SetEnvironmentVariable("HTTPS_PROXY", $null, "User")
[Environment]::SetEnvironmentVariable("http_proxy", $null, "User")
[Environment]::SetEnvironmentVariable("https_proxy", $null, "User")

# Restart PowerShell/terminal, then:
cd "c:\Users\david\Documents\DFM_V2-main"
git fetch origin
```

### Option 2: Configure Git to Bypass Proxy

```powershell
cd "c:\Users\david\Documents\DFM_V2-main"
git config --global http.proxy ""
git config --global https.proxy ""
git config --global --unset http.proxy
git config --global --unset https.proxy
git fetch origin
```

### Option 3: Use SSH Instead

If you have SSH keys set up:
```powershell
cd "c:\Users\david\Documents\DFM_V2-main"
git remote set-url origin git@github.com:DubuqueMainStreet/DFM_V2.git
git fetch origin
```

### Option 4: Manual Clone and Merge

If network issues persist:
1. Clone the repo to a temporary location (from a machine with connectivity):
   ```bash
   git clone https://github.com/DubuqueMainStreet/DFM_V2.git temp-dfm
   ```
2. Copy the `.git` folder from temp-dfm to your local repo
3. Or manually merge files

## Once Fetch Works

After successfully fetching:

```bash
# See what's different
git log HEAD..origin/main --oneline  # GitHub commits not local
git log origin/main..HEAD --oneline  # Local commits not on GitHub

# Merge the histories
git merge origin/main --allow-unrelated-histories

# Resolve any conflicts, then:
git push origin main
```

## Current Local Commits (to preserve)

1. `16c70cf` - Connect local repository to GitHub
2. `49fe6fe` - Add git workflow documentation  
3. `f7efa8c` - Fix date availability and styling for signup portals

These commits contain important fixes and should be preserved during merge.
