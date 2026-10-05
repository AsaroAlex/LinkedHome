import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  centsToEuros,
  documentKinds,
  documentKindLabels,
  euroToCents,
  formatIncomeCents,
  incomeComparison,
  incomeDossierInput,
  incomeMonthLabel,
  incomePersonInput,
  incomeReviewInput,
  incomeSources,
  incomeTotals,
  sourceLabels,
  type IncomePerson,
} from "../shared/income-dossier";

const person = {
  id: "abcdefab-cdef-4abc-8def-123456789abc",
  label: "Persona di prova",
  source: "employment" as const,
  monthly_net_cents: 200_000,
  period_from: "2026-07",
  period_to: "2026-09",
};
const dossier = {
  tenants: [person],
  guarantor: null,
  people_permission: true,
  expected_revision: null,
};
const review = {
  person_id: person.id,
  document_id: "00000000-0000-4000-8000-000000000099",
  revision: 1,
  observed_net_cents: 195_050,
  period_from: "2026-07",
  period_to: "2026-09",
  confirm: true,
};
const anotherPerson = (index: number): IncomePerson => ({
  ...person,
  id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-05T12:00:00.000Z"));
});
afterEach(() => vi.useRealTimers());

describe("income people and declared-source semantics", () => {
  it.each(incomeSources)("accepts the declared source %s", (source) => {
    const amount =
      source === "no_income" ? 0 : source === "not_specified" ? null : 200_000;
    expect(
      incomePersonInput.parse({ ...person, source, monthly_net_cents: amount }),
    ).toMatchObject({
      source,
      monthly_net_cents: amount,
    });
    expect(sourceLabels[source]).toBeTruthy();
  });

  it("distinguishes zero income from an amount not indicated", () => {
    expect(
      incomePersonInput.parse({
        ...person,
        source: "no_income",
        monthly_net_cents: 0,
      }).monthly_net_cents,
    ).toBe(0);
    expect(
      incomePersonInput.parse({
        ...person,
        source: "not_specified",
        monthly_net_cents: null,
      }).monthly_net_cents,
    ).toBeNull();
    expect(
      incomePersonInput.parse({ ...person, monthly_net_cents: null })
        .monthly_net_cents,
    ).toBeNull();
  });

  it("accepts whole cents and trims the holder's person label", () => {
    expect(
      incomePersonInput.parse({
        ...person,
        label: "  Persona di prova  ",
        monthly_net_cents: 200_001,
      }),
    ).toMatchObject({ label: "Persona di prova", monthly_net_cents: 200_001 });
    expect(
      incomePersonInput.safeParse({
        ...person,
        label: "ab",
        monthly_net_cents: 0,
      }).success,
    ).toBe(true);
    expect(
      incomePersonInput.safeParse({
        ...person,
        label: "a".repeat(60),
        monthly_net_cents: 10_000_000,
      }).success,
    ).toBe(true);
  });

  it("canonicalizes person and review UUIDs so route lookups retain the same identity", () => {
    expect(
      incomePersonInput.parse({ ...person, id: person.id.toUpperCase() }).id,
    ).toBe(person.id);
    expect(
      incomeDossierInput.parse({
        ...dossier,
        tenants: [{ ...person, id: person.id.toUpperCase() }],
      }).tenants[0].id,
    ).toBe(person.id);
    expect(
      incomeReviewInput.parse({
        ...review,
        person_id: person.id.toUpperCase(),
        document_id: person.id.toUpperCase(),
      }),
    ).toMatchObject({ person_id: person.id, document_id: person.id });
  });

  it.each([
    { label: "a" },
    { label: "a".repeat(61) },
    { label: "   " },
    { id: "not-a-uuid" },
    { source: "certified" },
    { source: "no_income", monthly_net_cents: null },
    { source: "no_income", monthly_net_cents: 1 },
    { source: "not_specified", monthly_net_cents: 0 },
    { source: "not_specified", monthly_net_cents: 200_000 },
    { monthly_net_cents: -1 },
    { monthly_net_cents: 10_000_001 },
    { monthly_net_cents: 0.5 },
    { monthly_net_cents: "200000" },
    { monthly_net_cents: Infinity },
    { monthly_net_cents: NaN },
    { verified: true },
    { employer_name: "Datore di prova" },
  ])("rejects malformed or unsupported person data %j", (change) => {
    expect(incomePersonInput.safeParse({ ...person, ...change }).success).toBe(
      false,
    );
  });
});

