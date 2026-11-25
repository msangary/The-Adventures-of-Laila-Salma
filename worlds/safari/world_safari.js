window.LailaSalma = window.LailaSalma || {};

(function (LS) {
  // Organic meandering Serengeti Safari Jeep dirt loop & footpaths
  const SAFARI_LOOP_PTS = [
    [-4.8, 7.8], [-12.5, 4.5], [-16.0, -4.5], [-14.0, -16.5],
    [-10.5, -24.5], [0.0, -25.5], [14.0, -23.0], [23.5, -13.0],
    [24.5, 0.5], [19.5, 11.5], [8.5, 11.0], [-4.8, 7.8]
  ];
  const SAFARI_SOUTH_TRAIL = [
    [0.0, 29.0], [0.0, 20.0], [0.0, 12.0], [-4.8, 7.8]
  ];
  const SAFARI_AIRSTRIP_TRAIL = [
    [8.5, 11.0], [16.5, 17.5], [22.5, 24.5], [27.0, 28.0]
  ];
  const SAFARI_GIRAFFE_TRAIL = [
    [-12.5, 4.5], [-17.5, 3.2], [-21.2, 2.0]
  ];
  const SAFARI_PLAY_TRAIL = [
    [0.0, 20.0], [-10.0, 23.5], [-18.5, 26.5]
  ];

  function strokeMapSpline(ctx, pts, toMapX, toMapY, color, width) {
    const sp = LS.scenery.sampleSpline(pts, 6);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    sp.forEach((p, idx) => {
      const mx = toMapX(p[0]), my = toMapY(p[1]);
      if (idx === 0) ctx.moveTo(mx, my);
      else ctx.lineTo(mx, my);
    });
    ctx.stroke();
  }

  LS.registerWorld('safari', {
    build: function (worldGroup, scene) {
      const SC = LS.scenery;
      const W = {
        id: 'safari',
        isInterior: false,
        skyMesh: null,
        colliders: [],
        zones: [],
        hiddenAnimals: [],
        giraffes: [],
        elephants: [],
        flamingos: [],
        zebras: [],
        splashRings: [],
        windsock: null,
        propeller: null,
        safariJeep: null,
        jeepPath: null,
        jeepHome: null,
        mochiStartPos: new THREE.Vector3(2.2, 0, 15.8),
        slideStartPos: new THREE.Vector3(-22.8, 2.1, 25.0),
        slideEndPos: new THREE.Vector3(-22.8, 0.15, 29.0),
        swingSeatPos: new THREE.Vector3(-17.8, 0.72, 29.8),
        hopscotchPos: new THREE.Vector3(-16.0, 0, 24.8)
      };

      function safeRun(name, fn) {
        try { fn(); } catch (e) { console.warn('[Safari:' + name + ']', e); }
      }

      function addCollider(x, z, hw, hd) {
        W.colliders.push({ minX: x - hw, maxX: x + hw, minZ: z - hd, maxZ: z + hd });
      }

      // Smooth walkable height for the raised Giraffe Feeding Deck (X=-26.6..-21.4, Z=-0.6..4.6)
      W.getGroundHeight = function (x, z) {
        // Gentle east ramp ascending from X=-20.0 (y=0) up to X=-22.2 (y=0.85)
        if (x <= -19.8 && x >= -22.2 && z >= 0.4 && z <= 3.6) {
          const t = Math.max(0, Math.min(1, (-19.8 - x) / 2.4));
          return t * 0.85;
        }
        // Flat elevated Giraffe Feeding Deck platform
        if (x < -22.2 && x >= -26.8 && z >= -0.6 && z <= 4.6) {
          return 0.85;
        }
        return 0;
      };

      // Procedural & HD Tree Builders (Umbrella Acacia + Majestic Baobab)
      function addAcacia(x, z, scale, noCol) {
        const s = scale || 1.0;
        if (LS.isHD && LS.hdAssets && LS.hdAssets.has('anime_acacia')) {
          const m = LS.hdAssets.clone('anime_acacia');
          m.position.set(x, 0, z);
          m.rotation.y = x * 0.73 + z * 0.41;
          m.scale.setScalar(s * 1.12);
          worldGroup.add(m);
        } else {
          const g = new THREE.Group();
          g.position.set(x, 0, z);
          const bark = LS.makeToonMat(0x7c5838);
          const leafA = LS.makeToonMat(0x6b8e3e), leafB = LS.makeToonMat(0x94ad48);
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * s, 0.34 * s, 2.8 * s, 8), bark);
          trunk.position.y = 1.4 * s; trunk.rotation.z = 0.06; trunk.castShadow = true; g.add(trunk);
          [[0.85, 0.3, -0.58], [-0.9, -0.2, 0.62], [0.15, -0.85, -0.1]].forEach(br => {
            const b = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * s, 0.14 * s, 2.1 * s, 6), bark);
            b.position.set(br[0] * s, 3.0 * s, br[1] * s); b.rotation.z = br[2]; g.add(b);
          });
          [[0, 4.15, 0, 2.9, 0.48, leafA], [1.2, 4.0, 0.4, 1.9, 0.40, leafB], [-1.3, 4.05, -0.35, 2.0, 0.42, leafB]].forEach(c => {
            const cap = new THREE.Mesh(new THREE.SphereGeometry(c[3] * s, 12, 8), c[5]);
            cap.scale.set(1.0, c[4] / c[3], 1.0);
            cap.position.set(c[0] * s, c[1] * s, c[2] * s);
            cap.castShadow = true; g.add(cap);
          });
          worldGroup.add(g);
        }
        if (!noCol) addCollider(x, z, 0.55 * s, 0.55 * s);
      }

      function addBaobab(x, z, scale) {
        const s = scale || 1.0;
        if (LS.isHD && LS.hdAssets && LS.hdAssets.has('anime_baobab')) {
          const m = LS.hdAssets.clone('anime_baobab');
          m.position.set(x, 0, z);
          m.rotation.y = x * 0.5 + z * 0.3;
          m.scale.setScalar(s * 1.15);
          worldGroup.add(m);
        } else {
          const g = new THREE.Group(); g.position.set(x, 0, z);
          const bark = LS.makeToonMat(0x8c684c), leaf = LS.makeToonMat(0x558c42);
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.1 * s, 1.45 * s, 3.8 * s, 12), bark);
          trunk.position.y = 1.9 * s; trunk.castShadow = true; g.add(trunk);
          for (let i = 0; i < 6; i++) {
            const ang = (i / 6) * Math.PI * 2;
            const br = new THREE.Mesh(new THREE.CylinderGeometry(0.14 * s, 0.28 * s, 2.2 * s, 6), bark);
            br.position.set(Math.cos(ang) * 0.9 * s, 4.3 * s, Math.sin(ang) * 0.9 * s);
            br.rotation.z = -Math.cos(ang) * 0.55; br.rotation.x = Math.sin(ang) * 0.55; g.add(br);
            const puff = new THREE.Mesh(new THREE.SphereGeometry(1.05 * s, 10, 8), leaf);
            puff.scale.set(1.2, 0.72, 1.2);
            puff.position.set(Math.cos(ang) * 1.65 * s, 5.2 * s, Math.sin(ang) * 1.65 * s);
            puff.castShadow = true; g.add(puff);
          }
          worldGroup.add(g);
        }
        addCollider(x, z, 1.45 * s, 1.45 * s);
      }

      // 1. Golden Savanna Sky Dome, Terrain, Dirt Trails & Mt. Kilimanjaro Horizon
      safeRun('terrain_and_horizon', () => {
        const skyGeo = new THREE.SphereGeometry(225, 24, 16);
        W.skyMesh = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({
          map: LS.createSkyTexture(LS.state.timeMode, 'safari'),
          side: THREE.BackSide,
          fog: false
        }));
        worldGroup.add(W.skyMesh);

        const ground = new THREE.Mesh(
          new THREE.PlaneGeometry(280, 280),
          LS.makeSurfaceMat(LS.createGrassTexture('safari'), { roughness: 0.92 })
        );
        ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; worldGroup.add(ground);

        SC.addCurvedPath(worldGroup, SAFARI_LOOP_PTS, 4.2, 'lane_safari', 0.030);
        SC.addCurvedPath(worldGroup, SAFARI_SOUTH_TRAIL, 3.6, 'lane_safari', 0.028);
        SC.addCurvedPath(worldGroup, SAFARI_AIRSTRIP_TRAIL, 3.0, 'lane_safari', 0.026);
        SC.addCurvedPath(worldGroup, SAFARI_GIRAFFE_TRAIL, 2.6, 'lane_safari', 0.025);
        SC.addCurvedPath(worldGroup, SAFARI_PLAY_TRAIL, 2.4, 'lane_safari', 0.024);

        // Warm ochre base camp courtyard pad
        const campPad = new THREE.Mesh(
          new THREE.CircleGeometry(10.5, 24),
          LS.makeSurfaceMat(LS.createVillageLaneTexture('safari'), { roughness: 0.90 })
        );
        campPad.rotation.x = -Math.PI / 2; campPad.position.set(0, 0.022, 17.5); campPad.receiveShadow = true; worldGroup.add(campPad);

        // Distant Snow-Capped Mt. Kilimanjaro on the northern savanna horizon!
        const kili = new THREE.Group(); kili.position.set(-18, -1, -138);
        const kBase = new THREE.Mesh(new THREE.ConeGeometry(46, 36, 14), LS.makeToonMat(0x7c7482));
        kBase.position.y = 18; kBase.scale.set(1.35, 1.0, 0.95); kili.add(kBase);
        const kFlat = new THREE.Mesh(new THREE.CylinderGeometry(11.5, 18.5, 8.5, 14), LS.makeToonMat(0x908998));
        kFlat.position.y = 32; kili.add(kFlat);
        const kSnow = new THREE.Mesh(new THREE.CylinderGeometry(11.6, 15.2, 4.2, 14), LS.makeToonMat(0xf8f9fc));
        kSnow.position.y = 35.8; kili.add(kSnow);
        worldGroup.add(kili);

        // 360-degree Savanna Horizon Mesas
        if (LS.isHD && LS.hdAssets && LS.hdAssets.addMountainRange) {
          LS.hdAssets.addMountainRange(worldGroup, 'safari');
        } else {
          const mesaMat = LS.makeToonMat(0xb88655);
          [[-86, -72, 18, 9], [78, -68, 22, 11], [94, 10, 20, 8], [-92, 18, 18, 9], [10, 96, 24, 9]].forEach(h => {
            const m = new THREE.Mesh(new THREE.CylinderGeometry(h[2] * 0.72, h[2], h[3], 10), mesaMat);
            m.position.set(h[0], h[3] * 0.45, h[1]); worldGroup.add(m);
          });
        }
      });

      // 2. Safari Base Camp (Welcome Arch, Outfitter Boutique, Ranger Academy, Photo Sticker Booth, Mango Cafe, Safari Jeep)
      safeRun('base_camp', () => {
        const timber = LS.makeSurfaceMat(LS.createCedarPlankTexture(), { roughness: 0.78 });
        const thatch = LS.makeSurfaceMat(LS.createThatchTexture(), { roughness: 0.88, bumpScale: 0.09 });
        const canvas = LS.makeToonMat(0xffffff, { map: LS.createPlasterTexture('#f4ead3') });
        const mud = LS.makeToonMat(0xffffff, { map: LS.createPlasterTexture('#e4c08e') });

        // Grand Timber Savanna Welcome Arch (X=0, Z=12.0)
        const arch = new THREE.Group(); arch.position.set(0, 0, 12.0);
        [-3.4, 3.4].forEach(px => {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.30, 4.6, 10), timber);
          post.position.set(px, 2.3, 0); post.castShadow = true; arch.add(post);
          addCollider(px, 12.0, 0.45, 0.45);
        });
        const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 7.6, 10), timber);
        beam.rotation.z = Math.PI / 2; beam.position.y = 4.45; arch.add(beam);
        // Festive savanna bunting flags & warm hanging camp lanterns under the Welcome Arch!
        const flagCols = [0xf59e0b, 0xe76f51, 0x2a9d8f, 0xe9c46a, 0xd62828, 0x38bdf8];
        for (let fi = 0; fi < 9; fi++) {
          const fx = -2.8 + fi * 0.7;
          const sag = Math.sin((fi / 8) * Math.PI) * 0.28;
          const flag = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.36, 3), LS.makeToonMat(flagCols[fi % flagCols.length]));
          flag.rotation.x = Math.PI; flag.position.set(fx, 4.18 - sag, 0.08); arch.add(flag);
        }
        [-3.05, 3.05].forEach(lx => {
          const lan = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.34, 8), new THREE.MeshBasicMaterial({ color: 0xffe29a }));
          lan.position.set(lx, 3.92, 0.22); arch.add(lan);
          if (LS.isHD && LS.createGlowSprite) {
            const halo = LS.createGlowSprite(0xffcf70, 1.55);
            halo.position.copy(lan.position); arch.add(halo);
          }
        });
        const wSign = new THREE.Mesh(
          new THREE.BoxGeometry(6.2, 1.15, 0.20),
          new THREE.MeshBasicMaterial({ map: LS.createSignTexture('🦁 AFRICAN SAFARI & WILDLIFE ZOO', { bg: '#5c3416', border: '#f5b841', color: '#fff8e8', font: 'bold 31px sans-serif', width: 640 }) })
        );
        wSign.position.set(0, 4.75, 0.12); arch.add(wSign);
        worldGroup.add(arch);

        // Helper for cozy thatched Safari Lodges / Tents
        function buildSafariLodge(cx, cz, rotY, opts) {
          const g = new THREE.Group(); g.position.set(cx, 0, cz); g.rotation.y = rotY;
          const wall = new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.0, 4.4), opts.isTent ? canvas : mud);
          wall.position.y = 1.5; wall.castShadow = true; wall.receiveShadow = true; g.add(wall);
          const roof = new THREE.Mesh(new THREE.ConeGeometry(4.3, 2.2, 4), thatch);
          roof.rotation.y = Math.PI / 4; roof.position.y = 4.0; roof.castShadow = true; g.add(roof);
          const door = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.1, 0.12), timber);
          door.position.set(0, 1.05, 2.22); g.add(door);
          [-1.55, 1.55].forEach(wx => {
            const win = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.85, 0.12), LS.makeEmissiveMat(0xffe6a7, 0xffc86b, 0.48));
            win.position.set(wx, 1.85, 2.22); g.add(win);
          });
          // Warm camp porch lantern (+ HD glow halo)
          const lLan = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.28, 8), new THREE.MeshBasicMaterial({ color: 0xffe29a }));
          lLan.position.set(1.02, 2.28, 2.38); g.add(lLan);
          if (LS.isHD && LS.createGlowSprite) {
            const halo = LS.createGlowSprite(0xffcf70, 1.35);
            halo.position.copy(lLan.position); g.add(halo);
          }
          const sign = new THREE.Mesh(
            new THREE.BoxGeometry(3.8, 0.72, 0.14),
            new THREE.MeshBasicMaterial({ map: LS.createSignTexture(opts.sign, { bg: opts.bg, border: '#f5b841', color: '#fff8eb', font: 'bold 30px sans-serif', width: 512 }) })
          );
          sign.position.set(0, 3.25, 2.38); g.add(sign);
          worldGroup.add(g);
          addCollider(cx, cz, 2.75, 2.45);
        }

        // West Base Camp: Safari Outfitter Boutique
        buildSafariLodge(-11.5, 14.5, Math.PI * 0.32, { isTent: true, sign: '🎒 SAFARI OUTFITTER', bg: '#6b4c28' });
        W.zones.push({ id: 'safari_shop', label: 'Visit Safari Outfitter Boutique 🎒', pos: new THREE.Vector3(-8.6, 0, 16.0), radius: 3.4 });

        // East Base Camp: Savanna Ranger Academy
        buildSafariLodge(11.5, 14.5, -Math.PI * 0.32, { isTent: false, sign: '📚 RANGER ACADEMY', bg: '#234232' });
        W.zones.push({ id: 'safari_academy', label: 'Enter Savanna Ranger Academy Quiz 🦁', pos: new THREE.Vector3(8.6, 0, 16.0), radius: 3.4 });

        // Southwest Base Camp: Wildlife Photo Sticker Booth
        const booth = new THREE.Group(); booth.position.set(-9.6, 0, 23.2); booth.rotation.y = Math.PI * 0.22;
        const bBody = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.4, 2.0), LS.makeToonMat(0xd97706));
        bBody.position.y = 1.2; bBody.castShadow = true; booth.add(bBody);
        const bRoof = new THREE.Mesh(new THREE.ConeGeometry(2.3, 1.1, 4), thatch);
        bRoof.rotation.y = Math.PI / 4; bRoof.position.y = 2.9; booth.add(bRoof);
        const bSign = new THREE.Mesh(
          new THREE.BoxGeometry(2.6, 0.62, 0.14),
          new THREE.MeshBasicMaterial({ map: LS.createSignTexture('📸 WILDLIFE STICKERS', { bg: '#7c2d12', border: '#fcd34d', color: '#fffbeb', font: 'bold 28px sans-serif' }) })
        );
        bSign.position.set(0, 2.55, 1.08); booth.add(bSign);
        worldGroup.add(booth); addCollider(-9.6, 23.2, 1.55, 1.25);
        W.zones.push({ id: 'safari_stickers', label: 'Wildlife Photo Sticker Booth 📸 (15c)', pos: new THREE.Vector3(-7.6, 0, 24.4), radius: 3.1 });

        // Southeast Base Camp: Mama Nia's Mango Smoothie Cafe
        const cafe = new THREE.Group(); cafe.position.set(9.6, 0, 23.2); cafe.rotation.y = -Math.PI * 0.22;
        const cCounter = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.05, 1.5), timber);
        cCounter.position.y = 0.52; cCounter.castShadow = true; cafe.add(cCounter);
        [[-1.6, -0.6], [1.6, -0.6], [-1.6, 0.6], [1.6, 0.6]].forEach(p => {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 2.7, 6), timber);
          post.position.set(p[0], 1.35, p[1]); cafe.add(post);
        });
        // Colorful tropical smoothie pitchers & mango basket on the counter!
        [0xffb703, 0xff5d8f, 0x52b788].forEach((sc, idx) => {
          const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.10, 0.34, 8), LS.makeToonMat(sc));
          jar.position.set(-0.95 + idx * 0.42, 1.22, 0.28); cafe.add(jar);
        });
        [0xf59e0b, 0xfb923c, 0xfacc15].forEach((mc, idx) => {
          const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), LS.makeToonMat(mc));
          fruit.position.set(0.62 + idx * 0.26, 1.16, 0.22); cafe.add(fruit);
        });
        const cLan = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.12, 0.26, 8), new THREE.MeshBasicMaterial({ color: 0xffe29a }));
        cLan.position.set(-1.35, 2.25, 0.72); cafe.add(cLan);
        if (LS.isHD && LS.createGlowSprite) {
          const halo = LS.createGlowSprite(0xffcf70, 1.3);
          halo.position.copy(cLan.position); cafe.add(halo);
        }
        const cRoof = new THREE.Mesh(new THREE.ConeGeometry(3.0, 1.25, 4), thatch);
        cRoof.rotation.y = Math.PI / 4; cRoof.position.y = 3.15; cRoof.castShadow = true; cafe.add(cRoof);
        const cSign = new THREE.Mesh(
          new THREE.BoxGeometry(3.2, 0.64, 0.14),
          new THREE.MeshBasicMaterial({ map: LS.createSignTexture('🥭 MANGO SMOOTHIE CAFE', { bg: '#9a3412', border: '#fde047', color: '#fffbeb', font: 'bold 28px sans-serif' }) })
        );
        cSign.position.set(0, 2.68, 0.85); cafe.add(cSign);
        worldGroup.add(cafe); addCollider(9.6, 23.2, 1.9, 1.0);
        W.zones.push({ id: 'safari_cafe', label: "Visit Mama Nia's Mango Smoothie Cafe 🥭", pos: new THREE.Vector3(7.6, 0, 24.4), radius: 3.2 });

        // Parked Zebra-Striped Safari Jeep (Interactive Guided Savanna Tour!)
        let jeep;
        if (LS.isHD && LS.hdAssets && LS.hdAssets.has('anime_safari_jeep')) {
          jeep = LS.hdAssets.clone('anime_safari_jeep');
          jeep.scale.setScalar(1.08);
        } else {
          jeep = new THREE.Group();
          const bodyM = LS.makeToonMat(0xf4e8c8), stripeM = LS.makeToonMat(0x282420), khakiM = LS.makeToonMat(0xc4aa78), tireM = LS.makeToonMat(0x222226);
          const hull = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.72, 3.8), bodyM); hull.position.y = 0.82; hull.castShadow = true; jeep.add(hull);
          for (let s = -1.4; s <= 1.4; s += 0.56) {
            const st = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.62, 0.16), stripeM); st.position.set(0, 0.84, s); jeep.add(st);
          }
          const roof = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.12, 2.35), khakiM); roof.position.set(0, 2.08, -0.55); jeep.add(roof);
          [[-0.82, 0.5], [0.82, 0.5], [-0.82, -1.6], [0.82, -1.6]].forEach(p => {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 6), stripeM); post.position.set(p[0], 1.56, p[1]); jeep.add(post);
          });
          [[-0.95, 1.2], [0.95, 1.2], [-0.95, -1.15], [0.95, -1.15]].forEach(w => {
            const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.24, 12), tireM);
            wh.rotation.z = Math.PI / 2; wh.position.set(w[0], 0.42, w[1]); jeep.add(wh);
          });
        }
        jeep.position.set(-4.8, 0, 7.8);
        jeep.rotation.y = -Math.PI * 0.65;
        worldGroup.add(jeep);
        W.safariJeep = jeep;
        W.jeepHome = { pos: new THREE.Vector3(-4.8, 0, 7.8), rotY: -Math.PI * 0.65, exit: new THREE.Vector3(-2.4, 0, 8.8) };
        W.jeepPath = new THREE.CatmullRomCurve3(SAFARI_LOOP_PTS.map(p => new THREE.Vector3(p[0], 0, p[1])), false, 'catmullrom', 0.45);
        W.zones.push({ id: 'safari_jeep', label: 'Ride Safari Jeep Guided Tour! 🚙 (+25c)', pos: new THREE.Vector3(-4.8, 0, 7.8), radius: 3.4 });
      });

      // 3. Giraffe & Acacia Feeding Sanctuary (West: X=-44..-20, Z=-10..12)
      safeRun('giraffe_sanctuary', () => {
        const plankMat = LS.makeSurfaceMat(LS.createCedarPlankTexture(), { roughness: 0.78 });
        const railMat = LS.makeToonMat(0x6e472c);

        // Elevated Cedar Giraffe Feeding Deck (X=-26.6..-22.2, Z=-0.6..4.6, Y=0.85) + East Ramp
        const deck = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.22, 5.2), plankMat);
        deck.position.set(-24.4, 0.78, 2.0); deck.castShadow = true; deck.receiveShadow = true; worldGroup.add(deck);
        [[-26.4, -0.3], [-22.4, -0.3], [-26.4, 4.3], [-22.4, 4.3]].forEach(p => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.85, 8), railMat);
          leg.position.set(p[0], 0.42, p[1]); worldGroup.add(leg);
        });
        // Smooth East Ramp ascending from X=-19.8 to -22.2
        for (let i = 0; i < 6; i++) {
          const t = (i + 0.5) / 6;
          const step = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.16, 3.2), plankMat);
          step.position.set(-19.8 - t * 2.4, t * 0.85 - 0.04, 2.0);
          step.rotation.z = -Math.atan2(0.85, 2.4); step.receiveShadow = true; worldGroup.add(step);
        }
        // Open cedar post-and-rail safety fences along North, South, and West deck edges + solid railing colliders!
        const addDeckRail = (x1, z1, x2, z2) => {
          const len = Math.hypot(x2 - x1, z2 - z1);
          const cx = (x1 + x2) * 0.5, cz = (z1 + z2) * 0.5;
          const rot = Math.atan2(x2 - x1, z2 - z1);
          [1.26, 1.68].forEach(ry => {
            const bar = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.08, len), railMat);
            bar.position.set(cx, ry, cz); bar.rotation.y = rot; bar.castShadow = true; worldGroup.add(bar);
          });
          const posts = Math.max(2, Math.round(len / 1.5));
          for (let i = 0; i <= posts; i++) {
            const t = i / posts;
            const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.96, 0.14), railMat);
            post.position.set(x1 + (x2 - x1) * t, 1.32, z1 + (z2 - z1) * t); post.castShadow = true; worldGroup.add(post);
          }
        };
        addDeckRail(-26.65, -0.55, -26.65, 4.55);
        addDeckRail(-26.65, -0.55, -22.20, -0.55);
        addDeckRail(-26.65, 4.55, -22.20, 4.55);
        addCollider(-26.75, 2.0, 0.28, 2.75);
        addCollider(-24.4, -0.65, 2.45, 0.28);
        addCollider(-24.4, 4.65, 2.45, 0.28);

        const gSign = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 0.65, 2.1),
          new THREE.MeshBasicMaterial({ map: LS.createSignTexture('🦒 FEED GIRAFFES', { bg: '#fef3c7', border: '#d97706', color: '#78350f', font: 'bold 34px sans-serif' }) })
        );
        gSign.position.set(-26.6, 1.88, -0.2); worldGroup.add(gSign);
        W.zones.push({ id: 'safari_feed_giraffe', label: 'Feed Tall Giraffes Acacia Leaves 🦒 (+15c)', pos: new THREE.Vector3(-25.2, 0.85, 2.0), radius: 2.8 });

        // Helper to build a giraffe (HD GLB or Classic multi-part!)
        function buildGiraffe(x, z, rotY, sc) {
          const wrap = new THREE.Group();
          wrap.position.set(x, 0, z); wrap.rotation.y = rotY;
          let inner;
          if (LS.isHD && LS.hdAssets && LS.hdAssets.has('anime_giraffe')) {
            inner = LS.hdAssets.clone('anime_giraffe');
          } else {
            inner = new THREE.Group();
            const hideM = LS.makeToonMat(0xffffff, { map: LS.createGiraffeHideTexture() }), spotM = LS.makeToonMat(0x8d4e24), creamM = LS.makeToonMat(0xf8ebd0), darkM = LS.makeToonMat(0x281e18);
            const body = new THREE.Mesh(new THREE.SphereGeometry(0.68, 12, 8), hideM); body.scale.set(0.82, 0.85, 1.5); body.position.y = 2.05; body.castShadow = true; inner.add(body);
            [[-0.3, 0.58], [0.3, 0.58], [-0.28, -0.62], [0.28, -0.62]].forEach(l => {
              const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 2.0, 8), creamM); leg.position.set(l[0], 1.0, l[1]); inner.add(leg);
            });
            const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.30, 2.35, 10), hideM); neck.position.set(0, 3.25, 0.92); neck.rotation.x = 0.22; neck.castShadow = true; inner.add(neck);
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), hideM); head.position.set(0, 4.42, 1.32); inner.add(head);
            const snout = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), creamM); snout.scale.set(0.8, 0.75, 1.35); snout.position.set(0, 4.35, 1.62); inner.add(snout);
            [-0.1, 0.1].forEach(ox => {
              const horn = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.25, 6), spotM); horn.position.set(ox, 4.72, 1.24); inner.add(horn);
              const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), darkM); eye.position.set(ox * 1.7, 4.46, 1.48); inner.add(eye);
            });
          }
          inner.scale.setScalar(sc);
          wrap.add(inner);
          worldGroup.add(wrap);
          addCollider(x, z, 0.95 * sc, 0.95 * sc);
          W.giraffes.push({ root: wrap, inner, baseRot: rotY, phase: x * 0.4 + z * 0.3 });
        }

        buildGiraffe(-29.2, 2.2, Math.PI * 0.5, 1.08);
        buildGiraffe(-32.8, -1.8, Math.PI * 0.32, 1.0);
        buildGiraffe(-30.5, 6.2, Math.PI * 0.72, 0.72); // Baby giraffe calf!
        addAcacia(-35.5, 2.8, 1.25);
        addAcacia(-31.0, -7.2, 1.05);
      });

      // 4. Elephant Oasis & Flamingo Watering Hole (Northwest: X=-44..-16, Z=-42..-16)
      safeRun('elephant_oasis', () => {
        // Sandy shoreline verge + sunlit turquoise savanna watering hole right above ground!
        const shoreSand = new THREE.Mesh(new THREE.CircleGeometry(12.8, 32), LS.makeToonMat(0xc49c64));
        shoreSand.rotation.x = -Math.PI / 2; shoreSand.position.set(-29.5, 0.028, -28.5); shoreSand.receiveShadow = true; worldGroup.add(shoreSand);
        const deepBed = new THREE.Mesh(new THREE.CircleGeometry(11.6, 32), LS.makeToonMat(0x1f6270));
        deepBed.rotation.x = -Math.PI / 2; deepBed.position.set(-29.5, 0.042, -28.5); worldGroup.add(deepBed);
        const pondMat = (LS.isHD && LS.createAAAPondWaterMaterial)
          ? LS.createAAAPondWaterMaterial()
          : LS.makeWaterMat(0.86, THREE.DoubleSide);
        const water = new THREE.Mesh(new THREE.CircleGeometry(11.3, 32), pondMat);
        water.rotation.x = -Math.PI / 2; water.position.set(-29.5, 0.075, -28.5); worldGroup.add(water);
        // Solid water collider keeping player safely on shore/boardwalk!
        addCollider(-29.5, -28.5, 10.6, 10.6);

        // Warm ochre shoreline boulders + papyrus reeds
        const rockMats = [LS.makeToonMat(0x9a7554), LS.makeToonMat(0xb2875e), LS.makeToonMat(0x7c5e44)];
        for (let i = 0; i < 22; i++) {
          const ang = (i / 22) * Math.PI * 2;
          if (Math.abs(ang) < 0.34) continue; // Keep east boardwalk clear
          const rx = -29.5 + Math.cos(ang) * (11.5 + (i % 3) * 0.45);
          const rz = -28.5 + Math.sin(ang) * (11.5 + ((i + 1) % 3) * 0.45);
          const rk = new THREE.Mesh(new THREE.DodecahedronGeometry(0.75 + (i % 3) * 0.25, 0), rockMats[i % rockMats.length]);
          rk.scale.set(1.25, 0.58, 1.05); rk.position.set(rx, 0.12, rz); rk.castShadow = true; worldGroup.add(rk);
          if (i % 2 === 0) SC.addTallGrass(worldGroup, rx + Math.cos(ang) * 0.55, rz + Math.sin(ang) * 0.55, 1.35);
        }

        // East Elephant Viewing & Feeding Boardwalk (X=-18.8..-16.2, Z=-28.5) with open cedar rails!
        const plankMat = LS.makeSurfaceMat(LS.createCedarPlankTexture(), { roughness: 0.78 });
        const railMat = LS.makeToonMat(0x6e472c);
        const bw = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.16, 4.4), plankMat);
        bw.position.set(-17.6, 0.12, -28.5); bw.receiveShadow = true; worldGroup.add(bw);
        [0.48, 0.88].forEach(ry => {
          const bar = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.08, 4.4), railMat);
          bar.position.set(-18.92, ry, -28.5); bar.castShadow = true; worldGroup.add(bar);
        });
        [-30.6, -29.2, -27.8, -26.4].forEach(pz => {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.92, 0.14), railMat);
          post.position.set(-18.92, 0.54, pz); post.castShadow = true; worldGroup.add(post);
        });
        const eSign = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 0.65, 2.1),
          new THREE.MeshBasicMaterial({ map: LS.createSignTexture('🐘 ELEPHANT OASIS', { bg: '#e0f2fe', border: '#0284c7', color: '#0c4a6e', font: 'bold 34px sans-serif' }) })
        );
        eSign.position.set(-18.9, 1.25, -26.4); worldGroup.add(eSign);
        W.zones.push({ id: 'safari_feed_elephant', label: 'Feed Gentle Elephants Melons 🐘 (+15c)', pos: new THREE.Vector3(-17.4, 0, -28.5), radius: 3.1 });

        // Splash water rings around the baby elephant
        for (let r = 0; r < 3; r++) {
          const ring = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.64, 20), new THREE.MeshBasicMaterial({ color: 0xe6f9ff, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
          ring.rotation.x = -Math.PI / 2; ring.position.set(-24.2, 0.10, -27.5); worldGroup.add(ring);
          W.splashRings.push(ring);
        }

        // 3 Gentle Elephants (2 adults + 1 splashing calf!)
        function buildElephant(x, y, z, rotY, sc) {
          const wrap = new THREE.Group(); wrap.position.set(x, y, z); wrap.rotation.y = rotY;
          let inner;
          if (LS.isHD && LS.hdAssets && LS.hdAssets.has('anime_elephant')) {
            inner = LS.hdAssets.clone('anime_elephant');
          } else {
            inner = new THREE.Group();
            const hideM = LS.makeToonMat(0x8e939c), ivoryM = LS.makeToonMat(0xfbf6e8), darkM = LS.makeToonMat(0x1f1d1c);
            const body = new THREE.Mesh(new THREE.SphereGeometry(1.12, 14, 10), hideM); body.scale.set(0.9, 0.85, 1.2); body.position.y = 1.65; body.castShadow = true; inner.add(body);
            [[-0.5, 0.6], [0.5, 0.6], [-0.48, -0.7], [0.48, -0.7]].forEach(l => {
              const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.30, 1.45, 8), hideM); leg.position.set(l[0], 0.72, l[1]); inner.add(leg);
            });
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.68, 12, 10), hideM); head.position.set(0, 2.25, 1.05); inner.add(head);
            [-0.85, 0.85].forEach(ex => {
              const ear = new THREE.Mesh(new THREE.SphereGeometry(0.58, 10, 8), hideM); ear.scale.set(0.95, 1.15, 0.22); ear.position.set(ex, 2.22, 0.82); inner.add(ear);
            });
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 1.25, 8), hideM); trunk.position.set(0, 1.55, 1.68); trunk.rotation.x = 0.28; inner.add(trunk);
            [-0.28, 0.28].forEach(tx => {
              const tusk = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.65, 6), ivoryM); tusk.position.set(tx, 1.72, 1.62); tusk.rotation.x = 1.15; inner.add(tusk);
              const eye = new THREE.Mesh(new THREE.SphereGeometry(0.065, 6, 6), darkM); eye.position.set(tx * 1.55, 2.36, 1.54); inner.add(eye);
            });
          }
          inner.scale.setScalar(sc); wrap.add(inner); worldGroup.add(wrap);
          W.elephants.push({ root: wrap, baseY: y, baseRot: rotY, phase: x * 0.5 + z * 0.2 });
        }

        buildElephant(-26.8, -0.08, -32.2, Math.PI * 0.35, 1.08);
        buildElephant(-33.5, -0.10, -25.8, Math.PI * 0.62, 1.02);
        buildElephant(-24.2, -0.12, -27.5, Math.PI * 0.48, 0.64); // Playful baby elephant wading in water!

        // 6 Graceful Pink Flamingos wading in the watering hole shallows!
        const flamMat = LS.makeToonMat(0xff7aa2), flamDark = LS.makeToonMat(0x281e1c), flamLeg = LS.makeToonMat(0xe8658c);
        [[-34.0, -33.2], [-35.5, -31.4], [-32.2, -35.0], [-27.8, -21.2], [-25.6, -22.5], [-30.0, -20.8]].forEach((fp, idx) => {
          const fg = new THREE.Group(); fg.position.set(fp[0], 0.04, fp[1]); fg.rotation.y = idx * 1.1;
          if (LS.isHD && LS.hdAssets && LS.hdAssets.has('anime_flamingo')) {
            const mdl = LS.hdAssets.clone('anime_flamingo');
            mdl.scale.setScalar(0.95 + (idx % 3) * 0.06);
            fg.add(mdl);
          } else {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.78, 5), flamLeg); leg.position.y = 0.39; fg.add(leg);
            const body = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), flamMat); body.scale.set(0.75, 0.72, 1.35); body.position.y = 0.85; fg.add(body);
            const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.65, 6), flamMat); neck.position.set(0, 1.24, 0.22); neck.rotation.x = 0.16; fg.add(neck);
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.095, 8, 6), flamMat); head.position.set(0, 1.56, 0.28); fg.add(head);
            const beak = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 5), flamDark); beak.position.set(0, 1.52, 0.38); beak.rotation.x = 1.9; fg.add(beak);
          }
          worldGroup.add(fg);
          W.flamingos.push({ root: fg, phase: idx * 0.9 });
        });
      });

      // 5. Pride Rock Kopje & Resting King Lion / Lioness (North: X=-6..14, Z=-48..-32)
      safeRun('pride_rock', () => {
        const sandTex = LS.createSandstoneTexture();
        const rockA = LS.makeSurfaceMat(sandTex, { color: 0xe6cca8, roughness: 0.88, bumpScale: 0.09 });
        const rockB = LS.makeSurfaceMat(sandTex, { color: 0xc4a078, roughness: 0.90, bumpScale: 0.10 });
        const rockC = LS.makeSurfaceMat(sandTex, { color: 0xf4dcba, roughness: 0.85, bumpScale: 0.08 });
        const kopje = new THREE.Group(); kopje.position.set(3.0, 0, -40.5);
        // Sculpted angular granite kopje crags + iconic jutting Pride Rock promontory!
        [
          [0.0, 1.2, -1.8, 5.8, 1.35, 0.62, 1.05, 0.2, rockB],
          [-4.2, 1.8, -1.2, 3.6, 1.15, 0.85, 0.95, 0.7, rockA],
          [4.0, 1.5, -2.0, 3.8, 1.20, 0.72, 0.92, -0.5, rockB],
          [-1.5, 3.4, -2.2, 3.4, 1.15, 0.88, 0.95, 0.4, rockA],
          [1.8, 2.8, -0.8, 3.0, 1.05, 0.78, 0.95, -0.3, rockC]
        ].forEach(c => {
          const crag = new THREE.Mesh(new THREE.DodecahedronGeometry(c[3], 0), c[8]);
          crag.scale.set(c[4], c[5], c[6]); crag.rotation.y = c[7];
          crag.position.set(c[0], c[1], c[2]); crag.castShadow = true; crag.receiveShadow = true; kopje.add(crag);
        });
        const ledge = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.05, 7.6), rockC);
        ledge.position.set(0.4, 3.65, 2.2); ledge.rotation.x = -0.22; ledge.castShadow = true; kopje.add(ledge);
        worldGroup.add(kopje);
        addCollider(3.0, -40.5, 7.6, 6.2);

        // Majestic Resting King Lion + Lioness perched atop Pride Rock (clearly visible from road & Jeep!)
        const king = new THREE.Group(); king.position.set(3.4, 4.48, -35.6); king.rotation.y = 0.08;
        if (LS.isHD && LS.hdAssets && LS.hdAssets.has('anime_lion_king')) {
          const kMdl = LS.hdAssets.clone('anime_lion_king');
          kMdl.scale.setScalar(1.16);
          king.add(kMdl);
        } else {
          const furM = LS.makeToonMat(0xe5a94c), maneM = LS.makeToonMat(0x7c3e18), creamM = LS.makeToonMat(0xfbe8c2), darkM = LS.makeToonMat(0x1e1612);
          const kBody = new THREE.Mesh(new THREE.SphereGeometry(0.62, 12, 8), furM); kBody.scale.set(0.82, 0.75, 1.55); kBody.position.y = 0.45; kBody.castShadow = true; king.add(kBody);
          const kMane = new THREE.Mesh(new THREE.DodecahedronGeometry(0.74, 1), maneM); kMane.position.set(0, 0.94, 0.72); kMane.castShadow = true; king.add(kMane);
          const kHead = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), furM); kHead.position.set(0, 0.96, 0.98); king.add(kHead);
          const kSnout = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), creamM); kSnout.scale.set(1.05, 0.78, 1.15); kSnout.position.set(0, 0.88, 1.34); king.add(kSnout);
          const kNose = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), darkM); kNose.position.set(0, 0.94, 1.54); king.add(kNose);
          [-0.28, 0.28].forEach(ex => {
            const ear = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), furM); ear.position.set(ex, 1.32, 0.90); king.add(ear);
            const paw = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), furM); paw.scale.set(0.85, 0.55, 1.6); paw.position.set(ex * 1.1, 0.14, 1.05); king.add(paw);
          });
          [-0.17, 0.17].forEach(ex => {
            const e = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), darkM); e.position.set(ex, 1.04, 1.35); king.add(e);
          });
          const kTail = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.85, 6), furM);
          kTail.rotation.x = 1.18; kTail.position.set(0.18, 0.36, -1.05); king.add(kTail);
          const kTuft = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), maneM); kTuft.position.set(0.26, 0.22, -1.42); king.add(kTuft);
        }
        worldGroup.add(king);

        const queen = new THREE.Group(); queen.position.set(1.5, 4.18, -36.8); queen.rotation.y = 0.28;
        if (LS.isHD && LS.hdAssets && LS.hdAssets.has('anime_lioness')) {
          const qMdl = LS.hdAssets.clone('anime_lioness');
          qMdl.scale.setScalar(1.12);
          queen.add(qMdl);
        } else {
          const furM = LS.makeToonMat(0xe5a94c), maneM = LS.makeToonMat(0x7c3e18), creamM = LS.makeToonMat(0xfbe8c2), darkM = LS.makeToonMat(0x1e1612);
          const qBody = new THREE.Mesh(new THREE.SphereGeometry(0.52, 10, 8), furM); qBody.scale.set(0.78, 0.72, 1.48); qBody.position.y = 0.38; qBody.castShadow = true; queen.add(qBody);
          const qHead = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), furM); qHead.position.set(0, 0.78, 0.74); queen.add(qHead);
          const qSnout = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), creamM); qSnout.position.set(0, 0.72, 1.02); queen.add(qSnout);
          const qNose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), darkM); qNose.position.set(0, 0.77, 1.16); queen.add(qNose);
          [-0.22, 0.22].forEach(ex => {
            const ear = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), furM); ear.position.set(ex, 1.06, 0.68); queen.add(ear);
            const paw = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), furM); paw.scale.set(0.85, 0.55, 1.55); paw.position.set(ex * 1.1, 0.12, 0.85); queen.add(paw);
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.048, 6, 6), darkM); eye.position.set(ex * 0.65, 0.84, 1.04); queen.add(eye);
          });
          const qTail = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.72, 6), furM);
          qTail.rotation.x = 1.22; qTail.position.set(-0.15, 0.28, -0.88); queen.add(qTail);
          const qTuft = new THREE.Mesh(new THREE.SphereGeometry(0.095, 8, 6), maneM); qTuft.position.set(-0.22, 0.18, -1.18); queen.add(qTuft);
        }
        worldGroup.add(queen);

        // Friendly resting Savanna Lioness sunbathing at the grassy eastern base of Pride Rock!
        const sunLioness = new THREE.Group(); sunLioness.position.set(8.6, 0, -33.6); sunLioness.rotation.y = -0.52;
        if (LS.isHD && LS.hdAssets && LS.hdAssets.has('anime_lioness')) {
          const sMdl = LS.hdAssets.clone('anime_lioness');
          sMdl.scale.setScalar(1.08);
          sunLioness.add(sMdl);
          worldGroup.add(sunLioness);
          addCollider(8.6, -33.6, 1.1, 1.1);
        }

        addBaobab(-9.5, -42.0, 1.15);
        addBaobab(16.5, -38.5, 1.05);
      });

      // 6. Zebra Open Savanna Meadow (East: X=20..48, Z=-24..8)
      safeRun('zebra_meadow', () => {
        const coatMat = LS.makeToonMat(0xffffff, { map: LS.createZebraHideTexture() });
        const wMat = LS.makeToonMat(0xf8f6f0), bMat = LS.makeToonMat(0x232022);
        const zebraCoords = [
          [31.0, -14.0, 0.6, 1.06], [35.5, -9.5, -0.8, 1.02], [39.0, -16.5, 1.9, 0.98], [33.5, -2.5, -1.4, 1.04], [41.5, -5.0, 2.5, 0.78]
        ];
        zebraCoords.forEach((zc, idx) => {
          const zg = new THREE.Group(); zg.position.set(zc[0], 0, zc[1]); zg.rotation.y = zc[2];
          let neckPivot = null;
          let inner = null;
          if (LS.isHD && LS.hdAssets && LS.hdAssets.has('anime_zebra')) {
            inner = LS.hdAssets.clone('anime_zebra');
            inner.scale.setScalar(zc[3]);
            zg.add(inner);
          } else {
            inner = new THREE.Group();
            const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 10), coatMat); body.scale.set(0.80, 0.80, 1.52); body.position.y = 1.05; body.castShadow = true; inner.add(body);
            [[-0.24, 0.45], [0.24, 0.45], [-0.24, -0.45], [0.24, -0.45]].forEach(l => {
              const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.84, 8), coatMat); leg.position.set(l[0], 0.50, l[1]); inner.add(leg);
              const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, 0.12, 8), bMat); hoof.position.set(l[0], 0.06, l[1]); inner.add(hoof);
            });
            const zTail = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.032, 0.48, 5), wMat);
            zTail.position.set(0, 0.88, -0.86); zTail.rotation.x = 0.35; inner.add(zTail);
            const zTuft = new THREE.Mesh(new THREE.SphereGeometry(0.075, 6, 6), bMat);
            zTuft.position.set(0, 0.65, -0.96); inner.add(zTuft);

            neckPivot = new THREE.Group(); neckPivot.position.set(0, 1.25, 0.58);
            const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.68, 8), coatMat); neck.position.set(0, 0.28, 0.14); neck.rotation.x = 0.35; neckPivot.add(neck);
            const mane = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.56, 0.16), bMat); mane.position.set(0, 0.36, 0.02); mane.rotation.x = 0.35; neckPivot.add(mane);
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), coatMat); head.scale.set(0.75, 0.82, 1.45); head.position.set(0, 0.58, 0.36); neckPivot.add(head);
            const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), bMat); muzzle.position.set(0, 0.54, 0.62); neckPivot.add(muzzle);
            [-0.12, 0.12].forEach(ex => {
              const ear = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.20, 6), wMat); ear.position.set(ex, 0.80, 0.26); ear.rotation.z = -ex * 1.4; neckPivot.add(ear);
              const eye = new THREE.Mesh(new THREE.SphereGeometry(0.038, 6, 6), bMat); eye.position.set(ex * 1.15, 0.62, 0.44); neckPivot.add(eye);
            });
            inner.add(neckPivot);
            inner.scale.setScalar(zc[3]);
            zg.add(inner);
          }
          worldGroup.add(zg);
          addCollider(zc[0], zc[1], 0.85 * zc[3], 0.85 * zc[3]);
          W.zebras.push({ root: zg, inner, neck: neckPivot, baseRot: zc[2], phase: idx * 1.3 });
        });

        // Sculpted organic red-ochre multi-chimney Savanna Termite Mounds (textured terracotta clay!)
        const moundM = LS.makeSurfaceMat(LS.createTermiteClayTexture(), { roughness: 0.90, bumpScale: 0.08 });
        [[28.5, -22.5, 1.2], [44.0, -12.0, 1.45], [37.5, 4.5, 1.05]].forEach((tm, idx) => {
          const mg = new THREE.Group(); mg.position.set(tm[0], 0, tm[1]); mg.rotation.y = idx * 1.1;
          const s = tm[2];
          // Broad lumpy earthen base + stacked irregular ventilation chimneys
          const base = new THREE.Mesh(new THREE.DodecahedronGeometry(0.95 * s, 1), moundM);
          base.scale.set(1.15, 0.72, 1.05); base.position.y = 0.45 * s; base.castShadow = true; base.receiveShadow = true; mg.add(base);
          const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * s, 0.54 * s, 2.05 * s, 9), moundM);
          spire.position.set(-0.08 * s, 1.15 * s, 0.04 * s); spire.castShadow = true; mg.add(spire);
          const cap = new THREE.Mesh(new THREE.SphereGeometry(0.24 * s, 8, 6), moundM);
          cap.scale.set(1.0, 1.25, 1.0); cap.position.set(-0.08 * s, 2.18 * s, 0.04 * s); mg.add(cap);
          [[0.46, 0.75, 0.22, 0.34, 1.35], [-0.42, 0.58, -0.25, 0.28, 1.05], [0.18, 0.48, -0.42, 0.24, 0.88]].forEach(ch => {
            const cMesh = new THREE.Mesh(new THREE.CylinderGeometry(ch[3] * 0.45 * s, ch[3] * s, ch[4] * s, 8), moundM);
            cMesh.position.set(ch[0] * s, ch[1] * s, ch[2] * s); cMesh.castShadow = true; mg.add(cMesh);
            const cTop = new THREE.Mesh(new THREE.SphereGeometry(ch[3] * 0.48 * s, 7, 6), moundM);
            cTop.position.set(ch[0] * s, (ch[1] + ch[4] * 0.5) * s, ch[2] * s); mg.add(cTop);
          });
          worldGroup.add(mg); addCollider(tm[0], tm[1], 1.0 * s, 1.0 * s);
        });
      });

      // 7. Savanna Kids' Nature Playground (Southwest: X=-25..-14, Z=23..32)
      safeRun('savanna_playground', () => {
        const wood = LS.makeToonMat(0x8c5a32), slideCol = LS.makeToonMat(0xe76f51);
        const sTop = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.0, 1.4), wood); sTop.position.set(-22.8, 1.0, 24.8); sTop.castShadow = true; worldGroup.add(sTop);
        const chute = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.14, 4.2), slideCol); chute.position.set(-22.8, 1.1, 27.1); chute.rotation.x = 0.50; chute.castShadow = true; worldGroup.add(chute);
        addCollider(-22.8, 24.8, 0.85, 0.85);
        W.zones.push({ id: 'park_slide', label: 'Slide Down Safari Lookout Slide 🛝', pos: new THREE.Vector3(-22.8, 0, 26.8), radius: 2.6 });

        [-19.2, -16.4].forEach(sx => {
          const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.10, 2.9, 6), wood); p.position.set(sx, 1.45, 29.8); worldGroup.add(p);
        });
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.0, 6), wood); bar.rotation.z = Math.PI / 2; bar.position.set(-17.8, 2.85, 29.8); worldGroup.add(bar);
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.10, 0.42), slideCol); seat.position.set(-17.8, 0.72, 29.8); worldGroup.add(seat);
        W.zones.push({ id: 'park_swing', label: 'Swing Under the Acacia Tree 🎠', pos: new THREE.Vector3(-17.8, 0, 29.8), radius: 2.4 });

        for (let h = 0; h < 5; h++) {
          const sq = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.68), LS.makeToonMat(h % 2 === 0 ? 0xffd166 : 0xf4a261));
          sq.rotation.x = -Math.PI / 2; sq.position.set(-16.0, 0.035, 23.6 + h * 0.75); worldGroup.add(sq);
        }
        W.zones.push({ id: 'park_hopscotch', label: 'Play Savanna Paw Hopscotch 🎯 (+20c)', pos: new THREE.Vector3(-16.0, 0, 24.8), radius: 2.2 });
      });

      // 8. Safari Airstrip & Bush Propeller Plane (Southeast: X=24..52, Z=18..42)
      safeRun('safari_airstrip', () => {
        const dirtStrip = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 42), LS.makeToonMat(0x9a6d45));
        dirtStrip.rotation.x = -Math.PI / 2; dirtStrip.position.set(42.5, 0.025, 26.0); dirtStrip.receiveShadow = true; worldGroup.add(dirtStrip);
        const whiteM = LS.makeToonMat(0xfef9ee);
        for (let rz = 9; rz <= 43; rz += 6) {
          const mk = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.03, 2.8), whiteM); mk.position.set(42.5, 0.038, rz); worldGroup.add(mk);
        }
        // Fluttering orange windsock
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.2, 6), LS.makeToonMat(0x52525b));
        pole.position.set(35.0, 2.1, 20.5); worldGroup.add(pole);
        const sock = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.35, 8), LS.makeToonMat(0xf97316));
        sock.rotation.z = -Math.PI / 2; sock.position.set(35.7, 3.95, 20.5); worldGroup.add(sock);
        W.windsock = sock;

        // Timber Safari Airstrip Terminal Gate Sign
        const gate = new THREE.Group(); gate.position.set(30.5, 0, 27.5);
        [-2.2, 2.2].forEach(gz => {
          const p = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 3.6, 8), LS.makeToonMat(0x6e472c));
          p.position.set(0, 1.8, gz); gate.add(p);
        });
        const aSign = new THREE.Mesh(
          new THREE.BoxGeometry(0.22, 1.05, 5.4),
          new THREE.MeshBasicMaterial({ map: LS.createSignTexture('✈️ SERENGETI AIRSTRIP → TOKYO', { bg: '#0f2544', border: '#f5b841', color: '#ffffff', font: 'bold 30px sans-serif', width: 640 }) })
        );
        aSign.position.set(0, 3.5, 0); gate.add(aSign);
        worldGroup.add(gate); addCollider(30.5, 27.5, 0.45, 2.6);

        // Charming Painted Safari Bush Propeller Plane!
        const plane = new THREE.Group(); plane.position.set(42.0, 1.15, 27.0); plane.rotation.y = Math.PI;
        const pCream = LS.makeToonMat(0xfef3c7), pRed = LS.makeToonMat(0xdc2626), pGlass = LS.makeToonMat(0x38bdf8), pDark = LS.makeToonMat(0x1f2937);
        const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.42, 6.2, 12), pCream); fuse.rotation.x = Math.PI / 2; fuse.castShadow = true; plane.add(fuse);
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.22, 5.4), pRed); plane.add(stripe);
        const wing = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.16, 1.55), pCream); wing.position.set(0, 0.62, 0.6); wing.castShadow = true; plane.add(wing);
        const tailV = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.45, 1.1), pRed); tailV.position.set(0, 0.72, -2.7); plane.add(tailV);
        const tailH = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.12, 0.75), pCream); tailH.position.set(0, 0.25, -2.75); plane.add(tailH);
        const cab = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.55, 1.6), pGlass); cab.position.set(0, 0.35, 0.85); plane.add(cab);
        const prop = new THREE.Group(); prop.position.set(0, 0, 3.22);
        prop.add(new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.14, 0.05), pDark));
        prop.add(new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.75, 0.05), pDark));
        plane.add(prop); W.propeller = prop;
        worldGroup.add(plane); addCollider(42.0, 27.0, 4.6, 3.4);

        W.zones.push({ id: 'safari_airstrip', label: 'Board Safari Charter Flight to Tokyo / Kyoto ✈️', pos: new THREE.Vector3(28.0, 0, 27.5), radius: 3.8 });
      });

      // 9. Lush Scattered Umbrella Acacias, Baobabs & Wild Savanna Flora
      safeRun('savanna_trees', () => {
        [
          [-18.0, -14.0, 1.05], [-38.0, 14.0, 1.18], [-44.0, -8.0, 1.25], [-42.0, -34.0, 1.12],
          [-16.0, -45.0, 1.15], [22.0, -34.0, 1.22], [44.0, -26.0, 1.18], [46.0, 4.0, 1.15],
          [26.0, 14.0, 1.02], [-8.0, 34.0, 1.14], [14.0, 36.0, 1.10], [-36.0, 28.0, 1.20]
        ].forEach(t => addAcacia(t[0], t[1], t[2]));
        addBaobab(34.0, -28.0, 1.12);
        addBaobab(-38.0, 20.0, 1.08);
      });

      // 10. 5 Playful Hiding Lion Cubs (Reset every 2h across 16 curated savanna hiding spots!)
      safeRun('hidden_lion_cubs', () => {
        const cubPool = [
          { pos: new THREE.Vector3(-19.5, 0, 11.5), hint: 'near the Giraffe Sanctuary acacia trees' },
          { pos: new THREE.Vector3(-34.5, 0, 9.5), hint: 'behind the tall giraffes on the west meadow' },
          { pos: new THREE.Vector3(-16.2, 0, -20.5), hint: 'near the Elephant Oasis boardwalk' },
          { pos: new THREE.Vector3(-42.5, 0, -24.5), hint: 'around the far side of the Flamingo Watering Hole' },
          { pos: new THREE.Vector3(-12.5, 0, -38.5), hint: 'beside the ancient Baobab next to Pride Rock' },
          { pos: new THREE.Vector3(14.5, 0, -34.0), hint: 'near the east boulder slope of Pride Rock' },
          { pos: new THREE.Vector3(29.0, 0, -20.0), hint: 'by the red termite mound in Zebra Meadow' },
          { pos: new THREE.Vector3(42.5, 0, -10.5), hint: 'playing near the grazing Zebras' },
          { pos: new THREE.Vector3(36.0, 0, 6.5), hint: 'under an umbrella acacia east of Base Camp' },
          { pos: new THREE.Vector3(24.5, 0, 17.5), hint: 'along the dirt trail to the Safari Airstrip' },
          { pos: new THREE.Vector3(32.5, 0, 34.5), hint: 'beside the Serengeti Airstrip runway' },
          { pos: new THREE.Vector3(-24.0, 0, 31.5), hint: 'behind the Savanna Kids Playground slide' },
          { pos: new THREE.Vector3(-14.0, 0, 21.0), hint: 'behind the Wildlife Photo Sticker Booth' },
          { pos: new THREE.Vector3(14.2, 0, 21.5), hint: 'behind Mama Nia’s Mango Smoothie Cafe' },
          { pos: new THREE.Vector3(-4.5, 0, -28.0), hint: 'watching Pride Rock from the north savanna trail' },
          { pos: new THREE.Vector3(6.5, 0, 31.5), hint: 'hiding in the sunny golden grass south of Base Camp' }
        ];

        const cubMeta = [
          { id: 'cub_simba', name: 'Simba (Golden Cub)', tint: 0xf4b942 },
          { id: 'cub_nala', name: 'Nala (Cream Cub)', tint: 0xffe4a8 },
          { id: 'cub_zuri', name: 'Zuri (Honey Cub)', tint: 0xe89c3c },
          { id: 'cub_kopa', name: 'Kopa (Sunny Cub)', tint: 0xf7c552 },
          { id: 'cub_asha', name: 'Asha (Amber Cub)', tint: 0xe68a38 }
        ];

        const chosenSpots = LS.pickRoundSpots(cubPool, LS.state.lionCubsRound || 0, 5);
        cubMeta.forEach((cm, idx) => {
          const spot = chosenSpots[idx];
          const found = LS.state.foundLionCubs && LS.state.foundLionCubs.includes(cm.id);
          const cg = new THREE.Group();
          cg.position.copy(spot.pos);
          cg.rotation.y = idx * 1.25;
          let tailRef = null;

          if (LS.isHD && LS.hdAssets && LS.hdAssets.has('anime_lion_cub')) {
            const mdl = LS.hdAssets.clone('anime_lion_cub');
            mdl.scale.setScalar(1.38);
            cg.add(mdl);
          } else {
            const furM = LS.makeToonMat(cm.tint), creamM = LS.makeToonMat(0xfdf3d8), tuftM = LS.makeToonMat(0x7c4a21), darkM = LS.makeToonMat(0x1e1612);
            const body = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), furM); body.scale.set(0.85, 0.82, 1.3); body.position.y = 0.30; body.castShadow = true; cg.add(body);
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), furM); head.position.set(0, 0.56, 0.22); cg.add(head);
            const muz = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), creamM); muz.position.set(0, 0.50, 0.42); cg.add(muz);
            [-0.18, 0.18].forEach(ex => {
              const ear = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 6), furM); ear.position.set(ex, 0.74, 0.18); cg.add(ear);
              const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), darkM); eye.position.set(ex * 0.55, 0.59, 0.42); cg.add(eye);
            });
            tailRef = new THREE.Group(); tailRef.position.set(0, 0.34, -0.30);
            const tStem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.36, 6), furM); tStem.rotation.x = -0.85; tStem.position.set(0, 0.08, -0.14); tailRef.add(tStem);
            const tTip = new THREE.Mesh(new THREE.SphereGeometry(0.075, 6, 6), tuftM); tTip.position.set(0, 0.18, -0.28); tailRef.add(tTip);
            cg.add(tailRef);
          }

          const marker = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.20, 0),
            new THREE.MeshBasicMaterial({ color: 0xffd166 })
          );
          marker.position.y = 1.48;
          marker.visible = !found;
          cg.add(marker);
          worldGroup.add(cg);

          W.hiddenAnimals.push({
            id: cm.id, name: cm.name, kind: 'lion_cub', mesh: cg, tail: tailRef,
            marker, found, hint: spot.hint
          });
          if (!found) {
            W.zones.push({ id: 'animal:' + cm.id, label: 'Pet ' + cm.name + ' 🦁', pos: spot.pos.clone(), radius: 2.5 });
          }
        });
      });

      // 11. Friendly Safari NPCs (full anime faces!)
      safeRun('safari_npcs', () => {
        LS.spawnWorldNPCs(worldGroup, [
          { name: 'Ranger Amara', pos: new THREE.Vector3(3.4, 0, 13.8), baseRot: -0.35, waveOnNear: true,
            line: 'Jambo, Laila & Salma! Hop in our zebra-striped Safari Jeep or explore the giraffes & elephants!',
            char: { scale: 0.98, hairColor: 0x1b1514, skinColor: 0x9c6644, topColor: 0xd4a359, bottomColor: 0x5c5346, pants: true, hatType: 'kinder', hatColor: 0xb08968,
              faceOpts: { eyeColor: '#3a2214', eyeHighlight: '#a66d3c', blush: 'rgba(214, 108, 92, 0.35)' } } },
          { name: 'Dr. Kofi', pos: new THREE.Vector3(7.6, 0, 15.2), baseRot: -Math.PI * 0.42, waveOnNear: true,
            line: 'Welcome to Savanna Ranger Academy! Test your wildlife knowledge for coins & XP!',
            char: { scale: 1.0, hairColor: 0x1e1b18, skinColor: 0x8d5524, topColor: 0x4a7c59, bottomColor: 0x3b3a36, pants: true,
              faceOpts: { glasses: true, mustache: true, eyeColor: '#2c1e16', eyeHighlight: '#7c5c42', blush: 'rgba(196, 102, 88, 0.25)' } } },
          { name: 'Mama Nia', pos: new THREE.Vector3(7.2, 0, 23.6), baseRot: -Math.PI * 0.35, waveOnNear: true,
            line: 'Fresh Mango Sunrise Smoothies! One sip gives you super savanna running speed!',
            char: { scale: 0.94, hairColor: 0x1c1412, skinColor: 0x945b36, topColor: 0xe76f51, bottomColor: 0xf4a261, hairBun: true,
              faceOpts: { eyeColor: '#422416', eyeHighlight: '#b56e3e', blush: 'rgba(226, 114, 98, 0.42)' } } },
          { name: 'Keeper Zara', pos: new THREE.Vector3(-20.8, 0, 4.8), baseRot: Math.PI * 0.4, waveOnNear: true,
            line: 'Walk right up the cedar ramp to our feeding deck — the giraffes LOVE fresh acacia leaves!',
            char: { scale: 0.94, hairColor: 0x241814, skinColor: 0xa66e48, topColor: 0xe9c46a, bottomColor: 0x6b705c, pants: true, hatType: 'cap', hatColor: 0x4a7c59,
              faceOpts: { eyeColor: '#2a4c36', eyeHighlight: '#6cc48c', blush: 'rgba(224, 118, 102, 0.38)' } } }
        ]);
      });

      // 12. 16,000 Wind-Swept Golden Savanna Grass Tufts in HD Mode!
      safeRun('hd_savanna_grass', () => {
        if (!LS.isHD || !LS.hdAssets || !LS.hdAssets.addInstancedGrass) return;
        const loopSp = SC.sampleSpline(SAFARI_LOOP_PTS, 5);
        const sSp = SC.sampleSpline(SAFARI_SOUTH_TRAIL, 4);
        const aSp = SC.sampleSpline(SAFARI_AIRSTRIP_TRAIL, 4);
        const nearSp = (sp, x, z, r2) => {
          for (let i = 0; i < sp.length; i++) {
            const dx = x - sp[i][0], dz = z - sp[i][1];
            if (dx * dx + dz * dz < r2) return true;
          }
          return false;
        };
        LS.hdAssets.addInstancedGrass(worldGroup, { minX: -58, maxX: 58, minZ: -54, maxZ: 46 }, (x, z) => {
          if (Math.hypot(x, z - 17.5) < 10.6) return false; // Base camp courtyard
          if (Math.hypot(x + 29.5, z + 28.5) < 12.8) return false; // Elephant watering hole
          if (x > 36.5 && x < 48.5 && z > 4.0 && z < 48.0) return false; // Dirt airstrip
          if (x < -19.5 && x > -27.5 && z > -1.2 && z < 5.2) return false; // Giraffe feeding deck
          if (nearSp(loopSp, x, z, 3.0 * 3.0)) return false;
          if (nearSp(sSp, x, z, 2.5 * 2.5)) return false;
          if (nearSp(aSp, x, z, 2.3 * 2.3)) return false;
          for (let c = 0; c < W.colliders.length; c++) {
            const b = W.colliders[c];
            if (x > b.minX - 0.5 && x < b.maxX + 0.5 && z > b.minZ - 0.5 && z < b.maxZ + 0.5) return false;
          }
          return true;
        }, 'safari');
      });

      W.getMochiIdleAnchor = function () { return { pos: new THREE.Vector3(2.2, 0, 15.8), rotY: -Math.PI * 0.25 }; };

      W.getZoneLabel = function (px, pz) {
        if (px > 26 && pz > 14) return 'Serengeti Airstrip';
        if (px < -15 && pz < -15) return 'Elephant & Flamingo Oasis';
        if (px < -16 && pz >= -15 && pz <= 14) return 'Giraffe Sanctuary';
        if (pz < -28 && px >= -14 && px <= 20) return 'Pride Rock Kopje';
        if (px > 18 && pz < 12) return 'Zebra Savanna Meadow';
        if (px < -12 && pz > 20) return 'Savanna Kids Park';
        return 'Safari Base Camp';
      };

      W.update = function (dt, elapsed) {
        if (LS.runtime.safariFeedTimer > 0) LS.runtime.safariFeedTimer = Math.max(0, LS.runtime.safariFeedTimer - dt);
        const feeding = LS.runtime.safariFeedTimer > 0;

        // Gentle Giraffe grazing & happy feeding nod!
        W.giraffes.forEach(g => {
          g.root.rotation.y = g.baseRot + Math.sin(elapsed * 0.65 + g.phase) * 0.14;
          g.inner.rotation.x = feeding ? (0.14 + Math.sin(elapsed * 5.2 + g.phase) * 0.08) : (Math.sin(elapsed * 1.1 + g.phase) * 0.035);
        });

        // Gentle Elephants swaying & splashing!
        W.elephants.forEach(e => {
          e.root.rotation.y = e.baseRot + Math.sin(elapsed * 0.55 + e.phase) * 0.12;
          e.root.position.y = e.baseY + (feeding ? Math.abs(Math.sin(elapsed * 4.5 + e.phase)) * 0.14 : Math.sin(elapsed * 1.2 + e.phase) * 0.025);
        });

        // Watering hole splash ripples
        W.splashRings.forEach((ring, i) => {
          const cyc = (elapsed * (feeding ? 1.35 : 0.62) + i * 0.33) % 1;
          const sc = 0.6 + cyc * 3.4;
          ring.scale.set(sc, sc, 1);
          ring.material.opacity = (1 - cyc) * (feeding ? 0.72 : 0.38);
        });

        // Pink Flamingos bobbing gently
        W.flamingos.forEach(f => {
          f.root.rotation.z = Math.sin(elapsed * 1.4 + f.phase) * 0.06;
        });

        // Zebras grazing gently (works smoothly in both HD GLB & Classic!)
        W.zebras.forEach(z => {
          if (z.neck) {
            z.neck.rotation.x = 0.18 + Math.sin(elapsed * 1.3 + z.phase) * 0.24;
          } else if (z.inner) {
            z.root.rotation.y = z.baseRot + Math.sin(elapsed * 0.65 + z.phase) * 0.14;
            z.inner.rotation.x = Math.sin(elapsed * 1.2 + z.phase) * 0.045;
          }
        });

        // Bush plane propeller + windsock
        if (W.propeller) W.propeller.rotation.z += dt * 7.5;
        if (W.windsock) W.windsock.rotation.y = Math.sin(elapsed * 3.4) * 0.22;

        // Playful hiding Lion Cubs bobbing & beacon spinning
        W.hiddenAnimals.forEach((cub, idx) => {
          if (cub.tail) cub.tail.rotation.y = Math.sin(elapsed * 4.2 + idx) * 0.38;
          if (cub.marker && cub.marker.visible) {
            cub.marker.rotation.y = elapsed * 2.4 + idx;
            cub.marker.position.y = 1.48 + Math.sin(elapsed * 3.5 + idx) * 0.14;
          }
        });
      };

      W.drawMiniMap = function (ctx, cw, ch, toMapX, toMapY) {
        ctx.fillStyle = '#c8a956'; ctx.fillRect(0, 0, cw, ch);
        // Sunlit open savanna clearings
        ctx.fillStyle = '#d7ba68';
        [[34, -10, 18], [-32, 2, 15], [0, 17, 13]].forEach(m => {
          ctx.beginPath(); ctx.arc(toMapX(m[0]), toMapY(m[1]), m[2], 0, Math.PI * 2); ctx.fill();
        });
        // Elephant & Flamingo Watering Hole
        ctx.fillStyle = '#2d8da0';
        ctx.beginPath(); ctx.arc(toMapX(-29.5), toMapY(-28.5), 14, 0, Math.PI * 2); ctx.fill();
        // Pride Rock Kopje
        ctx.fillStyle = '#9a7a52';
        ctx.beginPath(); ctx.ellipse(toMapX(3.0), toMapY(-40.5), 10, 7, 0, 0, Math.PI * 2); ctx.fill();
        // Serengeti Airstrip
        ctx.fillStyle = '#8b6340';
        ctx.fillRect(toMapX(37), toMapY(6), toMapX(48) - toMapX(37), toMapY(46) - toMapY(6));
        // Safari Jeep Loop & Footpaths
        strokeMapSpline(ctx, SAFARI_LOOP_PTS, toMapX, toMapY, '#a66e3d', 4.2);
        strokeMapSpline(ctx, SAFARI_SOUTH_TRAIL, toMapX, toMapY, '#a66e3d', 3.4);
        strokeMapSpline(ctx, SAFARI_AIRSTRIP_TRAIL, toMapX, toMapY, '#a66e3d', 2.8);
      };

      return W;
    }
  });
})(window.LailaSalma);
