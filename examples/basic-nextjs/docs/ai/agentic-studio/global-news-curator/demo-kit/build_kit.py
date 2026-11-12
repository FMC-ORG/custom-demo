"""Build the partner demo kit: PDFs from the Markdown sources.

Needs Google Chrome and the `markdown` package:
    python3 -m venv /tmp/mdenv && /tmp/mdenv/bin/pip install markdown
    /tmp/mdenv/bin/python build_kit.py
Output goes to ./dist (send its two files to the partner).
"""
import pathlib
import shutil
import subprocess
import tempfile

import markdown

HERE = pathlib.Path(__file__).resolve().parent
DIST = HERE / "dist"

CSS = """
@page { size: A4; margin: 14mm 14mm; }
body { font-family: 'Noto Sans', Arial, sans-serif; font-size: 10pt; line-height: 1.4; color: #1a1a1a; }
h1 { color: #205527; font-size: 19pt; border-bottom: 3px solid #205527; padding-bottom: 4px; margin: 0 0 10px; }
h2 { color: #205527; font-size: 13.5pt; margin: 18px 0 6px; break-after: avoid; }
h3 { color: #333; font-size: 11pt; margin: 12px 0 4px; break-after: avoid; }
p, li { margin: 4px 0; }
table { border-collapse: collapse; width: 100%; margin: 6px 0 10px; }
tr { break-inside: avoid; }
th { background: #205527; color: #fff; text-align: left; }
th, td { border: 1px solid #b9c7ba; padding: 4px 6px; vertical-align: top; font-size: 9pt; }
tr:nth-child(even) td { background: #f5f8f5; }
code { font-family: 'Noto Sans Mono', 'DejaVu Sans Mono', monospace; background: #eef3ee; font-size: 8.5pt; padding: 0 2px; }
pre { background: #eef3ee; padding: 6px 8px; border-left: 3px solid #205527; }
pre code { background: none; }
"""

CHEAT_CSS = CSS + """
@page { margin: 10mm 12mm; }
body { font-size: 8.6pt; line-height: 1.3; }
h1 { font-size: 15pt; } h2 { font-size: 11pt; margin: 10px 0 4px; }
th, td { font-size: 8.3pt; padding: 2px 5px; } p { margin: 3px 0; }
"""


def md_to_pdf(md_name: str, pdf_name: str, css: str, tmp: pathlib.Path) -> None:
    body = markdown.markdown((HERE / md_name).read_text(encoding="utf-8"), extensions=["tables", "fenced_code"])
    src = tmp / (pathlib.Path(pdf_name).stem + ".html")
    src.write_text(f"<html><head><meta charset='utf-8'><style>{css}</style></head><body>{body}</body></html>", encoding="utf-8")
    subprocess.run(
        ["google-chrome", "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
         f"--print-to-pdf={DIST / pdf_name}", src.as_uri()],
        check=True, capture_output=True,
    )


def main() -> None:
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()
    with tempfile.TemporaryDirectory() as t:
        tmp = pathlib.Path(t)
        md_to_pdf("demo-guide.md", "demo-guide.pdf", CSS, tmp)
        md_to_pdf("presenter-cheat-sheet.md", "presenter-cheat-sheet.pdf", CHEAT_CSS, tmp)
    for f in sorted(DIST.iterdir()):
        print(f"{f.name}  {f.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
