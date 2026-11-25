window.LailaSalma = window.LailaSalma || {};

(function (LS) {
  const texCache = {};

  LS.makeToonMat = function (color, opts) {
    const cfg = Object.assign({ color: color }, opts || {});
    return new THREE.MeshLambertMaterial(cfg);
  };

  LS.makeEmissiveMat = function (color, emissiveHex, intensity) {
    return new THREE.MeshLambertMaterial({
      color: color,
      emissive: emissiveHex !== undefined ? emissiveHex : color,
      emissiveIntensity: intensity !== undefined ? intensity : 0.72
    });
  };

  LS.createRoadTexture = function (style) {
    const key = 'road_' + (style || 'tokyo');
    if (texCache[key]) return texCache[key];

    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 512;
    const ctx = c.getContext('2d');

    if (style === 'kyoto') {
      ctx.fillStyle = '#53575d';
      ctx.fillRect(0, 0, 256, 512);
      for (let i = 0; i < 2000; i++) {
        const v = 72 + Math.floor(Math.random() * 24);
        ctx.fillStyle = 'rgba(' + v + ',' + v + ',' + (v + 4) + ',0.32)';
        ctx.fillRect(Math.random() * 256, Math.random() * 512, 2, 2);
      }
      ctx.fillStyle = '#eae5d6';
      ctx.fillRect(14, 0, 6, 512);
      ctx.fillRect(236, 0, 6, 512);
      ctx.fillStyle = '#e8d8b0';
      for (let y = 16; y < 512; y += 64) {
        ctx.fillRect(125, y, 6, 32);
      }
    } else {
      ctx.fillStyle = '#565b63';
      ctx.fillRect(0, 0, 256, 512);
      for (let i = 0; i < 2200; i++) {
        const v = 74 + Math.floor(Math.random() * 28);
        ctx.fillStyle = 'rgba(' + v + ',' + v + ',' + (v + 6) + ',0.35)';
        ctx.fillRect(Math.random() * 256, Math.random() * 512, 2, 2);
      }
      ctx.fillStyle = '#f2f0e6';
      ctx.fillRect(14, 0, 6, 512);
      ctx.fillRect(236, 0, 6, 512);
      ctx.fillStyle = '#f7e9c4';
      for (let y = 15; y < 512; y += 64) {
        ctx.fillRect(125, y, 6, 33);
      }
      ctx.strokeStyle = 'rgba(245, 242, 232, 0.88)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(78, 110);
      ctx.lineTo(98, 145);
      ctx.lineTo(78, 180);
      ctx.lineTo(58, 145);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = 'rgba(245, 242, 232, 0.88)';
      ctx.font = 'bold 23px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('止まれ', 178, 380);
      ctx.fillRect(140, 350, 75, 6);
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 6);
    texCache[key] = tex;
    return tex;
  };

  LS.createRoofTileTexture = function (baseHex) {
    const key = 'roof_' + (baseHex || '#445266');
    if (texCache[key]) return texCache[key];

    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = baseHex || '#445266';
    ctx.fillRect(0, 0, 256, 256);

    for (let y = 0; y < 256; y += 24) {
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(0, y, 256, 4);
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(0, y + 20, 256, 4);
      for (let x = 0; x < 256; x += 32) {
        ctx.strokeStyle = 'rgba(0,0,0,0.18)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + 16, y + 18, 16, 0, Math.PI);
        ctx.stroke();
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 2);
    texCache[key] = tex;
    return tex;
  };

  LS.createPlasterTexture = function (hex) {
    const key = 'plaster_' + (hex || '#f3ead8');
    if (texCache[key]) return texCache[key];

    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = hex || '#f3ead8';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1100; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.10)' : 'rgba(120,90,60,0.07)';
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 4, 3);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    texCache[key] = tex;
    return tex;
  };

  LS.createWoodLatticeTexture = function (woodHex, paperHex) {
    const key = 'lattice_' + (woodHex || '#4d3221') + '_' + (paperHex || '#f7ecd4');
    if (texCache[key]) return texCache[key];

    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = paperHex || '#f7ecd4';
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = woodHex || '#4d3221';
    for (let x = 0; x < 256; x += 24) {
      ctx.fillRect(x, 0, 6, 256);
    }
    for (let y = 0; y < 256; y += 64) {
      ctx.fillRect(0, y, 256, 7);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    texCache[key] = tex;
    return tex;
  };

  LS.createStonePathTexture = function () {
    if (texCache.stone_path) return texCache.stone_path;
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');
    // Blueprint matte dark earthy soil (#463b2d) + basalt/slate flagstones (#43413c..#5a544b)
    ctx.fillStyle = '#463b2d';
    ctx.fillRect(0, 0, 256, 256);

    const stones = [
      [14, 18, 68, 48], [94, 14, 72, 52], [178, 20, 64, 46],
      [20, 82, 82, 54], [114, 78, 66, 56], [190, 84, 54, 48],
      [12, 150, 64, 48], [88, 148, 86, 52], [184, 146, 60, 54],
      [22, 208, 92, 38], [126, 208, 114, 38]
    ];
    const palette = ['#43413c', '#4c4943', '#544f47', '#5a544b'];
    stones.forEach((s, idx) => {
      ctx.fillStyle = palette[idx % palette.length];
      ctx.fillRect(s[0], s[1], s[2], s[3]);
      ctx.strokeStyle = 'rgba(28, 22, 16, 0.45)';
      ctx.lineWidth = 3;
      ctx.strokeRect(s[0], s[1], s[2], s[3]);
    });

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 1);
    texCache.stone_path = tex;
    return tex;
  };

  LS.createCedarPlankTexture = function () {
    if (texCache.cedar_plank) return texCache.cedar_plank;
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#8b6343';
    ctx.fillRect(0, 0, 256, 256);
    for (let x = 0; x < 256; x += 28) {
      ctx.fillStyle = (x % 56 === 0) ? '#80593b' : '#946b49';
      ctx.fillRect(x, 0, 26, 256);
      ctx.fillStyle = '#4f3522';
      ctx.fillRect(x + 26, 0, 2, 256);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 1);
    texCache.cedar_plank = tex;
    return tex;
  };

  function hash01(n) {
    const v = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
    return v - Math.floor(v);
  }

  LS.createGrassTexture = function (style) {
    const key = 'grass_' + (style || 'tokyo');
    if (texCache[key]) return texCache[key];
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    const isKyoto = style === 'kyoto';
    ctx.fillStyle = isKyoto ? '#5d874b' : '#6ca656';
    ctx.fillRect(0, 0, 256, 256);

    // Seamless painterly Ghibli meadow/moss patches using hash scatter (zero linear banding!)
    const tones = isKyoto
      ? ['rgba(74,114,58,0.28)', 'rgba(118,150,82,0.24)', 'rgba(84,102,56,0.2)', 'rgba(136,162,90,0.18)']
      : ['rgba(90,148,70,0.28)', 'rgba(134,182,92,0.24)', 'rgba(80,132,62,0.22)', 'rgba(162,196,104,0.18)'];
    for (let i = 0; i < 220; i++) {
      ctx.fillStyle = tones[i % tones.length];
      const rx = hash01(i * 3.1 + 1.7) * 256;
      const ry = hash01(i * 5.7 + 9.3) * 256;
      const r = 10 + hash01(i * 7.3) * 18;
      // Wrap across tile edges so repeats are 100% seamless
      for (let ox = -256; ox <= 256; ox += 256) {
        if (rx + ox < -r || rx + ox > 256 + r) continue;
        for (let oy = -256; oy <= 256; oy += 256) {
          if (ry + oy < -r || ry + oy > 256 + r) continue;
          ctx.beginPath();
          ctx.arc(rx + ox, ry + oy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    // Delicate randomly scattered grass blades & tiny clover specks
    for (let i = 0; i < 420; i++) {
      ctx.fillStyle = i % 3 === 0 ? 'rgba(222,238,178,0.2)' : 'rgba(46,78,38,0.2)';
      const gx = hash01(i * 11.3 + 4.1) * 256;
      const gy = hash01(i * 17.9 + 2.3) * 256;
      ctx.fillRect(gx, gy, 2, 4);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(22, 22);
    texCache[key] = tex;
    return tex;
  };

  LS.createVillageLaneTexture = function (style) {
    const key = 'village_lane_' + (style || 'tokyo');
    if (texCache[key]) return texCache[key];
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    const isKyoto = style === 'kyoto';
    ctx.fillStyle = isKyoto ? '#847a6c' : '#a79e8d';
    ctx.fillRect(0, 0, 256, 256);
    // Soft stone/pebble dappling + gentle mossy verge along outer edges
    for (let i = 0; i < 650; i++) {
      const px = hash01(i * 4.3 + 1.1) * 256;
      const py = hash01(i * 6.9 + 7.7) * 256;
      const sz = 2 + hash01(i * 2.1) * 5;
      ctx.fillStyle = i % 3 === 0
        ? (isKyoto ? 'rgba(104,96,84,0.34)' : 'rgba(130,122,108,0.3)')
        : (isKyoto ? 'rgba(165,156,140,0.24)' : 'rgba(226,218,200,0.26)');
      ctx.fillRect(px, py, sz, sz * 0.8);
    }
    // Soft organic mossy shoulder fade on left & right sides (no hard painted stripes!)
    const gL = ctx.createLinearGradient(0, 0, 32, 0);
    gL.addColorStop(0, isKyoto ? 'rgba(84,116,66,0.68)' : 'rgba(106,154,82,0.58)');
    gL.addColorStop(1, 'rgba(106,154,82,0)');
    ctx.fillStyle = gL; ctx.fillRect(0, 0, 32, 256);
    const gR = ctx.createLinearGradient(256, 0, 224, 0);
    gR.addColorStop(0, isKyoto ? 'rgba(84,116,66,0.68)' : 'rgba(106,154,82,0.58)');
    gR.addColorStop(1, 'rgba(106,154,82,0)');
    ctx.fillStyle = gR; ctx.fillRect(224, 0, 32, 256);

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 2);
    texCache[key] = tex;
    return tex;
  };

  LS.createGravelPathTexture = function () {
    if (texCache.gravel_path) return texCache.gravel_path;
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#c8b89a';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(145,126,96,0.28)' : 'rgba(240,232,212,0.3)';
      ctx.fillRect((i * 47) % 256, (i * 83) % 256, 4, 3);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    texCache.gravel_path = tex;
    return tex;
  };

  LS.createZenGravelTexture = function () {
    if (texCache.zen_gravel) return texCache.zen_gravel;
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#d4cec0';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = 'rgba(130, 124, 112, 0.38)';
    ctx.lineWidth = 4;
    for (let y = 10; y < 256; y += 16) {
      ctx.beginPath();
      for (let x = 0; x <= 256; x += 16) {
        const wy = y + Math.sin((x / 256) * Math.PI * 2) * 4;
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);
    texCache.zen_gravel = tex;
    return tex;
  };

  LS.createWaterTexture = function () {
    if (texCache.water_teal) return texCache.water_teal;
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');
    // Low-glare deep teal-blue lake surface (zero white snow patches)
    ctx.fillStyle = '#236675';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 42; i++) {
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(110, 195, 205, 0.18)' : 'rgba(18, 68, 80, 0.28)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const y = (i * 19) % 256;
      const x = (i * 53) % 220;
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 22, y - 5, x + 44, y);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);
    texCache.water_teal = tex;
    return tex;
  };

  LS.createSkyTexture = function (mode, worldId) {
    const key = 'sky_' + mode + '_' + (worldId || 'tokyo');
    if (texCache[key]) return texCache[key];

    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 512;
    const ctx = c.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    if (mode === 1) {
      grad.addColorStop(0, worldId === 'kyoto' ? '#3d3c6b' : '#3a4f7a');
      grad.addColorStop(0.45, '#e88b5a');
      grad.addColorStop(0.85, '#ffd485');
      grad.addColorStop(1, '#ffefb8');
    } else if (mode === 2) {
      grad.addColorStop(0, '#101833');
      grad.addColorStop(0.55, '#253863');
      grad.addColorStop(1, '#55658a');
    } else {
      grad.addColorStop(0, worldId === 'kyoto' ? '#3f8fd4' : '#3a88d4');
      grad.addColorStop(0.5, worldId === 'kyoto' ? '#88c9eb' : '#7fc2f0');
      grad.addColorStop(0.85, '#d8eef8');
      grad.addColorStop(1, '#fff4d9');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Subtle stars at night
    if (mode === 2) {
      ctx.fillStyle = 'rgba(255, 250, 220, 0.85)';
      for (let i = 0; i < 85; i++) {
        const sx = (i * 97 + 31) % 1024;
        const sy = (i * 43 + 17) % 210;
        const sr = (i % 3 === 0) ? 2.1 : 1.2;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawCloud(cx, cy, scale, alpha) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      const puffs = [
        [0, 0, 58], [-48, 18, 42], [52, 16, 46], [-22, -32, 40],
        [24, -28, 38], [0, -56, 30], [-78, 32, 32], [82, 30, 34]
      ];
      const shadowCol = mode === 1 ? 'rgba(205,120,95,' + alpha + ')' :
                        mode === 2 ? 'rgba(40,52,88,' + alpha + ')' :
                                     'rgba(180,208,232,' + alpha + ')';
      const lightCol = mode === 1 ? 'rgba(255,228,195,' + alpha + ')' :
                       mode === 2 ? 'rgba(92,110,152,' + alpha + ')' :
                                    'rgba(255,253,246,' + alpha + ')';
      puffs.forEach(p => {
        ctx.fillStyle = shadowCol;
        ctx.beginPath();
        ctx.arc(p[0], p[1] + 10, p[2], 0, Math.PI * 2);
        ctx.fill();
      });
      puffs.forEach(p => {
        ctx.fillStyle = lightCol;
        ctx.beginPath();
        ctx.arc(p[0], p[1], p[2] * 0.94, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    drawCloud(240, 210, 1.35, 0.92);
    drawCloud(680, 190, 1.6, 0.94);
    drawCloud(900, 240, 1.0, 0.85);
    drawCloud(90, 250, 0.9, 0.82);

    const tex = new THREE.CanvasTexture(c);
    texCache[key] = tex;
    return tex;
  };

  LS.createSignTexture = function (text, opts) {
    const cfg = Object.assign({
      bg: '#fdf6e7',
      border: '#b85424',
      color: '#3d2c1e',
      font: 'bold 38px sans-serif',
      width: 512,
      height: 128
    }, opts || {});
    const c = document.createElement('canvas');
    c.width = cfg.width;
    c.height = cfg.height;
    const ctx = c.getContext('2d');
    ctx.fillStyle = cfg.bg;
    ctx.fillRect(0, 0, cfg.width, cfg.height);
    ctx.strokeStyle = cfg.border;
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, cfg.width - 16, cfg.height - 16);
    ctx.fillStyle = cfg.color;
    ctx.font = cfg.font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cfg.width / 2, cfg.height / 2 + 2);
    return new THREE.CanvasTexture(c);
  };

  LS.createAnimeFaceTexture = function (opts) {
    const cfg = Object.assign({
      skin: '#ffe3cc',
      eyeColor: '#4a2f1d',
      eyeHighlight: '#7c5132',
      blush: 'rgba(244, 130, 140, 0.42)',
      blink: false,
      happy: false,
      glasses: false,
      elder: false,
      mustache: false
    }, opts || {});

    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');

    ctx.fillStyle = cfg.skin;
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = cfg.blush;
    ctx.beginPath();
    ctx.ellipse(150, 305, 42, 22, 0, 0, Math.PI * 2);
    ctx.ellipse(362, 305, 42, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = cfg.elder ? '#999999' : '#3a2416';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(132, 182);
    ctx.quadraticCurveTo(175, 166, 214, 180);
    ctx.moveTo(298, 180);
    ctx.quadraticCurveTo(337, 166, 380, 182);
    ctx.stroke();

    function drawEye(cx) {
      if (cfg.blink || cfg.happy) {
        ctx.strokeStyle = '#2d1c12';
        ctx.lineWidth = 12;
        ctx.beginPath();
        if (cfg.happy) {
          ctx.arc(cx, 256, 34, Math.PI * 1.12, Math.PI * 1.88);
        } else {
          ctx.arc(cx, 240, 34, Math.PI * 0.15, Math.PI * 0.85);
        }
        ctx.stroke();
        return;
      }

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(cx, 246, 36, 40, 0, 0, Math.PI * 2);
      ctx.fill();

      const ig = ctx.createLinearGradient(cx, 212, cx, 282);
      ig.addColorStop(0, cfg.eyeColor);
      ig.addColorStop(1, cfg.eyeHighlight);
      ctx.fillStyle = ig;
      ctx.beginPath();
      ctx.ellipse(cx, 250, 26, 33, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1b110c';
      ctx.beginPath();
      ctx.ellipse(cx, 252, 13, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx - 10, 234, 9, 0, Math.PI * 2);
      ctx.arc(cx + 10, 264, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#24150d';
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.arc(cx, 252, 38, Math.PI * 1.12, Math.PI * 1.88);
      ctx.stroke();
    }

    drawEye(174);
    drawEye(338);

    if (cfg.glasses) {
      ctx.strokeStyle = '#4a3a2c';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(174, 248, 48, 0, Math.PI * 2);
      ctx.moveTo(222, 248);
      ctx.lineTo(290, 248);
      ctx.moveTo(386, 248);
      ctx.arc(338, 248, 48, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.strokeStyle = '#c99372';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(256, 286);
    ctx.lineTo(252, 304);
    ctx.lineTo(260, 306);
    ctx.stroke();

    if (cfg.mustache) {
      ctx.fillStyle = cfg.elder ? '#c8c8c8' : '#3a2416';
      ctx.beginPath();
      ctx.ellipse(234, 336, 28, 10, -0.2, 0, Math.PI * 2);
      ctx.ellipse(278, 336, 28, 10, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = '#99473d';
    ctx.lineWidth = 9;
    ctx.beginPath();
    if (cfg.happy) {
      ctx.fillStyle = '#e56b6f';
      ctx.arc(256, 344, 30, 0, Math.PI);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.arc(256, 332, 32, Math.PI * 0.18, Math.PI * 0.82);
      ctx.stroke();
    }

    return new THREE.CanvasTexture(c);
  };

  LS.createSpeechBubbleSprite = function (name, text) {
    const c = document.createElement('canvas');
    const measureCtx = c.getContext('2d');
    measureCtx.font = '600 22px sans-serif';

    const maxTextWidth = 392;
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const test = currentLine + words[i] + ' ';
      if (measureCtx.measureText(test).width > maxTextWidth && currentLine) {
        lines.push(currentLine.trim());
        currentLine = words[i] + ' ';
      } else {
        currentLine = test;
      }
    }
    if (currentLine.trim()) lines.push(currentLine.trim());

    const lineHeight = 30;
    const extraLines = Math.max(0, lines.length - 2);
    const boxHeight = 122 + extraLines * lineHeight;
    const tailHeight = 24;
    const topPad = 14;
    const bottomPad = 14;

    c.width = 512;
    c.height = topPad + boxHeight + tailHeight + bottomPad;

    const ctx = c.getContext('2d');
    ctx.fillStyle = 'rgba(253, 246, 231, 0.96)';
    ctx.strokeStyle = '#b98b52';
    ctx.lineWidth = 8;

    const x = 16, y = topPad, w = 480, h = boxHeight, r = 26;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(276, y + h);
    ctx.lineTo(256, y + h + tailHeight);
    ctx.lineTo(236, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#b85424';
    ctx.font = 'bold 25px sans-serif';
    ctx.fillText(name, 40, 50);

    ctx.fillStyle = '#3d2c1e';
    ctx.font = '600 22px sans-serif';
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 40, 86 + i * lineHeight);
    }

    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    const worldHeight = 1.24 * (c.height / 180);
    sprite.scale.set(3.45, worldHeight, 1);
    sprite.visible = false;
    return sprite;
  };

  // Shared Natural Neighborhood Scenery Builders (zero extra lights, mobile-safe geometry)
  function sampleCatmullRom(pts, stepsPerSeg) {
    if (!pts || pts.length < 2) return pts || [];
    const steps = stepsPerSeg || 8;
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const count = (i === pts.length - 2) ? steps : steps;
      for (let s = 0; s < count; s++) {
        const t = s / steps;
        const t2 = t * t, t3 = t2 * t;
        const x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
        const z = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
        out.push([x, z]);
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }

  function buildRibbonGeometry(sampled, width, yLevel, vScale) {
    const hw = width * 0.5;
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];
    let dist = 0;

    for (let i = 0; i < sampled.length; i++) {
      const cur = sampled[i];
      const prev = sampled[Math.max(0, i - 1)];
      const next = sampled[Math.min(sampled.length - 1, i + 1)];
      if (i > 0) dist += Math.hypot(cur[0] - prev[0], cur[1] - prev[1]);
      let tx = next[0] - prev[0];
      let tz = next[1] - prev[1];
      const tLen = Math.hypot(tx, tz) || 1;
      tx /= tLen; tz /= tLen;
      // Perpendicular normal in XZ plane
      const nx = -tz, nz = tx;

      positions.push(cur[0] - nx * hw, yLevel, cur[1] - nz * hw);
      positions.push(cur[0] + nx * hw, yLevel, cur[1] + nz * hw);
      normals.push(0, 1, 0, 0, 1, 0);
      const v = dist * (vScale || 0.14);
      uvs.push(0, v, 1, v);

      if (i < sampled.length - 1) {
        const b = i * 2;
        indices.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    return geo;
  }

  LS.scenery = {
    sampleSpline: sampleCatmullRom,

    addCurvedPath: function (parent, points, width, style, yLevel) {
      let tex;
      if (style === 'stone') tex = LS.createStonePathTexture();
      else if (style === 'lane_tokyo') tex = LS.createVillageLaneTexture('tokyo');
      else if (style === 'lane_kyoto') tex = LS.createVillageLaneTexture('kyoto');
      else tex = LS.createGravelPathTexture();

      const mat = new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide });
      const sampled = sampleCatmullRom(points, 8);
      const y = (yLevel !== undefined) ? yLevel : (style && style.indexOf('lane_') === 0 ? 0.032 : 0.024);
      const geo = buildRibbonGeometry(sampled, width || 2.5, y, style === 'stone' ? 0.16 : 0.12);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.receiveShadow = true;
      parent.add(mesh);
      return sampled;
    },

    addMeanderingStream: function (parent, points, width, addColliderFn, bridgeZones) {
      const sampled = sampleCatmullRom(points, 8);
      const w = width || 4.8;
      // Soft earthy riverbank border beneath water
      const bankGeo = buildRibbonGeometry(sampled, w + 1.5, 0.015, 0.1);
      const bankMesh = new THREE.Mesh(bankGeo, LS.makeToonMat(0x5a584a, { side: THREE.DoubleSide }));
      bankMesh.receiveShadow = true;
      parent.add(bankMesh);

      // Flowing water ribbon
      const waterGeo = buildRibbonGeometry(sampled, w, 0.036, 0.12);
      const waterMat = new THREE.MeshLambertMaterial({ map: LS.createWaterTexture(), transparent: true, opacity: 0.9, side: THREE.DoubleSide });
      const waterMesh = new THREE.Mesh(waterGeo, waterMat);
      parent.add(waterMesh);

      const bridges = bridgeZones || [];
      function nearBridge(px, pz) {
        for (let b = 0; b < bridges.length; b++) {
          if (Math.hypot(px - bridges[b].x, pz - bridges[b].z) < (bridges[b].r || 3.4)) return true;
        }
        return false;
      }

      // Scattered mossy bank boulders, reeds & gentle water colliders (clean gap at bridges!)
      for (let i = 1; i < sampled.length - 1; i++) {
        const cur = sampled[i];
        const prev = sampled[i - 1], next = sampled[i + 1];
        let tx = next[0] - prev[0], tz = next[1] - prev[1];
        const tl = Math.hypot(tx, tz) || 1;
        tx /= tl; tz /= tl;
        const nx = -tz, nz = tx;

        const isBridge = nearBridge(cur[0], cur[1]);
        if (addColliderFn && !isBridge && i % 2 === 0) {
          addColliderFn(cur[0], cur[1], w * 0.44, w * 0.44);
        }
        if (!isBridge && i % 4 === 0) {
          const side = (i % 8 === 0) ? 1 : -1;
          const bx = cur[0] + nx * side * (w * 0.56 + 0.35);
          const bz = cur[1] + nz * side * (w * 0.56 + 0.35);
          LS.scenery.addBoulder(parent, bx, bz, 0.55 + hash01(i * 3.7) * 0.45, true);
        }
        if (!isBridge && i % 5 === 2) {
          const side = (i % 10 === 2) ? -1 : 1;
          LS.scenery.addTallGrass(parent, cur[0] + nx * side * (w * 0.52 + 0.25), cur[1] + nz * side * (w * 0.52 + 0.25), 1.15);
        }
        if (!isBridge && i % 7 === 3) {
          LS.scenery.addLilyPad(parent, cur[0] + nx * (hash01(i) - 0.5) * w * 0.4, 0.052, cur[1] + nz * (hash01(i + 4) - 0.5) * w * 0.4, 0.9, i % 14 === 3);
        }
      }
      return sampled;
    },

    addMeadowPatch: function (parent, x, z, rx, rz, rotY, colorHex) {
      const m = new THREE.Mesh(
        new THREE.CircleGeometry(1, 20),
        LS.makeToonMat(colorHex || 0x82bc64)
      );
      m.rotation.x = -Math.PI / 2;
      m.rotation.z = rotY || 0;
      m.scale.set(rx, rz, 1);
      m.position.set(x, 0.012, z);
      m.receiveShadow = true;
      parent.add(m);
    },

    addTallGrass: function (parent, x, z, scale) {
      const s = scale || 1;
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.scale.setScalar(s);
      const bladeMat = LS.makeToonMat(0x4b8f44);
      const tipMat = LS.makeToonMat(0x74b354);
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2 + (x * 0.3 + z * 0.2);
        const r = 0.08 + (i % 2) * 0.16;
        const h = 0.42 + (i % 3) * 0.16;
        const blade = new THREE.Mesh(new THREE.ConeGeometry(0.06, h, 4), i % 2 === 0 ? bladeMat : tipMat);
        blade.position.set(Math.cos(ang) * r, h * 0.46, Math.sin(ang) * r);
        blade.rotation.z = Math.cos(ang) * 0.24;
        blade.rotation.x = Math.sin(ang) * 0.24;
        g.add(blade);
      }
      parent.add(g);
    },

    addLilyPad: function (parent, x, y, z, scale, hasBloom) {
      const s = scale || 1;
      const g = new THREE.Group();
      g.position.set(x, y, z);
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.36 * s, 0.36 * s, 0.03, 10), LS.makeToonMat(0x408a4c));
      g.add(pad);
      if (hasBloom) {
        const bloom = new THREE.Mesh(new THREE.DodecahedronGeometry(0.11 * s, 0), LS.makeToonMat(0xffa6c9));
        bloom.position.y = 0.08;
        g.add(bloom);
      }
      parent.add(g);
    },

    addSteppingStones: function (parent, points) {
      const mat = LS.makeToonMat(0x8a877d);
      points.forEach((p, idx) => {
        const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.42 + (idx % 2) * 0.1, 0.48, 0.06, 8), mat);
        stone.scale.set(1.15, 1, 0.85);
        stone.rotation.y = idx * 0.9;
        stone.position.set(p[0], 0.032, p[1]);
        stone.receiveShadow = true;
        parent.add(stone);
      });
    },

    addSignpost: function (parent, x, z, rotY) {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.y = rotY || 0;
      const wood = LS.makeToonMat(0x7c5333), board = LS.makeToonMat(0xd4b483);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 2.0, 6), wood);
      post.position.y = 1.0; post.castShadow = true; g.add(post);
      const arm1 = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.22, 0.07), board);
      arm1.position.set(0.32, 1.72, 0); arm1.rotation.z = 0.04; g.add(arm1);
      const arm2 = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.2, 0.07), board);
      arm2.position.set(-0.28, 1.38, 0.05); arm2.rotation.y = 0.55; arm2.rotation.z = -0.03; g.add(arm2);
      parent.add(g);
    },

    addWildflowerMeadow: function (parent, cx, cz, radius, count, palette) {
      const n = count || 8;
      for (let i = 0; i < n; i++) {
        const ang = hash01(cx * 3.1 + cz * 1.7 + i * 5.3) * Math.PI * 2;
        const rad = Math.sqrt(hash01(cx * 1.9 + cz * 4.1 + i * 7.7)) * radius;
        const px = cx + Math.cos(ang) * rad;
        const pz = cz + Math.sin(ang) * rad;
        if (i % 3 === 0) LS.scenery.addTallGrass(parent, px, pz, 0.85 + hash01(i * 2.9) * 0.45);
        else LS.scenery.addFlowerPatch(parent, px, pz, palette);
      }
    },

    addFlowerPatch: function (parent, x, z, palette) {
      const g = new THREE.Group();
      g.position.set(x, 0.04, z);
      const cols = palette || [0xff8fab, 0xffd166, 0xffffff, 0x90e0ef];
      const stemMat = LS.makeToonMat(0x4c9a42);
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2 + (x + z) * 0.3;
        const r = 0.22 + (i % 3) * 0.34;
        const fx = Math.cos(ang) * r, fz = Math.sin(ang) * r;
        const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.22, 5), stemMat);
        tuft.position.set(fx, 0.08, fz);
        g.add(tuft);
        const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 5), LS.makeToonMat(cols[i % cols.length]));
        bloom.position.set(fx, 0.2, fz);
        g.add(bloom);
      }
      parent.add(g);
    },

    addShrub: function (parent, x, z, scale, flowerHex) {
      const s = scale || 1;
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.scale.setScalar(s);
      const leafMat = LS.makeToonMat(0x448543);
      [[0, 0.45, 0, 0.58], [-0.42, 0.35, 0.2, 0.42], [0.42, 0.36, -0.18, 0.44]].forEach(p => {
        const m = new THREE.Mesh(new THREE.DodecahedronGeometry(p[3], 0), leafMat);
        m.position.set(p[0], p[1], p[2]);
        m.castShadow = true;
        g.add(m);
      });
      if (flowerHex) {
        const fMat = LS.makeToonMat(flowerHex);
        [[-0.25, 0.68, 0.28], [0.22, 0.72, 0.22], [0.0, 0.85, -0.15]].forEach(fp => {
          const b = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 5), fMat);
          b.position.set(fp[0], fp[1], fp[2]);
          g.add(b);
        });
      }
      parent.add(g);
    },

    addBoulder: function (parent, x, z, scale, mossy) {
      const s = scale || 1;
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.68 * s, 0), LS.makeToonMat(0x7c7b74));
      rock.scale.set(1.25, 0.72, 1.0);
      rock.position.y = 0.36 * s;
      rock.rotation.y = (x * 0.7 + z * 0.4);
      rock.castShadow = true;
      rock.receiveShadow = true;
      g.add(rock);
      if (mossy) {
        const moss = new THREE.Mesh(new THREE.SphereGeometry(0.45 * s, 7, 5), LS.makeToonMat(0x528a48));
        moss.scale.set(1.2, 0.35, 1.0);
        moss.position.set(0.05, 0.66 * s, 0);
        g.add(moss);
      }
      parent.add(g);
    },

    addBench: function (parent, x, z, rotY) {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.y = rotY || 0;
      const wood = LS.makeToonMat(0x8c5e35);
      const legMat = LS.makeToonMat(0x3a3d42);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.1, 0.55), wood);
      seat.position.y = 0.48; seat.castShadow = true; g.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.42, 0.08), wood);
      back.position.set(0, 0.78, -0.24); back.rotation.x = -0.15; g.add(back);
      [-0.68, 0.68].forEach(lx => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.46, 0.48), legMat);
        leg.position.set(lx, 0.23, 0); g.add(leg);
      });
      parent.add(g);
    },

    addPicnicBlanket: function (parent, x, z, rotY) {
      const g = new THREE.Group();
      g.position.set(x, 0.03, z);
      g.rotation.y = rotY || 0;
      const cloth = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.03, 2.2), LS.makeToonMat(0xf4a261));
      g.add(cloth);
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.035, 0.55), LS.makeToonMat(0xfff5e4));
      g.add(stripe);
      const basket = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.38, 0.4), LS.makeToonMat(0xa67342));
      basket.position.set(0.65, 0.2, -0.45); basket.castShadow = true; g.add(basket);
      parent.add(g);
    },

    addFenceRun: function (parent, x1, z1, x2, z2, style) {
      const dx = x2 - x1, dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      const g = new THREE.Group();
      g.position.set((x1 + x2) / 2, 0, (z1 + z2) / 2);
      g.rotation.y = Math.atan2(dx, dz);
      if (style === 'hedge') {
        const hedge = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.95, len), LS.makeToonMat(0x3f7d40));
        hedge.position.y = 0.48; hedge.castShadow = true; hedge.receiveShadow = true; g.add(hedge);
      } else if (style === 'bamboo') {
        const bMat = LS.makeToonMat(0x8ba35c);
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.05, len), bMat);
        rail.position.y = 0.52; rail.castShadow = true; g.add(rail);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, len + 0.1), LS.makeToonMat(0x526b36));
        cap.position.y = 1.08; g.add(cap);
      } else {
        const wMat = LS.makeToonMat(0x8c6239);
        [0.32, 0.72].forEach(ry => {
          const bar = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, len), wMat);
          bar.position.y = ry; g.add(bar);
        });
        const posts = Math.max(2, Math.round(len / 2.2));
        for (let i = 0; i <= posts; i++) {
          const pz = -len / 2 + (i / posts) * len;
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.95, 0.14), wMat);
          post.position.set(0, 0.47, pz); g.add(post);
        }
      }
      parent.add(g);
    },

    addGrassMound: function (parent, x, z, radius, height, colorHex) {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 14, 10),
        LS.makeToonMat(colorHex || 0x629950)
      );
      m.scale.set(1.3, height / radius, 1.05);
      m.rotation.y = x * 0.2 + z * 0.1;
      m.position.set(x, -height * 0.36, z);
      m.receiveShadow = true;
      parent.add(m);
    },

    addBike: function (parent, x, z, rotY, colorHex) {
      const bike = new THREE.Group();
      bike.position.set(x, 0, z);
      bike.rotation.y = rotY || 0;
      const wheelMat = LS.makeToonMat(0x2c2c2c);
      [-0.48, 0.48].forEach(wz => {
        const w = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.04, 7, 14), wheelMat);
        w.position.set(0, 0.32, wz); w.rotation.y = Math.PI / 2; bike.add(w);
      });
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.98), LS.makeToonMat(colorHex || 0x52a69a));
      frame.position.set(0, 0.52, 0); bike.add(frame);
      const basket = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.24), LS.makeToonMat(0x9a6d40));
      basket.position.set(0, 0.74, -0.48); bike.add(basket);
      parent.add(bike);
    }
  };
})(window.LailaSalma);
