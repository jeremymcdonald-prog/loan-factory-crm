/**
 * Ally is a separate platform and must not appear anywhere in this CRM
 * (Jeremy's 2026-07-17 directive). This scans every application source file —
 * UI copy, seeds, components, routes, queries, tests — for the name and fails
 * on any hit, so a stray reference can't creep back in through a copy-paste.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC = join(process.cwd(), "src");
const EXTENSIONS = new Set([".ts", ".tsx", ".css"]);

/** The name as a word: "Ally", "ally", "ALLY" — but never "automatically". */
const FORBIDDEN = /\b[Aa]lly\b|\bALLY\b/;

/** The scanner is the one file allowed to spell the name — it has to. */
const SELF = join(SRC, "test", "no-ally-references.test.ts");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else if (EXTENSIONS.has(full.slice(full.lastIndexOf("."))) && full !== SELF) {
      out.push(full);
    }
  }
  return out;
}

describe("no Ally references in CRM surfaces", () => {
  it("finds no Ally in any source file, seed, component, or route", () => {
    const offenders: string[] = [];

    for (const file of walk(SRC)) {
      const text = readFileSync(file, "utf8");
      const lines = text.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (FORBIDDEN.test(lines[i])) {
          offenders.push(`${file.replace(process.cwd() + "/", "")}:${i + 1}  ${lines[i].trim().slice(0, 90)}`);
        }
      }
    }

    expect(offenders, `Ally references found:\n${offenders.join("\n")}`).toEqual([]);
  });

  it("finds no Ally in route directory names", () => {
    const dirs: string[] = [];
    function walkDirs(dir: string) {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
          if (/\bally\b/i.test(entry)) dirs.push(full);
          walkDirs(full);
        }
      }
    }
    walkDirs(SRC);
    expect(dirs).toEqual([]);
  });
});
