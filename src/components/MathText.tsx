"use client";

import katex from "katex";
import type { VocabTerm } from "@/lib/types";

type MathTextProps = {
  text: string;
  className?: string;
  vocabTerms?: VocabTerm[];
  onVocabTermSelect?: (term: VocabTerm) => void;
};

export function MathText({ text, className, vocabTerms = [], onVocabTermSelect }: MathTextProps) {
  const tokens = splitMathText(text);

  return (
    <span className={["math-text", className].filter(Boolean).join(" ")}>
      {tokens.map((token, index) => {
        if (token.kind === "math") {
          return (
            <span
              className={token.display ? "math-display" : undefined}
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(token.value, {
                  displayMode: token.display,
                  throwOnError: false,
                  strict: false
                })
              }}
              key={`${token.value}-${index}`}
            />
          );
        }

        return (
          <TextWithBreaks
            key={`${token.value}-${index}`}
            onVocabTermSelect={onVocabTermSelect}
            text={token.value}
            vocabTerms={vocabTerms}
          />
        );
      })}
    </span>
  );
}

type Token =
  | {
      kind: "text";
      value: string;
    }
  | {
      kind: "math";
      value: string;
      display: boolean;
    };

function splitMathText(text: string): Token[] {
  const tokens: Token[] = [];
  let cursor = 0;
  let textStart = 0;

  while (cursor < text.length) {
    if (text[cursor] !== "$" || isEscaped(text, cursor)) {
      cursor += 1;
      continue;
    }

    const display = text.startsWith("$$", cursor);
    const delimiter = display ? "$$" : "$";
    const mathStart = cursor + delimiter.length;
    const mathEnd = findClosingMathDelimiter(text, mathStart, delimiter);

    if (mathEnd === null) {
      cursor += delimiter.length;
      continue;
    }

    if (textStart < cursor) {
      tokens.push({ kind: "text", value: unescapeText(text.slice(textStart, cursor)) });
    }

    tokens.push({
      kind: "math",
      value: text.slice(mathStart, mathEnd),
      display
    });

    cursor = mathEnd + delimiter.length;
    textStart = cursor;
  }

  if (textStart < text.length) {
    tokens.push({ kind: "text", value: unescapeText(text.slice(textStart)) });
  }

  return tokens;
}

function findClosingMathDelimiter(text: string, start: number, delimiter: "$" | "$$"): number | null {
  let cursor = start;

  while (cursor < text.length) {
    if (delimiter === "$" && text[cursor] === "\n") {
      return null;
    }

    if (text.startsWith(delimiter, cursor) && !isEscaped(text, cursor)) {
      return cursor;
    }

    cursor += 1;
  }

  return null;
}

function isEscaped(text: string, index: number): boolean {
  let backslashCount = 0;
  let cursor = index - 1;

  while (cursor >= 0 && text[cursor] === "\\") {
    backslashCount += 1;
    cursor -= 1;
  }

  return backslashCount % 2 === 1;
}

function unescapeText(text: string): string {
  return text.replace(/\\\$/g, "$");
}

type VocabTextPart =
  | {
      kind: "text";
      value: string;
    }
  | {
      kind: "vocab";
      value: string;
      term: VocabTerm;
    };

type VocabMatch = {
  label: string;
  lowerLabel: string;
  term: VocabTerm;
};

function TextWithBreaks({
  onVocabTermSelect,
  text,
  vocabTerms
}: {
  onVocabTermSelect?: (term: VocabTerm) => void;
  text: string;
  vocabTerms: VocabTerm[];
}) {
  const parts =
    onVocabTermSelect && vocabTerms.length > 0
      ? splitVocabText(text, buildVocabMatches(vocabTerms))
      : [{ kind: "text" as const, value: text }];

  return (
    <>
      {parts.map((part, index) => {
        if (part.kind === "text") {
          return <PlainTextWithBreaks key={`${part.value}-${index}`} text={part.value} />;
        }

        return (
          <button
            aria-label={`Show definition for ${part.term.term}`}
            className="vocab-word"
            key={`${part.value}-${part.term.term}-${index}`}
            onClick={() => onVocabTermSelect?.(part.term)}
            type="button"
          >
            {part.value}
          </button>
        );
      })}
    </>
  );
}

function PlainTextWithBreaks({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, index, lines) => (
        <span key={`${line}-${index}`}>
          {line}
          {index < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </>
  );
}

function splitVocabText(text: string, matches: VocabMatch[]): VocabTextPart[] {
  if (matches.length === 0) {
    return [{ kind: "text", value: text }];
  }

  const parts: VocabTextPart[] = [];
  const lowerText = text.toLowerCase();
  let cursor = 0;
  let textStart = 0;

  while (cursor < text.length) {
    const match = findVocabMatchAt(text, lowerText, cursor, matches);

    if (!match) {
      cursor += 1;
      continue;
    }

    if (textStart < cursor) {
      parts.push({ kind: "text", value: text.slice(textStart, cursor) });
    }

    const matchEnd = cursor + match.label.length;
    parts.push({ kind: "vocab", value: text.slice(cursor, matchEnd), term: match.term });
    cursor = matchEnd;
    textStart = cursor;
  }

  if (textStart < text.length) {
    parts.push({ kind: "text", value: text.slice(textStart) });
  }

  return parts;
}

function buildVocabMatches(vocabTerms: VocabTerm[]): VocabMatch[] {
  const matches: VocabMatch[] = [];
  const seenLabels = new Set<string>();

  for (const term of vocabTerms) {
    for (const label of [term.term, ...(term.aliases ?? [])]) {
      const normalizedLabel = label.trim();

      if (!normalizedLabel) {
        continue;
      }

      const lowerLabel = normalizedLabel.toLowerCase();

      if (seenLabels.has(lowerLabel)) {
        continue;
      }

      seenLabels.add(lowerLabel);
      matches.push({ label: normalizedLabel, lowerLabel, term });
    }
  }

  return matches.sort((first, second) => second.lowerLabel.length - first.lowerLabel.length);
}

function findVocabMatchAt(
  text: string,
  lowerText: string,
  cursor: number,
  matches: VocabMatch[]
): VocabMatch | null {
  for (const match of matches) {
    if (!lowerText.startsWith(match.lowerLabel, cursor)) {
      continue;
    }

    const end = cursor + match.lowerLabel.length;

    if (isWordBoundary(text, cursor - 1) && isWordBoundary(text, end)) {
      return match;
    }
  }

  return null;
}

function isWordBoundary(text: string, index: number): boolean {
  if (index < 0 || index >= text.length) {
    return true;
  }

  return !/[A-Za-z0-9]/.test(text[index]);
}
