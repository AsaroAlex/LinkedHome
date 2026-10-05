import { z } from "zod";
import { endOfMonth, moveInEnd, moveInLabel } from "../shared/move-in.js";
import {
  contractPreferences,
  contractTypes,
  contractMatches,
  contractPreferenceLabel,
  contractTypeLabel,
  durationRequired,
} from "../shared/contracts.js";
import {
  petsOptions,
  furnishingPreferences,
  housingNeeds,
} from "../shared/profile-details.js";
import {
  cities,
  areasForCity,
  canonicalArea,
  locationsLabel,
  searchLocations,
} from "../shared/locations.js";
export { cities } from "../shared/locations.js";
const searchLocationInput = z
  .object({
    city: z.enum(cities),
    areas: z
      .array(z.string().min(1).max(60))
      .max(20)
      .refine(
        (areas) => new Set(areas).size === areas.length,
        "Scegli ogni zona una sola volta.",
      ),
  })
  .strict()
  .superRefine((location, context) => {
    location.areas.forEach((area, index) => {
      if (!areasForCity(location.city).includes(area))
        context.addIssue({
          code: "custom",
          path: ["areas", index],
          message: "Scegli una delle zone disponibili per questa città.",
        });
    });
  });
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
    locations: z.array(searchLocationInput).min(1).max(6).optional(),
    budget: z.number().int().min(100).max(20000),
    move_in: day,
    move_in_precision: z.enum(["day", "month", "range"]).optional(),
    move_in_end: day.nullable().optional(),
    duration: z.number().int().min(1).max(120).nullable().optional(),
    contract_preference: z.enum(contractPreferences).optional(),
    pets: z.enum(petsOptions).optional(),
    pets_details: z.string().trim().max(200).optional(),
    furnishing_preference: z.enum(furnishingPreferences).optional(),
    housing_needs: z
      .array(z.enum(housingNeeds))
      .max(3)
      .refine(
        (needs) => new Set(needs).size === needs.length,
        "Scegli ogni esigenza una sola volta.",
      )
      .optional(),
    about: z.string().trim().max(600).optional(),
    occupants: z.number().int().min(1).max(12),
  })
  .strict()
  .superRefine((profile, context) => {
    if (profile.locations) {
      if (
        new Set(profile.locations.map((location) => location.city)).size !==
        profile.locations.length
      )
        context.addIssue({
          code: "custom",
          path: ["locations"],
          message: "Scegli ogni città una sola volta.",
        });
      if (profile.locations[0]?.city !== profile.city)
        context.addIssue({
          code: "custom",
          path: ["city"],
          message: "La città principale deve essere la prima città scelta.",
        });
    }
    if (
      durationRequired(profile.contract_preference) &&
      profile.duration == null
    )
      context.addIssue({
        code: "custom",
        path: ["duration"],
        message: "Indica per quanti mesi cerchi casa.",
      });
    if (
      !day.safeParse(profile.move_in).success ||
      (profile.move_in_end && !day.safeParse(profile.move_in_end).success)
    )
      return;
    const precision = profile.move_in_precision || "day";
    if (precision === "day") {
      if (profile.move_in_end && profile.move_in_end !== profile.move_in)
        context.addIssue({
          code: "custom",
          path: ["move_in_end"],
          message: "Per un giorno preciso, la data finale deve coincidere.",
        });
      return;
    }
    if (!profile.move_in.endsWith("-01"))
      context.addIssue({
        code: "custom",
        path: ["move_in"],
        message: "Scegli il mese di ingresso.",
      });
    if (precision === "month") {
      if (
        profile.move_in_end &&
        profile.move_in_end !== endOfMonth(profile.move_in)
      )
        context.addIssue({
          code: "custom",
          path: ["move_in_end"],
          message: "La data finale deve corrispondere alla fine del mese.",
        });
      return;
    }
    if (
      !profile.move_in_end ||
      endOfMonth(profile.move_in_end) !== profile.move_in_end ||
      profile.move_in_end < profile.move_in
    )
      context.addIssue({
        code: "custom",
        path: ["move_in_end"],
        message: "Scegli un mese finale uguale o successivo al mese iniziale.",
      });
  })
  .transform((profile) => ({
    ...profile,
    duration: durationRequired(profile.contract_preference)
      ? profile.duration!
      : null,
    move_in_precision: profile.move_in_precision || ("day" as const),
    move_in_end:
      profile.move_in_precision === "month"
        ? endOfMonth(profile.move_in)
        : profile.move_in_end || profile.move_in,
  }));
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
    contract_type: z.enum(contractTypes).optional(),
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
export type Profile = z.input<typeof profileInput>;
export type Property = z.infer<typeof propertyInput>;
export function compatibility(profile: Profile, property: Property) {
  const locations = searchLocations(profile);
  const selectedLocation = locations.find(
    (location) => location.city === property.city,
  );
  const checks = [
    {
      key: "city",
      label: "Città",
      matches: Boolean(selectedLocation),
      detail:
        locations.length === 1 && !locations[0].areas.length
          ? `${locations[0].city} · ${property.city}`
          : `${locationsLabel(profile)} · immobile a ${property.city}`,
    },
    ...(selectedLocation?.areas.length
      ? [
          {
            key: "zone",
            label: "Zona",
            matches: selectedLocation.areas.includes(
              canonicalArea(property.city, property.area) || "",
            ),
            detail: `${property.area} · zone scelte: ${selectedLocation.areas.join(", ")}`,
          },
        ]
      : []),
    {
      key: "budget",
      label: "Costo mensile totale",
      matches: property.rent <= profile.budget,
      detail: `€${property.rent} · budget fino a €${profile.budget}`,
    },
    {
      key: "date",
      label: "Ingresso",
      matches: property.available_from <= moveInEnd(profile),
      detail: `Disponibile dal ${property.available_from} · ingresso ${
        profile.move_in_precision === "month" ||
        profile.move_in_precision === "range"
          ? moveInLabel(profile)
          : profile.move_in
      }`,
    },
    ...(durationRequired(profile.contract_preference)
      ? [
          {
            key: "duration",
            label: "Permanenza",
            matches:
              typeof profile.duration === "number" &&
              profile.duration >= property.min_months &&
              profile.duration <= property.max_months,
            detail: `${profile.duration} mesi · offerta ${property.min_months}–${property.max_months}`,
          },
        ]
      : []),
    {
      key: "occupants",
      label: "Persone",
      matches: profile.occupants <= property.capacity,
      detail: `${profile.occupants} · capienza ${property.capacity}`,
    },
  ];
  if (
    (profile.contract_preference || "any") !== "any" ||
    (property.contract_type || "unspecified") !== "unspecified"
  )
    checks.push({
      key: "contract",
      label: "Contratto",
      matches: contractMatches(
        profile.contract_preference,
        property.contract_type,
      ),
      detail: `${contractTypeLabel(property.contract_type)} · preferenza: ${contractPreferenceLabel(profile.contract_preference)}`,
    });
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
