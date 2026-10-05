import {
  accessibilityNeeds,
  accessibilityNeedLabel,
  frequentHousingNeeds,
  housingNeeds,
  housingNeedGroups,
  housingNeedLabel,
  type AccessibilityNeed,
  type HousingNeed,
} from "./profile-details.js";

type SpecificHousingNeed = Exclude<HousingNeed, "outdoor_space">;

const specificHousingNeeds = housingNeeds.filter(
  (need): need is SpecificHousingNeed => need !== "outdoor_space",
);

export const propertyAmenities = [
  ...specificHousingNeeds,
  ...accessibilityNeeds,
] as const;

export type PropertyAmenity = (typeof propertyAmenities)[number];
export type PropertyAmenitiesDetails = {
  amenities?: PropertyAmenity[];
  amenities_details?: string;
};

export const frequentPropertyAmenities = frequentHousingNeeds;

export const propertyAmenityGroups: readonly {
  label: string;
  amenities: readonly PropertyAmenity[];
}[] = [
  ...housingNeedGroups.map((group) => ({
    label: group.label,
    amenities: (group.needs as readonly HousingNeed[]).filter(
      (need): need is SpecificHousingNeed => need !== "outdoor_space",
    ),
  })),
  { label: "Accessibilità", amenities: accessibilityNeeds },
];

const accessibilitySet = new Set<PropertyAmenity>(accessibilityNeeds);

export function propertyAmenityLabel(value: PropertyAmenity) {
  return accessibilitySet.has(value)
    ? accessibilityNeedLabel(value as AccessibilityNeed)
    : housingNeedLabel(value as SpecificHousingNeed);
}

// These phrases describe concrete home features. Generic "accessible" and a
// generic garden do not establish any particular accessibility or garden type.
const phrases: Record<PropertyAmenity, RegExp> = {
  elevator: /\bascensor[ei]\b/,
  parking:
    /\bpost[oi]\s+auto\b|\bparcheggi[oa]\s+(?:privat[oa]|riservat[oa]|inclus[oa])\b/,
  balcony: /\bbalcon[ei]\b/,
  terrace: /\bterraz(?:zo|zi|za|ze)\b/,
  private_garden: /\bgiardin[oi]\s+(?:privat[oi]|esclusiv[oi])\b/,
  shared_garden: /\bgiardin[oi]\s+(?:condominial[ei]|comun[ei]|condivis[oi])\b/,
  garage:
    /\bgarage\b|\bbox(?:\s+auto)?\b(?![\s\u2010-\u2015-]+(?:(?:di|della?|per(?:\s+la)?)\s+)?doccia\b)/,
  bicycle_space:
    /\b(?:spazio|posto|deposito|ricovero)\s+(?:per\s+)?(?:biciclette|bici)\b/,
  air_conditioning:
    /\baria\s+condizionata\b|\bclimatizzator[ei]\b|\bcondizionator[ei]\b/,
  independent_heating: /\briscaldamento\s+autonomo\b|\btermoautonom[oa]\b/,
  double_glazing: /\b(?:doppi\s+vetri|vetri\s+doppi)\b/,
  fiber_internet: /\bfibra(?:\s+ottica)?\b(?!\s+di\s+vetro\b)/,
  cellar: /\bcantin[ae]\b/,
  storage_room: /\bripostigli[oi]\b/,
  separate_kitchen: /\bcucina\s+abitabile\b/,
  workspace:
    /\bstudio\b|\b(?:spazio|angolo|stanza)\s+per\s+(?:lavorare|studiare)\b/,
  washing_machine: /\blavatric[ei]\b/,
  dishwasher: /\blavastoviglie\b/,
  security_door: /\bporta\s+blindata\b/,
  video_intercom: /\bvideocitofon[oi]\b|\bvideo\s+citofon[oi]\b/,
  built_in_wardrobes: /\barmad(?:io|i)\s+a\s+muro\b/,
  step_free_entry: /\b(?:ingresso|entrata|accesso)\s+senza\s+gradini\b/,
  step_free_home:
    /\b(?:casa|appartamento|abitazione)\s+senza\s+scale\s+interne\b/,
  wheelchair_lift:
    /\bascensore\s+(?:adatto|accessibile)\s+(?:a|per)\s+(?:(?:una|la)\s+)?(?:sedia\s+a\s+rotelle|carrozzina)\b/,
  wide_doorways: /\bporte\s+e\s+passaggi\s+(?:ampi|larghi)\b/,
  accessible_bathroom: /\bbagno\s+accessibile\b/,
  step_free_shower: /\bdoccia\s+senza\s+(?:gradino|gradini)\b/,
};

