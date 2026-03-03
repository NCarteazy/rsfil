import { useState, useRef } from "react";

interface FilterPanelProps {
  filterSource: string;
  onFilterChange: (source: string) => void;
  parseError: string | null;
  defaultFilter: string;
}

export default function FilterPanel({
  filterSource,
  onFilterChange,
  parseError,
  defaultFilter,
}: FilterPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onFilterChange(reader.result as string);
      setIsEditing(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
          Filter
        </h2>
        <div className="flex gap-1.5">
          <button
            className="px-2 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
            onClick={() => {
              onFilterChange(defaultFilter);
              setIsEditing(false);
            }}
          >
            Use Default
          </button>
          <button
            className="px-2 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload .rs2f
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".rs2f,.txt"
            className="hidden"
            onChange={handleUpload}
          />
          <button
            className="px-2 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Close" : "Edit"}
          </button>
        </div>
      </div>

      {/* Filter status */}
      {parseError ? (
        <div className="text-xs text-red-400 bg-red-900/20 border border-red-800/50 rounded p-2">
          {parseError}
        </div>
      ) : (
        <div className="text-xs text-green-400/70">
          Filter loaded ({filterSource.split("\n").length} lines)
        </div>
      )}

      {/* Editor */}
      {isEditing && (
        <textarea
          className="w-full h-64 bg-black/40 border border-gray-700 rounded p-2 text-xs font-mono text-gray-300 resize-y focus:outline-none focus:border-gray-500"
          value={filterSource}
          onChange={(e) => onFilterChange(e.target.value)}
          spellCheck={false}
        />
      )}
    </div>
  );
}
