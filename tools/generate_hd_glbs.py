#!/usr/bin/env python3
"""
AAA Shinkai / Studio Ghibli Sculpted .glb Asset Generator (Pure Python + Pillow)
Generates 14 UV-mapped, normal-mapped, vertex-AO-baked binary glTF 2.0 (.glb) assets:
- tokyo_house_2f, tokyo_house_1f, kyoto_machiya, sakura_school, ichiban_ramen
- anime_tree_green, anime_tree_sakura, anime_tree_maple, anime_tree_willow, anime_tree_cedar
- anime_shrub, utility_pole, anime_vending, anime_bike
"""
import io
import json
import math
import os
import random
import struct
from PIL import Image, ImageDraw, ImageFilter

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "hd")
os.makedirs(OUT_DIR, exist_ok=True)


def hash01(n):
    v = math.sin(n * 127.1 + 311.7) * 43758.5453123
    return v - math.floor(v)


def png_bytes(img):
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def make_normal_map(src_img, strength=2.4):
    """Derive a crisp tangent-space PBR normal map from luminance height via Sobel filter."""
    gray = src_img.convert("L")
    w, h = gray.size
    px = gray.load()
    out = Image.new("RGB", (w, h))
    opx = out.load()
    for y in range(h):
        ym = (y - 1) % h
        yp = (y + 1) % h
        for x in range(w):
            xm = (x - 1) % w
            xp = (x + 1) % w
            gx = (px[xp, ym] + 2 * px[xp, y] + px[xp, yp] - px[xm, ym] - 2 * px[xm, y] - px[xm, yp]) / 255.0
            gy = (px[xm, yp] + 2 * px[x, yp] + px[xp, yp] - px[xm, ym] - 2 * px[x, ym] - px[xp, ym]) / 255.0
            nx = -gx * strength
            ny = -gy * strength
            nz = 1.0
            ln = math.sqrt(nx * nx + ny * ny + nz * nz) or 1.0
            opx[x, y] = (
                int((nx / ln * 0.5 + 0.5) * 255),
                int((ny / ln * 0.5 + 0.5) * 255),
                int((nz / ln * 0.5 + 0.5) * 255),
            )
    return out


# ---------------------------------------------------------------------------
# 1. AAA Hand-Painted Anime Textures (Pillow)
# ---------------------------------------------------------------------------
def make_stucco_tex(base=(234, 224, 208), size=256):
    img = Image.new("RGBA", (size, size), base + (255,))
    draw = ImageDraw.Draw(img)
    for i in range(540):
        x = int(hash01(i * 3.1) * size)
        y = int(hash01(i * 5.7) * size)
        r = int(5 + hash01(i * 7.3) * 16)
        d = int((hash01(i * 2.3) - 0.5) * 24)
        c = tuple(max(0, min(255, base[k] + d)) for k in range(3)) + (46,)
        draw.ellipse((x - r, y - r, x + r, y + r), fill=c)
    for y in range(size):
        t = y / size
        if t < 0.18:
            a = int((1.0 - t / 0.18) * 76)
            draw.line([(0, y), (size, y)], fill=(54, 62, 92, a))
        elif t > 0.82:
            a = int(((t - 0.82) / 0.18) * 72)
            draw.line([(0, y), (size, y)], fill=(72, 68, 60, a))
    for i in range(36):
        x = int(hash01(i * 11.3) * size)
        h = int(22 + hash01(i * 4.7) * 85)
        draw.line([(x, 0), (x, h)], fill=(76, 82, 102, 28), width=2)
    return img.filter(ImageFilter.GaussianBlur(radius=0.5))


def make_kawara_roof_tex(base=(66, 72, 86), size=256):
    img = Image.new("RGBA", (size, size), base + (255,))
    draw = ImageDraw.Draw(img)
    row_h, col_w = 24, 24
    for row in range(0, size + row_h, row_h):
        draw.rectangle([0, row, size, row + 6], fill=(min(255, base[0] + 34), min(255, base[1] + 34), min(255, base[2] + 38), 195))
        draw.rectangle([0, row + row_h - 5, size, row + row_h], fill=(max(0, base[0] - 34), max(0, base[1] - 32), max(0, base[2] - 26), 225))
        for col in range(0, size + col_w, col_w):
            v = int((hash01(row * 13.7 + col * 7.1) - 0.5) * 20)
            tc = tuple(max(0, min(255, base[k] + v)) for k in range(3)) + (135,)
            draw.rectangle([col + 3, row + 6, col + col_w - 3, row + row_h - 5], fill=tc)
            draw.arc([col, row + 4, col + col_w, row + row_h + 6], 0, 180, fill=(24, 28, 40, 195), width=2)
            draw.line([(col + 2, row + 2), (col + 2, row + row_h)], fill=(255, 252, 244, 42), width=2)
    return img


def make_cinderblock_tex(size=256):
    img = Image.new("RGBA", (size, size), (144, 146, 152, 255))
    draw = ImageDraw.Draw(img)
    bh, bw = 32, 64
    for r in range(0, size, bh):
        off = (bw // 2) if (r // bh) % 2 else 0
        for c in range(-bw, size + bw, bw):
            v = int((hash01(r * 3.7 + c * 9.1) - 0.5) * 22)
            col = (142 + v, 144 + v, 150 + v, 255)
            draw.rectangle([c + off + 2, r + 2, c + off + bw - 2, r + bh - 2], fill=col, outline=(88, 92, 98, 225), width=2)
            draw.line([(c + off + 3, r + 3), (c + off + bw - 3, r + 3)], fill=(192, 194, 198, 120), width=1)
    for y in range(int(size * 0.7), size):
        a = int(((y - size * 0.7) / (size * 0.3)) * 88)
        draw.line([(0, y), (size, y)], fill=(70, 88, 60, a))
    return img


def make_wood_slats_tex(base=(134, 92, 58), dark=(68, 44, 26), vertical=True, size=256):
    img = Image.new("RGBA", (size, size), base + (255,))
    draw = ImageDraw.Draw(img)
    step = 18
    for p in range(0, size, step):
        v = int((hash01(p * 5.3) - 0.5) * 26)
        c = tuple(max(0, min(255, base[k] + v)) for k in range(3)) + (255,)
        if vertical:
            draw.rectangle([p, 0, p + step - 3, size], fill=c)
            draw.rectangle([p + step - 3, 0, p + step, size], fill=dark + (255,))
            draw.line([(p + 2, 0), (p + 2, size)], fill=(255, 232, 200, 44), width=1)
        else:
            draw.rectangle([0, p, size, p + step - 3], fill=c)
            draw.rectangle([0, p + step - 3, size, p + step], fill=dark + (255,))
    return img


def make_machiya_koshi_tex(size=256):
    img = Image.new("RGBA", (size, size), (236, 222, 192, 255))
    draw = ImageDraw.Draw(img)
    for y in range(size):
        t = y / size
        c = (int(244 - t * 34), int(224 - t * 38), int(178 - t * 40), 255)
        draw.line([(0, y), (size, y)], fill=c)
    for x in range(0, size, 14):
        draw.rectangle([x, 0, x + 5, size], fill=(60, 38, 24, 255))
    for y in range(0, size, 64):
        draw.rectangle([0, y, size, y + 6], fill=(50, 32, 20, 255))
    return img


def make_ac_unit_tex(size=256):
    img = Image.new("RGBA", (size, size), (220, 220, 216, 255))
    draw = ImageDraw.Draw(img)
    draw.rectangle([4, 4, size - 4, size - 4], outline=(136, 138, 144, 255), width=4)
    cx, cy, r = int(size * 0.38), int(size * 0.52), int(size * 0.34)
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(42, 46, 54, 255), outline=(116, 120, 128, 255), width=4)
    for k in range(3):
        ang = k * 2.09 + 0.4
        draw.line([(cx, cy), (cx + int(math.cos(ang) * r * 0.8), cy + int(math.sin(ang) * r * 0.8))], fill=(72, 78, 86, 255), width=14)
    for rr in [int(r * 0.35), int(r * 0.65), int(r * 0.92)]:
        draw.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=(156, 160, 166, 215), width=2)
    for y in range(cy - r, cy + r, 11):
        draw.line([(cx - r, y), (cx + r, y)], fill=(156, 160, 166, 150), width=2)
    draw.rectangle([int(size * 0.78), 32, size - 18, 56], fill=(62, 88, 134, 255))
    draw.rectangle([int(size * 0.78), 160, size - 18, 224], fill=(176, 178, 176, 255), outline=(128, 130, 134, 255), width=2)
    return img


