// ============================================================================
//  RS2F Parser — builds AST from token stream
// ============================================================================

import type {
  Token,
  Filter,
  FilterMeta,
  FilterRule,
  Condition,
  DisplaySettings,
} from "./types";
import { TokenType } from "./types";

class ParseError extends Error {
  token: Token;
  constructor(msg: string, token: Token) {
    super(`Parse error at line ${token.line}:${token.col}: ${msg}`);
    this.token = token;
  }
}

class Parser {
  private pos = 0;
  private tokens: Token[];
  private sourceLines: string[];

  constructor(tokens: Token[], sourceText: string) {
    this.tokens = tokens;
    this.sourceLines = sourceText.split("\n");
  }

  parse(): Filter {
    const meta = this.parseMeta();
    const rules: FilterRule[] = [];

    while (!this.isAt(TokenType.EOF)) {
      rules.push(this.parseRule());
    }

    return { meta, rules };
  }

  // ---- Meta block ----

  private parseMeta(): FilterMeta {
    this.expect(TokenType.Meta);
    this.expect(TokenType.LBrace);

    let name = "";
    let description = "";

    while (!this.isAt(TokenType.RBrace)) {
      const key = this.expect(TokenType.Identifier).value;
      this.expect(TokenType.Equals);
      const val = this.expect(TokenType.String).value;
      this.expect(TokenType.Semicolon);
      if (key === "name") name = val;
      if (key === "description") description = val;
    }

    this.expect(TokenType.RBrace);
    return { name, description };
  }

  // ---- Rule / Apply ----

  private parseRule(): FilterRule {
    const startToken = this.peek();
    const ruleType = this.peek().value as "rule" | "apply";
    if (ruleType !== "rule" && ruleType !== "apply") {
      throw new ParseError(
        `Expected 'rule' or 'apply', got '${this.peek().value}'`,
        this.peek()
      );
    }
    this.advance();

    this.expect(TokenType.LParen);
    const conditions = this.parseConditionExpr();
    this.expect(TokenType.RParen);

    this.expect(TokenType.LBrace);
    const display = this.parseDisplayBlock();
    this.expect(TokenType.RBrace);

    // Reconstruct source for the inspector
    const startLine = startToken.line;
    const endLine = this.tokens[this.pos - 1]?.line ?? startLine;
    const source = this.sourceLines
      .slice(startLine - 1, endLine)
      .join("\n");

    return { type: ruleType, conditions, display, line: startLine, source };
  }

  // ---- Condition expressions ----

  private parseConditionExpr(): Condition {
    // Handle empty condition ()
    if (this.isAt(TokenType.RParen)) {
      return { type: "always" };
    }
    return this.parseOr();
  }

  private parseOr(): Condition {
    let left = this.parseAnd();
    while (this.isAt(TokenType.Or)) {
      this.advance();
      const right = this.parseAnd();
      left = { type: "or", left, right };
    }
    return left;
  }

  private parseAnd(): Condition {
    let left = this.parseUnary();
    while (this.isAt(TokenType.And)) {
      this.advance();
      const right = this.parseUnary();
      left = { type: "and", left, right };
    }
    return left;
  }

  private parseUnary(): Condition {
    if (this.isAt(TokenType.Not)) {
      this.advance();
      const inner = this.parseUnary();
      return { type: "not", inner };
    }
    return this.parsePrimary();
  }

  private parsePrimary(): Condition {
    const token = this.peek();

    // Identifier followed by colon → field condition
    if (token.type === TokenType.Identifier && this.peekAhead(1)?.type === TokenType.Colon) {
      const field = token.value.toLowerCase();
      this.advance(); // identifier
      this.advance(); // colon
      return this.parseFieldCondition(field);
    }

    // Parenthesized expression
    if (this.isAt(TokenType.LParen)) {
      this.advance();
      const expr = this.parseConditionExpr();
      this.expect(TokenType.RParen);
      return expr;
    }

    throw new ParseError(
      `Unexpected token '${token.value}' in condition`,
      token
    );
  }

