window.LailaSalma = window.LailaSalma || {};

(function (LS) {
  LS.WORLDS = {
    tokyo: {
      id: 'tokyo',
      title: 'Tokyo',
      subtitle: 'Sakura-cho Neighborhood',
      emoji: '🗼',
      badgeColor: '#e05780',
      unlocked: true,
      collectibleLabel: 'Cats',
      collectibleEmoji: '🐱',
      collectibleTotal: 5,
      destinationName: 'Kyoto',
      destinationId: 'kyoto',
      description: 'Walk sunny Sakura-cho! Eat steaming Ichiban Ramen, take quizzes at Sakura Elementary, play Fetch with Mochi, spin Gachapon toys, and spot 5 hidden cats.',
      bounds: { minX: -22, maxX: 22, minZ: -34, maxZ: 26 },
      mapBounds: { minX: -18, maxX: 18, minZ: -36, maxZ: 28 },
      spawn: { x: 0, y: 0, z: 12.0, rotY: Math.PI },
      arrivalSpawn: { x: 0, y: 0, z: 13.5, rotY: Math.PI },
      fogNear: 42,
      fogFar: 145
    },
    kyoto: {
      id: 'kyoto',
      title: 'Kyoto',
      subtitle: 'Sakurako Shrine & Arashiyama',
      emoji: '⛩️',
      badgeColor: '#c83e37',
      unlocked: true,
      collectibleLabel: 'Kitsune',
      collectibleEmoji: '🦊',
      collectibleTotal: 5,
      destinationName: 'Tokyo',
      destinationId: 'tokyo',
      description: 'Cross the arched cedar bridge over the koi lake! Walk through vermilion torii gates, stroll the Arashiyama Bamboo Grove, feed koi & ducks, sip Uji matcha, try on kimonos, and find 5 friendly kitsune foxes.',
      bounds: { minX: -55, maxX: 20, minZ: -50, maxZ: 25 },
      mapBounds: { minX: -56, maxX: 20, minZ: -52, maxZ: 27 },
      spawn: { x: 0, y: 0, z: 11.5, rotY: Math.PI },
      arrivalSpawn: { x: 0, y: 0, z: 12.5, rotY: Math.PI },
      fogNear: 46,
      fogFar: 165
    }
  };

  LS.UPCOMING_WORLDS = [
    {
      id: 'egypt',
      title: 'Ancient Egypt',
      subtitle: 'Nile River & Golden Pyramids',
      emoji: '🐪',
      description: 'Sail a felucca down the Nile, explore pyramids, decode hieroglyph puzzles, and befriend desert cats! (Coming Soon)'
    },
    {
      id: 'vikings',
      title: 'Viking Scandinavia',
      subtitle: 'Fjord Village & Northern Lights',
      emoji: '⛵',
      description: 'Explore cozy wooden longhouses under the aurora borealis, spot arctic puffins & reindeer, and craft rune charms! (Coming Soon)'
    }
  ];

  LS.PASSPORT_STAMPS = [
    { id: 'tokyo_ramen', world: 'tokyo', emoji: '🍜', title: 'Ramen Foodie', desc: 'Enjoyed a hot bowl at Ichiban Ramen' },
    { id: 'tokyo_quiz', world: 'tokyo', emoji: '🏫', title: 'Sakura Scholar', desc: 'Completed a quiz at Sakura Elementary' },
    { id: 'tokyo_cats', world: 'tokyo', emoji: '🐱', title: 'Tokyo Cat Friend', desc: 'Found all 5 hidden cats in Tokyo' },
    { id: 'tokyo_toys', world: 'tokyo', emoji: '🎁', title: 'Capsule Collector', desc: 'Collected 3+ Gachapon toys' },
    { id: 'kyoto_arrival', world: 'kyoto', emoji: '🚅', title: 'Shinkansen Traveler', desc: 'Rode the bullet train to Kyoto' },
    { id: 'kyoto_koi', world: 'kyoto', emoji: '🐟', title: 'Koi & Duck Pal', desc: 'Fed the koi fish & ducks at Sakurako Lake' },
    { id: 'kyoto_shrine', world: 'kyoto', emoji: '🎐', title: 'Shrine Wish Maker', desc: 'Drew an Omikuji fortune or hung an Ema wish' },
    { id: 'kyoto_kitsune', world: 'kyoto', emoji: '🦊', title: 'Kitsune Seeker', desc: 'Found all 5 hidden kitsune foxes in Kyoto' }
  ];

  LS.worldBuilders = {};
  LS.registerWorld = function (worldId, builderObj) {
    LS.worldBuilders[worldId] = builderObj;
  };
})(window.LailaSalma);
