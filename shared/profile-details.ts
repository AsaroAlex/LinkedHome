export const petsOptions = [
  "unspecified",
  "none",
  "dog",
  "cat",
  "other",
  "multiple",
] as const;

export const furnishingPreferences = [
  "any",
  "furnished",
  "unfurnished",
  "partly_furnished",
] as const;

export const housingNeeds = ["elevator", "outdoor_space", "parking"] as const;

export type Pets = (typeof petsOptions)[number];
export type FurnishingPreference = (typeof furnishingPreferences)[number];
export type HousingNeed = (typeof housingNeeds)[number];
export type ProfileDetails = {
  pets: Pets;
  pets_details: string;
  furnishing_preference: FurnishingPreference;
  housing_needs: HousingNeed[];
  about: string;
};

const petLabels = {
  unspecified: "Da indicare",
  none: "Nessun animale",
  dog: "Un cane",
  cat: "Un gatto",
  other: "Un altro animale",
  multiple: "Più animali",
};

const furnishingLabels = {
  any: "Sono flessibile",
  furnished: "Arredata",
  unfurnished: "Non arredata",
  partly_furnished: "Parzialmente arredata",
};

const housingLabels = {
  elevator: "Ascensore",
  outdoor_space: "Balcone, terrazzo o giardino",
  parking: "Posto auto",
};

export function petsLabel(value?: Pets) {
  return petLabels[value || "unspecified"];
}

export function furnishingPreferenceLabel(value?: FurnishingPreference) {
  return furnishingLabels[value || "any"];
}

export function housingNeedLabel(value: HousingNeed) {
  return housingLabels[value];
}