  private parseFieldCondition(field: string): Condition {
    switch (field) {
      case "name":
        return this.parseNameCondition();
      case "id":
        return this.parseIdCondition();
      case "quantity":
      case "value":
      case "gevalue":
      case "havalue":
        return this.parseNumericCondition(field as "quantity" | "value" | "gevalue" | "havalue");
      case "tradeable":
      case "stackable":
      case "noted":
        return this.parseBooleanCondition(field as "tradeable" | "stackable" | "noted");
      default:
        // Unknown condition field — treat as always-true to avoid breaking
        // (e.g. ownership, area, accountType — not relevant for simulator)
        this.skipUnknownConditionValue();
        return { type: "always" };
    }
  }

  private parseNameCondition(): Condition {
    if (this.isAt(TokenType.LBracket)) {
      // name:["a", "b", ...]
      return { type: "name", patterns: this.parseStringList() };
    }
    if (this.isAt(TokenType.String)) {
      return { type: "name", patterns: [this.advance().value] };
    }
    // name:IDENTIFIER (macro-expanded variable, treat as identifier reference)
    // After preprocessing, this should already be expanded.
    // If we hit an identifier here, it might be an empty list [] that got expanded.
    if (this.isAt(TokenType.Identifier)) {
      // Treat as a single name pattern
      return { type: "name", patterns: [this.advance().value] };
    }
    throw new ParseError("Expected string or list after name:", this.peek());
  }

  private parseIdCondition(): Condition {
    if (this.isAt(TokenType.LBracket)) {
      return { type: "id", ids: this.parseNumberList() };
    }
    return { type: "id", ids: [this.parseNumberValue()] };
  }

  private parseNumericCondition(
    field: "quantity" | "value" | "gevalue" | "havalue"
  ): Condition {
    let op: "==" | ">" | "<" | ">=" | "<=" = "==";

    if (this.isAt(TokenType.Gte)) { op = ">="; this.advance(); }
    else if (this.isAt(TokenType.Lte)) { op = "<="; this.advance(); }
    else if (this.isAt(TokenType.Gt)) { op = ">"; this.advance(); }
    else if (this.isAt(TokenType.Lt)) { op = "<"; this.advance(); }
    else if (this.isAt(TokenType.Eq)) { op = "=="; this.advance(); }

    const value = this.parseNumberValue();
    return { type: "numeric", field, op, value };
  }

  private parseBooleanCondition(
    field: "tradeable" | "stackable" | "noted"
  ): Condition {
    const val = this.expect(TokenType.Boolean).value === "true";
    return { type: "boolean", field, value: val };
  }

  private skipUnknownConditionValue(): void {
    // Skip tokens until we hit &&, ||, ), or end
    let depth = 0;
    while (!this.isAt(TokenType.EOF)) {
      const t = this.peek();
      if (depth === 0 && (t.type === TokenType.And || t.type === TokenType.Or || t.type === TokenType.RParen)) {
        break;
      }
      if (t.type === TokenType.LParen || t.type === TokenType.LBracket) depth++;
      if (t.type === TokenType.RParen || t.type === TokenType.RBracket) {
        if (depth === 0) break;
        depth--;
      }
      this.advance();
    }
  }

  // ---- Display block ----

  private parseDisplayBlock(): DisplaySettings {
    const display: DisplaySettings = {};

    while (!this.isAt(TokenType.RBrace) && !this.isAt(TokenType.EOF)) {
      const keyToken = this.peek();
      if (keyToken.type !== TokenType.Identifier && keyToken.type !== TokenType.Boolean) {
        // skip unexpected tokens
        this.advance();
        continue;
      }

      const key = this.advance().value;
      this.expect(TokenType.Equals);

      const value = this.parseDisplayValue();
      // Consume optional semicolon
      if (this.isAt(TokenType.Semicolon)) this.advance();

      this.applyDisplayProp(display, key, value);
    }

    return display;
  }

