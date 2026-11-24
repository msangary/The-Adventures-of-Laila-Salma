window.LailaSalma = window.LailaSalma || {};

(function (LS) {
  const TOKYO_GK_POOL = [
    { q: 'Which planet is known as the Red Planet?', opts: ['Mars', 'Venus', 'Jupiter', 'Saturn'], a: 0 },
    { q: 'What is the capital city of Japan?', opts: ['Osaka', 'Kyoto', 'Tokyo', 'Sapporo'], a: 2 },
    { q: 'How many legs does a butterfly have?', opts: ['4', '6', '8', '10'], a: 1 },
    { q: 'Which gas do plants absorb from the air to make food?', opts: ['Oxygen', 'Carbon Dioxide', 'Helium', 'Neon'], a: 1 },
    { q: 'What is the largest ocean on Earth?', opts: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], a: 3 },
    { q: 'Which season do sakura (cherry blossoms) bloom in Japan?', opts: ['Spring', 'Summer', 'Autumn', 'Winter'], a: 0 },
    { q: 'How many continents are there on Earth?', opts: ['5', '6', '7', '8'], a: 2 },
    { q: 'Which animal is the tallest land mammal?', opts: ['Elephant', 'Giraffe', 'Camel', 'Horse'], a: 1 },
    { q: 'What colors make green when mixed together?', opts: ['Red & Blue', 'Blue & Yellow', 'Red & Yellow', 'Blue & White'], a: 1 },
    { q: 'How many days are in a leap year?', opts: ['364', '365', '366', '367'], a: 2 },
    { q: 'Which organ pumps blood through your body?', opts: ['Lungs', 'Brain', 'Heart', 'Stomach'], a: 2 },
    { q: 'What is the freezing point of water in Celsius?', opts: ['0°C', '10°C', '32°C', '100°C'], a: 0 }
  ];

  const KYOTO_GK_POOL = [
    { q: 'What famous high-speed train connects Tokyo and Kyoto?', opts: ['Shinkansen', 'Submarine', 'Cable Car', 'Gondola'], a: 0 },
    { q: 'What is the name of the tall red gate at a Japanese shrine?', opts: ['Tatami', 'Torii', 'Bento', 'Origami'], a: 1 },
    { q: 'Which tall green plant grows in Kyoto’s Arashiyama Grove?', opts: ['Cactus', 'Bamboo', 'Palm Tree', 'Oak'], a: 1 },
    { q: 'What friendly animal is the messenger of Inari shrines in Kyoto?', opts: ['Kitsune (Fox)', 'Penguin', 'Kangaroo', 'Giraffe'], a: 0 },
    { q: 'What colorful fish swims in Japanese temple ponds?', opts: ['Shark', 'Koi', 'Tuna', 'Whale'], a: 1 },
    { q: 'What is the green tea powder famous in Uji, near Kyoto?', opts: ['Matcha', 'Cocoa', 'Vanilla', 'Cinnamon'], a: 0 },
    { q: 'What wooden wish plaque do visitors hang at shrines?', opts: ['Ema', 'Sushi', 'Kimono', 'Origami'], a: 0 },
    { q: 'What is a traditional Japanese inn with tatami mats called?', opts: ['Igloo', 'Ryokan', 'Castle', 'Lighthouse'], a: 1 },
    { q: 'What paper fortune slip do people draw at shrines?', opts: ['Omikuji', 'Ramen', 'Gachapon', 'Shiba'], a: 0 },
    { q: 'Which city was Japan’s ancient imperial capital for over 1,000 years?', opts: ['Kyoto', 'Sapporo', 'Okinawa', 'Yokohama'], a: 0 }
  ];

  // Salma-friendly Age-5 Picture Quiz Pool (big visual emojis + simple counting/matching)
  const SALMA_POOL = [
    { q: '🐱🐱 + 🐱 = How many kitties altogether?', opts: ['2 🐱', '3 🐱', '4 🐱', '5 🐱'], a: 1 },
    { q: '🦊 Which animal is a cute orange fox?', opts: ['🐕 Dog', '🐱 Cat', '🦊 Fox', '🦆 Duck'], a: 2 },
    { q: '🍓 What color is a sweet strawberry?', opts: ['🔴 Red', '🔵 Blue', '🟡 Yellow', '🟢 Green'], a: 0 },
    { q: '🐟🐟🐟 + 🐟 = How many koi fish in the pond?', opts: ['2 🐟', '3 🐟', '4 🐟', '6 🐟'], a: 2 },
    { q: '🚅 Which one zooms on train tracks?', opts: ['⛵ Boat', '🚅 Bullet Train', '🚲 Bike', '🎈 Balloon'], a: 1 },
    { q: '🌸 What color are cherry blossom petals?', opts: ['🩷 Pink', '⚫ Black', '🟢 Green', '🟤 Brown'], a: 0 },
    { q: '🍜 Which yummy treat has hot noodles?', opts: ['🍎 Apple', '🍜 Ramen', '🍦 Ice Cream', '🧀 Cheese'], a: 1 },
    { q: '🎋 Which plant grows super tall and green?', opts: ['🎋 Bamboo', '🌷 Tulip', '🍄 Mushroom', '🌻 Sunflower'], a: 0 },
    { q: '🦆 What sound does a happy lake duck make?', opts: ['Meow!', 'Woof!', 'Quack!', 'Moo!'], a: 2 },
    { q: '⭐ + ⭐⭐ = How many shiny stars?', opts: ['1 ⭐', '2 ⭐', '3 ⭐', '5 ⭐'], a: 2 }
  ];

  const OMIKUJI_FORTUNES = [
    { rank: '大吉 • Dai-kichi (GREAT LUCK!)', emoji: '🌟', text: 'Sparkling adventures await Laila & Salma! A hidden friend is smiling nearby!', bonusCoins: 25, bonusXp: 20 },
    { rank: '中吉 • Chu-kichi (Middle Luck!)', emoji: '🌸', text: 'A sweet treat and a sister high-five will bring extra speed and giggles today!', bonusCoins: 18, bonusXp: 15 },
    { rank: '小吉 • Sho-kichi (Cozy Luck!)', emoji: '🎋', text: 'Take a peaceful walk by the koi pond — good things come to kind explorers!', bonusCoins: 15, bonusXp: 12 },
    { rank: '吉 • Kichi (Happy Luck!)', emoji: '🦊', text: 'The playful kitsune foxes bless your Travel Passport with bright new stamps!', bonusCoins: 20, bonusXp: 15 }
  ];

  const RAMEN_CATALOG = {
    shoyu: { name: 'Shoyu Ramen', short: 'Speed+', cost: 40, speedMult: 1.2, infiniteStamina: false, durationMs: 180000, bonusXp: 0 },
    miso: { name: 'Miso Ramen', short: 'Inf.Run', cost: 60, speedMult: 1.1, infiniteStamina: true, durationMs: 180000, bonusXp: 0 },
    tonkotsu: { name: 'Special Tonkotsu', short: 'Turbo', cost: 90, speedMult: 1.3, infiniteStamina: true, durationMs: 240000, bonusXp: 25 }
  };

  const SUSHI_CATALOG = {
    tamago: { name: 'Sweet Tamago Sushi', short: 'Speed+', cost: 35, speedMult: 1.2, infiniteStamina: false, durationMs: 180000, bonusXp: 5 },
    salmon: { name: 'Fresh Salmon Nigiri', short: 'Inf.Run', cost: 55, speedMult: 1.15, infiniteStamina: true, durationMs: 180000, bonusXp: 10 },
    sushi_boat: { name: 'Royal Kyoto Sushi Boat ⭐', short: 'Kyoto⚡', cost: 85, speedMult: 1.32, infiniteStamina: true, durationMs: 240000, bonusXp: 25 }
  };

  function seededRand(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function generateQuiz(seed, worldId, salmaMode) {
    const rng = seededRand(seed);
    const questions = [];

    if (salmaMode) {
      const pool = SALMA_POOL.slice();
      for (let i = 0; i < 4; i++) {
        const idx = Math.floor(rng() * pool.length);
        const item = pool.splice(idx, 1)[0];
        questions.push({ cat: "Salma's Picture Quiz 🌈", q: item.q, opts: item.opts, a: item.a });
      }
      return questions;
    }

    const pool = (worldId === 'kyoto' ? KYOTO_GK_POOL : TOKYO_GK_POOL).slice();
    const catName = worldId === 'kyoto' ? 'Kyoto Discovery' : 'General Knowledge';
    for (let i = 0; i < 3; i++) {
      const idx = Math.floor(rng() * pool.length);
      const item = pool.splice(idx, 1)[0];
      questions.push({ cat: catName, q: item.q, opts: item.opts, a: item.a });
    }

    for (let i = 0; i < 2; i++) {
      const a = 4 + Math.floor(rng() * 18);
      const b = 3 + Math.floor(rng() * 14);
      const isAdd = rng() > 0.4;
      const ans = isAdd ? a + b : (a + b) - b;
      const qText = isAdd ? ('What is ' + a + ' + ' + b + '?') : ('What is ' + (a + b) + ' - ' + b + '?');
      const set = new Set([ans]);
      while (set.size < 4) {
        const delta = Math.floor(rng() * 9) - 4;
        if (ans + delta >= 0) set.add(ans + delta);
      }
      const opts = Array.from(set).sort(() => rng() - 0.5);
      questions.push({ cat: 'Math', q: qText, opts: opts.map(String), a: opts.indexOf(ans) });
    }
    return questions;
  }

  let activeQuiz = null;
  let activeQuizWorld = 'tokyo';
  let timerInterval = null;
  let activeShopTab = 'laila';
  let activeShopFilter = 'all';
  let activeRoomTab = 'wallpaper';
  let activeRyokanTab = 'tatami';

  function formatMs(ms) {
    const total = Math.ceil(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return h + 'h ' + String(m).padStart(2, '0') + 'm ' + String(s).padStart(2, '0') + 's';
  }

  function refreshSchoolLobby() {
    const cd = LS.getQuizCooldownMs(activeQuizWorld);
    const box = document.getElementById('quiz-timer-box');
    const startBtn = document.getElementById('btn-start-quiz');
    const salmaBtn = document.getElementById('btn-salma-quiz');
    if (cd <= 0) {
      box.innerHTML = '✅ <strong>New 2-Hour Quiz Ready!</strong> Earn up to <strong>+60 XP</strong> &amp; <strong>+75c</strong>.';
      startBtn.disabled = false;
      if (salmaBtn) salmaBtn.disabled = false;
    } else {
      box.innerHTML = '⏳ Next graded quiz refreshes in <strong>' + formatMs(cd) + '</strong>. Practice Mode is always open!';
      startBtn.disabled = true;
      if (salmaBtn) salmaBtn.disabled = false; // Salma's Picture Quiz can always be played for gentle fun!
    }
  }

  LS.openSchoolModal = function (worldId) {
    activeQuizWorld = worldId || LS.state.currentWorld;
    LS.runtime.modalOpen = true;
    const titleEl = document.getElementById('school-modal-title');
    const backBtn = document.getElementById('btn-school-back');
    if (titleEl) {
      titleEl.textContent = activeQuizWorld === 'kyoto'
        ? '📚 Kyoto Temple Academy — Quiz'
        : '🏫 Sakura Elementary — Quiz';
    }
    if (backBtn) {
      backBtn.textContent = activeQuizWorld === 'kyoto' ? 'Back to Kyoto' : 'Back to Tokyo';
    }
    document.getElementById('school-modal').classList.remove('hidden');
    document.getElementById('school-lobby').classList.remove('hidden');
    document.getElementById('school-question').classList.add('hidden');
    document.getElementById('school-report').classList.add('hidden');
    refreshSchoolLobby();
    clearInterval(timerInterval);
    timerInterval = setInterval(refreshSchoolLobby, 1000);
  };

  function renderQuestion() {
    const qObj = activeQuiz.questions[activeQuiz.index];
    document.getElementById('q-progress').textContent = 'Question ' + (activeQuiz.index + 1) + ' / ' + activeQuiz.questions.length;
    document.getElementById('q-category').textContent = qObj.cat;
    document.getElementById('q-text').textContent = qObj.q;

    const fb = document.getElementById('q-feedback');
    fb.classList.add('hidden');

    const grid = document.getElementById('q-options');
    grid.innerHTML = '';
    qObj.opts.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt;
      btn.onclick = () => handleAnswer(idx, btn);
      grid.appendChild(btn);
    });
  }

  function handleAnswer(idx, btn) {
    if (activeQuiz.locked) return;
    activeQuiz.locked = true;
    const qObj = activeQuiz.questions[activeQuiz.index];
    const buttons = document.querySelectorAll('#q-options .option-btn');
    const fb = document.getElementById('q-feedback');
    fb.classList.remove('hidden');

    if (idx === qObj.a) {
      activeQuiz.score += 1;
      btn.classList.add('correct');
      fb.textContent = '🌟 Great job, Laila & Salma! That is correct!';
      LS.playSFX('correct');
    } else {
      btn.classList.add('wrong');
      if (buttons[qObj.a]) buttons[qObj.a].classList.add('correct');
      fb.textContent = '💡 Good try! The right answer is: ' + qObj.opts[qObj.a];
      LS.playSFX('wrong');
    }

    setTimeout(() => {
      activeQuiz.index += 1;
      activeQuiz.locked = false;
      if (activeQuiz.index < activeQuiz.questions.length) {
        renderQuestion();
      } else {
        finishQuiz();
      }
    }, 1050);
  }

  function finishQuiz() {
    document.getElementById('school-question').classList.add('hidden');
    document.getElementById('school-report').classList.remove('hidden');

    const total = activeQuiz.questions.length;
    const s = activeQuiz.score;
    const tag = activeQuiz.salmaMode ? " (Salma's Picture Quiz 🌈)" : (activeQuiz.practice ? ' (Practice Mode)' : '');
    document.getElementById('report-summary').textContent =
      'Laila & Salma scored ' + s + ' out of ' + total + tag + '!';

    const rew = document.getElementById('report-rewards');
    if (activeQuiz.salmaMode) {
      const cGain = 15 + s * 6;
      const xGain = 12 + s * 6;
      LS.addCoins(cGain);
      LS.addXP(xGain);
      rew.innerHTML = '🌈 Amazing work, Salma & Laila! Earned <strong>+' + xGain + ' XP</strong> and <strong>+' + cGain + ' Coins</strong>!';
    } else if (activeQuiz.practice) {
      rew.innerHTML = '📝 Practice complete! Come back when the 2-hour timer refreshes for graded XP &amp; Coins.';
    } else {
      const xpGain = 15 + s * 9;
      const coinGain = 20 + s * 11;
      LS.markQuizCompleted(activeQuizWorld);
      LS.addCoins(coinGain);
      LS.addXP(xpGain);
      rew.innerHTML = '✨ Earned <strong>+' + xpGain + ' XP</strong> and <strong>+' + coinGain + ' Coins</strong>!';
    }
  }

  // Travel Passport & World Map
  LS.openPassportModal = function () {
    LS.runtime.modalOpen = true;
    const worldsBox = document.getElementById('passport-worlds');
    const stampsBox = document.getElementById('passport-stamps');
    if (worldsBox) {
      worldsBox.innerHTML = '';
      ['tokyo', 'kyoto'].forEach(wid => {
        const w = LS.WORLDS[wid];
        const isHere = LS.state.currentWorld === wid;
        const foundCount = wid === 'kyoto' ? LS.state.foundKitsune.length : LS.state.foundCats.length;
        const remMs = LS.getAnimalResetRemainingMs(wid);
        const resetHtml = foundCount >= 5
          ? ('<div class="ramen-desc" style="color:#1b7a43;font-weight:700;">✨ All 5 found! New hiding spots in ' +
             (remMs > 0 ? formatMs(remMs) : 'Ready now!') + '</div>')
          : '';
        const card = document.createElement('div');
        card.className = 'passport-world-card' + (isHere ? ' current-world' : '');
        card.innerHTML =
          '<div class="pw-head">' +
            '<div><strong>' + w.emoji + ' ' + w.title + '</strong> <span class="pw-sub">' + w.subtitle + '</span></div>' +
            '<span class="pw-progress">' + w.collectibleEmoji + ' ' + foundCount + '/5</span>' +
          '</div>' +
          '<p class="ramen-desc">' + w.description + '</p>' + resetHtml;

        const actions = document.createElement('div');
        actions.className = 'modal-actions';
        const btn = document.createElement('button');
        if (isHere) {
          btn.className = 'btn-secondary';
          btn.textContent = 'Currently Here ✓';
          btn.disabled = true;
        } else {
          btn.className = 'btn-primary';
          btn.textContent = '🚅 Ride Shinkansen to ' + w.title;
          btn.onclick = () => LS.travelToWorld(wid);
        }
        actions.appendChild(btn);

        if (foundCount >= 5) {
          const resetBtn = document.createElement('button');
          resetBtn.className = 'btn-small';
          resetBtn.textContent = '🔄 Hide in New Spots Now';
          resetBtn.onclick = () => {
            LS.closeAllModals();
            LS.startNewAnimalRound(wid);
          };
          actions.appendChild(resetBtn);
        }
        card.appendChild(actions);
        worldsBox.appendChild(card);
      });

      const airportNote = document.createElement('div');
      airportNote.className = 'passport-world-card upcoming-world';
      airportNote.innerHTML =
        '<div class="pw-head"><div><strong>✈️ Haneda International Airport (Tokyo)</strong></div><span class="pw-soon">9 Future Cities</span></div>' +
        '<p class="ramen-desc">Upcoming flights: ' + LS.UPCOMING_WORLDS.map(u => u.emoji + ' ' + u.title).join(' • ') + '</p>';
      worldsBox.appendChild(airportNote);
    }

    if (stampsBox) {
      stampsBox.innerHTML = '';
      LS.PASSPORT_STAMPS.forEach(st => {
        const earned = LS.state.stamps.includes(st.id);
        const el = document.createElement('div');
        el.className = 'stamp-slot ' + (earned ? 'earned' : 'locked');
        el.title = st.desc;
        el.innerHTML =
          '<div class="stamp-emoji">' + (earned ? st.emoji : '⬜') + '</div>' +
          '<div class="stamp-name">' + (earned ? st.title : 'Locked Stamp') + '</div>';
        stampsBox.appendChild(el);
      });
    }
    document.getElementById('passport-modal').classList.remove('hidden');
  };

  // Haneda-Tokyo International Airport Departures Board
  LS.openAirportModal = function () {
    LS.runtime.modalOpen = true;
    LS.unlockStamp('tokyo_airport');
    const grid = document.getElementById('airport-flights-grid');
    if (grid) {
      grid.innerHTML = '';
      LS.UPCOMING_WORLDS.forEach(uw => {
        const row = document.createElement('div');
        row.className = 'ramen-item';
        row.innerHTML =
          '<div>' +
            '<strong>' + uw.emoji + ' ' + uw.title + '</strong> <span class="pw-soon">' + uw.gate + '</span>' +
            '<div class="ramen-desc">' + uw.description + '</div>' +
          '</div>' +
          '<span class="pw-soon">Coming Soon ✈️</span>';
        grid.appendChild(row);
      });
    }
    document.getElementById('airport-modal').classList.remove('hidden');
  };

  LS.openShinkansenModal = function () {
    LS.runtime.modalOpen = true;
    const cur = LS.WORLDS[LS.state.currentWorld];
    const dest = LS.WORLDS[cur.destinationId];
    document.getElementById('shinkansen-title').textContent = '🚅 ' + cur.title + ' Shinkansen Station';
    document.getElementById('shinkansen-desc').textContent =
      'All aboard the N700S Bullet Train! Ride from ' + cur.title + ' to ' + dest.title + ' (' + dest.subtitle + ') with Laila, Salma & Mochi — all your coins, outfits, toys, and Passport stamps come with you!';
    const goBtn = document.getElementById('btn-board-shinkansen');
    goBtn.textContent = '🚅 Depart for ' + dest.emoji + ' ' + dest.title + '!';
    goBtn.onclick = () => LS.travelToWorld(dest.id);
    document.getElementById('shinkansen-modal').classList.remove('hidden');
  };

  LS.openRamenModal = function () {
    LS.runtime.modalOpen = true;
    document.getElementById('ramen-msg').textContent = '';
    document.getElementById('ramen-modal').classList.remove('hidden');
  };

  LS.openSushiModal = function () {
    LS.runtime.modalOpen = true;
    document.getElementById('sushi-msg').textContent = '';
    document.getElementById('sushi-modal').classList.remove('hidden');
  };

  LS.openTeaHouseModal = function () {
    LS.runtime.modalOpen = true;
    document.getElementById('tea-msg').textContent = '';
    document.getElementById('tea-modal').classList.remove('hidden');
  };

  function renderShopItems() {
    const grid = document.getElementById('shop-items-grid');
    const msgEl = document.getElementById('shop-msg');
    if (!grid) return;
    grid.innerHTML = '';

    document.getElementById('tab-laila').classList.toggle('active', activeShopTab === 'laila');
    document.getElementById('tab-salma').classList.toggle('active', activeShopTab === 'salma');

    const equippedId = activeShopTab === 'laila' ? LS.state.equippedLaila : LS.state.equippedSalma;
    const list = LS.OUTFITS.filter(o =>
      o.who === activeShopTab && (activeShopFilter === 'all' || o.shop === activeShopFilter)
    );

    list.forEach(item => {
      const unlocked = LS.state.unlockedOutfits.includes(item.id);
      const isEquipped = equippedId === item.id;

      const row = document.createElement('div');
      row.className = 'shop-item' + (isEquipped ? ' equipped' : '');

      const originTag = item.shop === 'kyoto' ? '⛩️' : '🗼';
      const info = document.createElement('div');
      info.innerHTML =
        '<strong><span class="swatch-dot" style="background:' + item.swatch + '"></span>' + item.name + ' ' + originTag + '</strong>' +
        '<div class="ramen-desc">' + item.desc + '</div>';

      const btn = document.createElement('button');
      if (isEquipped) {
        btn.className = 'btn-secondary';
        btn.textContent = 'Equipped ✓';
        btn.disabled = true;
      } else if (unlocked) {
        btn.className = 'btn-primary';
        btn.textContent = 'Wear';
        btn.onclick = () => {
          if (activeShopTab === 'laila') LS.state.equippedLaila = item.id;
          else LS.state.equippedSalma = item.id;
          LS.saveState();
          LS.applyOutfit(activeShopTab, item.id);
          LS.playSFX('coin');
          msgEl.textContent = '';
          renderShopItems();
          LS.showToast('✨ Equipped ' + item.name + '!');
        };
      } else {
        btn.className = 'btn-primary';
        btn.textContent = item.cost + 'c';
        btn.onclick = () => {
          if (LS.state.coins < item.cost) {
            msgEl.textContent = 'Not enough coins! Find hidden friends, feed koi, or take a quiz.';
            LS.playSFX('wrong');
            return;
          }
          LS.addCoins(-item.cost);
          LS.state.unlockedOutfits.push(item.id);
          if (activeShopTab === 'laila') LS.state.equippedLaila = item.id;
          else LS.state.equippedSalma = item.id;
          LS.saveState();
          LS.applyOutfit(activeShopTab, item.id);
          LS.playSFX('correct');
          msgEl.textContent = '';
          renderShopItems();
          LS.showToast('🎀 Unlocked & wearing ' + item.name + '!');
        };
      }

      row.appendChild(info);
      row.appendChild(btn);
      grid.appendChild(row);
    });
  }

  LS.openShopModal = function (shopStyle) {
    LS.runtime.modalOpen = true;
    activeShopFilter = shopStyle || 'all';
    const titleEl = document.getElementById('shop-modal-title');
    const subEl = document.getElementById('shop-modal-sub');
    if (titleEl) {
      titleEl.textContent = shopStyle === 'kyoto'
        ? '👘 Kyoto Kimono & Fox Mask Boutique'
        : '🎀 Harajuku Kiosk — Outfits & Hats';
    }
    if (subEl) {
      subEl.textContent = shopStyle === 'kyoto'
        ? '“Irasshaimase, Laila & Salma! Try silk kimonos & festival fox masks — all outfits travel between Kyoto & Tokyo!”'
        : '“Konnichiwa, Laila & Salma! Spend your coins on stylish outfits & hats — all outfits travel between Tokyo & Kyoto!”';
    }
    document.getElementById('shop-msg').textContent = '';
    renderShopItems();
    document.getElementById('shop-modal').classList.remove('hidden');
  };

  let activeGachaponWorld = 'tokyo';
  function renderGachaponShelf() {
    const shelf = document.getElementById('gachapon-shelf');
    if (!shelf) return;
    shelf.innerHTML = '';
    LS.GACHAPON_TOYS.forEach(toy => {
      const owned = LS.state.unlockedToys.includes(toy.id);
      const card = document.createElement('div');
      card.className = 'toy-slot ' + (owned ? 'owned' : 'locked');
      const wBadge = toy.world === 'kyoto' ? '⛩️' : '🗼';
      card.innerHTML =
        '<div class="toy-emoji">' + (owned ? toy.emoji : '❓') + '</div>' +
        '<div class="toy-name">' + (owned ? (toy.name + ' ' + wBadge) : ('Mystery ' + wBadge)) + '</div>';
      shelf.appendChild(card);
    });
  }

  LS.openGachaponModal = function (machineWorld) {
    LS.runtime.modalOpen = true;
    activeGachaponWorld = machineWorld || LS.state.currentWorld;
    const titleEl = document.getElementById('gachapon-title');
    const spinBtn = document.getElementById('btn-spin-gachapon');
    if (titleEl) {
      titleEl.textContent = activeGachaponWorld === 'all'
        ? '🎁 Toy Shelf & Sticker Album (' + LS.state.unlockedToys.length + '/' + LS.GACHAPON_TOYS.length + ')'
        : (activeGachaponWorld === 'kyoto' ? '🎁 Kyoto Gachapon Capsule Machine' : '🎁 Tokyo Gachapon Capsule Machine');
    }
    if (spinBtn) {
      spinBtn.classList.toggle('hidden', activeGachaponWorld === 'all');
      spinBtn.textContent = activeGachaponWorld === 'kyoto' ? '🎰 Spin Kyoto Capsule (15c)' : '🎰 Spin Tokyo Capsule (15c)';
    }
    document.getElementById('gachapon-msg').textContent = '';
    renderGachaponShelf();
    document.getElementById('gachapon-modal').classList.remove('hidden');
  };

  LS.openDrinkVendingModal = function () {
    LS.runtime.modalOpen = true;
    document.getElementById('drink-msg').textContent = '';
    document.getElementById('drink-modal').classList.remove('hidden');
  };

  LS.openMochiModal = function () {
    LS.runtime.modalOpen = true;
    document.getElementById('mochi-msg').textContent = '';
    document.getElementById('mochi-modal').classList.remove('hidden');
  };

  function renderClubhousePreview() {
    const preview = document.getElementById('clubhouse-preview');
    const catsRow = document.getElementById('clubhouse-cats-shelf');
    const grid = document.getElementById('clubhouse-items-grid');
    const msgEl = document.getElementById('clubhouse-msg');
    if (!preview || !grid) return;

    const wp = LS.ROOM_WALLPAPERS.find(w => w.id === LS.state.roomWallpaper) || LS.ROOM_WALLPAPERS[0];
    const bb = LS.ROOM_BEANBAGS.find(b => b.id === LS.state.roomBeanbag) || LS.ROOM_BEANBAGS[0];
    const po = LS.ROOM_POSTERS.find(p => p.id === LS.state.roomPoster) || LS.ROOM_POSTERS[0];

    preview.style.background = wp.color;
    preview.style.borderColor = wp.accent;
    preview.innerHTML =
      '<div class="room-poster-banner">' + po.label + '</div>' +
      '<div class="room-stage-row">' +
        '<span class="room-pill">👧 Laila</span>' +
        '<span class="room-beanbag" style="background:' + bb.color + '">🛋️ ' + bb.name + '</span>' +
        '<span class="room-pill">🧒 Salma</span>' +
      '</div>';

    if (catsRow) {
      const catNames = { cat_mikan: '🐱 Mikan', cat_kuro: '🐱 Kuro', cat_yuki: '🐱 Yuki', cat_sakura: '🐱 Sakura', cat_tama: '🐱 Tama' };
      const found = LS.state.foundCats || [];
      catsRow.innerHTML = '<strong>Tokyo Cats Cushion (' + found.length + '/5):</strong> ' +
        Object.keys(catNames).map(cid =>
          '<span class="cat-shelf-badge ' + (found.includes(cid) ? 'found' : '') + '">' +
          (found.includes(cid) ? catNames[cid] : '🐾 ???') + '</span>'
        ).join(' ');
    }

    document.getElementById('rtab-wallpaper').classList.toggle('active', activeRoomTab === 'wallpaper');
    document.getElementById('rtab-beanbag').classList.toggle('active', activeRoomTab === 'beanbag');
    document.getElementById('rtab-poster').classList.toggle('active', activeRoomTab === 'poster');

    const sourceList = activeRoomTab === 'wallpaper'
      ? LS.ROOM_WALLPAPERS
      : (activeRoomTab === 'beanbag' ? LS.ROOM_BEANBAGS : LS.ROOM_POSTERS);

    const activeId = activeRoomTab === 'wallpaper'
      ? LS.state.roomWallpaper
      : (activeRoomTab === 'beanbag' ? LS.state.roomBeanbag : LS.state.roomPoster);

    grid.innerHTML = '';
    sourceList.forEach(item => {
      const unlocked = LS.state.unlockedRoomItems.includes(item.id);
      const isActive = activeId === item.id;
      const row = document.createElement('div');
      row.className = 'shop-item' + (isActive ? ' equipped' : '');

      const dotHtml = item.color ? '<span class="swatch-dot" style="background:' + item.color + '"></span>' : '🖼️ ';
      const info = document.createElement('div');
      info.innerHTML = '<strong>' + dotHtml + item.name + '</strong>';

      const btn = document.createElement('button');
      if (isActive) {
        btn.className = 'btn-secondary'; btn.textContent = 'In Room ✓'; btn.disabled = true;
      } else if (unlocked) {
        btn.className = 'btn-primary'; btn.textContent = 'Place';
        btn.onclick = () => {
          if (activeRoomTab === 'wallpaper') LS.state.roomWallpaper = item.id;
          else if (activeRoomTab === 'beanbag') LS.state.roomBeanbag = item.id;
          else LS.state.roomPoster = item.id;
          LS.saveState();
          if (LS.activeWorld && LS.activeWorld.refreshDecor) LS.activeWorld.refreshDecor();
          msgEl.textContent = ''; renderClubhousePreview();
          LS.showToast('🏡 Updated 3D Room with ' + item.name + '!');
        };
      } else {
        btn.className = 'btn-primary'; btn.textContent = item.cost + 'c';
        btn.onclick = () => {
          if (LS.state.coins < item.cost) {
            msgEl.textContent = 'Need more coins! Try quizzes, hidden animals, or Mochi.';
            LS.playSFX('wrong'); return;
          }
          LS.addCoins(-item.cost);
          LS.state.unlockedRoomItems.push(item.id);
          if (activeRoomTab === 'wallpaper') LS.state.roomWallpaper = item.id;
          else if (activeRoomTab === 'beanbag') LS.state.roomBeanbag = item.id;
          else LS.state.roomPoster = item.id;
          LS.saveState();
          if (LS.activeWorld && LS.activeWorld.refreshDecor) LS.activeWorld.refreshDecor();
          LS.playSFX('correct'); msgEl.textContent = ''; renderClubhousePreview();
          LS.showToast('🏡 Added ' + item.name + " to Laila & Salma's 3D Room!");
        };
      }
      row.appendChild(info); row.appendChild(btn); grid.appendChild(row);
    });
  }

  LS.openClubhouseModal = function () {
    LS.runtime.modalOpen = true;
    document.getElementById('clubhouse-msg').textContent = '';
    renderClubhousePreview();
    document.getElementById('clubhouse-modal').classList.remove('hidden');
  };

  function renderRyokanPreview() {
    const preview = document.getElementById('ryokan-preview');
    const shelf = document.getElementById('ryokan-fox-shelf');
    const grid = document.getElementById('ryokan-items-grid');
    const msgEl = document.getElementById('ryokan-msg');
    if (!preview || !grid) return;

    const tat = LS.RYOKAN_TATAMI.find(t => t.id === LS.state.ryokanTatami) || LS.RYOKAN_TATAMI[0];
    const cush = LS.RYOKAN_CUSHIONS.find(c => c.id === LS.state.ryokanCushion) || LS.RYOKAN_CUSHIONS[0];
    const scr = LS.RYOKAN_SCROLLS.find(s => s.id === LS.state.ryokanScroll) || LS.RYOKAN_SCROLLS[0];

    preview.style.background = tat.color;
    preview.style.borderColor = tat.accent;
    preview.innerHTML =
      '<div class="room-poster-banner">' + scr.label + '</div>' +
      '<div class="room-stage-row">' +
        '<span class="room-pill">👧 Laila</span>' +
        '<span class="room-beanbag" style="background:' + cush.color + '">🏮 ' + cush.name + '</span>' +
        '<span class="room-pill">🧒 Salma</span>' +
      '</div>';

    if (shelf) {
      const foxNames = {
        kitsune_inari: '🦊 Inari', kitsune_take: '🦊 Take', kitsune_kawa: '🦊 Kawa',
        kitsune_matcha: '🦊 Matcha', kitsune_sakura: '🦊 Sakura'
      };
      const found = LS.state.foundKitsune || [];
      shelf.innerHTML = '<strong>Kyoto Kitsune Friends (' + found.length + '/5):</strong> ' +
        Object.keys(foxNames).map(fid =>
          '<span class="cat-shelf-badge ' + (found.includes(fid) ? 'found' : '') + '">' +
          (found.includes(fid) ? foxNames[fid] : '🦊 ???') + '</span>'
        ).join(' ');
    }

    document.getElementById('kytab-tatami').classList.toggle('active', activeRyokanTab === 'tatami');
    document.getElementById('kytab-cushion').classList.toggle('active', activeRyokanTab === 'cushion');
    document.getElementById('kytab-scroll').classList.toggle('active', activeRyokanTab === 'scroll');

    const sourceList = activeRyokanTab === 'tatami'
      ? LS.RYOKAN_TATAMI
      : (activeRyokanTab === 'cushion' ? LS.RYOKAN_CUSHIONS : LS.RYOKAN_SCROLLS);

    const activeId = activeRyokanTab === 'tatami'
      ? LS.state.ryokanTatami
      : (activeRyokanTab === 'cushion' ? LS.state.ryokanCushion : LS.state.ryokanScroll);

    grid.innerHTML = '';
    sourceList.forEach(item => {
      const unlocked = LS.state.unlockedRyokanItems.includes(item.id);
      const isActive = activeId === item.id;
      const row = document.createElement('div');
      row.className = 'shop-item' + (isActive ? ' equipped' : '');
      const dotHtml = item.color ? '<span class="swatch-dot" style="background:' + item.color + '"></span>' : '📜 ';
      const info = document.createElement('div');
      info.innerHTML = '<strong>' + dotHtml + item.name + '</strong>';
      const btn = document.createElement('button');
      if (isActive) {
        btn.className = 'btn-secondary'; btn.textContent = 'In Suite ✓'; btn.disabled = true;
      } else if (unlocked) {
        btn.className = 'btn-primary'; btn.textContent = 'Place';
        btn.onclick = () => {
          if (activeRyokanTab === 'tatami') LS.state.ryokanTatami = item.id;
          else if (activeRyokanTab === 'cushion') LS.state.ryokanCushion = item.id;
          else LS.state.ryokanScroll = item.id;
          LS.saveState();
          if (LS.activeWorld && LS.activeWorld.refreshDecor) LS.activeWorld.refreshDecor();
          msgEl.textContent = ''; renderRyokanPreview();
          LS.showToast('🏮 Updated 3D Kyoto Ryokan with ' + item.name + '!');
        };
      } else {
        btn.className = 'btn-primary'; btn.textContent = item.cost + 'c';
        btn.onclick = () => {
          if (LS.state.coins < item.cost) {
            msgEl.textContent = 'Need more coins! Feed koi, draw fortunes, or find kitsune foxes.';
            LS.playSFX('wrong'); return;
          }
          LS.addCoins(-item.cost);
          LS.state.unlockedRyokanItems.push(item.id);
          if (activeRyokanTab === 'tatami') LS.state.ryokanTatami = item.id;
          else if (activeRyokanTab === 'cushion') LS.state.ryokanCushion = item.id;
          else LS.state.ryokanScroll = item.id;
          LS.saveState();
          if (LS.activeWorld && LS.activeWorld.refreshDecor) LS.activeWorld.refreshDecor();
          LS.playSFX('correct'); msgEl.textContent = ''; renderRyokanPreview();
          LS.showToast('🏮 Added ' + item.name + ' to your 3D Kyoto Ryokan Suite!');
        };
      }
      row.appendChild(info); row.appendChild(btn); grid.appendChild(row);
    });
  }

  LS.openRyokanModal = function () {
    LS.runtime.modalOpen = true;
    document.getElementById('ryokan-msg').textContent = '';
    renderRyokanPreview();
    document.getElementById('ryokan-modal').classList.remove('hidden');
  };

  function renderShrineWishes() {
    const listEl = document.getElementById('ema-wishes-list');
    if (!listEl) return;
    if (!LS.state.emaWishes || LS.state.emaWishes.length === 0) {
      listEl.innerHTML = '<div class="ramen-desc">No Ema plaques hung yet — pick or write a wish below!</div>';
      return;
    }
    listEl.innerHTML = LS.state.emaWishes.slice(-4).reverse().map(w =>
      '<span class="ema-plaque-pill">🪵 ' + w + '</span>'
    ).join(' ');
  }

  LS.openShrineModal = function () {
    LS.runtime.modalOpen = true;
    const fBox = document.getElementById('omikuji-result');
    if (fBox) {
      if (LS.state.lastFortune) {
        fBox.innerHTML = '<strong>' + LS.state.lastFortune.emoji + ' ' + LS.state.lastFortune.rank + '</strong><div>' + LS.state.lastFortune.text + '</div>';
      } else {
        fBox.innerHTML = 'Shake the lucky red fortune box to reveal Laila &amp; Salma’s Kyoto fortune!';
      }
    }
    renderShrineWishes();
    document.getElementById('shrine-modal').classList.remove('hidden');
  };

  LS.feedKoiAndDucks = function () {
    LS.runtime.koiFeedTimer = 5.5;
    LS.state.koiFedCount = (LS.state.koiFedCount || 0) + 1;
    LS.addCoins(15);
    LS.addXP(12);
    LS.unlockStamp('kyoto_koi');
    LS.playSFX('splash');
    LS.showToast('🐟🦆 Splash! The koi fish & ducks swim over happily! +15c & +12 XP!');
  };

  LS.petHiddenAnimal = function (animalId) {
    const world = LS.activeWorld;
    if (!world || !world.hiddenAnimals) return;
    const animal = world.hiddenAnimals.find(a => a.id === animalId);
    if (!animal || animal.found) return;

    animal.found = true;
    if (animal.marker) animal.marker.visible = false;

    const isKitsune = animal.kind === 'kitsune';
    const arr = isKitsune ? LS.state.foundKitsune : LS.state.foundCats;
    if (!arr.includes(animalId)) arr.push(animalId);

    world.zones = world.zones.filter(z => z.id !== 'animal:' + animalId);
    LS.runtime.nearZone = null;

    const count = arr.length;
    const isAll = count >= 5;
    if (isAll) {
      if (isKitsune) LS.state.kitsuneCompletedAt = Date.now();
      else LS.state.catsCompletedAt = Date.now();
    }

    const coinReward = isAll ? 90 : 35;
    const xpReward = isAll ? 55 : 22;

    LS.addCoins(coinReward);
    LS.addXP(xpReward);
    LS.saveState();
    LS.updateHUD();
    LS.playSFX('animal');

    if (isAll) {
      LS.unlockStamp(isKitsune ? 'kyoto_kitsune' : 'tokyo_cats');
      LS.showToast((isKitsune ? '🦊🎉 All 5 Kyoto Kitsune Found!' : '🐾🎉 All 5 Tokyo Cats Found!') +
        ' Bonus +' + coinReward + 'c! They will hide in brand-new spots in 2 hours!');
    } else {
      LS.showToast((isKitsune ? '🦊 Befriended ' : '🐱 Found ') + animal.name + ' (' + count + '/5)! +' + coinReward + 'c & +' + xpReward + ' XP!');
    }
  };

  LS.closeAllModals = function () {
    LS.runtime.modalOpen = false;
    clearInterval(timerInterval);
    [
      'passport-modal', 'airport-modal', 'shinkansen-modal', 'school-modal', 'ramen-modal',
      'sushi-modal', 'tea-modal', 'shop-modal', 'gachapon-modal',
      'drink-modal', 'mochi-modal', 'clubhouse-modal', 'ryokan-modal', 'shrine-modal'
    ].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
  };

  function startMochiMiniGame(mode) {
    LS.closeAllModals();
    const lp = LS.chars.laila.root.position;
    const ballPos = new THREE.Vector3(
      Math.max(-3.2, Math.min(3.2, lp.x * 0.5)),
      0.14,
      Math.max(-24, Math.min(16, lp.z - (mode === 'fetch' ? 8.0 : 5.0)))
    );
    LS.runtime.mochiGame = {
      mode,
      timeLeft: 30,
      score: 0,
      ballPos,
      state: 'to_target'
    };
    if (LS.activeWorld && LS.activeWorld.mochiBall) {
      LS.activeWorld.mochiBall.visible = (mode === 'fetch');
      LS.activeWorld.mochiBall.position.copy(ballPos);
    }
    LS.playSFX('coin');
    LS.showToast(mode === 'fetch'
      ? '🎾 30s Ball Fetch Started! Run near Mochi to keep tossing the ball!'
      : '🐕 30s Street Tag Started! Chase & tag speedy Mochi!');
  }

  LS.finishMochiMiniGame = function () {
    const mg = LS.runtime.mochiGame;
    if (!mg) return;
    const earnedCoins = 20 + mg.score * 15;
    const earnedXP = 15 + mg.score * 10;
    LS.addCoins(earnedCoins);
    LS.addXP(earnedXP);
    LS.runtime.mochiGame = null;
    if (LS.activeWorld && LS.activeWorld.mochiBall) LS.activeWorld.mochiBall.visible = false;
    LS.playSFX('levelup');
    LS.showToast('🎉 Mochi ' + (mg.mode === 'fetch' ? 'Fetch' : 'Tag') + ' Done! Score ' + mg.score + ' • +' + earnedCoins + 'c & +' + earnedXP + ' XP!');
  };

  LS.startEatingAnimation = function (scene, mealKey, mealName, diningConfig) {
    if (LS.runtime.eating) LS.finishEatingAnimation(scene);
    const bowlObj = LS.spawnMealProps(scene, mealKey, diningConfig);
    LS.runtime.eating = {
      timer: 0,
      duration: 5.0,
      bowlObj,
      diningConfig,
      camPos: diningConfig.camPos,
      camLook: diningConfig.camLook
    };

    const laila = LS.chars.laila;
    laila.root.position.copy(diningConfig.lailaSeatPos);
    laila.root.rotation.y = diningConfig.seatRotY;
    laila.leftLeg.rotation.x = -1.25;
    laila.rightLeg.rotation.x = -1.25;

    const salma = LS.chars.salma;
    if (salma) {
      salma.root.position.copy(diningConfig.salmaSeatPos);
      salma.root.rotation.y = diningConfig.seatRotY;
      salma.leftLeg.rotation.x = -1.25;
      salma.rightLeg.rotation.x = -1.25;
    }

    document.getElementById('eating-status').textContent = '🍽️ Laila & Salma are enjoying ' + mealName + '... Oishii! 😋';
    document.getElementById('eating-banner').classList.remove('hidden');
    LS.playSFX('coin');
  };

  LS.finishEatingAnimation = function (scene) {
    if (!LS.runtime.eating) return;
    const dc = LS.runtime.eating.diningConfig;
    scene.remove(LS.runtime.eating.bowlObj.group);

    const laila = LS.chars.laila;
    laila.root.position.copy(dc.lailaSeatPos).add(dc.exitOffset);
    laila.root.position.y = 0;
    laila.leftLeg.rotation.x = 0;
    laila.rightLeg.rotation.x = 0;
    laila.rightArm.rotation.x = 0;
    laila.headGroup.rotation.x = 0;

    const salma = LS.chars.salma;
    if (salma) {
      salma.root.position.copy(dc.salmaSeatPos).add(dc.exitOffset);
      salma.root.position.y = 0;
      salma.leftLeg.rotation.x = 0;
      salma.rightLeg.rotation.x = 0;
      salma.rightArm.rotation.x = 0;
      salma.headGroup.rotation.x = 0;
    }

    LS.runtime.eating = null;
    document.getElementById('eating-banner').classList.add('hidden');
    LS.showToast('😋 Gochisousama! Laila & Salma’s yummy boost is active!');
    LS.updateHUD();
  };

  LS.initGameplayUI = function (scene) {
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', LS.closeAllModals);
    });

    // Boutique Tabs & Filter
    document.getElementById('tab-laila').addEventListener('click', () => { activeShopTab = 'laila'; renderShopItems(); });
    document.getElementById('tab-salma').addEventListener('click', () => { activeShopTab = 'salma'; renderShopItems(); });
    const btnShowAll = document.getElementById('btn-shop-show-all');
    if (btnShowAll) {
      btnShowAll.addEventListener('click', () => {
        activeShopFilter = activeShopFilter === 'all' ? LS.state.currentWorld : 'all';
        btnShowAll.textContent = activeShopFilter === 'all' ? 'Showing All Worlds 🌍' : 'Show Both Tokyo & Kyoto Outfits 🌍';
        renderShopItems();
      });
    }

    // Tokyo Room Tabs
    document.getElementById('rtab-wallpaper').addEventListener('click', () => { activeRoomTab = 'wallpaper'; renderClubhousePreview(); });
    document.getElementById('rtab-beanbag').addEventListener('click', () => { activeRoomTab = 'beanbag'; renderClubhousePreview(); });
    document.getElementById('rtab-poster').addEventListener('click', () => { activeRoomTab = 'poster'; renderClubhousePreview(); });

    // Kyoto Ryokan Tabs
    document.getElementById('kytab-tatami').addEventListener('click', () => { activeRyokanTab = 'tatami'; renderRyokanPreview(); });
    document.getElementById('kytab-cushion').addEventListener('click', () => { activeRyokanTab = 'cushion'; renderRyokanPreview(); });
    document.getElementById('kytab-scroll').addEventListener('click', () => { activeRyokanTab = 'scroll'; renderRyokanPreview(); });

    // Gachapon spin (rolls Tokyo toys at Tokyo machine, Kyoto toys at Kyoto machine!)
    document.getElementById('btn-spin-gachapon').addEventListener('click', () => {
      const msgEl = document.getElementById('gachapon-msg');
      const cost = 15;
      if (LS.state.coins < cost) {
        msgEl.textContent = 'Need 15 coins! Earn more from quizzes, hidden animals, or Mochi.';
        LS.playSFX('wrong');
        return;
      }
      LS.addCoins(-cost);
      const pool = LS.GACHAPON_TOYS.filter(t => t.world === activeGachaponWorld);
      const source = pool.length > 0 ? pool : LS.GACHAPON_TOYS;
      const toy = source[Math.floor(Math.random() * source.length)];
      if (!LS.state.unlockedToys.includes(toy.id)) {
        LS.state.unlockedToys.push(toy.id);
        LS.addXP(15);
        msgEl.style.color = '#1b7a43';
        msgEl.textContent = '🎉 New Capsule Toy: ' + toy.emoji + ' ' + toy.name + ' added to your Toy Shelf!';
        LS.showToast('🎁 New Toy: ' + toy.emoji + ' ' + toy.name + '!');
        if (LS.state.unlockedToys.length >= 3) LS.unlockStamp('tokyo_toys');
      } else {
        LS.addCoins(5);
        msgEl.style.color = '#9c6514';
        msgEl.textContent = '✨ Got ' + toy.emoji + ' ' + toy.name + ' again (+5c refund)!';
      }
      LS.saveState();
      LS.updateHUD();
      renderGachaponShelf();
      LS.playSFX('correct');
    });

    // Tokyo Drink Vending Machine
    document.querySelectorAll('.buy-drink').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-drink');
        const msgEl = document.getElementById('drink-msg');
        if (LS.state.coins < 20) { msgEl.textContent = 'Not enough coins (20c)!'; LS.playSFX('wrong'); return; }
        LS.addCoins(-20);
        LS.runtime.stamina = 100;
        if (type === 'melon_soda') {
          LS.runtime.superJumpUntil = Date.now() + 45000;
          LS.closeAllModals(); LS.playSFX('correct');
          LS.showToast('🍈 Melon Soda Fizzy! Super-Jump active for 45s!');
        } else if (type === 'strawberry_milk') {
          LS.runtime.sparkleUntil = Date.now() + 45000;
          LS.closeAllModals(); LS.playSFX('correct');
          LS.showToast('🍓 Strawberry Milk Sweet! Sparkle Trail active for 45s!');
        } else {
          LS.runtime.buff = { name: 'Warm Taiyaki', short: 'Taiyaki+', speedMult: 1.25, infiniteStamina: true, expiresAt: Date.now() + 60000 };
          LS.closeAllModals(); LS.playSFX('correct');
          LS.showToast('🐟 Warm Taiyaki! Speed + Infinite Stamina boost for 60s!');
        }
        LS.updateHUD();
      });
    });

    // Kyoto Matcha & Wagashi Tea House
    document.querySelectorAll('.buy-tea').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-tea');
        const msgEl = document.getElementById('tea-msg');
        const cost = 25;
        if (LS.state.coins < cost) { msgEl.textContent = 'Not enough coins (25c)!'; LS.playSFX('wrong'); return; }
        LS.addCoins(-cost);
        LS.runtime.stamina = 100;
        LS.addXP(10);
        if (type === 'matcha_parfait') {
          LS.runtime.superJumpUntil = Date.now() + 50000;
          LS.closeAllModals(); LS.playSFX('correct');
          LS.showToast('🍨 Uji Matcha Parfait! Super-Jump active for 50s (+10 XP)!');
        } else if (type === 'dango') {
          LS.runtime.sparkleUntil = Date.now() + 50000;
          LS.closeAllModals(); LS.playSFX('correct');
          LS.showToast('🍡 Tri-Color Hanami Dango! Blossom Sparkle Trail for 50s (+10 XP)!');
        } else {
          LS.runtime.buff = { name: 'Sweet Dorayaki', short: 'Matcha⚡', speedMult: 1.28, infiniteStamina: true, expiresAt: Date.now() + 75000 };
          LS.closeAllModals(); LS.playSFX('correct');
          LS.showToast('🥞 Warm Kyoto Dorayaki! Speed + Infinite Stamina for 75s (+10 XP)!');
        }
        LS.updateHUD();
      });
    });

    // Mochi Play
    document.getElementById('btn-pet-mochi').addEventListener('click', () => {
      LS.runtime.mochiHeartTimer = 3.2;
      if (LS.chars.mochi) LS.chars.mochi.rotation.y += Math.PI * 2;
      LS.addXP(10);
      LS.closeAllModals();
      LS.playSFX('animal');
      LS.showToast('💖 Laila & Salma pet Mochi! Happy spin & +10 XP!');
    });
    document.getElementById('btn-start-fetch').addEventListener('click', () => startMochiMiniGame('fetch'));
    document.getElementById('btn-start-tag').addEventListener('click', () => startMochiMiniGame('tag'));

    // Quizzes
    document.getElementById('btn-start-quiz').addEventListener('click', () => {
      activeQuiz = {
        questions: generateQuiz(LS.getCurrentQuizWindow() * 97 + (activeQuizWorld === 'kyoto' ? 53 : 13), activeQuizWorld, false),
        index: 0, score: 0, practice: false, salmaMode: false, locked: false
      };
      document.getElementById('school-lobby').classList.add('hidden');
      document.getElementById('school-question').classList.remove('hidden');
      renderQuestion();
    });

    document.getElementById('btn-salma-quiz').addEventListener('click', () => {
      activeQuiz = {
        questions: generateQuiz(Math.floor(Math.random() * 99999), activeQuizWorld, true),
        index: 0, score: 0, practice: false, salmaMode: true, locked: false
      };
      document.getElementById('school-lobby').classList.add('hidden');
      document.getElementById('school-question').classList.remove('hidden');
      renderQuestion();
    });

    document.getElementById('btn-practice-quiz').addEventListener('click', () => {
      activeQuiz = {
        questions: generateQuiz(Math.floor(Math.random() * 99999), activeQuizWorld, false),
        index: 0, score: 0, practice: true, salmaMode: false, locked: false
      };
      document.getElementById('school-lobby').classList.add('hidden');
      document.getElementById('school-question').classList.remove('hidden');
      renderQuestion();
    });

    document.getElementById('btn-demo-skip').addEventListener('click', () => {
      LS.state.demoOffsetWindows = (LS.state.demoOffsetWindows || 0) + 1;
      LS.saveState();
      refreshSchoolLobby();
      LS.showToast('⏱️ Demo Skip: New graded quiz unlocked!');
    });

    // Ichiban Ramen (Tokyo)
    document.querySelectorAll('.buy-ramen').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-ramen');
        const item = RAMEN_CATALOG[key];
        if (!item) return;
        if (LS.state.coins < item.cost) {
          document.getElementById('ramen-msg').textContent = 'Not enough coins! Take a quiz at Sakura Elementary to earn more.';
          LS.playSFX('wrong'); return;
        }
        LS.addCoins(-item.cost);
        LS.runtime.stamina = 100;
        LS.runtime.buff = { name: item.name, short: item.short, speedMult: item.speedMult, infiniteStamina: item.infiniteStamina, expiresAt: Date.now() + item.durationMs };
        if (item.bonusXp > 0) LS.addXP(item.bonusXp);
        LS.unlockStamp('tokyo_ramen');
        LS.closeAllModals();
        if (LS.activeWorld && LS.activeWorld.ramenDiningConfig) {
          LS.startEatingAnimation(scene, key, item.name, LS.activeWorld.ramenDiningConfig);
        }
      });
    });

    // Sakura Sushi (Kyoto)
    document.querySelectorAll('.buy-sushi').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-sushi');
        const item = SUSHI_CATALOG[key];
        if (!item) return;
        if (LS.state.coins < item.cost) {
          document.getElementById('sushi-msg').textContent = 'Not enough coins! Feed the koi, find kitsune, or visit Kyoto Academy.';
          LS.playSFX('wrong'); return;
        }
        LS.addCoins(-item.cost);
        LS.runtime.stamina = 100;
        LS.runtime.buff = { name: item.name, short: item.short, speedMult: item.speedMult, infiniteStamina: item.infiniteStamina, expiresAt: Date.now() + item.durationMs };
        if (item.bonusXp > 0) LS.addXP(item.bonusXp);
        LS.closeAllModals();
        if (LS.activeWorld && LS.activeWorld.sushiDiningConfig) {
          LS.startEatingAnimation(scene, key, item.name, LS.activeWorld.sushiDiningConfig);
        }
      });
    });

    // Sakurako Shrine Omikuji & Ema Wishes
    document.getElementById('btn-draw-omikuji').addEventListener('click', () => {
      const f = OMIKUJI_FORTUNES[Math.floor(Math.random() * OMIKUJI_FORTUNES.length)];
      LS.state.lastFortune = f;
      LS.addCoins(f.bonusCoins);
      LS.addXP(f.bonusXp);
      LS.unlockStamp('kyoto_shrine');
      LS.playSFX('shrine');
      document.getElementById('omikuji-result').innerHTML =
        '<strong>' + f.emoji + ' ' + f.rank + '</strong><div>' + f.text + ' (+' + f.bonusCoins + 'c, +' + f.bonusXp + ' XP)</div>';
    });

    document.querySelectorAll('.ema-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const wish = btn.getAttribute('data-wish');
        LS.state.emaWishes.push(wish);
        LS.addXP(12);
        LS.addCoins(10);
        LS.unlockStamp('kyoto_shrine');
        LS.saveState();
        LS.playSFX('shrine');
        renderShrineWishes();
        LS.showToast('🪵 Hung Ema Wish: "' + wish + '" (+10c, +12 XP)!');
      });
    });

    document.getElementById('btn-skip-eat').addEventListener('click', () => {
      LS.finishEatingAnimation(scene);
    });
  };
})(window.LailaSalma);
