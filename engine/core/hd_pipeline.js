window.LailaSalma = window.LailaSalma || {};

(function (LS) {
  const ASSET_MANIFEST = {
    tokyo_house_2f: 'assets/hd/tokyo_house_2f.glb',
    tokyo_house_1f: 'assets/hd/tokyo_house_1f.glb',
    kyoto_machiya: 'assets/hd/kyoto_machiya.glb',
    anime_tree_green: 'assets/hd/anime_tree_green.glb',
    anime_tree_sakura: 'assets/hd/anime_tree_sakura.glb',
    anime_tree_maple: 'assets/hd/anime_tree_maple.glb',
    anime_shrub: 'assets/hd/anime_shrub.glb',
    utility_pole: 'assets/hd/utility_pole.glb',
    anime_vending: 'assets/hd/anime_vending.glb',
    anime_bike: 'assets/hd/anime_bike.glb'
  };

  const cache = {};
  let toonGradientMap = null;

  function getAnimeGradientMap() {
    if (toonGradientMap) return toonGradientMap;
    // Soft 5-band Makoto Shinkai / Studio Ghibli painterly toon ramp
    const data = new Uint8Array([
      118, 128, 162, 255,   // Cool indigo-blue shadow band
      152, 158, 184, 255,   // Soft cool mid-shadow
      204, 204, 210, 255,   // Neutral daylight midtone
      238, 236, 228, 255,   // Warm sunlit band
      255, 252, 240, 255    // Creamy golden highlight
    ]);
    const tex = new THREE.DataTexture(data, 5, 1, THREE.RGBAFormat);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    toonGradientMap = tex;
    return tex;
  }

  function stylizeLoadedGLB(root) {
    const grad = getAnimeGradientMap();
    const aniso = LS.maxAnisotropy || 8;
    root.traverse(obj => {
      if (!obj.isMesh) return;
      const oldMat = obj.material;
      if (!oldMat) return;
      const mName = (oldMat.name || '').toLowerCase();
      const isAlphaLeaf = oldMat.alphaTest > 0 || mName.indexOf('leaf') >= 0 || mName.indexOf('foliage') >= 0;
      const isGlossy = mName.indexOf('glass') >= 0 || mName.indexOf('chrome') >= 0 || mName.indexOf('metal') >= 0 || mName.indexOf('ac_') >= 0;

      if (oldMat.map) {
        oldMat.map.anisotropy = aniso;
      }

      if (isAlphaLeaf) {
        // Soft anime leaf-card shading: translucent warm sunlit crown + cool blue-green shadow
        const leafMat = new THREE.MeshToonMaterial({
          map: oldMat.map,
          color: oldMat.color ? oldMat.color.clone() : new THREE.Color(0xffffff),
          gradientMap: grad,
          vertexColors: !!obj.geometry.attributes.color,
          alphaTest: 0.45,
          side: THREE.DoubleSide
        });
        leafMat.name = oldMat.name;
        obj.material = leafMat;
        obj.castShadow = true;
        obj.receiveShadow = true;
      } else if (!isGlossy) {
        // Painterly Shinkai/Ghibli cel-toon material with baked vertex AO!
        const toon = new THREE.MeshToonMaterial({
          map: oldMat.map || null,
          color: oldMat.color ? oldMat.color.clone() : new THREE.Color(0xffffff),
          emissive: oldMat.emissive ? oldMat.emissive.clone() : new THREE.Color(0x000000),
          emissiveIntensity: oldMat.emissiveIntensity || 1.0,
          gradientMap: grad,
          vertexColors: !!obj.geometry.attributes.color,
          side: oldMat.side
        });
        toon.name = oldMat.name;
        obj.material = toon;
        obj.castShadow = true;
        obj.receiveShadow = true;
      } else {
        // Keep crisp PBR reflections on glass windows, AC units & chrome
        oldMat.envMapIntensity = 1.2;
        oldMat.needsUpdate = true;
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  }

  LS.hdAssets = {
    ready: false,

    preloadAll: function () {
      if (!LS.isHD || typeof THREE.GLTFLoader === 'undefined') {
        return Promise.resolve();
      }
      const loader = new THREE.GLTFLoader();
      const keys = Object.keys(ASSET_MANIFEST);
      const promises = keys.map(key => new Promise(resolve => {
        loader.load(
          ASSET_MANIFEST[key],
          gltf => {
            const root = gltf.scene || gltf.scenes[0];
            if (root) {
              stylizeLoadedGLB(root);
              cache[key] = root;
            }
            resolve();
          },
          undefined,
          err => {
            console.warn('[HD GLB] Failed to load ' + key, err);
            resolve();
          }
        );
      }));
      return Promise.all(promises).then(() => {
        LS.hdAssets.ready = Object.keys(cache).length > 0;
      });
    },

    has: function (key) {
      return !!cache[key];
    },

    clone: function (key, opts) {
      const src = cache[key];
      if (!src) return null;
      const cloned = src.clone(true);
      const cfg = opts || {};
      if (cfg.wallTint || cfg.roofTint || cfg.tint) {
        cloned.traverse(o => {
          if (!o.isMesh || !o.material) return;
          const nm = (o.material.name || '').toLowerCase();
          if (cfg.wallTint && (nm.indexOf('stucco') >= 0 || nm.indexOf('plaster') >= 0)) {
            o.material = o.material.clone();
            o.material.color.set(cfg.wallTint);
          } else if (cfg.roofTint && (nm.indexOf('kawara') >= 0 || nm.indexOf('tile') >= 0)) {
            o.material = o.material.clone();
            o.material.color.set(cfg.roofTint);
          } else if (cfg.tint) {
            o.material = o.material.clone();
            o.material.color.multiply(new THREE.Color(cfg.tint));
          }
        });
      }
      return cloned;
    },

    // Iconic Makoto Shinkai sagging overhead catenary power lines between concrete utility poles!
    addPowerLines: function (parent, poles) {
      if (!poles || poles.length < 2) return;
      const wireMat = new THREE.MeshBasicMaterial({ color: 0x262830 });
      const offsets = [
        [-0.72, 7.66], [0.0, 7.66], [0.72, 7.66],
        [-0.58, 6.86], [0.58, 6.86]
      ];
      for (let i = 0; i < poles.length - 1; i++) {
        const a = poles[i], b = poles[i + 1];
        const dist = Math.hypot(b.x - a.x, b.z - a.z);
        if (dist > 34) continue;
        const sag = Math.min(1.15, dist * 0.042);
        const cosA = Math.cos(a.rotY || 0), sinA = Math.sin(a.rotY || 0);
        const cosB = Math.cos(b.rotY || 0), sinB = Math.sin(b.rotY || 0);

        offsets.forEach((off, wi) => {
          const ax = a.x + cosA * off[0], az = a.z - sinA * off[0];
          const bx = b.x + cosB * off[0], bz = b.z - sinB * off[0];
          const p0 = new THREE.Vector3(ax, off[1], az);
          const p2 = new THREE.Vector3(bx, off[1], bz);
          const pm = new THREE.Vector3((ax + bx) * 0.5, off[1] - sag - (wi % 2) * 0.14, (az + bz) * 0.5);
          const curve = new THREE.QuadraticBezierCurve3(p0, pm, p2);
          const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.022, 4, false), wireMat);
          parent.add(tube);
        });
      }
    },

    // Distant red-and-white mountain ridge radio towers (directly inspired by reference image!)
    addRidgeTowers: function (parent, coords) {
      const redMat = new THREE.MeshBasicMaterial({ color: 0xc94a44 });
      const whiteMat = new THREE.MeshBasicMaterial({ color: 0xf4ece4 });
      (coords || [[-28, 17, -112], [26, 15, -108]]).forEach(pt => {
        const tg = new THREE.Group();
        tg.position.set(pt[0], pt[1], pt[2]);
        for (let tier = 0; tier < 5; tier++) {
          const rBot = 1.6 - tier * 0.25;
          const rTop = 1.35 - tier * 0.24;
          const seg = new THREE.Mesh(
            new THREE.CylinderGeometry(rTop, rBot, 3.0, 4, 1, true),
            tier % 2 === 0 ? redMat : whiteMat
          );
          seg.material.wireframe = true;
          seg.position.y = tier * 3.0 + 1.5;
          tg.add(seg);
        }
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 4.0, 5), redMat);
        mast.position.y = 17.0;
        tg.add(mast);
        parent.add(tg);
      });
    }
  };

  // Towering Painterly Makoto Shinkai Anime Cumulus Sky Dome (2048x1024!)
  LS.createShinkaiSkyTexture = function (mode, worldId) {
    const c = document.createElement('canvas');
    c.width = 2048; c.height = 1024;
    const ctx = c.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 1024);
    if (mode === 1) {
      // Dramatic Shinkai golden-hour sunset
      grad.addColorStop(0.0, '#1f2d5a');
      grad.addColorStop(0.32, '#5c4b78');
      grad.addColorStop(0.58, '#df7d55');
      grad.addColorStop(0.78, '#ffbe6b');
      grad.addColorStop(1.0, '#fff0c4');
    } else if (mode === 2) {
      grad.addColorStop(0.0, '#0a1026');
      grad.addColorStop(0.5, '#1c2d58');
      grad.addColorStop(1.0, '#445882');
    } else {
      // Crisp Makoto Shinkai late-afternoon cobalt sky fading to warm creamy horizon!
      grad.addColorStop(0.0, '#2a72c4');
      grad.addColorStop(0.36, '#5ca4e6');
      grad.addColorStop(0.64, '#a8d5f5');
      grad.addColorStop(0.84, '#e6eef7');
      grad.addColorStop(1.0, '#fff2d2');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2048, 1024);

    if (mode === 2) {
      ctx.fillStyle = 'rgba(255, 250, 224, 0.9)';
      for (let i = 0; i < 240; i++) {
        const sx = ((Math.sin(i * 91.7) * 43758.5) % 1 + 1) % 1 * 2048;
        const sy = ((Math.sin(i * 47.3) * 19381.1) % 1 + 1) % 1 * 480;
        ctx.beginPath(); ctx.arc(sx, sy, (i % 5 === 0) ? 2.6 : 1.3, 0, Math.PI * 2); ctx.fill();
      }
    } else {
      // Soft golden sun radiance
      const sx = mode === 1 ? 1320 : 1460;
      const sy = mode === 1 ? 520 : 310;
      const sg = ctx.createRadialGradient(sx, sy, 12, sx, sy, 280);
      sg.addColorStop(0, 'rgba(255, 250, 224, 0.96)');
      sg.addColorStop(0.28, mode === 1 ? 'rgba(255, 186, 104, 0.55)' : 'rgba(255, 245, 206, 0.35)');
      sg.addColorStop(1, 'rgba(255, 232, 180, 0)');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sx, sy, 280, 0, Math.PI * 2); ctx.fill();
    }

    // Towering sculpted anime cumulus banks (warm cream tops + cool periwinkle undersides!)
    function drawCumulus(cx, cy, scale) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      const puffs = [
        [-130, 52, 68], [-65, 24, 88], [0, -18, 104], [75, 16, 86], [140, 48, 64],
        [-35, -72, 74], [38, -68, 72], [4, -124, 58], [-92, -16, 56], [96, -12, 54],
        [-180, 74, 48], [185, 72, 46]
      ];
      const deepShadow = mode === 1 ? 'rgba(176, 98, 92, 0.85)' : (mode === 2 ? 'rgba(32, 46, 84, 0.85)' : 'rgba(138, 168, 208, 0.88)');
      const midShadow = mode === 1 ? 'rgba(222, 146, 114, 0.88)' : (mode === 2 ? 'rgba(56, 74, 118, 0.85)' : 'rgba(192, 212, 236, 0.90)');
      const sunlitTop = mode === 1 ? 'rgba(255, 234, 198, 0.96)' : (mode === 2 ? 'rgba(102, 122, 168, 0.88)' : 'rgba(255, 253, 246, 0.98)');

      puffs.forEach(p => { ctx.fillStyle = deepShadow; ctx.beginPath(); ctx.arc(p[0] - 8, p[1] + 22, p[2] * 1.02, 0, Math.PI * 2); ctx.fill(); });
      puffs.forEach(p => { ctx.fillStyle = midShadow; ctx.beginPath(); ctx.arc(p[0] - 3, p[1] + 10, p[2] * 0.96, 0, Math.PI * 2); ctx.fill(); });
      puffs.forEach(p => { ctx.fillStyle = sunlitTop; ctx.beginPath(); ctx.arc(p[0] + 6, p[1] - 4, p[2] * 0.88, 0, Math.PI * 2); ctx.fill(); });
      ctx.restore();
    }

    drawCumulus(420, 450, 1.35);
    drawCumulus(1060, 415, 1.65);
    drawCumulus(1660, 465, 1.30);
    drawCumulus(120, 500, 0.95);
    drawCumulus(1960, 495, 1.0);

    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = LS.maxAnisotropy || 8;
    return tex;
  };

  // Makoto Shinkai Post-Processing Pipeline (EffectComposer + UnrealBloomPass + Warm/Cool Film Grade!)
  const ShinkaiGradeShader = {
    uniforms: {
      tDiffuse: { value: null },
      uTimeMode: { value: 0.0 }
    },
    vertexShader: [
      'varying vec2 vUv;',
      'void main() {',
      '  vUv = uv;',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform sampler2D tDiffuse;',
      'uniform float uTimeMode;',
      'varying vec2 vUv;',
      'void main() {',
      '  vec4 tex = texture2D(tDiffuse, vUv);',
      '  vec3 col = tex.rgb;',
      '  float lum = dot(col, vec3(0.299, 0.587, 0.114));',
      '  // Classic Makoto Shinkai warm-gold highlights + cool slate-blue shadows!',
      '  vec3 coolTint = vec3(0.92, 0.96, 1.12);',
      '  vec3 warmTint = mix(vec3(1.07, 1.02, 0.93), vec3(1.14, 0.98, 0.84), clamp(uTimeMode, 0.0, 1.0));',
      '  col *= mix(coolTint, warmTint, smoothstep(0.18, 0.82, lum));',
      '  // Gentle anime vibrance & crisp contrast',
      '  float avg = (col.r + col.g + col.b) / 3.0;',
      '  col = mix(vec3(avg), col, 1.14);',
      '  col = (col - 0.5) * 1.05 + 0.5;',
      '  // Very subtle dreamy atmospheric vignette',
      '  float dist = distance(vUv, vec2(0.5));',
      '  col *= smoothstep(0.98, 0.36, dist * 0.58);',
      '  gl_FragColor = vec4(clamp(col, 0.0, 1.0), tex.a);',
      '}'
    ].join('\n')
  };

  LS.hdPost = {
    composer: null,
    bloomPass: null,
    gradePass: null,

    init: function (renderer, scene, camera) {
      if (!LS.isHD || typeof THREE.EffectComposer === 'undefined') return false;
      try {
        const composer = new THREE.EffectComposer(renderer);
        const renderPass = new THREE.RenderPass(scene, camera);
        composer.addPass(renderPass);

        if (typeof THREE.UnrealBloomPass !== 'undefined') {
          const bloom = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.18,  // crisp dreamy Shinkai sunlight bloom in daylight
            0.52,  // smooth halo radius
            0.88   // high threshold: keeps signs & stucco razor-sharp while sky, clouds & lanterns glow!
          );
          composer.addPass(bloom);
          LS.hdPost.bloomPass = bloom;
        }

        if (typeof THREE.ShaderPass !== 'undefined') {
          const grade = new THREE.ShaderPass(ShinkaiGradeShader);
          composer.addPass(grade);
          LS.hdPost.gradePass = grade;
        }

        LS.hdPost.composer = composer;
        return true;
      } catch (e) {
        console.warn('[HD Post]', e);
        return false;
      }
    },

    setSize: function (w, h) {
      if (LS.hdPost.composer) LS.hdPost.composer.setSize(w, h);
    },

    setTimeMode: function (mode) {
      if (LS.hdPost.gradePass) {
        LS.hdPost.gradePass.uniforms.uTimeMode.value = mode === 1 ? 1.0 : 0.0;
      }
      if (LS.hdPost.bloomPass) {
        LS.hdPost.bloomPass.strength = mode === 1 ? 0.30 : (mode === 2 ? 0.38 : 0.18);
        LS.hdPost.bloomPass.threshold = mode === 2 ? 0.72 : (mode === 1 ? 0.84 : 0.88);
      }
    },

    render: function () {
      if (LS.hdPost.composer) {
        LS.hdPost.composer.render();
        return true;
      }
      return false;
    }
  };
})(window.LailaSalma);
