window.LailaSalma = window.LailaSalma || {};

(function (LS) {
  function safeRun(name, fn) {
    try { fn(); } catch (e) { console.error('[Tokyo:' + name + ']', e); }
  }

  function buildTokyoWorld(worldGroup) {
    const SC = LS.scenery;
    const W = {
      id: 'tokyo',
      colliders: [],
      zones: [],
      norenPanels: [],
      hiddenAnimals: [],
      petals: null,
      skyMesh: null,
      mochiBall: null,
      mochiStartPos: new THREE.Vector3(-3.1, 0, -5.2),
      swingPivot: null,
      shinkansenTrain: null,
      radarDish: null,
      skyPlane: null,
      slideStartPos: new THREE.Vector3(24.0, 1.55, -10.8),
      slideEndPos: new THREE.Vector3(24.0, 0.12, -8.0),
      swingSeatPos: new THREE.Vector3(27.8, 0.55, -12.6),
      hopscotchPos: new THREE.Vector3(21.4, 0.065, -9.2),
      ramenTablePos: new THREE.Vector3(7.4, 0, -5.5),
      ramenStoolPos: new THREE.Vector3(6.2, 0, -5.15),
      salmaStoolPos: new THREE.Vector3(6.2, 0, -5.92)
    };

    function addCollider(x, z, hw, hd) {
      W.colliders.push({ minX: x - hw, maxX: x + hw, minZ: z - hd, maxZ: z + hd });
    }

    // Smooth walkable arch over the meandering West Sakura Creek footbridge (X=-41..-47, Z=3.0)
    W.getGroundHeight = function (x, z) {
      if (x <= -41.0 && x >= -47.0 && Math.abs(z - 3.0) <= 2.1) {
        const t = Math.max(0, Math.min(1, (-41.0 - x) / 6.0));
        return Math.sin(t * Math.PI) * 0.55;
      }
      return 0;
    };

    function buildHouse(x, z, rotY, wallHex, roofHex, opts) {
      const cfg = opts || {};
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.y = rotY;

      const oneStory = cfg.stories === 1;
      const bw = cfg.width || (oneStory ? 6.2 : 7.2);
      const bd = cfg.depth || (oneStory ? 5.4 : 6.2);
      const bh = oneStory ? 3.5 : 5.4;

      const glbKey = oneStory ? 'tokyo_house_1f' : 'tokyo_house_2f';
      if (LS.isHD && LS.hdAssets && LS.hdAssets.has(glbKey)) {
        const model = LS.hdAssets.clone(glbKey, { wallTint: wallHex, roofTint: roofHex });
        g.add(model);
        if (cfg.clubhouseSign) {
          const sign = new THREE.Mesh(
            new THREE.BoxGeometry(4.0, 0.9, 0.18),
            new THREE.MeshBasicMaterial({
              map: LS.createSignTexture("🏡 LAILA & SALMA'S ROOM", {
                bg: '#fff0f6', border: '#d95d88', color: '#6b2144', font: 'bold 30px sans-serif'
              })
            })
          );
          sign.position.set(-1.3, 2.85, 3.22);
          g.add(sign);
        }
        worldGroup.add(g);
        const colHalf = Math.max(bw, bd) * 0.5 + 0.4;
        addCollider(x, z, colHalf, colHalf);
        return;
      }

      const wallMat = LS.makeToonMat(0xffffff, { map: LS.createPlasterTexture(wallHex) });
      const roofMat = LS.makeToonMat(0xffffff, { map: LS.createRoofTileTexture(roofHex) });
      const woodMat = LS.makeToonMat(cfg.doorColor || 0x7c5333);
      const winMat = LS.makeEmissiveMat(0x8bc3e8, 0xffe4a0, 0.28);

      const body = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), wallMat);
      body.position.y = bh / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      g.add(body);

      const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(bw, bd) * 0.82, oneStory ? 1.9 : 2.3, 4), roofMat);
      roof.position.y = bh + (oneStory ? 0.92 : 1.15);
      roof.rotation.y = Math.PI / 4;
      roof.scale.set(1.1, 1, 0.96);
      roof.castShadow = true;
      g.add(roof);

      const door = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.2, 0.16), woodMat);
      door.position.set(-1.3, 1.1, bd / 2 + 0.04);
      g.add(door);

      if (cfg.clubhouseSign) {
        const sign = new THREE.Mesh(
          new THREE.BoxGeometry(4.0, 0.9, 0.18),
          new THREE.MeshBasicMaterial({
            map: LS.createSignTexture("🏡 LAILA & SALMA'S ROOM", {
              bg: '#fff0f6', border: '#d95d88', color: '#6b2144', font: 'bold 30px sans-serif'
            })
          })
        );
        sign.position.set(-1.3, 2.85, bd / 2 + 0.14);
        g.add(sign);
      }

      const win1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.15, 0.14), winMat);
      win1.position.set(1.3, 1.7, bd / 2 + 0.04);
      g.add(win1);
      const shutter = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.2, 0.16), woodMat);
      shutter.position.set(2.3, 1.7, bd / 2 + 0.06);
      g.add(shutter);

      if (!oneStory) {
        [-1.3, 1.3].forEach(wx => {
          const uWin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.15, 0.14), winMat);
          uWin.position.set(wx, 3.9, bd / 2 + 0.04);
          g.add(uWin);
        });
      }

      if (!cfg.noWall) {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.8, 1.05, 0.32), LS.makeToonMat(cfg.hedgeWall ? 0x458044 : 0xcac6bc));
        wall.position.set(0, 0.52, bd / 2 + 1.1);
        wall.castShadow = true;
        wall.receiveShadow = true;
        g.add(wall);
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.52, 0.3), LS.makeToonMat(0xd13838));
        post.position.set(-bw / 2 + 0.3, 1.15, bd / 2 + 1.2);
        g.add(post);
      }

      worldGroup.add(g);
      addCollider(x, z, Math.max(bw, bd) * 0.52 + 0.3, Math.max(bw, bd) * 0.52 + 0.3);
    }

    function buildMiniShop(x, z, rotY, title, wallHex, awningHex, roofHex) {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.y = rotY;

      const body = new THREE.Mesh(new THREE.BoxGeometry(4.8, 3.4, 4.4), LS.makeToonMat(0xffffff, { map: LS.createPlasterTexture(wallHex) }));
      body.position.y = 1.7; body.castShadow = true; body.receiveShadow = true; g.add(body);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(4.0, 1.4, 4), LS.makeToonMat(0xffffff, { map: LS.createRoofTileTexture(roofHex) }));
      roof.position.y = 4.1; roof.rotation.y = Math.PI / 4; roof.castShadow = true; g.add(roof);

      const awning = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.16, 1.25), LS.makeToonMat(awningHex));
      awning.position.set(0, 2.35, 2.55); awning.rotation.x = 0.25; g.add(awning);

      const win = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.35, 0.12), LS.makeEmissiveMat(0xffe9b5, 0xffcc70, 0.45));
      win.position.set(0.85, 1.4, 2.22); g.add(win);
      const door = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.0, 0.14), LS.makeToonMat(0x6e472c));
      door.position.set(-1.25, 1.0, 2.22); g.add(door);

      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(3.8, 0.72, 0.16),
        new THREE.MeshBasicMaterial({
          map: LS.createSignTexture(title, { bg: '#fffaf0', border: '#c69f68', color: '#3d2c1e', font: 'bold 34px sans-serif' })
        })
      );
      sign.position.set(0, 3.0, 2.35); g.add(sign);

      worldGroup.add(g);
      addCollider(x, z, 2.7, 2.7);
    }

    function buildTree(x, z, kind, scale, noCol) {
      const s = scale || 1;
      const hdKey = kind === 'sakura' ? 'anime_tree_sakura'
        : (kind === 'gold' ? 'anime_tree_maple'
          : (kind === 'willow' ? 'anime_tree_willow' : 'anime_tree_green'));
      if (LS.isHD && LS.hdAssets && LS.hdAssets.has(hdKey)) {
        const m = LS.hdAssets.clone(hdKey);
        m.position.set(x, 0, z);
        m.rotation.y = x * 0.73 + z * 0.41;
        m.scale.setScalar(s * 1.05);
        worldGroup.add(m);
        if (!noCol) addCollider(x, z, 0.55 * s, 0.55 * s);
        return;
      }
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.scale.setScalar(s);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.36, 2.8, 8), LS.makeToonMat(kind === 'sakura' ? 0x5c3c2e : 0x6e4a30));
      trunk.position.y = 1.4; trunk.castShadow = true; g.add(trunk);

      if (kind === 'willow') {
        const wMat = LS.makeToonMat(0x6ca859);
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          const drape = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2.6, 7), wMat);
          drape.position.set(Math.cos(a) * 0.85, 2.7, Math.sin(a) * 0.85);
          drape.castShadow = true;
          g.add(drape);
        }
        const topGeo = LS.isHD ? new THREE.IcosahedronGeometry(1.3, 2) : new THREE.DodecahedronGeometry(1.3, 1);
        const top = new THREE.Mesh(topGeo, LS.makeToonMat(0x5a964b));
        top.position.y = 3.7; g.add(top);
      } else {
        const colors = kind === 'sakura'
          ? [0xffc7d9, 0xffaec8, 0xffe0eb]
          : (kind === 'gold' ? [0xe8b954, 0xf2cb6b, 0xd49a38] : [0x4c9a42, 0x66b852, 0x3b7d36]);
        [[0, 3.3, 0, 1.55], [-0.95, 2.85, 0.45, 1.15], [0.95, 2.95, -0.35, 1.2], [0.15, 3.9, 0.4, 1.05], [-0.4, 3.6, -0.7, 1.0]].forEach((p, idx) => {
          const geo = LS.isHD ? new THREE.IcosahedronGeometry(p[3], 2) : new THREE.DodecahedronGeometry(p[3], 1);
          const m = new THREE.Mesh(geo, LS.makeToonMat(colors[idx % colors.length]));
          m.position.set(p[0], p[1], p[2]); m.castShadow = true; g.add(m);
        });
      }

      worldGroup.add(g);
      if (!noCol) addCollider(x, z, 0.55 * s, 0.55 * s);
    }

    function buildJetliner(scale) {
      const p = new THREE.Group();
      const white = LS.makeToonMat(0xf8fafc), coral = LS.makeToonMat(0xe63946), blue = LS.makeToonMat(0x1d4ed8);
      const win = LS.makeEmissiveMat(0x90e0ef, 0x48cae4, 0.35);
      const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 8.2, 14), white); fuse.rotation.x = Math.PI / 2; fuse.castShadow = true; p.add(fuse);
      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.85, 12, 10), white); nose.scale.set(1, 1, 1.55); nose.position.z = 4.1; p.add(nose);
      const cockpit = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.38, 0.65), win); cockpit.position.set(0, 0.32, 4.35); p.add(cockpit);
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.74, 0.24, 7.6), blue); stripe.position.y = -0.05; p.add(stripe);
      const wings = new THREE.Mesh(new THREE.BoxGeometry(10.4, 0.16, 2.1), white); wings.position.set(0, -0.18, 0.4); wings.castShadow = true; p.add(wings);
      [-2.8, 2.8].forEach(ex => {
        const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.35, 10), coral);
        eng.rotation.x = Math.PI / 2; eng.position.set(ex, -0.52, 0.7); p.add(eng);
      });
      const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.2, 1.65), coral); tailFin.position.set(0, 1.25, -3.5); tailFin.rotation.x = -0.25; p.add(tailFin);
      const tailWing = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.14, 1.1), white); tailWing.position.set(0, 0.22, -3.8); p.add(tailWing);
      p.scale.setScalar(scale || 1.0);
      return p;
    }

    // 1. Painterly Meadow Ground, Curving Village Lane, Winding Footpaths, Open Meadows, Hills, Mt. Fuji & Tokyo Tower
    const MAIN_LANE_PTS = [[-0.5, 41], [0.4, 30], [-0.4, 18], [1.8, 6], [-1.2, -7], [1.6, -21], [0.2, -35]];
    const CREEK_PTS = [[-38, 44], [-45, 28], [-40, 14], [-44, 3.0], [-48, -11], [-42, -26], [-46, -42], [-40, -52]];
    const TRAIL_WEST_PTS = [[0.2, 11], [-11, 9], [-21, 3], [-27, -2.5], [-34, 2.5], [-41, 3.0]];
    const TRAIL_MEADOW_PTS = [[-0.2, 23], [-14, 26], [-26, 22], [-34, 12], [-35, 3.5]];
    const TRAIL_WEST_FAR_PTS = [[-47, 3.0], [-53, -3.5], [-55, -16], [-48, -28]];
    const TRAIL_EAST_PTS = [[1.2, -13], [11, -15], [19, -14], [25, -9], [23, 2], [20, 14], [24, 24]];
    const TRAIL_NORTH_PTS = [[0.8, -28], [13, -32], [25, -28], [32, -19], [29, -11]];

    safeRun('environment', () => {
      const skyGeo = new THREE.SphereGeometry(260, 24, 16);
      W.skyMesh = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({
        map: LS.createSkyTexture(LS.state.timeMode, 'tokyo'), side: THREE.BackSide
      }));
      worldGroup.add(W.skyMesh);

      // Soft band-free painterly meadow grass
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(420, 420),
        LS.makeSurfaceMat(LS.createGrassTexture('tokyo'), { roughness: 0.92, bumpScale: 0.03 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      worldGroup.add(ground);

      // Soft sunlit meadow washes across wide open grassy spaces
      SC.addMeadowPatch(worldGroup, -22, 16, 13, 9.5, 0.35, 0x80ba64);
      SC.addMeadowPatch(worldGroup, 16, 10, 11, 8.5, -0.4, 0x7db560);
      SC.addMeadowPatch(worldGroup, -53, -8, 10, 14, 0.2, 0x82bc66);
      SC.addMeadowPatch(worldGroup, 18, -36, 12, 8, 0.5, 0x7ab25e);
      SC.addMeadowPatch(worldGroup, -26, -34, 13, 9, -0.25, 0x7bb460);

      // Gently curving Main Village Lane (replaces straight ruler highway & rigid crossroad!)
      SC.addCurvedPath(worldGroup, MAIN_LANE_PTS, 6.2, 'lane_tokyo', 0.032);

      // Sweeping organic gravel footpaths connecting meadows, creek, park & shops
      SC.addCurvedPath(worldGroup, TRAIL_WEST_PTS, 2.5, 'gravel', 0.025);
      SC.addCurvedPath(worldGroup, TRAIL_MEADOW_PTS, 2.2, 'gravel', 0.024);
      SC.addCurvedPath(worldGroup, TRAIL_WEST_FAR_PTS, 2.3, 'gravel', 0.024);
      SC.addCurvedPath(worldGroup, TRAIL_EAST_PTS, 2.5, 'gravel', 0.025);
      SC.addCurvedPath(worldGroup, TRAIL_NORTH_PTS, 2.2, 'gravel', 0.024);

      // Irregular stepping stones branching into quiet meadows & clubhouse garden
      SC.addSteppingStones(worldGroup, [[-5.6, -1.5], [-4.2, -1.7], [-2.8, -1.3]]);
      SC.addSteppingStones(worldGroup, [[6.2, 8.5], [8.1, 9.2], [10.0, 8.6], [11.9, 9.5], [13.8, 10.6]]);
      SC.addSteppingStones(worldGroup, [[-17.0, 13.5], [-19.0, 14.8], [-21.2, 15.6]]);

      // Rustic trail signposts at organic forks
      SC.addSignpost(worldGroup, -4.4, 11.8, 0.35);
      SC.addSignpost(worldGroup, 6.8, -13.2, -0.5);
      SC.addSignpost(worldGroup, -36.5, 5.2, 0.8);

      // Gentle rolling grass mounds around perimeter & tucked asymmetrically into open meadows
      [
        [-59, -35, 16, 4.6], [-62, 16, 17, 5.0], [-47, 40, 18, 4.4],
        [43, -48, 17, 4.8], [14, -58, 19, 5.2], [-25, -55, 18, 5.0],
        [64, -18, 16, 4.6], [62, 36, 17, 4.8], [-29, -39, 9.5, 1.9], [16, 4.5, 6.5, 1.25]
      ].forEach(m => SC.addGrassMound(worldGroup, m[0], m[1], m[2], m[3], 0x5d964d));

      // Distant hills wrapping all 4 horizons naturally (360° sculpted forested mountain ridges in HD!)
      if (LS.isHD && LS.hdAssets && LS.hdAssets.addMountainRange) {
        LS.hdAssets.addMountainRange(worldGroup, 'tokyo');
      } else {
        const hillMat = LS.makeToonMat(0x558f5f);
        [[-92, -112, 48, 24], [-15, -124, 56, 28], [76, -108, 50, 24], [-118, -12, 46, 20], [116, -8, 48, 22], [-96, 86, 44, 18], [86, 92, 46, 19]].forEach(h => {
          const hill = new THREE.Mesh(new THREE.SphereGeometry(h[2], 16, 12), hillMat);
          hill.scale.set(1.4, h[3] / h[2], 1.0); hill.position.set(h[0], -2, h[1]); worldGroup.add(hill);
        });
      }

      // Distant Mt. Fuji (snow strictly restricted to far peak)
      const fujiG = new THREE.Group(); fujiG.position.set(-88, 0, -142);
      const fujiBase = new THREE.Mesh(new THREE.ConeGeometry(50, 42, 20), LS.makeToonMat(0x557194)); fujiBase.position.y = 21; fujiG.add(fujiBase);
      const fujiCap = new THREE.Mesh(new THREE.ConeGeometry(15.5, 13.0, 20), LS.makeToonMat(0xf4f7fb)); fujiCap.position.y = 35.2; fujiG.add(fujiCap);
      worldGroup.add(fujiG);

      // Iconic Tokyo Tower on distant skyline
      const tower = new THREE.Group(); tower.position.set(68, 0, -106);
      const redMat = LS.makeEmissiveMat(0xe63946, 0xd62828, 0.28);
      const whiteMat = LS.makeEmissiveMat(0xf8f9fa, 0xfff3d6, 0.22);
      [[6.0, 3.8, 12, 6, redMat], [3.8, 2.5, 10, 17, whiteMat], [2.5, 1.5, 10, 27, redMat], [1.5, 0.8, 8, 36, whiteMat], [0.8, 0.25, 10, 45, redMat]].forEach(s => {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(s[1], s[0], s[2], 4), s[4]);
        m.position.y = s[3]; m.rotation.y = Math.PI / 4; tower.add(m);
      });
      const deck1 = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.2, 5.6), LS.makeEmissiveMat(0xffe082, 0xffb703, 0.72)); deck1.position.y = 21.5; tower.add(deck1);
      const deck2 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.5, 3.2), LS.makeEmissiveMat(0xffe082, 0xffb703, 0.72)); deck2.position.y = 38.5; tower.add(deck2);
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.65, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff595e })); beacon.position.y = 51.5; tower.add(beacon);
      worldGroup.add(tower);
    });

    // 2. Meandering West Sakura Creek, Arched Cedar Footbridge & Open West Flower Meadow!
    safeRun('west_sakura_creek', () => {
      SC.addMeanderingStream(worldGroup, CREEK_PTS, 4.9, addCollider, [{ x: -44.0, z: 3.0, r: 3.8 }]);

      // Walkable arched cedar footbridge across the meandering creek bend at (X=-44, Z=3.0)
      const plankMat = new THREE.MeshLambertMaterial({ map: LS.createCedarPlankTexture() });
      const railWood = LS.makeToonMat(0x6e472c);
      for (let i = 0; i < 6; i++) {
        const t0 = i / 6, t1 = (i + 1) / 6, tm = (t0 + t1) / 2;
        const xm = -41.0 - tm * 6.0;
        const ym = Math.sin(tm * Math.PI) * 0.55;
        const slope = Math.atan2(Math.sin(t1 * Math.PI) * 0.55 - Math.sin(t0 * Math.PI) * 0.55, 1.0);
        const deck = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.14, 3.0), plankMat);
        deck.position.set(xm, ym + 0.02, 3.0); deck.rotation.z = -slope; deck.castShadow = true; worldGroup.add(deck);
        [-1.4, 1.4].forEach(rz => {
          const r = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.09, 0.1), railWood);
          r.position.set(xm, ym + 0.82, 3.0 + rz); r.rotation.z = -slope; worldGroup.add(r);
        });
      }

      // Weeping willows, lakeside bench & spacious open West Flower Meadow
      buildTree(-38.8, -4.5, 'willow', 1.2);
      buildTree(-49.2, 10.5, 'willow', 1.25);
      buildTree(-50.5, -16.5, 'sakura', 1.3);
      SC.addPicnicBlanket(worldGroup, -53.5, -7.5, 0.34);
      SC.addBench(worldGroup, -37.2, 7.2, -Math.PI / 2 - 0.3);
      SC.addWildflowerMeadow(worldGroup, -53, -6, 11, 10);
    });

    // 3. Asymmetrical Village Homes, Open Sunlit Meadows & Shōtengai Mini-Shops
    safeRun('houses_and_shops', () => {
      // Asymmetrical, staggered village homes (ZERO mirrored pairs — generous open meadows between clusters!)
      buildHouse(-11.8, -1.5, Math.PI / 2 - 0.12, '#ffe8ef', '#c94c79', { clubhouseSign: true, doorColor: 0xe05780, stories: 2 });
      buildHouse(-14.2, 17.8, Math.PI / 2 + 0.22, '#f5ebd6', '#46566b', { stories: 2 });
      buildHouse(14.5, 24.5, -Math.PI / 2 - 0.32, '#f7ece0', '#4f5a6e', { stories: 1, hedgeWall: true });
      buildHouse(-15.5, -23.0, Math.PI / 2 - 0.24, '#eef2e6', '#3f5954', { stories: 1, hedgeWall: true });
      buildHouse(14.8, -22.0, -Math.PI / 2 + 0.26, '#f2e6d0', '#5e4959', { stories: 1, noWall: true });

      // Spaced-out hillside cottages nestled into western & meadow curves
      buildHouse(-31.5, -18.5, 0.38, '#f4ebd9', '#5a4e68', { stories: 1, noWall: true });
      buildHouse(-30.5, 25.5, Math.PI - 0.28, '#e9f2ee', '#3b645c', { stories: 2 });
      buildHouse(-55.0, -25.5, 0.92, '#f7f0df', '#4d6152', { stories: 1, noWall: true });
      buildHouse(-54.0, 17.5, 2.28, '#fae8ed', '#b0486d', { stories: 1, noWall: true });

      // Organic West Fountain Clearing (X=-27.5, Z=-2.5) tucked asymmetrically off the creek trail
      const plaza = new THREE.Mesh(new THREE.CylinderGeometry(6.6, 6.8, 0.07, 22), LS.makeToonMat(0xe0d6c3));
      plaza.position.set(-27.5, 0.035, -2.5); plaza.receiveShadow = true; worldGroup.add(plaza);
      const fountain = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.2, 0.72, 16), LS.makeToonMat(0xb8b2a6));
      fountain.position.set(-27.5, 0.36, -2.5); fountain.castShadow = true; worldGroup.add(fountain);
      const fWater = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.65, 0.1, 16), LS.makeToonMat(0x48cae4));
      fWater.position.set(-27.5, 0.68, -2.5); worldGroup.add(fWater);
      addCollider(-27.5, -2.5, 2.2, 2.2);
      SC.addBench(worldGroup, -26.2, 3.2, Math.PI - 0.25);
      SC.addBench(worldGroup, -21.8, -3.2, -Math.PI / 2 + 0.2);

      // Cozy East Shōtengai Mini-Shops curving along the northern park bend
      buildMiniShop(20.5, -27.2, 0.18, '🥐 SAKURA BAKERY', '#fff5e4', 0xe07a34, '#5a3d2b');
      buildMiniShop(28.2, -25.0, -0.34, '🌷 SUNNY FLORIST', '#f0f9f0', 0x52b788, '#3a5a40');
      buildMiniShop(35.0, -19.5, -0.78, '📚 COZY BOOKSHOP', '#f4ede1', 0x3b6ea5, '#2b3d54');

      // Wide open sunlit empty meadows with delicate wildflowers, tall grass & a peaceful picnic spot!
      SC.addWildflowerMeadow(worldGroup, -21, 15, 10, 10, [0xffd166, 0xffffff, 0xff8fab, 0x90e0ef]);
      SC.addPicnicBlanket(worldGroup, -22.5, 14.5, -0.42);
      SC.addWildflowerMeadow(worldGroup, 16, 11, 9.5, 9, [0xff8fab, 0xffd166, 0xffffff, 0xc084fc]);
      SC.addBench(worldGroup, 14.2, 7.6, -2.4);
      SC.addWildflowerMeadow(worldGroup, -25, -33, 10, 9);
      SC.addWildflowerMeadow(worldGroup, 19, -37, 9, 8);

      // Asymmetric organic touches: short rustic fences, shrubs, bikes & mossy boulders
      SC.addFenceRun(worldGroup, -18.5, 13.5, -25.0, 11.2, 'wood');
      SC.addFenceRun(worldGroup, 12.2, 19.5, 17.5, 18.2, 'hedge');
      SC.addBike(worldGroup, -5.6, 4.8, 0.42, 0x52a69a);
      SC.addBike(worldGroup, 17.5, -24.5, 1.15, 0xe05780);
      SC.addBike(worldGroup, -22.5, 2.8, -0.55, 0xf59e0b);

      [
        [-8.2, 3.2, 0x90e0ef], [-18.5, -6.5, 0xff8fab], [-33.5, 8.5, 0xc084fc],
        [15.8, -11.5, 0xff8fab], [29.5, -19.5, 0x90e0ef], [11.5, 15.0, 0xffd166],
        [-11.5, -31.0, 0xff8fab], [9.5, -32.5, 0x90e0ef], [-49.5, -0.5, 0xc084fc]
      ].forEach(sh => SC.addShrub(worldGroup, sh[0], sh[1], 0.95 + (Math.abs(sh[0]) % 3) * 0.12, sh[2]));

      [
        [-21, -24, 1.2], [36, -9, 1.3], [-34, -33, 1.4], [15, -39, 1.1],
        [-16, 33, 1.2], [11, 12, 0.9], [-28, 12, 1.0], [22, 19, 1.1]
      ].forEach(b => SC.addBoulder(worldGroup, b[0], b[1], b[2], true));
    });

    // 4. Ichiban Ramen
    safeRun('ichiban_ramen', () => {
      const g = new THREE.Group(); g.position.set(11.2, 0, -5.5);
      if (LS.isHD && LS.hdAssets && LS.hdAssets.has('ichiban_ramen')) {
        g.add(LS.hdAssets.clone('ichiban_ramen'));
      } else {
        const woodDark = LS.makeToonMat(0x5a3921), plaster = LS.makeToonMat(0xf4ead3);
        const roofMat = LS.makeToonMat(0xffffff, { map: LS.createRoofTileTexture('#3d434f') });
        const body = new THREE.Mesh(new THREE.BoxGeometry(6.6, 4.2, 7.2), plaster); body.position.y = 2.1; body.castShadow = true; body.receiveShadow = true; g.add(body);
        const roof = new THREE.Mesh(new THREE.ConeGeometry(5.6, 1.8, 4), roofMat); roof.position.y = 5.0; roof.rotation.y = Math.PI / 4; roof.castShadow = true; g.add(roof);
        const awning = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.16, 6.2), woodDark); awning.position.set(-3.9, 2.8, 0); awning.rotation.z = 0.22; g.add(awning);
      }
      const norenMat = LS.makeToonMat(0xc9302c, { side: THREE.DoubleSide });
      for (let i = -2; i <= 2; i++) {
        const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.88, 0.92), norenMat); cloth.position.set(-4.45, 2.25, i * 1.05); g.add(cloth);
        W.norenPanels.push({ mesh: cloth, phase: i * 0.7 });
      }
      [-2.7, 2.7].forEach(lz => {
        const l = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffd27d }));
        l.scale.set(1, 1.35, 1); l.position.set(-4.5, 2.35, lz); g.add(l);
        if (LS.isHD && LS.createGlowSprite) {
          const halo = LS.createGlowSprite(0xffc970, 1.85);
          halo.position.copy(l.position); g.add(halo);
        }
      });
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.95, 3.8),
        new THREE.MeshBasicMaterial({ map: LS.createSignTexture('🍜 ICHIBAN RAMEN', { bg: '#3b2414', border: '#e5a94c', color: '#fff5dc', font: 'bold 44px sans-serif' }) })
      );
      sign.position.set(-3.46, 3.55, 0); g.add(sign);
      worldGroup.add(g); addCollider(11.2, -5.5, 3.5, 3.7);

      const tableG = new THREE.Group(); tableG.position.copy(W.ramenTablePos);
      const tWood = LS.makeToonMat(0x9a6539), tLeg = LS.makeToonMat(0x6e4524);
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.1, 1.75), tWood); top.position.y = 0.78; top.castShadow = true; tableG.add(top);
      [[-0.45, -0.72], [0.45, -0.72], [-0.45, 0.72], [0.45, 0.72]].forEach(p => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.76, 0.09), tLeg); leg.position.set(p[0], 0.38, p[1]); tableG.add(leg);
      });
      worldGroup.add(tableG); addCollider(W.ramenTablePos.x, W.ramenTablePos.z, 0.65, 0.92);

      function makeStool(pos, scaleH) {
        const stoolG = new THREE.Group(); stoolG.position.copy(pos); const h = 0.48 * (scaleH || 1);
        const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.28, 0.08, 12), tWood); seat.position.y = h; seat.castShadow = true; stoolG.add(seat);
        const sLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.17, h - 0.02, 8), tLeg); sLeg.position.y = (h - 0.02) / 2; stoolG.add(sLeg);
        worldGroup.add(stoolG);
      }
      makeStool(W.ramenStoolPos, 1.0); makeStool(W.salmaStoolPos, 0.92);
      W.zones.push({ id: 'ramen', label: 'Order at Ichiban Ramen', pos: new THREE.Vector3(6.6, 0, -5.5), radius: 3.6 });
    });

    // 5. Tokyo Boutique Kiosk
    safeRun('boutique', () => {
      const g = new THREE.Group(); g.position.set(-8.6, 0, -10.8);
      const body = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3.0, 4.2), LS.makeToonMat(0xffe4ec)); body.position.y = 1.5; body.castShadow = true; g.add(body);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(3.3, 1.3, 4), LS.makeToonMat(0xd95d88)); roof.position.y = 3.65; roof.rotation.y = Math.PI / 4; roof.castShadow = true; g.add(roof);
      [0xff8fab, 0xffffff, 0xffd166, 0xffffff, 0xff8fab].forEach((col, i) => {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.78), LS.makeToonMat(col));
        panel.position.set(2.05, 2.25, -1.56 + i * 0.78); panel.rotation.z = -0.22; g.add(panel);
      });
      const counter = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.95, 3.4), LS.makeToonMat(0xc68b59)); counter.position.set(1.95, 0.48, 0); g.add(counter);
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.78, 3.2),
        new THREE.MeshBasicMaterial({ map: LS.createSignTexture('🎀 TOKYO BOUTIQUE', { bg: '#fff0f5', border: '#d95d88', color: '#7a2244', font: 'bold 38px sans-serif' }) })
      );
      sign.position.set(1.76, 2.75, 0); g.add(sign);
      worldGroup.add(g); addCollider(-8.6, -10.8, 2.1, 2.2);
      W.zones.push({ id: 'shop', label: 'Browse Tokyo Outfits & Hats', pos: new THREE.Vector3(-5.6, 0, -10.8), radius: 3.4 });
    });

    // 6. Sakura Elementary School (North Academic Hill: X=0, Z=-42)
    safeRun('school', () => {
      const g = new THREE.Group(); g.position.set(0, 0, -42);
      const useHDSchool = LS.isHD && LS.hdAssets && LS.hdAssets.has('sakura_school');
      if (useHDSchool) {
        g.add(LS.hdAssets.clone('sakura_school'));
      } else {
        const main = new THREE.Mesh(new THREE.BoxGeometry(18, 6.6, 7.8), LS.makeToonMat(0xf7efe0)); main.position.y = 3.3; main.castShadow = true; main.receiveShadow = true; g.add(main);
        const roof = new THREE.Mesh(new THREE.BoxGeometry(19.2, 1.1, 8.8), LS.makeToonMat(0xffffff, { map: LS.createRoofTileTexture('#8a3e3b') })); roof.position.y = 7.1; g.add(roof);
        const clock = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.2, 16), LS.makeToonMat(0xffffff)); clock.rotation.x = Math.PI / 2; clock.position.set(0, 5.4, 3.98); g.add(clock);
        const winMat = LS.makeEmissiveMat(0x8ec9ed, 0xffe4a0, 0.25);
        for (let x = -6.5; x <= 6.5; x += 2.6) {
          if (Math.abs(x) < 1.2) continue;
          const w1 = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.3, 0.14), winMat); w1.position.set(x, 2.0, 3.94); g.add(w1);
          const w2 = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.3, 0.14), winMat); w2.position.set(x, 4.3, 3.94); g.add(w2);
        }
        const entrance = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 0.3), LS.makeToonMat(0x7c5333)); entrance.position.set(0, 1.3, 3.92); g.add(entrance);
      }
      [-3.8, 3.8].forEach(px => { const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.85, 2.5, 0.85), LS.makeToonMat(0xd4ccb8)); pillar.position.set(px, 1.25, 8.2); pillar.castShadow = true; g.add(pillar); });
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(5.2, 0.95, 0.18),
        new THREE.MeshBasicMaterial({ map: LS.createSignTexture('🏫 SAKURA ELEMENTARY', { bg: '#fdf6e7', border: '#8a3e3b', color: '#3d2c1e', font: 'bold 34px sans-serif' }) })
      );
      sign.position.set(0, 3.25, useHDSchool ? 6.02 : 4.05); g.add(sign);
      worldGroup.add(g); addCollider(0, -42, 9.2, 4.2);
      W.zones.push({ id: 'school', label: 'Enter Sakura Elementary Quiz', pos: new THREE.Vector3(0, 0, -34.0), radius: 4.2 });
    });

    // 7. Natural Expanded Tokyo Pocket Park (Picnic blanket, benches, wildflowers, slide, swing, hopscotch)
    safeRun('pocket_park', () => {
      // Soft rounded natural clearing instead of a sharp rectangle!
      const clearing = new THREE.Mesh(new THREE.CylinderGeometry(8.8, 9.0, 0.04, 24), LS.makeToonMat(0x88c46c));
      clearing.position.set(25.2, 0.02, -10.5); clearing.receiveShadow = true; worldGroup.add(clearing);

      SC.addBench(worldGroup, 20.5, -14.5, 0.45);
      SC.addBench(worldGroup, 30.2, -7.2, -Math.PI / 2);
      SC.addPicnicBlanket(worldGroup, 29.0, -16.2, -0.2);

      const pSign = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 0.72, 0.14),
        new THREE.MeshBasicMaterial({ map: LS.createSignTexture('🛝 SAKURA POCKET PARK', { bg: '#ecfdf5', border: '#2e8b57', color: '#1b4332', font: 'bold 31px sans-serif' }) })
      );
      pSign.position.set(24.8, 1.65, -3.5); worldGroup.add(pSign);

      // Slide
      const slideG = new THREE.Group(); slideG.position.set(24.0, 0, -9.6);
      const slideBlue = LS.makeToonMat(0x3b82f6), ladderMat = LS.makeToonMat(0xf59e0b);
      const platform = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.14, 1.1), slideBlue); platform.position.set(0, 1.55, -0.85); platform.castShadow = true; slideG.add(platform);
      [-0.5, 0.5].forEach(lx => { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.56, 8), ladderMat); post.position.set(lx, 0.78, -1.32); slideG.add(post); });
      const chute = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.1, 2.35), slideBlue); chute.position.set(0, 0.84, 0.55); chute.rotation.x = 0.54; chute.castShadow = true; slideG.add(chute);
      worldGroup.add(slideG); addCollider(24.0, -9.6, 0.65, 1.45);
      W.zones.push({ id: 'park_slide', label: 'Ride the Park Slide Together 🛝', pos: new THREE.Vector3(24.0, 0, -7.8), radius: 2.5 });

      // Swing
      const swingG = new THREE.Group(); swingG.position.set(27.8, 0, -12.6);
      const frameMat = LS.makeToonMat(0x8b5a2b);
      [-0.85, 0.85].forEach(sz => {
        const legA = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.3, 8), frameMat); legA.position.set(-0.5, 1.12, sz); legA.rotation.z = 0.22;
        const legB = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.3, 8), frameMat); legB.position.set(0.5, 1.12, sz); legB.rotation.z = -0.22;
        swingG.add(legA, legB);
      });
      const topBar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.1, 8), frameMat); topBar.rotation.x = Math.PI / 2; topBar.position.y = 2.15; swingG.add(topBar);
      const pivot = new THREE.Group(); pivot.position.y = 2.12;
      [-0.24, 0.24].forEach(rz => { const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.55, 6), LS.makeToonMat(0xd6c7b2)); rope.position.set(0, -0.78, rz); pivot.add(rope); });
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.07, 0.62), LS.makeToonMat(0xef4444)); seat.position.y = -1.56; pivot.add(seat);
      swingG.add(pivot); W.swingPivot = pivot;
      worldGroup.add(swingG); addCollider(27.8, -12.6, 0.75, 1.15);
      W.zones.push({ id: 'park_swing', label: 'Swing Together on the Swing 🎠', pos: new THREE.Vector3(27.0, 0, -11.0), radius: 2.5 });

      // Hopscotch
      const hopC = document.createElement('canvas'); hopC.width = 256; hopC.height = 512;
      const hctx = hopC.getContext('2d'); hctx.strokeStyle = '#fff9eb'; hctx.lineWidth = 8; hctx.fillStyle = '#fff9eb'; hctx.font = 'bold 42px sans-serif'; hctx.textAlign = 'center';
      [[64, 410, '1'], [192, 410, '2'], [128, 310, '3'], [64, 210, '4'], [192, 210, '5'], [128, 110, '6']].forEach(c => { hctx.strokeRect(c[0] - 46, c[1] - 46, 92, 92); hctx.fillText(c[2], c[0], c[1] + 15); });
      const hopMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 3.0), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(hopC), transparent: true }));
      hopMesh.rotation.x = -Math.PI / 2; hopMesh.position.copy(W.hopscotchPos); worldGroup.add(hopMesh);
      W.zones.push({ id: 'park_hopscotch', label: 'Play Hopscotch Together (+20c) 🎯', pos: new THREE.Vector3(21.2, 0, -9.2), radius: 2.4 });
    });

    // 8. HANEDA-TOKYO INTERNATIONAL AIRPORT (Southeast: X=28..58, Z=14..38)
    safeRun('haneda_airport', () => {
      const runway = new THREE.Mesh(new THREE.PlaneGeometry(11.5, 86), LS.makeToonMat(0x454a52));
      runway.rotation.x = -Math.PI / 2; runway.position.set(50, 0.02, -2); runway.receiveShadow = true; worldGroup.add(runway);
      const stripeMat = LS.makeToonMat(0xf8fafc), lightMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
      for (let rz = -38; rz <= 36; rz += 6) {
        const st = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.03, 3.2), stripeMat); st.position.set(50, 0.035, rz); worldGroup.add(st);
        const lL = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 6), lightMat); lL.position.set(44.5, 0.2, rz);
        const lR = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 6), lightMat); lR.position.set(55.5, 0.2, rz);
        worldGroup.add(lL, lR);
      }

      const term = new THREE.Group(); term.position.set(33.5, 0, 25.0);
      const concrete = LS.makeToonMat(0xeef2f6), navy = LS.makeToonMat(0x1e3a5f), glass = LS.makeEmissiveMat(0x90e0ef, 0x48cae4, 0.42);
      const tMain = new THREE.Mesh(new THREE.BoxGeometry(11.5, 5.4, 14.0), concrete); tMain.position.y = 2.7; tMain.castShadow = true; term.add(tMain);
      const tRoof = new THREE.Mesh(new THREE.BoxGeometry(12.8, 0.45, 15.2), navy); tRoof.position.y = 5.55; term.add(tRoof);
      const tGlass = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.4, 11.2), glass); tGlass.position.set(-5.78, 2.5, 0); term.add(tGlass);
      const aSign = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 1.15, 8.6),
        new THREE.MeshBasicMaterial({ map: LS.createSignTexture('✈️ HANEDA INTERNATIONAL AIRPORT', { bg: '#0f2544', border: '#38bdf8', color: '#ffffff', font: 'bold 31px sans-serif', width: 640 }) })
      );
      aSign.position.set(-5.95, 4.95, 0); term.add(aSign);

      const towerStem = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.45, 11.5, 10), concrete); towerStem.position.set(0, 5.75, -8.5); towerStem.castShadow = true; term.add(towerStem);
      const towerCab = new THREE.Mesh(new THREE.CylinderGeometry(2.15, 1.55, 2.2, 12), glass); towerCab.position.set(0, 12.2, -8.5); term.add(towerCab);
      const towerCap = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.35, 12), navy); towerCap.position.set(0, 13.45, -8.5); term.add(towerCap);
      const radar = new THREE.Group(); radar.position.set(0, 14.3, -8.5);
      radar.add(new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.55, 0.25), LS.makeToonMat(0xfacc15)));
      term.add(radar); W.radarDish = radar;

      worldGroup.add(term); addCollider(33.5, 25.0, 6.0, 7.2); addCollider(33.5, 16.5, 1.6, 1.6);

      const parkedPlane = buildJetliner(1.05); parkedPlane.position.set(49.2, 1.35, 22.0); parkedPlane.rotation.y = Math.PI; worldGroup.add(parkedPlane);
      const skyPlane = buildJetliner(0.75); skyPlane.position.set(20, 28, -20); worldGroup.add(skyPlane); W.skyPlane = skyPlane;

      W.zones.push({ id: 'airport_gate', label: 'Visit Haneda International Departures ✈️', pos: new THREE.Vector3(25.5, 0, 25.0), radius: 4.4 });
    });

    // 9. Street Details, Machines, Lamps & Lush Natural Tree Groves
    safeRun('street_details_and_trees', () => {
      const vm = new THREE.Group(); vm.position.set(-5.8, 0, -15.6);
      const vmBody = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.0, 0.78), LS.makeToonMat(0x2563eb)); vmBody.position.y = 1.0; vmBody.castShadow = true; vm.add(vmBody);
      const vmGlow = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.95, 0.08), new THREE.MeshBasicMaterial({ color: 0xffe082 })); vmGlow.position.set(0, 1.32, 0.38); vm.add(vmGlow);
      const vmAccent = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.32, 0.8), LS.makeToonMat(0xf43f5e)); vmAccent.position.y = 0.25; vm.add(vmAccent);
      worldGroup.add(vm); addCollider(-5.8, -15.6, 0.7, 0.6);
      W.zones.push({ id: 'gachapon', label: 'Spin Tokyo Capsule Toy Machine (15c) 🎁', pos: new THREE.Vector3(-4.5, 0, -15.6), radius: 2.8 });

      if (LS.isHD && LS.hdAssets && LS.hdAssets.has('anime_vending')) {
        const dVm = LS.hdAssets.clone('anime_vending');
        dVm.position.set(-5.8, 0, -13.6);
        dVm.rotation.y = Math.PI / 2;
        worldGroup.add(dVm);
      } else {
        const drinkVm = new THREE.Group(); drinkVm.position.set(-5.8, 0, -13.6);
        const dBody = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.95, 0.74), LS.makeToonMat(0xef4444)); dBody.position.y = 0.98; dBody.castShadow = true; drinkVm.add(dBody);
        const dWindow = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.86, 0.08), new THREE.MeshBasicMaterial({ color: 0xa7f3d0 })); dWindow.position.set(0, 1.3, 0.36); drinkVm.add(dWindow);
        worldGroup.add(drinkVm);
      }
      addCollider(-5.8, -13.6, 0.68, 0.58);
      W.zones.push({ id: 'drink_vending', label: 'Japanese Drink & Snack Machine 🧃', pos: new THREE.Vector3(-4.5, 0, -13.6), radius: 2.6 });

      W.zones.push({ id: 'clubhouse', label: "Enter Laila & Salma's 3D Room 🏡", pos: new THREE.Vector3(-6.2, 0, -1.5), radius: 3.1 });

      const ballMesh = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), LS.makeToonMat(0xffbe0b));
      ballMesh.position.set(-2.5, 0.14, -5.2); ballMesh.visible = false; worldGroup.add(ballMesh); W.mochiBall = ballMesh;

      // Utility poles + sagging Shinkai catenary power lines in HD mode (simple warm lamps in Classic!)
      if (LS.isHD && LS.hdAssets && LS.hdAssets.has('utility_pole')) {
        const westPoles = [
          { x: -4.6, z: 24.5, rotY: 0 },
          { x: -4.2, z: 8.5, rotY: 0.12 },
          { x: -5.2, z: -7.5, rotY: -0.08 },
          { x: -4.4, z: -24.5, rotY: 0.05 }
        ];
        const eastPoles = [
          { x: 5.4, z: 16.5, rotY: Math.PI },
          { x: 5.6, z: -1.5, rotY: Math.PI - 0.1 },
          { x: 6.2, z: -18.5, rotY: Math.PI + 0.08 }
        ];
        westPoles.concat(eastPoles).forEach(pt => {
          const pm = LS.hdAssets.clone('utility_pole');
          pm.position.set(pt.x, 0, pt.z);
          pm.rotation.y = pt.rotY;
          worldGroup.add(pm);
          const lx = pt.x + Math.cos(pt.rotY) * 1.15;
          const halo = LS.createGlowSprite(0xffe090, 1.85);
          halo.position.set(lx, 5.25, pt.z - Math.sin(pt.rotY) * 1.15);
          worldGroup.add(halo);
        });
        LS.hdAssets.addPowerLines(worldGroup, westPoles);
        LS.hdAssets.addPowerLines(worldGroup, eastPoles);
        // Cross-street overhead wires (classic Japanese neighborhood silhouette!)
        LS.hdAssets.addPowerLines(worldGroup, [westPoles[1], eastPoles[0]]);
        LS.hdAssets.addPowerLines(worldGroup, [westPoles[2], eastPoles[1]]);
        LS.hdAssets.addRidgeTowers(worldGroup, [[-26, 17, -110], [28, 16, -108]]);
      } else {
        const poleMat = LS.makeToonMat(0x5c4f44), lampBulb = new THREE.MeshBasicMaterial({ color: 0xffe4a0 });
        [[-4.8, 23.5], [5.8, 12.0], [-5.2, -4.5], [6.4, -18.5], [-4.5, -28.0], [18.5, -16.5], [-21.0, 2.5]].forEach(p => {
          const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.15, 6.2, 8), poleMat); pole.position.set(p[0], 3.1, p[1]); pole.castShadow = true; worldGroup.add(pole);
          const lx = p[0] + (p[0] < 0 ? 0.35 : -0.35);
          const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), lampBulb); lamp.position.set(lx, 5.6, p[1]); worldGroup.add(lamp);
        });
      }

      // Organic asymmetrical tree groves leaving wide sunlit meadows & clear sky views!
      [
        // Cozy small grove near Clubhouse & Boutique
        [-8.2, 11.5, 'green', 1.2], [-9.6, -7.8, 'sakura', 1.1],
        // Lone dramatic trees framing the open meadows
        [10.5, 4.2, 'sakura', 1.35], [-17.5, 19.5, 'gold', 1.28], [21.5, 11.0, 'green', 1.2],
        // Northern school & orchard natural scatter
        [-9.2, -31.5, 'sakura', 1.3], [11.5, -34.0, 'gold', 1.25], [-19.0, -37.5, 'sakura', 1.25], [22.5, -34.5, 'green', 1.15],
        // Pocket Park & Shōtengai organic edges
        [17.2, -18.8, 'sakura', 1.18], [34.5, -13.5, 'sakura', 1.22], [35.8, -3.5, 'green', 1.15],
        // West creek & fountain groves
        [-21.5, -6.2, 'sakura', 1.25], [-34.5, -7.5, 'green', 1.2], [-37.0, 15.5, 'sakura', 1.15],
        // Southern meadow accents
        [20.5, 33.5, 'sakura', 1.22], [-15.5, 33.0, 'green', 1.18], [-24.0, 35.5, 'gold', 1.1],
        // Asymmetric forested outer valley rim
        [-60, -29, 'green', 1.45], [-59, -11, 'sakura', 1.38], [-61, 8, 'green', 1.42], [-57, 26, 'gold', 1.36],
        [-43, -47, 'green', 1.42], [-27, -49, 'sakura', 1.35], [26, -47, 'green', 1.44], [39, -41, 'sakura', 1.35],
        [-35, 39, 'green', 1.38], [-19, 43, 'sakura', 1.32], [17, 43, 'green', 1.3], [61, -25, 'green', 1.42], [60, 14, 'sakura', 1.35]
      ].forEach(t => buildTree(t[0], t[1], t[2], t[3], Math.abs(t[0]) > 54 || Math.abs(t[1]) > 42));
    });

    // 10. Tokyo Shinkansen Station (South: X=0, Z=41.5)
    safeRun('shinkansen_station', () => {
      const g = new THREE.Group(); g.position.set(0, 0, 41.5);
      const deckMat = LS.makeToonMat(0xd6d3cc), navyMat = LS.makeToonMat(0x1d3557), glassMat = LS.makeEmissiveMat(0x90e0ef, 0x48cae4, 0.35);
      const plat = new THREE.Mesh(new THREE.BoxGeometry(14.5, 0.55, 4.2), deckMat); plat.position.y = 0.27; plat.receiveShadow = true; g.add(plat);
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(14.0, 0.04, 0.28), LS.makeToonMat(0xfacc15)); stripe.position.set(0, 0.56, 1.6); g.add(stripe);
      [-6.0, -3.2, 3.2, 6.0].forEach(px => { const col = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 3.8, 8), navyMat); col.position.set(px, 2.2, 0); col.castShadow = true; g.add(col); });
      const roof = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.28, 4.8), navyMat); roof.position.y = 4.15; roof.castShadow = true; g.add(roof);
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(6.8, 1.05, 0.2),
        new THREE.MeshBasicMaterial({ map: LS.createSignTexture('🚅 TOKYO SHINKANSEN → KYOTO', { bg: '#0f2544', border: '#60a5fa', color: '#ffffff', font: 'bold 29px sans-serif', width: 640 }) })
      );
      sign.position.set(0, 3.45, -2.15); g.add(sign);
      const track = new THREE.Mesh(new THREE.BoxGeometry(130, 0.4, 2.8), LS.makeToonMat(0x6c757d)); track.position.set(0, 0.3, 3.6); g.add(track);

      const train = new THREE.Group(); train.position.set(0, 1.25, 3.6);
      train.add(new THREE.Mesh(new THREE.BoxGeometry(14, 1.55, 1.75), LS.makeToonMat(0xf8fafc)));
      const tStripe = new THREE.Mesh(new THREE.BoxGeometry(14.05, 0.28, 1.78), LS.makeToonMat(0x1d4ed8)); tStripe.position.y = -0.15; train.add(tStripe);
      const tWin = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.38, 1.79), glassMat); tWin.position.y = 0.26; train.add(tWin);
      [-7.8, 7.8].forEach(nx => {
        const nose = new THREE.Mesh(new THREE.ConeGeometry(0.95, 2.5, 12), LS.makeToonMat(0xf8fafc));
        nose.rotation.z = nx > 0 ? -Math.PI / 2 : Math.PI / 2; nose.scale.set(0.85, 1.0, 0.95); nose.position.set(nx, -0.05, 0); train.add(nose);
      });
      g.add(train); W.shinkansenTrain = train;
      worldGroup.add(g); addCollider(0, 42.3, 7.6, 2.2);
      W.zones.push({ id: 'shinkansen_station', label: 'Board Shinkansen to Kyoto 🚅', pos: new THREE.Vector3(0, 0, 38.0), radius: 4.0 });
    });

    // 11. 5 Hidden Tokyo Cats (chosen from 20 natural hiding spots — rotates every 2-hour reset round!)
    safeRun('hidden_cats', () => {
      const catPool = [
        { pos: new THREE.Vector3(5.6, 0, 13.5), hint: 'near Main Street east sidewalk' },
        { pos: new THREE.Vector3(-12.5, 0, -10.8), hint: 'behind the pink Tokyo Boutique' },
        { pos: new THREE.Vector3(-23.5, 0, -2.0), hint: 'by the West Sakura Fountain Plaza' },
        { pos: new THREE.Vector3(24.5, 0, -14.8), hint: 'inside Sakura Pocket Park' },
        { pos: new THREE.Vector3(23.5, 0, 31.0), hint: 'near Haneda International Airport' },
        { pos: new THREE.Vector3(6.8, 0, -34.5), hint: 'in the Sakura Elementary schoolyard' },
        { pos: new THREE.Vector3(-33.0, 0, -8.5), hint: 'along the West Residential Lane' },
        { pos: new THREE.Vector3(15.5, 0, -5.5), hint: 'behind Ichiban Ramen' },
        { pos: new THREE.Vector3(-50.5, 0, -6.0), hint: 'by the picnic blanket across West Sakura Creek' },
        { pos: new THREE.Vector3(-39.0, 0, 6.5), hint: 'near the Sakura Creek wooden footbridge' },
        { pos: new THREE.Vector3(20.0, 0, -22.5), hint: 'outside the Sakura Bakery & Florist alley' },
        { pos: new THREE.Vector3(31.5, 0, -18.0), hint: 'near the Cozy Bookshop & park picnic' },
        { pos: new THREE.Vector3(-52.5, 0, -16.5), hint: 'in the West Flower Meadow orchard' },
        { pos: new THREE.Vector3(-33.5, 0, 16.5), hint: 'in the Southwest Sakura neighborhood' },
        { pos: new THREE.Vector3(11.5, 0, 33.5), hint: 'near the Shinkansen Station garden' },
        { pos: new THREE.Vector3(-17.5, 0, 16.0), hint: 'beside the West avenue houses' },
        { pos: new THREE.Vector3(21.0, 0, 15.5), hint: 'along the road to Haneda Airport' },
        { pos: new THREE.Vector3(-12.5, 0, -36.5), hint: 'west of Sakura Elementary gate' },
        { pos: new THREE.Vector3(18.5, 0, -33.5), hint: 'on the Northern School Orchard trail' },
        { pos: new THREE.Vector3(-49.5, 0, 9.0), hint: 'under the weeping willow by the creek' }
      ];

      const catMeta = [
        { id: 'cat_mikan', name: 'Mikan (Orange Tabby)', color: 0xe89643, accent: 0xfff3d6, collar: 0x2a9d8f },
        { id: 'cat_kuro', name: 'Kuro (Midnight Cat)', color: 0x2c303a, accent: 0xf4e4c4, collar: 0xe63946 },
        { id: 'cat_yuki', name: 'Yuki (Snowball)', color: 0xfaf7f2, accent: 0xffe4ec, collar: 0xff758f },
        { id: 'cat_sakura', name: 'Sakura (Calico)', color: 0xf4b678, accent: 0xfff8ec, collar: 0xd95d88 },
        { id: 'cat_tama', name: 'Tama (Tabby Explorer)', color: 0x8b95a5, accent: 0xffffff, collar: 0x3b6ea5 }
      ];

      const chosenSpots = LS.pickRoundSpots(catPool, LS.state.catsRound || 0, 5);
      catMeta.forEach((cd, idx) => {
        const spot = chosenSpots[idx];
        const alreadyFound = LS.state.foundCats.includes(cd.id);
        const built = LS.createCatModel(cd.color, cd.accent, { collarColor: cd.collar, scale: 1.08 });
        const g = built.root;
        g.position.copy(spot.pos);
        g.rotation.y = (idx * 1.15) - 0.5;
        const tail = built.tail;

        const mc = document.createElement('canvas'); mc.width = 128; mc.height = 128;
        const mctx = mc.getContext('2d'); mctx.fillStyle = 'rgba(255, 248, 225, 0.95)';
        mctx.beginPath(); mctx.arc(64, 64, 52, 0, Math.PI * 2); mctx.fill();
        mctx.strokeStyle = '#e07a34'; mctx.lineWidth = 8; mctx.stroke();
        mctx.font = 'bold 54px sans-serif'; mctx.textAlign = 'center'; mctx.fillText('🐾', 64, 82);
        const marker = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(mc), transparent: true }));
        marker.scale.set(0.75, 0.75, 1); marker.position.set(0, 1.22, 0); marker.visible = !alreadyFound; g.add(marker);

        worldGroup.add(g);
        W.hiddenAnimals.push({ id: cd.id, kind: 'cat', name: cd.name, hint: spot.hint, mesh: g, marker, tail, found: alreadyFound });
        if (!alreadyFound) W.zones.push({ id: 'animal:' + cd.id, label: 'Pet ' + cd.name + ' (+35c)', pos: spot.pos.clone(), radius: 2.4 });
      });
    });

    // 12. Drifting Sakura Petals & NPCs
    safeRun('petals_and_npcs', () => {
      const pCount = 140;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        pPos[i * 3] = -58 + Math.random() * 116;
        pPos[i * 3 + 1] = 1 + Math.random() * 12;
        pPos[i * 3 + 2] = -52 + Math.random() * 96;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      W.petals = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xffc0d6, size: 0.2, transparent: true, opacity: 0.9 }));
      worldGroup.add(W.petals);

      LS.spawnWorldNPCs(worldGroup, [
        { name: 'Yui', pos: new THREE.Vector3(-3.8, 0, 4.5), patrol: { axis: 'z', center: 4.5, range: 5.5, speed: 0.9 },
          line: 'Follow the winding gravel path west across Sakura Creek, or east to the Bakery, Park & Haneda Airport!',
          char: { scale: 0.86, hairColor: 0x5c3724, topColor: 0xffffff, bottomColor: 0x2c4a7c, sailorCollar: true, backpackColor: 0xe67e8a, longHair: true,
            faceOpts: { eyeColor: '#5c2f24', eyeHighlight: '#d97a66', blush: 'rgba(248, 128, 148, 0.50)' } } },
        { name: 'Haruto', pos: new THREE.Vector3(3.8, 0, 12.5), patrol: { axis: 'z', center: 12.5, range: 4.5, speed: 1.05 },
          line: '5 cats hide across 20 spots in Tokyo — and every 2 hours after you find them, they hide in brand-new places!',
          char: { scale: 0.88, hairColor: 0x242429, topColor: 0x34527a, bottomColor: 0x2b3342, pants: true, backpackColor: 0x22262e,
            faceOpts: { eyeColor: '#253c6b', eyeHighlight: '#5c9be0', blush: 'rgba(235, 130, 130, 0.28)' } } },
        { name: 'Ojii-san', pos: new THREE.Vector3(-4.2, 0, -5.5), patrol: { axis: 'z', center: -5.5, range: 3.0, speed: 0.55 },
          line: 'Hello Laila & Salma! Walk up to Mochi to play Fetch or Tag, or press V for a piggyback boost!',
          char: { scale: 0.96, hairColor: 0xc9c9c9, topColor: 0x7b8c6e, bottomColor: 0x4d463f, pants: true, faceOpts: { elder: true, glasses: true, mustache: true, eyeColor: '#46362b', eyeHighlight: '#8c725a', blush: 'rgba(224, 132, 122, 0.26)' } } },
        { name: 'Master Ken', pos: new THREE.Vector3(6.6, 0, -3.2), baseRot: -Math.PI / 2, waveOnNear: true,
          line: 'Irasshaimase, Laila & Salma! Two steaming bowls ready at Ichiban Ramen!',
          char: { scale: 1.02, hairColor: 0x29231f, topColor: 0x2b3a55, bottomColor: 0x222630, pants: true, headband: true, faceOpts: { mustache: true, eyeColor: '#3a2214', eyeHighlight: '#915b30', blush: 'rgba(232, 128, 118, 0.28)' } } },
        { name: 'Ms. Aoi', pos: new THREE.Vector3(-2.6, 0, -33.0),
          line: 'Hello Laila & Salma! Step up anytime for Laila or Salma quiz fun!',
          char: { scale: 0.98, hairColor: 0x382820, topColor: 0xe8d5c4, bottomColor: 0x4a5b70, hairBun: true, faceOpts: { glasses: true, eyeColor: '#2a5a4e', eyeHighlight: '#64b898', blush: 'rgba(244, 136, 150, 0.42)' } } },
        { name: 'Mina', pos: new THREE.Vector3(-6.4, 0, -10.8), baseRot: Math.PI / 2, waveOnNear: true,
          line: 'Welcome to Tokyo Boutique! Try cute hats & dresses, or walk inside your pink house to decorate in 3D!',
          char: { scale: 0.9, hairColor: 0x6b3e2e, topColor: 0xffb3c6, bottomColor: 0x723d46, hatType: 'beret', hatColor: 0xd95d88,
            faceOpts: { eyeColor: '#6d356b', eyeHighlight: '#d17bc2', blush: 'rgba(250, 126, 154, 0.52)' } } },
        { name: 'Captain Sora', pos: new THREE.Vector3(25.5, 0, 21.5), baseRot: -Math.PI / 2, waveOnNear: true,
          line: 'Welcome to Haneda International Airport! Check our departures board for Safari, Egypt, Paris & Outer Space!',
          char: { scale: 1.0, hairColor: 0x24262b, topColor: 0x1d3557, bottomColor: 0x16243b, pants: true, hatType: 'cap', hatColor: 0x1d3557,
            faceOpts: { eyeColor: '#1e4268', eyeHighlight: '#5ea4db', blush: 'rgba(225, 130, 125, 0.25)' } } }
      ]);

      // AAA 6,500 wind-swept 3D instanced grass tufts across Tokyo open meadows (1 GPU draw call!)
      if (LS.isHD && LS.hdAssets && LS.hdAssets.addInstancedGrass) {
        const laneSp = SC.sampleSpline(MAIN_LANE_PTS, 5);
        const creekSp = SC.sampleSpline(CREEK_PTS, 5);
        const trailsSp = [
          SC.sampleSpline(TRAIL_WEST_PTS, 4),
          SC.sampleSpline(TRAIL_MEADOW_PTS, 4),
          SC.sampleSpline(TRAIL_WEST_FAR_PTS, 4),
          SC.sampleSpline(TRAIL_EAST_PTS, 4),
          SC.sampleSpline(TRAIL_NORTH_PTS, 4)
        ];
        const nearSp = (sp, x, z, r2) => {
          for (let i = 0; i < sp.length; i++) {
            const dx = x - sp[i][0], dz = z - sp[i][1];
            if (dx * dx + dz * dz < r2) return true;
          }
          return false;
        };
        LS.hdAssets.addInstancedGrass(worldGroup, { minX: -58, maxX: 41, minZ: -48, maxZ: 36 }, (x, z) => {
          if (z > 35.0) return false;
          if (x > 42.0 || (x > 25.5 && z > 12.5)) return false; // Haneda Airport apron & runway
          if (Math.hypot(x + 27.5, z + 2.5) < 7.3) return false; // West Fountain Plaza
          if (Math.abs(x) < 11.5 && z < -31.5 && z > -47.5) return false; // Sakura Elementary yard
          if (Math.hypot(x - 21.4, z + 9.2) < 2.4) return false; // Hopscotch
          if (nearSp(laneSp, x, z, 4.1 * 4.1)) return false;
          if (nearSp(creekSp, x, z, 3.6 * 3.6)) return false;
          for (let t = 0; t < trailsSp.length; t++) {
            if (nearSp(trailsSp[t], x, z, 1.9 * 1.9)) return false;
          }
          for (let c = 0; c < W.colliders.length; c++) {
            const b = W.colliders[c];
            if (x > b.minX - 0.65 && x < b.maxX + 0.65 && z > b.minZ - 0.65 && z < b.maxZ + 0.65) return false;
          }
          return true;
        }, 'tokyo');
      }
    });

    W.ramenDiningConfig = {
      lailaSeatPos: new THREE.Vector3(W.ramenStoolPos.x, 0.14, W.ramenStoolPos.z),
      salmaSeatPos: new THREE.Vector3(W.salmaStoolPos.x, 0.16, W.salmaStoolPos.z),
      seatRotY: Math.PI / 2, exitOffset: new THREE.Vector3(-1.1, 0, 0),
      lailaDishPos: new THREE.Vector3(W.ramenTablePos.x - 0.18, 0.84, W.ramenStoolPos.z),
      salmaDishPos: new THREE.Vector3(W.ramenTablePos.x - 0.18, 0.84, W.salmaStoolPos.z),
      oishiiPos: new THREE.Vector3(W.ramenTablePos.x - 0.25, 2.15, W.ramenTablePos.z),
      camPos: new THREE.Vector3(W.ramenTablePos.x - 3.05, 1.52, W.ramenTablePos.z + 2.75),
      camLook: new THREE.Vector3(W.ramenTablePos.x - 0.85, 0.82, W.ramenTablePos.z - 0.05),
      caption: 'Oishii! 😋🍜'
    };

    W.getMochiIdleAnchor = function () {
      const ojii = LS.chars.npcs.find(n => n.name === 'Ojii-san');
      if (!ojii) return null;
      return { pos: ojii.model.root.position.clone().add(new THREE.Vector3(1.05, 0, 0.3)), rotY: ojii.model.root.rotation.y };
    };

    W.getZoneLabel = function (px, pz) {
      if (px < -46) return 'West Flower Meadow';
      if (px < -39 && Math.abs(pz - 2) < 6) return 'Sakura Creek Bridge';
      if (px > 20 && pz > 12) return 'Haneda Airport ✈️';
      if (px > 16 && pz < -20) return 'Shōtengai Alley';
      if (px > 16 && pz <= -2) return 'Sakura Pocket Park';
      if (px < -18) return 'West Sakura Plaza';
      if (pz > 32) return 'Tokyo Shinkansen';
      if (pz < -28) return 'Sakura Elementary';
      if (px > 4 && Math.abs(pz + 5.5) < 6) return 'Ichiban Ramen';
      if (px < -4 && Math.abs(pz + 10.8) < 5) return 'Tokyo Boutique';
      if (px < -4 && Math.abs(pz + 1.5) < 4) return "Sisters' House";
      return 'Tokyo Main Street';
    };

    W.update = function (dt, elapsed) {
      W.norenPanels.forEach(n => { n.mesh.rotation.z = Math.sin(elapsed * 2.1 + n.phase) * 0.08; });
      W.hiddenAnimals.forEach((cat, idx) => {
        if (cat.tail) cat.tail.rotation.z = Math.sin(elapsed * 3.2 + idx) * 0.28;
        if (cat.marker && !cat.found) cat.marker.position.y = 1.22 + Math.sin(elapsed * 3.0 + idx) * 0.12;
      });
      if (W.swingPivot) {
        if (LS.runtime.parkActivity && LS.runtime.parkActivity.type === 'swing') W.swingPivot.rotation.x = Math.sin(elapsed * 4.5) * 0.58;
        else W.swingPivot.rotation.x *= 0.9;
      }
      if (W.shinkansenTrain) W.shinkansenTrain.position.x = Math.sin(elapsed * 0.22) * 3.8;
      if (W.radarDish) W.radarDish.rotation.y = elapsed * 1.4;
      if (W.skyPlane) {
        const ang = elapsed * 0.18;
        W.skyPlane.position.set(16 + Math.cos(ang) * 48, 30 + Math.sin(elapsed * 0.5) * 1.5, -10 + Math.sin(ang) * 48);
        W.skyPlane.rotation.y = -ang; W.skyPlane.rotation.z = 0.22;
      }
      if (W.petals) {
        const pos = W.petals.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          let y = pos.getY(i) - dt * 0.65;
          let x = pos.getX(i) + Math.sin(elapsed + i) * dt * 0.35;
          if (y < 0.2) { y = 12.0; x = -58 + Math.random() * 116; }
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
      ctx.fillStyle = '#74ad5c'; ctx.fillRect(0, 0, cw, ch);
      // Soft open meadow clearings
      ctx.fillStyle = '#88c26d';
      [[-22, 16, 15], [16, 10, 12], [-53, -8, 13], [-25, -33, 13]].forEach(m => {
        ctx.beginPath(); ctx.arc(toMapX(m[0]), toMapY(m[1]), m[2], 0, Math.PI * 2); ctx.fill();
      });
      // Meandering West Sakura Creek
      strokeMapSpline(ctx, CREEK_PTS, toMapX, toMapY, '#3b9eb3', 6);
      // Winding gravel footpaths & curving village lane
      [TRAIL_WEST_PTS, TRAIL_MEADOW_PTS, TRAIL_WEST_FAR_PTS, TRAIL_EAST_PTS, TRAIL_NORTH_PTS].forEach(t => {
        strokeMapSpline(ctx, t, toMapX, toMapY, '#cbbca0', 3.2);
      });
      strokeMapSpline(ctx, MAIN_LANE_PTS, toMapX, toMapY, '#9e9584', 6.8);
      // Airport Runway & Terminal
      ctx.fillStyle = '#454a52'; ctx.fillRect(toMapX(44.5), toMapY(-44), toMapX(55.5) - toMapX(44.5), toMapY(40) - toMapY(-44));
      ctx.fillStyle = '#1e3a5f'; ctx.fillRect(toMapX(27.5), toMapY(18), toMapX(39.5) - toMapX(27.5), toMapY(32) - toMapY(18));
      // Park & West Plaza
      ctx.fillStyle = '#52b788'; ctx.beginPath(); ctx.arc(toMapX(25.2), toMapY(-10.5), 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e0d6c3'; ctx.beginPath(); ctx.arc(toMapX(-27.5), toMapY(-2.5), 8.5, 0, Math.PI * 2); ctx.fill();
      // Landmarks
      ctx.fillStyle = '#b84a46'; ctx.fillRect(toMapX(-9), toMapY(-46), toMapX(9) - toMapX(-9), toMapY(-38) - toMapY(-46));
      ctx.fillStyle = '#d97724'; ctx.fillRect(toMapX(8), toMapY(-9), toMapX(14.5) - toMapX(8), toMapY(-2) - toMapY(-9));
      ctx.fillStyle = '#e05780'; ctx.fillRect(toMapX(-15.5), toMapY(-5), toMapX(-8) - toMapX(-15.5), toMapY(2) - toMapY(-5));
      ctx.fillStyle = '#1d4ed8'; ctx.fillRect(toMapX(-8), toMapY(39), toMapX(8) - toMapX(-8), toMapY(44) - toMapY(39));

      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 6.5px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('🏫', toMapX(0), toMapY(-40));
      ctx.fillText('🛝', toMapX(25.2), toMapY(-9));
      ctx.fillText('✈️', toMapX(33.5), toMapY(26));
      ctx.fillText('🚅 KYOTO', toMapX(0), toMapY(42.5));
    };

    return W;
  }

  LS.registerWorld('tokyo', { build: buildTokyoWorld });
})(window.LailaSalma);
