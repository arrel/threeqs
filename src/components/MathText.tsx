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
  const pattern = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      tokens.push({ kind: "text", value: text.slice(cursor, match.index) });
    }

    const raw = match[0];
    const display = raw.startsWith("$$");
    tokens.push({
      kind: "math",
      value: display ? raw.slice(2, -2) : raw.slice(1, -1),
      display
    });
    cursor = match.index + raw.length;
  }

  if (cursor < text.length) {
    tokens.push({ kind: "text", value: text.slice(cursor) });
  }

  return tokens;
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
