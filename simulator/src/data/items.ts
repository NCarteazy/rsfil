// ============================================================================
//  OSRS Item Database — curated subset for the loot simulator
//  Covers: boss uniques, common drops, supplies, clues, junk
//  Source: OSRS Wiki + OSRSReboxed
// ============================================================================

export interface ItemDef {
  id: number;
  name: string;
  haValue: number;
  geValue: number;
  tradeable: boolean;
  stackable: boolean;
  members: boolean;
}

// Items indexed by ID for O(1) lookup
const ITEMS_BY_ID: Map<number, ItemDef> = new Map();
// Items indexed by lowercase name for name-based lookup
const ITEMS_BY_NAME: Map<string, ItemDef[]> = new Map();

function item(
  id: number,
  name: string,
  haValue: number,
  geValue: number,
  tradeable = true,
  stackable = false,
  members = true
): ItemDef {
  const def: ItemDef = { id, name, haValue, geValue, tradeable, stackable, members };
  ITEMS_BY_ID.set(id, def);
  const lower = name.toLowerCase();
  if (!ITEMS_BY_NAME.has(lower)) ITEMS_BY_NAME.set(lower, []);
  ITEMS_BY_NAME.get(lower)!.push(def);
  return def;
}

// ---- Mega Rares ----
item(20997, "Twisted bow", 72000, 1_450_000_000);
item(22325, "Scythe of vitur", 120000, 850_000_000);
item(27275, "Tumeken's shadow", 120000, 1_200_000_000);
item(27226, "Masori mask", 60000, 42_000_000);
item(27229, "Masori body", 60000, 78_000_000);
item(27232, "Masori chaps", 60000, 60_000_000);
item(26382, "Torva full helm", 60000, 58_000_000);
item(26384, "Torva platebody", 60000, 145_000_000);
item(26386, "Torva platelegs", 60000, 98_000_000);
item(21018, "Ancestral hat", 36000, 22_000_000);
item(21021, "Ancestral robe top", 54000, 55_000_000);
item(21024, "Ancestral robe bottom", 48000, 38_000_000);
item(21043, "Kodai insignia", 30000, 65_000_000);
item(21034, "Dexterous prayer scroll", 30000, 42_000_000);
item(21079, "Arcane prayer scroll", 30000, 18_000_000);
item(13652, "Dragon claws", 72000, 68_000_000);
item(21003, "Elder maul", 48000, 8_500_000);
item(21015, "Dinh's bulwark", 48000, 5_500_000);
item(22477, "Avernic defender hilt", 90000, 55_000_000);
item(22323, "Sanguinesti staff", 96000, 28_000_000);
item(22324, "Ghrazi rapier", 90000, 115_000_000);
item(24511, "Harmonised orb", 60000, 180_000_000);
item(24514, "Eldritch orb", 60000, 120_000_000);
item(24517, "Volatile orb", 60000, 65_000_000);
item(24419, "Inquisitor's great helm", 60000, 15_000_000);
item(24420, "Inquisitor's hauberk", 60000, 65_000_000);
item(24421, "Inquisitor's plateskirt", 60000, 35_000_000);
item(22322, "Justiciar faceguard", 60000, 2_000_000);
item(22327, "Justiciar chestguard", 60000, 3_500_000);
item(22328, "Justiciar legguards", 60000, 2_500_000);

// Pets (untradeable)
item(20851, "Olmlet", 1, 0, false);
item(22473, "Lil' zik", 1, 0, false);
item(27352, "Tumeken's guardian", 1, 0, false);
item(26348, "Nexling", 1, 0, false);
item(22960, "Smolcano", 1, 0, false);
item(20693, "Phoenix", 1, 0, false);
item(21291, "Jal-nib-rek", 1, 0, false);
item(22746, "Ikkle hydra", 1, 0, false);
item(23495, "Sraracha", 1, 0, false);
item(13071, "Noon", 1, 0, false);
item(13073, "Midnight", 1, 0, false);
item(21992, "Vorki", 1, 0, false);
item(12653, "Prince black dragon", 1, 0, false);
item(12654, "Kalphite princess", 1, 0, false);
item(12646, "Baby mole", 1, 0, false);
item(13247, "Hellpuppy", 1, 0, false);
item(19730, "Bloodhound", 1, 0, false);
item(12650, "Pet kraken", 1, 0, false);