  private parseDisplayValue(): string | number | boolean {
    const tok = this.peek();

    if (tok.type === TokenType.Boolean) {
      this.advance();
      return tok.value === "true";
    }
    if (tok.type === TokenType.Number) {
      this.advance();
      return Number(tok.value);
    }
    if (tok.type === TokenType.String) {
      this.advance();
      return tok.value;
    }
    // Identifier — might be a color constant or enum value
    if (tok.type === TokenType.Identifier) {
      this.advance();
      return tok.value;
    }

    throw new ParseError(`Unexpected token in display value: '${tok.value}'`, tok);
  }

  private applyDisplayProp(
    display: DisplaySettings,
    key: string,
    value: string | number | boolean
  ): void {
    const k = key.toLowerCase();
    switch (k) {
      case "hidden":
        display.hidden = value as boolean;
        break;
      case "hideoverlay":
        display.hideOverlay = value as boolean;
        break;
      case "color":
      case "textcolor":
        display.textColor = String(value);
        break;
      case "backgroundcolor":
        display.backgroundColor = String(value);
        break;
      case "bordercolor":
        display.borderColor = String(value);
        break;
      case "showlootbeam":
      case "showlootbeam_": // alias (lowercased variants handled by toLowerCase above)
        display.showLootbeam = value as boolean;
        break;
      case "lootbeamcolor":
      case "lootbeamcolour":
        display.lootbeamColor = String(value);
        break;
      case "showvalue":
        display.showValue = value as boolean;
        break;
      case "showdespawntimer":
      case "showdespawn":
        display.showDespawnTimer = value as boolean;
        break;
      case "notify":
        display.notify = value as boolean;
        break;
      case "textaccent":
        display.textAccent = value as number;
        break;
      case "textaccentcolor":
        display.textAccentColor = String(value);
        break;
      case "fonttype":
        display.fontType = value as number;
        break;
      case "menutextcolor":
        display.menuTextColor = String(value);
        break;
      case "highlighttile":
        display.highlightTile = value as boolean;
        break;
      case "tilestrokecolor":
        display.tileStrokeColor = String(value);
        break;
      case "tilefillcolor":
        display.tileFillColor = String(value);
        break;
      case "menusort":
        display.menuSort = value as number;
        break;
      case "priority":
        display.priority = value as number;
        break;
      case "sound":
        display.sound = value as number | string;
        break;
    }
  }

  // ---- Helpers ----

  private parseStringList(): string[] {
    this.expect(TokenType.LBracket);
    const items: string[] = [];
    while (!this.isAt(TokenType.RBracket) && !this.isAt(TokenType.EOF)) {
      items.push(this.expect(TokenType.String).value);
      if (this.isAt(TokenType.Comma)) this.advance();
    }
    this.expect(TokenType.RBracket);
    return items;
  }

  private parseNumberList(): number[] {
    this.expect(TokenType.LBracket);
    const items: number[] = [];
    while (!this.isAt(TokenType.RBracket) && !this.isAt(TokenType.EOF)) {
      items.push(this.parseNumberValue());
      if (this.isAt(TokenType.Comma)) this.advance();
    }
    this.expect(TokenType.RBracket);
    return items;
  }

  private parseNumberValue(): number {
    const tok = this.expect(TokenType.Number);
    return Number(tok.value);
  }

  private peek(): Token {
    return this.tokens[this.pos] ?? { type: TokenType.EOF, value: "", line: 0, col: 0 };
  }

  private peekAhead(offset: number): Token | undefined {
    return this.tokens[this.pos + offset];
  }

  private advance(): Token {
    const tok = this.peek();
    this.pos++;
    return tok;
  }

  private isAt(type: TokenType): boolean {
    return this.peek().type === type;
  }

  private expect(type: TokenType): Token {
    const tok = this.peek();
    if (tok.type !== type) {
      throw new ParseError(
        `Expected ${type}, got ${tok.type} ('${tok.value}')`,
        tok
      );
    }
    return this.advance();
  }
}

export function parseFilter(tokens: Token[], sourceText: string): Filter {
  const parser = new Parser(tokens, sourceText);
  return parser.parse();
}
