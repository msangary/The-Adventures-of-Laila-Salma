window.LailaSalma = window.LailaSalma || {};

(function (LS) {
  function safeRun(name, fn) {
    try { fn(); } catch (e) { console.error('[Tokyo:' + name + ']', e); }
  }

  function buildTokyoWorld(worldGroup) {
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
      hopscotchPos: new THREE.Vector3(21.2, 0.04, -9.2),
      ramenTablePos: new THREE.Vector3(7.4, 0, -5.5),
      ramenStoolPos: new THREE.Vector3(6.2, 0, -5.15),
      salmaStoolPos: new THREE.Vector3(6.2, 0, -5.92)
    };

    function addCollider(x, z, hw, hd) {
      W.colliders.push({ minX: x - hw, maxX: x + hw, minZ: z - hd, maxZ: z + hd });
    }

    function buildHouse(x, z, rotY, wallHex, roofHex, opts) {
      const cfg = opts || {};
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.y = rotY;

      const wallMat = LS.makeToonMat(0xffffff, { map: LS.createPlasterTexture(wallHex) });
      const roofMat = LS.makeToonMat(0xffffff, { map: LS.createRoofTileTexture(roofHex) });
      const woodMat = LS.makeToonMat(cfg.doorColor || 0x7c5333);
      const winMat = LS.makeEmissiveMat(0x8bc3e8, 0xffe4a0, 0.25);

      const body = new THREE.Mesh(new THREE.BoxGeometry(7.2, 5.4, 6.2), wallMat);
      body.position.y = 2.7;
      body.castShadow = true;
      body.receiveShadow = true;
      g.add(body);

      const roof = new THREE.Mesh(new THREE.ConeGeometry(5.8, 2.3, 4), roofMat);
      roof.position.y = 6.55;
      roof.rotation.y = Math.PI / 4;
      roof.scale.set(1.1, 1, 0.96);
      roof.castShadow = true;
      g.add(roof);

      const door = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.2, 0.16), woodMat);
      door.position.set(-1.4, 1.1, 3.12);
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
        sign.position.set(-1.4, 2.85, 3.22);
        g.add(sign);
      }

      [1.4, -1.4].forEach((wx, i) => {
        const wy = i === 0 ? 1.7 : 3.9;
        const win = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.2, 0.14), winMat);
        win.position.set(wx, wy, 3.12);
        g.add(win);
        const shutter = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.25, 0.16), woodMat);
        shutter.position.set(wx + 1.08, wy, 3.14);
        g.add(shutter);
      });
      const upperWin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.2, 0.14), winMat);
      upperWin.position.set(1.4, 3.9, 3.12);
      g.add(upperWin);

      const ac = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.65, 0.45), LS.makeToonMat(0xe6e4dc));
      ac.position.set(2.9, 0.45, 3.32);
      g.add(ac);

      const wall = new THREE.Mesh(new THREE.BoxGeometry(8.2, 1.15, 0.35), LS.makeToonMat(0xcac6bc));
      wall.position.set(0, 0.57, 4.3);
      wall.castShadow = true;
      wall.receiveShadow = true;
      g.add(wall);

      const post = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.55, 0.32), LS.makeToonMat(0xd13838));
      post.position.set(-3.4, 1.25, 4.45);
      g.add(post);

      worldGroup.add(g);
      addCollider(x, z, 4.2, 4.2);
    }

    function buildTree(x, z, isSakura, scale) {
      const s = scale || 1;
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.scale.setScalar(s);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.36, 2.8, 8), LS.makeToonMat(isSakura ? 0x5c3c2e : 0x6e4a30));
      trunk.position.y = 1.4;
      trunk.castShadow = true;
      g.add(trunk);

      const colors = isSakura
        ? [0xffc7d9, 0xffaec8, 0xffe0eb]
        : [0x4c9a42, 0x66b852, 0x3b7d36];

      const puffs = [
        [0, 3.3, 0, 1.55], [-0.95, 2.85, 0.45, 1.15], [0.95, 2.95, -0.35, 1.2],
        [0.15, 3.9, 0.4, 1.05], [-0.4, 3.6, -0.7, 1.0]
      ];
      puffs.forEach((p, idx) => {
        const m = new THREE.Mesh(new THREE.DodecahedronGeometry(p[3], 1), LS.makeToonMat(colors[idx % colors.length]));
        m.position.set(p[0], p[1], p[2]);
        m.castShadow = true;
        g.add(m);
      });

      worldGroup.add(g);
      addCollider(x, z, 0.55 * s, 0.55 * s);
    }

    function buildJetliner(scale) {
      const p = new THREE.Group();
      const white = LS.makeToonMat(0xf8fafc);
      const coral = LS.makeToonMat(0xe63946);
      const blue = LS.makeToonMat(0x1d4ed8);
      const win = LS.makeEmissiveMat(0x90e0ef, 0x48cae4, 0.35);

      const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 8.2, 14), white);
      fuse.rotation.x = Math.PI / 2;
      fuse.castShadow = true;
      p.add(fuse);

      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.85, 12, 10), white);
      nose.scale.set(1, 1, 1.55);
      nose.position.z = 4.1;
      p.add(nose);

      const cockpit = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.38, 0.65), win);
      cockpit.position.set(0, 0.32, 4.35);
      p.add(cockpit);

      const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.74, 0.24, 7.6), blue);
      stripe.position.y = -0.05;
      p.add(stripe);

      const wings = new THREE.Mesh(new THREE.BoxGeometry(10.4, 0.16, 2.1), white);
      wings.position.set(0, -0.18, 0.4);
      wings.castShadow = true;
      p.add(wings);

      [-2.8, 2.8].forEach(ex => {
        const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.35, 10), coral);
        eng.rotation.x = Math.PI / 2;
        eng.position.set(ex, -0.52, 0.7);
        p.add(eng);
      });

      const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.2, 1.65), coral);
      tailFin.position.set(0, 1.25, -3.5);
      tailFin.rotation.x = -0.25;
      p.add(tailFin);

      const tailWing = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.14, 1.1), white);
      tailWing.position.set(0, 0.22, -3.8);
      p.add(tailWing);

      p.scale.setScalar(scale || 1.0);
      return p;
    }

    // 1. Sky, Expanded Jubilife-Scale Ground, Boulevard + Cross Avenue, Hills, Mt. Fuji & Tokyo Tower
    safeRun('environment', () => {
      const skyGeo = new THREE.SphereGeometry(230, 24, 16);
      const skyMat = new THREE.MeshBasicMaterial({
        map: LS.createSkyTexture(LS.state.timeMode, 'tokyo'),
        side: THREE.BackSide
      });
      W.skyMesh = new THREE.Mesh(skyGeo, skyMat);
      worldGroup.add(W.skyMesh);

      const ground = new THREE.Mesh(new THREE.PlaneGeometry(340, 340), LS.makeToonMat(0x7ab862));
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      worldGroup.add(ground);

      // Main N-S Sakura Boulevard (X=0, Z=-44..+38)
      const road = new THREE.Mesh(
        new THREE.PlaneGeometry(8.6, 86),
        new THREE.MeshLambertMaterial({ map: LS.createRoadTexture('tokyo') })
      );
      road.rotation.x = -Math.PI / 2;
      road.position.set(0, 0.02, -3);
      road.receiveShadow = true;
      worldGroup.add(road);

      // East-West Cross Avenue (Z=8.0, X=-38..+34) connecting West Plaza & East Airport/Park!
      const crossRoad = new THREE.Mesh(
        new THREE.PlaneGeometry(74, 6.8),
        LS.makeToonMat(0x5b6068)
      );
      crossRoad.rotation.x = -Math.PI / 2;
      crossRoad.position.set(-2, 0.018, 8.0);
      crossRoad.receiveShadow = true;
      worldGroup.add(crossRoad);

      const swMat = LS.makeToonMat(0xd6cfc2);
      [-5.3, 5.3].forEach(sx => {
        const swN = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.14, 52), swMat);
        swN.position.set(sx, 0.07, -21);
        swN.receiveShadow = true;
        worldGroup.add(swN);
        const swS = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.14, 26), swMat);
        swS.position.set(sx, 0.07, 25);
        swS.receiveShadow = true;
        worldGroup.add(swS);
      });

      // Distant hills
      const hillMat = LS.makeToonMat(0x5e9c68);
      [[-75, -96, 44, 22], [0, -108, 52, 26], [78, -92, 46, 22], [-96, -10, 40, 18], [98, -12, 42, 19]].forEach(h => {
        const hill = new THREE.Mesh(new THREE.SphereGeometry(h[2], 16, 12), hillMat);
        hill.scale.set(1.4, h[3] / h[2], 1.0);
        hill.position.set(h[0], -2, h[1]);
        worldGroup.add(hill);
      });

      // Distant Mt. Fuji (snow strictly restricted to far peak)
      const fujiG = new THREE.Group();
      fujiG.position.set(-74, 0, -124);
      const fujiBase = new THREE.Mesh(new THREE.ConeGeometry(46, 38, 20), LS.makeToonMat(0x557194));
      fujiBase.position.y = 19;
      fujiG.add(fujiBase);
      const fujiCap = new THREE.Mesh(new THREE.ConeGeometry(14.5, 12.2, 20), LS.makeToonMat(0xf4f7fb));
      fujiCap.position.y = 31.8;
      fujiG.add(fujiCap);
      worldGroup.add(fujiG);

      // Iconic Tokyo Tower on distant skyline
      const tower = new THREE.Group();
      tower.position.set(58, 0, -90);
      const redMat = LS.makeEmissiveMat(0xe63946, 0xd62828, 0.28);
      const whiteMat = LS.makeEmissiveMat(0xf8f9fa, 0xfff3d6, 0.22);
      [[6.0, 3.8, 12, 6, redMat], [3.8, 2.5, 10, 17, whiteMat], [2.5, 1.5, 10, 27, redMat], [1.5, 0.8, 8, 36, whiteMat], [0.8, 0.25, 10, 45, redMat]].forEach(s => {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(s[1], s[0], s[2], 4), s[4]);
        m.position.y = s[3];
        m.rotation.y = Math.PI / 4;
        tower.add(m);
      });
      const deck1 = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.2, 5.6), LS.makeEmissiveMat(0xffe082, 0xffb703, 0.72));
      deck1.position.y = 21.5;
      tower.add(deck1);
      const deck2 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.5, 3.2), LS.makeEmissiveMat(0xffe082, 0xffb703, 0.72));
      deck2.position.y = 38.5;
      tower.add(deck2);
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.65, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff595e }));
      beacon.position.y = 51.5;
      tower.add(beacon);
      worldGroup.add(tower);
    });

    // 2. Expanded Neighborhood Houses + West Sakura Courtyard Plaza
    safeRun('houses', () => {
      // Main Street houses
      buildHouse(-11.8, 18.5, Math.PI / 2, '#f5ebd6', '#46566b');
      buildHouse(-11.8, -1.5, Math.PI / 2, '#ffe8ef', '#c94c79', { clubhouseSign: true, doorColor: 0xe05780 });
      buildHouse(-11.8, -21.5, Math.PI / 2, '#eef2e6', '#3f5954');
      buildHouse(11.8, 18.5, -Math.PI / 2, '#f7ece0', '#4f5a6e');
      buildHouse(11.8, -21.5, -Math.PI / 2, '#f2e6d0', '#5e4959');

      // Expanded West Residential District (Jubilife Village feel!)
      buildHouse(-28.0, -14.0, 0, '#f4ebd9', '#5a4e68');
      buildHouse(-38.0, -14.0, 0, '#e9f2ee', '#3b645c');
      buildHouse(-28.0, 22.0, Math.PI, '#f8efe2', '#46566b');
      buildHouse(-38.0, 22.0, Math.PI, '#fae8ed', '#b0486d');

      // West Sakura Garden Plaza (X=-28, Z=0)
      const plaza = new THREE.Mesh(new THREE.CylinderGeometry(7.2, 7.2, 0.08, 24), LS.makeToonMat(0xe0d6c3));
      plaza.position.set(-28, 0.04, -1.5);
      plaza.receiveShadow = true;
      worldGroup.add(plaza);
      const fountain = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.3, 0.72, 16), LS.makeToonMat(0xb8b2a6));
      fountain.position.set(-28, 0.36, -1.5);
      fountain.castShadow = true;
      worldGroup.add(fountain);
      const fWater = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.75, 0.1, 16), LS.makeToonMat(0x48cae4));
      fWater.position.set(-28, 0.68, -1.5);
      worldGroup.add(fWater);
      addCollider(-28, -1.5, 2.3, 2.3);
    });

    // 3. Ichiban Ramen
    safeRun('ichiban_ramen', () => {
      const g = new THREE.Group();
      g.position.set(11.2, 0, -5.5);

      const woodDark = LS.makeToonMat(0x5a3921);
      const plaster = LS.makeToonMat(0xf4ead3);
      const roofMat = LS.makeToonMat(0xffffff, { map: LS.createRoofTileTexture('#3d434f') });

      const body = new THREE.Mesh(new THREE.BoxGeometry(6.6, 4.2, 7.2), plaster);
      body.position.y = 2.1;
      body.castShadow = true;
      body.receiveShadow = true;
      g.add(body);

      const roof = new THREE.Mesh(new THREE.ConeGeometry(5.6, 1.8, 4), roofMat);
      roof.position.y = 5.0;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      g.add(roof);

      const awning = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.16, 6.2), woodDark);
      awning.position.set(-3.9, 2.8, 0);
      awning.rotation.z = 0.22;
      g.add(awning);

      const norenMat = LS.makeToonMat(0xc9302c, { side: THREE.DoubleSide });
      for (let i = -2; i <= 2; i++) {
        const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.88, 0.92), norenMat);
        cloth.position.set(-4.45, 2.25, i * 1.05);
        g.add(cloth);
        W.norenPanels.push({ mesh: cloth, phase: i * 0.7 });
      }

      const lanternMat = new THREE.MeshBasicMaterial({ color: 0xffd27d });
      [-2.7, 2.7].forEach(lz => {
        const l = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), lanternMat);
        l.scale.set(1, 1.35, 1);
        l.position.set(-4.5, 2.35, lz);
        g.add(l);
      });

      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.95, 3.8),
        new THREE.MeshBasicMaterial({
          map: LS.createSignTexture('🍜 ICHIBAN RAMEN', {
            bg: '#3b2414', border: '#e5a94c', color: '#fff5dc', font: 'bold 44px sans-serif'
          })
        })
      );
      sign.position.set(-3.42, 3.5, 0);
      g.add(sign);

      worldGroup.add(g);
      addCollider(11.2, -5.5, 3.5, 3.7);

      const tableG = new THREE.Group();
      tableG.position.copy(W.ramenTablePos);
      const tWood = LS.makeToonMat(0x9a6539);
      const tLeg = LS.makeToonMat(0x6e4524);

      const top = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.1, 1.75), tWood);
      top.position.y = 0.78;
      top.castShadow = true;
      top.receiveShadow = true;
      tableG.add(top);

      [[-0.45, -0.72], [0.45, -0.72], [-0.45, 0.72], [0.45, 0.72]].forEach(p => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.76, 0.09), tLeg);
        leg.position.set(p[0], 0.38, p[1]);
        tableG.add(leg);
      });

      worldGroup.add(tableG);
      addCollider(W.ramenTablePos.x, W.ramenTablePos.z, 0.65, 0.92);

      function makeStool(pos, scaleH) {
        const stoolG = new THREE.Group();
        stoolG.position.copy(pos);
        const h = 0.48 * (scaleH || 1);
        const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.28, 0.08, 12), tWood);
        seat.position.y = h;
        seat.castShadow = true;
        stoolG.add(seat);
        const sLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.17, h - 0.02, 8), tLeg);
        sLeg.position.y = (h - 0.02) / 2;
        stoolG.add(sLeg);
        worldGroup.add(stoolG);
      }
      makeStool(W.ramenStoolPos, 1.0);
      makeStool(W.salmaStoolPos, 0.92);

      W.zones.push({ id: 'ramen', label: 'Order at Ichiban Ramen', pos: new THREE.Vector3(6.6, 0, -5.5), radius: 3.6 });
    });

    // 4. Tokyo Boutique Kiosk
    safeRun('boutique', () => {
      const g = new THREE.Group();
      g.position.set(-8.6, 0, -10.8);

      const body = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3.0, 4.2), LS.makeToonMat(0xffe4ec));
      body.position.y = 1.5;
      body.castShadow = true;
      body.receiveShadow = true;
      g.add(body);

      const roof = new THREE.Mesh(new THREE.ConeGeometry(3.3, 1.3, 4), LS.makeToonMat(0xd95d88));
      roof.position.y = 3.65;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      g.add(roof);

      [0xff8fab, 0xffffff, 0xffd166, 0xffffff, 0xff8fab].forEach((col, i) => {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.78), LS.makeToonMat(col));
        panel.position.set(2.05, 2.25, -1.56 + i * 0.78);
        panel.rotation.z = -0.22;
        g.add(panel);
      });

      const counter = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.95, 3.4), LS.makeToonMat(0xc68b59));
      counter.position.set(1.95, 0.48, 0);
      g.add(counter);

      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.78, 3.2),
        new THREE.MeshBasicMaterial({
          map: LS.createSignTexture('🎀 TOKYO BOUTIQUE', {
            bg: '#fff0f5', border: '#d95d88', color: '#7a2244', font: 'bold 38px sans-serif'
          })
        })
      );
      sign.position.set(1.76, 2.75, 0);
      g.add(sign);

      worldGroup.add(g);
      addCollider(-8.6, -10.8, 2.1, 2.2);

      W.zones.push({ id: 'shop', label: 'Browse Tokyo Outfits & Hats', pos: new THREE.Vector3(-5.6, 0, -10.8), radius: 3.4 });
    });

    // 5. Sakura Elementary School (North Academic Hill: X=0, Z=-42)
    safeRun('school', () => {
      const g = new THREE.Group();
      g.position.set(0, 0, -42);

      const wallMat = LS.makeToonMat(0xf7efe0);
      const roofMat = LS.makeToonMat(0xffffff, { map: LS.createRoofTileTexture('#8a3e3b') });
      const winMat = LS.makeEmissiveMat(0x8ec9ed, 0xffe4a0, 0.25);

      const main = new THREE.Mesh(new THREE.BoxGeometry(18, 6.6, 7.8), wallMat);
      main.position.y = 3.3;
      main.castShadow = true;
      main.receiveShadow = true;
      g.add(main);

      const roof = new THREE.Mesh(new THREE.BoxGeometry(19.2, 1.1, 8.8), roofMat);
      roof.position.y = 7.1;
      g.add(roof);

      const clock = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.2, 16), LS.makeToonMat(0xffffff));
      clock.rotation.x = Math.PI / 2;
      clock.position.set(0, 5.4, 3.98);
      g.add(clock);

      for (let x = -6.5; x <= 6.5; x += 2.6) {
        if (Math.abs(x) < 1.2) continue;
        const w1 = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.3, 0.14), winMat);
        w1.position.set(x, 2.0, 3.94);
        g.add(w1);
        const w2 = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.3, 0.14), winMat);
        w2.position.set(x, 4.3, 3.94);
        g.add(w2);
      }

      const entrance = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 0.3), LS.makeToonMat(0x7c5333));
      entrance.position.set(0, 1.3, 3.92);
      g.add(entrance);

      [-3.8, 3.8].forEach(px => {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.85, 2.5, 0.85), LS.makeToonMat(0xd4ccb8));
        pillar.position.set(px, 1.25, 8.2);
        pillar.castShadow = true;
        g.add(pillar);
      });

      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(5.2, 0.95, 0.18),
        new THREE.MeshBasicMaterial({
          map: LS.createSignTexture('🏫 SAKURA ELEMENTARY', {
            bg: '#fdf6e7', border: '#8a3e3b', color: '#3d2c1e', font: 'bold 34px sans-serif'
          })
        })
      );
      sign.position.set(0, 3.2, 4.05);
      g.add(sign);

      worldGroup.add(g);
      addCollider(0, -42, 9.2, 4.2);

      W.zones.push({ id: 'school', label: 'Enter Sakura Elementary Quiz', pos: new THREE.Vector3(0, 0, -34.0), radius: 4.2 });
    });

    // 6. Expanded Tokyo Pocket Park (East Quarter: X=18..32, Z=-16..-4)
    safeRun('pocket_park', () => {
      const pad = new THREE.Mesh(new THREE.PlaneGeometry(14.5, 13.5), LS.makeToonMat(0x95d47a));
      pad.rotation.x = -Math.PI / 2;
      pad.position.set(24.8, 0.015, -10.5);
      pad.receiveShadow = true;
      worldGroup.add(pad);

      // Park Sign
      const pSign = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 0.72, 0.14),
        new THREE.MeshBasicMaterial({
          map: LS.createSignTexture('🛝 SAKURA POCKET PARK', {
            bg: '#ecfdf5', border: '#2e8b57', color: '#1b4332', font: 'bold 31px sans-serif'
          })
        })
      );
      pSign.position.set(24.8, 1.65, -4.2);
      worldGroup.add(pSign);

      // Working Slide at (24.0, 0, -9.6)
      const slideG = new THREE.Group();
      slideG.position.set(24.0, 0, -9.6);
      const slideBlue = LS.makeToonMat(0x3b82f6);
      const ladderMat = LS.makeToonMat(0xf59e0b);
      const platform = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.14, 1.1), slideBlue);
      platform.position.set(0, 1.55, -0.85);
      platform.castShadow = true;
      slideG.add(platform);
      [-0.5, 0.5].forEach(lx => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.56, 8), ladderMat);
        post.position.set(lx, 0.78, -1.32);
        slideG.add(post);
      });
      for (let ry = 0.35; ry <= 1.4; ry += 0.35) {
        const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 6), ladderMat);
        rung.rotation.z = Math.PI / 2;
        rung.position.set(0, ry, -1.32);
        slideG.add(rung);
      }
      const chute = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.1, 2.35), slideBlue);
      chute.position.set(0, 0.84, 0.55);
      chute.rotation.x = 0.54;
      chute.castShadow = true;
      slideG.add(chute);
      worldGroup.add(slideG);
      addCollider(24.0, -9.6, 0.65, 1.45);
      W.zones.push({ id: 'park_slide', label: 'Ride the Park Slide Together 🛝', pos: new THREE.Vector3(24.0, 0, -7.8), radius: 2.5 });

      // Working Swing Set at (27.8, 0, -12.6)
      const swingG = new THREE.Group();
      swingG.position.set(27.8, 0, -12.6);
      const frameMat = LS.makeToonMat(0x8b5a2b);
      [-0.85, 0.85].forEach(sz => {
        const legA = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.3, 8), frameMat);
        legA.position.set(-0.5, 1.12, sz);
        legA.rotation.z = 0.22;
        const legB = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.3, 8), frameMat);
        legB.position.set(0.5, 1.12, sz);
        legB.rotation.z = -0.22;
        swingG.add(legA, legB);
      });
      const topBar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.1, 8), frameMat);
      topBar.rotation.x = Math.PI / 2;
      topBar.position.set(0, 2.15, 0);
      swingG.add(topBar);
      const pivot = new THREE.Group();
      pivot.position.set(0, 2.12, 0);
      const ropeMat = LS.makeToonMat(0xd6c7b2);
      [-0.24, 0.24].forEach(rz => {
        const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.55, 6), ropeMat);
        rope.position.set(0, -0.78, rz);
        pivot.add(rope);
      });
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.07, 0.62), LS.makeToonMat(0xef4444));
      seat.position.set(0, -1.56, 0);
      pivot.add(seat);
      swingG.add(pivot);
      W.swingPivot = pivot;
      worldGroup.add(swingG);
      addCollider(27.8, -12.6, 0.75, 1.15);
      W.zones.push({ id: 'park_swing', label: 'Swing Together on the Swing 🎠', pos: new THREE.Vector3(27.0, 0, -11.0), radius: 2.5 });

      // Hopscotch Grid at (21.2, 0.04, -9.2)
      const hopC = document.createElement('canvas');
      hopC.width = 256; hopC.height = 512;
      const hctx = hopC.getContext('2d');
      hctx.strokeStyle = '#fff9eb'; hctx.lineWidth = 8; hctx.fillStyle = '#fff9eb';
      hctx.font = 'bold 42px sans-serif'; hctx.textAlign = 'center';
      [[64, 410, '1'], [192, 410, '2'], [128, 310, '3'], [64, 210, '4'], [192, 210, '5'], [128, 110, '6']].forEach(c => {
        hctx.strokeRect(c[0] - 46, c[1] - 46, 92, 92);
        hctx.fillText(c[2], c[0], c[1] + 15);
      });
      const hopMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 3.0),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(hopC), transparent: true })
      );
      hopMesh.rotation.x = -Math.PI / 2;
      hopMesh.position.copy(W.hopscotchPos);
      worldGroup.add(hopMesh);
      W.zones.push({ id: 'park_hopscotch', label: 'Play Hopscotch Together (+20c) 🎯', pos: new THREE.Vector3(21.2, 0, -9.2), radius: 2.4 });
    });

    // 7. HANEDA-TOKYO INTERNATIONAL AIRPORT (Southeast: X=24..50, Z=14..36)
    safeRun('haneda_airport', () => {
      // Paved Tarmac & Runway (X=43, Z=-34..+36)
      const runway = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 74), LS.makeToonMat(0x454a52));
      runway.rotation.x = -Math.PI / 2;
      runway.position.set(44, 0.02, 1);
      runway.receiveShadow = true;
      worldGroup.add(runway);

      // Runway centerline stripes & warm runway guide lights
      const stripeMat = LS.makeToonMat(0xf8fafc);
      const lightMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
      for (let rz = -30; rz <= 32; rz += 6) {
        const st = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.03, 3.2), stripeMat);
        st.position.set(44, 0.035, rz);
        worldGroup.add(st);
        const lL = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 6), lightMat);
        lL.position.set(39.0, 0.2, rz);
        const lR = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 6), lightMat);
        lR.position.set(49.0, 0.2, rz);
        worldGroup.add(lL, lR);
      }

      // Airport Terminal Building (X=29, Z=24)
      const term = new THREE.Group();
      term.position.set(29.0, 0, 24.5);
      const concrete = LS.makeToonMat(0xeef2f6);
      const navy = LS.makeToonMat(0x1e3a5f);
      const glass = LS.makeEmissiveMat(0x90e0ef, 0x48cae4, 0.42);

      const tMain = new THREE.Mesh(new THREE.BoxGeometry(11.5, 5.4, 14.0), concrete);
      tMain.position.y = 2.7;
      tMain.castShadow = true;
      tMain.receiveShadow = true;
      term.add(tMain);

      const tRoof = new THREE.Mesh(new THREE.BoxGeometry(12.8, 0.45, 15.2), navy);
      tRoof.position.y = 5.55;
      term.add(tRoof);

      // Wide panoramic glass front facing West toward the plaza
      const tGlass = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.4, 11.2), glass);
      tGlass.position.set(-5.78, 2.5, 0);
      term.add(tGlass);

      // Airport Sign
      const aSign = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 1.15, 8.6),
        new THREE.MeshBasicMaterial({
          map: LS.createSignTexture('✈️ HANEDA INTERNATIONAL AIRPORT', {
            bg: '#0f2544', border: '#38bdf8', color: '#ffffff', font: 'bold 31px sans-serif', width: 640
          })
        })
      );
      aSign.position.set(-5.95, 4.95, 0);
      term.add(aSign);

      // Air Traffic Control Tower on North Corner
      const towerStem = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.45, 11.5, 10), concrete);
      towerStem.position.set(0, 5.75, -8.5);
      towerStem.castShadow = true;
      term.add(towerStem);
      const towerCab = new THREE.Mesh(new THREE.CylinderGeometry(2.15, 1.55, 2.2, 12), glass);
      towerCab.position.set(0, 12.2, -8.5);
      term.add(towerCab);
      const towerCap = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.35, 12), navy);
      towerCap.position.set(0, 13.45, -8.5);
      term.add(towerCap);

      // Rotating Radar Dish on top of Control Tower!
      const radar = new THREE.Group();
      radar.position.set(0, 14.3, -8.5);
      const dish = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.55, 0.25), LS.makeToonMat(0xfacc15));
      radar.add(dish);
      term.add(radar);
      W.radarDish = radar;

      worldGroup.add(term);
      addCollider(29.0, 24.5, 6.0, 7.2);
      addCollider(29.0, 16.0, 1.6, 1.6);

      // Parked Laila & Salma Express Jetliner next to Gate!
      const parkedPlane = buildJetliner(1.05);
      parkedPlane.position.set(43.2, 1.35, 22.0);
      parkedPlane.rotation.y = Math.PI;
      worldGroup.add(parkedPlane);

      // Circling Passenger Jetliner high in the sky!
      const skyPlane = buildJetliner(0.75);
      skyPlane.position.set(20, 26, -20);
      worldGroup.add(skyPlane);
      W.skyPlane = skyPlane;

      // Interactive International Departures Gate Zone!
      W.zones.push({
        id: 'airport_gate',
        label: 'Visit Haneda International Departures ✈️',
        pos: new THREE.Vector3(21.2, 0, 24.5),
        radius: 4.2
      });
    });

    // 8. Street Details, Gachapon, Drink Vending, Clubhouse Door & Trees
    safeRun('street_details', () => {
      // Blue Gachapon Capsule Machine
      const vm = new THREE.Group();
      vm.position.set(-5.8, 0, -15.6);
      const vmBody = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.0, 0.78), LS.makeToonMat(0x2563eb));
      vmBody.position.y = 1.0; vmBody.castShadow = true; vm.add(vmBody);
      const vmGlow = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.95, 0.08), new THREE.MeshBasicMaterial({ color: 0xffe082 }));
      vmGlow.position.set(0, 1.32, 0.38); vm.add(vmGlow);
      const vmAccent = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.32, 0.8), LS.makeToonMat(0xf43f5e));
      vmAccent.position.y = 0.25; vm.add(vmAccent);
      worldGroup.add(vm);
      addCollider(-5.8, -15.6, 0.7, 0.6);
      W.zones.push({ id: 'gachapon', label: 'Spin Tokyo Capsule Toy Machine (15c) 🎁', pos: new THREE.Vector3(-4.5, 0, -15.6), radius: 2.8 });

      // Red Drink & Snack Vending Machine
      const drinkVm = new THREE.Group();
      drinkVm.position.set(-5.8, 0, -13.6);
      const dBody = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.95, 0.74), LS.makeToonMat(0xef4444));
      dBody.position.y = 0.98; dBody.castShadow = true; drinkVm.add(dBody);
      const dWindow = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.86, 0.08), new THREE.MeshBasicMaterial({ color: 0xa7f3d0 }));
      dWindow.position.set(0, 1.3, 0.36); drinkVm.add(dWindow);
      worldGroup.add(drinkVm);
      addCollider(-5.8, -13.6, 0.68, 0.58);
      W.zones.push({ id: 'drink_vending', label: 'Japanese Drink & Snack Machine 🧃', pos: new THREE.Vector3(-4.5, 0, -13.6), radius: 2.6 });

      // Enterable 3D Room Door Zone outside Laila & Salma's House!
      W.zones.push({ id: 'clubhouse', label: "Enter Laila & Salma's 3D Room 🏡", pos: new THREE.Vector3(-6.2, 0, -1.5), radius: 3.1 });

      // Fetch Ball
      const ballMesh = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), LS.makeToonMat(0xffbe0b));
      ballMesh.position.set(-2.5, 0.14, -5.2);
      ballMesh.visible = false;
      worldGroup.add(ballMesh);
      W.mochiBall = ballMesh;

      // Utility poles & warm emissive Sakura street lamps
      const poleMat = LS.makeToonMat(0x5a5650);
      const lampBulb = new THREE.MeshBasicMaterial({ color: 0xffe4a0 });
      [[-5.6, 22], [-5.6, 12], [-5.6, -6], [-5.6, -24], [5.6, 20], [5.6, -16], [5.6, -32]].forEach(p => {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 8.0, 8), poleMat);
        pole.position.set(p[0], 4.0, p[1]);
        pole.castShadow = true;
        worldGroup.add(pole);
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), lampBulb);
        lamp.position.set(p[0] + (p[0] < 0 ? 0.5 : -0.5), 4.6, p[1]);
        worldGroup.add(lamp);
      });

      // Trees across expanded Jubilife-scale Tokyo
      [
        [-7.2, 12.2, false, 1.15], [7.2, 2.8, true, 1.15], [-7.4, -7.2, true, 1.0],
        [7.6, -13.2, false, 1.1], [-7.5, -31.0, true, 1.25], [7.5, -31.0, true, 1.25],
        [-20, -4, true, 1.2], [-36, -4, true, 1.25], [-20, 14, false, 1.15],
        [18, -18, true, 1.25], [32, -16, true, 1.2], [32, -4, false, 1.15],
        [18, 28, true, 1.2], [-18, 30, true, 1.2]
      ].forEach(t => buildTree(t[0], t[1], t[2], t[3]));
    });

    // 9. Tokyo Shinkansen Bullet Train Station (South end: X=0, Z=38.5)
    safeRun('shinkansen_station', () => {
      const g = new THREE.Group();
      g.position.set(0, 0, 38.5);

      const deckMat = LS.makeToonMat(0xd6d3cc);
      const navyMat = LS.makeToonMat(0x1d3557);
      const glassMat = LS.makeEmissiveMat(0x90e0ef, 0x48cae4, 0.35);

      const plat = new THREE.Mesh(new THREE.BoxGeometry(14.5, 0.55, 4.2), deckMat);
      plat.position.y = 0.27;
      plat.receiveShadow = true;
      g.add(plat);

      const stripe = new THREE.Mesh(new THREE.BoxGeometry(14.0, 0.04, 0.28), LS.makeToonMat(0xfacc15));
      stripe.position.set(0, 0.56, 1.6);
      g.add(stripe);

      [-6.0, -3.2, 3.2, 6.0].forEach(px => {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 3.8, 8), navyMat);
        col.position.set(px, 2.2, 0);
        col.castShadow = true;
        g.add(col);
      });
      const roof = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.28, 4.8), navyMat);
      roof.position.y = 4.15;
      roof.castShadow = true;
      g.add(roof);

      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(6.8, 1.05, 0.2),
        new THREE.MeshBasicMaterial({
          map: LS.createSignTexture('🚅 TOKYO SHINKANSEN → KYOTO', {
            bg: '#0f2544', border: '#60a5fa', color: '#ffffff', font: 'bold 29px sans-serif', width: 640
          })
        })
      );
      sign.position.set(0, 3.45, -2.15);
      g.add(sign);

      const track = new THREE.Mesh(new THREE.BoxGeometry(110, 0.4, 2.8), LS.makeToonMat(0x6c757d));
      track.position.set(0, 0.3, 3.6);
      g.add(track);

      const train = new THREE.Group();
      train.position.set(0, 1.25, 3.6);
      const tBody = new THREE.Mesh(new THREE.BoxGeometry(14, 1.55, 1.75), LS.makeToonMat(0xf8fafc));
      tBody.castShadow = true;
      train.add(tBody);
      const tStripe = new THREE.Mesh(new THREE.BoxGeometry(14.05, 0.28, 1.78), LS.makeToonMat(0x1d4ed8));
      tStripe.position.y = -0.15;
      train.add(tStripe);
      const tWin = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.38, 1.79), glassMat);
      tWin.position.y = 0.26;
      train.add(tWin);
      [-7.8, 7.8].forEach(nx => {
        const nose = new THREE.Mesh(new THREE.ConeGeometry(0.95, 2.5, 12), LS.makeToonMat(0xf8fafc));
        nose.rotation.z = nx > 0 ? -Math.PI / 2 : Math.PI / 2;
        nose.scale.set(0.85, 1.0, 0.95);
        nose.position.set(nx, -0.05, 0);
        train.add(nose);
      });
      g.add(train);
      W.shinkansenTrain = train;

      worldGroup.add(g);
      addCollider(0, 39.3, 7.6, 2.2);

      W.zones.push({ id: 'shinkansen_station', label: 'Board Shinkansen to Kyoto 🚅', pos: new THREE.Vector3(0, 0, 35.0), radius: 4.0 });
    });

    // 10. 5 Hidden Tokyo Cats (chosen from 15 curated spots — rotates every 2-hour reset round!)
    safeRun('hidden_cats', () => {
      const catPool = [
        { pos: new THREE.Vector3(5.6, 0, 13.5), hint: 'near Main Street east sidewalk' },
        { pos: new THREE.Vector3(-12.5, 0, -10.8), hint: 'behind the pink Tokyo Boutique' },
        { pos: new THREE.Vector3(-23.5, 0, -2.0), hint: 'by the West Sakura Fountain Plaza' },
        { pos: new THREE.Vector3(24.5, 0, -14.8), hint: 'inside Tokyo Pocket Park' },
        { pos: new THREE.Vector3(19.5, 0, 29.0), hint: 'near Haneda International Airport' },
        { pos: new THREE.Vector3(6.8, 0, -34.5), hint: 'in the Sakura Elementary schoolyard' },
        { pos: new THREE.Vector3(-33.0, 0, -8.5), hint: 'along the West Residential Lane' },
        { pos: new THREE.Vector3(15.5, 0, -5.5), hint: 'behind Ichiban Ramen' },
        { pos: new THREE.Vector3(-7.0, 0, -28.0), hint: 'north of the Gachapon machines' },
        { pos: new THREE.Vector3(-33.5, 0, 15.5), hint: 'in the Southwest Sakura neighborhood' },
        { pos: new THREE.Vector3(30.5, 0, -6.5), hint: 'by the east side of Pocket Park' },
        { pos: new THREE.Vector3(11.5, 0, 31.5), hint: 'near the Shinkansen Station garden' },
        { pos: new THREE.Vector3(-17.5, 0, 16.0), hint: 'beside the West avenue houses' },
        { pos: new THREE.Vector3(19.0, 0, 13.5), hint: 'along the road to Haneda Airport' },
        { pos: new THREE.Vector3(-9.5, 0, -36.5), hint: 'west of Sakura Elementary gate' }
      ];

      const catMeta = [
        { id: 'cat_mikan', name: 'Mikan (Orange Tabby)', color: 0xe89643, accent: 0xfff3d6 },
        { id: 'cat_kuro', name: 'Kuro (Midnight Cat)', color: 0x2a2d36, accent: 0xffd166 },
        { id: 'cat_yuki', name: 'Yuki (Snowball)', color: 0xfaf7f2, accent: 0xffa6c1 },
        { id: 'cat_sakura', name: 'Sakura (Calico)', color: 0xf4b678, accent: 0x4a3525 },
        { id: 'cat_tama', name: 'Tama (Tabby Explorer)', color: 0x8b95a5, accent: 0xffffff }
      ];

      const chosenSpots = LS.pickRoundSpots(catPool, LS.state.catsRound || 0, 5);
      catMeta.forEach((cd, idx) => {
        const spot = chosenSpots[idx];
        const alreadyFound = LS.state.foundCats.includes(cd.id);
        const g = new THREE.Group();
        g.position.copy(spot.pos);
        const fur = LS.makeToonMat(cd.color);
        const acc = LS.makeToonMat(cd.accent);

        const body = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), fur);
        body.scale.set(1.25, 0.78, 0.95); body.position.y = 0.2; body.castShadow = true; g.add(body);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), fur);
        head.position.set(0.22, 0.34, 0); g.add(head);
        [-0.08, 0.08].forEach(ez => {
          const ear = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.13, 5), acc);
          ear.position.set(0.24, 0.5, ez); g.add(ear);
        });
        const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.34, 6), fur);
        tail.position.set(-0.28, 0.34, 0); tail.rotation.z = 0.65; g.add(tail);

        const mc = document.createElement('canvas');
        mc.width = 128; mc.height = 128;
        const mctx = mc.getContext('2d');
        mctx.fillStyle = 'rgba(255, 248, 225, 0.95)';
        mctx.beginPath(); mctx.arc(64, 64, 52, 0, Math.PI * 2); mctx.fill();
        mctx.strokeStyle = '#e07a34'; mctx.lineWidth = 8; mctx.stroke();
        mctx.font = 'bold 54px sans-serif'; mctx.textAlign = 'center'; mctx.fillText('🐾', 64, 82);
        const marker = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(mc), transparent: true }));
        marker.scale.set(0.75, 0.75, 1); marker.position.set(0.1, 1.05, 0); marker.visible = !alreadyFound;
        g.add(marker);

        worldGroup.add(g);
        W.hiddenAnimals.push({ id: cd.id, kind: 'cat', name: cd.name, hint: spot.hint, mesh: g, marker, tail, found: alreadyFound });

        if (!alreadyFound) {
          W.zones.push({ id: 'animal:' + cd.id, label: 'Pet ' + cd.name + ' (+35c)', pos: spot.pos.clone(), radius: 2.4 });
        }
      });
    });

    // 11. Drifting Sakura Petals
    safeRun('petals', () => {
      const pCount = 120;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        pPos[i * 3] = -42 + Math.random() * 88;
        pPos[i * 3 + 1] = 1 + Math.random() * 12;
        pPos[i * 3 + 2] = -42 + Math.random() * 80;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      W.petals = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xffc0d6, size: 0.2, transparent: true, opacity: 0.9 }));
      worldGroup.add(W.petals);
    });

    // 12. Tokyo NPCs
    safeRun('npcs', () => {
      LS.spawnWorldNPCs(worldGroup, [
        {
          name: 'Yui',
          pos: new THREE.Vector3(-3.8, 0, 4.5),
          patrol: { axis: 'z', center: 4.5, range: 5.5, speed: 0.9 },
          line: 'Hi Laila & Salma! Follow the cross avenue east to visit Haneda Airport & the big Pocket Park!',
          char: { scale: 0.86, hairColor: 0x5c3724, topColor: 0xffffff, bottomColor: 0x2c4a7c, sailorCollar: true, backpackColor: 0xe67e8a, longHair: true }
        },
        {
          name: 'Haruto',
          pos: new THREE.Vector3(3.8, 0, 12.5),
          patrol: { axis: 'z', center: 12.5, range: 4.5, speed: 1.05 },
          line: '5 cats are hiding around Tokyo — and every 2 hours after you find them, they pick brand-new spots!',
          char: { scale: 0.88, hairColor: 0x242429, topColor: 0x34527a, bottomColor: 0x2b3342, pants: true, backpackColor: 0x22262e }
        },
        {
          name: 'Ojii-san',
          pos: new THREE.Vector3(-4.2, 0, -5.5),
          patrol: { axis: 'z', center: -5.5, range: 3.0, speed: 0.55 },
          line: 'Hello Laila & Salma! Walk up to Mochi to play 30s Fetch or Tag, or press V for a piggyback boost!',
          char: { scale: 0.96, hairColor: 0xc9c9c9, topColor: 0x7b8c6e, bottomColor: 0x4d463f, pants: true, faceOpts: { elder: true, glasses: true, mustache: true } }
        },
        {
          name: 'Master Ken',
          pos: new THREE.Vector3(6.6, 0, -3.2),
          baseRot: -Math.PI / 2,
          waveOnNear: true,
          line: 'Irasshaimase, Laila & Salma! Two steaming bowls ready at Ichiban Ramen!',
          char: { scale: 1.02, hairColor: 0x29231f, topColor: 0x2b3a55, bottomColor: 0x222630, pants: true, headband: true, faceOpts: { mustache: true } }
        },
        {
          name: 'Ms. Aoi',
          pos: new THREE.Vector3(-2.6, 0, -33.0),
          line: 'Hello Laila & Salma! Step up anytime for Laila or Salma quiz fun!',
          char: { scale: 0.98, hairColor: 0x382820, topColor: 0xe8d5c4, bottomColor: 0x4a5b70, hairBun: true, faceOpts: { glasses: true } }
        },
        {
          name: 'Mina',
          pos: new THREE.Vector3(-6.4, 0, -10.8),
          baseRot: Math.PI / 2,
          waveOnNear: true,
          line: 'Welcome to Tokyo Boutique! Try cute hats & dresses, or step inside your pink house to decorate your 3D room!',
          char: { scale: 0.9, hairColor: 0x6b3e2e, topColor: 0xffb3c6, bottomColor: 0x723d46, hatType: 'beret', hatColor: 0xd95d88 }
        },
        {
          name: 'Captain Sora',
          pos: new THREE.Vector3(21.5, 0, 21.0),
          baseRot: -Math.PI / 2,
          waveOnNear: true,
          line: 'Welcome to Haneda International Airport! Check our departures board for Egypt, Paris, Safari & Outer Space!',
          char: { scale: 1.0, hairColor: 0x24262b, topColor: 0x1d3557, bottomColor: 0x16243b, pants: true, hatType: 'cap', hatColor: 0x1d3557 }
        }
      ]);
    });

    W.ramenDiningConfig = {
      lailaSeatPos: new THREE.Vector3(W.ramenStoolPos.x, 0.14, W.ramenStoolPos.z),
      salmaSeatPos: new THREE.Vector3(W.salmaStoolPos.x, 0.16, W.salmaStoolPos.z),
      seatRotY: Math.PI / 2,
      exitOffset: new THREE.Vector3(-1.1, 0, 0),
      lailaDishPos: new THREE.Vector3(W.ramenTablePos.x - 0.18, 0.84, W.ramenStoolPos.z),
      salmaDishPos: new THREE.Vector3(W.ramenTablePos.x - 0.18, 0.84, W.salmaStoolPos.z),
      oishiiPos: new THREE.Vector3(W.ramenTablePos.x - 0.25, 2.15, W.ramenTablePos.z),
      camPos: new THREE.Vector3(W.ramenTablePos.x - 3.05, 1.52, W.ramenTablePos.z + 2.75),
      camLook: new THREE.Vector3(W.ramenTablePos.x - 0.85, 0.82, W.ramenTablePos.z - 0.05),
      caption: 'Oishii! 😋🍜'
    };

    W.getGroundHeight = function () { return 0; };
    W.getMochiIdleAnchor = function () {
      const ojii = LS.chars.npcs.find(n => n.name === 'Ojii-san');
      if (!ojii) return null;
      return {
        pos: ojii.model.root.position.clone().add(new THREE.Vector3(1.05, 0, 0.3)),
        rotY: ojii.model.root.rotation.y
      };
    };

    W.getZoneLabel = function (px, pz) {
      if (px > 18 && pz > 12) return 'Haneda Airport ✈️';
      if (px > 16 && pz < -2 && pz > -20) return 'Tokyo Pocket Park';
      if (px < -18) return 'West Sakura Plaza';
      if (pz > 30) return 'Tokyo Shinkansen';
      if (pz < -28) return 'Sakura Elementary';
      if (px > 4 && Math.abs(pz + 5.5) < 6) return 'Ichiban Ramen';
      if (px < -4 && Math.abs(pz + 10.8) < 5) return 'Tokyo Boutique';
      if (px < -4 && Math.abs(pz + 1.5) < 4) return "Sisters' House";
      return 'Tokyo Main Street';
    };

    W.update = function (dt, elapsed) {
      W.norenPanels.forEach(n => { n.mesh.rotation.z = Math.sin(elapsed * 2.1 + n.phase) * 0.08; });
      W.hiddenAnimals.forEach((cat, idx) => {
        if (cat.tail) cat.tail.rotation.x = Math.sin(elapsed * 3.2 + idx) * 0.25;
        if (cat.marker && !cat.found) cat.marker.position.y = 1.02 + Math.sin(elapsed * 3.0 + idx) * 0.12;
      });
      if (W.swingPivot) {
        if (LS.runtime.parkActivity && LS.runtime.parkActivity.type === 'swing') {
          W.swingPivot.rotation.x = Math.sin(elapsed * 4.5) * 0.58;
        } else {
          W.swingPivot.rotation.x *= 0.9;
        }
      }
      if (W.shinkansenTrain) W.shinkansenTrain.position.x = Math.sin(elapsed * 0.22) * 3.8;
      if (W.radarDish) W.radarDish.rotation.y = elapsed * 1.4;
      if (W.skyPlane) {
        const ang = elapsed * 0.18;
        W.skyPlane.position.set(16 + Math.cos(ang) * 44, 28 + Math.sin(elapsed * 0.5) * 1.5, -10 + Math.sin(ang) * 44);
        W.skyPlane.rotation.y = -ang;
        W.skyPlane.rotation.z = 0.22;
      }
      if (W.petals) {
        const pos = W.petals.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          let y = pos.getY(i) - dt * 0.65;
          let x = pos.getX(i) + Math.sin(elapsed + i) * dt * 0.35;
          if (y < 0.2) { y = 12.0; x = -42 + Math.random() * 88; }
          pos.setXY(i, x, y);
        }
        pos.needsUpdate = true;
      }
    };

    W.drawMiniMap = function (ctx, cw, ch, toMapX, toMapY) {
      ctx.fillStyle = '#8cc474';
      ctx.fillRect(0, 0, cw, ch);

      // Roads
      ctx.fillStyle = '#5a6069';
      ctx.fillRect(toMapX(-4.3), toMapY(-44), toMapX(4.3) - toMapX(-4.3), toMapY(38) - toMapY(-44));
      ctx.fillRect(toMapX(-38), toMapY(4.6), toMapX(34) - toMapX(-38), toMapY(11.4) - toMapY(4.6));

      // Airport Runway & Terminal
      ctx.fillStyle = '#454a52';
      ctx.fillRect(toMapX(39), toMapY(-34), toMapX(49) - toMapX(39), toMapY(36) - toMapY(-34));
      ctx.fillStyle = '#1e3a5f';
      ctx.fillRect(toMapX(23), toMapY(17.5), toMapX(35) - toMapX(23), toMapY(31.5) - toMapY(17.5));

      // Pocket Park
      ctx.fillStyle = '#52b788';
      ctx.fillRect(toMapX(17.5), toMapY(-17.5), toMapX(32) - toMapX(17.5), toMapY(-4) - toMapY(-17.5));

      // West Plaza
      ctx.fillStyle = '#e0d6c3';
      ctx.beginPath();
      ctx.arc(toMapX(-28), toMapY(-1.5), 11, 0, Math.PI * 2);
      ctx.fill();

      // School, Ramen, Boutique, House, Shinkansen
      ctx.fillStyle = '#b84a46';
      ctx.fillRect(toMapX(-9), toMapY(-46), toMapX(9) - toMapX(-9), toMapY(-38) - toMapY(-46));
      ctx.fillStyle = '#d97724';
      ctx.fillRect(toMapX(8), toMapY(-9), toMapX(14.5) - toMapX(8), toMapY(-2) - toMapY(-9));
      ctx.fillStyle = '#db5485';
      ctx.fillRect(toMapX(-12), toMapY(-13), toMapX(-6.5) - toMapX(-12), toMapY(-8.5) - toMapY(-13));
      ctx.fillStyle = '#e05780';
      ctx.fillRect(toMapX(-15.5), toMapY(-5), toMapX(-8) - toMapX(-15.5), toMapY(2) - toMapY(-5));
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(toMapX(-8), toMapY(36), toMapX(8) - toMapX(-8), toMapY(41) - toMapY(36));

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏫 SCHOOL', toMapX(0), toMapY(-40.5));
      ctx.fillText('🛝 PARK', toMapX(24.8), toMapY(-9.5));
      ctx.fillText('✈️ AIRPORT', toMapX(29), toMapY(25.5));
      ctx.fillText('🚅 KYOTO', toMapX(0), toMapY(39.5));
      ctx.fillText('🏡', toMapX(-11.8), toMapY(-0.5));
      ctx.fillText('🍜', toMapX(11.2), toMapY(-4.5));
    };

    return W;
  }

  LS.registerWorld('tokyo', { build: buildTokyoWorld });
})(window.LailaSalma);
