#!/usr/bin/env python3
"""
Procedural Sculpted Anime .glb Asset Generator (Pure Python + Pillow)
Generates compact, UV-mapped, vertex-AO-baked binary glTF 2.0 (.glb) assets
inspired by Makoto Shinkai / Studio Ghibli Japanese neighborhoods.
"""
import io
import json
import math
import os
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


# ---------------------------------------------------------------------------
# 1. Hand-Painted Anime Textures (Pillow)
# ---------------------------------------------------------------------------
def make_stucco_tex(base=(232, 224, 210), size=256):
    img = Image.new("RGBA", (size, size), base + (255,))
    draw = ImageDraw.Draw(img)
    # Watercolor mottling
    for i in range(420):
        x = int(hash01(i * 3.1) * size)
        y = int(hash01(i * 5.7) * size)
        r = int(6 + hash01(i * 7.3) * 18)
        d = int((hash01(i * 2.3) - 0.5) * 20)
        c = tuple(max(0, min(255, base[k] + d)) for k in range(3)) + (42,)
        draw.ellipse((x - r, y - r, x + r, y + r), fill=c)
    # Subtle eave shadow at top & ground weathering at bottom (baked anime AO!)
    for y in range(size):
        t = y / size
        if t < 0.16:
            a = int((1.0 - t / 0.16) * 62)
            draw.line([(0, y), (size, y)], fill=(60, 68, 95, a))
        elif t > 0.84:
            a = int(((t - 0.84) / 0.16) * 58)
            draw.line([(0, y), (size, y)], fill=(78, 74, 66, a))
    # Faint vertical rain weathering streaks
    for i in range(28):
        x = int(hash01(i * 11.3) * size)
        h = int(20 + hash01(i * 4.7) * 70)
        draw.line([(x, 0), (x, h)], fill=(80, 86, 104, 24), width=2)
    return img.filter(ImageFilter.GaussianBlur(radius=0.6))


def make_kawara_roof_tex(base=(72, 78, 92), size=256):
    img = Image.new("RGBA", (size, size), base + (255,))
    draw = ImageDraw.Draw(img)
    row_h = 24
    col_w = 24
    for row in range(0, size + row_h, row_h):
        # Soft sunlit tile ridge & deep underside cast shadow
        draw.rectangle([0, row, size, row + 5], fill=(min(255, base[0] + 28), min(255, base[1] + 28), min(255, base[2] + 32), 180))
        draw.rectangle([0, row + row_h - 5, size, row + row_h], fill=(max(0, base[0] - 32), max(0, base[1] - 30), max(0, base[2] - 24), 210))
        for col in range(0, size + col_w, col_w):
            v = int((hash01(row * 13.7 + col * 7.1) - 0.5) * 18)
            tc = tuple(max(0, min(255, base[k] + v)) for k in range(3)) + (120,)
            draw.arc([col, row + 4, col + col_w, row + row_h + 6], 0, 180, fill=(32, 36, 48, 175), width=2)
            draw.line([(col + 2, row + 2), (col + 2, row + row_h)], fill=(255, 252, 245, 34), width=2)
            draw.rectangle([col + 4, row + 6, col + col_w - 4, row + row_h - 6], fill=tc)
    return img


def make_cinderblock_tex(size=256):
    img = Image.new("RGBA", (size, size), (146, 148, 152, 255))
    draw = ImageDraw.Draw(img)
    bh, bw = 32, 64
    for r in range(0, size, bh):
        off = (bw // 2) if (r // bh) % 2 else 0
        for c in range(-bw, size + bw, bw):
            v = int((hash01(r * 3.7 + c * 9.1) - 0.5) * 20)
            col = (144 + v, 145 + v, 149 + v, 255)
            draw.rectangle([c + off + 2, r + 2, c + off + bw - 2, r + bh - 2], fill=col, outline=(96, 98, 104, 210), width=2)
            draw.line([(c + off + 3, r + 3), (c + off + bw - 3, r + 3)], fill=(186, 188, 192, 110), width=1)
    # Mossy / damp bottom staining
    for y in range(int(size * 0.72), size):
        a = int(((y - size * 0.72) / (size * 0.28)) * 75)
        draw.line([(0, y), (size, y)], fill=(78, 92, 66, a))
    return img


def make_wood_slats_tex(base=(134, 92, 60), dark=(74, 48, 30), vertical=True, size=256):
    img = Image.new("RGBA", (size, size), base + (255,))
    draw = ImageDraw.Draw(img)
    step = 18
    for p in range(0, size, step):
        v = int((hash01(p * 5.3) - 0.5) * 22)
        c = tuple(max(0, min(255, base[k] + v)) for k in range(3)) + (255,)
        if vertical:
            draw.rectangle([p, 0, p + step - 3, size], fill=c)
            draw.rectangle([p + step - 3, 0, p + step, size], fill=dark + (255,))
            draw.line([(p + 2, 0), (p + 2, size)], fill=(255, 232, 200, 38), width=1)
        else:
            draw.rectangle([0, p, size, p + step - 3], fill=c)
            draw.rectangle([0, p + step - 3, size, p + step], fill=dark + (255,))
    return img


def make_machiya_koshi_tex(size=256):
    # Traditional Kyoto vertical wood lattice over warm interior shoji paper
    img = Image.new("RGBA", (size, size), (236, 222, 192, 255))
    draw = ImageDraw.Draw(img)
    # Warm interior gradient glow
    for y in range(size):
        t = y / size
        c = (int(242 - t * 32), int(224 - t * 36), int(182 - t * 38), 255)
        draw.line([(0, y), (size, y)], fill=c)
    for x in range(0, size, 14):
        draw.rectangle([x, 0, x + 5, size], fill=(64, 42, 28, 255))
    for y in range(0, size, 64):
        draw.rectangle([0, y, size, y + 6], fill=(56, 36, 24, 255))
    return img


def make_ac_unit_tex(size=256):
    img = Image.new("RGBA", (size, size), (218, 218, 214, 255))
    draw = ImageDraw.Draw(img)
    draw.rectangle([4, 4, size - 4, size - 4], outline=(140, 142, 146, 255), width=4)
    # Circular fan grille on left
    cx, cy, r = int(size * 0.38), int(size * 0.52), int(size * 0.34)
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(48, 52, 58, 255), outline=(120, 124, 130, 255), width=4)
    for k in range(3):
        ang = k * 2.09 + 0.4
        x2, y2 = cx + int(math.cos(ang) * r * 0.8), cy + int(math.sin(ang) * r * 0.8)
        draw.line([(cx, cy), (x2, y2)], fill=(72, 78, 86, 255), width=14)
    for rr in [int(r * 0.35), int(r * 0.65), int(r * 0.92)]:
        draw.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=(156, 160, 166, 210), width=2)
    for y in range(cy - r, cy + r, 11):
        draw.line([(cx - r, y), (cx + r, y)], fill=(156, 160, 166, 145), width=2)
    # Right side brand panel & vent
    draw.rectangle([int(size * 0.78), 32, size - 18, 56], fill=(68, 92, 134, 255))
    draw.rectangle([int(size * 0.78), 160, size - 18, 224], fill=(176, 178, 176, 255), outline=(128, 130, 134, 255), width=2)
    return img


