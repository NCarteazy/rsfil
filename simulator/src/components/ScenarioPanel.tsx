import { MONSTERS } from "../data/monsters";

interface ScenarioPanelProps {
  selectedMonster: string;
  killCount: number;
  onMonsterChange: (name: string) => void;
  onKillCountChange: (count: number) => void;
  onGenerate: () => void;
}

export default function ScenarioPanel({
  selectedMonster,
  killCount,
  onMonsterChange,
  onKillCountChange,
  onGenerate,
}: ScenarioPanelProps) {
  // Group monsters by category
  const categories = new Map<string, string[]>();
  for (const m of MONSTERS) {
    if (!categories.has(m.category)) categories.set(m.category, []);
    categories.get(m.category)!.push(m.name);
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
        Scenario
      </h2>

      {/* Monster selection */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Monster</label>
        <select
          className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-gray-500"
          value={selectedMonster}
          onChange={(e) => onMonsterChange(e.target.value)}
        >
          {[...categories.entries()].map(([cat, names]) => (
            <optgroup key={cat} label={cat}>
              {names.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Kill count */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Kills</label>
        <div className="flex gap-1.5">
          <input
            type="number"
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-gray-500"
            value={killCount}
            min={1}
            max={10000}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val > 0) onKillCountChange(val);
            }}
          />
          {[1, 10, 100, 1000].map((n) => (
            <button
              key={n}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                killCount === n
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-300"
              }`}
              onClick={() => onKillCountChange(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        className="w-full py-2.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors active:bg-indigo-700"
        onClick={onGenerate}
      >
        Generate Loot
      </button>
    </div>
  );
}
