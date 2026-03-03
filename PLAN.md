# OSRS Loot Simulator — Technical Plan

## Goal

Build a web-based loot simulator where users can:
1. Load an `.rs2f` loot filter (paste, upload, or use the bundled ironman-sleek filter)
2. Configure a loot scenario (pick a boss/monster, or use random mixed loot)
3. Click "Generate" and see items appear in a fake ground-items overlay
4. See exactly how the filter styles, highlights, hides, or beams each item

Think FilterBlade's Simulate tab, but for OSRS and the rs2f filter language.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   Web App (React + TS)          │
│                                                 │
│  ┌───────────┐  ┌────────────┐  ┌───────────┐  │
│  │  Filter    │  │   Loot     │  │  Ground   │  │
│  │  Parser    │  │ Generator  │  │  Items    │  │
│  │  Engine    │  │            │  │  Renderer │  │
│  └─────┬─────┘  └─────┬──────┘  └─────┬─────┘  │
│        │               │               │        │
│        └───────┬───────┘               │        │
│                ▼                       │        │
│        ┌──────────────┐               │        │
│        │ Filter       │───────────────┘        │
│        │ Evaluator    │                         │
│        └──────────────┘                         │
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │  Static Item/Monster Data (JSON bundles) │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Stack:** React + TypeScript, Vite, Tailwind CSS. No backend needed — everything runs client-side.

---

## Core Components

### 1. RS2F Parser & Evaluator

The heart of the project. Parses the filter text and evaluates items against it.

**Parser responsibilities:**
- Preprocess `#define` macros (expand text substitution, handle parameters)
- Parse `meta { }` block
- Parse `rule (conditions) { display; }` and `apply (conditions) { display; }` blocks
- Handle structured comments (`/*@ define:module:... */`) for UI metadata (nice-to-have)

**Evaluator responsibilities:**
- Given a parsed filter and an item object, walk rules top-to-bottom
- For each `rule`: test conditions → if match, return display settings, stop
- For each `apply`: test conditions → if match, merge display settings, continue
- Return final resolved display settings for the item

**Item object shape** (what the evaluator operates on):
```ts
interface SimItem {
  id: number;
  name: string;
  quantity: number;
  geValue: number;     // per-item GE price
  haValue: number;     // high alch value
  tradeable: boolean;
  stackable: boolean;
  noted: boolean;
  members: boolean;
  // not implementing: ownership, area, accountType (simulator doesn't need these)
}
```

**Condition matching:**
- `name:` — string match with `*` wildcard (convert to regex)
- `name:[list]` — match any in list
- `quantity:`, `value:`, `gevalue:`, `havalue:` — numeric comparisons
- `tradeable:`, `stackable:`, `noted:` — boolean equality
- `&&`, `||`, `!` — logical operators
- `id:` — exact ID match

**This is the most complex part.** Approach: hand-written recursive-descent parser. The language is simple enough that a full parser generator is overkill.

### 2. Item Data Bundle

Pre-built static JSON file(s) shipped with the app. Sourced from OSRSReboxed + Wiki Prices API.

**Build-time script** fetches and merges:
- OSRSReboxed items → id, name, tradeable, stackable, noted, highalch, lowalch, members, examine, icon (base64)
- Wiki Prices `/mapping` → highalch, lowalch (cross-reference)
- Wiki Prices `/latest` → current GE prices

**Output:** `items.json` — a map of `id → { name, highalch, gePrice, tradeable, stackable, members, icon }`

Estimated size: ~3,700 tradeable items. At ~100 bytes each ≈ 370KB JSON, gzipped ~80KB. Very manageable.

**Refresh strategy:** Run the build script periodically (weekly?) and commit the updated bundle, or fetch `/latest` prices at runtime on app load (one API call, fast).

### 3. Monster Drop Table Data

Pre-built static JSON for popular bosses/monsters and their drop tables.

**Source:** OSRSReboxed monster data, or scrape wiki drop tables.

**Structure:**
```ts
interface MonsterDropTable {
  name: string;          // "Vorkath", "Zulrah", etc.
  drops: {
    itemId: number;
    itemName: string;
    quantity: [number, number];  // min, max
    rarity: number;             // 1/X probability (e.g. 128 means 1/128)
    noted: boolean;
  }[];
}
```

