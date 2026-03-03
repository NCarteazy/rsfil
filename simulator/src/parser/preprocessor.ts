// ============================================================================
//  RS2F Preprocessor — expands #define macros before parsing
// ============================================================================

interface MacroDef {
  name: string;
  params: string[];
  body: string;
}

/**
 * Expand all #define macros in the source text.
 * Handles:
 *  - Simple: #define NAME value
 *  - Parameterized: #define NAME(_p1, _p2) body using _p1 _p2
 *  - Multi-line with \ continuation
 *  - Nested macro expansion
 */
export function preprocess(source: string): string {
  // First, join continuation lines (backslash + newline)
  const joined = joinContinuations(source);

  const lines = joined.split("\n");
  const macros: MacroDef[] = [];
  const outputLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip structured comments (/*@ ... */) — they're for the UI, not for us
    // They'll be handled as regular comments by the parser

    const defineParsed = parseDefine(trimmed);
    if (defineParsed) {
      macros.push(defineParsed);
      // Still output a blank line to preserve line numbering
      outputLines.push("");
      continue;
    }

    // Expand macros in this line
    outputLines.push(expandMacros(line, macros));
  }

  return outputLines.join("\n");
}

function joinContinuations(source: string): string {
  const lines = source.split("\n");
  const result: string[] = [];
  let buffer = "";

  for (const line of lines) {
    if (line.endsWith("\\")) {
      buffer += line.slice(0, -1);
    } else {
      buffer += line;
      result.push(buffer);
      buffer = "";
    }
  }
  if (buffer) result.push(buffer);
  return result.join("\n");
}

function parseDefine(line: string): MacroDef | null {
  if (!line.startsWith("#define ")) return null;

  const rest = line.slice(8); // after "#define "

  // Parameterized: NAME(_p1, _p2) body
  const paramMatch = rest.match(/^(\w+)\(([^)]*)\)\s*(.*)/);
  if (paramMatch) {
    const name = paramMatch[1];
    const params = paramMatch[2].split(",").map((p) => p.trim());
    const body = paramMatch[3];
    return { name, params, body };
  }

  // Simple: NAME value
  const simpleMatch = rest.match(/^(\w+)\s+(.*)/);
  if (simpleMatch) {
    return { name: simpleMatch[1], params: [], body: simpleMatch[2] };
  }

  // Edge case: #define NAME (no body)
  const nameOnly = rest.match(/^(\w+)$/);
  if (nameOnly) {
    return { name: nameOnly[1], params: [], body: "" };
  }

  return null;
}

function expandMacros(line: string, macros: MacroDef[]): string {
  let result = line;
  let changed = true;
  let iterations = 0;

  // Iteratively expand until no more changes (handles nested macros)
  while (changed && iterations < 50) {
    changed = false;
    iterations++;

    for (const macro of macros) {
      if (macro.params.length > 0) {
        // Parameterized macro: NAME("arg1", arg2)
        const pattern = new RegExp(
          `\\b${escapeRegex(macro.name)}\\(`,
          "g"
        );
        let match;
        while ((match = pattern.exec(result)) !== null) {
          const startIdx = match.index;
          const argsStart = startIdx + macro.name.length + 1; // after "("
          const argsEnd = findMatchingParen(result, argsStart - 1);
          if (argsEnd === -1) continue;

          const argsStr = result.slice(argsStart, argsEnd);
          const args = splitArgs(argsStr);

          let expanded = macro.body;
          for (let i = 0; i < macro.params.length; i++) {
            const arg = args[i]?.trim() ?? "";
            expanded = expanded.split(macro.params[i]).join(arg);
          }

          result =
            result.slice(0, startIdx) + expanded + result.slice(argsEnd + 1);
          changed = true;
          break; // restart after substitution since indices shifted
        }
      } else {
        // Simple macro: replace identifier occurrences
        // Don't replace inside strings or inside #define lines
        const pattern = new RegExp(`\\b${escapeRegex(macro.name)}\\b`, "g");
        const newResult = result.replace(pattern, macro.body);
        if (newResult !== result) {
          result = newResult;
          changed = true;
        }
      }
    }
  }

  return result;
}

function findMatchingParen(str: string, openIdx: number): number {
  let depth = 0;
  let inString = false;
  let stringChar = "";

  for (let i = openIdx; i < str.length; i++) {
    const ch = str[i];

    if (inString) {
      if (ch === stringChar && str[i - 1] !== "\\") {
        inString = false;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = true;
      stringChar = ch;
      continue;
    }

    if (ch === "(") depth++;
    if (ch === ")") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function splitArgs(argsStr: string): string[] {
  const args: string[] = [];
  let current = "";
  let depth = 0;
  let inString = false;
  let stringChar = "";

  for (let i = 0; i < argsStr.length; i++) {
    const ch = argsStr[i];

    if (inString) {
      current += ch;
      if (ch === stringChar && argsStr[i - 1] !== "\\") {
        inString = false;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = true;
      stringChar = ch;
      current += ch;
      continue;
    }

    if (ch === "(" || ch === "[") depth++;
    if (ch === ")" || ch === "]") depth--;

    if (ch === "," && depth === 0) {
      args.push(current);
      current = "";
      continue;
    }

    current += ch;
  }

  if (current.trim()) args.push(current);
  return args;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
