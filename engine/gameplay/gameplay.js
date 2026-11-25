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

  const SAFARI_GK_POOL = [
    { q: 'Which animal is the tallest land mammal on the African savanna?', opts: ['Elephant', 'Giraffe', 'Zebra', 'Lion'], a: 1 },
    { q: 'What is a family group of lions called?', opts: ['A Herd', 'A Flock', 'A Pride', 'A Pack'], a: 2 },
    { q: 'What is Africa’s tallest mountain, famous for its snowy peak?', opts: ['Mt. Fuji', 'Mt. Kilimanjaro', 'Mt. Everest', 'Mt. Blanc'], a: 1 },
    { q: 'Which giant animal uses its long trunk to drink water and say hello?', opts: ['Hippo', 'Rhino', 'Elephant', 'Giraffe'], a: 2 },
    { q: 'What iconic flat-topped tree shades giraffes across the savanna?', opts: ['Acacia Tree', 'Pine Tree', 'Maple Tree', 'Willow Tree'], a: 0 },
    { q: 'Which black-and-white striped animal runs in savanna herds?', opts: ['Tiger', 'Panda', 'Zebra', 'Penguin'], a: 2 },
    { q: 'Why are flamingos bright pink?', opts: ['From sunny weather', 'From the food they eat', 'From painted feathers', 'From swimming in mud'], a: 1 },
    { q: 'What is the fastest land animal in Africa?', opts: ['Cheetah', 'Elephant', 'Giraffe', 'Tortoise'], a: 0 },
    { q: 'Which ancient African tree has a huge bottle-shaped trunk that stores water?', opts: ['Cherry Tree', 'Baobab Tree', 'Bamboo', 'Cedar'], a: 1 },
    { q: 'What do elephants flap to cool themselves down on hot savanna days?', opts: ['Their tails', 'Their big ears', 'Their tusks', 'Their hooves'], a: 1 }
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
    { q: '⭐ + ⭐⭐ = How many shiny stars?', opts: ['1 ⭐', '2 ⭐', '3 ⭐', '5 ⭐'], a: 2 },
    { q: '🦒 Which tall spotted friend eats leaves from treetops?', opts: ['🦒 Giraffe', '🐧 Penguin', '🐟 Fish', '🐢 Turtle'], a: 0 },
    { q: '🐘🐘 + 🐘 = How many gentle elephants at the pond?', opts: ['2 🐘', '3 🐘', '4 🐘', '5 🐘'], a: 1 },
    { q: '🦁 What sound does a playful lion cub make?', opts: ['Quack!', 'Roar!', 'Tweet!', 'Splash!'], a: 1 },
    { q: '🦩 What color is a pretty savanna flamingo?', opts: ['🩷 Pink', '🔵 Blue', '🟢 Green', '⚫ Black'], a: 0 }
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

    const pool = (worldId === 'safari' ? SAFARI_GK_POOL : (worldId === 'kyoto' ? KYOTO_GK_POOL : TOKYO_GK_POOL)).slice();
    const catName = worldId === 'safari' ? 'Safari Wildlife' : (worldId === 'kyoto' ? 'Kyoto Discovery' : 'General Knowledge');
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
      titleEl.textContent = activeQuizWorld === 'safari'
        ? '🦁 Savanna Ranger Academy — Wildlife Quiz'
        : (activeQuizWorld === 'kyoto'
          ? '📚 Kyoto Temple Academy — Quiz'
          : '🏫 Sakura Elementary — Quiz');
    }
    if (backBtn) {
      backBtn.textContent = activeQuizWorld === 'safari'
        ? 'Back to Safari'
        : (activeQuizWorld === 'kyoto' ? 'Back to Kyoto' : 'Back to Tokyo');
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
      ['tokyo', 'kyoto', 'safari'].forEach(wid => {
        const w = LS.WORLDS[wid];
        if (!w) return;
        const isHere = LS.state.currentWorld === wid;
        const foundCount = wid === 'safari'
          ? (LS.state.foundLionCubs ? LS.state.foundLionCubs.length : 0)
          : (wid === 'kyoto' ? LS.state.foundKitsune.length : LS.state.foundCats.length);
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
          const isFlight = wid === 'safari' || LS.state.currentWorld === 'safari';
          btn.textContent = (isFlight ? '✈️ Fly to ' : '🚅 Ride Shinkansen to ') + w.title;
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
        '<div class="pw-head"><div><strong>✈️ Haneda International Airport (Tokyo)</strong></div><span class="pw-soon">' + LS.UPCOMING_WORLDS.length + ' Upcoming Worlds</span></div>' +
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
    const resetBtn = document.getElementById('btn-reset-progress');
    const resetBox = document.getElementById('reset-confirm-box');
    if (resetBtn) resetBtn.classList.remove('hidden');
    if (resetBox) resetBox.classList.add('hidden');
    document.getElementById('passport-modal').classList.remove('hidden');
  };

  // Haneda-Tokyo International Airport & Safari Airstrip Departures Board
  LS.openAirportModal = function () {
    LS.runtime.modalOpen = true;
    LS.unlockStamp('tokyo_airport');
    const grid = document.getElementById('airport-flights-grid');
    if (grid) {
      grid.innerHTML = '';
      const inSafari = LS.state.currentWorld === 'safari';
      // Live Playable Flight Gate right at the top!
      const liveHdr = document.createElement('div');
      liveHdr.className = 'airport-section-hdr';
      liveHdr.textContent = '✈️ Now Boarding — Live International Flights!';
      grid.appendChild(liveHdr);

      const liveFlights = inSafari
        ? [
          { id: 'tokyo', emoji: '🗼', title: 'Tokyo (Haneda Airport)', gate: 'Gate H1 • Live', desc: 'Fly home to Sakura-cho, Ichiban Ramen, Pocket Park, Tokyo Room & Shinkansen Station!' },
          { id: 'kyoto', emoji: '⛩️', title: 'Kyoto (Sakurako Shrine)', gate: 'Gate H2 • Live', desc: 'Fly directly to Kyoto’s Koi Lake, Arched Cedar Bridge, Bamboo Grove & 5 Kitsune Foxes!' }
        ]
        : [
          { id: 'safari', emoji: '🦁', title: 'African Safari & Wildlife Zoo', gate: 'Gate A1 • NOW OPEN!', desc: 'Ride a zebra-striped Safari Jeep, feed tall giraffes & elephants, explore Pride Rock, collect wildlife stickers & find 5 playful lion cubs!' }
        ];

      liveFlights.forEach(fl => {
        const row = document.createElement('div');
        row.className = 'ramen-item bonus-flight';
        const info = document.createElement('div');
        info.innerHTML =
          '<strong>' + fl.emoji + ' ' + fl.title + '</strong> ' +
          '<span class="pw-bonus">' + fl.gate + '</span>' +
          '<div class="ramen-desc">' + fl.desc + '</div>';
        const btn = document.createElement('button');
        btn.className = 'btn-small';
        btn.textContent = '✈️ Board Flight!';
        btn.onclick = () => LS.travelToWorld(fl.id);
        row.appendChild(info);
        row.appendChild(btn);
        grid.appendChild(row);
      });

      let bonusHeadingAdded = false;
      LS.UPCOMING_WORLDS.forEach(uw => {
        if (uw.bonus && !bonusHeadingAdded) {
          bonusHeadingAdded = true;
          const hdr = document.createElement('div');
          hdr.className = 'airport-section-hdr';
          hdr.textContent = '✨ Bonus Fantasy, Time-Travel & Island Gates';
          grid.appendChild(hdr);
        }
        const row = document.createElement('div');
        row.className = 'ramen-item' + (uw.bonus ? ' bonus-flight' : '');
        row.innerHTML =
          '<div>' +
            '<strong>' + uw.emoji + ' ' + uw.title + '</strong> ' +
            '<span class="' + (uw.bonus ? 'pw-bonus' : 'pw-soon') + '">' + uw.gate + (uw.bonus ? ' • ✨ Bonus' : '') + '</span>' +
            '<div class="ramen-desc">' + uw.description + '</div>' +
          '</div>' +
          '<span class="' + (uw.bonus ? 'pw-bonus' : 'pw-soon') + '">Coming Soon ✈️</span>';
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

      const originTag = item.shop === 'safari' ? '🦁' : (item.shop === 'kyoto' ? '⛩️' : '🗼');
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
      titleEl.textContent = shopStyle === 'safari'
        ? '🎒 Safari Outfitter Boutique — Explorer Gear'
        : (shopStyle === 'kyoto'
          ? '👘 Kyoto Kimono & Fox Mask Boutique'
          : '🎀 Harajuku Kiosk — Outfits & Hats');
    }
    if (subEl) {
      subEl.textContent = shopStyle === 'safari'
        ? '“Jambo, Laila & Salma! Gear up in khaki safari vests, sun hats & cozy lion cub hoodies — all outfits travel across every world!”'
        : (shopStyle === 'kyoto'
          ? '“Irasshaimase, Laila & Salma! Try silk kimonos & festival fox masks — all outfits travel across every world!”'
          : '“Konnichiwa, Laila & Salma! Spend your coins on stylish outfits & hats — all outfits travel across every world!”');
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
      const wBadge = toy.world === 'safari' ? '🦁' : (toy.world === 'kyoto' ? '⛩️' : '🗼');
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
        : (activeGachaponWorld === 'safari'
          ? '📸 Safari Wildlife Photo Sticker Booth'
          : (activeGachaponWorld === 'kyoto' ? '🎁 Kyoto Gachapon Capsule Machine' : '🎁 Tokyo Gachapon Capsule Machine'));
    }
    if (spinBtn) {
      spinBtn.classList.toggle('hidden', activeGachaponWorld === 'all');
      spinBtn.textContent = activeGachaponWorld === 'safari'
        ? '📸 Snap & Print Wildlife Sticker (15c)'
        : (activeGachaponWorld === 'kyoto' ? '🎰 Spin Kyoto Capsule (15c)' : '🎰 Spin Tokyo Capsule (15c)');
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

  LS.feedSafariAnimals = function (kind) {
    LS.runtime.safariFeedTimer = 5.5;
    LS.state.safariFedCount = (LS.state.safariFedCount || 0) + 1;
    LS.addCoins(15);
    LS.addXP(12);
    LS.unlockStamp('safari_feed');
    LS.playSFX(kind === 'elephant' ? 'splash' : 'animal');
    if (kind === 'elephant') {
      LS.showToast('🐘💦 Trumpet & splash! The gentle elephants wave their trunks & love the sweet melons! +15c & +12 XP!');
    } else {
      LS.showToast('🦒🌿 Crunch crunch! The tall giraffes dip their long necks for fresh acacia leaves! +15c & +12 XP!');
    }
  };

  const LOCAL_SHOPS = {
    sakura_bakery: {
      title: '🥐 Sakura Bakery — Fresh Tokyo Pastries',
      sub: '“Irasshaimase, Laila & Salma! Freshly baked melonpan, sakura cupcakes & strawberry cream puffs straight from the oven!”',
      items: [
        { name: '🍈 Crispy Melonpan', desc: 'Warm sugar-crust bun • Speed +25% & Infinite Run for 90s (+12 XP)', cost: 20, xp: 12, buff: { name: 'Crispy Melonpan', short: 'Melonpan⚡', speedMult: 1.25, infiniteStamina: true, durationMs: 90000 } },
        { name: '🧁 Sakura Cream Cupcake', desc: 'Pink blossom frosting • Magical Sparkle Trail for 60s (+12 XP)', cost: 20, xp: 12, sparkleMs: 60000 },
        { name: '🍓 Strawberry Shortcake Box', desc: 'Fluffy Tokyo cake • Super-Jump + Speed boost for 75s (+18 XP)', cost: 30, xp: 18, superJumpMs: 75000, buff: { name: 'Strawberry Shortcake', short: 'Cake⚡', speedMult: 1.28, infiniteStamina: true, durationMs: 75000 } }
      ]
    },
    sunny_florist: {
      title: '🌷 Sunny Florist — Tokyo Flower & Crown Shop',
      sub: '“Hello, sisters! Pick bright tulip crowns, sakura bouquets, or lucky clovers that help Salma spot hiding kitties!”',
      items: [
        { name: '🌸 Sakura Petal Crown', desc: 'Twinkling flower crown • Blossom Sparkle Trail for 75s (+12 XP)', cost: 18, xp: 12, sparkleMs: 75000 },
        { name: '🌻 Sunny Sunflower Bouquet', desc: 'Cheerful sunny energy • Super-Jump boost for 60s (+12 XP)', cost: 20, xp: 12, superJumpMs: 60000 },
        { name: '🍀 Lucky Four-Leaf Clover', desc: 'Salma senses the nearest hiding animal + Speed boost for 60s (+15 XP)', cost: 25, xp: 15, hint: true, buff: { name: 'Lucky Clover', short: 'Clover🍀', speedMult: 1.22, infiniteStamina: true, durationMs: 60000 } }
      ]
    },
    cozy_bookshop: {
      title: '📚 Cozy Bookshop — Picture Books & Explorer Guides',
      sub: '“Welcome to Sakura-cho’s cozy reading nook! Pick an adventure storybook or a secret town guide!”',
      items: [
        { name: '📖 Cat Detective Picture Book', desc: 'Clever clues! Salma reveals the nearest hiding friend (+18 XP)', cost: 15, xp: 18, hint: true },
        { name: '🗺️ Japan Adventure Atlas', desc: 'Inspiring explorer facts • Big +35 XP learning boost!', cost: 22, xp: 35 },
        { name: '✨ Magic Origami Craft Kit', desc: 'Sparkle Trail + Super-Jump for 60s (+20 XP)', cost: 28, xp: 20, sparkleMs: 60000, superJumpMs: 60000 }
      ]
    },
    kyoto_pottery: {
      title: '🏺 Kyoto Pottery Studio — Kiyomizu Ceramics',
      sub: '“Welcome to our traditional Kyoto kiln! Paint glazed teacups, lucky fox figurines, or shimmering lotus bowls!”',
      items: [
        { name: '🍵 Paint a Matcha Teacup', desc: 'Cozy kiln crafting • +30 XP & warm Speed boost for 75s', cost: 20, xp: 30, buff: { name: 'Crafted Teacup', short: 'Pottery⚡', speedMult: 1.24, infiniteStamina: true, durationMs: 75000 } },
        { name: '🦊 Lucky Ceramic Kitsune Charm', desc: 'Guides Salma straight toward the nearest hiding Kyoto fox (+18 XP)', cost: 20, xp: 18, hint: true },
        { name: '🪷 Shimmering Lotus Bowl', desc: 'Sparkle Trail + Super-Jump for 65s (+22 XP)', cost: 28, xp: 22, sparkleMs: 65000, superJumpMs: 65000 }
      ]
    },
    kyoto_fans: {
      title: '🪭 Kyoto Folding Fan Atelier — Sensu Workshop',
      sub: '“Step right in, Laila & Salma! Wave a hand-painted Kyoto sensu fan for breeze-light leaps and blossom trails!”',
      items: [
        { name: '🍁 Autumn Maple Breeze Fan', desc: 'Breeze-light steps • Speed +30% & Infinite Run for 90s (+15 XP)', cost: 22, xp: 15, buff: { name: 'Maple Breeze Fan', short: 'Breeze🪭', speedMult: 1.30, infiniteStamina: true, durationMs: 90000 } },
        { name: '🌸 Sakura Wind-Jump Fan', desc: 'Soar over gardens • Super-Jump + Sparkle Trail for 65s (+16 XP)', cost: 25, xp: 16, superJumpMs: 65000, sparkleMs: 65000 },
        { name: '✨ Golden Festival Master Fan', desc: 'Speed + Super-Jump + Sparkle Trail + Salma Animal Hint (+25 XP)', cost: 35, xp: 25, hint: true, superJumpMs: 65000, sparkleMs: 65000, buff: { name: 'Golden Festival Fan', short: 'Golden🪭', speedMult: 1.30, infiniteStamina: true, durationMs: 90000 } }
      ]
    },
    safari_cafe: {
      title: '🥭 Mama Nia’s Mango Smoothie Cafe',
      sub: '“Jambo, Laila & Salma! Cool off in the savanna shade with fresh-blended tropical smoothies & explorer snacks!”',
      items: [
        { name: '🥭 Mango Sunrise Smoothie', desc: 'Golden tropical energy • Speed +28%, Infinite Run & Sparkles for 75s (+12 XP)', cost: 20, xp: 12, sparkleMs: 55000, buff: { name: 'Mango Sunrise Smoothie', short: 'Mango⚡', speedMult: 1.28, infiniteStamina: true, durationMs: 75000 } },
        { name: '🍉 Baobab Melon Splash', desc: 'Bouncy savanna refresher • Super-Jump for 65s (+14 XP)', cost: 20, xp: 14, superJumpMs: 65000 },
        { name: '🍍 Safari Explorer Trail Mix', desc: 'Full energy + Salma spots the nearest hiding Lion Cub! (+18 XP)', cost: 25, xp: 18, hint: true, buff: { name: 'Safari Trail Mix', short: 'Safari🦁', speedMult: 1.25, infiniteStamina: true, durationMs: 85000 } }
      ]
    },
    safari_crafts: {
      title: '🎨 Maasai Bead & Savanna Craft Market',
      sub: '“Karibu, Laila & Salma! Admire hand-beaded necklaces, painted savanna gourds & woven explorer baskets!”',
      items: [
        { name: '📿 Sunrise Beaded Bracelet', desc: 'Vibrant crimson & gold beads • Golden Sparkle Trail for 75s (+15 XP)', cost: 18, xp: 15, sparkleMs: 75000 },
        { name: '🪘 Mini Pocket Shaker', desc: 'Joyful savanna rhythm • Speed +26% & Infinite Run for 80s (+18 XP)', cost: 22, xp: 18, buff: { name: 'Savanna Rhythm', short: 'Rhythm🥁', speedMult: 1.26, infiniteStamina: true, durationMs: 80000 } },
        { name: '🦁 Carved Baobab Lion Charm', desc: 'Salma senses the nearest hiding Lion Cub + Super-Jump for 65s (+24 XP)', cost: 28, xp: 24, hint: true, superJumpMs: 65000 }
      ]
    }
  };

  LS.openLocalShopModal = function (shopKey) {
    const shop = LOCAL_SHOPS[shopKey];
    if (!shop) return;
    LS.runtime.modalOpen = true;
    const titleEl = document.getElementById('local-shop-title');
    const subEl = document.getElementById('local-shop-sub');
    const grid = document.getElementById('local-shop-items');
    const msgEl = document.getElementById('local-shop-msg');
    if (titleEl) titleEl.textContent = shop.title;
    if (subEl) subEl.textContent = shop.sub;
    if (msgEl) msgEl.textContent = '';
    if (grid) {
      grid.innerHTML = '';
      shop.items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'ramen-item';
        const info = document.createElement('div');
        info.innerHTML = '<strong>' + item.name + '</strong><div class="ramen-desc">' + item.desc + '</div>';
        const btn = document.createElement('button');
        btn.className = 'btn-small';
        btn.textContent = item.cost + 'c';
        btn.onclick = () => {
          if (LS.state.coins < item.cost) {
            if (msgEl) msgEl.textContent = 'Not enough coins (' + item.cost + 'c)! Feed animals, find friends, or take a quiz.';
            LS.playSFX('wrong');
            return;
          }
          LS.addCoins(-item.cost);
          if (item.xp) LS.addXP(item.xp);
          LS.runtime.stamina = 100;
          if (item.buff) {
            LS.runtime.buff = {
              name: item.buff.name,
              short: item.buff.short,
              speedMult: item.buff.speedMult,
              infiniteStamina: item.buff.infiniteStamina,
              expiresAt: Date.now() + item.buff.durationMs
            };
          }
          if (item.sparkleMs) LS.runtime.sparkleUntil = Date.now() + item.sparkleMs;
          if (item.superJumpMs) LS.runtime.superJumpUntil = Date.now() + item.superJumpMs;
          LS.closeAllModals();
          LS.playSFX('correct');
          LS.updateHUD();
          LS.showToast('✨ Enjoyed ' + item.name + (item.xp ? (' (+' + item.xp + ' XP)') : '') + '!');
          if (item.hint && LS.showSalmaAnimalHint) {
            setTimeout(() => LS.showSalmaAnimalHint(), 350);
          }
        };
        row.appendChild(info);
        row.appendChild(btn);
        grid.appendChild(row);
      });
    }
    const modal = document.getElementById('local-shop-modal');
    if (modal) modal.classList.remove('hidden');
  };

  LS.enjoySafariSmoothie = function () {
    LS.openLocalShopModal('safari_cafe');
  };

  LS.startSafariJeepRide = function () {
    if (LS.runtime.safariRide || LS.runtime.balloonRide || LS.runtime.modalOpen || LS.runtime.traveling) return;
    if (!LS.activeWorld || !LS.activeWorld.jeepPath || !LS.activeWorld.safariJeep) return;
    LS.runtime.safariRide = { t: 0, duration: 15.0 };
    LS.playSFX('train');
    LS.showToast('🚙🦁 All aboard the Safari Jeep! Cruising past Giraffes, Elephants, Pride Rock & Zebras!');
  };

  // --- GRAND AFRICAN SAFARI EXPANSION ACTIVITIES ---
  let activeSafariTentTab = 'rug';
  function renderSafariTentPreview() {
    const preview = document.getElementById('safari-tent-preview');
    const shelf = document.getElementById('safari-tent-cubs-shelf');
    const grid = document.getElementById('safari-tent-items-grid');
    const msgEl = document.getElementById('safari-tent-msg');
    if (!preview || !grid) return;

    const rug = LS.SAFARI_TENT_RUGS.find(r => r.id === LS.state.safariTentRug) || LS.SAFARI_TENT_RUGS[0];
    const cush = LS.SAFARI_TENT_CUSHIONS.find(c => c.id === LS.state.safariTentCushion) || LS.SAFARI_TENT_CUSHIONS[0];
    const tap = LS.SAFARI_TENT_TAPESTRIES.find(t => t.id === LS.state.safariTentTapestry) || LS.SAFARI_TENT_TAPESTRIES[0];

    preview.style.background = rug.color;
    preview.style.borderColor = rug.accent;
    preview.innerHTML =
      '<div class="room-poster-banner" style="background:' + tap.bg + ';border-color:' + tap.border + ';color:' + (tap.fg || '#332211') + '">' + tap.label + '</div>' +
      '<div class="room-stage-row">' +
        '<span class="room-pill">👧 Laila</span>' +
        '<span class="room-beanbag" style="background:' + cush.color + '">⛺ ' + cush.name + '</span>' +
        '<span class="room-pill">🧒 Salma</span>' +
      '</div>';

    if (shelf) {
      const cubNames = { cub_simba: '🦁 Simba', cub_nala: '🦁 Nala', cub_zuri: '🦁 Zuri', cub_kopa: '🦁 Kopa', cub_asha: '🦁 Asha' };
      const found = LS.state.foundLionCubs || [];
      shelf.innerHTML = '<strong>Safari Lion Cub Friends (' + found.length + '/5):</strong> ' +
        Object.keys(cubNames).map(cid =>
          '<span class="cat-shelf-badge ' + (found.includes(cid) ? 'found' : '') + '">' +
          (found.includes(cid) ? cubNames[cid] : '🐾 ???') + '</span>'
        ).join(' ');
    }

    const tRug = document.getElementById('sttab-rug');
    const tCush = document.getElementById('sttab-cushion');
    const tTap = document.getElementById('sttab-tapestry');
    if (tRug) tRug.classList.toggle('active', activeSafariTentTab === 'rug');
    if (tCush) tCush.classList.toggle('active', activeSafariTentTab === 'cushion');
    if (tTap) tTap.classList.toggle('active', activeSafariTentTab === 'tapestry');

    const sourceList = activeSafariTentTab === 'rug'
      ? LS.SAFARI_TENT_RUGS
      : (activeSafariTentTab === 'cushion' ? LS.SAFARI_TENT_CUSHIONS : LS.SAFARI_TENT_TAPESTRIES);
    const activeId = activeSafariTentTab === 'rug'
      ? LS.state.safariTentRug
      : (activeSafariTentTab === 'cushion' ? LS.state.safariTentCushion : LS.state.safariTentTapestry);

    grid.innerHTML = '';
    sourceList.forEach(item => {
      const unlocked = LS.state.unlockedSafariTentItems.includes(item.id);
      const isActive = activeId === item.id;
      const row = document.createElement('div');
      row.className = 'shop-item' + (isActive ? ' equipped' : '');
      const dotHtml = item.color ? '<span class="swatch-dot" style="background:' + item.color + '"></span>' : '🖼️ ';
      const info = document.createElement('div');
      info.innerHTML = '<strong>' + dotHtml + item.name + '</strong>';
      const btn = document.createElement('button');
      if (isActive) {
        btn.className = 'btn-secondary'; btn.textContent = 'In Tent ✓'; btn.disabled = true;
      } else if (unlocked) {
        btn.className = 'btn-primary'; btn.textContent = 'Place';
        btn.onclick = () => {
          if (activeSafariTentTab === 'rug') LS.state.safariTentRug = item.id;
          else if (activeSafariTentTab === 'cushion') LS.state.safariTentCushion = item.id;
          else LS.state.safariTentTapestry = item.id;
          LS.saveState();
          if (LS.activeWorld && LS.activeWorld.refreshDecor) LS.activeWorld.refreshDecor();
          if (msgEl) msgEl.textContent = '';
          renderSafariTentPreview();
          LS.showToast('⛺ Updated 3D Glamping Tent with ' + item.name + '!');
        };
      } else {
        btn.className = 'btn-primary'; btn.textContent = item.cost + 'c';
        btn.onclick = () => {
          if (LS.state.coins < item.cost) {
            if (msgEl) msgEl.textContent = 'Need more coins! Snap wildlife photos, race the Cheetah, or find lion cubs.';
            LS.playSFX('wrong'); return;
          }
          LS.addCoins(-item.cost);
          LS.state.unlockedSafariTentItems.push(item.id);
          if (activeSafariTentTab === 'rug') LS.state.safariTentRug = item.id;
          else if (activeSafariTentTab === 'cushion') LS.state.safariTentCushion = item.id;
          else LS.state.safariTentTapestry = item.id;
          LS.saveState();
          if (LS.activeWorld && LS.activeWorld.refreshDecor) LS.activeWorld.refreshDecor();
          LS.unlockStamp('safari_tent_decor');
          LS.playSFX('correct');
          if (msgEl) msgEl.textContent = '';
          renderSafariTentPreview();
          LS.showToast('⛺ Added ' + item.name + ' to your 3D Safari Glamping Tent!');
        };
      }
      row.appendChild(info); row.appendChild(btn); grid.appendChild(row);
    });
  }

  LS.openSafariTentModal = function () {
    LS.runtime.modalOpen = true;
    const m = document.getElementById('safari-tent-msg');
    if (m) m.textContent = '';
    renderSafariTentPreview();
    const modal = document.getElementById('safari-tent-modal');
    if (modal) modal.classList.remove('hidden');
  };

  function renderSafariWildlifeGuide() {
    const grid = document.getElementById('safari-guide-grid');
    const prog = document.getElementById('safari-guide-progress');
    if (!grid) return;
    const photos = LS.state.safariPhotos || [];
    if (prog) prog.textContent = 'Photographed: ' + photos.length + ' / ' + LS.SAFARI_WILDLIFE_GUIDE.length + ' Savanna Species 📸';
    grid.innerHTML = '';
    LS.SAFARI_WILDLIFE_GUIDE.forEach(sp => {
      const snapped = photos.includes(sp.id);
      const card = document.createElement('div');
      card.className = 'guide-card' + (snapped ? ' snapped' : '');
      card.innerHTML =
        '<div class="guide-head"><span>' + sp.emoji + ' <strong>' + sp.name + '</strong></span>' +
        '<span class="guide-badge">' + (snapped ? '✅ Snapped' : '📍 ' + sp.spot) + '</span></div>' +
        '<div class="guide-fact">' + (snapped ? sp.fact : 'Walk near the ' + sp.spot + ' and press [F] or click Snap Photo!') + '</div>';
      grid.appendChild(card);
    });
  }

  LS.openSafariGuideModal = function () {
    LS.runtime.modalOpen = true;
    const msg = document.getElementById('safari-guide-msg');
    if (msg) msg.textContent = '';
    renderSafariWildlifeGuide();
    const modal = document.getElementById('safari-guide-modal');
    if (modal) modal.classList.remove('hidden');
  };

  LS.snapSafariWildlifePhoto = function () {
    if (LS.state.currentWorld !== 'safari' || !LS.activeWorld || !LS.chars.laila) return false;
    const lp = LS.chars.laila.root.position;
    const targets = LS.activeWorld.wildlifePhotoTargets || [];
    let best = null;
    let bestDist = 26.0;
    for (let i = 0; i < targets.length; i++) {
      const t = targets[i];
      const d = Math.hypot(lp.x - t.pos.x, lp.z - t.pos.z);
      if (d < bestDist) { bestDist = d; best = t; }
    }
    if (LS.playCameraShutter) LS.playCameraShutter();
    // Subtle quick camera flash pulse
    const flash = document.getElementById('camera-flash');
    if (flash) {
      flash.classList.remove('hidden');
      setTimeout(() => flash.classList.add('hidden'), 140);
    }
    if (!best) {
      LS.showToast('📸 Click! Walk a bit closer to Giraffes, Elephants, Hippos, Flamingos, Lions, Zebras, or Meerkats!');
      return false;
    }
    const meta = LS.SAFARI_WILDLIFE_GUIDE.find(g => g.id === best.species);
    if (!meta) return false;
    if (!LS.state.safariPhotos) LS.state.safariPhotos = [];
    const isNew = !LS.state.safariPhotos.includes(meta.id);
    if (isNew) {
      LS.state.safariPhotos.push(meta.id);
      LS.addCoins(15);
      LS.addXP(15);
      LS.saveState();
      LS.playSFX('animal');
      if (LS.state.safariPhotos.length >= LS.SAFARI_WILDLIFE_GUIDE.length) {
        LS.unlockStamp('safari_photographer');
        LS.showToast('📸🏆 ALL 7 Wildlife Species Photographed! Master Safari Photographer Stamp unlocked! (+15c, +15 XP)');
      } else {
        LS.showToast('📸 NEW Photo: ' + meta.emoji + ' ' + meta.name + ' (' + LS.state.safariPhotos.length + '/7)! +15c & +15 XP!');
      }
    } else {
      LS.showToast('📸 Great shot of the ' + meta.emoji + ' ' + meta.name + '! (' + LS.state.safariPhotos.length + '/7 in Field Guide)');
    }
    renderSafariWildlifeGuide();
    return true;
  };

  LS.openSafariCampfireModal = function () {
    LS.runtime.modalOpen = true;
    const msg = document.getElementById('safari-campfire-msg');
    if (msg) msg.textContent = 'Tap the African Djembe drums to jam around the fire or roast golden marshmallows!';
    const modal = document.getElementById('safari-campfire-modal');
    if (modal) modal.classList.remove('hidden');
  };

  LS.startBalloonRide = function () {
    if (LS.runtime.balloonRide || LS.runtime.safariRide || LS.runtime.modalOpen || LS.runtime.traveling) return;
    if (!LS.activeWorld || !LS.activeWorld.hotAirBalloon) return;
    LS.runtime.balloonRide = { t: 0, duration: 16.0 };
    const ban = document.getElementById('balloon-banner');
    if (ban) ban.classList.remove('hidden');
    LS.playSFX('train');
    LS.setSalmaBubbleText('WHOAAA!! We are flying over Pride Rock, the Hippos, and Mt. Kilimanjaro!! 🎈🏔️', 5000);
    LS.showToast('🎈 Lift off! Soaring 20m above the golden African Savanna!');
  };

  LS.finishBalloonRide = function (skipped) {
    if (!LS.runtime.balloonRide) return;
    LS.runtime.balloonRide = null;
    const ban = document.getElementById('balloon-banner');
    if (ban) ban.classList.add('hidden');
    const bal = LS.activeWorld && LS.activeWorld.hotAirBalloon;
    const home = LS.activeWorld && LS.activeWorld.balloonHome;
    if (bal && home) {
      bal.position.copy(home.pos);
      bal.rotation.set(0, 0, 0);
      if (LS.chars.laila) {
        LS.chars.laila.root.position.copy(home.exit);
        LS.chars.laila.rightArm.rotation.z = 0;
      }
      if (LS.chars.salma) {
        LS.chars.salma.root.position.set(home.exit.x - 1.0, 0, home.exit.z + 0.5);
        LS.chars.salma.rightArm.rotation.z = 0;
      }
    }
    LS.addCoins(30);
    LS.addXP(25);
    LS.unlockStamp('safari_balloon');
    LS.playSFX('correct');
    LS.showToast(skipped
      ? '🎈 Safely landed back at the Launch Pad! +30c & +25 XP!'
      : '🎈✨ Unforgettable Sunrise Balloon Flight! +30c & +25 XP!');
  };

  LS.startCheetahRace = function () {
    if (LS.runtime.cheetahRace || LS.runtime.balloonRide || LS.runtime.safariRide || LS.runtime.modalOpen) return;
    if (!LS.activeWorld || !LS.activeWorld.cheetahTrack || !LS.chars.laila) return;
    const tr = LS.activeWorld.cheetahTrack;
    LS.chars.laila.root.position.set(tr.start.x, 0, tr.start.z - 0.8);
    LS.chars.laila.root.rotation.y = tr.yaw;
    if (LS.chars.salma) {
      LS.chars.salma.root.position.set(tr.start.x - 0.9, 0, tr.start.z - 1.4);
      LS.chars.salma.root.rotation.y = tr.yaw;
    }
    LS.runtime.stamina = 100;
    LS.runtime.cheetahRace = { phase: 'countdown', countdown: 2.6, elapsed: 0, cheetahProg: 0 };
    LS.playSFX('jump');
    LS.setSalmaBubbleText('Go Laila GO!! Hold Shift to sprint past the spotted Cheetah! 🐆💨', 4200);
  };

  LS.finishCheetahRace = function (won, timeSec) {
    LS.runtime.cheetahRace = null;
    const ban = document.getElementById('cheetah-banner');
    if (ban) ban.classList.add('hidden');
    if (LS.activeWorld && LS.activeWorld.cheetahObj && LS.activeWorld.cheetahTrack) {
      const ch = LS.activeWorld.cheetahObj;
      const tr = LS.activeWorld.cheetahTrack;
      ch.position.set(tr.start.x, 0, tr.start.z + 1.1);
      ch.rotation.set(0, tr.yaw, 0);
    }
    if (won) {
      LS.addCoins(35);
      LS.addXP(30);
      LS.unlockStamp('safari_cheetah');
      LS.playSFX('levelup');
      LS.showToast('🐆🏆 YOU BEAT THE CHEETAH in ' + timeSec.toFixed(1) + 's! +35c & +30 XP!');
    } else {
      LS.addCoins(15);
      LS.addXP(15);
      LS.playSFX('coin');
      LS.showToast('🐆💨 Super speedy race! Grab a Mango Smoothie for turbo speed & try again! (+15c, +15 XP)');
    }
  };

  LS.triggerWatchtowerLookout = function () {
    if (LS.runtime.balloonRide || LS.runtime.safariRide) return;
    LS.runtime.watchtowerTimer = 6.0;
    LS.playSFX('shrine');
    LS.addXP(10);
    // Salma spots the direction of the nearest unfound Lion Cub from the Watchtower binoculars!
    const cubs = (LS.activeWorld && LS.activeWorld.hiddenAnimals) ? LS.activeWorld.hiddenAnimals.filter(c => !c.found) : [];
    if (cubs.length > 0 && LS.chars.laila) {
      const lp = LS.chars.laila.root.position;
      let nearest = cubs[0];
      let bestD = Infinity;
      cubs.forEach(c => {
        const d = lp.distanceTo(c.mesh.position);
        if (d < bestD) { bestD = d; nearest = c; }
      });
      LS.setSalmaBubbleText('🔭 Through the binoculars I spy ' + nearest.name + ' ' + nearest.hint + '!', 5800);
      LS.showToast('🔭 Watchtower Panorama! Salma spotted ' + nearest.name + ' ' + nearest.hint + '! (+10 XP)');
    } else {
      LS.setSalmaBubbleText('🔭 What a breathtaking 360° view of the whole African Savanna!!', 5500);
      LS.showToast('🔭 Breathtaking Savanna Watchtower Panorama! (+10 XP)');
    }
  };

  LS.triggerPrideRockRoar = function () {
    LS.runtime.prideRoarTimer = 2.2;
    if (LS.playLionRoar) LS.playLionRoar();
    LS.addCoins(10);
    LS.addXP(10);
    LS.setSalmaBubbleText('ROOOAAAR!! King Lion said hello to us from the top of Pride Rock! 🦁👑', 4200);
    LS.showToast('🦁👑 ROOOAAR! King Lion lifts his golden mane atop Pride Rock! +10c & +10 XP!');
  };

  LS.petHiddenAnimal = function (animalId) {
    const world = LS.activeWorld;
    if (!world || !world.hiddenAnimals) return;
    const animal = world.hiddenAnimals.find(a => a.id === animalId);
    if (!animal || animal.found) return;

    animal.found = true;
    if (animal.marker) animal.marker.visible = false;

    const isKitsune = animal.kind === 'kitsune';
    const isLionCub = animal.kind === 'lion_cub';
    const arr = isLionCub ? LS.state.foundLionCubs : (isKitsune ? LS.state.foundKitsune : LS.state.foundCats);
    if (!arr.includes(animalId)) arr.push(animalId);

    world.zones = world.zones.filter(z => z.id !== 'animal:' + animalId);
    LS.runtime.nearZone = null;

    const count = arr.length;
    const isAll = count >= 5;
    if (isAll) {
      if (isLionCub) LS.state.lionCubsCompletedAt = Date.now();
      else if (isKitsune) LS.state.kitsuneCompletedAt = Date.now();
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
      LS.unlockStamp(isLionCub ? 'safari_cubs' : (isKitsune ? 'kyoto_kitsune' : 'tokyo_cats'));
      LS.showToast((isLionCub ? '🦁🎉 All 5 Safari Lion Cubs Found!' : (isKitsune ? '🦊🎉 All 5 Kyoto Kitsune Found!' : '🐾🎉 All 5 Tokyo Cats Found!')) +
        ' Bonus +' + coinReward + 'c! They will hide in brand-new spots in 2 hours!');
    } else {
      LS.showToast((isLionCub ? '🦁 Befriended ' : (isKitsune ? '🦊 Befriended ' : '🐱 Found ')) + animal.name + ' (' + count + '/5)! +' + coinReward + 'c & +' + xpReward + ' XP!');
    }
  };

  LS.closeAllModals = function () {
    LS.runtime.modalOpen = false;
    clearInterval(timerInterval);
    [
      'passport-modal', 'airport-modal', 'local-shop-modal', 'shinkansen-modal', 'school-modal', 'ramen-modal',
      'sushi-modal', 'tea-modal', 'shop-modal', 'gachapon-modal',
      'drink-modal', 'mochi-modal', 'clubhouse-modal', 'ryokan-modal', 'shrine-modal',
      'safari-guide-modal', 'safari-campfire-modal', 'safari-tent-modal'
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

    // Two-step kid-safe Reset All Progress controls inside Travel Passport
    const resetTrigger = document.getElementById('btn-reset-progress');
    const resetConfirmBox = document.getElementById('reset-confirm-box');
    const resetCancel = document.getElementById('btn-reset-cancel');
    const resetConfirm = document.getElementById('btn-reset-confirm');
    if (resetTrigger && resetConfirmBox) {
      resetTrigger.addEventListener('click', () => {
        resetTrigger.classList.add('hidden');
        resetConfirmBox.classList.remove('hidden');
      });
    }
    if (resetCancel && resetTrigger && resetConfirmBox) {
      resetCancel.addEventListener('click', () => {
        resetConfirmBox.classList.add('hidden');
        resetTrigger.classList.remove('hidden');
      });
    }
    if (resetConfirm) {
      resetConfirm.addEventListener('click', () => {
        if (LS.resetProgress) LS.resetProgress();
      });
    }

    // --- GRAND AFRICAN SAFARI UI LISTENERS ---
    const btnSafCam = document.getElementById('btn-safari-camera');
    if (btnSafCam) btnSafCam.addEventListener('click', () => LS.openSafariGuideModal());
    const btnSnapNow = document.getElementById('btn-snap-wildlife-now');
    if (btnSnapNow) {
      btnSnapNow.addEventListener('click', () => {
        LS.closeAllModals();
        LS.snapSafariWildlifePhoto();
      });
    }
    const btnSkipBalloon = document.getElementById('btn-skip-balloon');
    if (btnSkipBalloon) btnSkipBalloon.addEventListener('click', () => LS.finishBalloonRide(true));

    // Safari Glamping Tent Decorator Tabs
    const stRug = document.getElementById('sttab-rug');
    const stCush = document.getElementById('sttab-cushion');
    const stTap = document.getElementById('sttab-tapestry');
    if (stRug) stRug.addEventListener('click', () => { activeSafariTentTab = 'rug'; renderSafariTentPreview(); });
    if (stCush) stCush.addEventListener('click', () => { activeSafariTentTab = 'cushion'; renderSafariTentPreview(); });
    if (stTap) stTap.addEventListener('click', () => { activeSafariTentTab = 'tapestry'; renderSafariTentPreview(); });

    // Djembe Campfire Drum Circle Pads, Auto-Jam & Marshmallow Roast
    document.querySelectorAll('.djembe-pad').forEach(pad => {
      pad.addEventListener('click', () => {
        const kind = pad.getAttribute('data-drum');
        if (LS.playDjembeSound) LS.playDjembeSound(kind);
        pad.classList.add('active');
        setTimeout(() => pad.classList.remove('active'), 160);
        const msg = document.getElementById('safari-campfire-msg');
        if (msg) msg.textContent = '🥁 Boom-bap! Laila & Salma jam on the Savanna Djembe drum!';
      });
    });
    const btnJam = document.getElementById('btn-campfire-jam');
    if (btnJam) {
      btnJam.addEventListener('click', () => {
        const seq = ['bass', 'tone', 'slap', 'tone', 'marimba', 'bass', 'slap', 'marimba'];
        seq.forEach((k, idx) => {
          setTimeout(() => { if (LS.playDjembeSound) LS.playDjembeSound(k); }, idx * 190);
        });
        LS.addXP(10);
        const msg = document.getElementById('safari-campfire-msg');
        if (msg) msg.textContent = '🎶 Savanna Sunset Jam playing! The stars twinkle above Base Camp! (+10 XP)';
      });
    }
    const btnRoast = document.getElementById('btn-roast-marshmallow');
    if (btnRoast) {
      btnRoast.addEventListener('click', () => {
        LS.addCoins(15);
        LS.addXP(15);
        LS.unlockStamp('safari_campfire');
        LS.playSFX('coin');
        LS.runtime.sparkleUntil = Date.now() + 45000;
        const msg = document.getElementById('safari-campfire-msg');
        if (msg) msg.textContent = '🔥🍡 Golden toasted marshmallows! Warm campfire sparkle trail active! (+15c, +15 XP)';
        LS.showToast('🔥🍡 Toasted Campfire Marshmallows with Laila & Salma! +15c & +15 XP!');
      });
    }
  };
})(window.LailaSalma);