// ---- GWD Uniques ----
item(11832, "Bandos chestplate", 60000, 16_000_000);
item(11834, "Bandos tassets", 60000, 24_000_000);
item(11836, "Bandos boots", 20400, 350_000);
item(11826, "Armadyl helmet", 42000, 4_500_000);
item(11828, "Armadyl chestplate", 57600, 31_000_000);
item(11830, "Armadyl chainskirt", 51600, 27_000_000);
item(11838, "Saradomin sword", 48000, 250_000);
item(11785, "Armadyl crossbow", 42000, 12_000_000);
item(13256, "Saradomin's light", 1200, 1_200_000);
item(11791, "Staff of the dead", 36000, 3_000_000);
item(11824, "Zamorakian spear", 39000, 3_500_000);
item(11787, "Steam battlestaff", 19500, 150_000);
item(11818, "Godsword shard 1", 30000, 140_000);
item(11820, "Godsword shard 2", 30000, 140_000);
item(11822, "Godsword shard 3", 30000, 140_000);
item(11810, "Armadyl godsword", 120000, 10_000_000);
item(11804, "Bandos godsword", 120000, 2_000_000);
item(11806, "Saradomin godsword", 120000, 22_000_000);
item(11808, "Zamorak godsword", 120000, 3_000_000);
item(11812, "Armadyl hilt", 72000, 7_500_000);
item(11814, "Bandos hilt", 72000, 650_000);
item(11816, "Saradomin hilt", 72000, 20_000_000);
item(11817, "Zamorak hilt", 72000, 1_500_000);

// ---- Slayer Boss Uniques ----
item(4151, "Abyssal whip", 72000, 1_800_000);
item(13265, "Abyssal dagger", 48000, 5_500_000);
item(12004, "Kraken tentacle", 6000, 700_000);
item(11905, "Trident of the seas", 0, 0, false);
item(11908, "Uncharged trident", 0, 260_000);
item(13229, "Pegasian crystal", 36000, 28_000_000);
item(13231, "Primordial crystal", 36000, 22_000_000);
item(13227, "Eternal crystal", 36000, 6_000_000);
item(13233, "Smouldering stone", 36000, 4_000_000);
item(22966, "Hydra's claw", 30000, 55_000_000);
item(22983, "Hydra leather", 30000, 4_500_000);
item(22973, "Hydra's eye", 2400, 1_000_000);
item(22971, "Hydra's fang", 2400, 1_500_000);
item(22969, "Hydra's heart", 2400, 3_000_000);
item(22975, "Brimstone ring", 30000, 6_000_000);

// ---- Barrows ----
item(4708, "Ahrim's hood", 6600, 150_000);
item(4712, "Ahrim's robetop", 18000, 1_000_000);
item(4714, "Ahrim's robeskirt", 14400, 600_000);
item(4710, "Ahrim's staff", 12000, 100_000);
item(4716, "Dharok's helm", 6600, 200_000);
item(4720, "Dharok's platebody", 18000, 500_000);
item(4722, "Dharok's platelegs", 14400, 500_000);
item(4718, "Dharok's greataxe", 12000, 450_000);
item(4724, "Guthan's helm", 6600, 200_000);
item(4728, "Guthan's platebody", 18000, 300_000);
item(4730, "Guthan's chainskirt", 14400, 200_000);
item(4726, "Guthan's warspear", 12000, 400_000);
item(4732, "Karil's coif", 6600, 50_000);
item(4736, "Karil's leathertop", 18000, 1_200_000);
item(4738, "Karil's leatherskirt", 14400, 100_000);
item(4734, "Karil's crossbow", 12000, 100_000);
item(4745, "Torag's helm", 6600, 50_000);
item(4749, "Torag's platebody", 18000, 200_000);
item(4751, "Torag's platelegs", 14400, 200_000);
item(4747, "Torag's hammers", 12000, 100_000);
item(4753, "Verac's helm", 6600, 100_000);
item(4757, "Verac's brassard", 18000, 150_000);
item(4759, "Verac's plateskirt", 14400, 150_000);
item(4755, "Verac's flail", 12000, 150_000);

// ---- DKs / Wildy / misc ----
item(6737, "Berserker ring", 21000, 2_700_000);
item(6733, "Archers ring", 21000, 3_500_000);
item(6731, "Seers ring", 21000, 200_000);
item(6735, "Warrior ring", 21000, 100_000);
item(6739, "Dragon axe", 36000, 400_000);
item(11920, "Dragon pickaxe", 36000, 6_000_000);
item(21028, "Dragon harpoon", 36000, 4_000_000);
item(12601, "Treasonous ring", 21000, 200_000);
item(12603, "Tyrannical ring", 21000, 150_000);
item(12605, "Ring of the gods", 21000, 7_000_000);
item(11235, "Dark bow", 12000, 350_000);
item(8901, "Black mask", 15000, 900_000);

// ---- Zulrah ----
item(12922, "Tanzanite fang", 60000, 3_000_000);
item(12932, "Magic fang", 48000, 2_500_000);
item(12927, "Serpentine visage", 60000, 3_000_000);
item(6573, "Uncut onyx", 54000, 2_200_000);

