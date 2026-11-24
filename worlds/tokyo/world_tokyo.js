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
      slideStartPos: new THREE.Vector3(7.8, 1.55, 13.6),
      slideEndPos: new THREE.Vector3(7.8, 0.12, 16.2),
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
          new THREE.BoxGeometry(3.8, 0.85, 0.18),
          new THREE.MeshBasicMaterial({
            map: LS.createSignTexture("🏡 LAILA & SALMA'S ROOM", {
              bg: '#fff0f6', border: '#d95d88', color: '#6b2144', font: 'bold 30px sans-serif'
            })
          })
        );
        sign.position.set(-1.4, 2.75, 3.2);
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
      addCollider(x, z, 4.3, 4.4);
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

    // 1. Sky, Ground, Road, Sidewalks, Distant Hills, Mt. Fuji & Tokyo Tower
    safeRun('environment', () => {
      const skyGeo = new THREE.SphereGeometry(180, 24, 16);
      const skyMat = new THREE.MeshBasicMaterial({
        map: LS.createSkyTexture(LS.state.timeMode, 'tokyo'),
        side: THREE.BackSide
      });
      W.skyMesh = new THREE.Mesh(skyGeo, skyMat);
      worldGroup.add(W.skyMesh);

      const ground = new THREE.Mesh(new THREE.PlaneGeometry(250, 250), LS.makeToonMat(0x7ab862));
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      worldGroup.add(ground);

      const road = new THREE.Mesh(
        new THREE.PlaneGeometry(8.6, 78),
        new THREE.MeshLambertMaterial({ map: LS.createRoadTexture('tokyo') })
      );
      road.rotation.x = -Math.PI / 2;
      road.position.set(0, 0.02, -6);
      road.receiveShadow = true;
      worldGroup.add(road);

      const swMat = LS.makeToonMat(0xd6cfc2);
      [-5.3, 5.3].forEach(sx => {
        const sw = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.14, 78), swMat);
        sw.position.set(sx, 0.07, -6);
        sw.receiveShadow = true;
        worldGroup.add(sw);
      });

      // Distant hills
      const hillMat = LS.makeToonMat(0x5e9c68);
      const hillData = [
        [-45, -72, 34, 18], [0, -82, 42, 24], [48, -70, 36, 19],
        [-70, -10, 32, 16], [70, -12, 34, 17]
      ];
      hillData.forEach(h => {
        const hill = new THREE.Mesh(new THREE.SphereGeometry(h[2], 16, 12), hillMat);
        hill.scale.set(1.4, h[3] / h[2], 1.0);
        hill.position.set(h[0], -2, h[1]);
        worldGroup.add(hill);
      });

      // Distant Mt. Fuji (snow strictly restricted to far distant peak!)
      const fujiG = new THREE.Group();
      fujiG.position.set(-56, 0, -108);
      const fujiBase = new THREE.Mesh(new THREE.ConeGeometry(42, 36, 20), LS.makeToonMat(0x557194));
      fujiBase.position.y = 18;
      fujiG.add(fujiBase);
      const fujiCap = new THREE.Mesh(new THREE.ConeGeometry(13.5, 11.8, 20), LS.makeToonMat(0xf4f7fb));
      fujiCap.position.y = 30.2;
      fujiG.add(fujiCap);
      worldGroup.add(fujiG);

      // Iconic Tokyo Tower on distant skyline (X=38, Z=-74)
      const tower = new THREE.Group();
      tower.position.set(38, 0, -74);
      const redMat = LS.makeEmissiveMat(0xe63946, 0xd62828, 0.28);
      const whiteMat = LS.makeEmissiveMat(0xf8f9fa, 0xfff3d6, 0.22);
      const segs = [
        [6.0, 3.8, 12, 6, redMat],
        [3.8, 2.5, 10, 17, whiteMat],
        [2.5, 1.5, 10, 27, redMat],
        [1.5, 0.8, 8, 36, whiteMat],
        [0.8, 0.25, 10, 45, redMat]
      ];
      segs.forEach(s => {
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

    // 2. Neighborhood Houses
    safeRun('houses', () => {
      buildHouse(-11.8, 12, Math.PI / 2, '#f5ebd6', '#46566b');
      buildHouse(-11.8, -1.5, Math.PI / 2, '#ffe8ef', '#c94c79', { clubhouseSign: true, doorColor: 0xe05780 });
      buildHouse(-11.8, -19.5, Math.PI / 2, '#eef2e6', '#3f5954');
      buildHouse(11.8, 10, -Math.PI / 2, '#f7ece0', '#4f5a6e');
      buildHouse(11.8, -19, -Math.PI / 2, '#f2e6d0', '#5e4959');
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

      const holder = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.18, 8), LS.makeToonMat(0x7c4a26));
      holder.position.set(0.28, 0.92, -0.58);
      tableG.add(holder);

      const soyBody = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.16, 8), LS.makeToonMat(0x2b1a12));
      soyBody.position.set(0.3, 0.91, -0.34);
      tableG.add(soyBody);
      const soyCap = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.04, 0.05, 8), LS.makeToonMat(0xd63636));
      soyCap.position.set(0.3, 1.01, -0.34);
      tableG.add(soyCap);

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

      W.zones.push({
        id: 'ramen',
        label: 'Order at Ichiban Ramen',
        pos: new THREE.Vector3(6.6, 0, -5.5),
        radius: 3.6
      });
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

      const stripeColors = [0xff8fab, 0xffffff, 0xffd166, 0xffffff, 0xff8fab];
      stripeColors.forEach((col, i) => {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.78), LS.makeToonMat(col));
        panel.position.set(2.05, 2.25, -1.56 + i * 0.78);
        panel.rotation.z = -0.22;
        g.add(panel);
      });

      const counter = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.95, 3.4), LS.makeToonMat(0xc68b59));
      counter.position.set(1.95, 0.48, 0);
      counter.castShadow = true;
      g.add(counter);

      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.14, 0.65, 8), LS.makeToonMat(0x7c5333));
      stand.position.set(1.95, 1.25, -0.8);
      g.add(stand);
      const displayHat = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.04, 14), LS.makeToonMat(0xfacc15));
      displayHat.position.set(1.95, 1.56, -0.8);
      g.add(displayHat);
      const displayCrown = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), LS.makeToonMat(0xfacc15));
      displayCrown.position.set(1.95, 1.56, -0.8);
      g.add(displayCrown);

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

      W.zones.push({
        id: 'shop',
        label: 'Browse Tokyo Outfits & Hats',
        pos: new THREE.Vector3(-5.6, 0, -10.8),
        radius: 3.4
      });
    });

    // 5. Sakura Elementary School
    safeRun('school', () => {
      const g = new THREE.Group();
      g.position.set(0, 0, -32);

      const wallMat = LS.makeToonMat(0xf7efe0);
      const roofMat = LS.makeToonMat(0xffffff, { map: LS.createRoofTileTexture('#8a3e3b') });
      const winMat = LS.makeEmissiveMat(0x8ec9ed, 0xffe4a0, 0.25);

      const main = new THREE.Mesh(new THREE.BoxGeometry(16, 6.4, 7.5), wallMat);
      main.position.y = 3.2;
      main.castShadow = true;
      main.receiveShadow = true;
      g.add(main);

      const roof = new THREE.Mesh(new THREE.BoxGeometry(17.2, 1.1, 8.6), roofMat);
      roof.position.y = 6.9;
      g.add(roof);

      const clock = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.2, 16), LS.makeToonMat(0xffffff));
      clock.rotation.x = Math.PI / 2;
      clock.position.set(0, 5.2, 3.82);
      g.add(clock);

      for (let x = -5.5; x <= 5.5; x += 2.75) {
        if (Math.abs(x) < 1) continue;
        const w1 = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.3, 0.14), winMat);
        w1.position.set(x, 2.0, 3.78);
        g.add(w1);
        const w2 = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.3, 0.14), winMat);
        w2.position.set(x, 4.3, 3.78);
        g.add(w2);
      }

      const entrance = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 0.3), LS.makeToonMat(0x7c5333));
      entrance.position.set(0, 1.3, 3.76);
      g.add(entrance);

      [-3.4, 3.4].forEach(px => {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.4, 0.8), LS.makeToonMat(0xd4ccb8));
        pillar.position.set(px, 1.2, 7.5);
        pillar.castShadow = true;
        g.add(pillar);
      });

      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(4.8, 0.9, 0.18),
        new THREE.MeshBasicMaterial({
          map: LS.createSignTexture('🏫 SAKURA ELEMENTARY', {
            bg: '#fdf6e7', border: '#8a3e3b', color: '#3d2c1e', font: 'bold 34px sans-serif'
          })
        })
      );
      sign.position.set(0, 3.1, 3.92);
      g.add(sign);

      worldGroup.add(g);
      addCollider(0, -32, 8.2, 4.0);

      W.zones.push({
        id: 'school',
        label: 'Enter Sakura Elementary Quiz',
        pos: new THREE.Vector3(0, 0, -24.5),
        radius: 4.0
      });
    });

    // 6. Pocket Park (Slide, Swing, Hopscotch)
    safeRun('pocket_park', () => {
      const pad = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 7.6), LS.makeToonMat(0x95d47a));
      pad.rotation.x = -Math.PI / 2;
      pad.position.set(8.2, 0.015, 13.8);
      pad.receiveShadow = true;
      worldGroup.add(pad);

      // Slide
      const slideG = new THREE.Group();
      slideG.position.set(7.8, 0, 14.8);
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
      addCollider(7.8, 14.8, 0.65, 1.45);
      W.zones.push({ id: 'park_slide', label: 'Ride the Park Slide', pos: new THREE.Vector3(7.2, 0, 14.5), radius: 2.3 });

      // Swing
      const swingG = new THREE.Group();
      swingG.position.set(8.8, 0, 11.4);
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
      addCollider(8.8, 11.4, 0.75, 1.15);
      W.zones.push({ id: 'park_swing', label: 'Swing Together on the Swing', pos: new THREE.Vector3(8.0, 0, 11.4), radius: 2.3 });

      // Hopscotch
      const hopC = document.createElement('canvas');
      hopC.width = 256; hopC.height = 512;
      const hctx = hopC.getContext('2d');
      hctx.strokeStyle = '#fff9eb';
      hctx.lineWidth = 8;
      hctx.fillStyle = '#fff9eb';
      hctx.font = 'bold 42px sans-serif';
      hctx.textAlign = 'center';
      [[64, 410, '1'], [192, 410, '2'], [128, 310, '3'], [64, 210, '4'], [192, 210, '5'], [128, 110, '6']].forEach(c => {
        hctx.strokeRect(c[0] - 46, c[1] - 46, 92, 92);
        hctx.fillText(c[2], c[0], c[1] + 15);
      });
      const hopMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 3.0),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(hopC), transparent: true })
      );
      hopMesh.rotation.x = -Math.PI / 2;
      hopMesh.position.set(6.2, 0.04, 15.0);
      worldGroup.add(hopMesh);
      W.zones.push({ id: 'park_hopscotch', label: 'Play Hopscotch (+20c)', pos: new THREE.Vector3(6.2, 0, 15.0), radius: 2.2 });
    });

    // 7. Street Details, Machines, Lamps, Trees & Clubhouse Zone
    safeRun('street_details', () => {
      // Gachapon machine
      const vm = new THREE.Group();
      vm.position.set(-5.8, 0, -15.6);
      const vmBody = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.0, 0.78), LS.makeToonMat(0x2563eb));
      vmBody.position.y = 1.0;
      vmBody.castShadow = true;
      vm.add(vmBody);
      const vmGlow = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.95, 0.08), new THREE.MeshBasicMaterial({ color: 0xffe082 }));
      vmGlow.position.set(0, 1.32, 0.38);
      vm.add(vmGlow);
      const vmAccent = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.32, 0.8), LS.makeToonMat(0xf43f5e));
      vmAccent.position.y = 0.25;
      vm.add(vmAccent);
      worldGroup.add(vm);
      addCollider(-5.8, -15.6, 0.7, 0.6);
      W.zones.push({ id: 'gachapon', label: 'Spin Capsule Toy Machine (15c)', pos: new THREE.Vector3(-4.5, 0, -15.6), radius: 2.8 });

      // Drink vending machine
      const drinkVm = new THREE.Group();
      drinkVm.position.set(-5.8, 0, -13.6);
      const dBody = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.95, 0.74), LS.makeToonMat(0xef4444));
      dBody.position.y = 0.98;
      dBody.castShadow = true;
      drinkVm.add(dBody);
      const dWindow = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.86, 0.08), new THREE.MeshBasicMaterial({ color: 0xa7f3d0 }));
      dWindow.position.set(0, 1.3, 0.36);
      drinkVm.add(dWindow);
      worldGroup.add(drinkVm);
      addCollider(-5.8, -13.6, 0.68, 0.58);
      W.zones.push({ id: 'drink_vending', label: 'Japanese Drink & Snack Machine', pos: new THREE.Vector3(-4.5, 0, -13.6), radius: 2.6 });

      // Clubhouse zone
      W.zones.push({ id: 'clubhouse', label: "Enter Laila & Salma's Room", pos: new THREE.Vector3(-6.2, 0, -1.5), radius: 3.1 });

      // Fetch Ball
      const ballMesh = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), LS.makeToonMat(0xffbe0b));
      ballMesh.position.set(-2.5, 0.14, -5.2);
      ballMesh.visible = false;
      worldGroup.add(ballMesh);
      W.mochiBall = ballMesh;

      // Bike
      const bike = new THREE.Group();
      bike.position.set(-4.8, 0, 5.5);
      bike.rotation.y = 0.25;
      const wheelMat = LS.makeToonMat(0x2c2c2c);
      [-0.52, 0.52].forEach(wz => {
        const w = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.045, 8, 16), wheelMat);
        w.position.set(0, 0.34, wz);
        w.rotation.y = Math.PI / 2;
        bike.add(w);
      });
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.05), LS.makeToonMat(0x52a69a));
      frame.position.set(0, 0.55, 0);
      bike.add(frame);
      const basket = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.24, 0.26), LS.makeToonMat(0x9a6d40));
      basket.position.set(0, 0.78, -0.52);
      bike.add(basket);
      worldGroup.add(bike);

      // Utility poles & warm emissive Sakura street lamps
      const poleMat = LS.makeToonMat(0x5a5650);
      const lampBulb = new THREE.MeshBasicMaterial({ color: 0xffe4a0 });
      const polePositions = [[-5.6, 12], [-5.6, -6], [-5.6, -22], [5.6, 4], [5.6, -16]];
      polePositions.forEach(p => {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 8.2, 8), poleMat);
        pole.position.set(p[0], 4.1, p[1]);
        pole.castShadow = true;
        worldGroup.add(pole);
        const bar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 0.12), poleMat);
        bar.position.set(p[0], 7.4, p[1]);
        worldGroup.add(bar);
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), lampBulb);
        lamp.position.set(p[0] + (p[0] < 0 ? 0.5 : -0.5), 4.6, p[1]);
        worldGroup.add(lamp);
      });

      const lineMat = new THREE.LineBasicMaterial({ color: 0x2f2f35 });
      for (let i = 0; i < 2; i++) {
        const p1 = new THREE.Vector3(-5.6, 7.4, polePositions[i][1]);
        const p2 = new THREE.Vector3(-5.6, 7.4, polePositions[i + 1][1]);
        const mid = p1.clone().lerp(p2, 0.5);
        mid.y -= 0.75;
        const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
        const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(12));
        worldGroup.add(new THREE.Line(geo, lineMat));
      }

      // Trees
      buildTree(-7.2, 5.2, false, 1.15);
      buildTree(7.2, 2.8, true, 1.15);
      buildTree(-7.4, -7.2, true, 1.0);
      buildTree(7.6, -13.2, false, 1.1);
      buildTree(-6.5, -26.0, true, 1.25);
      buildTree(6.5, -26.0, true, 1.25);
    });

    // 8. Tokyo Shinkansen Bullet Train Station (South end: X=0, Z=25.5)
    safeRun('shinkansen_station', () => {
      const g = new THREE.Group();
      g.position.set(0, 0, 25.5);

      const deckMat = LS.makeToonMat(0xd6d3cc);
      const navyMat = LS.makeToonMat(0x1d3557);
      const glassMat = LS.makeEmissiveMat(0x90e0ef, 0x48cae4, 0.35);

      // Platform
      const plat = new THREE.Mesh(new THREE.BoxGeometry(14.5, 0.55, 4.2), deckMat);
      plat.position.set(0, 0.27, 0);
      plat.receiveShadow = true;
      g.add(plat);

      // Yellow tactile safety stripe
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(14.0, 0.04, 0.28), LS.makeToonMat(0xfacc15));
      stripe.position.set(0, 0.56, 1.6);
      g.add(stripe);

      // Sleek canopy pillars (wide-spaced so center sightline is always open) & roof
      [-6.0, -3.2, 3.2, 6.0].forEach(px => {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 3.8, 8), navyMat);
        col.position.set(px, 2.2, 0);
        col.castShadow = true;
        g.add(col);
      });
      const roof = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.28, 4.8), navyMat);
      roof.position.set(0, 4.15, 0);
      roof.castShadow = true;
      g.add(roof);

      const archLight = new THREE.Mesh(new THREE.BoxGeometry(13.8, 0.14, 0.5), new THREE.MeshBasicMaterial({ color: 0xfff3d6 }));
      archLight.position.set(0, 3.96, -1.2);
      g.add(archLight);

      // Ticket Gate Sign
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

      // Elevated track behind platform
      const track = new THREE.Mesh(new THREE.BoxGeometry(84, 0.4, 2.8), LS.makeToonMat(0x6c757d));
      track.position.set(0, 0.3, 3.6);
      g.add(track);

      // Sleek N700S Shinkansen Bullet Train!
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
      // Aerodynamic nose cones on both ends
      [-7.8, 7.8].forEach(nx => {
        const nose = new THREE.Mesh(new THREE.ConeGeometry(0.95, 2.5, 12), LS.makeToonMat(0xf8fafc));
        nose.rotation.z = nx > 0 ? -Math.PI / 2 : Math.PI / 2;
        nose.scale.set(0.85, 1.0, 0.95);
        nose.position.set(nx, -0.05, 0);
        train.add(nose);
        const headlight = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfff3b0 }));
        headlight.position.set(nx + (nx > 0 ? 0.55 : -0.55), -0.15, -0.45);
        train.add(headlight);
      });
      g.add(train);
      W.shinkansenTrain = train;

      worldGroup.add(g);
      addCollider(0, 26.3, 7.6, 2.2);

      W.zones.push({
        id: 'shinkansen_station',
        label: 'Board Shinkansen to Kyoto 🚅',
        pos: new THREE.Vector3(0, 0, 22.0),
        radius: 4.0
      });
    });

    // 9. 5 Hidden Tokyo Cats
    safeRun('hidden_cats', () => {
      const catDefs = [
        { id: 'cat_mikan', name: 'Mikan (Orange Tabby)', pos: new THREE.Vector3(5.4, 0, 6.2), color: 0xe89643, accent: 0xfff3d6 },
        { id: 'cat_kuro', name: 'Kuro (Midnight Cat)', pos: new THREE.Vector3(-6.4, 0, 12.2), color: 0x2a2d36, accent: 0xffd166 },
        { id: 'cat_yuki', name: 'Yuki (Snowball)', pos: new THREE.Vector3(-7.0, 0, -19.5), color: 0xfaf7f2, accent: 0xffa6c1 },
        { id: 'cat_sakura', name: 'Sakura (Calico)', pos: new THREE.Vector3(7.6, 0, -15.2), color: 0xf4b678, accent: 0x4a3525 },
        { id: 'cat_tama', name: 'Tama (Schoolyard Cat)', pos: new THREE.Vector3(5.6, 0, -26.8), color: 0x8b95a5, accent: 0xffffff }
      ];

      catDefs.forEach(cd => {
        const alreadyFound = LS.state.foundCats.includes(cd.id);
        const g = new THREE.Group();
        g.position.copy(cd.pos);
        const fur = LS.makeToonMat(cd.color);
        const acc = LS.makeToonMat(cd.accent);

        const body = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), fur);
        body.scale.set(1.25, 0.78, 0.95);
        body.position.y = 0.2;
        body.castShadow = true;
        g.add(body);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), fur);
        head.position.set(0.22, 0.34, 0);
        g.add(head);
        [-0.08, 0.08].forEach(ez => {
          const ear = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.13, 5), acc);
          ear.position.set(0.24, 0.5, ez);
          g.add(ear);
        });
        const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.34, 6), fur);
        tail.position.set(-0.28, 0.34, 0);
        tail.rotation.z = 0.65;
        g.add(tail);

        const mc = document.createElement('canvas');
        mc.width = 128; mc.height = 128;
        const mctx = mc.getContext('2d');
        mctx.fillStyle = 'rgba(255, 248, 225, 0.95)';
        mctx.beginPath(); mctx.arc(64, 64, 52, 0, Math.PI * 2); mctx.fill();
        mctx.strokeStyle = '#e07a34'; mctx.lineWidth = 8; mctx.stroke();
        mctx.font = 'bold 54px sans-serif'; mctx.textAlign = 'center'; mctx.fillText('🐾', 64, 82);
        const marker = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(mc), transparent: true }));
        marker.scale.set(0.75, 0.75, 1);
        marker.position.set(0.1, 1.05, 0);
        marker.visible = !alreadyFound;
        g.add(marker);

        worldGroup.add(g);
        W.hiddenAnimals.push({ id: cd.id, kind: 'cat', name: cd.name, mesh: g, marker, tail, found: alreadyFound });

        if (!alreadyFound) {
          W.zones.push({ id: 'animal:' + cd.id, label: 'Pet ' + cd.name + ' (+35c)', pos: cd.pos.clone(), radius: 2.3 });
        }
      });
    });

    // 10. Drifting Sakura Petals
    safeRun('petals', () => {
      const pCount = 90;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        pPos[i * 3] = (Math.random() - 0.5) * 34;
        pPos[i * 3 + 1] = 1 + Math.random() * 11;
        pPos[i * 3 + 2] = -32 + Math.random() * 54;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({ color: 0xffc0d6, size: 0.18, transparent: true, opacity: 0.9 });
      W.petals = new THREE.Points(pGeo, pMat);
      worldGroup.add(W.petals);
    });

    // 11. Tokyo NPCs
    safeRun('npcs', () => {
      LS.spawnWorldNPCs(worldGroup, [
        {
          name: 'Yui',
          pos: new THREE.Vector3(-3.8, 0, 4.5),
          patrol: { axis: 'z', center: 4.5, range: 4.0, speed: 0.9 },
          line: 'Hi Laila & Salma! Did you see the Shinkansen station down south? It goes straight to Kyoto!',
          char: { scale: 0.86, hairColor: 0x5c3724, topColor: 0xffffff, bottomColor: 0x2c4a7c, sailorCollar: true, backpackColor: 0xe67e8a, longHair: true }
        },
        {
          name: 'Haruto',
          pos: new THREE.Vector3(3.8, 0, 8.5),
          patrol: { axis: 'z', center: 8.5, range: 3.8, speed: 1.05 },
          line: 'Hey Laila & Salma! 5 neighborhood cats are hiding around Tokyo!',
          char: { scale: 0.88, hairColor: 0x242429, topColor: 0x34527a, bottomColor: 0x2b3342, pants: true, backpackColor: 0x22262e }
        },
        {
          name: 'Ojii-san',
          pos: new THREE.Vector3(-4.2, 0, -5.5),
          patrol: { axis: 'z', center: -5.5, range: 2.5, speed: 0.55 },
          line: 'Good afternoon, Laila & Salma! Press V anytime for a sister high-five!',
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
          pos: new THREE.Vector3(-2.6, 0, -23.5),
          line: 'Hello Laila & Salma! Step up anytime for Laila or Salma quiz fun!',
          char: { scale: 0.98, hairColor: 0x382820, topColor: 0xe8d5c4, bottomColor: 0x4a5b70, hairBun: true, faceOpts: { glasses: true } }
        },
        {
          name: 'Mina',
          pos: new THREE.Vector3(-6.4, 0, -10.8),
          baseRot: Math.PI / 2,
          waveOnNear: true,
          line: 'Welcome to Tokyo Boutique! Outfits you unlock here work in Kyoto too!',
          char: { scale: 0.9, hairColor: 0x6b3e2e, topColor: 0xffb3c6, bottomColor: 0x723d46, hatType: 'beret', hatColor: 0xd95d88 }
        }
      ]);
    });

    // Dining Config for Ichiban Ramen
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
      if (pz > 17) return 'Tokyo Shinkansen';
      if (pz < -21) return 'Sakura Elementary';
      if (px > 4 && Math.abs(pz + 5.5) < 6) return 'Ichiban Ramen';
      if (px > 4 && pz > 9) return 'Pocket Park';
      if (px < -4 && Math.abs(pz + 10.8) < 5) return 'Tokyo Boutique';
      if (px < -4 && Math.abs(pz + 1.5) < 4) return "Sisters' Room";
      return 'Tokyo Main Street';
    };

    W.update = function (dt, elapsed) {
      W.norenPanels.forEach(n => {
        n.mesh.rotation.z = Math.sin(elapsed * 2.1 + n.phase) * 0.08;
      });
      W.hiddenAnimals.forEach((cat, idx) => {
        if (cat.tail) cat.tail.rotation.x = Math.sin(elapsed * 3.2 + idx) * 0.25;
        if (cat.marker && !cat.found) {
          cat.marker.position.y = 1.02 + Math.sin(elapsed * 3.0 + idx) * 0.12;
        }
      });
      if (W.swingPivot) {
        if (LS.runtime.parkActivity && LS.runtime.parkActivity.type === 'swing') {
          W.swingPivot.rotation.x = Math.sin(elapsed * 4.5) * 0.58;
        } else {
          W.swingPivot.rotation.x *= 0.9;
        }
      }
      if (W.shinkansenTrain) {
        // Gentle idle breathe at platform with occasional glide
        W.shinkansenTrain.position.x = Math.sin(elapsed * 0.22) * 3.2;
      }
      if (W.petals) {
        const pos = W.petals.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          let y = pos.getY(i) - dt * 0.65;
          let x = pos.getX(i) + Math.sin(elapsed + i) * dt * 0.35;
          if (y < 0.2) {
            y = 11.5;
            x = (Math.random() - 0.5) * 34;
          }
          pos.setXY(i, x, y);
        }
        pos.needsUpdate = true;
      }
    };

    W.drawMiniMap = function (ctx, cw, ch, toMapX, toMapY) {
      ctx.fillStyle = '#8cc474';
      ctx.fillRect(0, 0, cw, ch);

      ctx.fillStyle = '#dcd5c7';
      ctx.fillRect(toMapX(-6.3), 0, toMapX(6.3) - toMapX(-6.3), ch);
      ctx.fillStyle = '#5a6069';
      ctx.fillRect(toMapX(-4.3), 0, toMapX(4.3) - toMapX(-4.3), ch);

      ctx.strokeStyle = '#f7e9c4';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(toMapX(0), 0);
      ctx.lineTo(toMapX(0), ch);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#c9bfa8';
      ctx.strokeStyle = '#7a6852';
      ctx.lineWidth = 1;
      [[-11.8, 12], [-11.8, -1.5], [-11.8, -19.5], [11.8, 10], [11.8, -19]].forEach(h => {
        const hx = toMapX(h[0] - 3.2), hy = toMapY(h[1] - 3.6);
        ctx.fillRect(hx, hy, toMapX(h[0] + 3.2) - hx, toMapY(h[1] + 3.6) - hy);
        ctx.strokeRect(hx, hy, toMapX(h[0] + 3.2) - hx, toMapY(h[1] + 3.6) - hy);
      });

      ctx.font = 'bold 8.5px sans-serif';
      ctx.textAlign = 'center';

      // School
      ctx.fillStyle = '#b84a46';
      ctx.fillRect(toMapX(-8), toMapY(-35.5), toMapX(8) - toMapX(-8), toMapY(-28.2) - toMapY(-35.5));
      ctx.fillStyle = '#fff8eb';
      ctx.fillText('🏫 SCHOOL', toMapX(0), toMapY(-30.6));

      // Ramen
      ctx.fillStyle = '#d97724';
      ctx.fillRect(toMapX(7.6), toMapY(-9.1), toMapX(14.6) - toMapX(7.6), toMapY(-1.9) - toMapY(-9.1));
      ctx.fillStyle = '#fff8eb';
      ctx.fillText('🍜 RAMEN', toMapX(11.1), toMapY(-4.8));

      // Shop
      ctx.fillStyle = '#db5485';
      ctx.fillRect(toMapX(-10.5), toMapY(-13.0), toMapX(-6.7) - toMapX(-10.5), toMapY(-8.6) - toMapY(-13.0));
      ctx.fillStyle = '#fff8eb';
      ctx.fillText('🎀 SHOP', toMapX(-8.6), toMapY(-10.2));

      // Shinkansen Station
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(toMapX(-7.5), toMapY(20.5), toMapX(7.5) - toMapX(-7.5), toMapY(25.2) - toMapY(20.5));
      ctx.fillStyle = '#ffffff';
      ctx.fillText('🚅 KYOTO', toMapX(0), toMapY(23.6));
    };

    return W;
  }

  LS.registerWorld('tokyo', { build: buildTokyoWorld });
})(window.LailaSalma);
