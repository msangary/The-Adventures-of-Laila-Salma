window.LailaSalma = window.LailaSalma || {};

(function (LS) {
  let ghibliRampTex = null;

  function isTouchOrPhone() {
    if (typeof window === 'undefined') return false;
    const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const narrow = window.innerWidth <= 920;
    const ua = (navigator && navigator.userAgent) ? navigator.userAgent : '';
    return coarse || narrow || /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  }

  const QUALITY_PRESETS = {
    high: {
      id: 'high',
      label: '✨ High',
      maxDpr: 2.0,
      shadowSize: 2048,
      grassScale: 1.0,
      usePost: true,
      useBloom: true
    },
    balanced: {
      id: 'balanced',
      label: '⚖️ Balanced',
      maxDpr: 1.5,
      shadowSize: 1024,
      grassScale: 0.45,
      usePost: true,
      useBloom: false
    },
    lite: {
      id: 'lite',
      label: '⚡ Lite',
      maxDpr: 1.15,
      shadowSize: 512,
      grassScale: 0.0,
      usePost: false,
      useBloom: false
    }
  };

  function getToonRamp() {
    if (ghibliRampTex) return ghibliRampTex;
    // Pure Studio Ghibli 3-Band Painterly Watercolor Cel Ramp:
    // Band 1: Cool lavender-slate shadow | Band 2: Luminous daylight midtone | Band 3: Warm cream sunlit highlight
    const data = new Uint8Array([
      132, 140, 174, 255,
      132, 140, 174, 255,
      208, 212, 222, 255,
      208, 212, 222, 255,
      255, 251, 236, 255,
      255, 251, 236, 255
    ]);
    const tex = new THREE.DataTexture(data, 6, 1, THREE.RGBAFormat);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    ghibliRampTex = tex;
    return tex;
  }

  function createGhibliMat(color, opts) {
    const raw = Object.assign({ color: color !== undefined ? color : 0xffffff }, opts || {});
    const cfg = {
      color: raw.color,
      gradientMap: getToonRamp()
    };
    if (raw.map) cfg.map = raw.map;
    if (raw.bumpMap) {
      cfg.bumpMap = raw.bumpMap;
      cfg.bumpScale = raw.bumpScale !== undefined ? raw.bumpScale : 0.035;
    }
    if (raw.normalMap) {
      cfg.normalMap = raw.normalMap;
      cfg.normalScale = raw.normalScale || new THREE.Vector2(0.55, 0.55);
    }
    if (raw.emissive !== undefined) cfg.emissive = raw.emissive;
    if (raw.emissiveIntensity !== undefined) cfg.emissiveIntensity = raw.emissiveIntensity;
    if (raw.transparent !== undefined) cfg.transparent = raw.transparent;
    if (raw.opacity !== undefined) cfg.opacity = raw.opacity;
    if (raw.side !== undefined) cfg.side = raw.side;
    if (raw.alphaTest !== undefined) cfg.alphaTest = raw.alphaTest;
    if (raw.vertexColors !== undefined) cfg.vertexColors = raw.vertexColors;
    if (raw.depthWrite !== undefined) cfg.depthWrite = raw.depthWrite;
    return new THREE.MeshToonMaterial(cfg);
  }

  // Organic Studio Ghibli multi-tone leaf/blossom cluster canopy
  function addLeafClusters(group, centers, opts) {
    const cfg = Object.assign({
      sunHex: 0x8ad662,
      midHex: 0x54a84c,
      shadeHex: 0x35753d,
      castShadow: true,
      receiveShadow: true,
      flatShading: false
    }, opts || {});

    const sunMat = createGhibliMat(cfg.sunHex);
    const midMat = createGhibliMat(cfg.midHex);
    const shadeMat = createGhibliMat(cfg.shadeHex);

    (centers || []).forEach((c, idx) => {
      const r = c[3] || 1.0;
      const sx = c[4] || 1.12;
      const sy = c[5] || 0.86;
      const sz = c[6] || 1.08;
      const mat = (c[7] === 'sun' || idx % 3 === 0) ? sunMat
        : ((c[7] === 'shade' || idx % 3 === 2) ? shadeMat : midMat);
      const geo = new THREE.IcosahedronGeometry(r, 1);
      const puff = new THREE.Mesh(geo, mat);
      puff.position.set(c[0], c[1], c[2]);
      puff.scale.set(sx, sy, sz);
      puff.rotation.set(idx * 0.45, idx * 0.85, idx * 0.25);
      puff.castShadow = cfg.castShadow;
      puff.receiveShadow = cfg.receiveShadow;
      group.add(puff);
    });
  }

  // Painterly Ghibli tree builder (smooth curved trunk + dappled 3-tone leaf clusters)
  function buildGhibliTree(kind, scale) {
    const s = scale || 1.0;
    const g = new THREE.Group();
    const palettes = {
      sakura: { trunk: 0x5c4237, sun: 0xffd2e4, mid: 0xf7a2c2, shade: 0xd9739c },
      maple:  { trunk: 0x593a2b, sun: 0xff9f45, mid: 0xe85d38, shade: 0xb33426 },
      gold:   { trunk: 0x5d412d, sun: 0xffe066, mid: 0xf2b138, shade: 0xc87f24 },
      olive:  { trunk: 0x6b533b, sun: 0x9ec96b, mid: 0x6d9c4b, shade: 0x456b32 },
      green:  { trunk: 0x614431, sun: 0x8ed665, mid: 0x54a84c, shade: 0x33753b }
    };
    const pal = palettes[kind] || palettes.green;
    const trunkMat = createGhibliMat(pal.trunk);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.34, 2.7, 9), trunkMat);
    trunk.position.y = 1.35;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    g.add(trunk);

    // Subtle organic branches
    [[-0.38, 2.25, 0.14, 0.45], [0.36, 2.38, -0.18, -0.42]].forEach(b => {
      const br = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 1.1, 7), trunkMat);
      br.position.set(b[0], b[1], b[2]);
      br.rotation.z = b[3];
      br.castShadow = true;
      g.add(br);
    });

    addLeafClusters(g, [
      [0.0, 3.85, 0.0, 1.38, 1.18, 0.85, 1.12, 'sun'],
      [-1.08, 3.18, 0.42, 1.08, 1.15, 0.82, 1.06, 'mid'],
      [1.12, 3.24, -0.28, 1.12, 1.16, 0.84, 1.08, 'sun'],
      [0.18, 3.12, 0.98, 0.98, 1.12, 0.80, 1.05, 'mid'],
      [-0.28, 3.05, -0.96, 1.02, 1.14, 0.82, 1.05, 'shade'],
      [-0.75, 2.75, -0.35, 0.82, 1.1, 0.72, 1.05, 'shade'],
      [0.78, 2.78, 0.55, 0.86, 1.1, 0.74, 1.05, 'mid']
    ], { sunHex: pal.sun, midHex: pal.mid, shadeHex: pal.shade });

    g.scale.setScalar(s);
    return g;
  }

  // Stylized Studio Ghibli cel-shimmer turquoise water (Ponyo / Spirited Away palette)
  function createGhibliWaterMat(opacity, side) {
    const op = opacity !== undefined ? opacity : 0.90;
    const uniforms = {
      uTime: { value: 0.0 },
      uTimeMode: { value: LS.state ? LS.state.timeMode : 0.0 },
      uOpacity: { value: op }
    };
    if (LS.hdPost && LS.hdPost.registerAnimatedUniform) {
      LS.hdPost.registerAnimatedUniform(uniforms);
    }

    return new THREE.ShaderMaterial({
      uniforms: uniforms,
      transparent: true,
      side: side || THREE.DoubleSide,
      vertexShader: [
        'varying vec2 vUv;',
        'varying vec3 vWorldPos;',
        'void main() {',
        '  vUv = uv;',
        '  vec4 wp = modelMatrix * vec4(position, 1.0);',
        '  vWorldPos = wp.xyz;',
        '  gl_Position = projectionMatrix * viewMatrix * wp;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform float uTime;',
        'uniform float uTimeMode;',
        'uniform float uOpacity;',
        'varying vec2 vUv;',
        'varying vec3 vWorldPos;',
        'float gWave(vec2 p) {',
        '  return sin(p.x * 1.4 + uTime * 1.15) * cos(p.y * 1.25 - uTime * 0.95)',
        '       + 0.45 * sin(p.x * 2.8 - p.y * 2.1 + uTime * 1.65);',
        '}',
        'void main() {',
        '  vec2 p = vWorldPos.xz * 0.52;',
        '  float w1 = gWave(p + vec2(0.0, uTime * 0.36));',
        '  float w2 = gWave(p * 1.55 - vec2(uTime * 0.25, -uTime * 0.48));',
        '  // Cel-quantized painterly Ghibli water bands!',
        '  float band = smoothstep(-0.35, 0.35, w1 * 0.65 + w2 * 0.45);',
        '  float celBand = floor(band * 3.0 + 0.35) / 3.0;',
        '  vec3 deepCol = uTimeMode > 1.5 ? vec3(0.08, 0.20, 0.34) : (uTimeMode > 0.5 ? vec3(0.16, 0.36, 0.46) : vec3(0.12, 0.48, 0.58));',
        '  vec3 midCol  = uTimeMode > 1.5 ? vec3(0.15, 0.32, 0.48) : (uTimeMode > 0.5 ? vec3(0.32, 0.56, 0.60) : vec3(0.22, 0.68, 0.74));',
        '  vec3 litCol  = uTimeMode > 1.5 ? vec3(0.26, 0.44, 0.64) : (uTimeMode > 0.5 ? vec3(0.95, 0.74, 0.50) : vec3(0.52, 0.87, 0.90));',
        '  vec3 col = mix(deepCol, midCol, clamp(celBand * 1.1, 0.0, 1.0));',
        '  float sparkle = step(0.88, w1 * 0.58 + w2 * 0.55);',
        '  col = mix(col, litCol, sparkle * (uTimeMode > 1.5 ? 0.35 : 0.65));',
        '  // Crisp painterly white shoreline foam ribbons',
        '  float edge = smoothstep(0.10, 0.0, min(vUv.x, 1.0 - vUv.x));',
        '  float foam = edge * step(0.25, 0.55 + 0.45 * sin(vWorldPos.z * 2.2 + uTime * 1.8));',
        '  col = mix(col, vec3(0.96, 0.98, 0.97), foam * 0.62);',
        '  gl_FragColor = vec4(clamp(col, 0.0, 0.95), uOpacity);',
        '}'
      ].join('\n')
    });
  }

  LS.ghibli = {
    QUALITY_PRESETS: QUALITY_PRESETS,
    isTouchOrPhone: isTouchOrPhone,
    detectDefaultQuality: function () {
      return isTouchOrPhone() ? 'balanced' : 'high';
    },
    getQualityConfig: function (q) {
      const key = q || (LS.state && LS.state.quality) || 'balanced';
      return QUALITY_PRESETS[key] || QUALITY_PRESETS.balanced;
    },
    getToonRamp: getToonRamp,
    createGhibliMat: createGhibliMat,
    addLeafClusters: addLeafClusters,
    buildGhibliTree: buildGhibliTree,
    createGhibliWaterMat: createGhibliWaterMat
  };
})(window.LailaSalma);