// ---- Vorkath ----
item(11286, "Draconic visage", 54000, 4_500_000);
item(22006, "Skeletal visage", 72000, 18_000_000);
item(19547, "Dragonbone necklace", 30000, 850_000);

// ---- Corp ----
item(12819, "Spectral sigil", 60000, 10_000_000);
item(12825, "Arcane sigil", 60000, 100_000_000);
item(12817, "Elysian sigil", 60000, 350_000_000);
item(12829, "Holy elixir", 36000, 2_000_000);

// ---- Nex ----
item(26235, "Zaryte vambraces", 42000, 38_000_000);
item(26372, "Nihil horn", 30000, 40_000_000);

// ---- DT2 ----
item(27616, "Chromium ingot", 30000, 6_000_000);
item(26241, "Virtus mask", 42000, 12_000_000);
item(26243, "Virtus robe top", 48000, 22_000_000);
item(26245, "Virtus robe bottom", 45000, 18_000_000);
item(27277, "Ancient sceptre", 42000, 8_000_000);
item(27281, "Ring of shadows", 30000, 15_000_000);
item(27627, "Venator shard", 12000, 3_500_000);
item(27619, "Blood quartz", 18000, 6_000_000);
item(27621, "Ice quartz", 18000, 5_000_000);
item(27623, "Smoke quartz", 18000, 4_500_000);
item(27625, "Shadow quartz", 18000, 7_000_000);

// ---- Clue Scrolls ----
item(23182, "Clue scroll (beginner)", 0, 0, false);
item(2677, "Clue scroll (easy)", 0, 0, false);
item(2801, "Clue scroll (medium)", 0, 0, false);
item(2722, "Clue scroll (hard)", 0, 0, false);
item(12073, "Clue scroll (elite)", 0, 0, false);
item(19835, "Clue scroll (master)", 0, 0, false);

// ---- Keys / Untradeables ----
item(23083, "Brimstone key", 0, 0, false);
item(23490, "Larran's key", 0, 0, false);
item(23962, "Crystal shard", 0, 0, false, true);
item(19677, "Ancient shard", 0, 0, false);
item(19679, "Dark totem base", 0, 0, false);
item(19681, "Dark totem middle", 0, 0, false);
item(19683, "Dark totem top", 0, 0, false);
item(11941, "Long bone", 0, 0, false);
item(11943, "Curved bone", 0, 0, false);
item(11942, "Ecumenical key", 0, 0, false);

// ---- Supplies: Herbs ----
item(207, "Grimy ranarr weed", 4800, 7_500);
item(3051, "Grimy snapdragon", 6000, 7_000);
item(219, "Grimy torstol", 7200, 8_000);
item(3049, "Grimy toadflax", 2400, 3_000);
item(213, "Grimy kwuarm", 3600, 1_500);
item(215, "Grimy cadantine", 3000, 1_200);
item(217, "Grimy dwarf weed", 3600, 800);
item(2485, "Grimy lantadyme", 3000, 1_200);
item(211, "Grimy avantoe", 2400, 1_600);
item(209, "Grimy irit leaf", 1200, 800);

// ---- Supplies: Seeds ----
item(5295, "Ranarr seed", 480, 35_000, true, true);
item(5300, "Snapdragon seed", 600, 45_000, true, true);
item(5304, "Torstol seed", 720, 50_000, true, true);
item(5289, "Palm tree seed", 240, 25_000, true, true);
item(5316, "Magic seed", 480, 120_000, true, true);
item(22877, "Dragonfruit tree seed", 360, 30_000, true, true);
item(22869, "Celastrus seed", 300, 55_000, true, true);
item(22871, "Redwood tree seed", 420, 15_000, true, true);
item(22875, "Hespori seed", 0, 0, false, true);

// ---- Supplies: Potions ----
item(3024, "Super restore(4)", 600, 8_000);
item(2434, "Prayer potion(4)", 600, 7_500);
item(6685, "Saradomin brew(4)", 600, 5_000);
item(2444, "Ranging potion(4)", 480, 1_000);
item(12695, "Super combat potion(4)", 600, 10_000);
item(12625, "Stamina potion(4)", 360, 6_000);
item(10925, "Sanfew serum(4)", 600, 15_000);

// ---- Supplies: Food ----
item(13441, "Anglerfish", 480, 1_500);
item(11934, "Dark crab", 480, 1_200);
item(391, "Manta ray", 600, 1_500);
item(385, "Shark", 480, 800);
item(3144, "Cooked karambwan", 300, 600);

