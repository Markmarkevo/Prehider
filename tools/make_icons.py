"""Generate the extension icons (icons/icon{16,32,48,128}.png) without third-party libraries.

Usage: python tools/make_icons.py
"""
import math
import os
import struct
import zlib

C1 = (79, 110, 247)
C2 = (138, 79, 247)
WHITE = (255, 255, 255)


def lerp(a, b, t):
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))


def dist_to_segment(px, py, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay
    t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy))


def in_rounded_square(u, v, r=0.22):
    x = min(u, 1 - u)
    y = min(v, 1 - v)
    if x >= r or y >= r:
        return True
    return math.hypot(r - x, r - y) <= r


def sample(u, v):
    """Return (r, g, b, a) for a point in unit coordinates."""
    if not in_rounded_square(u, v):
        return (0, 0, 0, 0)
    base = lerp(C1, C2, (u + v) / 2)
    color = base

    # eye (white ellipse) with a pupil cut-out
    if ((u - 0.5) / 0.36) ** 2 + ((v - 0.5) / 0.21) ** 2 <= 1:
        color = WHITE
    if math.hypot(u - 0.5, v - 0.5) <= 0.1:
        color = base

    # slash: gradient outline, then white core
    d = dist_to_segment(u, v, 0.2, 0.8, 0.8, 0.2)
    if d <= 0.075:
        color = base
    if d <= 0.04:
        color = WHITE
    return (color[0], color[1], color[2], 255)


def render(size, ss=4):
    rows = []
    for y in range(size):
        row = bytearray()
        for x in range(size):
            r = g = b = a = 0.0
            for sy in range(ss):
                for sx in range(ss):
                    u = (x + (sx + 0.5) / ss) / size
                    v = (y + (sy + 0.5) / ss) / size
                    cr, cg, cb, ca = sample(u, v)
                    r += cr * ca
                    g += cg * ca
                    b += cb * ca
                    a += ca
            n = ss * ss
            if a > 0:
                row += bytes((round(r / a), round(g / a), round(b / a), round(a / n)))
            else:
                row += bytes((0, 0, 0, 0))
        rows.append(bytes(row))
    return rows


def write_png(path, size, rows):
    def chunk(tag, data):
        c = struct.pack('>I', len(data)) + tag + data
        return c + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF)

    raw = b''.join(b'\x00' + r for r in rows)
    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(raw, 9))
    png += chunk(b'IEND', b'')
    with open(path, 'wb') as f:
        f.write(png)


if __name__ == '__main__':
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'icons')
    os.makedirs(out, exist_ok=True)
    for s in (16, 32, 48, 128):
        write_png(os.path.join(out, f'icon{s}.png'), s, render(s))
        print('wrote', f'icon{s}.png')
