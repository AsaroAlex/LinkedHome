export const cities = [
  "Bologna",
  "Milano",
  "Roma",
  "Torino",
  "Firenze",
  "Padova",
] as const;

export type City = (typeof cities)[number];
export type SearchLocation = { city: City; areas: string[] };
export type LocationPreferences = {
  city: string;
  locations?: SearchLocation[] | null;
};

// Common neighbourhood names for the current supported cities. This catalogue
// is a list of choices, not a map of administrative boundaries or coverage.
export const cityAreas: Record<City, readonly string[]> = {
  Bologna: [
    "Centro storico",
    "Bolognina",
    "San Donato",
    "San Vitale",
    "Saragozza",
    "Saffi",
    "Murri",
    "Mazzini",
    "Savena",
    "Borgo Panigale",
    "Colli",
  ],
  Milano: [
    "Centro storico",
    "Brera",
    "Porta Venezia",
    "Porta Romana",
    "Navigli",
    "Isola",
    "Città Studi",
    "Lambrate",
    "NoLo",
    "Bicocca",
    "San Siro",
    "Lorenteggio",
    "Affori",
  ],
  Roma: [
    "Centro storico",
    "Prati",
    "Trastevere",
    "Testaccio",
    "San Giovanni",
    "Esquilino",
    "Monti",
    "Nomentano",
    "San Lorenzo",
    "Ostiense",
    "Garbatella",
    "Monteverde",
    "Eur",
    "Tiburtina",
  ],
  Torino: [
    "Centro",
    "Crocetta",
    "San Salvario",
    "Vanchiglia",
    "Aurora",
    "San Donato",
    "Cit Turin",
    "Santa Rita",
    "Lingotto",
    "Mirafiori",
    "Campidoglio",
    "Parella",
    "Barriera di Milano",
  ],
  Firenze: [
    "Centro storico",
    "Oltrarno",
    "San Frediano",
    "Campo di Marte",
    "Coverciano",
    "Novoli",
    "Rifredi",
    "Isolotto",
    "Gavinana",
    "Bellariva",
    "Le Cure",
    "Statuto",
  ],
  Padova: [
    "Centro storico",
    "Arcella",
    "Portello",
    "Santa Rita",
    "Guizza",
    "Sacra Famiglia",
    "San Giuseppe",
    "Chiesanuova",
    "Ponte di Brenta",
    "Forcellini",
    "Mortise",
    "Voltabarozzo",
  ],
};

const aliases: Partial<Record<City, Record<string, readonly string[]>>> = {
  Bologna: { "Centro storico": ["Centro"] },
  Milano: { "Centro storico": ["Centro", "Duomo"] },
  Roma: { "Centro storico": ["Centro"] },
  Torino: { Centro: ["Centro storico"] },
  Firenze: { "Centro storico": ["Centro"] },
  Padova: { "Centro storico": ["Centro"] },
};

function normaliseArea(area: string) {
  return area
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("it-IT");
}

export function areasForCity(city: string): readonly string[] {
  return cities.includes(city as City) ? cityAreas[city as City] : [];
}

export function canonicalArea(city: string, area: string): string | null {
  const normalised = normaliseArea(area);
  if (!normalised) return null;
  return (
    areasForCity(city).find(
      (label) =>
        normaliseArea(label) === normalised ||
        aliases[city as City]?.[label]?.some(
          (alias) => normaliseArea(alias) === normalised,
        ),
    ) || null
  );
}

export function searchLocations(
  profile: LocationPreferences,
): SearchLocation[] {
  return profile.locations?.length
    ? profile.locations
    : [{ city: profile.city as City, areas: [] }];
}

export function locationsLabel(profile: LocationPreferences): string {
  return searchLocations(profile)
    .map(({ city, areas }) =>
      areas.length
        ? `${city}: ${areas.join(", ")}`
        : `${city} · tutta la città`,
    )
    .join("; ");
}

export function locationMatches(
  profile: LocationPreferences,
  property: { city: string; area: string },
): boolean {
  const selected = searchLocations(profile).find(
    (location) => location.city === property.city,
  );
  if (!selected) return false;
  if (!selected.areas.length) return true;
  const area = canonicalArea(property.city, property.area);
  return area !== null && selected.areas.includes(area);
}
