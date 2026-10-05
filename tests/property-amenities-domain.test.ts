import { describe, expect, it } from "vitest";
import { compatibility, propertyInput } from "../server/domain";
import {
  accessibilityNeeds,
  frequentHousingNeeds,
  housingNeeds,
} from "../shared/profile-details";
import {
  frequentPropertyAmenities,
  propertyAmenities,
  propertyAmenityGroups,
  propertyAmenityLabel,
  suggestPropertyAmenities,
  type PropertyAmenity,
} from "../shared/property-amenities";

describe("property feature catalogue", () => {
  it("reuses concrete house preferences and adds functional accessibility facts", () => {
    expect(propertyAmenities).toEqual([
      ...housingNeeds.filter((need) => need !== "outdoor_space"),
      ...accessibilityNeeds,
    ]);
    expect(propertyAmenities).toHaveLength(27);
    expect(new Set(propertyAmenities).size).toBe(27);
    expect(frequentPropertyAmenities).toEqual(frequentHousingNeeds);
    expect(
      new Set([
        ...frequentPropertyAmenities,
        ...propertyAmenityGroups.flatMap((group) => group.amenities),
      ]),
    ).toEqual(new Set(propertyAmenities));
  });

  it.each(propertyAmenities)(
    "recognizes the common Italian label for %s",
    (amenity) => {
      expect(suggestPropertyAmenities(propertyAmenityLabel(amenity))).toContain(
        amenity,
      );
    },
  );

  it("returns unique suggestions in catalogue order", () => {
    const text = "Lavatrice, balcone, ascensore e balcone. Lavatrice inclusa.";
    expect(suggestPropertyAmenities(text)).toEqual([
      "elevator",
      "balcony",
      "washing_machine",
    ]);
    expect(suggestPropertyAmenities(text)).toEqual(
      suggestPropertyAmenities(text),
    );
    expect(
      suggestPropertyAmenities(
        propertyAmenities.map(propertyAmenityLabel).join(". "),
      ),
    ).toEqual([...propertyAmenities]);
  });
});

describe("local feature suggestions for owner review", () => {
  const synonyms: [string, PropertyAmenity[]][] = [
    ["Due balconi e una terrazza", ["balcony", "terrace"]],
    ["Giardino esclusivo", ["private_garden"]],
    ["Giardino condominiale", ["shared_garden"]],
    ["Giardino comune", ["shared_garden"]],
    ["Box auto e posto auto", ["parking", "garage"]],
    ["Box auto", ["garage"]],
    ["Garage", ["garage"]],
    ["Garage e box-doccia", ["garage"]],
    ["Box per la doccia e posto auto", ["parking"]],
    ["Deposito per bici", ["bicycle_space"]],
    ["Climatizzatore", ["air_conditioning"]],
    ["Condizionatori", ["air_conditioning"]],
    ["Appartamento termoautonomo", ["independent_heating"]],
    ["Vetri doppi", ["double_glazing"]],
    ["Connessione in fibra", ["fiber_internet"]],
    ["Studio", ["workspace"]],
    ["Angolo per studiare", ["workspace"]],
    [
      "Video citofono e armadio a muro",
      ["video_intercom", "built_in_wardrobes"],
    ],
    ["Accesso senza gradini", ["step_free_entry"]],
    ["Appartamento senza scale interne", ["step_free_home"]],
    ["Ascensore adatto per una carrozzina", ["elevator", "wheelchair_lift"]],
    ["Porte e passaggi larghi", ["wide_doorways"]],
    ["Doccia senza gradini", ["step_free_shower"]],
  ];
  it.each(synonyms)("suggests features from %s", (text, expected) => {
    expect(suggestPropertyAmenities(text)).toEqual(expected);
  });

  it.each([
    "Senza ascensore",
    "Non dispone di ascensore",
    "No ascensore",
    "Nessun ascensore",
    "Ascensore assente",
    "Manca l’ascensore",
    "Casa sprovvista di ascensore",
    "Ascensore non funzionante",
    "Ascensore guasto",
    "Ascensore: non funzionante",
    "Ascensore, ma non funzionante",
    "Ascensore, da installare",
    "Ascensore da installare",
    "Predisposizione per ascensore",
    "Ascensore installabile",
    "È possibile aggiungere un ascensore",
    "Si può installare un ascensore",
    "Ascensore previsto in futuro",
    "Ascensore verrà installato",
    "Ascensore potrebbe essere installato",
  ])(
    "does not present an absent or unconfirmed feature as available: %s",
    (text) => {
      expect(suggestPropertyAmenities(text)).toEqual([]);
    },
  );

  it.each([
    ["Senza ascensore, balcone e terrazzo", []],
    ["Non dispone di lavatrice, lavastoviglie o fibra ottica", []],
    [
      "Balcone, ascensore, senza garage; lavatrice inclusa.",
      ["elevator", "balcony", "washing_machine"],
    ],
    ["Senza ascensore, con balcone e terrazzo", ["balcony", "terrace"]],
    ["Senza ascensore ma con balcone", ["balcony"]],
    ["Senza ascensore ma balcone presente", ["balcony"]],
    ["Ascensore non funzionante, ma lavatrice inclusa", ["washing_machine"]],
    ["Senza ascensore ma ascensore presente nel nuovo edificio", ["elevator"]],
    ["Ascensore presente, ma ascensore non funzionante", []],
    [
      "Predisposizione per aria condizionata; lavastoviglie inclusa",
      ["dishwasher"],
    ],
    [
      "Fibra ottica disponibile. Non c’è aria condizionata.",
      ["fiber_internet"],
    ],
    ["Balcone\nSenza ascensore", ["balcony"]],
    ["Senza ascensore\r\nBalcone", ["balcony"]],
    [
      "Casa con balcone e con aria condizionata. Senza ascensore.",
      ["balcony", "air_conditioning"],
    ],
  ] as [string, PropertyAmenity[]][])(
    "keeps negation within its clause and respects affirmative contrasts: %s",
    (text, expected) => {
      expect(suggestPropertyAmenities(text)).toEqual(expected);
    },
  );

  it("keeps the description and the separate feature note independent", () => {
    expect(
      suggestPropertyAmenities(
        "Casa con balcone, aria condizionata e lavatrice. Senza ascensore.\nLavastoviglie, fibra ottica e ingresso senza gradini.",
      ),
    ).toEqual([
      "balcony",
      "air_conditioning",
      "fiber_internet",
      "washing_machine",
      "dishwasher",
      "step_free_entry",
    ]);
  });

  it("recognizes zero-step features without treating them as an absent amenity", () => {
    expect(
      suggestPropertyAmenities(
        "Ingresso senza gradini e casa senza scale interne. Doccia senza gradino. Nessun bagno accessibile.",
      ),
    ).toEqual(["step_free_entry", "step_free_home", "step_free_shower"]);
  });

  it.each([
    "",
    "   ",
    "Casa arredata, luminosa, con animali ammessi",
    "Giardino",
    "Giardino pubblico nelle vicinanze",
    "Casa accessibile",
    "Adatto a persone con mobilità ridotta",
    "Inquilino con disabilità",
    "Box doccia",
    "Box-doccia",
    "Box–doccia",
    "Box per la doccia",
    "Box della doccia",
    "Isolamento in fibra di vetro",
    "Studente universitario e lavoratrice",
    "Mi chiamo Giulia, telefono 000000000, email persona@example.test",
    "Foto https://example.test/ascensore/balcone e ascensore@example.test",
    "Video www.example.test/lavatrice e lavastoviglie@example.test",
  ])(
    "does not invent features from unsupported or personal text: %s",
    (text) => {
      expect(suggestPropertyAmenities(text)).toEqual([]);
    },
  );
});

