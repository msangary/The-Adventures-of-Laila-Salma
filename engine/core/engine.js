window.LailaSalma = window.LailaSalma || {};

(function (LS) {
  let scene, camera, renderer, hemiLight, dirLight, streetLight, accentLight;
  let worldGroup = null;
  let sparkleSystem = null;
  let sparkleIdx = 0;

  const clock = new THREE.Clock();
  const keys = {};
  const joy = { x: 0, y: 0, active: false };

  // Smooth damped orbit camera state
  let camYaw = Math.PI;
  let targetCamYaw = Math.PI;
  let camPitch = 0.30;
  let targetCamPitch = 0.30;
  let camDist = 6.6;
  let targetCamDist = 6.6;
  let dragging = false;
  let lastPointer = { x: 0, y: 0 };

  let velY = 0;
  let grounded = true;
  let salmaVelY = 0;
  let salmaGrounded = true;
  let miniMapCompact = false;

  LS.activeWorld = null;
  LS.getScene = function () { return scene; };

  function showError(msg) {
    const ov = document.getElementById('error-overlay');
    const el = document.getElementById('error-message');
    if (el) el.textContent = msg;
    if (ov) ov.classList.remove('hidden');
  }

  function applyTimeOfDay() {
    const mode = LS.state.timeMode;
    const wid = LS.state.currentWorld;
    const btn = document.getElementById('btn-time');
    if (mode === 1) {
      scene.fog.color.setHex(wid === 'kyoto' ? 0xeb9b6c : 0xf2a772);
      dirLight.color.setHex(0xffa45b);
      dirLight.intensity = 1.05;
      hemiLight.color.setHex(0xffc99e);
      hemiLight.groundColor.setHex(0x6e4b3a);
      streetLight.intensity = 0.72;
      accentLight.intensity = 0.85;
      if (btn) btn.textContent = '🌇';
    } else if (mode === 2) {
      scene.fog.color.setHex(0x25355a);
      dirLight.color.setHex(0x88a8e6);
      dirLight.intensity = 0.62;
      hemiLight.color.setHex(0x50689c);
      hemiLight.groundColor.setHex(0x1f2536);
      streetLight.intensity = 1.05;
      accentLight.intensity = 1.15;
      if (btn) btn.textContent = '🌙';
    } else {
      scene.fog.color.setHex(wid === 'kyoto' ? 0xc8e4f2 : 0xcbe6f7);
      dirLight.color.setHex(0xfff1d0);
      dirLight.intensity = 1.12;
      hemiLight.color.setHex(0xbbe2ff);
      hemiLight.groundColor.setHex(0x74855c);
      streetLight.intensity = 0.25;
      accentLight.intensity = 0.35;
      if (btn) btn.textContent = '🌤️';
    }
    if (LS.activeWorld && LS.activeWorld.skyMesh) {
      LS.activeWorld.skyMesh.material.map = LS.createSkyTexture(mode, wid);
      LS.activeWorld.skyMesh.material.needsUpdate = true;
    }
  }
  LS.applyTimeOfDay = applyTimeOfDay;

  function initSparkles() {
    const count = 48;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] = -999;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffd6f0, size: 0.24, transparent: true, opacity: 0.92 });
    sparkleSystem = new THREE.Points(geo, mat);
    scene.add(sparkleSystem);
  }

  function updateSparkles(dt) {
    if (!sparkleSystem || !LS.chars.laila) return;
    const pos = sparkleSystem.geometry.attributes.position;
    const active = LS.runtime.sparkleUntil && Date.now() < LS.runtime.sparkleUntil;
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

  function clearWorldGroup() {
    if (!worldGroup) return;
    while (worldGroup.children.length > 0) {
      worldGroup.remove(worldGroup.children[0]);
    }
  }

  LS.loadWorld = function (worldId, viaTrain) {
    const meta = LS.WORLDS[worldId];
    const builder = LS.worldBuilders[worldId];
    if (!meta || !builder) return;

    // Clean up any active runtime animations
    if (LS.runtime.eating) LS.finishEatingAnimation(scene);
    LS.runtime.mochiGame = null;
    LS.runtime.parkActivity = null;
    LS.runtime.nearZone = null;
    LS.closeAllModals();

    LS.state.currentWorld = worldId;
    LS.saveState();

    clearWorldGroup();

    // Update fog & 4-light positions for this world
    scene.fog.near = meta.fogNear || 44;
    scene.fog.far = meta.fogFar || 150;

    if (worldId === 'kyoto') {
      // Strict blueprint 4-light placement: Street light + Bridge light at X = -22.0, Z = -27.5
      dirLight.position.set(10, 32, 12);
      dirLight.shadow.camera.left = -58;
      dirLight.shadow.camera.right = 28;
      dirLight.shadow.camera.top = 36;
      dirLight.shadow.camera.bottom = -56;
      dirLight.shadow.camera.updateProjectionMatrix();
      streetLight.position.set(0, 5.2, -10);
      accentLight.position.set(-22.0, 3.6, -27.5);
    } else {
      dirLight.position.set(18, 28, 16);
      dirLight.shadow.camera.left = -35;
      dirLight.shadow.camera.right = 35;
      dirLight.shadow.camera.top = 35;
      dirLight.shadow.camera.bottom = -35;
      dirLight.shadow.camera.updateProjectionMatrix();
      streetLight.position.set(0, 5.2, -6);
      accentLight.position.set(8.5, 3.8, -5.5);
    }

    LS.activeWorld = builder.build(worldGroup, scene);

    // Position Laila, Salma, and Mochi at spawn
    const sp = viaTrain ? meta.arrivalSpawn : meta.spawn;
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

    // Reset camera smoothly behind sisters
    camYaw = sp.rotY;
    targetCamYaw = sp.rotY;
    camPitch = 0.30;
    targetCamPitch = 0.30;
    camDist = 6.6;
    targetCamDist = 6.6;
    camera.position.set(sp.x, baseH + 3.4, sp.z + 6.4);
    camera.lookAt(sp.x, baseH + 1.25, sp.z);

    // Update Salma greeting & minimap legend
    const legendAnimal = document.getElementById('mm-animal-label');
    if (legendAnimal) {
      legendAnimal.innerHTML = worldId === 'kyoto'
        ? '<i class="mm-dot mm-cat"></i>Foxes'
        : '<i class="mm-dot mm-cat"></i>Cats';
    }
    const mmCard = document.getElementById('minimap-card');
    if (mmCard) {
      mmCard.title = meta.title + ' Mini-Map (M to toggle)';
    }
    LS.setSalmaBubbleText(
      worldId === 'kyoto'
        ? 'Whoa, Kyoto! Let us cross the koi bridge & find 5 kitsune foxes! ⛩️🦊'
        : 'Yay, Tokyo! Let us find all 5 cats & visit Ichiban Ramen! 🌸🐱',
      0
    );

    applyTimeOfDay();
    LS.updateHUD();

    if (worldId === 'kyoto') {
      LS.unlockStamp('kyoto_arrival');
    }
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

    const overlay = document.getElementById('travel-overlay');
    const titleEl = document.getElementById('travel-title');
    const subEl = document.getElementById('travel-sub');
    if (titleEl) titleEl.textContent = '🚅 Shinkansen Express: ' + fromMeta.title + ' → ' + toMeta.title;
    if (subEl) subEl.textContent = 'All aboard, Laila, Salma & Mochi! Zooming past Mt. Fuji at 300 km/h...';
    if (overlay) overlay.classList.remove('hidden');

    LS.playSFX('train');

    setTimeout(() => {
      LS.loadWorld(targetWorldId, true);
    }, 900);

    setTimeout(() => {
      if (overlay) overlay.classList.add('hidden');
      LS.runtime.traveling = false;
      LS.showToast(toMeta.emoji + ' Welcome to ' + toMeta.title + ' — ' + toMeta.subtitle + '!');
    }, 1850);
  };

  function getGroundH(x, z) {
    if (LS.activeWorld && LS.activeWorld.getGroundHeight) {
      return LS.activeWorld.getGroundHeight(x, z);
    }
    return 0;
  }

  function triggerJump() {
    if (grounded && !LS.runtime.eating && !LS.runtime.modalOpen && !LS.runtime.traveling) {
      const superJump = LS.runtime.superJumpUntil && Date.now() < LS.runtime.superJumpUntil;
      velY = superJump ? 10.2 : 6.4;
      grounded = false;
      LS.playSFX('jump');
      if (salmaGrounded) {
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
    LS.runtime.poseTimer = 2.6;
    const nearSalma = LS.chars.salma &&
      LS.chars.laila.root.position.distanceTo(LS.chars.salma.root.position) < 3.8;
    if (nearSalma) {
      LS.runtime.highFiveTimer = 1.6;
      LS.runtime.buff = {
        name: 'Sister High-Five Boost',
        short: 'High-5⚡',
        speedMult: 1.25,
        infiniteStamina: true,
        expiresAt: Date.now() + 15000
      };
      LS.playSFX('correct');
      LS.showToast('🙌 Sister High-Five & Boost! Salma listens for hidden friends...');
      LS.showSalmaAnimalHint();
    } else {
      LS.playTone(523.25, 0.1);
      LS.playTone(659.25, 0.14, 'sine', 0.1);
      LS.showToast('👋 Laila & Salma wave hello to ' + LS.WORLDS[LS.state.currentWorld].title + '!');
    }
  }

  function cycleCameraMode() {
    LS.runtime.camMode = (LS.runtime.camMode + 1) % 3;
    const btn = document.getElementById('btn-front-cam');
    const banner = document.getElementById('front-view-banner');
    const label = document.getElementById('front-view-label');
    if (LS.runtime.camMode === 0) {
      btn.classList.remove('active');
      banner.classList.add('hidden');
    } else if (LS.runtime.camMode === 1) {
      btn.classList.add('active');
      label.textContent = "📷 Laila's Front View";
      banner.classList.remove('hidden');
    } else {
      btn.classList.add('active');
      label.textContent = "📷 Salma's Front View";
      banner.classList.remove('hidden');
    }
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
    if (!LS.runtime.nearZone && LS.chars.mochi &&
        LS.chars.laila.root.position.distanceTo(LS.chars.mochi.position) < 2.6) {
      LS.openMochiModal();
      return;
    }
    if (!LS.runtime.nearZone) return;
    const zid = LS.runtime.nearZone.id;
    if (zid === 'school') LS.openSchoolModal('tokyo');
    else if (zid === 'kyoto_academy') LS.openSchoolModal('kyoto');
    else if (zid === 'ramen') LS.openRamenModal();
    else if (zid === 'sushi_stand') LS.openSushiModal();
    else if (zid === 'tea_house') LS.openTeaHouseModal();
    else if (zid === 'shop') LS.openShopModal('tokyo');
    else if (zid === 'kimono_shop') LS.openShopModal('kyoto');
    else if (zid === 'gachapon') LS.openGachaponModal();
    else if (zid === 'drink_vending') LS.openDrinkVendingModal();
    else if (zid === 'clubhouse') LS.openClubhouseModal();
    else if (zid === 'kyoto_ryokan') LS.openRyokanModal();
    else if (zid === 'shrine_omikuji') LS.openShrineModal();
    else if (zid === 'koi_dock') LS.feedKoiAndDucks();
    else if (zid === 'shinkansen_station') LS.openShinkansenModal();
    else if (zid === 'mochi') LS.openMochiModal();
    else if (zid === 'park_slide') {
      LS.runtime.parkActivity = { type: 'slide', timer: 2.2 };
      LS.addXP(10);
      LS.playSFX('jump');
      LS.showToast('🛝 Wheee! Sliding down together! +10 XP');
    } else if (zid === 'park_swing') {
      LS.runtime.parkActivity = { type: 'swing', timer: 3.5 };
      LS.addXP(10);
      LS.playSFX('jump');
      LS.showToast('🎠 Swinging high on the park swing! +10 XP');
    } else if (zid === 'park_hopscotch') {
      LS.addCoins(20);
      LS.addXP(12);
      LS.playSFX('coin');
      LS.showToast('🎯 Hopscotch cleared! +20c & +12 XP!');
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
      if (k === 'v') triggerSisterPose();
      if (k === 'm') toggleMiniMap();
      if (k === 'p') LS.openPassportModal();
      if (k === 'r') toggleRunButton();
      if (k === 'e') triggerInteract();
      if (k === ' ') triggerJump();
    });

    window.addEventListener('keyup', e => {
      keys[e.key.toLowerCase()] = false;
    });

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', e => {
      if (LS.runtime.modalOpen) return;
      dragging = true;
      lastPointer = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('pointermove', e => {
      if (!dragging || LS.runtime.modalOpen) return;
      const dx = e.clientX - lastPointer.x;
      const dy = e.clientY - lastPointer.y;
      lastPointer = { x: e.clientX, y: e.clientY };
      targetCamYaw -= dx * 0.0062;
      targetCamPitch = Math.max(0.08, Math.min(0.88, targetCamPitch + dy * 0.0042));
    });
    window.addEventListener('pointerup', () => { dragging = false; });

    dom.addEventListener('wheel', e => {
      if (LS.runtime.modalOpen) return;
      targetCamDist = Math.max(4.4, Math.min(11.5, targetCamDist + e.deltaY * 0.004));
    }, { passive: true });

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
    const mmCard = document.getElementById('minimap-card');
    if (mmCard) mmCard.addEventListener('click', toggleMiniMap);
    document.getElementById('btn-run').addEventListener('click', toggleRunButton);
    document.getElementById('btn-jump').addEventListener('click', triggerJump);
    document.getElementById('interact-prompt').addEventListener('click', triggerInteract);
    document.getElementById('btn-interact-mobile').addEventListener('click', triggerInteract);

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

    let inX = (keys['d'] || keys['arrowright'] ? 1 : 0) - (keys['a'] || keys['arrowleft'] ? 1 : 0);
    let inZ = (keys['s'] || keys['arrowdown'] ? 1 : 0) - (keys['w'] || keys['arrowup'] ? 1 : 0);
    if (joy.active) { inX = joy.x; inZ = joy.y; }

    const moving = Math.hypot(inX, inZ) > 0.08;
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
    const speed = (isRunning ? 8.4 : 4.8) * buffMult;

    if (moving) {
      const len = Math.hypot(inX, inZ);
      inX /= len; inZ /= len;
      const forward = new THREE.Vector3(Math.sin(camYaw), 0, Math.cos(camYaw));
      const right = new THREE.Vector3(-forward.z, 0, forward.x);
      const moveVec = new THREE.Vector3()
        .addScaledVector(forward, -inZ)
        .addScaledVector(right, inX)
        .normalize();

      laila.root.position.addScaledVector(moveVec, speed * dt);
      resolveCollisions(laila.root.position, 0.45);

      const targetRot = Math.atan2(moveVec.x, moveVec.z);
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
        salma.root.position.y = sg + Math.abs(Math.sin(elapsed * 10)) * 0.45;
      }
    }

    if (LS.runtime.parkActivity && LS.activeWorld.slideStartPos) {
      LS.runtime.parkActivity.timer -= dt;
      if (LS.runtime.parkActivity.type === 'slide') {
        const t = Math.max(0, Math.min(1, 1 - (LS.runtime.parkActivity.timer / 2.2)));
        laila.root.position.lerpVectors(LS.activeWorld.slideStartPos, LS.activeWorld.slideEndPos, t);
      }
      if (LS.runtime.parkActivity.timer <= 0) {
        LS.runtime.parkActivity = null;
      }
    }

    if (LS.runtime.mochiGame && LS.chars.mochi) {
      const mg = LS.runtime.mochiGame;
      mg.timeLeft -= dt;
      const mp = LS.chars.mochi.position;
      const lp = laila.root.position;
      const minX = -3.4, maxX = 3.4;
      const minZ = LS.state.currentWorld === 'kyoto' ? -36 : -24;
      const maxZ = 16;

      if (mg.mode === 'fetch') {
        if (mg.state === 'to_target') {
          const dx = mg.ballPos.x - mp.x;
          const dz = mg.ballPos.z - mp.z;
          const d = Math.hypot(dx, dz);
          if (d > 0.25) {
            mp.x += (dx / d) * 6.8 * dt;
            mp.z += (dz / d) * 6.8 * dt;
            mp.y = getGroundH(mp.x, mp.z);
            mp.rotation.y = Math.atan2(dx, dz);
          } else {
            mg.state = 'returning';
          }
        } else {
          const dx = lp.x - mp.x;
          const dz = lp.z - mp.z;
          const d = Math.hypot(dx, dz);
          if (d > 0.95) {
            mp.x += (dx / d) * 6.6 * dt;
            mp.z += (dz / d) * 6.6 * dt;
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
        if (dPlayer < 1.7) {
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

  function updateCamera(dt) {
    const laila = LS.chars.laila;
    const salma = LS.chars.salma;
    if (!laila) return;

    // Smooth damped orbit angles & zoom
    const damp = Math.min(1, dt * 10);
    camYaw += (targetCamYaw - camYaw) * damp;
    camPitch += (targetCamPitch - camPitch) * damp;
    camDist += (targetCamDist - camDist) * damp;

    const p = laila.root.position;
    let desiredPos, lookTarget;

    if (LS.runtime.eating && LS.runtime.eating.camPos) {
      desiredPos = LS.runtime.eating.camPos;
      lookTarget = LS.runtime.eating.camLook;
    } else if (LS.runtime.camMode === 1) {
      const fwd = new THREE.Vector3(Math.sin(laila.root.rotation.y), 0, Math.cos(laila.root.rotation.y));
      desiredPos = p.clone().addScaledVector(fwd, 2.25).add(new THREE.Vector3(0, 1.32, 0));
      lookTarget = p.clone().add(new THREE.Vector3(0, 1.18, 0));
    } else if (LS.runtime.camMode === 2 && salma) {
      const sp = salma.root.position;
      const fwd = new THREE.Vector3(Math.sin(salma.root.rotation.y), 0, Math.cos(salma.root.rotation.y));
      desiredPos = sp.clone().addScaledVector(fwd, 1.95).add(new THREE.Vector3(0, 1.1, 0));
      lookTarget = sp.clone().add(new THREE.Vector3(0, 0.95, 0));
    } else {
      const offX = -Math.sin(camYaw) * Math.cos(camPitch) * camDist;
      const offY = Math.sin(camPitch) * camDist + 1.5;
      const offZ = -Math.cos(camYaw) * Math.cos(camPitch) * camDist;
      desiredPos = new THREE.Vector3(p.x + offX, p.y + offY, p.z + offZ);
      lookTarget = new THREE.Vector3(p.x, p.y + 1.25, p.z);
    }

    camera.position.lerp(desiredPos, Math.min(1, dt * 8.5));
    camera.lookAt(lookTarget);
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

    if (LS.activeWorld.drawMiniMap) {
      LS.activeWorld.drawMiniMap(ctx, W, H, toMapX, toMapY);
    }

    // Unfound Hidden Animals (purple dots)
    if (LS.activeWorld.hiddenAnimals) {
      LS.activeWorld.hiddenAnimals.forEach(a => {
        if (a.found) return;
        const cx = toMapX(a.mesh.position.x);
        const cy = toMapY(a.mesh.position.z);
        ctx.fillStyle = '#9333ea';
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });
    }

    // Salma (amber dot)
    if (LS.chars.salma) {
      const sp = LS.chars.salma.root.position;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(toMapX(sp.x), toMapY(sp.z), 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }

    // Laila (red directional arrow)
    const lp = LS.chars.laila.root.position;
    const lx = toMapX(lp.x);
    const ly = toMapY(lp.z);
    const yaw = LS.chars.laila.root.rotation.y;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(-yaw);
    ctx.fillStyle = '#e63946';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 6.5);
    ctx.lineTo(-4.8, -4.8);
    ctx.lineTo(0, -2.5);
    ctx.lineTo(4.8, -4.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function init() {
    if (typeof THREE === 'undefined') {
      showError('Three.js failed to load. Please check your internet connection and reload.');
      return;
    }

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xcbe6f7, 42, 145);

    camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.1, 300);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Strict mobile-safe DPR cap from Master Blueprint (<= 1.5)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('game-container').appendChild(renderer.domElement);

    // STRICT 4-LIGHT WEBGL BUDGET:
    // 1. HemisphereLight (ambient sky/ground fill)
    hemiLight = new THREE.HemisphereLight(0xbbe2ff, 0x74855c, 0.78);
    scene.add(hemiLight);

    // 2. DirectionalLight (sun/moon with 1024x1024 shadow map)
    dirLight = new THREE.DirectionalLight(0xfff1d0, 1.12);
    dirLight.position.set(18, 28, 16);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // 3. Street PointLight (main road warm accent)
    streetLight = new THREE.PointLight(0xffd79a, 0.3, 28);
    streetLight.position.set(0, 5.2, -6);
    scene.add(streetLight);

    // 4. Bridge / Landmark PointLight (centered at X = -22.0 in Kyoto)
    accentLight = new THREE.PointLight(0xffcf88, 0.4, 24);
    accentLight.position.set(-22.0, 3.6, -27.5);
    scene.add(accentLight);

    worldGroup = new THREE.Group();
    scene.add(worldGroup);

    initSparkles();
    LS.initCoreCharacters(scene);
    LS.initGameplayUI(scene);
    setupInputs();

    // Load saved world (defaults to Tokyo)
    const startWorld = LS.WORLDS[LS.state.currentWorld] ? LS.state.currentWorld : 'tokyo';
    LS.loadWorld(startWorld, false);

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

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
        updateSparkles(dt);
        updateCamera(dt);
        LS.updateHUD();
        updateMiniMap();
        renderer.render(scene, camera);
      } catch (err) {
        console.error(err);
      }
    }
    animate();
  }

  window.addEventListener('DOMContentLoaded', () => {
    try {
      init();
    } catch (err) {
      showError(err && err.message ? err.message : String(err));
    }
  });
})(window.LailaSalma);
