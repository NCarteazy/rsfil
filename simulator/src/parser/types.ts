// ============================================================================
//  RS2F Abstract Syntax Tree types
// ============================================================================

/** Parsed filter top-level structure */
export interface Filter {
  meta: FilterMeta;
  rules: FilterRule[];
}

export interface FilterMeta {
  name: string;
  description: string;
}

/** A single rule or apply block */
export interface FilterRule {
  type: "rule" | "apply";
  conditions: Condition;
  display: DisplaySettings;
  /** Original line number for debugging */
  line: number;
  /** Original source text for the inspector */
  source: string;
}

// ---- Conditions ----

export type Condition =
  | ConditionAnd
  | ConditionOr
  | ConditionNot
  | ConditionName
  | ConditionId
  | ConditionNumeric
  | ConditionBoolean
  | ConditionAlways;

export interface ConditionAnd {
  type: "and";
  left: Condition;
  right: Condition;
}

export interface ConditionOr {
  type: "or";
  left: Condition;
  right: Condition;
}

export interface ConditionNot {
  type: "not";
  inner: Condition;
}

/** name:"pattern" or name:["p1","p2"] — supports * wildcards */
export interface ConditionName {
  type: "name";
  patterns: string[];
}

/** id:N or id:[N,N,...] */
export interface ConditionId {
  type: "id";
  ids: number[];
}

/** quantity:>N, havalue:>=N, gevalue:<N, value:==N */
export interface ConditionNumeric {
  type: "numeric";
  field: "quantity" | "value" | "gevalue" | "havalue";
  op: "==" | ">" | "<" | ">=" | "<=";
  value: number;
}

/** tradeable:true, stackable:false, noted:true */
export interface ConditionBoolean {
  type: "boolean";
  field: "tradeable" | "stackable" | "noted";
  value: boolean;
}

/** Empty condition () — matches everything */
export interface ConditionAlways {
  type: "always";
}

// ---- Display settings ----

export interface DisplaySettings {
  hidden?: boolean;
  hideOverlay?: boolean;
  textColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  showLootbeam?: boolean;
  lootbeamColor?: string;
  showValue?: boolean;
  showDespawnTimer?: boolean;
  notify?: boolean;
  textAccent?: number;
  textAccentColor?: string;
  fontType?: number;
  menuTextColor?: string;
  highlightTile?: boolean;
  tileStrokeColor?: string;
  tileFillColor?: string;
  menuSort?: number;
  priority?: number;
  sound?: number | string;
}

// ---- Token types for the lexer ----

export const TokenType = {
  // Keywords
  Meta: "meta",
  Rule: "rule",
  Apply: "apply",

  // Symbols
  LBrace: "{",
  RBrace: "}",
  LParen: "(",
  RParen: ")",
  LBracket: "[",
  RBracket: "]",
  Semicolon: ";",
  Equals: "=",
  Comma: ",",
  Colon: ":",
  And: "&&",
  Or: "||",
  Not: "!",

  // Comparison operators
  Gt: ">",
  Lt: "<",
  Gte: ">=",
  Lte: "<=",
  Eq: "==",

  // Literals
  String: "string",
  Number: "number",
  Boolean: "boolean",
  Identifier: "identifier",

  EOF: "eof",
} as const;

export type TokenType = (typeof TokenType)[keyof typeof TokenType];

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  col: number;
}

// ---- SimItem: what we evaluate against ----

export interface SimItem {
  id: number;
  name: string;
  quantity: number;
  geValue: number;
  haValue: number;
  tradeable: boolean;
  stackable: boolean;
  noted: boolean;
  members: boolean;
}

/** Result of evaluating a filter against an item */
export interface EvalResult {
  display: DisplaySettings;
  matchedRule: FilterRule | null;
  /** Index of matched rule in the filter's rule array */
  matchedIndex: number;
}
