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

export const housingNeeds = [
  "elevator",
  "outdoor_space",
  "parking",
  "balcony",
  "terrace",
  "private_garden",
  "shared_garden",
  "garage",
  "bicycle_space",
  "air_conditioning",
  "independent_heating",
  "double_glazing",
  "fiber_internet",
  "cellar",
  "storage_room",
  "separate_kitchen",
  "workspace",
  "washing_machine",
  "dishwasher",
  "security_door",
  "video_intercom",
  "built_in_wardrobes",
] as const;

export const accessibilityNeeds = [
  "step_free_entry",
  "step_free_home",
  "wheelchair_lift",
  "wide_doorways",
  "accessible_bathroom",
  "step_free_shower",
] as const;

export type Pets = (typeof petsOptions)[number];
export type FurnishingPreference = (typeof furnishingPreferences)[number];
export type HousingNeed = (typeof housingNeeds)[number];
export type AccessibilityNeed = (typeof accessibilityNeeds)[number];

export const frequentHousingNeeds = [
  "elevator",
  "balcony",
  "terrace",
  "parking",
  "air_conditioning",
  "private_garden",
] as const satisfies readonly HousingNeed[];

export const housingNeedGroups = [
  {
    label: "Spazi esterni",
    needs: [
      "balcony",
      "terrace",
      "private_garden",
      "shared_garden",
      "outdoor_space",
    ],
  },
  {
    label: "Parcheggio",
    needs: ["parking", "garage", "bicycle_space"],
  },
  {
    label: "Comfort",
    needs: [
      "air_conditioning",
      "independent_heating",
      "double_glazing",
      "fiber_internet",
    ],
  },
  {
    label: "Spazi interni",
    needs: [
      "cellar",
      "storage_room",
      "separate_kitchen",
      "workspace",
      "built_in_wardrobes",
    ],
  },
  {
    label: "Elettrodomestici",
    needs: ["washing_machine", "dishwasher"],
  },
  {
    label: "Sicurezza",
    needs: ["security_door", "video_intercom"],
  },
] as const satisfies readonly {
  label: string;
  needs: readonly HousingNeed[];
}[];

export type ProfileDetails = {
  pets: Pets;
  pets_details: string;
  furnishing_preference: FurnishingPreference;
  housing_needs: HousingNeed[];
  accessibility_needs: AccessibilityNeed[];
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
  balcony: "Balcone",
  terrace: "Terrazzo",
  private_garden: "Giardino privato",
  shared_garden: "Giardino condominiale",
  garage: "Box o garage",
  bicycle_space: "Spazio per biciclette",
  air_conditioning: "Aria condizionata",
  independent_heating: "Riscaldamento autonomo",
  double_glazing: "Doppi vetri",
  fiber_internet: "Fibra ottica",
  cellar: "Cantina",
  storage_room: "Ripostiglio",
  separate_kitchen: "Cucina abitabile",
  workspace: "Spazio per lavorare o studiare",
  washing_machine: "Lavatrice",
  dishwasher: "Lavastoviglie",
  security_door: "Porta blindata",
  video_intercom: "Videocitofono",
  built_in_wardrobes: "Armadi a muro",
};

const accessibilityLabels = {
  step_free_entry: "Ingresso senza gradini",
  step_free_home: "Casa senza scale interne",
  wheelchair_lift: "Ascensore adatto a una sedia a rotelle",
  wide_doorways: "Porte e passaggi ampi",
  accessible_bathroom: "Bagno accessibile",
  step_free_shower: "Doccia senza gradino",
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

export function accessibilityNeedLabel(value: AccessibilityNeed) {
  return accessibilityLabels[value];
}
