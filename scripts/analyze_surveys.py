"""Analyze Public Feedback and Vendor Survey Excel files for Dubuque Farmers' Market 2025."""
import openpyxl
from collections import Counter, defaultdict
import json
import os
import sys

# Allow paths from command line: python analyze_surveys.py [public.xlsx] [vendor.xlsx]
DOWNLOADS = os.path.expanduser(r"~\Downloads")

def find_survey_file(contains: str, ends: str = "(1).xlsx"):
    for f in os.listdir(DOWNLOADS):
        if contains in f and f.endswith(ends):
            return os.path.join(DOWNLOADS, f)
    return None

PUBLIC_PATH = sys.argv[1] if len(sys.argv) > 1 else find_survey_file("Public Feedback") or os.path.join(DOWNLOADS, "Public Feedback_ Dubuque Farmers' Market (Responses) (1).xlsx")
VENDOR_PATH = sys.argv[2] if len(sys.argv) > 2 else find_survey_file("Vendor Survey") or os.path.join(DOWNLOADS, "2025 Dubuque Farmers' Market Vendor Survey (Responses) (1).xlsx")

def get_all_rows(path):
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    wb.close()
    return rows

def analyze_public():
    rows = get_all_rows(PUBLIC_PATH)
    headers = rows[0]
    data = rows[1:]
    n = len(data)
    print("\n" + "="*70)
    print("PUBLIC FEEDBACK SURVEY - DUBUQUE FARMERS' MARKET 2025")
    print("="*70)
    print(f"Total responses: {n}")
    print(f"\nColumn headers ({len(headers)}):")
    for i, h in enumerate(headers):
        if h:
            print(f"  {i}: {str(h)[:80]}")
    # Count non-empty per column
    print("\n--- Response counts per question ---")
    for i, h in enumerate(headers):
        if not h:
            continue
        vals = [r[i] for r in data if len(r) > i and r[i] is not None and str(r[i]).strip()]
        if vals:
            c = Counter(str(v).strip() for v in vals)
            top = c.most_common(5)
            print(f"\nQ: {str(h)[:70]}")
            print(f"  Responses: {len(vals)}")
            for val, count in top:
                pct = 100 * count / len(vals) if vals else 0
                print(f"    - {val[:60]}: {count} ({pct:.0f}%)")
    return headers, data

def analyze_vendor():
    rows = get_all_rows(VENDOR_PATH)
    headers = rows[0]
    data = rows[1:]
    n = len(data)
    print("\n" + "="*70)
    print("VENDOR SURVEY - DUBUQUE FARMERS' MARKET 2025")
    print("="*70)
    print(f"Total responses: {n}")
    print(f"\nColumn headers ({len(headers)}):")
    for i, h in enumerate(headers):
        if h:
            print(f"  {i}: {str(h)[:80]}")
    print("\n--- Response counts per question ---")
    for i, h in enumerate(headers):
        if not h:
            continue
        vals = [r[i] for r in data if len(r) > i and r[i] is not None and str(r[i]).strip()]
        if vals:
            c = Counter(str(v).strip() for v in vals)
            top = c.most_common(8)
            print(f"\nQ: {str(h)[:70]}")
            print(f"  Responses: {len(vals)}")
            for val, count in top:
                pct = 100 * count / len(vals) if vals else 0
                print(f"    - {val[:60]}: {count} ({pct:.0f}%)")
    return headers, data

def flatten_multiselect(vals):
    """Split comma-separated options and count each."""
    c = Counter()
    for v in vals:
        s = str(v).strip()
        for part in s.split(","):
            part = part.strip()
            if part:
                c[part] += 1
    return c

def run_trend_breakdowns():
    """Print flattened counts for key multi-select questions."""
    pub_rows = get_all_rows(PUBLIC_PATH)
    pub_headers, pub_data = pub_rows[0], pub_rows[1:]
    ven_rows = get_all_rows(VENDOR_PATH)
    ven_headers, ven_data = ven_rows[0], ven_rows[1:]

    print("\n" + "="*70)
    print("TREND BREAKDOWNS (multi-select flattened)")
    print("="*70)

    # Public: col 13 = improvements, 15 = atmosphere, 16 = event programming, 18 = products
    for col, label in [(13, "Market improvements (public)"), (15, "Atmosphere words (public)"), (16, "Event programming (public)")]:
        vals = [r[col] for r in pub_data if len(r) > col and r[col]]
        if vals:
            c = flatten_multiselect(vals)
            print(f"\n--- {label} (n={len(pub_data)}) ---")
            for opt, count in c.most_common(15):
                pct = 100 * count / len(pub_data)
                print(f"  {opt[:55]}: {count} ({pct:.0f}%)")

    # Vendor: col 6 = what limited sales, 7 = enhancements
    for col, label in [(6, "What limited sales (vendors)"), (7, "Enhancements vendors support")]:
        vals = [r[col] for r in ven_data if len(r) > col and r[col]]
        if vals:
            c = flatten_multiselect(vals)
            print(f"\n--- {label} (n={len(ven_data)}) ---")
            for opt, count in c.most_common(12):
                pct = 100 * count / len(ven_data)
                print(f"  {opt[:55]}: {count} ({pct:.0f}%)")

if __name__ == "__main__":
    if not os.path.isfile(PUBLIC_PATH):
        print("Public file not found:", PUBLIC_PATH)
    if not os.path.isfile(VENDOR_PATH):
        print("Vendor file not found:", VENDOR_PATH)
    if os.path.isfile(PUBLIC_PATH):
        analyze_public()
    if os.path.isfile(VENDOR_PATH):
        analyze_vendor()
    if os.path.isfile(PUBLIC_PATH) and os.path.isfile(VENDOR_PATH):
        run_trend_breakdowns()
