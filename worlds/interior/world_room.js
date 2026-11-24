window.LailaSalma = window.LailaSalma || {};

(function (LS) {
  function buildInteriorRoom(roomId, worldGroup) {
    const isKyoto = roomId === 'kyoto_room';
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
      beanbagMeshes: [],
      posterMesh: null,
      petMeshes: [],
      toySprites: []
    };

    function addCollider(x, z, hw, hd) {
      W.colliders.push({ minX: x - hw, maxX: x + hw, minZ: z - hd, maxZ: z + hd });
    }

    // Soft pastel backdrop dome
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(55, 16, 12),
      new THREE.MeshBasicMaterial({ color: isKyoto ? 0x3b2c26 : 0xffeef4, side: THREE.BackSide })
    );
    W.skyMesh = sky;
    worldGroup.add(sky);

    // Room dimensions: 12m wide (X=-6..6), 10.4m deep (Z=-5.2..5.2), 4.8m tall
    W.floorMat = LS.makeToonMat(isKyoto ? 0xd9cf9c : 0xdcb98a);
    const floor = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.2, 10.8), W.floorMat);
    floor.position.y = -0.1;
    floor.receiveShadow = true;
    worldGroup.add(floor);

    // Cozy central rug
    const rug = new THREE.Mesh(
      new THREE.CylinderGeometry(2.3, 2.3, 0.04, 24),
      LS.makeToonMat(isKyoto ? 0xc94c4c : 0xffc2d1)
    );
    rug.position.set(0, 0.02, 0.3);
    rug.receiveShadow = true;
    worldGroup.add(rug);

    // 3 Solid Walls (North back wall, West left wall, East right wall) + South doorway framing
    const wallColor = isKyoto ? 0xf5ebd6 : 0xfdf3e3;
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

    // Wood trim baseboards
    const trimMat = LS.makeToonMat(isKyoto ? 0x4f3524 : 0xb88b5a);
    const baseBack = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.25, 0.36), trimMat);
    baseBack.position.set(0, 0.12, -5.05);
    worldGroup.add(baseBack);

    // Glowing Window on Left Wall (overlooking blossoms / bamboo!)
    const winFrame = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.1, 2.8), trimMat);
    winFrame.position.set(-5.88, 2.5, -0.8);
    worldGroup.add(winFrame);
    const winPane = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 1.85, 2.5),
      LS.makeEmissiveMat(isKyoto ? 0xffe9b5 : 0xbae6fd, isKyoto ? 0xffd27d : 0x93c5fd, 0.65)
    );
    winPane.position.set(-5.86, 2.5, -0.8);
    worldGroup.add(winPane);

    // Cozy Twin Beds / Futons on West-Back Corner
    const bedColors = isKyoto ? [0xd62828, 0x2a9d8f] : [0xff8fab, 0xffd166];
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

    // Customizable 3D Wall Poster / Hanging Kyoto Scroll (Back Wall center-right)
    const posterMesh = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 1.45, 0.12),
      new THREE.MeshBasicMaterial({ map: LS.createSignTexture('TOKYO 🗼 & 🐱') })
    );
    posterMesh.position.set(1.2, 2.85, -4.98);
    worldGroup.add(posterMesh);
    W.posterMesh = posterMesh;

    // Customizable 3D Plush Beanbags / Zabuton Cushions (Center lounge area)
    [[-1.0, 0.5], [1.1, 0.5]].forEach((pos, idx) => {
      const bbMat = LS.makeToonMat(0xff8fab);
      const geom = isKyoto
        ? new THREE.BoxGeometry(1.15, 0.28, 1.15)
        : new THREE.SphereGeometry(0.68, 14, 10);
      const mesh = new THREE.Mesh(geom, bbMat);
      if (!isKyoto) mesh.scale.set(1.15, 0.68, 1.15);
      mesh.position.set(pos[0], isKyoto ? 0.16 : 0.42, pos[1]);
      mesh.castShadow = true;
      worldGroup.add(mesh);
      W.beanbagMeshes.push(mesh);
      if (idx === 0) addCollider(pos[0], pos[1], 0.6, 0.6);
      else addCollider(pos[0], pos[1], 0.6, 0.6);
    });

    // Low wooden table between cushions in Kyoto Ryokan (with cute matcha cups!)
    if (isKyoto) {
      const tbl = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.36, 0.8), trimMat);
      tbl.position.set(0.05, 0.18, 0.5);
      tbl.castShadow = true;
      worldGroup.add(tbl);
      const teapot = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), LS.makeToonMat(0x2d6a4f));
      teapot.position.set(0.05, 0.48, 0.5);
      worldGroup.add(teapot);
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
      id: isKyoto ? 'decorate_ryokan' : 'decorate_tokyo_room',
      label: isKyoto ? 'Decorate Kyoto Ryokan Suite 🎨' : "Decorate Laila & Salma's Room 🎨",
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
        map: LS.createSignTexture(isKyoto ? '🚪 EXIT TO KYOTO' : '🚪 EXIT TO TOKYO', {
          bg: '#1b4332', border: '#95d5b2', color: '#ecfdf5', font: 'bold 34px sans-serif'
        })
      })
    );
    exitMat.position.set(0, 0.04, 4.35);
    worldGroup.add(exitMat);

    W.zones.push({
      id: 'exit_interior',
      label: isKyoto ? 'Step Outside to Kyoto 🚪' : 'Step Outside to Tokyo 🚪',
      pos: new THREE.Vector3(0, 0, 4.2),
      radius: 2.2
    });

    // Live 3D Decoration Refresher (called immediately on load & whenever the sisters customize!)
    W.refreshDecor = function () {
      if (isKyoto) {
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

      // Rebuild Cozy Rescued Cats / Kitsune Lounge Pets!
      while (petGroup.children.length > 0) petGroup.remove(petGroup.children[0]);
      W.petMeshes = [];
      const foundList = isKyoto ? LS.state.foundKitsune : LS.state.foundCats;
      const palette = isKyoto
        ? [0xf77f00, 0xfff8f0, 0xe76f51, 0xffb703, 0xfffcf7]
        : [0xe89643, 0x2a2d36, 0xfaf7f2, 0xf4b678, 0x8b95a5];
      foundList.slice(0, 5).forEach((fid, idx) => {
        const pg = new THREE.Group();
        pg.position.set(1.1 + idx * 0.65, 0.14, -3.7);
        const fur = LS.makeToonMat(palette[idx % palette.length]);
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), fur);
        body.scale.set(1.15, 0.78, 1.0);
        body.position.y = 0.16;
        pg.add(body);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), fur);
        head.position.set(0, 0.28, 0.14);
        pg.add(head);
        [-0.07, 0.07].forEach(ex => {
          const ear = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.11, 5), fur);
          ear.position.set(ex, 0.42, 0.14);
          pg.add(ear);
        });
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
      return isKyoto ? 'Kyoto Ryokan Suite' : "Laila & Salma's Room";
    };
    W.update = function (dt, elapsed) {
      W.petMeshes.forEach((p, idx) => {
        p.position.y = 0.14 + Math.abs(Math.sin(elapsed * 2.4 + idx)) * 0.05;
      });
    };
    W.drawMiniMap = function (ctx, cw, ch, toMapX, toMapY) {
      ctx.fillStyle = isKyoto ? '#d9cf9c' : '#f7e6cf';
      ctx.fillRect(0, 0, cw, ch);
      ctx.strokeStyle = '#8c5a32';
      ctx.lineWidth = 4;
      ctx.strokeRect(8, 8, cw - 16, ch - 16);
      ctx.fillStyle = '#d95d88';
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
})(window.LailaSalma);
