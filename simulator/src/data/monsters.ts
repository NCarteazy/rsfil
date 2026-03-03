// ============================================================================
//  OSRS Monster Drop Tables — curated for the loot simulator
//  Each table is a simplified version of the real OSRS drop table.
//  Rarities expressed as "1 in X" (e.g. rarity: 128 means 1/128 chance)
// ============================================================================

export interface Drop {
  itemId: number;
  itemName: string;
  quantity: [number, number]; // [min, max]
  rarity: number;            // 1-in-X (1 = always)
  noted: boolean;
}

export interface MonsterDef {
  name: string;
  category: string;
  drops: Drop[];
}

function d(
  itemId: number,
  itemName: string,
  qty: number | [number, number],
  rarity: number,
  noted = false
): Drop {
  const quantity: [number, number] = Array.isArray(qty) ? qty : [qty, qty];
  return { itemId, itemName, quantity, rarity, noted };
}

export const MONSTERS: MonsterDef[] = [
  // ========== GWD ==========
  {
    name: "General Graardor",
    category: "GWD",
    drops: [
      d(11832, "Bandos chestplate", 1, 384),
      d(11834, "Bandos tassets", 1, 384),
      d(11836, "Bandos boots", 1, 384),
      d(11814, "Bandos hilt", 1, 508),
      d(12650, "Pet general graardor", 1, 5000),
      d(11818, "Godsword shard 1", 1, 762),
      d(11820, "Godsword shard 2", 1, 762),
      d(11822, "Godsword shard 3", 1, 762),
      // Common drops
      d(995, "Coins", [19500, 20500], 1),
      d(532, "Big bones", 1, 1),
      d(1127, "Rune platebody", 1, 16),
      d(892, "Rune arrow", [8, 15], 6, false),
      d(561, "Nature rune", [55, 75], 8),
      d(560, "Death rune", [25, 45], 10),
      d(207, "Grimy ranarr weed", [3, 5], 12),
      d(2366, "Shield left half", 1, 64),
      d(5295, "Ranarr seed", [2, 3], 30),
    ],
  },
  {
    name: "Kree'arra",
    category: "GWD",
    drops: [
      d(11826, "Armadyl helmet", 1, 384),
      d(11828, "Armadyl chestplate", 1, 384),
      d(11830, "Armadyl chainskirt", 1, 384),
      d(11812, "Armadyl hilt", 1, 508),
      d(12649, "Pet kree'arra", 1, 5000),
      d(11818, "Godsword shard 1", 1, 762),
      d(11820, "Godsword shard 2", 1, 762),
      d(11822, "Godsword shard 3", 1, 762),
      d(995, "Coins", [19000, 21000], 1),
      d(892, "Rune arrow", [15, 25], 3),
      d(11212, "Dragon arrow", [5, 15], 8),
      d(565, "Blood rune", [60, 90], 6),
      d(2722, "Clue scroll (hard)", 1, 60),
      d(5300, "Snapdragon seed", 1, 35),
    ],
  },
  {
    name: "Commander Zilyana",
    category: "GWD",
    drops: [
      d(11838, "Saradomin sword", 1, 254),
      d(11785, "Armadyl crossbow", 1, 508),
      d(11816, "Saradomin hilt", 1, 508),
      d(13256, "Saradomin's light", 1, 254),
      d(12651, "Pet zilyana", 1, 5000),
      d(11818, "Godsword shard 1", 1, 762),
      d(11820, "Godsword shard 2", 1, 762),
      d(11822, "Godsword shard 3", 1, 762),
      d(995, "Coins", [19500, 20500], 1),
      d(1079, "Rune platelegs", 1, 16),
      d(1201, "Rune kiteshield", 1, 16),
      d(6685, "Saradomin brew(4)", [3, 3], 10),
      d(560, "Death rune", [60, 90], 6),
      d(2677, "Clue scroll (easy)", 1, 80),
    ],
  },
  {
    name: "K'ril Tsutsaroth",
    category: "GWD",
    drops: [
      d(11791, "Staff of the dead", 1, 508),
      d(11824, "Zamorakian spear", 1, 254),
      d(11787, "Steam battlestaff", 1, 127),
      d(11817, "Zamorak hilt", 1, 508),
      d(12652, "Pet k'ril tsutsaroth", 1, 5000),
      d(11818, "Godsword shard 1", 1, 762),
      d(11820, "Godsword shard 2", 1, 762),
      d(11822, "Godsword shard 3", 1, 762),
      d(995, "Coins", [19500, 20500], 1),
      d(3024, "Super restore(4)", [3, 3], 10),
      d(207, "Grimy ranarr weed", [3, 5], 12),
      d(1333, "Rune scimitar", 1, 16),
    ],
  },

  // ========== Slayer Bosses ==========
  {
    name: "Alchemical Hydra",
    category: "Slayer",
    drops: [
      d(22966, "Hydra's claw", 1, 1001),
      d(22983, "Hydra leather", 1, 514),
      d(22973, "Hydra's eye", 1, 181),
      d(22971, "Hydra's fang", 1, 181),
      d(22969, "Hydra's heart", 1, 181),
      d(22746, "Ikkle hydra", 1, 3000),
      d(23083, "Brimstone key", 1, 50),
      d(995, "Coins", [20000, 40000], 1),
      d(560, "Death rune", [150, 250], 6),
      d(565, "Blood rune", [100, 200], 8),
      d(1127, "Rune platebody", 1, 25),
      d(207, "Grimy ranarr weed", [5, 10], 10),
      d(13441, "Anglerfish", [5, 10], 8),
      d(5295, "Ranarr seed", [2, 4], 20),
      d(2722, "Clue scroll (hard)", 1, 50),
      d(12073, "Clue scroll (elite)", 1, 200),
    ],
  },
  {
    name: "Cerberus",
    category: "Slayer",
    drops: [
      d(13229, "Pegasian crystal", 1, 512),
      d(13231, "Primordial crystal", 1, 512),
      d(13227, "Eternal crystal", 1, 512),
      d(13233, "Smouldering stone", 1, 512),
      d(13247, "Hellpuppy", 1, 3000),
      d(995, "Coins", [5000, 15000], 1),
      d(592, "Ashes", 1, 1),
      d(560, "Death rune", [50, 100], 8),
      d(1079, "Rune platelegs", 1, 25),
      d(1201, "Rune kiteshield", 1, 25),
      d(12073, "Clue scroll (elite)", 1, 200),
    ],
  },
  {
    name: "Kraken",
    category: "Slayer",
    drops: [
      d(12004, "Kraken tentacle", 1, 400),
      d(11908, "Uncharged trident", 1, 512),
      d(12650, "Pet kraken", 1, 3000),
      d(995, "Coins", [5000, 15000], 1),
      d(560, "Death rune", [50, 100], 6),
      d(565, "Blood rune", [30, 60], 10),
      d(561, "Nature rune", [50, 80], 8),
      d(1127, "Rune platebody", 1, 40),
      d(207, "Grimy ranarr weed", [3, 6], 15),
      d(2722, "Clue scroll (hard)", 1, 100),
    ],
  },

  // ========== Popular Bosses ==========
  {
    name: "Vorkath",
    category: "Dragons",
    drops: [
      d(22006, "Skeletal visage", 1, 5000),
      d(11286, "Draconic visage", 1, 5000),
      d(19547, "Dragonbone necklace", 1, 1000),
      d(21992, "Vorki", 1, 3000),
      d(995, "Coins", [30000, 60000], 1),
      d(534, "Babydragon bones", [15, 25], 1, true),
      d(11212, "Dragon arrow", [25, 50], 4),
      d(21895, "Dragon knife", [10, 25], 6),
      d(560, "Death rune", [150, 300], 4),
      d(565, "Blood rune", [50, 100], 6),
      d(1127, "Rune platebody", 1, 25),
      d(1319, "Rune 2h sword", 1, 25),
      d(207, "Grimy ranarr weed", [5, 10], 10, true),
      d(13441, "Anglerfish", [10, 15], 8),
      d(5316, "Magic seed", [1, 2], 50),
      d(2722, "Clue scroll (hard)", 1, 60),
      d(12073, "Clue scroll (elite)", 1, 200),
    ],
  },
  {
    name: "Zulrah",
    category: "Bosses",
    drops: [
      d(12922, "Tanzanite fang", 1, 512),
      d(12932, "Magic fang", 1, 512),
      d(12927, "Serpentine visage", 1, 512),
      d(6573, "Uncut onyx", 1, 512),
      d(12921, "Pet snakeling", 1, 4000),
      d(995, "Coins", [10000, 30000], 1),
      d(560, "Death rune", [200, 300], 4),
      d(565, "Blood rune", [100, 200], 6),
      d(563, "Law rune", [100, 200], 6),
      d(207, "Grimy ranarr weed", [5, 10], 10, true),
      d(3051, "Grimy snapdragon", [5, 10], 10, true),
      d(1079, "Rune platelegs", 1, 25),
      d(5295, "Ranarr seed", [2, 4], 25),
      d(391, "Manta ray", [20, 35], 8),
      d(2722, "Clue scroll (hard)", 1, 75),
      d(12073, "Clue scroll (elite)", 1, 250),
    ],
  },
  {
    name: "Corporeal Beast",
    category: "Bosses",
    drops: [
      d(12817, "Elysian sigil", 1, 4095),
      d(12825, "Arcane sigil", 1, 1365),
      d(12819, "Spectral sigil", 1, 1365),
      d(12829, "Holy elixir", 1, 171),
      d(12648, "Pet dark core", 1, 5000),
      d(995, "Coins", [10000, 30000], 1),
      d(6573, "Uncut onyx", 1, 171),
      d(1127, "Rune platebody", 1, 10),
      d(3144, "Cooked karambwan", [10, 20], 6),
      d(560, "Death rune", [100, 200], 6),
      d(2366, "Shield left half", 1, 100),
    ],
  },
  {
    name: "Nex",
    category: "Bosses",
    drops: [
      d(26382, "Torva full helm", 1, 258),
      d(26384, "Torva platebody", 1, 258),
      d(26386, "Torva platelegs", 1, 258),
      d(26235, "Zaryte vambraces", 1, 258),
      d(26372, "Nihil horn", 1, 258),
      d(26348, "Nexling", 1, 500),
      d(995, "Coins", [50000, 120000], 1),
      d(565, "Blood rune", [200, 400], 3),
      d(21880, "Wrath rune", [100, 200], 5),
      d(1127, "Rune platebody", 1, 10),
      d(12073, "Clue scroll (elite)", 1, 50),
    ],
  },

  // ========== DKs ==========
  {
    name: "Dagannoth Rex",
    category: "DKs",
    drops: [
      d(6737, "Berserker ring", 1, 128),
      d(6735, "Warrior ring", 1, 128),
      d(6739, "Dragon axe", 1, 128),
      d(12645, "Pet dagannoth rex", 1, 5000),
      d(995, "Coins", [5000, 10000], 1),
      d(532, "Big bones", 1, 1),
      d(1079, "Rune platelegs", 1, 30),
      d(561, "Nature rune", [30, 60], 8),
      d(207, "Grimy ranarr weed", [3, 5], 15),
    ],
  },
  {
    name: "Dagannoth Supreme",
    category: "DKs",
    drops: [
      d(6733, "Archers ring", 1, 128),
      d(6731, "Seers ring", 1, 128),
      d(6739, "Dragon axe", 1, 128),
      d(12644, "Pet dagannoth supreme", 1, 5000),
      d(995, "Coins", [5000, 10000], 1),
      d(532, "Big bones", 1, 1),
      d(1127, "Rune platebody", 1, 30),
      d(560, "Death rune", [30, 60], 8),
    ],
  },

  // ========== Barrows ==========
  {
    name: "Barrows",
    category: "Minigame",
    drops: [
      // Each piece is ~1/350 per chest (simplified)
      d(4708, "Ahrim's hood", 1, 350),
      d(4712, "Ahrim's robetop", 1, 350),
      d(4714, "Ahrim's robeskirt", 1, 350),
      d(4710, "Ahrim's staff", 1, 350),
      d(4716, "Dharok's helm", 1, 350),
      d(4720, "Dharok's platebody", 1, 350),
      d(4722, "Dharok's platelegs", 1, 350),
      d(4718, "Dharok's greataxe", 1, 350),
      d(4724, "Guthan's helm", 1, 350),
      d(4728, "Guthan's platebody", 1, 350),
      d(4730, "Guthan's chainskirt", 1, 350),
      d(4726, "Guthan's warspear", 1, 350),
      d(4732, "Karil's coif", 1, 350),
      d(4736, "Karil's leathertop", 1, 350),
      d(4738, "Karil's leatherskirt", 1, 350),
      d(4734, "Karil's crossbow", 1, 350),
      d(4745, "Torag's helm", 1, 350),
      d(4749, "Torag's platebody", 1, 350),
      d(4751, "Torag's platelegs", 1, 350),
      d(4747, "Torag's hammers", 1, 350),
      d(4753, "Verac's helm", 1, 350),
      d(4757, "Verac's brassard", 1, 350),
      d(4759, "Verac's plateskirt", 1, 350),
      d(4755, "Verac's flail", 1, 350),
      // Common chest loot
      d(995, "Coins", [5000, 15000], 1),
      d(560, "Death rune", [150, 350], 2),
      d(565, "Blood rune", [100, 250], 2),
      d(563, "Law rune", [40, 60], 3),
      d(561, "Nature rune", [20, 40], 4),
    ],
  },

  // ========== Slayer Monsters (for alch-value testing) ==========
  {
    name: "Gargoyles",
    category: "Slayer",
    drops: [
      d(995, "Coins", [5000, 12000], 2),
      d(1149, "Dragon med helm", 1, 256),
      d(1079, "Rune platelegs", 1, 16),
      d(1127, "Rune platebody", 1, 16),
      d(1163, "Rune full helm", 1, 16),
      d(1201, "Rune kiteshield", 1, 32),
      d(1093, "Rune chainbody", 1, 64),
      d(1333, "Rune scimitar", 1, 32),
      d(1213, "Rune dagger", 1, 32),
      d(532, "Big bones", 1, 1),
      d(207, "Grimy ranarr weed", [1, 3], 15),
      d(2677, "Clue scroll (easy)", 1, 80),
      d(2722, "Clue scroll (hard)", 1, 128),
      d(25778, "Abyssal ashes", 1, 1),
    ],
  },
  {
    name: "Dust Devils",
    category: "Slayer",
    drops: [
      d(995, "Coins", [200, 1000], 3),
      d(4587, "Dragon scimitar", 1, 128),
      d(1434, "Dragon mace", 1, 128),
      d(1305, "Dragon longsword", 1, 128),
      d(1127, "Rune platebody", 1, 64),
      d(1079, "Rune platelegs", 1, 64),
      d(592, "Ashes", 1, 1),
      d(207, "Grimy ranarr weed", [1, 2], 20),
      d(561, "Nature rune", [15, 30], 8),
      d(2801, "Clue scroll (medium)", 1, 128),
      d(25770, "Vile ashes", 1, 1),
    ],
  },
  {
    name: "Nechryael",
    category: "Slayer",
    drops: [
      d(995, "Coins", [1000, 5000], 3),
      d(1127, "Rune platebody", 1, 30),
      d(1079, "Rune platelegs", 1, 30),
      d(1319, "Rune 2h sword", 1, 40),
      d(1359, "Rune axe", 1, 50),
      d(207, "Grimy ranarr weed", [1, 3], 15),
      d(560, "Death rune", [15, 30], 6),
      d(2722, "Clue scroll (hard)", 1, 128),
      d(25778, "Abyssal ashes", 1, 1),
    ],
  },

  // ========== Random Mixed Loot ==========
  {
    name: "Random Mixed Loot",
    category: "Custom",
    drops: [
      // Big ticket items at very low rates
      d(20997, "Twisted bow", 1, 5000),
      d(22325, "Scythe of vitur", 1, 5000),
      d(11832, "Bandos chestplate", 1, 500),
      d(11834, "Bandos tassets", 1, 500),
      d(11828, "Armadyl chestplate", 1, 500),
      d(22966, "Hydra's claw", 1, 1000),
      d(13231, "Primordial crystal", 1, 500),
      d(4151, "Abyssal whip", 1, 100),
      d(6737, "Berserker ring", 1, 128),
      d(12817, "Elysian sigil", 1, 10000),
      // Medium value
      d(1149, "Dragon med helm", 1, 50),
      d(1127, "Rune platebody", 1, 8),
      d(1079, "Rune platelegs", 1, 8),
      d(1201, "Rune kiteshield", 1, 12),
      d(2366, "Shield left half", 1, 50),
      // Supplies
      d(207, "Grimy ranarr weed", [1, 5], 4),
      d(3051, "Grimy snapdragon", [1, 3], 6),
      d(5295, "Ranarr seed", [1, 2], 15),
      d(5316, "Magic seed", 1, 80),
      d(385, "Shark", [1, 5], 3),
      d(13441, "Anglerfish", [1, 5], 5),
      // Runes
      d(560, "Death rune", [10, 50], 3),
      d(565, "Blood rune", [10, 30], 5),
      d(561, "Nature rune", [10, 40], 4),
      d(563, "Law rune", [10, 30], 5),
      // Clues
      d(2677, "Clue scroll (easy)", 1, 50),
      d(2801, "Clue scroll (medium)", 1, 80),
      d(2722, "Clue scroll (hard)", 1, 120),
      d(12073, "Clue scroll (elite)", 1, 400),
      // Untradeables
      d(23083, "Brimstone key", 1, 60),
      d(19677, "Ancient shard", 1, 80),
      d(19679, "Dark totem base", 1, 120),
      // Junk
      d(995, "Coins", [100, 50000], 1),
      d(526, "Bones", 1, 2),
      d(592, "Ashes", 1, 3),
      d(886, "Iron arrow", [5, 20], 3),
      d(1739, "Cowhide", 1, 4),
    ],
  },
];

export function getMonsterByName(name: string): MonsterDef | undefined {
  return MONSTERS.find((m) => m.name === name);
}

export function getMonsterNames(): string[] {
  return MONSTERS.map((m) => m.name);
}

export function getMonstersByCategory(): Record<string, MonsterDef[]> {
  const cats: Record<string, MonsterDef[]> = {};
  for (const m of MONSTERS) {
    if (!cats[m.category]) cats[m.category] = [];
    cats[m.category].push(m);
  }
  return cats;
}