describe("documented month ranges", () => {
  it.each([
    ["2026-10", "2026-10"],
    ["2025-12", "2026-01"],
    ["2024-11", "2026-10"],
    ["2024-01", "2025-12"],
    ["1900-01", "1900-01"],
  ])("accepts the inclusive month range %s–%s", (period_from, period_to) => {
    expect(
      incomePersonInput.safeParse({ ...person, period_from, period_to })
        .success,
    ).toBe(true);
    expect(
      incomeReviewInput.safeParse({ ...review, period_from, period_to })
        .success,
    ).toBe(true);
  });

  it.each([
    ["2026-09", "2026-08"],
    ["2024-10", "2026-10"],
    ["2026-10", "2026-11"],
    ["2026-11", "2026-11"],
    ["2026-00", "2026-09"],
    ["2026-13", "2026-09"],
    ["2026-07-01", "2026-09"],
    ["2026-7", "2026-09"],
    ["July", "2026-09"],
    ["0000-01", "0000-02"],
    ["1899-01", "1899-12"],
  ])(
    "rejects the invalid month range %s–%s for declaration and review",
    (period_from, period_to) => {
      expect(
        incomePersonInput.safeParse({ ...person, period_from, period_to })
          .success,
      ).toBe(false);
      expect(
        incomeReviewInput.safeParse({ ...review, period_from, period_to })
          .success,
      ).toBe(false);
    },
  );

  it("uses the current UTC month at validation time rather than module load", () => {
    vi.setSystemTime(new Date("2026-10-31T23:59:59.000Z"));
    const november = {
      ...person,
      period_from: "2026-11",
      period_to: "2026-11",
    };
    expect(incomePersonInput.safeParse(november).success).toBe(false);
    vi.setSystemTime(new Date("2026-11-01T00:00:00.000Z"));
    expect(incomePersonInput.safeParse(november).success).toBe(true);
  });
});

describe("private dossier input and concurrency", () => {
  it("requires explicit permission and a creation or update revision", () => {
    expect(incomeDossierInput.parse(dossier)).toEqual(dossier);
    expect(
      incomeDossierInput.parse({ ...dossier, expected_revision: 8 })
        .expected_revision,
    ).toBe(8);
  });

  it("accepts 12 distinct tenants and a separate guarantor", () => {
    const input = {
      ...dossier,
      tenants: Array.from({ length: 12 }, (_, index) =>
        anotherPerson(index + 1),
      ),
      guarantor: anotherPerson(99),
    };
    expect(incomeDossierInput.parse(input)).toEqual(input);
  });

  it.each([
    { tenants: [] },
    {
      tenants: Array.from({ length: 13 }, (_, index) =>
        anotherPerson(index + 1),
      ),
    },
    { tenants: [person, person] },
    { tenants: [person, { ...person, id: person.id.toUpperCase() }] },
    { guarantor: person },
    { guarantor: { ...person, id: person.id.toUpperCase() } },
    { people_permission: false },
    { people_permission: "true" },
    { expected_revision: 0 },
    { expected_revision: -1 },
    { expected_revision: 1.5 },
    { expected_revision: "1" },
    { verified: true },
  ])("rejects malformed dossier updates %j", (change) => {
    expect(
      incomeDossierInput.safeParse({ ...dossier, ...change }).success,
    ).toBe(false);
  });

  it.each(["guarantor", "people_permission", "expected_revision"] as const)(
    "requires the explicit input field %s",
    (field) => {
      const { [field]: _omitted, ...input } = dossier;
      expect(incomeDossierInput.safeParse(input).success).toBe(false);
    },
  );
});

describe("manual document review input", () => {
  it("accepts a confirmed document reading without replacing the declaration", () => {
    expect(incomeReviewInput.parse(review)).toEqual(review);
    expect(
      incomeReviewInput.safeParse({ ...review, observed_net_cents: 0 }).success,
    ).toBe(true);
    expect(
      incomeReviewInput.safeParse({ ...review, observed_net_cents: 10_000_000 })
        .success,
    ).toBe(true);
    expect(person.monthly_net_cents).toBe(200_000);
    for (const kind of documentKinds)
      expect(documentKindLabels[kind]).toBeTruthy();
  });

  it.each([
    { person_id: "invalid" },
    { document_id: "invalid" },
    { revision: 0 },
    { revision: 1.5 },
    { observed_net_cents: null },
    { observed_net_cents: -1 },
    { observed_net_cents: 10_000_001 },
    { observed_net_cents: 12.5 },
    { confirm: false },
    { confirm: "true" },
    { method: "independent_verification" },
    { verified: true },
  ])("rejects an invalid or client-promoted review %j", (change) => {
    expect(incomeReviewInput.safeParse({ ...review, ...change }).success).toBe(
      false,
    );
  });
});

