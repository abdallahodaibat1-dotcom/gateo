#!/usr/bin/env python3
"""Migrate old Tailwind utility classes to new design tokens."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TARGET_DIRS = [ROOT / "src" / "app", ROOT / "src" / "components"]

# Files excluded from any automated class changes
SKIP_FILES = {
    ROOT / "src" / "app" / "business" / "[id]" / "page.tsx",
    ROOT / "src" / "app" / "business" / "[id]" / "edit" / "page.tsx",
    ROOT / "src" / "app" / "business-dashboard" / "website" / "theme" / "page.tsx",
    ROOT / "src" / "components" / "Categories.tsx",
}


def build_simple_replacements(is_component: bool) -> list[tuple[str, str]]:
    """Return (pattern, replacement) tuples for whole-class replacements."""

    # Page files: gray-50 is most often a full-page background, keep it slate-50
    # which maps to the design-system --background. Component files: cards/sheets
    # should use bg-surface.
    bg_gray_50_repl = "bg-surface" if is_component else "bg-slate-50"

    return [
        # Text colors
        (r"\btext-gray-900\b", "text-foreground"),
        (r"\btext-gray-400\b", "text-muted"),
        (r"\btext-gray-500\b", "text-muted"),
        (r"\btext-gray-600\b", "text-muted"),
        (r"\btext-gray-700\b", "text-foreground"),
        # Backgrounds
        (r"\bbg-white\b", "bg-surface"),
        (r"\bbg-gray-50\b", bg_gray_50_repl),
        (r"\bbg-gray-100\b", "bg-surface"),
        (r"\bbg-slate-100\b", "bg-surface"),
        # Borders
        (r"\bborder-gray-100\b", "border-border"),
        (r"\bborder-gray-200\b", "border-border"),
        (r"\bborder-gray-300\b", "border-border"),
        # Hover backgrounds
        (r"\bhover:bg-gray-50\b", "hover:bg-slate-50"),
        (r"\bhover:bg-gray-100\b", "hover:bg-slate-50"),
    ]


# Regex replacements applied everywhere (except excluded files).
# Order matters: more specific multi-class patterns first.
PATTERN_REPLACEMENTS: list[tuple[re.Pattern[str], str]] = [
    # Status badges / alerts
    (re.compile(r"\bbg-emerald-50\s+text-emerald-700\b"), "bg-success/10 text-success"),
    (re.compile(r"\bbg-emerald-100\s+text-emerald-600\b"), "bg-success/10 text-success"),
    (re.compile(r"\bbg-red-50\s+text-red-600\b"), "bg-danger/10 text-danger"),
    (re.compile(r"\bbg-red-100\s+text-red-600\b"), "bg-danger/10 text-danger"),
    (re.compile(r"\bbg-amber-50\s+text-amber-700\b"), "bg-warning/10 text-warning"),
    # Focus colors (pink / indigo -> primary)
    (re.compile(r"\bfocus:border-pink-\d+\b"), "focus:border-primary"),
    (re.compile(r"\bfocus:ring-pink-\d+\b"), "focus:ring-2 focus:ring-primary/20"),
    (re.compile(r"\bfocus:border-indigo-\d+\b"), "focus:border-primary"),
    (re.compile(r"\bfocus:ring-indigo-\d+\b"), "focus:ring-2 focus:ring-primary/20"),
]


def normalize_focus_ring_duplicates(text: str) -> str:
    """Collapse duplicate `focus:ring-2` tokens introduced by replacements."""
    # `focus:ring-2 focus:ring-primary/20 focus:ring-2` -> `focus:ring-2 focus:ring-primary/20`
    return re.sub(r"\bfocus:ring-2(\s+focus:ring-primary/20)\s+focus:ring-2\b", r"focus:ring-2\1", text)


def process_file(path: Path) -> tuple[bool, int]:
    """Return (changed, number of replacements)."""
    if path in SKIP_FILES:
        return False, 0

    original = path.read_text(encoding="utf-8")
    text = original
    is_component = "src/components" in str(path)
    total = 0

    for pattern, replacement in build_simple_replacements(is_component):
        text, count = re.subn(pattern, replacement, text)
        total += count

    for pattern, replacement in PATTERN_REPLACEMENTS:
        text, count = re.subn(pattern, replacement, text)
        total += count

    text = normalize_focus_ring_duplicates(text)

    if text != original:
        path.write_text(text, encoding="utf-8")
        return True, total
    return False, 0


def main() -> None:
    changed_files: list[tuple[Path, int]] = []
    for target_dir in TARGET_DIRS:
        for path in target_dir.rglob("*.tsx"):
            changed, count = process_file(path)
            if changed:
                rel = path.relative_to(ROOT)
                changed_files.append((rel, count))

    if changed_files:
        print(f"Changed {len(changed_files)} file(s):")
        for rel, count in sorted(changed_files):
            print(f"  {rel}: {count} replacement(s)")
    else:
        print("No files changed.")


if __name__ == "__main__":
    main()
