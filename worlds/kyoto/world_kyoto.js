window.LailaSalma = window.LailaSalma || {};

(function (LS) {
  function safeRun(name, fn) {
    try { fn(); } catch (e) { console.error('[Kyoto:' + name + ']', e); }
  }

  function buildKyotoWorld(worldGroup) {
    const SC = LS.scenery;
    const W = {
      id: 'kyoto',
      colliders: [],
      zones: [],
      norenPanels: [],
      hiddenAnimals: [],
      koiList: [],
      duckList: [],
      bambooStalks: [],
      rippleRings: [],
      rowboat: null,
      shinkansenTrain: null,
      swingPivot: null,
      petals: null,
      skyMesh: null,
      mochiBall: null,
      mochiStartPos: new THREE.Vector3(-3.6, 0, -18.5),
      sushiCounterPos: new THREE.Vector3(-8.2, 0, -29.8),
      slideStartPos: new THREE.Vector3(28.5, 1.55, -2.8),
      slideEndPos: new THREE.Vector3(28.5, 0.12, 0.0),
      swingSeatPos: new THREE.Vector3(33.2, 0.55, -4.5),
      hopscotchPos: new THREE.Vector3(25.2, 0.065, 1.2)
    };

    function addCollider(x, z, hw, hd) {
      W.colliders.push({ minX: x - hw, maxX: x + hw, minZ: z - hd, maxZ: z + hd });
    }

    // Smooth walkable elevation across arched koi bridge, 3 East Canal footbridges, and elevated Sakurako Shrine Courtyard
    function getGroundHeight(x, z) {
      if (x <= -13.3 && x >= -30.7 && Math.abs(z + 27.5) <= 2.3) {
        const t = Math.max(0, Math.min(1, (-13.5 - x) / 17.0));
        return Math.sin(t * Math.PI) * 1.15;
      }
      if (x <= -41.6 && x >= -43.8 && z >= -30.0 && z <= -25.0) {
        const s = Math.max(0, Math.min(1, (-41.6 - x) / 2.2));
        return s * 0.75;
      }
      if (x < -43.8 && x >= -58.0 && z >= -36.5 && z <= -18.5) {
        return 0.75;
      }
      // 3 curved Yousuiro Stream footbridges at (19.5,-26), (15.5,-13), (18.5,3)
      const bridges = [[19.5, -26.0], [15.5, -13.0], [18.5, 3.0]];
      for (let i = 0; i < bridges.length; i++) {
        const bx = bridges[i][0], bz = bridges[i][1];
        if (Math.abs(x - bx) <= 2.3 && Math.abs(z - bz) <= 2.1) {
          const t = Math.max(0, Math.min(1, (x - (bx - 2.3)) / 4.6));
          return Math.sin(t * Math.PI) * 0.42;
        }
      }
      return 0;
    }
    W.getGroundHeight = getGroundHeight;

    function buildKyotoTree(x, z, kind, scale, baseY, noCol) {
      const s = scale || 1;
      const hdKey = kind === 'maple' ? 'anime_tree_maple'
        : (kind === 'sakura' ? 'anime_tree_sakura'
          : (kind === 'willow' ? 'anime_tree_willow'
            : (kind === 'cedar' ? 'anime_tree_cedar' : 'anime_tree_green')));
      if (LS.isHD && LS.hdAssets && LS.hdAssets.has(hdKey)) {
        const m = LS.hdAssets.clone(hdKey);
        m.position.set(x, baseY || 0, z);
        m.rotation.y = x * 0.67 + z * 0.39;
        m.scale.setScalar(s * 1.08);
        worldGroup.add(m);
        if (!noCol) addCollider(x, z, 0.55 * s, 0.55 * s);
        return m;
      }
      const g = new THREE.Group();
      g.position.set(x, baseY || 0, z);
      g.scale.setScalar(s);

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.36, 3.0, 8),
        LS.makeToonMat(kind === 'cedar' ? 0x4c3424 : 0x5c3c2e)
      );
      trunk.position.y = 1.5; trunk.castShadow = true; g.add(trunk);

      if (kind === 'cedar') {
        const pineColors = [0x2d5a3c, 0x356b46, 0x244a31];
        for (let i = 0; i < 4; i++) {
          const cone = new THREE.Mesh(new THREE.ConeGeometry(2.1 - i * 0.35, 2.5, 8), LS.makeToonMat(pineColors[i % pineColors.length]));
          cone.position.y = 3.0 + i * 1.35; cone.castShadow = true; g.add(cone);
        }
      } else if (kind === 'willow') {
        const wMat = LS.makeToonMat(0x5c9652);
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          const drape = new THREE.Mesh(new THREE.ConeGeometry(0.72, 2.7, 7), wMat);
          drape.position.set(Math.cos(a) * 0.85, 2.7, Math.sin(a) * 0.85); drape.castShadow = true; g.add(drape);
        }
        const topGeo = LS.isHD ? new THREE.IcosahedronGeometry(1.3, 2) : new THREE.DodecahedronGeometry(1.3, 1);
        const top = new THREE.Mesh(topGeo, LS.makeToonMat(0x4c8546));
        top.position.y = 3.8; g.add(top);
      } else {
        const colors = kind === 'maple'
          ? [0xd9483b, 0xe86f3a, 0xf29f3d]
          : (kind === 'sakura' ? [0xffc7d9, 0xffaec8, 0xffe0eb] : [0x467d46, 0x599452, 0x366639]);
        [[0, 3.4, 0, 1.55], [-0.95, 2.9, 0.45, 1.15], [0.95, 3.0, -0.35, 1.2], [0.15, 4.0, 0.4, 1.05], [-0.4, 3.6, -0.7, 1.0]].forEach((p, idx) => {
          const geo = LS.isHD ? new THREE.IcosahedronGeometry(p[3], 2) : new THREE.DodecahedronGeometry(p[3], 1);
          const m = new THREE.Mesh(geo, LS.makeToonMat(colors[idx % colors.length]));
          m.position.set(p[0], p[1], p[2]); m.castShadow = true; g.add(m);
        });
      }

      worldGroup.add(g);
      if (!noCol) addCollider(x, z, 0.55 * s, 0.55 * s);
      return g;
    }

    function buildMachiya(x, z, rotY, opts) {
      const cfg = opts || {};
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.y = rotY;

      const w = cfg.width || 7.0;
      const d = cfg.depth || 6.0;
      const h = cfg.height || 5.0;

      if (LS.isHD && LS.hdAssets && LS.hdAssets.has('kyoto_machiya')) {
        const model = LS.hdAssets.clone('kyoto_machiya', { wallTint: cfg.wallHex, roofTint: cfg.roofHex });
        model.scale.set(w / 6.6, h / 5.0, d / 5.6);
        g.add(model);
        const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), new THREE.MeshBasicMaterial({ color: cfg.lanternColor || 0xffd27d }));
        lantern.scale.set(1, 1.35, 1); lantern.position.set(1.25, 2.35, d / 2 + 0.52); g.add(lantern);
        const halo = LS.createGlowSprite(cfg.lanternColor || 0xffd27d, 1.75);
        halo.position.copy(lantern.position); g.add(halo);
        if (cfg.signText) {
          const sign = new THREE.Mesh(
            new THREE.BoxGeometry(4.0, 0.85, 0.18),
            new THREE.MeshBasicMaterial({
              map: LS.createSignTexture(cfg.signText, {
                bg: cfg.signBg || '#3a2315', border: cfg.signBorder || '#e0a458', color: cfg.signColor || '#fff5dc', font: 'bold 31px sans-serif'
              })
            })
          );
          sign.position.set(0, h * 0.52 + 0.62, d / 2 + 0.62); g.add(sign);
        }
        if (cfg.norenColor) {
          const nMat = LS.makeToonMat(cfg.norenColor, { side: THREE.DoubleSide });
          for (let i = -1; i <= 1; i++) {
            const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.78, 0.05), nMat);
            cloth.position.set(i * 0.72, 2.0, d / 2 + 0.45); g.add(cloth);
            W.norenPanels.push({ mesh: cloth, phase: i * 0.8 + z });
          }
        }
        worldGroup.add(g);
        addCollider(x, z, Math.max(w, d) * 0.5 + 0.35, Math.max(w, d) * 0.5 + 0.35);
        return g;
      }

      const darkWood = LS.makeToonMat(cfg.woodColor || 0x4b3322);
      const plaster = LS.makeToonMat(0xffffff, { map: LS.createPlasterTexture(cfg.wallHex || '#efe5d1') });
      const lattice = LS.makeToonMat(0xffffff, { map: LS.createWoodLatticeTexture('#4a3120', cfg.shojiHex || '#f7ecd4') });
      const roofMat = LS.makeToonMat(0xffffff, { map: LS.createRoofTileTexture(cfg.roofHex || '#363b45'), roughness: 0.48 });
      const glowWin = LS.makeEmissiveMat(0xffe9b5, 0xffc870, 0.55);

      const lower = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.52, d), lattice);
      lower.position.y = h * 0.26; lower.castShadow = true; lower.receiveShadow = true; g.add(lower);

      const upper = new THREE.Mesh(new THREE.BoxGeometry(w - 0.15, h * 0.48, d - 0.15), plaster);
      upper.position.y = h * 0.76; upper.castShadow = true; g.add(upper);

      const midEave = new THREE.Mesh(new THREE.BoxGeometry(w + 0.9, 0.22, d + 0.9), roofMat);
      midEave.position.y = h * 0.52; g.add(midEave);

      const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.84, 2.2, 4), roofMat);
      roof.position.y = h + 1.05; roof.rotation.y = Math.PI / 4; roof.scale.set(1.12, 1.0, 0.98); roof.castShadow = true; g.add(roof);

      [-1.5, 1.5].forEach(wx => {
        const wMesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.15, 0.12), glowWin);
        wMesh.position.set(wx, h * 0.74, d / 2 + 0.02); g.add(wMesh);
      });

      const door = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.2, 0.16), darkWood);
      door.position.set(0, 1.1, d / 2 + 0.06); g.add(door);

      const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), new THREE.MeshBasicMaterial({ color: cfg.lanternColor || 0xffd27d }));
      lantern.scale.set(1, 1.35, 1); lantern.position.set(1.25, 2.35, d / 2 + 0.45); g.add(lantern);
      if (LS.isHD) {
        const halo = LS.createGlowSprite(cfg.lanternColor || 0xffd27d, 1.65);
        halo.position.copy(lantern.position); g.add(halo);
      }

      if (cfg.signText) {
        const sign = new THREE.Mesh(
          new THREE.BoxGeometry(4.0, 0.85, 0.18),
          new THREE.MeshBasicMaterial({
            map: LS.createSignTexture(cfg.signText, {
              bg: cfg.signBg || '#3a2315', border: cfg.signBorder || '#e0a458', color: cfg.signColor || '#fff5dc', font: 'bold 31px sans-serif'
            })
          })
        );
        sign.position.set(0, h * 0.52 + 0.58, d / 2 + 0.55); g.add(sign);
      }

      if (cfg.norenColor) {
        const nMat = LS.makeToonMat(cfg.norenColor, { side: THREE.DoubleSide });
        for (let i = -1; i <= 1; i++) {
          const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.78, 0.05), nMat);
          cloth.position.set(i * 0.72, 2.0, d / 2 + 0.38); g.add(cloth);
          W.norenPanels.push({ mesh: cloth, phase: i * 0.8 + z });
        }
      }

      worldGroup.add(g);
      addCollider(x, z, Math.max(w, d) * 0.5 + 0.35, Math.max(w, d) * 0.5 + 0.35);
      return g;
    }

    function addStoneLantern(x, z, y0) {
      const stoneMat = LS.makeToonMat(0x7c7b74);
      const tG = new THREE.Group(); tG.position.set(x, y0 || 0, z);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 1.35, 6), stoneMat); post.position.y = 0.68; tG.add(post);
      const glow = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.34, 0.32), new THREE.MeshBasicMaterial({ color: 0xffd27d })); glow.position.y = 1.5; tG.add(glow);
      if (LS.isHD) {
        const halo = LS.createGlowSprite(0xffd27d, 1.55); halo.position.y = 1.5; tG.add(halo);
      }
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.24, 4), stoneMat); cap.rotation.y = Math.PI / 4; cap.position.y = 1.78; tG.add(cap);
      worldGroup.add(tG);
    }

    // 1. Sky, Seamless Mossy Ground (ZERO snow!), Curving Village Lane, Winding Alleys, Open Meadows & Hills
    const KYOTO_LANE_PTS = [[0.2, 35], [-0.4, 24], [0.5, 14], [-1.2, 3], [1.1, -9], [-0.8, -22], [1.4, -36], [0.2, -50]];
    const KYOTO_STREAM_PTS = [[19.5, 32], [15.0, 18], [18.5, 3.0], [15.5, -13.0], [19.5, -26.0], [16.5, -42], [19.0, -52]];
    const KYOTO_SW_TRAIL_PTS = [[-1.0, 9.0], [-14, 10.5], [-26, 8.2], [-39, 11.5], [-47, 22], [-33, 27], [-16, 23], [-0.4, 23]];
    const KYOTO_EAST_LOOP_PTS = [[22, -26], [31, -29], [41, -21], [43, -6], [40, 10], [32, 20], [21, 14]];
    const KYOTO_PARK_TRAIL_PTS = [[18, -13], [24, -11], [27, -3], [24, 4], [20.5, 3.0]];

    safeRun('environment', () => {
      const skyGeo = new THREE.SphereGeometry(260, 24, 16);
      W.skyMesh = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({
        map: LS.createSkyTexture(LS.state.timeMode, 'kyoto'), side: THREE.BackSide
      }));
      worldGroup.add(W.skyMesh);

      const grassMat = LS.makeSurfaceMat(LS.createGrassTexture('kyoto'), { roughness: 0.92, bumpScale: 0.03 });
      function addGroundPatch(x1, x2, z1, z2) {
        const w = x2 - x1, h = z2 - z1;
        const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
        const geo = new THREE.PlaneGeometry(w, h);
        const uv = geo.attributes.uv;
        const pos = geo.attributes.position;
        for (let i = 0; i < uv.count; i++) {
          uv.setXY(i, (cx + pos.getX(i)) / 320, (cz - pos.getY(i)) / 320);
        }
        uv.needsUpdate = true;
        const m = new THREE.Mesh(geo, grassMat);
        m.rotation.x = -Math.PI / 2; m.position.set(cx, 0, cz);
        m.receiveShadow = true; worldGroup.add(m);
      }
      addGroundPatch(-14.8, 180, -180, 180);
      addGroundPatch(-180, -30.2, -180, 180);
      addGroundPatch(-30.2, -14.8, -180, -37.5);
      addGroundPatch(-30.2, -14.8, -17.5, 180);

      // Soft sunlit mossy meadow clearings across open Kyoto valleys
      SC.addMeadowPatch(worldGroup, -22, -6, 12, 8.5, 0.28, 0x6f9d58);
      SC.addMeadowPatch(worldGroup, -52, 16, 11, 13, -0.35, 0x6c9955);
      SC.addMeadowPatch(worldGroup, 35, 16, 11, 9, 0.4, 0x709e58);
      SC.addMeadowPatch(worldGroup, 26, -34, 12, 9.5, -0.22, 0x6d9b56);
      SC.addMeadowPatch(worldGroup, -14, 16, 10, 7.5, 0.15, 0x719f5a);

      // Gently meandering Kyoto village lane (NO ruler-straight asphalt or rigid curbs!)
      SC.addCurvedPath(worldGroup, KYOTO_LANE_PTS, 5.6, 'lane_kyoto', 0.032);

      // Organic winding stone & gravel footpaths connecting gardens, stream & hamlet
      SC.addCurvedPath(worldGroup, KYOTO_SW_TRAIL_PTS, 2.4, 'stone', 0.025);
      SC.addCurvedPath(worldGroup, KYOTO_EAST_LOOP_PTS, 2.3, 'stone', 0.025);
      SC.addCurvedPath(worldGroup, KYOTO_PARK_TRAIL_PTS, 2.2, 'gravel', 0.024);

      // Charming stepping stones off the main lane toward quiet garden spots
      SC.addSteppingStones(worldGroup, [[-4.8, -12.5], [-3.2, -12.1], [-1.6, -12.6]]);
      SC.addSteppingStones(worldGroup, [[4.0, 12.0], [6.2, 12.8], [8.5, 12.1], [10.8, 13.0]]);
      SC.addSteppingStones(worldGroup, [[-19.0, -13.5], [-21.0, -12.0], [-23.2, -10.5]]);

      // Rustic wooden trail signposts at natural path forks
      SC.addSignpost(worldGroup, -4.2, 10.6, 0.4);
      SC.addSignpost(worldGroup, 11.8, -14.2, -0.6);
      SC.addSignpost(worldGroup, 22.8, 4.5, 0.5);

      // Orange Convex Traffic Mirror opposite stone path
      const mirG = new THREE.Group(); mirG.position.set(3.8, 0, -27.5);
      const mirPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 3.0, 8), LS.makeToonMat(0xf59e0b)); mirPole.position.y = 1.5; mirG.add(mirPole);
      const mirRim = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.1, 16), LS.makeToonMat(0xf97316)); mirRim.rotation.z = Math.PI / 2; mirRim.position.set(-0.08, 2.75, 0); mirG.add(mirRim);
      const mirFace = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 10), LS.makeEmissiveMat(0xcbd5e1, 0x94a3b8, 0.35)); mirFace.scale.set(0.35, 1, 1); mirFace.position.set(-0.14, 2.75, 0); mirG.add(mirFace);
      worldGroup.add(mirG);

      // Gentle mossy rolling grass mounds around perimeter & valley edges
      [
        [-68, -42, 17, 4.9], [-66, 22, 18, 5.3], [-48, 39, 17, 4.6],
        [56, -42, 18, 5.3], [58, 12, 17, 4.9], [46, 37, 17, 4.5],
        [-18, -62, 19, 5.2], [-48, 29, 8.5, 1.8], [32, -37, 9.0, 2.0]
      ].forEach(m => SC.addGrassMound(worldGroup, m[0], m[1], m[2], m[3], 0x4f7d45));

      // Misty Kyoto Mountains & Distant 5-Story Pagoda (360° sculpted ridges in HD!)
      if (LS.isHD && LS.hdAssets && LS.hdAssets.addMountainRange) {
        LS.hdAssets.addMountainRange(worldGroup, 'kyoto');
      } else {
        const hillMat = LS.makeToonMat(0x4b775b);
        [[-100, -112, 48, 26], [-24, -124, 54, 29], [64, -110, 50, 25], [-122, -16, 44, 22], [108, -14, 46, 24], [-96, 86, 44, 20], [88, 86, 46, 20]].forEach(h => {
          const hill = new THREE.Mesh(new THREE.SphereGeometry(h[2], 16, 12), hillMat);
          hill.scale.set(1.4, h[3] / h[2], 1.0); hill.position.set(h[0], -2, h[1]); worldGroup.add(hill);
        });
      }

      const pag = new THREE.Group(); pag.position.set(66, 12, -92);
      const pWood = LS.makeToonMat(0x523626), pRoof = LS.makeToonMat(0x2d333b);
      for (let tier = 0; tier < 5; tier++) {
        const w = 5.2 - tier * 0.55;
        const body = new THREE.Mesh(new THREE.BoxGeometry(w * 0.65, 2.2, w * 0.65), pWood); body.position.y = tier * 3.1 + 1.1; pag.add(body);
        const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.85, 1.35, 4), pRoof); roof.rotation.y = Math.PI / 4; roof.position.y = tier * 3.1 + 2.55; pag.add(roof);
      }
      const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 4.2, 8), LS.makeToonMat(0xd4a343)); spire.position.y = 17.5; pag.add(spire);
      worldGroup.add(pag);
    });

    // 2. Stone Path, Natural Kyoto Temple Koi Pond, Arched Cedar Bridge, Calico Koi, Sculpted Ducks & Ducklings, Waterfall & Rowboat
    safeRun('lake_and_bridge', () => {
      W.waterfallRings = [];
      W.ducklings = [];
      const stonePath = new THREE.Mesh(new THREE.BoxGeometry(10.6, 0.08, 3.6), LS.makeSurfaceMat(LS.createStonePathTexture(), { roughness: 0.78 }));
      stonePath.position.set(-8.3, 0.04, -27.5); stonePath.receiveShadow = true; worldGroup.add(stonePath);

      // Textured natural river-pebble pond bed (visible through crystal emerald water!)
      const bed = new THREE.Mesh(
        new THREE.PlaneGeometry(16.4, 21.0),
        LS.makeSurfaceMat(LS.createPondBedTexture(), { roughness: 0.92 })
      );
      bed.rotation.x = -Math.PI / 2; bed.position.set(-22.5, -0.95, -27.5); bed.receiveShadow = true; worldGroup.add(bed);

      // Submerged sloped river-stone shelves instead of bare rectangular concrete walls!
      const shelfMat = LS.makeToonMat(0x565c4e);
      [[-22.5, -17.35, 16.0, 0.75, 0.35, 0], [-22.5, -37.65, 16.0, 0.75, -0.35, 0],
       [-14.65, -27.5, 0.75, 20.6, 0, -0.35], [-30.35, -27.5, 0.75, 20.6, 0, 0.35]].forEach(bk => {
        const slopeWall = new THREE.Mesh(new THREE.BoxGeometry(bk[2], 1.2, bk[3]), shelfMat);
        slopeWall.position.set(bk[0], -0.46, bk[1]);
        slopeWall.rotation.set(bk[4], 0, bk[5]);
        worldGroup.add(slopeWall);
      });

      // Soft mossy corner promontories curving inward to eliminate sharp rectangle corners!
      const cornerMoss = LS.makeToonMat(0x4f7f44);
      [[-15.2, -18.0, 2.3], [-29.8, -18.0, 2.5], [-15.2, -37.0, 2.4], [-29.6, -36.8, 2.8]].forEach(cm => {
        const mound = new THREE.Mesh(new THREE.SphereGeometry(cm[2], 14, 10), cornerMoss);
        mound.scale.set(1.15, 0.34, 1.15);
        mound.position.set(cm[0], -0.22, cm[1]);
        mound.receiveShadow = true;
        worldGroup.add(mound);
      });

      // Crystal-clear emerald Kyoto Garden Pond water (custom GLSL translucent shader in HD!)
      const pondMat = (LS.isHD && LS.createAAAPondWaterMaterial)
        ? LS.createAAAPondWaterMaterial()
        : LS.makeWaterMat(0.84, THREE.DoubleSide);
      const water = new THREE.Mesh(new THREE.PlaneGeometry(15.6, 20.2, LS.isHD ? 24 : 1, LS.isHD ? 24 : 1), pondMat);
      water.rotation.x = -Math.PI / 2; water.position.set(-22.5, -0.42, -27.5); worldGroup.add(water);
      addCollider(-22.5, -21.2, 7.6, 4.1); addCollider(-22.5, -33.8, 7.6, 4.1);

      // Organic tiered Kyoto garden riverstones (varied heights, faceted slate/granite tones tucked naturally into the waterline!)
      const rockMats = [LS.makeToonMat(0x5c6056), LS.makeToonMat(0x6e7166), LS.makeToonMat(0x4d524a)];
      const mossCapMat = LS.makeToonMat(0x4e8444);
      const shoreStones = [
        [-15.2, -17.6, 0.92, 0.52], [-16.5, -17.5, 0.62, 0.36], [-17.6, -17.7, 0.48, 0.28], [-19.2, -17.5, 0.85, 0.44],
        [-20.6, -17.6, 0.54, 0.30], [-22.4, -17.5, 0.78, 0.40], [-24.0, -17.7, 0.52, 0.28], [-25.6, -17.5, 0.82, 0.44],
        [-27.2, -17.6, 0.96, 0.54], [-28.8, -18.0, 1.12, 0.62], [-30.0, -19.4, 0.94, 0.52], [-30.2, -21.2, 0.78, 0.42],
        [-30.1, -23.1, 0.66, 0.36], [-30.2, -24.8, 0.58, 0.32],
        [-30.2, -30.3, 0.64, 0.36], [-30.2, -32.2, 0.86, 0.48], [-30.0, -34.2, 1.02, 0.58], [-29.2, -36.4, 1.18, 0.68],
        [-27.4, -37.3, 0.96, 0.54], [-25.2, -37.4, 0.76, 0.42], [-23.0, -37.3, 0.88, 0.46], [-20.5, -37.5, 0.98, 0.52],
        [-18.2, -37.3, 0.74, 0.40], [-16.0, -37.1, 0.94, 0.52], [-14.9, -35.5, 0.84, 0.46], [-14.8, -33.3, 0.72, 0.38],
        [-14.8, -31.0, 0.64, 0.34], [-14.9, -24.5, 0.62, 0.34], [-14.9, -19.2, 0.76, 0.42]
      ];
      shoreStones.forEach((b, idx) => {
        const sg = new THREE.Group();
        sg.position.set(b[0], -0.22, b[1]);
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(b[2], 0), rockMats[idx % rockMats.length]);
        rock.scale.set(1.25 + (idx % 3) * 0.14, b[3] / b[2], 0.92 + ((idx + 1) % 3) * 0.12);
        rock.rotation.set((idx % 2) * 0.15, idx * 1.1, ((idx + 1) % 2) * 0.12);
        rock.position.y = b[3] * 0.48;
        rock.castShadow = true; rock.receiveShadow = true;
        sg.add(rock);
        if (idx % 2 === 0) {
          const moss = new THREE.Mesh(new THREE.SphereGeometry(b[2] * 0.58, 9, 6), mossCapMat);
          moss.scale.set(1.15, 0.24, 0.95);
          moss.position.set(0.04, b[3] * 0.86, 0);
          sg.add(moss);
        }
        worldGroup.add(sg);
      });

      // Northwest Mossy Rockery & Cascading Bamboo Pond Waterfall (X=-28.8, Z=-35.8)
      const wfG = new THREE.Group(); wfG.position.set(-28.8, 0, -35.8); wfG.rotation.y = 0.72;
      const rockDark = LS.makeToonMat(0x5e6258);
      [[0, 0.45, -0.4, 1.35, 1.05], [-1.0, 0.25, -0.1, 0.95, 0.8], [1.0, 0.28, -0.15, 0.92, 0.85], [0, 1.15, -0.75, 1.05, 0.95]].forEach(rk => {
        const st = new THREE.Mesh(new THREE.DodecahedronGeometry(rk[3], LS.isHD ? 1 : 0), rockDark);
        st.scale.set(1.15, rk[4], 0.95); st.position.set(rk[0], rk[1], rk[2]); st.castShadow = true; wfG.add(st);
      });
      const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 1.5, 10), LS.makeToonMat(0x7a964b));
      spout.rotation.x = Math.PI / 2 + 0.22; spout.position.set(0, 0.95, 0.2); wfG.add(spout);
      const streamFall = new THREE.Mesh(
        new THREE.CylinderGeometry(0.10, 0.24, 1.38, 10),
        new THREE.MeshBasicMaterial({ color: 0xd8f5ff, transparent: true, opacity: 0.78 })
      );
      streamFall.position.set(0, 0.24, 0.88); streamFall.rotation.x = 0.24; wfG.add(streamFall);
      for (let r = 0; r < 3; r++) {
        const wr = new THREE.Mesh(
          new THREE.RingGeometry(0.18, 0.30, 18),
          new THREE.MeshBasicMaterial({ color: 0xe6faff, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
        );
        wr.rotation.x = -Math.PI / 2; wr.position.set(0, -0.40, 1.08);
        wfG.add(wr); W.waterfallRings.push(wr);
      }
      worldGroup.add(wfG);

      // Arched Cedar Bridge with warm lantern halos
      const bridgeG = new THREE.Group();
      const plankMat = LS.makeSurfaceMat(LS.createCedarPlankTexture(), { roughness: 0.72 });
      const railWood = LS.makeToonMat(0x6e472c), giboshiMat = LS.makeToonMat(0xc99c43), lanternMat = new THREE.MeshBasicMaterial({ color: 0xffd685 });
      const segments = 16, xStart = -13.5, xEnd = -30.5, segLen = (xStart - xEnd) / segments;
      for (let i = 0; i < segments; i++) {
        const t0 = i / segments, t1 = (i + 1) / segments, tm = (t0 + t1) / 2;
        const xm = xStart - tm * (xStart - xEnd);
        const y0 = Math.sin(t0 * Math.PI) * 1.15, y1 = Math.sin(t1 * Math.PI) * 1.15, ym = (y0 + y1) / 2;
        const slope = Math.atan2(y1 - y0, segLen);
        const deck = new THREE.Mesh(new THREE.BoxGeometry(segLen + 0.08, 0.16, 3.2), plankMat);
        deck.position.set(xm, ym - 0.04, -27.5); deck.rotation.z = -slope; deck.castShadow = true; deck.receiveShadow = true; bridgeG.add(deck);
        [-1.52, 1.52].forEach(rz => {
          const topRail = new THREE.Mesh(new THREE.BoxGeometry(segLen + 0.08, 0.09, 0.1), railWood); topRail.position.set(xm, ym + 0.88, -27.5 + rz); topRail.rotation.z = -slope; bridgeG.add(topRail);
          const midRail = new THREE.Mesh(new THREE.BoxGeometry(segLen + 0.08, 0.07, 0.08), railWood); midRail.position.set(xm, ym + 0.48, -27.5 + rz); midRail.rotation.z = -slope; bridgeG.add(midRail);
        });
      }
      [0, 0.25, 0.5, 0.75, 1.0].forEach((t, idx) => {
        const px = xStart - t * (xStart - xEnd), py = Math.sin(t * Math.PI) * 1.15;
        [-1.52, 1.52].forEach(rz => {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.15, 0.16), railWood); post.position.set(px, py + 0.52, -27.5 + rz); bridgeG.add(post);
          if (idx === 1 || idx === 3) {
            const lBox = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 0.24), lanternMat); lBox.position.set(px, py + 1.24, -27.5 + rz); bridgeG.add(lBox);
            if (LS.isHD && LS.createGlowSprite) {
              const halo = LS.createGlowSprite(0xffd27d, 1.45); halo.position.copy(lBox.position); bridgeG.add(halo);
            }
            const cap = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.16, 4), railWood); cap.rotation.y = Math.PI / 4; cap.position.set(px, py + 1.48, -27.5 + rz); bridgeG.add(cap);
          } else {
            const giboshi = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), giboshiMat); giboshi.scale.set(1, 1.3, 1); giboshi.position.set(px, py + 1.16, -27.5 + rz); bridgeG.add(giboshi);
          }
        });
      });
      [-13.42, -30.58].forEach(rx => { const ramp = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.12, 3.4), LS.makeToonMat(0x524c44)); ramp.position.set(rx, 0.04, -27.5); bridgeG.add(ramp); });
      worldGroup.add(bridgeG);

      // 8 Articulated Calico Koi Fish (Kohaku, Sanke & Yamabuki gold patterns + swishing tails & pectoral fins!)
      const koiSpecs = [
        [0xfaf7f2, 0xe63946], [0xffd166, 0xff9f1c], [0xfaf7f2, 0xff6b35], [0xe63946, 0x1f242c],
        [0xff9f1c, 0xfaf7f2], [0xf77f00, 0xfff3d6], [0xfaf7f2, 0xef476f], [0xffb703, 0xe63946]
      ];
      for (let i = 0; i < 8; i++) {
        const kg = new THREE.Group();
        const kMat = LS.makeToonMat(koiSpecs[i][0]), spotMat = LS.makeToonMat(koiSpecs[i][1]);
        const kBody = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 8), kMat); kBody.scale.set(0.55, 0.44, 1.95); kg.add(kBody);
        const kSpot = new THREE.Mesh(new THREE.SphereGeometry(0.115, 8, 6), spotMat); kSpot.scale.set(0.62, 0.35, 1.15); kSpot.position.set(0, 0.05, 0.06); kg.add(kSpot);
        const kSpot2 = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), spotMat); kSpot2.scale.set(0.55, 0.32, 0.85); kSpot2.position.set(0, 0.045, -0.15); kg.add(kSpot2);
        [-0.11, 0.11].forEach(fx => {
          const fin = new THREE.Mesh(new THREE.SphereGeometry(0.075, 6, 5), kMat);
          fin.scale.set(1.3, 0.18, 0.75); fin.position.set(fx, -0.01, 0.05); fin.rotation.y = fx > 0 ? -0.4 : 0.4; kg.add(fin);
        });
        const tailPivot = new THREE.Group(); tailPivot.position.z = -0.28;
        const kTail = new THREE.Mesh(new THREE.ConeGeometry(0.125, 0.30, 5), spotMat);
        kTail.rotation.x = Math.PI / 2; kTail.scale.set(0.32, 1.0, 1.0); kTail.position.z = -0.12; tailPivot.add(kTail);
        kg.add(tailPivot);
        const cx = -22.5 + (i % 2 === 0 ? 3.2 : -3.2), cz = i < 4 ? -21.8 : -33.2;
        kg.position.set(cx, -0.52, cz); worldGroup.add(kg);
        W.koiList.push({ mesh: kg, tail: tailPivot, cx, cz, rx: 2.2 + (i % 3) * 0.7, rz: 1.6 + (i % 2) * 0.8, speed: 0.45 + (i % 4) * 0.14, phase: i * 1.15 });
      }

      // Sculpted Pond Ducks (Normal-mapped GLBs in HD + Upgraded Multi-Part Ducks in Classic!) + Water Wake Ripples!
      function buildPondDuck(variant) {
        const glbKey = variant === 'white' ? 'anime_duck_white' : 'anime_duck_mallard';
        const wrap = new THREE.Group();
        if (LS.isHD && LS.hdAssets && LS.hdAssets.has(glbKey)) {
          const mdl = LS.hdAssets.clone(glbKey);
          mdl.scale.setScalar(1.48);
          wrap.add(mdl);
        } else {
          const isW = variant === 'white';
          const bodyM = LS.makeToonMat(isW ? 0xfcf9f0 : 0xa89f91);
          const wingM = LS.makeToonMat(isW ? 0xf2ece0 : 0x7c6855);
          const headM = LS.makeToonMat(isW ? 0xfcf9f0 : 0x1e6042);
          const billM = LS.makeToonMat(isW ? 0xf5921b : 0xe8b923);
          const eyeM = LS.makeToonMat(0x181210);
          const inner = new THREE.Group(); inner.scale.setScalar(1.38);
          const body = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 10), bodyM); body.scale.set(0.9, 0.7, 1.42); body.position.y = 0.11; body.castShadow = true; inner.add(body);
          [-0.17, 0.17].forEach(wx => {
            const w = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), wingM); w.scale.set(0.55, 0.72, 1.65); w.position.set(wx, 0.15, -0.04); inner.add(w);
          });
          const tail = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.24, 7), LS.makeToonMat(isW ? 0xfcf9f0 : 0x303238));
          tail.position.set(0, 0.20, -0.34); tail.rotation.x = -0.85; inner.add(tail);
          const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.105, 0.22, 10), isW ? bodyM : LS.makeToonMat(0x7c3f2c));
          neck.position.set(0, 0.26, 0.22); inner.add(neck);
          if (!isW) {
            const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.092, 0.04, 12), LS.makeToonMat(0xfbf9f4));
            ring.position.set(0, 0.32, 0.23); inner.add(ring);
          }
          const head = new THREE.Mesh(new THREE.SphereGeometry(0.135, 14, 10), headM); head.position.set(0, 0.43, 0.25); head.castShadow = true; inner.add(head);
          [-0.095, 0.095].forEach(ex => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 6), eyeM); eye.position.set(ex, 0.46, 0.34); inner.add(eye);
            const sp = new THREE.Mesh(new THREE.SphereGeometry(0.01, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff })); sp.position.set(ex * 1.08, 0.47, 0.358); inner.add(sp);
          });
          const bill = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), billM); bill.scale.set(0.9, 0.42, 1.55); bill.position.set(0, 0.41, 0.42); inner.add(bill);
          wrap.add(inner);
        }
        // Subtle expanding translucent wake ring right at the waterline!
        const wake = new THREE.Mesh(
          new THREE.RingGeometry(0.42, 0.54, 22),
          new THREE.MeshBasicMaterial({ color: 0xe6f8ff, transparent: true, opacity: 0.48, side: THREE.DoubleSide })
        );
        wake.rotation.x = -Math.PI / 2; wake.position.set(0, 0.02, -0.04);
        wrap.add(wake);
        return { root: wrap, wake };
      }

      const duckConfigs = [
        { variant: 'white', cx: -20.2, cz: -21.8, r: 2.1, speed: 0.35, phase: 0.4 },
        { variant: 'mallard', cx: -23.6, cz: -22.2, r: 2.2, speed: 0.40, phase: 2.6 },
        { variant: 'mallard', cx: -22.6, cz: -32.6, r: 2.5, speed: 0.36, phase: 4.5 }
      ];
      duckConfigs.forEach((dc, i) => {
        const built = buildPondDuck(dc.variant);
        worldGroup.add(built.root);
        W.duckList.push({ mesh: built.root, wake: built.wake, cx: dc.cx, cz: dc.cz, r: dc.r, speed: dc.speed, phase: dc.phase, isMama: i === 0 });
      });

      // 2 Adorable Fluffy Yellow Ducklings swimming right behind the White Mama Duck!
      const dklYellow = LS.makeToonMat(0xffe066), dklBill = LS.makeToonMat(0xf59e0b), dklEye = LS.makeToonMat(0x1a120e);
      for (let k = 0; k < 2; k++) {
        const dl = new THREE.Group();
        const inner = new THREE.Group(); inner.scale.setScalar(1.38);
        const db = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), dklYellow); db.scale.set(0.92, 0.78, 1.25); db.position.y = 0.06; inner.add(db);
        const dh = new THREE.Mesh(new THREE.SphereGeometry(0.082, 10, 8), dklYellow); dh.position.set(0, 0.18, 0.09); inner.add(dh);
        const bk = new THREE.Mesh(new THREE.SphereGeometry(0.036, 8, 6), dklBill); bk.scale.set(0.85, 0.45, 1.4); bk.position.set(0, 0.165, 0.17); inner.add(bk);
        [-0.055, 0.055].forEach(ex => {
          const ey = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), dklEye); ey.position.set(ex, 0.20, 0.145); inner.add(ey);
        });
        dl.add(inner);
        const dlWake = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.24, 14), new THREE.MeshBasicMaterial({ color: 0xe6f8ff, transparent: true, opacity: 0.40, side: THREE.DoubleSide }));
        dlWake.rotation.x = -Math.PI / 2; dlWake.position.y = 0.015; dl.add(dlWake);
        worldGroup.add(dl);
        W.ducklings.push({ mesh: dl, wake: dlWake, lag: 0.52 + k * 0.42, phase: k * 1.4 });
      }

      // Sculpted Traditional Wooden Kyoto Wasen Rowboat (tapered bow/stern, ribs, seats, resting oars & mooring post!)
      const boat = new THREE.Group(); boat.position.set(-26.8, -0.38, -20.5); boat.rotation.y = 0.52;
      const hullWood = LS.makeToonMat(0x7c5333), trimWood = LS.makeToonMat(0x5a3921), seatWood = LS.makeToonMat(0xa67449);
      const hullFloor = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.12, 1.85), hullWood); hullFloor.position.y = 0.06; hullFloor.castShadow = true; boat.add(hullFloor);
      [-0.56, 0.56].forEach(sx => {
        const side = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.34, 1.95), hullWood);
        side.position.set(sx, 0.20, 0); side.rotation.z = sx > 0 ? -0.16 : 0.16; side.castShadow = true; boat.add(side);
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 2.0), trimWood); rail.position.set(sx * 1.05, 0.38, 0); boat.add(rail);
      });
      [-1.18, 1.18].forEach(pz => {
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.56, 0.72, 4), hullWood);
        tip.rotation.x = pz > 0 ? Math.PI / 2 : -Math.PI / 2; tip.rotation.y = Math.PI / 4;
        tip.scale.set(1.05, 1.0, 0.42); tip.position.set(0, 0.22, pz); boat.add(tip);
      });
      [-0.38, 0.38].forEach(bz => {
        const seat = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.07, 0.34), seatWood); seat.position.set(0, 0.28, bz); boat.add(seat);
      });
      // Resting wooden oars tucked neatly inside the rowboat
      [-0.24, 0.24].forEach(ox => {
        const oar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.75, 6), seatWood);
        oar.rotation.x = Math.PI / 2; oar.rotation.z = ox > 0 ? 0.1 : -0.1; oar.position.set(ox, 0.34, 0.05); boat.add(oar);
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.025, 0.42), trimWood);
        blade.position.set(ox * 1.1, 0.34, -0.78); boat.add(blade);
      });
      worldGroup.add(boat); W.rowboat = boat;
      // Weathered wooden mooring post beside the rowboat
      const moorPost = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 1.35, 8), trimWood);
      moorPost.position.set(-28.1, -0.05, -19.2); moorPost.castShadow = true; worldGroup.add(moorPost);

      // Cedar Koi Feeding Dock
      const dock = new THREE.Group(); dock.position.set(-14.3, 0, -22.2);
      const dockDeck = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.16, 2.6), plankMat); dockDeck.position.set(-0.4, 0.08, 0); dockDeck.receiveShadow = true; dock.add(dockDeck);
      const feedSign = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.65, 1.8), new THREE.MeshBasicMaterial({ map: LS.createSignTexture('🐟 FEED KOI & DUCKS', { bg: '#e0f2fe', border: '#0284c7', color: '#0c4a6e', font: 'bold 34px sans-serif' }) }));
      feedSign.position.set(0.55, 1.05, 0); dock.add(feedSign);
      const feedPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 6), railWood); feedPost.position.set(0.55, 0.55, 0); dock.add(feedPost);
      worldGroup.add(dock);
      W.zones.push({ id: 'koi_dock', label: 'Feed Koi Fish & Ducks (+15c)', pos: new THREE.Vector3(-13.2, 0, -22.2), radius: 2.8 });

      for (let i = 0; i < 4; i++) {
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.3, 18), new THREE.MeshBasicMaterial({ color: 0xd8f3ff, transparent: true, opacity: 0.0, side: THREE.DoubleSide }));
        ring.rotation.x = -Math.PI / 2; ring.position.set(-17.5 - i * 0.9, -0.39, -21.8 + (i % 2) * 0.9); worldGroup.add(ring); W.rippleRings.push(ring);
      }

      // Lush shoreline cattails, tall pond reeds & blooming 3D Pink/White Lotus Lily Pads!
      const reedMat = LS.makeToonMat(0x4c7c3e), cattailMat = LS.makeToonMat(0x613b22);
      [[-15.6, -17.3], [-19.0, -17.4], [-24.2, -17.3], [-28.8, -18.4], [-15.2, -36.2], [-22.6, -37.7], [-27.2, -37.2], [-30.3, -32.4], [-30.2, -23.0]].forEach((rg, idx) => {
        SC.addTallGrass(worldGroup, rg[0], rg[1], 1.32);
        // Pair of slender cattails rising naturally from the shoreline reeds
        for (let c = 0; c < 2; c++) {
          const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.024, 1.15 + c * 0.22, 5), reedMat);
          stem.position.set(rg[0] + (c - 0.5) * 0.24, 0.42, rg[1] + (idx % 2 === 0 ? 0.16 : -0.16));
          stem.rotation.z = (c - 0.5) * 0.16; worldGroup.add(stem);
          const head = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.22, 6), cattailMat);
          head.position.set(stem.position.x + (c - 0.5) * 0.07, 0.88 + c * 0.18, stem.position.z);
          head.rotation.z = stem.rotation.z; worldGroup.add(head);
        }
      });

      // Floating lily pads with sculpted 3D multi-petal pink & cream Kyoto lotus blossoms!
      const lotusCoords = [
        [-17.8, -19.2, true, 0xff9ec0], [-19.1, -20.0, false, 0], [-24.5, -19.1, true, 0xfff3f6],
        [-25.4, -19.8, false, 0], [-28.2, -23.4, true, 0xff8fab], [-26.4, -35.0, true, 0xffb3c6],
        [-25.2, -34.2, false, 0], [-18.4, -34.8, true, 0xfff5f8], [-17.2, -33.8, false, 0], [-21.5, -35.6, true, 0xff9ec0]
      ];
      lotusCoords.forEach(lp => {
        SC.addLilyPad(worldGroup, lp[0], -0.39, lp[1], 1.15, false);
        if (lp[2]) {
          const lg = new THREE.Group(); lg.position.set(lp[0], -0.36, lp[1]);
          const pMat = LS.makeToonMat(lp[3]);
          for (let p = 0; p < 6; p++) {
            const ang = (p / 6) * Math.PI * 2;
            const pet = new THREE.Mesh(new THREE.SphereGeometry(0.085, 7, 6), pMat);
            pet.scale.set(0.62, 0.45, 1.45);
            pet.position.set(Math.cos(ang) * 0.10, 0.05, Math.sin(ang) * 0.10);
            pet.rotation.y = -ang + Math.PI / 2; pet.rotation.x = -0.35; lg.add(pet);
          }
          const core = new THREE.Mesh(new THREE.SphereGeometry(0.055, 7, 6), LS.makeToonMat(0xffd166));
          core.position.y = 0.07; lg.add(core);
          worldGroup.add(lg);
        }
      });
    });

    // 3. Lakeside Sushi Stand (桜寿司)
    safeRun('sushi_stand', () => {
      const g = new THREE.Group(); g.position.set(-8.2, 0, -29.8);
      const pad = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.08, 3.0), LS.makeToonMat(0x43413c)); pad.position.set(0, 0.04, 0.2); pad.receiveShadow = true; g.add(pad);
      const cedar = LS.makeToonMat(0x9a6b43), darkWood = LS.makeToonMat(0x523623);
      const counter = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.96, 1.25), cedar); counter.position.set(0, 0.48, -0.35); counter.castShadow = true; g.add(counter);
      const glassCase = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.34, 0.42), new THREE.MeshLambertMaterial({ color: 0xe0f7fa, transparent: true, opacity: 0.65 })); glassCase.position.set(-0.3, 1.13, -0.15); g.add(glassCase);
      [0xff7b54, 0xffd166, 0xe63946, 0x95d5b2].forEach((col, i) => { const piece = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.14), LS.makeToonMat(col)); piece.position.set(-0.85 + i * 0.36, 1.04, -0.15); g.add(piece); });
      [[-1.8, -0.85], [1.8, -0.85], [-1.8, 0.35], [1.8, 0.35]].forEach(p => { const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.7, 0.16), darkWood); post.position.set(p[0], 1.35, p[1]); g.add(post); });
      const roof = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.22, 2.4), LS.makeToonMat(0xffffff, { map: LS.createRoofTileTexture('#313a4a') })); roof.position.set(0, 2.82, -0.2); roof.rotation.x = 0.12; roof.castShadow = true; g.add(roof);
      const indigo = LS.makeToonMat(0x274060, { side: THREE.DoubleSide });
      for (let i = -2; i <= 2; i++) { const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.68, 0.05), indigo); cloth.position.set(i * 0.68, 2.35, 0.42); g.add(cloth); W.norenPanels.push({ mesh: cloth, phase: i * 0.6 }); }
      const sign = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.62, 0.14), new THREE.MeshBasicMaterial({ map: LS.createSignTexture('🍣 桜寿司 SAKURA SUSHI', { bg: '#1e293b', border: '#f59e0b', color: '#fff8eb', font: 'bold 34px sans-serif' }) })); sign.position.set(0, 3.25, 0.55); g.add(sign);
      const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.7, 6), darkWood); flagPole.position.set(2.35, 1.35, 0.4); g.add(flagPole);
      const nobori = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.5, 0.04), LS.makeToonMat(0xd62828)); nobori.position.set(2.65, 1.85, 0.4); g.add(nobori);
      [-1.05, 0, 1.05].forEach(sx => { const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.26, 0.08, 12), cedar); seat.position.set(sx, 0.48, 0.85); g.add(seat); const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 0.46, 8), darkWood); leg.position.set(sx, 0.23, 0.85); g.add(leg); });
      const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffd27d })); lantern.scale.set(1, 1.35, 1); lantern.position.set(-1.95, 2.2, 0.45); g.add(lantern);
      worldGroup.add(g); addCollider(-8.2, -30.2, 2.1, 0.85);
      W.zones.push({ id: 'sushi_stand', label: 'Eat at Sakura Sushi (桜寿司)', pos: new THREE.Vector3(-8.2, 0, -28.0), radius: 2.9 });
      W.sushiDiningConfig = {
        lailaSeatPos: new THREE.Vector3(-8.2, 0.14, -28.95), salmaSeatPos: new THREE.Vector3(-7.15, 0.16, -28.95),
        seatRotY: Math.PI, exitOffset: new THREE.Vector3(0, 0, 1.35),
        lailaDishPos: new THREE.Vector3(-8.2, 0.98, -29.85), salmaDishPos: new THREE.Vector3(-7.15, 0.98, -29.85),
        oishiiPos: new THREE.Vector3(-7.7, 2.2, -29.4), camPos: new THREE.Vector3(-10.2, 1.65, -26.4), camLook: new THREE.Vector3(-7.8, 0.95, -29.4), caption: 'Oishii! 😋🍣'
      };
    });

    // 4. Sakurako Shrine + Senbon Torii + Chozuya + Ema/Omikuji + Elevated Courtyard
    safeRun('sakurako_shrine', () => {
      const sando = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.08, 3.6), new THREE.MeshLambertMaterial({ map: LS.createStonePathTexture() }));
      sando.position.set(-36.2, 0.04, -27.5); sando.receiveShadow = true; worldGroup.add(sando);

      const vermilion = LS.makeToonMat(0xd63628), blackCap = LS.makeToonMat(0x1f2429);
      for (let i = 0; i < 6; i++) {
        const tx = -33.2 - i * 1.55;
        const tg = new THREE.Group(); tg.position.set(tx, 0, -27.5); tg.rotation.y = Math.PI / 2;
        [-1.65, 1.65].forEach(px => {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 3.8, 10), vermilion); col.position.set(px, 1.9, 0); col.castShadow = true; tg.add(col);
          const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.35, 10), blackCap); base.position.set(px, 0.17, 0); tg.add(base);
        });
        const nuki = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.22, 0.22), vermilion); nuki.position.y = 3.25; tg.add(nuki);
        const kasagi = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.28, 0.38), vermilion); kasagi.position.y = 3.85; tg.add(kasagi);
        const topCap = new THREE.Mesh(new THREE.BoxGeometry(4.85, 0.12, 0.42), blackCap); topCap.position.y = 4.02; tg.add(topCap);
        worldGroup.add(tg);
      }

      const stoneMat = LS.makeToonMat(0x7c7b74), woodMat = LS.makeToonMat(0x6e472c);
      const chozuya = new THREE.Group(); chozuya.position.set(-37.2, 0, -21.8);
      const basin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.85, 1.1), stoneMat); basin.position.y = 0.42; basin.castShadow = true; chozuya.add(basin);
      const basinWater = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.8), LS.makeToonMat(0x38a3a5)); basinWater.rotation.x = -Math.PI / 2; basinWater.position.y = 0.86; chozuya.add(basinWater);
      [[-1.0, -0.7], [1.0, -0.7], [-1.0, 0.7], [1.0, 0.7]].forEach(p => { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8), woodMat); post.position.set(p[0], 1.25, p[1]); chozuya.add(post); });
      const cRoof = new THREE.Mesh(new THREE.ConeGeometry(2.0, 0.95, 4), LS.makeToonMat(0x373f47)); cRoof.rotation.y = Math.PI / 4; cRoof.position.y = 2.9; chozuya.add(cRoof);
      worldGroup.add(chozuya); addCollider(-37.2, -21.8, 1.2, 0.9);

      const emaG = new THREE.Group(); emaG.position.set(-37.2, 0, -33.2);
      [-1.3, 1.3].forEach(px => { const p = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.3, 0.14), woodMat); p.position.set(px, 1.15, 0); emaG.add(p); });
      const eRoof = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.22, 0.95), LS.makeToonMat(0x3a404a)); eRoof.position.y = 2.35; emaG.add(eRoof);
      for (let r = 0; r < 2; r++) for (let c = -3; c <= 3; c++) { const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.2, 0.04), LS.makeToonMat(0xe9c46a)); plaque.position.set(c * 0.34, 1.35 + r * 0.38, 0); emaG.add(plaque); }
      const omiBox = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.05, 0.65), vermilion); omiBox.position.set(2.0, 0.52, 0.2); emaG.add(omiBox);
      const omiSign = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.55, 0.12), new THREE.MeshBasicMaterial({ map: LS.createSignTexture('🎐 OMIKUJI & EMA WISHES', { bg: '#fff8eb', border: '#c83e37', color: '#7f1d1d', font: 'bold 31px sans-serif' }) }));
      omiSign.position.set(0.3, 2.8, 0.3); emaG.add(omiSign);
      worldGroup.add(emaG); addCollider(-37.2, -33.2, 1.8, 0.65);
      W.zones.push({ id: 'shrine_omikuji', label: 'Draw Omikuji Fortune & Hang Ema Wish 🎐', pos: new THREE.Vector3(-37.2, 0, -31.5), radius: 3.1 });

      const court = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.75, 17.5), LS.makeToonMat(0xb8b2a2)); court.position.set(-49.8, 0.375, -27.5); court.receiveShadow = true; worldGroup.add(court);
      for (let st = 0; st < 4; st++) { const step = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.19 * (st + 1), 4.6), stoneMat); step.position.set(-41.9 - st * 0.55, 0.095 * (st + 1), -27.5); step.receiveShadow = true; worldGroup.add(step); }
      [-24.4, -30.6].forEach(kz => {
        const kg = new THREE.Group(); kg.position.set(-44.6, 0.75, kz);
        const ped = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.8, 0.95), stoneMat); ped.position.y = 0.4; kg.add(ped);
        const lion = new THREE.Mesh(new THREE.SphereGeometry(0.38, 10, 8), LS.makeToonMat(0x94928a)); lion.scale.set(1.2, 1.1, 0.85); lion.position.y = 1.12; kg.add(lion);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), LS.makeToonMat(0x94928a)); head.position.set(0.24, 1.48, 0); kg.add(head);
        worldGroup.add(kg); addCollider(-44.6, kz, 0.65, 0.65);
      });

      const hall = new THREE.Group(); hall.position.set(-51.6, 0.75, -27.5);
      const hBody = new THREE.Mesh(new THREE.BoxGeometry(5.6, 4.4, 8.2), LS.makeToonMat(0xf5ebd6)); hBody.position.y = 2.2; hBody.castShadow = true; hall.add(hBody);
      [-3.5, -1.2, 1.2, 3.5].forEach(pz => { const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 4.2, 10), vermilion); col.position.set(3.2, 2.1, pz); hall.add(col); });
      const hRoof = new THREE.Mesh(new THREE.ConeGeometry(6.8, 2.8, 4), LS.makeToonMat(0xffffff, { map: LS.createRoofTileTexture('#2d3a3a') })); hRoof.rotation.y = Math.PI / 4; hRoof.scale.set(1.0, 1.0, 1.32); hRoof.position.y = 5.6; hRoof.castShadow = true; hall.add(hRoof);
      const bell = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), LS.makeToonMat(0xe9c46a)); bell.position.set(3.45, 3.3, 0); hall.add(bell);
      const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 1.9, 8), LS.makeToonMat(0xf4f1ea)); rope.position.set(3.45, 2.2, 0); hall.add(rope);
      const saisen = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.9, 2.2), woodMat); saisen.position.set(3.55, 0.45, 0); hall.add(saisen);
      const hSign = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.9, 3.8), new THREE.MeshBasicMaterial({ map: LS.createSignTexture('⛩️ 桜湖神社 SAKURAKO SHRINE', { bg: '#2b1a12', border: '#e9c46a', color: '#fff8eb', font: 'bold 28px sans-serif' }) })); hSign.position.set(3.45, 4.15, 0); hall.add(hSign);
      worldGroup.add(hall); addCollider(-51.6, -27.5, 3.8, 4.3);

      const goshin = buildKyotoTree(-47.5, -21.0, 'cedar', 1.45, 0.75);
      const shimenawa = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.11, 8, 16), LS.makeToonMat(0xe5c88e)); shimenawa.rotation.x = Math.PI / 2; shimenawa.position.y = 1.6; goshin.add(shimenawa);

      const jizo = new THREE.Group(); jizo.position.set(-46.5, 0.75, -34.0);
      const jBody = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.34, 0.85, 10), stoneMat); jBody.position.y = 0.42; jizo.add(jBody);
      const jHead = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), stoneMat); jHead.position.y = 1.02; jizo.add(jHead);
      const bib = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.34, 8), vermilion); bib.position.set(0.08, 0.72, 0); bib.rotation.z = -0.25; jizo.add(bib);
      worldGroup.add(jizo);

      [[-32.0, -24.5, 0], [-32.0, -30.5, 0], [-43.8, -23.0, 0.75], [-43.8, -32.0, 0.75]].forEach(lp => addStoneLantern(lp[0], lp[1], lp[2]));
    });

    // 5. Expanded Deep Arashiyama Bamboo Woods & Hillside Rest Trail (X=-60..-14, Z=-40..-57)
    safeRun('bamboo_grove', () => {
      SC.addCurvedPath(worldGroup, [[-4, -44.2], [-16, -44.2], [-30, -45.5], [-44, -44.0], [-56, -48.5]], 2.8, 'stone');
      SC.addFenceRun(worldGroup, -14, -42.2, -46, -42.2, 'bamboo');
      SC.addBench(worldGroup, -31, -43.0, 0);
      SC.addBench(worldGroup, -51, -46.5, 0.4);
      [[-22, -42.8], [-38, -47.2], [-53, -49.5]].forEach(b => SC.addBoulder(worldGroup, b[0], b[1], 1.1, true));

      const bambooMatA = LS.makeToonMat(0x4c9a42), bambooMatB = LS.makeToonMat(0x66b852), leafMat = LS.makeToonMat(0x3a7d38);
      const positions = [];
      for (let bx = -58; bx <= -15; bx += 2.6) {
        positions.push([bx, -40.5], [bx + 0.9, -41.6], [bx, -48.2], [bx + 1.1, -50.8], [bx + 0.4, -53.5], [bx + 1.2, -56.0]);
      }
      positions.forEach((bp, idx) => {
        const h = 7.8 + (idx % 4) * 1.6;
        const stalk = new THREE.Group(); stalk.position.set(bp[0], 0, bp[1]);
        const culm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, h, 7), idx % 2 === 0 ? bambooMatA : bambooMatB);
        culm.position.y = h / 2; culm.castShadow = true; stalk.add(culm);
        const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(0.95, 0), leafMat);
        canopy.position.set(0.25, h - 0.5, 0); canopy.scale.set(1.3, 0.55, 1.3); stalk.add(canopy);
        worldGroup.add(stalk);
        W.bambooStalks.push({ mesh: stalk, phase: idx * 0.55 });
      });

      const bSign = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.72, 2.8), new THREE.MeshBasicMaterial({ map: LS.createSignTexture('🎋 ARASHIYAMA BAMBOO', { bg: '#1b4332', border: '#95d5b2', color: '#ecfdf5', font: 'bold 31px sans-serif' }) }));
      bSign.position.set(-14.5, 1.85, -42.5); worldGroup.add(bSign);
    });

    // 6. Asymmetrical Machiya Clusters, Organic Zen Rock Garden, Meandering Yousuiro Stream, Open Meadows & Hamlet!
    safeRun('machiya_and_natural_villages', () => {
      // STAGGERED WEST MACHIYA (with open lakeside meadow south of Kimono Shop!)
      buildMachiya(-10.8, -12.5, Math.PI / 2 - 0.1, {
        wallHex: '#f6ebd4', roofHex: '#4a3a35', norenColor: 0xc94c79,
        signText: '🏮 LAILA & SALMA RYOKAN', signBg: '#fff0f6', signBorder: '#c94c79', signColor: '#6b2144'
      });
      W.zones.push({ id: 'kyoto_ryokan', label: "Enter Laila & Salma's 3D Ryokan Suite 🏮", pos: new THREE.Vector3(-5.8, 0, -12.5), radius: 3.1 });

      buildMachiya(-12.2, 2.2, Math.PI / 2 + 0.16, {
        wallHex: '#ffeef2', roofHex: '#6b3a5b', norenColor: 0xd62828,
        signText: '👘 KYOTO KIMONO SHOP', signBg: '#fff0f5', signBorder: '#d62828', signColor: '#7f1d1d'
      });
      W.zones.push({ id: 'kimono_shop', label: 'Browse Kyoto Kimonos & Fox Masks 👘', pos: new THREE.Vector3(-6.8, 0, 2.2), radius: 3.3 });

      // SOUTHWEST MOMIJI CRAFT VILLAGE & ORGANIC OVAL RAKED ZEN ROCK GARDEN (Karesansui)
      const zenGeo = new THREE.CylinderGeometry(6.8, 7.0, 0.08, 28);
      const zenPad = new THREE.Mesh(zenGeo, new THREE.MeshLambertMaterial({ map: LS.createZenGravelTexture() }));
      zenPad.scale.set(1.25, 1, 0.72);
      zenPad.rotation.y = 0.22;
      zenPad.position.set(-35.5, 0.04, 18.0); zenPad.receiveShadow = true; worldGroup.add(zenPad);
      // Single curved-style asymmetric bamboo screen along north side (open on south & meadow sides!)
      SC.addFenceRun(worldGroup, -42.5, 13.4, -34.0, 12.2, 'bamboo');
      SC.addFenceRun(worldGroup, -34.0, 12.2, -28.0, 14.2, 'bamboo');
      [[-39.2, 17.2, 1.35], [-33.8, 19.2, 1.15], [-31.0, 16.8, 0.85], [-40.5, 20.5, 0.72]].forEach(b => SC.addBoulder(worldGroup, b[0], b[1], b[2], true));
      SC.addBench(worldGroup, -35.5, 11.4, -0.14);
      addStoneLantern(-27.6, 14.8, 0); addStoneLantern(-43.0, 14.0, 0);

      // Maple Gazebo & spaced Craft Machiya (Pottery Studio & Fan Atelier)
      const gaz = new THREE.Group(); gaz.position.set(-31.5, 0, 7.2);
      const gDeck = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.4, 0.25, 8), LS.makeToonMat(0x8b6343)); gDeck.position.y = 0.12; gaz.add(gDeck);
      for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + Math.PI / 4; const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.8, 6), LS.makeToonMat(0xc83e37)); p.position.set(Math.cos(a) * 2.4, 1.5, Math.sin(a) * 2.4); gaz.add(p); }
      const gRoof = new THREE.Mesh(new THREE.ConeGeometry(4.2, 1.8, 8), LS.makeToonMat(0x363b45)); gRoof.position.y = 3.7; gaz.add(gRoof);
      worldGroup.add(gaz);

      buildMachiya(-46.8, 4.5, 0.48, { wallHex: '#f2e8d4', roofHex: '#4f3b32', norenColor: 0x3b6ea5, signText: '🏺 KYOTO POTTERY STUDIO', width: 6.4, depth: 5.4, height: 4.4 });
      buildMachiya(-22.5, 26.5, Math.PI - 0.24, { wallHex: '#f8efe0', roofHex: '#5a3a45', norenColor: 0xe07a34, signText: '🪭 FOLDING FAN ATELIER', width: 6.2, depth: 5.4, height: 4.4 });

      // STAGGERED EAST MACHIYA (leaving generous open green garden meadows north & south!)
      buildMachiya(10.0, -5.0, -Math.PI / 2 + 0.12, {
        wallHex: '#edf5e4', roofHex: '#2f4f3e', norenColor: 0x2d6a4f,
        signText: '🍵 UJI MATCHA TEA HOUSE', signBg: '#1b4332', signBorder: '#95d5b2', signColor: '#ecfdf5'
      });
      const umb = new THREE.Group(); umb.position.set(5.4, 0, -2.5);
      const uPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.5, 8), LS.makeToonMat(0x5c3c24)); uPole.position.y = 1.25; umb.add(uPole);
      const uTop = new THREE.Mesh(new THREE.ConeGeometry(1.55, 0.55, 12), LS.makeToonMat(0xd62828)); uTop.position.y = 2.55; umb.add(uTop);
      const uBench = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.42, 1.9), LS.makeToonMat(0xc9302c)); uBench.position.set(0.35, 0.21, 0); umb.add(uBench);
      worldGroup.add(umb);
      W.zones.push({ id: 'tea_house', label: 'Order Matcha & Wagashi Treats 🍵', pos: new THREE.Vector3(5.6, 0, -5.0), radius: 3.3 });

      buildMachiya(10.8, -21.2, -Math.PI / 2 - 0.14, {
        wallHex: '#f7efe0', roofHex: '#7a3b34', norenColor: 0x3b6ea5,
        signText: '📚 KYOTO TEMPLE ACADEMY', signBg: '#234232', signBorder: '#e0a458', signColor: '#fff8eb'
      });
      W.zones.push({ id: 'kyoto_academy', label: 'Enter Kyoto Temple Academy Quiz 📚', pos: new THREE.Vector3(6.2, 0, -21.2), radius: 3.4 });

      // MEANDERING EAST YOUSUIRO STREAM with 3 arched cedar footbridges at natural bends!
      const bridgeSpecs = [
        { x: 19.5, z: -26.0, lead: [[1.0, -25.0], [10.0, -26.2], [17.4, -26.0]] },
        { x: 15.5, z: -13.0, lead: [[1.0, -12.8], [8.5, -13.4], [13.4, -13.0]] },
        { x: 18.5, z: 3.0, lead: [[0.5, 3.8], [9.5, 4.2], [16.4, 3.0]] }
      ];
      SC.addMeanderingStream(
        worldGroup, KYOTO_STREAM_PTS, 3.2, addCollider,
        bridgeSpecs.map(b => ({ x: b.x, z: b.z, r: 3.1 }))
      );

      const plankMat = new THREE.MeshLambertMaterial({ map: LS.createCedarPlankTexture() });
      const railWood = LS.makeToonMat(0x6e472c);
      bridgeSpecs.forEach(bs => {
        for (let i = 0; i < 5; i++) {
          const t0 = i / 5, t1 = (i + 1) / 5, tm = (t0 + t1) / 2;
          const xm = (bs.x - 2.3) + tm * 4.6;
          const ym = Math.sin(tm * Math.PI) * 0.42;
          const slope = Math.atan2(Math.sin(t1 * Math.PI) * 0.42 - Math.sin(t0 * Math.PI) * 0.42, 4.6 / 5);
          const deck = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.14, 3.0), plankMat);
          deck.position.set(xm, ym + 0.04, bs.z); deck.rotation.z = slope; deck.castShadow = true; worldGroup.add(deck);
          [-1.4, 1.4].forEach(rz => {
            const r = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.09, 0.1), railWood);
            r.position.set(xm, ym + 0.82, bs.z + rz); r.rotation.z = slope; worldGroup.add(r);
          });
        }
        SC.addCurvedPath(worldGroup, bs.lead, 2.3, 'stone', 0.025);
        addStoneLantern(bs.x + 2.5, bs.z + 2.1, 0);
      });

      // KYOTO GACHAPON & DRINK VENDING PLAZA (X=21.2..23.2, Z=-15.8)
      const kvm = new THREE.Group(); kvm.position.set(21.2, 0, -15.8);
      const kvmBody = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.0, 0.78), LS.makeToonMat(0xd62828)); kvmBody.position.y = 1.0; kvmBody.castShadow = true; kvm.add(kvmBody);
      const kvmGlow = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.95, 0.08), new THREE.MeshBasicMaterial({ color: 0xffe082 })); kvmGlow.position.set(0, 1.32, 0.38); kvm.add(kvmGlow);
      worldGroup.add(kvm); addCollider(21.2, -15.8, 0.7, 0.6);
      W.zones.push({ id: 'kyoto_gachapon', label: 'Spin Kyoto Capsule Toy Machine (15c) 🎁', pos: new THREE.Vector3(21.2, 0, -14.2), radius: 2.8 });

      const kdrink = new THREE.Group(); kdrink.position.set(23.2, 0, -15.8);
      const kdBody = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.95, 0.74), LS.makeToonMat(0x2d6a4f)); kdBody.position.y = 0.98; kdBody.castShadow = true; kdrink.add(kdBody);
      const kdWin = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.86, 0.08), new THREE.MeshBasicMaterial({ color: 0xa7f3d0 })); kdWin.position.set(0, 1.3, 0.36); kdrink.add(kdWin);
      worldGroup.add(kdrink); addCollider(23.2, -15.8, 0.68, 0.58);
      W.zones.push({ id: 'drink_vending', label: 'Kyoto Drink & Snack Vending Machine 🧃', pos: new THREE.Vector3(23.2, 0, -14.2), radius: 2.7 });

      // NATURAL KYOTO BLOSSOM POCKET PARK (soft rounded clearing, picnic blanket, benches, slide, swing, hopscotch)
      const kPark = new THREE.Mesh(new THREE.CylinderGeometry(9.2, 9.5, 0.04, 24), LS.makeToonMat(0x7cb664));
      kPark.position.set(29.5, 0.02, -1.0); kPark.receiveShadow = true; worldGroup.add(kPark);
      SC.addPicnicBlanket(worldGroup, 33.8, 3.6, 0.35);
      SC.addBench(worldGroup, 24.5, -6.5, 0.3);

      const kpSign = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.72, 0.14), new THREE.MeshBasicMaterial({ map: LS.createSignTexture('🛝 KYOTO BLOSSOM PARK', { bg: '#fff4e0', border: '#c83e37', color: '#7f1d1d', font: 'bold 31px sans-serif' }) }));
      kpSign.position.set(29.5, 1.65, 5.8); worldGroup.add(kpSign);

      const slideG = new THREE.Group(); slideG.position.set(28.5, 0, -1.6);
      const slideRed = LS.makeToonMat(0xd63628), ladderWood = LS.makeToonMat(0xd99a4e);
      const plat = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.14, 1.1), slideRed); plat.position.set(0, 1.55, -0.85); plat.castShadow = true; slideG.add(plat);
      [-0.5, 0.5].forEach(lx => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.56, 8), ladderWood); p.position.set(lx, 0.78, -1.32); slideG.add(p); });
      const chute = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.1, 2.35), slideRed); chute.position.set(0, 0.84, 0.55); chute.rotation.x = 0.54; chute.castShadow = true; slideG.add(chute);
      worldGroup.add(slideG); addCollider(28.5, -1.6, 0.65, 1.45);
      W.zones.push({ id: 'park_slide', label: 'Ride the Kyoto Park Slide Together 🛝', pos: new THREE.Vector3(28.5, 0, 0.2), radius: 2.5 });

      const swingG = new THREE.Group(); swingG.position.set(33.2, 0, -4.5);
      [-0.85, 0.85].forEach(sz => {
        const lA = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.3, 8), railWood); lA.position.set(-0.5, 1.12, sz); lA.rotation.z = 0.22;
        const lB = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.3, 8), railWood); lB.position.set(0.5, 1.12, sz); lB.rotation.z = -0.22;
        swingG.add(lA, lB);
      });
      const tBar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.1, 8), railWood); tBar.rotation.x = Math.PI / 2; tBar.position.y = 2.15; swingG.add(tBar);
      const pivot = new THREE.Group(); pivot.position.y = 2.12;
      [-0.24, 0.24].forEach(rz => { const rp = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.55, 6), LS.makeToonMat(0xd6c7b2)); rp.position.set(0, -0.78, rz); pivot.add(rp); });
      const sSeat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.07, 0.62), LS.makeToonMat(0xf59e0b)); sSeat.position.y = -1.56; pivot.add(sSeat);
      swingG.add(pivot); W.swingPivot = pivot;
      worldGroup.add(swingG); addCollider(33.2, -4.5, 0.75, 1.15);
      W.zones.push({ id: 'park_swing', label: 'Swing Together in Kyoto Park 🎠', pos: new THREE.Vector3(32.0, 0, -3.2), radius: 2.5 });

      const hopC = document.createElement('canvas'); hopC.width = 256; hopC.height = 512;
      const hctx = hopC.getContext('2d'); hctx.strokeStyle = '#fff9eb'; hctx.lineWidth = 8; hctx.fillStyle = '#fff9eb'; hctx.font = 'bold 42px sans-serif'; hctx.textAlign = 'center';
      [[64, 410, '1'], [192, 410, '2'], [128, 310, '3'], [64, 210, '4'], [192, 210, '5'], [128, 110, '6']].forEach(c => { hctx.strokeRect(c[0] - 46, c[1] - 46, 92, 92); hctx.fillText(c[2], c[0], c[1] + 15); });
      const hopMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 3.0), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(hopC), transparent: true }));
      hopMesh.rotation.x = -Math.PI / 2; hopMesh.position.copy(W.hopscotchPos); worldGroup.add(hopMesh);
      W.zones.push({ id: 'park_hopscotch', label: 'Play Kyoto Hopscotch (+20c) 🎯', pos: new THREE.Vector3(25.2, 0, 1.2), radius: 2.4 });

      // AIRY EAST FOOTHILL MACHIYA HAMLET (3 widely spaced hillside cottages with open meadows between them!)
      buildMachiya(46.0, -24.5, -Math.PI / 2 - 0.32, { wallHex: '#f4ead7', roofHex: '#3d4550', width: 6.2, depth: 5.4, height: 4.5 });
      buildMachiya(48.5, -5.5, -Math.PI / 2 + 0.18, { wallHex: '#efe2ce', roofHex: '#4f3a32', width: 6.4, depth: 5.5, height: 4.6 });
      buildMachiya(34.5, 22.5, Math.PI + 0.28, { wallHex: '#f2e6d0', roofHex: '#4a4352', width: 6.2, depth: 5.2, height: 4.5 });

      // WIDE OPEN TRANQUIL KYOTO MEADOWS (breathing space with wildflowers, tall grass & mossy boulders!)
      const kyotoPal = [0xff8fab, 0xf29f3d, 0xffffff, 0x95d5b2];
      SC.addWildflowerMeadow(worldGroup, -22, -6, 10, 9, kyotoPal);
      SC.addPicnicBlanket(worldGroup, -23.5, -8.5, 0.45);
      SC.addWildflowerMeadow(worldGroup, -53, 18, 10, 10, kyotoPal);
      SC.addWildflowerMeadow(worldGroup, 34, 15, 10, 9, kyotoPal);
      SC.addWildflowerMeadow(worldGroup, 26, -34, 10, 9, kyotoPal);
      SC.addWildflowerMeadow(worldGroup, -12, 16, 8, 7, kyotoPal);
      SC.addWildflowerMeadow(worldGroup, 11.8, 15.5, 5.5, 6, kyotoPal);

      SC.addBike(worldGroup, -5.8, 8.2, 0.38, 0xd62828);
      SC.addBike(worldGroup, 19.6, -8.8, -0.75, 0x2d6a4f);
      [
        [-18.5, 11.5, 0xff8fab], [-26.5, 21.0, 0x90e0ef], [21.5, -3.5, 0xff8fab], [22.0, 9.5, 0xc084fc],
        [37.0, -18.5, 0xffd166], [39.5, 4.5, 0x90e0ef], [-42.5, -15.5, 0xff8fab], [8.5, -33.0, 0xff8fab]
      ].forEach(sh => SC.addShrub(worldGroup, sh[0], sh[1], 0.95 + (Math.abs(sh[0]) % 3) * 0.1, sh[2]));
      [
        [9.5, 13.5, 1.1], [10.5, -35.5, 1.2], [-14.0, 16.5, 1.1], [-51.0, 15.0, 1.3], [36.0, 11.5, 1.2], [29.0, -33.0, 1.25]
      ].forEach(b => SC.addBoulder(worldGroup, b[0], b[1], b[2], true));

      // Organic asymmetrical Kyoto tree groves (maple, weeping willow, sakura, cedar — never lined up!)
      [
        [-7.5, -19.2, 'maple', 1.22], [7.8, -13.8, 'sakura', 1.12], [-8.4, -5.2, 'sakura', 1.08],
        [8.6, 4.5, 'maple', 1.22], [-13.8, -36.8, 'maple', 1.25], [-32.5, -18.0, 'sakura', 1.28],
        [-32.0, -37.2, 'maple', 1.25], [8.5, -30.5, 'maple', 1.2],
        // Weeping willows bending naturally over the meandering East Stream!
        [22.0, -19.5, 'willow', 1.22], [13.5, -4.5, 'willow', 1.18], [21.2, 11.0, 'willow', 1.22],
        // Open meadow accent trees & hillside groves
        [25.0, -33.5, 'maple', 1.3], [38.5, -15.0, 'sakura', 1.22], [38.0, 9.5, 'maple', 1.22],
        [-24.5, 13.5, 'maple', 1.28], [-41.0, 1.5, 'sakura', 1.22], [-46.5, 25.5, 'maple', 1.28],
        [-13.5, 14.5, 'sakura', 1.25], [11.5, 17.5, 'maple', 1.22],
        // Lush asymmetric outer valley forest
        [-62, -28, 'cedar', 1.48, 0, true], [-62, -9, 'maple', 1.38, 0, true], [-60, 13, 'cedar', 1.42, 0, true],
        [-54, 31, 'maple', 1.36, 0, true], [-29, 35, 'sakura', 1.32, 0, true], [23, 35, 'maple', 1.32, 0, true],
        [54, -34, 'cedar', 1.48, 0, true], [55, -16, 'maple', 1.36, 0, true], [55, 3, 'sakura', 1.36, 0, true], [52, 23, 'cedar', 1.42, 0, true],
        [29, -47, 'cedar', 1.42, 0, true], [13, -49, 'maple', 1.35, 0, true]
      ].forEach(t => buildKyotoTree(t[0], t[1], t[2], t[3], t[4] || 0, t[5]));
    });

    // 7. Kyoto Shinkansen Station (South: X=0, Z=36.5)
    safeRun('kyoto_shinkansen', () => {
      const g = new THREE.Group(); g.position.set(0, 0, 36.5);
      const plat = new THREE.Mesh(new THREE.BoxGeometry(14.5, 0.55, 4.2), LS.makeToonMat(0xd6d1c4)); plat.position.y = 0.27; plat.receiveShadow = true; g.add(plat);
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(14.0, 0.04, 0.28), LS.makeToonMat(0xfacc15)); stripe.position.set(0, 0.56, 1.6); g.add(stripe);
      const timber = LS.makeToonMat(0x523623);
      [-6.0, -3.2, 3.2, 6.0].forEach(px => { const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 3.8, 8), timber); col.position.set(px, 2.2, 0); col.castShadow = true; g.add(col); });
      const roof = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.34, 4.8), LS.makeToonMat(0xffffff, { map: LS.createRoofTileTexture('#2f3540') })); roof.position.y = 4.15; roof.castShadow = true; g.add(roof);
      const sign = new THREE.Mesh(new THREE.BoxGeometry(6.8, 1.05, 0.2), new THREE.MeshBasicMaterial({ map: LS.createSignTexture('🚅 KYOTO STATION → TOKYO', { bg: '#3a1f1b', border: '#f59e0b', color: '#fff8eb', font: 'bold 30px sans-serif', width: 640 }) }));
      sign.position.set(0, 3.45, -2.15); g.add(sign);
      const track = new THREE.Mesh(new THREE.BoxGeometry(130, 0.4, 2.8), LS.makeToonMat(0x6c757d)); track.position.set(0, 0.3, 3.6); g.add(track);
      const train = new THREE.Group(); train.position.set(0, 1.25, 3.6);
      train.add(new THREE.Mesh(new THREE.BoxGeometry(14, 1.55, 1.75), LS.makeToonMat(0xf8fafc)));
      const tStripe = new THREE.Mesh(new THREE.BoxGeometry(14.05, 0.28, 1.78), LS.makeToonMat(0x1d4ed8)); tStripe.position.y = -0.15; train.add(tStripe);
      const tWin = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.38, 1.79), LS.makeEmissiveMat(0x90e0ef, 0x48cae4, 0.35)); tWin.position.y = 0.26; train.add(tWin);
      [-7.8, 7.8].forEach(nx => { const nose = new THREE.Mesh(new THREE.ConeGeometry(0.95, 2.5, 12), LS.makeToonMat(0xf8fafc)); nose.rotation.z = nx > 0 ? -Math.PI / 2 : Math.PI / 2; nose.scale.set(0.85, 1.0, 0.95); nose.position.set(nx, -0.05, 0); train.add(nose); });
      g.add(train); W.shinkansenTrain = train;
      worldGroup.add(g); addCollider(0, 37.3, 7.6, 2.2);
      W.zones.push({ id: 'shinkansen_station', label: 'Board Shinkansen back to Tokyo 🚅', pos: new THREE.Vector3(0, 0, 33.0), radius: 4.0 });

      const ballMesh = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), LS.makeToonMat(0xffbe0b)); ballMesh.position.set(-3.0, 0.14, -18.0); ballMesh.visible = false; worldGroup.add(ballMesh); W.mochiBall = ballMesh;
    });

    // 8. 5 Hidden Kyoto Kitsune (chosen from 20 natural hiding spots — rotates every 2-hour reset!)
    safeRun('hidden_kitsune', () => {
      const foxPool = [
        { pos: new THREE.Vector3(-35.2, 0, -23.8), hint: 'near the vermilion Senbon Torii tunnel' },
        { pos: new THREE.Vector3(-25.5, 0, -45.2), hint: 'deep inside the Arashiyama Bamboo Grove' },
        { pos: new THREE.Vector3(-11.8, 0, -33.2), hint: 'behind Sakura Sushi by the lake' },
        { pos: new THREE.Vector3(6.6, 0, -10.5), hint: 'near the Uji Matcha Tea House garden' },
        { pos: new THREE.Vector3(-46.5, 0.75, -23.5), hint: 'beside the giant sacred cedar at Sakurako Shrine' },
        { pos: new THREE.Vector3(29.5, 0, -6.5), hint: 'inside the Kyoto Blossom Pocket Park' },
        { pos: new THREE.Vector3(-31.5, 0, 11.5), hint: 'near the Southwest Maple Gazebo' },
        { pos: new THREE.Vector3(22.5, 0, -21.0), hint: 'near the Kyoto Gachapon & Drink machines' },
        { pos: new THREE.Vector3(-48.5, 0, -46.5), hint: 'on the far west Arashiyama bamboo rest trail' },
        { pos: new THREE.Vector3(-46.5, 0.75, -32.0), hint: 'near the mossy Jizo statue at the shrine' },
        { pos: new THREE.Vector3(34.5, 0, 3.0), hint: 'by the picnic blanket in Kyoto Pocket Park' },
        { pos: new THREE.Vector3(-14.5, 0, -15.5), hint: 'behind Laila & Salma\'s Kyoto Ryokan' },
        { pos: new THREE.Vector3(19.5, 0, -28.0), hint: 'across the north canal bridge' },
        { pos: new THREE.Vector3(-36.5, 0, 24.5), hint: 'beside the Raked Zen Rock Garden' },
        { pos: new THREE.Vector3(-42.5, 0, 8.5), hint: 'outside the Kyoto Pottery Studio' },
        { pos: new THREE.Vector3(-25.0, 0, 20.5), hint: 'near the Folding Fan Atelier' },
        { pos: new THREE.Vector3(41.5, 0, -20.0), hint: 'in the East Foothill Machiya Hamlet' },
        { pos: new THREE.Vector3(42.5, 0, 4.5), hint: 'along the East Hillside stone lane' },
        { pos: new THREE.Vector3(27.5, 0, 18.5), hint: 'near the southeast canal weeping willows' },
        { pos: new THREE.Vector3(8.5, 0, 24.5), hint: 'near the Kyoto Shinkansen Station trees' }
      ];

      const foxMeta = [
        { id: 'kitsune_inari', name: 'Inari (Torii Shrine Fox)', color: 0xf77f00, tailTip: 0xffffff },
        { id: 'kitsune_take', name: 'Take (Bamboo Grove Fox)', color: 0xfff8f0, tailTip: 0xe63946 },
        { id: 'kitsune_kawa', name: 'Kawa (Lakeside Fox)', color: 0xe76f51, tailTip: 0xfff3d6 },
        { id: 'kitsune_matcha', name: 'Matcha (Tea Garden Fox)', color: 0xffb703, tailTip: 0xffffff },
        { id: 'kitsune_sakura', name: 'Sakura (Blossom Kitsune)', color: 0xfffcf7, tailTip: 0xff8fab }
      ];

      const chosenSpots = LS.pickRoundSpots(foxPool, LS.state.kitsuneRound || 0, 5);
      foxMeta.forEach((fd, idx) => {
        const spot = chosenSpots[idx];
        const alreadyFound = LS.state.foundKitsune.includes(fd.id);
        const g = new THREE.Group(); g.position.copy(spot.pos);
        const fur = LS.makeToonMat(fd.color), tip = LS.makeToonMat(fd.tailTip), bibMat = LS.makeToonMat(0xd62828);
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), fur); body.scale.set(1.25, 0.85, 0.92); body.position.y = 0.26; body.castShadow = true; g.add(body);
        const bib = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.2, 8), bibMat); bib.position.set(0.16, 0.32, 0); bib.rotation.z = -0.3; g.add(bib);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 8), fur); head.position.set(0.24, 0.44, 0); g.add(head);
        const snout = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 6), tip); snout.rotation.z = -Math.PI / 2; snout.position.set(0.42, 0.41, 0); g.add(snout);
        [-0.09, 0.09].forEach(ez => { const ear = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 5), fur); ear.position.set(0.22, 0.65, ez); g.add(ear); });
        const tail = new THREE.Group(); tail.position.set(-0.28, 0.34, 0);
        const tMain = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), fur); tMain.scale.set(1.6, 0.85, 0.85); tMain.rotation.z = -0.6; tail.add(tMain);
        const tTip = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), tip); tTip.position.set(-0.18, 0.16, 0); tail.add(tTip);
        g.add(tail);

        const mc = document.createElement('canvas'); mc.width = 128; mc.height = 128;
        const mctx = mc.getContext('2d'); mctx.fillStyle = 'rgba(255, 248, 225, 0.96)';
        mctx.beginPath(); mctx.arc(64, 64, 52, 0, Math.PI * 2); mctx.fill();
        mctx.strokeStyle = '#d62828'; mctx.lineWidth = 8; mctx.stroke();
        mctx.font = 'bold 54px sans-serif'; mctx.textAlign = 'center'; mctx.fillText('🦊', 64, 82);
        const marker = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(mc), transparent: true }));
        marker.scale.set(0.78, 0.78, 1); marker.position.set(0.1, 1.15, 0); marker.visible = !alreadyFound; g.add(marker);

        worldGroup.add(g);
        W.hiddenAnimals.push({ id: fd.id, kind: 'kitsune', name: fd.name, hint: spot.hint, mesh: g, marker, tail, found: alreadyFound });
        if (!alreadyFound) W.zones.push({ id: 'animal:' + fd.id, label: 'Befriend ' + fd.name + ' (+35c)', pos: spot.pos.clone(), radius: 2.5 });
      });
    });

    // 9. Kyoto Ambient Leaves & NPCs
    safeRun('petals_and_npcs', () => {
      const pCount = 145;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        pPos[i * 3] = -62 + Math.random() * 116;
        pPos[i * 3 + 1] = 1 + Math.random() * 12;
        pPos[i * 3 + 2] = -56 + Math.random() * 94;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      W.petals = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xffb38a, size: 0.2, transparent: true, opacity: 0.9 }));
      worldGroup.add(W.petals);

      LS.spawnWorldNPCs(worldGroup, [
        { name: 'Chef Hiroshi', pos: new THREE.Vector3(-8.2, 0, -30.5), baseRot: 0, waveOnNear: true,
          line: 'Irasshaimase! Fresh lakeside tamago & salmon sushi ready at Sakura Sushi!',
          char: { scale: 1.0, hairColor: 0x262626, topColor: 0xffffff, bottomColor: 0x1e293b, pants: true, headband: true,
            faceOpts: { mustache: true, eyeColor: '#362014', eyeHighlight: '#8e5a32', blush: 'rgba(232, 128, 118, 0.28)' } } },
        { name: 'Hana', pos: new THREE.Vector3(-6.2, 0, 2.0), baseRot: Math.PI / 2, waveOnNear: true,
          line: 'Follow the stone path west to the Zen Rock Garden & Craft Village, or step inside your 3D Ryokan!',
          char: { scale: 0.92, hairColor: 0x2c1b18, topColor: 0xd62828, bottomColor: 0x8f1d21, hairBun: true, hatType: 'kanzashi', hatColor: 0xffb3c6,
            faceOpts: { eyeColor: '#692434', eyeHighlight: '#e07a94', blush: 'rgba(250, 128, 152, 0.50)' } } },
        { name: 'Auntie Midori', pos: new THREE.Vector3(6.2, 0, -5.0), baseRot: -Math.PI / 2, waveOnNear: true,
          line: 'Ohayo! Cross any of our 3 willow canal bridges to reach Kyoto Blossom Park & the Foothill Hamlet!',
          char: { scale: 0.94, hairColor: 0x4a3b32, topColor: 0x74c69d, bottomColor: 0x2d6a4f, hairBun: true,
            faceOpts: { glasses: true, eyeColor: '#255c42', eyeHighlight: '#6cc494', blush: 'rgba(244, 134, 146, 0.42)' } } },
        { name: 'Sensei Kenji', pos: new THREE.Vector3(6.2, 0, -21.0), baseRot: -Math.PI / 2,
          line: 'Welcome to Kyoto Temple Academy! Test your Kyoto knowledge for XP & coins!',
          char: { scale: 0.98, hairColor: 0x9ca3af, topColor: 0x3b6ea5, bottomColor: 0x1e293b, pants: true,
            faceOpts: { elder: true, glasses: true, mustache: true, eyeColor: '#3d332a', eyeHighlight: '#8a7660', blush: 'rgba(224, 132, 122, 0.24)' } } },
        { name: 'Miko Aiko', pos: new THREE.Vector3(-42.5, 0.75, -24.5), baseRot: Math.PI / 2, waveOnNear: true,
          line: 'Welcome to Sakurako Shrine! Draw a lucky Omikuji fortune or hang an Ema wish!',
          char: { scale: 0.92, hairColor: 0x1f191a, topColor: 0xffffff, bottomColor: 0xd62828, longHair: true,
            faceOpts: { eyeColor: '#3b245c', eyeHighlight: '#a67de0', blush: 'rgba(248, 128, 152, 0.48)' } } },
        { name: 'Ren', pos: new THREE.Vector3(-3.4, 0, -6.0), patrol: { axis: 'z', center: -6.0, range: 6.5, speed: 0.85 },
          line: '5 kitsune hide across 20 natural Kyoto spots — and 2 hours after you find them all, they hide in brand-new places!',
          char: { scale: 0.88, hairColor: 0x382820, topColor: 0x2a9d8f, bottomColor: 0x264653, pants: true, backpackColor: 0xe9c46a,
            faceOpts: { eyeColor: '#1f5452', eyeHighlight: '#5ec2b6', blush: 'rgba(236, 132, 132, 0.30)' } } }
      ]);

      // AAA 16,000 wind-swept 3D instanced grass tufts across Kyoto open meadows (1 GPU draw call!)
      if (LS.isHD && LS.hdAssets && LS.hdAssets.addInstancedGrass) {
        const laneSp = SC.sampleSpline(KYOTO_LANE_PTS, 5);
        const streamSp = SC.sampleSpline(KYOTO_STREAM_PTS, 5);
        const trailsSp = [
          SC.sampleSpline(KYOTO_SW_TRAIL_PTS, 4),
          SC.sampleSpline(KYOTO_EAST_LOOP_PTS, 4),
          SC.sampleSpline(KYOTO_PARK_TRAIL_PTS, 4)
        ];
        const nearSp = (sp, x, z, r2) => {
          for (let i = 0; i < sp.length; i++) {
            const dx = x - sp[i][0], dz = z - sp[i][1];
            if (dx * dx + dz * dz < r2) return true;
          }
          return false;
        };
        LS.hdAssets.addInstancedGrass(worldGroup, { minX: -58, maxX: 52, minZ: -50, maxZ: 32 }, (x, z) => {
          if (z > 31.5) return false;
          if (x < -12.5 && x > -32.8 && z < -15.2 && z > -39.8) return false; // Koi Lake
          if (x < -2.2 && x > -14.8 && Math.abs(z + 27.5) < 3.2) return false; // Stone path to bridge
          if (x < -40.2 && z < -17.2 && z > -37.8) return false; // Sakurako Shrine Courtyard
          const zx = (x + 35.5) / 10.6, zz = (z - 18.0) / 6.9;
          if (zx * zx + zz * zz < 1.0) return false; // Oval Zen Rock Garden
          if (Math.hypot(x - 25.2, z - 1.2) < 2.4) return false; // Hopscotch
          if (nearSp(laneSp, x, z, 3.8 * 3.8)) return false;
          if (nearSp(streamSp, x, z, 3.3 * 3.3)) return false;
          for (let t = 0; t < trailsSp.length; t++) {
            if (nearSp(trailsSp[t], x, z, 1.9 * 1.9)) return false;
          }
          for (let c = 0; c < W.colliders.length; c++) {
            const b = W.colliders[c];
            if (x > b.minX - 0.65 && x < b.maxX + 0.65 && z > b.minZ - 0.65 && z < b.maxZ + 0.65) return false;
          }
          return true;
        }, 'kyoto');
      }
    });

    W.getMochiIdleAnchor = function () { return { pos: new THREE.Vector3(-3.6, 0, -18.5), rotY: Math.PI / 3 }; };

    W.getZoneLabel = function (px, pz) {
      if (px > 38) return 'East Foothill Hamlet';
      if (px > 18 && pz > -10 && pz < 12) return 'Kyoto Blossom Park';
      if (px > 18 && pz <= -10) return 'East Canal Plaza';
      if (px < -24 && pz > 12) return 'Zen Rock Garden';
      if (px < -18 && pz > -2) return 'Momiji Craft Village';
      if (pz > 26) return 'Kyoto Shinkansen';
      if (pz < -39 && px < -13) return 'Arashiyama Bamboo';
      if (px < -30.5) return 'Sakurako Shrine';
      if (px < -13.5 && Math.abs(pz + 27.5) < 4) return 'Arched Koi Bridge';
      if (px < -4 && Math.abs(pz + 29.0) < 4) return 'Sakura Sushi';
      if (px > 4 && Math.abs(pz + 21.0) < 5) return 'Temple Academy';
      if (px > 4 && Math.abs(pz + 5.0) < 5) return 'Uji Tea House';
      if (px < -4 && Math.abs(pz + 12.5) < 5) return 'Kyoto Ryokan';
      if (px < -4 && Math.abs(pz - 2.0) < 5) return 'Kimono Boutique';
      return 'Kyoto Old Street';
    };

    W.update = function (dt, elapsed) {
      W.norenPanels.forEach(n => { n.mesh.rotation.x = Math.sin(elapsed * 2.2 + n.phase) * 0.08; });
      W.hiddenAnimals.forEach((fox, idx) => {
        if (fox.tail) fox.tail.rotation.y = Math.sin(elapsed * 4.0 + idx) * 0.35;
        if (fox.marker && !fox.found) fox.marker.position.y = 1.15 + Math.sin(elapsed * 3.0 + idx) * 0.12;
      });
      if (W.swingPivot) {
        if (LS.runtime.parkActivity && LS.runtime.parkActivity.type === 'swing') W.swingPivot.rotation.x = Math.sin(elapsed * 4.5) * 0.58;
        else W.swingPivot.rotation.x *= 0.9;
      }
      const feeding = LS.runtime.koiFeedTimer > 0;
      if (feeding) LS.runtime.koiFeedTimer -= dt;
      W.koiList.forEach(k => {
        const ang = elapsed * (feeding ? k.speed * 1.9 : k.speed) + k.phase;
        const nx = feeding ? (-16.6 + Math.cos(ang) * 1.6) : (k.cx + Math.cos(ang) * k.rx);
        const nz = feeding ? (-22.0 + Math.sin(ang * 1.3) * 1.4) : (k.cz + Math.sin(ang * 1.5) * k.rz);
        const dx = nx - k.mesh.position.x, dz = nz - k.mesh.position.z;
        k.mesh.position.x += dx * Math.min(1, dt * 3.2); k.mesh.position.z += dz * Math.min(1, dt * 3.2);
        k.mesh.rotation.y = Math.atan2(dx, dz);
        if (k.tail) k.tail.rotation.y = Math.sin(elapsed * (feeding ? 11.5 : 7.2) + k.phase) * 0.42;
      });
      let mamaDuck = null;
      W.duckList.forEach((d, idx) => {
        if (d.isMama) mamaDuck = d;
        const ang = elapsed * d.speed + d.phase;
        const nx = d.cx + Math.cos(ang) * d.r, nz = d.cz + Math.sin(ang) * d.r * 0.72;
        const dx = nx - d.mesh.position.x, dz = nz - d.mesh.position.z;
        d.mesh.position.x = nx; d.mesh.position.z = nz;
        d.mesh.position.y = -0.40 + Math.sin(elapsed * 3.0 + idx) * 0.025;
        d.mesh.rotation.y = Math.atan2(dx, dz);
        d.mesh.rotation.z = Math.sin(elapsed * 2.6 + idx) * 0.05;
        if (d.wake) {
          const wp = (elapsed * 0.65 + idx * 0.35) % 1;
          d.wake.scale.setScalar(0.85 + wp * 1.35);
          d.wake.material.opacity = (1 - wp) * 0.48;
        }
      });
      if (mamaDuck && W.ducklings) {
        W.ducklings.forEach(dl => {
          const ang = elapsed * mamaDuck.speed + mamaDuck.phase - dl.lag;
          const nx = mamaDuck.cx + Math.cos(ang) * mamaDuck.r, nz = mamaDuck.cz + Math.sin(ang) * mamaDuck.r * 0.72;
          const dx = nx - dl.mesh.position.x, dz = nz - dl.mesh.position.z;
          dl.mesh.position.x = nx; dl.mesh.position.z = nz;
          dl.mesh.position.y = -0.40 + Math.sin(elapsed * 4.4 + dl.phase) * 0.02;
          dl.mesh.rotation.y = Math.atan2(dx, dz);
          if (dl.wake) {
            const wp = (elapsed * 0.85 + dl.phase) % 1;
            dl.wake.scale.setScalar(0.8 + wp * 1.15);
            dl.wake.material.opacity = (1 - wp) * 0.38;
          }
        });
      }
      if (W.waterfallRings) {
        W.waterfallRings.forEach((wr, i) => {
          const p = (elapsed * 1.1 + i * 0.33) % 1;
          wr.scale.setScalar(0.65 + p * 3.1);
          wr.material.opacity = (1 - p) * 0.62;
        });
      }
      W.rippleRings.forEach((ring, i) => {
        if (feeding) { const p = (elapsed * 1.8 + i * 0.4) % 1; ring.scale.setScalar(0.7 + p * 2.8); ring.material.opacity = (1 - p) * 0.75; }
        else { ring.material.opacity = 0; }
      });
      if (W.rowboat) { W.rowboat.position.y = -0.40 + Math.sin(elapsed * 1.8) * 0.03; W.rowboat.rotation.z = Math.sin(elapsed * 1.3) * 0.035; }
      W.bambooStalks.forEach(b => { b.mesh.rotation.z = Math.sin(elapsed * 1.1 + b.phase) * 0.035; });
      if (W.shinkansenTrain) W.shinkansenTrain.position.x = Math.sin(elapsed * 0.24) * 3.8;
      if (W.petals) {
        const pos = W.petals.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          let y = pos.getY(i) - dt * 0.58;
          let x = pos.getX(i) + Math.sin(elapsed + i) * dt * 0.42;
          if (y < 0.2) { y = 12.0; x = -62 + Math.random() * 116; }
          pos.setXY(i, x, y);
        }
        pos.needsUpdate = true;
      }
    };

    function strokeMapSpline(ctx, pts, toMapX, toMapY, color, width) {
      const sp = SC.sampleSpline(pts, 6);
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      sp.forEach((p, idx) => {
        const mx = toMapX(p[0]), my = toMapY(p[1]);
        if (idx === 0) ctx.moveTo(mx, my); else ctx.lineTo(mx, my);
      });
      ctx.stroke();
    }

    W.drawMiniMap = function (ctx, cw, ch, toMapX, toMapY) {
      ctx.fillStyle = '#629152'; ctx.fillRect(0, 0, cw, ch);
      // Soft open meadow clearings
      ctx.fillStyle = '#75a661';
      [[-22, -6, 13], [-52, 16, 14], [35, 16, 13], [26, -34, 13]].forEach(m => {
        ctx.beginPath(); ctx.arc(toMapX(m[0]), toMapY(m[1]), m[2], 0, Math.PI * 2); ctx.fill();
      });
      // Bamboo Woods
      ctx.fillStyle = '#366f40';
      ctx.beginPath(); ctx.ellipse(toMapX(-37), toMapY(-48), 28, 11, -0.08, 0, Math.PI * 2); ctx.fill();
      // Koi Lake & Meandering East Yousuiro Stream
      ctx.fillStyle = '#2b7a8c';
      ctx.beginPath(); ctx.ellipse(toMapX(-22.5), toMapY(-27.5), 11.5, 14, 0, 0, Math.PI * 2); ctx.fill();
      strokeMapSpline(ctx, KYOTO_STREAM_PTS, toMapX, toMapY, '#348ea3', 4.5);
      // Winding trails & curving Kyoto village lane
      [KYOTO_SW_TRAIL_PTS, KYOTO_EAST_LOOP_PTS, KYOTO_PARK_TRAIL_PTS].forEach(t => {
        strokeMapSpline(ctx, t, toMapX, toMapY, '#9e927d', 2.8);
      });
      strokeMapSpline(ctx, KYOTO_LANE_PTS, toMapX, toMapY, '#877e6f', 6.0);
      // Organic Oval Zen Rock Garden & East Blossom Park
      ctx.fillStyle = '#d4cec0';
      ctx.beginPath(); ctx.ellipse(toMapX(-35.5), toMapY(18.0), 10, 6.2, 0.22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#52b788'; ctx.beginPath(); ctx.arc(toMapX(29.5), toMapY(-1.0), 10, 0, Math.PI * 2); ctx.fill();
      // Bridge, Shrine & Station
      ctx.fillStyle = '#8b6343'; ctx.fillRect(toMapX(-43), toMapY(-29.2), toMapX(-3.1) - toMapX(-43), toMapY(-25.8) - toMapY(-29.2));
      ctx.fillStyle = '#c83e37'; ctx.fillRect(toMapX(-54.5), toMapY(-34.5), toMapX(-44.5) - toMapX(-54.5), toMapY(-20.5) - toMapY(-34.5));
      ctx.fillStyle = '#1d4ed8'; ctx.fillRect(toMapX(-7.5), toMapY(34.5), toMapX(7.5) - toMapX(-7.5), toMapY(39.5) - toMapY(34.5));

      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 6.5px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('🎋', toMapX(-35), toMapY(-46));
      ctx.fillText('⛩️', toMapX(-49.5), toMapY(-26));
      ctx.fillText('🪨', toMapX(-35.5), toMapY(19));
      ctx.fillText('🛝', toMapX(29.5), toMapY(0));
      ctx.fillText('🚅 TOKYO', toMapX(0), toMapY(38.0));
    };

    return W;
  }

  LS.registerWorld('kyoto', { build: buildKyotoWorld });
})(window.LailaSalma);
