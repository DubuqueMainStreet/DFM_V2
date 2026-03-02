# Map brand fonts

Font roles in the map UI:

| Role | Font | Use |
|------|------|-----|
| **Primary H1** | TAY Milkbar | Popup titles (vendor/POI names) |
| **Supporting headers** | TAY Dreamboat, Dreamboat Thin | Popup subtitles (type, stall info) |
| **Supporting headers** | Outdoors Inks (Regular, WildMedium, Rough) | Available via `--font-display-ink` for labels/accents |
| **Copy** | Poppins | Body text, descriptions, tags, buttons |

Files in this folder are loaded by `vendor-map-full-ui.html` via `@font-face`. Poppins is also loaded from Google Fonts as a fallback if local files fail.
