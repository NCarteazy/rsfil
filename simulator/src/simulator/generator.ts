// ============================================================================
//  Loot Generator — simulates monster kills and produces ground items
// ============================================================================

import type { MonsterDef, Drop } from "../data/monsters";
import type { SimItem } from "../parser/types";
import { getItemByName } from "../data/items";

export interface LootResult {
  items: SimItem[];
  killCount: number;
  monsterName: string;
}

/**
 * Simulate N kills of a monster and return the generated loot.
 * Each kill rolls each drop independently against its rarity.
 */
export function generateLoot(
  monster: MonsterDef,
  killCount: number
): LootResult {
  // Accumulate stackable items by name
  const stacks = new Map<string, SimItem>();
  const nonStackable: SimItem[] = [];

  for (let kill = 0; kill < killCount; kill++) {
    for (const drop of monster.drops) {
      if (Math.random() < 1 / drop.rarity) {
        const qty = rollQuantity(drop.quantity);
        const item = dropToSimItem(drop, qty);
        if (!item) continue;

        if (item.stackable) {
          const existing = stacks.get(item.name);
          if (existing) {
            existing.quantity += item.quantity;
          } else {
            stacks.set(item.name, { ...item });
          }
        } else {
          nonStackable.push(item);
        }
      }
    }
  }

  const items = [...stacks.values(), ...nonStackable];

  return { items, killCount, monsterName: monster.name };
}

/**
 * Generate a single specific item for testing.
 */
export function generateCustomItem(
  name: string,
  quantity: number,
  overrides?: Partial<SimItem>
): SimItem {
  const def = getItemByName(name);
  return {
    id: def?.id ?? 0,
    name: def?.name ?? name,
    quantity,
    geValue: def?.geValue ?? 0,
    haValue: def?.haValue ?? 0,
    tradeable: def?.tradeable ?? true,
    stackable: def?.stackable ?? false,
    noted: false,
    members: def?.members ?? true,
    ...overrides,
  };
}

function rollQuantity(range: [number, number]): number {
  const [min, max] = range;
  if (min === max) return min;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function dropToSimItem(drop: Drop, quantity: number): SimItem | null {
  const def = getItemByName(drop.itemName);

  return {
    id: def?.id ?? drop.itemId,
    name: def?.name ?? drop.itemName,
    quantity,
    geValue: def?.geValue ?? 0,
    haValue: def?.haValue ?? 0,
    tradeable: def?.tradeable ?? true,
    stackable: def?.stackable ?? false,
    noted: drop.noted,
    members: def?.members ?? true,
  };
}
