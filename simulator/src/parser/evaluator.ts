// ============================================================================
//  RS2F Filter Evaluator — matches items against parsed filter rules
// ============================================================================

import type {
  Filter,
  FilterRule,
  Condition,
  DisplaySettings,
  SimItem,
  EvalResult,
} from "./types";

/**
 * Evaluate a filter against a single item.
 * Walks rules top-to-bottom:
 *  - `rule` (terminal): on match, returns immediately
 *  - `apply` (non-terminal): on match, merges display and continues
 */
export function evaluateItem(filter: Filter, item: SimItem): EvalResult {
  const merged: DisplaySettings = {};
  let matchedRule: FilterRule | null = null;
  let matchedIndex = -1;

  for (let i = 0; i < filter.rules.length; i++) {
    const rule = filter.rules[i];
    if (testCondition(rule.conditions, item)) {
      if (rule.type === "rule") {
        // Terminal: merge onto accumulated apply settings and stop
        const final = { ...merged, ...rule.display };
        return { display: final, matchedRule: rule, matchedIndex: i };
      } else {
        // Non-terminal (apply): merge and continue
        Object.assign(merged, rule.display);
        if (!matchedRule) {
          matchedRule = rule;
          matchedIndex = i;
        }
      }
    }
  }

  // If no terminal rule matched, return whatever apply rules accumulated
  return { display: merged, matchedRule, matchedIndex };
}

/**
 * Evaluate a filter against multiple items. Returns results in the same order.
 */
export function evaluateItems(
  filter: Filter,
  items: SimItem[]
): EvalResult[] {
  return items.map((item) => evaluateItem(filter, item));
}

// ---- Condition testing ----

function testCondition(condition: Condition, item: SimItem): boolean {
  switch (condition.type) {
    case "always":
      return true;

    case "and":
      return (
        testCondition(condition.left, item) &&
        testCondition(condition.right, item)
      );

    case "or":
      return (
        testCondition(condition.left, item) ||
        testCondition(condition.right, item)
      );

    case "not":
      return !testCondition(condition.inner, item);

    case "name":
      return condition.patterns.some((pattern) =>
        matchWildcard(pattern.toLowerCase(), item.name.toLowerCase())
      );

    case "id":
      return condition.ids.includes(item.id);

    case "numeric":
      return testNumeric(condition.field, condition.op, condition.value, item);

    case "boolean":
      return testBoolean(condition.field, condition.value, item);
  }
}

function testNumeric(
  field: "quantity" | "value" | "gevalue" | "havalue",
  op: "==" | ">" | "<" | ">=" | "<=",
  threshold: number,
  item: SimItem
): boolean {
  let actual: number;
  switch (field) {
    case "quantity":
      actual = item.quantity;
      break;
    case "value":
      actual = item.geValue * item.quantity;
      break;
    case "gevalue":
      actual = item.geValue;
      break;
    case "havalue":
      actual = item.haValue;
      break;
  }

  switch (op) {
    case "==": return actual === threshold;
    case ">":  return actual > threshold;
    case "<":  return actual < threshold;
    case ">=": return actual >= threshold;
    case "<=": return actual <= threshold;
  }
}

function testBoolean(
  field: "tradeable" | "stackable" | "noted",
  expected: boolean,
  item: SimItem
): boolean {
  switch (field) {
    case "tradeable": return item.tradeable === expected;
    case "stackable": return item.stackable === expected;
    case "noted":     return item.noted === expected;
  }
}

/**
 * Match a string against a pattern with * wildcards.
 * * matches any sequence of characters (including empty).
 */
function matchWildcard(pattern: string, text: string): boolean {
  // Convert wildcard pattern to regex
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  const regexStr = "^" + escaped.replace(/\*/g, ".*") + "$";
  return new RegExp(regexStr).test(text);
}
