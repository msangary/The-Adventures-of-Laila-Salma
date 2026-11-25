window.LailaSalma = window.LailaSalma || {};

(function (LS) {
  const urlParams = typeof URLSearchParams !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const qMode = urlParams ? urlParams.get('graphics') : null;
  LS.graphicsMode = (qMode === 'hd' || qMode === 'classic')
    ? qMode
    : (window.LS_GRAPHICS_MODE === 'hd' ? 'hd' : 'classic');
  LS.isHD = LS.graphicsMode === 'hd';
  LS.maxAnisotropy = 1;

  LS.WORLDS = {
    tokyo: {
      id: 'tokyo',
      title: 'Tokyo',
      subtitle: 'Sakura-cho & Haneda Airport',
      emoji: '🗼',
      badgeColor: '#e05780',
      unlocked: true,
      isInterior: false,
      collectibleLabel: 'Cats',
      collectibleEmoji: '🐱',
      collectibleTotal: 5,
      destinationName: 'Kyoto',
      destinationId: 'kyoto',
      description: 'Explore expanded Sakura-cho! Visit Ichiban Ramen, Sakura Elementary, Tokyo Pocket Park, Gachapon & Drink machines, decorate inside Laila & Salma\'s 3D Room, check out Haneda International Airport, and find 5 hiding cats (new spots every 2 hours!).',
      bounds: { minX: -62, maxX: 66, minZ: -62, maxZ: 50 },
      mapBounds: { minX: -64, maxX: 68, minZ: -64, maxZ: 52 },
      spawn: { x: 0, y: 0, z: 16.0, rotY: Math.PI },
      arrivalSpawn: { x: 0, y: 0, z: 28.0, rotY: Math.PI },
      fogNear: 72,
      fogFar: 225
    },
    kyoto: {
      id: 'kyoto',
      title: 'Kyoto',
      subtitle: 'Sakurako Shrine, Bamboo & Park',
      emoji: '⛩️',
      badgeColor: '#c83e37',
      unlocked: true,
      isInterior: false,
      collectibleLabel: 'Kitsune',
      collectibleEmoji: '🦊',
      collectibleTotal: 5,
      destinationName: 'Tokyo',
      destinationId: 'tokyo',
      description: 'Cross the arched cedar bridge over the koi lake! Walk through vermilion torii gates, explore the Arashiyama Bamboo Grove, Zen Rock Garden, Momiji Craft Village, Kyoto Pocket Park & Gachapon, decorate your 3D Ryokan Suite, and find 5 hiding kitsune foxes!',
      bounds: { minX: -68, maxX: 56, minZ: -62, maxZ: 46 },
      mapBounds: { minX: -70, maxX: 58, minZ: -64, maxZ: 48 },
      spawn: { x: 0, y: 0, z: 15.0, rotY: Math.PI },
      arrivalSpawn: { x: 0, y: 0, z: 25.0, rotY: Math.PI },
      fogNear: 74,
      fogFar: 230
    },
    tokyo_room: {
      id: 'tokyo_room',
      title: "Sisters' Room",
      subtitle: 'Tokyo Bedroom & Clubhouse',
      emoji: '🏡',
      badgeColor: '#d95d88',
      unlocked: true,
      isInterior: true,
      parentWorld: 'tokyo',
      exitPos: { x: -6.8, y: 0, z: -1.5, rotY: Math.PI / 2 },
      collectibleLabel: 'Cats',
      collectibleEmoji: '🐱',
      collectibleTotal: 5,
      bounds: { minX: -5.4, maxX: 5.4, minZ: -4.4, maxZ: 4.6 },
      mapBounds: { minX: -6.5, maxX: 6.5, minZ: -5.5, maxZ: 5.5 },
      spawn: { x: 0, y: 0, z: 3.1, rotY: Math.PI },
      arrivalSpawn: { x: 0, y: 0, z: 3.1, rotY: Math.PI },
      fogNear: 25,
      fogFar: 65
    },
    kyoto_room: {
      id: 'kyoto_room',
      title: 'Kyoto Ryokan',
      subtitle: "Laila & Salma's Tatami Suite",
      emoji: '🏮',
      badgeColor: '#b84a46',
      unlocked: true,
      isInterior: true,
      parentWorld: 'kyoto',
      exitPos: { x: -6.2, y: 0, z: -12.5, rotY: Math.PI / 2 },
      collectibleLabel: 'Kitsune',
      collectibleEmoji: '🦊',
      collectibleTotal: 5,
      bounds: { minX: -5.4, maxX: 5.4, minZ: -4.4, maxZ: 4.6 },
      mapBounds: { minX: -6.5, maxX: 6.5, minZ: -5.5, maxZ: 5.5 },
      spawn: { x: 0, y: 0, z: 3.1, rotY: Math.PI },
      arrivalSpawn: { x: 0, y: 0, z: 3.1, rotY: Math.PI },
      fogNear: 25,
      fogFar: 65
    }
  };

  LS.UPCOMING_WORLDS = [
    { id: 'safari', title: 'African Safari & Wildlife Zoo', subtitle: 'Savanna Reserve & Animal Sanctuary', emoji: '🦁', gate: 'Gate A1',
      description: 'Ride a safari jeep, feed giraffes & elephants, spot playful lion cubs, and collect wildlife photo stickers!' },
    { id: 'egypt', title: 'Ancient Egypt', subtitle: 'Nile River & Golden Pyramids', emoji: '🐪', gate: 'Gate A2',
      description: 'Sail a felucca down the Nile, explore the pyramids, decode hieroglyph puzzles, and befriend desert cats!' },
    { id: 'vikings', title: 'Viking Era Village', subtitle: 'Fjord Harbor & Northern Lights', emoji: '⛵', gate: 'Gate A3',
      description: 'Explore cozy wooden longhouses under the aurora borealis, meet friendly reindeer & puffins, and craft rune charms!' },
    { id: 'rome', title: 'Ancient Rome', subtitle: 'Colosseum Plaza & Gelato Alley', emoji: '🏛️', gate: 'Gate B1',
      description: 'Stroll sunlit marble piazzas, scoop rainbow gelato, build mini mosaic tiles, and spot Roman courtyard kitties!' },
    { id: 'paris', title: 'Paris', subtitle: 'Eiffel Gardens & Patisserie Lane', emoji: '🥐', gate: 'Gate B2',
      description: 'Paint by the Seine, bake macarons & croissants, ride a carousel beneath the Eiffel Tower, and find Parisian puppies!' },
    { id: 'greece', title: 'Ancient Greece', subtitle: 'Acropolis Hill & Aegean Harbor', emoji: '🏺', gate: 'Gate B3',
      description: 'Sail turquoise island coves, meet Pegasus statues, solve myth riddles, and paint Greek pottery!' },
    { id: 'machu_picchu', title: 'Machu Picchu', subtitle: 'Cloud Forest & Inca Terraces', emoji: '🦙', gate: 'Gate C1',
      description: 'Climb misty stone terraces, befriend fluffy alpacas & llamas, weave colorful patterns, and spot Andean condors!' },
    { id: 'australia', title: 'Australian Wilderness', subtitle: 'Outback, Koalas & Great Barrier Reef', emoji: '🦘', gate: 'Gate C2',
      description: 'Hop with kangaroos, hug eucalyptus koalas, explore red desert arches, and snorkel colorful coral reefs!' },
    { id: 'swiss_alps', title: 'Swiss Alps & Chocolate Fairytale Village', subtitle: 'Mountain Cable Car & Cozy Chalets', emoji: '🏔️', gate: 'Gate C3',
      description: 'Ride a colorful mountain cable car, pet fluffy St. Bernard puppies, visit a cozy hot-chocolate & fondue chalet, solve a cuckoo-clock music puzzle, and slide down gentle snow hills!' },
    { id: 'amazon_rainforest', title: 'Amazon Rainforest Treehouse Village', subtitle: 'Canopy Rope Bridges & River Canoes', emoji: '🦜', gate: 'Gate D1',
      description: 'Cross swinging canopy rope bridges high in giant trees, spot toucans, sloths & capybaras, paddle a gentle river canoe, and decorate a treetop lookout!' },
    { id: 'marrakech', title: 'Marrakech Lantern Bazaar (Morocco)', subtitle: 'Glowing Mosaic Souk & Desert Courtyard', emoji: '🏜️', gate: 'Gate D2',
      description: 'Explore a colorful tiled courtyard souk glowing with mosaic lanterns, sip sweet mint tea, befriend cute big-eared fennec foxes & camels, and design mosaic tile patterns!' },
    { id: 'space', title: 'Outer Space Station', subtitle: 'Moon Base & Starlight Observatory', emoji: '🚀', gate: 'Gate S1',
      description: 'Bounce in low gravity on the Moon, drive a lunar rover, meet friendly alien pets, and explore planets!' },
    { id: 'dinosaur_valley', title: 'Dinosaur Valley & Prehistoric Park', subtitle: 'Amber Jungle & Time-Travel Sanctuary', emoji: '🦕', gate: 'Gate T1', bonus: true,
      description: 'Step through a glowing time portal to feed gentle Brachiosaurus, ride a Triceratops trail, hatch baby dino eggs, and hunt amber fossils!' },
    { id: 'atlantis_reef', title: 'Underwater Coral Kingdom & Atlantis', subtitle: 'Crystal Reef & Bubble Submarine', emoji: '🐠', gate: 'Gate U1', bonus: true,
      description: 'Dive aboard a bubble submarine to swim with friendly dolphins & sea turtles, explore glowing Atlantis arches, and collect pearl shells!' },
    { id: 'fairy_castle', title: 'Medieval Fairy-Tale Castle & Dragon Valley', subtitle: 'Storybook Keep & Friendly Dragons', emoji: '🏰', gate: 'Gate M1', bonus: true,
      description: 'Visit a hilltop storybook castle, befriend a playful baby dragon, brew rainbow sparkle potions, and hunt enchanted crystal crowns!' },
    { id: 'arctic_village', title: 'Arctic Snow Village & Polar Penguins', subtitle: 'Glittering Glaciers & Dancing Aurora', emoji: '❄️', gate: 'Gate N1', bonus: true,
      description: 'Sled down sparkling snow hills under the Northern Lights, waddle with adorable penguins & polar bear cubs, and sip hot cocoa in a cozy igloo!' },
    { id: 'hawaii_lagoon', title: 'Hawaiian Tropical Island & Volcano Lagoon', subtitle: 'Turquoise Surf & Hibiscus Beach', emoji: '🌴', gate: 'Gate P1', bonus: true,
      description: 'Weave hibiscus flower leis, surf gentle turquoise waves, roast marshmallows by a tiki lagoon, and spot colorful tropical parrots!' }
  ];

  LS.PASSPORT_STAMPS = [
    { id: 'tokyo_ramen', world: 'tokyo', emoji: '🍜', title: 'Ramen Foodie', desc: 'Enjoyed a hot bowl at Ichiban Ramen' },
    { id: 'tokyo_quiz', world: 'tokyo', emoji: '🏫', title: 'Sakura Scholar', desc: 'Completed a quiz at Sakura Elementary' },
    { id: 'tokyo_cats', world: 'tokyo', emoji: '🐱', title: 'Tokyo Cat Friend', desc: 'Found all 5 hidden cats in Tokyo' },
    { id: 'tokyo_toys', world: 'tokyo', emoji: '🎁', title: 'Capsule Collector', desc: 'Collected 3+ Gachapon capsule toys' },
    { id: 'tokyo_airport', world: 'tokyo', emoji: '✈️', title: 'World Flyer', desc: 'Visited Haneda-Tokyo International Airport' },
    { id: 'room_decorator', world: 'tokyo', emoji: '🏡', title: 'Room Designer', desc: 'Stepped inside & decorated Laila & Salma\'s Room' },
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
