import { useState } from "react";
import type { SimItem, DisplaySettings, EvalResult } from "../parser/types";

interface GroundItemsProps {
  items: SimItem[];
  results: EvalResult[];
  onSelectItem: (index: number) => void;
  selectedIndex: number | null;
}

/** Parse an rs2f color string into a CSS color */
function toCssColor(color: string | undefined): string | undefined {
  if (!color) return undefined;
  // Strip quotes if present
  const c = color.replace(/"/g, "");
  // #aarrggbb → rgba
  if (c.length === 9 && c.startsWith("#")) {
    const a = parseInt(c.slice(1, 3), 16) / 255;
    const r = parseInt(c.slice(3, 5), 16);
    const g = parseInt(c.slice(5, 7), 16);
    const b = parseInt(c.slice(7, 9), 16);
    return `rgba(${r},${g},${b},${a.toFixed(2)})`;
  }
  // #rrggbb — pass through
  if (c.length === 7 && c.startsWith("#")) {
    return c;
  }
  // aarrggbb (no hash)
  if (c.length === 8 && /^[0-9a-fA-F]+$/.test(c)) {
    const a = parseInt(c.slice(0, 2), 16) / 255;
    const r = parseInt(c.slice(2, 4), 16);
    const g = parseInt(c.slice(4, 6), 16);
    const b = parseInt(c.slice(6, 8), 16);
    return `rgba(${r},${g},${b},${a.toFixed(2)})`;
  }
  // rrggbb (no hash)
  if (c.length === 6 && /^[0-9a-fA-F]+$/.test(c)) {
    return `#${c}`;
  }
  return c;
}

function formatValue(item: SimItem, display: DisplaySettings): string {
  if (!display.showValue) return "";
  const totalGe = item.geValue * item.quantity;
  const ha = item.haValue;
  // Show whichever is higher
  const val = Math.max(totalGe, ha);
  if (val === 0) return "";
  if (val >= 1_000_000) return ` (${(val / 1_000_000).toFixed(1)}M)`;
  if (val >= 1_000) return ` (${(val / 1_000).toFixed(0)}K)`;
  return ` (${val})`;
}

function formatQuantity(item: SimItem): string {
  if (item.quantity <= 1) return "";
  if (item.quantity >= 1_000_000) return ` x${(item.quantity / 1_000_000).toFixed(1)}M`;
  if (item.quantity >= 1_000) return ` x${(item.quantity / 1_000).toFixed(0)}K`;
  return ` x${item.quantity.toLocaleString()}`;
}

interface SortedEntry {
  item: SimItem;
  result: EvalResult;
  originalIndex: number;
}

export default function GroundItems({
  items,
  results,
  onSelectItem,
  selectedIndex,
}: GroundItemsProps) {
  const [showHidden, setShowHidden] = useState(false);

  // Pair items with results, sort by priority (high first)
  const entries: SortedEntry[] = items.map((item, i) => ({
    item,
    result: results[i],
    originalIndex: i,
  }));

  entries.sort((a, b) => {
    const pa = a.result.display.priority ?? 0;
    const pb = b.result.display.priority ?? 0;
    return pb - pa;
  });

  const visible = entries.filter((e) => !e.result.display.hidden);
  const hidden = entries.filter((e) => e.result.display.hidden);
  const beamCount = visible.filter((e) => e.result.display.showLootbeam).length;
  const notifyCount = visible.filter((e) => e.result.display.notify).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Stats bar */}
      <div className="flex gap-4 text-sm text-gray-400 flex-wrap">
        <span>{visible.length} shown</span>
        <span>{hidden.length} hidden</span>
        {beamCount > 0 && (
          <span className="text-yellow-400">{beamCount} lootbeam{beamCount !== 1 ? "s" : ""}</span>
        )}
        {notifyCount > 0 && (
          <span className="text-blue-400">{notifyCount} notification{notifyCount !== 1 ? "s" : ""}</span>
        )}
      </div>

      {/* Ground items overlay */}
      <div className="relative rounded-lg bg-[#0a0a0a]/80 border border-gray-800 p-4 min-h-[300px]">
        {/* Lootbeams behind items */}
        {visible
          .filter((e) => e.result.display.showLootbeam)
          .map((e, i) => (
            <div
              key={`beam-${i}`}
              className="absolute top-0 h-full w-1 opacity-40 blur-sm"
              style={{
                background: toCssColor(
                  e.result.display.lootbeamColor ?? e.result.display.textColor
                ),
                left: `${20 + i * 60}px`,
              }}
            />
          ))}

        {/* Item labels */}
        <div className="relative flex flex-col gap-0.5">
          {visible.map((entry) => (
            <ItemLabel
              key={entry.originalIndex}
              item={entry.item}
              display={entry.result.display}
              selected={selectedIndex === entry.originalIndex}
              onClick={() => onSelectItem(entry.originalIndex)}
            />
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-gray-600 text-center py-12">
            Generate loot to see how your filter handles it
          </div>
        )}
      </div>

      {/* Hidden items */}
      {hidden.length > 0 && (
        <div>
          <button
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            onClick={() => setShowHidden(!showHidden)}
          >
            {showHidden ? "Hide" : "Show"} {hidden.length} hidden item{hidden.length !== 1 ? "s" : ""}
          </button>
          {showHidden && (
            <div className="mt-2 flex flex-col gap-0.5 opacity-40">
              {hidden.map((entry) => (
                <ItemLabel
                  key={entry.originalIndex}
                  item={entry.item}
                  display={{ textColor: "#808080" }}
                  selected={selectedIndex === entry.originalIndex}
                  onClick={() => onSelectItem(entry.originalIndex)}
                  strikethrough
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ItemLabel({
  item,
  display,
  selected,
  onClick,
  strikethrough,
}: {
  item: SimItem;
  display: DisplaySettings;
  selected: boolean;
  onClick: () => void;
  strikethrough?: boolean;
}) {
  const textColor = toCssColor(display.textColor) ?? "#c0c0c0";
  const bgColor = toCssColor(display.backgroundColor);
  const borderColor = toCssColor(display.borderColor);

  const fontWeight =
    display.fontType === 3 ? "bold" : "normal";
  const fontSize =
    display.fontType === 1 ? "0.75rem" : "0.875rem";

  let textShadow: string | undefined;
  if (display.textAccent === 1 || display.textAccent === 4) {
    const shadowColor = toCssColor(display.textAccentColor) ?? "rgba(0,0,0,0.8)";
    textShadow = `1px 1px 2px ${shadowColor}`;
  } else if (display.textAccent === 2) {
    const outlineColor = toCssColor(display.textAccentColor) ?? "rgba(0,0,0,0.9)";
    textShadow = `1px 0 0 ${outlineColor}, -1px 0 0 ${outlineColor}, 0 1px 0 ${outlineColor}, 0 -1px 0 ${outlineColor}`;
  }

  const qtyStr = formatQuantity(item);
  const valStr = formatValue(item, display);
  const despawnStr = display.showDespawnTimer ? " [2:58]" : "";

  return (
    <div
      className={`
        inline-flex items-center gap-1 px-1.5 py-0.5 cursor-pointer
        rounded-sm transition-all duration-100 w-fit
        ${selected ? "ring-1 ring-white/50" : "hover:brightness-125"}
      `}
      style={{
        color: textColor,
        backgroundColor: bgColor ?? (selected ? "rgba(255,255,255,0.05)" : undefined),
        border: borderColor ? `1px solid ${borderColor}` : (selected ? "1px solid rgba(255,255,255,0.2)" : "1px solid transparent"),
        fontWeight,
        fontSize,
        textShadow,
        textDecoration: strikethrough ? "line-through" : undefined,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
      onClick={onClick}
    >
      {/* Lootbeam indicator */}
      {display.showLootbeam && (
        <span
          className="w-1.5 h-4 rounded-full mr-0.5 animate-pulse"
          style={{
            backgroundColor: toCssColor(
              display.lootbeamColor ?? display.textColor
            ),
            boxShadow: `0 0 6px ${toCssColor(display.lootbeamColor ?? display.textColor)}`,
          }}
        />
      )}

      {/* Notification indicator */}
      {display.notify && (
        <span className="text-xs opacity-70 mr-0.5">*</span>
      )}

      <span>
        {item.name}
        {qtyStr && <span className="opacity-70">{qtyStr}</span>}
        {valStr && <span className="opacity-60 text-xs">{valStr}</span>}
        {despawnStr && <span className="opacity-40 text-xs">{despawnStr}</span>}
      </span>
    </div>
  );
}
