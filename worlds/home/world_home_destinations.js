window.LailaSalma = window.LailaSalma || {};

(function (LS) {
  // Procedural Texture Helpers for High-Detail Ghibli Destinations!
  function createCheckerTileTexture(colA, colB, repX, repY) {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = colA; ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = colB;
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillRect(64, 64, 64, 64);
    ctx.strokeStyle = 'rgba(110, 75, 45, 0.14)'; ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 64, 64); ctx.strokeRect(64, 64, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repX || 6, repY || 5);
    return tex;
  }

  function createGalaxyCarpetTexture() {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#221f4d'; ctx.fillRect(0, 0, 256, 256);
    const cols = ['#fde047', '#38bdf8', '#f472b6', '#a78bfa', '#34d399'];
    for (let i = 0; i < 42; i++) {
      const x = (i * 61 + 19) % 244 + 6;
      const y = (i * 97 + 31) % 244 + 6;
      ctx.fillStyle = cols[i % cols.length];
      ctx.beginPath(); ctx.arc(x, y, (i % 3) + 2, 0, Math.PI * 2); ctx.fill();
    }
    // Fun retro neon swirls
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(72, 84, 24, 0, Math.PI * 1.4); ctx.stroke();
    ctx.strokeStyle = 'rgba(244, 114, 182, 0.45)';
    ctx.beginPath(); ctx.arc(188, 174, 28, 0.4, Math.PI * 1.7); ctx.stroke();
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 3);
    return tex;
  }

  function createBoardGameTexture() {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff5d6'; ctx.fillRect(0, 0, 256, 256);
    const cols = ['#ff8fab', '#ffd166', '#90e0ef', '#b5e48c'];
    for (let i = 0; i < 16; i++) {
      const row = Math.floor(i / 4), col = i % 4;
      const x = 14 + col * 58, y = 14 + row * 58;
      ctx.fillStyle = i === 15 ? '#fbbf24' : cols[i % 4];
      ctx.fillRect(x, y, 52, 52);
      ctx.strokeStyle = '#6b4226'; ctx.lineWidth = 3;
      ctx.strokeRect(x, y, 52, 52);
      ctx.fillStyle = '#3d2c1e'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(i === 15 ? '🏆' : (i === 4 || i === 9 || i === 12 ? '⭐' : String(i + 1)), x + 26, y + 34);
    }
    return new THREE.CanvasTexture(c);
  }

  function createWindowVistaTexture() {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 160;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, 160);
    g.addColorStop(0, '#6dc6f5'); g.addColorStop(0.68, '#d9f2ff'); g.addColorStop(1, '#fff3cf');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 160);
    ctx.fillStyle = 'rgba(255,253,245,0.92)';
    [[60, 44, 22], [82, 38, 26], [190, 52, 22]].forEach(cl => {
      ctx.beginPath(); ctx.arc(cl[0], cl[1], cl[2], 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = '#6db36b';
    ctx.beginPath(); ctx.ellipse(90, 162, 120, 46, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#539957';
    ctx.beginPath(); ctx.ellipse(205, 164, 100, 42, 0, 0, Math.PI * 2); ctx.fill();
    return new THREE.CanvasTexture(c);
  }

  function addDetailedWallWindow(worldGroup, x, y, z, rotY, w, h, curtHex, trimMat) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = rotY;
    const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.24, h + 0.24, 0.14), trimMat);
    g.add(frame);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.16), new THREE.MeshBasicMaterial({ map: createWindowVistaTexture() }));
    g.add(glass);
    const mV = new THREE.Mesh(new THREE.BoxGeometry(0.07, h, 0.19), trimMat); g.add(mV);
    const mH = new THREE.Mesh(new THREE.BoxGeometry(w, 0.07, 0.19), trimMat); mH.position.y = 0.08; g.add(mH);
    const sill = new THREE.Mesh(new THREE.BoxGeometry(w + 0.42, 0.12, 0.30), trimMat);
    sill.position.set(0, -h * 0.5 - 0.10, 0.08); g.add(sill);
    if (curtHex) {
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, w + 1.15, 6), trimMat);
      rod.rotation.z = Math.PI / 2; rod.position.set(0, h * 0.5 + 0.22, 0.14); g.add(rod);
      [-1, 1].forEach(side => {
        const c = new THREE.Mesh(new THREE.BoxGeometry(0.46, h + 0.48, 0.12), LS.makeToonMat(curtHex));
        c.position.set(side * (w * 0.5 + 0.24), -0.04, 0.14); g.add(c);
      });
    }
    worldGroup.add(g);
  }

  function addHangingStringLights(worldGroup, x1, z1, x2, z2, y, count, glowHex) {
    for (let i = 0; i < count; i++) {
      const u = count > 1 ? i / (count - 1) : 0.5;
      const lx = x1 + (x2 - x1) * u;
      const lz = z1 + (z2 - z1) * u;
      const ly = y - Math.sin(u * Math.PI) * 0.24;
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 7, 6), new THREE.MeshBasicMaterial({ color: 0xfff3c4 }));
      bulb.position.set(lx, ly, lz); worldGroup.add(bulb);
      if (LS.createGlowSprite && i % 2 === 0) {
        const halo = LS.createGlowSprite(glowHex || 0xffd57a, 1.15);
        halo.position.set(lx, ly, lz); worldGroup.add(halo);
      }
    }
  }

  // Shared helper: High-Detail 4-walled Studio Ghibli room shell (wainscoting, crown trim & wood beams, 0 extra lights!)
  function buildRoomShell(worldGroup, w, d, h, floorHex, wallHex, trimHex, floorTex) {
    const floorMat = LS.makeSurfaceMat(floorTex || LS.createCedarPlankTexture(), { color: floorTex ? 0xffffff : (floorHex || 0xe3c396) });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floorMat);
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; worldGroup.add(floor);

    const wallMat = LS.makeToonMat(0xffffff, { map: LS.createPlasterTexture(wallHex || '#fbf2e3') });
    const wainMat = LS.makeToonMat(0xecdac0);
    const trimMat = LS.makeToonMat(trimHex || 0x8c5e3c);
    const whiteTrim = LS.makeToonMat(0xfff9ee);
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

    // Exposed wooden ceiling timber rafters!
    [-w * 0.28, 0, w * 0.28].forEach(bx => {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, d), trimMat);
      beam.position.set(bx, h - 0.16, 0); worldGroup.add(beam);
    });

    // Wainscoting paneling, chair-rail, baseboards & crown molding!
    [[0, -d / 2 + 0.16, w, 0.06], [0, d / 2 - 0.16, w, 0.06]].forEach(b => {
      const ws = new THREE.Mesh(new THREE.BoxGeometry(b[2], 1.0, b[3]), wainMat);
      ws.position.set(b[0], 0.50, b[1]); worldGroup.add(ws);
      const rl = new THREE.Mesh(new THREE.BoxGeometry(b[2], 0.08, b[3] + 0.06), trimMat);
      rl.position.set(b[0], 1.02, b[1]); worldGroup.add(rl);
      const bb = new THREE.Mesh(new THREE.BoxGeometry(b[2], 0.20, b[3] + 0.06), whiteTrim);
      bb.position.set(b[0], 0.10, b[1]); worldGroup.add(bb);
      const cr = new THREE.Mesh(new THREE.BoxGeometry(b[2], 0.16, b[3] + 0.08), whiteTrim);
      cr.position.set(b[0], h - 0.12, b[1]); worldGroup.add(cr);
    });
    [[-w / 2 + 0.16, 0, 0.06, d], [w / 2 - 0.16, 0, 0.06, d]].forEach(b => {
      const ws = new THREE.Mesh(new THREE.BoxGeometry(b[2], 1.0, b[3]), wainMat);
      ws.position.set(b[0], 0.50, b[1]); worldGroup.add(ws);
      const rl = new THREE.Mesh(new THREE.BoxGeometry(b[2] + 0.06, 0.08, b[3]), trimMat);
      rl.position.set(b[0], 1.02, b[1]); worldGroup.add(rl);
      const bb = new THREE.Mesh(new THREE.BoxGeometry(b[2] + 0.06, 0.20, b[3]), whiteTrim);
      bb.position.set(b[0], 0.10, b[1]); worldGroup.add(bb);
      const cr = new THREE.Mesh(new THREE.BoxGeometry(b[2] + 0.08, 0.16, b[3]), whiteTrim);
      cr.position.set(b[0], h - 0.12, b[1]); worldGroup.add(cr);
    });

    // Detailed Panelled Exit Door + Brass Handle + Welcome Mat back to Qashqai!
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.90, 2.65, 0.22), trimMat);
    door.position.set(0, 1.32, d / 2 - 0.15); worldGroup.add(door);
    const dKnob = new THREE.Mesh(new THREE.SphereGeometry(0.065, 7, 6), LS.makeToonMat(0xe9c46a));
    dKnob.position.set(0.68, 1.24, d / 2 - 0.30); worldGroup.add(dKnob);
    const mat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.04, 1.15), LS.makeToonMat(0x4b5563));
    mat.position.set(0, 0.02, d / 2 - 0.9); worldGroup.add(mat);

    return { trimMat, wallMat };
  }

  // Helper: Animated cozy 3D TV screen on a detailed media stand
  function createAnimatedTV(worldGroup, x, y, z, rotY, mode) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = rotY;
    const stand = new THREE.Mesh(new THREE.BoxGeometry(2.75, 0.68, 0.76), LS.makeToonMat(0x7c5032));
    stand.position.y = 0.34; stand.castShadow = true; g.add(stand);
    const sBar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.09, 0.16), LS.makeToonMat(0x1f242c));
    sBar.position.set(0, 0.72, 0.24); g.add(sBar);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.50, 1.52, 0.16), LS.makeToonMat(0x1f242c));
    frame.position.set(0, 1.58, 0); g.add(frame);

    const c = document.createElement('canvas');
    c.width = 256; c.height = 152;
    const ctx = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c);
    const screenMat = new THREE.MeshBasicMaterial({ map: tex });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.28, 1.32), screenMat);
    screen.position.set(0, 1.58, 0.095); g.add(screen);
    worldGroup.add(g);

    return {
      canvas: c, ctx, mat: screenMat, lastFrame: -1, mode: mode || 'show',
      currentChannel: 'soap',
      manualChannel: null,
      manualUntil: 0,
      lastElapsed: 0,
      toggleChannel: function (elapsed) {
        const now = typeof elapsed === 'number' && elapsed > 0 ? elapsed : this.lastElapsed;
        this.manualChannel = this.currentChannel === 'soap' ? 'news' : 'soap';
        this.manualUntil = now + 12;
        this.currentChannel = this.manualChannel;
        this.lastFrame = -1;
        return this.currentChannel;
      },
      update: function (elapsed) {
        this.lastElapsed = elapsed;
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
        } else if (this.mode === 'nano_tv') {
          // Mostly dramatic Soap Opera (~70%), sometimes switches to Breaking News (~30%)!
          let ch = (elapsed % 20) < 14 ? 'soap' : 'news';
          if (this.manualChannel && elapsed < this.manualUntil) ch = this.manualChannel;
          else if (this.manualChannel && elapsed >= this.manualUntil) this.manualChannel = null;
          this.currentChannel = ch;

          if (ch === 'soap') {
            // Dramatic Soap Opera Scene: Mansion evening backdrop, chandelier, two dramatic actors, hearts & subtitles!
            gGrad.addColorStop(0, '#3b1538'); gGrad.addColorStop(0.55, '#6b234e'); gGrad.addColorStop(1, '#261029');
            ctx.fillStyle = gGrad; ctx.fillRect(0, 0, 256, 152);
            // Moonlit mansion window in background
            ctx.fillStyle = '#1e2b58'; ctx.fillRect(98, 20, 60, 62);
            ctx.strokeStyle = '#e9c46a'; ctx.lineWidth = 3; ctx.strokeRect(98, 20, 60, 62);
            ctx.fillStyle = '#fff5cc'; ctx.beginPath(); ctx.arc(138, 38, 10, 0, Math.PI * 2); ctx.fill();
            // Dramatic Actor 1 (left, woman in red gown)
            const sway = Math.sin(elapsed * 3.2) * 3;
            ctx.fillStyle = '#e63963'; ctx.beginPath(); ctx.arc(76, 128, 26, Math.PI, 0); ctx.fill();
            ctx.fillStyle = '#f1c29b'; ctx.beginPath(); ctx.arc(76, 84 + sway * 0.4, 15, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#241715'; ctx.beginPath(); ctx.arc(74, 80 + sway * 0.4, 16, Math.PI * 0.9, Math.PI * 2.1); ctx.fill();
            // Dramatic Actor 2 (right, man in tuxedo)
            ctx.fillStyle = '#1f2937'; ctx.beginPath(); ctx.arc(180, 128, 27, Math.PI, 0); ctx.fill();
            ctx.fillStyle = '#e0ac84'; ctx.beginPath(); ctx.arc(180, 82 - sway * 0.4, 15, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#1e1918'; ctx.beginPath(); ctx.arc(180, 77 - sway * 0.4, 15, Math.PI, 0); ctx.fill();
            // Floating dramatic icon
            ctx.font = '22px sans-serif';
            const dramaIcon = Math.floor(elapsed / 3) % 2 === 0 ? '💔' : '🌹';
            ctx.fillText(dramaIcon, 117, 68 + Math.sin(elapsed * 4) * 5);
            // Channel Badge
            ctx.fillStyle = 'rgba(233,196,106,0.92)'; ctx.fillRect(10, 10, 106, 22);
            ctx.fillStyle = '#2c1026'; ctx.font = 'bold 12px sans-serif'; ctx.fillText('🎭 SOAP OPERA', 16, 25);
            // Subtitle Bar
            ctx.fillStyle = 'rgba(0,0,0,0.68)'; ctx.fillRect(0, 124, 256, 28);
            const lines = ['"Wait! Tell me the truth!"', '"I never forgot you..."', '"Gasp! The secret letter!"'];
            ctx.fillStyle = '#fff5d6'; ctx.font = 'italic bold 13px sans-serif';
            ctx.fillText(lines[Math.floor(elapsed / 3.5) % lines.length], 22, 142);
          } else {
            // Breaking News Broadcast: Blue studio, world map, anchor at desk, red LIVE NEWS badge & scrolling ticker!
            gGrad.addColorStop(0, '#0f2957'); gGrad.addColorStop(0.65, '#1d4d8f'); gGrad.addColorStop(1, '#0b1d3d');
            ctx.fillStyle = gGrad; ctx.fillRect(0, 0, 256, 152);
            // Stylized World Map glow on studio wall
            ctx.fillStyle = 'rgba(120,190,255,0.22)';
            ctx.beginPath(); ctx.ellipse(72, 62, 42, 22, 0.2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(186, 56, 36, 18, -0.15, 0, Math.PI * 2); ctx.fill();
            // News Anchor in suit & red tie behind curved studio desk
            const nod = Math.sin(elapsed * 5.0) * 2;
            ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.arc(128, 112, 28, Math.PI, 0); ctx.fill();
            ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(120, 92); ctx.lineTo(136, 92); ctx.lineTo(128, 112); ctx.fill();
            ctx.fillStyle = '#dc2626'; ctx.fillRect(126, 94, 4, 16);
            ctx.fillStyle = '#e5b894'; ctx.beginPath(); ctx.arc(128, 74 + nod, 15, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#334155'; ctx.beginPath(); ctx.arc(128, 69 + nod, 15, Math.PI, 0); ctx.fill();
            // Curved News Desk
            ctx.fillStyle = '#cbd5e1'; ctx.fillRect(42, 108, 172, 18);
            ctx.fillStyle = '#dc2626'; ctx.fillRect(42, 108, 172, 4);
            // Flashing LIVE NEWS Badge
            ctx.fillStyle = Math.floor(elapsed * 2) % 2 === 0 ? '#dc2626' : '#ef4444';
            ctx.fillRect(10, 10, 96, 22);
            ctx.fillStyle = '#ffffff'; ctx.font = 'bold 12px sans-serif'; ctx.fillText('🔴 LIVE NEWS', 16, 25);
            // Scrolling News Ticker
            ctx.fillStyle = '#b91c1c'; ctx.fillRect(0, 126, 256, 26);
            ctx.fillStyle = '#fef08a'; ctx.font = 'bold 12px sans-serif';
            const ticker = 'BREAKING NEWS: SUNNY SKIES TODAY • COZY TEA TIME • NEIGHBORHOOD BAKERY WINS GOLD •   ';
            const tx = 256 - ((elapsed * 58) % 620);
            ctx.fillText(ticker, tx, 143);
          }
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

  function addIndoorPlant(worldGroup, x, z, potHex, tall) {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.21, 0.46, 10), LS.makeToonMat(potHex || 0xc66b47));
    pot.position.set(x, 0.23, z); pot.castShadow = true; worldGroup.add(pot);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.30, 0.04, 7, 12), LS.makeToonMat(potHex || 0xc66b47));
    rim.rotation.x = Math.PI / 2; rim.position.set(x, 0.45, z); worldGroup.add(rim);
    if (tall) {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.72, 7), LS.makeToonMat(0x6e472b));
      stem.position.set(x, 0.76, z); worldGroup.add(stem);
    }
    const baseY = tall ? 1.18 : 0.72;
    const leafMat = LS.makeToonMat(0x3f8f47);
    [[0, 0, 0, 0.38], [0.20, 0.24, 0.12, 0.27], [-0.20, 0.20, -0.1, 0.27], [0.04, 0.42, -0.06, 0.24]].forEach(b => {
      const m = new THREE.Mesh(new THREE.DodecahedronGeometry(b[3], 1), leafMat);
      m.position.set(x + b[0], baseY + b[1], z + b[2]); worldGroup.add(m);
    });
  }

  // =========================================================================
  // DESTINATION 1: EATERY RESTAURANT (dest_eatery) — HIGH-DETAIL GHIBLI BISTRO
  // Checkered terracotta floor, warm brick accent wall, Edison string lights,
  // glass pastry display case, chalk menu board, simmering Molokhia steam!
  // =========================================================================
  function buildEatery(worldGroup) {
    const W = {
      id: 'dest_eatery',
      isInterior: true,
      colliders: [],
      zones: [],
      hiddenAnimals: [],
      potSteams: [],
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

    const tileTex = createCheckerTileTexture('#f5e5cc', '#e3c49d', 7, 6);
    const { trimMat } = buildRoomShell(worldGroup, 18, 14, 4.5, 0xdfb98a, '#fbf0dd', 0x7c4e2e, tileTex);

    // Warm Terracotta Brick Accent Wall behind Open Kitchen Pass!
    const brickWall = new THREE.Mesh(new THREE.BoxGeometry(11.6, 3.5, 0.12), LS.makeToonMat(0xb85842));
    brickWall.position.set(0, 2.55, -6.82); worldGroup.add(brickWall);
    // Sunlit Curtained Side Windows on West & East walls!
    addDetailedWallWindow(worldGroup, -8.82, 2.35, -1.0, Math.PI / 2, 2.8, 1.75, 0xe8c59e, trimMat);
    addDetailedWallWindow(worldGroup, 8.82, 2.35, -1.0, -Math.PI / 2, 2.8, 1.75, 0xe8c59e, trimMat);

    // Eatery Signboard + Side Chalkboard Menu + Spice & Olive Oil Wall Shelves!
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(7.6, 1.05, 0.16),
      new THREE.MeshBasicMaterial({
        map: LS.createSignTexture('🍲 EATERY • MOLOKHIA, CHICKEN, RICE & PASTA 🍝', {
          bg: '#fff8ec', border: '#c97b36', color: '#4a2b14', font: 'bold 22px sans-serif', width: 640, height: 110
        })
      })
    );
    sign.position.set(0, 3.65, -6.72); worldGroup.add(sign);

    const chalkMenu = new THREE.Mesh(
      new THREE.BoxGeometry(2.3, 1.45, 0.12),
      new THREE.MeshBasicMaterial({
        map: LS.createSignTexture('🍲 SPECIALS: MOLOKHIA & PASTA!', {
          bg: '#23312d', border: '#d9a45b', color: '#fff8e7', font: 'bold 24px sans-serif', width: 320, height: 220
        })
      })
    );
    chalkMenu.position.set(-7.1, 2.45, -6.80); worldGroup.add(chalkMenu);

    // Open Kitchen Pass Counter + Glass Pastry Display Case + Copper Molokhia Pot with Steam!
    const counter = new THREE.Mesh(new THREE.BoxGeometry(10.8, 1.05, 1.35), LS.makeToonMat(0x8c5630));
    counter.position.set(0, 0.52, -5.7); counter.castShadow = true; worldGroup.add(counter);
    const cTop = new THREE.Mesh(new THREE.BoxGeometry(11.0, 0.12, 1.48), LS.makeToonMat(0xede0cc));
    cTop.position.set(0, 1.08, -5.7); worldGroup.add(cTop);
    // Glass dessert/bread display case on right of counter
    const pCase = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.75, 0.95), LS.makeToonMat(0xebf8ff, { transparent: true, opacity: 0.42 }));
    pCase.position.set(3.8, 1.50, -5.7); worldGroup.add(pCase);
    [3.2, 3.8, 4.4].forEach((px, pi) => {
      const loaf = new THREE.Mesh(new THREE.SphereGeometry(0.20, 8, 6), LS.makeToonMat(pi === 1 ? 0xe9a954 : 0xd48b47));
      loaf.scale.set(1.2, 0.65, 0.9); loaf.position.set(px, 1.28, -5.7); worldGroup.add(loaf);
    });
    // Copper Molokhia Pot + Animated Rising Steam!
    const pot1 = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.30, 0.34, 14), LS.makeToonMat(0xc86d28));
    pot1.position.set(-2.6, 1.30, -5.7); worldGroup.add(pot1);
    const mTop = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.30, 0.04, 14), LS.makeToonMat(0x2d7a36));
    mTop.position.set(-2.6, 1.47, -5.7); worldGroup.add(mTop);
    for (let i = 0; i < 3; i++) {
      const st = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), LS.makeToonMat(0xffffff, { transparent: true, opacity: 0.45 }));
      st.userData = { bx: -2.6, by: 1.56, bz: -5.7, phase: i * 0.33 };
      worldGroup.add(st); W.potSteams.push(st);
    }
    const pot2 = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.26, 0.28, 12), LS.makeToonMat(0xd9a773));
    pot2.position.set(-1.5, 1.28, -5.7); worldGroup.add(pot2);
    addCol(0, -5.7, 5.5, 0.9);

    // Warm Edison Fairy String Lights & Pendant Lamps!
    addHangingStringLights(worldGroup, -7.8, -3.5, 7.8, -3.5, 3.85, 9, 0xffd57a);
    addHangingStringLights(worldGroup, -7.8, 1.8, 7.8, 1.8, 3.85, 9, 0xffd57a);
    [-4.8, 0, 4.8].forEach(lx => {
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 5), trimMat);
      cord.position.set(lx, 4.05, -1.0); worldGroup.add(cord);
      const shade = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.34, 12), LS.makeToonMat(0xe07a5f));
      shade.position.set(lx, 3.55, -1.0); worldGroup.add(shade);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), LS.makeEmissiveMat(0xfff5d6, 0xffd166, 0.92));
      bulb.position.set(lx, 3.38, -1.0); worldGroup.add(bulb);
    });

    // Woven Center Carpet under Main Family Table!
    if (LS.createWovenRugTexture) {
      const rug = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 3.6), LS.makeSurfaceMat(LS.createWovenRugTexture('#fae8d0', '#2d7a36', '#e9c46a')));
      rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.015, -1.0); worldGroup.add(rug);
    }

    // Detailed Dining Tables with Bread Baskets, Water Carafes, Candles & Upholstered Chairs!
    function addDiningTable(tx, tz, featured) {
      const tg = new THREE.Group();
      tg.position.set(tx, 0, tz);
      const top = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.12, 1.5), LS.makeToonMat(0xfff8ec));
      top.position.y = 0.80; top.castShadow = true; tg.add(top);
      const run = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.13, 1.54), LS.makeToonMat(featured ? 0x2d7a36 : 0xc97b36));
      run.position.y = 0.805; tg.add(run);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.24, 0.78, 10), trimMat);
      leg.position.y = 0.39; tg.add(leg);
      const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.18, 8), LS.makeEmissiveMat(0xfff4d0, 0xffcc66, 0.9));
      candle.position.set(0, 0.94, 0); tg.add(candle);
      // Warm pita bread basket & water carafe
      const bsk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.10, 10), LS.makeToonMat(0xc48b57));
      bsk.position.set(0, 0.90, -0.42); tg.add(bsk);
      const car = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.24, 8), LS.makeToonMat(0xb8e6ff));
      car.position.set(0, 0.97, 0.42); tg.add(car);
      [-1.22, 1.22].forEach(cx => {
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.48, 0.56), trimMat);
        seat.position.set(cx, 0.24, 0); tg.add(seat);
        const cush = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.07, 0.50), LS.makeToonMat(0xe07a5f));
        cush.position.set(cx, 0.51, 0); tg.add(cush);
        const back = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.58, 0.54), trimMat);
        back.position.set(cx + (cx < 0 ? -0.25 : 0.25), 0.70, 0); tg.add(back);
      });
      worldGroup.add(tg);
      addCol(tx, tz, 1.28, 0.88);
    }
    addDiningTable(0, -1.0, true);
    addDiningTable(-5.6, 0.8, false);
    addDiningTable(5.6, 0.8, false);

    addIndoorPlant(worldGroup, -7.8, -5.8, 0xc66b47, true);
    addIndoorPlant(worldGroup, 7.8, -5.8, 0xc66b47, true);
    addIndoorPlant(worldGroup, -7.8, 5.6, 0x2a9d8f, false);
    addIndoorPlant(worldGroup, 7.8, 5.6, 0x2a9d8f, false);

    LS.spawnWorldNPCs(worldGroup, [{
      name: 'Chef Karim (Eatery)',
      line: 'Ahlan Laila & Salma! Fresh green Molokhia with rice & chicken, or creamy pasta today? 🍲🍝',
      pos: new THREE.Vector3(0, 0, -4.4),
      baseRot: 0,
      waveOnNear: true,
      char: { scale: 0.96, skinColor: 0xd9a27e, hairColor: 0x1f1916, topColor: 0xffffff, bottomColor: 0x2b2d42, pants: true, faceOpts: { mustache: true } }
    }]);

    W.zones.push({ id: 'eatery_order', label: 'Order at Eatery (Molokhia, Rice & Chicken or Pasta) 🍲🍝', pos: new THREE.Vector3(0, 0, 1.1), radius: 2.8 });
    W.zones.push({ id: 'home_qashqai', label: 'Hop in Gray Nissan Qashqai (Drive Home or Elsewhere) 🚙', pos: new THREE.Vector3(0, 0, 5.7), radius: 2.3 });

    W.update = (dt, elapsed) => {
      W.potSteams.forEach(st => {
        const t = (elapsed * 0.55 + st.userData.phase) % 1.0;
        st.position.set(st.userData.bx + Math.sin(elapsed * 2 + st.userData.phase * 5) * 0.1, st.userData.by + t * 0.65, st.userData.bz);
        st.scale.setScalar(0.65 + t * 1.1);
        st.material.opacity = (1 - t) * 0.44;
      });
    };
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
  // DESTINATION 2: YIWAN RESTAURANT (dest_yiwan) — HIGH-DETAIL ASIAN PAVILION
  // Shoji lattice screens, blossom scroll mural, curved eave dumpling bar with
  // rising steam, swaying tasseled lanterns, moon-gate bamboo Zen corner!
  // =========================================================================
  function buildYiwan(worldGroup) {
    const W = {
      id: 'dest_yiwan',
      isInterior: true,
      colliders: [],
      zones: [],
      hiddenAnimals: [],
      lanterns: [],
      steams: [],
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

    // Decorative Wood Lattice Screens on West & East Walls + Golden Blossom Scroll Mural!
    const latMat = LS.makeSurfaceMat(LS.createWoodLatticeTexture());
    [[-8.78, Math.PI / 2], [8.78, -Math.PI / 2]].forEach(w => {
      const sc = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.5, 0.12), latMat);
      sc.position.set(w[0], 2.4, -0.8); sc.rotation.y = w[1]; worldGroup.add(sc);
    });
    const scrollMural = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 1.5, 0.10),
      new THREE.MeshBasicMaterial({
        map: LS.createSignTexture('🌸 🥢 YIWAN KITCHEN 🐉 🌸', {
          bg: '#fff3d6', border: '#9e2a2b', color: '#7c1d22', font: 'bold 26px sans-serif', width: 420, height: 180
        })
      })
    );
    scrollMural.position.set(0, 2.42, -6.82); worldGroup.add(scrollMural);

    // Rich Red & Gold Yiwan Restaurant Signboard + Curved Pavilion Roof Eave above Bar!
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(7.6, 1.05, 0.16),
      new THREE.MeshBasicMaterial({
        map: LS.createSignTexture('🥟 YIWAN • DUMPLINGS, SWEET & SOUR & RICE 🏮', {
          bg: '#7c1d22', border: '#e9c46a', color: '#fff8e7', font: 'bold 22px sans-serif', width: 640, height: 110
        })
      })
    );
    sign.position.set(0, 3.68, -6.74); worldGroup.add(sign);

    const eave = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.18, 1.45), LS.makeToonMat(0x7c1d22));
    eave.position.set(0, 3.05, -6.15); eave.rotation.x = 0.24; worldGroup.add(eave);

    // Tasseled Swaying Red & Gold Silk Lanterns!
    [[-5.2, -2.5], [0, -2.5], [5.2, -2.5], [-4.8, 2.4], [4.8, 2.4]].forEach((lp, i) => {
      const lg = new THREE.Group();
      lg.position.set(lp[0], 3.55, lp[1]);
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 10), LS.makeEmissiveMat(0xd62828, 0xff6b35, 0.76));
      body.scale.set(1.0, 1.18, 1.0); lg.add(body);
      const capT = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 10), LS.makeToonMat(0xe9c46a));
      capT.position.y = 0.44; lg.add(capT);
      const capB = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.08, 10), LS.makeToonMat(0xe9c46a));
      capB.position.y = -0.44; lg.add(capB);
      const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.06, 0.34, 6), LS.makeToonMat(0xe9c46a));
      tassel.position.y = -0.64; lg.add(tassel);
      if (LS.createGlowSprite) lg.add(LS.createGlowSprite(0xff9f68, 1.75));
      lg.userData.phase = i * 1.1;
      worldGroup.add(lg);
      W.lanterns.push(lg);
    });

    // Dumpling Steamer Bar Counter + Animated Rising Steamer Wisps!
    const bar = new THREE.Mesh(new THREE.BoxGeometry(10.8, 1.05, 1.35), LS.makeToonMat(0x6b2024));
    bar.position.set(0, 0.52, -5.7); bar.castShadow = true; worldGroup.add(bar);
    const bTop = new THREE.Mesh(new THREE.BoxGeometry(11.0, 0.12, 1.48), LS.makeToonMat(0xd9a773));
    bTop.position.set(0, 1.08, -5.7); worldGroup.add(bTop);
    [-3.4, -2.5, 2.5, 3.4].forEach((bx, bi) => {
      const tiers = bi % 2 === 0 ? 3 : 2;
      for (let tier = 0; tier < tiers; tier++) {
        const st = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.14, 14), LS.makeToonMat(0xd9ad6c));
        st.position.set(bx, 1.21 + tier * 0.15, -5.7); worldGroup.add(st);
      }
      if (bi === 0 || bi === 3) {
        const wisp = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), LS.makeToonMat(0xffffff, { transparent: true, opacity: 0.45 }));
        wisp.userData = { bx: bx, by: 1.25 + tiers * 0.15, bz: -5.7, phase: bi * 0.4 };
        worldGroup.add(wisp); W.steams.push(wisp);
      }
    });
    addCol(0, -5.7, 5.5, 0.9);

    // Ornate Red & Gold Carpet under Main Round Banquet Table!
    if (LS.createWovenRugTexture) {
      const rug = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 4.4), LS.makeSurfaceMat(LS.createWovenRugTexture('#f5d7c4', '#9e2a2b', '#e9c46a')));
      rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.015, -1.0); worldGroup.add(rug);
    }

    const woodDark = LS.makeToonMat(0x5c231c);
    const goldMat = LS.makeToonMat(0xe9c46a);
    function addYiwanTable(tx, tz, main) {
      const tg = new THREE.Group();
      tg.position.set(tx, 0, tz);
      const top = new THREE.Mesh(new THREE.CylinderGeometry(main ? 1.24 : 0.98, main ? 1.24 : 0.98, 0.10, 22), woodDark);
      top.position.y = 0.80; top.castShadow = true; tg.add(top);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(main ? 1.24 : 0.98, 0.03, 7, 24), goldMat);
      rim.rotation.x = Math.PI / 2; rim.position.y = 0.82; tg.add(rim);
      const lazy = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.04, 18), LS.makeToonMat(0x9e2a2b));
      lazy.position.y = 0.87; tg.add(lazy);
      const teapot = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), goldMat);
      teapot.position.y = 1.02; tg.add(teapot);
      [-0.36, 0.36].forEach(cx => {
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.08, 8), LS.makeToonMat(0xfffaf0));
        cup.position.set(cx, 0.92, 0.25); tg.add(cup);
      });
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.36, 0.78, 12), woodDark);
      ped.position.y = 0.39; tg.add(ped);
      [-1.24, 1.24].forEach(cx => {
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.48, 0.54), LS.makeToonMat(0x9e2a2b));
        seat.position.set(cx, 0.24, 0); tg.add(seat);
        const back = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.58, 0.52), woodDark);
        back.position.set(cx + (cx < 0 ? -0.24 : 0.24), 0.70, 0); tg.add(back);
      });
      worldGroup.add(tg);
      addCol(tx, tz, 1.3, 1.2);
    }
    addYiwanTable(0, -1.0, true);
    addYiwanTable(-5.6, 0.6, false);
    addYiwanTable(5.6, 0.6, false);

    // Tall Bamboo Urns + Circular Moon-Gate Arch Decorative Accent in corners!
    [-7.8, 7.8].forEach(bx => {
      const urn = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.24, 0.58, 12), LS.makeToonMat(0x9e2a2b));
      urn.position.set(bx, 0.29, -5.8); worldGroup.add(urn);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.03, 6, 14), goldMat);
      ring.rotation.x = Math.PI / 2; ring.position.set(bx, 0.56, -5.8); worldGroup.add(ring);
      [-0.12, 0, 0.12].forEach((ox, oi) => {
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 2.9 + oi * 0.3, 7), LS.makeToonMat(0x4b9349));
        stalk.position.set(bx + ox, 1.85, -5.8 + (oi - 1) * 0.08); worldGroup.add(stalk);
        const leaf = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 0), LS.makeToonMat(0x52a850));
        leaf.position.set(bx + ox, 3.1 + oi * 0.2, -5.8); worldGroup.add(leaf);
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

    W.zones.push({ id: 'yiwan_order', label: 'Order at Yiwan (Dumplings, Sweet & Sour, Rice or Combo!) 🥟🍗', pos: new THREE.Vector3(0, 0, 1.2), radius: 2.8 });
    W.zones.push({ id: 'home_qashqai', label: 'Hop in Gray Nissan Qashqai (Drive Home or Elsewhere) 🚙', pos: new THREE.Vector3(0, 0, 5.7), radius: 2.3 });

    W.update = (dt, elapsed) => {
      W.lanterns.forEach(l => { l.rotation.z = Math.sin(elapsed * 1.4 + l.userData.phase) * 0.06; });
      W.steams.forEach(st => {
        const t = (elapsed * 0.55 + st.userData.phase) % 1.0;
        st.position.set(st.userData.bx + Math.sin(elapsed * 2 + st.userData.phase * 5) * 0.09, st.userData.by + t * 0.65, st.userData.bz);
        st.scale.setScalar(0.65 + t * 1.05);
        st.material.opacity = (1 - t) * 0.44;
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
  // DESTINATION 3: COSMO CITY ARCADE (dest_cosmo_city) — HIGH-DETAIL ARCADE!
  // Galaxy carpet, neon wall strips, animated CRT screens, glass 3D claw machine
  // with moving crane & plushies, animated air hockey puck & glass prize showcase!
  // =========================================================================
  function buildCosmoCity(worldGroup) {
    const W = {
      id: 'dest_cosmo_city',
      isInterior: true,
      colliders: [],
      zones: [],
      hiddenAnimals: [],
      neonStars: [],
      clawHook: null,
      hockeyPuck: null
    };
    const addCol = (x, z, hw, hd) => W.colliders.push({ minX: x - hw, maxX: x + hw, minZ: z - hd, maxZ: z + hd });
    W.getGroundHeight = () => 0;

    // Galaxy Star-Patterned Arcade Carpet Floor!
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 16), LS.makeSurfaceMat(createGalaxyCarpetTexture()));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; worldGroup.add(floor);

    const tileCols = [0xff5d8f, 0x38bdf8, 0xffd166, 0xa855f7];
    const wallMat = LS.makeToonMat(0x2d275c);
    [[0, -8, 20.3, 4.6, 0.3], [0, 8, 20.3, 4.6, 0.3], [-10, 0, 0.3, 4.6, 16.3], [10, 0, 0.3, 4.6, 16.3]].forEach(b => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(b[2], b[3], b[4]), wallMat);
      m.position.set(b[0], b[3] / 2, b[1]); worldGroup.add(m);
    });
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(20, 16), LS.makeToonMat(0x181538));
    ceil.rotation.x = Math.PI / 2; ceil.position.y = 4.55; worldGroup.add(ceil);

    // Glowing Neon Trim Strips around the Arcade Walls!
    const cyanNeon = LS.makeEmissiveMat(0x38bdf8, 0x38bdf8, 0.92);
    const pinkNeon = LS.makeEmissiveMat(0xf472b6, 0xf472b6, 0.92);
    [[0, 3.1, -7.82, 19.6, 0.08, 0.08, cyanNeon], [0, 0.25, -7.82, 19.6, 0.08, 0.08, pinkNeon],
     [-9.82, 3.1, 0, 0.08, 0.08, 15.6, pinkNeon], [9.82, 3.1, 0, 0.08, 0.08, 15.6, cyanNeon]].forEach(n => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(n[3], n[4], n[5]), n[6]);
      bar.position.set(n[0], n[1], n[2]); worldGroup.add(bar);
    });

    // Glowing COSMO CITY Signboard + Retro Game Wall Posters!
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(8.6, 1.18, 0.16),
      new THREE.MeshBasicMaterial({
        map: LS.createSignTexture('🚀 COSMO CITY FAMILY ARCADE 🕹️✨', {
          bg: '#1e1b4b', border: '#38bdf8', color: '#fde047', font: 'bold 28px sans-serif', width: 640, height: 110
        })
      })
    );
    sign.position.set(0, 3.85, -7.75); worldGroup.add(sign);

    // Floating Orbiting Ringed Planets under the Ceiling!
    [[-5.5, 3.65, -2.0, 0x38bdf8], [0, 3.8, 0.8, 0xffd166], [5.5, 3.65, -2.0, 0xff5d8f]].forEach((sp, i) => {
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.44, 14, 10), LS.makeEmissiveMat(sp[3], sp[3], 0.78));
      orb.position.set(sp[0], sp[1], sp[2]); worldGroup.add(orb);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.045, 6, 22), LS.makeEmissiveMat(0xffffff, sp[3], 0.68));
      ring.rotation.x = Math.PI / 2 - 0.3; ring.position.copy(orb.position); worldGroup.add(ring);
      if (LS.createGlowSprite) {
        const h = LS.createGlowSprite(sp[3], 1.75);
        h.position.copy(orb.position); worldGroup.add(h);
      }
      orb.userData = { baseY: sp[1], phase: i * 1.4, ring: ring };
      W.neonStars.push(orb);
    });

    // Detailed Arcade Cabinet Builder (with coin slots, speaker grille, pixel art screen & neon trim!)
    function addArcadeCabinet(x, z, rotY, bodyHex, screenText, labelText) {
      const g = new THREE.Group();
      g.position.set(x, 0, z); g.rotation.y = rotY;
      const cab = new THREE.Mesh(new THREE.BoxGeometry(1.62, 2.42, 1.18), LS.makeToonMat(bodyHex));
      cab.position.y = 1.21; cab.castShadow = true; g.add(cab);
      const deck = new THREE.Mesh(new THREE.BoxGeometry(1.66, 0.16, 0.58), LS.makeToonMat(0x1e293b));
      deck.position.set(0, 1.05, 0.74); g.add(deck);
      // Glowing Coin Slot!
      const coinSlot = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.24, 0.08), LS.makeEmissiveMat(0xf59e0b, 0xf59e0b, 0.7));
      coinSlot.position.set(0, 0.58, 0.60); g.add(coinSlot);
      // Joystick & glowing buttons
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 6), LS.makeToonMat(0xdbe4ee));
      stick.position.set(-0.38, 1.22, 0.78); g.add(stick);
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.068, 8, 6), LS.makeToonMat(0xff595e));
      knob.position.set(-0.38, 1.32, 0.78); g.add(knob);
      [0.12, 0.30, 0.48].forEach((bx, bi) => {
        const bt = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.05, 8), LS.makeEmissiveMat(tileCols[bi], tileCols[bi], 0.85));
        bt.position.set(bx, 1.15, 0.78); g.add(bt);
      });
      const scr = new THREE.Mesh(
        new THREE.BoxGeometry(1.32, 0.94, 0.08),
        new THREE.MeshBasicMaterial({
          map: LS.createSignTexture(screenText, { bg: '#0b1026', border: '#38bdf8', color: '#fde047', font: 'bold 28px sans-serif', width: 256, height: 180 })
        })
      );
      scr.position.set(0, 1.64, 0.60); scr.rotation.x = -0.10; g.add(scr);
      const marq = new THREE.Mesh(
        new THREE.BoxGeometry(1.56, 0.38, 0.12),
        new THREE.MeshBasicMaterial({
          map: LS.createSignTexture(labelText, { bg: '#0f172a', border: '#fde047', color: '#ffffff', font: 'bold 26px sans-serif', width: 320, height: 80 })
        })
      );
      marq.position.set(0, 2.28, 0.62); g.add(marq);
      worldGroup.add(g);
      addCol(x, z, 0.98, 0.88);
    }

    // Station 1 & 2: Space Meteor Catcher & Cosmo Color Memory Cabinets
    addArcadeCabinet(-5.4, -5.8, 0, 0x2563eb, '☄️ ⭐ 🚀', '🛸 METEOR CATCH');
    addArcadeCabinet(0, -5.8, 0, 0x9333ea, '🌸 💎 ⭐ 🍀', '🎨 COSMO MEMORY');

    // Station 3: TRUE 3D GLASS CLAW MACHINE filled with colorful Plushies & Moving Internal Crane!
    const clawG = new THREE.Group();
    clawG.position.set(5.4, 0, -5.8);
    const cBase = new THREE.Mesh(new THREE.BoxGeometry(1.75, 1.05, 1.35), LS.makeToonMat(0xec4899));
    cBase.position.y = 0.52; cBase.castShadow = true; clawG.add(cBase);
    const cGlass = new THREE.Mesh(new THREE.BoxGeometry(1.65, 1.25, 1.25), LS.makeToonMat(0xe0f2fe, { transparent: true, opacity: 0.34 }));
    cGlass.position.y = 1.66; clawG.add(cGlass);
    const cTop = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.38, 1.38), LS.makeToonMat(0xdb2777));
    cTop.position.y = 2.42; clawG.add(cTop);
    const cMarq = new THREE.Mesh(
      new THREE.BoxGeometry(1.66, 0.32, 0.10),
      new THREE.MeshBasicMaterial({ map: LS.createSignTexture('🧸 CLAW GRABBER', { bg: '#0f172a', border: '#fde047', color: '#fff', font: 'bold 24px sans-serif', width: 300, height: 70 }) })
    );
    cMarq.position.set(0, 2.42, 0.72); clawG.add(cMarq);
    // Pile of miniature plushies inside the glass claw box!
    [[-0.4, -0.2, 0xffd166], [0.0, 0.1, 0xff8fab], [0.42, -0.15, 0x38bdf8], [-0.25, 0.25, 0xa855f7], [0.25, 0.22, 0x34d399]].forEach(pl => {
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.19, 8, 7), LS.makeToonMat(pl[2]));
      p.position.set(pl[0], 1.22, pl[1]); clawG.add(p);
    });
    // Animated swinging 3D crane hook inside the glass box!
    const cHook = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.28, 6), LS.makeToonMat(0xfde047));
    cHook.rotation.x = Math.PI; cHook.position.set(0, 1.98, 0); clawG.add(cHook);
    W.clawHook = cHook;
    worldGroup.add(clawG);
    addCol(5.4, -5.8, 1.0, 0.88);

    // Extra side decorative arcade cabinets along West Wall!
    addArcadeCabinet(-8.6, -1.6, Math.PI / 2, 0x0ea5e9, '🏎️ TURBO', '🏎️ STAR RACER');
    addArcadeCabinet(-8.6, 2.0, Math.PI / 2, 0xf59e0b, '🏀 HOOPS!', '🏀 COSMO DUNK');

    // Detailed Glowing Air Hockey Table with Score Arch & Sliding Puck!
    const ah = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.86, 1.6), LS.makeToonMat(0x1e293b));
    ah.position.set(-3.6, 0.43, 1.6); ah.castShadow = true; worldGroup.add(ah);
    const ahTop = new THREE.Mesh(new THREE.BoxGeometry(2.75, 0.06, 1.38), LS.makeEmissiveMat(0xe0f2fe, 0x38bdf8, 0.48));
    ahTop.position.set(-3.6, 0.88, 1.6); worldGroup.add(ahTop);
    const ahArch = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.06, 7, 16, Math.PI), pinkNeon);
    ahArch.rotation.y = Math.PI / 2; ahArch.position.set(-3.6, 0.90, 1.6); worldGroup.add(ahArch);
    const puck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.04, 10), LS.makeEmissiveMat(0xff595e, 0xff595e, 0.8));
    puck.position.set(-3.6, 0.94, 1.6); worldGroup.add(puck);
    W.hockeyPuck = puck;
    addCol(-3.6, 1.6, 1.6, 0.95);

    // Illuminated Glass Prize Showcase Counter packed with prizes on East Wall!
    const prizeDesk = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.95, 5.2), LS.makeToonMat(0x4c1d95));
    prizeDesk.position.set(8.2, 0.48, 0.6); worldGroup.add(prizeDesk);
    const prizeGlass = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.85, 5.0), LS.makeToonMat(0xe0f2fe, { transparent: true, opacity: 0.32 }));
    prizeGlass.position.set(8.2, 1.38, 0.6); worldGroup.add(prizeGlass);
    [-1.6, -0.8, 0, 0.8, 1.6].forEach((pz, pi) => {
      const plush = new THREE.Mesh(new THREE.SphereGeometry(0.24, 9, 8), LS.makeToonMat(tileCols[pi % 4]));
      plush.position.set(8.2, 1.24, 0.6 + pz); worldGroup.add(plush);
    });
    addCol(8.2, 0.6, 0.9, 2.7);

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
      if (W.clawHook) {
        W.clawHook.position.x = Math.sin(elapsed * 1.6) * 0.55;
        W.clawHook.position.y = 1.96 + Math.sin(elapsed * 3.2) * 0.08;
      }
      if (W.hockeyPuck) {
        W.hockeyPuck.position.x = -3.6 + Math.sin(elapsed * 2.8) * 1.05;
        W.hockeyPuck.position.z = 1.6 + Math.cos(elapsed * 3.9) * 0.48;
      }
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
  // Patterned Persian rug, sunlit lace-curtain windows, family portrait gallery,
  // chandelier, china cabinet, Nano watching TV & Gedo sipping steaming mint tea!
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

    // Rich Patterned Oriental / Persian Living Room Carpet!
    const rugMat = LS.createWovenRugTexture
      ? LS.makeSurfaceMat(LS.createWovenRugTexture('#f2dec8', '#a64438', '#d4a359'))
      : LS.makeToonMat(0xe8c5b0);
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(11.4, 8.2), rugMat);
    rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.016, -0.6); worldGroup.add(rug);

    // Big Sunlit Curtained Windows right next to Gedo's Tea Corner (North & East walls!)
    addDetailedWallWindow(worldGroup, 5.2, 2.45, -6.80, 0, 3.2, 2.0, 0xf7d8c4, trimMat);
    addDetailedWallWindow(worldGroup, 8.80, 2.45, -4.4, -Math.PI / 2, 2.6, 1.8, 0xf7d8c4, trimMat);
    // Warm slanted golden sunbeam streaming through Gedo's window (0 extra WebGL lights!)
    const gBeam = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 3.8),
      new THREE.MeshBasicMaterial({ color: 0xffe6a3, transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false })
    );
    gBeam.position.set(5.2, 1.25, -5.15);
    gBeam.rotation.x = -Math.PI / 3.1;
    worldGroup.add(gBeam);

    // Warm Hanging Brass Chandelier in Center!
    const chanG = new THREE.Group();
    chanG.position.set(0, 3.65, -1.0);
    const brass = LS.makeToonMat(0xd4a359);
    const cStem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.85, 8), brass);
    cStem.position.y = 0.42; chanG.add(cStem);
    const cRing = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.045, 7, 20), brass);
    cRing.rotation.x = Math.PI / 2; chanG.add(cRing);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const gOrb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), LS.makeEmissiveMat(0xfff7dc, 0xffd57a, 0.92));
      gOrb.position.set(Math.cos(a) * 0.75, 0.14, Math.sin(a) * 0.75); chanG.add(gOrb);
    }
    if (LS.createGlowSprite) chanG.add(LS.createGlowSprite(0xffe094, 2.0));
    worldGroup.add(chanG);

    // Welcome Sign + Golden Family Portrait Gallery Wall!
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(5.6, 0.88, 0.12),
      new THREE.MeshBasicMaterial({
        map: LS.createSignTexture("💛 NANO & GEDO'S COZY HOME 🫖📺", {
          bg: '#fff9ef', border: '#2a9d8f', color: '#2b3a34', font: 'bold 23px sans-serif', width: 560, height: 100
        })
      })
    );
    sign.position.set(-0.6, 3.65, -6.82); worldGroup.add(sign);

    // Golden Family Photo Frames on Back Wall
    [[-1.2, '#ffeef4', '👧🧒'], [0.0, '#eef7f2', '👵👴']].forEach(ph => {
      const fr = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.05, 0.08), brass);
      fr.position.set(ph[0], 2.25, -6.82); worldGroup.add(fr);
      const pic = new THREE.Mesh(
        new THREE.BoxGeometry(0.76, 0.88, 0.10),
        new THREE.MeshBasicMaterial({ map: LS.createSignTexture(ph[2], { bg: ph[1], border: '#d4a359', color: '#333', font: 'bold 46px sans-serif', width: 160, height: 180 }) })
      );
      pic.position.set(ph[0], 2.25, -6.82); worldGroup.add(pic);
    });

    // Large Animated 3D TV on West Wall — Nano watches her Soap Opera (and sometimes the News!)
    W.tvObj = createAnimatedTV(worldGroup, -8.15, 0, -2.6, Math.PI / 2, 'nano_tv');
    addCol(-8.15, -2.6, 0.85, 1.5);

    // Nano's Anatomically Proportioned Cozy Rose Sofa (clean side-profile facing West toward TV!)
    const nanoSofaPos = { x: -3.0, z: -2.6, rotY: -Math.PI / 2 };
    const sofaMat = LS.makeToonMat(0xd88c9a);
    const sofaCushMat = LS.makeToonMat(0xe6a1ae);
    const nanoSofaG = new THREE.Group();
    nanoSofaG.position.set(nanoSofaPos.x, 0, nanoSofaPos.z);
    nanoSofaG.rotation.y = nanoSofaPos.rotY;
    const sBase = new THREE.Mesh(new THREE.BoxGeometry(2.85, 0.24, 0.66), sofaMat);
    sBase.position.set(0, 0.20, -0.02); sBase.castShadow = true; nanoSofaG.add(sBase);
    const sCush = new THREE.Mesh(new THREE.BoxGeometry(2.50, 0.12, 0.48), sofaCushMat);
    sCush.position.set(0, 0.33, 0.05); nanoSofaG.add(sCush);
    const sBack = new THREE.Mesh(new THREE.BoxGeometry(2.85, 0.74, 0.22), sofaMat);
    sBack.position.set(0, 0.64, -0.26); sBack.castShadow = true; nanoSofaG.add(sBack);
    [-1.32, 1.32].forEach(ax => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.48, 0.68), sofaMat);
      arm.position.set(ax, 0.36, -0.02); nanoSofaG.add(arm);
    });
    [[-1.25, -0.25], [1.25, -0.25], [-1.25, 0.22], [1.25, 0.22]].forEach(lg => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.10, 6), trimMat);
      leg.position.set(lg[0], 0.05, lg[1]); nanoSofaG.add(leg);
    });
    const knit = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.28, 0.50), LS.makeToonMat(0xfff3c4));
    knit.position.set(-0.92, 0.42, 0.08); nanoSofaG.add(knit);
    const nPill = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.32, 0.18), LS.makeToonMat(0xf4a261));
    nPill.position.set(0.88, 0.56, -0.08); nPill.rotation.x = 0.22; nanoSofaG.add(nPill);
    worldGroup.add(nanoSofaG);
    addCol(nanoSofaPos.x, nanoSofaPos.z, 0.65, 1.55);

    // Coffee Table with Lace Runner, TV Remote & Flower Vase in front of Nano
    const cTabG = new THREE.Group();
    cTabG.position.set(-5.25, 0, -2.6);
    cTabG.rotation.y = nanoSofaPos.rotY;
    const cTabTop = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.08, 0.84), trimMat);
    cTabTop.position.y = 0.40; cTabG.add(cTabTop);
    [[-0.72, -0.32], [0.72, -0.32], [-0.72, 0.32], [0.72, 0.32]].forEach(lg => {
      const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.38, 0.06), trimMat);
      l.position.set(lg[0], 0.19, lg[1]); cTabG.add(l);
    });
    const lace = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.02, 0.54), LS.makeToonMat(0xfffdf8));
    lace.position.y = 0.45; cTabG.add(lace);
    const remote = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.09), LS.makeToonMat(0x2d3748));
    remote.position.set(-0.35, 0.47, 0.12); cTabG.add(remote);
    const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.24, 8), LS.makeToonMat(0x90e0ef));
    vase.position.set(0.36, 0.56, -0.05); cTabG.add(vase);
    const fl = new THREE.Mesh(new THREE.SphereGeometry(0.13, 7, 6), LS.makeToonMat(0xff8fab));
    fl.position.set(0.36, 0.74, -0.05); cTabG.add(fl);
    worldGroup.add(cTabG);
    addCol(-5.25, -2.6, 0.52, 0.92);

    // Gedo's Cozy Armchair RIGHT NEXT TO THE SUNLIT WINDOW + Reading Lamp + Mint Tea & Cookies!
    const gedoChairPos = { x: 5.3, z: -5.0, rotY: -0.45 };
    const chairMat = LS.makeToonMat(0x457b9d);
    const chairCushMat = LS.makeToonMat(0x5b94b8);
    const gedoChairG = new THREE.Group();
    gedoChairG.position.set(gedoChairPos.x, 0, gedoChairPos.z);
    gedoChairG.rotation.y = gedoChairPos.rotY;
    const gBase = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.24, 0.66), chairMat);
    gBase.position.set(0, 0.20, -0.02); gBase.castShadow = true; gedoChairG.add(gBase);
    const gCush = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.12, 0.46), chairCushMat);
    gCush.position.set(0, 0.33, 0.05); gedoChairG.add(gCush);
    const gBack = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.78, 0.22), chairMat);
    gBack.position.set(0, 0.66, -0.26); gBack.castShadow = true; gedoChairG.add(gBack);
    [-0.46, 0.46].forEach(ax => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.48, 0.66), chairMat);
      arm.position.set(ax, 0.36, -0.02); gedoChairG.add(arm);
    });
    [[-0.46, -0.25], [0.46, -0.25], [-0.46, 0.22], [0.46, 0.22]].forEach(lg => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.10, 6), trimMat);
      leg.position.set(lg[0], 0.05, lg[1]); gedoChairG.add(leg);
    });
    worldGroup.add(gedoChairG);
    const gLampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 1.85, 6), brass);
    gLampPole.position.set(6.75, 0.92, -5.55); worldGroup.add(gLampPole);
    const gLampShade = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.34, 10), LS.makeEmissiveMat(0xfff4d6, 0xffd57a, 0.7));
    gLampShade.position.set(6.75, 1.92, -5.55); worldGroup.add(gLampShade);
    addCol(gedoChairPos.x, gedoChairPos.z, 0.72, 0.72);

    // Round Tea Table beside Gedo's Window Armchair (Brass Tray, Teapot, Steaming Mint Tea & Kahk Cookies!)
    const tx = 3.85, tz = -3.65;
    const tTab = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.08, 18), trimMat);
    tTab.position.set(tx, 0.64, tz); worldGroup.add(tTab);
    const tLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.22, 0.62, 10), trimMat);
    tLeg.position.set(tx, 0.31, tz); worldGroup.add(tLeg);
    const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.43, 0.03, 16), brass);
    tray.position.set(tx, 0.70, tz); worldGroup.add(tray);
    const tPot = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), brass);
    tPot.position.set(tx - 0.16, 0.87, tz - 0.14); worldGroup.add(tPot);
    const teaGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.16, 10), LS.makeToonMat(0xd97706));
    teaGlass.position.set(tx + 0.18, 0.80, tz + 0.12); worldGroup.add(teaGlass);
    const cookiePlate = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.03, 10), LS.makeToonMat(0xfffdf8));
    cookiePlate.position.set(tx - 0.16, 0.73, tz + 0.22); worldGroup.add(cookiePlate);
    for (let k = 0; k < 3; k++) {
      const ck = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), LS.makeToonMat(0xf4d58d));
      ck.scale.set(1.1, 0.6, 1.1); ck.position.set(tx - 0.20 + k * 0.05, 0.77, tz + 0.22 + (k % 2 ? 0.04 : -0.04)); worldGroup.add(ck);
    }
    for (let i = 0; i < 2; i++) {
      const st = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6), LS.makeToonMat(0xffffff, { transparent: true, opacity: 0.48 }));
      st.userData = { baseX: tx + 0.18, baseY: 0.94, baseZ: tz + 0.12, phase: i * 0.5 };
      worldGroup.add(st); W.teaSteams.push(st);
    }
    addCol(tx, tz, 0.74, 0.74);

    // Glass-Front China Cabinet along East Wall + Indoor Ferns!
    const chinaG = new THREE.Group();
    chinaG.position.set(8.42, 0, 1.4);
    chinaG.rotation.y = -Math.PI / 2;
    const china = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.35, 0.62), trimMat);
    china.position.set(0, 1.18, 0); china.castShadow = true; chinaG.add(china);
    const cGlass = new THREE.Mesh(new THREE.BoxGeometry(2.65, 1.25, 0.66), LS.makeToonMat(0xebf8ff, { transparent: true, opacity: 0.36 }));
    cGlass.position.set(0, 1.65, 0); chinaG.add(cGlass);
    [-0.9, 0, 0.9].forEach((cx, ci) => {
      const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.22, 10), LS.makeToonMat(ci === 1 ? 0xd4a359 : 0xfff8ec));
      dish.position.set(cx, 1.38, 0.04); chinaG.add(dish);
    });
    worldGroup.add(chinaG);
    addCol(8.4, 1.4, 0.5, 1.55);
    addIndoorPlant(worldGroup, -7.8, 3.8, 0x2a9d8f, true);
    addIndoorPlant(worldGroup, 7.6, 4.8, 0xe07a5f, true);

    // Exact seated world coordinates aligned with backrest & cushion front edge!
    const seatLocalZ = -0.02;
    const nanoWorldX = nanoSofaPos.x + seatLocalZ * Math.sin(nanoSofaPos.rotY);
    const nanoWorldZ = nanoSofaPos.z + seatLocalZ * Math.cos(nanoSofaPos.rotY);
    const gedoWorldX = gedoChairPos.x + seatLocalZ * Math.sin(gedoChairPos.rotY);
    const gedoWorldZ = gedoChairPos.z + seatLocalZ * Math.cos(gedoChairPos.rotY);

    LS.spawnWorldNPCs(worldGroup, [
      {
        name: 'Nano (Grandma) 📺',
        line: "Habibati Laila & Salma! Come sit beside Nano — I'm watching my soap opera (and checking the news too)! 📺🎭🗞️",
        pos: new THREE.Vector3(nanoWorldX, 0.04, nanoWorldZ),
        baseRot: nanoSofaPos.rotY,
        seated: true,
        char: { scale: 0.90, skinColor: 0xe6b898, hairColor: 0xd8dce0, topColor: 0xe07a5f, bottomColor: 0x5c4b51, hairBun: true, faceOpts: { glasses: true, elder: true } }
      },
      {
        name: 'Gedo (Grandpa) ☕',
        line: 'Ahlan ya Laila & Salma! Gedo loves sitting right by this sunny window sipping warm mint tea — come chat! ☕🌿☀️',
        pos: new THREE.Vector3(gedoWorldX, 0.02, gedoWorldZ),
        baseRot: gedoChairPos.rotY,
        seated: true,
        char: { scale: 0.94, skinColor: 0xd9a480, hairColor: 0xd8dce0, topColor: 0x6b8f71, bottomColor: 0x3b4252, pants: true, faceOpts: { glasses: true, mustache: true, elder: true } }
      }
    ]);

    W.zones.push({ id: 'visit_nano_tv', label: 'Watch Soap Opera / News with Nano 📺🎭🗞️', pos: new THREE.Vector3(-2.4, 0, 0.8), radius: 2.8 });
    W.zones.push({ id: 'visit_gedo_tea', label: 'Drink Mint Tea by the Window with Gedo ☕☀️', pos: new THREE.Vector3(4.0, 0, -1.8), radius: 2.8 });
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
    W.getZoneLabel = (x) => (x < 0 ? "Nano's TV Living Room 📺🎭" : "Gedo's Sunny Window Tea Corner ☕☀️");
    W.drawMiniMap = (ctx, Wpx, Hpx, toX, toY) => {
      ctx.fillStyle = '#f5e4cf'; ctx.fillRect(0, 0, Wpx, Hpx);
      ctx.fillStyle = '#d88c9a'; ctx.fillRect(toX(-4.4), toY(-2.8), toX(-2.0) - toX(-4.4), toY(-0.4) - toY(-2.8));
      ctx.fillStyle = '#457b9d'; ctx.fillRect(toX(4.4), toY(-5.8), toX(6.2) - toX(4.4), toY(-4.2) - toY(-5.8));
      ctx.fillStyle = '#3d2c1e'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('NANO 📺', toX(-3.2), toY(-3.3));
      ctx.fillText('GEDO ☕☀️', toX(5.3), toY(-6.1));
      ctx.fillText('QASHQAI 🚙', toX(0), toY(5.6));
    };
    return W;
  }

  // =========================================================================
  // DESTINATION 5: MAI & MOSTAFA'S HOUSE ACROSS THE RIVER (dest_mai_mostafa)
  // HIGH-DETAIL SHOWCASE EDITION:
  // - Flower-lined riverbanks, lotus pads, swimming ducks, lantern bridge & butterflies!
  // - Full kitchen & steaming homemade lasagna behind Mai!
  // - Dr. Mostafa (dark-skinned, bald, white doctor's coat + stethoscope) watching TV
  //   under his framed medical diploma!
  // - Nouzi (5yo slim athletic girl) doing gymnastics with balance beam & trophy shelf!
  // - Bibo (4yo boy) zooming toy cars through a mini toy garage & alphabet blocks!
  // - Painted 4-player Board Game Table for Laila, Salma, Nouzi & Bibo!
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
      riverDucks: [],
      butterflies: [],
      lasagnaSteams: [],
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

    W.getGroundHeight = function (x, z) {
      if (Math.abs(x) < 3.0 && z > 5.8 && z < 12.2) {
        const u = (z - 5.8) / 6.4;
        return Math.sin(u * Math.PI) * 0.62;
      }
      return 0;
    };

    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(195, 24, 16),
      new THREE.MeshBasicMaterial({ map: LS.createSkyTexture(LS.state.timeMode, 'tokyo'), side: THREE.BackSide })
    );
    worldGroup.add(sky);
    W.skyMesh = sky;
    if (LS.hdAssets && LS.hdAssets.addMountainRange) LS.hdAssets.addMountainRange(worldGroup, 'tokyo');

    const meadow = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), LS.makeSurfaceMat(LS.createGrassTexture('tokyo')));
    meadow.rotation.x = -Math.PI / 2; meadow.receiveShadow = true; worldGroup.add(meadow);

    // Instanced wind-swept Ghibli grass along both riverbanks!
    if (LS.hdAssets && LS.hdAssets.addInstancedGrass) {
      LS.hdAssets.addInstancedGrass(worldGroup, { minX: -24, maxX: 24, minZ: -15, maxZ: 24 }, (x, z) => {
        if (z > 5.2 && z < 12.8) return false;
        if (Math.abs(x) < 12.2 && z < 2.6 && z > -14.8) return false;
        if (Math.abs(x) < 3.0 && z >= 2.2 && z <= 5.6) return false;
        if (Math.abs(x) < 7.5 && z > 12.0 && z < 23.0) return false;
        return true;
      }, 'home');
    }

    // SPARKLING TURQUOISE GHIBLI RIVER + Lily Pads, Lotus Blossoms & Swimming River Ducks!
    const riverBed = new THREE.Mesh(new THREE.PlaneGeometry(110, 7.6), LS.makeToonMat(0x2a7f8e));
    riverBed.rotation.x = -Math.PI / 2; riverBed.position.set(0, 0.02, 9.0); worldGroup.add(riverBed);
    const riverWater = new THREE.Mesh(new THREE.PlaneGeometry(110, 6.4), LS.makeWaterMat(0.92));
    riverWater.rotation.x = -Math.PI / 2; riverWater.position.set(0, 0.06, 9.0); worldGroup.add(riverWater);

    // Lily pads & pink lotus flowers floating along the river!
    const padMat = LS.makeToonMat(0x3f8f47);
    const lotMat = LS.makeToonMat(0xff8fab);
    [[-6.5, 7.8], [-9.2, 10.2], [6.8, 8.2], [10.4, 9.8], [-12.5, 8.5], [13.2, 7.6]].forEach((lp, li) => {
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.04, 10), padMat);
      pad.position.set(lp[0], 0.09, lp[1]); worldGroup.add(pad);
      if (li % 2 === 0) {
        const l = new THREE.Mesh(new THREE.SphereGeometry(0.16, 7, 6), lotMat);
        l.scale.set(1.2, 0.7, 1.2); l.position.set(lp[0], 0.18, lp[1]); worldGroup.add(l);
      }
    });

    // Animated swimming river ducks drifting past the bridge!
    [-9, 8].forEach((startX, di) => {
      const dg = new THREE.Group();
      const db = new THREE.Mesh(new THREE.SphereGeometry(0.24, 9, 8), LS.makeToonMat(0xfff8eb));
      db.scale.set(0.9, 0.75, 1.35); db.position.y = 0.12; dg.add(db);
      const dh = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 7), LS.makeToonMat(0x2a9d8f));
      dh.position.set(0, 0.30, 0.20); dg.add(dh);
      dg.userData = { cx: startX, cz: di === 0 ? 9.4 : 8.5, phase: di * 2.2 };
      worldGroup.add(dg); W.riverDucks.push(dg);
    });

    // Stone Embankments + Lush Riverbank Flowerbeds!
    const bankMat = LS.makeToonMat(0xcbc0ae);
    [[-16, 5.7], [16, 5.7], [-16, 12.3], [16, 12.3]].forEach(bp => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(26, 0.44, 0.68), bankMat);
      b.position.set(bp[0], 0.22, bp[1]); worldGroup.add(b);
    });
    const flCols = [0xff7aa2, 0xffd166, 0xc77dff, 0x90e0ef];
    [-6.2, -9.8, 6.2, 9.8].forEach((fx, fi) => {
      [5.0, 13.0].forEach(fz => {
        const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.42, 0), padMat);
        bush.scale.set(1.3, 0.75, 1.1); bush.position.set(fx, 0.28, fz); worldGroup.add(bush);
        const bl = new THREE.Mesh(new THREE.SphereGeometry(0.16, 7, 6), LS.makeToonMat(flCols[(fi + Math.round(fz)) % 4]));
        bl.position.set(fx, 0.56, fz); worldGroup.add(bl);
      });
    });
    addCol(-14.5, 9.0, 11.4, 3.1);
    addCol(14.5, 9.0, 11.4, 3.1);

    // Charming Arched Wooden Bridge with Glowing Vintage Corner Lanterns!
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
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.05, 0.18), railWood);
          post.position.set(rx, by + 0.56, bz); worldGroup.add(post);
          if (i === 0 || i === 11) {
            const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), LS.makeEmissiveMat(0xfff4cf, 0xffd57a, 0.92));
            lamp.position.set(rx, by + 1.18, bz); worldGroup.add(lamp);
            if (LS.createGlowSprite) {
              const h = LS.createGlowSprite(0xffe094, 1.25);
              h.position.copy(lamp.position); worldGroup.add(h);
            }
          }
        });
      }
    }
    [-2.45, 2.45].forEach(rx => {
      const rBeam = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 6.5), railWood);
      rBeam.position.set(rx, 1.32, 9.0); worldGroup.add(rBeam);
    });

    // Gravel Driveway on South Bank + Parked Gray Nissan Qashqai!
    const drive = new THREE.Mesh(new THREE.PlaneGeometry(14, 11), LS.makeSurfaceMat(LS.createGravelPathTexture()));
    drive.rotation.x = -Math.PI / 2; drive.position.set(0, 0.025, 17.5); drive.receiveShadow = true; worldGroup.add(drive);

    if (LS.createNissanQashqai) {
      const qashqai = LS.createNissanQashqai();
      qashqai.position.set(-4.8, 0, 17.2);
      qashqai.rotation.y = Math.PI * 0.35;
      worldGroup.add(qashqai);
      addCol(-4.8, 17.2, 2.2, 1.4);
    }

    // Lush Ghibli trees & fluttering riverbank butterflies!
    [[-11, 14.5, 'sakura', 1.18], [10.5, 14.5, 'green', 1.22], [-14.5, 2.0, 'olive', 1.24], [14.5, 2.0, 'sakura', 1.22], [-15.5, -10.0, 'green', 1.3], [15.5, -10.0, 'gold', 1.25]].forEach(tc => {
      if (LS.ghibli && LS.ghibli.buildGhibliTree) {
        const t = LS.ghibli.buildGhibliTree(tc[2], tc[3]);
        t.position.set(tc[0], 0, tc[1]); worldGroup.add(t);
      }
    });
    [[-6.5, 13.0], [6.5, 13.0], [-7.0, 4.8], [7.0, 4.8]].forEach((bp, i) => {
      const bG = new THREE.Group();
      const wMat = LS.makeToonMat(flCols[i % 4]);
      const wL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 0.11), wMat); wL.position.x = -0.07; bG.add(wL);
      const wR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 0.11), wMat); wR.position.x = 0.07; bG.add(wR);
      bG.userData = { cx: bp[0], cz: bp[1], phase: i * 1.4, wL: wL, wR: wR };
      worldGroup.add(bG); W.butterflies.push(bG);
    });

    // -----------------------------------------------------------------------
    // MAI & MOSTAFA'S HIGH-DETAIL RIVERFRONT HOUSE (Z = -13.5 .. +1.5, X = -11 .. +11)
    // -----------------------------------------------------------------------
    const hFloor = new THREE.Mesh(new THREE.PlaneGeometry(22, 15.5), LS.makeSurfaceMat(LS.createCedarPlankTexture(), { color: 0xe6c89c }));
    hFloor.rotation.x = -Math.PI / 2; hFloor.position.set(0, 0.03, -6.0); hFloor.receiveShadow = true; worldGroup.add(hFloor);
    const walk = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 5.2), LS.makeSurfaceMat(LS.createStonePathTexture()));
    walk.rotation.x = -Math.PI / 2; walk.position.set(0, 0.025, 3.6); worldGroup.add(walk);

    const hWallMat = LS.makeToonMat(0xffffff, { map: LS.createPlasterTexture('#fdf3e2') });
    const trimMat = LS.makeToonMat(0x8c5e3c);
    const bWall = new THREE.Mesh(new THREE.BoxGeometry(22.3, 4.6, 0.35), hWallMat);
    bWall.position.set(0, 2.3, -13.8); bWall.castShadow = true; worldGroup.add(bWall);
    const lWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 4.6, 15.6), hWallMat);
    lWall.position.set(-11.0, 2.3, -6.0); worldGroup.add(lWall);
    const rWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 4.6, 15.6), hWallMat);
    rWall.position.set(11.0, 2.3, -6.0); worldGroup.add(rWall);
    // Crisp Wainscoting & Baseboards inside Mai & Mostafa's House!
    const wsMat = LS.makeToonMat(0xf0dfc6);
    const bWs = new THREE.Mesh(new THREE.BoxGeometry(22.0, 1.0, 0.08), wsMat);
    bWs.position.set(0, 0.50, -13.60); worldGroup.add(bWs);
    addCol(0, -13.8, 11.2, 0.4);
    addCol(-11.0, -6.0, 0.4, 7.8);
    addCol(11.0, -6.0, 0.4, 7.8);

    // Sunlit Curtained Back Windows + Porch Fairy String Lights + Chimney!
    addDetailedWallWindow(worldGroup, -0.2, 2.55, -13.58, 0, 3.2, 1.85, 0xf7d1cd, trimMat);
    addHangingStringLights(worldGroup, -10.2, 1.8, 10.2, 1.8, 4.18, 11, 0xffd57a);

    [-10.6, -4.5, 4.5, 10.6].forEach(px => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.45, 4.6, 0.45), trimMat);
      col.position.set(px, 2.3, 1.7); col.castShadow = true; worldGroup.add(col);
    });
    const frontHeader = new THREE.Mesh(new THREE.BoxGeometry(22.4, 0.55, 0.55), trimMat);
    frontHeader.position.set(0, 4.6, 1.7); worldGroup.add(frontHeader);
    const houseRoof = new THREE.Mesh(new THREE.ConeGeometry(16.8, 3.2, 4), LS.makeToonMat(0xffffff, { map: LS.createRoofTileTexture('#c25a3c') }));
    houseRoof.position.set(0, 6.25, -6.0); houseRoof.rotation.y = Math.PI / 4; houseRoof.scale.set(1.06, 1.0, 0.78);
    houseRoof.castShadow = true; worldGroup.add(houseRoof);
    const hChim = new THREE.Mesh(new THREE.BoxGeometry(1.05, 2.2, 1.05), LS.makeToonMat(0xb85842));
    hChim.position.set(-5.8, 6.8, -8.5); worldGroup.add(hChim);

    // Warm Hanging Pendant Lamps inside the house!
    [[-4.7, -7.8], [5.4, -8.8], [0, -3.8]].forEach(lp => {
      const shade = new THREE.Mesh(new THREE.ConeGeometry(0.40, 0.28, 10), LS.makeToonMat(0xfff4e0));
      shade.position.set(lp[0], 3.85, lp[1]); worldGroup.add(shade);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), LS.makeEmissiveMat(0xfff7dc, 0xffd57a, 0.9));
      bulb.position.set(lp[0], 3.70, lp[1]); worldGroup.add(bulb);
    });

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
    // AREA 1 (Northwest): MAI'S KITCHEN COUNTER, OVEN & STEAMING LASAGNA TABLE!
    // -----------------------------------------------------------------------
    const mCab = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.92, 1.15), LS.makeToonMat(0xe8dfd0));
    mCab.position.set(-6.6, 0.46, -12.8); mCab.castShadow = true; worldGroup.add(mCab);
    const mTop = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.10, 1.25), LS.makeToonMat(0xd9a773));
    mTop.position.set(-6.6, 0.96, -12.8); worldGroup.add(mTop);
    const oven = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.72, 0.08), LS.makeEmissiveMat(0x3a2e2a, 0xff9f43, 0.35));
    oven.position.set(-5.6, 0.48, -12.20); worldGroup.add(oven);
    addCol(-6.6, -12.8, 2.9, 0.75);

    if (LS.createWovenRugTexture) {
      const dRug = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 3.6), LS.makeSurfaceMat(LS.createWovenRugTexture('#f8e8d4', '#e07a5f', '#ffd166')));
      dRug.rotation.x = -Math.PI / 2; dRug.position.set(-4.7, 0.042, -7.8); worldGroup.add(dRug);
    }

    const dTab = new THREE.Group();
    dTab.position.set(-4.7, 0.03, -7.8);
    const dTop = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.12, 1.65), trimMat);
    dTop.position.y = 0.80; dTop.castShadow = true; dTab.add(dTop);
    const dRun = new THREE.Mesh(new THREE.BoxGeometry(2.68, 0.02, 0.52), LS.makeToonMat(0xfff5e4));
    dRun.position.y = 0.87; dTab.add(dRun);
    const dLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.24, 0.78, 10), trimMat);
    dLeg.position.y = 0.39; dTab.add(dLeg);
    // Steaming Homemade Lasagna Pan + Fresh Salad Bowl!
    const pan = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.14, 0.54), LS.makeToonMat(0xfffaf0));
    pan.position.set(0, 0.93, 0); dTab.add(pan);
    const lasCheese = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.06, 0.46), LS.makeToonMat(0xf5c85c));
    lasCheese.position.set(0, 1.01, 0); dTab.add(lasCheese);
    const salad = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.14, 0.11, 10), LS.makeToonMat(0x4b9349));
    salad.position.set(0.75, 0.92, -0.35); dTab.add(salad);
    for (let i = 0; i < 2; i++) {
      const st = new THREE.Mesh(new THREE.SphereGeometry(0.065, 6, 6), LS.makeToonMat(0xffffff, { transparent: true, opacity: 0.45 }));
      st.userData = { bx: -4.7, by: 1.15, bz: -7.8, phase: i * 0.5 };
      worldGroup.add(st); W.lasagnaSteams.push(st);
    }
    [-1.18, 1.18].forEach(cx => {
      const ch = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.46, 0.54), LS.makeToonMat(0x9c6b49));
      ch.position.set(cx, 0.23, 0); dTab.add(ch);
      const bk = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.56, 0.52), LS.makeToonMat(0x8c5a3c));
      bk.position.set(cx + (cx < 0 ? -0.24 : 0.24), 0.68, 0); dTab.add(bk);
    });
    worldGroup.add(dTab);
    addCol(-4.7, -7.8, 1.4, 0.95);

    // -----------------------------------------------------------------------
    // AREA 2 (Northeast): DR. MOSTAFA WATCHING TV + MEDICAL DIPLOMA & SIDE TABLE!
    // -----------------------------------------------------------------------
    const tvRugMat = LS.createWovenRugTexture
      ? LS.makeSurfaceMat(LS.createWovenRugTexture('#dcebd8', '#3d5a80', '#e9c46a'))
      : LS.makeToonMat(0xdce8dc);
    const tvRug = new THREE.Mesh(new THREE.PlaneGeometry(7.0, 5.4), tvRugMat);
    tvRug.rotation.x = -Math.PI / 2; tvRug.position.set(5.6, 0.045, -8.8); worldGroup.add(tvRug);

    // Framed Medical Diploma on the back wall behind Dr. Mostafa!
    const dipFrame = new THREE.Mesh(new THREE.BoxGeometry(1.75, 1.25, 0.09), LS.makeToonMat(0xd4a359));
    dipFrame.position.set(6.2, 2.55, -13.56); worldGroup.add(dipFrame);
    const dipArt = new THREE.Mesh(
      new THREE.BoxGeometry(1.54, 1.04, 0.11),
      new THREE.MeshBasicMaterial({ map: LS.createSignTexture('🩺 DR. MOSTAFA, MD', { bg: '#fffdf5', border: '#3d5a80', color: '#1e3a5f', font: 'bold 24px sans-serif', width: 320, height: 200 }) })
    );
    dipArt.position.set(6.2, 2.55, -13.56); worldGroup.add(dipArt);

    W.tvObj = createAnimatedTV(worldGroup, 9.8, 0.03, -8.8, -Math.PI / 2, 'sports');
    addCol(9.8, -8.8, 0.85, 1.5);

    const mSofaMat = LS.makeToonMat(0x3d5a80);
    const mCushMat = LS.makeToonMat(0x52739e);
    const mSofaG = new THREE.Group();
    mSofaG.position.set(4.5, 0.03, -8.8);
    mSofaG.rotation.y = Math.PI / 2;
    const msBase = new THREE.Mesh(new THREE.BoxGeometry(3.15, 0.24, 0.66), mSofaMat);
    msBase.position.set(0, 0.20, -0.02); msBase.castShadow = true; mSofaG.add(msBase);
    const msCush = new THREE.Mesh(new THREE.BoxGeometry(2.76, 0.12, 0.48), mCushMat);
    msCush.position.set(0, 0.34, 0.05); mSofaG.add(msCush);
    const msBack = new THREE.Mesh(new THREE.BoxGeometry(3.15, 0.74, 0.22), mSofaMat);
    msBack.position.set(0, 0.65, -0.26); msBack.castShadow = true; mSofaG.add(msBack);
    [-1.46, 1.46].forEach(ax => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.48, 0.68), mSofaMat);
      arm.position.set(ax, 0.36, -0.02); mSofaG.add(arm);
    });
    [[-1.38, -0.25], [1.38, -0.25], [-1.38, 0.22], [1.38, 0.22]].forEach(lg => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.10, 6), trimMat);
      leg.position.set(lg[0], 0.05, lg[1]); mSofaG.add(leg);
    });
    const mPill = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.32, 0.18), LS.makeToonMat(0xf4a261));
    mPill.position.set(1.02, 0.56, -0.08); mPill.rotation.x = 0.22; mSofaG.add(mPill);
    worldGroup.add(mSofaG);
    // Side table with coffee cup beside Mostafa's sofa
    const mSide = new THREE.Mesh(new THREE.CylinderGeometry(0.40, 0.40, 0.56, 12), trimMat);
    mSide.position.set(4.5, 0.28, -11.0); worldGroup.add(mSide);
    const mCup = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.14, 9), LS.makeToonMat(0xfffdf8));
    mCup.position.set(4.5, 0.63, -11.0); worldGroup.add(mCup);
    addCol(4.5, -8.8, 0.62, 1.72);

    addIndoorPlant(worldGroup, 9.8, -12.6, 0x2a9d8f, true);
    addIndoorPlant(worldGroup, -9.8, 0.8, 0xe07a5f, false);
    addIndoorPlant(worldGroup, 9.8, 0.8, 0xe07a5f, false);

    // -----------------------------------------------------------------------
    // AREA 3 (Southwest): NOUZI'S GYMNASTICS MAT, BALANCE BEAM & MEDAL RACK!
    // -----------------------------------------------------------------------
    const gymMat = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.09, 2.9), LS.makeToonMat(0xffb3c6));
    gymMat.position.set(-6.4, 0.06, -1.8); gymMat.receiveShadow = true; worldGroup.add(gymMat);
    const gymStripe = new THREE.Mesh(new THREE.BoxGeometry(4.52, 0.10, 0.28), LS.makeToonMat(0xffffff));
    gymStripe.position.set(-6.4, 0.062, -1.8); worldGroup.add(gymStripe);
    // Low padded gymnastics practice balance beam + gold medals shelf on West Wall!
    const beam = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.16, 0.22), LS.makeToonMat(0xe5a97c));
    beam.position.set(-6.4, 0.34, -3.7); beam.castShadow = true; worldGroup.add(beam);
    [-7.4, -5.4].forEach(bx => {
      const bLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 0.34), LS.makeToonMat(0x4a5568));
      bLeg.position.set(bx, 0.16, -3.7); worldGroup.add(bLeg);
    });
    const medalShelf = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.09, 1.8), trimMat);
    medalShelf.position.set(-10.68, 2.05, -1.8); worldGroup.add(medalShelf);
    [-2.2, -1.8, -1.4].forEach(mz => {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.06, 0.22, 8), LS.makeToonMat(0xfbbf24));
      cup.position.set(-10.65, 2.22, mz); worldGroup.add(cup);
    });

    const nouzi = LS.createAnimeCharacter({
      scale: 0.74,
      slim: true,
      skinColor: 0xd9a480,
      hairColor: 0x221713,
      topColor: 0xe63982,
      bottomColor: 0xe63982,
      shoeColor: 0xfff5f8,
      pigtails: true,
      pants: true
    });
    nouzi.root.position.set(-6.4, 0.10, -1.8);
    worldGroup.add(nouzi.root);
    W.nouziChar = nouzi;

    const nouziBub = LS.createSpeechBubbleSprite ? LS.createSpeechBubbleSprite('Nouzi 🤸‍♀️', 'Watch my cartwheel & handstand, Laila & Salma! ✨') : null;
    if (nouziBub) { nouziBub.position.set(-6.4, 1.88, -1.8); worldGroup.add(nouziBub); }

    // -----------------------------------------------------------------------
    // AREA 4 (Southeast): BIBO'S TOY CAR TRACK, MINI GARAGE & ALPHABET BLOCKS!
    // -----------------------------------------------------------------------
    const toyRugMat = LS.createWovenRugTexture
      ? LS.makeSurfaceMat(LS.createWovenRugTexture('#d8f3fc', '#3b82f6', '#ffd166'))
      : LS.makeToonMat(0xcaf0f8);
    const toyRug = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 3.8), toyRugMat);
    toyRug.rotation.x = -Math.PI / 2; toyRug.position.set(6.4, 0.045, -1.8); worldGroup.add(toyRug);
    const track = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.18, 6, 26), LS.makeToonMat(0x4b5563));
    track.rotation.x = Math.PI / 2; track.position.set(6.4, 0.06, -1.8); worldGroup.add(track);
    // Cute Mini Wooden Toy Garage & Stacked Colorful Alphabet Blocks!
    const garage = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.62, 0.72), LS.makeToonMat(0xe63946));
    garage.position.set(8.4, 0.34, -2.9); garage.castShadow = true; worldGroup.add(garage);
    const gRoof = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.10, 0.80), LS.makeToonMat(0xfacc15));
    gRoof.position.set(8.4, 0.68, -2.9); worldGroup.add(gRoof);
    [[8.2, 0.16, -0.5, 0x3b82f6], [8.55, 0.16, -0.45, 0x22c55e], [8.38, 0.42, -0.48, 0xffd166]].forEach(bl => {
      const cube = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.26), LS.makeToonMat(bl[3]));
      cube.position.set(bl[0], bl[1], bl[2]); worldGroup.add(cube);
    });

    [0xe63946, 0xfacc15, 0x3b82f6].forEach((cHex, ci) => {
      const tc = new THREE.Group();
      const cb = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.13, 0.44), LS.makeToonMat(cHex));
      cb.position.y = 0.10; tc.add(cb);
      const ct = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.09, 0.24), LS.makeToonMat(0xfffdf8));
      ct.position.set(0, 0.19, -0.02); tc.add(ct);
      tc.userData = { cx: 6.4, cz: -1.8, radius: 1.18, phase: ci * 2.1 };
      worldGroup.add(tc); W.biboToyCars.push(tc);
    });

    const bibo = LS.createAnimeCharacter({
      scale: 0.66,
      skinColor: 0xcf9772,
      hairColor: 0x1e1613,
      topColor: 0x3b82f6,
      bottomColor: 0x1e3a5f,
      shoeColor: 0xfacc15,
      pants: true
    });
    bibo.root.position.set(6.4, 0.05, -1.8);
    if (LS.applyArticulatedPose) LS.applyArticulatedPose(bibo, 0, 'floor_sit', 0);
    worldGroup.add(bibo.root);
    W.biboChar = bibo;

    const biboBub = LS.createSpeechBubbleSprite ? LS.createSpeechBubbleSprite('Bibo 🚗', 'Vroom vroom! Come play cars & board games with me! 🏎️') : null;
    if (biboBub) { biboBub.position.set(6.4, 1.48, -1.8); worldGroup.add(biboBub); }

    // -----------------------------------------------------------------------
    // AREA 5 (Center): PAINTED 4-PLAYER KIDS' BOARD GAME TABLE! (X = 0, Z = -3.8)
    // -----------------------------------------------------------------------
    const bgTable = new THREE.Group();
    bgTable.position.set(0, 0.03, -3.8);
    const bgTop = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.10, 2.1), trimMat);
    bgTop.position.y = 0.56; bgTop.castShadow = true; bgTable.add(bgTop);
    [[-0.86, -0.86], [0.86, -0.86], [-0.86, 0.86], [0.86, 0.86]].forEach(lp => {
      const l = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.54, 7), trimMat);
      l.position.set(lp[0], 0.27, lp[1]); bgTable.add(l);
    });
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(1.48, 0.04, 1.48),
      new THREE.MeshBasicMaterial({ map: createBoardGameTexture() })
    );
    board.position.y = 0.63; bgTable.add(board);
    [[-0.42, -0.42, 0xff5d8f], [0.42, -0.42, 0xffd166], [-0.42, 0.42, 0xa855f7], [0.42, 0.42, 0x3b82f6]].forEach(p => {
      const pawn = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.24, 8), LS.makeToonMat(p[2]));
      pawn.position.set(p[0], 0.77, p[1]); bgTable.add(pawn);
    });
    const die = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.17, 0.17), LS.makeToonMat(0xffffff));
    die.position.set(0, 0.74, 0); die.rotation.y = 0.5; bgTable.add(die);
    [[-1.38, 0, 0xff8fab], [1.38, 0, 0xffd166], [0, -1.38, 0xc77dff], [0, 1.38, 0x72c8f5]].forEach(c => {
      const cush = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.48, 0.18, 14), LS.makeToonMat(c[2]));
      cush.position.set(c[0], 0.09, c[1]); bgTable.add(cush);
    });
    worldGroup.add(bgTable);
    addCol(0, -3.8, 1.18, 1.18);

    LS.spawnWorldNPCs(worldGroup, [
      {
        name: 'Mai 🍝',
        line: 'Welcome Laila & Salma! I just baked fresh homemade lasagna — would you like to have some? 🧀🍝💛',
        pos: new THREE.Vector3(-4.7, 0.03, -9.8),
        baseRot: 0,
        waveOnNear: true,
        char: { scale: 0.92, skinColor: 0xdca886, hairColor: 0x261a14, topColor: 0xe07a5f, bottomColor: 0x3d5a80, longHair: true }
      },
      {
        name: 'Mostafa (Dr.) 🩺📺',
        line: 'Hey Laila & Salma! Just relaxing in my coat and watching TV after the clinic — have fun with Nouzi & Bibo! 🩺📺',
        pos: new THREE.Vector3(4.48, 0.04, -8.8),
        baseRot: Math.PI / 2,
        seated: true,
        char: {
          scale: 0.98,
          skinColor: 0x6b442a,
          bald: true,
          doctorCoat: true,
          stethoscope: true,
          topColor: 0xffffff,
          bottomColor: 0x2b3a4a,
          pants: true
        }
      }
    ]);

    W.zones.push({ id: 'mai_lasagna', label: "Talk to Mai — Have Homemade Lasagna? 🧀🍝", pos: new THREE.Vector3(-4.7, 0, -5.6), radius: 2.8 });
    W.zones.push({ id: 'kids_board_game', label: 'Play a Board Game with Laila, Salma, Nouzi & Bibo! 🎲🎉', pos: new THREE.Vector3(0, 0, -1.6), radius: 2.8 });
    W.zones.push({ id: 'home_qashqai', label: 'Hop in Gray Nissan Qashqai (Drive Home or Elsewhere) 🚙', pos: new THREE.Vector3(-1.8, 0, 17.2), radius: 3.6 });
    W.zones.push({ id: 'home_qashqai', label: 'Take Qashqai Keys — Drive Home or Elsewhere 🚙', pos: new THREE.Vector3(0, 0, 1.2), radius: 2.3 });

    W.update = function (dt, elapsed) {
      if (W.tvObj) W.tvObj.update(elapsed);

      // Animate Nouzi doing real gymnastics moves on her mat!
      if (W.nouziChar) {
        const cycle = elapsed % 9.0;
        const r = W.nouziChar.root;
        const bp = W.nouziChar.bodyPivot;
        if (cycle < 3.0) {
          const u = cycle / 3.0;
          r.position.set(-7.6 + u * 2.4, 0.10 + Math.sin(u * Math.PI) * 0.45, -1.8);
          r.rotation.set(0, 0, 0);
          bp.rotation.set(0, 0, -u * Math.PI * 2);
          W.nouziChar.leftArm.rotation.z = 2.6; W.nouziChar.rightArm.rotation.z = -2.6;
          W.nouziChar.leftLeg.rotation.z = -0.55; W.nouziChar.rightLeg.rotation.z = 0.55;
        } else if (cycle < 6.0) {
          const u = (cycle - 3.0) / 3.0;
          const inv = Math.sin(u * Math.PI);
          r.position.set(-5.2, 0.10 + inv * 0.92, -1.8);
          bp.rotation.set(0, 0, inv * Math.PI);
          W.nouziChar.leftArm.rotation.z = 2.9; W.nouziChar.rightArm.rotation.z = -2.9;
          W.nouziChar.leftLeg.rotation.z = -0.25 * Math.sin(elapsed * 4);
          W.nouziChar.rightLeg.rotation.z = 0.25 * Math.sin(elapsed * 4);
        } else {
          const u = (cycle - 6.0) / 3.0;
          r.position.set(-5.2 - u * 2.4, 0.10 + Math.abs(Math.sin(u * Math.PI * 3)) * 0.42, -1.8);
          bp.rotation.set(0, u * Math.PI * 2, 0);
          W.nouziChar.leftArm.rotation.z = 1.9; W.nouziChar.rightArm.rotation.z = -1.9;
          W.nouziChar.leftLeg.rotation.z = 0; W.nouziChar.rightLeg.rotation.z = 0;
        }
      }

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
      W.riverDucks.forEach((d, i) => {
        const u = d.userData;
        d.position.set(u.cx + Math.sin(elapsed * 0.45 + u.phase) * 3.2, 0.05 + Math.sin(elapsed * 4 + i) * 0.02, u.cz);
        d.rotation.y = Math.cos(elapsed * 0.45 + u.phase) > 0 ? Math.PI / 2 : -Math.PI / 2;
      });
      W.butterflies.forEach(b => {
        const u = b.userData;
        const t = elapsed * 1.4 + u.phase;
        b.position.set(u.cx + Math.sin(t) * 1.2, 1.0 + Math.sin(t * 2.2) * 0.28, u.cz + Math.cos(t * 0.85) * 1.1);
        b.rotation.y = Math.atan2(Math.cos(t), -Math.sin(t * 0.85));
        const flap = Math.sin(elapsed * 18 + u.phase) * 0.65;
        u.wL.rotation.z = flap; u.wR.rotation.z = -flap;
      });
      W.lasagnaSteams.forEach(st => {
        const t = (elapsed * 0.55 + st.userData.phase) % 1.0;
        st.position.set(st.userData.bx, st.userData.by + t * 0.52, st.userData.bz);
        st.scale.setScalar(0.65 + t * 0.9);
        st.material.opacity = (1 - t) * 0.42;
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
      ctx.fillStyle = '#38bdf8'; ctx.fillRect(0, toY(6), Wpx, toY(12.2) - toY(6));
      ctx.fillStyle = '#8c5a3c'; ctx.fillRect(toX(-3), toY(5.6), toX(3) - toX(-3), toY(12.4) - toY(5.6));
      ctx.fillStyle = '#f5e4cc'; ctx.fillRect(toX(-11), toY(-13.8), toX(11) - toX(-11), toY(1.8) - toY(-13.8));
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
