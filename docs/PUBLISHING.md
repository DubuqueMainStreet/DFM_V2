# Wix Site: Commit & Publish Process

Use this process after any Velo/Wix code changes or when bumping the UI version. It removes the need for manual steps.

---

## When to Run

- You changed page code, backend, public assets, or `wix.config.json`
- You bumped `uiVersion` in `wix.config.json`
- You want the live site to match the repo (or local working copy)

---

## Prerequisites

- **Wix CLI:** `npm install -g @wix/cli` or use `npx wix` from the repo
- **Auth:** CLI must be logged in (`npx wix login` if needed)
- **Optional but recommended:** Run `npx wix dev` so local code is synced to the Wix Editor before publishing

---

## Step 1: Commit

From the repo root (e.g. `c:\Users\david\Documents\DFM_V2-main`):

```powershell
# Stage the files you changed (Wix code, config, or docs)
git add src/pages/*.js src/backend/*.jsw wix.config.json docs/...

# Commit with a clear message; include ui version when relevant
git commit -m "Short description of changes; ui version 578"
```

**Examples:**

- `git commit -m "Specialty admin: location filter and quick stats; ui version 577"`
- `git commit -m "Docs: publishing process; ui version 578"`

---

## Step 2: Publish (Non-Interactive)

Publish **local code** to production so the live site matches your committed (or current) files. No prompts.

```powershell
cd c:\Users\david\Documents\DFM_V2-main
npx wix publish --source local -y
```

- **`--source local`** — Use the code on your machine (not the remote branch)
- **`-y`** — Auto-approve preview; no interactive confirmation

**Result:** Site is live at https://www.dubuquefarmersmarket.org/ using the UI version in `wix.config.json`.

---

## One-Liner (After Staging)

If you’ve already run `git add` and want to commit and publish in one go:

```powershell
git commit -m "Your message; ui version 578"
npx wix publish --source local -y
```

---

## UI Version

- Set in **`wix.config.json`**: `"uiVersion": "578"`
- Each publish uses this version; bump it when you’ve made design/editor changes in Wix and want that version live.

---

## Reference

| Item | Value |
|------|--------|
| Config | `wix.config.json` |
| Site ID | `b8f4ee52-de89-4690-9bca-ea948bbea938` |
| Live site | https://www.dubuquefarmersmarket.org/ |
| Publish command | `npx wix publish --source local -y` |

Agent rule (`.cursor/rules/wix-velo.mdc.txt`) points here for the exact deployment steps.
