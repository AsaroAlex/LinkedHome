import { useId, useState } from "react";
import {
  areasForCity,
  cities,
  searchLocations,
  type City,
  type SearchLocation,
} from "../shared/locations";
import "./locations.css";

type LocationProfile = {
  city?: string;
  locations?: SearchLocation[] | null;
};

function PlaceIcon() {
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

function normalized(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("it-IT");
}

function CityLocation({
  location,
  canRemove,
  onRemove,
  onChange,
}: {
  location: SearchLocation;
  canRemove: boolean;
  onRemove: () => void;
  onChange: (areas: string[]) => void;
}) {
  const id = useId();
  const [chooseAreas, setChooseAreas] = useState(location.areas.length > 0);
  const [query, setQuery] = useState("");
  const availableAreas = areasForCity(location.city);
  const filteredAreas = availableAreas.filter((area) =>
    normalized(area).includes(normalized(query)),
  );
  const count = location.areas.length;

  function toggleArea(area: string, checked: boolean) {
    if (checked && count >= 20) return;
    onChange(
      checked
        ? [...location.areas, area]
        : location.areas.filter((value) => value !== area),
    );
  }

  return (
    <section className="location-city" aria-labelledby={`${id}-title`}>
      <div className="location-city-header">
        <div className="location-city-title">
          <span className="location-place-icon">
            <PlaceIcon />
          </span>
          <h3 id={`${id}-title`}>{location.city}</h3>
        </div>
        <button
          type="button"
          className="location-remove"
          aria-label={`Rimuovi ${location.city}`}
          disabled={!canRemove}
          title={!canRemove ? "Scegli almeno una città" : undefined}
          onClick={onRemove}
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="m5 5 10 10M15 5 5 15"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <span className="location-remove-label">Rimuovi</span>
        </button>
      </div>
      {count > 0 && (
        <ul
          className="location-selected-areas"
          aria-label={`Zone scelte a ${location.city}`}
        >
          {location.areas.map((area) => (
            <li key={area}>{area}</li>
          ))}
        </ul>
      )}
      <details className="location-areas-editor">
        <summary>
          <span>Zone a {location.city}</span>
          <span className="location-area-count">
            {count
              ? `${count} ${count === 1 ? "zona scelta" : "zone scelte"}`
              : "Tutta la città"}
          </span>
        </summary>
        <div className="location-areas-content">
          <fieldset className="location-scope">
            <legend>Dove a {location.city}?</legend>
            <div className="location-scope-options">
              <label>
                <input
                  type="radio"
                  name={`${id}-scope`}
                  value="whole_city"
                  checked={!chooseAreas}
                  onChange={() => {
                    setChooseAreas(false);
                    setQuery("");
                    onChange([]);
                  }}
                />
                Tutta la città
              </label>
              <label>
                <input
                  type="radio"
                  name={`${id}-scope`}
                  value="selected_areas"
                  checked={chooseAreas}
                  onChange={() => setChooseAreas(true)}
                />
                Scegli le zone
              </label>
            </div>
          </fieldset>
          {chooseAreas && (
            <>
              <div className="field location-area-search">
                <label htmlFor={`${id}-search`}>
                  Cerca una zona a {location.city}
                </label>
                <input
                  id={`${id}-search`}
                  type="search"
                  placeholder="Per esempio: Centro"
                  value={query}
                  onChange={(event) => {
                    event.stopPropagation();
                    setQuery(event.currentTarget.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.preventDefault();
                  }}
                />
              </div>
              <div className="location-area-options">
                {filteredAreas.map((area) => (
                  <label key={area}>
                    <input
                      type="checkbox"
                      checked={location.areas.includes(area)}
                      disabled={!location.areas.includes(area) && count >= 20}
                      onChange={(event) =>
                        toggleArea(area, event.currentTarget.checked)
                      }
                    />
                    <span>{area}</span>
                  </label>
                ))}
              </div>
              {!filteredAreas.length && (
                <p className="location-empty">
                  Nessuna zona trovata. Prova un altro nome.
                </p>
              )}
              <p className="field-hint location-area-hint">
                {count >= 20
                  ? "Puoi scegliere al massimo 20 zone per città. Rimuovine una per aggiungerne un’altra."
                  : "Se non scegli nessuna zona, la ricerca include tutta la città."}
              </p>
            </>
          )}
        </div>
      </details>
    </section>
  );
}

export function LocationSelector({
  profile,
  onChange,
}: {
  profile?: LocationProfile | null;
  onChange?: () => void;
}) {
  const id = useId();
  const [locations, setLocations] = useState<SearchLocation[]>(() =>
    searchLocations({
      city: profile?.city || "Bologna",
      locations: profile?.locations,
    }),
  );
  const [cityToAdd, setCityToAdd] = useState<City | "">("");
  const [announcement, setAnnouncement] = useState("");
  const availableCities = cities.filter(
    (city) => !locations.some((value) => value.city === city),
  );

  function update(next: SearchLocation[]) {
    setLocations(next);
    onChange?.();
  }

  function addCity() {
    if (!cityToAdd || !availableCities.includes(cityToAdd)) return;
    update([...locations, { city: cityToAdd, areas: [] }]);
    setAnnouncement(`${cityToAdd} aggiunta alla ricerca.`);
    setCityToAdd("");
  }

  return (
    <fieldset className="location-selector" aria-describedby={`${id}-help`}>
      <legend>
        Dove cerchi casa? <span className="required-mark">*</span>
      </legend>
      <p className="field-hint" id={`${id}-help`}>
        Puoi scegliere più città e le zone di ciascuna. Nessuna zona selezionata
        = tutta la città.
      </p>
      <input
        type="hidden"
        name="city"
        value={locations[0]?.city || "Bologna"}
      />
      <input type="hidden" name="locations" value={JSON.stringify(locations)} />
      <div className="location-cities">
        {locations.map((location) => (
          <CityLocation
            key={location.city}
            location={location}
            canRemove={locations.length > 1}
            onRemove={() => {
              if (locations.length < 2) return;
              update(locations.filter((value) => value.city !== location.city));
              setAnnouncement(`${location.city} rimossa dalla ricerca.`);
            }}
            onChange={(areas) =>
              update(
                locations.map((value) =>
                  value.city === location.city ? { ...value, areas } : value,
                ),
              )
            }
          />
        ))}
      </div>
      {availableCities.length ? (
        <div className="location-add-city">
          <div className="field">
            <label htmlFor={`${id}-add-city`}>Città da aggiungere</label>
            <select
              id={`${id}-add-city`}
              value={cityToAdd}
              onChange={(event) => {
                event.stopPropagation();
                setCityToAdd(event.currentTarget.value as City | "");
              }}
            >
              <option value="">Scegli un’altra città</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="button secondary"
            onClick={addCity}
            disabled={!cityToAdd}
          >
            <span aria-hidden="true">+</span> Aggiungi città
          </button>
        </div>
      ) : (
        <p className="field-hint location-all-cities">
          Hai selezionato tutte le città disponibili.
        </p>
      )}
      <span
        className="location-announcement"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </span>
    </fieldset>
  );
}

export function PropertyAreaSuggestions({
  city,
  id = "property-area-suggestions",
}: {
  city: string;
  id?: string;
}) {
  return (
    <datalist id={id}>
      {areasForCity(city).map((area) => (
        <option key={area} value={area} />
      ))}
    </datalist>
  );
}
