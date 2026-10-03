import { z } from "zod";
export const cities = [
  "Bologna",
  "Milano",
  "Roma",
  "Torino",
  "Firenze",
  "Padova",
] as const;
export const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => {
    const d = new Date(v);
    return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === v;
  }, "Data non valida");
export const profileInput = z
  .object({
    city: z.enum(cities),
    budget: z.number().int().min(100).max(20000),
    move_in: day,
    duration: z.number().int().min(1).max(120),
    occupants: z.number().int().min(1).max(12),
  })
  .strict();
export const propertyInput = z
  .object({
    title: z.string().trim().min(5).max(100),
    city: z.enum(cities),
    area: z.string().trim().min(2).max(60),
    description: z.string().trim().min(10).max(1500),
    rent: z.number().int().min(100).max(20000),
    available_from: day,
    min_months: z.number().int().min(1).max(120),
    max_months: z.number().int().min(1).max(120),
    capacity: z.number().int().min(1).max(12),
    sqm: z.number().int().min(10).max(2000),
    rooms: z.number().int().min(1).max(20),
    furnished: z.boolean(),
    authority_attested: z.boolean(),
  })
  .strict()
  .refine(
    (p) => p.max_months >= p.min_months,
    "Durata massima inferiore alla minima",
  );
export type Profile = z.infer<typeof profileInput>;
export type Property = z.infer<typeof propertyInput>;
export function compatibility(profile: Profile, property: Property) {
  const checks = [
    {
      key: "city",
      label: "Città",
      matches: profile.city === property.city,
      detail: `${profile.city} · ${property.city}`,
    },
    {
      key: "budget",
      label: "Costo mensile totale",
      matches: property.rent <= profile.budget,
      detail: `€${property.rent} · budget fino a €${profile.budget}`,
    },
    {
      key: "date",
      label: "Ingresso",
      matches: property.available_from <= profile.move_in,
      detail: `Disponibile dal ${property.available_from} · ingresso ${profile.move_in}`,
    },
    {
      key: "duration",
      label: "Durata",
      matches:
        profile.duration >= property.min_months &&
        profile.duration <= property.max_months,
      detail: `${profile.duration} mesi · offerta ${property.min_months}–${property.max_months}`,
    },
    {
      key: "occupants",
      label: "Persone",
      matches: profile.occupants <= property.capacity,
      detail: `${profile.occupants} · capienza ${property.capacity}`,
    },
  ];
  return { compatible: checks.every((c) => c.matches), checks };
}
export function verificationState(
  v: { status: string; expires_at: string | Date | null },
  now = new Date(),
) {
  return v.status === "VERIFIED" &&
    (!v.expires_at || new Date(v.expires_at) <= now)
    ? "EXPIRED"
    : v.status;
}
export class Problem extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code = "invalid_request",
  ) {
    super(message);
  }
}
export function requireThat(
  value: unknown,
  message: string,
  status = 409,
): asserts value {
  if (!value) throw new Problem(status, message);
}
