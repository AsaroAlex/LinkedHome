import { describe, expect, it } from "vitest";
import { compatibility, propertyInput } from "../server/domain";
import {
  addressLabel,
  addressVisibilities,
  publicAddress,
  type PropertyAddress,
} from "../shared/property-address";

const property = {
  title: "Casa di prova",
  city: "Bologna" as const,
  area: "Saragozza",
  description: "Immobile sintetico usato per i test dell’indirizzo.",
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

const profile = {
  city: "Bologna" as const,
  budget: 1100,
  move_in: "2026-12-01",
  duration: 12,
  occupants: 2,
};

describe("optional property address input", () => {
  it("keeps legacy omitted fields absent without transforming the property", () => {
    expect(propertyInput.parse(property)).toEqual(property);
  });

  it.each(addressVisibilities)(
    "accepts visibility %s",
    (address_visibility) => {
      expect(
        propertyInput.parse({
          ...property,
          street: "  Via di prova  ",
          street_number: "  12/A  ",
          address_visibility,
        }),
      ).toMatchObject({
        street: "Via di prova",
        street_number: "12/A",
        address_visibility,
      });
    },
  );

  it.each([
    {},
    { street: "", street_number: "" },
    { street: "   ", street_number: "   " },
    { street: "Via di prova" },
    { street_number: "12/A" },
  ])("allows a partial private address with area visibility %j", (address) => {
    expect(
      propertyInput.safeParse({
        ...property,
        ...address,
        address_visibility: "area",
      }).success,
    ).toBe(true);
  });

  it.each([
    {},
    { street: "Via di prova" },
    { street_number: "12" },
    { street: "", street_number: "12" },
    { street: "Via di prova", street_number: "   " },
  ])("requires a complete address for exact visibility %j", (address) => {
    expect(
      propertyInput.safeParse({
        ...property,
        ...address,
        address_visibility: "exact",
      }).success,
    ).toBe(false);
  });

  it("identifies the missing exact-address fields individually", () => {
    const result = propertyInput.safeParse({
      ...property,
      address_visibility: "exact",
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.map((issue) => issue.path)).toEqual([
        ["street"],
        ["street_number"],
      ]);
  });

  it("accepts documented trimmed length boundaries", () => {
    expect(
      propertyInput.safeParse({
        ...property,
        street: "a".repeat(120),
        street_number: "1".repeat(20),
        address_visibility: "exact",
      }).success,
    ).toBe(true);
    expect(
      propertyInput.safeParse({
        ...property,
        street: "ab",
        street_number: "1",
        address_visibility: "exact",
      }).success,
    ).toBe(true);
  });

  it.each([
    { street: "a" },
    { street: " a " },
    { street: "a".repeat(121) },
    { street: null },
    { street: 12 },
    { street: "Via\nRoma" },
    { street: "\tVia Roma" },
    { street: "Via Roma\r" },
    { street: "Via\u0000Roma" },
    { street: "Via\u0085Roma" },
    { street_number: "1".repeat(21) },
    { street_number: null },
    { street_number: 12 },
    { street_number: "12\nA" },
    { street_number: "12\u007f" },
    { street_number: "\t12" },
    { address_visibility: "public" },
    { address_visibility: null },
  ])("rejects malformed address input %j", (address) => {
    expect(propertyInput.safeParse({ ...property, ...address }).success).toBe(
      false,
    );
  });

  it("continues rejecting reversed rental durations", () => {
    expect(
      propertyInput.safeParse({
        ...property,
        min_months: 18,
        max_months: 6,
        street: "Via di prova",
        street_number: "12",
        address_visibility: "exact",
      }).success,
    ).toBe(false);
  });
});

describe("address redaction for public views", () => {
  const exact = {
    street: "Via di prova",
    street_number: "12/A",
    address_visibility: "exact" as const,
  };

  it("returns only the complete address when explicitly shared", () => {
    expect(publicAddress(exact)).toEqual(exact);
    expect(addressLabel(exact)).toBe("Via di prova 12/A");
  });

  it("trims values when building public address fields and label", () => {
    const padded = {
      ...exact,
      street: " Via di prova ",
      street_number: " 12/A ",
    };
    expect(publicAddress(padded)).toEqual(exact);
    expect(addressLabel(padded)).toBe("Via di prova 12/A");
  });

  const privateProperties: PropertyAddress[] = [
    {},
    { street: "Via di prova", street_number: "12/A" },
    { ...exact, address_visibility: "area" },
    { ...exact, street: "" },
    { ...exact, street: "   " },
    { ...exact, street_number: "" },
    { ...exact, street_number: "   " },
    { address_visibility: "exact", street: "Via di prova" },
    { address_visibility: "exact", street_number: "12/A" },
  ];
  it.each(privateProperties)(
    "redacts private or incomplete addresses %j",
    (address) => {
      expect(publicAddress(address)).toEqual({});
      expect(addressLabel(address)).toBe("");
    },
  );

  it("hides an old shared snapshot when current visibility becomes area", () => {
    expect(publicAddress(exact, { address_visibility: "area" })).toEqual({});
  });

  it("requires an explicit current exact policy", () => {
    expect(publicAddress(exact, {})).toEqual({});
  });

  it("uses only the original snapshot address, never a newer policy address", () => {
    const newer = { ...exact, street: "Via aggiornata", street_number: "99" };
    expect(publicAddress(exact, newer)).toEqual(exact);
    expect(publicAddress({ ...exact, street: "" }, newer)).toEqual({});
    expect(
      publicAddress({ ...exact, address_visibility: "area" }, newer),
    ).toEqual({});
  });

  it("hides shared addresses when access to the view is not allowed", () => {
    expect(publicAddress(exact, exact, false)).toEqual({});
  });

  it.each(["area", "exact"] as const)(
    "does not change compatibility for visibility %s",
    (address_visibility) => {
      const addressed = propertyInput.parse({
        ...property,
        ...exact,
        address_visibility,
      });
      expect(compatibility(profile, addressed)).toEqual(
        compatibility(profile, property),
      );
    },
  );
});
