# Builds a single-file page for the claude.ai artifact viewer: inlines data scripts, drops the document skeleton the viewer adds itself. Usage: python3 tools/build_artifact.py OUT.html
import re, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
s = (root / 'index.html').read_text()
for name in ('palettes.js', 'levels.js'):
    tag = f'<script src="{name}"></script>'
    assert tag in s, tag
    s = s.replace(tag, '<script>\n' + (root / name).read_text() + '</script>')
s = re.sub(r'<!doctype html>\s*<html[^>]*>\s*<head>\s*<meta charset[^>]*>\s*<meta name="viewport"[^>]*>\s*', '', s)
s = s.replace('</head>\n<body>\n', '').replace('</body>\n</html>\n', '')
# the viewer already pads :root by the safe-area insets
for a, b in [('height: 100dvh;', 'height: 100%;'),
             ('padding: max(10px, env(safe-area-inset-top)) 16px max(14px, env(safe-area-inset-bottom));', 'padding: 10px 16px 14px;')]:
    assert a in s, a
    s = s.replace(a, b)
assert s.startswith('<title>')
pathlib.Path(sys.argv[1]).write_text(s)
