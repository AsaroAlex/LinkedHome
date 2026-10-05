import { z } from "zod";

export const incomeSources = [
  "employment",
  "self_employment",
  "pension",
  "support",
  "mixed",
  "other",
  "no_income",
  "not_specified",
] as const;
export type IncomeSource = (typeof incomeSources)[number];
export const sourceLabels: Record<IncomeSource, string> = {
  employment: "Lavoro dipendente",
  self_employment: "Lavoro autonomo",
  pension: "Pensione",
  support: "Sostegno economico",
  mixed: "Più fonti di reddito",
  other: "Altre entrate",
  no_income: "Nessuna entrata",
  not_specified: "Non indicato",
};

export const documentKinds = [
  "payslip",
  "pension",
  "tax_return",
  "other",
] as const;
export type IncomeDocumentKind = (typeof documentKinds)[number];
export const documentKindLabels: Record<IncomeDocumentKind, string> = {
  payslip: "Busta paga",
  pension: "Pensione",
  tax_return: "Dichiarazione dei redditi",
  other: "Altra prova del reddito",
};

const monthlyNetCents = z.number().int().min(0).max(10_000_000);
const uuid = z
  .string()
  .uuid()
  .transform((value) => value.toLowerCase());
const month = z
  .string()
  .regex(/^\d{4}-(?:0[1-9]|1[0-2])$/, "Scegli un mese valido.")
  .refine(
    (value) => Number(value.slice(0, 4)) >= 1900,
    "Scegli un anno dal 1900 in poi.",
  );

function validatePeriod(
  value: { period_from: string; period_to: string },
  context: z.RefinementCtx,
) {
  if (
    !month.safeParse(value.period_from).success ||
    !month.safeParse(value.period_to).success
  )
    return;
  const now = new Date();
  const currentMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  for (const field of ["period_from", "period_to"] as const)
    if (value[field] > currentMonth)
      context.addIssue({
        code: "custom",
        path: [field],
        message: "Il periodo non può includere mesi futuri.",
      });
  if (value.period_to < value.period_from) {
    context.addIssue({
      code: "custom",
      path: ["period_to"],
      message: "Il mese finale deve essere uguale o successivo al primo.",
    });
    return;
  }
  const [startYear, startMonth] = value.period_from.split("-").map(Number);
  const [endYear, endMonth] = value.period_to.split("-").map(Number);
  if ((endYear - startYear) * 12 + endMonth - startMonth >= 24)
    context.addIssue({
      code: "custom",
      path: ["period_to"],
      message: "Indica un periodo di massimo 24 mesi.",
    });
}

export const incomePersonInput = z
  .object({
    id: uuid,
    label: z.string().trim().min(2).max(60),
    source: z.enum(incomeSources),
    monthly_net_cents: monthlyNetCents.nullable(),
    period_from: month,
    period_to: month,
  })
  .strict()
  .superRefine((person, context) => {
    validatePeriod(person, context);
    if (person.source === "no_income" && person.monthly_net_cents !== 0)
      context.addIssue({
        code: "custom",
        path: ["monthly_net_cents"],
        message: "Se non ci sono entrate, indica zero.",
      });
    if (person.source === "not_specified" && person.monthly_net_cents !== null)
      context.addIssue({
        code: "custom",
        path: ["monthly_net_cents"],
        message: "Se il reddito non è indicato, lascia vuoto l’importo.",
      });
  });
export type IncomePerson = z.infer<typeof incomePersonInput>;

export const incomeDossierInput = z
  .object({
    tenants: z.array(incomePersonInput).min(1).max(12),
    guarantor: incomePersonInput.nullable(),
    people_permission: z.literal(true),
    expected_revision: z.number().int().positive().nullable(),
  })
  .strict()
  .superRefine((dossier, context) => {
    const ids = new Set<string>();
    for (const [index, person] of dossier.tenants.entries()) {
      const id = person.id.toLowerCase();
      if (ids.has(id))
        context.addIssue({
          code: "custom",
          path: ["tenants", index, "id"],
          message: "Ogni persona deve avere una scheda distinta.",
        });
      ids.add(id);
    }
    if (dossier.guarantor && ids.has(dossier.guarantor.id.toLowerCase()))
      context.addIssue({
        code: "custom",
        path: ["guarantor", "id"],
        message: "Il garante deve essere distinto dagli affittuari.",
      });
  });
export type IncomeDossierInput = z.infer<typeof incomeDossierInput>;

export const incomeReviewInput = z
  .object({
    person_id: uuid,
    document_id: uuid,
    revision: z.number().int().positive(),
    observed_net_cents: monthlyNetCents,
    period_from: month,
    period_to: month,
    confirm: z.literal(true),
  })
  .strict()
  .superRefine(validatePeriod);
export type IncomeReviewInput = z.infer<typeof incomeReviewInput>;

export type IncomeTotals = {
  declared_total_cents: number;
  declared_count: number;
  total_count: number;
  complete: boolean;
};

export function incomeTotals(
  tenants: readonly Pick<IncomePerson, "monthly_net_cents">[],
): IncomeTotals {
  const declared = tenants.filter(
    (person) => person.monthly_net_cents !== null,
  );
  return {
    declared_total_cents: declared.reduce(
      (total, person) => total + person.monthly_net_cents!,
      0,
    ),
    declared_count: declared.length,
    total_count: tenants.length,
    complete: tenants.length > 0 && declared.length === tenants.length,
  };
}

export type IncomeComparison = {
  rent: number;
  declared_total_cents: number;
  percent_of_income: number;
};

export function incomeComparison(
  totals: IncomeTotals,
  rent: number,
): IncomeComparison | null {
  if (
    !totals.complete ||
    !Number.isSafeInteger(totals.declared_total_cents) ||
    totals.declared_total_cents <= 0 ||
    !Number.isFinite(rent) ||
    rent < 0
  )
    return null;
  return {
    rent,
    declared_total_cents: totals.declared_total_cents,
    percent_of_income:
      Math.round(((rent * 10_000) / totals.declared_total_cents) * 10) / 10,
  };
}

/** Convert a nonnegative euro amount with up to two decimals, never via floats. */
export function euroToCents(value: string | number): number | null {
  const text = String(value).trim().replace(",", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) return null;
  const [whole, decimals = ""] = text.split(".");
  const cents = Number(whole) * 100 + Number(decimals.padEnd(2, "0"));
  return Number.isSafeInteger(cents) && cents <= 10_000_000 ? cents : null;
}

export function centsToEuros(cents: number) {
  return cents / 100;
}

const euroFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  useGrouping: "always",
});
export function formatIncomeCents(cents: number) {
  return euroFormatter.format(centsToEuros(cents));
}

const monthFormatter = new Intl.DateTimeFormat("it-IT", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
export function incomeMonthLabel(value: string) {
  if (!month.safeParse(value).success) return "";
  const date = new Date(`${value}-01T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? "" : monthFormatter.format(date);
}
