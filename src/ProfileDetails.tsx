import { useId, useState } from "react";
import {
  petsOptions,
  furnishingPreferences,
  housingNeeds,
  petsLabel,
  furnishingPreferenceLabel,
  housingNeedLabel,
  type ProfileDetails,
  type Pets,
} from "../shared/profile-details";

export function ProfileDetailsFields({
  profile,
}: {
  profile?: Partial<ProfileDetails> | null;
}) {
  const id = useId();
  const [pets, setPets] = useState<Pets>(profile?.pets || "unspecified");
  const [petDetails, setPetDetails] = useState(profile?.pets_details || "");
  const [about, setAbout] = useState(profile?.about || "");
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
      <fieldset className="housing-needs">
        <legend>Cosa ti serve in casa?</legend>
        <p className="field-hint" id={`${id}-needs-help`}>
          Puoi scegliere più opzioni. Sono indicazioni per il proprietario.
        </p>
        <div className="housing-needs-options">
          {housingNeeds.map((value) => (
            <label key={value}>
              <input
                type="checkbox"
                name="housing_needs"
                value={value}
                defaultChecked={profile?.housing_needs?.includes(value)}
                aria-describedby={`${id}-needs-help`}
              />
              {housingNeedLabel(value)}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="profile-private-details">
        <span className="summary-label">DOPO L’ACCETTAZIONE DELL’INVITO</span>
        <p className="field-hint">
          La presentazione e i dettagli sugli animali saranno visibili solo ai
          proprietari con cui apri una conversazione.
        </p>
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
  if (!pets && !furnishing && !needs.length && !petDetails && !about)
    return null;
  return (
    <div className="profile-details-summary">
      <h3>Informazioni aggiuntive</h3>
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
