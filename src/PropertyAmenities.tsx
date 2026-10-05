import { useId, useState } from "react";
import {
  frequentPropertyAmenities,
  propertyAmenities,
  propertyAmenityGroups,
  propertyAmenityLabel,
  suggestPropertyAmenities,
  type PropertyAmenitiesDetails,
  type PropertyAmenity,
} from "../shared/property-amenities";
import "./property-amenities.css";

const frequentAmenitySet = new Set<PropertyAmenity>(frequentPropertyAmenities);
const additionalGroups = propertyAmenityGroups
  .map((group) => ({
    ...group,
    amenities: group.amenities.filter(
      (value) => !frequentAmenitySet.has(value),
    ),
  }))
  .filter((group) => group.amenities.length);

function validAmenities(values: unknown): PropertyAmenity[] {
  const selected = new Set(Array.isArray(values) ? values : []);
  return propertyAmenities.filter((value) => selected.has(value));
}

export function PropertyAmenitiesFields({
  property,
  description,
}: {
  property?: Partial<PropertyAmenitiesDetails> | null;
  description: string;
}) {
  const id = useId();
  const [amenities, setAmenities] = useState(() =>
    validAmenities(property?.amenities),
  );
  const [notes, setNotes] = useState(
    typeof property?.amenities_details === "string"
      ? property.amenities_details
      : "",
  );
  const additionalCount = amenities.filter(
    (value) => !frequentAmenitySet.has(value),
  ).length;
  const [moreOpen, setMoreOpen] = useState(additionalCount > 0);
  const [notice, setNotice] = useState("");

  function option(value: PropertyAmenity) {
    return (
      <label key={value}>
        <input
          type="checkbox"
          name="amenities"
          value={value}
          checked={amenities.includes(value)}
          onChange={(event) => {
            const checked = event.currentTarget.checked;
            setAmenities((current) =>
              checked
                ? [...current, value]
                : current.filter((amenity) => amenity !== value),
            );
            setNotice("");
          }}
          aria-describedby={`${id}-help`}
        />
        <span>{propertyAmenityLabel(value)}</span>
      </label>
    );
  }

  function prefill() {
    const suggested = suggestPropertyAmenities(`${description}\n${notes}`);
    const added = suggested.filter(
      (value) => !amenities.includes(value),
    ).length;
    if (suggested.length) {
      setAmenities((current) => validAmenities([...current, ...suggested]));
      if (suggested.some((value) => !frequentAmenitySet.has(value)))
        setMoreOpen(true);
    }
    setNotice(
      (added
        ? added === 1
          ? "Aggiunta 1 dotazione dal testo."
          : `Aggiunte ${added} dotazioni dal testo.`
        : suggested.length
          ? suggested.length === 1
            ? "La dotazione trovata era già selezionata."
            : `Le ${suggested.length} dotazioni trovate erano già selezionate.`
          : "Nessuna dotazione riconosciuta nel testo. Puoi selezionarle qui sopra.") +
        " Controlla le selezioni prima di salvare.",
    );
  }

  return (
    <div className="property-amenities-fields">
      <p className="field-hint" id={`${id}-help`}>
        Seleziona le dotazioni presenti. Saranno visibili a chi riceve un
        invito.
      </p>
      <div className="property-amenities-options property-amenities-frequent">
        {frequentPropertyAmenities.map(option)}
      </div>
      <details
        className="property-amenities-more"
        open={moreOpen}
        onToggle={(event) => setMoreOpen(event.currentTarget.open)}
      >
        <summary>
          <span>Altre dotazioni</span>
          <span className="property-amenities-count">
            {additionalCount
              ? `${additionalCount} selezionate`
              : "Spazi, comfort e accessibilità"}
          </span>
        </summary>
        <div className="property-amenities-groups">
          {additionalGroups.map((group) => (
            <fieldset className="property-amenities-group" key={group.label}>
              <legend>{group.label}</legend>
              <div className="property-amenities-options">
                {group.amenities.map(option)}
              </div>
            </fieldset>
          ))}
        </div>
      </details>
      <div className="field property-amenities-notes-field">
        <label htmlFor={`${id}-notes`}>
          Altre informazioni sulle dotazioni
        </label>
        <textarea
          id={`${id}-notes`}
          name="amenities_details"
          rows={3}
          maxLength={600}
          value={notes}
          onChange={(event) => {
            setNotes(event.currentTarget.value);
            setNotice("");
          }}
          placeholder="Es. Box adatto a un’auto piccola, lavatrice nel ripostiglio"
          aria-describedby={`${id}-notes-help ${id}-notes-count`}
        />
        <small className="input-hint" id={`${id}-notes-help`}>
          Aggiungi i dettagli utili che non trovi nelle opzioni. Saranno
          visibili negli inviti.
        </small>
        <small className="input-hint" id={`${id}-notes-count`}>
          {notes.length} / 600 caratteri
        </small>
      </div>
      <div className="property-amenities-prefill">
        <button
          type="button"
          className="button secondary"
          onClick={prefill}
          aria-describedby={`${id}-prefill-help`}
        >
          Precompila dal testo
        </button>
        <p className="field-hint" id={`${id}-prefill-help`}>
          Usa la descrizione e queste informazioni per selezionare le dotazioni.
          Puoi modificarle prima di salvare.
        </p>
      </div>
      {notice && (
        <p className="property-amenities-notice" role="status">
          {notice}
        </p>
      )}
    </div>
  );
}

export function PropertyAmenitiesSummary({
  property,
}: {
  property?: Partial<PropertyAmenitiesDetails> | null;
}) {
  if (!property) return null;
  const amenities = validAmenities(property.amenities);
  const notes =
    typeof property.amenities_details === "string"
      ? property.amenities_details.trim()
      : "";
  if (!amenities.length && !notes) return null;
  return (
    <div className="property-amenities-summary">
      <h3>Dotazioni dell’immobile</h3>
      {amenities.length > 0 && (
        <ul className="property-amenities-tags">
          {amenities.map((value) => (
            <li key={value}>{propertyAmenityLabel(value)}</li>
          ))}
        </ul>
      )}
      {notes && <p className="property-amenities-notes">{notes}</p>}
    </div>
  );
}
