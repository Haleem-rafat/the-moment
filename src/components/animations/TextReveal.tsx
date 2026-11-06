import type { ElementType } from "react";

const ARABIC = /[؀-ۿ]/;

interface TextRevealProps {
  text: string;
  as?: ElementType;
  className?: string;
  by?: "char" | "word";
  /** Selector hook for the scene's GSAP timeline. */
  id?: string;
}

/**
 * Splits text into units that a scene's timeline reveals via `revealText`.
 * Arabic is always split by word, because splitting it by letter breaks the
 * joined letterforms.
 */
export function TextReveal({ text, as: Tag = "p", className, by = "char", id }: TextRevealProps) {
  const words = text.split(" ");
  const splitChars = by === "char" && !ARABIC.test(text);

  return (
    <Tag className={`text-balance ${className ?? ""}`} data-reveal={id} dir="auto" aria-label={text}>
      {words.map((word, w) => (
        <span key={w} aria-hidden>
          {splitChars ? (
            <span className="inline-block whitespace-nowrap">
              {Array.from(word).map((char, c) => (
                <span key={c} data-unit>
                  {char}
                </span>
              ))}
            </span>
          ) : (
            <span data-unit>{word}</span>
          )}
          {w < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