describe("income totals and neutral rent comparison", () => {
  it("sums whole cents and includes a known zero as declared", () => {
    expect(
      incomeTotals([
        { monthly_net_cents: 200_001 },
        { monthly_net_cents: 100_050 },
        { monthly_net_cents: 0 },
      ]),
    ).toEqual({
      declared_total_cents: 300_051,
      declared_count: 3,
      total_count: 3,
      complete: true,
    });
  });

  it("reports partial coverage without inventing an unknown amount", () => {
    const totals = incomeTotals([
      { monthly_net_cents: 200_000 },
      { monthly_net_cents: null },
    ]);
    expect(totals).toEqual({
      declared_total_cents: 200_000,
      declared_count: 1,
      total_count: 2,
      complete: false,
    });
    expect(incomeComparison(totals, 1000)).toBeNull();
  });

  it("does not count a guarantor or a document reading as tenant income", () => {
    const input = incomeDossierInput.parse({
      ...dossier,
      guarantor: { ...anotherPerson(99), monthly_net_cents: 900_000 },
    });
    expect(incomeTotals(input.tenants).declared_total_cents).toBe(200_000);
    incomeReviewInput.parse(review);
    expect(incomeTotals(input.tenants).declared_total_cents).toBe(200_000);
    expect(
      incomeComparison(incomeTotals(input.tenants), 500)?.percent_of_income,
    ).toBe(25);
  });

  it.each([
    { tenants: [] },
    { tenants: [{ monthly_net_cents: 0 }] },
    { tenants: [{ monthly_net_cents: null }] },
  ])("does not divide by zero or an unavailable total: %j", ({ tenants }) => {
    const totals = incomeTotals(tenants);
    expect(totals.declared_total_cents).toBe(0);
    expect(incomeComparison(totals, 1000)).toBeNull();
  });

  it("supports the bounded 12-person total without losing cents", () => {
    expect(
      incomeTotals(Array(12).fill({ monthly_net_cents: 10_000_000 })),
    ).toEqual({
      declared_total_cents: 120_000_000,
      declared_count: 12,
      total_count: 12,
      complete: true,
    });
  });

  it("compares against the supplied offer cost and rounds to one decimal", () => {
    const totals = incomeTotals([{ monthly_net_cents: 300_000 }]);
    expect(incomeComparison(totals, 1000)).toEqual({
      rent: 1000,
      declared_total_cents: 300_000,
      percent_of_income: 33.3,
    });
    expect(incomeComparison(totals, 800)?.percent_of_income).toBe(26.7);
    expect(incomeComparison(totals, 0)?.percent_of_income).toBe(0);
    expect(incomeComparison(totals, 6000)?.percent_of_income).toBe(200);
    expect(Object.keys(incomeComparison(totals, 1000)!)).toEqual([
      "rent",
      "declared_total_cents",
      "percent_of_income",
    ]);
  });

  it.each([NaN, Infinity, -1])(
    "does not calculate a percentage for invalid rent %s",
    (rent) => {
      expect(incomeComparison(incomeTotals([person]), rent)).toBeNull();
    },
  );

  it.each([NaN, Infinity, 0.5])(
    "does not calculate a percentage from invalid stored cents %s",
    (declared_total_cents) => {
      const totals = { ...incomeTotals([person]), declared_total_cents };
      expect(incomeComparison(totals, 1000)).toBeNull();
    },
  );
});

describe("euro input conversion and labels", () => {
  it.each([
    ["0", 0],
    ["0,01", 1],
    ["0.10", 10],
    ["2500,50", 250_050],
    [" 2500.50 ", 250_050],
    [1.01, 101],
    [0.29, 29],
    [100_000, 10_000_000],
  ] as const)("converts %s euros into exact integer cents", (euros, cents) => {
    expect(euroToCents(euros)).toBe(cents);
    expect(centsToEuros(cents)).toBe(
      Number(String(euros).trim().replace(",", ".")),
    );
  });

  it.each([
    "",
    "  ",
    "-1",
    "1.005",
    "1,005",
    "1e3",
    "2.500,50",
    "100000.01",
    "NaN",
    NaN,
    Infinity,
  ])(
    "rejects an empty, malformed, overprecise or excessive euro amount %s",
    (euros) => expect(euroToCents(euros)).toBeNull(),
  );

  it("formats money and valid Italian months without exposing another source", () => {
    expect(formatIncomeCents(200_050)).toBe("2.000,50 €");
    expect(incomeMonthLabel("2026-09")).toBe("settembre 2026");
    expect(incomeMonthLabel("2026-13")).toBe("");
    expect(incomeMonthLabel("not-a-month")).toBe("");
  });
});
