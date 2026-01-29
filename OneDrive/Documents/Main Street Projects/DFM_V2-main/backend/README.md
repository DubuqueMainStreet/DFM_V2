# Backend Modules

This directory contains backend web modules (`.web.js` files) that can be called from frontend Velo code.

## File Structure

- `formUtils.web.js` - Utility functions for form validation and data queries

## Usage

Import backend functions in your frontend code:

```javascript
import { validateEmail, emailExists } from 'backend/formUtils';
```

## Deployment

Backend files in this directory will be automatically synced to your Wix site when:
1. Changes are committed and pushed to GitHub
2. Wix Git Integration syncs the repository
3. Or manually via `wix publish` command