def make_glass_window_tex(size=256):
    img = Image.new("RGBA", (size, size), (56, 80, 108, 255))
    draw = ImageDraw.Draw(img)
    for y in range(size):
        t = y / size
        draw.line([(0, y), (size, y)], fill=(int(118 * (1 - t) + 56 * t), int(160 * (1 - t) + 70 * t), int(198 * (1 - t) + 92 * t), 255))
    draw.polygon([(20, 0), (104, 0), (34, size), (0, size)], fill=(242, 248, 255, 70))
    draw.polygon([(122, 0), (150, 0), (82, size), (56, size)], fill=(255, 248, 228, 48))
    draw.rectangle([0, 0, 36, size], fill=(236, 226, 208, 110))
    draw.rectangle([size - 36, 0, size, size], fill=(236, 226, 208, 110))
    draw.rectangle([0, 0, size - 1, size - 1], outline=(52, 50, 48, 255), width=10)
    draw.line([(size // 2, 0), (size // 2, size)], fill=(52, 50, 48, 255), width=8)
    draw.line([(0, size // 2), (size, size // 2)], fill=(52, 50, 48, 255), width=5)
    return img


def make_clock_tex(size=256):
    img = Image.new("RGBA", (size, size), (250, 246, 234, 255))
    draw = ImageDraw.Draw(img)
    cx, cy, r = size // 2, size // 2, size // 2 - 12
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(252, 248, 238, 255), outline=(66, 52, 42, 255), width=10)
    for h in range(12):
        ang = h * math.tau / 12
        x1, y1 = cx + int(math.cos(ang) * r * 0.78), cy + int(math.sin(ang) * r * 0.78)
        x2, y2 = cx + int(math.cos(ang) * r * 0.92), cy + int(math.sin(ang) * r * 0.92)
        draw.line([(x1, y1), (x2, y2)], fill=(52, 42, 36, 255), width=6 if h % 3 == 0 else 3)
    draw.line([(cx, cy), (cx + 42, cy - 28)], fill=(44, 36, 32, 255), width=8)
    draw.line([(cx, cy), (cx - 12, cy - 68)], fill=(44, 36, 32, 255), width=5)
    draw.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=(186, 54, 48, 255))
    return img


def make_vending_tex(size=256):
    img = Image.new("RGBA", (size, size), (242, 240, 236, 255))
    draw = ImageDraw.Draw(img)
    draw.rectangle([14, 14, size - 14, int(size * 0.56)], fill=(255, 252, 238, 255), outline=(140, 152, 168, 255), width=4)
    drink_cols = [(220, 56, 64), (48, 132, 212), (76, 178, 92), (242, 168, 48), (236, 118, 156), (92, 196, 218)]
    for row in range(3):
        ry = 24 + row * 40
        draw.rectangle([18, ry + 26, size - 18, ry + 34], fill=(224, 224, 228, 255))
        for col in range(8):
            cx = 26 + col * 26
            dc = drink_cols[(row * 5 + col) % len(drink_cols)]
            draw.rounded_rectangle([cx, ry + 2, cx + 16, ry + 25], radius=3, fill=dc + (255,))
            draw.rectangle([cx + 2, ry + 8, cx + 14, ry + 14], fill=(255, 255, 255, 195))
            draw.rectangle([cx + 2, ry + 28, cx + 14, ry + 32], fill=(230, 72, 62, 255) if col % 3 == 0 else (46, 126, 216, 255))
    draw.rectangle([14, int(size * 0.59), size - 14, int(size * 0.67)], fill=(48, 108, 186, 255))
    draw.rectangle([184, int(size * 0.60), 232, int(size * 0.66)], fill=(42, 46, 54, 255))
    draw.rounded_rectangle([24, int(size * 0.72), size - 24, int(size * 0.90)], radius=6, fill=(52, 58, 66, 255), outline=(168, 172, 178, 255), width=3)
    return img


def make_bark_tex(base=(88, 62, 44), size=256):
    img = Image.new("RGBA", (size, size), base + (255,))
    draw = ImageDraw.Draw(img)
    for i in range(220):
        x = int(hash01(i * 4.1) * size)
        w = int(2 + hash01(i * 2.9) * 5)
        d = int((hash01(i * 6.7) - 0.5) * 44)
        c = tuple(max(0, min(255, base[k] + d)) for k in range(3)) + (220,)
        draw.rectangle([x, 0, x + w, size], fill=c)
    return img


def make_leaf_cluster_tex(palette, size=256, vertical_drape=False):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    if vertical_drape:
        # Organic tapered weeping willow tassels with airy sunlit gaps (zero boxy silhouette!)
        cx = size * 0.5
        for strand in range(11):
            u = (strand - 5.0) / 5.0  # -1..1
            sx = int(cx + u * (size * 0.36) + (hash01(strand * 3.7) - 0.5) * 10)
            top_y = int(16 + (u * u) * 34 + hash01(strand * 2.1) * 14)
            bot_y = int(size * (0.92 - (u * u) * 0.36 - hash01(strand * 5.3) * 0.14))
            sway_x = int(u * 14 + (hash01(strand * 7.1) - 0.5) * 12)
            col = palette[0]
            draw.line([(sx, top_y), (sx + sway_x, bot_y)], fill=col + (255,), width=3)
            steps = max(4, (bot_y - top_y) // 16)
            for k in range(steps):
                t = k / max(1, steps - 1)
                ly = int(top_y + t * (bot_y - top_y))
                lx = int(sx + t * sway_x + math.sin(k * 0.9 + strand) * 4)
                lc = palette[(k + strand) % len(palette)]
                w = int(6 - t * 2.5)
                h = int(11 - t * 3.5)
                draw.ellipse([lx - w, ly - h // 2, lx + w, ly + h], fill=lc + (255,))
        return img

    cx, cy = size * 0.5, size * 0.5
    for layer, col in enumerate(palette):
        count = 54 if layer < 2 else 38
        for i in range(count):
            seed = layer * 100 + i
            ang = hash01(seed * 3.1 + 0.7) * math.tau
            dist = (hash01(seed * 5.9 + 1.3) ** 0.60) * (size * 0.37)
            lx = cx + math.cos(ang) * dist
            ly = cy + math.sin(ang) * dist - layer * 5
            rx = (13 + hash01(seed * 7.3) * 14) * (1.0 - layer * 0.08)
            ry = rx * (0.62 + hash01(seed * 2.7) * 0.28)
            v = int((hash01(seed * 9.1) - 0.5) * 20)
            c = tuple(max(0, min(255, col[k] + v)) for k in range(3)) + (255,)
            draw.ellipse([lx - rx, ly - ry, lx + rx, ly + ry], fill=c)
    return img


# ---------------------------------------------------------------------------
# 2. glTF 2.0 Binary (.glb) Builder with Embedded Normal Maps & Vertex AO
# ---------------------------------------------------------------------------
class GLBBuilder:
    def __init__(self):
        self.materials = []
        self.textures = []
        self.images = []
        self.primitives = {}

    def _add_image_tex(self, img_pil):
        img_idx = len(self.images)
        self.images.append(png_bytes(img_pil))
        tex_idx = len(self.textures)
        self.textures.append({"source": img_idx, "sampler": 0})
        return tex_idx

    def add_material(self, name, base_color=(1, 1, 1, 1), img_pil=None, normal_strength=0.0,
                     roughness=0.8, metallic=0.02, emissive=None, alpha_mask=False, double_sided=False):
        mat = {
            "name": name,
            "pbrMetallicRoughness": {
                "baseColorFactor": list(base_color),
                "roughnessFactor": roughness,
                "metallicFactor": metallic,
            },
            "doubleSided": double_sided,
        }
        if emissive:
            mat["emissiveFactor"] = list(emissive)
        if alpha_mask:
            mat["alphaMode"] = "MASK"
            mat["alphaCutoff"] = 0.45
        if img_pil is not None:
            tex_idx = self._add_image_tex(img_pil)
            mat["pbrMetallicRoughness"]["baseColorTexture"] = {"index": tex_idx}
            if normal_strength > 0.0:
                nmap = make_normal_map(img_pil, strength=normal_strength)
                ntex = self._add_image_tex(nmap)
                mat["normalTexture"] = {"index": ntex, "scale": 1.0}
        idx = len(self.materials)
        self.materials.append(mat)
        self.primitives[idx] = {"pos": [], "norm": [], "uv": [], "col": [], "idx": []}
        return idx

    def _p(self, mat_idx):
        return self.primitives[mat_idx]

    def add_quad(self, mat_idx, v0, v1, v2, v3, n, uvs, cols):
        p = self._p(mat_idx)
        base = len(p["pos"]) // 3
        for v, uv, c in zip((v0, v1, v2, v3), uvs, cols):
            p["pos"].extend(v)
            p["norm"].extend(n)
            p["uv"].extend(uv)
            p["col"].extend(c)
        p["idx"].extend([base, base + 1, base + 2, base, base + 2, base + 3])

    def add_tri(self, mat_idx, v0, v1, v2, n, uvs, cols):
        p = self._p(mat_idx)
        base = len(p["pos"]) // 3
        for v, uv, c in zip((v0, v1, v2), uvs, cols):
            p["pos"].extend(v)
            p["norm"].extend(n)
            p["uv"].extend(uv)
            p["col"].extend(c)
        p["idx"].extend([base, base + 1, base + 2])

    @staticmethod
    def _rot_pt(pt, rx, ry, rz):
        x, y, z = pt
        if rx:
            c, s = math.cos(rx), math.sin(rx)
            y, z = y * c - z * s, y * s + z * c
        if ry:
            c, s = math.cos(ry), math.sin(ry)
            x, z = x * c + z * s, -x * s + z * c
        if rz:
            c, s = math.cos(rz), math.sin(rz)
            x, y = x * c - y * s, x * s + y * c
        return (x, y, z)

    def add_box(self, mat_idx, cx, cy, cz, w, h, d, rx=0, ry=0, rz=0, ao_bot=0.80, ao_top=1.0, uv_scale=1.0):
        hw, hh, hd = w * 0.5, h * 0.5, d * 0.5
        c_bot = (ao_bot, ao_bot, min(1.0, ao_bot + 0.05))
        c_top = (ao_top, ao_top, ao_top)
        faces = [
            (((-hw, -hh, hd), (hw, -hh, hd), (hw, hh, hd), (-hw, hh, hd)), (0, 0, 1), w * uv_scale, h * uv_scale, (c_bot, c_bot, c_top, c_top)),
            (((hw, -hh, -hd), (-hw, -hh, -hd), (-hw, hh, -hd), (hw, hh, -hd)), (0, 0, -1), w * uv_scale, h * uv_scale, (c_bot, c_bot, c_top, c_top)),
            (((hw, -hh, hd), (hw, -hh, -hd), (hw, hh, -hd), (hw, hh, hd)), (1, 0, 0), d * uv_scale, h * uv_scale, (c_bot, c_bot, c_top, c_top)),
            (((-hw, -hh, -hd), (-hw, -hh, hd), (-hw, hh, hd), (-hw, hh, -hd)), (-1, 0, 0), d * uv_scale, h * uv_scale, (c_bot, c_bot, c_top, c_top)),
            (((-hw, hh, hd), (hw, hh, hd), (hw, hh, -hd), (-hw, hh, -hd)), (0, 1, 0), w * uv_scale, d * uv_scale, (c_top, c_top, c_top, c_top)),
            (((-hw, -hh, -hd), (hw, -hh, -hd), (hw, -hh, hd), (-hw, -hh, hd)), (0, -1, 0), w * uv_scale, d * uv_scale, (c_bot, c_bot, c_bot, c_bot)),
        ]
        for verts, norm, uw, uh, cols in faces:
            tv = [tuple(self._rot_pt(v, rx, ry, rz)[k] + (cx, cy, cz)[k] for k in range(3)) for v in verts]
            rn = self._rot_pt(norm, rx, ry, rz)
            self.add_quad(mat_idx, tv[0], tv[1], tv[2], tv[3], rn, [(0, uh), (uw, uh), (uw, 0), (0, 0)], cols)

    def add_ellipsoid(self, mat_idx, cx, cy, cz, rx_rad, ry_rad, rz_rad, segs=16, rings=10, rx=0, ry=0, rz=0, ao_bot=0.78, ao_top=1.0):
        p = self._p(mat_idx)
        base = len(p["pos"]) // 3
        for r in range(rings + 1):
            v = r / rings
            phi = v * math.pi
            sp, cp = math.sin(phi), math.cos(phi)
            ao = ao_bot + (ao_top - ao_bot) * (0.5 + 0.5 * cp)
            for s in range(segs + 1):
                u = s / segs
                th = u * math.tau
                ct, st = math.cos(th), math.sin(th)
                lx, ly, lz = rx_rad * sp * ct, ry_rad * cp, rz_rad * sp * st
                nx, ny, nz = sp * ct / max(1e-4, rx_rad), cp / max(1e-4, ry_rad), sp * st / max(1e-4, rz_rad)
                nl = math.sqrt(nx * nx + ny * ny + nz * nz) or 1.0
                nx, ny, nz = self._rot_pt((nx / nl, ny / nl, nz / nl), rx, ry, rz)
                vx, vy, vz = self._rot_pt((lx, ly, lz), rx, ry, rz)
                p["pos"].extend((vx + cx, vy + cy, vz + cz))
                p["norm"].extend((nx, ny, nz))
                p["uv"].extend((u, v))
                p["col"].extend((ao, ao, min(1.0, ao + 0.04)))
        stride = segs + 1
        for r in range(rings):
            for s in range(segs):
                a = base + r * stride + s
                b = a + 1
                c = base + (r + 1) * stride + s
                d = c + 1
                p["idx"].extend([a, b, c, b, d, c])

    def add_torus(self, mat_idx, cx, cy, cz, major_r, minor_r, segs=22, tube_segs=10, rx=0, ry=0, rz=0):
        p = self._p(mat_idx)
        base = len(p["pos"]) // 3
        for i in range(segs + 1):
            u = i / segs
            th = u * math.tau
            ct, st = math.cos(th), math.sin(th)
            for j in range(tube_segs + 1):
                v = j / tube_segs
                ph = v * math.tau
                cp, sp = math.cos(ph), math.sin(ph)
                rr = major_r + minor_r * cp
                lx, ly, lz = rr * ct, rr * st, minor_r * sp
                nx, ny, nz = cp * ct, cp * st, sp
                vx, vy, vz = self._rot_pt((lx, ly, lz), rx, ry, rz)
                rnx, rny, rnz = self._rot_pt((nx, ny, nz), rx, ry, rz)
                ao = 0.84 + 0.16 * max(0.0, rny)
                p["pos"].extend((vx + cx, vy + cy, vz + cz))
                p["norm"].extend((rnx, rny, rnz))
                p["uv"].extend((u * 4.0, v))
                p["col"].extend((ao, ao, ao))
        stride = tube_segs + 1
        for i in range(segs):
            for j in range(tube_segs):
                a = base + i * stride + j
                b = a + 1
                c = base + (i + 1) * stride + j
                d = c + 1
                p["idx"].extend([a, c, b, b, c, d])

    def add_cylinder(self, mat_idx, cx, cy, cz, r_bot, r_top, h, segs=10, rx=0, ry=0, rz=0, ao_bot=0.76, ao_top=1.0):
        hh = h * 0.5
        c_bot = (ao_bot, ao_bot, min(1.0, ao_bot + 0.05))
        c_top = (ao_top, ao_top, ao_top)
        for i in range(segs):
            a0 = (i / segs) * math.tau
            a1 = ((i + 1) / segs) * math.tau
            am = (a0 + a1) * 0.5
            pts = [
                (math.cos(a0) * r_bot, -hh, math.sin(a0) * r_bot),
                (math.cos(a1) * r_bot, -hh, math.sin(a1) * r_bot),
                (math.cos(a1) * r_top, hh, math.sin(a1) * r_top),
                (math.cos(a0) * r_top, hh, math.sin(a0) * r_top),
            ]
            tv = [tuple(self._rot_pt(v, rx, ry, rz)[k] + (cx, cy, cz)[k] for k in range(3)) for v in pts]
            rn = self._rot_pt((math.cos(am), 0.0, math.sin(am)), rx, ry, rz)
            self.add_quad(mat_idx, tv[0], tv[1], tv[2], tv[3], rn, [(i / segs, 1), ((i + 1) / segs, 1), ((i + 1) / segs, 0), (i / segs, 0)], (c_bot, c_bot, c_top, c_top))
        pc = self._rot_pt((0, hh, 0), rx, ry, rz)
        pc = (pc[0] + cx, pc[1] + cy, pc[2] + cz)
        rn_top = self._rot_pt((0, 1, 0), rx, ry, rz)
        for i in range(segs):
            a0 = (i / segs) * math.tau
            a1 = ((i + 1) / segs) * math.tau
            v0 = self._rot_pt((math.cos(a1) * r_top, hh, math.sin(a1) * r_top), rx, ry, rz)
            v1 = self._rot_pt((math.cos(a0) * r_top, hh, math.sin(a0) * r_top), rx, ry, rz)
            self.add_tri(mat_idx, pc, (v0[0] + cx, v0[1] + cy, v0[2] + cz), (v1[0] + cx, v1[1] + cy, v1[2] + cz),
                         rn_top, [(0.5, 0.5), (1, 0), (0, 0)], (c_top, c_top, c_top))

    def add_gable_roof(self, mat_tile, mat_wall, mat_trim, cx, y_base, cz, w, d, ridge_h, overhang=0.72):
        hw = w * 0.5 + overhang
        hd = d * 0.5 + overhang
        slope_len = math.hypot(hd, ridge_h)
        ang = math.atan2(ridge_h, hd)
        for sign in (1, -1):
            self.add_box(mat_tile, cx, y_base + ridge_h * 0.5, cz + sign * (hd * 0.5), hw * 2.0, 0.16, slope_len + 0.16, rx=sign * ang, ao_bot=0.84, ao_top=1.0, uv_scale=0.38)
            self.add_box(mat_trim, cx, y_base - 0.05, cz + sign * (hd + 0.04), hw * 2.04, 0.12, 0.14, ao_bot=0.72, ao_top=0.92)
            # Exposed Japanese timber roof rafters under eaves
            for rx_off in range(-3, 4):
                rx_pos = cx + (rx_off / 3.2) * (hw - 0.25)
                self.add_box(mat_trim, rx_pos, y_base + 0.04, cz + sign * (hd - 0.28), 0.11, 0.14, 0.65, rx=sign * ang)
        self.add_box(mat_trim, cx, y_base + ridge_h + 0.12, cz, hw * 2.04, 0.26, 0.34, ao_bot=0.80, ao_top=1.0)
        wh, dh = w * 0.5, d * 0.5
        for sign in (1, -1):
            gx = cx + sign * wh
            v0, v1, v2 = (gx, y_base, cz - dh), (gx, y_base, cz + dh), (gx, y_base + ridge_h, cz)
            if sign > 0:
                self.add_tri(mat_wall, v0, v1, v2, (1, 0, 0), [(0, 1), (1, 1), (0.5, 0)], ((0.86, 0.86, 0.90), (0.86, 0.86, 0.90), (0.76, 0.78, 0.84)))
            else:
                self.add_tri(mat_wall, v1, v0, v2, (-1, 0, 0), [(0, 1), (1, 1), (0.5, 0)], ((0.86, 0.86, 0.90), (0.86, 0.86, 0.90), (0.76, 0.78, 0.84)))

    def add_leaf_frond(self, mat_idx, cx, cy, cz, size, rx, ry, rz, canopy_center, height_ratio=1.0):
        hs = size * 0.5
        hh = hs * height_ratio
        nx = cx - canopy_center[0]
        ny = (cy - canopy_center[1]) * 1.15 + 0.65
        nz = cz - canopy_center[2]
        nl = math.hypot(nx, ny, nz) or 1.0
        n = (nx / nl, ny / nl, nz / nl)
        t_up = max(0.0, min(1.0, (ny / nl + 0.7) * 0.65))
        c = (0.76 + t_up * 0.24, 0.80 + t_up * 0.20, 0.88 + t_up * 0.12)
        for cross_ry in (ry, ry + math.pi * 0.52):
            pts = [(-hs, -hh, 0), (hs, -hh, 0), (hs, hh, 0), (-hs, hh, 0)]
            tv = [tuple(self._rot_pt(v, rx, cross_ry, rz)[k] + (cx, cy, cz)[k] for k in range(3)) for v in pts]
            self.add_quad(mat_idx, tv[0], tv[1], tv[2], tv[3], n, [(0, 1), (1, 1), (1, 0), (0, 0)], (c, c, c, c))

    def save_glb(self, filepath):
        bin_chunks = bytearray()
        buffer_views = []
        accessors = []
        gltf_prims = []

        def add_view(raw_bytes, target=None):
            while len(bin_chunks) % 4 != 0:
                bin_chunks.append(0)
            offset = len(bin_chunks)
            bin_chunks.extend(raw_bytes)
            bv = {"buffer": 0, "byteOffset": offset, "byteLength": len(raw_bytes)}
            if target is not None:
                bv["target"] = target
            idx = len(buffer_views)
            buffer_views.append(bv)
            return idx

        gltf_images = [{"bufferView": add_view(png), "mimeType": "image/png"} for png in self.images]

        for mat_idx, p in self.primitives.items():
            if not p["idx"]:
                continue
            vcount = len(p["pos"]) // 3
            pos_raw = struct.pack("<%df" % len(p["pos"]), *p["pos"])
            norm_raw = struct.pack("<%df" % len(p["norm"]), *p["norm"])
            uv_raw = struct.pack("<%df" % len(p["uv"]), *p["uv"])
            col_raw = struct.pack("<%df" % len(p["col"]), *p["col"])
            use_u32 = vcount > 65535
            idx_raw = struct.pack("<%d%s" % (len(p["idx"]), "I" if use_u32 else "H"), *p["idx"])
            pmin = [min(p["pos"][k::3]) for k in range(3)]
            pmax = [max(p["pos"][k::3]) for k in range(3)]

            def add_acc(raw, comp_type, acc_type, count, target, mn=None, mx=None):
                bv = add_view(raw, target)
                acc = {"bufferView": bv, "componentType": comp_type, "count": count, "type": acc_type}
                if mn is not None:
                    acc["min"], acc["max"] = mn, mx
                ai = len(accessors)
                accessors.append(acc)
                return ai

            gltf_prims.append({
                "attributes": {
                    "POSITION": add_acc(pos_raw, 5126, "VEC3", vcount, 34962, pmin, pmax),
                    "NORMAL": add_acc(norm_raw, 5126, "VEC3", vcount, 34962),
                    "TEXCOORD_0": add_acc(uv_raw, 5126, "VEC2", vcount, 34962),
                    "COLOR_0": add_acc(col_raw, 5126, "VEC3", vcount, 34962),
                },
                "indices": add_acc(idx_raw, 5125 if use_u32 else 5123, "SCALAR", len(p["idx"]), 34963),
                "material": mat_idx,
            })

        while len(bin_chunks) % 4 != 0:
            bin_chunks.append(0)

        gltf = {
            "asset": {"version": "2.0", "generator": "LailaSalma-AAA-HD-Builder"},
            "scene": 0,
            "scenes": [{"nodes": [0]}],
            "nodes": [{"mesh": 0, "name": os.path.splitext(os.path.basename(filepath))[0]}],
            "meshes": [{"primitives": gltf_prims}],
            "materials": self.materials,
            "bufferViews": buffer_views,
            "accessors": accessors,
            "buffers": [{"byteLength": len(bin_chunks)}],
        }
        if self.textures:
            gltf["samplers"] = [{"magFilter": 9729, "minFilter": 9987, "wrapS": 10497, "wrapT": 10497}]
            gltf["textures"] = self.textures
            gltf["images"] = gltf_images

        json_bytes = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
        while len(json_bytes) % 4 != 0:
            json_bytes += b" "

        total_len = 12 + 8 + len(json_bytes) + 8 + len(bin_chunks)
        with open(filepath, "wb") as f:
            f.write(struct.pack("<III", 0x46546C67, 2, total_len))
            f.write(struct.pack("<II", len(json_bytes), 0x4E4F534A))
            f.write(json_bytes)
            f.write(struct.pack("<II", len(bin_chunks), 0x004E4942))
            f.write(bin_chunks)
        print(f"  Built {os.path.basename(filepath):26s} ({total_len / 1024:6.1f} KB)")


# ---------------------------------------------------------------------------
# 3. Build All 14 AAA Sculpted Models
# ---------------------------------------------------------------------------
def build_tokyo_house_2f():
    b = GLBBuilder()
    m_wall = b.add_material("stucco", (1, 1, 1, 1), make_stucco_tex((234, 224, 208)), normal_strength=1.4, roughness=0.84)
    m_tile = b.add_material("kawara", (1, 1, 1, 1), make_kawara_roof_tex((68, 74, 90)), normal_strength=2.8, roughness=0.42, metallic=0.10)
    m_trim = b.add_material("trim_dark", (0.24, 0.25, 0.30, 1), roughness=0.55)
    m_wood = b.add_material("cedar_wood", (1, 1, 1, 1), make_wood_slats_tex((136, 92, 58), (72, 46, 28)), normal_strength=2.0, roughness=0.70)
    m_shutter = b.add_material("amado", (1, 1, 1, 1), make_wood_slats_tex((156, 114, 72), (86, 58, 34), vertical=False), normal_strength=2.0, roughness=0.70)
    m_glass = b.add_material("window_glass", (1, 1, 1, 1), make_glass_window_tex(), roughness=0.10, metallic=0.28)
    m_block = b.add_material("cinderblock", (1, 1, 1, 1), make_cinderblock_tex(), normal_strength=2.4, roughness=0.90)
    m_ac = b.add_material("ac_unit", (1, 1, 1, 1), make_ac_unit_tex(), normal_strength=1.6, roughness=0.40, metallic=0.28)
    m_mailbox = b.add_material("red_mailbox", (0.76, 0.22, 0.18, 1), roughness=0.35, metallic=0.20)
    m_pot = b.add_material("terracotta", (0.72, 0.42, 0.28, 1), roughness=0.82)
    m_leaf = b.add_material("garden_leaf", (1, 1, 1, 1), make_leaf_cluster_tex([(46, 90, 40), (76, 136, 52), (140, 188, 70)]), roughness=0.70, alpha_mask=True, double_sided=True)

    b.add_box(m_block, 0, 0.22, 0, 7.1, 0.44, 6.1, uv_scale=0.45)
    b.add_box(m_wall, 0, 1.85, 0, 6.9, 2.85, 5.9, ao_bot=0.76, ao_top=0.90, uv_scale=0.35)
    b.add_box(m_wall, 0, 4.55, -0.15, 6.85, 2.6, 5.6, ao_bot=0.82, ao_top=0.86, uv_scale=0.35)
    b.add_box(m_tile, 0, 3.24, 3.35, 7.45, 0.14, 1.05, rx=0.28, uv_scale=0.42)
    b.add_box(m_trim, 0, 3.08, 3.85, 7.5, 0.1, 0.12)
    b.add_gable_roof(m_tile, m_wall, m_trim, 0, 5.82, -0.15, 6.85, 5.6, 2.05, overhang=0.75)

    # 1F entry, framed window & shutter
    b.add_box(m_wood, -1.55, 1.38, 2.98, 1.55, 2.32, 0.14)
    b.add_box(m_glass, -1.55, 1.62, 3.04, 1.18, 1.25, 0.05)
    b.add_box(m_block, -1.55, 0.12, 3.35, 1.85, 0.24, 0.85)
    b.add_box(m_trim, 1.55, 1.72, 2.98, 2.0, 1.46, 0.14)
    b.add_box(m_glass, 1.55, 1.72, 3.02, 1.82, 1.30, 0.08)
    b.add_box(m_shutter, 2.75, 1.72, 3.02, 0.65, 1.34, 0.10)

    # 2F balcony + railings + glass sliding door + AC condenser
    b.add_box(m_block, -1.2, 3.34, 3.38, 3.65, 0.22, 1.42)
    b.add_box(m_wood, -1.2, 4.38, 4.04, 3.68, 0.10, 0.12)
    b.add_box(m_wood, -1.2, 3.86, 4.04, 3.65, 0.08, 0.08)
    for bx in (-2.95, -2.1, -1.2, -0.3, 0.55):
        b.add_box(m_wood, bx, 3.88, 4.04, 0.09, 1.05, 0.09)
    for bz in (3.0, 3.55):
        b.add_box(m_wood, -2.95, 4.38, bz, 0.10, 0.10, 0.65)
        b.add_box(m_wood, 0.55, 4.38, bz, 0.10, 0.10, 0.65)
    b.add_box(m_glass, -1.2, 4.46, 2.68, 2.15, 2.02, 0.12)
    b.add_box(m_trim, 1.95, 4.72, 2.68, 1.62, 1.38, 0.14)
    b.add_box(m_glass, 1.95, 4.72, 2.72, 1.46, 1.22, 0.08)
    b.add_box(m_shutter, 1.0, 4.72, 2.72, 0.55, 1.26, 0.10)
    b.add_box(m_ac, 2.15, 3.74, 2.95, 0.92, 0.66, 0.42)
    b.add_box(m_trim, 1.75, 3.40, 2.92, 0.08, 0.08, 0.45)
    b.add_box(m_trim, 2.55, 3.40, 2.92, 0.08, 0.08, 0.45)

    for sx in (-3.48, 3.48):
        b.add_box(m_glass, sx, 1.8, 0.2, 0.12, 1.25, 1.5)
        b.add_box(m_glass, sx, 4.65, -0.2, 0.12, 1.2, 1.5)
    b.add_cylinder(m_trim, 3.46, 2.95, 2.94, 0.05, 0.05, 5.7, segs=6)

    # Cinderblock garden wall, wooden gate, red mailbox, potted plants & spilling foliage
    b.add_box(m_block, 1.75, 0.72, 4.18, 3.85, 1.44, 0.26, uv_scale=0.55)
    b.add_box(m_trim, 1.75, 1.48, 4.18, 3.92, 0.10, 0.32)
    b.add_box(m_block, -3.1, 0.72, 4.18, 1.2, 1.44, 0.26, uv_scale=0.55)
    b.add_box(m_trim, -3.1, 1.48, 4.18, 1.28, 0.10, 0.32)
    b.add_box(m_wood, -1.35, 0.66, 4.18, 1.9, 1.25, 0.10)
    b.add_box(m_mailbox, -0.05, 1.12, 4.36, 0.34, 0.44, 0.18)
    for px, py, pz, pr in [(0.65, 0.22, 4.55, 0.22), (1.15, 0.20, 4.58, 0.19), (-2.65, 0.24, 4.52, 0.24)]:
        b.add_cylinder(m_pot, px, py, pz, pr * 0.75, pr, 0.40, segs=8)
        b.add_leaf_frond(m_leaf, px, py + 0.45, pz, 0.72, 0.1, px * 1.4, 0.0, (px, py + 0.3, pz))
    for lx, ly, lz, ls in [(2.1, 1.85, 3.7, 1.45), (2.95, 1.65, 3.75, 1.25), (1.35, 1.6, 3.65, 1.15)]:
        b.add_leaf_frond(m_leaf, lx, ly, lz, ls, 0.15, lx, 0.08, (2.2, 1.5, 3.7))
    b.save_glb(os.path.join(OUT_DIR, "tokyo_house_2f.glb"))


def build_tokyo_house_1f():
    b = GLBBuilder()
    m_wall = b.add_material("stucco_1f", (1, 1, 1, 1), make_stucco_tex((238, 230, 214)), normal_strength=1.4, roughness=0.84)
    m_tile = b.add_material("kawara_1f", (1, 1, 1, 1), make_kawara_roof_tex((68, 86, 78)), normal_strength=2.8, roughness=0.42, metallic=0.10)
    m_trim = b.add_material("trim_1f", (0.26, 0.24, 0.22, 1), roughness=0.58)
    m_wood = b.add_material("wood_1f", (1, 1, 1, 1), make_wood_slats_tex((142, 98, 62), (76, 50, 32)), normal_strength=2.0, roughness=0.72)
    m_glass = b.add_material("glass_1f", (1, 1, 1, 1), make_glass_window_tex(), roughness=0.10, metallic=0.28)
    m_block = b.add_material("plinth_1f", (1, 1, 1, 1), make_cinderblock_tex(), normal_strength=2.4, roughness=0.90)
    m_ac = b.add_material("ac_1f", (1, 1, 1, 1), make_ac_unit_tex(), normal_strength=1.6, roughness=0.40, metallic=0.28)
    m_leaf = b.add_material("leaf_1f", (1, 1, 1, 1), make_leaf_cluster_tex([(52, 98, 44), (84, 144, 58), (144, 190, 76)]), roughness=0.70, alpha_mask=True, double_sided=True)

    b.add_box(m_block, 0, 0.22, 0, 6.4, 0.44, 5.4, uv_scale=0.45)
    b.add_box(m_wall, 0, 1.92, 0, 6.2, 3.0, 5.2, ao_bot=0.76, ao_top=0.90, uv_scale=0.35)
    b.add_gable_roof(m_tile, m_wall, m_trim, 0, 3.4, 0, 6.2, 5.2, 1.85, overhang=0.75)
    b.add_box(m_wood, -0.9, 0.28, 2.88, 3.8, 0.22, 0.65)
    b.add_box(m_wood, -1.35, 1.45, 2.63, 1.48, 2.25, 0.14)
    b.add_box(m_glass, -1.35, 1.65, 2.69, 1.1, 1.25, 0.05)
    b.add_box(m_trim, 1.25, 1.82, 2.63, 2.1, 1.44, 0.14)
    b.add_box(m_glass, 1.25, 1.82, 2.67, 1.92, 1.28, 0.08)
    b.add_box(m_ac, 2.75, 0.72, 2.82, 0.85, 0.62, 0.40)
    b.add_box(m_wood, 1.25, 0.35, 3.05, 1.8, 0.45, 0.45)
    for lx in (0.7, 1.25, 1.8):
        b.add_leaf_frond(m_leaf, lx, 0.82, 3.05, 0.85, 0.15, lx * 2.1, 0.0, (1.25, 0.7, 3.05))
    b.save_glb(os.path.join(OUT_DIR, "tokyo_house_1f.glb"))


def build_kyoto_machiya():
    b = GLBBuilder()
    m_koshi = b.add_material("koshi", (1, 1, 1, 1), make_machiya_koshi_tex(), normal_strength=2.2, roughness=0.70)
    m_wall = b.add_material("kyoto_plaster", (1, 1, 1, 1), make_stucco_tex((232, 222, 200)), normal_strength=1.4, roughness=0.85)
    m_tile = b.add_material("kyoto_tile", (1, 1, 1, 1), make_kawara_roof_tex((54, 58, 68)), normal_strength=2.8, roughness=0.40, metallic=0.12)
    m_wood = b.add_material("dark_cedar", (1, 1, 1, 1), make_wood_slats_tex((82, 54, 36), (48, 30, 20)), normal_strength=2.0, roughness=0.72)
    m_glow = b.add_material("shoji_glow", (1.0, 0.92, 0.72, 1), roughness=0.38, emissive=(0.70, 0.50, 0.22))
    m_stone = b.add_material("stone_base", (1, 1, 1, 1), make_cinderblock_tex(), normal_strength=2.4, roughness=0.90)

    b.add_box(m_stone, 0, 0.2, 0, 6.8, 0.4, 5.8, uv_scale=0.45)
    b.add_box(m_koshi, 0, 1.6, 0, 6.6, 2.45, 5.6, ao_bot=0.76, ao_top=0.88, uv_scale=0.45)
    b.add_box(m_wall, 0, 3.85, 0, 6.45, 2.15, 5.45, ao_bot=0.82, ao_top=0.88, uv_scale=0.35)
    b.add_box(m_tile, 0, 2.86, 3.25, 7.25, 0.14, 1.15, rx=0.30, uv_scale=0.4)
    b.add_box(m_wood, 0, 2.68, 3.78, 7.3, 0.12, 0.14)
    b.add_gable_roof(m_tile, m_wall, m_wood, 0, 4.90, 0, 6.45, 5.45, 1.95, overhang=0.78)
    b.add_box(m_wood, 0, 1.32, 2.83, 1.6, 2.15, 0.14)
    for wx in (-1.55, 1.55):
        b.add_box(m_glow, wx, 3.92, 2.75, 1.48, 1.05, 0.10)
        for sx in (-0.45, 0, 0.45):
            b.add_box(m_wood, wx + sx, 3.92, 2.81, 0.08, 1.08, 0.06)
    b.save_glb(os.path.join(OUT_DIR, "kyoto_machiya.glb"))


def build_sakura_school():
    """AAA Sculpted Japanese Anime Elementary School with Clock Tower, Recessed Windows & Portico."""
    b = GLBBuilder()
    m_wall = b.add_material("school_wall", (1, 1, 1, 1), make_stucco_tex((240, 232, 214)), normal_strength=1.4, roughness=0.84)
    m_roof = b.add_material("school_roof", (1, 1, 1, 1), make_kawara_roof_tex((128, 56, 52)), normal_strength=2.6, roughness=0.44, metallic=0.08)
    m_trim = b.add_material("school_trim", (0.82, 0.78, 0.70, 1), roughness=0.75)
    m_glass = b.add_material("school_glass", (1, 1, 1, 1), make_glass_window_tex(), roughness=0.10, metallic=0.28)
    m_wood = b.add_material("school_wood", (1, 1, 1, 1), make_wood_slats_tex((122, 82, 52), (66, 44, 28)), normal_strength=1.8, roughness=0.70)
    m_clock = b.add_material("school_clock", (1, 1, 1, 1), make_clock_tex(), roughness=0.35)
    m_stone = b.add_material("school_stone", (1, 1, 1, 1), make_cinderblock_tex(), normal_strength=2.2, roughness=0.88)

    # Foundation + main 2-story school wing (18m wide x 6.4m tall x 7.6m deep)
    b.add_box(m_stone, 0, 0.25, 0, 18.4, 0.5, 8.0, uv_scale=0.35)
    b.add_box(m_wall, 0, 3.45, 0, 18.0, 6.0, 7.6, ao_bot=0.78, ao_top=0.92, uv_scale=0.25)
    # Horizontal floor belt course & architectural concrete pilasters
    b.add_box(m_trim, 0, 3.35, 3.86, 18.2, 0.24, 0.22)
    b.add_box(m_trim, 0, 6.42, 3.86, 18.3, 0.26, 0.28)
    for px in (-8.8, -5.8, -2.5, 2.5, 5.8, 8.8):
        b.add_box(m_trim, px, 3.45, 3.84, 0.42, 6.0, 0.18)

    # Gabled tiled roof + central clock gable!
    b.add_gable_roof(m_roof, m_wall, m_wood, 0, 6.52, 0, 18.0, 7.6, 2.45, overhang=0.65)
    b.add_box(m_wall, 0, 7.35, 3.55, 4.4, 2.2, 1.4, ao_bot=0.86, ao_top=1.0)
    b.add_gable_roof(m_roof, m_wall, m_wood, 0, 8.42, 3.55, 4.4, 1.4, 1.15, overhang=0.35)
    b.add_cylinder(m_clock, 0, 7.65, 4.28, 0.68, 0.68, 0.10, segs=16, rx=math.pi / 2)

    # 12 tall recessed classroom windows with frames
    for wx in (-7.3, -4.15, 4.15, 7.3):
        for wy in (2.0, 4.8):
            b.add_box(m_trim, wx, wy, 3.82, 2.45, 1.65, 0.16)
            b.add_box(m_glass, wx, wy, 3.86, 2.24, 1.45, 0.08)
    # Central 2F hallway window
    b.add_box(m_trim, 0, 4.8, 3.82, 3.2, 1.65, 0.16)
    b.add_box(m_glass, 0, 4.8, 3.86, 2.95, 1.45, 0.08)

    # Welcoming front entrance portico with steps, pillars & sliding glass doors
    b.add_box(m_stone, 0, 0.18, 4.75, 4.8, 0.36, 2.0)
    b.add_box(m_trim, 0, 3.15, 4.85, 4.9, 0.28, 2.2)
    for px in (-2.1, 2.1):
        b.add_box(m_trim, px, 1.65, 5.72, 0.34, 2.8, 0.34)
    b.add_box(m_wood, 0, 1.55, 3.84, 3.1, 2.55, 0.16)
    b.add_box(m_glass, 0, 1.62, 3.90, 2.6, 2.15, 0.08)

    b.save_glb(os.path.join(OUT_DIR, "sakura_school.glb"))


def build_ichiban_ramen():
    """AAA Sculpted Japanese Ramen-ya / Izakaya Storefront with Timber Beams, Chimney & Tiled Eaves."""
    b = GLBBuilder()
    m_wall = b.add_material("ramen_plaster", (1, 1, 1, 1), make_stucco_tex((240, 228, 204)), normal_strength=1.4, roughness=0.84)
    m_wood = b.add_material("ramen_wood", (1, 1, 1, 1), make_wood_slats_tex((96, 62, 38), (52, 34, 20)), normal_strength=2.2, roughness=0.72)
    m_roof = b.add_material("ramen_tile", (1, 1, 1, 1), make_kawara_roof_tex((54, 60, 72)), normal_strength=2.8, roughness=0.40, metallic=0.12)
    m_glow = b.add_material("ramen_glow", (1.0, 0.88, 0.62, 1), roughness=0.35, emissive=(0.82, 0.56, 0.22))
    m_metal = b.add_material("vent_metal", (0.68, 0.70, 0.74, 1), roughness=0.32, metallic=0.72)
    m_stone = b.add_material("ramen_stone", (1, 1, 1, 1), make_cinderblock_tex(), normal_strength=2.2, roughness=0.88)

    # Note: Ichiban Ramen in Tokyo faces -X (toward Main Street)!
    b.add_box(m_stone, 0, 0.22, 0, 6.8, 0.44, 7.4, uv_scale=0.45)
    b.add_box(m_wood, 0, 1.35, 0, 6.6, 1.85, 7.2, uv_scale=0.42)
    b.add_box(m_wall, 0, 3.25, 0, 6.5, 2.1, 7.1, ao_bot=0.80, ao_top=0.92, uv_scale=0.35)
    b.add_gable_roof(m_roof, m_wall, m_wood, 0, 4.30, 0, 6.5, 7.1, 1.95, overhang=0.72)

    # Front overhanging tiled awning (-X face) with timber posts
    b.add_box(m_roof, -3.95, 2.82, 0, 1.65, 0.14, 6.8, rz=0.28, uv_scale=0.42)
    for pz in (-3.1, 3.1):
        b.add_box(m_wood, -4.55, 1.35, pz, 0.18, 2.65, 0.18)
    # Warm glowing timber-mullioned windows & sliding front entrance (-X)
    b.add_box(m_glow, -3.32, 1.55, 0, 0.14, 2.15, 5.2)
    for wz in (-2.0, -1.0, 0.0, 1.0, 2.0):
        b.add_box(m_wood, -3.38, 1.55, wz, 0.08, 2.2, 0.10)
    b.add_box(m_wood, -3.38, 1.6, 0, 0.08, 0.10, 5.3)
    # Authentic metallic kitchen exhaust flue rising on back corner
    b.add_cylinder(m_metal, 2.6, 4.9, -2.8, 0.22, 0.22, 3.2, segs=10)
    b.add_box(m_metal, 2.6, 6.5, -2.8, 0.56, 0.32, 0.56)

    b.save_glb(os.path.join(OUT_DIR, "ichiban_ramen.glb"))


def build_anime_tree(filename, leaf_palette, bark_color=(88, 62, 44), seed_offset=0):
    b = GLBBuilder()
    m_bark = b.add_material("bark", (1, 1, 1, 1), make_bark_tex(bark_color), normal_strength=2.2, roughness=0.88)
    m_leaf = b.add_material("foliage", (1, 1, 1, 1), make_leaf_cluster_tex(leaf_palette), roughness=0.66, alpha_mask=True, double_sided=True)

    b.add_cylinder(m_bark, 0, 0.95, 0, 0.36, 0.26, 1.95, segs=9, rx=0.04, rz=-0.03)
    b.add_cylinder(m_bark, -0.06, 2.45, 0.06, 0.26, 0.16, 1.35, segs=8, rx=-0.05, rz=0.06)
    for br in [
        (-0.72, 3.15, 0.35, 0.15, 0.07, 1.45, 0.25, 0.58),
        (0.75, 3.25, -0.28, 0.14, 0.07, 1.45, -0.22, -0.56),
        (0.18, 3.35, 0.65, 0.13, 0.06, 1.25, 0.52, -0.15),
        (-0.22, 3.45, -0.62, 0.13, 0.06, 1.25, -0.48, 0.22),
    ]:
        b.add_cylinder(m_bark, br[0], br[1], br[2], br[3], br[4], br[5], segs=7, rx=br[6], rz=br[7])

    canopy_center = (0.0, 4.15, 0.0)
    lobes = [
        (0.0, 4.65, 0.0, 1.58, 16),
        (-1.18, 3.85, 0.55, 1.28, 12),
        (1.20, 3.95, -0.45, 1.30, 12),
        (0.32, 4.15, 1.08, 1.18, 10),
        (-0.42, 4.25, -0.98, 1.18, 10),
    ]
    idx = 0
    for lx, ly, lz, lrad, count in lobes:
        for _ in range(count):
            s = seed_offset * 300 + idx
            idx += 1
            theta = hash01(s * 3.7 + 0.5) * math.tau
            phi = (hash01(s * 5.3 + 1.1) - 0.42) * 1.45
            rr = (0.35 + hash01(s * 7.1) * 0.65) * lrad
            b.add_leaf_frond(
                m_leaf,
                lx + math.cos(theta) * math.cos(phi) * rr,
                ly + math.sin(phi) * rr * 0.8,
                lz + math.sin(theta) * math.cos(phi) * rr,
                1.28 + hash01(s * 9.3) * 0.72,
                (hash01(s * 2.1) - 0.5) * 0.55,
                hash01(s * 4.3) * math.tau,
                (hash01(s * 6.7) - 0.5) * 0.45,
                canopy_center,
            )
    b.save_glb(os.path.join(OUT_DIR, filename))


def build_anime_willow():
    """Sculpted Weeping Willow with curved trunk & cascading alpha-cutout hanging vine curtains!"""
    b = GLBBuilder()
    m_bark = b.add_material("willow_bark", (1, 1, 1, 1), make_bark_tex((82, 66, 48)), normal_strength=2.2, roughness=0.88)
    m_crown = b.add_material("willow_crown", (1, 1, 1, 1), make_leaf_cluster_tex([(58, 106, 52), (96, 152, 66), (156, 202, 86)]), roughness=0.68, alpha_mask=True, double_sided=True)
    m_drape = b.add_material("willow_vines", (1, 1, 1, 1), make_leaf_cluster_tex([(64, 114, 56), (108, 162, 72), (164, 206, 92)], vertical_drape=True), roughness=0.68, alpha_mask=True, double_sided=True)

    b.add_cylinder(m_bark, 0, 1.1, 0, 0.34, 0.24, 2.2, segs=9, rx=0.08, rz=0.08)
    b.add_cylinder(m_bark, -0.14, 2.75, 0.14, 0.24, 0.14, 1.4, segs=8, rx=0.06, rz=-0.06)
    center = (0, 4.0, 0)
    # Soft upper crown
    for i in range(18):
        ang = hash01(i * 4.7) * math.tau
        rad = hash01(i * 6.1) * 1.35
        b.add_leaf_frond(m_crown, math.cos(ang) * rad, 3.85 + hash01(i * 2.3) * 0.9, math.sin(ang) * rad, 1.45, 0.2, ang, 0, center)
    # Cascading weeping willow tassels fanning gracefully around the crown!
    for i in range(16):
        ang = (i / 16.0) * math.tau + 0.15
        rad = 1.05 + (i % 3) * 0.34
        hy = 2.65 + (i % 3) * 0.28
        sc = 1.15 + hash01(i * 5.7) * 0.45
        b.add_leaf_frond(m_drape, math.cos(ang) * rad, hy, math.sin(ang) * rad, sc, 0.18, ang, 0.0, center, height_ratio=1.55)
    b.save_glb(os.path.join(OUT_DIR, "anime_tree_willow.glb"))


def build_anime_cedar():
    """Sculpted Tall Japanese Sugi Cedar with layered alpha-cutout evergreen needle boughs!"""
    b = GLBBuilder()
    m_bark = b.add_material("cedar_bark", (1, 1, 1, 1), make_bark_tex((78, 50, 36)), normal_strength=2.2, roughness=0.88)
    m_leaf = b.add_material("cedar_needles", (1, 1, 1, 1), make_leaf_cluster_tex([(24, 62, 42), (42, 92, 58), (74, 128, 72)]), roughness=0.72, alpha_mask=True, double_sided=True)

    b.add_cylinder(m_bark, 0, 3.5, 0, 0.34, 0.12, 7.0, segs=9)
    center = (0, 5.2, 0)
    for tier in range(5):
        ty = 2.4 + tier * 1.15
        tr = 1.65 - tier * 0.28
        count = 9 - tier
        for k in range(count):
            ang = (k / count) * math.tau + tier * 0.65
            b.add_leaf_frond(m_leaf, math.cos(ang) * tr * 0.65, ty, math.sin(ang) * tr * 0.65, 1.45 - tier * 0.14, 0.25, ang, 0.0, center, height_ratio=0.78)
    b.add_leaf_frond(m_leaf, 0, 7.55, 0, 1.15, 0, 0.4, 0, center)
    b.save_glb(os.path.join(OUT_DIR, "anime_tree_cedar.glb"))


def build_anime_shrub():
    b = GLBBuilder()
    m_leaf = b.add_material("shrub_leaf", (1, 1, 1, 1), make_leaf_cluster_tex([(38, 84, 38), (68, 132, 50), (138, 192, 68)]), roughness=0.68, alpha_mask=True, double_sided=True)
    center = (0, 0.55, 0)
    for i in range(20):
        ang = hash01(i * 4.3 + 1.1) * math.tau
        rad = hash01(i * 6.7 + 0.4) * 0.58
        b.add_leaf_frond(m_leaf, math.cos(ang) * rad, 0.36 + hash01(i * 2.9) * 0.48, math.sin(ang) * rad,
                         0.80 + hash01(i * 8.1) * 0.38, (hash01(i * 3.1) - 0.5) * 0.4, hash01(i * 5.7) * math.tau, 0.0, center)
    b.save_glb(os.path.join(OUT_DIR, "anime_shrub.glb"))


def build_utility_pole():
    b = GLBBuilder()
    m_conc = b.add_material("pole_concrete", (1, 1, 1, 1), make_cinderblock_tex(), normal_strength=2.0, roughness=0.88)
    m_metal = b.add_material("pole_metal", (0.28, 0.30, 0.34, 1), roughness=0.42, metallic=0.58)
    m_insul = b.add_material("ceramic", (0.92, 0.92, 0.90, 1), roughness=0.20, metallic=0.05)
    m_lamp = b.add_material("lamp_glow", (1.0, 0.94, 0.76, 1), roughness=0.2, emissive=(1.0, 0.84, 0.48))
    m_sign_r = b.add_material("sign_red", (0.78, 0.22, 0.22, 1), roughness=0.4)
    m_sign_b = b.add_material("sign_blue", (0.16, 0.34, 0.62, 1), roughness=0.4)

    b.add_cylinder(m_conc, 0, 4.1, 0, 0.20, 0.12, 8.2, segs=10)
    for y_arm, w_arm in [(7.55, 1.85), (6.75, 1.55)]:
        b.add_box(m_metal, 0, y_arm, 0, w_arm, 0.09, 0.09)
        for ix in (-w_arm * 0.42, 0.0, w_arm * 0.42):
            b.add_cylinder(m_insul, ix, y_arm + 0.11, 0, 0.055, 0.045, 0.14, segs=7)
    b.add_cylinder(m_metal, -0.34, 5.75, 0.0, 0.24, 0.24, 0.85, segs=10)
    b.add_box(m_metal, 0.58, 5.15, 0, 1.25, 0.06, 0.06, rz=0.22)
    b.add_box(m_metal, 1.15, 5.32, 0, 0.38, 0.09, 0.22)
    b.add_box(m_lamp, 1.15, 5.25, 0, 0.30, 0.05, 0.16)
    b.add_cylinder(m_sign_r, 0.32, 3.15, 0.04, 0.28, 0.28, 0.04, segs=14, rx=math.pi / 2)
    b.add_cylinder(m_sign_b, 0.32, 3.15, 0.05, 0.21, 0.21, 0.04, segs=14, rx=math.pi / 2)
    b.add_box(m_sign_r, 0.32, 3.15, 0.075, 0.40, 0.06, 0.02, rz=0.78)
    b.save_glb(os.path.join(OUT_DIR, "utility_pole.glb"))


def build_anime_vending():
    b = GLBBuilder()
    m_body = b.add_material("vm_shell", (0.92, 0.93, 0.95, 1), roughness=0.30, metallic=0.22)
    m_front = b.add_material("vm_front", (1, 1, 1, 1), make_vending_tex(), roughness=0.22, emissive=(0.24, 0.22, 0.18))
    m_bin = b.add_material("recycle_bin", (0.76, 0.78, 0.80, 1), roughness=0.55, metallic=0.2)
    m_hole = b.add_material("bin_hole", (0.16, 0.18, 0.20, 1), roughness=0.8)

    b.add_box(m_body, 0, 1.0, 0, 1.24, 2.0, 0.82)
    b.add_box(m_front, 0, 1.02, 0.42, 1.18, 1.92, 0.03)
    b.add_box(m_bin, -0.88, 0.44, 0.02, 0.46, 0.88, 0.48)
    b.add_cylinder(m_hole, -0.88, 0.68, 0.27, 0.09, 0.09, 0.04, segs=10, rx=math.pi / 2)
    b.save_glb(os.path.join(OUT_DIR, "anime_vending.glb"))


def build_anime_bike():
    """Detailed Japanese Mamachari Neighborhood Cruiser Bicycle with hollow tires, chrome rims, spokes, fenders, open basket & carrier rack!"""
    b = GLBBuilder()
    m_tire = b.add_material("bike_tire", (0.14, 0.14, 0.16, 1), roughness=0.84)
    m_frame = b.add_material("bike_frame", (0.94, 0.94, 0.94, 1), roughness=0.32, metallic=0.45)  # Tinted per-bike in JS!
    m_chrome = b.add_material("bike_chrome", (0.86, 0.88, 0.91, 1), roughness=0.16, metallic=0.88)
    m_seat = b.add_material("bike_leather", (0.38, 0.22, 0.14, 1), roughness=0.68)
    m_basket = b.add_material("bike_basket", (0.64, 0.44, 0.26, 1), roughness=0.76)
    m_grip = b.add_material("bike_grip", (0.20, 0.16, 0.15, 1), roughness=0.82)
    m_lamp = b.add_material("bike_lamp_glass", (1.0, 0.96, 0.80, 1), roughness=0.15, emissive=(0.85, 0.78, 0.52))
    m_refl = b.add_material("bike_reflector", (0.90, 0.16, 0.16, 1), roughness=0.22, emissive=(0.35, 0.05, 0.05))

    # Front (+Z = +0.58) & Rear (-Z = -0.58) wheels: hollow rubber tire + alloy rim + hub + 12 radial spokes!
    for wz in (-0.58, 0.58):
        b.add_torus(m_tire, 0, 0.35, wz, 0.315, 0.036, segs=24, tube_segs=10, ry=math.pi / 2)
        b.add_torus(m_chrome, 0, 0.35, wz, 0.278, 0.015, segs=24, tube_segs=8, ry=math.pi / 2)
        b.add_cylinder(m_chrome, 0, 0.35, wz, 0.032, 0.032, 0.09, segs=10, rz=math.pi / 2)
        # 6 diametric chrome spokes (= 12 radial spokes!)
        for sp in range(6):
            ang = (sp / 6.0) * math.pi
            b.add_cylinder(m_chrome, 0, 0.35, wz, 0.006, 0.006, 0.54, segs=4, rx=ang)
        # Curved painted mudguard fender hugging the upper half of each wheel
        for fi in range(7):
            fang = -0.85 + (fi / 6.0) * 1.7
            fy = 0.35 + math.cos(fang) * 0.365
            fz = wz + math.sin(fang) * 0.365
            b.add_box(m_frame, 0, fy, fz, 0.082, 0.018, 0.115, rx=fang)

    # Authentic Japanese step-through Mamachari frame!
    # Head tube + front fork blades
    b.add_cylinder(m_frame, 0, 0.74, 0.44, 0.026, 0.026, 0.26, segs=8, rx=-0.30)
    for fx in (-0.048, 0.048):
        b.add_cylinder(m_frame, fx, 0.52, 0.52, 0.016, 0.020, 0.38, segs=6, rx=-0.30)
    # Seat tube & curved double step-through downtubes
    b.add_cylinder(m_frame, 0, 0.62, -0.15, 0.024, 0.024, 0.54, segs=8, rx=-0.26)
    b.add_cylinder(m_frame, 0, 0.52, 0.16, 0.022, 0.022, 0.62, segs=8, rx=1.18)
    b.add_cylinder(m_frame, 0, 0.44, 0.14, 0.022, 0.022, 0.62, segs=8, rx=1.08)
    # Rear stays + chain guard + crank pedals + kickstand
    for rx_off in (-0.046, 0.046):
        b.add_cylinder(m_frame, rx_off, 0.36, -0.35, 0.013, 0.013, 0.48, segs=6, rx=1.55)
        b.add_cylinder(m_frame, rx_off, 0.57, -0.37, 0.013, 0.013, 0.52, segs=6, rx=0.72)
    b.add_box(m_frame, 0.045, 0.36, -0.28, 0.032, 0.11, 0.46)  # Chain guard
    b.add_cylinder(m_chrome, 0, 0.36, -0.06, 0.085, 0.085, 0.02, segs=12, rz=math.pi / 2)  # Chainring
    b.add_cylinder(m_chrome, 0.08, 0.29, -0.06, 0.012, 0.012, 0.14, segs=6)
    b.add_box(m_grip, 0.13, 0.22, -0.06, 0.08, 0.025, 0.06)
    b.add_cylinder(m_chrome, -0.08, 0.43, -0.06, 0.012, 0.012, 0.14, segs=6)
    b.add_box(m_grip, -0.13, 0.50, -0.06, 0.08, 0.025, 0.06)
    b.add_cylinder(m_chrome, -0.08, 0.18, -0.52, 0.010, 0.010, 0.36, segs=5, rz=0.35)  # Kickstand

    # Rear steel luggage carrier rack + red tail reflector
    b.add_box(m_chrome, 0, 0.74, -0.56, 0.18, 0.022, 0.40)
    for rx_off in (-0.075, 0.075):
        b.add_cylinder(m_chrome, rx_off, 0.54, -0.58, 0.010, 0.010, 0.40, segs=5)
    b.add_box(m_refl, 0, 0.72, -0.77, 0.055, 0.045, 0.022)

    # Contoured spring leather saddle on chrome seatpost
    b.add_cylinder(m_chrome, 0, 0.89, -0.22, 0.016, 0.016, 0.14, segs=8)
    b.add_ellipsoid(m_seat, 0, 0.96, -0.22, 0.095, 0.042, 0.145, segs=12, rings=8)
    b.add_ellipsoid(m_seat, 0, 0.96, -0.11, 0.048, 0.034, 0.095, segs=10, rings=6)

    # Swept chrome cruiser handlebars, grips, bell & retro round dynamo headlight!
    b.add_cylinder(m_chrome, 0, 0.94, 0.38, 0.016, 0.016, 0.22, segs=8, rx=-0.26)
    b.add_cylinder(m_chrome, 0, 1.03, 0.35, 0.015, 0.015, 0.46, segs=8, rz=math.pi / 2)
    for side in (-1, 1):
        b.add_cylinder(m_chrome, side * 0.25, 1.03, 0.29, 0.014, 0.014, 0.15, segs=6, rx=math.pi / 2, ry=side * -0.45)
        b.add_cylinder(m_grip, side * 0.27, 1.03, 0.23, 0.020, 0.020, 0.11, segs=8, rx=math.pi / 2, ry=side * -0.45)
    b.add_ellipsoid(m_chrome, 0.13, 1.065, 0.35, 0.026, 0.022, 0.026, segs=8, rings=6)  # Chrome bell
    b.add_cylinder(m_chrome, 0, 0.72, 0.59, 0.042, 0.034, 0.09, segs=10, rx=math.pi / 2)  # Headlight housing
    b.add_ellipsoid(m_lamp, 0, 0.72, 0.635, 0.036, 0.036, 0.016, segs=10, rings=6)

    # Open woven rattan/wire front shopping basket (hollow rim + thin slat walls — NOT a solid block!)
    bx, by, bz = 0, 0.85, 0.56
    bw, bh, bd = 0.34, 0.23, 0.26
    b.add_box(m_basket, bx, by - bh * 0.5, bz, bw, 0.022, bd)  # Bottom tray
    # Top rim frame
    b.add_box(m_basket, bx, by + bh * 0.5, bz + bd * 0.5, bw + 0.02, 0.022, 0.022)
    b.add_box(m_basket, bx, by + bh * 0.5, bz - bd * 0.5, bw + 0.02, 0.022, 0.022)
    b.add_box(m_basket, bx - bw * 0.5, by + bh * 0.5, bz, 0.022, 0.022, bd)
    b.add_box(m_basket, bx + bw * 0.5, by + bh * 0.5, bz, 0.022, 0.022, bd)
    # Vertical corner posts & horizontal woven slats
    for cx_s in (-bw * 0.5, bw * 0.5):
        for cz_s in (-bd * 0.5, bd * 0.5):
            b.add_box(m_basket, bx + cx_s, by, bz + cz_s, 0.020, bh, 0.020)
    for sy in (-0.055, 0.015, 0.08):
        b.add_box(m_basket, bx, by + sy, bz + bd * 0.5, bw, 0.018, 0.012)
        b.add_box(m_basket, bx, by + sy, bz - bd * 0.5, bw, 0.018, 0.012)
        b.add_box(m_basket, bx - bw * 0.5, by + sy, bz, 0.012, 0.018, bd)
        b.add_box(m_basket, bx + bw * 0.5, by + sy, bz, 0.012, 0.018, bd)
    b.add_cylinder(m_chrome, 0, 0.60, 0.57, 0.010, 0.010, 0.34, segs=5)  # Basket support strut

    b.save_glb(os.path.join(OUT_DIR, "anime_bike.glb"))


def make_shinkansen_side_tex(w=512, h=128):
    """Crisp Tokaido N700S Shinkansen porcelain-white livery with double cobalt-blue stripes, recessed panoramic windows & doors."""
    img = Image.new("RGBA", (w, h), (248, 250, 252, 255))
    draw = ImageDraw.Draw(img)
    # Subtle metallic roof/lower shadow gradient
    draw.rectangle([0, 0, w, 12], fill=(228, 234, 240, 255))
    draw.rectangle([0, h - 14, w, h], fill=(214, 220, 228, 255))
    # Iconic Tokaido N700S double cobalt-blue stripes!
    draw.rectangle([0, 76, w, 92], fill=(20, 70, 158, 255))
    draw.rectangle([0, 96, w, 102], fill=(32, 104, 206, 255))
    # Sleek panoramic passenger windows with dark tinted glass + warm golden interior cabin glow + diagonal sky reflection!
    for wx in range(28, w - 52, 46):
        draw.rounded_rectangle([wx, 28, wx + 32, 66], radius=6, fill=(28, 42, 62, 255), outline=(140, 150, 165, 255), width=2)
        # Warm cabin interior glow in lower pane
        draw.rounded_rectangle([wx + 3, 44, wx + 29, 63], radius=3, fill=(218, 194, 146, 165))
        # Crisp diagonal sky sheen
        draw.polygon([(wx + 5, 30), (wx + 16, 30), (wx + 10, 62), (wx + 3, 62)], fill=(195, 228, 252, 115))
    # Passenger vestibule sliding door on right end
    draw.rectangle([w - 36, 16, w - 8, h - 8], outline=(168, 174, 184, 255), width=2)
    draw.rounded_rectangle([w - 28, 26, w - 16, 62], radius=4, fill=(36, 52, 72, 255))
    return img


def build_anime_shinkansen():
    """Sculpted 3-Car N700S Japanese Shinkansen Bullet Train with aerodynamic duck-bill noses, cockpit glass, LEDs, bogies & twin pantographs!"""
    b = GLBBuilder()
    m_white = b.add_material("shink_body", (0.97, 0.98, 0.99, 1), roughness=0.22, metallic=0.14)
    m_side = b.add_material("shink_side", (1, 1, 1, 1), make_shinkansen_side_tex(), roughness=0.24, metallic=0.12)
    m_blue = b.add_material("shink_blue", (0.08, 0.27, 0.62, 1), roughness=0.28, metallic=0.20)
    m_glass = b.add_material("shink_cockpit_glass", (0.12, 0.22, 0.34, 1), roughness=0.08, metallic=0.55)
    m_dark = b.add_material("shink_bogie", (0.18, 0.20, 0.24, 1), roughness=0.62, metallic=0.35)
    m_metal = b.add_material("shink_metal", (0.72, 0.75, 0.79, 1), roughness=0.28, metallic=0.80)
    m_head = b.add_material("shink_headlight", (1.0, 0.98, 0.88, 1), roughness=0.15, emissive=(1.0, 0.96, 0.78))
    m_tail = b.add_material("shink_taillight", (0.95, 0.16, 0.18, 1), roughness=0.15, emissive=(0.90, 0.14, 0.16))

    # Oriented along X axis, wheels resting cleanly at y = 0!
    # 3 cars: Center Coach (-4.6..+4.6), West Lead Car (-10.8..-4.9), East Lead Car (+4.9..+10.8) + Aerodynamic Noses!
    car_specs = [(-7.85, 5.7), (0.0, 9.2), (7.85, 5.7)]
    for cx, clen in car_specs:
        # Clean porcelain-white cabin core
        b.add_box(m_white, cx, 1.38, 0.0, clen, 1.48, 2.04)
        # Pixel-perfect UV-mapped Tokaido N700S side livery panels (V=0..1 full height, U tiled cleanly!)
        hx, y0, y1, zp = clen * 0.5, 0.64, 2.12, 1.032
        u_rep = max(1.0, round(clen / 5.2))
        c_t, c_b = (1.0, 1.0, 1.0), (0.86, 0.86, 0.90)
        b.add_quad(m_side, (cx - hx, y0, zp), (cx + hx, y0, zp), (cx + hx, y1, zp), (cx - hx, y1, zp),
                   (0, 0, 1), [(0, 1), (u_rep, 1), (u_rep, 0), (0, 0)], (c_b, c_b, c_t, c_t))
        b.add_quad(m_side, (cx + hx, y0, -zp), (cx - hx, y0, -zp), (cx - hx, y1, -zp), (cx + hx, y1, -zp),
                   (0, 0, -1), [(0, 1), (u_rep, 1), (u_rep, 0), (0, 0)], (c_b, c_b, c_t, c_t))
        # Sleek curved aerodynamic upper roof crown (chamfered 3-piece arch)
        b.add_box(m_white, cx, 2.18, 0.0, clen, 0.22, 1.82)
        b.add_box(m_white, cx, 2.30, 0.0, clen, 0.14, 1.38)
        # Lower aerodynamic underbody skirting (hides bogies like a real N700S!)
        b.add_box(m_white, cx, 0.58, 0.0, clen - 0.1, 0.34, 1.98)
        b.add_box(m_dark, cx, 0.32, 0.0, clen - 0.4, 0.24, 1.56)
        # Bogie wheelsets visible beneath the skirt
        for bx in (cx - clen * 0.32, cx + clen * 0.32):
            for wz in (-0.68, 0.68):
                b.add_cylinder(m_dark, bx - 0.45, 0.24, wz, 0.24, 0.24, 0.12, segs=12, rx=math.pi / 2)
                b.add_cylinder(m_dark, bx + 0.45, 0.24, wz, 0.24, 0.24, 0.12, segs=12, rx=math.pi / 2)
        # Sleek rooftop HVAC fairing pod
        b.add_box(m_metal, cx, 2.42, 0.0, clen * 0.42, 0.14, 0.88)

    # Rubber inter-car articulation gangways (flush dark couplers between cars!)
    for gx in (-4.8, 4.8):
        b.add_box(m_dark, gx, 1.32, 0.0, 0.38, 1.62, 1.86)
        b.add_box(m_white, gx, 2.18, 0.0, 0.36, 0.18, 1.60)

    # Authentic multi-stage sculpted N700S Duck-Bill Aerodynamic Noses on BOTH ends (-X and +X)!
    for side in (-1, 1):
        # Tapered smooth aero-nose profile (5 lofted cross-sections from full cabin down to sleek duck-bill tip!)
        nose_steps = [
            (10.70, 1.34, 1.05, 1.62, 2.02),
            (11.65, 1.18, 1.05, 1.32, 1.84),
            (12.60, 0.98, 1.05, 0.96, 1.58),
            (13.45, 0.78, 0.95, 0.64, 1.24),
            (14.15, 0.64, 0.75, 0.42, 0.86),
        ]
        for nx, ny, nl, nh, nw in nose_steps:
            b.add_ellipsoid(m_white, side * nx, ny, 0.0, nl * 0.68, nh * 0.56, nw * 0.52, segs=16, rings=10)
        # Blue aero cheek stripe sweeping cleanly along the tapered nose!
        b.add_box(m_blue, side * 11.75, 0.92, 0.0, 2.4, 0.20, 1.72, rz=side * -0.14)
        b.add_box(m_blue, side * 13.15, 0.72, 0.0, 1.3, 0.14, 1.22, rz=side * -0.16)
        # Wrap-around flush dark-tinted bullet-train cockpit canopy windshield!
        b.add_ellipsoid(m_glass, side * 11.45, 1.68, 0.0, 0.98, 0.36, 0.82, segs=14, rings=8, rz=side * -0.28)
        # Twin glowing LED headlights (east lead) or ruby-red tail markers (west tail)
        lamp_mat = m_head if side > 0 else m_tail
        for lz in (-0.48, 0.48):
            b.add_ellipsoid(lamp_mat, side * 13.55, 0.84, lz, 0.22, 0.10, 0.14, segs=10, rings=6)
        # Sleek nose coupler seam cover
        b.add_ellipsoid(m_white, side * 14.48, 0.58, 0.0, 0.36, 0.20, 0.38, segs=12, rings=8)

    # Twin Detailed Roof Diamond Pantographs (above car joints!)
    for px in (-4.1, 4.1):
        b.add_box(m_dark, px, 2.42, 0.0, 1.15, 0.12, 0.95)
        b.add_cylinder(m_metal, px - 0.18, 2.74, 0.0, 0.028, 0.028, 0.72, segs=6, rz=-0.52)
        b.add_cylinder(m_metal, px + 0.18, 2.74, 0.0, 0.028, 0.028, 0.72, segs=6, rz=0.52)
        b.add_cylinder(m_metal, px - 0.18, 3.16, 0.0, 0.024, 0.024, 0.68, segs=6, rz=0.52)
        b.add_cylinder(m_metal, px + 0.18, 3.16, 0.0, 0.024, 0.024, 0.68, segs=6, rz=-0.52)
        # Carbon collector shoe bar at top of pantograph
        b.add_box(m_metal, px, 3.44, 0.0, 0.22, 0.05, 1.15)
        b.add_box(m_dark, px, 3.48, 0.0, 0.12, 0.04, 1.12)

    b.save_glb(os.path.join(OUT_DIR, "anime_shinkansen.glb"))


def make_feather_tex(base=(244, 238, 224), accent=(212, 200, 180), size=128):
    img = Image.new("RGBA", (size, size), base + (255,))
    draw = ImageDraw.Draw(img)
    for row in range(8):
        ry = row * 16
        for col in range(8):
            cx = col * 16 + (row % 2) * 8
            draw.arc([cx - 10, ry - 4, cx + 10, ry + 14], start=10, end=170, fill=accent + (185,), width=2)
    return img


def build_anime_duck(filename, variant="mallard"):
    """Sculpted Studio Ghibli Pond Duck with layered feathered wings, S-neck, contoured bill & glossy eyes!"""
    b = GLBBuilder()
    if variant == "mallard":
        m_body = b.add_material("duck_body", (1, 1, 1, 1), make_feather_tex((196, 188, 174), (138, 130, 118)), normal_strength=1.5, roughness=0.72)
        m_wing = b.add_material("duck_wing", (1, 1, 1, 1), make_feather_tex((128, 108, 92), (76, 62, 50)), normal_strength=1.8, roughness=0.68)
        m_speculum = b.add_material("duck_speculum", (0.14, 0.32, 0.62, 1), roughness=0.32, metallic=0.25)
        m_breast = b.add_material("duck_breast", (0.48, 0.23, 0.16, 1), roughness=0.74)
        m_neck_ring = b.add_material("duck_ring", (0.97, 0.96, 0.94, 1), roughness=0.65)
        m_head = b.add_material("duck_head_gloss", (0.09, 0.36, 0.24, 1), roughness=0.35, metallic=0.20)
        m_bill = b.add_material("duck_bill", (0.94, 0.72, 0.16, 1), roughness=0.38)
        m_tail = b.add_material("duck_tail", (0.18, 0.18, 0.20, 1), roughness=0.68)
    else:
        m_body = b.add_material("duck_body", (1, 1, 1, 1), make_feather_tex((252, 249, 240), (228, 220, 204)), normal_strength=1.2, roughness=0.70)
        m_wing = b.add_material("duck_wing", (1, 1, 1, 1), make_feather_tex((246, 241, 230), (214, 206, 192)), normal_strength=1.5, roughness=0.68)
        m_speculum = m_wing
        m_breast = m_body
        m_neck_ring = m_body
        m_head = m_body
        m_bill = b.add_material("duck_bill", (0.96, 0.56, 0.14, 1), roughness=0.36)
        m_tail = m_body

    m_eye = b.add_material("duck_eye_glass", (0.07, 0.05, 0.05, 1), roughness=0.10, metallic=0.15)
    m_shine = b.add_material("duck_shine", (1.0, 1.0, 1.0, 1), roughness=0.10, emissive=(0.85, 0.85, 0.85))
    m_cheek = b.add_material("duck_cheek", (0.96, 0.64, 0.68, 1), roughness=0.75)

    # Buoyant contoured duck body (facing +Z, waterline at y=0)
    b.add_ellipsoid(m_body, 0.0, 0.11, -0.02, 0.23, 0.165, 0.35, segs=18, rings=12, rx=0.05)
    # Plump rounded chest breast
    b.add_ellipsoid(m_breast, 0.0, 0.15, 0.22, 0.18, 0.155, 0.16, segs=16, rings=10)
    # Layered sculpted folded wings + Mallard blue speculum wing-bar!
    for side in (-1, 1):
        b.add_ellipsoid(m_wing, side * 0.175, 0.165, -0.05, 0.085, 0.125, 0.27, segs=14, rings=9, rx=-0.08, ry=side * -0.14, rz=side * 0.18)
        b.add_ellipsoid(m_wing, side * 0.145, 0.185, -0.17, 0.06, 0.085, 0.17, segs=12, rings=8, rx=-0.16, ry=side * -0.22)
        if variant == "mallard":
            b.add_ellipsoid(m_speculum, side * 0.215, 0.155, -0.09, 0.032, 0.052, 0.11, segs=10, rings=6, ry=side * -0.14)
    # Perky upturned feathered tail + curled drake feather!
    b.add_ellipsoid(m_tail, 0.0, 0.185, -0.34, 0.11, 0.072, 0.16, segs=12, rings=8, rx=0.42)
    b.add_ellipsoid(m_body, 0.0, 0.225, -0.40, 0.065, 0.05, 0.10, segs=10, rings=6, rx=0.68)

    # Graceful curved S-neck + white Mallard collar ring
    b.add_ellipsoid(m_breast if variant == "mallard" else m_body, 0.0, 0.27, 0.24, 0.115, 0.11, 0.11, segs=14, rings=8, rx=-0.18)
    if variant == "mallard":
        b.add_cylinder(m_neck_ring, 0.0, 0.325, 0.255, 0.098, 0.092, 0.042, segs=14, rx=-0.12)
    b.add_ellipsoid(m_head, 0.0, 0.37, 0.26, 0.092, 0.095, 0.095, segs=14, rings=8)

    # Rounded expressive anime duck head
    b.add_ellipsoid(m_head, 0.0, 0.445, 0.275, 0.135, 0.125, 0.145, segs=18, rings=12)
    # Soft rosy cheek blush on snowy call duck
    if variant != "mallard":
        for side in (-1, 1):
            b.add_ellipsoid(m_cheek, side * 0.105, 0.415, 0.34, 0.038, 0.024, 0.028, segs=8, rings=6)

    # Glossy expressive dark anime eyes + crisp specular catchlights!
    for side in (-1, 1):
        b.add_ellipsoid(m_eye, side * 0.108, 0.468, 0.355, 0.030, 0.034, 0.026, segs=10, rings=8)
        b.add_ellipsoid(m_shine, side * 0.118, 0.480, 0.372, 0.011, 0.013, 0.010, segs=8, rings=6)

    # Contoured smooth duckbill (upper curved spoon bill + gentle smiling lower bill + tip nail)
    b.add_ellipsoid(m_bill, 0.0, 0.425, 0.435, 0.072, 0.032, 0.105, segs=14, rings=8, rx=0.06)
    b.add_ellipsoid(m_bill, 0.0, 0.405, 0.425, 0.056, 0.022, 0.085, segs=12, rings=6)
    b.add_ellipsoid(m_bill, 0.0, 0.422, 0.515, 0.058, 0.022, 0.042, segs=12, rings=6)

    b.save_glb(os.path.join(OUT_DIR, filename))


def make_fur_tex(base=(232, 224, 212), streak=(196, 184, 168), size=128):
    img = Image.new("RGBA", (size, size), base + (255,))
    draw = ImageDraw.Draw(img)
    for i in range(420):
        x = int(hash01(i * 3.7 + 1.1) * size)
        y = int(hash01(i * 7.3 + 2.5) * size)
        ln = int(4 + hash01(i * 2.9) * 8)
        draw.line([(x, y), (x + int((hash01(i) - 0.5) * 4), y + ln)], fill=streak + (165,), width=2)
    return img


def build_anime_shiba():
    """Sculpted Studio Ghibli Shiba Inu (Mochi) with urajiro cream markings, maro eyebrows, red scarf, gold bell & curled tail!"""
    b = GLBBuilder()
    m_fur = b.add_material("shiba_fur", (1, 1, 1, 1), make_fur_tex((224, 146, 68), (186, 112, 46)), normal_strength=1.4, roughness=0.76)
    m_cream = b.add_material("shiba_cream", (1, 1, 1, 1), make_fur_tex((252, 240, 216), (230, 212, 184)), normal_strength=1.1, roughness=0.78)
    m_ear_in = b.add_material("ear_pink", (0.94, 0.72, 0.70, 1), roughness=0.78)
    m_collar = b.add_material("shiba_scarf", (0.84, 0.20, 0.22, 1), roughness=0.60)
    m_bell = b.add_material("gold_bell_metal", (0.98, 0.80, 0.22, 1), roughness=0.22, metallic=0.78)
    m_dark = b.add_material("nose_dark", (0.12, 0.09, 0.08, 1), roughness=0.22, metallic=0.12)
    m_eye = b.add_material("dog_eye_glass", (0.09, 0.06, 0.05, 1), roughness=0.10, metallic=0.15)
    m_shine = b.add_material("eye_shine", (1.0, 1.0, 1.0, 1), roughness=0.10, emissive=(0.90, 0.90, 0.90))
    m_tongue = b.add_material("pink_tongue", (0.96, 0.48, 0.54, 1), roughness=0.45)

    # Contoured Shiba torso (facing +Z, paws at y=0)
    b.add_ellipsoid(m_fur, 0.0, 0.41, 0.0, 0.205, 0.185, 0.36, segs=18, rings=12)
    # Fluffy cream urajiro chest & underbelly
    b.add_ellipsoid(m_cream, 0.0, 0.34, 0.04, 0.165, 0.135, 0.31, segs=14, rings=10)
    b.add_ellipsoid(m_cream, 0.0, 0.44, 0.26, 0.175, 0.165, 0.16, segs=16, rings=10)
    # Rounded haunches
    for side in (-1, 1):
        b.add_ellipsoid(m_fur, side * 0.125, 0.38, -0.22, 0.105, 0.145, 0.145, segs=12, rings=8)

    # 4 tapered legs with cream sock paws!
    for lx, lz in [(-0.115, 0.20), (0.115, 0.20), (-0.12, -0.21), (0.12, -0.21)]:
        b.add_cylinder(m_fur, lx, 0.22, lz, 0.048, 0.058, 0.20, segs=10)
        b.add_cylinder(m_cream, lx, 0.08, lz, 0.044, 0.048, 0.12, segs=10)
        b.add_ellipsoid(m_cream, lx, 0.032, lz + 0.025, 0.052, 0.034, 0.068, segs=10, rings=6)

    # Iconic festive red bandana scarf + dangling shiny golden bell!
    b.add_cylinder(m_collar, 0.0, 0.50, 0.26, 0.155, 0.145, 0.085, segs=16, rx=0.28)
    b.add_ellipsoid(m_collar, 0.0, 0.43, 0.38, 0.105, 0.095, 0.055, segs=10, rings=6, rx=0.45)
    b.add_ellipsoid(m_bell, 0.0, 0.42, 0.425, 0.044, 0.044, 0.044, segs=12, rings=8)

    # Plump Shiba Inu head with fluffy cream cheek puffs!
    b.add_ellipsoid(m_fur, 0.0, 0.65, 0.34, 0.215, 0.195, 0.205, segs=18, rings=12)
    for side in (-1, 1):
        b.add_ellipsoid(m_cream, side * 0.125, 0.59, 0.425, 0.105, 0.095, 0.095, segs=12, rings=8)
    # Cream muzzle, glossy black button nose & happy pink smile tongue!
    b.add_ellipsoid(m_cream, 0.0, 0.595, 0.515, 0.095, 0.075, 0.115, segs=14, rings=8)
    b.add_ellipsoid(m_dark, 0.0, 0.625, 0.618, 0.038, 0.028, 0.030, segs=10, rings=6)
    b.add_ellipsoid(m_tongue, 0.0, 0.545, 0.575, 0.032, 0.020, 0.042, segs=8, rings=6, rx=0.45)

    # Expressive glossy anime Shiba eyes + catchlights + iconic white Shiba "maro" eyebrow dots!
    for side in (-1, 1):
        b.add_ellipsoid(m_eye, side * 0.095, 0.685, 0.515, 0.035, 0.038, 0.026, segs=10, rings=8)
        b.add_ellipsoid(m_shine, side * 0.103, 0.698, 0.534, 0.014, 0.016, 0.010, segs=8, rings=6)
        b.add_ellipsoid(m_cream, side * 0.088, 0.745, 0.492, 0.028, 0.016, 0.018, segs=8, rings=6)

    # Perky triangular Shiba ears with warm pink inner ear
    for side in (-1, 1):
        b.add_cylinder(m_fur, side * 0.145, 0.855, 0.31, 0.076, 0.016, 0.18, segs=8, rx=0.14, rz=side * -0.24)
        b.add_cylinder(m_ear_in, side * 0.142, 0.848, 0.338, 0.046, 0.010, 0.13, segs=8, rx=0.14, rz=side * -0.24)

    # Iconic curled fluffy Shiba donut tail tucked proudly over the back!
    b.add_ellipsoid(m_fur, 0.0, 0.56, -0.34, 0.085, 0.105, 0.115, segs=12, rings=8, rx=0.45)
    b.add_ellipsoid(m_cream, 0.0, 0.64, -0.28, 0.075, 0.085, 0.095, segs=12, rings=8)
    b.add_ellipsoid(m_fur, 0.0, 0.62, -0.20, 0.068, 0.068, 0.075, segs=10, rings=6)

    b.save_glb(os.path.join(OUT_DIR, "anime_shiba.glb"))


def build_anime_cat():
    """Sculpted Seated Studio Ghibli Cat with tintable coat/accent materials, expressive eyes, collar & bell!"""
    b = GLBBuilder()
    # Neutral white-tinted fur textures so JS clone() tints Mikan, Kuro, Yuki, Sakura & Tama vividly!
    m_fur = b.add_material("cat_fur", (1, 1, 1, 1), make_fur_tex((246, 244, 240), (218, 214, 208)), normal_strength=1.3, roughness=0.76)
    m_accent = b.add_material("cat_accent", (1, 1, 1, 1), make_fur_tex((248, 246, 242), (226, 222, 216)), normal_strength=1.0, roughness=0.78)
    m_ear_in = b.add_material("cat_pink", (0.96, 0.72, 0.76, 1), roughness=0.72)
    m_collar = b.add_material("cat_collar", (0.88, 0.24, 0.32, 1), roughness=0.55)
    m_bell = b.add_material("cat_bell_metal", (0.98, 0.82, 0.24, 1), roughness=0.22, metallic=0.78)
    m_eye = b.add_material("cat_eye_glass", (0.14, 0.44, 0.24, 1), roughness=0.10, metallic=0.18)
    m_pupil = b.add_material("cat_pupil", (0.06, 0.05, 0.05, 1), roughness=0.10)
    m_shine = b.add_material("cat_shine", (1.0, 1.0, 1.0, 1), roughness=0.10, emissive=(0.92, 0.92, 0.92))

    # Graceful seated feline body (facing +X to match existing Tokyo cat orientation!)
    # Wait: let's orient facing +Z cleanly and rotate in JS or match +Z! Facing +Z is standard & super clean.
    b.add_ellipsoid(m_fur, 0.0, 0.22, -0.04, 0.175, 0.205, 0.22, segs=16, rings=12, rx=0.16)
    # Fluffy accent chest bib & tucked haunches
    b.add_ellipsoid(m_accent, 0.0, 0.24, 0.11, 0.12, 0.145, 0.11, segs=14, rings=8)
    for side in (-1, 1):
        b.add_ellipsoid(m_fur, side * 0.13, 0.13, -0.09, 0.095, 0.115, 0.145, segs=12, rings=8)
        # Neat seated front legs + cute accent mittens!
        b.add_cylinder(m_fur, side * 0.075, 0.14, 0.135, 0.036, 0.044, 0.20, segs=10)
        b.add_ellipsoid(m_accent, side * 0.075, 0.032, 0.165, 0.044, 0.030, 0.058, segs=10, rings=6)

    # Ribbon collar + shiny golden cat bell
    b.add_cylinder(m_collar, 0.0, 0.365, 0.08, 0.115, 0.112, 0.048, segs=16, rx=0.18)
    b.add_ellipsoid(m_bell, 0.0, 0.34, 0.19, 0.038, 0.038, 0.038, segs=10, rings=8)

    # Cute plump feline head with fluffy cheek tufts!
    b.add_ellipsoid(m_fur, 0.0, 0.49, 0.10, 0.175, 0.155, 0.165, segs=18, rings=12)
    for side in (-1, 1):
        b.add_ellipsoid(m_accent, side * 0.075, 0.445, 0.22, 0.068, 0.052, 0.058, segs=10, rings=6)
    # Tiny cute pink cat nose
    b.add_ellipsoid(m_ear_in, 0.0, 0.468, 0.268, 0.026, 0.018, 0.020, segs=8, rings=6)

    # Big luminous anime cat eyes + vertical pupil + bright white sparkles!
    for side in (-1, 1):
        b.add_ellipsoid(m_eye, side * 0.082, 0.51, 0.235, 0.038, 0.042, 0.025, segs=10, rings=8)
        b.add_ellipsoid(m_pupil, side * 0.083, 0.51, 0.252, 0.016, 0.032, 0.014, segs=8, rings=6)
        b.add_ellipsoid(m_shine, side * 0.095, 0.525, 0.260, 0.013, 0.015, 0.010, segs=8, rings=6)

    # Pointed triangular cat ears with soft pink inner ear
    for side in (-1, 1):
        b.add_cylinder(m_fur, side * 0.115, 0.65, 0.085, 0.066, 0.012, 0.15, segs=7, rz=side * -0.22)
        b.add_cylinder(m_ear_in, side * 0.112, 0.645, 0.106, 0.040, 0.008, 0.11, segs=7, rz=side * -0.22)

    b.save_glb(os.path.join(OUT_DIR, "anime_cat.glb"))


def build_anime_kitsune():
    """Sculpted Mystical Kyoto Shrine Kitsune Fox with vermilion Inari bib, gold bell, sleek snout & tall ears!"""
    b = GLBBuilder()
    m_fur = b.add_material("fox_fur", (1, 1, 1, 1), make_fur_tex((246, 244, 240), (218, 212, 204)), normal_strength=1.4, roughness=0.74)
    m_tip = b.add_material("fox_tip", (1, 1, 1, 1), make_fur_tex((252, 250, 246), (232, 228, 222)), normal_strength=1.0, roughness=0.76)
    m_bib = b.add_material("kitsune_bib", (0.84, 0.16, 0.18, 1), roughness=0.58)
    m_bell = b.add_material("fox_bell_metal", (0.98, 0.82, 0.22, 1), roughness=0.22, metallic=0.80)
    m_dark = b.add_material("fox_dark", (0.12, 0.09, 0.09, 1), roughness=0.30)
    m_ear_in = b.add_material("fox_pink", (0.95, 0.70, 0.72, 1), roughness=0.72)
    m_eye = b.add_material("fox_eye_glass", (0.86, 0.36, 0.12, 1), roughness=0.10, metallic=0.20)
    m_shine = b.add_material("fox_shine", (1.0, 1.0, 1.0, 1), roughness=0.10, emissive=(0.94, 0.92, 0.86))

    # Graceful seated shrine fox torso (facing +Z, paws at y=0)
    b.add_ellipsoid(m_fur, 0.0, 0.26, -0.05, 0.165, 0.23, 0.22, segs=16, rings=12, rx=0.14)
    # Fluffy chest ruff & slender tucked haunches
    b.add_ellipsoid(m_tip, 0.0, 0.31, 0.10, 0.135, 0.145, 0.12, segs=14, rings=8)
    for side in (-1, 1):
        b.add_ellipsoid(m_fur, side * 0.125, 0.14, -0.10, 0.092, 0.125, 0.145, segs=12, rings=8)
        b.add_cylinder(m_fur, side * 0.072, 0.16, 0.135, 0.032, 0.042, 0.24, segs=10)
        b.add_ellipsoid(m_dark, side * 0.072, 0.030, 0.165, 0.038, 0.028, 0.054, segs=10, rings=6)

    # Traditional vermilion Inari shrine bib (yodarekake) + golden cord & shrine bell!
    b.add_cylinder(m_bib, 0.0, 0.425, 0.09, 0.122, 0.115, 0.055, segs=16, rx=0.22)
    b.add_ellipsoid(m_bib, 0.0, 0.34, 0.195, 0.125, 0.115, 0.058, segs=12, rings=8, rx=0.35)
    b.add_ellipsoid(m_bell, 0.0, 0.375, 0.238, 0.038, 0.038, 0.038, segs=10, rings=8)

    # Sleek vulpine head with tapered fox snout & fluffy cheek ruffs!
    b.add_ellipsoid(m_fur, 0.0, 0.56, 0.10, 0.165, 0.145, 0.175, segs=18, rings=12)
    for side in (-1, 1):
        b.add_ellipsoid(m_tip, side * 0.12, 0.515, 0.14, 0.088, 0.068, 0.078, segs=10, rings=6)
    # Tapered pointed fox muzzle + dark button nose!
    b.add_ellipsoid(m_tip, 0.0, 0.525, 0.275, 0.072, 0.055, 0.125, segs=14, rings=8, rx=0.08)
    b.add_ellipsoid(m_dark, 0.0, 0.542, 0.392, 0.030, 0.024, 0.026, segs=10, rings=6)

    # Expressive luminous mystic anime fox eyes + bright catchlights!
    for side in (-1, 1):
        b.add_ellipsoid(m_eye, side * 0.078, 0.582, 0.242, 0.036, 0.034, 0.024, segs=10, rings=8, rz=side * 0.22)
        b.add_ellipsoid(m_dark, side * 0.080, 0.582, 0.258, 0.016, 0.026, 0.014, segs=8, rings=6)
        b.add_ellipsoid(m_shine, side * 0.090, 0.594, 0.264, 0.012, 0.014, 0.010, segs=8, rings=6)

    # Tall pointed shrine fox ears with pink inner ear!
    for side in (-1, 1):
        b.add_cylinder(m_fur, side * 0.108, 0.765, 0.085, 0.068, 0.012, 0.23, segs=8, rz=side * -0.18)
        b.add_cylinder(m_ear_in, side * 0.105, 0.755, 0.108, 0.040, 0.008, 0.165, segs=8, rz=side * -0.18)

    b.save_glb(os.path.join(OUT_DIR, "anime_kitsune.glb"))


def make_giraffe_spot_tex(w=256, h=256):
    """Warm golden-ochre giraffe hide with soft organic chestnut-brown polygonal spots."""
    img = Image.new("RGBA", (w, h), (238, 188, 92, 255))
    draw = ImageDraw.Draw(img)
    rng = random.Random(404)
    for _ in range(52):
        cx = rng.randint(0, w - 1)
        cy = rng.randint(0, h - 1)
        rx = rng.randint(12, 26)
        ry = rng.randint(10, 24)
        col = (rng.randint(128, 152), rng.randint(72, 92), rng.randint(36, 48), 255)
        for ox in (-w, 0, w):
            for oy in (-h, 0, h):
                draw.ellipse([cx + ox - rx, cy + oy - ry, cx + ox + rx, cy + oy + ry], fill=col)
    return img


def make_zebra_stripe_tex(w=256, h=128):
    """Crisp safari-cream Land Cruiser body texture with bold savanna zebra stripes."""
    img = Image.new("RGBA", (w, h), (242, 232, 206, 255))
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, h - 20, w, h], fill=(78, 66, 52, 255))
    for i in range(0, w, 28):
        pts = [(i, 0), (i + 11, 0), (i + 18, h // 2), (i + 9, h - 20), (i - 2, h - 20), (i + 6, h // 2)]
        draw.polygon(pts, fill=(44, 38, 34, 255))
    return img


def build_anime_acacia():
    """Iconic flat-topped African Umbrella Acacia tree with curving gnarled branches & sun-dappled olive canopy!"""
    b = GLBBuilder()
    bark_tex = make_bark_tex((106, 76, 52))
    m_bark = b.add_material("acacia_bark", (1, 1, 1, 1), bark_tex, normal_strength=2.6, roughness=0.90)
    leaf_tex = make_leaf_cluster_tex([(58, 92, 38), (94, 134, 52), (168, 186, 74)])
    m_leaf = b.add_material("acacia_leaf", (1, 1, 1, 1), leaf_tex, roughness=0.78, alpha_mask=True, double_sided=True)

    # Slightly leaning lower trunk + 4 sweeping Y-forked upper branches
    b.add_cylinder(m_bark, 0.0, 1.35, 0.0, 0.34, 0.24, 2.7, segs=10, rz=0.07)
    branches = [
        (0.95, 3.05, 0.32, 0.16, 0.08, 2.3, 0.14, -0.68),
        (-1.05, 3.12, -0.24, 0.16, 0.08, 2.4, -0.10, 0.72),
        (0.18, 3.22, -1.02, 0.14, 0.07, 2.2, -0.66, -0.12),
        (-0.22, 3.15, 0.96, 0.14, 0.07, 2.1, 0.64, 0.14),
    ]
    for bx, by, bz, rb, rt, h, rx, rz in branches:
        b.add_cylinder(m_bark, bx, by, bz, rb, rt, h, segs=8, rx=rx, rz=rz)

    # Wide, flat layered umbrella canopy tiers (classic Serengeti silhouette!)
    rng = random.Random(512)
    tiers = [(0, 4.18, 0, 2.85, 0.40), (1.35, 4.02, 0.48, 2.0, 0.34), (-1.42, 4.10, -0.35, 2.1, 0.34), (0.25, 4.25, -1.25, 1.80, 0.32), (-0.30, 4.16, 1.22, 1.75, 0.32)]
    for cx, cy, cz, rad, thick in tiers:
        for i in range(9):
            ang = (i / 9.0) * math.pi * 2 + rng.uniform(-0.2, 0.2)
            r = rad * rng.uniform(0.18, 0.82)
            px = cx + math.cos(ang) * r
            pz = cz + math.sin(ang) * r
            py = cy + rng.uniform(-thick * 0.45, thick * 0.45)
            sz = rng.uniform(1.15, 1.58)
            b.add_leaf_frond(m_leaf, px, py, pz, sz, rng.uniform(-0.26, 0.26), ang, rng.uniform(-0.18, 0.18), (0, 3.85, 0), height_ratio=0.92)
    b.save_glb(os.path.join(OUT_DIR, "anime_acacia.glb"))


def build_anime_baobab():
    """Majestic ancient African Baobab tree with massive fluted bottle trunk & crooked crown branches!"""
    b = GLBBuilder()
    bark_tex = make_bark_tex((128, 96, 74))
    m_bark = b.add_material("baobab_bark", (1, 1, 1, 1), bark_tex, normal_strength=2.8, roughness=0.92)
    leaf_tex = make_leaf_cluster_tex([(48, 96, 44), (82, 140, 58), (144, 184, 78)])
    m_leaf = b.add_material("baobab_leaf", (1, 1, 1, 1), leaf_tex, roughness=0.76, alpha_mask=True, double_sided=True)

    # Massive bottle trunk + root buttresses
    b.add_cylinder(m_bark, 0, 1.45, 0, 1.42, 1.18, 2.9, segs=14)
    b.add_cylinder(m_bark, 0, 3.35, 0, 1.18, 0.88, 1.35, segs=14)
    for i in range(6):
        ang = (i / 6.0) * math.pi * 2
        b.add_ellipsoid(m_bark, math.cos(ang) * 1.02, 0.55, math.sin(ang) * 1.02, 0.48, 0.75, 0.48, segs=10, rings=6)
    # Crooked skyward root-like crown branches + lush leaf puffs
    rng = random.Random(612)
    for i in range(7):
        ang = (i / 7.0) * math.pi * 2 + 0.25
        dist = 1.35 if i % 2 == 0 else 1.12
        bx, bz = math.cos(ang) * dist, math.sin(ang) * dist
        b.add_cylinder(m_bark, bx * 0.65, 4.55, bz * 0.65, 0.30, 0.12, 2.1, segs=8, rx=math.sin(ang) * 0.55, rz=-math.cos(ang) * 0.55)
        for j in range(6):
            lx = bx * 1.25 + rng.uniform(-0.7, 0.7)
            ly = 5.45 + rng.uniform(-0.35, 0.55)
            lz = bz * 1.25 + rng.uniform(-0.7, 0.7)
            sz = rng.uniform(1.05, 1.45)
            b.add_leaf_frond(m_leaf, lx, ly, lz, sz, rng.uniform(-0.35, 0.35), rng.uniform(0, 6.28), rng.uniform(-0.25, 0.25), (0, 5.1, 0), height_ratio=0.95)
    b.save_glb(os.path.join(OUT_DIR, "anime_baobab.glb"))


def build_anime_giraffe():
    """Sculpted graceful African Giraffe (~4.8m tall) with spotted hide, long neck, ossicones & friendly anime eyes!"""
    b = GLBBuilder()
    spot_tex = make_giraffe_spot_tex()
    m_hide = b.add_material("giraffe_hide", (1, 1, 1, 1), spot_tex, normal_strength=1.2, roughness=0.76)
    m_cream = b.add_material("giraffe_cream", (0.97, 0.91, 0.76, 1), roughness=0.82)
    m_mane = b.add_material("giraffe_mane", (0.42, 0.24, 0.12, 1), roughness=0.88)
    m_dark = b.add_material("giraffe_dark", (0.14, 0.10, 0.08, 1), roughness=0.45)
    m_shine = b.add_material("giraffe_shine", (1.0, 1.0, 1.0, 1), roughness=0.1, emissive=(0.9, 0.9, 0.9))

    # Sloped muscular body (higher at shoulders +Z, tapering gently toward rump -Z)
    b.add_ellipsoid(m_hide, 0.0, 2.08, 0.0, 0.56, 0.58, 1.06, segs=18, rings=12, rx=-0.16)
    b.add_ellipsoid(m_cream, 0.0, 1.72, 0.02, 0.42, 0.30, 0.85, segs=12, rings=8)

    # 4 tall slender legs with darker hooves
    for lx, lz in ((-0.32, 0.62), (0.32, 0.62), (-0.30, -0.68), (0.30, -0.68)):
        b.add_cylinder(m_hide, lx, 1.48, lz, 0.14, 0.10, 1.15, segs=10)
        b.add_cylinder(m_cream, lx, 0.52, lz, 0.095, 0.075, 0.96, segs=10)
        b.add_cylinder(m_dark, lx, 0.06, lz, 0.082, 0.092, 0.12, segs=10)

    # Sweeping graceful neck + dark crest mane along the back!
    b.add_cylinder(m_hide, 0.0, 3.25, 0.96, 0.34, 0.19, 2.25, segs=14, rx=0.22)
    for mi in range(7):
        t = mi / 6.0
        b.add_ellipsoid(m_mane, 0.0, 2.40 + t * 1.80, 0.55 + t * 0.44, 0.065, 0.14, 0.11, segs=8, rings=6)

    # Sculpted giraffe head, cream muzzle, ossicones (horns), floppy ears & big kind anime eyes!
    b.add_ellipsoid(m_hide, 0.0, 4.44, 1.32, 0.24, 0.22, 0.30, segs=16, rings=10)
    b.add_ellipsoid(m_cream, 0.0, 4.35, 1.62, 0.15, 0.14, 0.24, segs=14, rings=8, rx=0.14)
    b.add_ellipsoid(m_dark, 0.0, 4.37, 1.83, 0.06, 0.045, 0.04, segs=8, rings=6)
    for side in (-1, 1):
        b.add_cylinder(m_hide, side * 0.10, 4.72, 1.24, 0.032, 0.028, 0.24, segs=8, rz=side * -0.14)
        b.add_ellipsoid(m_mane, side * 0.12, 4.85, 1.24, 0.045, 0.045, 0.045, segs=8, rings=6)
        b.add_ellipsoid(m_hide, side * 0.28, 4.54, 1.18, 0.15, 0.065, 0.085, segs=10, rings=6, rz=side * 0.28)
        b.add_ellipsoid(m_dark, side * 0.18, 4.48, 1.46, 0.052, 0.056, 0.042, segs=10, rings=8)
        b.add_ellipsoid(m_shine, side * 0.20, 4.50, 1.495, 0.018, 0.022, 0.016, segs=8, rings=6)

    # Slender tail with fluffy dark tuft
    b.add_cylinder(m_cream, 0.0, 1.65, -1.08, 0.045, 0.030, 0.78, segs=8, rx=-0.35)
    b.add_ellipsoid(m_mane, 0.0, 1.24, -1.24, 0.085, 0.15, 0.085, segs=10, rings=6)
    b.save_glb(os.path.join(OUT_DIR, "anime_giraffe.glb"))


def build_anime_elephant():
    """Sculpted gentle African Elephant (~3.1m tall) with wrinkled normal-mapped hide, wide ears, curved ivory tusks & curling trunk!"""
    b = GLBBuilder()
    hide_tex = make_stucco_tex((144, 148, 156))
    m_hide = b.add_material("ele_hide", (1, 1, 1, 1), hide_tex, normal_strength=2.2, roughness=0.86)
    m_ear_in = b.add_material("ele_ear_in", (0.72, 0.64, 0.66, 1), roughness=0.85)
    m_ivory = b.add_material("ele_ivory", (0.98, 0.95, 0.86, 1), roughness=0.35)
    m_nail = b.add_material("ele_nail", (0.85, 0.82, 0.76, 1), roughness=0.72)
    m_dark = b.add_material("ele_dark", (0.12, 0.10, 0.10, 1), roughness=0.30)
    m_shine = b.add_material("ele_shine", (1.0, 1.0, 1.0, 1), roughness=0.1, emissive=(0.9, 0.9, 0.9))

    # Big warm rounded barrel torso
    b.add_ellipsoid(m_hide, 0.0, 1.72, -0.10, 0.98, 0.92, 1.32, segs=22, rings=14)
    # 4 sturdy pillar legs + cute light toenails
    for lx, lz in ((-0.54, 0.64), (0.54, 0.64), (-0.52, -0.78), (0.52, -0.78)):
        b.add_cylinder(m_hide, lx, 0.72, lz, 0.30, 0.28, 1.44, segs=12)
        for ni in (-0.12, 0.0, 0.12):
            b.add_ellipsoid(m_nail, lx + ni, 0.08, lz + 0.27, 0.055, 0.055, 0.045, segs=6, rings=5)

    # Big gentle domed head
    b.add_ellipsoid(m_hide, 0.0, 2.28, 1.08, 0.66, 0.68, 0.64, segs=18, rings=12)
    # Iconic wide African elephant ears!
    for side in (-1, 1):
        b.add_ellipsoid(m_hide, side * 0.88, 2.24, 0.82, 0.56, 0.72, 0.14, segs=14, rings=10, ry=side * -0.42, rz=side * 0.12)
        b.add_ellipsoid(m_ear_in, side * 0.86, 2.20, 0.89, 0.40, 0.52, 0.07, segs=12, rings=8, ry=side * -0.42, rz=side * 0.12)
        b.add_cylinder(m_ivory, side * 0.28, 1.72, 1.66, 0.078, 0.032, 0.68, segs=10, rx=1.08, ry=side * 0.18)
        b.add_ellipsoid(m_dark, side * 0.44, 2.38, 1.54, 0.075, 0.080, 0.055, segs=10, rings=8)
        b.add_ellipsoid(m_shine, side * 0.46, 2.41, 1.585, 0.026, 0.030, 0.020, segs=8, rings=6)

    # Gracefully curving multi-segment trunk (C-curl upward at the tip like a happy greeting!)
    trunk_segs = [
        (0.0, 1.94, 1.56, 0.23, 0.19, 0.42, 0.45),
        (0.0, 1.58, 1.78, 0.19, 0.15, 0.44, 0.22),
        (0.0, 1.24, 1.88, 0.15, 0.12, 0.42, -0.18),
        (0.0, 1.08, 2.08, 0.12, 0.095, 0.34, -1.05),
        (0.0, 1.18, 2.32, 0.095, 0.080, 0.26, -1.85),
    ]
    for tx, ty, tz, rb, rt, h, rx in trunk_segs:
        b.add_cylinder(m_hide, tx, ty, tz, rb, rt, h, segs=12, rx=rx)

    # Little tail with dark tuft
    b.add_cylinder(m_hide, 0.0, 1.52, -1.42, 0.055, 0.035, 0.68, segs=8, rx=-0.38)
    b.add_ellipsoid(m_dark, 0.0, 1.16, -1.58, 0.085, 0.14, 0.085, segs=8, rings=6)
    b.save_glb(os.path.join(OUT_DIR, "anime_elephant.glb"))


def build_anime_lion_cub():
    """Adorable playful African Lion Cub (5 hiding collectibles!) with honey-gold fur, cream belly/paws, fluffy ears & tufted tail!"""
    b = GLBBuilder()
    fur_tex = make_fur_tex((234, 178, 86), (206, 146, 62))
    m_fur = b.add_material("cub_fur", (1, 1, 1, 1), fur_tex, normal_strength=1.5, roughness=0.80)
    m_cream = b.add_material("cub_cream", (0.98, 0.93, 0.80, 1), roughness=0.82)
    m_tuft = b.add_material("cub_tuft", (0.52, 0.30, 0.14, 1), roughness=0.86)
    m_nose = b.add_material("cub_nose", (0.76, 0.42, 0.42, 1), roughness=0.45)
    m_eye = b.add_material("cub_eye", (0.86, 0.56, 0.14, 1), roughness=0.18, emissive=(0.14, 0.08, 0.02))
    m_dark = b.add_material("cub_dark", (0.12, 0.09, 0.08, 1), roughness=0.25)
    m_shine = b.add_material("cub_shine", (1.0, 1.0, 1.0, 1), roughness=0.1, emissive=(0.95, 0.95, 0.95))

    # Plump playful sitting-crouched cub body + cream belly
    b.add_ellipsoid(m_fur, 0.0, 0.28, -0.04, 0.21, 0.19, 0.29, segs=18, rings=12)
    b.add_ellipsoid(m_cream, 0.0, 0.24, 0.06, 0.15, 0.14, 0.19, segs=12, rings=8)
    for lx, lz in ((-0.12, 0.15), (0.12, 0.15), (-0.13, -0.18), (0.13, -0.18)):
        b.add_cylinder(m_fur, lx, 0.14, lz, 0.062, 0.052, 0.24, segs=10)
        b.add_ellipsoid(m_cream, lx, 0.042, lz + 0.03, 0.064, 0.042, 0.075, segs=10, rings=6)

    # Big cute anime cub head + cream muzzle + pink nose + forehead tuft
    b.add_ellipsoid(m_fur, 0.0, 0.52, 0.20, 0.22, 0.20, 0.21, segs=18, rings=12)
    b.add_ellipsoid(m_cream, 0.0, 0.46, 0.37, 0.115, 0.085, 0.095, segs=14, rings=8)
    b.add_ellipsoid(m_nose, 0.0, 0.495, 0.455, 0.044, 0.032, 0.030, segs=10, rings=6)
    b.add_ellipsoid(m_tuft, 0.0, 0.72, 0.22, 0.075, 0.055, 0.070, segs=10, rings=6)

    for side in (-1, 1):
        b.add_ellipsoid(m_fur, side * 0.18, 0.67, 0.15, 0.082, 0.085, 0.055, segs=12, rings=8, rz=side * -0.25)
        b.add_ellipsoid(m_cream, side * 0.18, 0.66, 0.185, 0.048, 0.052, 0.030, segs=10, rings=6, rz=side * -0.25)
        b.add_ellipsoid(m_eye, side * 0.095, 0.545, 0.382, 0.048, 0.052, 0.032, segs=10, rings=8)
        b.add_ellipsoid(m_dark, side * 0.095, 0.545, 0.402, 0.028, 0.036, 0.022, segs=8, rings=6)
        b.add_ellipsoid(m_shine, side * 0.108, 0.562, 0.412, 0.016, 0.018, 0.014, segs=8, rings=6)

    # Playful curved tail with dark brown lion tuft!
    b.add_cylinder(m_fur, 0.0, 0.32, -0.34, 0.034, 0.028, 0.34, segs=8, rx=-0.95)
    b.add_ellipsoid(m_tuft, 0.0, 0.44, -0.49, 0.068, 0.082, 0.068, segs=10, rings=8)
    b.save_glb(os.path.join(OUT_DIR, "anime_lion_cub.glb"))


def build_anime_safari_jeep():
    """Sculpted open-top Zebra-Striped Safari Land Cruiser Jeep with hollow torus tires, roll cage, canvas roof, seats & headlights!"""
    b = GLBBuilder()
    zebra_tex = make_zebra_stripe_tex()
    m_zebra = b.add_material("jeep_zebra", (1, 1, 1, 1), zebra_tex, normal_strength=0.6, roughness=0.45, metallic=0.12)
    m_khaki = b.add_material("jeep_khaki", (0.76, 0.67, 0.48, 1), roughness=0.78)
    m_dark = b.add_material("jeep_dark", (0.16, 0.16, 0.18, 1), roughness=0.75, metallic=0.35)
    m_chrome = b.add_material("jeep_chrome", (0.85, 0.87, 0.90, 1), roughness=0.20, metallic=0.85)
    m_glass = b.add_material("jeep_glass", (0.42, 0.64, 0.74, 1), roughness=0.10, metallic=0.38)
    m_seat = b.add_material("jeep_seat", (0.48, 0.30, 0.18, 1), roughness=0.72)
    m_lamp = b.add_material("jeep_lamp", (1.0, 0.96, 0.78, 1), roughness=0.12, emissive=(0.95, 0.88, 0.60))
    m_tail = b.add_material("jeep_tail", (0.90, 0.16, 0.14, 1), roughness=0.22, emissive=(0.45, 0.06, 0.05))

    b.add_box(m_dark, 0.0, 0.46, 0.0, 1.72, 0.18, 3.85)
    b.add_box(m_zebra, 0.0, 0.88, 1.25, 1.76, 0.66, 1.48)
    b.add_box(m_zebra, 0.0, 0.82, -0.58, 1.82, 0.56, 2.28)
    b.add_box(m_dark, 0.0, 0.86, 2.00, 1.28, 0.44, 0.06)
    for gx in (-0.42, -0.21, 0.0, 0.21, 0.42):
        b.add_box(m_chrome, gx, 0.86, 2.04, 0.04, 0.38, 0.03)
    b.add_box(m_dark, 0.0, 0.56, 2.12, 1.84, 0.14, 0.18)
    for bx in (-0.45, 0.45):
        b.add_cylinder(m_dark, bx, 0.82, 2.16, 0.032, 0.032, 0.52, segs=8)
    b.add_cylinder(m_dark, 0.0, 1.04, 2.16, 0.032, 0.032, 0.96, segs=8, rz=math.pi / 2)
    for hx in (-0.66, 0.66):
        b.add_cylinder(m_chrome, hx, 0.90, 1.99, 0.13, 0.13, 0.06, segs=12, rx=math.pi / 2)
        b.add_ellipsoid(m_lamp, hx, 0.90, 2.03, 0.105, 0.105, 0.03, segs=10, rings=6)
        b.add_box(m_tail, hx, 0.88, -1.74, 0.18, 0.12, 0.05)

    b.add_box(m_dark, 0.0, 1.56, 0.58, 1.72, 0.62, 0.07, rx=-0.16)
    b.add_box(m_glass, 0.0, 1.56, 0.58, 1.54, 0.48, 0.09, rx=-0.16)
    b.add_torus(m_dark, -0.44, 1.24, 0.28, 0.16, 0.022, segs=14, tube_segs=6, rx=0.45)
    for sz in (-0.18, -1.08):
        b.add_box(m_seat, 0.0, 0.92, sz, 1.46, 0.14, 0.48)
        b.add_box(m_seat, 0.0, 1.24, sz - 0.20, 1.46, 0.52, 0.12, rx=-0.10)

    for rx_p in (-0.82, 0.82):
        for rz_p in (0.50, -0.58, -1.64):
            b.add_cylinder(m_dark, rx_p, 1.54, rz_p, 0.035, 0.035, 1.08, segs=8)
    b.add_box(m_khaki, 0.0, 2.08, -0.58, 1.80, 0.10, 2.36)
    b.add_box(m_dark, 0.0, 2.16, -1.05, 1.50, 0.08, 1.05)

    for wx in (-0.94, 0.94):
        for wz in (1.26, -1.16):
            b.add_torus(m_dark, wx, 0.44, wz, 0.33, 0.11, segs=22, tube_segs=10, ry=math.pi / 2)
            b.add_cylinder(m_chrome, wx, 0.44, wz, 0.22, 0.22, 0.14, segs=14, rz=math.pi / 2)
    b.add_torus(m_dark, 0.0, 0.96, -1.84, 0.30, 0.095, segs=20, tube_segs=8)
    b.add_cylinder(m_chrome, 0.0, 0.96, -1.84, 0.19, 0.19, 0.12, segs=12, rx=math.pi / 2)

    b.save_glb(os.path.join(OUT_DIR, "anime_safari_jeep.glb"))


if __name__ == "__main__":
    print("Generating 26 AAA normal-mapped Shinkai/Ghibli .glb models into", OUT_DIR)
    build_tokyo_house_2f()
    build_tokyo_house_1f()
    build_kyoto_machiya()
    build_sakura_school()
    build_ichiban_ramen()
    build_anime_tree("anime_tree_green.glb", [(36, 82, 38), (64, 128, 52), (132, 184, 72)], (88, 64, 46), seed_offset=1)
    build_anime_tree("anime_tree_sakura.glb", [(184, 118, 146), (242, 174, 198), (255, 224, 236)], (76, 52, 44), seed_offset=2)
    build_anime_tree("anime_tree_maple.glb", [(158, 48, 38), (218, 92, 44), (248, 168, 66)], (78, 52, 40), seed_offset=3)
    build_anime_willow()
    build_anime_cedar()
    build_anime_shrub()
    build_utility_pole()
    build_anime_vending()
    build_anime_bike()
    build_anime_shinkansen()
    build_anime_duck("anime_duck_mallard.glb", "mallard")
    build_anime_duck("anime_duck_white.glb", "white")
    build_anime_shiba()
    build_anime_cat()
    build_anime_kitsune()
    build_anime_acacia()
    build_anime_baobab()
    build_anime_giraffe()
    build_anime_elephant()
    build_anime_lion_cub()
    build_anime_safari_jeep()
    print("All 26 AAA .glb assets built successfully!")
