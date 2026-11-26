window.LailaSalma = window.LailaSalma || {};

(function (LS) {
  // Shared helper: Build a clean 4-walled sunlit Studio Ghibli room shell (0 extra lights)
  function buildRoomShell(worldGroup, w, d, h, floorHex, wallHex, trimHex) {
    const floorMat = LS.makeSurfaceMat(LS.createCedarPlankTexture(), { color: floorHex || 0xe3c396 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    worldGroup.add(floor);

    const wallMat = LS.makeToonMat(0xffffff, { map: LS.createPlasterTexture(wallHex || '#fbf2e3') });
    const trimMat = LS.makeToonMat(trimHex || 0x8c5e3c);
    const ceilMat = LS.makeToonMat(0xfffaf0);

    const bw = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, h, 0.3), wallMat);
    bw.position.set(0, h / 2, -d / 2); worldGroup.add(bw);
    const fw = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, h, 0.3), wallMat);
    fw.position.set(0, h / 2, d / 2); worldGroup.add(fw);
    const lw = new THREE.Mesh(new THREE.BoxGeometry(0.3, h, d + 0.3), wallMat);
    lw.position.set(-w / 2, h / 2, 0); worldGroup.add(lw);
    const rw = new THREE.Mesh(new THREE.BoxGeometry(0.3, h, d + 0.3), wallMat);
    rw.position.set(w / 2, h / 2, 0); worldGroup.add(rw);

    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(w, d), ceilMat);
    ceil.rotation.x = Math.PI / 2; ceil.position.y = h - 0.05; worldGroup.add(ceil);

    // Baseboard trim
    const bbMat = LS.makeToonMat(0xfff8eb);
    [[0, -d / 2 + 0.16, w, 0.12], [0, d / 2 - 0.16, w, 0.12]].forEach(b => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(b[2], 0.22, b[3]), bbMat);
      m.position.set(b[0], 0.11, b[1]); worldGroup.add(m);
    });
    [[-w / 2 + 0.16, 0, 0.12, d], [w / 2 - 0.16, 0, 0.12, d]].forEach(b => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(b[2], 0.22, b[3]), bbMat);
      m.position.set(b[0], 0.11, b[1]); worldGroup.add(m);
    });

    // Front Exit Door + Mat back to Gray Nissan Qashqai!
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.85, 2.6, 0.22), trimMat);
    door.position.set(0, 1.3, d / 2 - 0.15); worldGroup.add(door);
    const mat = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.04, 1.15), LS.makeToonMat(0x4b5563));
    mat.position.set(0, 0.02, d / 2 - 0.9); worldGroup.add(mat);

    return { trimMat, wallMat };
  }

  // Helper: Animated cozy 3D TV screen on a media stand
  function createAnimatedTV(worldGroup, x, y, z, rotY, mode) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = rotY;
    const stand = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.68, 0.72), LS.makeToonMat(0x7c5032));
    stand.position.y = 0.34; stand.castShadow = true; g.add(stand);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.45, 1.48, 0.16), LS.makeToonMat(0x1f242c));
    frame.position.set(0, 1.56, 0); g.add(frame);

    const c = document.createElement('canvas');
    c.width = 256; c.height = 152;
    const ctx = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c);
    const screenMat = new THREE.MeshBasicMaterial({ map: tex });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.24, 1.28), screenMat);
    screen.position.set(0, 1.56, 0.095); g.add(screen);
    worldGroup.add(g);

    return {
      canvas: c, ctx, mat: screenMat, lastFrame: -1, mode: mode || 'show',
      update: function (elapsed) {
        const f = Math.floor(elapsed * 10);
        if (f === this.lastFrame) return;
        this.lastFrame = f;
        const gGrad = ctx.createLinearGradient(0, 0, 0, 152);
        if (this.mode === 'sports') {
          gGrad.addColorStop(0, '#38a3e8'); gGrad.addColorStop(0.55, '#8ce0ff'); gGrad.addColorStop(1, '#3fa34d');
          ctx.fillStyle = gGrad; ctx.fillRect(0, 0, 256, 152);
          ctx.fillStyle = '#ffffff'; ctx.fillRect(16, 108, 224, 4);
          const bx = 42 + ((elapsed * 55) % 170);
          const by = 98 - Math.abs(Math.sin(elapsed * 4.5)) * 28;
          ctx.beginPath(); ctx.arc(bx, by, 10, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#1f2937'; ctx.font = 'bold 16px sans-serif'; ctx.fillText('⚽ LIVE', 18, 28);
        } else {
          gGrad.addColorStop(0, '#ffafcc'); gGrad.addColorStop(0.6, '#fde4cf'); gGrad.addColorStop(1, '#95d5b2');
          ctx.fillStyle = gGrad; ctx.fillRect(0, 0, 256, 152);
          ctx.fillStyle = '#fffdf5';
          const cx = ((elapsed * 22) % 300) - 30;
          ctx.beginPath(); ctx.arc(cx, 48, 20, 0, Math.PI * 2); ctx.arc(cx + 22, 42, 24, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#e07a5f'; ctx.font = 'bold 24px sans-serif';
          ctx.fillText('🌸 🏡 ✨', 76, 104 + Math.sin(elapsed * 3) * 8);
        }
        screenMat.map.needsUpdate = true;
      }
    };
  }

  // Helper: Cozy potted indoor plant
  function addIndoorPlant(worldGroup, x, z, potHex) {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.20, 0.44, 10), LS.makeToonMat(potHex || 0xc66b47));
    pot.position.set(x, 0.22, z); worldGroup.add(pot);
    const leafMat = LS.makeToonMat(0x3f8f47);
    [[0, 0.72, 0, 0.36], [0.18, 0.96, 0.12, 0.26], [-0.18, 0.92, -0.1, 0.26]].forEach(b => {
      const m = new THREE.Mesh(new THREE.DodecahedronGeometry(b[3], 1), leafMat);
      m.position.set(x + b[0], b[1], z + b[2]); worldGroup.add(m);
    });
  }

  // =========================================================================
  // DESTINATION 1: EATERY RESTAURANT (dest_eatery)
  // Rice, Molokhia & Chicken or Creamy Pasta!
  // =========================================================================
  function buildEatery(worldGroup) {
    const W = {
      id: 'dest_eatery',
      isInterior: true,
      colliders: [],
      zones: [],
      hiddenAnimals: [],
      diningConfigs: {
        eatery_dining: {
          lailaSeat: new THREE.Vector3(-1.15, 0.18, -1.0),
          salmaSeat: new THREE.Vector3(1.15, 0.18, -1.0),
          lailaDishPos: new THREE.Vector3(-0.62, 0.86, -1.0),
          salmaDishPos: new THREE.Vector3(0.62, 0.86, -1.0),
          oishiiPos: new THREE.Vector3(0, 1.85, -1.0),
          seatYaw: 0,
          camPos: new THREE.Vector3(0, 2.35, 3.0),
          camLook: new THREE.Vector3(0, 1.05, -1.0),
          caption: 'Yum at Eatery! 🍲🍗🍝',
          exitPos: new THREE.Vector3(0, 0, 2.0)
        }
      }
    };
    const addCol = (x, z, hw, hd) => W.colliders.push({ minX: x - hw, maxX: x + hw, minZ: z - hd, maxZ: z + hd });
    W.getGroundHeight = () => 0;

    const { trimMat } = buildRoomShell(worldGroup, 18, 14, 4.5, 0xdfb98a, '#fbf0dd', 0x7c4e2e);

    // Warm Eatery Signboard & Open Kitchen Pass Counter along North Wall!
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 1.05, 0.14),
      new THREE.MeshBasicMaterial({
        map: LS.createSignTexture('🍲 EATERY • MOLOKHIA, CHICKEN, RICE & PASTA 🍝', {
          bg: '#fff8ec', border: '#c97b36', color: '#4a2b14', font: 'bold 22px sans-serif', width: 640, height: 110
        })
      })
    );
    sign.position.set(0, 3.45, -6.8); worldGroup.add(sign);

    const counter = new THREE.Mesh(new THREE.BoxGeometry(10.5, 1.05, 1.3), LS.makeToonMat(0x8c5630));
    counter.position.set(0, 0.52, -5.7); counter.castShadow = true; worldGroup.add(counter);
    const cTop = new THREE.Mesh(new THREE.BoxGeometry(10.7, 0.12, 1.45), LS.makeToonMat(0xede0cc));
    cTop.position.set(0, 1.08, -5.7); worldGroup.add(cTop);
    // Copper molokhia pot & steaming pasta pot on counter
    const pot1 = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.30, 12), LS.makeToonMat(0xc86d28));
    pot1.position.set(-2.4, 1.28, -5.7); worldGroup.add(pot1);
    const pot2 = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.26, 0.28, 12), LS.makeToonMat(0xd9a773));
    pot2.position.set(2.4, 1.28, -5.7); worldGroup.add(pot2);
    addCol(0, -5.7, 5.4, 0.9);

    // Warm Pendant Lamps
    [-4.2, 0, 4.2].forEach(lx => {
      const shade = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.34, 10), LS.makeToonMat(0xe07a5f));
      shade.position.set(lx, 3.6, -1.0); worldGroup.add(shade);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), LS.makeEmissiveMat(0xfff5d6, 0xffd166, 0.9));
      bulb.position.set(lx, 3.42, -1.0); worldGroup.add(bulb);
    });

    // Main Family Dining Table in Center (matches eatery_dining!) + 2 Cozy Side Tables
    function addDiningTable(tx, tz, featured) {
      const tg = new THREE.Group();
      tg.position.set(tx, 0, tz);
      const top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 1.45), LS.makeToonMat(0xfff8ec));
      top.position.y = 0.80; top.castShadow = true; tg.add(top);
      const run = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.13, 1.48), LS.makeToonMat(featured ? 0x2d7a36 : 0xc97b36));
      run.position.y = 0.805; tg.add(run);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.24, 0.78, 10), trimMat);
      leg.position.y = 0.39; tg.add(leg);
      const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.18, 8), LS.makeEmissiveMat(0xfff4d0, 0xffcc66, 0.9));
      candle.position.set(0, 0.94, 0); tg.add(candle);
      [-1.18, 1.18].forEach(cx => {
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.48, 0.54), trimMat);
        seat.position.set(cx, 0.24, 0); tg.add(seat);
        const back = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.56, 0.52), trimMat);
        back.position.set(cx + (cx < 0 ? -0.24 : 0.24), 0.68, 0); tg.add(back);
      });
      worldGroup.add(tg);
      addCol(tx, tz, 1.25, 0.85);
    }
    addDiningTable(0, -1.0, true);
    addDiningTable(-5.6, 0.4, false);
    addDiningTable(5.6, 0.4, false);

    addIndoorPlant(worldGroup, -7.8, -5.8, 0xc66b47);
    addIndoorPlant(worldGroup, 7.8, -5.8, 0xc66b47);

    // Friendly Eatery Chef
    LS.spawnWorldNPCs(worldGroup, [{
      name: 'Chef Karim (Eatery)',
      line: 'Ahlan Laila & Salma! Fresh green Molokhia with rice & chicken, or creamy pasta today? 🍲🍝',
      pos: new THREE.Vector3(0, 0, -4.4),
      baseRot: 0,
      waveOnNear: true,
      char: { scale: 0.96, skinColor: 0xd9a27e, hairColor: 0x1f1916, topColor: 0xffffff, bottomColor: 0x2b2d42, pants: true, faceOpts: { mustache: true } }
    }]);

    W.zones.push({
      id: 'eatery_order',
      label: 'Order at Eatery (Molokhia, Rice & Chicken or Pasta) 🍲🍝',
      pos: new THREE.Vector3(0, 0, 1.1),
      radius: 2.8
    });
    W.zones.push({
      id: 'home_qashqai',
      label: 'Hop in Gray Nissan Qashqai (Drive Home or Elsewhere) 🚙',
      pos: new THREE.Vector3(0, 0, 5.7),
      radius: 2.3
    });

    W.getZoneLabel = () => 'Eatery Restaurant 🍲🍝';
    W.drawMiniMap = (ctx, Wpx, Hpx, toX, toY) => {
      ctx.fillStyle = '#f5e4c8'; ctx.fillRect(0, 0, Wpx, Hpx);
      ctx.fillStyle = '#c97b36'; ctx.fillRect(toX(-5), toY(-6.2), toX(5) - toX(-5), toY(-4.6) - toY(-6.2));
      ctx.fillStyle = '#2d7a36'; ctx.fillRect(toX(-1.5), toY(-2), toX(1.5) - toX(-1.5), toY(0) - toY(-2));
      ctx.fillStyle = '#3d2c1e'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('EATERY', toX(0), toY(-2.5));
      ctx.fillText('QASHQAI 🚙', toX(0), toY(5.6));
    };
    return W;
  }

  // =========================================================================
  // DESTINATION 2: YIWAN RESTAURANT (dest_yiwan)
  // Dumplings, Sweet & Sour Chicken, Rice, or a Combination!
  // =========================================================================
  function buildYiwan(worldGroup) {
    const W = {
      id: 'dest_yiwan',
      isInterior: true,
      colliders: [],
      zones: [],
      hiddenAnimals: [],
      lanterns: [],
      diningConfigs: {
        yiwan_dining: {
          lailaSeat: new THREE.Vector3(-1.15, 0.18, -1.0),
          salmaSeat: new THREE.Vector3(1.15, 0.18, -1.0),
          lailaDishPos: new THREE.Vector3(-0.62, 0.86, -1.0),
          salmaDishPos: new THREE.Vector3(0.62, 0.86, -1.0),
          oishiiPos: new THREE.Vector3(0, 1.85, -1.0),
          seatYaw: 0,
          camPos: new THREE.Vector3(0, 2.35, 3.0),
          camLook: new THREE.Vector3(0, 1.05, -1.0),
          caption: 'Delicious at Yiwan! 🥟🍗🍚',
          exitPos: new THREE.Vector3(0, 0, 2.0)
        }
      }
    };
    const addCol = (x, z, hw, hd) => W.colliders.push({ minX: x - hw, maxX: x + hw, minZ: z - hd, maxZ: z + hd });
    W.getGroundHeight = () => 0;

    buildRoomShell(worldGroup, 18, 14, 4.5, 0xc79263, '#faebd7', 0x7c1d22);

    // Rich Red & Gold Yiwan Restaurant Signboard
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 1.05, 0.14),
      new THREE.MeshBasicMaterial({
        map: LS.createSignTexture('🥟 YIWAN • DUMPLINGS, SWEET & SOUR & RICE 🏮', {
          bg: '#7c1d22', border: '#e9c46a', color: '#fff8e7', font: 'bold 22px sans-serif', width: 640, height: 110
        })
      })
    );
    sign.position.set(0, 3.45, -6.8); worldGroup.add(sign);

    // Glowing Red Paper Lanterns hanging across the ceiling (emissive + glow sprite, 0 lights!)
    [[-5.0, -2.5], [0, -2.5], [5.0, -2.5], [-4.5, 2.2], [4.5, 2.2]].forEach((lp, i) => {
      const lg = new THREE.Group();
      lg.position.set(lp[0], 3.55, lp[1]);
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 10), LS.makeEmissiveMat(0xd62828, 0xff6b35, 0.72));
      body.scale.set(1.0, 1.18, 1.0); lg.add(body);
      const capT = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 10), LS.makeToonMat(0xe9c46a));
      capT.position.y = 0.42; lg.add(capT);
      const capB = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.08, 10), LS.makeToonMat(0xe9c46a));
      capB.position.y = -0.42; lg.add(capB);
      if (LS.createGlowSprite) {
        const halo = LS.createGlowSprite(0xff9f68, 1.65);
        lg.add(halo);
      }
      lg.userData.phase = i * 1.1;
      worldGroup.add(lg);
      W.lanterns.push(lg);
    });

    // Dumpling Steamer Bar Counter along North Wall!
    const bar = new THREE.Mesh(new THREE.BoxGeometry(10.5, 1.05, 1.3), LS.makeToonMat(0x6b2024));
    bar.position.set(0, 0.52, -5.7); bar.castShadow = true; worldGroup.add(bar);
    const bTop = new THREE.Mesh(new THREE.BoxGeometry(10.7, 0.12, 1.45), LS.makeToonMat(0xd9a773));
    bTop.position.set(0, 1.08, -5.7); worldGroup.add(bTop);
    // Stacked Bamboo Dumpling Steamers on the bar!
    [-3.2, -2.4, 2.4, 3.2].forEach((bx, bi) => {
      for (let tier = 0; tier < (bi % 2 === 0 ? 3 : 2); tier++) {
        const st = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.14, 14), LS.makeToonMat(0xd9ad6c));
        st.position.set(bx, 1.21 + tier * 0.15, -5.7); worldGroup.add(st);
      }
    });
    addCol(0, -5.7, 5.4, 0.9);

    // Main Round Lacquer Family Table (center, matches yiwan_dining!) + 2 Side Tables
    const woodDark = LS.makeToonMat(0x5c231c);
    const goldMat = LS.makeToonMat(0xe9c46a);
    function addYiwanTable(tx, tz, main) {
      const tg = new THREE.Group();
      tg.position.set(tx, 0, tz);
      const top = new THREE.Mesh(new THREE.CylinderGeometry(main ? 1.18 : 0.95, main ? 1.18 : 0.95, 0.10, 20), woodDark);
      top.position.y = 0.80; top.castShadow = true; tg.add(top);
      const lazy = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.04, 16), LS.makeToonMat(0x9e2a2b));
      lazy.position.y = 0.87; tg.add(lazy);
      const teapot = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), goldMat);
      teapot.position.y = 1.01; tg.add(teapot);
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.34, 0.78, 12), woodDark);
      ped.position.y = 0.39; tg.add(ped);
      [-1.18, 1.18].forEach(cx => {
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.48, 0.52), LS.makeToonMat(0x9e2a2b));
        seat.position.set(cx, 0.24, 0); tg.add(seat);
      });
      worldGroup.add(tg);
      addCol(tx, tz, 1.25, 1.15);
    }
    addYiwanTable(0, -1.0, true);
    addYiwanTable(-5.6, 0.6, false);
    addYiwanTable(5.6, 0.6, false);

    // Tall Bamboo stalks in ceramic urns in corners
    [-7.8, 7.8].forEach(bx => {
      const urn = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.22, 0.55, 10), LS.makeToonMat(0x9e2a2b));
      urn.position.set(bx, 0.28, -5.8); worldGroup.add(urn);
      [-0.1, 0, 0.1].forEach((ox, oi) => {
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 2.8 + oi * 0.3, 7), LS.makeToonMat(0x4b9349));
        stalk.position.set(bx + ox, 1.8, -5.8 + (oi - 1) * 0.08); worldGroup.add(stalk);
      });
    });

    LS.spawnWorldNPCs(worldGroup, [{
      name: 'Chef Mei (Yiwan)',
      line: 'Welcome to Yiwan, Laila & Salma! Dumplings, Sweet & Sour Chicken, Jasmine Rice, or a Combo Feast? 🥟🍚',
      pos: new THREE.Vector3(0, 0, -4.4),
      baseRot: 0,
      waveOnNear: true,
      char: { scale: 0.92, skinColor: 0xf4d2bc, hairColor: 0x1e1817, topColor: 0x9e2a2b, bottomColor: 0x22262e, hairBun: true }
    }]);

    W.zones.push({
      id: 'yiwan_order',
      label: 'Order at Yiwan (Dumplings, Sweet & Sour, Rice or Combo!) 🥟🍗',
      pos: new THREE.Vector3(0, 0, 1.2),
      radius: 2.8
    });
    W.zones.push({
      id: 'home_qashqai',
      label: 'Hop in Gray Nissan Qashqai (Drive Home or Elsewhere) 🚙',
      pos: new THREE.Vector3(0, 0, 5.7),
      radius: 2.3
    });

    W.update = (dt, elapsed) => {
      W.lanterns.forEach(l => {
        l.rotation.z = Math.sin(elapsed * 1.4 + l.userData.phase) * 0.06;
      });
    };
    W.getZoneLabel = () => 'Yiwan Restaurant 🥟🏮';
    W.drawMiniMap = (ctx, Wpx, Hpx, toX, toY) => {
      ctx.fillStyle = '#f2dec2'; ctx.fillRect(0, 0, Wpx, Hpx);
      ctx.fillStyle = '#9e2a2b'; ctx.fillRect(toX(-5), toY(-6.2), toX(5) - toX(-5), toY(-4.6) - toY(-6.2));
      ctx.fillStyle = '#e9c46a'; ctx.beginPath(); ctx.arc(toX(0), toY(-1), 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3d2c1e'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('YIWAN', toX(0), toY(-2.5));
      ctx.fillText('QASHQAI 🚙', toX(0), toY(5.6));
    };
    return W;
  }

  // =========================================================================
  // DESTINATION 3: COSMO CITY ARCADE (dest_cosmo_city)
  // 3 Playable Interactive Arcade Mini-Games!
  // =========================================================================
  function buildCosmoCity(worldGroup) {
    const W = {
      id: 'dest_cosmo_city',
      isInterior: true,
      colliders: [],
      zones: [],
      hiddenAnimals: [],
      neonStars: []
    };
    const addCol = (x, z, hw, hd) => W.colliders.push({ minX: x - hw, maxX: x + hw, minZ: z - hd, maxZ: z + hd });
    W.getGroundHeight = () => 0;

    // Cosmic Star-Carpeted Floor & Deep Twilight Arcade Walls
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 16), LS.makeToonMat(0x282654));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; worldGroup.add(floor);
    // Colorful glowing floor star tiles!
    const tileCols = [0xff5d8f, 0x38bdf8, 0xffd166, 0xa855f7];
    for (let ix = -6; ix <= 6; ix += 4) {
      for (let iz = -4; iz <= 4; iz += 4) {
        const starTile = new THREE.Mesh(new THREE.CircleGeometry(0.42, 5), LS.makeEmissiveMat(tileCols[Math.abs(ix + iz) % 4], tileCols[Math.abs(ix + iz) % 4], 0.55));
        starTile.rotation.x = -Math.PI / 2; starTile.position.set(ix, 0.015, iz); worldGroup.add(starTile);
      }
    }

    const wallMat = LS.makeToonMat(0x37306b);
    [[0, -8, 20.3, 4.6, 0.3], [0, 8, 20.3, 4.6, 0.3], [-10, 0, 0.3, 4.6, 16.3], [10, 0, 0.3, 4.6, 16.3]].forEach(b => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(b[2], b[3], b[4]), wallMat);
      m.position.set(b[0], b[3] / 2, b[1]); worldGroup.add(m);
    });
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(20, 16), LS.makeToonMat(0x1f1b42));
    ceil.rotation.x = Math.PI / 2; ceil.position.y = 4.55; worldGroup.add(ceil);

    // Glowing COSMO CITY Signboard!
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(8.2, 1.15, 0.16),
      new THREE.MeshBasicMaterial({
        map: LS.createSignTexture('🚀 COSMO CITY FAMILY ARCADE 🕹️✨', {
          bg: '#1e1b4b', border: '#38bdf8', color: '#fde047', font: 'bold 28px sans-serif', width: 640, height: 110
        })
      })
    );
    sign.position.set(0, 3.6, -7.75); worldGroup.add(sign);

    // Floating Decorative Planets & Glowing Stars under the Ceiling!
    [[-5.5, 3.55, -2.5, 0x38bdf8], [0, 3.7, 0.5, 0xffd166], [5.5, 3.55, -2.5, 0xff5d8f]].forEach((sp, i) => {
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), LS.makeEmissiveMat(sp[3], sp[3], 0.72));
      orb.position.set(sp[0], sp[1], sp[2]); worldGroup.add(orb);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.04, 6, 20), LS.makeEmissiveMat(0xffffff, sp[3], 0.6));
      ring.rotation.x = Math.PI / 2 - 0.3; ring.position.copy(orb.position); worldGroup.add(ring);
      orb.userData = { baseY: sp[1], phase: i * 1.4, ring: ring };
      W.neonStars.push(orb);
    });

    // Helper: Vibrant 3D Arcade Cabinet Station
    function addArcadeCabinet(x, z, rotY, bodyHex, screenHex, labelText) {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.y = rotY;
      const cab = new THREE.Mesh(new THREE.BoxGeometry(1.55, 2.35, 1.15), LS.makeToonMat(bodyHex));
      cab.position.y = 1.18; cab.castShadow = true; g.add(cab);
      const deck = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.16, 0.55), LS.makeToonMat(0x1e293b));
      deck.position.set(0, 1.05, 0.72); g.add(deck);
      // Joystick & glowing arcade buttons!
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 6), LS.makeToonMat(0xdbe4ee));
      stick.position.set(-0.36, 1.22, 0.76); g.add(stick);
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 6), LS.makeToonMat(0xff595e));
      knob.position.set(-0.36, 1.32, 0.76); g.add(knob);
      [0.12, 0.30, 0.48].forEach((bx, bi) => {
        const bt = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.05, 8), LS.makeEmissiveMat(tileCols[bi], tileCols[bi], 0.8));
        bt.position.set(bx, 1.15, 0.76); g.add(bt);
      });
      const scr = new THREE.Mesh(new THREE.BoxGeometry(1.26, 0.92, 0.08), LS.makeEmissiveMat(screenHex, screenHex, 0.85));
      scr.position.set(0, 1.62, 0.58); scr.rotation.x = -0.12; g.add(scr);
      const marq = new THREE.Mesh(
        new THREE.BoxGeometry(1.48, 0.36, 0.12),
        new THREE.MeshBasicMaterial({
          map: LS.createSignTexture(labelText, { bg: '#0f172a', border: '#fde047', color: '#ffffff', font: 'bold 26px sans-serif', width: 320, height: 80 })
        })
      );
      marq.position.set(0, 2.24, 0.60); g.add(marq);
      worldGroup.add(g);
      addCol(x, z, 0.95, 0.85);
    }

    // 3 Playable Hero Arcade Stations along the North Wall!
    addArcadeCabinet(-5.4, -5.8, 0, 0x3b82f6, 0x38bdf8, '🛸 METEOR CATCH');
    addArcadeCabinet(0, -5.8, 0, 0xa855f7, 0xf472b6, '🎨 COSMO MEMORY');
    addArcadeCabinet(5.4, -5.8, 0, 0xec4899, 0xfde047, '🧸 CLAW GRABBER');

    // Decorative Glowing Air Hockey Table in Center-West + Prize Counter on East!
    const ah = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.86, 1.5), LS.makeToonMat(0x1e293b));
    ah.position.set(-5.2, 0.43, 1.2); worldGroup.add(ah);
    const ahTop = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.06, 1.3), LS.makeEmissiveMat(0xe0f2fe, 0x38bdf8, 0.45));
    ahTop.position.set(-5.2, 0.88, 1.2); worldGroup.add(ahTop);
    addCol(-5.2, 1.2, 1.5, 0.9);

    const prizeDesk = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.05, 4.4), LS.makeToonMat(0x4c1d95));
    prizeDesk.position.set(8.2, 0.52, 0.6); worldGroup.add(prizeDesk);
    [-1.0, 0, 1.0].forEach((pz, pi) => {
      const plush = new THREE.Mesh(new THREE.SphereGeometry(0.24, 9, 8), LS.makeToonMat(tileCols[pi]));
      plush.position.set(8.2, 1.26, 0.6 + pz); worldGroup.add(plush);
    });
    addCol(8.2, 0.6, 0.9, 2.3);

    // Exit door back to Gray Nissan Qashqai
    const door = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.7, 0.22), LS.makeToonMat(0x38bdf8));
    door.position.set(0, 1.35, 7.82); worldGroup.add(door);
    const exitMat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.04, 1.15), LS.makeToonMat(0x4b5563));
    exitMat.position.set(0, 0.02, 7.0); worldGroup.add(exitMat);

    LS.spawnWorldNPCs(worldGroup, [{
      name: 'Leo (Cosmo Host)',
      line: 'Welcome to Cosmo City, Laila & Salma! Try all 3 glowing arcade machines to win coins & prizes! 🚀🎮',
      pos: new THREE.Vector3(6.6, 0, 0.6),
      baseRot: -Math.PI / 2,
      waveOnNear: true,
      char: { scale: 0.92, skinColor: 0xe6b595, hairColor: 0x2c1d16, topColor: 0x6d28d9, bottomColor: 0x1e293b, pants: true, hatType: 'cap', hatColor: 0x38bdf8 }
    }]);

    W.zones.push({ id: 'cosmo_meteors', label: 'Play Space Meteor Catcher 🛸⭐', pos: new THREE.Vector3(-5.4, 0, -4.0), radius: 2.3 });
    W.zones.push({ id: 'cosmo_memory', label: 'Play Cosmo Color Memory 🎨✨', pos: new THREE.Vector3(0, 0, -4.0), radius: 2.3 });
    W.zones.push({ id: 'cosmo_claw', label: 'Play Cosmo Claw Grabber 🧸🕹️', pos: new THREE.Vector3(5.4, 0, -4.0), radius: 2.3 });
    W.zones.push({ id: 'home_qashqai', label: 'Hop in Gray Nissan Qashqai (Drive Home or Elsewhere) 🚙', pos: new THREE.Vector3(0, 0, 6.6), radius: 2.4 });

    W.update = (dt, elapsed) => {
      W.neonStars.forEach(o => {
        o.position.y = o.userData.baseY + Math.sin(elapsed * 1.8 + o.userData.phase) * 0.12;
        o.userData.ring.position.y = o.position.y;
        o.userData.ring.rotation.z = elapsed * 0.6;
      });
    };
    W.getZoneLabel = () => 'Cosmo City Arcade 🚀🕹️';
    W.drawMiniMap = (ctx, Wpx, Hpx, toX, toY) => {
      ctx.fillStyle = '#282654'; ctx.fillRect(0, 0, Wpx, Hpx);
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(toX(-6.5), toY(-6.8), toX(-4.3) - toX(-6.5), toY(-4.8) - toY(-6.8));
      ctx.fillStyle = '#a855f7'; ctx.fillRect(toX(-1.1), toY(-6.8), toX(1.1) - toX(-1.1), toY(-4.8) - toY(-6.8));
      ctx.fillStyle = '#ec4899'; ctx.fillRect(toX(4.3), toY(-6.8), toX(6.5) - toX(4.3), toY(-4.8) - toY(-6.8));
      ctx.fillStyle = '#fde047'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('COSMO CITY', toX(0), toY(-1));
      ctx.fillText('QASHQAI 🚙', toX(0), toY(6.4));
    };
    return W;
  }

  // =========================================================================
  // DESTINATION 4: GRANDMA (NANO) & GRANDPA (GEDO)'S HOUSE (dest_grandparents)
  // Nano is watching TV & Gedo is drinking warm tea!
  // =========================================================================
  function buildGrandparents(worldGroup) {
    const W = {
      id: 'dest_grandparents',
      isInterior: true,
      colliders: [],
      zones: [],
      hiddenAnimals: [],
      teaSteams: [],
      tvObj: null
    };
    const addCol = (x, z, hw, hd) => W.colliders.push({ minX: x - hw, maxX: x + hw, minZ: z - hd, maxZ: z + hd });
    W.getGroundHeight = () => 0;

    const { trimMat } = buildRoomShell(worldGroup, 18, 14, 4.5, 0xdfb889, '#fdf4e4', 0x7c4e2e);

    // Warm Floral Living Room Carpet
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(10.8, 7.6), LS.makeToonMat(0xe8c5b0));
    rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.016, -0.6); worldGroup.add(rug);
    const rugIn = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 6.4), LS.makeToonMat(0xf5e0cc));
    rugIn.rotation.x = -Math.PI / 2; rugIn.position.set(0, 0.020, -0.6); worldGroup.add(rugIn);

    // Cozy Welcome Sign & Framed Family Photos on Back Wall!
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(6.2, 0.92, 0.12),
      new THREE.MeshBasicMaterial({
        map: LS.createSignTexture("💛 NANO & GEDO'S COZY HOME 🫖📺", {
          bg: '#fff9ef', border: '#2a9d8f', color: '#2b3a34', font: 'bold 24px sans-serif', width: 560, height: 100
        })
      })
    );
    sign.position.set(0, 3.45, -6.82); worldGroup.add(sign);

    // Large Animated 3D TV on the West Wall — Nano is watching TV!
    W.tvObj = createAnimatedTV(worldGroup, -8.25, 0, -1.6, Math.PI / 2, 'show');
    addCol(-8.2, -1.6, 0.85, 1.5);

    // Nano's Cozy Floral Sofa facing the TV (X=-3.2, Z=-1.6)
    const sofaMat = LS.makeToonMat(0xd88c9a);
    const sBase = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.54, 3.2), sofaMat);
    sBase.position.set(-3.2, 0.27, -1.6); sBase.castShadow = true; worldGroup.add(sBase);
    const sBack = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.02, 3.2), sofaMat);
    sBack.position.set(-2.72, 0.62, -1.6); worldGroup.add(sBack);
    [-3.1, -0.1].forEach(az => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.72, 0.26), sofaMat);
      arm.position.set(-3.2, 0.36, az); worldGroup.add(arm);
    });
    addCol(-3.1, -1.6, 0.72, 1.7);

    // Low Coffee Table in front of Nano's Sofa
    const cTab = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.44, 1.8), trimMat);
    cTab.position.set(-5.3, 0.22, -1.6); worldGroup.add(cTab);
    const remote = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.04, 0.26), LS.makeToonMat(0x2d3748));
    remote.position.set(-5.3, 0.46, -1.4); worldGroup.add(remote);
    addCol(-5.3, -1.6, 0.6, 1.0);

    // Gedo's Warm Armchair + Tea Side Table with Steaming Hot Mint Tea! (East side: X=4.2, Z=-1.6)
    const chairMat = LS.makeToonMat(0x457b9d);
    const gSeat = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.52, 1.25), chairMat);
    gSeat.position.set(4.4, 0.26, -1.6); gSeat.castShadow = true; worldGroup.add(gSeat);
    const gBack = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.08, 1.25), chairMat);
    gBack.position.set(4.92, 0.64, -1.6); worldGroup.add(gBack);
    addCol(4.5, -1.6, 0.8, 0.8);

    // Tea Table right next to Gedo with Brass Teapot, Mint Tea Glass & Animated Steam!
    const tTab = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.09, 16), trimMat);
    tTab.position.set(2.95, 0.66, -1.6); worldGroup.add(tTab);
    const tLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 0.64, 10), trimMat);
    tLeg.position.set(2.95, 0.32, -1.6); worldGroup.add(tLeg);
    const tPot = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), LS.makeToonMat(0xd4a359));
    tPot.position.set(2.82, 0.86, -1.75); worldGroup.add(tPot);
    const teaGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.16, 10), LS.makeToonMat(0xd97706));
    teaGlass.position.set(3.15, 0.80, -1.45); worldGroup.add(teaGlass);
    for (let i = 0; i < 2; i++) {
      const st = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6), LS.makeToonMat(0xffffff, { transparent: true, opacity: 0.48 }));
      st.userData = { baseX: 3.15, baseY: 0.94, baseZ: -1.45, phase: i * 0.5 };
      worldGroup.add(st);
      W.teaSteams.push(st);
    }
    addCol(2.95, -1.6, 0.72, 0.72);

    // Cozy Bookshelf & Indoor Plants
    const bShelf = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 0.55), trimMat);
    bShelf.position.set(5.4, 1.1, -6.45); worldGroup.add(bShelf);
    addIndoorPlant(worldGroup, -7.6, -5.8, 0x2a9d8f);
    addIndoorPlant(worldGroup, 7.8, 4.8, 0xe07a5f);

    // Spawn Nano (Grandma) seated watching TV & Gedo (Grandpa) seated drinking tea!
    LS.spawnWorldNPCs(worldGroup, [
      {
        name: 'Nano (Grandma) 📺',
        line: 'Habibati Laila & Salma! Come sit right beside Nano and watch my favorite cozy TV show! 💛📺',
        pos: new THREE.Vector3(-3.35, 0.22, -1.6),
        baseRot: -Math.PI / 2,
        seated: true,
        char: { scale: 0.90, skinColor: 0xe6b898, hairColor: 0xd8dce0, topColor: 0xe07a5f, bottomColor: 0x5c4b51, hairBun: true, faceOpts: { glasses: true, elder: true } }
      },
      {
        name: 'Gedo (Grandpa) ☕',
        line: 'Ahlan ya Laila & Salma! Gedo just brewed warm sweet mint tea — come sit and chat! ☕🌿💛',
        pos: new THREE.Vector3(4.25, 0.22, -1.6),
        baseRot: -Math.PI / 2,
        seated: true,
        char: { scale: 0.94, skinColor: 0xd9a480, hairColor: 0xd8dce0, topColor: 0x6b8f71, bottomColor: 0x3b4252, pants: true, faceOpts: { glasses: true, mustache: true, elder: true } }
      }
    ]);

    W.zones.push({ id: 'visit_nano_tv', label: 'Watch TV & Cuddle with Nano 📺💛', pos: new THREE.Vector3(-3.8, 0, 1.1), radius: 2.6 });
    W.zones.push({ id: 'visit_gedo_tea', label: 'Drink Warm Tea & Chat with Gedo ☕🌿', pos: new THREE.Vector3(3.0, 0, 0.8), radius: 2.6 });
    W.zones.push({ id: 'home_qashqai', label: 'Hop in Gray Nissan Qashqai (Drive Home or Elsewhere) 🚙', pos: new THREE.Vector3(0, 0, 5.7), radius: 2.3 });

    W.update = (dt, elapsed) => {
      if (W.tvObj) W.tvObj.update(elapsed);
      W.teaSteams.forEach(st => {
        const t = (elapsed * 0.55 + st.userData.phase) % 1.0;
        st.position.set(st.userData.baseX, st.userData.baseY + t * 0.52, st.userData.baseZ);
        st.scale.setScalar(0.65 + t * 0.9);
        st.material.opacity = (1 - t) * 0.45;
      });
    };
    W.getZoneLabel = (x) => (x < 0 ? "Nano's TV Living Room 📺💛" : "Gedo's Tea Corner ☕🌿");
    W.drawMiniMap = (ctx, Wpx, Hpx, toX, toY) => {
      ctx.fillStyle = '#f5e4cf'; ctx.fillRect(0, 0, Wpx, Hpx);
      ctx.fillStyle = '#d88c9a'; ctx.fillRect(toX(-4.5), toY(-3.2), toX(-2.2) - toX(-4.5), toY(0) - toY(-3.2));
      ctx.fillStyle = '#457b9d'; ctx.fillRect(toX(3.2), toY(-2.8), toX(5.6) - toX(3.2), toY(-0.4) - toY(-2.8));
      ctx.fillStyle = '#3d2c1e'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('NANO 📺', toX(-3.5), toY(-3.8));
      ctx.fillText('GEDO ☕', toX(4.4), toY(-3.4));
      ctx.fillText('QASHQAI 🚙', toX(0), toY(5.6));
    };
    return W;
  }

  // =========================================================================
  // DESTINATION 5: MAI & MOSTAFA'S HOUSE ACROSS THE RIVER (dest_mai_mostafa)
  // - Sparkling turquoise river + arched bridge + Gray Qashqai on south bank
  // - Mai asking if Laila & Salma want homemade Lasagna!
  // - Mostafa: dark-skinned, bald, white doctor's coat + stethoscope watching TV!
  // - Nouzi: 5yo slim athletic girl doing animated gymnastics moves!
  // - Bibo: 4yo boy playing with animated colorful toy cars!
  // - Board game table where all 4 children play together!
  // =========================================================================
  function buildMaiMostafa(worldGroup) {
    const W = {
      id: 'dest_mai_mostafa',
      isInterior: false,
      colliders: [],
      zones: [],
      hiddenAnimals: [],
      skyMesh: null,
      tvObj: null,
      nouziChar: null,
      biboChar: null,
      biboToyCars: [],
      diningConfigs: {
        mai_dining: {
          lailaSeat: new THREE.Vector3(-5.8, 0.18, -7.8),
          salmaSeat: new THREE.Vector3(-3.6, 0.18, -7.8),
          lailaDishPos: new THREE.Vector3(-5.3, 0.88, -7.8),
          salmaDishPos: new THREE.Vector3(-4.1, 0.88, -7.8),
          oishiiPos: new THREE.Vector3(-4.7, 1.88, -7.8),
          seatYaw: 0,
          camPos: new THREE.Vector3(-4.7, 2.35, -3.9),
          camLook: new THREE.Vector3(-4.7, 1.05, -7.8),
          caption: "Mai's Homemade Lasagna! 🧀🍝💛",
          exitPos: new THREE.Vector3(-4.7, 0, -4.8)
        }
      }
    };
    const addCol = (x, z, hw, hd) => W.colliders.push({ minX: x - hw, maxX: x + hw, minZ: z - hd, maxZ: z + hd });

    // Gentle arched bridge elevation over the river (Z = 6.0 .. 12.0, X = -3.0 .. 3.0)
    W.getGroundHeight = function (x, z) {
      if (Math.abs(x) < 3.0 && z > 5.8 && z < 12.2) {
        const u = (z - 5.8) / 6.4;
        return Math.sin(u * Math.PI) * 0.62;
      }
      return 0;
    };

    // Sky Dome + Lush River Valley Hills!
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(195, 24, 16),
      new THREE.MeshBasicMaterial({ map: LS.createSkyTexture(LS.state.timeMode, 'tokyo'), side: THREE.BackSide })
    );
    worldGroup.add(sky);
    W.skyMesh = sky;
    if (LS.hdAssets && LS.hdAssets.addMountainRange) {
      LS.hdAssets.addMountainRange(worldGroup, 'tokyo');
    }

    // Green Riverbank Meadow
    const meadow = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), LS.makeSurfaceMat(LS.createGrassTexture('tokyo')));
    meadow.rotation.x = -Math.PI / 2; meadow.receiveShadow = true; worldGroup.add(meadow);

    // SPARKLING TURQUOISE GHIBLI RIVER running East-West at Z = 9.0!
    const riverBed = new THREE.Mesh(new THREE.PlaneGeometry(110, 7.6), LS.makeToonMat(0x2a7f8e));
    riverBed.rotation.x = -Math.PI / 2; riverBed.position.set(0, 0.02, 9.0); worldGroup.add(riverBed);
    const riverWater = new THREE.Mesh(new THREE.PlaneGeometry(110, 6.4), LS.makeWaterMat(0.92));
    riverWater.rotation.x = -Math.PI / 2; riverWater.position.set(0, 0.06, 9.0); worldGroup.add(riverWater);
    // Stone embankments on both sides of the river (leaving bridge opening at X=-3..3)
    const bankMat = LS.makeToonMat(0xcbc0ae);
    [[-16, 5.7], [16, 5.7], [-16, 12.3], [16, 12.3]].forEach(bp => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(26, 0.42, 0.65), bankMat);
      b.position.set(bp[0], 0.21, bp[1]); worldGroup.add(b);
    });
    // Invisible river water colliders off the bridge so sisters walk across the bridge!
    addCol(-14.5, 9.0, 11.4, 3.1);
    addCol(14.5, 9.0, 11.4, 3.1);

    // Charming Arched Wooden & Stone River Bridge (Z = 5.8 .. 12.2, X = -2.8 .. 2.8)
    const bridgeWood = LS.makeToonMat(0x8c5a3c);
    const railWood = LS.makeToonMat(0x6e4429);
    for (let i = 0; i < 12; i++) {
      const u = (i + 0.5) / 12;
      const bz = 5.8 + u * 6.4;
      const by = Math.sin(u * Math.PI) * 0.62;
      const plank = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.14, 0.52), bridgeWood);
      plank.position.set(0, by + 0.04, bz); plank.receiveShadow = true; plank.castShadow = true; worldGroup.add(plank);
      if (i % 3 === 0 || i === 11) {
        [-2.45, 2.45].forEach(rx => {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.95, 0.16), railWood);
          post.position.set(rx, by + 0.52, bz); worldGroup.add(post);
        });
      }
    }
    [-2.45, 2.45].forEach(rx => {
      const rBeam = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 6.5), railWood);
      rBeam.position.set(rx, 1.32, 9.0); worldGroup.add(rBeam);
    });

    // Gravel Driveway on South Bank + Parked Gray Nissan Qashqai waiting across the river!
    const drive = new THREE.Mesh(new THREE.PlaneGeometry(14, 11), LS.makeSurfaceMat(LS.createGravelPathTexture()));
    drive.rotation.x = -Math.PI / 2; drive.position.set(0, 0.025, 17.5); drive.receiveShadow = true; worldGroup.add(drive);

    if (LS.createNissanQashqai) {
      const qashqai = LS.createNissanQashqai();
      qashqai.position.set(-4.8, 0, 17.2);
      qashqai.rotation.y = Math.PI * 0.35;
      worldGroup.add(qashqai);
      addCol(-4.8, 17.2, 2.2, 1.4);
    }

    // Lush Ghibli trees lining the riverbanks!
    [[-11, 14.5, 'sakura', 1.15], [10.5, 14.5, 'green', 1.2], [-14.5, 2.0, 'olive', 1.22], [14.5, 2.0, 'sakura', 1.18]].forEach(tc => {
      if (LS.ghibli && LS.ghibli.buildGhibliTree) {
        const t = LS.ghibli.buildGhibliTree(tc[2], tc[3]);
        t.position.set(tc[0], 0, tc[1]); worldGroup.add(t);
      }
    });

    // -----------------------------------------------------------------------
    // MAI & MOSTAFA'S OPEN-FRONT SUNLIT RIVERFRONT HOUSE (Z = -13.5 .. +1.5, X = -11 .. +11)
    // Open south veranda archway facing the river so you walk straight in!
    // -----------------------------------------------------------------------
    const hFloor = new THREE.Mesh(new THREE.PlaneGeometry(22, 15.5), LS.makeSurfaceMat(LS.createCedarPlankTexture(), { color: 0xe6c89c }));
    hFloor.rotation.x = -Math.PI / 2; hFloor.position.set(0, 0.03, -6.0); hFloor.receiveShadow = true; worldGroup.add(hFloor);
    // Connecting stone walkway from river bridge to house veranda!
    const walk = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 5.2), LS.makeSurfaceMat(LS.createStonePathTexture()));
    walk.rotation.x = -Math.PI / 2; walk.position.set(0, 0.025, 3.6); worldGroup.add(walk);

    const hWallMat = LS.makeToonMat(0xffffff, { map: LS.createPlasterTexture('#fdf3e2') });
    const trimMat = LS.makeToonMat(0x8c5e3c);
    // Back, West & East walls + Front Veranda Pillars & Warm Terracotta Roof Overhang!
    const bWall = new THREE.Mesh(new THREE.BoxGeometry(22.3, 4.6, 0.35), hWallMat);
    bWall.position.set(0, 2.3, -13.8); bWall.castShadow = true; worldGroup.add(bWall);
    const lWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 4.6, 15.6), hWallMat);
    lWall.position.set(-11.0, 2.3, -6.0); worldGroup.add(lWall);
    const rWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 4.6, 15.6), hWallMat);
    rWall.position.set(11.0, 2.3, -6.0); worldGroup.add(rWall);
    addCol(0, -13.8, 11.2, 0.4);
    addCol(-11.0, -6.0, 0.4, 7.8);
    addCol(11.0, -6.0, 0.4, 7.8);

    // Front veranda columns & gabled terracotta roof above!
    [-10.6, -4.5, 4.5, 10.6].forEach(px => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.45, 4.6, 0.45), trimMat);
      col.position.set(px, 2.3, 1.7); col.castShadow = true; worldGroup.add(col);
    });
    const frontHeader = new THREE.Mesh(new THREE.BoxGeometry(22.4, 0.55, 0.55), trimMat);
    frontHeader.position.set(0, 4.6, 1.7); worldGroup.add(frontHeader);
    const houseRoof = new THREE.Mesh(new THREE.ConeGeometry(16.8, 3.2, 4), LS.makeToonMat(0xffffff, { map: LS.createRoofTileTexture('#c25a3c') }));
    houseRoof.position.set(0, 6.25, -6.0); houseRoof.rotation.y = Math.PI / 4; houseRoof.scale.set(1.06, 1.0, 0.78);
    houseRoof.castShadow = true; worldGroup.add(houseRoof);

    const houseSign = new THREE.Mesh(
      new THREE.BoxGeometry(7.6, 1.0, 0.18),
      new THREE.MeshBasicMaterial({
        map: LS.createSignTexture("🏡 MAI & MOSTAFA'S RIVER HOUSE 🌉", {
          bg: '#fff8ec', border: '#e07a5f', color: '#4a2b14', font: 'bold 26px sans-serif', width: 620, height: 100
        })
      })
    );
    houseSign.position.set(0, 4.55, 2.02); worldGroup.add(houseSign);

    // -----------------------------------------------------------------------
    // AREA 1 (Northwest): MAI'S LASAGNA DINING TABLE! (X = -4.7, Z = -7.8)
    // -----------------------------------------------------------------------
    const dTab = new THREE.Group();
    dTab.position.set(-4.7, 0, -7.8);
    const dTop = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 1.6), trimMat);
    dTop.position.y = 0.80; dTop.castShadow = true; dTab.add(dTop);
    const dLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.24, 0.78, 10), trimMat);
    dLeg.position.y = 0.39; dTab.add(dLeg);
    // Steaming Homemade Lasagna Baking Pan on table!
    const pan = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.14, 0.52), LS.makeToonMat(0xfffaf0));
    pan.position.set(0, 0.93, 0); dTab.add(pan);
    const lasCheese = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.06, 0.44), LS.makeToonMat(0xf5c85c));
    lasCheese.position.set(0, 1.01, 0); dTab.add(lasCheese);
    [-1.1, 1.1].forEach(cx => {
      const ch = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.46, 0.52), LS.makeToonMat(0x9c6b49));
      ch.position.set(cx, 0.23, 0); dTab.add(ch);
    });
    worldGroup.add(dTab);
    addCol(-4.7, -7.8, 1.4, 0.95);

    // -----------------------------------------------------------------------
    // AREA 2 (Northeast): MOSTAFA WATCHING TV (Doctor Coat + Stethoscope!)
    // -----------------------------------------------------------------------
    const tvRug = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 5.2), LS.makeToonMat(0xdce8dc));
    tvRug.rotation.x = -Math.PI / 2; tvRug.position.set(5.4, 0.045, -8.8); worldGroup.add(tvRug);

    W.tvObj = createAnimatedTV(worldGroup, 9.8, 0.03, -8.8, -Math.PI / 2, 'sports');
    addCol(9.8, -8.8, 0.85, 1.5);

    // Sofa facing East TV where Mostafa sits!
    const mSofaMat = LS.makeToonMat(0x3d5a80);
    const msBase = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.54, 3.2), mSofaMat);
    msBase.position.set(4.5, 0.27, -8.8); msBase.castShadow = true; worldGroup.add(msBase);
    const msBack = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.0, 3.2), mSofaMat);
    msBack.position.set(4.02, 0.62, -8.8); worldGroup.add(msBack);
    addCol(4.4, -8.8, 0.72, 1.7);

    // -----------------------------------------------------------------------
    // AREA 3 (Southwest): NOUZI'S GYMNASTICS MAT (5yo slim athletic girl!)
    // -----------------------------------------------------------------------
    const gymMat = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.08, 2.8), LS.makeToonMat(0xffb3c6));
    gymMat.position.set(-6.4, 0.06, -1.8); gymMat.receiveShadow = true; worldGroup.add(gymMat);
    const gymStripe = new THREE.Mesh(new THREE.BoxGeometry(4.42, 0.09, 0.26), LS.makeToonMat(0xffffff));
    gymStripe.position.set(-6.4, 0.062, -1.8); worldGroup.add(gymStripe);

    // Build Nouzi (5yo girl, slim athletic build!) with custom gymnastics animation!
    const nouzi = LS.createAnimeCharacter({
      scale: 0.74,
      slim: true,
      skinColor: 0xd9a480,
      hairColor: 0x221713,
      topColor: 0xe63982,   // athletic gymnastics leotard!
      bottomColor: 0xe63982,
      shoeColor: 0xfff5f8,
      pigtails: true,
      pants: true
    });
    nouzi.root.position.set(-6.4, 0.10, -1.8);
    worldGroup.add(nouzi.root);
    W.nouziChar = nouzi;

    const nouziBub = LS.createSpeechBubbleSprite ? LS.createSpeechBubbleSprite('Nouzi 🤸‍♀️', 'Watch my cartwheel & handstand, Laila & Salma! ✨') : null;
    if (nouziBub) {
      nouziBub.position.set(-6.4, 1.85, -1.8);
      worldGroup.add(nouziBub);
    }

    // -----------------------------------------------------------------------
    // AREA 4 (Southeast): BIBO PLAYING WITH TOY CARS (4yo boy!)
    // -----------------------------------------------------------------------
    const toyRug = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3.6), LS.makeToonMat(0xcaf0f8));
    toyRug.rotation.x = -Math.PI / 2; toyRug.position.set(6.4, 0.045, -1.8); worldGroup.add(toyRug);
    // Oval toy road track on Bibo's play rug!
    const track = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.16, 6, 24), LS.makeToonMat(0x4b5563));
    track.rotation.x = Math.PI / 2; track.position.set(6.4, 0.06, -1.8); worldGroup.add(track);

    // 3 Colorful 3D Toy Cars zooming around Bibo's track!
    [0xe63946, 0xfacc15, 0x3b82f6].forEach((cHex, ci) => {
      const tc = new THREE.Group();
      const cb = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.42), LS.makeToonMat(cHex));
      cb.position.y = 0.10; tc.add(cb);
      const ct = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.09, 0.22), LS.makeToonMat(0xfffdf8));
      ct.position.set(0, 0.19, -0.02); tc.add(ct);
      tc.userData = { cx: 6.4, cz: -1.8, radius: 1.15, phase: ci * 2.1 };
      worldGroup.add(tc);
      W.biboToyCars.push(tc);
    });

    // Build Bibo (4yo boy!) sitting playfully beside his toy cars!
    const bibo = LS.createAnimeCharacter({
      scale: 0.66,
      skinColor: 0xcf9772,
      hairColor: 0x1e1613,
      topColor: 0x3b82f6,
      bottomColor: 0x1e3a5f,
      shoeColor: 0xfacc15,
      pants: true
    });
    bibo.root.position.set(6.4, 0.04, -1.8);
    if (LS.applyArticulatedPose) LS.applyArticulatedPose(bibo, 0, 'sit', 0);
    worldGroup.add(bibo.root);
    W.biboChar = bibo;

    const biboBub = LS.createSpeechBubbleSprite ? LS.createSpeechBubbleSprite('Bibo 🚗', 'Vroom vroom! Come play cars & board games with me! 🏎️') : null;
    if (biboBub) {
      biboBub.position.set(6.4, 1.62, -1.8);
      worldGroup.add(biboBub);
    }

    // -----------------------------------------------------------------------
    // AREA 5 (Center Living Room): KIDS' 4-PLAYER BOARD GAME TABLE! (X = 0, Z = -3.8)
    // -----------------------------------------------------------------------
    const bgTable = new THREE.Group();
    bgTable.position.set(0, 0.03, -3.8);
    const bgTop = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.10, 2.0), trimMat);
    bgTop.position.y = 0.56; bgTop.castShadow = true; bgTable.add(bgTop);
    [[-0.82, -0.82], [0.82, -0.82], [-0.82, 0.82], [0.82, 0.82]].forEach(lp => {
      const l = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.54, 7), trimMat);
      l.position.set(lp[0], 0.27, lp[1]); bgTable.add(l);
    });
    // Colorful 3D Game Board + 4 Player Pieces + Oversized Die on top!
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.04, 1.35), LS.makeToonMat(0xfff3c4));
    board.position.y = 0.63; bgTable.add(board);
    const boardIn = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.045, 1.15), LS.makeToonMat(0x90e0ef));
    boardIn.position.y = 0.635; bgTable.add(boardIn);
    [[-0.36, -0.36, 0xff5d8f], [0.36, -0.36, 0xffd166], [-0.36, 0.36, 0xa855f7], [0.36, 0.36, 0x3b82f6]].forEach(p => {
      const pawn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 8), LS.makeToonMat(p[2]));
      pawn.position.set(p[0], 0.76, p[1]); bgTable.add(pawn);
    });
    const die = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), LS.makeToonMat(0xffffff));
    die.position.set(0, 0.74, 0); die.rotation.y = 0.5; bgTable.add(die);
    // 4 Colorful Floor Cushions around the Board Game Table (for Laila, Salma, Nouzi & Bibo!)
    [[-1.35, 0, 0xff8fab], [1.35, 0, 0xffd166], [0, -1.35, 0xc77dff], [0, 1.35, 0x72c8f5]].forEach(c => {
      const cush = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.45, 0.16, 12), LS.makeToonMat(c[2]));
      cush.position.set(c[0], 0.08, c[1]); bgTable.add(cush);
    });
    worldGroup.add(bgTable);
    addCol(0, -3.8, 1.15, 1.15);

    // Spawn Mai (asking about Lasagna!) & Mostafa (dark-skinned, bald, white doctor's coat + stethoscope watching TV!)
    LS.spawnWorldNPCs(worldGroup, [
      {
        name: 'Mai 🍝',
        line: 'Welcome Laila & Salma! I just baked fresh homemade lasagna — would you like to have some? 🧀🍝💛',
        pos: new THREE.Vector3(-4.7, 0.03, -9.7),
        baseRot: 0,
        waveOnNear: true,
        char: { scale: 0.92, skinColor: 0xdca886, hairColor: 0x261a14, topColor: 0xe07a5f, bottomColor: 0x3d5a80, longHair: true }
      },
      {
        name: 'Mostafa (Dr.) 🩺📺',
        line: 'Hey Laila & Salma! Just relaxing in my coat and watching TV after the clinic — have fun with Nouzi & Bibo! 🩺📺',
        pos: new THREE.Vector3(4.65, 0.22, -8.8),
        baseRot: Math.PI / 2,
        seated: true,
        char: {
          scale: 0.98,
          skinColor: 0x6b442a,   // Dark-skinned!
          bald: true,            // Bald!
          doctorCoat: true,      // White doctor's coat!
          stethoscope: true,     // 3D Stethoscope around neck!
          topColor: 0xffffff,
          bottomColor: 0x2b3a4a,
          pants: true
        }
      }
    ]);

    // Interact Zones!
    W.zones.push({ id: 'mai_lasagna', label: "Talk to Mai — Have Homemade Lasagna? 🧀🍝", pos: new THREE.Vector3(-4.7, 0, -5.6), radius: 2.8 });
    W.zones.push({ id: 'kids_board_game', label: 'Play a Board Game with Laila, Salma, Nouzi & Bibo! 🎲🎉', pos: new THREE.Vector3(0, 0, -1.6), radius: 2.8 });
    W.zones.push({ id: 'home_qashqai', label: 'Hop in Gray Nissan Qashqai (Drive Home or Elsewhere) 🚙', pos: new THREE.Vector3(-1.8, 0, 17.2), radius: 3.6 });
    W.zones.push({ id: 'home_qashqai', label: 'Take Qashqai Keys — Drive Home or Elsewhere 🚙', pos: new THREE.Vector3(0, 0, 1.2), radius: 2.3 });

    W.update = function (dt, elapsed) {
      if (W.tvObj) W.tvObj.update(elapsed);

      // Animate Nouzi doing real gymnastics moves on her mat (Cartwheels, Handstand Balance & Leaps!)
      if (W.nouziChar) {
        const cycle = elapsed % 9.0;
        const r = W.nouziChar.root;
        const bp = W.nouziChar.bodyPivot;
        if (cycle < 3.0) {
          // Graceful Cartwheel across the mat!
          const u = cycle / 3.0;
          r.position.set(-7.6 + u * 2.4, 0.10 + Math.sin(u * Math.PI) * 0.45, -1.8);
          r.rotation.set(0, 0, 0);
          bp.rotation.set(0, 0, -u * Math.PI * 2);
          W.nouziChar.leftArm.rotation.z = 2.6; W.nouziChar.rightArm.rotation.z = -2.6;
          W.nouziChar.leftLeg.rotation.z = -0.55; W.nouziChar.rightLeg.rotation.z = 0.55;
        } else if (cycle < 6.0) {
          // Handstand hold!
          const u = (cycle - 3.0) / 3.0;
          const inv = Math.sin(u * Math.PI);
          r.position.set(-5.2, 0.10 + inv * 0.92, -1.8);
          bp.rotation.set(0, 0, inv * Math.PI);
          W.nouziChar.leftArm.rotation.z = 2.9; W.nouziChar.rightArm.rotation.z = -2.9;
          W.nouziChar.leftLeg.rotation.z = -0.25 * Math.sin(elapsed * 4);
          W.nouziChar.rightLeg.rotation.z = 0.25 * Math.sin(elapsed * 4);
        } else {
          // Joyful Gymnastics Arabesque & Star Jumps back across the mat!
          const u = (cycle - 6.0) / 3.0;
          r.position.set(-5.2 - u * 2.4, 0.10 + Math.abs(Math.sin(u * Math.PI * 3)) * 0.42, -1.8);
          bp.rotation.set(0, u * Math.PI * 2, 0);
          W.nouziChar.leftArm.rotation.z = 1.9; W.nouziChar.rightArm.rotation.z = -1.9;
          W.nouziChar.leftLeg.rotation.z = 0; W.nouziChar.rightLeg.rotation.z = 0;
        }
      }

      // Animate Bibo enthusiastically zooming his toy cars around the track!
      if (W.biboChar) {
        W.biboChar.root.rotation.y = Math.sin(elapsed * 1.4) * 0.7;
        W.biboChar.rightArm.rotation.x = -0.9 + Math.sin(elapsed * 5.0) * 0.35;
        W.biboChar.leftArm.rotation.x = -0.7 + Math.cos(elapsed * 5.0) * 0.25;
      }
      W.biboToyCars.forEach(tc => {
        const u = tc.userData;
        const a = elapsed * 1.85 + u.phase;
        tc.position.set(u.cx + Math.cos(a) * u.radius, 0.06, u.cz + Math.sin(a) * u.radius);
        tc.rotation.y = -a;
      });
    };

    W.getZoneLabel = (x, z) => {
      if (z > 12.2) return 'South Riverbank (Gray Qashqai 🚙)';
      if (z > 5.6) return 'River Bridge 🌉';
      if (x < -2 && z < -4.5) return "Mai's Lasagna Kitchen & Dining 🍝";
      if (x > 2 && z < -4.5) return "Mostafa's TV Lounge 🩺📺";
      if (x < -2) return "Nouzi's Gymnastics Mat 🤸‍♀️";
      if (x > 2) return "Bibo's Toy Car Track 🚗";
      return "Kids' Board Game Table 🎲";
    };

    W.drawMiniMap = (ctx, Wpx, Hpx, toX, toY) => {
      ctx.fillStyle = '#8cc972'; ctx.fillRect(0, 0, Wpx, Hpx);
      // Turquoise river
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(0, toY(6), Wpx, toY(12.2) - toY(6));
      // Bridge
      ctx.fillStyle = '#8c5a3c'; ctx.fillRect(toX(-3), toY(5.6), toX(3) - toX(-3), toY(12.4) - toY(5.6));
      // Riverfront House
      ctx.fillStyle = '#f5e4cc'; ctx.fillRect(toX(-11), toY(-13.8), toX(11) - toX(-11), toY(1.8) - toY(-13.8));
      // Qashqai
      ctx.fillStyle = '#4b5563'; ctx.fillRect(toX(-7), toY(15.5), toX(-2.5) - toX(-7), toY(19) - toY(15.5));
      ctx.fillStyle = '#3d2c1e'; ctx.font = 'bold 7.5px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText("MAI & MOSTAFA'S", toX(0), toY(-10));
      ctx.fillText('BOARD GAME 🎲', toX(0), toY(-3.5));
      ctx.fillText('BRIDGE', toX(0), toY(9.5));
      ctx.fillText('QASHQAI 🚙', toX(-4.8), toY(20.5));
    };

    return W;
  }

  LS.registerWorld('dest_eatery', { build: buildEatery });
  LS.registerWorld('dest_yiwan', { build: buildYiwan });
  LS.registerWorld('dest_cosmo_city', { build: buildCosmoCity });
  LS.registerWorld('dest_grandparents', { build: buildGrandparents });
  LS.registerWorld('dest_mai_mostafa', { build: buildMaiMostafa });
})(window.LailaSalma);