**Scope for v1:** 15-25 popular bosses/monsters:
- Raids: CoX, ToB, ToA
- GWD: Bandos, Arma, Sara, Zammy
- Slayer bosses: Cerberus, Hydra, Kraken, Sire, Thermy
- Other: Vorkath, Zulrah, Corp, Nex, DKs, Barrows, Gauntlet
- Slayer monsters: Gargoyles, Nechryaels, Dust Devils (for alch-value testing)

### 4. Loot Generator

Takes a monster drop table and simulates N kills.

```ts
function generateLoot(monster: MonsterDropTable, killCount: number): SimItem[]
```

**Logic:**
- For each kill, roll each drop against its rarity
- Always-drops (rarity=1) always included
- For rare drops, use `Math.random() < 1/rarity`
- Combine stackable items (coins, runes, etc.)
- Resolve quantity ranges: `Math.floor(Math.random() * (max - min + 1)) + min`
- Attach item metadata (geValue, haValue, etc.) from the item bundle

**Also support:**
- "Random mixed loot" — pull from a curated list of items across all categories
- "Custom item" — user types item name, quantity → test specific scenarios

### 5. Ground Items Renderer

Visual component that displays loot the way RuneLite's Ground Items plugin does.

**Two display modes:**

#### A. Overlay Text Mode (primary — matches RuneLite)
Renders items as colored text labels stacked vertically, like RuneLite's ground items overlay:
```
┌──────────────────────────┐
│  Twisted bow             │  ← white text, dark bg, border
│  Bandos chestplate       │  ← cyan text, dark bg
│  Grimy ranarr weed       │  ← green text
│  Coins (43,521)          │  ← red text
│  Rune platebody (38,400) │  ← amber text, shows HA value
│  ░░░ 3 items hidden ░░░  │  ← gray note showing hidden count
└──────────────────────────┘
```

Each label renders with the filter's resolved display properties:
- `textColor` → CSS color
- `backgroundColor` → label background
- `borderColor` → label border
- `fontType` → font size/weight
- `textAccent` → text-shadow or outline
- `showValue` → append "(value)" to name
- `showDespawnTimer` → show fake timer
- `showLootbeam` → vertical colored beam graphic above label
- `hidden` → don't render (count toward hidden tally)
- `priority` → sort order (higher priority = higher in stack)

#### B. Ground Scatter Mode (stretch goal)
Items scattered on a fake game tile grid for a more immersive feel. Each item is a small sprite icon with a colored text label. Lootbeams rendered as vertical glowing columns.

### 6. UI Layout

```
┌──────────────────────────────────────────────────────┐
│  OSRS Loot Simulator                    [Theme] [?]  │
├──────────────────────┬───────────────────────────────┤
│                      │                               │
│  FILTER PANEL        │   LOOT DISPLAY AREA           │
│                      │                               │
│  [Paste filter]      │   ┌─────────────────────┐    │
│  [Upload .rs2f]      │   │                     │    │
│  [Use default]       │   │  (ground items      │    │
│                      │   │   rendered here)     │    │
│  ─────────────────   │   │                     │    │
│                      │   └─────────────────────┘    │
│  SCENARIO PANEL      │                               │
│                      │   Stats:                      │
│  Monster: [dropdown] │   • 12 items shown            │
│  Kills:   [___10___] │   • 3 items hidden            │
│                      │   • 1 lootbeam                │
│  [Generate Loot]     │   • 2 notifications           │
│                      │                               │
│  ─────────────────   │   ─────────────────────────   │
│                      │                               │
│  ITEM INSPECTOR      │   RULE MATCH LOG              │
│  (click an item to   │   Item: "Twisted bow"         │
│   see which rule     │   Matched: rule #87 (Mega)    │
│   matched it)        │   Priority: 100               │
│                      │   Properties applied: ...     │
│                      │                               │
└──────────────────────┴───────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Foundation (MVP)
1. **Project scaffolding** — Vite + React + TS + Tailwind
2. **RS2F preprocessor** — `#define` expansion (text substitution + parameterized macros)
3. **RS2F parser** — Parse rules, conditions, display properties into AST
4. **Filter evaluator** — Walk AST against an item, return display config
5. **Static item data** — Build script to fetch + bundle item JSON
6. **Basic loot generator** — Hardcode 5-10 monster drop tables, random rolls
7. **Overlay text renderer** — Colored text labels with filter styling
8. **Minimal UI** — Paste filter, pick monster, set kill count, generate, view

