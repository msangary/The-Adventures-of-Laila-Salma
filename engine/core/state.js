window.LailaSalma = window.LailaSalma || {};

(function (LS) {
  const SAVE_KEY = 'laila_salma_adventures_multiworld_v1';
  const QUIZ_WINDOW_MS = 2 * 60 * 60 * 1000;

  LS.GACHAPON_TOYS = [
    { id: 'mini_daruma', name: 'Lucky Mini Daruma', emoji: '🎎', desc: 'Red wish charm that cheers on Laila & Salma' },
    { id: 'origami_crane', name: 'Folded Origami Crane', emoji: '🕊️', desc: 'Paper peace crane from Tokyo craft stalls' },
    { id: 'pixel_cat', name: 'Pixel Kitteh Badge', emoji: '👾', desc: 'Retro arcade kitty pin for the Toy Shelf' },
    { id: 'ramen_charm', name: 'Mini Ramen Keychain', emoji: '🍥', desc: 'Tiny narutomaki & noodle charm' },
    { id: 'sakura_fan', name: 'Blossom Folding Fan', emoji: '🪭', desc: 'Springtime sakura fan with gold trim' },
    { id: 'shiba_plush', name: 'Pocket Shiba Plush', emoji: '🐕', desc: "Mini Mochi plushie for Salma's shelf" }
  ];

  LS.ROOM_WALLPAPERS = [
    { id: 'sakura_cream', name: 'Sakura Cream', cost: 0, color: '#fdf3e3', accent: '#f4a4b8' },
    { id: 'sky_pastel', name: 'Sky Pastel', cost: 60, color: '#e3f2fd', accent: '#64b5f6' },
    { id: 'matcha_mint', name: 'Matcha Garden', cost: 85, color: '#e8f5e9', accent: '#66bb6a' },
    { id: 'starry_lilac', name: 'Starry Lilac', cost: 110, color: '#f3e5f5', accent: '#ab47bc' }
  ];

  LS.ROOM_BEANBAGS = [
    { id: 'strawberry_puff', name: 'Strawberry Beanbag', cost: 0, color: '#ff8fab' },
    { id: 'lemon_cloud', name: 'Lemon Cloud Puff', cost: 55, color: '#ffd166' },
    { id: 'berry_pop', name: 'Berry Pop Cushion', cost: 80, color: '#9d4edd' }
  ];

  LS.ROOM_POSTERS = [
    { id: 'tokyo_sketches', name: 'Tokyo & Cat Sketches', cost: 0, label: 'TOKYO 🗼 & 🐱' },
    { id: 'space_cats', name: 'Astronaut Cats Poster', cost: 65, label: 'ASTRO CATS 🚀🐾' },
    { id: 'ramen_dreams', name: 'Ramen & Stars Art', cost: 90, label: 'RAMEN & STARS 🍜✨' }
  ];

  LS.RYOKAN_TATAMI = [
    { id: 'classic_tatami', name: 'Classic Woven Tatami', cost: 0, color: '#e8dfb8', accent: '#8b6e4e' },
    { id: 'bamboo_breeze', name: 'Bamboo Breeze Mat', cost: 65, color: '#dcebd5', accent: '#4f8a5b' },
    { id: 'autumn_maple', name: 'Autumn Maple Weave', cost: 90, color: '#f7e1d1', accent: '#c95c38' }
  ];

  LS.RYOKAN_CUSHIONS = [
    { id: 'sakura_zabuton', name: 'Sakura Silk Zabuton', cost: 0, color: '#ffb3c6' },
    { id: 'indigo_wave', name: 'Indigo Wave Cushion', cost: 60, color: '#5b82b8' },
    { id: 'gold_kitsune', name: 'Golden Kitsune Futon', cost: 85, color: '#f5b841' }
  ];

  LS.RYOKAN_SCROLLS = [
    { id: 'kyoto_torii', name: 'Vermilion Torii Scroll', cost: 0, label: '⛩️ KYOTO SHRINE & KOI' },
    { id: 'bamboo_moon', name: 'Bamboo & Full Moon', cost: 70, label: '🎋 ARASHIYAMA MOON 🌕' },
    { id: 'kitsune_lantern', name: 'Lanterns & Kitsune Art', cost: 95, label: '🦊 LANTERN FESTIVAL 🏮' }
  ];

  const defaultState = {
    currentWorld: 'tokyo',
    level: 1,
    xp: 0,
    coins: 200,
    lastCompletedWindowTokyo: -1,
    lastCompletedWindowKyoto: -1,
    demoOffsetWindows: 0,
    timeMode: 0,
    grainEnabled: true,
    soundEnabled: false,
    foundCats: [],
    foundKitsune: [],
    unlockedOutfits: ['laila_school', 'salma_kinder'],
    equippedLaila: 'laila_school',
    equippedSalma: 'salma_kinder',
    unlockedToys: [],
    stamps: [],
    emaWishes: [],
    lastFortune: null,
    koiFedCount: 0,
    roomWallpaper: 'sakura_cream',
    unlockedRoomItems: ['sakura_cream', 'strawberry_puff', 'tokyo_sketches'],
    roomBeanbag: 'strawberry_puff',
    roomPoster: 'tokyo_sketches',
    ryokanTatami: 'classic_tatami',
    ryokanCushion: 'sakura_zabuton',
    ryokanScroll: 'kyoto_torii',
    unlockedRyokanItems: ['classic_tatami', 'sakura_zabuton', 'kyoto_torii']
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) {
        // Soft-migrate Tokyo standalone progress if present on same origin
        const legacy = localStorage.getItem('first_adventure_tokyo_sisters_v3');
        if (legacy) {
          const p = JSON.parse(legacy);
          return Object.assign({}, defaultState, {
            level: p.level || 1,
            xp: p.xp || 0,
            coins: typeof p.coins === 'number' ? Math.max(180, p.coins) : 200,
            foundCats: Array.isArray(p.foundCats) ? p.foundCats : [],
            unlockedOutfits: Array.isArray(p.unlockedOutfits) ? p.unlockedOutfits : ['laila_school', 'salma_kinder'],
            equippedLaila: p.equippedLaila || 'laila_school',
            equippedSalma: p.equippedSalma || 'salma_kinder',
            unlockedToys: Array.isArray(p.unlockedToys) ? p.unlockedToys : [],
            roomWallpaper: p.roomWallpaper || 'sakura_cream',
            roomBeanbag: p.roomBeanbag || 'strawberry_puff',
            roomPoster: p.roomPoster || 'tokyo_sketches',
            unlockedRoomItems: Array.isArray(p.unlockedRoomItems) ? p.unlockedRoomItems : ['sakura_cream', 'strawberry_puff', 'tokyo_sketches']
          });
        }
        return Object.assign({}, defaultState);
      }
      const parsed = JSON.parse(raw);
      return Object.assign({}, defaultState, parsed, {
        foundCats: Array.isArray(parsed.foundCats) ? parsed.foundCats : [],
        foundKitsune: Array.isArray(parsed.foundKitsune) ? parsed.foundKitsune : [],
        unlockedOutfits: Array.isArray(parsed.unlockedOutfits) ? parsed.unlockedOutfits : ['laila_school', 'salma_kinder'],
        unlockedToys: Array.isArray(parsed.unlockedToys) ? parsed.unlockedToys : [],
        stamps: Array.isArray(parsed.stamps) ? parsed.stamps : [],
        emaWishes: Array.isArray(parsed.emaWishes) ? parsed.emaWishes : [],
        unlockedRoomItems: Array.isArray(parsed.unlockedRoomItems) ? parsed.unlockedRoomItems : ['sakura_cream', 'strawberry_puff', 'tokyo_sketches'],
        unlockedRyokanItems: Array.isArray(parsed.unlockedRyokanItems) ? parsed.unlockedRyokanItems : ['classic_tatami', 'sakura_zabuton', 'kyoto_torii']
      });
    } catch (e) {
      return Object.assign({}, defaultState);
    }
  }

  LS.state = loadState();
  LS.runtime = {
    stamina: 100,
    running: false,
    runToggle: false,
    camMode: 0,
    poseTimer: 0,
    highFiveTimer: 0,
    modalOpen: false,
    traveling: false,
    eating: null,
    buff: null,
    superJumpUntil: 0,
    sparkleUntil: 0,
    nearZone: null,
    mochiGame: null,
    mochiHeartTimer: 0,
    parkActivity: null,
    koiFeedTimer: 0,
    salmaHintUntil: 0
  };

  LS.saveState = function () {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(LS.state));
    } catch (e) {}
  };

  LS.xpForLevel = function (lv) {
    return 100 + (lv - 1) * 50;
  };

  LS.unlockStamp = function (stampId) {
    if (!LS.state.stamps.includes(stampId)) {
      LS.state.stamps.push(stampId);
      LS.saveState();
      const stamp = LS.PASSPORT_STAMPS.find(s => s.id === stampId);
      if (stamp) {
        LS.playSFX('stamp');
        setTimeout(() => {
          LS.showToast('🛂 Passport Stamp Unlocked: ' + stamp.emoji + ' ' + stamp.title + '!');
        }, 550);
      }
      LS.updateHUD();
      return true;
    }
    return false;
  };

  LS.addXP = function (amount) {
    LS.state.xp += amount;
    let leveledUp = false;
    while (LS.state.xp >= LS.xpForLevel(LS.state.level)) {
      LS.state.xp -= LS.xpForLevel(LS.state.level);
      LS.state.level += 1;
      leveledUp = true;
    }
    LS.saveState();
    LS.updateHUD();
    if (leveledUp) {
      LS.playSFX('levelup');
      LS.showToast('🎉 Level Up! Laila & Salma reached Level ' + LS.state.level + '!');
    }
    return leveledUp;
  };

  LS.addCoins = function (amount) {
    LS.state.coins = Math.max(0, LS.state.coins + amount);
    LS.saveState();
    LS.updateHUD();
  };

  LS.getCurrentQuizWindow = function () {
    return Math.floor(Date.now() / QUIZ_WINDOW_MS) + (LS.state.demoOffsetWindows || 0);
  };

  LS.getQuizCooldownMs = function (worldId) {
    const wid = worldId || LS.state.currentWorld;
    const cur = LS.getCurrentQuizWindow();
    const last = wid === 'kyoto' ? LS.state.lastCompletedWindowKyoto : LS.state.lastCompletedWindowTokyo;
    if (last < cur) return 0;
    const realWindow = Math.floor(Date.now() / QUIZ_WINDOW_MS);
    const nextRealBoundary = (realWindow + 1) * QUIZ_WINDOW_MS;
    return Math.max(0, nextRealBoundary - Date.now());
  };

  LS.markQuizCompleted = function (worldId) {
    const wid = worldId || LS.state.currentWorld;
    const cur = LS.getCurrentQuizWindow();
    if (wid === 'kyoto') {
      LS.state.lastCompletedWindowKyoto = cur;
    } else {
      LS.state.lastCompletedWindowTokyo = cur;
      LS.unlockStamp('tokyo_quiz');
    }
    LS.saveState();
  };

  LS.updateHUD = function () {
    const worldMeta = LS.WORLDS[LS.state.currentWorld] || LS.WORLDS.tokyo;
    const lvEl = document.getElementById('hud-level');
    const worldBadge = document.getElementById('hud-world-badge');
    const xpBar = document.getElementById('xp-bar');
    const xpText = document.getElementById('xp-text');
    const stamBar = document.getElementById('stamina-bar');
    const stamText = document.getElementById('stamina-text');
    const coinEl = document.getElementById('coin-count');
    const animalPill = document.getElementById('cat-pill');
    const toyEl = document.getElementById('toy-count');
    const stampEl = document.getElementById('stamp-count');
    const buffPill = document.getElementById('buff-pill');

    const need = LS.xpForLevel(LS.state.level);
    if (lvEl) lvEl.textContent = 'Lv. ' + LS.state.level + ' • Laila (9) & Salma (5)';
    if (worldBadge) {
      worldBadge.textContent = worldMeta.emoji + ' ' + worldMeta.title;
      worldBadge.style.background = worldMeta.badgeColor;
    }
    if (xpBar) xpBar.style.width = Math.min(100, Math.round((LS.state.xp / need) * 100)) + '%';
    if (xpText) xpText.textContent = LS.state.xp + '/' + need;
    if (stamBar) stamBar.style.width = Math.round(LS.runtime.stamina) + '%';
    if (stamText) stamText.textContent = Math.round(LS.runtime.stamina) + '%';
    if (coinEl) coinEl.textContent = LS.state.coins;

    if (animalPill) {
      if (LS.state.currentWorld === 'kyoto') {
        const kCount = LS.state.foundKitsune ? LS.state.foundKitsune.length : 0;
        animalPill.innerHTML = '🦊 <span id="cat-count">' + kCount + '/5</span>';
        animalPill.title = 'Hidden Kyoto Kitsune Foxes Found';
      } else {
        const cCount = LS.state.foundCats ? LS.state.foundCats.length : 0;
        animalPill.innerHTML = '🐱 <span id="cat-count">' + cCount + '/5</span>';
        animalPill.title = 'Hidden Tokyo Cats Found';
      }
    }

    if (toyEl) toyEl.textContent = (LS.state.unlockedToys ? LS.state.unlockedToys.length : 0) + '/' + LS.GACHAPON_TOYS.length;
    if (stampEl) stampEl.textContent = (LS.state.stamps ? LS.state.stamps.length : 0) + '/' + LS.PASSPORT_STAMPS.length;

    if (buffPill) {
      const tags = [];
      if (LS.runtime.buff && Date.now() < LS.runtime.buff.expiresAt) {
        tags.push(LS.runtime.buff.short + ' ' + Math.ceil((LS.runtime.buff.expiresAt - Date.now()) / 1000) + 's');
      } else {
        LS.runtime.buff = null;
      }
      if (LS.runtime.superJumpUntil && Date.now() < LS.runtime.superJumpUntil) {
        tags.push('🦘Jump ' + Math.ceil((LS.runtime.superJumpUntil - Date.now()) / 1000) + 's');
      }
      if (LS.runtime.sparkleUntil && Date.now() < LS.runtime.sparkleUntil) {
        tags.push('✨Sparkle ' + Math.ceil((LS.runtime.sparkleUntil - Date.now()) / 1000) + 's');
      }
      if (tags.length > 0) {
        buffPill.textContent = tags.join(' • ');
        buffPill.classList.remove('hidden');
      } else {
        buffPill.classList.add('hidden');
      }
    }
  };

  let toastTimer = null;
  LS.showToast = function (msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), 3600);
  };

  let audioCtx = null;
  function getAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  LS.playTone = function (freq, duration, type, delaySec, gainVal) {
    if (!LS.state.soundEnabled) return;
    try {
      const ctx = getAudio();
      if (!ctx) return;
      const now = ctx.currentTime + (delaySec || 0);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(gainVal || 0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (duration || 0.15));
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + (duration || 0.15) + 0.02);
    } catch (e) {}
  };

  LS.playSFX = function (kind) {
    if (!LS.state.soundEnabled) return;
    if (kind === 'jump') {
      LS.playTone(392, 0.07, 'sine', 0, 0.07);
      LS.playTone(587.33, 0.09, 'sine', 0.05, 0.06);
    } else if (kind === 'coin') {
      LS.playTone(784, 0.09, 'triangle', 0, 0.08);
      LS.playTone(1046.5, 0.16, 'triangle', 0.08, 0.08);
    } else if (kind === 'correct') {
      LS.playTone(587.33, 0.1, 'sine', 0, 0.08);
      LS.playTone(880, 0.18, 'sine', 0.09, 0.08);
    } else if (kind === 'wrong') {
      LS.playTone(290, 0.16, 'triangle', 0, 0.07);
    } else if (kind === 'animal') {
      LS.playTone(659.25, 0.09, 'sine', 0, 0.08);
      LS.playTone(783.99, 0.09, 'sine', 0.08, 0.08);
      LS.playTone(1046.5, 0.2, 'sine', 0.16, 0.08);
    } else if (kind === 'splash') {
      LS.playTone(340, 0.08, 'sine', 0, 0.06);
      LS.playTone(460, 0.1, 'sine', 0.07, 0.06);
      LS.playTone(620, 0.14, 'triangle', 0.14, 0.05);
    } else if (kind === 'shrine') {
      LS.playTone(523.25, 0.22, 'triangle', 0, 0.07);
      LS.playTone(659.25, 0.24, 'triangle', 0.14, 0.07);
      LS.playTone(783.99, 0.32, 'sine', 0.28, 0.08);
    } else if (kind === 'train') {
      // Cheerful Japanese Shinkansen departure chime
      LS.playTone(523.25, 0.14, 'sine', 0, 0.08);
      LS.playTone(659.25, 0.14, 'sine', 0.13, 0.08);
      LS.playTone(783.99, 0.14, 'sine', 0.26, 0.08);
      LS.playTone(1046.5, 0.34, 'sine', 0.39, 0.09);
    } else if (kind === 'stamp') {
      LS.playTone(587.33, 0.1, 'triangle', 0, 0.08);
      LS.playTone(740, 0.1, 'triangle', 0.1, 0.08);
      LS.playTone(880, 0.22, 'triangle', 0.2, 0.09);
    } else if (kind === 'levelup') {
      LS.playTone(523.25, 0.12, 'triangle', 0, 0.08);
      LS.playTone(659.25, 0.12, 'triangle', 0.12, 0.08);
      LS.playTone(783.99, 0.12, 'triangle', 0.24, 0.08);
      LS.playTone(1046.5, 0.32, 'triangle', 0.36, 0.09);
    } else {
      LS.playTone(523.25, 0.12);
    }
  };
})(window.LailaSalma);
