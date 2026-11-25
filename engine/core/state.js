window.LailaSalma = window.LailaSalma || {};

(function (LS) {
  const SAVE_KEY = 'laila_salma_adventures_multiworld_v1';
  const QUIZ_WINDOW_MS = 2 * 60 * 60 * 1000;
  const ANIMAL_RESET_MS = 2 * 60 * 60 * 1000; // 2 hours after completing all 5 animals

  LS.GACHAPON_TOYS = [
    // Tokyo Capsule Toys (6)
    { id: 'mini_daruma', world: 'tokyo', name: 'Lucky Mini Daruma', emoji: '🎎', desc: 'Red wish charm that cheers on Laila & Salma' },
    { id: 'origami_crane', world: 'tokyo', name: 'Folded Origami Crane', emoji: '🕊️', desc: 'Paper peace crane from Tokyo craft stalls' },
    { id: 'pixel_cat', world: 'tokyo', name: 'Pixel Kitteh Badge', emoji: '👾', desc: 'Retro arcade kitty pin for the Toy Shelf' },
    { id: 'ramen_charm', world: 'tokyo', name: 'Mini Ramen Keychain', emoji: '🍥', desc: 'Tiny narutomaki & noodle charm' },
    { id: 'sakura_fan', world: 'tokyo', name: 'Blossom Folding Fan', emoji: '🪭', desc: 'Springtime sakura fan with gold trim' },
    { id: 'shiba_plush', world: 'tokyo', name: 'Pocket Shiba Plush', emoji: '🐕', desc: "Mini Mochi plushie for Salma's shelf" },
    // Kyoto Capsule Toys (6)
    { id: 'kitsune_charm', world: 'kyoto', name: 'Golden Kitsune Charm', emoji: '🦊', desc: 'Lucky shrine fox figurine from Sakurako' },
    { id: 'mini_torii', world: 'kyoto', name: 'Vermilion Mini Torii', emoji: '⛩️', desc: 'Pocket shrine gate keepsake' },
    { id: 'bamboo_panda', world: 'kyoto', name: 'Bamboo Panda Figure', emoji: '🐼', desc: 'Cute panda peeking from Arashiyama stalks' },
    { id: 'koi_chime', world: 'kyoto', name: 'Koi Wind Chime', emoji: '🎐', desc: 'Glass furin bell with a tiny koi fish' },
    { id: 'matcha_whisk', world: 'kyoto', name: 'Uji Matcha Set', emoji: '🍵', desc: 'Miniature tea bowl & bamboo whisk' },
    { id: 'dango_pin', world: 'kyoto', name: 'Sweet Dango Sticker', emoji: '🍡', desc: 'Sparkly pink-white-green dango badge' },
    // Safari Wildlife Photo Stickers (6)
    { id: 'lion_sticker', world: 'safari', name: 'Pride Rock Lion Sticker', emoji: '🦁', desc: 'Golden savanna king photo sticker from Serengeti' },
    { id: 'giraffe_sticker', world: 'safari', name: 'Tall Giraffe Sticker', emoji: '🦒', desc: 'Spotted acacia-munching giraffe collectible card' },
    { id: 'elephant_sticker', world: 'safari', name: 'Baby Elephant Sticker', emoji: '🐘', desc: 'Splashing watering-hole elephant photo badge' },
    { id: 'zebra_sticker', world: 'safari', name: 'Zebra Herd Sticker', emoji: '🦓', desc: 'Bold striped runner card from Zebra Meadow' },
    { id: 'flamingo_sticker', world: 'safari', name: 'Pink Flamingo Sticker', emoji: '🦩', desc: 'Rosy oasis flamingo sticker for the Toy Shelf' },
    { id: 'jeep_pin', world: 'safari', name: 'Safari Jeep Explorer Pin', emoji: '🚙', desc: 'Miniature zebra-striped Land Cruiser badge' }
  ];

  LS.ROOM_WALLPAPERS = [
    { id: 'sakura_cream', name: 'Sakura Cream', cost: 0, color: '#fdf3e3', accent: '#f4a4b8', hex: 0xfdf3e3 },
    { id: 'sky_pastel', name: 'Sky Pastel', cost: 60, color: '#e3f2fd', accent: '#64b5f6', hex: 0xdbeeff },
    { id: 'matcha_mint', name: 'Matcha Garden', cost: 85, color: '#e8f5e9', accent: '#66bb6a', hex: 0xdff5e2 },
    { id: 'starry_lilac', name: 'Starry Lilac', cost: 110, color: '#f3e5f5', accent: '#ab47bc', hex: 0xeddbf5 }
  ];

  LS.ROOM_BEANBAGS = [
    { id: 'strawberry_puff', name: 'Strawberry Beanbag', cost: 0, color: '#ff8fab', hex: 0xff8fab },
    { id: 'lemon_cloud', name: 'Lemon Cloud Puff', cost: 55, color: '#ffd166', hex: 0xffd166 },
    { id: 'berry_pop', name: 'Berry Pop Cushion', cost: 80, color: '#9d4edd', hex: 0x9d4edd }
  ];

  LS.ROOM_POSTERS = [
    { id: 'tokyo_sketches', name: 'Tokyo & Cat Sketches', cost: 0, label: 'TOKYO 🗼 & 🐱', bg: '#fff0f5', border: '#e05780' },
    { id: 'space_cats', name: 'Astronaut Cats Poster', cost: 65, label: 'ASTRO CATS 🚀🐾', bg: '#1d2d50', border: '#ffd166', fg: '#ffffff' },
    { id: 'ramen_dreams', name: 'Ramen & Stars Art', cost: 90, label: 'RAMEN & STARS 🍜✨', bg: '#fff4e0', border: '#e07a34' }
  ];

  LS.RYOKAN_TATAMI = [
    { id: 'classic_tatami', name: 'Classic Woven Tatami', cost: 0, color: '#e8dfb8', accent: '#8b6e4e', hex: 0xd9cf9c },
    { id: 'bamboo_breeze', name: 'Bamboo Breeze Mat', cost: 65, color: '#dcebd5', accent: '#4f8a5b', hex: 0xc2d9b8 },
    { id: 'autumn_maple', name: 'Autumn Maple Weave', cost: 90, color: '#f7e1d1', accent: '#c95c38', hex: 0xebd0bd }
  ];

  LS.RYOKAN_CUSHIONS = [
    { id: 'sakura_zabuton', name: 'Sakura Silk Zabuton', cost: 0, color: '#ffb3c6', hex: 0xff8fab },
    { id: 'indigo_wave', name: 'Indigo Wave Cushion', cost: 60, color: '#5b82b8', hex: 0x4a74ad },
    { id: 'gold_kitsune', name: 'Golden Kitsune Futon', cost: 85, color: '#f5b841', hex: 0xf5b841 }
  ];

  LS.RYOKAN_SCROLLS = [
    { id: 'kyoto_torii', name: 'Vermilion Torii Scroll', cost: 0, label: '⛩️ KYOTO SHRINE & KOI', bg: '#fff8eb', border: '#c83e37' },
    { id: 'bamboo_moon', name: 'Bamboo & Full Moon', cost: 70, label: '🎋 ARASHIYAMA MOON 🌕', bg: '#1b4332', border: '#95d5b2', fg: '#ecfdf5' },
    { id: 'kitsune_lantern', name: 'Lanterns & Kitsune Art', cost: 95, label: '🦊 LANTERN FESTIVAL 🏮', bg: '#3a1f1b', border: '#f59e0b', fg: '#fff5dc' }
  ];

  function makeDefaultState() {
    return {
      currentWorld: 'tokyo',
      level: 1,
      xp: 0,
      coins: 200,
      lastCompletedWindowTokyo: -1,
      lastCompletedWindowKyoto: -1,
      lastCompletedWindowSafari: -1,
      demoOffsetWindows: 0,
      timeMode: 0,
      grainEnabled: true,
      soundEnabled: false,
      foundCats: [],
      catsCompletedAt: 0,
      catsRound: 0,
      foundKitsune: [],
      kitsuneCompletedAt: 0,
      kitsuneRound: 0,
      foundLionCubs: [],
      lionCubsCompletedAt: 0,
      lionCubsRound: 0,
      unlockedOutfits: ['laila_school', 'salma_kinder'],
      equippedLaila: 'laila_school',
      equippedSalma: 'salma_kinder',
      unlockedToys: [],
      stamps: [],
      emaWishes: [],
      lastFortune: null,
      koiFedCount: 0,
      safariFedCount: 0,
      roomWallpaper: 'sakura_cream',
      unlockedRoomItems: ['sakura_cream', 'strawberry_puff', 'tokyo_sketches'],
      roomBeanbag: 'strawberry_puff',
      roomPoster: 'tokyo_sketches',
      ryokanTatami: 'classic_tatami',
      ryokanCushion: 'sakura_zabuton',
      ryokanScroll: 'kyoto_torii',
      unlockedRyokanItems: ['classic_tatami', 'sakura_zabuton', 'kyoto_torii']
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return makeDefaultState();
      const parsed = JSON.parse(raw);
      // Never resume stranded inside an interior without parent context; default to valid world
      const startW = (parsed.currentWorld === 'kyoto' || parsed.currentWorld === 'tokyo' || parsed.currentWorld === 'safari')
        ? parsed.currentWorld : 'tokyo';
      return Object.assign(makeDefaultState(), parsed, {
        currentWorld: startW,
        foundCats: Array.isArray(parsed.foundCats) ? parsed.foundCats.slice() : [],
        foundKitsune: Array.isArray(parsed.foundKitsune) ? parsed.foundKitsune.slice() : [],
        foundLionCubs: Array.isArray(parsed.foundLionCubs) ? parsed.foundLionCubs.slice() : [],
        unlockedOutfits: Array.isArray(parsed.unlockedOutfits) ? parsed.unlockedOutfits.slice() : ['laila_school', 'salma_kinder'],
        unlockedToys: Array.isArray(parsed.unlockedToys) ? parsed.unlockedToys.slice() : [],
        stamps: Array.isArray(parsed.stamps) ? parsed.stamps.slice() : [],
        emaWishes: Array.isArray(parsed.emaWishes) ? parsed.emaWishes.slice() : [],
        unlockedRoomItems: Array.isArray(parsed.unlockedRoomItems) ? parsed.unlockedRoomItems.slice() : ['sakura_cream', 'strawberry_puff', 'tokyo_sketches'],
        unlockedRyokanItems: Array.isArray(parsed.unlockedRyokanItems) ? parsed.unlockedRyokanItems.slice() : ['classic_tatami', 'sakura_zabuton', 'kyoto_torii']
      });
    } catch (e) {
      return makeDefaultState();
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
    piggybackUntil: 0,
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
    safariRide: null,
    safariFeedTimer: 0,
    koiFeedTimer: 0,
    salmaHintUntil: 0
  };

  LS.saveState = function () {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(LS.state));
    } catch (e) {}
  };

  LS.resetProgress = function () {
    const keepSound = !!LS.state.soundEnabled;
    const keepGrain = LS.state.grainEnabled !== false;
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) {}

    // Fresh state with brand-new arrays while preserving audio & paper-grain preferences
    const fresh = makeDefaultState();
    fresh.soundEnabled = keepSound;
    fresh.grainEnabled = keepGrain;
    Object.keys(LS.state).forEach(k => { delete LS.state[k]; });
    Object.assign(LS.state, fresh);

    LS.runtime.stamina = 100;
    LS.runtime.buff = null;
    LS.runtime.superJumpUntil = 0;
    LS.runtime.sparkleUntil = 0;
    LS.runtime.piggybackUntil = 0;
    LS.runtime.mochiGame = null;
    LS.runtime.parkActivity = null;
    LS.runtime.safariRide = null;

    LS.saveState();
    if (LS.applyOutfit) {
      LS.applyOutfit('laila', LS.state.equippedLaila);
      LS.applyOutfit('salma', LS.state.equippedSalma);
    }
    if (LS.closeAllModals) LS.closeAllModals();
    if (LS.loadWorld) LS.loadWorld('tokyo', false);
    LS.updateHUD();
    LS.playSFX('coin');
    LS.showToast('🔄 Progress reset! Welcome to a brand-new adventure, Laila & Salma!');
  };

  // 2-Hour Animal Hide-and-Seek Reset Logic
  LS.checkAnimalReset = function (worldId) {
    const wid = worldId || LS.state.currentWorld;
    const now = Date.now();
    if (wid === 'tokyo' && LS.state.foundCats.length >= 5 && LS.state.catsCompletedAt > 0) {
      if (now - LS.state.catsCompletedAt >= ANIMAL_RESET_MS) {
        LS.state.foundCats = [];
        LS.state.catsCompletedAt = 0;
        LS.state.catsRound = (LS.state.catsRound || 0) + 1;
        LS.saveState();
        return true;
      }
    }
    if (wid === 'kyoto' && LS.state.foundKitsune.length >= 5 && LS.state.kitsuneCompletedAt > 0) {
      if (now - LS.state.kitsuneCompletedAt >= ANIMAL_RESET_MS) {
        LS.state.foundKitsune = [];
        LS.state.kitsuneCompletedAt = 0;
        LS.state.kitsuneRound = (LS.state.kitsuneRound || 0) + 1;
        LS.saveState();
        return true;
      }
    }
    if (wid === 'safari' && LS.state.foundLionCubs.length >= 5 && LS.state.lionCubsCompletedAt > 0) {
      if (now - LS.state.lionCubsCompletedAt >= ANIMAL_RESET_MS) {
        LS.state.foundLionCubs = [];
        LS.state.lionCubsCompletedAt = 0;
        LS.state.lionCubsRound = (LS.state.lionCubsRound || 0) + 1;
        LS.saveState();
        return true;
      }
    }
    return false;
  };

  LS.getAnimalResetRemainingMs = function (worldId) {
    const wid = worldId || LS.state.currentWorld;
    const now = Date.now();
    if (wid === 'tokyo' && LS.state.foundCats.length >= 5 && LS.state.catsCompletedAt > 0) {
      return Math.max(0, ANIMAL_RESET_MS - (now - LS.state.catsCompletedAt));
    }
    if (wid === 'kyoto' && LS.state.foundKitsune.length >= 5 && LS.state.kitsuneCompletedAt > 0) {
      return Math.max(0, ANIMAL_RESET_MS - (now - LS.state.kitsuneCompletedAt));
    }
    if (wid === 'safari' && LS.state.foundLionCubs.length >= 5 && LS.state.lionCubsCompletedAt > 0) {
      return Math.max(0, ANIMAL_RESET_MS - (now - LS.state.lionCubsCompletedAt));
    }
    return 0;
  };

  LS.startNewAnimalRound = function (worldId) {
    const wid = worldId || LS.state.currentWorld;
    if (wid === 'kyoto') {
      LS.state.foundKitsune = [];
      LS.state.kitsuneCompletedAt = 0;
      LS.state.kitsuneRound = (LS.state.kitsuneRound || 0) + 1;
    } else if (wid === 'safari') {
      LS.state.foundLionCubs = [];
      LS.state.lionCubsCompletedAt = 0;
      LS.state.lionCubsRound = (LS.state.lionCubsRound || 0) + 1;
    } else {
      LS.state.foundCats = [];
      LS.state.catsCompletedAt = 0;
      LS.state.catsRound = (LS.state.catsRound || 0) + 1;
    }
    LS.saveState();
    if (LS.state.currentWorld === wid && LS.loadWorld) {
      LS.loadWorld(wid, false);
    }
    LS.playSFX('animal');
    LS.showToast(wid === 'safari'
      ? '🦁 New Hide-and-Seek Round! All 5 Safari Lion Cubs hid in brand-new spots!'
      : (wid === 'kyoto'
        ? '🦊 New Hide-and-Seek Round! All 5 Kyoto Kitsune hid in brand-new spots!'
        : '🐱 New Hide-and-Seek Round! All 5 Tokyo Cats hid in brand-new spots!'));
  };

  // Deterministic seeded pick of 5 hiding spots from a larger curated list based on round number
  LS.pickRoundSpots = function (spotList, roundNum, count) {
    const arr = spotList.slice();
    let s = ((roundNum || 0) + 1) * 7919 + 104729;
    function rnd() {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    }
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr.slice(0, count || 5);
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
    const last = wid === 'safari'
      ? LS.state.lastCompletedWindowSafari
      : (wid === 'kyoto' ? LS.state.lastCompletedWindowKyoto : LS.state.lastCompletedWindowTokyo);
    if (last < cur) return 0;
    const realWindow = Math.floor(Date.now() / QUIZ_WINDOW_MS);
    const nextRealBoundary = (realWindow + 1) * QUIZ_WINDOW_MS;
    return Math.max(0, nextRealBoundary - Date.now());
  };

  LS.markQuizCompleted = function (worldId) {
    const wid = worldId || LS.state.currentWorld;
    const cur = LS.getCurrentQuizWindow();
    if (wid === 'safari') {
      LS.state.lastCompletedWindowSafari = cur;
    } else if (wid === 'kyoto') {
      LS.state.lastCompletedWindowKyoto = cur;
    } else {
      LS.state.lastCompletedWindowTokyo = cur;
      LS.unlockStamp('tokyo_quiz');
    }
    LS.saveState();
  };

  LS.updateHUD = function () {
    const worldMeta = LS.WORLDS[LS.state.currentWorld] || LS.WORLDS.tokyo;
    const isKyotoContext = LS.state.currentWorld === 'kyoto' || LS.state.currentWorld === 'kyoto_room';
    const isSafariContext = LS.state.currentWorld === 'safari';
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
    const mochiHud = document.getElementById('mochi-game-banner');

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
      if (isSafariContext) {
        const sCount = LS.state.foundLionCubs ? LS.state.foundLionCubs.length : 0;
        animalPill.innerHTML = '🦁 <span id="cat-count">' + sCount + '/5</span>';
        animalPill.title = 'Hidden Safari Lion Cubs Found (resets 2h after 5/5)';
      } else if (isKyotoContext) {
        const kCount = LS.state.foundKitsune ? LS.state.foundKitsune.length : 0;
        animalPill.innerHTML = '🦊 <span id="cat-count">' + kCount + '/5</span>';
        animalPill.title = 'Hidden Kyoto Kitsune Foxes Found (resets 2h after 5/5)';
      } else {
        const cCount = LS.state.foundCats ? LS.state.foundCats.length : 0;
        animalPill.innerHTML = '🐱 <span id="cat-count">' + cCount + '/5</span>';
        animalPill.title = 'Hidden Tokyo Cats Found (resets 2h after 5/5)';
      }
    }

    if (toyEl) toyEl.textContent = (LS.state.unlockedToys ? LS.state.unlockedToys.length : 0) + '/' + LS.GACHAPON_TOYS.length;
    if (stampEl) stampEl.textContent = (LS.state.stamps ? LS.state.stamps.length : 0) + '/' + LS.PASSPORT_STAMPS.length;

    if (mochiHud) {
      if (LS.runtime.mochiGame) {
        const mg = LS.runtime.mochiGame;
        mochiHud.textContent = (mg.mode === 'fetch' ? '🎾 Mochi Fetch: ' : '🐕 Mochi Tag: ') +
          Math.ceil(mg.timeLeft) + 's left • Score: ' + mg.score;
        mochiHud.classList.remove('hidden');
      } else {
        mochiHud.classList.add('hidden');
      }
    }

    if (buffPill) {
      const tags = [];
      if (LS.runtime.piggybackUntil && Date.now() < LS.runtime.piggybackUntil) {
        tags.push('👧🧒Piggyback ' + Math.ceil((LS.runtime.piggybackUntil - Date.now()) / 1000) + 's');
      }
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
    toastTimer = setTimeout(() => el.classList.add('hidden'), 3800);
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
    } else if (kind === 'door') {
      LS.playTone(440, 0.1, 'triangle', 0, 0.07);
      LS.playTone(659.25, 0.16, 'triangle', 0.09, 0.07);
    } else if (kind === 'train') {
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
