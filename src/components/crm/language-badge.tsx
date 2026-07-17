/**
 * LanguageBadge — every person record carries one (Screen_Specifications
 * shared conventions). AI drafts in the contact's preferred language, and
 * non-English drafts are always flagged for human translation review.
 * First-class per D-08: EN and VI are peers.
 */
import { cn } from "@/lib/cn";

const LANGUAGES: Record<string, { code: string; name: string }> = {
  en: { code: "EN", name: "English" },
  vi: { code: "VI", name: "Vietnamese" },
  zh: { code: "ZH", name: "Chinese" },
  es: { code: "ES", name: "Spanish" },
  ru: { code: "RU", name: "Russian" },
};

export function LanguageBadge({
  language,
  className,
}: {
  language: string;
  className?: string;
}) {
  const entry = LANGUAGES[language] ?? { code: language.toUpperCase(), name: language };

  // English is the unmarked default: showing a badge on every row would be
  // noise. Non-English is what a user needs to notice before they write.
  if (language === "en") return null;

  return (
    <span
      title={`Prefers ${entry.name}`}
      className={cn(
        "inline-flex items-center rounded border border-strong bg-sunken px-1 py-px",
        "text-micro font-semibold text-secondary",
        className,
      )}
    >
      {entry.code}
    </span>
  );
}

export function languageName(code: string): string {
  return LANGUAGES[code]?.name ?? code;
}
