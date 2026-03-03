// ============================================================================
//  RS2F Lexer — tokenizes preprocessed filter source
// ============================================================================

import type { Token } from "./types";
import { TokenType } from "./types";

const KEYWORDS: Record<string, TokenType> = {
  meta: TokenType.Meta,
  rule: TokenType.Rule,
  apply: TokenType.Apply,
  true: TokenType.Boolean,
  false: TokenType.Boolean,
};

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;
  let line = 1;
  let col = 1;

  function peek(): string {
    return source[pos] ?? "\0";
  }

  function advance(): string {
    const ch = source[pos] ?? "\0";
    pos++;
    if (ch === "\n") {
      line++;
      col = 1;
    } else {
      col++;
    }
    return ch;
  }

  function push(type: TokenType, value: string, startLine: number, startCol: number) {
    tokens.push({ type, value, line: startLine, col: startCol });
  }

  while (pos < source.length) {
    const startLine = line;
    const startCol = col;
    const ch = peek();

    // Whitespace
    if (ch === " " || ch === "\t" || ch === "\r" || ch === "\n") {
      advance();
      continue;
    }

    // Single-line comment
    if (ch === "/" && source[pos + 1] === "/") {
      while (pos < source.length && peek() !== "\n") advance();
      continue;
    }

    // Block comment
    if (ch === "/" && source[pos + 1] === "*") {
      advance(); advance(); // skip /*
      while (pos < source.length) {
        if (peek() === "*" && source[pos + 1] === "/") {
          advance(); advance(); // skip */
          break;
        }
        advance();
      }
      continue;
    }

    // Two-character operators
    if (ch === "&" && source[pos + 1] === "&") {
      advance(); advance();
      push(TokenType.And, "&&", startLine, startCol);
      continue;
    }
    if (ch === "|" && source[pos + 1] === "|") {
      advance(); advance();
      push(TokenType.Or, "||", startLine, startCol);
      continue;
    }
    if (ch === ">" && source[pos + 1] === "=") {
      advance(); advance();
      push(TokenType.Gte, ">=", startLine, startCol);
      continue;
    }
    if (ch === "<" && source[pos + 1] === "=") {
      advance(); advance();
      push(TokenType.Lte, "<=", startLine, startCol);
      continue;
    }
    if (ch === "=" && source[pos + 1] === "=") {
      advance(); advance();
      push(TokenType.Eq, "==", startLine, startCol);
      continue;
    }

    // Single-character tokens
    const singleMap: Record<string, TokenType> = {
      "{": TokenType.LBrace,
      "}": TokenType.RBrace,
      "(": TokenType.LParen,
      ")": TokenType.RParen,
      "[": TokenType.LBracket,
      "]": TokenType.RBracket,
      ";": TokenType.Semicolon,
      "=": TokenType.Equals,
      ",": TokenType.Comma,
      ":": TokenType.Colon,
      "!": TokenType.Not,
      ">": TokenType.Gt,
      "<": TokenType.Lt,
    };

    if (singleMap[ch]) {
      advance();
      push(singleMap[ch], ch, startLine, startCol);
      continue;
    }

    // String literal (double-quoted)
    if (ch === '"') {
      advance(); // skip opening quote
      let str = "";
      while (pos < source.length && peek() !== '"') {
        if (peek() === "\\" && source[pos + 1] === '"') {
          advance(); // skip backslash
          str += advance();
        } else {
          str += advance();
        }
      }
      advance(); // skip closing quote
      push(TokenType.String, str, startLine, startCol);
      continue;
    }

    // Number literal (supports underscores: 100_000, negatives: -5)
    if (
      (ch >= "0" && ch <= "9") ||
      (ch === "-" && source[pos + 1] >= "0" && source[pos + 1] <= "9")
    ) {
      let num = "";
      if (ch === "-") num += advance();
      while (
        pos < source.length &&
        ((peek() >= "0" && peek() <= "9") || peek() === "_" || peek() === ".")
      ) {
        const c = advance();
        if (c !== "_") num += c;
      }
      push(TokenType.Number, num, startLine, startCol);
      continue;
    }

    // Identifier / keyword
    if (isIdentStart(ch)) {
      let id = "";
      while (pos < source.length && isIdentChar(peek())) {
        id += advance();
      }
      const kwType = KEYWORDS[id];
      if (kwType) {
        push(kwType, id, startLine, startCol);
      } else {
        push(TokenType.Identifier, id, startLine, startCol);
      }
      continue;
    }

    // Unknown character — skip
    advance();
  }

  push(TokenType.EOF, "", line, col);
  return tokens;
}

function isIdentStart(ch: string): boolean {
  return (
    (ch >= "a" && ch <= "z") ||
    (ch >= "A" && ch <= "Z") ||
    ch === "_"
  );
}

function isIdentChar(ch: string): boolean {
  return isIdentStart(ch) || (ch >= "0" && ch <= "9");
}
