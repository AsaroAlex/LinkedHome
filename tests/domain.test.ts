import { describe, it, expect } from "vitest";
import {
  compatibility,
  profileInput,
  propertyInput,
  verificationState,
} from "../server/domain";
import { endOfMonth, moveInEnd, moveInLabel } from "../shared/move-in";
import {
  contractPreferences,
  contractTypes,
  contractMatches,
  contractPreferenceLabel,
  contractTypeLabel,
  contractHint,
} from "../shared/contracts";
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

describe("contract preferences", () => {
  it("keeps legacy durations and leaves missing contract fields optional", () => {
    const parsedProfile = profileInput.parse(profile);
    const parsedProperty = propertyInput.parse(property);
    expect(parsedProfile.duration).toBe(12);
    expect(parsedProfile.contract_preference).toBeUndefined();
    expect(parsedProperty.min_months).toBe(6);
    expect(parsedProperty.max_months).toBe(12);
    expect(parsedProperty.contract_type).toBeUndefined();
    expect(contractMatches(undefined, undefined)).toBe(true);
    expect(compatibility(parsedProfile, parsedProperty).checks).toHaveLength(5);
    expect(
      compatibility(
        { ...profile, contract_preference: "any" },
        { ...property, contract_type: "unspecified" },
      ).checks,
    ).toHaveLength(5);
  });

  it.each(contractPreferences)(
    "parses tenant preference %s without replacing intended stay months",
    (contract_preference) => {
      const parsed = profileInput.parse({
        ...profile,
        duration: 12,
        contract_preference,
      });
      expect(parsed.contract_preference).toBe(contract_preference);
      expect(parsed.duration).toBe(12);
    },
  );

  it.each(contractTypes)(
    "parses offered contract %s without replacing intended stay bounds",
    (contract_type) => {
      const parsed = propertyInput.parse({
        ...property,
        contract_type,
      });
      expect(parsed.contract_type).toBe(contract_type);
      expect(parsed.min_months).toBe(6);
      expect(parsed.max_months).toBe(12);
    },
  );

  it.each(["unspecified", "short_term", "4+4", null])(
    "rejects undeclared tenant contract %s",
    (contract_preference) => {
      expect(
        profileInput.safeParse({ ...profile, contract_preference }).success,
      ).toBe(false);
    },
  );

  it.each(["any", "short_term", "4+4", null])(
    "rejects undeclared offered contract %s",
    (contract_type) => {
      expect(
        propertyInput.safeParse({ ...property, contract_type }).success,
      ).toBe(false);
    },
  );

  it.each(
    contractPreferences.flatMap((preference) =>
      contractTypes.map((type) => ({ preference, type })),
    ),
  )(
    "matches $preference against $type consistently",
    ({ preference, type }) => {
      const expected = preference === "any" || preference === type;
      expect(contractMatches(preference, type)).toBe(expected);
      const result = compatibility(
        { ...profile, contract_preference: preference },
        { ...property, contract_type: type },
      );
      expect(result.compatible).toBe(expected);
      const contract = result.checks.find((check) => check.key === "contract");
      if (preference === "any" && type === "unspecified") {
        expect(contract).toBeUndefined();
      } else {
        expect(contract).toMatchObject({
          label: "Contratto",
          matches: expected,
        });
        expect(contract?.detail).toContain(contractTypeLabel(type));
        expect(contract?.detail).toContain(contractPreferenceLabel(preference));
      }
    },
  );

  it("does not infer a contract from an existing property duration", () => {
    const result = compatibility(
      { ...profile, contract_preference: "student" },
      property,
    );
    expect(result.compatible).toBe(false);
    expect(result.checks.filter((check) => !check.matches)).toEqual([
      {
        key: "contract",
        label: "Contratto",
        matches: false,
        detail: "Da concordare · preferenza: Studenti universitari",
      },
    ]);
  });

  it("keeps intended stay compatibility independent of contract choice", () => {
    const result = compatibility(
      { ...profile, duration: 13, contract_preference: "four_plus_four" },
      { ...property, contract_type: "four_plus_four" },
    );
    expect(result.compatible).toBe(false);
    expect(result.checks.filter((check) => !check.matches)).toEqual([
      {
        key: "duration",
        label: "Permanenza",
        matches: false,
        detail: "13 mesi · offerta 6–12",
      },
    ]);
  });

  it("uses familiar Italian labels and explains formal terms separately", () => {
    expect(contractPreferenceLabel()).toBe("Sono flessibile");
    expect(contractTypeLabel()).toBe("Da concordare");
    expect(contractTypeLabel("four_plus_four")).toBe("4+4 · canone libero");
    expect(contractTypeLabel("three_plus_two")).toBe("3+2 · canone concordato");
    expect(contractHint("four_plus_four")).toContain("4 anni");
    expect(contractHint("three_plus_two")).toContain("3 anni");
    expect(contractHint("student")).toContain("6 a 36 mesi");
    expect(contractHint("transitory")).toContain("18 mesi");
    expect(contractHint("transitory")).toContain("esigenza temporanea");
  });
});
