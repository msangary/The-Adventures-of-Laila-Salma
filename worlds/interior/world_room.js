window.LailaSalma = window.LailaSalma || {};

(function (LS) {
  function buildInteriorRoom(roomId, worldGroup) {
    const isKyoto = roomId === 'kyoto_room';
    const isSafariTent = roomId === 'safari_tent';
    const W = {
      id: roomId,
      isInterior: true,
      colliders: [],
      zones: [],
      hiddenAnimals: [],
      skyMesh: null,
      mochiStartPos: new THREE.Vector3(2.8, 0, 2.2),
      wallMats: [],
      floorMat: null,
      rugMat: null,
      beanbagMeshes: [],
      posterMesh: null,
      petMeshes: [],
      toySprites: []
    };

    function addCollider(x, z, hw, hd) {
      W.colliders.push({ minX: x - hw, maxX: x + hw, minZ: z - hd, maxZ: z + hd });
    }

    // Soft pastel / warm savanna tent backdrop dome
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(55, 16, 12),
      new THREE.MeshBasicMaterial({ color: isSafariTent ? 0x5c3e26 : (isKyoto ? 0x3b2c26 : 0xffeef4), side: THREE.BackSide })
    );
    W.skyMesh = sky;
    worldGroup.add(sky);

    // Room dimensions: 12m wide (X=-6..6), 10.4m deep (Z=-5.2..5.2), 4.8m tall
    W.floorMat = isSafariTent
      ? LS.makeSurfaceMat(LS.createCedarPlankTexture(), { roughness: 0.78 })
      : LS.makeToonMat(isKyoto ? 0xd9cf9c : 0xdcb98a);
    const floor = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.2, 10.8), W.floorMat);
    floor.position.y = -0.1;
    floor.receiveShadow = true;
    worldGroup.add(floor);

    // Cozy central rug (customizable in Safari Glamping Tent!)
    W.rugMat = LS.makeToonMat(isSafariTent ? 0xc98a3e : (isKyoto ? 0xc94c4c : 0xffc2d1));
    const rug = new THREE.Mesh(
      new THREE.CylinderGeometry(isSafariTent ? 2.6 : 2.3, isSafariTent ? 2.6 : 2.3, 0.04, 24),
      W.rugMat
    );
    rug.position.set(0, 0.02, 0.3);
    rug.receiveShadow = true;
    worldGroup.add(rug);

    // 3 Solid Walls (North back wall, West left wall, East right wall) + South doorway framing
    const wallColor = isSafariTent ? 0xf3e2c0 : (isKyoto ? 0xf5ebd6 : 0xfdf3e3);
    const wMat = LS.makeToonMat(wallColor);
    W.wallMats.push(wMat);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(12.4, 4.8, 0.3), wMat);
    backWall.position.set(0, 2.4, -5.2);
    backWall.receiveShadow = true;
    worldGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.8, 10.6), wMat);
    leftWall.position.set(-6.05, 2.4, 0);
    leftWall.receiveShadow = true;
    worldGroup.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.8, 10.6), wMat);
    rightWall.position.set(6.05, 2.4, 0);
    rightWall.receiveShadow = true;
    worldGroup.add(rightWall);

    // Wood trim baseboards (plus timber tent posts & warm hanging lantern string inside Safari Tent!)
    const trimMat = LS.makeToonMat(isSafariTent ? 0x6b4226 : (isKyoto ? 0x4f3524 : 0xb88b5a));
    const baseBack = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.25, 0.36), trimMat);
    baseBack.position.set(0, 0.12, -5.05);
    worldGroup.add(baseBack);

    if (isSafariTent) {
      [[-5.8, -4.9], [5.8, -4.9], [-5.8, 4.5], [5.8, 4.5]].forEach(p => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 4.8, 10), trimMat);
        post.position.set(p[0], 2.4, p[1]);
        worldGroup.add(post);
      });
      // Overhead timber ridge beam & glowing warm safari string lanterns!
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 11.8, 10), trimMat);
      beam.rotation.z = Math.PI / 2;
      beam.position.set(0, 4.15, -1.2);
      worldGroup.add(beam);
      const lGlow = LS.makeEmissiveMat(0xfff1b8, 0xffb703, 0.92);
      [-4.0, -2.0, 0, 2.0, 4.0].forEach(lx => {
        const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 6), trimMat);
        cord.position.set(lx, 3.92, -1.2);
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), lGlow);
        bulb.position.set(lx, 3.65, -1.2);
        worldGroup.add(cord, bulb);
      });
    }

    // Glowing Window on Left Wall (overlooking Mt. Kilimanjaro / blossoms / bamboo!)
    const winFrame = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.1, 2.8), trimMat);
    winFrame.position.set(-5.88, 2.5, -0.8);
    worldGroup.add(winFrame);
    const winPane = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 1.85, 2.5),
      LS.makeEmissiveMat(isSafariTent ? 0xffd27d : (isKyoto ? 0xffe9b5 : 0xbae6fd), isSafariTent ? 0xf59e0b : (isKyoto ? 0xffd27d : 0x93c5fd), 0.70)
    );
    winPane.position.set(-5.86, 2.5, -0.8);
    worldGroup.add(winPane);

    // Brass Kilimanjaro Viewing Telescope by the Safari Tent Window!
    if (isSafariTent) {
      const brass = LS.makeToonMat(0xdcb45c, { roughness: 0.28, metalness: 0.72 });
      const scopeG = new THREE.Group();
      scopeG.position.set(-4.6, 0, -0.8);
      for (let i = 0; i < 3; i++) {
        const ang = (i / 3) * Math.PI * 2;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.032, 1.35, 6), trimMat);
        leg.position.set(Math.cos(ang) * 0.22, 0.64, Math.sin(ang) * 0.22);
        leg.rotation.set(Math.sin(ang) * 0.24, 0, -Math.cos(ang) * 0.24);
        scopeG.add(leg);
      }
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.052, 0.88, 12), brass);
      tube.rotation.z = Math.PI / 2 - 0.18;
      tube.position.set(-0.08, 1.38, 0);
      scopeG.add(tube);
      worldGroup.add(scopeG);
      addCollider(-4.6, -0.8, 0.55, 0.55);
    }

    // Cozy Twin Beds / Futons / Safari Cots on West-Back Corner
    const bedColors = isSafariTent ? [0xd97706, 0x2a9d8f] : (isKyoto ? [0xd62828, 0x2a9d8f] : [0xff8fab, 0xffd166]);
    [-3.6, -1.7].forEach((bx, idx) => {
      const bg = new THREE.Group();
      bg.position.set(bx, 0, -3.5);
      const frameH = isKyoto ? 0.14 : 0.42;
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.45, frameH, 2.3), trimMat);
      frame.position.y = frameH / 2;
      frame.castShadow = true;
      bg.add(frame);
      const blanket = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.22, 1.75), LS.makeToonMat(bedColors[idx]));
      blanket.position.set(0, frameH + 0.11, 0.2);
      blanket.castShadow = true;
      bg.add(blanket);
      const pillow = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.18, 0.48), LS.makeToonMat(0xffffff));
      pillow.position.set(0, frameH + 0.14, -0.8);
      bg.add(pillow);
      worldGroup.add(bg);
      addCollider(bx, -3.5, 0.8, 1.25);
    });

    // Customizable 3D Wall Poster / Hanging Kyoto Scroll / Savanna Tapestry (Back Wall center-right)
    const posterMesh = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 1.45, 0.12),
      new THREE.MeshBasicMaterial({ map: LS.createSignTexture('TOKYO 🗼 & 🐱') })
    );
    posterMesh.position.set(1.2, 2.85, -4.98);
    worldGroup.add(posterMesh);
    W.posterMesh = posterMesh;

    // Customizable 3D Plush Beanbags / Zabuton / Safari Pouf Cushions (Center lounge area)
    [[-1.0, 0.5], [1.1, 0.5]].forEach((pos, idx) => {
      const bbMat = LS.makeToonMat(isSafariTent ? 0xe0a848 : 0xff8fab);
      const geom = isKyoto
        ? new THREE.BoxGeometry(1.15, 0.28, 1.15)
        : (isSafariTent ? new THREE.CylinderGeometry(0.62, 0.68, 0.36, 16) : new THREE.SphereGeometry(0.68, 14, 10));
      const mesh = new THREE.Mesh(geom, bbMat);
      if (!isKyoto && !isSafariTent) mesh.scale.set(1.15, 0.68, 1.15);
      mesh.position.set(pos[0], isKyoto ? 0.16 : (isSafariTent ? 0.20 : 0.42), pos[1]);
      mesh.castShadow = true;
      worldGroup.add(mesh);
      W.beanbagMeshes.push(mesh);
      if (idx === 0) addCollider(pos[0], pos[1], 0.6, 0.6);
      else addCollider(pos[0], pos[1], 0.6, 0.6);
    });

    // Low wooden table between cushions in Kyoto Ryokan or Safari Tent (with mango pitcher / teapot!)
    if (isKyoto || isSafariTent) {
      const tbl = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.36, 0.8), trimMat);
      tbl.position.set(0.05, 0.18, 0.5);
      tbl.castShadow = true;
      worldGroup.add(tbl);
      const pot = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), LS.makeToonMat(isSafariTent ? 0xd97706 : 0x2d6a4f));
      pot.position.set(0.05, 0.48, 0.5);
      worldGroup.add(pot);
    }

    // 3D Toy Shelf & Sticker Display on East Wall (displays collected Gachapon Toys!)
    const shelfG = new THREE.Group();
    shelfG.position.set(5.35, 0, -1.2);
    const shelfBack = new THREE.Mesh(new THREE.BoxGeometry(0.65, 2.5, 3.6), trimMat);
    shelfBack.position.y = 1.25;
    shelfBack.castShadow = true;
    shelfG.add(shelfBack);
    [0.65, 1.4, 2.15].forEach(sy => {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.09, 3.5), LS.makeToonMat(0xc99c63));
      plank.position.set(-0.1, sy, 0);
      shelfG.add(plank);
    });
    const shelfSign = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.55, 2.4),
      new THREE.MeshBasicMaterial({
        map: LS.createSignTexture('🎁 TOY SHELF & ALBUM', {
          bg: '#fff4e0', border: '#d97724', color: '#7a3e00', font: 'bold 34px sans-serif'
        })
      })
    );
    shelfSign.position.set(-0.36, 2.82, 0);
    shelfG.add(shelfSign);
    worldGroup.add(shelfG);
    addCollider(5.35, -1.2, 0.65, 1.9);

    // Toy sprites placed on the 3D shelf for each unlocked capsule toy!
    const toySlotsGroup = new THREE.Group();
    worldGroup.add(toySlotsGroup);

    // Cozy Rescued Cats / Befriended Kitsune Cushion Corner (Northeast corner)
    const petPad = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.14, 1.6), LS.makeToonMat(0xffe3b3));
    petPad.position.set(2.4, 0.07, -3.7);
    worldGroup.add(petPad);

    const petGroup = new THREE.Group();
    worldGroup.add(petGroup);

    // Interactive Decorating Easel / Desk (West side)
    const desk = new THREE.Group();
    desk.position.set(-4.8, 0, 1.8);
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.82, 1.9), trimMat);
    deskTop.position.y = 0.41;
    deskTop.castShadow = true;
    desk.add(deskTop);
    const decSign = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.68, 2.1),
      new THREE.MeshBasicMaterial({
        map: LS.createSignTexture('🎨 DECORATE ROOM', {
          bg: '#fff0f6', border: '#d95d88', color: '#6b2144', font: 'bold 34px sans-serif'
        })
      })
    );
    decSign.position.set(0.3, 1.38, 0);
    desk.add(decSign);
    worldGroup.add(desk);
    addCollider(-4.8, 1.8, 0.75, 1.1);

    // Interactive Zones inside the 3D Room!
    W.zones.push({
      id: isSafariTent ? 'decorate_safari_tent' : (isKyoto ? 'decorate_ryokan' : 'decorate_tokyo_room'),
      label: isSafariTent ? 'Decorate Safari Glamping Tent ⛺🎨' : (isKyoto ? 'Decorate Kyoto Ryokan Suite 🎨' : "Decorate Laila & Salma's Room 🎨"),
      pos: new THREE.Vector3(-3.3, 0, 1.8),
      radius: 2.8
    });

    W.zones.push({
      id: 'toy_shelf_view',
      label: 'Admire Toy Shelf & Sticker Album 🎁',
      pos: new THREE.Vector3(3.8, 0, -1.2),
      radius: 2.6
    });

    // Glowing Exit Door Mat on South Edge (flat on floor so entrance camera is 100% unobstructed!)
    const exitMat = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.08, 1.3),
      new THREE.MeshBasicMaterial({
        map: LS.createSignTexture(isSafariTent ? '🚪 EXIT TO SAFARI' : (isKyoto ? '🚪 EXIT TO KYOTO' : '🚪 EXIT TO TOKYO'), {
          bg: '#1b4332', border: '#95d5b2', color: '#ecfdf5', font: 'bold 34px sans-serif'
        })
      })
    );
    exitMat.position.set(0, 0.04, 4.35);
    worldGroup.add(exitMat);

    W.zones.push({
      id: 'exit_interior',
      label: isSafariTent ? 'Step Outside to African Safari 🚪' : (isKyoto ? 'Step Outside to Kyoto 🚪' : 'Step Outside to Tokyo 🚪'),
      pos: new THREE.Vector3(0, 0, 4.2),
      radius: 2.2
    });

    // Live 3D Decoration Refresher (called immediately on load & whenever the sisters customize!)
    W.refreshDecor = function () {
      if (isSafariTent) {
        const rugOpt = LS.SAFARI_TENT_RUGS.find(r => r.id === LS.state.safariTentRug) || LS.SAFARI_TENT_RUGS[0];
        const cushOpt = LS.SAFARI_TENT_CUSHIONS.find(c => c.id === LS.state.safariTentCushion) || LS.SAFARI_TENT_CUSHIONS[0];
        const tapOpt = LS.SAFARI_TENT_TAPESTRIES.find(t => t.id === LS.state.safariTentTapestry) || LS.SAFARI_TENT_TAPESTRIES[0];
        if (W.rugMat) W.rugMat.color.setHex(rugOpt.hex);
        W.beanbagMeshes.forEach(m => m.material.color.setHex(cushOpt.hex));
        W.posterMesh.material.map = LS.createSignTexture(tapOpt.label, {
          bg: tapOpt.bg || '#fff3d6', border: tapOpt.border || '#c26d1f', color: tapOpt.fg || '#5a2d0c', font: 'bold 32px sans-serif'
        });
        W.posterMesh.material.needsUpdate = true;
      } else if (isKyoto) {
        const tat = LS.RYOKAN_TATAMI.find(t => t.id === LS.state.ryokanTatami) || LS.RYOKAN_TATAMI[0];
        const cush = LS.RYOKAN_CUSHIONS.find(c => c.id === LS.state.ryokanCushion) || LS.RYOKAN_CUSHIONS[0];
        const scr = LS.RYOKAN_SCROLLS.find(s => s.id === LS.state.ryokanScroll) || LS.RYOKAN_SCROLLS[0];
        W.floorMat.color.setHex(tat.hex);
        W.beanbagMeshes.forEach(m => m.material.color.setHex(cush.hex));
        W.posterMesh.material.map = LS.createSignTexture(scr.label, {
          bg: scr.bg || '#fff8eb', border: scr.border || '#c83e37', color: scr.fg || '#3d2c1e', font: 'bold 34px sans-serif'
        });
        W.posterMesh.material.needsUpdate = true;
      } else {
        const wp = LS.ROOM_WALLPAPERS.find(w => w.id === LS.state.roomWallpaper) || LS.ROOM_WALLPAPERS[0];
        const bb = LS.ROOM_BEANBAGS.find(b => b.id === LS.state.roomBeanbag) || LS.ROOM_BEANBAGS[0];
        const po = LS.ROOM_POSTERS.find(p => p.id === LS.state.roomPoster) || LS.ROOM_POSTERS[0];
        W.wallMats.forEach(m => m.color.setHex(wp.hex));
        W.beanbagMeshes.forEach(m => m.material.color.setHex(bb.hex));
        W.posterMesh.material.map = LS.createSignTexture(po.label, {
          bg: po.bg || '#fff0f5', border: po.border || '#e05780', color: po.fg || '#3d2c1e', font: 'bold 34px sans-serif'
        });
        W.posterMesh.material.needsUpdate = true;
      }

      // Rebuild 3D Toy Shelf Sprites
      while (toySlotsGroup.children.length > 0) toySlotsGroup.remove(toySlotsGroup.children[0]);
      const ownedToys = LS.GACHAPON_TOYS.filter(t => LS.state.unlockedToys.includes(t.id));
      ownedToys.forEach((toy, idx) => {
        const row = Math.floor(idx / 4);
        const col = idx % 4;
        const c = document.createElement('canvas');
        c.width = 96; c.height = 96;
        const ctx = c.getContext('2d');
        ctx.font = 'bold 62px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(toy.emoji, 48, 72);
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
        sp.scale.set(0.55, 0.55, 1);
        sp.position.set(4.95, 0.96 + row * 0.74, -2.45 + col * 0.82);
        toySlotsGroup.add(sp);
      });

      // Rebuild Cozy Rescued Cats / Kitsune / Safari Lion Cubs Lounge Pets!
      while (petGroup.children.length > 0) petGroup.remove(petGroup.children[0]);
      W.petMeshes = [];
      const foundList = isSafariTent ? LS.state.foundLionCubs : (isKyoto ? LS.state.foundKitsune : LS.state.foundCats);
      const palette = isSafariTent
        ? [[0xd99b43, 0xf7e1b5], [0xc88836, 0xf4dcac], [0xe2aa52, 0xfff0cc], [0xd4923e, 0xf6dfae], [0xcf8d38, 0xf5deb0]]
        : (isKyoto
          ? [[0xf77f00, 0xffffff], [0xfff8f0, 0xe63946], [0xe76f51, 0xfff3d6], [0xffb703, 0xffffff], [0xfffcf7, 0xff8fab]]
          : [[0xe89643, 0xfff3d6], [0x2c303a, 0xf4e4c4], [0xfaf7f2, 0xffe4ec], [0xf4b678, 0xfff8ec], [0x8b95a5, 0xffffff]]);
      foundList.slice(0, 5).forEach((fid, idx) => {
        const pair = palette[idx % palette.length];
        let pg;
        if (isSafariTent && LS.isHD && LS.hdAssets && LS.hdAssets.has('anime_lion_cub')) {
          pg = LS.hdAssets.clone('anime_lion_cub');
          pg.scale.setScalar(0.56);
        } else {
          const built = isKyoto
            ? LS.createKitsuneModel(pair[0], pair[1], { scale: 0.78 })
            : LS.createCatModel(pair[0], pair[1], { scale: 0.80 });
          pg = built.root;
        }
        pg.position.set(1.1 + idx * 0.65, 0.14, -3.7);
        petGroup.add(pg);
        W.petMeshes.push(pg);
      });
    };

    W.refreshDecor();

    // Clear NPCs inside the private room
    LS.chars.npcs = [];

    W.getGroundHeight = function () { return 0; };
    W.getMochiIdleAnchor = function () {
      return { pos: new THREE.Vector3(2.8, 0, 2.2), rotY: -Math.PI / 3 };
    };
    W.getZoneLabel = function () {
      return isSafariTent ? 'Safari Glamping Tent ⛺' : (isKyoto ? 'Kyoto Ryokan Suite' : "Laila & Salma's Room");
    };
    W.update = function (dt, elapsed) {
      W.petMeshes.forEach((p, idx) => {
        p.position.y = 0.14 + Math.abs(Math.sin(elapsed * 2.4 + idx)) * 0.05;
      });
    };
    W.drawMiniMap = function (ctx, cw, ch, toMapX, toMapY) {
      ctx.fillStyle = isSafariTent ? '#edd8b0' : (isKyoto ? '#d9cf9c' : '#f7e6cf');
      ctx.fillRect(0, 0, cw, ch);
      ctx.strokeStyle = '#8c5a32';
      ctx.lineWidth = 4;
      ctx.strokeRect(8, 8, cw - 16, ch - 16);
      ctx.fillStyle = isSafariTent ? '#b45309' : '#d95d88';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎨 DECOR', toMapX(-4.0), toMapY(1.8));
      ctx.fillStyle = '#d97724';
      ctx.fillText('🎁 TOYS', toMapX(4.2), toMapY(-1.2));
      ctx.fillStyle = '#1b4332';
      ctx.fillText('🚪 EXIT', toMapX(0), toMapY(4.4));
    };

    return W;
  }

  LS.registerWorld('tokyo_room', { build: (wg) => buildInteriorRoom('tokyo_room', wg) });
  LS.registerWorld('kyoto_room', { build: (wg) => buildInteriorRoom('kyoto_room', wg) });
  LS.registerWorld('safari_tent', { build: (wg) => buildInteriorRoom('safari_tent', wg) });
})(window.LailaSalma);
