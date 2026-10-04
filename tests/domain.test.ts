import { describe, it, expect } from "vitest";
import {
  compatibility,
  profileInput,
  propertyInput,
  verificationState,
} from "../server/domain";
import { endOfMonth, moveInEnd, moveInLabel } from "../shared/move-in";
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

describe("move-in periods", () => {
  it("keeps legacy precise dates and matching boundaries", () => {
    const precise = profileInput.parse({ ...profile, move_in: "2026-12-17" });
    expect(precise).toMatchObject({
      move_in: "2026-12-17",
      move_in_precision: "day",
      move_in_end: "2026-12-17",
    });
    expect(moveInEnd({ ...profile, move_in: "2026-12-17" })).toBe("2026-12-17");
    expect(moveInEnd({ ...profile, move_in_end: null })).toBe(profile.move_in);
    expect(moveInLabel(precise)).toBe("17 dicembre 2026");
    expect(
      compatibility(precise, { ...property, available_from: "2026-12-17" })
        .compatible,
    ).toBe(true);
    expect(
      compatibility(precise, { ...property, available_from: "2026-12-18" })
        .compatible,
    ).toBe(false);
  });

  it.each([
    ["2028-02-01", "2028-02-29"],
    ["2027-02-01", "2027-02-28"],
    ["2026-04-01", "2026-04-30"],
    ["2026-12-01", "2026-12-31"],
  ])("computes month end for %s", (start, end) => {
    expect(endOfMonth(start)).toBe(end);
    const parsed = profileInput.parse({
      ...profile,
      move_in: start,
      move_in_precision: "month",
    });
    expect(parsed.move_in_end).toBe(end);
    expect(
      profileInput.parse({ ...parsed, move_in_end: end }).move_in_end,
    ).toBe(end);
  });

  it("allows availability within a chosen month through its final day", () => {
    const month = profileInput.parse({
      ...profile,
      move_in: "2028-02-01",
      move_in_precision: "month",
    });
    expect(moveInLabel(month)).toBe("febbraio 2028");
    for (const available_from of ["2028-02-15", "2028-02-29"])
      expect(
        compatibility(month, { ...property, available_from }).compatible,
      ).toBe(true);
    expect(
      compatibility(month, { ...property, available_from: "2028-03-01" })
        .compatible,
    ).toBe(false);
    expect(
      compatibility(month, property).checks.find((c) => c.key === "date")
        ?.detail,
    ).toContain("ingresso febbraio 2028");
  });

  it("matches an inclusive multi-month period across a year boundary", () => {
    const range = profileInput.parse({
      ...profile,
      move_in: "2026-11-01",
      move_in_precision: "range",
      move_in_end: "2027-01-31",
    });
    expect(moveInLabel(range)).toBe("novembre 2026 – gennaio 2027");
    for (const available_from of ["2026-10-31", "2026-12-15", "2027-01-31"])
      expect(
        compatibility(range, { ...property, available_from }).compatible,
      ).toBe(true);
    expect(
      compatibility(range, { ...property, available_from: "2027-02-01" })
        .compatible,
    ).toBe(false);
  });

  it("accepts an explicitly selected single-month range", () => {
    expect(
      profileInput.safeParse({
        ...profile,
        move_in: "2028-02-01",
        move_in_precision: "range",
        move_in_end: "2028-02-29",
      }).success,
    ).toBe(true);
  });

  it.each([
    { move_in_precision: "day", move_in_end: "2026-12-02" },
    { move_in_end: "2026-12-02" },
    { move_in_precision: "week" },
    { move_in_precision: "month", move_in: "2026-12-02" },
    { move_in_precision: "month", move_in_end: "2026-12-30" },
    { move_in_precision: "month", move_in: "2026-13-01" },
    { move_in_precision: "range" },
    { move_in_precision: "range", move_in_end: null },
    { move_in_precision: "range", move_in_end: "2026-11-30" },
    { move_in_precision: "range", move_in_end: "2027-01-30" },
    {
      move_in_precision: "range",
      move_in: "2026-12-02",
      move_in_end: "2027-01-31",
    },
    { move_in_precision: "range", move_in_end: "2027-02-29" },
  ])("rejects malformed or conflicting period %j", (change) => {
    expect(profileInput.safeParse({ ...profile, ...change }).success).toBe(
      false,
    );
  });
});