**Deliverable:** Working simulator with the ironman-sleek filter and a handful of bosses.

### Phase 2: Polish
9. **Filter upload/download** — File picker + drag-and-drop for .rs2f files
10. **Monster selector** — Searchable dropdown with 20+ bosses
11. **Item inspector** — Click any item to see which rule matched and why
12. **Rule match log** — Table showing all items and their matched rules
13. **Lootbeam rendering** — Vertical colored glow effect
14. **Hidden items summary** — "N items hidden by filter" with expand toggle
15. **Stats panel** — Total value, items shown/hidden/beamed/notified counts

### Phase 3: Advanced
16. **Sound preview** — Play OSRS sounds when generating loot (sound IDs mapped to audio files)
17. **Custom item builder** — Manually specify name, quantity, id to test edge cases
18. **Ground scatter mode** — 2D tile grid with item sprites
19. **Filter diff** — Load two filters and compare how they handle the same loot
20. **Shareable URLs** — Encode filter + scenario in URL params
21. **Runtime price fetch** — Pull live GE prices on load for accurate `gevalue` matching

---

## Key Technical Decisions

### Why client-side only?
- No secrets or auth needed — all data sources are public
- Filter parsing is CPU-light (filters are <1000 lines)
- Item data fits in a small JSON bundle
- Zero hosting cost, deploy to GitHub Pages or Vercel

### Why hand-roll the parser instead of using the plugin source?
- The plugin is Java (RuneLite) — can't run in browser without major effort
- The rs2f language is small and well-specified
- A TS parser gives us full control for the inspector/debug features
- We only need the matching logic, not the rendering/RuneLite integration

### Why bundle item data instead of fetching on demand?
- Mapping endpoint is one call for all items — fast and cacheable
- Avoids CORS issues and API dependency at runtime
- Bundle updates can be automated in CI

### Parser approach: Recursive descent
- Tokenizer: regex-based lexer for keywords, operators, strings, numbers, colors
- Preprocessor pass: expand `#define` macros before parsing
- Parser: recursive descent for rules → conditions → display blocks
- Evaluator: simple interpreter walking the AST

---

## File Structure (Proposed)

```
rsfil/
├── filter.rs2f                    # The ironman-sleek filter
├── v1.rs2f
├── CONTEXT.md                     # This context doc
├── PLAN.md                        # This plan
└── simulator/
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tailwind.config.js
    ├── index.html
    ├── public/
    │   └── data/
    │       ├── items.json         # Bundled item database
    │       └── monsters.json      # Bundled monster drop tables
    ├── scripts/
    │   └── build-data.ts          # Fetch + merge item/monster data
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── parser/
        │   ├── lexer.ts           # Tokenizer
        │   ├── preprocessor.ts    # #define macro expansion
        │   ├── parser.ts          # AST builder
        │   ├── evaluator.ts       # Rule matching engine
        │   └── types.ts           # AST node types
        ├── data/
        │   ├── items.ts           # Item lookup helpers
        │   └── monsters.ts        # Monster drop table types + data
        ├── simulator/
        │   ├── generator.ts       # Loot roll logic
        │   └── types.ts           # SimItem, LootResult types
        ├── components/
        │   ├── FilterPanel.tsx     # Filter input (paste/upload/default)
        │   ├── ScenarioPanel.tsx   # Monster + kill count selection
        │   ├── GroundItems.tsx     # Overlay text renderer
        │   ├── ItemInspector.tsx   # Rule match details for selected item
        │   ├── StatsPanel.tsx      # Summary statistics
        │   └── LootbeamEffect.tsx  # CSS lootbeam visual
        └── styles/
            └── ground-items.css   # OSRS-like styling
```

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| OSRSReboxed data goes stale | Also pull from Wiki Prices `/mapping`; can switch sources |
| Monster drop tables are complex (RDT, tertiary, etc.) | Start simple — flat probability per drop, refine later |
| Filter parser edge cases | Test against multiple real filters; the language spec is well-documented |
| CORS on API calls during data build | Run build script server-side / in CI, not in browser |
| Large item icon bundle | Use Wiki icon URLs instead of base64, or lazy-load |

---

## Next Steps

1. Scaffold the Vite + React + TS project
2. Write the RS2F lexer + preprocessor
3. Write the RS2F parser
4. Write the evaluator + tests against `filter.rs2f`
5. Build the item data bundle script
6. Implement the ground items renderer
7. Wire it all together with the UI
