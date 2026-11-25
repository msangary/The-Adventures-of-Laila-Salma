window.LailaSalma = window.LailaSalma || {};

(function (LS) {
  function safeRun(name, fn) {
    try { fn(); } catch (e) { console.error('[Home:' + name + ']', e); }
  }

  // Cute Ghibli-style neighborhood puppy builder for Hide-and-Seek
  function createHiddenPuppy(furHex, earHex, collarHex) {
    const g = new THREE.Group();
    const furMat = LS.makeToonMat(furHex || 0xd99b52);
    const earMat = LS.makeToonMat(earHex || 0x8f562b);
    const snoutMat = LS.makeToonMat(0xf7e7ce);
    const noseMat = LS.makeToonMat(0x2b1d17);
    const collarMat = LS.makeToonMat(collarHex || 0xe63946);

    const body = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), furMat);
    body.scale.set(0.95, 0.85, 1.32);
    body.position.set(0, 0.28, 0);
    body.castShadow = true;
    g.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.20, 12, 10), furMat);
    head.position.set(0, 0.50, 0.24);
    head.castShadow = true;
    g.add(head);

    const snout = new THREE.Mesh(new THREE.SphereGeometry(0.095, 10, 8), snoutMat);
    snout.scale.set(1.0, 0.78, 1.1);
    snout.position.set(0, 0.46, 0.39);
    g.add(snout);

    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.036, 8, 6), noseMat);
    nose.position.set(0, 0.49, 0.47);
    g.add(nose);

    [-1, 1].forEach(side => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 6), noseMat);
      eye.position.set(side * 0.08, 0.54, 0.39);
      g.add(eye);
      // Floppy puppy ears!
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 8), earMat);
      ear.scale.set(0.55, 1.35, 0.8);
      ear.position.set(side * 0.19, 0.48, 0.20);
      ear.rotation.z = side * 0.28;
      g.add(ear);
    });

    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.028, 8, 16), collarMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 0.39, 0.17);
    g.add(collar);

    [[-0.12, 0.12, 0.16], [0.12, 0.12, 0.16], [-0.12, 0.12, -0.16], [0.12, 0.12, -0.16]].forEach(p => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.042, 0.24, 8), furMat);
      leg.position.set(p[0], p[1], p[2]);
      leg.castShadow = true;
      g.add(leg);
    });

    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.24, 7), earMat);
    tail.position.set(0, 0.38, -0.32);
    tail.rotation.x = -0.65;
    g.add(tail);

    return { root: g, tail: tail };
  }

  // =========================================================================
  // 1. HOME GATED COMMUNITY (home_neighborhood)
  // =========================================================================
  function buildHomeNeighborhood(worldGroup) {
    const W = {
      id: 'home_neighborhood',
      colliders: [],
      zones: [],
      hiddenAnimals: [],
      skyMesh: null,
      mochiBall: null,
      mochiStartPos: new THREE.Vector3(-4.5, 0, 7.5),
      slideStartPos: new THREE.Vector3(24.0, 1.55, 16.4),
      slideEndPos: new THREE.Vector3(24.0, 0.12, 19.2),
      swingSeatPos: new THREE.Vector3(28.2, 0.55, 17.5),
      hopscotchPos: new THREE.Vector3(20.6, 0.065, 19.0),
      swingPivot: null,
      fountainDrops: [],
      diningConfigs: {
        home_restaurant: {
          lailaSeat: new THREE.Vector3(23.5, 0.18, -8.2),
          salmaSeat: new THREE.Vector3(23.5, 0.18, -9.4),
          lailaDishPos: new THREE.Vector3(24.6, 0.78, -8.2),
          salmaDishPos: new THREE.Vector3(24.6, 0.78, -9.4),
          oishiiPos: new THREE.Vector3(24.6, 1.75, -8.8),
          seatYaw: Math.PI / 2,
          camPos: new THREE.Vector3(20.4, 2.35, -8.8),
          camLook: new THREE.Vector3(24.5, 1.05, -8.8),
          caption: 'Family Dinner! 🍽️💛',
          exitPos: new THREE.Vector3(21.5, 0, -8.8)
        }
      }
    };

    function addCollider(x, z, hw, hd) {
      W.colliders.push({ minX: x - hw, maxX: x + hw, minZ: z - hd, maxZ: z + hd });
    }

    W.getGroundHeight = function () { return 0; };

    // Sky Dome + Horizon Hills
    safeRun('sky', () => {
      const sky = new THREE.Mesh(
        new THREE.SphereGeometry(210, 28, 18),
        new THREE.MeshBasicMaterial({ map: LS.createSkyTexture(LS.state.timeMode, 'tokyo'), side: THREE.BackSide })
      );
      worldGroup.add(sky);
      W.skyMesh = sky;
      if (LS.hdAssets && LS.hdAssets.addMountainRange) {
        LS.hdAssets.addMountainRange(worldGroup, 'tokyo');
      }
    });

    // Sunlit Ghibli Meadow & Tree-Lined Community Avenues
    safeRun('ground', () => {
      const grass = new THREE.Mesh(
        new THREE.PlaneGeometry(180, 180),
        LS.makeSurfaceMat(LS.createGrassTexture('tokyo'))
      );
      grass.rotation.x = -Math.PI / 2;
      grass.receiveShadow = true;
      worldGroup.add(grass);

      const roadMat = LS.makeSurfaceMat(LS.createGravelPathTexture());
      // Main North-South Entry Boulevard (Gatehouse Z=36 -> Courtyard Z=3 -> Apartment Z=-12)
      const mainRoad = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 58), roadMat);
      mainRoad.rotation.x = -Math.PI / 2;
      mainRoad.position.set(0, 0.02, 11);
      mainRoad.receiveShadow = true;
      worldGroup.add(mainRoad);

      // East-West Community Avenue (School X=-34 <-> Courtyard X=0 <-> Bella Bistro X=+34)
      const crossRoad = new THREE.Mesh(new THREE.PlaneGeometry(78, 7.6), roadMat);
      crossRoad.rotation.x = -Math.PI / 2;
      crossRoad.position.set(0, 0.022, -4.5);
      crossRoad.receiveShadow = true;
      worldGroup.add(crossRoad);

      // South Park Promenade (linking to Playground at X=+24, Z=+18)
      const parkWalk = new THREE.Mesh(new THREE.PlaneGeometry(34, 4.4), roadMat);
      parkWalk.rotation.x = -Math.PI / 2;
      parkWalk.position.set(14, 0.022, 18.0);
      parkWalk.receiveShadow = true;
      worldGroup.add(parkWalk);

      // Central Cobblestone Fountain Courtyard Plaza
      const plaza = new THREE.Mesh(
        new THREE.CircleGeometry(10.5, 32),
        LS.makeSurfaceMat(LS.createStonePathTexture())
      );
      plaza.rotation.x = -Math.PI / 2;
      plaza.position.set(0, 0.028, 3.0);
      plaza.receiveShadow = true;
      worldGroup.add(plaza);

      // Instanced wind-swept Ghibli grass!
      if (LS.hdAssets && LS.hdAssets.addInstancedGrass) {
        LS.hdAssets.addInstancedGrass(worldGroup, { minX: -52, maxX: 52, minZ: -46, maxZ: 42 }, (x, z) => {
          if (Math.abs(x) < 5.5 && z > -24 && z < 42) return false;
          if (Math.abs(z + 4.5) < 5.0 && Math.abs(x) < 42) return false;
          if (Math.hypot(x, z - 3.0) < 11.4) return false;
          if (x > 14 && x < 34 && z > 10 && z < 26) return false;
          if (x < -19 && x > -42 && z > -24 && z < 2) return false;
          if (x > 19 && x < 42 && z > -22 && z < 2) return false;
          if (Math.abs(x) < 14 && z < -8 && z > -30) return false;
          return true;
        }, 'home');
      }
    });

    // Central Community Fountain (Turquoise Ghibli water + splashing water droplets!)
    safeRun('fountain', () => {
      const fg = new THREE.Group();
      fg.position.set(0, 0, 3.0);
      const stoneMat = LS.makeToonMat(0xe6dfd3);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(2.65, 0.34, 10, 28), stoneMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.36;
      rim.castShadow = true;
      rim.receiveShadow = true;
      fg.add(rim);

      const water = new THREE.Mesh(new THREE.CircleGeometry(2.55, 24), LS.makeWaterMat(0.92));
      water.rotation.x = -Math.PI / 2;
      water.position.y = 0.42;
      fg.add(water);

      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.48, 1.55, 12), stoneMat);
      pillar.position.y = 0.85;
      pillar.castShadow = true;
      fg.add(pillar);

      const basin = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 0.45, 0.36, 16), stoneMat);
      basin.position.y = 1.62;
      basin.castShadow = true;
      fg.add(basin);

      const dropMat = LS.makeToonMat(0xb8f2ff, { transparent: true, opacity: 0.85 });
      for (let i = 0; i < 8; i++) {
        const drop = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), dropMat);
        drop.userData = { angle: (i / 8) * Math.PI * 2, phase: i * 0.4 };
        fg.add(drop);
        W.fountainDrops.push(drop);
      }

      worldGroup.add(fg);
      addCollider(0, 3.0, 2.85, 2.85);
    });

    // -----------------------------------------------------------------------
    // Laila & Salma's Sunlit 3-Story Apartment Building (North Center, Z=-19)
    // -----------------------------------------------------------------------
    safeRun('apartment_building', () => {
      const g = new THREE.Group();
      g.position.set(0, 0, -19.5);

      const creamMat = LS.makeToonMat(0xffffff, { map: LS.createPlasterTexture('#fbf1df') });
      const peachTrim = LS.makeToonMat(0xe8a87c);
      const terraRoof = LS.makeToonMat(0xffffff, { map: LS.createRoofTileTexture('#c25a3c') });
      const woodMat = LS.makeToonMat(0x6e472b);
      const railMat = LS.makeToonMat(0x3a4654);
      const winMat = LS.makeEmissiveMat(0x9bd3f2, 0xffe4a0, 0.32);

      // Main 3-story structure
      const mainBody = new THREE.Mesh(new THREE.BoxGeometry(19.5, 11.4, 11.5), creamMat);
      mainBody.position.y = 5.7;
      mainBody.castShadow = true;
      mainBody.receiveShadow = true;
      g.add(mainBody);

      // Warm terracotta cornice bands between stories
      [3.8, 7.6, 11.4].forEach(y => {
        const band = new THREE.Mesh(new THREE.BoxGeometry(20.1, 0.34, 12.1), peachTrim);
        band.position.y = y;
        g.add(band);
      });

      // Sloped terracotta gable roof
      const roof = new THREE.Mesh(new THREE.ConeGeometry(14.8, 3.2, 4), terraRoof);
      roof.position.y = 13.0;
      roof.rotation.y = Math.PI / 4;
      roof.scale.set(1.06, 1.0, 0.72);
      roof.castShadow = true;
      g.add(roof);

      // Cozy Archway Lobby Entrance & Striped Awning
      const lobbyFrame = new THREE.Mesh(new THREE.BoxGeometry(4.4, 3.4, 0.7), peachTrim);
      lobbyFrame.position.set(0, 1.7, 5.95);
      g.add(lobbyFrame);

      const doorGlass = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.75, 0.25), winMat);
      doorGlass.position.set(0, 1.42, 6.22);
      g.add(doorGlass);
      const doorMull = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.75, 0.3), woodMat);
      doorMull.position.set(0, 1.42, 6.26);
      g.add(doorMull);

      const awning = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.18, 2.0), LS.makeToonMat(0x2a9d8f));
      awning.position.set(0, 3.55, 6.85);
      awning.rotation.x = 0.22;
      awning.castShadow = true;
      g.add(awning);

      // Signboard above lobby
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(6.8, 1.05, 0.18),
        new THREE.MeshBasicMaterial({
          map: LS.createSignTexture("🏡 SUNNYSIDE APARTMENTS — LAILA & SALMA'S HOME", {
            bg: '#fff8ec', border: '#2a9d8f', color: '#2b3a34', font: 'bold 20px sans-serif', width: 640, height: 110
          })
        })
      );
      sign.position.set(0, 4.55, 5.95);
      g.add(sign);

      // 2nd & 3rd floor windows + flower-box balconies!
      [-6.2, 0, 6.2].forEach((bx, bi) => {
        [5.6, 9.4].forEach(by => {
          const w = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.9, 0.2), winMat);
          w.position.set(bx, by, 5.82);
          g.add(w);
          const wf = new THREE.Mesh(new THREE.BoxGeometry(3.05, 2.1, 0.12), woodMat);
          wf.position.set(bx, by, 5.78);
          g.add(wf);

          // Balcony slab & wrought-iron rail
          if (!(bx === 0 && by < 7)) {
            const slab = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.22, 1.35), peachTrim);
            slab.position.set(bx, by - 1.15, 6.38);
            slab.castShadow = true;
            g.add(slab);
            const rail = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.78, 0.12), railMat);
            rail.position.set(bx, by - 0.65, 6.98);
            g.add(rail);
            // Flower box on balcony!
            const fbox = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.34, 0.34), LS.makeToonMat(0xb86643));
            fbox.position.set(bx, by - 0.42, 7.06);
            g.add(fbox);
            const blooms = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 6), LS.makeToonMat(bi === 1 ? 0xff8fab : 0xffd166));
            blooms.scale.set(2.5, 0.85, 0.9);
            blooms.position.set(bx, by - 0.18, 7.08);
            g.add(blooms);
          }
        });
      });

      // Ground-floor side windows & welcome mat
      [-6.2, 6.2].forEach(bx => {
        const w = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.8, 0.2), winMat);
        w.position.set(bx, 2.0, 5.82);
        g.add(w);
      });

      const mat = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.05, 1.5), LS.makeToonMat(0xe07a5f));
      mat.position.set(0, 0.03, 7.35);
      g.add(mat);

      worldGroup.add(g);
      addCollider(0, -19.5, 10.1, 6.2);

      W.zones.push({
        id: 'enter_home_apartment',
        label: "Step Inside Laila & Salma's Apartment 🏡🎹",
        pos: new THREE.Vector3(0, 0, -11.4),
        radius: 3.4
      });
    });

    // -----------------------------------------------------------------------
    // Nearby Real-Life Neighborhood School (West, X=-31, Z=-12)
    // -----------------------------------------------------------------------
    safeRun('home_school', () => {
      const g = new THREE.Group();
      g.position.set(-31.0, 0, -12.0);
      g.rotation.y = Math.PI / 2;

      const wallMat = LS.makeToonMat(0xffffff, { map: LS.createPlasterTexture('#f6e6cf') });
      const brickMat = LS.makeToonMat(0xb85842);
      const roofMat = LS.makeToonMat(0xffffff, { map: LS.createRoofTileTexture('#3f5c78') });
      const winMat = LS.makeEmissiveMat(0x9bd3f2, 0xffe8b0, 0.3);

      const body = new THREE.Mesh(new THREE.BoxGeometry(15.0, 6.8, 9.2), wallMat);
      body.position.y = 3.4;
      body.castShadow = true;
      body.receiveShadow = true;
      g.add(body);

      const baseBrick = new THREE.Mesh(new THREE.BoxGeometry(15.3, 1.4, 9.5), brickMat);
      baseBrick.position.y = 0.7;
      g.add(baseBrick);

      const roof = new THREE.Mesh(new THREE.ConeGeometry(11.6, 2.8, 4), roofMat);
      roof.position.y = 8.2;
      roof.rotation.y = Math.PI / 4;
      roof.scale.set(1.06, 1.0, 0.72);
      roof.castShadow = true;
      g.add(roof);

      // Cute School Bell Tower + Round Clock Face!
      const tower = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.0, 2.6), wallMat);
      tower.position.set(0, 9.4, 2.2);
      tower.castShadow = true;
      g.add(tower);
      const tRoof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.8, 4), roofMat);
      tRoof.position.set(0, 11.8, 2.2);
      tRoof.rotation.y = Math.PI / 4;
      g.add(tRoof);
      const clockFace = new THREE.Mesh(new THREE.CircleGeometry(0.72, 18), LS.makeToonMat(0xfffdf5));
      clockFace.position.set(0, 9.4, 3.54);
      g.add(clockFace);

      // Front Door & Windows
      const door = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.6, 0.24), LS.makeToonMat(0x2e6f5e));
      door.position.set(0, 1.35, 4.68);
      g.add(door);

      [-4.8, 4.8].forEach(wx => {
        [2.4, 5.0].forEach(wy => {
          const w = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.5, 0.2), winMat);
          w.position.set(wx, wy, 4.65);
          g.add(w);
        });
      });

      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(6.4, 1.0, 0.18),
        new THREE.MeshBasicMaterial({
          map: LS.createSignTexture('🏫 SUNNY OAKS NEIGHBORHOOD SCHOOL', {
            bg: '#f2f9f5', border: '#2e6f5e', color: '#1b4332', font: 'bold 26px sans-serif', width: 580, height: 110
          })
        })
      );
      sign.position.set(0, 4.0, 4.78);
      g.add(sign);

      worldGroup.add(g);
      addCollider(-31.0, -12.0, 5.2, 8.0);

      W.zones.push({
        id: 'home_school',
        label: 'Attend Sunny Oaks School Quiz (Ms. Nadia) 🏫',
        pos: new THREE.Vector3(-23.8, 0, -12.0),
        radius: 3.6
      });
    });

    // -----------------------------------------------------------------------
    // Family Dinner Restaurant — Bella Bistro (East, X=+31, Z=-10)
    // -----------------------------------------------------------------------
    safeRun('home_restaurant', () => {
      const g = new THREE.Group();
      g.position.set(31.0, 0, -10.0);
      g.rotation.y = -Math.PI / 2;

      const wallMat = LS.makeToonMat(0xffffff, { map: LS.createPlasterTexture('#fde8cd') });
      const roofMat = LS.makeToonMat(0xffffff, { map: LS.createRoofTileTexture('#a63c32') });
      const woodMat = LS.makeToonMat(0x5e3a22);
      const winMat = LS.makeEmissiveMat(0xffe7b2, 0xffc663, 0.56);

      const body = new THREE.Mesh(new THREE.BoxGeometry(12.6, 5.4, 8.4), wallMat);
      body.position.y = 2.7;
      body.castShadow = true;
      body.receiveShadow = true;
      g.add(body);

      const roof = new THREE.Mesh(new THREE.ConeGeometry(9.6, 2.4, 4), roofMat);
      roof.position.y = 6.6;
      roof.rotation.y = Math.PI / 4;
      roof.scale.set(1.06, 1.0, 0.76);
      roof.castShadow = true;
      g.add(roof);

      // Burgundy & cream striped bistro awning
      const awning = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.18, 2.2), LS.makeToonMat(0xb8333a));
      awning.position.set(0, 3.2, 5.1);
      awning.rotation.x = 0.24;
      awning.castShadow = true;
      g.add(awning);

      // Warm glowing bistro windows & wood entrance
      [-3.6, 3.6].forEach(wx => {
        const w = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.85, 0.2), winMat);
        w.position.set(wx, 1.9, 4.25);
        g.add(w);
      });
      const door = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.5, 0.22), woodMat);
      door.position.set(0, 1.28, 4.26);
      g.add(door);

      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(6.4, 1.0, 0.18),
        new THREE.MeshBasicMaterial({
          map: LS.createSignTexture('🍽️ BELLA BISTRO • FAMILY DINNER', {
            bg: '#fff6ea', border: '#b8333a', color: '#6b1d22', font: 'bold 28px sans-serif', width: 580, height: 110
          })
        })
      );
      sign.position.set(0, 4.45, 4.35);
      g.add(sign);

      // Glowing patio lanterns!
      [-4.2, -1.4, 1.4, 4.2].forEach(lx => {
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffe7a8 }));
        bulb.position.set(lx, 3.15, 6.25);
        g.add(bulb);
        if (LS.createGlowSprite) {
          const halo = LS.createGlowSprite(0xffd27d, 1.35);
          halo.position.copy(bulb.position);
          g.add(halo);
        }
      });

      worldGroup.add(g);
      addCollider(31.0, -10.0, 4.8, 6.8);

      // Cozy Outdoor Family Dinner Patio Table (X=24.8, Z=-8.8)
      const tableG = new THREE.Group();
      tableG.position.set(24.8, 0, -8.8);
      const tLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 0.72, 10), woodMat);
      tLeg.position.y = 0.36;
      tableG.add(tLeg);
      const tTop = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.1, 2.3), LS.makeToonMat(0xfff5e4));
      tTop.position.y = 0.74;
      tTop.castShadow = true;
      tableG.add(tTop);
      const runner = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.11, 2.32), LS.makeToonMat(0xb8333a));
      runner.position.y = 0.745;
      tableG.add(runner);
      // Candle & chairs
      const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.18, 8), LS.makeEmissiveMat(0xfff4d0, 0xffcc66, 0.85));
      candle.position.set(0, 0.88, 0);
      tableG.add(candle);
      [[-1.1, -0.6], [-1.1, 0.6], [1.1, -0.6], [1.1, 0.6]].forEach(ch => {
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.45, 0.52), woodMat);
        seat.position.set(ch[0], 0.225, ch[1]);
        tableG.add(seat);
      });
      worldGroup.add(tableG);
      addCollider(24.8, -8.8, 0.95, 1.3);

      W.zones.push({
        id: 'home_restaurant',
        label: 'Have Family Dinner at Bella Bistro 🍽️',
        pos: new THREE.Vector3(21.6, 0, -8.8),
        radius: 3.5
      });
    });

    // -----------------------------------------------------------------------
    // Gated Community Security Gatehouse & Stone Perimeter Wall!
    // -----------------------------------------------------------------------
    safeRun('gated_wall', () => {
      const wallMat = LS.makeToonMat(0xebe2d3);
      const capMat = LS.makeToonMat(0xc46b4b);
      const ironMat = LS.makeToonMat(0x2d3748);
      const hedgeMat = LS.makeToonMat(0x4b9349);
      const flowerMat = LS.makeToonMat(0xff7aa2);

      function addWallSpan(x1, z1, x2, z2) {
        const len = Math.hypot(x2 - x1, z2 - z1);
        const mx = (x1 + x2) * 0.5, mz = (z1 + z2) * 0.5;
        const ang = Math.atan2(x2 - x1, z2 - z1);
        const g = new THREE.Group();
        g.position.set(mx, 0, mz);
        g.rotation.y = ang;
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.35, len), wallMat);
        base.position.y = 0.68; base.castShadow = true; base.receiveShadow = true; g.add(base);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.16, len), capMat);
        cap.position.y = 1.42; g.add(cap);
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.95, len), ironMat);
        rail.position.y = 1.92; g.add(rail);
        // Bougainvillea hedges along inside!
        const hedge = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.95, len * 0.92), hedgeMat);
        hedge.position.set(0.65, 0.48, 0); g.add(hedge);
        for (let t = -len * 0.4; t <= len * 0.4; t += 4.5) {
          const bl = new THREE.Mesh(new THREE.DodecahedronGeometry(0.36, 0), flowerMat);
          bl.position.set(0.68, 1.02, t);
          g.add(bl);
        }
        worldGroup.add(g);
      }

      // South Gated Wall (leaving wide open Security Gate entrance at X=-6..+6, Z=36)
      addWallSpan(-48, 36, -6.5, 36);
      addWallSpan(6.5, 36, 48, 36);
      // West, East & North perimeter walls
      addWallSpan(-48, -36, -48, 36);
      addWallSpan(48, -36, 48, 36);
      addWallSpan(-48, -36, 48, -36);

      // Ornate Gate Pillars & Archway + Security Gatehouse at Z=36!
      [-6.5, 6.5].forEach(px => {
        const pil = new THREE.Mesh(new THREE.BoxGeometry(1.3, 4.4, 1.3), wallMat);
        pil.position.set(px, 2.2, 36); pil.castShadow = true; worldGroup.add(pil);
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffe6a3 }));
        lamp.position.set(px, 4.65, 36); worldGroup.add(lamp);
        addCollider(px, 36, 0.85, 0.85);
      });
      const gateArch = new THREE.Mesh(
        new THREE.BoxGeometry(14.2, 1.1, 0.45),
        new THREE.MeshBasicMaterial({
          map: LS.createSignTexture('🌿 SUNNYSIDE GATED COMMUNITY 🏡', {
            bg: '#234e44', border: '#e9c46a', color: '#fff8e7', font: 'bold 34px sans-serif', width: 640, height: 110
          })
        })
      );
      gateArch.position.set(0, 4.6, 36);
      worldGroup.add(gateArch);

      // Guard Booth on right side of Gate
      const booth = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.0, 3.0), wallMat);
      booth.position.set(9.2, 1.5, 34.2); booth.castShadow = true; worldGroup.add(booth);
      const boothRoof = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.1, 4), capMat);
      boothRoof.position.set(9.2, 3.55, 34.2); boothRoof.rotation.y = Math.PI / 4; worldGroup.add(boothRoof);
      addCollider(9.2, 34.2, 1.8, 1.8);
    });

    // -----------------------------------------------------------------------
    // Neighboring Community Apartment Villas & Playground!
    // -----------------------------------------------------------------------
    safeRun('neighbors_and_park', () => {
      function addNeighborVilla(x, z, rotY, wallHex, roofHex) {
        const g = new THREE.Group();
        g.position.set(x, 0, z);
        g.rotation.y = rotY;
        const body = new THREE.Mesh(new THREE.BoxGeometry(10.5, 7.2, 7.6), LS.makeToonMat(0xffffff, { map: LS.createPlasterTexture(wallHex) }));
        body.position.y = 3.6; body.castShadow = true; body.receiveShadow = true; g.add(body);
        const roof = new THREE.Mesh(new THREE.ConeGeometry(8.2, 2.3, 4), LS.makeToonMat(0xffffff, { map: LS.createRoofTileTexture(roofHex) }));
        roof.position.y = 8.3; roof.rotation.y = Math.PI / 4; roof.scale.set(1.06, 1, 0.78); roof.castShadow = true; g.add(roof);
        const winMat = LS.makeEmissiveMat(0x9bd3f2, 0xffe4a0, 0.28);
        [-2.8, 2.8].forEach(wx => {
          [2.1, 5.2].forEach(wy => {
            const w = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.4, 0.18), winMat);
            w.position.set(wx, wy, 3.85); g.add(w);
          });
        });
        worldGroup.add(g);
        addCollider(x, z, 5.4, 4.4);
      }

      addNeighborVilla(-28, 18, Math.PI / 2, '#f9efe0', '#c46b4b');
      addNeighborVilla(-24, -29, 0, '#eef5ec', '#4a6b5d');
      addNeighborVilla(24, -29, 0, '#faf0eb', '#b85c48');

      // Community Pocket Playground (East South: X=24, Z=18)
      const pgPad = new THREE.Mesh(new THREE.BoxGeometry(14.5, 0.08, 10.5), LS.makeToonMat(0xe8d5b0));
      pgPad.position.set(24.5, 0.04, 18.0);
      pgPad.receiveShadow = true;
      worldGroup.add(pgPad);

      // Slide
      const slideMat = LS.makeToonMat(0xf4a261);
      const slidePost = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.7, 1.2), LS.makeToonMat(0x2a9d8f));
      slidePost.position.set(24.0, 0.85, 16.0); slidePost.castShadow = true; worldGroup.add(slidePost);
      const chute = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.12, 3.2), slideMat);
      chute.position.set(24.0, 0.9, 17.7); chute.rotation.x = 0.52; chute.castShadow = true; worldGroup.add(chute);
      W.zones.push({ id: 'park_slide', label: 'Slide Together at Community Park 🛝', pos: new THREE.Vector3(24.0, 0, 19.3), radius: 2.6 });

      // Swing
      const swFrame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.14, 0.14), LS.makeToonMat(0x457b9d));
      swFrame.position.set(28.2, 2.45, 17.5); worldGroup.add(swFrame);
      [-1.1, 1.1].forEach(sx => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 2.5, 7), LS.makeToonMat(0x457b9d));
        leg.position.set(28.2 + sx, 1.25, 17.5); worldGroup.add(leg);
      });
      const pivot = new THREE.Group();
      pivot.position.set(28.2, 2.42, 17.5);
      const swSeat = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.08, 0.36), LS.makeToonMat(0xe76f51));
      swSeat.position.y = -1.85; pivot.add(swSeat);
      worldGroup.add(pivot);
      W.swingPivot = pivot;
      W.zones.push({ id: 'park_swing', label: 'Swing High Together 🎠', pos: new THREE.Vector3(28.2, 0, 19.0), radius: 2.5 });

      // Hopscotch
      for (let i = 0; i < 6; i++) {
        const sq = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.05, 0.62), LS.makeToonMat(i % 2 === 0 ? 0xffb3c6 : 0x90e0ef));
        sq.position.set(20.6, 0.08, 17.5 + i * 0.66);
        worldGroup.add(sq);
      }
      W.zones.push({ id: 'park_hopscotch', label: 'Play Community Hopscotch 🎯', pos: new THREE.Vector3(20.6, 0, 19.2), radius: 2.4 });

      // Cozy Community Benches & Street Lamps
      [[-8.5, 3.0, Math.PI / 2], [8.5, 3.0, -Math.PI / 2], [0, 14.5, Math.PI]].forEach(b => {
        const bench = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.55, 0.68), LS.makeToonMat(0x8c5a3c));
        bench.position.set(b[0], 0.28, b[1]); bench.rotation.y = b[2]; bench.castShadow = true;
        worldGroup.add(bench);
      });
    });

    // Organic Studio Ghibli Leaf-Cluster Trees lining every avenue!
    safeRun('trees', () => {
      const treeCoords = [
        [-11, -10, 'sakura', 1.15], [11, -10, 'sakura', 1.15],
        [-13, 10, 'green', 1.2], [13, 10, 'olive', 1.18],
        [-13, 24, 'gold', 1.1], [13, 24, 'green', 1.15],
        [-20, -2, 'green', 1.05], [20, -2, 'olive', 1.08],
        [-38, 4, 'sakura', 1.25], [38, 6, 'gold', 1.22],
        [-36, -26, 'green', 1.3], [36, -24, 'green', 1.28],
        [-16, -30, 'olive', 1.15], [16, -30, 'sakura', 1.18],
        [-38, 28, 'green', 1.22], [38, 28, 'sakura', 1.2]
      ];
      treeCoords.forEach(tc => {
        const tree = (LS.ghibli && LS.ghibli.buildGhibliTree)
          ? LS.ghibli.buildGhibliTree(tc[2], tc[3])
          : new THREE.Group();
        tree.position.set(tc[0], 0, tc[1]);
        worldGroup.add(tree);
        addCollider(tc[0], tc[1], 0.55, 0.55);
      });
    });

    // Friendly Community NPCs (Ms. Nadia at School, Uncle Tariq at Gate, Auntie Farah by Plaza, Mom & Dad at Bistro Patio!)
    safeRun('npcs', () => {
      LS.spawnWorldNPCs(worldGroup, [
        {
          name: 'Ms. Nadia (Teacher)',
          line: 'Good morning Laila & Salma! Ready for a fun quiz at Sunny Oaks School? 🏫✨',
          pos: new THREE.Vector3(-23.2, 0, -10.0),
          baseRot: Math.PI / 2,
          waveOnNear: true,
          char: { scale: 0.94, skinColor: 0xe6b595, hairColor: 0x2c1d16, topColor: 0x2a9d8f, bottomColor: 0x264653, longHair: true }
        },
        {
          name: 'Chef Mario',
          line: 'Buonasera Laila & Salma! Your family table at Bella Bistro is ready! 🍝🍽️',
          pos: new THREE.Vector3(24.5, 0, -5.6),
          baseRot: -Math.PI / 2,
          waveOnNear: true,
          char: { scale: 0.96, skinColor: 0xf4ccb2, hairColor: 0x3b2c25, topColor: 0xffffff, bottomColor: 0x2b2d42, pants: true, faceOpts: { mustache: true } }
        },
        {
          name: 'Uncle Tariq (Gate)',
          line: 'Welcome home to Sunnyside Gated Community, Laila & Salma! Have a sunny day! 🛡️☀️',
          pos: new THREE.Vector3(6.2, 0, 32.5),
          baseRot: -Math.PI * 0.75,
          waveOnNear: true,
          char: { scale: 0.98, skinColor: 0xcf9b78, hairColor: 0x1f1b1a, topColor: 0x3b5998, bottomColor: 0x1e293b, pants: true, hatType: 'cap', hatColor: 0x1e3a8a }
        },
        {
          name: 'Auntie Farah',
          line: 'I heard Laila playing the piano from the courtyard — it sounded magical! 🎹🌸',
          pos: new THREE.Vector3(-8.2, 0, 12.0),
          baseRot: Math.PI * 0.35,
          patrol: { axis: 'z', center: 12.0, range: 5.5, speed: 1.1 },
          char: { scale: 0.92, skinColor: 0xe2b090, hairColor: 0x2c1e1a, topColor: 0xe07a5f, bottomColor: 0x4a5568, hairBun: true }
        }
      ]);
    });

    // 5 Playful Hiding Neighborhood Puppies!
    safeRun('puppies', () => {
      const spotPool = [
        { pos: [-11.5, 0, -14.5], hint: 'sniffing flowers by our Apartment corner' },
        { pos: [11.8, 0, -14.0], hint: 'wagging its tail near the East Apartment balcony' },
        { pos: [-26.0, 0, -2.5], hint: 'waiting by Sunny Oaks School courtyard' },
        { pos: [26.5, 0, -15.5], hint: 'smelling delicious pasta behind Bella Bistro' },
        { pos: [27.0, 0, 23.0], hint: 'playing near the Community Playground swings' },
        { pos: [-16.0, 0, 26.0], hint: 'napping under a shady tree near the South Gate' },
        { pos: [16.5, 0, 28.0], hint: 'greeting Uncle Tariq by the Gatehouse garden' }
      ];
      const names = ['Biscuit', 'Coco', 'Sunny', 'Waffles', 'Peanut'];
      const furs = [0xd99b52, 0x8c5630, 0xf2d08a, 0xc97b42, 0xbfa58a];
      const ears = [0x8f562b, 0x4f2e18, 0xc79948, 0x7d4520, 0x6b5642];
      const collars = [0xe63946, 0x2a9d8f, 0x3a86ff, 0xff006e, 0xf59e0b];
      const chosen = LS.pickRoundSpots(spotPool, LS.state.homePetsRound || 0, 5);
      const foundList = LS.state.foundHomePets || [];

      chosen.forEach((spot, idx) => {
        const id = 'home_pup_' + idx;
        const pup = createHiddenPuppy(furs[idx], ears[idx], collars[idx]);
        pup.root.position.set(spot.pos[0], 0, spot.pos[2]);
        pup.root.rotation.y = idx * 1.1;
        const already = foundList.includes(id);
        pup.root.visible = !already;
        worldGroup.add(pup.root);

        W.hiddenAnimals.push({
          id: id,
          name: names[idx] + ' the Puppy',
          hint: spot.hint,
          mesh: pup.root,
          tail: pup.tail,
          found: already
        });
        if (!already) {
          W.zones.push({
            id: 'animal:' + id,
            label: 'Pet ' + names[idx] + ' the Puppy 🐶',
            pos: new THREE.Vector3(spot.pos[0], 0, spot.pos[2]),
            radius: 2.6
          });
        }
      });
    });

    // Mochi Fetch Ball
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), LS.makeToonMat(0xfacc15));
    ball.position.set(-4.5, 0.16, 8.8);
    ball.visible = false;
    worldGroup.add(ball);
    W.mochiBall = ball;

    W.getMochiIdleAnchor = function () {
      return { pos: new THREE.Vector3(-4.5, 0, 7.5), rotY: 0.4 };
    };

    W.getZoneLabel = function (x, z) {
      if (z < -10 && Math.abs(x) < 14) return "Sunnyside Apartments (Home)";
      if (x < -18 && z < 4) return "Sunny Oaks School Campus";
      if (x > 18 && z < 4) return "Bella Bistro Family Restaurant";
      if (x > 14 && z > 10) return "Community Playground";
      if (z > 28) return "Gated Community Entrance";
      return "Sunnyside Fountain Courtyard";
    };

    W.update = function (dt, elapsed) {
      // Animate fountain water arcs
      W.fountainDrops.forEach(d => {
        const t = ((elapsed * 1.3 + d.userData.phase) % 1.0);
        const r = 0.25 + t * 1.65;
        const y = 1.75 + Math.sin(t * Math.PI) * 1.1 - t * 1.25;
        d.position.set(Math.cos(d.userData.angle) * r, Math.max(0.42, y), Math.sin(d.userData.angle) * r);
      });
      if (W.swingPivot) {
        W.swingPivot.rotation.x = Math.sin(elapsed * 2.1) * 0.22;
      }
      W.hiddenAnimals.forEach((a, i) => {
        if (!a.found && a.tail) a.tail.rotation.z = Math.sin(elapsed * 9 + i) * 0.45;
      });
    };

    W.drawMiniMap = function (ctx, Wpx, Hpx, toX, toY) {
      ctx.fillStyle = '#8cc972';
      ctx.fillRect(0, 0, Wpx, Hpx);
      // Roads
      ctx.fillStyle = '#d9ccb2';
      ctx.fillRect(toX(-4.5), toY(-18), toX(4.5) - toX(-4.5), toY(40) - toY(-18));
      ctx.fillRect(toX(-38), toY(-8.5), toX(38) - toX(-38), toY(-0.5) - toY(-8.5));
      ctx.fillRect(toX(0), toY(16), toX(30) - toX(0), toY(20) - toY(16));
      // Fountain circle
      ctx.fillStyle = '#56cfe1';
      ctx.beginPath(); ctx.arc(toX(0), toY(3), 5.5, 0, Math.PI * 2); ctx.fill();
      // Landmarks
      ctx.fillStyle = '#e07a5f'; ctx.fillRect(toX(-10), toY(-26), toX(10) - toX(-10), toY(-13) - toY(-26)); // Apartment
      ctx.fillStyle = '#2e6f5e'; ctx.fillRect(toX(-36), toY(-20), toX(-26) - toX(-36), toY(-4) - toY(-20)); // School
      ctx.fillStyle = '#b8333a'; ctx.fillRect(toX(26), toY(-17), toX(36) - toX(26), toY(-3) - toY(-17)); // Restaurant
      ctx.fillStyle = '#f4a261'; ctx.fillRect(toX(18), toY(13), toX(31) - toX(18), toY(23) - toY(13)); // Park
      // Labels
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('HOME', toX(0), toY(-18));
      ctx.fillText('SCHOOL', toX(-31), toY(-11));
      ctx.fillText('BISTRO', toX(31), toY(-9));
      ctx.fillText('PARK', toX(24.5), toY(19));
    };

    return W;
  }

  // =========================================================================
  // 2. LAILA & SALMA'S 4-ROOM 3D APARTMENT INTERIOR (home_apartment)
  //    NW: Kitchen | NE: Dining Room + Piano + Mom & Dad
  //    SW: TV & Game Room | SE: Sisters' Bedroom + Magic World Globe!
  // =========================================================================
  function buildHomeApartment(worldGroup) {
    const W = {
      id: 'home_apartment',
      isInterior: true,
      colliders: [],
      zones: [],
      hiddenAnimals: [],
      magicGlobe: null,
      globeRing: null,
      tvScreenMat: null,
      tvCanvas: null,
      tvCtx: null,
      coffeeSteams: []
    };

    function addCol(x, z, hw, hd) {
      W.colliders.push({ minX: x - hw, maxX: x + hw, minZ: z - hd, maxZ: z + hd });
    }

    W.getGroundHeight = function () { return 0; };

    // Warm Honey-Oak Floor & Cream Ghibli Walls (20m x 16m, H = 4.5m)
    const floorMat = LS.makeSurfaceMat(LS.createCedarPlankTexture(), { color: 0xe6c89c });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 16), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    worldGroup.add(floor);

    const wallMat = LS.makeToonMat(0xffffff, { map: LS.createPlasterTexture('#fbf2e3') });
    const trimMat = LS.makeToonMat(0x8c5e3c);
    const ceilMat = LS.makeToonMat(0xfffaf0);

    // Outer 4 walls
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(20.2, 4.6, 0.3), wallMat);
    backWall.position.set(0, 2.3, -8.0); worldGroup.add(backWall);
    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(20.2, 4.6, 0.3), wallMat);
    frontWall.position.set(0, 2.3, 8.0); worldGroup.add(frontWall);
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.6, 16.2), wallMat);
    leftWall.position.set(-10.0, 2.3, 0); worldGroup.add(leftWall);
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.6, 16.2), wallMat);
    rightWall.position.set(10.0, 2.3, 0); worldGroup.add(rightWall);

    // Subtle open-plan dividing pillars & header beams defining the 4 rooms cleanly!
    const divMat = LS.makeToonMat(0xf4e4cc);
    // North divider between Kitchen (NW) & Dining Room (NE)
    const northDiv = new THREE.Mesh(new THREE.BoxGeometry(0.28, 4.4, 3.6), divMat);
    northDiv.position.set(-0.6, 2.2, -6.1); worldGroup.add(northDiv);
    addCol(-0.6, -6.1, 0.35, 1.9);

    // West horizontal stub between Kitchen (NW) & TV Room (SW)
    const westDiv = new THREE.Mesh(new THREE.BoxGeometry(3.4, 4.4, 0.28), divMat);
    westDiv.position.set(-8.2, 2.2, 0.0); worldGroup.add(westDiv);
    addCol(-8.2, 0.0, 1.8, 0.35);

    // East horizontal stub between Dining Room (NE) & Bedroom (SE)
    const eastDiv = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.4, 0.28), divMat);
    eastDiv.position.set(8.3, 2.2, 0.0); worldGroup.add(eastDiv);
    addCol(8.3, 0.0, 1.7, 0.35);

    // Ceiling
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(20, 16), ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = 4.55;
    worldGroup.add(ceil);

    // Sunlit Ghibli Apartment Windows along North wall!
    const winSkyMat = LS.makeEmissiveMat(0xa8e0ff, 0xffeeb8, 0.55);
    [-5.4, 4.6].forEach(wx => {
      const wf = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.1, 0.14), trimMat);
      wf.position.set(wx, 2.45, -7.82); worldGroup.add(wf);
      const wg = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.75, 0.16), winSkyMat);
      wg.position.set(wx, 2.45, -7.80); worldGroup.add(wg);
    });

    // -----------------------------------------------------------------------
    // ROOM 1: KITCHEN (Northwest — Healthy Snacks!)
    // -----------------------------------------------------------------------
    const cabMat = LS.makeToonMat(0xdce8dc);
    const topMat = LS.makeToonMat(0xd9a773);

    // Back Kitchen Counter & Upper Cabinets
    const kCounter = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.92, 1.15), cabMat);
    kCounter.position.set(-6.4, 0.46, -7.2); kCounter.castShadow = true; worldGroup.add(kCounter);
    const kTop = new THREE.Mesh(new THREE.BoxGeometry(6.3, 0.1, 1.25), topMat);
    kTop.position.set(-6.4, 0.96, -7.2); worldGroup.add(kTop);
    addCol(-6.4, -7.2, 3.2, 0.75);

    // Mint Retro Ghibli Fridge!
    const fridge = new THREE.Mesh(new THREE.BoxGeometry(1.35, 2.35, 1.1), LS.makeToonMat(0xa8dadc));
    fridge.position.set(-2.3, 1.18, -7.2); fridge.castShadow = true; worldGroup.add(fridge);
    const fHandle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.1), LS.makeToonMat(0x4a5568));
    fHandle.position.set(-2.82, 1.5, -6.62); worldGroup.add(fHandle);
    addCol(-2.3, -7.2, 0.8, 0.7);

    // Healthy Snack Kitchen Island with Fruit Bowl (apples, berries, yogurt!)
    const island = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.9, 1.35), cabMat);
    island.position.set(-5.4, 0.45, -3.4); island.castShadow = true; worldGroup.add(island);
    const iTop = new THREE.Mesh(new THREE.BoxGeometry(2.75, 0.1, 1.48), topMat);
    iTop.position.set(-5.4, 0.95, -3.4); worldGroup.add(iTop);
    addCol(-5.4, -3.4, 1.45, 0.85);

    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.24, 0.18, 14), LS.makeToonMat(0xfff5e4));
    bowl.position.set(-5.4, 1.08, -3.4); worldGroup.add(bowl);
    [[0, 0, 0xe63946], [0.14, 0.06, 0x70e000], [-0.14, 0.05, 0xffd166], [0.02, -0.14, 0xff5d8f]].forEach(fr => {
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), LS.makeToonMat(fr[2]));
      f.position.set(-5.4 + fr[0], 1.22, -3.4 + fr[1]);
      worldGroup.add(f);
    });

    const kitchenSign = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.52, 0.08),
      new THREE.MeshBasicMaterial({ map: LS.createSignTexture('🍎 HEALTHY KITCHEN', { bg: '#eef7ee', border: '#4b9349', color: '#1b4332', font: 'bold 30px sans-serif' }) })
    );
    kitchenSign.position.set(-6.0, 2.6, -7.82); worldGroup.add(kitchenSign);

    W.zones.push({
      id: 'home_kitchen_snack',
      label: 'Grab a Healthy Snack in the Kitchen 🍎🫐',
      pos: new THREE.Vector3(-5.4, 0, -1.7),
      radius: 2.5
    });

    // -----------------------------------------------------------------------
    // ROOM 2: DINING ROOM + LAILA'S PIANO + MOM & DAD HAVING COFFEE (Northeast)
    // -----------------------------------------------------------------------
    // Laila's Upright Mahogany Piano against East Wall (X=8.6, Z=-4.6)
    const pianoG = new THREE.Group();
    pianoG.position.set(8.6, 0, -4.6);
    pianoG.rotation.y = -Math.PI / 2;
    const mahogMat = LS.makeToonMat(0x4a2518);
    const pBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.48, 0.82), mahogMat);
    pBody.position.y = 0.74; pBody.castShadow = true; pianoG.add(pBody);
    const pKeyBed = new THREE.Mesh(new THREE.BoxGeometry(2.34, 0.16, 0.48), mahogMat);
    pKeyBed.position.set(0, 0.82, 0.56); pianoG.add(pKeyBed);
    const whiteKeys = new THREE.Mesh(new THREE.BoxGeometry(2.14, 0.06, 0.34), LS.makeToonMat(0xfffdf8));
    whiteKeys.position.set(0, 0.92, 0.58); pianoG.add(whiteKeys);
    for (let k = -0.9; k <= 0.9; k += 0.26) {
      const bk = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 0.2), LS.makeToonMat(0x1a1a1a));
      bk.position.set(k, 0.95, 0.50); pianoG.add(bk);
    }
    const sheet = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.44, 0.04), LS.makeToonMat(0xfffaf0));
    sheet.position.set(0, 1.32, 0.44); sheet.rotation.x = -0.18; pianoG.add(sheet);
    // Piano Bench
    const bench = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.52, 0.45), mahogMat);
    bench.position.set(0, 0.26, 1.18); pianoG.add(bench);
    worldGroup.add(pianoG);
    addCol(8.6, -4.6, 0.9, 1.35);

    W.zones.push({
      id: 'home_piano',
      label: "Play Laila's Piano for Mom & Dad 🎹✨",
      pos: new THREE.Vector3(6.6, 0, -4.6),
      radius: 2.3
    });

    // Dining Table with Mom & Dad enjoying warm coffee! (X=3.6, Z=-3.4)
    const dinG = new THREE.Group();
    dinG.position.set(3.6, 0, -3.4);
    const dTop = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.12, 1.65), trimMat);
    dTop.position.y = 0.82; dTop.castShadow = true; dinG.add(dTop);
    [[-1.05, -0.68], [1.05, -0.68], [-1.05, 0.68], [1.05, 0.68]].forEach(leg => {
      const l = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.82, 8), trimMat);
      l.position.set(leg[0], 0.41, leg[1]); dinG.add(l);
    });
    // Steaming coffee mugs + ceramic pot!
    const mugMat = LS.makeToonMat(0xfff7ed);
    [[-0.65, 0], [0.65, 0]].forEach((m, idx) => {
      const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.14, 10), mugMat);
      mug.position.set(m[0], 0.95, m[1]); dinG.add(mug);
      const coffee = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.02, 10), LS.makeToonMat(0x4a2c1d));
      coffee.position.set(m[0], 1.02, m[1]); dinG.add(coffee);
      const steam = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6), LS.makeToonMat(0xffffff, { transparent: true, opacity: 0.48 }));
      steam.position.set(3.6 + m[0], 1.15, -3.4 + m[1]);
      steam.userData = { baseY: 1.15, phase: idx * 2.1 };
      worldGroup.add(steam);
      W.coffeeSteams.push(steam);
    });
    const pot = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), LS.makeToonMat(0xe07a5f));
    pot.position.set(0, 1.0, 0); dinG.add(pot);
    // Dining chairs for Mom & Dad
    [[-1.45, 0], [1.45, 0]].forEach(ch => {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.48, 0.58), LS.makeToonMat(0x9c6b49));
      seat.position.set(ch[0], 0.24, ch[1]); dinG.add(seat);
    });
    worldGroup.add(dinG);
    addCol(3.6, -3.4, 1.6, 1.0);

    // Spawn Mom & Dad seated warmly at the Dining Room table having coffee!
    LS.spawnWorldNPCs(worldGroup, [
      {
        name: 'Mom ☕',
        line: 'Good morning sweeties! Play us a song on the piano, Laila! We love you! 💛🎹',
        pos: new THREE.Vector3(2.15, 0.18, -3.4),
        baseRot: Math.PI / 2,
        seated: true,
        char: { scale: 0.90, skinColor: 0xe6b595, hairColor: 0x2c1e18, topColor: 0xf4a261, bottomColor: 0x3d5a80, longHair: true }
      },
      {
        name: 'Dad ☕',
        line: 'Best coffee in the world with my two favorite adventurers! Ready for school or the Magic Globe? 🌍☕',
        pos: new THREE.Vector3(5.05, 0.18, -3.4),
        baseRot: -Math.PI / 2,
        seated: true,
        char: { scale: 0.94, skinColor: 0xd9a480, hairColor: 0x241a16, topColor: 0x457b9d, bottomColor: 0x2b3a4a, pants: true, faceOpts: { glasses: true } }
      }
    ]);

    // -----------------------------------------------------------------------
    // ROOM 3: TV & VIDEO GAME ROOM (Southwest)
    // -----------------------------------------------------------------------
    const rugSW = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 4.4), LS.makeToonMat(0xd9e8d2));
    rugSW.rotation.x = -Math.PI / 2;
    rugSW.position.set(-5.2, 0.018, 4.1);
    worldGroup.add(rugSW);

    // Plush Sage Sofa facing West TV wall!
    const sofaMat = LS.makeToonMat(0x52997a);
    const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.56, 3.2), sofaMat);
    sofaBase.position.set(-3.1, 0.28, 4.1); sofaBase.castShadow = true; worldGroup.add(sofaBase);
    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.96, 3.2), sofaMat);
    sofaBack.position.set(-2.65, 0.62, 4.1); worldGroup.add(sofaBack);
    addCol(-3.0, 4.1, 0.72, 1.7);

    // Coffee table with 2 colorful video game controllers
    const cTable = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.42, 1.65), trimMat);
    cTable.position.set(-5.0, 0.21, 4.1); worldGroup.add(cTable);
    [[-5.0, 3.7, 0xff5d8f], [-5.0, 4.5, 0x38bdf8]].forEach(gp => {
      const ctrl = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.07, 0.42), LS.makeToonMat(gp[2]));
      ctrl.position.set(gp[0], 0.46, gp[1]); worldGroup.add(ctrl);
    });
    addCol(-5.0, 4.1, 0.6, 0.9);

    // Media Console + Large Animated 3D TV Screen on West Wall!
    const tvStand = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.65, 3.0), trimMat);
    tvStand.position.set(-9.2, 0.33, 4.1); worldGroup.add(tvStand);
    const tvFrame = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.65, 2.75), LS.makeToonMat(0x222730));
    tvFrame.position.set(-9.45, 1.68, 4.1); worldGroup.add(tvFrame);

    const tvC = document.createElement('canvas');
    tvC.width = 256; tvC.height = 160;
    W.tvCanvas = tvC;
    W.tvCtx = tvC.getContext('2d');
    const tvTex = new THREE.CanvasTexture(tvC);
    W.tvScreenMat = new THREE.MeshBasicMaterial({ map: tvTex });
    const tvScreen = new THREE.Mesh(new THREE.PlaneGeometry(2.52, 1.44), W.tvScreenMat);
    tvScreen.rotation.y = Math.PI / 2;
    tvScreen.position.set(-9.34, 1.68, 4.1);
    worldGroup.add(tvScreen);
    addCol(-9.2, 4.1, 0.75, 1.65);

    W.zones.push({
      id: 'home_tv_room',
      label: 'Watch Cozy TV or Play Video Games 📺🎮',
      pos: new THREE.Vector3(-6.8, 0, 4.1),
      radius: 2.5
    });

    // -----------------------------------------------------------------------
    // ROOM 4: SISTERS' BEDROOM + SPINNING MAGIC WORLD GLOBE! (Southeast)
    // -----------------------------------------------------------------------
    const rugSE = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 5.2), LS.makeToonMat(0xfde2eb));
    rugSE.rotation.x = -Math.PI / 2;
    rugSE.position.set(5.4, 0.018, 4.1);
    worldGroup.add(rugSE);

    // Laila's Bed (Pink/Coral Quilt) & Salma's Bed (Sky/Yellow Quilt)
    function addBed(x, z, quiltHex) {
      const bg = new THREE.Group();
      bg.position.set(x, 0, z);
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.45, 2.2), trimMat);
      frame.position.y = 0.22; frame.castShadow = true; bg.add(frame);
      const headb = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.05, 0.14), trimMat);
      headb.position.set(0, 0.56, 1.08); bg.add(headb);
      const quilt = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.26, 1.72), LS.makeToonMat(quiltHex));
      quilt.position.set(0, 0.52, -0.18); bg.add(quilt);
      const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.18, 0.48), LS.makeToonMat(0xfffdf8));
      pillow.position.set(0, 0.56, 0.76); bg.add(pillow);
      worldGroup.add(bg);
      addCol(x, z, 0.85, 1.2);
    }
    addBed(7.8, 5.6, 0xff8fab);
    addBed(5.2, 5.6, 0x72c8f5);

    // 3D Toy Shelf on East Bedroom Wall
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.55, 2.0, 2.0), trimMat);
    shelf.position.set(9.45, 1.0, 2.2); worldGroup.add(shelf);
    W.zones.push({
      id: 'toy_shelf_view',
      label: 'View Toy Shelf & Sticker Album 🎁',
      pos: new THREE.Vector3(8.1, 0, 2.2),
      radius: 2.0
    });

    // GLOWING SPINNING 3D MAGIC WORLD GLOBE (Center of Sisters' Bedroom!)
    const globeStandG = new THREE.Group();
    globeStandG.position.set(3.2, 0, 3.6);
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.45, 0.88, 12), trimMat);
    pedestal.position.y = 0.44; pedestal.castShadow = true; globeStandG.add(pedestal);
    const brassRing = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.04, 8, 28), LS.makeEmissiveMat(0xf5c542, 0xffd166, 0.55));
    brassRing.position.y = 1.48; brassRing.rotation.z = 0.35; globeStandG.add(brassRing);

    // Painted Earth texture for the Magic Globe!
    const gc = document.createElement('canvas');
    gc.width = 256; gc.height = 128;
    const gctx = gc.getContext('2d');
    gctx.fillStyle = '#2d9cdb'; gctx.fillRect(0, 0, 256, 128);
    gctx.fillStyle = '#6fcf97';
    // Continents stylized painterly blobs
    [[52, 46, 26, 18], [68, 84, 16, 22], [134, 42, 24, 18], [142, 78, 18, 22], [198, 48, 28, 22], [208, 92, 16, 12]].forEach(b => {
      gctx.beginPath(); gctx.ellipse(b[0], b[1], b[2], b[3], 0.2, 0, Math.PI * 2); gctx.fill();
    });
    gctx.fillStyle = 'rgba(255,255,255,0.65)';
    gctx.fillRect(0, 0, 256, 10); gctx.fillRect(0, 118, 256, 10);
    const globeMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.48, 20, 14),
      LS.makeEmissiveMat(0xffffff, 0x56cfe1, 0.32)
    );
    globeMesh.material.map = new THREE.CanvasTexture(gc);
    globeMesh.position.y = 1.48;
    globeStandG.add(globeMesh);

    if (LS.createGlowSprite) {
      const gHalo = LS.createGlowSprite(0x72efdd, 2.1);
      gHalo.position.y = 1.48;
      globeStandG.add(gHalo);
    }
    worldGroup.add(globeStandG);
    W.magicGlobe = globeMesh;
    W.globeRing = brassRing;
    addCol(3.2, 3.6, 0.62, 0.62);

    W.zones.push({
      id: 'magic_globe',
      label: 'Spin the Magic World Globe 🌍✨',
      pos: new THREE.Vector3(3.2, 0, 2.2),
      radius: 2.4
    });

    // Front Apartment Door & Welcome Mat (Exit back to Gated Community!)
    const fDoor = new THREE.Mesh(new THREE.BoxGeometry(1.75, 2.55, 0.2), trimMat);
    fDoor.position.set(0, 1.28, 7.82); worldGroup.add(fDoor);
    const exitMat = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.04, 1.1), LS.makeToonMat(0x2a9d8f));
    exitMat.position.set(0, 0.02, 7.05); worldGroup.add(exitMat);
    W.zones.push({
      id: 'exit_interior',
      label: 'Step Outside to Gated Community 🚪🏡',
      pos: new THREE.Vector3(0, 0, 6.75),
      radius: 2.1
    });

    W.getZoneLabel = function (x, z) {
      if (x < 0 && z < 0) return 'Home Kitchen 🍎';
      if (x >= 0 && z < 0) return 'Dining Room & Piano 🎹☕';
      if (x < 0 && z >= 0) return 'TV & Game Room 📺🎮';
      return "Sisters' Bedroom & Magic Globe 🌍";
    };

    W.update = function (dt, elapsed) {
      if (W.magicGlobe) {
        W.magicGlobe.rotation.y = elapsed * 0.65;
        W.magicGlobe.position.y = 1.48 + Math.sin(elapsed * 2.2) * 0.05;
      }
      if (W.globeRing) {
        W.globeRing.rotation.y = -elapsed * 0.45;
      }
      W.coffeeSteams.forEach(st => {
        const t = (elapsed * 0.55 + st.userData.phase) % 1.0;
        st.position.y = st.userData.baseY + t * 0.55;
        st.scale.setScalar(0.7 + t * 0.9);
        st.material.opacity = (1 - t) * 0.42;
      });
      // Animate cozy Studio Ghibli clouds cartoon on the 3D TV screen!
      if (W.tvCtx && W.tvScreenMat && Math.floor(elapsed * 12) !== W._lastTvFrame) {
        W._lastTvFrame = Math.floor(elapsed * 12);
        const ctx = W.tvCtx;
        const grad = ctx.createLinearGradient(0, 0, 0, 160);
        grad.addColorStop(0, '#38a3e8');
        grad.addColorStop(0.7, '#a8e4ff');
        grad.addColorStop(1, '#70c26b');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, 256, 160);
        ctx.fillStyle = '#fffdf5';
        const cx = ((elapsed * 24) % 310) - 30;
        ctx.beginPath(); ctx.arc(cx, 52, 22, 0, Math.PI * 2); ctx.arc(cx + 22, 46, 26, 0, Math.PI * 2); ctx.arc(cx + 44, 54, 20, 0, Math.PI * 2); ctx.fill();
        // Cute bouncing star on TV
        ctx.fillStyle = '#ffd166';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText('⭐', 114, 112 + Math.sin(elapsed * 5) * 14);
        W.tvScreenMat.map.needsUpdate = true;
      }
    };

    W.drawMiniMap = function (ctx, Wpx, Hpx, toX, toY) {
      ctx.fillStyle = '#f5e6cc';
      ctx.fillRect(0, 0, Wpx, Hpx);
      ctx.fillStyle = '#dce8dc'; ctx.fillRect(toX(-10), toY(-8), toX(0) - toX(-10), toY(0) - toY(-8));
      ctx.fillStyle = '#fbe8d4'; ctx.fillRect(toX(0), toY(-8), toX(10) - toX(0), toY(0) - toY(-8));
      ctx.fillStyle = '#d9e8d2'; ctx.fillRect(toX(-10), toY(0), toX(0) - toX(-10), toY(8) - toY(0));
      ctx.fillStyle = '#fde2eb'; ctx.fillRect(toX(0), toY(0), toX(10) - toX(0), toY(8) - toY(0));
      ctx.fillStyle = '#3d2c1e'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('KITCHEN', toX(-5), toY(-3.5));
      ctx.fillText('PIANO/DINING', toX(5), toY(-3.5));
      ctx.fillText('TV ROOM', toX(-5), toY(4));
      ctx.fillText('BEDROOM 🌍', toX(5), toY(4));
    };

    return W;
  }

  LS.registerWorld('home_neighborhood', { build: buildHomeNeighborhood });
  LS.registerWorld('home_apartment', { build: buildHomeApartment });
})(window.LailaSalma);
