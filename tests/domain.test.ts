import { describe, it, expect } from "vitest";
import {
  compatibility,
  profileInput,
  propertyInput,
  verificationState,
} from "../server/domain";
const profile = {
  city: "Bologna" as const,
  budget: 850,
  move_in: "2026-12-01",
  duration: 12,
  occupants: 2,
};
const property = {
  title: "Casa esempio",
  city: "Bologna" as const,
  area: "Saragozza",
  description: "Solo dati sintetici per il test.",
  rent: 850,
  available_from: "2026-12-01",
  min_months: 6,
  max_months: 12,
  capacity: 2,
  sqm: 60,
  rooms: 2,
  furnished: true,
  authority_attested: true,
};
describe("declared compatibility", () => {
  it("includes boundaries and gives each reason without a person score", () => {
    const result = compatibility(profile, property);
    expect(result.compatible).toBe(true);
    expect(result.checks).toHaveLength(5);
    expect(result).not.toHaveProperty("score");
  });
  it.each([
    { city: "Roma" as const },
    { budget: 849 },
    { move_in: "2026-11-30" },
    { duration: 5 },
    { duration: 13 },
    { occupants: 3 },
  ])("rejects incompatible criterion %j", (change) => {
    const result = compatibility({ ...profile, ...change }, property);
    expect(result.compatible).toBe(false);
    expect(result.checks.filter((x) => !x.matches)).toHaveLength(1);
  });
  it("does not use optional verification or protected attributes", () => {
    const augmented = {
      ...profile,
      name: "Other",
      nationality: "unavailable",
      language: "en",
      income: 0,
      verification: "FAILED",
    };
    expect(compatibility(augmented, property)).toEqual(
      compatibility(profile, property),
    );
  });
  it("rejects protected/undeclared inputs at API schema boundary", () => {
    expect(
      profileInput.safeParse({ ...profile, nationality: "any" }).success,
    ).toBe(false);
  });
  it.each(["2026-02-30", "2026-13-01", "anything"])(
    "rejects invalid calendar date %s",
    (move_in) =>
      expect(profileInput.safeParse({ ...profile, move_in }).success).toBe(
        false,
      ),
  );
  it("does not coerce empty budget into a usable profile", () =>
    expect(profileInput.safeParse({ ...profile, budget: "" }).success).toBe(
      false,
    ));
  it("rejects reversed duration", () =>
    expect(
      propertyInput.safeParse({ ...property, min_months: 24 }).success,
    ).toBe(false));
  it.each([
    ["PENDING", null, "PENDING"],
    ["FAILED", null, "FAILED"],
    ["DISPUTED", "2020-01-01", "DISPUTED"],
    ["VERIFIED", "2020-01-01", "EXPIRED"],
    ["VERIFIED", null, "EXPIRED"],
    ["VERIFIED", "2099-01-01", "VERIFIED"],
  ])("keeps verification meaning %s", (status, expires_at, expected) =>
    expect(verificationState({ status: status!, expires_at })).toBe(expected),
  );
});
