import { useId, useState } from "react";

export type PropertyPhoto = {
  id: string;
  url: string;
  width: number;
  height: number;
  position?: number;
};
export type SelectedPhoto = {
  id: string;
  file: File;
  url: string;
  error?: string;
};
export const photoLimit = 6;
export const photoSizeLimit = 5 * 1024 * 1024;

export function PhotoEditor({
  photos,
  selected,
  busy,
  error,
  notice,
  onChoose,
  onRemove,
}: {
  photos: PropertyPhoto[];
  selected: SelectedPhoto[];
  busy: boolean;
  error: string;
  notice: string;
  onChoose: (files: File[]) => void;
  onRemove: (id: string, saved: boolean) => void;
}) {
  const id = useId(),
    count = photos.length + selected.length;
  return (
    <fieldset className="form-section photo-editor">
      <legend>
        Foto dell’immobile <span className="optional">facoltative</span>
      </legend>
      <p id={id + "-help"} className="field-hint">
        Fino a 6 foto, massimo 5 MB ciascuna. Formati JPG, PNG e WebP. La prima
        foto è la copertina.
      </p>
      <p className="small-copy">
        Mostra gli ambienti senza persone, documenti o indirizzi precisi. Le
        foto saranno visibili alle persone che ricevono un tuo invito.
      </p>
      <label
        className={
          "photo-picker" + (busy || count >= photoLimit ? " disabled" : "")
        }
      >
        <span aria-hidden="true" className="photo-picker-icon">
          ＋
        </span>
        <strong>Aggiungi foto</strong>
        <span className="small-copy">
          Scegli una o più immagini dal dispositivo
        </span>
        <input
          type="file"
          aria-label="Aggiungi foto"
          aria-describedby={id + "-help"}
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={busy || count >= photoLimit}
          onChange={(event) => {
            onChoose(Array.from(event.currentTarget.files || []));
            event.currentTarget.value = "";
          }}
        />
      </label>
      {error && (
        <p role="alert" className="photo-error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="photo-notice">
          {notice}
        </p>
      )}
      {count > 0 && (
        <>
          <p className="photo-count">
            {count} di {photoLimit} foto
          </p>
          <div className="photo-grid">
            {[
              ...photos.map((photo) => ({ ...photo, saved: true, error: "" })),
              ...selected.map((photo) => ({ ...photo, saved: false })),
            ].map((photo, index) => (
              <figure className="photo-tile" key={photo.id}>
                <img src={photo.url} alt={`Foto ${index + 1} dell’immobile`} />
                <figcaption>
                  <strong>
                    {index === 0 ? "Copertina" : `Foto ${index + 1}`}
                  </strong>
                  <span>
                    {photo.saved
                      ? "Salvata"
                      : photo.error
                        ? "Da riprovare"
                        : "Da caricare"}
                  </span>
                  {photo.error && (
                    <small className="photo-error">{photo.error}</small>
                  )}
                  <button
                    type="button"
                    className="text-link danger-text"
                    aria-label={`Rimuovi foto ${index + 1}`}
                    disabled={busy}
                    onClick={() => onRemove(photo.id, photo.saved)}
                  >
                    Rimuovi
                  </button>
                </figcaption>
              </figure>
            ))}
          </div>
        </>
      )}
    </fieldset>
  );
}

export function PropertyCover({ property }: { property: any }) {
  const photo: PropertyPhoto | undefined = property.photos?.[0];
  return photo ? (
    <div className="property-art has-photo">
      <img
        src={photo.url}
        alt={`Copertina di ${property.title}`}
        loading="lazy"
      />
      {property.photos.length > 1 && (
        <span className="photo-cover-count">{property.photos.length} foto</span>
      )}
    </div>
  ) : (
    <div className="property-art" aria-hidden="true">
      <span className="building">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="property-art-text">{property.city}</span>
    </div>
  );
}

export function PropertyGallery({
  photos = [],
  title,
}: {
  photos?: PropertyPhoto[];
  title: string;
}) {
  const [active, setActive] = useState(0),
    photo = photos[active] || photos[0];
  if (!photo) return null;
  return (
    <div className="property-gallery">
      <img
        className="gallery-main"
        src={photo.url}
        alt={`Foto ${Math.min(active, photos.length - 1) + 1} di ${title}`}
        loading="lazy"
      />
      {photos.length > 1 && (
        <div className="gallery-thumbnails" aria-label="Foto dell’immobile">
          {photos.map((item, index) => (
            <button
              type="button"
              key={item.id}
              aria-label={`Visualizza foto ${index + 1} di ${title}`}
              aria-pressed={photo.id === item.id}
              onClick={() => setActive(index)}
            >
              <img src={item.url} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
