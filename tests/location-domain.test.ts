import { describe, expect, it } from "vitest";
import { compatibility, profileInput } from "../server/domain";
import {
  areasForCity,
  canonicalArea,
  cities,
  locationMatches,
  locationsLabel,
  searchLocations,
  type SearchLocation,
} from "../shared/locations";

const profile = {
  city: "Bologna" as const,
  budget: 1100,
  move_in: "2028-01-15",
  duration: 12,
  occupants: 2,
};
const property = {
  title: "Casa sintetica",
  city: "Bologna" as const,
  area: "Saragozza",
  description: "Una casa sintetica per verificare città e zone.",
  rent: 850,
  available_from: "2028-01-01",
  min_months: 6,
  max_months: 36,
  capacity: 2,
  sqm: 65,
  rooms: 3,
  furnished: true,
  authority_attested: true,
};
const locations: SearchLocation[] = [
  { city: "Bologna", areas: ["Centro storico", "Saragozza"] },
  { city: "Padova", areas: [] },
];

describe("search location validation", () => {
  it("preserves old city-only input and uses it as a whole-city preference", () => {
    const parsed = profileInput.parse(profile);
    expect(parsed).not.toHaveProperty("locations");
    expect(searchLocations(parsed)).toEqual([{ city: "Bologna", areas: [] }]);
    expect(searchLocations({ city: "Bologna", locations: null })).toEqual([
      { city: "Bologna", areas: [] },
    ]);
    expect(locationMatches(parsed, { ...property, area: "Zona libera" })).toBe(
      true,
    );
    expect(
      compatibility(parsed, property).checks.map((check) => check.key),
    ).toEqual(["city", "budget", "date", "duration", "occupants"]);
  });

  it("accepts several unique cities, selected zones and whole-city choices", () => {
    const parsed = profileInput.parse({ ...profile, locations });
    expect(parsed.locations).toEqual(locations);
    expect(searchLocations(parsed)).toEqual(locations);
    expect(locationsLabel(parsed)).toBe(
      "Bologna: Centro storico, Saragozza; Padova · tutta la città",
    );
    const allCities = cities.map((city) => ({ city, areas: [] }));
    expect(
      profileInput.parse({ ...profile, locations: allCities }).locations,
    ).toEqual(allCities);
  });

  it.each(
    [
      [],
      null,
      "Bologna",
      [{ city: "Napoli", areas: [] }],
      [
        { city: "Bologna", areas: [] },
        { city: "Bologna", areas: ["Saragozza"] },
      ],
      [{ city: "Bologna", areas: ["Saragozza", "Saragozza"] }],
      [{ city: "Bologna", areas: ["Centro"] }],
      [{ city: "Bologna", areas: ["Città Studi"] }],
      [{ city: "Bologna", areas: ["Zona sconosciuta"] }],
      [{ city: "Bologna", areas: [""] }],
      [{ city: "Bologna", areas: [" Saragozza "] }],
      [{ city: "Bologna", areas: ["saragozza"] }],
      [{ city: "Bologna", areas: null }],
      [{ city: "Bologna", areas: "Saragozza" }],
      [{ city: "Bologna", areas: [], radius: 10 }],
      [{ city: "Bologna" }],
      [{ areas: [] }],
      [{ city: "Padova", areas: [] }],
    ].map((invalid) => ({ invalid })),
  )(
    "rejects invalid, noncanonical or undeclared selections $invalid",
    ({ invalid }) => {
      expect(
        profileInput.safeParse({ ...profile, locations: invalid }).success,
      ).toBe(false);
    },
  );

  it("bounds city and zone arrays before they can reach persistence", () => {
    for (const invalid of [
      [
        ...cities.map((city) => ({ city, areas: [] })),
        { city: "Bologna", areas: [] },
      ],
      [{ city: "Bologna", areas: Array(21).fill("Saragozza") }],
    ]) {
      const result = profileInput.safeParse({ ...profile, locations: invalid });
      expect(result.success).toBe(false);
      if (!result.success)
        expect(
          result.error.issues.some((issue) => issue.code === "too_big"),
        ).toBe(true);
    }
  });
});