def make_glass_window_tex(size=256):
    img = Image.new("RGBA", (size, size), (62, 84, 110, 255))
    draw = ImageDraw.Draw(img)
    # Sky-to-warm-interior anime window reflection
    for y in range(size):
        t = y / size
        r = int(112 * (1 - t) + 64 * t)
        g = int(152 * (1 - t) + 76 * t)
        b = int(188 * (1 - t) + 96 * t)
        draw.line([(0, y), (size, y)], fill=(r, g, b, 255))
    # Subtle diagonal anime glass sheen
    draw.polygon([(20, 0), (96, 0), (30, size), (0, size)], fill=(235, 245, 255, 62))
    draw.polygon([(120, 0), (146, 0), (80, size), (56, size)], fill=(255, 248, 228, 42))
    # Interior curtain silhouette
    draw.rectangle([0, 0, 34, size], fill=(232, 222, 204, 100))
    draw.rectangle([size - 34, 0, size, size], fill=(232, 222, 204, 100))
    # Dark aluminum window mullions
    draw.rectangle([0, 0, size - 1, size - 1], outline=(58, 56, 54, 255), width=10)
    draw.line([(size // 2, 0), (size // 2, size)], fill=(58, 56, 54, 255), width=8)
    return img


def make_vending_tex(size=256):
    img = Image.new("RGBA", (size, size), (242, 240, 236, 255))
    draw = ImageDraw.Draw(img)
    # Upper illuminated drink showcase
    draw.rectangle([14, 14, size - 14, int(size * 0.56)], fill=(255, 252, 238, 255), outline=(140, 152, 168, 255), width=4)
    drink_cols = [(220, 56, 64), (48, 132, 212), (76, 178, 92), (242, 168, 48), (236, 118, 156), (92, 196, 218)]
    for row in range(3):
        ry = 24 + row * 40
        draw.rectangle([18, ry + 26, size - 18, ry + 34], fill=(224, 224, 228, 255))
        for col in range(8):
            cx = 26 + col * 26
            dc = drink_cols[(row * 5 + col) % len(drink_cols)]
            draw.rounded_rectangle([cx, ry + 2, cx + 16, ry + 25], radius=3, fill=dc + (255,))
            draw.rectangle([cx + 2, ry + 8, cx + 14, ry + 14], fill=(255, 255, 255, 190))
            # Tiny price button
            draw.rectangle([cx + 2, ry + 28, cx + 14, ry + 32], fill=(230, 72, 62, 255) if col % 3 == 0 else (46, 126, 216, 255))
    # Middle accent strip & coin panel
    draw.rectangle([14, int(size * 0.59), size - 14, int(size * 0.67)], fill=(48, 108, 186, 255))
    draw.rectangle([184, int(size * 0.60), 232, int(size * 0.66)], fill=(42, 46, 54, 255))
    # Pickup flap at bottom
    draw.rounded_rectangle([24, int(size * 0.72), size - 24, int(size * 0.90)], radius=6, fill=(52, 58, 66, 255), outline=(168, 172, 178, 255), width=3)
    return img


def make_bark_tex(base=(94, 68, 48), size=256):
    img = Image.new("RGBA", (size, size), base + (255,))
    draw = ImageDraw.Draw(img)
    for i in range(180):
        x = int(hash01(i * 4.1) * size)
        w = int(2 + hash01(i * 2.9) * 5)
        d = int((hash01(i * 6.7) - 0.5) * 38)
        c = tuple(max(0, min(255, base[k] + d)) for k in range(3)) + (210,)
        draw.rectangle([x, 0, x + w, size], fill=c)
    return img


def make_leaf_cluster_tex(palette, size=256):
    """Hand-painted Ghibli alpha-cutout foliage frond sprite."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = size * 0.5, size * 0.5
    # Back shadowed leaves -> midtone leaves -> bright sunlit tip leaves
    for layer, col in enumerate(palette):
        count = 46 if layer < 2 else 34
        for i in range(count):
            seed = layer * 100 + i
            ang = hash01(seed * 3.1 + 0.7) * math.tau
            dist = (hash01(seed * 5.9 + 1.3) ** 0.62) * (size * 0.36)
            lx = cx + math.cos(ang) * dist
            ly = cy + math.sin(ang) * dist - layer * 5
            rx = (13 + hash01(seed * 7.3) * 14) * (1.0 - layer * 0.08)
            ry = rx * (0.62 + hash01(seed * 2.7) * 0.28)
            v = int((hash01(seed * 9.1) - 0.5) * 18)
            c = tuple(max(0, min(255, col[k] + v)) for k in range(3)) + (255,)
            draw.ellipse([lx - rx, ly - ry, lx + rx, ly + ry], fill=c)
    return img


# ---------------------------------------------------------------------------
# 2. Minimal Spec-Compliant glTF 2.0 Binary (.glb) Builder
# ---------------------------------------------------------------------------
class GLBBuilder:
    def __init__(self):
        self.materials = []
        self.textures = []
        self.images = []
        self.primitives = {}  # mat_idx -> {pos, norm, uv, col, idx}

    def add_material(self, name, base_color=(1, 1, 1, 1), img_pil=None, roughness=0.8, metallic=0.02,
                     emissive=None, alpha_mask=False, double_sided=False):
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
            img_idx = len(self.images)
            self.images.append(png_bytes(img_pil))
            tex_idx = len(self.textures)
            self.textures.append({"source": img_idx, "sampler": 0})
            mat["pbrMetallicRoughness"]["baseColorTexture"] = {"index": tex_idx}
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
            p["norm"].extend(n if isinstance(n[0], (int, float)) else n)
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

    def add_box(self, mat_idx, cx, cy, cz, w, h, d, rx=0, ry=0, rz=0, ao_bot=0.82, ao_top=1.0, uv_scale=1.0):
        hw, hh, hd = w * 0.5, h * 0.5, d * 0.5
        c_bot = (ao_bot, ao_bot, min(1.0, ao_bot + 0.04))
        c_top = (ao_top, ao_top, ao_top)
        faces = [
            # +Z front
            (((-hw, -hh, hd), (hw, -hh, hd), (hw, hh, hd), (-hw, hh, hd)), (0, 0, 1), w * uv_scale, h * uv_scale, (c_bot, c_bot, c_top, c_top)),
            # -Z back
            (((hw, -hh, -hd), (-hw, -hh, -hd), (-hw, hh, -hd), (hw, hh, -hd)), (0, 0, -1), w * uv_scale, h * uv_scale, (c_bot, c_bot, c_top, c_top)),
            # +X right
            (((hw, -hh, hd), (hw, -hh, -hd), (hw, hh, -hd), (hw, hh, hd)), (1, 0, 0), d * uv_scale, h * uv_scale, (c_bot, c_bot, c_top, c_top)),
            # -X left
            (((-hw, -hh, -hd), (-hw, -hh, hd), (-hw, hh, hd), (-hw, hh, -hd)), (-1, 0, 0), d * uv_scale, h * uv_scale, (c_bot, c_bot, c_top, c_top)),
            # +Y top
            (((-hw, hh, hd), (hw, hh, hd), (hw, hh, -hd), (-hw, hh, -hd)), (0, 1, 0), w * uv_scale, d * uv_scale, (c_top, c_top, c_top, c_top)),
            # -Y bottom
            (((-hw, -hh, -hd), (hw, -hh, -hd), (hw, -hh, hd), (-hw, -hh, hd)), (0, -1, 0), w * uv_scale, d * uv_scale, (c_bot, c_bot, c_bot, c_bot)),
        ]
        for verts, norm, uw, uh, cols in faces:
            tv = []
            for v in verts:
                rv = self._rot_pt(v, rx, ry, rz)
                tv.append((rv[0] + cx, rv[1] + cy, rv[2] + cz))
            rn = self._rot_pt(norm, rx, ry, rz)
            uvs = [(0, uh), (uw, uh), (uw, 0), (0, 0)]
            self.add_quad(mat_idx, tv[0], tv[1], tv[2], tv[3], rn, uvs, cols)

    def add_cylinder(self, mat_idx, cx, cy, cz, r_bot, r_top, h, segs=10, rx=0, ry=0, rz=0, ao_bot=0.78, ao_top=1.0):
        hh = h * 0.5
        c_bot = (ao_bot, ao_bot, min(1.0, ao_bot + 0.04))
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
            u0, u1 = i / segs, (i + 1) / segs
            self.add_quad(mat_idx, tv[0], tv[1], tv[2], tv[3], rn, [(u0, 1), (u1, 1), (u1, 0), (u0, 0)], (c_bot, c_bot, c_top, c_top))
        # Top cap
        p_center = self._rot_pt((0, hh, 0), rx, ry, rz)
        p_center = (p_center[0] + cx, p_center[1] + cy, p_center[2] + cz)
        rn_top = self._rot_pt((0, 1, 0), rx, ry, rz)
        for i in range(segs):
            a0 = (i / segs) * math.tau
            a1 = ((i + 1) / segs) * math.tau
            v0 = self._rot_pt((math.cos(a1) * r_top, hh, math.sin(a1) * r_top), rx, ry, rz)
            v1 = self._rot_pt((math.cos(a0) * r_top, hh, math.sin(a0) * r_top), rx, ry, rz)
            self.add_tri(
                mat_idx, p_center,
                (v0[0] + cx, v0[1] + cy, v0[2] + cz),
                (v1[0] + cx, v1[1] + cy, v1[2] + cz),
                rn_top, [(0.5, 0.5), (1, 0), (0, 0)], (c_top, c_top, c_top)
            )

    def add_gable_roof(self, mat_tile, mat_wall, mat_trim, cx, y_base, cz, w, d, ridge_h, overhang=0.65):
        """Authentic Japanese overhanging gabled kawara tile roof (ridge along X)."""
        hw = w * 0.5 + overhang
        hd = d * 0.5 + overhang
        slope_len = math.hypot(hd, ridge_h)
        ang = math.atan2(ridge_h, hd)
        thick = 0.16
        # Front slope (+Z) & back slope (-Z)
        for sign in (1, -1):
            scz = cz + sign * (hd * 0.5)
            scy = y_base + ridge_h * 0.5
            self.add_box(mat_tile, cx, scy, scz, hw * 2.0, thick, slope_len + 0.15, rx=sign * ang, ao_bot=0.86, ao_top=1.0, uv_scale=0.38)
            # Rain gutter along bottom eave
            self.add_box(mat_trim, cx, y_base - 0.05, cz + sign * (hd + 0.04), hw * 2.04, 0.12, 0.14, ao_bot=0.75, ao_top=0.92)
        # Ridge tile beam (mune-gawara)
        self.add_box(mat_trim, cx, y_base + ridge_h + 0.12, cz, hw * 2.04, 0.26, 0.34, ao_bot=0.82, ao_top=1.0)
        # Triangular stucco gable ends (+X and -X)
        wh = w * 0.5
        dh = d * 0.5
        for sign in (1, -1):
            gx = cx + sign * wh
            v0 = (gx, y_base, cz - dh)
            v1 = (gx, y_base, cz + dh)
            v2 = (gx, y_base + ridge_h, cz)
            if sign > 0:
                self.add_tri(mat_wall, v0, v1, v2, (1, 0, 0), [(0, 1), (1, 1), (0.5, 0)], ((0.88, 0.88, 0.9), (0.88, 0.88, 0.9), (0.8, 0.8, 0.84)))
            else:
                self.add_tri(mat_wall, v1, v0, v2, (-1, 0, 0), [(0, 1), (1, 1), (0.5, 0)], ((0.88, 0.88, 0.9), (0.88, 0.88, 0.9), (0.8, 0.8, 0.84)))

    def add_leaf_frond(self, mat_idx, cx, cy, cz, size, rx, ry, rz, canopy_center):
        """Crossed alpha-cutout anime leaf cards with smooth radial canopy normals!"""
        hs = size * 0.5
        # Outward radial normal from canopy center -> soft Ghibli cel-shading across whole crown!
        nx = cx - canopy_center[0]
        ny = (cy - canopy_center[1]) * 1.15 + 0.65
        nz = cz - canopy_center[2]
        nl = math.hypot(nx, ny, nz) or 1.0
        n = (nx / nl, ny / nl, nz / nl)
        # Subtle vertex tint: sunlit warm top vs cool blue-green underside
        t_up = max(0.0, min(1.0, (ny / nl + 0.7) * 0.65))
        c = (0.78 + t_up * 0.22, 0.82 + t_up * 0.18, 0.88 + t_up * 0.12)
        for cross_ry in (ry, ry + math.pi * 0.52):
            pts = [(-hs, -hs, 0), (hs, -hs, 0), (hs, hs, 0), (-hs, hs, 0)]
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

        # Pack embedded PNG images first
        gltf_images = []
        for png in self.images:
            bv = add_view(png)
            gltf_images.append({"bufferView": bv, "mimeType": "image/png"})

        # Pack mesh primitives
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
                    acc["min"] = mn
                    acc["max"] = mx
                ai = len(accessors)
                accessors.append(acc)
                return ai

            a_pos = add_acc(pos_raw, 5126, "VEC3", vcount, 34962, pmin, pmax)
            a_norm = add_acc(norm_raw, 5126, "VEC3", vcount, 34962)
            a_uv = add_acc(uv_raw, 5126, "VEC2", vcount, 34962)
            a_col = add_acc(col_raw, 5126, "VEC3", vcount, 34962)
            a_idx = add_acc(idx_raw, 5125 if use_u32 else 5123, "SCALAR", len(p["idx"]), 34963)

            gltf_prims.append({
                "attributes": {"POSITION": a_pos, "NORMAL": a_norm, "TEXCOORD_0": a_uv, "COLOR_0": a_col},
                "indices": a_idx,
                "material": mat_idx,
            })

        while len(bin_chunks) % 4 != 0:
            bin_chunks.append(0)

        gltf = {
            "asset": {"version": "2.0", "generator": "LailaSalma-HD-Builder"},
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
# 3. Sculpt Each Shinkai / Ghibli HD .glb Model
# ---------------------------------------------------------------------------
def build_tokyo_house_2f():
    """Makoto Shinkai / Ghibli 2-Story Japanese Neighborhood Home."""
    b = GLBBuilder()
    m_wall = b.add_material("stucco", (1, 1, 1, 1), make_stucco_tex((234, 224, 208)), roughness=0.84)
    m_tile = b.add_material("kawara", (1, 1, 1, 1), make_kawara_roof_tex((70, 76, 92)), roughness=0.46, metallic=0.08)
    m_trim = b.add_material("trim_dark", (0.24, 0.25, 0.30, 1), roughness=0.58)
    m_wood = b.add_material("cedar_wood", (1, 1, 1, 1), make_wood_slats_tex((136, 92, 58), (74, 48, 30)), roughness=0.72)
    m_shutter = b.add_material("amado", (1, 1, 1, 1), make_wood_slats_tex((156, 114, 72), (88, 60, 36), vertical=False), roughness=0.72)
    m_glass = b.add_material("window_glass", (1, 1, 1, 1), make_glass_window_tex(), roughness=0.14, metallic=0.22)
    m_block = b.add_material("cinderblock", (1, 1, 1, 1), make_cinderblock_tex(), roughness=0.90)
    m_ac = b.add_material("ac_unit", (1, 1, 1, 1), make_ac_unit_tex(), roughness=0.42, metallic=0.25)
    m_mailbox = b.add_material("red_mailbox", (0.76, 0.22, 0.18, 1), roughness=0.38, metallic=0.18)
    m_pot = b.add_material("terracotta", (0.72, 0.42, 0.28, 1), roughness=0.82)
    m_leaf = b.add_material("garden_leaf", (1, 1, 1, 1), make_leaf_cluster_tex([(48, 92, 42), (76, 134, 54), (138, 184, 72)]), roughness=0.72, alpha_mask=True, double_sided=True)

    # Concrete plinth foundation + 1F & 2F stucco body (front faces +Z)
    b.add_box(m_block, 0, 0.22, 0, 7.1, 0.44, 6.1, uv_scale=0.45)
    b.add_box(m_wall, 0, 1.85, 0, 6.9, 2.85, 5.9, ao_bot=0.78, ao_top=0.92, uv_scale=0.35)
    b.add_box(m_wall, 0, 4.55, -0.15, 6.85, 2.6, 5.6, ao_bot=0.84, ao_top=0.88, uv_scale=0.35)

    # Intermediate tiled eave (hisashi) between 1F and 2F
    b.add_box(m_tile, 0, 3.24, 3.35, 7.45, 0.14, 1.05, rx=0.28, uv_scale=0.42)
    b.add_box(m_trim, 0, 3.08, 3.85, 7.5, 0.1, 0.12)

    # Overhanging gabled kawara tile roof
    b.add_gable_roof(m_tile, m_wall, m_trim, 0, 5.82, -0.15, 6.85, 5.6, 2.05, overhang=0.72)

    # 1F Front sliding wooden/glass door + recessed porch awning + side window with wooden rain shutter
    b.add_box(m_wood, -1.55, 1.38, 2.98, 1.55, 2.32, 0.14)
    b.add_box(m_glass, -1.55, 1.62, 3.04, 1.18, 1.25, 0.05)
    b.add_box(m_block, -1.55, 0.12, 3.35, 1.85, 0.24, 0.85)
    b.add_box(m_glass, 1.55, 1.72, 2.98, 1.85, 1.32, 0.12)
    b.add_box(m_shutter, 2.75, 1.72, 3.02, 0.65, 1.34, 0.10)  # wooden amado shutter box!

    # 2F Cantilevered Balcony with wooden posts & horizontal handrail (classic Shinkai silhouette!)
    b.add_box(m_block, -1.2, 3.34, 3.38, 3.65, 0.22, 1.42)
    b.add_box(m_wood, -1.2, 4.38, 4.04, 3.68, 0.10, 0.12)
    b.add_box(m_wood, -1.2, 3.86, 4.04, 3.65, 0.08, 0.08)
    for bx in (-2.95, -2.1, -1.2, -0.3, 0.55):
        b.add_box(m_wood, bx, 3.88, 4.04, 0.09, 1.05, 0.09)
    for bz in (3.0, 3.55):
        b.add_box(m_wood, -2.95, 4.38, bz, 0.10, 0.10, 0.65)
        b.add_box(m_wood, 0.55, 4.38, bz, 0.10, 0.10, 0.65)
    # Balcony glass door
    b.add_box(m_glass, -1.2, 4.46, 2.68, 2.15, 2.02, 0.12)

    # 2F Right Window + Wooden Shutter + Wall-Mounted AC Condenser Unit!
    b.add_box(m_glass, 1.95, 4.72, 2.68, 1.48, 1.24, 0.12)
    b.add_box(m_shutter, 1.0, 4.72, 2.72, 0.55, 1.26, 0.10)
    b.add_box(m_ac, 2.15, 3.74, 2.95, 0.92, 0.66, 0.42)
    b.add_box(m_trim, 1.75, 3.40, 2.92, 0.08, 0.08, 0.45)  # steel AC brackets
    b.add_box(m_trim, 2.55, 3.40, 2.92, 0.08, 0.08, 0.45)

    # Side windows (+X and -X)
    for sx in (-3.48, 3.48):
        b.add_box(m_glass, sx, 1.8, 0.2, 0.12, 1.25, 1.5)
        b.add_box(m_glass, sx, 4.65, -0.2, 0.12, 1.2, 1.5)
    # Vertical rain downspout pipe
    b.add_cylinder(m_trim, 3.46, 2.95, 2.94, 0.05, 0.05, 5.7, segs=6)

    # Front Cinderblock Garden Wall (block-bei), Wooden Gate, Red Mailbox & Potted Plants!
    b.add_box(m_block, 1.75, 0.72, 4.18, 3.85, 1.44, 0.26, uv_scale=0.55)
    b.add_box(m_trim, 1.75, 1.48, 4.18, 3.92, 0.10, 0.32)
    b.add_box(m_block, -3.1, 0.72, 4.18, 1.2, 1.44, 0.26, uv_scale=0.55)
    b.add_box(m_trim, -3.1, 1.48, 4.18, 1.28, 0.10, 0.32)
    # Wooden slatted garden gate between wall pillars
    b.add_box(m_wood, -1.35, 0.66, 4.18, 1.9, 1.25, 0.10)
    # Red Japanese mailbox mounted beside gate
    b.add_box(m_mailbox, -0.05, 1.12, 4.36, 0.34, 0.44, 0.18)
    # Terracotta potted plants & lush anime leaf-card greenery spilling over garden wall!
    for px, py, pz, pr in [(0.65, 0.22, 4.55, 0.22), (1.15, 0.20, 4.58, 0.19), (-2.65, 0.24, 4.52, 0.24)]:
        b.add_cylinder(m_pot, px, py, pz, pr * 0.75, pr, 0.40, segs=8)
        b.add_leaf_frond(m_leaf, px, py + 0.45, pz, 0.72, 0.1, px * 1.4, 0.0, (px, py + 0.3, pz))
    # Lush garden foliage peeking behind cinderblock wall
    for lx, ly, lz, ls in [(2.1, 1.85, 3.7, 1.45), (2.95, 1.65, 3.75, 1.25), (1.35, 1.6, 3.65, 1.15)]:
        b.add_leaf_frond(m_leaf, lx, ly, lz, ls, 0.15, lx, 0.08, (2.2, 1.5, 3.7))

    b.save_glb(os.path.join(OUT_DIR, "tokyo_house_2f.glb"))


def build_tokyo_house_1f():
    """Cozy 1-Story Ghibli Japanese Cottage with overhanging gabled eaves & planters."""
    b = GLBBuilder()
    m_wall = b.add_material("stucco_1f", (1, 1, 1, 1), make_stucco_tex((238, 230, 214)), roughness=0.84)
    m_tile = b.add_material("kawara_1f", (1, 1, 1, 1), make_kawara_roof_tex((68, 86, 78)), roughness=0.46, metallic=0.08)
    m_trim = b.add_material("trim_1f", (0.26, 0.24, 0.22, 1), roughness=0.6)
    m_wood = b.add_material("wood_1f", (1, 1, 1, 1), make_wood_slats_tex((142, 98, 62), (76, 50, 32)), roughness=0.74)
    m_glass = b.add_material("glass_1f", (1, 1, 1, 1), make_glass_window_tex(), roughness=0.14, metallic=0.22)
    m_block = b.add_material("plinth_1f", (1, 1, 1, 1), make_cinderblock_tex(), roughness=0.9)
    m_ac = b.add_material("ac_1f", (1, 1, 1, 1), make_ac_unit_tex(), roughness=0.42, metallic=0.25)
    m_leaf = b.add_material("leaf_1f", (1, 1, 1, 1), make_leaf_cluster_tex([(52, 98, 44), (84, 144, 58), (144, 190, 76)]), roughness=0.72, alpha_mask=True, double_sided=True)

    b.add_box(m_block, 0, 0.22, 0, 6.4, 0.44, 5.4, uv_scale=0.45)
    b.add_box(m_wall, 0, 1.92, 0, 6.2, 3.0, 5.2, ao_bot=0.78, ao_top=0.92, uv_scale=0.35)
    b.add_gable_roof(m_tile, m_wall, m_trim, 0, 3.4, 0, 6.2, 5.2, 1.85, overhang=0.75)

    # Wooden engawa step + sliding entry + cozy shuttered window
    b.add_box(m_wood, -0.9, 0.28, 2.88, 3.8, 0.22, 0.65)
    b.add_box(m_wood, -1.35, 1.45, 2.63, 1.48, 2.25, 0.14)
    b.add_box(m_glass, -1.35, 1.65, 2.69, 1.1, 1.25, 0.05)
    b.add_box(m_glass, 1.25, 1.82, 2.63, 1.95, 1.32, 0.12)
    b.add_box(m_ac, 2.75, 0.72, 2.82, 0.85, 0.62, 0.40)

    # Wooden planter box & leafy garden greenery along front
    b.add_box(m_wood, 1.25, 0.35, 3.05, 1.8, 0.45, 0.45)
    for lx in (0.7, 1.25, 1.8):
        b.add_leaf_frond(m_leaf, lx, 0.82, 3.05, 0.85, 0.15, lx * 2.1, 0.0, (1.25, 0.7, 3.05))
    b.save_glb(os.path.join(OUT_DIR, "tokyo_house_1f.glb"))


def build_kyoto_machiya():
    """Traditional Kyoto 2-Story Machiya Townhouse with Kōshi wood lattice & double kawara eaves."""
    b = GLBBuilder()
    m_koshi = b.add_material("koshi", (1, 1, 1, 1), make_machiya_koshi_tex(), roughness=0.72)
    m_wall = b.add_material("kyoto_plaster", (1, 1, 1, 1), make_stucco_tex((232, 222, 200)), roughness=0.86)
    m_tile = b.add_material("kyoto_tile", (1, 1, 1, 1), make_kawara_roof_tex((54, 58, 68)), roughness=0.45, metallic=0.1)
    m_wood = b.add_material("dark_cedar", (1, 1, 1, 1), make_wood_slats_tex((82, 54, 36), (48, 30, 20)), roughness=0.74)
    m_glow = b.add_material("shoji_glow", (1.0, 0.92, 0.72, 1), roughness=0.4, emissive=(0.75, 0.54, 0.24))
    m_stone = b.add_material("stone_base", (1, 1, 1, 1), make_cinderblock_tex(), roughness=0.9)

    b.add_box(m_stone, 0, 0.2, 0, 6.8, 0.4, 5.8, uv_scale=0.45)
    b.add_box(m_koshi, 0, 1.6, 0, 6.6, 2.45, 5.6, ao_bot=0.78, ao_top=0.88, uv_scale=0.45)
    b.add_box(m_wall, 0, 3.85, 0, 6.45, 2.15, 5.45, ao_bot=0.84, ao_top=0.90, uv_scale=0.35)
    # Lower overhanging tiled hisashi eave
    b.add_box(m_tile, 0, 2.86, 3.25, 7.25, 0.14, 1.15, rx=0.30, uv_scale=0.4)
    b.add_box(m_wood, 0, 2.68, 3.78, 7.3, 0.12, 0.14)
    # Upper overhanging gabled kawara roof
    b.add_gable_roof(m_tile, m_wall, m_wood, 0, 4.90, 0, 6.45, 5.45, 1.95, overhang=0.78)
    # Sliding wooden entry door & warm glowing upper mushiko-mado windows
    b.add_box(m_wood, 0, 1.32, 2.83, 1.6, 2.15, 0.14)
    for wx in (-1.55, 1.55):
        b.add_box(m_glow, wx, 3.92, 2.75, 1.48, 1.05, 0.10)
        for sx in (-0.45, 0, 0.45):
            b.add_box(m_wood, wx + sx, 3.92, 2.81, 0.08, 1.08, 0.06)
    b.save_glb(os.path.join(OUT_DIR, "kyoto_machiya.glb"))


def build_anime_tree(filename, leaf_palette, bark_color=(92, 66, 48), seed_offset=0):
    """Sculpted branching trunk + 54 layered alpha-cutout Ghibli leaf-card clusters!"""
    b = GLBBuilder()
    m_bark = b.add_material("bark", (1, 1, 1, 1), make_bark_tex(bark_color), roughness=0.88)
    m_leaf = b.add_material("foliage", (1, 1, 1, 1), make_leaf_cluster_tex(leaf_palette), roughness=0.68, alpha_mask=True, double_sided=True)

    # Gently curved tapered trunk + 4 sculpted main branches
    b.add_cylinder(m_bark, 0, 0.95, 0, 0.36, 0.26, 1.95, segs=9, rx=0.04, rz=-0.03)
    b.add_cylinder(m_bark, -0.06, 2.45, 0.06, 0.26, 0.16, 1.35, segs=8, rx=-0.05, rz=0.06)
    branches = [
        (-0.72, 3.15, 0.35, 0.15, 0.07, 1.45, 0.25, 0.58),
        (0.75, 3.25, -0.28, 0.14, 0.07, 1.45, -0.22, -0.56),
        (0.18, 3.35, 0.65, 0.13, 0.06, 1.25, 0.52, -0.15),
        (-0.22, 3.45, -0.62, 0.13, 0.06, 1.25, -0.48, 0.22),
    ]
    for br in branches:
        b.add_cylinder(m_bark, br[0], br[1], br[2], br[3], br[4], br[5], segs=7, rx=br[6], rz=br[7])

    # Lush sculpted layered anime leaf-card cloud (zero blocky spheres!)
    canopy_center = (0.0, 4.15, 0.0)
    lobes = [
        (0.0, 4.65, 0.0, 1.55, 14),
        (-1.15, 3.85, 0.55, 1.25, 11),
        (1.18, 3.95, -0.45, 1.28, 11),
        (0.32, 4.15, 1.05, 1.15, 9),
        (-0.42, 4.25, -0.95, 1.15, 9),
    ]
    idx = 0
    for lx, ly, lz, lrad, count in lobes:
        for k in range(count):
            s = seed_offset * 300 + idx
            idx += 1
            theta = hash01(s * 3.7 + 0.5) * math.tau
            phi = (hash01(s * 5.3 + 1.1) - 0.42) * 1.45
            rr = (0.35 + hash01(s * 7.1) * 0.65) * lrad
            fx = lx + math.cos(theta) * math.cos(phi) * rr
            fy = ly + math.sin(phi) * rr * 0.8
            fz = lz + math.sin(theta) * math.cos(phi) * rr
            fsize = 1.25 + hash01(s * 9.3) * 0.68
            b.add_leaf_frond(m_leaf, fx, fy, fz, fsize,
                             (hash01(s * 2.1) - 0.5) * 0.55,
                             hash01(s * 4.3) * math.tau,
                             (hash01(s * 6.7) - 0.5) * 0.45,
                             canopy_center)
    b.save_glb(os.path.join(OUT_DIR, filename))


def build_anime_shrub():
    """Sculpted multi-layer Ghibli leaf-card garden bush."""
    b = GLBBuilder()
    m_leaf = b.add_material("shrub_leaf", (1, 1, 1, 1),
                            make_leaf_cluster_tex([(38, 84, 38), (68, 132, 50), (138, 192, 68)]),
                            roughness=0.70, alpha_mask=True, double_sided=True)
    center = (0, 0.55, 0)
    for i in range(18):
        ang = hash01(i * 4.3 + 1.1) * math.tau
        rad = hash01(i * 6.7 + 0.4) * 0.58
        fx = math.cos(ang) * rad
        fy = 0.36 + hash01(i * 2.9) * 0.48
        fz = math.sin(ang) * rad
        b.add_leaf_frond(m_leaf, fx, fy, fz, 0.78 + hash01(i * 8.1) * 0.36,
                         (hash01(i * 3.1) - 0.5) * 0.4,
                         hash01(i * 5.7) * math.tau, 0.0, center)
    b.save_glb(os.path.join(OUT_DIR, "anime_shrub.glb"))


def build_utility_pole():
    """Authentic Japanese Concrete Utility Pole with crossarms, insulators, transformer & gooseneck lamp."""
    b = GLBBuilder()
    m_conc = b.add_material("pole_concrete", (1, 1, 1, 1), make_cinderblock_tex(), roughness=0.88)
    m_metal = b.add_material("pole_metal", (0.28, 0.30, 0.34, 1), roughness=0.45, metallic=0.55)
    m_insul = b.add_material("ceramic", (0.92, 0.92, 0.90, 1), roughness=0.22, metallic=0.05)
    m_lamp = b.add_material("lamp_glow", (1.0, 0.94, 0.76, 1), roughness=0.2, emissive=(1.0, 0.84, 0.48))
    m_sign_r = b.add_material("sign_red", (0.78, 0.22, 0.22, 1), roughness=0.4)
    m_sign_b = b.add_material("sign_blue", (0.16, 0.34, 0.62, 1), roughness=0.4)

    # Tapered concrete pole (height 8.2m)
    b.add_cylinder(m_conc, 0, 4.1, 0, 0.20, 0.12, 8.2, segs=10)
    # Upper steel crossarms + white ceramic insulators (attachment points for catenary power lines!)
    for y_arm, w_arm in [(7.55, 1.85), (6.75, 1.55)]:
        b.add_box(m_metal, 0, y_arm, 0, w_arm, 0.09, 0.09)
        for ix in (-w_arm * 0.42, 0.0, w_arm * 0.42):
            b.add_cylinder(m_insul, ix, y_arm + 0.11, 0, 0.055, 0.045, 0.14, segs=7)
    # Cylindrical grey pole transformer drum
    b.add_cylinder(m_metal, -0.34, 5.75, 0.0, 0.24, 0.24, 0.85, segs=10)
    # Angled gooseneck streetlamp arm (+X toward street)
    b.add_box(m_metal, 0.58, 5.15, 0, 1.25, 0.06, 0.06, rz=0.22)
    b.add_box(m_metal, 1.15, 5.32, 0, 0.38, 0.09, 0.22)
    b.add_box(m_lamp, 1.15, 5.25, 0, 0.30, 0.05, 0.16)
    # Iconic Japanese red/blue circular street sign mounted at pedestrian height
    b.add_cylinder(m_sign_r, 0.32, 3.15, 0.04, 0.28, 0.28, 0.04, segs=14, rx=math.pi / 2)
    b.add_cylinder(m_sign_b, 0.32, 3.15, 0.05, 0.21, 0.21, 0.04, segs=14, rx=math.pi / 2)
    b.add_box(m_sign_r, 0.32, 3.15, 0.075, 0.40, 0.06, 0.02, rz=0.78)
    b.save_glb(os.path.join(OUT_DIR, "utility_pole.glb"))


def build_anime_vending():
    """Illuminated Japanese Street Vending Machine + Recycling Bin (matching reference street!)."""
    b = GLBBuilder()
    m_body = b.add_material("vm_shell", (0.92, 0.93, 0.95, 1), roughness=0.32, metallic=0.2)
    m_front = b.add_material("vm_front", (1, 1, 1, 1), make_vending_tex(), roughness=0.25, emissive=(0.24, 0.22, 0.18))
    m_bin = b.add_material("recycle_bin", (0.76, 0.78, 0.80, 1), roughness=0.55, metallic=0.2)
    m_hole = b.add_material("bin_hole", (0.16, 0.18, 0.20, 1), roughness=0.8)

    b.add_box(m_body, 0, 1.0, 0, 1.24, 2.0, 0.82)
    b.add_box(m_front, 0, 1.02, 0.42, 1.18, 1.92, 0.03)
    # Adjacent grey Japanese bottle recycling bin
    b.add_box(m_bin, -0.88, 0.44, 0.02, 0.46, 0.88, 0.48)
    b.add_cylinder(m_hole, -0.88, 0.68, 0.27, 0.09, 0.09, 0.04, segs=10, rx=math.pi / 2)
    b.save_glb(os.path.join(OUT_DIR, "anime_vending.glb"))


def build_anime_bike():
    """Detailed Japanese Mamachari City Bicycle with front basket & mudguards."""
    b = GLBBuilder()
    m_tire = b.add_material("tire", (0.16, 0.16, 0.18, 1), roughness=0.82)
    m_frame = b.add_material("frame_red", (0.72, 0.22, 0.24, 1), roughness=0.32, metallic=0.45)
    m_chrome = b.add_material("chrome", (0.82, 0.84, 0.86, 1), roughness=0.2, metallic=0.8)
    m_seat = b.add_material("leather", (0.36, 0.22, 0.14, 1), roughness=0.72)
    m_basket = b.add_material("basket", (0.58, 0.40, 0.24, 1), roughness=0.82)

    for wz in (-0.54, 0.54):
        b.add_cylinder(m_tire, 0, 0.34, wz, 0.33, 0.33, 0.06, segs=14, rz=math.pi / 2)
        b.add_cylinder(m_chrome, 0, 0.34, wz, 0.24, 0.24, 0.07, segs=14, rz=math.pi / 2)
    # Curved mamachari frame tubes
    b.add_cylinder(m_frame, 0, 0.54, -0.18, 0.025, 0.025, 0.78, segs=6, rx=1.22)
    b.add_cylinder(m_frame, 0, 0.58, 0.24, 0.025, 0.025, 0.72, segs=6, rx=-0.38)
    b.add_cylinder(m_frame, 0, 0.62, -0.45, 0.024, 0.024, 0.72, segs=6, rx=-0.22)
    b.add_cylinder(m_chrome, 0, 0.95, 0.42, 0.02, 0.02, 0.58, segs=6, rz=math.pi / 2)  # handlebars
    b.add_box(m_seat, 0, 0.86, -0.22, 0.16, 0.08, 0.26)
    b.add_box(m_basket, 0, 0.82, 0.58, 0.34, 0.24, 0.26)
    b.save_glb(os.path.join(OUT_DIR, "anime_bike.glb"))


if __name__ == "__main__":
    print("Generating sculpted Shinkai/Ghibli HD .glb assets into", OUT_DIR)
    build_tokyo_house_2f()
    build_tokyo_house_1f()
    build_kyoto_machiya()
    build_anime_tree("anime_tree_green.glb", [(36, 82, 38), (64, 128, 52), (132, 184, 72)], (88, 64, 46), seed_offset=1)
    build_anime_tree("anime_tree_sakura.glb", [(184, 118, 146), (242, 174, 198), (255, 224, 236)], (76, 52, 44), seed_offset=2)
    build_anime_tree("anime_tree_maple.glb", [(158, 48, 38), (218, 92, 44), (248, 168, 66)], (78, 52, 40), seed_offset=3)
    build_anime_shrub()
    build_utility_pole()
    build_anime_vending()
    build_anime_bike()
    print("All 10 HD .glb assets built successfully!")
