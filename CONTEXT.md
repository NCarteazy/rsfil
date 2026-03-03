# OSRS Loot Simulator — Project Context & Reference

This document captures all research and context needed to resume work on the OSRS loot simulator project.

---

## 1. Current Repo State (rsfil)

This repo contains `filter.rs2f` — an ironman-focused loot filter for the RuneLite **Loot Filters** plugin. The filter uses the **rs2f** language (RuneScape 2 Filter) and is organized into modules:

| Module | Color | Purpose |
|---|---|---|
| Mega Rares | `#ffffff` (white) | Raid purples, pets, 3rd age. Lootbeam + sound + notify |
| Boss Uniques | `#5ce0d8` (cyan) | GWD, slayer, barrows, DKs, Zulrah, Vorkath, Corp, Nex, DT2 |
| Clues & Untradeables | `#b09cdb` (lavender) | Clue scrolls, keys, totems, bones/shards |
| Supplies | `#7ecc6a` (green) | Herbs, seeds, potions, food, runes, ammo |
| Coins | `#db5a5a` (red) | Scaled display by stack size (1k/10k/100k thresholds) |
| Alch Value Tiers | `#f5c542` (amber) | HA-based: great (10k+), decent (1k+), marginal (300+) |
| Hidden Items | — | ~75 junk items hidden |
| Fallback | `#808080` (gray) | Everything else dimmed |

---

## 2. RS2F Filter Language Reference

**Source:** [riktenx/loot-filters](https://github.com/riktenx/loot-filters) — the RuneLite plugin.

### Rule Structure
```
rule (<conditions>) { <display_settings>; }   // terminal — stops on match
apply (<conditions>) { <display_settings>; }   // non-terminal — continues
```

### Conditions
| Condition | Example |
|---|---|
| `id:N` or `id:[N,N]` | `id:995`, `id:[995,996]` |
| `name:"str"` or `name:[...]` | `name:"coins"`, `name:"*godsword"` |
| `quantity:<op>N` | `quantity:>100` |
| `value:<op>N` | `value:>500` (GE value × quantity) |
| `gevalue:<op>N` | `gevalue:>100000` (per-item GE value) |
| `havalue:<op>N` | `havalue:>10000` (high alch value) |
| `tradeable:bool` | `tradeable:true` |
| `stackable:bool` | `stackable:true` |
| `noted:bool` | `noted:false` |
| `ownership:N` | 0=none, 1=self, 2=other, 3=group |
| `area:[x0,y0,z0,x1,y1,z1]` | location box |
| `accountType:N` | account type enum |

**Operators:** `==`, `>`, `<`, `>=`, `<=` (no `!=`, use `!condition` instead)
**Logic:** `&&`, `||`, `!`
**Wildcards:** `*` in name strings (e.g. `"bandos*"`, `"*godsword"`)

### Display Properties
| Property | Type | Notes |
|---|---|---|
| `hidden` | bool | Hides item completely |
| `textColor` | color | `"#rrggbb"` or `"#aarrggbb"` |
| `backgroundColor` | color | |
| `borderColor` | color | |
| `showLootbeam` | bool | In-world lootbeam |
| `lootbeamColor` | color | |
| `showValue` | bool | Show value in overlay |
| `showDespawnTimer` | bool | Countdown timer |
| `notify` | bool | System notification |
| `textAccent` | enum | 1=shadow, 2=outline, 3=none, 4=bold shadow |
| `fontType` | enum | 1=small, 2=normal, 3=bold |
| `priority` | int | Higher = evaluated first among matches |
| `sound` | int/string | Game sound ID or custom WAV filename |
| `menuTextColor` | color | Right-click menu color |
| `highlightTile` | bool | Ground tile highlight |
| `tileStrokeColor` | color | |
| `tileFillColor` | color | |
| `menuSort` | int | Menu priority (negative ok) |

### Macros / Preprocessor
```
#define NAME value
#define NAME(_param) rule (name:_param) { ... }
```
Multi-line with `\` continuation. Builtin macros: `HIGHLIGHT`, `HIDE`, `RARE`, `RARE2` plus color constants.

### Module System (UI metadata)
```
/*@ define:module:identifier
name: Display Name
subtitle: Short phrase
description: |
  Markdown description
*/

/*@ define:input:module_id
type: boolean|number|stringlist|enumlist|style
label: Label Text
*/
#define VAR_NAME default_value
```
Input types: boolean (checkbox), number (integer), stringlist (free text list), enumlist (dropdown), style (visual config).

---

## 3. External Data Sources

### OSRS Wiki Real-Time Prices API
- **Base:** `https://prices.runescape.wiki/api/v1/osrs`
- **`/mapping`** — All items: id, name, examine, members, highalch, lowalch, icon, buy limit
- **`/latest`** — Current GE prices (high/low) for all items in one call
- **`/5m`, `/1h`, `/24h`** — Volume and price windows
- **Requirement:** Set a descriptive `User-Agent` header
- **No explicit rate limit** but be reasonable; don't loop per-item

### OSRSReboxed Database
- **Repo:** [0xNeffarion/osrsreboxed-db](https://github.com/0xNeffarion/osrsreboxed-db)
- **Items:** 27 base properties + 16 equipment + 3 weapon per item
  - Includes: id, name, tradeable, stackable, noted, highalch, lowalch, cost, weight, members, equipable, examine, icon (base64)
- **Monsters:** 44 properties + drop tables
  - Drops include: item id, name, rarity, quantity range, requirements
  - Hard-coded tables for: rare drop table, herb, seed, gem, catacombs
- **Access:** Static JSON at `https://www.osrsbox.com/osrsbox-db/`, PyPI `osrsreboxed`, or RESTful API

### OSRS Wiki MediaWiki API
- Standard MediaWiki API for page content, infobox parsing
- Non-commercial license; use custom User-Agent

---

## 4. Inspiration: FilterBlade (PoE)

[FilterBlade.xyz](https://www.filterblade.xyz/) is the PoE equivalent. Key features of its **Simulate tab:**

- **Generate test loot** — random items appear, filter rules applied visually
- **Sound preview** — hear what drop sounds your filter produces
- **Item Builder** — manually create any item to test against the filter
- **Item ReCreator** — paste item text to test specific items
- **Right-click to customize** — jump to the rule that matched an item
- **Works with custom filters** — not just the default

Our simulator should capture this same "load filter, generate loot, see results" loop.

---

## 5. Key Ecosystem Links

| Resource | URL |
|---|---|
| Loot Filters Plugin (Java) | https://github.com/riktenx/loot-filters |
| Loot Filters UI (React/TS) | https://github.com/Kaqemeex/loot-filters-ui |
| Filter Editor | https://filterscape.xyz/ |
| Module System Docs | https://github.com/Kaqemeex/loot-filters-ui/tree/main/module-system-docs |
| Filter Language Spec | https://github.com/riktenx/loot-filters/blob/userguide/filter-lang.md |
| OSRS Wiki Prices API | https://prices.runescape.wiki/api/v1/osrs |
| OSRSReboxed DB | https://github.com/0xNeffarion/osrsreboxed-db |
| RuneLite Plugin Hub | https://runelite.net/plugin-hub/show/loot-filters |
| FilterBlade (PoE reference) | https://www.filterblade.xyz/ |