describe("neighbourhood catalogue and matching", () => {
  it("has bounded unique canonical labels for each supported city", () => {
    for (const city of cities) {
      const areas = areasForCity(city);
      expect(areas.length).toBeGreaterThan(0);
      expect(areas.length).toBeLessThanOrEqual(20);
      expect(new Set(areas).size).toBe(areas.length);
      for (const area of areas) {
        expect(area.trim()).toBe(area);
        expect(canonicalArea(city, area)).toBe(area);
        expect(
          profileInput.safeParse({
            ...profile,
            city,
            locations: [{ city, areas: [area] }],
          }).success,
        ).toBe(true);
      }
    }
    expect(areasForCity("Napoli")).toEqual([]);
  });

  it.each([
    ["Bologna", "  CENTRO  ", "Centro storico"],
    ["Bologna", "  san   donato ", "San Donato"],
    ["Bologna", "sáragozza", "Saragozza"],
    ["Milano", "citta\tSTUDI", "Città Studi"],
    ["Padova", "Centro", "Centro storico"],
    ["Torino", "centro storico", "Centro"],
    ["Roma", "EUR", "Eur"],
  ])(
    "normalises only known area labels and aliases %s / %s",
    (city, area, expected) => {
      expect(canonicalArea(city, area)).toBe(expected);
    },
  );

  it.each([
    ["Bologna", ""],
    ["Bologna", "   "],
    ["Bologna", "Centro e dintorni"],
    ["Bologna", "Saragozza / Saffi"],
    ["Bologna", "Arcella"],
    ["Napoli", "Centro"],
  ])(
    "does not infer a zone from an unknown or ambiguous area %s / %s",
    (city, area) => {
      expect(canonicalArea(city, area)).toBeNull();
    },
  );

  it("matches any selected city, applying zones only to that city's choice", () => {
    const preferences = { ...profile, locations };
    expect(locationMatches(preferences, property)).toBe(true);
    expect(
      locationMatches(preferences, { city: "Bologna", area: "Centro" }),
    ).toBe(true);
    expect(
      locationMatches(preferences, { city: "Bologna", area: "Bolognina" }),
    ).toBe(false);
    expect(
      locationMatches(preferences, { city: "Bologna", area: "Zona libera" }),
    ).toBe(false);
    expect(
      locationMatches(preferences, { city: "Padova", area: "Zona libera" }),
    ).toBe(true);
    expect(
      locationMatches(preferences, { city: "Milano", area: "Centro" }),
    ).toBe(false);
  });

  it("explains constrained zones and keeps the existing city criterion", () => {
    const preferences = { ...profile, locations };
    const match = compatibility(preferences, { ...property, area: "CENTRO" });
    expect(match.compatible).toBe(true);
    expect(match.checks.find((check) => check.key === "city")).toMatchObject({
      label: "Città",
      matches: true,
    });
    expect(match.checks.find((check) => check.key === "zone")).toMatchObject({
      label: "Zona",
      matches: true,
      detail: "CENTRO · zone scelte: Centro storico, Saragozza",
    });
    const unknown = compatibility(preferences, {
      ...property,
      area: "Zona libera",
    });
    expect(unknown.compatible).toBe(false);
    expect(
      unknown.checks
        .filter((check) => !check.matches)
        .map((check) => check.key),
    ).toEqual(["zone"]);
    const secondary = compatibility(preferences, {
      ...property,
      city: "Padova",
    });
    expect(secondary.compatible).toBe(true);
    expect(secondary.checks.some((check) => check.key === "zone")).toBe(false);
    expect(
      secondary.checks.find((check) => check.key === "city")?.detail,
    ).toContain("Padova · tutta la città");
    const notSelected = compatibility(preferences, {
      ...property,
      city: "Roma",
    });
    expect(notSelected.compatible).toBe(false);
    expect(
      notSelected.checks
        .filter((check) => !check.matches)
        .map((check) => check.key),
    ).toEqual(["city"]);
    expect(notSelected.checks.some((check) => check.key === "zone")).toBe(
      false,
    );
  });
});