// ---- Supplies: Runes ----
item(560, "Death rune", 120, 200, true, true);
item(565, "Blood rune", 180, 350, true, true);
item(566, "Soul rune", 150, 250, true, true);
item(21880, "Wrath rune", 240, 300, true, true);
item(563, "Law rune", 108, 170, true, true);
item(561, "Nature rune", 108, 200, true, true);
item(9075, "Astral rune", 90, 150, true, true);

// ---- Supplies: Ammo ----
item(892, "Rune arrow", 240, 100, true, true);
item(11212, "Dragon arrow", 480, 1_100, true, true);
item(9244, "Diamond bolts (e)", 180, 500, true, true);
item(9242, "Ruby bolts (e)", 120, 350, true, true);
item(9243, "Dragonstone bolts (e)", 240, 750, true, true);
item(9245, "Onyx bolts (e)", 600, 8_000, true, true);

// ---- Coins ----
item(995, "Coins", 0, 1, true, true, false);

// ---- Common drops / Alchables ----
item(1149, "Dragon med helm", 36000, 58_000);
item(1079, "Rune platelegs", 24000, 37_000);
item(1127, "Rune platebody", 24000, 38_000);
item(1093, "Rune chainbody", 18000, 29_000);
item(1163, "Rune full helm", 12000, 20_000);
item(1201, "Rune kiteshield", 19200, 31_000);
item(1213, "Rune dagger", 4800, 4_000);
item(1333, "Rune scimitar", 14400, 14_000);
item(1359, "Rune axe", 7200, 7_000);
item(1319, "Rune 2h sword", 24000, 37_000);
item(4587, "Dragon scimitar", 36000, 58_000);
item(1434, "Dragon mace", 18000, 29_000);
item(1305, "Dragon longsword", 36000, 58_000);
item(11840, "Dragon chainbody", 90000, 200_000);
item(21902, "Dragon sword", 36000, 58_000);
item(21895, "Dragon knife", 1200, 2_000, true, true);
item(21637, "Dragon thrownaxe", 1200, 1_500, true, true);
item(2366, "Shield left half", 42000, 65_000);
item(2364, "Dragon spear", 37440, 35_000);

// ---- Bones / Ashes (junk) ----
item(526, "Bones", 0, 50, true, false, false);
item(532, "Big bones", 0, 200);
item(534, "Babydragon bones", 0, 500);
item(592, "Ashes", 0, 5, true, false, false);
item(25766, "Fiendish ashes", 0, 100);
item(25770, "Vile ashes", 0, 300);
item(25774, "Malicious ashes", 0, 600);
item(25778, "Abyssal ashes", 0, 800);
item(25782, "Infernal ashes", 0, 1000);

// ---- Misc junk ----
item(886, "Iron arrow", 4, 5, true, true, false);
item(882, "Bronze arrow", 1, 3, true, true, false);
item(1115, "Iron platebody", 420, 50, true, false, false);
item(1117, "Bronze platebody", 120, 30, true, false, false);
item(1739, "Cowhide", 24, 100, true, false, false);
item(2347, "Hammer", 1, 10, true, false, false);

// ---- Noted items (for boss drop tables) ----
item(1962, "Grimy ranarr weed (noted)", 4800, 7_500, true, false);
item(1963, "Battlestaff (noted)", 4680, 8_000, true, false);
item(1964, "Shark (noted)", 480, 800, true, false);
item(1965, "Magic logs (noted)", 960, 1_000, true, true);
item(1966, "Runite ore (noted)", 7200, 11_000, true, false);
item(1967, "Runite bar (noted)", 7500, 12_000, true, false);
item(1968, "Adamantite bar (noted)", 1920, 2_000, true, false);
item(1969, "Coal (noted)", 90, 150, true, false);

// ---- Extra items for variety ----
item(1776, "Wine of zamorak", 1, 2_500);
item(231, "Snape grass", 60, 250);
item(225, "Limpwurt root", 60, 700);
item(239, "White berries", 12, 200);
item(3138, "Potato cactus", 1, 150);
item(5315, "Mort myre fungus", 1, 500);
item(21622, "Volcanic ash", 1, 200, true, true);
item(6529, "Tokkul", 0, 0, false, true);
item(6059, "Numulite", 0, 10, true, true);
item(5075, "Bird nest", 600, 5_000);
item(5076, "Crushed nest", 300, 1_500);

// ---- Lookup functions ----

export function getItemById(id: number): ItemDef | undefined {
  return ITEMS_BY_ID.get(id);
}

export function getItemByName(name: string): ItemDef | undefined {
  const matches = ITEMS_BY_NAME.get(name.toLowerCase());
  return matches?.[0];
}

export function getAllItems(): ItemDef[] {
  return Array.from(ITEMS_BY_ID.values());
}

export function searchItems(query: string): ItemDef[] {
  const lower = query.toLowerCase();
  return getAllItems().filter((item) => item.name.toLowerCase().includes(lower));
}
