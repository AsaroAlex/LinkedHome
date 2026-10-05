import { useId, useState } from "react";
import {
  addressLabel,
  type AddressVisibility,
  type PropertyAddress,
} from "../shared/property-address";
import "./property-address.css";

function AddressIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function PropertyAddressFields({
  property,
}: {
  property?: Partial<PropertyAddress> | null;
}) {
  const id = useId();
  const [street, setStreet] = useState(property?.street || "");
  const [streetNumber, setStreetNumber] = useState(
    property?.street_number || "",
  );
  const [visibility, setVisibility] = useState<AddressVisibility>(
    property?.address_visibility === "exact" ? "exact" : "area",
  );
  const exact = visibility === "exact";
  const preview = addressLabel({
    street,
    street_number: streetNumber,
    address_visibility: visibility,
  });

  return (
    <div className="property-address-fields">
      <div className="property-address-inputs">
        <div className="field">
          <div className="field-label">
            <label htmlFor={`${id}-street`}>Via o piazza</label>
            {exact && (
              <span className="required-mark" aria-hidden="true">
                {" "}
                *
              </span>
            )}
          </div>
          <input
            id={`${id}-street`}
            name="street"
            type="text"
            value={street}
            onChange={(event) => setStreet(event.currentTarget.value)}
            required={exact}
            minLength={2}
            maxLength={120}
            placeholder="Es. Via Saragozza"
            aria-describedby={`${id}-visibility-help`}
          />
        </div>
        <div className="field">
          <div className="field-label">
            <label htmlFor={`${id}-number`}>Numero civico</label>
            {exact && (
              <span className="required-mark" aria-hidden="true">
                {" "}
                *
              </span>
            )}
          </div>
          <input
            id={`${id}-number`}
            name="street_number"
            type="text"
            value={streetNumber}
            onChange={(event) => setStreetNumber(event.currentTarget.value)}
            required={exact}
            maxLength={20}
            placeholder="Es. 12/A"
            aria-describedby={`${id}-visibility-help`}
          />
        </div>
      </div>
      <fieldset className="property-address-visibility">
        <legend>Quale indirizzo vuoi mostrare?</legend>
        <p className="field-hint" id={`${id}-visibility-help`}>
          Città e quartiere sono sempre visibili. Con Solo quartiere, via e
          civico restano privati. Scegli Indirizzo completo per mostrarli a chi
          inviti.
        </p>
        <div className="property-address-choices">
          <label>
            <input
              type="radio"
              name="address_visibility"
              value="area"
              checked={!exact}
              onChange={() => setVisibility("area")}
              aria-labelledby={`${id}-area-label`}
              aria-describedby={`${id}-area-help`}
            />
            <span className="property-address-choice-text">
              <span id={`${id}-area-label`}>Solo quartiere</span>
              <small id={`${id}-area-help`}>
                Condividi la zona dell’immobile
              </small>
            </span>
          </label>
          <label>
            <input
              type="radio"
              name="address_visibility"
              value="exact"
              checked={exact}
              onChange={() => setVisibility("exact")}
              aria-labelledby={`${id}-exact-label`}
              aria-describedby={`${id}-exact-help`}
            />
            <span className="property-address-choice-text">
              <span id={`${id}-exact-label`}>Indirizzo completo</span>
              <small id={`${id}-exact-help`}>
                Condividi anche via e numero civico
              </small>
            </span>
          </label>
        </div>
      </fieldset>
      <div className="property-address-preview">
        <span className="property-address-preview-icon">
          <AddressIcon />
        </span>
        <div>
          <span className="property-address-preview-label">
            Negli inviti mostri
          </span>
          <p>
            {exact
              ? preview ||
                "Completa via e numero civico per mostrare l’indirizzo."
              : "La città e il quartiere"}
          </p>
        </div>
      </div>
      <p className="field-hint property-address-history-hint">
        Gli inviti accettati conservano l’indirizzo dell’offerta originale. Se
        scegli Solo quartiere, lo nascondi anche nelle conversazioni già aperte.
      </p>
    </div>
  );
}

export function PropertyAddressSummary({
  property,
  owner = false,
}: {
  property?: Partial<PropertyAddress> | null;
  owner?: boolean;
}) {
  if (!property) return null;
  const publicLabel = addressLabel(property);
  const label = owner
    ? [property.street?.trim(), property.street_number?.trim()]
        .filter(Boolean)
        .join(" ")
    : publicLabel;
  if (!owner && !label) return null;

  return (
    <div className="property-address-summary">
      {label && (
        <p className="property-address-value">
          <AddressIcon />
          <span>{label}</span>
        </p>
      )}
      {owner && (
        <p className="property-address-summary-visibility">
          {publicLabel
            ? "Mostri l’indirizzo completo"
            : "Mostri solo il quartiere"}
        </p>
      )}
    </div>
  );
}
