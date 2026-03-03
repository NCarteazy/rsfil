import { useState, useCallback, useMemo } from "react";
import { compileFilter, evaluateItems } from "./parser";
import type { SimItem, EvalResult } from "./parser/types";
import { getMonsterByName, MONSTERS } from "./data/monsters";
import { generateLoot } from "./simulator/generator";
import FilterPanel from "./components/FilterPanel";
import ScenarioPanel from "./components/ScenarioPanel";
import GroundItems from "./components/GroundItems";
import ItemInspector from "./components/ItemInspector";
import { DEFAULT_FILTER } from "./defaultFilter";

function App() {
  const [filterSource, setFilterSource] = useState(DEFAULT_FILTER);
  const [selectedMonster, setSelectedMonster] = useState(MONSTERS[0].name);
  const [killCount, setKillCount] = useState(10);
  const [lootItems, setLootItems] = useState<SimItem[]>([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  // Parse filter whenever source changes
  const { filter, parseError } = useMemo(() => {
    try {
      const f = compileFilter(filterSource);
      return { filter: f, parseError: null };
    } catch (err) {
      return {
        filter: null,
        parseError: err instanceof Error ? err.message : String(err),
      };
    }
  }, [filterSource]);

  // Evaluate all items against the filter
  const evalResults: EvalResult[] = useMemo(() => {
    if (!filter || lootItems.length === 0) return [];
    return evaluateItems(filter, lootItems);
  }, [filter, lootItems]);

  const handleGenerate = useCallback(() => {
    const monster = getMonsterByName(selectedMonster);
    if (!monster) return;
    const result = generateLoot(monster, killCount);
    setLootItems(result.items);
    setSelectedItemIndex(null);
  }, [selectedMonster, killCount]);

  const selectedItem = selectedItemIndex != null ? lootItems[selectedItemIndex] : null;
  const selectedResult = selectedItemIndex != null ? evalResults[selectedItemIndex] : null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#12122a] border-b border-gray-800 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-100">
              OSRS Loot Simulator
            </h1>
            <p className="text-xs text-gray-500">
              Test your loot filter against simulated drops
            </p>
          </div>
          {filter && (
            <div className="text-xs text-gray-500">
              Filter: <span className="text-gray-300">{filter.meta.name}</span>
              {" | "}
              {filter.rules.length} rules
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-[320px_1fr] gap-6">
        {/* Left sidebar */}
        <div className="space-y-6">
          <FilterPanel
            filterSource={filterSource}
            onFilterChange={setFilterSource}
            parseError={parseError}
            defaultFilter={DEFAULT_FILTER}
          />

          <div className="border-t border-gray-800" />

          <ScenarioPanel
            selectedMonster={selectedMonster}
            killCount={killCount}
            onMonsterChange={setSelectedMonster}
            onKillCountChange={setKillCount}
            onGenerate={handleGenerate}
          />

          <div className="border-t border-gray-800" />

          <ItemInspector item={selectedItem} result={selectedResult} />
        </div>

        {/* Main display area */}
        <div>
          <GroundItems
            items={lootItems}
            results={evalResults}
            onSelectItem={setSelectedItemIndex}
            selectedIndex={selectedItemIndex}
          />

          {/* Value summary */}
          {lootItems.length > 0 && (
            <div className="mt-4 p-3 bg-gray-900/50 border border-gray-800 rounded-lg text-sm">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-gray-500 text-xs">Total GE Value</div>
                  <div className="text-amber-400 font-semibold">
                    {formatGp(
                      lootItems.reduce(
                        (sum, item) => sum + item.geValue * item.quantity,
                        0
                      )
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Total HA Value</div>
                  <div className="text-amber-400/70 font-semibold">
                    {formatGp(
                      lootItems.reduce(
                        (sum, item) => sum + item.haValue * item.quantity,
                        0
                      )
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Unique Items</div>
                  <div className="text-gray-300 font-semibold">
                    {lootItems.length}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatGp(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toLocaleString();
}

export default App;
