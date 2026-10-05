export const contractPreferences = [
  "any",
  "four_plus_four",
  "three_plus_two",
  "student",
  "transitory",
] as const;

export const contractTypes = [
  "unspecified",
  "four_plus_four",
  "three_plus_two",
  "student",
  "transitory",
] as const;

export type ContractPreference = (typeof contractPreferences)[number];
export type ContractType = (typeof contractTypes)[number];

export function durationRequired(preference?: ContractPreference) {
  return preference !== "four_plus_four" && preference !== "three_plus_two";
}

const labels = {
  any: "Sono flessibile",
  unspecified: "Da concordare",
  four_plus_four: "4+4 · canone libero",
  three_plus_two: "3+2 · canone concordato",
  student: "Studenti universitari",
  transitory: "Transitorio",
};

export function contractPreferenceLabel(value?: ContractPreference) {
  return labels[value || "any"];
}

export function contractTypeLabel(value?: ContractType) {
  return labels[value || "unspecified"];
}

export function contractHint(value?: ContractPreference | ContractType) {
  switch (value) {
    case "four_plus_four":
      return "Durata iniziale di 4 anni, con rinnovo di altri 4 anni.";
    case "three_plus_two":
      return "Durata iniziale di 3 anni, con rinnovo di altri 2 anni. Il canone segue gli accordi locali.";
    case "student":
      return "Per studenti universitari fuori sede, da 6 a 36 mesi.";
    case "transitory":
      return "Per un’esigenza temporanea, fino a 18 mesi.";
    case "unspecified":
      return "Se hai già scelto una formula, indicala per trovare chi cerca quel contratto.";
    default:
      return "Valuta tutte le formule, poi scegli con il proprietario.";
  }
}

export function contractMatches(
  preference?: ContractPreference,
  type?: ContractType,
) {
  return !preference || preference === "any" || preference === type;
}
