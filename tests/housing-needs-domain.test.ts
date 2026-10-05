import { describe, expect, it } from "vitest";
import { compatibility, profileInput } from "../server/domain";
import {
  accessibilityNeeds,
  accessibilityNeedLabel,
  frequentHousingNeeds,
  housingNeeds,
  housingNeedGroups,
  housingNeedLabel,
} from "../shared/profile-details";

const profile = {
  city: "Bologna" as const,
  budget: 1100,
  move_in: "2026-12-01",
  duration: 12,
  occupants: 2,
};

const property = {
  title: "Casa di prova",
  city: "Bologna" as const,
  area: "Saragozza",
  description: "Immobile sintetico per verificare le preferenze.",
  rent: 1000,
  available_from: "2026-11-01",
  min_months: 6,
  max_months: 18,
  capacity: 2,
  sqm: 70,
  rooms: 3,
  furnished: true,
  authority_attested: true,
};

describe("expanded house preferences", () => {
  it.each(housingNeeds)("accepts the public house feature %s", (need) => {
    expect(
      profileInput.parse({ ...profile, housing_needs: [need] }).housing_needs,
    ).toEqual([need]);
    expect(housingNeedLabel(need).trim().length).toBeGreaterThan(0);
  });

  it.each(accessibilityNeeds)(
    "accepts the separate accessibility preference %s",
    (need) => {
      expect(
        profileInput.parse({ ...profile, accessibility_needs: [need] })
          .accessibility_needs,
      ).toEqual([need]);
      expect(accessibilityNeedLabel(need).trim().length).toBeGreaterThan(0);
    },
  );

  it("allows all available features without the old three-choice limit", () => {
    const result = profileInput.parse({
      ...profile,
      housing_needs: [...housingNeeds],
      accessibility_needs: [...accessibilityNeeds],
    });
    expect(result.housing_needs).toHaveLength(22);
    expect(result.accessibility_needs).toHaveLength(6);
  });

  it("preserves omission separately from an explicit empty selection", () => {
    const omitted = profileInput.parse(profile);
    expect(omitted).not.toHaveProperty("housing_needs");
    expect(omitted).not.toHaveProperty("accessibility_needs");
    expect(
      profileInput.parse({
        ...profile,
        housing_needs: [],
        accessibility_needs: [],
      }),
    ).toMatchObject({ housing_needs: [], accessibility_needs: [] });
  });

  it.each([
    { housing_needs: ["balcony", "balcony"] },
    { housing_needs: ["swimming_pool"] },
    { housing_needs: ["step_free_entry"] },
    { housing_needs: null },
    { housing_needs: "balcony" },
    { housing_needs: Array(housingNeeds.length + 1).fill("balcony") },
    { accessibility_needs: ["step_free_entry", "step_free_entry"] },
    { accessibility_needs: ["medical_certificate"] },
    { accessibility_needs: ["elevator"] },
    { accessibility_needs: null },
    { accessibility_needs: "step_free_entry" },
    {
      accessibility_needs: Array(accessibilityNeeds.length + 1).fill(
        "step_free_entry",
      ),
    },
  ])("rejects invalid selections %j", (change) => {
    expect(profileInput.safeParse({ ...profile, ...change }).success).toBe(
      false,
    );
  });

  it.each([
    { disabled: true },
    { disability: "diagnosi di prova" },
    { disability_percentage: 50 },
    { medical_diagnosis: "diagnosi di prova" },
  ])("does not introduce a disability or diagnosis field %j", (change) => {
    expect(profileInput.safeParse({ ...profile, ...change }).success).toBe(
      false,
    );
  });

  it("keeps accessibility keys outside the public house-feature catalogue", () => {
    const publicKeys = new Set<string>(housingNeeds);
    expect(accessibilityNeeds.some((need) => publicKeys.has(need))).toBe(false);
    const displayed = new Set<string>([
      ...frequentHousingNeeds,
      ...housingNeedGroups.flatMap((group) => [...group.needs]),
    ]);
    expect(displayed).toEqual(new Set(housingNeeds));
  });

  it.each([property, { ...property, rent: profile.budget + 1 }])(
    "does not change compatibility or its reasons for %j",
    (offered) => {
      const withPreferences = profileInput.parse({
        ...profile,
        housing_needs: [...housingNeeds],
        accessibility_needs: [...accessibilityNeeds],
      });
      expect(compatibility(withPreferences, offered)).toEqual(
        compatibility(profile, offered),
      );
    },
  );
});
