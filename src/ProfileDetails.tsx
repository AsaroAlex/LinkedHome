import { useId, useState } from "react";
import {
  petsOptions,
  furnishingPreferences,
  accessibilityNeeds,
  frequentHousingNeeds,
  housingNeedGroups,
  petsLabel,
  furnishingPreferenceLabel,
  housingNeedLabel,
  accessibilityNeedLabel,
  type ProfileDetails,
  type Pets,
  type HousingNeed,
  type AccessibilityNeed,
} from "../shared/profile-details";
import "./profile-needs.css";

const frequentNeedSet = new Set<HousingNeed>(frequentHousingNeeds);

export function ProfileDetailsFields({
  profile,
}: {
  profile?: Partial<ProfileDetails> | null;
}) {
  const id = useId();
  const [pets, setPets] = useState<Pets>(profile?.pets || "unspecified");
  const [petDetails, setPetDetails] = useState(profile?.pets_details || "");
  const [about, setAbout] = useState(profile?.about || "");
  const [needs, setNeeds] = useState<HousingNeed[]>(
    profile?.housing_needs || [],
  );
  const [accessNeeds, setAccessNeeds] = useState<AccessibilityNeed[]>(
    profile?.accessibility_needs || [],
  );
  const additionalGroups = housingNeedGroups
    .map((group) => ({
      ...group,
      needs: group.needs.filter((value) => !frequentNeedSet.has(value)),
    }))
    .filter((group) => group.needs.length);
  const additionalCount = needs.filter(
    (value) => !frequentNeedSet.has(value),
  ).length;
  const [moreOpen, setMoreOpen] = useState(additionalCount > 0);
  const [accessOpen, setAccessOpen] = useState(accessNeeds.length > 0);

  function housingOption(value: HousingNeed) {
    return (
      <label key={value}>
        <input
          type="checkbox"
          name="housing_needs"
          value={value}
          checked={needs.includes(value)}
          onChange={(event) => {
            const checked = event.currentTarget.checked;
            setNeeds((current) =>
              checked
                ? [...current, value]
                : current.filter((need) => need !== value),
            );
          }}
          aria-describedby={`${id}-needs-help`}
        />
        <span>{housingNeedLabel(value)}</span>
      </label>
    );
  }
  return (
    <>
      <p className="field-hint">
        Informazioni facoltative per aiutare il proprietario a capire cosa
        cerchi.
      </p>
      <div className="form-grid">
        <div className="field">
          <label htmlFor={`${id}-pets`}>Hai animali domestici?</label>
          <select
            id={`${id}-pets`}
            name="pets"
            value={pets}
            onChange={(event) => setPets(event.currentTarget.value as Pets)}
          >
            {petsOptions.map((value) => (
              <option key={value} value={value}>
                {petsLabel(value)}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${id}-furnishing`}>
            Preferisci una casa arredata?
          </label>
          <select
            id={`${id}-furnishing`}
            name="furnishing_preference"
            defaultValue={profile?.furnishing_preference || "any"}
          >
            {furnishingPreferences.map((value) => (
              <option key={value} value={value}>
                {furnishingPreferenceLabel(value)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <fieldset className="housing-needs profile-housing-needs">
        <legend>Cosa ti serve in casa?</legend>
        <p className="field-hint" id={`${id}-needs-help`}>
          Scegli le caratteristiche che cerchi. Puoi selezionarne più di una.
        </p>
        <div className="housing-needs-options housing-needs-frequent">
          {frequentHousingNeeds.map(housingOption)}
        </div>
        <details
          className="housing-needs-more profile-needs-disclosure"
          open={moreOpen}
          onToggle={(event) => setMoreOpen(event.currentTarget.open)}
        >
          <summary>
            <span>Altre caratteristiche</span>
            <span className="profile-needs-count">
              {additionalCount > 0
                ? `${additionalCount} selezionate`
                : "Spazi, comfort e dotazioni"}
            </span>
          </summary>
          <div className="housing-needs-groups">
            {additionalGroups.map((group) => (
              <fieldset className="housing-needs-group" key={group.label}>
                <legend>{group.label}</legend>
                <div className="housing-needs-options">
                  {group.needs.map(housingOption)}
                </div>
              </fieldset>
            ))}
          </div>
        </details>
      </fieldset>
      <div className="profile-private-details">
        <span className="summary-label">DOPO L’ACCETTAZIONE DELL’INVITO</span>
        <p className="field-hint">
          La presentazione, i dettagli sugli animali e le esigenze di
          accessibilità saranno visibili solo ai proprietari con cui apri una
          conversazione.
        </p>
        <details
          className="profile-accessibility profile-needs-disclosure"
          open={accessOpen}
          onToggle={(event) => setAccessOpen(event.currentTarget.open)}
        >
          <summary>
            <span>Ti serve una casa accessibile?</span>
            <span className="profile-needs-count">
              {accessNeeds.length > 0
                ? `${accessNeeds.length} ${accessNeeds.length === 1 ? "esigenza" : "esigenze"}`
                : "Facoltativo"}
            </span>
          </summary>
          <fieldset className="profile-accessibility-fields">
            <legend>Di cosa hai bisogno per muoverti in casa?</legend>
            <p className="field-hint" id={`${id}-access-help`}>
              Indica solo ciò che ti serve, senza informazioni sulla tua salute.
              Queste scelte restano private fino all’accettazione di un invito.
            </p>
            <div className="profile-accessibility-options">
              {accessibilityNeeds.map((value) => (
                <label key={value}>
                  <input
                    type="checkbox"
                    name="accessibility_needs"
                    value={value}
                    checked={accessNeeds.includes(value)}
                    onChange={(event) => {
                      const checked = event.currentTarget.checked;
                      setAccessNeeds((current) =>
                        checked
                          ? [...current, value]
                          : current.filter((need) => need !== value),
                      );
                    }}
                    aria-describedby={`${id}-access-help`}
                  />
                  <span>{accessibilityNeedLabel(value)}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </details>
        {pets !== "unspecified" && pets !== "none" && (
          <div className="field">
            <label htmlFor={`${id}-pet-details`}>
              Qualche dettaglio sui tuoi animali
            </label>
            <input
              id={`${id}-pet-details`}
              name="pets_details"
              maxLength={200}
              placeholder="Per esempio: un gatto adulto abituato in appartamento"
              value={petDetails}
              onChange={(event) => setPetDetails(event.currentTarget.value)}
              aria-describedby={`${id}-pet-count`}
            />
            <small className="input-hint" id={`${id}-pet-count`}>
              {petDetails.length} / 200 caratteri
            </small>
          </div>
        )}
        <div className="field">
          <label htmlFor={`${id}-about`}>Presentati al proprietario</label>
          <textarea
            id={`${id}-about`}
            name="about"
            rows={3}
            maxLength={600}
            placeholder="Racconta cosa cerchi e perché vuoi trasferirti"
            value={about}
            onChange={(event) => setAbout(event.currentTarget.value)}
            aria-describedby={`${id}-about-count`}
          />
          <small className="input-hint" id={`${id}-about-count`}>
            {about.length} / 600 caratteri
          </small>
        </div>
      </div>
    </>
  );
}

export function ProfileDetailsSummary({
  details,
  personal = false,
}: {
  details?: Partial<ProfileDetails> | null;
  personal?: boolean;
}) {
  if (!details) return null;
  const pets = details.pets && details.pets !== "unspecified";
  const furnishing =
    details.furnishing_preference && details.furnishing_preference !== "any";
  const needs = details.housing_needs || [];
  const petDetails =
    personal && pets && details.pets !== "none" && details.pets_details;
  const about = personal && details.about;
  const accessNeeds = personal ? details.accessibility_needs || [] : [];
  const publicDetails = pets || furnishing || needs.length > 0;
  if (!publicDetails && !petDetails && !about && !accessNeeds.length)
    return null;
  return (
    <div className="profile-details-summary">
      <h3>Informazioni aggiuntive</h3>
      {publicDetails && (
        <ul className="profile-details-tags">
          {pets && <li>Animali: {petsLabel(details.pets)}</li>}
          {furnishing && (
            <li>
              Casa: {furnishingPreferenceLabel(details.furnishing_preference)}
            </li>
          )}
          {needs.map((value) => (
            <li key={value}>{housingNeedLabel(value)}</li>
          ))}
        </ul>
      )}
      {accessNeeds.length > 0 && (
        <div className="profile-accessibility-summary">
          <h4>Accessibilità della casa</h4>
          <ul className="profile-details-tags profile-accessibility-tags">
            {accessNeeds.map((value) => (
              <li key={value}>{accessibilityNeedLabel(value)}</li>
            ))}
          </ul>
        </div>
      )}
      {petDetails && (
        <p className="profile-detail-text">
          <strong>Sugli animali:</strong> {petDetails}
        </p>
      )}
      {about && (
        <p className="profile-detail-text">
          <strong>Presentazione:</strong> {about}
        </p>
      )}
    </div>
  );
}
