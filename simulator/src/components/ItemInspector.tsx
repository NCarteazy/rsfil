import type { SimItem, EvalResult } from "../parser/types";

interface ItemInspectorProps {
  item: SimItem | null;
  result: EvalResult | null;
}

function toCssColor(color: string | undefined): string | undefined {
  if (!color) return undefined;
  const c = color.replace(/"/g, "");
  if (c.length === 9 && c.startsWith("#")) {
    const a = parseInt(c.slice(1, 3), 16) / 255;
    const r = parseInt(c.slice(3, 5), 16);
    const g = parseInt(c.slice(5, 7), 16);
    const b = parseInt(c.slice(7, 9), 16);
    return `rgba(${r},${g},${b},${a.toFixed(2)})`;
  }
  if (c.length === 7 && c.startsWith("#")) return c;
  if (c.length === 6 && /^[0-9a-fA-F]+$/.test(c)) return `#${c}`;
  return c;
}

export default function ItemInspector({ item, result }: ItemInspectorProps) {
  if (!item || !result) {
    return (
      <div className="text-gray-600 text-sm italic">
        Click an item to inspect its filter match
      </div>
    );
  }

  const d = result.display;

  return (
    <div className="text-sm space-y-3">
      {/* Item info */}
      <div>
        <div className="text-white font-semibold text-base">{item.name}</div>
        <div className="text-gray-400 space-y-0.5 mt-1">
          <div>ID: {item.id} | Qty: {item.quantity.toLocaleString()}</div>
          <div>GE: {(item.geValue * item.quantity).toLocaleString()} | HA: {item.haValue.toLocaleString()}</div>
          <div>
            {item.tradeable ? "Tradeable" : "Untradeable"}
            {item.stackable ? " | Stackable" : ""}
            {item.noted ? " | Noted" : ""}
            {item.members ? " | Members" : ""}
          </div>
        </div>
      </div>

      {/* Matched rule */}
      <div className="border-t border-gray-700 pt-2">
        <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Matched Rule</div>
        {result.matchedRule ? (
          <div>
            <div className="text-gray-300">
              Rule #{result.matchedIndex + 1} (line {result.matchedRule.line})
            </div>
            <pre className="text-xs text-gray-500 bg-black/30 rounded p-2 mt-1 overflow-x-auto max-h-32 whitespace-pre-wrap">
              {result.matchedRule.source}
            </pre>
          </div>
        ) : (
          <div className="text-gray-500">No rule matched</div>
        )}
      </div>

      {/* Applied display properties */}
      <div className="border-t border-gray-700 pt-2">
        <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Display Properties</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {d.hidden != null && (
            <PropRow label="hidden" value={String(d.hidden)} />
          )}
          {d.textColor && (
            <PropRow label="textColor" value={d.textColor} color={toCssColor(d.textColor)} />
          )}
          {d.backgroundColor && (
            <PropRow label="bgColor" value={d.backgroundColor} color={toCssColor(d.backgroundColor)} />
          )}
          {d.borderColor && (
            <PropRow label="borderColor" value={d.borderColor} color={toCssColor(d.borderColor)} />
          )}
          {d.showLootbeam != null && (
            <PropRow label="lootbeam" value={String(d.showLootbeam)} />
          )}
          {d.lootbeamColor && (
            <PropRow label="beamColor" value={d.lootbeamColor} color={toCssColor(d.lootbeamColor)} />
          )}
          {d.showValue != null && (
            <PropRow label="showValue" value={String(d.showValue)} />
          )}
          {d.showDespawnTimer != null && (
            <PropRow label="despawnTimer" value={String(d.showDespawnTimer)} />
          )}
          {d.notify != null && (
            <PropRow label="notify" value={String(d.notify)} />
          )}
          {d.priority != null && (
            <PropRow label="priority" value={String(d.priority)} />
          )}
          {d.sound != null && (
            <PropRow label="sound" value={String(d.sound)} />
          )}
        </div>
      </div>
    </div>
  );
}

function PropRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <>
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-300 flex items-center gap-1">
        {color && (
          <span
            className="inline-block w-3 h-3 rounded-sm border border-gray-600"
            style={{ backgroundColor: color }}
          />
        )}
        {value}
      </span>
    </>
  );
}
