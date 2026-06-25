"use client";

import katex from "katex";

type MathTextProps = {
  text: string;
  className?: string;
};

export function MathText({ text, className }: MathTextProps) {
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

        return <TextWithBreaks key={`${token.value}-${index}`} text={token.value} />;
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

function TextWithBreaks({ text }: { text: string }) {
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
