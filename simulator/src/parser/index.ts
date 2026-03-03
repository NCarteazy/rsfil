// ============================================================================
//  RS2F Parser — public API
// ============================================================================

export { preprocess } from "./preprocessor";
export { tokenize } from "./lexer";
export { parseFilter } from "./parser";
export { evaluateItem, evaluateItems } from "./evaluator";
export type {
  Filter,
  FilterMeta,
  FilterRule,
  Condition,
  DisplaySettings,
  SimItem,
  EvalResult,
  Token,
} from "./types";
export { TokenType } from "./types";

import { preprocess } from "./preprocessor";
import { tokenize } from "./lexer";
import { parseFilter } from "./parser";
import type { Filter } from "./types";

/**
 * Full pipeline: source text → preprocessed → tokens → AST
 */
export function compileFilter(source: string): Filter {
  const preprocessed = preprocess(source);
  const tokens = tokenize(preprocessed);
  return parseFilter(tokens, preprocessed);
}