const unavailable =
  /\b(?:non|no|nessun[oaie]?|senza|manca|mancano|mancante|mancanti|mancanza|assente|assenti|assenza|sprovvist[oaie]|priv[oaie]|indisponibil[ei]|esclus[oaie]|rott[oaie]|guast[oaie])\b/;
const unconfirmed =
  /\b(?:predisposizione|predispost[oaie]|installabile|installazione|installare|possibil[ei]|possibilita|eventuale|eventuali|futuro|futura|futuri|future|potrebbe|potrebbero|potra|potranno|puo|possono|verra|verranno|previst[oaie]|progett[oaie])\b/;
const confirmed =
  /^(?:con|dotat[oa]|provvist[oa]|include|inclus[oa]|dispone\s+di|presente|presenti)\b|\b(?:presente|presenti|inclus[oaie]|funzionante|funzionanti|disponibile|disponibili)\b/;

function isUnavailable(text: string) {
  // "Without steps" is the affirmative feature itself, not an absence of it.
  const context = text.replace(
    /\bsenza\s+(?:gradini|gradino|scale\s+interne)\b/g,
    "",
  );
  return unavailable.test(context) || unconfirmed.test(context);
}

/**
 * Explicit, local suggestions for the owner's review. Never changes saved
 * values, invents health facts, or infers furnishing from description text.
 */
export function suggestPropertyAmenities(text: string): PropertyAmenity[] {
  const normalized = text
    .replace(/\b(?:https?:\/\/|www\.)\S+/gi, " ")
    .replace(/\b[^\s@]+@[^\s@]+\b/g, " ")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[’']/g, " ");
  const suggestions = new Set<PropertyAmenity>();

  for (const sentence of normalized.split(/[.!?;\r\n]+/)) {
    let inheritedAbsence = false;
    let previous = new Set<PropertyAmenity>();
    const sentenceSuggestions = new Set<PropertyAmenity>();
    const parts = sentence.split(
      /(,|\b(?:ma|pero|tuttavia|invece|bensi)\b|\b(?:e|ed)\s+(?=con\b|dotat[oa]\b|provvist[oa]\b))/,
    );
    for (const [index, rawPart] of parts.entries()) {
      if (index % 2 === 1) {
        if (rawPart !== ",") inheritedAbsence = false;
        continue;
      }
      const part = rawPart.replace(/\s+/g, " ").trim();
      if (!part) continue;
      const candidates = propertyAmenities.filter((amenity) =>
        phrases[amenity].test(part),
      );
      const denied = isUnavailable(part);
      const affirmed = !denied && confirmed.test(part);
      if (affirmed) inheritedAbsence = false;
      if (denied) {
        // A trailing qualifier such as "but not working" applies to the
        // preceding feature, even if its name is not repeated.
        for (const amenity of candidates.length ? candidates : previous)
          sentenceSuggestions.delete(amenity);
        inheritedAbsence = true;
      } else if (!inheritedAbsence) {
        for (const amenity of candidates) sentenceSuggestions.add(amenity);
      }
      if (candidates.length) previous = new Set(candidates);
    }
    for (const amenity of sentenceSuggestions) suggestions.add(amenity);
  }
  return propertyAmenities.filter((amenity) => suggestions.has(amenity));
}
