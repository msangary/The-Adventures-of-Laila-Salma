window.LailaSalma = window.LailaSalma || {};

(function (LS) {
  let scene, camera, renderer, hemiLight, dirLight, streetLight, accentLight;
  let worldGroup = null;
  let hdCloudsGroup = null;
  let hdMotes = null;
  let sparkleSystem = null;
  let sparkleIdx = 0;
  let starBurstGroup = null;
  let starBurstTimer = 0;
  let resetCheckAccum = 0;

  const clock = new THREE.Clock();
  const keys = {};
  const joy = { x: 0, y: 0, active: false };

  // Smooth damped orbit camera state (auto-follow, pinch-zoom, keyboard orbit & wall-clip spring arm)
  let camYaw = Math.PI;
  let targetCamYaw = Math.PI;
  let camPitch = 0.30;
  let targetCamPitch = 0.30;
  let camDist = 6.6;
  let targetCamDist = 6.6;
  let effectiveCamDist = 6.6;
  let manualCamCooldown = 0;
  const camTarget = new THREE.Vector3();
  const lastMoveInput = { x: 0, z: 0, moving: false };
  const activePointers = new Map();
  let lastPinchDist = null;
  let camOccluderBoxes = [];
  const camRay = new THREE.Ray();
  const camRayDir = new THREE.Vector3();
  const camRayHit = new THREE.Vector3();
  let camSnapNext = true;

  let velY = 0;
  let grounded = true;
  let salmaVelY = 0;
  let salmaGrounded = true;
  let miniMapCompact = false;
  let miniMapBgCanvas = null;
  let zoneBeacons = [];

  // Reusable per-frame scratch vectors (zero GC allocations during movement & camera loops)
  const _fwd = new THREE.Vector3();
  const _right = new THREE.Vector3();
  const _moveVec = new THREE.Vector3();
  const _desiredTarget = new THREE.Vector3();
  const _chasePos = new THREE.Vector3();
  const _chaseLook = new THREE.Vector3();
  const _frontPos = new THREE.Vector3();
  const _frontLook = new THREE.Vector3();

  LS.activeWorld = null;
  LS.getScene = function () { return scene; };
  LS.getEngineStats = function () {
    return {
      zoneBeacons: zoneBeacons.length,
      miniMapCached: !!miniMapBgCanvas,
      camOccluders: camOccluderBoxes.length
    };
  };
  LS.getCameraState = function () {
    return {
      yaw: camYaw,
      targetYaw: targetCamYaw,
      pitch: camPitch,
      dist: effectiveCamDist,
      targetDist: targetCamDist,
      mode: LS.runtime.camMode,
      occluders: camOccluderBoxes.length
    };
  };

  function wrapAngleDelta(from, to) {
    let d = (to - from) % (Math.PI * 2);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    return d;
  }

  function buildCamOccluders() {
    camOccluderBoxes = [];
    if (!worldGroup) return;
    worldGroup.updateMatrixWorld(true);
    const box = new THREE.Box3();
    const size = new THREE.Vector3();
    worldGroup.traverse(obj => {
      if (!obj.isMesh || obj.isInstancedMesh || !obj.visible) return;
      if (obj.userData && (obj.userData.isOutline || obj.userData.noCamClip)) return;
      const mat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
      if (mat && mat.transparent && (mat.opacity === undefined || mat.opacity < 0.85)) return;
      if (!obj.geometry) return;
      const gType = obj.geometry.type || '';
      if (gType === 'PlaneGeometry' || gType === 'RingGeometry' || gType === 'CircleGeometry') return;
      box.setFromObject(obj);
      if (box.isEmpty()) return;
      box.getSize(size);
      // Include solid tall buildings & walls while skipping flat ground/water, low bridges, thin poles, and high tree canopies
      if (box.min.y <= 1.2 && box.max.y >= 2.5 && size.y >= 1.8 &&
          size.x >= 2.0 && size.z >= 2.0 && size.x <= 24.0 && size.z <= 24.0) {
        camOccluderBoxes.push(box.clone());
      }
    });
  }

  function showError(msg) {
    const ov = document.getElementById('error-overlay');
    const el = document.getElementById('error-message');
    if (el) el.textContent = msg;
    if (ov) ov.classList.remove('hidden');
  }

  function applyTimeOfDay() {
    const mode = LS.state.timeMode;
    const wid = LS.state.currentWorld;
    const meta = LS.WORLDS[wid] || LS.WORLDS.tokyo;
    const btn = document.getElementById('btn-time');

    if (hdCloudsGroup) hdCloudsGroup.visible = !meta.isInterior;
    if (hdMotes) hdMotes.visible = !meta.isInterior;

    if (meta.isInterior) {
      scene.fog.color.setHex(wid === 'kyoto_room' ? 0x3b2c26 : 0xffeef4);
      dirLight.color.setHex(0xfff1d6);
      dirLight.intensity = LS.isHD ? 0.85 : 0.62;
      hemiLight.color.setHex(0xfff4e2);
      hemiLight.groundColor.setHex(0x9a7d60);
      streetLight.intensity = 0.32;
      accentLight.intensity = 0.28;
      return;
    }

    if (mode === 1) {
      scene.fog.color.setHex(wid === 'safari' ? 0xe88b4f : (wid === 'kyoto' ? 0xeb9b6c : 0xf2a772));
      dirLight.color.setHex(0xffa054);
      dirLight.intensity = LS.isHD ? 1.28 : 1.05;
      hemiLight.color.setHex(0xffc99e);
      hemiLight.groundColor.setHex(0x523f5c);
      streetLight.intensity = 0.72;
      accentLight.intensity = 0.85;
      if (btn) btn.textContent = '🌇';
    } else if (mode === 2) {
      scene.fog.color.setHex(0x25355a);
      dirLight.color.setHex(0x88a8e6);
      dirLight.intensity = LS.isHD ? 0.72 : 0.62;
      hemiLight.color.setHex(0x50689c);
      hemiLight.groundColor.setHex(0x1f2536);
      streetLight.intensity = 1.05;
      accentLight.intensity = 1.15;
      if (btn) btn.textContent = '🌙';
    } else {
      scene.fog.color.setHex(wid === 'safari' ? 0xeddcb8 : (LS.isHD ? 0xd8e8f5 : (wid === 'kyoto' ? 0xc8e4f2 : 0xcbe6f7)));
      dirLight.color.setHex(wid === 'safari' ? 0xffe2a4 : (LS.isHD ? 0xffe4b3 : 0xfff1d0));
      dirLight.intensity = LS.isHD ? 1.26 : 1.14;
      hemiLight.color.setHex(wid === 'safari' ? 0xb4d8ff : (LS.isHD ? 0x9ac8ff : 0xbbe2ff));
      hemiLight.groundColor.setHex(wid === 'safari' ? 0x8a6d3b : (LS.isHD ? 0x4f637a : 0x74855c));
      streetLight.intensity = 0.25;
      accentLight.intensity = 0.35;
      if (btn) btn.textContent = '🌤️';
    }
    if (LS.hdPost && LS.hdPost.setTimeMode) LS.hdPost.setTimeMode(mode);

    if (hdCloudsGroup) {
      const cCol = mode === 1 ? 0xffd7b0 : (mode === 2 ? 0x5c6f9c : 0xfffdf8);
      hdCloudsGroup.traverse(o => { if (o.isMesh && o.material) o.material.color.setHex(cCol); });
    }
    if (hdMotes && hdMotes.material) {
      hdMotes.material.color.setHex(mode === 2 ? 0xd9ff70 : (mode === 1 ? 0xffdf80 : 0xfff8cc));
      hdMotes.material.opacity = mode === 2 ? 0.92 : (mode === 1 ? 0.78 : 0.55);
      hdMotes.material.size = mode === 2 ? 0.34 : 0.22;
    }

    if (LS.activeWorld && LS.activeWorld.skyMesh) {
      LS.activeWorld.skyMesh.material.map = LS.createSkyTexture(mode, wid);
      LS.activeWorld.skyMesh.material.needsUpdate = true;
    }
  }
  LS.applyTimeOfDay = applyTimeOfDay;

  function initSparklesAndStars() {
    const count = 48;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) pos[i * 3 + 1] = -999;
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffd6f0, size: 0.24, transparent: true, opacity: 0.92 });
    sparkleSystem = new THREE.Points(geo, mat);
    scene.add(sparkleSystem);

    // 3D Star Particle Burst for Synchronized Sister High-Five!
    starBurstGroup = new THREE.Group();
    const starC = document.createElement('canvas');
    starC.width = 64; starC.height = 64;
    const sctx = starC.getContext('2d');
    sctx.font = 'bold 48px sans-serif';
    sctx.textAlign = 'center';
    sctx.fillText('⭐', 32, 48);
    const starTex = new THREE.CanvasTexture(starC);
    for (let i = 0; i < 12; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, transparent: true }));
      sp.scale.set(0.42, 0.42, 1);
      sp.userData = {
        vx: Math.cos((i / 12) * Math.PI * 2) * (1.2 + (i % 3) * 0.4),
        vy: 1.8 + (i % 4) * 0.45,
        vz: Math.sin((i / 12) * Math.PI * 2) * (1.2 + (i % 3) * 0.4)
      };
      starBurstGroup.add(sp);
    }
    starBurstGroup.visible = false;
    scene.add(starBurstGroup);
  }

  function triggerStarBurst(origin) {
    if (!starBurstGroup) return;
    starBurstGroup.position.copy(origin).add(new THREE.Vector3(0, 1.4, 0));
    starBurstGroup.children.forEach(sp => {
      sp.position.set(0, 0, 0);
      sp.material.opacity = 1;
    });
    starBurstGroup.visible = true;
    starBurstTimer = 1.3;
  }

  function updateSparklesAndStars(dt) {
    if (sparkleSystem && LS.chars.laila) {
      const pos = sparkleSystem.geometry.attributes.position;
      const active = (LS.runtime.sparkleUntil && Date.now() < LS.runtime.sparkleUntil) ||
                     (LS.runtime.piggybackUntil && Date.now() < LS.runtime.piggybackUntil);
      if (active) {
        const lp = LS.chars.laila.root.position;
        const i = sparkleIdx % pos.count;
        pos.setXYZ(
          i,
          lp.x + (Math.random() - 0.5) * 0.9,
          lp.y + 0.4 + Math.random() * 1.1,
          lp.z + (Math.random() - 0.5) * 0.9
        );
        sparkleIdx++;
      }
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i);
        if (y > -50) {
          y += dt * 0.55;
          if (!active && y > 4.5) y = -999;
          pos.setY(i, y);
        }
      }
      pos.needsUpdate = true;
    }

    if (starBurstTimer > 0 && starBurstGroup) {
      starBurstTimer -= dt;
      starBurstGroup.children.forEach(sp => {
        sp.position.x += sp.userData.vx * dt;
        sp.position.y += sp.userData.vy * dt;
        sp.position.z += sp.userData.vz * dt;
        sp.userData.vy -= 2.2 * dt;
        sp.material.opacity = Math.max(0, starBurstTimer / 1.3);
      });
      if (starBurstTimer <= 0) starBurstGroup.visible = false;
    }
  }

  function clearWorldGroup() {
    if (LS.hdPost && LS.hdPost.clearAnimatedUniforms) {
      LS.hdPost.clearAnimatedUniforms();
    }
    zoneBeacons = [];
    if (!worldGroup) return;
    while (worldGroup.children.length > 0) {
      worldGroup.remove(worldGroup.children[0]);
    }
  }

  function buildZoneBeacons() {
    zoneBeacons = [];
    if (!LS.activeWorld || !LS.activeWorld.zones || !worldGroup) return;
    const outerGeo = new THREE.RingGeometry(0.92, 1.16, 28);
    const innerGeo = new THREE.RingGeometry(0.46, 0.56, 24);
    LS.activeWorld.zones.forEach((z, idx) => {
      if (!z || !z.id || z.id.startsWith('animal:')) return;
      const g = new THREE.Group();
      const gy = z.pos.y > 0.05 ? z.pos.y : getGroundH(z.pos.x, z.pos.z);
      g.position.set(z.pos.x, gy + 0.048, z.pos.z);
      const outerMat = new THREE.MeshBasicMaterial({
        color: 0xffd166, transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false
      });
      const innerMat = new THREE.MeshBasicMaterial({
        color: 0xfff3b0, transparent: true, opacity: 0.34, side: THREE.DoubleSide, depthWrite: false
      });
      const outer = new THREE.Mesh(outerGeo, outerMat);
      outer.rotation.x = -Math.PI / 2;
      outer.userData.noCamClip = true;
      const inner = new THREE.Mesh(innerGeo, innerMat);
      inner.rotation.x = -Math.PI / 2;
      inner.userData.noCamClip = true;
      g.add(outer);
      g.add(inner);
      worldGroup.add(g);
      zoneBeacons.push({ id: z.id, group: g, outerMat, innerMat, phase: idx * 0.7 });
    });
  }

  function updateZoneBeacons(elapsed) {
    if (zoneBeacons.length === 0) return;
    const activeId = LS.runtime.nearZone ? LS.runtime.nearZone.id : null;
    for (let i = 0; i < zoneBeacons.length; i++) {
      const b = zoneBeacons[i];
      const isNear = b.id === activeId;
      const pulse = 0.5 + 0.5 * Math.sin(elapsed * (isNear ? 5.2 : 2.6) + b.phase);
      const sc = isNear ? (1.10 + pulse * 0.14) : (0.94 + pulse * 0.09);
      b.group.scale.set(sc, 1, sc);
      b.outerMat.opacity = isNear ? (0.68 + pulse * 0.24) : (0.28 + pulse * 0.18);
      b.innerMat.opacity = isNear ? (0.55 + pulse * 0.25) : (0.18 + pulse * 0.16);
      b.outerMat.color.setHex(isNear ? 0xfff08a : 0xffd166);
    }
  }

  function cacheMiniMapBackground() {
    miniMapBgCanvas = null;
    if (!LS.activeWorld || !LS.activeWorld.drawMiniMap) return;
    const liveCanvas = document.getElementById('minimap-canvas');
    const W = liveCanvas ? liveCanvas.width : 176;
    const H = liveCanvas ? liveCanvas.height : 176;
    const mb = LS.WORLDS[LS.state.currentWorld] && LS.WORLDS[LS.state.currentWorld].mapBounds;
    if (!mb) return;
    const off = document.createElement('canvas');
    off.width = W;
    off.height = H;
    const octx = off.getContext('2d');
    const toMapX = wx => ((wx - mb.minX) / (mb.maxX - mb.minX)) * W;
    const toMapY = wz => ((wz - mb.minZ) / (mb.maxZ - mb.minZ)) * H;
    LS.activeWorld.drawMiniMap(octx, W, H, toMapX, toMapY);
    miniMapBgCanvas = off;
  }

  LS.loadWorld = function (worldId, viaTrain, customSpawn) {
    const meta = LS.WORLDS[worldId];
    const builder = LS.worldBuilders[worldId];
    if (!meta || !builder) return;

    // Auto-check 2-hour Hide-and-Seek animal reset when entering Tokyo, Kyoto, or Safari!
    let didResetAnimals = false;
    if (worldId === 'tokyo' || worldId === 'kyoto' || worldId === 'safari') {
      didResetAnimals = LS.checkAnimalReset(worldId);
    }

    if (LS.runtime.eating) LS.finishEatingAnimation(scene);
    LS.runtime.mochiGame = null;
    LS.runtime.parkActivity = null;
    LS.runtime.safariRide = null;
    LS.runtime.bikeRide = null;
    const bikeBan = document.getElementById('bike-banner');
    if (bikeBan) bikeBan.classList.add('hidden');
    LS.runtime.nearZone = null;
    LS.runtime.piggybackUntil = 0;
    LS.closeAllModals();

    LS.state.currentWorld = worldId;
    if (!meta.isInterior) LS.saveState();

    clearWorldGroup();

    scene.fog.near = meta.fogNear || 55;
    scene.fog.far = meta.fogFar || 185;

    if (meta.isInterior) {
      dirLight.position.set(4, 9, 5);
      dirLight.shadow.camera.left = -10;
      dirLight.shadow.camera.right = 10;
      dirLight.shadow.camera.top = 10;
      dirLight.shadow.camera.bottom = -10;
      dirLight.shadow.camera.updateProjectionMatrix();
      streetLight.position.set(0, 3.8, 0);
      accentLight.position.set(-3, 2.5, -2);
    } else if (worldId === 'safari') {
      dirLight.position.set(LS.isHD ? 36 : 24, LS.isHD ? 28 : 40, 22);
      dirLight.shadow.camera.left = -64;
      dirLight.shadow.camera.right = 64;
      dirLight.shadow.camera.top = 56;
      dirLight.shadow.camera.bottom = -60;
      dirLight.shadow.camera.updateProjectionMatrix();
      streetLight.position.set(0, 5.4, 12);
      accentLight.position.set(-24.0, 4.2, -26.0);
    } else if (worldId === 'kyoto') {
      dirLight.position.set(LS.isHD ? 28 : 16, LS.isHD ? 24 : 38, LS.isHD ? 20 : 16);
      dirLight.shadow.camera.left = -64;
      dirLight.shadow.camera.right = 46;
      dirLight.shadow.camera.top = 46;
      dirLight.shadow.camera.bottom = -58;
      dirLight.shadow.camera.updateProjectionMatrix();
      streetLight.position.set(0, 5.2, -10);
      accentLight.position.set(-22.0, 3.6, -27.5);
    } else {
      dirLight.position.set(LS.isHD ? 34 : 22, LS.isHD ? 24 : 38, 18);
      dirLight.shadow.camera.left = -54;
      dirLight.shadow.camera.right = 56;
      dirLight.shadow.camera.top = 50;
      dirLight.shadow.camera.bottom = -54;
      dirLight.shadow.camera.updateProjectionMatrix();
      streetLight.position.set(0, 5.2, -6);
      accentLight.position.set(24.0, 4.2, 16.0);
    }

    LS.activeWorld = builder.build(worldGroup, scene);
    buildCamOccluders();
    buildZoneBeacons();
    cacheMiniMapBackground();

    const sp = customSpawn || (viaTrain ? meta.arrivalSpawn : meta.spawn);
    const baseH = LS.activeWorld.getGroundHeight ? LS.activeWorld.getGroundHeight(sp.x, sp.z) : 0;
    LS.chars.laila.root.position.set(sp.x, baseH, sp.z);
    LS.chars.laila.root.rotation.y = sp.rotY;
    LS.chars.salma.root.position.set(sp.x - 1.1, baseH, sp.z + 1.1);
    LS.chars.salma.root.rotation.y = sp.rotY;
    grounded = true;
    salmaGrounded = true;
    velY = 0;
    salmaVelY = 0;

    if (LS.chars.mochi && LS.activeWorld.mochiStartPos) {
      LS.chars.mochi.position.copy(LS.activeWorld.mochiStartPos);
    }

    camYaw = sp.rotY;
    targetCamYaw = sp.rotY;
    camPitch = meta.isInterior ? 0.38 : 0.30;
    targetCamPitch = camPitch;
    camDist = meta.isInterior ? 4.8 : 6.8;
    targetCamDist = camDist;
    effectiveCamDist = camDist;
    manualCamCooldown = 0;
    camTarget.set(sp.x, baseH + 1.25, sp.z);
    camSnapNext = true;
    const initOffX = -Math.sin(camYaw) * Math.cos(camPitch) * camDist;
    const initOffY = Math.sin(camPitch) * camDist + 1.35;
    const initOffZ = -Math.cos(camYaw) * Math.cos(camPitch) * camDist;
    camera.position.set(sp.x + initOffX, baseH + initOffY, sp.z + initOffZ);
    camera.lookAt(camTarget);

    const legendAnimal = document.getElementById('mm-animal-label');
    if (legendAnimal) {
      legendAnimal.innerHTML = worldId === 'safari'
        ? '<i class="mm-dot mm-cat"></i>Cubs'
        : ((worldId === 'kyoto' || worldId === 'kyoto_room')
          ? '<i class="mm-dot mm-cat"></i>Foxes'
          : '<i class="mm-dot mm-cat"></i>Cats');
    }
    const mmCard = document.getElementById('minimap-card');
    if (mmCard) mmCard.title = meta.title + ' Mini-Map (M to toggle)';

    if (meta.isInterior) {
      LS.setSalmaBubbleText('Yay! Walk to the Decorate desk to redecorate our room in 3D! 🎨', 4200);
      LS.unlockStamp('room_decorator');
    } else if (worldId === 'safari') {
      LS.setSalmaBubbleText('Whoa, African Safari!! Let us ride the Jeep, feed giraffes & elephants & find 5 lion cubs! 🦒🐘🦁', 0);
      LS.unlockStamp('safari_arrival');
    } else if (worldId === 'kyoto') {
      LS.setSalmaBubbleText('Whoa, Kyoto! Let us cross the koi bridge, visit the park & find 5 foxes! ⛩️🦊', 0);
      LS.unlockStamp('kyoto_arrival');
    } else {
      LS.setSalmaBubbleText('Yay, Tokyo! Let us explore the airport, park, ramen & 5 hiding cats! 🌸🐱', 0);
    }

    applyTimeOfDay();
    LS.updateHUD();

    if (didResetAnimals) {
      setTimeout(() => {
        LS.showToast(worldId === 'safari'
          ? '🦁 2 hours passed! All 5 Safari Lion Cubs hid in brand-new spots!'
          : (worldId === 'kyoto'
            ? '🦊 2 hours passed! All 5 Kyoto Kitsune hid in brand-new spots!'
            : '🐱 2 hours passed! All 5 Tokyo Cats hid in brand-new spots!'));
      }, 600);
    }
  };

  LS.enterInterior = function (roomId) {
    LS.playSFX('door');
    LS.loadWorld(roomId, false);
    LS.showToast(roomId === 'kyoto_room'
      ? "🏮 Welcome inside Laila & Salma's Kyoto Ryokan Suite!"
      : "🏡 Welcome inside Laila & Salma's Tokyo Room!");
  };

  LS.exitInterior = function () {
    const meta = LS.WORLDS[LS.state.currentWorld];
    if (!meta || !meta.isInterior) return;
    LS.playSFX('door');
    LS.loadWorld(meta.parentWorld, false, meta.exitPos);
  };

  LS.travelToWorld = function (targetWorldId) {
    if (LS.runtime.traveling || !LS.WORLDS[targetWorldId]) return;
    if (targetWorldId === LS.state.currentWorld) {
      LS.closeAllModals();
      LS.showToast('You are already in ' + LS.WORLDS[targetWorldId].title + '!');
      return;
    }

    LS.closeAllModals();
    LS.runtime.traveling = true;
    const fromMeta = LS.WORLDS[LS.state.currentWorld];
    const toMeta = LS.WORLDS[targetWorldId];
    const isFlight = targetWorldId === 'safari' || LS.state.currentWorld === 'safari';

    const overlay = document.getElementById('travel-overlay');
    const titleEl = document.getElementById('travel-title');
    const subEl = document.getElementById('travel-sub');
    if (titleEl) {
      titleEl.textContent = (isFlight ? '✈️ Safari Charter Flight: ' : '🚅 Shinkansen Express: ') + fromMeta.title + ' → ' + toMeta.title;
    }
    if (subEl) {
      subEl.textContent = isFlight
        ? 'Fasten seatbelts, Laila, Salma & Mochi! Soaring above the clouds toward ' + toMeta.title + '...'
        : 'All aboard, Laila, Salma & Mochi! Zooming past Mt. Fuji at 300 km/h...';
    }
    if (overlay) overlay.classList.remove('hidden');

    LS.playSFX('train');

    setTimeout(() => {
      LS.loadWorld(targetWorldId, true);
    }, 850);

    setTimeout(() => {
      if (overlay) overlay.classList.add('hidden');
      LS.runtime.traveling = false;
      LS.showToast(toMeta.emoji + ' Welcome to ' + toMeta.title + ' — ' + toMeta.subtitle + '!');
    }, 1750);
  };

  function getGroundH(x, z) {
    if (LS.activeWorld && LS.activeWorld.getGroundHeight) {
      return LS.activeWorld.getGroundHeight(x, z);
    }
    return 0;
  }

  LS.ringBikeBell = function () {
    LS.playTone(1567.98, 0.14, 'sine', 0.16);
    setTimeout(() => LS.playTone(1975.53, 0.18, 'sine', 0.16), 95);
    LS.showToast('🔔 Ring-ring! Coming through, Tokyo!');
  };

  LS.mountYellowBike = function () {
    if (LS.runtime.bikeRide || LS.runtime.modalOpen || LS.runtime.eating || LS.runtime.traveling) return;
    if (!LS.activeWorld || !LS.activeWorld.rideableBike || !LS.chars.laila) return;
    const bike = LS.activeWorld.rideableBike;
    const laila = LS.chars.laila;
    LS.runtime.bikeRide = { bike, speed: 0, pedalPhase: 0, lean: 0 };
    LS.runtime.nearZone = null;
    laila.root.position.set(bike.position.x, getGroundH(bike.position.x, bike.position.z) + 0.34, bike.position.z);
    laila.root.rotation.y = bike.rotation.y;
    const bBeacon = zoneBeacons.find(b => b.id === 'tokyo_yellow_bike');
    if (bBeacon) bBeacon.group.visible = false;
    const prompt = document.getElementById('interact-prompt');
    const mobBtn = document.getElementById('btn-interact-mobile');
    if (prompt) prompt.classList.add('hidden');
    if (mobBtn) mobBtn.classList.add('hidden');
    const bikeBan = document.getElementById('bike-banner');
    if (bikeBan) bikeBan.classList.remove('hidden');
    LS.ringBikeBell();
    LS.setSalmaBubbleText('Wheee!! I love riding on the back of your yellow bike, Laila! 🚲💛', 3800);
    LS.showToast('🚲 Hopped on the Yellow Bicycle! Use WASD/Arrows to ride, Space for bell, E to park!');
  };

  LS.dismountYellowBike = function () {
    if (!LS.runtime.bikeRide || !LS.chars.laila) return;
    const bike = LS.runtime.bikeRide.bike;
    const laila = LS.chars.laila;
    const salma = LS.chars.salma;
    const yaw = bike.rotation.y;
    bike.rotation.z = 0;
    const gy = getGroundH(bike.position.x, bike.position.z);
    bike.position.y = gy;

    // Step Laila & Salma smoothly to the side of the parked bicycle
    const sideX = Math.cos(yaw), sideZ = -Math.sin(yaw);
    laila.root.position.set(bike.position.x + sideX * 0.95, gy, bike.position.z + sideZ * 0.95);
    resolveCollisions(laila.root.position, 0.45);
    laila.root.position.y = getGroundH(laila.root.position.x, laila.root.position.z);
    laila.leftLeg.rotation.x = 0; laila.rightLeg.rotation.x = 0;
    laila.leftArm.rotation.x = 0; laila.rightArm.rotation.x = 0; laila.rightArm.rotation.z = 0;
    laila.bodyPivot.rotation.z = 0;

    if (salma) {
      salma.root.position.set(bike.position.x - sideX * 0.95, gy, bike.position.z - sideZ * 0.95);
      resolveCollisions(salma.root.position, 0.4);
      salma.root.position.y = getGroundH(salma.root.position.x, salma.root.position.z);
      salma.leftLeg.rotation.x = 0; salma.rightLeg.rotation.x = 0;
      salma.leftArm.rotation.x = 0; salma.rightArm.rotation.x = 0; salma.rightArm.rotation.z = 0;
      salma.bodyPivot.rotation.z = 0;
    }

    // Move the interactive zone & golden welcome ring right to the new parked spot!
    if (LS.activeWorld && LS.activeWorld.zones) {
      const bz = LS.activeWorld.zones.find(z => z.id === 'tokyo_yellow_bike');
      if (bz) bz.pos.set(bike.position.x, gy, bike.position.z);
    }
    const bBeacon = zoneBeacons.find(b => b.id === 'tokyo_yellow_bike');
    if (bBeacon) {
      bBeacon.group.position.set(bike.position.x, gy + 0.048, bike.position.z);
      bBeacon.group.visible = true;
    }

    LS.runtime.bikeRide = null;
    grounded = true;
    salmaGrounded = true;
    const bikeBan = document.getElementById('bike-banner');
    if (bikeBan) bikeBan.classList.add('hidden');
    LS.playSFX('jump');
    LS.showToast('🅿️ Parked the yellow bicycle! Press E near it anytime to ride again!');
  };

  function triggerJump() {
    if (LS.runtime.bikeRide) {
      LS.ringBikeBell();
      return;
    }
    if (grounded && !LS.runtime.eating && !LS.runtime.modalOpen && !LS.runtime.traveling && !LS.runtime.parkActivity) {
      const superJump = LS.runtime.superJumpUntil && Date.now() < LS.runtime.superJumpUntil;
      velY = superJump ? 10.2 : 6.4;
      grounded = false;
      LS.playSFX('jump');
      if (salmaGrounded && !(LS.runtime.piggybackUntil && Date.now() < LS.runtime.piggybackUntil)) {
        setTimeout(() => {
          if (salmaGrounded && !LS.runtime.eating) {
            salmaVelY = 6.1;
            salmaGrounded = false;
          }
        }, 120);
      }
    }
  }

  function triggerSisterPose() {
    if (LS.runtime.eating || LS.runtime.modalOpen || LS.runtime.traveling) return;
    if (LS.runtime.bikeRide) {
      LS.ringBikeBell();
      return;
    }
    LS.runtime.poseTimer = 2.4;
    const nearSalma = LS.chars.salma &&
      LS.chars.laila.root.position.distanceTo(LS.chars.salma.root.position) < 4.0;
    if (nearSalma) {
      // Synchronized Jump High-Five + 3D Floating Star Particles + 12s Piggyback Boost + Animal Hint!
      LS.runtime.highFiveTimer = 1.3;
      LS.runtime.piggybackUntil = Date.now() + 12000;
      LS.runtime.buff = {
        name: 'Sister Piggyback Boost',
        short: 'Piggyback⚡',
        speedMult: 1.32,
        infiniteStamina: true,
        expiresAt: Date.now() + 12000
      };
      if (grounded) { velY = 5.4; grounded = false; }
      triggerStarBurst(LS.chars.laila.root.position);
      LS.playSFX('correct');
      LS.showToast('⭐🙌 Jump High-Five & Piggyback Boost! Salma hops on & listens for hidden friends!');
      LS.showSalmaAnimalHint();
    } else {
      LS.playTone(523.25, 0.1);
      LS.playTone(659.25, 0.14, 'sine', 0.1);
      LS.showToast('👋 Laila & Salma wave hello to ' + LS.WORLDS[LS.state.currentWorld].title + '!');
    }
  }

  function setCameraMode(mode) {
    LS.runtime.camMode = mode;
    const btn = document.getElementById('btn-front-cam');
    const banner = document.getElementById('front-view-banner');
    const label = document.getElementById('front-view-label');
    if (LS.runtime.camMode === 0) {
      if (btn) btn.classList.remove('active');
      if (banner) banner.classList.add('hidden');
    } else if (LS.runtime.camMode === 1) {
      if (btn) btn.classList.add('active');
      if (label) label.textContent = "📷 Laila's Front View";
      if (banner) banner.classList.remove('hidden');
    } else {
      if (btn) btn.classList.add('active');
      if (label) label.textContent = "📷 Salma's Front View";
      if (banner) banner.classList.remove('hidden');
    }
  }

  function cycleCameraMode() {
    setCameraMode((LS.runtime.camMode + 1) % 3);
  }

  function recenterCamera() {
    const laila = LS.chars.laila;
    if (!laila || LS.runtime.modalOpen || LS.runtime.eating) return;
    if (LS.runtime.camMode !== 0) setCameraMode(0);
    const meta = LS.WORLDS[LS.state.currentWorld] || LS.WORLDS.tokyo;
    targetCamYaw = camYaw + wrapAngleDelta(camYaw, laila.root.rotation.y);
    targetCamPitch = meta.isInterior ? 0.38 : 0.30;
    manualCamCooldown = 0;
  }

  function toggleMiniMap() {
    miniMapCompact = !miniMapCompact;
    const canvas = document.getElementById('minimap-canvas');
    const legend = document.querySelector('.minimap-legend');
    if (canvas) canvas.classList.toggle('hidden', miniMapCompact);
    if (legend) legend.classList.toggle('hidden', miniMapCompact);
  }

  function toggleRunButton() {
    LS.runtime.runToggle = !LS.runtime.runToggle;
    document.getElementById('btn-run').classList.toggle('active', LS.runtime.runToggle);
  }

  function triggerInteract() {
    if (LS.runtime.modalOpen || LS.runtime.eating || LS.runtime.traveling) return;
    if (LS.runtime.bikeRide) {
      LS.dismountYellowBike();
      return;
    }
    if (!LS.runtime.nearZone && LS.chars.mochi &&
        LS.chars.laila.root.position.distanceTo(LS.chars.mochi.position) < 2.6) {
      LS.openMochiModal();
      return;
    }
    if (!LS.runtime.nearZone) return;
    const zid = LS.runtime.nearZone.id;
    if (zid === 'tokyo_yellow_bike') LS.mountYellowBike();
    else if (zid === 'school') LS.openSchoolModal('tokyo');
    else if (zid === 'kyoto_academy') LS.openSchoolModal('kyoto');
    else if (zid === 'ramen') LS.openRamenModal();
    else if (zid === 'sushi_stand') LS.openSushiModal();
    else if (zid === 'tea_house') LS.openTeaHouseModal();
    else if (zid === 'shop') LS.openShopModal('tokyo');
    else if (zid === 'kimono_shop') LS.openShopModal('kyoto');
    else if (zid === 'gachapon') LS.openGachaponModal('tokyo');
    else if (zid === 'kyoto_gachapon') LS.openGachaponModal('kyoto');
    else if (zid === 'toy_shelf_view') LS.openGachaponModal('all');
    else if (zid === 'drink_vending') LS.openDrinkVendingModal();
    else if (zid === 'clubhouse') LS.enterInterior('tokyo_room');
    else if (zid === 'kyoto_ryokan') LS.enterInterior('kyoto_room');
    else if (zid === 'decorate_tokyo_room') LS.openClubhouseModal();
    else if (zid === 'decorate_ryokan') LS.openRyokanModal();
    else if (zid === 'exit_interior') LS.exitInterior();
    else if (zid === 'shrine_omikuji') LS.openShrineModal();
    else if (zid === 'koi_dock') LS.feedKoiAndDucks();
    else if (zid === 'shinkansen_station') LS.openShinkansenModal();
    else if (zid === 'airport_gate' || zid === 'safari_airstrip') LS.openAirportModal();
    else if (zid === 'safari_academy') LS.openSchoolModal('safari');
    else if (zid === 'safari_shop') LS.openShopModal('safari');
    else if (zid === 'safari_stickers') LS.openGachaponModal('safari');
    else if (
      zid === 'safari_cafe' || zid === 'sakura_bakery' || zid === 'sunny_florist' ||
      zid === 'cozy_bookshop' || zid === 'kyoto_pottery' || zid === 'kyoto_fans'
    ) LS.openLocalShopModal(zid);
    else if (zid === 'safari_jeep') LS.startSafariJeepRide();
    else if (zid === 'safari_feed_giraffe') LS.feedSafariAnimals('giraffe');
    else if (zid === 'safari_feed_elephant') LS.feedSafariAnimals('elephant');
    else if (zid === 'mochi') LS.openMochiModal();
    else if (zid === 'park_slide') {
      LS.runtime.parkActivity = { type: 'slide', timer: 2.4, duration: 2.4 };
      LS.addXP(10);
      LS.playSFX('jump');
      LS.showToast('🛝 Wheee! Laila & Salma slide down together! +10 XP');
    } else if (zid === 'park_swing') {
      LS.runtime.parkActivity = { type: 'swing', timer: 3.8, duration: 3.8 };
      LS.addXP(10);
      LS.playSFX('jump');
      LS.showToast('🎠 Swinging high together on the park swing! +10 XP');
    } else if (zid === 'park_hopscotch') {
      LS.runtime.parkActivity = { type: 'hopscotch', timer: 2.2, duration: 2.2 };
      LS.addCoins(20);
      LS.addXP(12);
      LS.playSFX('coin');
      LS.showToast('🎯 Hopscotch cleared together! +20c & +12 XP!');
    } else if (zid.startsWith('animal:')) {
      LS.petHiddenAnimal(zid.slice(7));
    }
  }

  function setupInputs() {
    window.addEventListener('keydown', e => {
      const k = e.key.toLowerCase();
      keys[k] = true;
      if (LS.runtime.modalOpen) {
        if (k === 'escape') LS.closeAllModals();
        return;
      }
      if (k === 'c') cycleCameraMode();
      if (k === 'q') recenterCamera();
      if (k === 'v') triggerSisterPose();
      if (k === 'm') toggleMiniMap();
      if (k === 'h') toggleHudCard();
      if (k === 'p') LS.openPassportModal();
      if (k === 'r') toggleRunButton();
      if (k === 'e') triggerInteract();
      if (k === ' ') triggerJump();
    });

    window.addEventListener('keyup', e => {
      keys[e.key.toLowerCase()] = false;
    });

    const containerEl = document.getElementById('game-container');
    const dom = renderer.domElement;

    const getZoomBounds = () => {
      const meta = LS.WORLDS[LS.state.currentWorld];
      return (meta && meta.isInterior) ? { min: 2.8, max: 7.2 } : { min: 3.2, max: 13.5 };
    };

    const releasePointer = pointerId => {
      activePointers.delete(pointerId);
      if (activePointers.size < 2) lastPinchDist = null;
      if (activePointers.size === 0 && containerEl) containerEl.classList.remove('cam-dragging');
    };

    window.addEventListener('blur', () => {
      Object.keys(keys).forEach(k => { keys[k] = false; });
      activePointers.clear();
      lastPinchDist = null;
      if (containerEl) containerEl.classList.remove('cam-dragging');
    });

    dom.addEventListener('contextmenu', e => e.preventDefault());
    dom.addEventListener('dblclick', () => recenterCamera());

    dom.addEventListener('pointerdown', e => {
      if (LS.runtime.modalOpen) return;
      // Only orbit with primary/secondary mouse buttons or touch
      if (e.pointerType === 'mouse' && e.button !== 0 && e.button !== 2) return;
      if (LS.runtime.camMode !== 0) setCameraMode(0);
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (dom.setPointerCapture) {
        try { dom.setPointerCapture(e.pointerId); } catch (_) {}
      }
      if (containerEl) containerEl.classList.add('cam-dragging');
      if (activePointers.size === 2) {
        const pts = Array.from(activePointers.values());
        lastPinchDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      }
    });

    window.addEventListener('pointermove', e => {
      if (LS.runtime.modalOpen || !activePointers.has(e.pointerId)) return;
      const prev = activePointers.get(e.pointerId);
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePointers.size === 1) {
        // Drag right -> look right; drag up -> look up (natural 3rd-person orbit)
        const yawSens = e.pointerType === 'touch' ? 0.0068 : 0.0056;
        const pitchSens = e.pointerType === 'touch' ? 0.0048 : 0.0042;
        targetCamYaw -= dx * yawSens;
        targetCamPitch = Math.max(0.06, Math.min(1.12, targetCamPitch + dy * pitchSens));
        manualCamCooldown = 1.8;
      } else if (activePointers.size >= 2) {
        // Two-finger pinch-to-zoom + gentle orbit
        const pts = Array.from(activePointers.values());
        const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        if (lastPinchDist !== null) {
          const zb = getZoomBounds();
          targetCamDist = Math.max(zb.min, Math.min(zb.max, targetCamDist - (dist - lastPinchDist) * 0.025));
        }
        lastPinchDist = dist;
        targetCamYaw -= dx * 0.0022;
        manualCamCooldown = 1.8;
      }
    });

    window.addEventListener('pointerup', e => releasePointer(e.pointerId));
    window.addEventListener('pointercancel', e => releasePointer(e.pointerId));

    dom.addEventListener('wheel', e => {
      if (LS.runtime.modalOpen) return;
      e.preventDefault();
      if (LS.runtime.camMode !== 0) setCameraMode(0);
      const zb = getZoomBounds();
      targetCamDist = Math.max(zb.min, Math.min(zb.max, targetCamDist + e.deltaY * 0.0045));
      manualCamCooldown = 1.2;
    }, { passive: false });

    document.getElementById('btn-passport').addEventListener('click', LS.openPassportModal);
    document.getElementById('btn-time').addEventListener('click', () => {
      LS.state.timeMode = (LS.state.timeMode + 1) % 3;
      LS.saveState();
      applyTimeOfDay();
    });

    const grainBtn = document.getElementById('btn-grain');
    const grainEl = document.getElementById('grain-overlay');
    grainEl.classList.toggle('grain-active', LS.state.grainEnabled);
    grainBtn.classList.toggle('active', LS.state.grainEnabled);
    grainBtn.addEventListener('click', () => {
      LS.state.grainEnabled = !LS.state.grainEnabled;
      LS.saveState();
      grainEl.classList.toggle('grain-active', LS.state.grainEnabled);
      grainBtn.classList.toggle('active', LS.state.grainEnabled);
    });

    const soundBtn = document.getElementById('btn-sound');
    soundBtn.textContent = LS.state.soundEnabled ? '🔊' : '🔇';
    soundBtn.addEventListener('click', () => {
      LS.state.soundEnabled = !LS.state.soundEnabled;
      LS.saveState();
      soundBtn.textContent = LS.state.soundEnabled ? '🔊' : '🔇';
      if (LS.state.soundEnabled) LS.playSFX('coin');
    });

    document.getElementById('btn-front-cam').addEventListener('click', cycleCameraMode);
    document.getElementById('btn-pose').addEventListener('click', triggerSisterPose);
    const hudCard = document.getElementById('hud-left');
    const hudHdr = document.getElementById('hud-left-header');
    function applyHudCollapsed(collapsed) {
      if (!hudCard) return;
      hudCard.classList.toggle('collapsed', collapsed);
      const btn = document.getElementById('btn-hud-collapse');
      if (btn) btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    }
    function toggleHudCard() {
      if (!hudCard) return;
      const next = !hudCard.classList.contains('collapsed');
      applyHudCollapsed(next);
      try { localStorage.setItem('laila_salma_hud_collapsed', next ? '1' : '0'); } catch (e) {}
    }
    try {
      if (localStorage.getItem('laila_salma_hud_collapsed') === '1') applyHudCollapsed(true);
    } catch (e) {}
    if (hudHdr) hudHdr.addEventListener('click', toggleHudCard);

    const mmCard = document.getElementById('minimap-card');
    if (mmCard) mmCard.addEventListener('click', toggleMiniMap);
    document.getElementById('btn-run').addEventListener('click', toggleRunButton);
    document.getElementById('btn-jump').addEventListener('click', triggerJump);
    document.getElementById('interact-prompt').addEventListener('click', triggerInteract);
    document.getElementById('btn-interact-mobile').addEventListener('click', triggerInteract);
    const bikeBellBtn = document.getElementById('btn-bike-bell');
    if (bikeBellBtn) bikeBellBtn.addEventListener('click', () => LS.ringBikeBell());
    const bikeDismountBtn = document.getElementById('btn-bike-dismount');
    if (bikeDismountBtn) bikeDismountBtn.addEventListener('click', () => LS.dismountYellowBike());

    const jZone = document.getElementById('joystick-zone');
    const jKnob = document.getElementById('joystick-knob');
    if (jZone) {
      let jId = null;
      const updateJoy = (clientX, clientY) => {
        const rect = jZone.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let dx = (clientX - cx) / 36;
        let dy = (clientY - cy) / 36;
        const mag = Math.hypot(dx, dy);
        if (mag > 1) { dx /= mag; dy /= mag; }
        joy.x = dx;
        joy.y = dy;
        jKnob.style.left = (33 + dx * 30) + 'px';
        jKnob.style.top = (33 + dy * 30) + 'px';
      };
      jZone.addEventListener('pointerdown', e => {
        e.stopPropagation();
        jId = e.pointerId;
        joy.active = true;
        jZone.setPointerCapture(jId);
        updateJoy(e.clientX, e.clientY);
      });
      jZone.addEventListener('pointermove', e => {
        if (joy.active && e.pointerId === jId) updateJoy(e.clientX, e.clientY);
      });
      const resetJoy = () => {
        joy.active = false;
        joy.x = 0; joy.y = 0;
        jKnob.style.left = '33px';
        jKnob.style.top = '33px';
      };
      jZone.addEventListener('pointerup', resetJoy);
      jZone.addEventListener('pointercancel', resetJoy);
    }
  }

  function resolveCollisions(pos, radius) {
    const meta = LS.WORLDS[LS.state.currentWorld];
    const b = meta.bounds;
    pos.x = Math.max(b.minX, Math.min(b.maxX, pos.x));
    pos.z = Math.max(b.minZ, Math.min(b.maxZ, pos.z));
    const r = radius || 0.45;
    const cols = LS.activeWorld ? LS.activeWorld.colliders : [];
    for (let i = 0; i < cols.length; i++) {
      const c = cols[i];
      if (pos.x + r > c.minX && pos.x - r < c.maxX && pos.z + r > c.minZ && pos.z - r < c.maxZ) {
        const dL = Math.abs((pos.x + r) - c.minX);
        const dR = Math.abs(c.maxX - (pos.x - r));
        const dT = Math.abs((pos.z + r) - c.minZ);
        const dB = Math.abs(c.maxZ - (pos.z - r));
        const m = Math.min(dL, dR, dT, dB);
        if (m === dL) pos.x = c.minX - r;
        else if (m === dR) pos.x = c.maxX + r;
        else if (m === dT) pos.z = c.minZ - r;
        else pos.z = c.maxZ + r;
      }
    }
  }

  function updateSalmaCompanion(dt, elapsed, isRunning, speed) {
    const laila = LS.chars.laila;
    const salma = LS.chars.salma;
    if (!salma) return;

    const lp = laila.root.position;
    const sp = salma.root.position;

    // Piggyback Ride mode! Salma happily rides behind Laila's shoulders!
    if (LS.runtime.piggybackUntil && Date.now() < LS.runtime.piggybackUntil && LS.runtime.highFiveTimer <= 0) {
      const backX = -Math.sin(laila.root.rotation.y) * 0.34;
      const backZ = -Math.cos(laila.root.rotation.y) * 0.34;
      sp.set(lp.x + backX, lp.y + 0.62, lp.z + backZ);
      salma.root.rotation.y = laila.root.rotation.y;
      salma.leftLeg.rotation.x = -0.95 + Math.sin(elapsed * 9) * 0.22;
      salma.rightLeg.rotation.x = -0.95 - Math.sin(elapsed * 9) * 0.22;
      salma.leftArm.rotation.x = -0.85;
      salma.rightArm.rotation.x = -0.85;
      return;
    }

    const sideOffset = LS.runtime.poseTimer > 0 ? 1.05 : 0.65;
    const backOffset = LS.runtime.poseTimer > 0 ? 0.15 : 1.15;

    const behindX = -Math.sin(laila.root.rotation.y) * backOffset - Math.cos(laila.root.rotation.y) * sideOffset;
    const behindZ = -Math.cos(laila.root.rotation.y) * backOffset + Math.sin(laila.root.rotation.y) * sideOffset;
    const targetX = lp.x + behindX;
    const targetZ = lp.z + behindZ;

    const dx = targetX - sp.x;
    const dz = targetZ - sp.z;
    const dist = Math.hypot(dx, dz);

    if (dist > 12) {
      sp.set(targetX, getGroundH(targetX, targetZ), targetZ);
    } else if (dist > 0.25) {
      const followSpeed = Math.max(speed * 1.04, dist * 3.4);
      const step = Math.min(dist, followSpeed * dt);
      sp.x += (dx / dist) * step;
      sp.z += (dz / dist) * step;
      resolveCollisions(sp, 0.36);

      const targetRot = Math.atan2(dx, dz);
      let diff = targetRot - salma.root.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      salma.root.rotation.y += diff * Math.min(1, dt * 12);

      const sprinting = isRunning || dist > 2.2;
      const freq = sprinting ? 14.5 : 9.5;
      const amp = sprinting ? 0.82 : 0.52;
      const swing = Math.sin(elapsed * freq + 0.8) * amp;
      salma.leftLeg.rotation.x = swing;
      salma.rightLeg.rotation.x = -swing;
      salma.leftArm.rotation.x = -swing * 0.85;
      if (LS.runtime.poseTimer <= 0) salma.rightArm.rotation.x = swing * 0.85;
    } else {
      let diff = laila.root.rotation.y - salma.root.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      salma.root.rotation.y += diff * Math.min(1, dt * 8);

      salma.leftLeg.rotation.x *= 0.82;
      salma.rightLeg.rotation.x *= 0.82;
      salma.leftArm.rotation.x *= 0.82;
      if (LS.runtime.poseTimer <= 0) salma.rightArm.rotation.x *= 0.82;
    }

    const groundY = getGroundH(sp.x, sp.z);
    if (!salmaGrounded) {
      salmaVelY -= 17.5 * dt;
      sp.y += salmaVelY * dt;
      if (sp.y <= groundY) {
        sp.y = groundY;
        salmaVelY = 0;
        salmaGrounded = true;
      }
    } else {
      sp.y += (groundY - sp.y) * Math.min(1, dt * 14);
    }
  }

  function updatePlayer(dt, elapsed) {
    const laila = LS.chars.laila;
    const salma = LS.chars.salma;
    if (!laila || !LS.activeWorld) return;

    // Periodic 2-hour Hide-and-Seek reset check (every 10s)
    resetCheckAccum += dt;
    if (resetCheckAccum > 10) {
      resetCheckAccum = 0;
      const wid = LS.state.currentWorld;
      if ((wid === 'tokyo' || wid === 'kyoto' || wid === 'safari') && LS.checkAnimalReset(wid)) {
        LS.loadWorld(wid, false, {
          x: laila.root.position.x,
          y: laila.root.position.y,
          z: laila.root.position.z,
          rotY: laila.root.rotation.y
        });
        LS.showToast(wid === 'safari'
          ? '🦁 2 hours passed! All 5 Safari Lion Cubs hid in brand-new spots!'
          : (wid === 'kyoto'
            ? '🦊 2 hours passed! All 5 Kyoto Kitsune hid in brand-new spots!'
            : '🐱 2 hours passed! All 5 Tokyo Cats hid in brand-new spots!'));
        return;
      }
    }

    if (LS.runtime.eating) {
      const eat = LS.runtime.eating;
      eat.timer += dt;
      laila.rightArm.rotation.x = -1.25 + Math.sin(elapsed * 5.2) * 0.35;
      laila.headGroup.rotation.x = Math.sin(elapsed * 5.2) * 0.14;
      eat.bowlObj.sticks.position.y = 0.28 + Math.max(0, Math.sin(elapsed * 5.2)) * 0.18;

      if (salma) {
        salma.rightArm.rotation.x = -1.25 + Math.sin(elapsed * 5.8 + 0.9) * 0.35;
        salma.headGroup.rotation.x = Math.sin(elapsed * 5.8 + 0.9) * 0.16;
        if (eat.bowlObj.salmaSticks) {
          eat.bowlObj.salmaSticks.position.y = 0.28 + Math.max(0, Math.sin(elapsed * 5.8 + 0.9)) * 0.18;
        }
      }

      eat.bowlObj.oishii.position.y = eat.bowlObj.baseOishiiY + Math.sin(elapsed * 3.5) * 0.12;
      if (eat.timer >= eat.duration) LS.finishEatingAnimation(scene);
      return;
    }

    if (LS.runtime.modalOpen || LS.runtime.traveling) return;

    // Guided Zebra-Striped Safari Jeep Tour across the golden Savanna!
    if (LS.runtime.safariRide && LS.activeWorld && LS.activeWorld.jeepPath && LS.activeWorld.safariJeep) {
      const sr = LS.runtime.safariRide;
      sr.t += dt / sr.duration;
      const jeep = LS.activeWorld.safariJeep;
      const curve = LS.activeWorld.jeepPath;
      const u = Math.min(1, sr.t);
      const pos = curve.getPointAt(u);
      const ahead = curve.getPointAt(Math.min(1, u + 0.015));
      const yaw = Math.atan2(ahead.x - pos.x, ahead.z - pos.z);
      const bounce = Math.sin(elapsed * 14) * 0.035;
      jeep.position.set(pos.x, bounce, pos.z);
      jeep.rotation.y = yaw;
      const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
      laila.root.position.set(pos.x + cosY * 0.34 - sinY * 0.22, 0.72 + bounce, pos.z - sinY * 0.34 - cosY * 0.22);
      laila.root.rotation.y = yaw;
      laila.leftLeg.rotation.x = -1.05; laila.rightLeg.rotation.x = -1.05;
      laila.rightArm.rotation.x = -0.3; laila.rightArm.rotation.z = 1.9 + Math.sin(elapsed * 6) * 0.25;
      if (salma) {
        salma.root.position.set(pos.x - cosY * 0.34 - sinY * 0.22, 0.72 + bounce, pos.z + sinY * 0.34 - cosY * 0.22);
        salma.root.rotation.y = yaw;
        salma.leftLeg.rotation.x = -1.05; salma.rightLeg.rotation.x = -1.05;
        salma.rightArm.rotation.x = -0.35; salma.rightArm.rotation.z = 2.0 + Math.sin(elapsed * 6.5) * 0.28;
      }
      if (sr.t >= 1.0) {
        if (LS.activeWorld.jeepHome) {
          jeep.position.copy(LS.activeWorld.jeepHome.pos);
          jeep.rotation.y = LS.activeWorld.jeepHome.rotY;
          laila.root.position.set(LS.activeWorld.jeepHome.exit.x, 0, LS.activeWorld.jeepHome.exit.z);
          if (salma) salma.root.position.set(LS.activeWorld.jeepHome.exit.x - 1.0, 0, LS.activeWorld.jeepHome.exit.z + 0.4);
        }
        laila.leftLeg.rotation.x = 0; laila.rightLeg.rotation.x = 0; laila.rightArm.rotation.z = 0;
        if (salma) { salma.leftLeg.rotation.x = 0; salma.rightLeg.rotation.x = 0; salma.rightArm.rotation.z = 0; }
        LS.runtime.safariRide = null;
        LS.addCoins(25);
        LS.addXP(20);
        LS.unlockStamp('safari_jeep');
        LS.playSFX('correct');
        LS.showToast('🚙🎉 Amazing Safari Jeep Tour! +25c & +20 XP!');
      }
      return;
    }

    // Interactive Pocket Park Activities (Slide, Swing, Hopscotch) — works in BOTH Tokyo & Kyoto!
    if (LS.runtime.parkActivity) {
      const pa = LS.runtime.parkActivity;
      pa.timer -= dt;
      const t = Math.max(0, Math.min(1, 1 - (pa.timer / pa.duration)));
      if (pa.type === 'slide' && LS.activeWorld.slideStartPos && LS.activeWorld.slideEndPos) {
        laila.root.position.lerpVectors(LS.activeWorld.slideStartPos, LS.activeWorld.slideEndPos, t);
        laila.leftLeg.rotation.x = -1.1;
        laila.rightLeg.rotation.x = -1.1;
        if (salma) {
          const st = Math.max(0, Math.min(1, (t - 0.18) / 0.82));
          salma.root.position.lerpVectors(LS.activeWorld.slideStartPos, LS.activeWorld.slideEndPos, st);
          salma.leftLeg.rotation.x = -1.1;
          salma.rightLeg.rotation.x = -1.1;
        }
      } else if (pa.type === 'swing' && LS.activeWorld.swingSeatPos) {
        const sw = Math.sin(elapsed * 4.5);
        const base = LS.activeWorld.swingSeatPos;
        laila.root.position.set(base.x, base.y + Math.abs(sw) * 0.42, base.z + sw * 0.85);
        laila.leftLeg.rotation.x = -1.15;
        laila.rightLeg.rotation.x = -1.15;
        if (salma) {
          salma.root.position.set(base.x - 0.9, 0 + Math.abs(Math.sin(elapsed * 7)) * 0.25, base.z + 0.6);
        }
      } else if (pa.type === 'hopscotch' && LS.activeWorld.hopscotchPos) {
        const hp = LS.activeWorld.hopscotchPos;
        const hopZ = hp.z + 1.1 - t * 2.2;
        const hopY = Math.abs(Math.sin(t * Math.PI * 5)) * 0.55;
        laila.root.position.set(hp.x, hopY, hopZ);
        if (salma) {
          salma.root.position.set(hp.x + 0.65, Math.abs(Math.sin(t * Math.PI * 5 + 0.5)) * 0.48, hopZ + 0.35);
        }
      }
      if (pa.timer <= 0) {
        laila.root.position.y = getGroundH(laila.root.position.x, laila.root.position.z);
        laila.leftLeg.rotation.x = 0;
        laila.rightLeg.rotation.x = 0;
        if (salma) {
          salma.root.position.y = getGroundH(salma.root.position.x, salma.root.position.z);
          salma.leftLeg.rotation.x = 0;
          salma.rightLeg.rotation.x = 0;
        }
        LS.runtime.parkActivity = null;
      }
      return;
    }

    // Free-roam Yellow Bicycle riding around Tokyo (Laila pedals, Salma cheers on the rear rack!)
    if (LS.runtime.bikeRide && LS.runtime.bikeRide.bike) {
      const br = LS.runtime.bikeRide;
      const bike = br.bike;

      let inX = (keys['d'] || keys['arrowright'] ? 1 : 0) - (keys['a'] || keys['arrowleft'] ? 1 : 0);
      let inZ = (keys['s'] || keys['arrowdown'] ? 1 : 0) - (keys['w'] || keys['arrowup'] ? 1 : 0);
      if (joy.active) { inX = joy.x; inZ = joy.y; }

      const moving = Math.hypot(inX, inZ) > 0.08;
      lastMoveInput.x = inX;
      lastMoveInput.z = inZ;
      lastMoveInput.moving = moving;

      // Pedaling restores stamina & gives a breezy cycling pace!
      LS.runtime.stamina = Math.min(100, LS.runtime.stamina + dt * 22);
      const wantsBoost = (keys['shift'] || LS.runtime.runToggle) && moving;
      const buffMult = (LS.runtime.buff && Date.now() < LS.runtime.buff.expiresAt) ? LS.runtime.buff.speedMult : 1.0;
      const targetSpeed = moving ? (wantsBoost ? 13.8 : 10.2) * buffMult : 0;
      br.speed += (targetSpeed - br.speed) * Math.min(1, dt * (moving ? 5.5 : 7.5));

      let turnDelta = 0;
      if (moving) {
        const len = Math.hypot(inX, inZ);
        inX /= len; inZ /= len;
        _fwd.set(Math.sin(camYaw), 0, Math.cos(camYaw));
        _right.set(-_fwd.z, 0, _fwd.x);
        _moveVec.set(0, 0, 0)
          .addScaledVector(_fwd, -inZ)
          .addScaledVector(_right, inX)
          .normalize();

        const targetRot = Math.atan2(_moveVec.x, _moveVec.z);
        turnDelta = wrapAngleDelta(bike.rotation.y, targetRot);
        bike.rotation.y += turnDelta * Math.min(1, dt * 7.5);
      }

      if (br.speed > 0.08) {
        const bx = Math.sin(bike.rotation.y);
        const bz = Math.cos(bike.rotation.y);
        bike.position.x += bx * br.speed * dt;
        bike.position.z += bz * br.speed * dt;
        resolveCollisions(bike.position, 0.58);
        br.pedalPhase += dt * (4.5 + br.speed * 0.72);
      }

      // Gentle lean into curves & bridge ground height tracking
      const targetLean = Math.max(-0.24, Math.min(0.24, -turnDelta * 0.28));
      br.lean += (targetLean - br.lean) * Math.min(1, dt * 8.0);
      const gy = getGroundH(bike.position.x, bike.position.z);
      bike.position.y += (gy - bike.position.y) * Math.min(1, dt * 14);
      bike.rotation.z = br.lean;

      const sinY = Math.sin(bike.rotation.y);
      const cosY = Math.cos(bike.rotation.y);
      const bounce = br.speed > 0.5 ? Math.sin(br.pedalPhase * 2) * 0.022 : 0;

      // Seat Laila right on the saddle (-0.18m back) holding the handlebars & pedaling!
      laila.root.position.set(
        bike.position.x - sinY * 0.16,
        bike.position.y + 0.34 + bounce,
        bike.position.z - cosY * 0.16
      );
      laila.root.rotation.y = bike.rotation.y;
      laila.bodyPivot.rotation.z = br.lean * 0.85;
      laila.leftArm.rotation.x = -1.06;
      laila.rightArm.rotation.x = -1.06;
      laila.rightArm.rotation.z = 0;
      const pSin = Math.sin(br.pedalPhase);
      laila.leftLeg.rotation.x = -0.68 + pSin * 0.48;
      laila.rightLeg.rotation.x = -0.68 - pSin * 0.48;

      // Seat Salma happily on the rear carrier rack (-0.56m back) cheering & waving!
      if (salma) {
        salma.root.position.set(
          bike.position.x - sinY * 0.56,
          bike.position.y + 0.26 + bounce * 1.15,
          bike.position.z - cosY * 0.56
        );
        salma.root.rotation.y = bike.rotation.y;
        salma.bodyPivot.rotation.z = br.lean * 0.85;
        salma.leftLeg.rotation.x = -1.08 + Math.sin(elapsed * 5.0) * 0.14;
        salma.rightLeg.rotation.x = -1.08 - Math.sin(elapsed * 5.0) * 0.14;
        salma.leftArm.rotation.x = -0.92;
        salma.rightArm.rotation.x = -0.36;
        salma.rightArm.rotation.z = br.speed > 1.5 ? (2.05 + Math.sin(elapsed * 7.5) * 0.26) : 0.35;
      }

      const zoneEl = document.getElementById('compass-zone');
      if (zoneEl && LS.activeWorld.getZoneLabel) {
        zoneEl.textContent = LS.activeWorld.getZoneLabel(bike.position.x, bike.position.z);
      }
      return;
    }

    let inX = (keys['d'] || keys['arrowright'] ? 1 : 0) - (keys['a'] || keys['arrowleft'] ? 1 : 0);
    let inZ = (keys['s'] || keys['arrowdown'] ? 1 : 0) - (keys['w'] || keys['arrowup'] ? 1 : 0);
    if (joy.active) { inX = joy.x; inZ = joy.y; }

    const moving = Math.hypot(inX, inZ) > 0.08;
    lastMoveInput.x = inX;
    lastMoveInput.z = inZ;
    lastMoveInput.moving = moving;
    if (moving) LS.runtime.poseTimer = 0;

    const wantsRun = (keys['shift'] || LS.runtime.runToggle) && moving;
    const infStam = LS.runtime.buff && LS.runtime.buff.infiniteStamina && Date.now() < LS.runtime.buff.expiresAt;
    const isRunning = wantsRun && (LS.runtime.stamina > 2 || infStam);

    if (isRunning && !infStam) {
      LS.runtime.stamina = Math.max(0, LS.runtime.stamina - dt * 24);
    } else {
      LS.runtime.stamina = Math.min(100, LS.runtime.stamina + dt * 16);
    }

    const buffMult = (LS.runtime.buff && Date.now() < LS.runtime.buff.expiresAt) ? LS.runtime.buff.speedMult : 1.0;
    const speed = (isRunning ? 8.8 : 5.0) * buffMult;

    if (moving) {
      const len = Math.hypot(inX, inZ);
      inX /= len; inZ /= len;
      _fwd.set(Math.sin(camYaw), 0, Math.cos(camYaw));
      _right.set(-_fwd.z, 0, _fwd.x);
      _moveVec.set(0, 0, 0)
        .addScaledVector(_fwd, -inZ)
        .addScaledVector(_right, inX)
        .normalize();

      laila.root.position.addScaledVector(_moveVec, speed * dt);
      resolveCollisions(laila.root.position, 0.45);

      const targetRot = Math.atan2(_moveVec.x, _moveVec.z);
      let diff = targetRot - laila.root.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      laila.root.rotation.y += diff * Math.min(1, dt * 12);

      const freq = isRunning ? 12.5 : 8.0;
      const amp = isRunning ? 0.78 : 0.48;
      const swing = Math.sin(elapsed * freq) * amp;
      laila.leftLeg.rotation.x = swing;
      laila.rightLeg.rotation.x = -swing;
      laila.leftArm.rotation.x = -swing * 0.8;
      laila.rightArm.rotation.x = swing * 0.8;
      laila.rightArm.rotation.z = 0;
      if (salma) salma.rightArm.rotation.z = 0;
    } else {
      laila.leftLeg.rotation.x *= 0.82;
      laila.rightLeg.rotation.x *= 0.82;
      laila.leftArm.rotation.x *= 0.82;

      if (LS.runtime.poseTimer > 0) {
        LS.runtime.poseTimer -= dt;
        laila.rightArm.rotation.x = -0.38;
        laila.rightArm.rotation.z = 2.15 + Math.sin(elapsed * 9.5) * 0.34;
        laila.headGroup.rotation.z = -0.08 + Math.sin(elapsed * 4.5) * 0.06;
        if (salma) {
          salma.rightArm.rotation.x = -0.42;
          salma.rightArm.rotation.z = 2.22 + Math.sin(elapsed * 10.0 + 0.5) * 0.38;
          salma.headGroup.rotation.z = 0.08 - Math.sin(elapsed * 4.5) * 0.08;
        }
      } else {
        laila.rightArm.rotation.x *= 0.82;
        laila.rightArm.rotation.z *= 0.8;
        laila.headGroup.rotation.z *= 0.8;
        if (salma) {
          salma.rightArm.rotation.z *= 0.8;
          salma.headGroup.rotation.z *= 0.8;
        }
      }
    }

    const groundY = getGroundH(laila.root.position.x, laila.root.position.z);
    if (!grounded) {
      velY -= 17.5 * dt;
      laila.root.position.y += velY * dt;
      if (laila.root.position.y <= groundY) {
        laila.root.position.y = groundY;
        velY = 0;
        grounded = true;
      }
    } else {
      laila.root.position.y += (groundY - laila.root.position.y) * Math.min(1, dt * 14);
    }

    updateSalmaCompanion(dt, elapsed, isRunning, speed);

    if (LS.runtime.highFiveTimer > 0) {
      LS.runtime.highFiveTimer -= dt;
      laila.rightArm.rotation.x = -0.35;
      laila.rightArm.rotation.z = 2.45;
      if (salma) {
        salma.rightArm.rotation.x = -0.35;
        salma.rightArm.rotation.z = 2.45;
        const sg = getGroundH(salma.root.position.x, salma.root.position.z);
        salma.root.position.y = sg + Math.abs(Math.sin(elapsed * 10)) * 0.52;
      }
    }

    if (LS.runtime.mochiGame && LS.chars.mochi) {
      const mg = LS.runtime.mochiGame;
      mg.timeLeft -= dt;
      const mp = LS.chars.mochi.position;
      const lp = laila.root.position;
      const minX = -3.4, maxX = 3.4;
      const minZ = LS.state.currentWorld === 'kyoto' ? -36 : -28;
      const maxZ = 22;

      if (mg.mode === 'fetch') {
        if (mg.state === 'to_target') {
          const dx = mg.ballPos.x - mp.x;
          const dz = mg.ballPos.z - mp.z;
          const d = Math.hypot(dx, dz);
          if (d > 0.25) {
            mp.x += (dx / d) * 7.2 * dt;
            mp.z += (dz / d) * 7.2 * dt;
            mp.y = getGroundH(mp.x, mp.z);
            mp.rotation.y = Math.atan2(dx, dz);
          } else {
            mg.state = 'returning';
          }
        } else {
          const dx = lp.x - mp.x;
          const dz = lp.z - mp.z;
          const d = Math.hypot(dx, dz);
          if (d > 1.0) {
            mp.x += (dx / d) * 6.8 * dt;
            mp.z += (dz / d) * 6.8 * dt;
            mp.y = getGroundH(mp.x, mp.z);
            mp.rotation.y = Math.atan2(dx, dz);
            if (LS.activeWorld.mochiBall) LS.activeWorld.mochiBall.position.set(mp.x, mp.y + 0.25, mp.z);
          } else {
            mg.score += 1;
            LS.runtime.mochiHeartTimer = 1.6;
            LS.playSFX('coin');
            mg.state = 'to_target';
            mg.ballPos.set(minX + Math.random() * (maxX - minX), 0.14, minZ + Math.random() * (maxZ - minZ));
            if (LS.activeWorld.mochiBall) LS.activeWorld.mochiBall.position.copy(mg.ballPos);
          }
        }
      } else {
        const dPlayer = lp.distanceTo(mp);
        if (dPlayer < 1.8) {
          mg.score += 1;
          LS.runtime.mochiHeartTimer = 1.5;
          LS.playSFX('coin');
          mp.x = Math.max(minX, Math.min(maxX, lp.x + (Math.random() - 0.5) * 9));
          mp.z = Math.max(minZ, Math.min(maxZ, lp.z + (Math.random() - 0.5) * 9));
        } else {
          mp.x = Math.max(minX, Math.min(maxX, mp.x + Math.sin(elapsed * 2.2) * 3.5 * dt));
          mp.z = Math.max(minZ, Math.min(maxZ, mp.z + Math.cos(elapsed * 1.9) * 3.5 * dt));
        }
        mp.y = getGroundH(mp.x, mp.z);
      }
      if (mg.timeLeft <= 0) LS.finishMochiMiniGame();
    }

    // Zone proximity check
    let found = null;
    const zones = LS.activeWorld.zones || [];
    for (let i = 0; i < zones.length; i++) {
      const z = zones[i];
      if (laila.root.position.distanceTo(z.pos) < z.radius) {
        found = z;
        break;
      }
    }
    if (!found && LS.chars.mochi && laila.root.position.distanceTo(LS.chars.mochi.position) < 2.5) {
      found = { id: 'mochi', label: 'Play with Mochi (Fetch / Tag / Pet)' };
    }
    LS.runtime.nearZone = found;

    const prompt = document.getElementById('interact-prompt');
    const mobBtn = document.getElementById('btn-interact-mobile');
    if (found) {
      document.getElementById('interact-label').textContent = found.label;
      prompt.classList.remove('hidden');
      mobBtn.classList.remove('hidden');
    } else {
      prompt.classList.add('hidden');
      mobBtn.classList.add('hidden');
    }

    const zoneEl = document.getElementById('compass-zone');
    if (zoneEl && LS.activeWorld.getZoneLabel) {
      zoneEl.textContent = LS.activeWorld.getZoneLabel(laila.root.position.x, laila.root.position.z);
    }
  }

  function computeSafeCamDist(origin, dir, maxDist, meta) {
    let safeDist = maxDist;
    // Keep camera cleanly inside room walls & ceiling for interior worlds
    if (meta && meta.isInterior && meta.bounds) {
      const b = meta.bounds;
      if (dir.x > 1e-4) safeDist = Math.min(safeDist, (b.maxX - 0.15 - origin.x) / dir.x);
      else if (dir.x < -1e-4) safeDist = Math.min(safeDist, (b.minX + 0.15 - origin.x) / dir.x);
      if (dir.z > 1e-4) safeDist = Math.min(safeDist, (b.maxZ - 0.15 - origin.z) / dir.z);
      else if (dir.z < -1e-4) safeDist = Math.min(safeDist, (b.minZ + 0.15 - origin.z) / dir.z);
      if (dir.y > 1e-4) safeDist = Math.min(safeDist, (4.1 - origin.y) / dir.y);
      return Math.max(1.4, safeDist);
    }
    // Ray-vs-Box3 spring arm against solid buildings so camera never clips inside houses
    if (camOccluderBoxes.length > 0) {
      camRay.set(origin, dir);
      for (let i = 0; i < camOccluderBoxes.length; i++) {
        const box = camOccluderBoxes[i];
        if (box.containsPoint(origin)) continue;
        if (camRay.intersectBox(box, camRayHit)) {
          const hitDist = origin.distanceTo(camRayHit) - 0.38;
          if (hitDist < safeDist) safeDist = hitDist;
        }
      }
    }
    return Math.max(1.5, safeDist);
  }

  function updateCamera(dt) {
    const laila = LS.chars.laila;
    const salma = LS.chars.salma;
    if (!laila) return;

    const meta = LS.WORLDS[LS.state.currentWorld] || LS.WORLDS.tokyo;
    const minDist = meta.isInterior ? 2.8 : 3.2;
    const maxDist = meta.isInterior ? 7.2 : 13.5;

    // Smooth continuous keyboard camera controls (J/L or [/] rotate, I/K tilt, +/- zoom)
    if (!LS.runtime.modalOpen && !LS.runtime.eating) {
      const yawKey = (keys['j'] || keys['['] ? 1 : 0) - (keys['l'] || keys[']'] ? 1 : 0);
      const pitchKey = (keys['k'] ? 1 : 0) - (keys['i'] ? 1 : 0);
      const zoomKey = (keys['-'] || keys['_'] ? 1 : 0) - (keys['='] || keys['+'] ? 1 : 0);
      if (yawKey !== 0 || pitchKey !== 0 || zoomKey !== 0) {
        if (LS.runtime.camMode !== 0) setCameraMode(0);
        targetCamYaw += yawKey * 2.15 * dt;
        targetCamPitch = Math.max(0.06, Math.min(1.12, targetCamPitch + pitchKey * 1.25 * dt));
        targetCamDist = Math.max(minDist, Math.min(maxDist, targetCamDist + zoomKey * 6.5 * dt));
        manualCamCooldown = 1.8;
      }
    }

    if (activePointers.size === 0 && manualCamCooldown > 0) {
      manualCamCooldown = Math.max(0, manualCamCooldown - dt);
    }

    // Gentle auto-follow behind Laila when walking sideways/turning (never fights manual orbit or walking backward!)
    if (LS.runtime.camMode === 0 && !LS.runtime.eating && !LS.runtime.modalOpen &&
        activePointers.size === 0 && manualCamCooldown <= 0 &&
        lastMoveInput.moving && Math.abs(lastMoveInput.x) > 0.15 && lastMoveInput.z < 0.72) {
      const followDelta = wrapAngleDelta(targetCamYaw, laila.root.rotation.y);
      const followRate = 0.95 + Math.min(1, Math.abs(lastMoveInput.x)) * 0.85;
      targetCamYaw += followDelta * Math.min(1, dt * followRate);
    }

    const damp = Math.min(1, dt * 12);
    camYaw += wrapAngleDelta(camYaw, targetCamYaw) * damp;
    camPitch += (targetCamPitch - camPitch) * damp;
    camDist += (targetCamDist - camDist) * damp;

    const p = laila.root.position;

    if (LS.runtime.eating && LS.runtime.eating.camPos) {
      camera.position.lerp(LS.runtime.eating.camPos, Math.min(1, dt * 8.5));
      camTarget.lerp(LS.runtime.eating.camLook, Math.min(1, dt * 10));
      camera.lookAt(camTarget);
      camSnapNext = false;
      return;
    }

    if (LS.runtime.safariRide && LS.activeWorld && LS.activeWorld.safariJeep) {
      const jp = LS.activeWorld.safariJeep.position;
      const jy = LS.activeWorld.safariJeep.rotation.y;
      _chasePos.set(
        jp.x - Math.sin(jy) * 7.8 + Math.cos(jy) * 3.4,
        jp.y + 4.2,
        jp.z - Math.cos(jy) * 7.8 - Math.sin(jy) * 3.4
      );
      _chaseLook.set(jp.x + Math.sin(jy) * 2.5, jp.y + 1.5, jp.z + Math.cos(jy) * 2.5);
      camera.position.lerp(_chasePos, Math.min(1, dt * 5.0));
      camTarget.lerp(_chaseLook, Math.min(1, dt * 7.0));
      camera.lookAt(camTarget);
      camSnapNext = false;
      return;
    }

    if (LS.runtime.camMode === 1) {
      _fwd.set(Math.sin(laila.root.rotation.y), 0, Math.cos(laila.root.rotation.y));
      _frontPos.copy(p).addScaledVector(_fwd, 2.25);
      _frontPos.y += 1.32;
      _frontLook.set(p.x, p.y + 1.18, p.z);
      camera.position.lerp(_frontPos, Math.min(1, dt * 8.5));
      camTarget.lerp(_frontLook, Math.min(1, dt * 12));
      camera.lookAt(camTarget);
      camSnapNext = false;
      return;
    }

    if (LS.runtime.camMode === 2 && salma) {
      const sp = salma.root.position;
      _fwd.set(Math.sin(salma.root.rotation.y), 0, Math.cos(salma.root.rotation.y));
      _frontPos.copy(sp).addScaledVector(_fwd, 1.95);
      _frontPos.y += 1.1;
      _frontLook.set(sp.x, sp.y + 0.95, sp.z);
      camera.position.lerp(_frontPos, Math.min(1, dt * 8.5));
      camTarget.lerp(_frontLook, Math.min(1, dt * 12));
      camera.lookAt(camTarget);
      camSnapNext = false;
      return;
    }

    // Standard 3rd-person orbit: smooth pivot target + crisp circular arc + anti-clip spring arm!
    _desiredTarget.set(p.x, p.y + 1.25, p.z);
    if (camSnapNext) {
      camTarget.copy(_desiredTarget);
      effectiveCamDist = camDist;
      camSnapNext = false;
    } else {
      camTarget.lerp(_desiredTarget, Math.min(1, dt * 12));
    }

    camRayDir.set(
      -Math.sin(camYaw) * Math.cos(camPitch),
      Math.sin(camPitch),
      -Math.cos(camYaw) * Math.cos(camPitch)
    ).normalize();

    const safeDist = computeSafeCamDist(camTarget, camRayDir, camDist, meta);
    const armRate = safeDist < effectiveCamDist ? 18.0 : 5.5;
    effectiveCamDist += (safeDist - effectiveCamDist) * Math.min(1, dt * armRate);

    const camX = camTarget.x + camRayDir.x * effectiveCamDist;
    const camZ = camTarget.z + camRayDir.z * effectiveCamDist;
    const groundFloor = getGroundH(camX, camZ) + 0.55;
    const camY = Math.max(groundFloor, camTarget.y + camRayDir.y * effectiveCamDist + 0.15);

    camera.position.set(camX, camY, camZ);
    camera.lookAt(camTarget);
  }

  function updateMiniMap() {
    if (miniMapCompact || !LS.activeWorld || !LS.chars.laila) return;
    const canvas = document.getElementById('minimap-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const mb = LS.WORLDS[LS.state.currentWorld].mapBounds;
    const toMapX = wx => ((wx - mb.minX) / (mb.maxX - mb.minX)) * W;
    const toMapY = wz => ((wz - mb.minZ) / (mb.maxZ - mb.minZ)) * H;

    if (miniMapBgCanvas) {
      ctx.drawImage(miniMapBgCanvas, 0, 0);
    } else if (LS.activeWorld.drawMiniMap) {
      LS.activeWorld.drawMiniMap(ctx, W, H, toMapX, toMapY);
    }

    if (LS.activeWorld.hiddenAnimals) {
      LS.activeWorld.hiddenAnimals.forEach(a => {
        if (a.found) return;
        const cx = toMapX(a.mesh.position.x);
        const cy = toMapY(a.mesh.position.z);
        ctx.fillStyle = '#9333ea';
        ctx.beginPath();
        ctx.arc(cx, cy, 3.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });
    }

    if (LS.activeWorld.rideableBike && !LS.runtime.bikeRide) {
      const bp = LS.activeWorld.rideableBike.position;
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(toMapX(bp.x), toMapY(bp.z), 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    if (LS.chars.salma) {
      const sp = LS.chars.salma.root.position;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(toMapX(sp.x), toMapY(sp.z), 4.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    const lp = LS.chars.laila.root.position;
    const lx = toMapX(lp.x);
    const ly = toMapY(lp.z);
    const yaw = LS.chars.laila.root.rotation.y;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(-yaw);
    ctx.fillStyle = '#e63946';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, 6.2);
    ctx.lineTo(-4.5, -4.5);
    ctx.lineTo(0, -2.3);
    ctx.lineTo(4.5, -4.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function initHDAtmosphere() {
    if (!LS.isHD) return;

    // 1. Procedural Sky PMREM Environment Map for realistic water, glass, ceramic & wood sheen (0 extra lights!)
    try {
      if (THREE.PMREMGenerator) {
        const pmrem = new THREE.PMREMGenerator(renderer);
        pmrem.compileEquirectangularShader();
        const envScene = new THREE.Scene();
        const envDome = new THREE.Mesh(
          new THREE.SphereGeometry(40, 20, 14),
          new THREE.MeshBasicMaterial({ map: LS.createSkyTexture(0, 'tokyo'), side: THREE.BackSide })
        );
        envScene.add(envDome);
        const envFloor = new THREE.Mesh(
          new THREE.CircleGeometry(38, 16),
          new THREE.MeshBasicMaterial({ color: 0x6ea35a })
        );
        envFloor.rotation.x = -Math.PI / 2;
        envFloor.position.y = -6;
        envScene.add(envFloor);
        scene.environment = pmrem.fromScene(envScene, 0.04).texture;
        pmrem.dispose();
      }
    } catch (e) {
      console.warn('[HD PMREM]', e);
    }

    // 2. Volumetric 3D Fluffy Ghibli Clouds drifting lazily across the valley sky
    hdCloudsGroup = new THREE.Group();
    const cloudMat = new THREE.MeshLambertMaterial({ color: 0xfffdf8, transparent: true, opacity: 0.88 });
    const cloudLayout = [
      [-65, 42, -78, 1.35], [22, 46, -92, 1.65], [88, 39, -58, 1.25],
      [-92, 37, 10, 1.2], [75, 43, 35, 1.45], [-25, 48, 62, 1.3], [10, 44, -22, 1.1]
    ];
    cloudLayout.forEach((c, idx) => {
      const cg = new THREE.Group();
      cg.position.set(c[0], c[1], c[2]);
      cg.scale.setScalar(c[3]);
      [[0, 0, 0, 5.2], [-4.5, -0.8, 0.8, 3.8], [4.6, -0.6, -0.5, 4.0], [-1.8, 2.2, -0.4, 3.5], [2.4, 1.8, 0.6, 3.2]].forEach(p => {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(p[3], 12, 10), cloudMat);
        puff.scale.set(1.3, 0.72, 1.0);
        puff.position.set(p[0], p[1], p[2]);
        cg.add(puff);
      });
      cg.userData = { speed: 0.45 + (idx % 3) * 0.22, baseY: c[1], phase: idx * 1.3 };
      hdCloudsGroup.add(cg);
    });
    scene.add(hdCloudsGroup);

    // 3. Soft Glowing Meadow Pollen / Fireflies (circular bokeh glow orb — never harsh squares!)
    const mCount = 95;
    const mGeo = new THREE.BufferGeometry();
    const mPos = new Float32Array(mCount * 3);
    for (let i = 0; i < mCount; i++) {
      mPos[i * 3] = -58 + Math.random() * 116;
      mPos[i * 3 + 1] = 0.6 + Math.random() * 4.5;
      mPos[i * 3 + 2] = -52 + Math.random() * 94;
    }
    mGeo.setAttribute('position', new THREE.BufferAttribute(mPos, 3));
    const moteC = document.createElement('canvas');
    moteC.width = 64; moteC.height = 64;
    const mctx = moteC.getContext('2d');
    const mg = mctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    mg.addColorStop(0, 'rgba(255,255,235,1)');
    mg.addColorStop(0.4, 'rgba(255,244,180,0.55)');
    mg.addColorStop(1, 'rgba(255,235,150,0)');
    mctx.fillStyle = mg; mctx.fillRect(0, 0, 64, 64);
    const mMat = new THREE.PointsMaterial({
      color: 0xfff8cc, size: 0.34, map: new THREE.CanvasTexture(moteC),
      transparent: true, opacity: 0.68,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    hdMotes = new THREE.Points(mGeo, mMat);
    scene.add(hdMotes);
  }

  function updateHDAtmosphere(dt, elapsed) {
    if (!LS.isHD) return;
    // Gently drift volumetric clouds
    if (hdCloudsGroup && hdCloudsGroup.visible) {
      hdCloudsGroup.children.forEach(cg => {
        cg.position.x += cg.userData.speed * dt;
        cg.position.y = cg.userData.baseY + Math.sin(elapsed * 0.25 + cg.userData.phase) * 0.5;
        if (cg.position.x > 125) cg.position.x = -125;
      });
    }
    // Gently float sunlit motes / fireflies
    if (hdMotes && hdMotes.visible) {
      const pos = hdMotes.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i) + Math.sin(elapsed * 0.7 + i * 1.7) * dt * 0.35;
        let y = pos.getY(i) + Math.cos(elapsed * 0.9 + i * 2.3) * dt * 0.18;
        if (y < 0.45) y = 4.5;
        if (y > 5.2) y = 0.8;
        pos.setXY(i, x, y);
      }
      pos.needsUpdate = true;
    }
    // Gently scroll flowing stream & lake water ripples
    const wTex = LS.getWaterTexture ? LS.getWaterTexture() : null;
    if (wTex) {
      wTex.offset.y = (wTex.offset.y - dt * 0.12) % 1;
    }
  }

  function initGraphicsSwitcher() {
    if (LS.isHD) document.body.classList.add('hd-mode');
    const btn = document.getElementById('btn-graphics-mode');
    const badge = document.getElementById('hd-badge');
    if (badge) badge.classList.toggle('hidden', !LS.isHD);
    if (btn) {
      btn.textContent = LS.isHD ? '⚡ Classic' : '✨ HD';
      btn.title = LS.isHD
        ? 'Switch to Classic Lightweight Mode (faster for older devices)'
        : 'Switch to HD Graphics Edition (PBR lighting, reflective water, 2048px shadows & clouds)';
      btn.classList.toggle('hd-active', LS.isHD);
      btn.addEventListener('click', () => {
        LS.saveState();
        window.location.href = LS.isHD ? 'index.html' : 'hd.html';
      });
    }
  }

  function init() {
    if (typeof THREE === 'undefined') {
      showError('Three.js failed to load. Please check your internet connection and reload.');
      return;
    }

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xcbe6f7, 58, 185);

    camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.1, 340);
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: LS.isHD ? 'high-performance' : 'default'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, LS.isHD ? 2.0 : 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (LS.isHD) {
      renderer.toneMapping = THREE.LinearToneMapping;
      renderer.toneMappingExposure = 1.02;
      LS.maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 4);
    }
    document.getElementById('game-container').appendChild(renderer.domElement);

    // STRICT 4-LIGHT WEBGL BUDGET (both Classic & HD!)
    hemiLight = new THREE.HemisphereLight(0xbbe2ff, 0x74855c, LS.isHD ? 0.70 : 0.78);
    scene.add(hemiLight);

    dirLight = new THREE.DirectionalLight(0xfff1d0, LS.isHD ? 1.24 : 1.12);
    dirLight.position.set(22, 38, 18);
    dirLight.castShadow = true;
    const shadowRes = LS.isHD ? 2048 : 1024;
    dirLight.shadow.mapSize.width = shadowRes;
    dirLight.shadow.mapSize.height = shadowRes;
    if (LS.isHD) {
      dirLight.shadow.bias = -0.0004;
      dirLight.shadow.normalBias = 0.03;
    }
    scene.add(dirLight);

    streetLight = new THREE.PointLight(0xffd79a, 0.3, 30);
    streetLight.position.set(0, 5.2, -6);
    scene.add(streetLight);

    accentLight = new THREE.PointLight(0xffcf88, 0.4, 26);
    accentLight.position.set(-22.0, 3.6, -27.5);
    scene.add(accentLight);

    initHDAtmosphere();
    if (LS.isHD && LS.hdPost) {
      LS.hdPost.init(renderer, scene, camera);
    }

    worldGroup = new THREE.Group();
    scene.add(worldGroup);

    initSparklesAndStars();
    LS.initCoreCharacters(scene);
    LS.initGameplayUI(scene);
    initGraphicsSwitcher();
    setupInputs();

    const startWorld = LS.WORLDS[LS.state.currentWorld] && !LS.WORLDS[LS.state.currentWorld].isInterior
      ? LS.state.currentWorld : 'tokyo';

    let animStarted = false;
    function animate() {
      requestAnimationFrame(animate);
      try {
        const dt = Math.min(clock.getDelta(), 0.05);
        const elapsed = clock.elapsedTime;
        updatePlayer(dt, elapsed);
        if (LS.chars.laila) {
          LS.updateCharacters(dt, elapsed, LS.chars.laila.root.position);
        }
        if (LS.activeWorld && LS.activeWorld.update) {
          LS.activeWorld.update(dt, elapsed);
        }
        updateZoneBeacons(elapsed);
        updateHDAtmosphere(dt, elapsed);
        if (LS.hdPost && LS.hdPost.update) LS.hdPost.update(elapsed);
        updateSparklesAndStars(dt);
        updateCamera(dt);
        LS.updateHUD();
        updateMiniMap();
        if (!LS.hdPost || !LS.hdPost.render()) {
          renderer.render(scene, camera);
        }
      } catch (err) {
        console.error(err);
      }
    }

    const bootWorld = () => {
      if (LS.refreshMochiHD) LS.refreshMochiHD();
      LS.loadWorld(startWorld, false);
      if (!animStarted) {
        animStarted = true;
        clock.getDelta();
        animate();
      }
    };

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (LS.hdPost) LS.hdPost.setSize(window.innerWidth, window.innerHeight, renderer.getPixelRatio());
    });

    if (LS.isHD && LS.hdAssets && LS.hdAssets.preloadAll) {
      LS.hdAssets.preloadAll().then(bootWorld);
    } else {
      bootWorld();
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    try {
      init();
    } catch (err) {
      showError(err && err.message ? err.message : String(err));
    }
  });
})(window.LailaSalma);
