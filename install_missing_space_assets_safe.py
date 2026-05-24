#!/usr/bin/env python3
from pathlib import Path
import shutil, json

ROOT = Path.cwd()
STAGING = ROOT / "space_game_missing_assets_staging"
if not STAGING.exists():
    print("ERROR: space_game_missing_assets_staging folder not found. Extract the ZIP in the project root first.")
    raise SystemExit(1)

copied = []
skipped = []
for src in STAGING.rglob("*"):
    if not src.is_file():
        continue
    rel = src.relative_to(STAGING)
    dst = ROOT / rel
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.exists():
        skipped.append(str(rel))
        continue
    shutil.copy2(src, dst)
    copied.append(str(rel))

report = {
    "copied_count": len(copied),
    "skipped_existing_count": len(skipped),
    "copied": copied,
    "skipped_existing": skipped
}
Path("space_game_safe_install_report.json").write_text(json.dumps(report, indent=2))
print(f"Safe install complete. Copied {len(copied)} missing files. Skipped {len(skipped)} existing files.")
print("Report: space_game_safe_install_report.json")
