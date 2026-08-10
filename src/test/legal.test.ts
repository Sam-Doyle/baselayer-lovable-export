import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { LEGAL, GUARANTEE_WINDOW_PHRASE } from "@/config/legal";

function readSource(relPath: string): string {
  return readFileSync(resolve(process.cwd(), relPath), "utf-8");
}

describe("legal config integrity", () => {
  // Fixed list, not derived from Object.keys(LEGAL) — a field silently
  // deleted from the object (as opposed to emptied) wouldn't show up in a
  // loop over its own keys, so this pins the set of facts the four policy
  // pages depend on existing at all.
  const REQUIRED_KEYS = [
    "entityName",
    "entityState",
    "contactEmail",
    "siteDomain",
    "effectiveDate",
    "processingDays",
    "deliveryWindow",
    "shipsInternationally",
    "guaranteeDays",
    "guaranteeStart",
    "requiresReturn",
    "refundProcessingDays",
    "minimumAge",
  ] as const;

  it("has every required field, none empty or undefined", () => {
    for (const key of REQUIRED_KEYS) {
      expect(key in LEGAL, `LEGAL.${key} must be present`).toBe(true);
    }
    for (const [key, value] of Object.entries(LEGAL)) {
      expect(value, `LEGAL.${key} must not be undefined`).not.toBeUndefined();
      if (typeof value === "string") {
        expect(value.trim(), `LEGAL.${key} must not be empty`).not.toBe("");
      }
    }
  });

  it("GUARANTEE_WINDOW_PHRASE interpolates cleanly — no undefined/NaN leaking into policy copy", () => {
    expect(GUARANTEE_WINDOW_PHRASE).not.toMatch(/undefined|NaN/);
    expect(GUARANTEE_WINDOW_PHRASE).toBe(`${LEGAL.guaranteeDays} days from the date of ${LEGAL.guaranteeStart}`);
  });

  // A refund policy stricter than the advertised marketing promise is an
  // FTC Act Section 5 problem (deceptive practice), not a copy nit. These
  // checks read the actual marketing copy off disk so a change to either
  // side (LEGAL.guaranteeDays or the on-page claim) without updating the
  // other fails the build.
  describe("guarantee terms stay consistent with on-site marketing claims", () => {
    const marketingFiles = ["src/components/HeroSection.tsx", "src/pages/FaceCream.tsx"];

    it('every "N-day" guarantee mention matches LEGAL.guaranteeDays', () => {
      for (const file of marketingFiles) {
        const source = readSource(file);
        const matches = [...source.matchAll(/(\d+)-day\b/gi)];
        expect(matches.length, `${file} should mention a day-count guarantee`).toBeGreaterThan(0);
        for (const m of matches) {
          expect(Number(m[1]), `${file}: "${m[0]}" must match LEGAL.guaranteeDays (${LEGAL.guaranteeDays})`).toBe(
            LEGAL.guaranteeDays
          );
        }
      }
    });

    it('the "Hate it? Keep the bottle. Full refund." promise implies no return required', () => {
      const hero = readSource("src/components/HeroSection.tsx");
      expect(hero).toMatch(/Keep the bottle\. Full refund\./);
      // "Keep the bottle" is only truthful if the policy doesn't secretly
      // require a return.
      expect(LEGAL.requiresReturn).toBe(false);
    });
  });
});
