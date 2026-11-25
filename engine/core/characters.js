window.LailaSalma = window.LailaSalma || {};

(function (LS) {
  LS.chars = {
    laila: null,
    salma: null,
    salmaBubble: null,
    mochiHeart: null,
    npcs: [],
    mochi: null
  };

  LS.OUTFITS = [
    // Tokyo — Laila outfits
    { id: 'laila_school', who: 'laila', shop: 'tokyo', name: 'Sakura Sailor Uniform', desc: 'Classic navy & white uniform with red randoseru', cost: 0, swatch: '#2c4a7c',
      style: { topColor: 0xffffff, bottomColor: 0x2c4a7c, shoeColor: 0xd94848, backpackColor: 0xc92c3b, hatType: 'none' } },
    { id: 'laila_sakura', who: 'laila', shop: 'tokyo', name: 'Sakura Pink Dress & Beret', desc: 'Blossom-pink dress with a matching artist beret', cost: 80, swatch: '#ff8fab',
      style: { topColor: 0xffc2d1, bottomColor: 0xfb6f92, shoeColor: 0xffffff, backpackColor: 0xffe5ec, hatType: 'beret', hatColor: 0xfb6f92 } },
    { id: 'laila_hoodie', who: 'laila', shop: 'tokyo', name: 'Tokyo Mint Streetwear', desc: 'Mint hoodie, denim skirt & sporty cap', cost: 110, swatch: '#52b788',
      style: { topColor: 0x95d5b2, bottomColor: 0x3d5a80, shoeColor: 0xffb703, backpackColor: 0x2d6a4f, hatType: 'cap', hatColor: 0x52b788 } },
    { id: 'laila_festival', who: 'laila', shop: 'tokyo', name: 'Starlight Lavender Yukata', desc: 'Festive lavender outfit with golden beret', cost: 140, swatch: '#9d4edd',
      style: { topColor: 0xe0aaff, bottomColor: 0x7b2cbf, shoeColor: 0xffd166, backpackColor: 0xc77dff, hatType: 'beret', hatColor: 0xffd166 } },

    // Kyoto — Laila outfits
    { id: 'laila_kimono_crimson', who: 'laila', shop: 'kyoto', name: 'Kyoto Crimson Blossom Kimono', desc: 'Festive vermilion silk kimono with sakura kanzashi hairpin', cost: 95, swatch: '#d62828',
      style: { topColor: 0xd62828, bottomColor: 0x8f1d21, shoeColor: 0xd4a373, backpackColor: 0xffc300, hatType: 'kanzashi', hatColor: 0xffb3c6 } },
    { id: 'laila_kimono_indigo', who: 'laila', shop: 'kyoto', name: 'Arashiyama Bamboo Yukata', desc: 'Indigo & emerald Kyoto yukata with festival fox mask', cost: 125, swatch: '#2a9d8f',
      style: { topColor: 0x2a9d8f, bottomColor: 0x264653, shoeColor: 0xe9c46a, backpackColor: 0xf4a261, hatType: 'foxmask', hatColor: 0xffffff } },

    // Tokyo — Salma outfits
    { id: 'salma_kinder', who: 'salma', shop: 'tokyo', name: 'Sunny Kindergarten Set', desc: 'Lemon top & classic yellow tsūgakubō hat', cost: 0, swatch: '#facc15',
      style: { topColor: 0xfff3b0, bottomColor: 0x3b6ea5, shoeColor: 0xf59e0b, backpackColor: 0xf59e0b, hatType: 'kinder', hatColor: 0xfacc15 } },
    { id: 'salma_strawberry', who: 'salma', shop: 'tokyo', name: 'Strawberry Picnic Outfit', desc: 'Berry-red dress with a white sun hat', cost: 75, swatch: '#ef476f',
      style: { topColor: 0xffccd5, bottomColor: 0xef476f, shoeColor: 0xffffff, backpackColor: 0xff758f, hatType: 'kinder', hatColor: 0xffffff } },
    { id: 'salma_bunny', who: 'salma', shop: 'tokyo', name: 'Sky-Blue Bunny Hoodie', desc: 'Pastel sky outfit with cute bunny ears', cost: 100, swatch: '#4cc9f0',
      style: { topColor: 0xbde0fe, bottomColor: 0x4895ef, shoeColor: 0xffafcc, backpackColor: 0x90e0ef, hatType: 'bunny', hatColor: 0xffffff } },
    { id: 'salma_panda', who: 'salma', shop: 'tokyo', name: 'Ueno Panda Explorer', desc: 'Monochrome panda jacket & panda ear hat', cost: 130, swatch: '#2b2d42',
      style: { topColor: 0xffffff, bottomColor: 0x2b2d42, shoeColor: 0xef233c, backpackColor: 0x2b2d42, hatType: 'panda', hatColor: 0xffffff } },

    // Kyoto — Salma outfits
    { id: 'salma_kitsune', who: 'salma', shop: 'kyoto', name: 'Little Kitsune Festival Set', desc: 'Peach shrine kimono with a cute white kitsune fox mask!', cost: 90, swatch: '#f77f00',
      style: { topColor: 0xffd6a5, bottomColor: 0xe76f51, shoeColor: 0xffffff, backpackColor: 0xd62828, hatType: 'foxmask', hatColor: 0xffffff } },
    { id: 'salma_matcha', who: 'salma', shop: 'kyoto', name: 'Uji Matcha Princess Kimono', desc: 'Soft matcha green kimono with blossom hairpin', cost: 115, swatch: '#74c69d',
      style: { topColor: 0xb7e4c7, bottomColor: 0x40916c, shoeColor: 0xffd166, backpackColor: 0xff8fab, hatType: 'kanzashi', hatColor: 0xffd166 } }
  ];

  function buildHatMeshes(hatType, hatColor) {
    const group = new THREE.Group();
    if (!hatType || hatType === 'none') return group;

    const mainMat = LS.makeToonMat(hatColor || 0xfacc15);
    const bandMat = LS.makeToonMat(0x2563eb);

    if (hatType === 'kinder') {
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.31, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), mainMat);
      dome.position.set(0, 0.08, 0);
      dome.rotation.x = -0.12;
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.41, 0.03, 18), mainMat);
      brim.position.set(0, 0.11, 0.02);
      brim.rotation.x = -0.12;
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.312, 0.315, 0.05, 16), bandMat);
      band.position.set(0, 0.14, 0.01);
      band.rotation.x = -0.12;
      group.add(dome, brim, band);
    } else if (hatType === 'beret') {
      const beret = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), mainMat);
      beret.scale.set(1.08, 0.36, 1.08);
      beret.position.set(0.04, 0.25, -0.02);
      beret.rotation.z = -0.18;
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.07, 6), mainMat);
      stem.position.set(0.06, 0.36, -0.02);
      group.add(beret, stem);
    } else if (hatType === 'cap') {
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.305, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.52), mainMat);
      dome.position.set(0, 0.06, 0);
      const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.025, 14, 1, false, -Math.PI * 0.4, Math.PI * 0.8), mainMat);
      visor.position.set(0, 0.12, 0.16);
      visor.rotation.x = 0.15;
      group.add(dome, visor);
    } else if (hatType === 'bunny') {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.295, 0.03, 8, 20), mainMat);
      band.rotation.x = Math.PI / 2;
      band.position.y = 0.15;
      group.add(band);
      [-0.12, 0.12].forEach(ex => {
        const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.34, 8), mainMat);
        ear.position.set(ex, 0.38, 0);
        ear.rotation.z = ex < 0 ? 0.15 : -0.15;
        const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.24, 8), LS.makeToonMat(0xffafcc));
        inner.position.set(ex, 0.38, 0.025);
        inner.rotation.z = ex < 0 ? 0.15 : -0.15;
        group.add(ear, inner);
      });
    } else if (hatType === 'panda') {
      const hood = new THREE.Mesh(new THREE.SphereGeometry(0.312, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), mainMat);
      hood.position.set(0, 0.05, 0);
      group.add(hood);
      [-0.22, 0.22].forEach(ex => {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), LS.makeToonMat(0x1f2421));
        ear.position.set(ex, 0.31, 0);
        group.add(ear);
      });
    } else if (hatType === 'kanzashi') {
      // Traditional Kyoto blossom hairpin on side of head
      const flower = new THREE.Group();
      flower.position.set(0.27, 0.18, 0.08);
      flower.rotation.z = -0.35;
      const petalMat = LS.makeToonMat(hatColor || 0xffb3c6);
      const centerMat = LS.makeToonMat(0xffd166);
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2;
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), petalMat);
        p.position.set(Math.cos(ang) * 0.07, Math.sin(ang) * 0.07, 0);
        p.scale.set(1, 1, 0.45);
        flower.add(p);
      }
      const center = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), centerMat);
      flower.add(center);
      const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.025, 0.16, 6), LS.makeToonMat(0xd62828));
      tassel.position.set(0.04, -0.11, 0);
      flower.add(tassel);
      group.add(flower);
    } else if (hatType === 'foxmask') {
      // Cute festival kitsune mask worn perched on the side-top of the head!
      const maskG = new THREE.Group();
      maskG.position.set(-0.18, 0.25, 0.12);
      maskG.rotation.set(-0.35, -0.45, 0.35);
      const whiteMat = LS.makeToonMat(0xfffcf5);
      const redMat = LS.makeToonMat(0xd62828);
      const face = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), whiteMat);
      face.scale.set(1.0, 1.1, 0.45);
      maskG.add(face);
      [-0.08, 0.08].forEach(ex => {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.13, 5), whiteMat);
        ear.position.set(ex, 0.15, 0);
        const earIn = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.08, 5), redMat);
        earIn.position.set(ex, 0.14, 0.025);
        maskG.add(ear, earIn);
      });
      const mark = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.025, 0.02), redMat);
      mark.position.set(0, 0.02, 0.06);
      maskG.add(mark);
      group.add(maskG);
    }
    return group;
  }

  LS.createAnimeCharacter = function (cfg) {
    const root = new THREE.Group();
    const s = cfg.scale || 1.0;

    const skinMat = LS.makeToonMat(cfg.skin || 0xffe3cc);
    const hairMat = LS.makeToonMat(cfg.hairColor || 0x3b261d);
    const topMat = LS.makeToonMat(cfg.topColor || 0xffffff);
    const bottomMat = LS.makeToonMat(cfg.bottomColor || 0x2d4373);
    const shoeMat = LS.makeToonMat(cfg.shoeColor || 0xd94c4c);
    const bpMat = LS.makeToonMat(cfg.backpackColor || 0xc92c3b);

    const bodyPivot = new THREE.Group();
    root.add(bodyPivot);
    const hd = !!LS.isHD;
    const legH = hd ? 0.66 : 0.52;
    const hipY = hd ? 0.72 : 0.58;

    function makeLeg(sideX) {
      const leg = new THREE.Group();
      leg.position.set(sideX, hipY, 0);
      const limb = new THREE.Mesh(
        new THREE.CylinderGeometry(hd ? 0.072 : 0.085, hd ? 0.056 : 0.072, legH, hd ? 14 : 10),
        cfg.pants ? bottomMat : skinMat
      );
      limb.position.y = -legH * 0.5;
      limb.castShadow = true;
      leg.add(limb);

      if (!cfg.pants) {
        const sockCol = (hd && cfg.sailorCollar) ? 0x262d3d : 0xffffff;
        const sockH = hd ? 0.28 : 0.16;
        const sock = new THREE.Mesh(new THREE.CylinderGeometry(hd ? 0.064 : 0.078, hd ? 0.058 : 0.072, sockH, hd ? 12 : 10), LS.makeToonMat(sockCol));
        sock.position.y = -legH + sockH * 0.5 + 0.02;
        leg.add(sock);
      }

      const shoe = new THREE.Mesh(new THREE.SphereGeometry(hd ? 0.095 : 0.11, 12, 8), shoeMat);
      shoe.scale.set(0.92, 0.62, 1.45);
      shoe.position.set(0, -legH - 0.02, 0.04);
      leg.add(shoe);
      return leg;
    }

    const leftLeg = makeLeg(hd ? -0.105 : -0.13);
    const rightLeg = makeLeg(hd ? 0.105 : 0.13);
    bodyPivot.add(leftLeg, rightLeg);

    const torsoY = hd ? 1.03 : 0.88;
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(hd ? 0.165 : 0.19, hd ? 0.185 : 0.23, hd ? 0.58 : 0.56, hd ? 16 : 12), topMat);
    torso.position.y = torsoY;
    torso.castShadow = true;
    bodyPivot.add(torso);

    if (hd) {
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.068, 0.14, 10), skinMat);
      neck.position.y = torsoY + 0.33;
      bodyPivot.add(neck);
    }

    if (!cfg.pants) {
      const skirt = new THREE.Mesh(new THREE.ConeGeometry(hd ? 0.28 : 0.32, hd ? 0.40 : 0.36, hd ? 20 : 14), bottomMat);
      skirt.position.y = hd ? 0.75 : 0.64;
      skirt.castShadow = true;
      bodyPivot.add(skirt);
    }

    if (cfg.sailorCollar) {
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(hd ? 0.185 : 0.21, hd ? 0.22 : 0.24, 0.16, hd ? 16 : 12), bottomMat);
      collar.position.y = torsoY + 0.21;
      bodyPivot.add(collar);
      const ribbon = new THREE.Mesh(new THREE.BoxGeometry(hd ? 0.11 : 0.14, hd ? 0.18 : 0.14, 0.06), LS.makeToonMat(0xd93848));
      ribbon.position.set(0, torsoY + 0.12, hd ? 0.19 : 0.21);
      bodyPivot.add(ribbon);
    }

    if (cfg.backpackColor) {
      const bp = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.38, 0.18), bpMat);
      bp.position.set(0, torsoY + 0.04, hd ? -0.21 : -0.24);
      bp.castShadow = true;
      bodyPivot.add(bp);
      const clasp = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.04), LS.makeToonMat(0xf2c94c));
      clasp.position.set(0, torsoY - 0.10, hd ? -0.31 : -0.34);
      bodyPivot.add(clasp);
    }

    function makeArm(sideX) {
      const arm = new THREE.Group();
      arm.position.set(sideX, torsoY + 0.22, 0);
      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(hd ? 0.075 : 0.085, 10, 8), topMat);
      arm.add(shoulder);
      if (hd) {
        const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.060, 0.20, 10), topMat);
        sleeve.position.y = -0.10;
        arm.add(sleeve);
      }
      const limb = new THREE.Mesh(new THREE.CylinderGeometry(hd ? 0.054 : 0.068, hd ? 0.045 : 0.058, hd ? 0.48 : 0.44, 10), skinMat);
      limb.position.y = hd ? -0.26 : -0.24;
      limb.castShadow = true;
      arm.add(limb);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(hd ? 0.052 : 0.065, 8, 8), skinMat);
      hand.position.y = hd ? -0.51 : -0.47;
      arm.add(hand);
      return arm;
    }

    const leftArm = makeArm(hd ? -0.22 : -0.26);
    const rightArm = makeArm(hd ? 0.22 : 0.26);
    bodyPivot.add(leftArm, rightArm);

    const headGroup = new THREE.Group();
    headGroup.position.y = hd ? 1.56 : 1.44;
    if (hd) headGroup.scale.set(0.84, 0.88, 0.84);
    bodyPivot.add(headGroup);

    const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.29, hd ? 24 : 18, hd ? 18 : 14), skinMat);
    headSphere.castShadow = true;
    headGroup.add(headSphere);

    const openFaceTex = LS.createAnimeFaceTexture(cfg.faceOpts);
    const blinkFaceTex = LS.createAnimeFaceTexture(Object.assign({}, cfg.faceOpts, { blink: true }));
    const happyFaceTex = LS.createAnimeFaceTexture(Object.assign({}, cfg.faceOpts, { happy: true }));

    const faceMat = new THREE.MeshBasicMaterial({ map: openFaceTex, transparent: true });
    const facePlane = new THREE.Mesh(
      new THREE.SphereGeometry(0.294, 16, 12, -Math.PI * 0.34, Math.PI * 0.68, Math.PI * 0.22, Math.PI * 0.56),
      faceMat
    );
    facePlane.rotation.y = Math.PI / 2;
    headGroup.add(facePlane);

    const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.305, hd ? 22 : 16, hd ? 16 : 12, 0, Math.PI * 2, 0, Math.PI * 0.58), hairMat);
    hairTop.position.y = 0.02;
    headGroup.add(hairTop);

    if (hd) {
      // Sculpted anime side bangs framing the face!
      [-0.22, 0.22].forEach(bx => {
        const strand = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.36, 7), hairMat);
        strand.position.set(bx, -0.06, 0.14);
        strand.rotation.x = Math.PI;
        strand.rotation.z = bx < 0 ? 0.14 : -0.14;
        headGroup.add(strand);
      });
    }

    if (cfg.longHair) {
      const backHair = new THREE.Mesh(new THREE.CylinderGeometry(0.27, hd ? 0.34 : 0.31, hd ? 0.54 : 0.42, hd ? 16 : 12), hairMat);
      backHair.position.set(0, hd ? -0.20 : -0.14, -0.08);
      headGroup.add(backHair);
    }
    if (cfg.pigtails) {
      [-0.28, 0.28].forEach(px => {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), hairMat);
        puff.position.set(px, -0.02, -0.06);
        headGroup.add(puff);
        const tie = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), LS.makeToonMat(0xf59e0b));
        tie.position.set(px * 0.85, 0.04, -0.04);
        headGroup.add(tie);
      });
    }

    const hatSlot = new THREE.Group();
    if (cfg.hatType && cfg.hatType !== 'none') {
      hatSlot.add(buildHatMeshes(cfg.hatType, cfg.hatColor));
    }
    headGroup.add(hatSlot);

    if (cfg.hairBun) {
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), hairMat);
      bun.position.set(0, 0.24, -0.2);
      headGroup.add(bun);
    }
    if (cfg.headband) {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.295, 0.032, 8, 20), LS.makeToonMat(0xf5f5f5));
      band.rotation.x = Math.PI / 2;
      band.position.y = 0.14;
      headGroup.add(band);
    }

    root.scale.setScalar(s);

    return {
      root,
      bodyPivot,
      headGroup,
      leftLeg,
      rightLeg,
      leftArm,
      rightArm,
      topMat,
      bottomMat,
      shoeMat,
      bpMat,
      hatSlot,
      faceMat,
      openFaceTex,
      blinkFaceTex,
      happyFaceTex,
      blinkTimer: 2 + Math.random() * 3,
      isBlinking: false
    };
  };

  LS.applyOutfit = function (who, outfitId) {
    const outfit = LS.OUTFITS.find(o => o.id === outfitId && o.who === who);
    const charObj = who === 'salma' ? LS.chars.salma : LS.chars.laila;
    if (!outfit || !charObj) return;
    const st = outfit.style;
    charObj.topMat.color.setHex(st.topColor);
    charObj.bottomMat.color.setHex(st.bottomColor);
    charObj.shoeMat.color.setHex(st.shoeColor);
    charObj.bpMat.color.setHex(st.backpackColor);

    while (charObj.hatSlot.children.length > 0) {
      charObj.hatSlot.remove(charObj.hatSlot.children[0]);
    }
    if (st.hatType && st.hatType !== 'none') {
      charObj.hatSlot.add(buildHatMeshes(st.hatType, st.hatColor));
    }
  };

  function createShibaInu() {
    const g = new THREE.Group();
    const fur = LS.makeToonMat(0xd98a3b);
    const cream = LS.makeToonMat(0xfae8cd);

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.32, 0.65), fur);
    body.position.y = 0.36;
    body.castShadow = true;
    g.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), fur);
    head.position.set(0, 0.56, 0.34);
    g.add(head);

    const snout = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), cream);
    snout.position.set(0, 0.52, 0.5);
    g.add(snout);

    [-0.12, 0.12].forEach(ex => {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.16, 6), fur);
      ear.position.set(ex, 0.76, 0.32);
      g.add(ear);
    });

    const tail = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.04, 6, 12, Math.PI * 1.4), fur);
    tail.position.set(0, 0.52, -0.34);
    tail.rotation.y = Math.PI / 2;
    g.add(tail);

    [[-0.11, 0.2], [0.11, 0.2], [-0.11, -0.2], [0.11, -0.2]].forEach(lp => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.28, 8), cream);
      leg.position.set(lp[0], 0.14, lp[1]);
      g.add(leg);
    });

    return g;
  }

  LS.initCoreCharacters = function (scene) {
    LS.chars.laila = LS.createAnimeCharacter({
      scale: 0.86,
      hairColor: 0x3b251b,
      topColor: 0xffffff,
      bottomColor: 0x2c4a7c,
      shoeColor: 0xd94848,
      sailorCollar: true,
      backpackColor: 0xc92c3b,
      longHair: true,
      hatType: 'none',
      faceOpts: { eyeColor: '#4e2e1a', eyeHighlight: '#966238' }
    });
    scene.add(LS.chars.laila.root);

    LS.chars.salma = LS.createAnimeCharacter({
      scale: 0.68,
      hairColor: 0x452b1f,
      topColor: 0xfff3b0,
      bottomColor: 0x3b6ea5,
      shoeColor: 0xf59e0b,
      backpackColor: 0xf59e0b,
      pigtails: true,
      hatType: 'kinder',
      hatColor: 0xfacc15,
      faceOpts: { eyeColor: '#54331d', eyeHighlight: '#a36b3e', blush: 'rgba(244, 120, 135, 0.52)' }
    });
    LS.chars.salmaBubble = LS.createSpeechBubbleSprite('Salma', 'Wait for me, Laila! Let us explore together! 🌸');
    LS.chars.salmaBubble.position.set(0, 2.35, 0);
    LS.chars.salma.root.add(LS.chars.salmaBubble);
    scene.add(LS.chars.salma.root);

    LS.applyOutfit('laila', LS.state.equippedLaila);
    LS.applyOutfit('salma', LS.state.equippedSalma);

    LS.chars.mochi = createShibaInu();
    const hc = document.createElement('canvas');
    hc.width = 160; hc.height = 120;
    const hctx = hc.getContext('2d');
    hctx.font = 'bold 74px sans-serif';
    hctx.textAlign = 'center';
    hctx.fillText('💖', 80, 88);
    const heartSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(hc), transparent: true, depthTest: false }));
    heartSprite.scale.set(0.95, 0.72, 1);
    heartSprite.position.set(0, 1.15, 0);
    heartSprite.visible = false;
    LS.chars.mochi.add(heartSprite);
    LS.chars.mochiHeart = heartSprite;
    scene.add(LS.chars.mochi);
  };

  LS.setSalmaBubbleText = function (text, showMs) {
    if (!LS.chars.salma) return;
    if (LS.chars.salmaBubble) {
      LS.chars.salma.root.remove(LS.chars.salmaBubble);
    }
    const nb = LS.createSpeechBubbleSprite('Salma', text);
    nb.position.set(0, 2.35, 0);
    nb.visible = Boolean(showMs);
    LS.chars.salmaBubble = nb;
    LS.chars.salma.root.add(nb);
    if (showMs) LS.runtime.salmaHintUntil = Date.now() + showMs;
  };

  LS.spawnWorldNPCs = function (worldGroup, npcConfigs) {
    LS.chars.npcs = [];
    npcConfigs.forEach(cfg => {
      const model = LS.createAnimeCharacter(cfg.char);
      model.root.position.copy(cfg.pos);
      if (cfg.baseRot !== undefined) model.root.rotation.y = cfg.baseRot;
      const bubble = LS.createSpeechBubbleSprite(cfg.name, cfg.line);
      bubble.position.set(0, 2.25, 0);
      model.root.add(bubble);
      worldGroup.add(model.root);

      LS.chars.npcs.push({
        name: cfg.name,
        model,
        bubble,
        patrol: cfg.patrol || null,
        dir: 1,
        waveOnNear: Boolean(cfg.waveOnNear),
        baseRot: cfg.baseRot || 0
      });
    });
  };

  LS.showSalmaAnimalHint = function () {
    const world = LS.activeWorld;
    if (!LS.chars.salma || !world || !world.hiddenAnimals) return;
    if (world.isInterior) {
      LS.setSalmaBubbleText('Let us decorate our room or step outside to play! 🎨', 3800);
      return;
    }
    const isKyoto = LS.state.currentWorld === 'kyoto';
    const label = isKyoto ? 'kitsune foxes' : 'cats';
    const emoji = isKyoto ? '🦊' : '🐱';
    const unfound = world.hiddenAnimals.filter(a => !a.found);
    if (unfound.length === 0) {
      const rem = LS.getAnimalResetRemainingMs(LS.state.currentWorld);
      const mins = Math.max(1, Math.ceil(rem / 60000));
      const doneMsg = 'We found all 5 ' + label + '! They will hide in new spots in ' + mins + ' min!';
      LS.setSalmaBubbleText(doneMsg, 4500);
      LS.showToast('🐾 Salma: ' + doneMsg);
      return;
    }
    const lp = LS.chars.laila.root.position;
    let nearest = unfound[0];
    let bestD = Infinity;
    unfound.forEach(a => {
      const d = a.mesh.position.distanceTo(lp);
      if (d < bestD) { bestD = d; nearest = a; }
    });
    const soundWord = isKyoto ? 'yipping happily' : 'meowing';
    const placeText = nearest.hint || (isKyoto ? 'somewhere nearby in Kyoto' : 'somewhere nearby in Tokyo');
    const hintText = 'Laila, I hear ' + nearest.name.split(' ')[0] + ' ' + soundWord + ' ' + placeText + '!';
    LS.setSalmaBubbleText(hintText, 5000);
    LS.showToast(emoji + ' Salma Boost: ' + hintText);
  };

  function buildSingleBowl(mealType, bowlScale) {
    const g = new THREE.Group();
    const bs = bowlScale || 1.0;

    if (mealType === 'tamago' || mealType === 'salmon' || mealType === 'sushi_boat') {
      // Wooden Kyoto geta sushi board with colorful nigiri!
      const board = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.05, 0.24), LS.makeToonMat(0xd4a373));
      board.position.y = 0.03;
      g.add(board);

      const toppings = mealType === 'tamago'
        ? [0xffd166, 0xffd166, 0x264653]
        : (mealType === 'salmon' ? [0xff7b54, 0xff7b54, 0xff9b71] : [0xff7b54, 0xffd166, 0xe63946]);
      toppings.forEach((col, i) => {
        const rice = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.08), LS.makeToonMat(0xffffff));
        rice.position.set(-0.13 + i * 0.13, 0.08, 0);
        const top = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.03, 0.085), LS.makeToonMat(col));
        top.position.set(-0.13 + i * 0.13, 0.12, 0);
        g.add(rice, top);
      });
    } else {
      const bowlMat = LS.makeToonMat(bs < 1 ? 0xe07a34 : 0xb82e2e);
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.14, 0.16, 14), bowlMat);
      bowl.position.y = 0.08;
      g.add(bowl);

      const brothColors = { shoyu: 0x7c4820, miso: 0xc27b30, tonkotsu: 0xf2dfc0 };
      const broth = new THREE.Mesh(
        new THREE.CylinderGeometry(0.21, 0.21, 0.02, 14),
        LS.makeToonMat(brothColors[mealType] || 0xc27b30)
      );
      broth.position.y = 0.15;
      g.add(broth);

      const chashu = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.025, 10), LS.makeToonMat(0x9e5838));
      chashu.position.set(-0.07, 0.17, 0.03);
      g.add(chashu);

      const naruto = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 10), LS.makeToonMat(0xffffff));
      naruto.position.set(0.08, 0.17, -0.05);
      g.add(naruto);

      const egg = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), LS.makeToonMat(0xffc947));
      egg.scale.set(1, 0.45, 1.2);
      egg.position.set(0.05, 0.17, 0.08);
      g.add(egg);

      const nori = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.12, 0.015), LS.makeToonMat(0x1f2e22));
      nori.position.set(0.0, 0.2, -0.16);
      nori.rotation.x = -0.3;
      g.add(nori);
    }

    const sticks = new THREE.Group();
    sticks.position.set(-0.04, 0.28, 0.0);
    const stickMat = LS.makeToonMat(0xd6a667);
    const s1 = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.006, 0.34, 6), stickMat);
    s1.rotation.z = 1.1;
    const s2 = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.006, 0.34, 6), stickMat);
    s2.rotation.z = 1.25;
    s2.position.y = 0.02;
    const bite = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.12, 8), LS.makeToonMat(mealType === 'salmon' ? 0xff7b54 : 0xf5d66b));
    bite.position.set(0.06, -0.05, 0);
    sticks.add(s1, s2, bite);
    g.add(sticks);

    g.scale.setScalar(bs);
    return { group: g, sticks };
  }

  LS.spawnMealProps = function (scene, mealType, diningConfig) {
    const wrapper = new THREE.Group();
    const lailaBowl = buildSingleBowl(mealType, 1.0);
    lailaBowl.group.position.copy(diningConfig.lailaDishPos);
    wrapper.add(lailaBowl.group);

    const salmaBowl = buildSingleBowl(mealType, 0.84);
    salmaBowl.group.position.copy(diningConfig.salmaDishPos);
    wrapper.add(salmaBowl.group);

    const sc = document.createElement('canvas');
    sc.width = 320; sc.height = 96;
    const ctx = sc.getContext('2d');
    ctx.fillStyle = '#fff5dc';
    ctx.strokeStyle = '#d97a2b';
    ctx.lineWidth = 6;
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    const caption = diningConfig.caption || 'Oishii! 😋🍜';
    ctx.strokeText(caption, 160, 60);
    ctx.fillText(caption, 160, 60);
    const oishii = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(sc), transparent: true }));
    oishii.scale.set(1.65, 0.5, 1);
    oishii.position.copy(diningConfig.oishiiPos);
    wrapper.add(oishii);

    scene.add(wrapper);
    return {
      group: wrapper,
      sticks: lailaBowl.sticks,
      salmaSticks: salmaBowl.sticks,
      oishii,
      baseOishiiY: diningConfig.oishiiPos.y
    };
  };

  function updateBlink(charObj, dt, forceHappy) {
    if (!charObj) return;
    if (forceHappy) {
      if (charObj.faceMat.map !== charObj.happyFaceTex) {
        charObj.faceMat.map = charObj.happyFaceTex;
        charObj.faceMat.needsUpdate = true;
      }
      return;
    }
    charObj.blinkTimer -= dt;
    if (!charObj.isBlinking && charObj.blinkTimer <= 0) {
      charObj.isBlinking = true;
      charObj.blinkTimer = 0.14;
      charObj.faceMat.map = charObj.blinkFaceTex;
      charObj.faceMat.needsUpdate = true;
    } else if (charObj.isBlinking && charObj.blinkTimer <= 0) {
      charObj.isBlinking = false;
      charObj.blinkTimer = 2.4 + Math.random() * 3.2;
      charObj.faceMat.map = charObj.openFaceTex;
      charObj.faceMat.needsUpdate = true;
    }
  }

  LS.updateCharacters = function (dt, elapsed, playerPos) {
    const happyNow = Boolean(LS.runtime.eating) || LS.runtime.poseTimer > 0;
    updateBlink(LS.chars.laila, dt, happyNow);
    if (LS.chars.salma) {
      updateBlink(LS.chars.salma, dt, happyNow || LS.runtime.highFiveTimer > 0);
      if (LS.chars.salmaBubble) {
        const hintActive = LS.runtime.salmaHintUntil && Date.now() < LS.runtime.salmaHintUntil;
        LS.chars.salmaBubble.visible = !LS.runtime.eating && (hintActive || (elapsed % 18 < 4.2));
      }
    }

    LS.chars.npcs.forEach(npc => {
      updateBlink(npc.model, dt, false);
      const dist = npc.model.root.position.distanceTo(playerPos);

      if (dist < 5.8) {
        const targetYaw = Math.atan2(
          playerPos.x - npc.model.root.position.x,
          playerPos.z - npc.model.root.position.z
        );
        let diff = targetYaw - npc.model.root.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        npc.model.root.rotation.y += diff * Math.min(1, dt * 6);
        npc.bubble.visible = true;
        npc.model.leftLeg.rotation.x *= 0.85;
        npc.model.rightLeg.rotation.x *= 0.85;
        if (npc.waveOnNear) {
          npc.model.rightArm.rotation.z = -2.4 + Math.sin(elapsed * 7) * 0.35;
        }
      } else {
        npc.bubble.visible = false;
        if (npc.waveOnNear) {
          npc.model.rightArm.rotation.z = Math.sin(elapsed * 2) * 0.08;
        }
        if (npc.patrol) {
          const p = npc.patrol;
          if (p.axis === 'x') {
            npc.model.root.position.x += npc.dir * p.speed * dt;
            if (npc.model.root.position.x > p.center + p.range) npc.dir = -1;
            if (npc.model.root.position.x < p.center - p.range) npc.dir = 1;
            npc.model.root.rotation.y = npc.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
          } else {
            npc.model.root.position.z += npc.dir * p.speed * dt;
            if (npc.model.root.position.z > p.center + p.range) npc.dir = -1;
            if (npc.model.root.position.z < p.center - p.range) npc.dir = 1;
            npc.model.root.rotation.y = npc.dir > 0 ? 0 : Math.PI;
          }
          const swing = Math.sin(elapsed * 5.5) * 0.45;
          npc.model.leftLeg.rotation.x = swing;
          npc.model.rightLeg.rotation.x = -swing;
          npc.model.leftArm.rotation.x = -swing * 0.7;
          npc.model.rightArm.rotation.x = swing * 0.7;
        }
      }
    });

    if (LS.chars.mochiHeart) {
      if (LS.runtime.mochiHeartTimer > 0) {
        LS.runtime.mochiHeartTimer -= dt;
        LS.chars.mochiHeart.visible = true;
        LS.chars.mochiHeart.position.y = 1.15 + Math.sin(elapsed * 8) * 0.14;
      } else {
        LS.chars.mochiHeart.visible = false;
      }
    }

    if (LS.chars.mochi && !LS.runtime.mochiGame && LS.activeWorld) {
      const anchor = LS.activeWorld.getMochiIdleAnchor ? LS.activeWorld.getMochiIdleAnchor() : null;
      if (anchor) {
        LS.chars.mochi.position.lerp(anchor.pos, Math.min(1, dt * 4));
        LS.chars.mochi.rotation.y = anchor.rotY;
      }
    }
  };
})(window.LailaSalma);