const property = {
  title: "Casa di prova",
  city: "Bologna" as const,
  area: "Saragozza",
  description: "Immobile sintetico per verificare le dotazioni.",
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

describe("property feature schema", () => {
  it("preserves legacy omitted fields and distinguishes explicit clearing", () => {
    expect(propertyInput.parse(property)).toEqual(property);
    expect(
      propertyInput.parse({
        ...property,
        amenities: [],
        amenities_details: "",
      }),
    ).toMatchObject({ amenities: [], amenities_details: "" });
  });

  it("accepts all known features and the note length boundary", () => {
    expect(
      propertyInput.parse({
        ...property,
        amenities: [...propertyAmenities],
        amenities_details: ` ${"a".repeat(600)} `,
      }),
    ).toMatchObject({
      amenities: [...propertyAmenities],
      amenities_details: "a".repeat(600),
    });
  });

  it("accepts useful newlines in a trimmed note", () => {
    expect(
      propertyInput.parse({
        ...property,
        amenities_details: "  Lavatrice.\nLavastoviglie.  ",
      }).amenities_details,
    ).toBe("Lavatrice.\nLavastoviglie.");
  });

  it.each([
    { amenities: ["elevator", "elevator"] },
    { amenities: ["outdoor_space"] },
    { amenities: ["medical_certificate"] },
    { amenities: ["pool"] },
    { amenities: null },
    { amenities: "elevator" },
    { amenities: Array(28).fill("elevator") },
    { amenities_details: "a".repeat(601) },
    { amenities_details: null },
    { amenities_details: 123 },
    { amenities_details: "Nota\u0000privata" },
    { amenities_details: "Nota\u007fprivata" },
    { amenities_details: "Nota\u0085privata" },
  ])("rejects invalid features or notes %j", (details) => {
    expect(propertyInput.safeParse({ ...property, ...details }).success).toBe(
      false,
    );
  });

  it("does not add a compatibility criterion from declared home features", () => {
    const profile = {
      city: "Bologna" as const,
      budget: 1100,
      move_in: "2026-12-01",
      duration: 12,
      occupants: 2,
    };
    expect(
      compatibility(
        profile,
        propertyInput.parse({
          ...property,
          amenities: [...propertyAmenities],
          amenities_details: "Dotazioni di prova.",
        }),
      ),
    ).toEqual(compatibility(profile, property));
  });
});
