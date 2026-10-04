import { useEffect, useId, useRef, useState } from "react";
import { api } from "./api";
import { photoSizeLimit } from "./PropertyPhotos";

export type ProfilePhoto = {
  id: string;
  url: string;
  width: number;
  height: number;
};

export function ProfileAvatar({
  photo,
  name,
}: {
  photo?: ProfilePhoto | null;
  name?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [photo?.url]);
  return (
    <span className="profile-avatar">
      {photo && !failed ? (
        <img
          src={photo.url}
          alt={name ? `Foto di ${name}` : "La tua foto del profilo"}
          width={photo.width}
          height={photo.height}
          onError={() => setFailed(true)}
        />
      ) : (
        <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <circle
            cx="32"
            cy="24"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            d="M13 54c0-12 8-19 19-19s19 7 19 19"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      )}
    </span>
  );
}

export function ProfilePhotoEditor({
  initialPhoto,
  onSaved,
}: {
  initialPhoto?: ProfilePhoto | null;
  onSaved: () => void;
}) {
  const inputId = useId();
  const [photo, setPhoto] = useState(initialPhoto ?? null);
  const [selected, setSelected] = useState<{
    id: string;
    file: File;
    url: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const working = useRef(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => setPhoto(initialPhoto ?? null), [initialPhoto?.id]);
  useEffect(() => {
    const url = selected?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [selected?.url]);

  function choose(file?: File) {
    if (!file || working.current) return;
    setError("");
    setNotice("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Scegli una foto in formato JPG, PNG o WebP.");
      return;
    }
    if (file.size > photoSizeLimit || file.size === 0) {
      setError(
        file.size === 0
          ? "Il file è vuoto. Scegli un’altra foto."
          : "La foto supera 5 MB. Scegli un file più piccolo.",
      );
      return;
    }
    setSelected({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
    });
  }

  async function save() {
    if (!selected || working.current) return;
    working.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    const body = new FormData();
    body.append("photo", selected.file);
    try {
      const result = await api<{ photo: ProfilePhoto }>(
        "/profile/photo",
        "POST",
        body,
        { "Idempotency-Key": selected.id },
      );
      setPhoto(result.photo);
      setSelected(null);
      setNotice("Foto salvata.");
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Foto non salvata. Riprova.");
    } finally {
      working.current = false;
      setBusy(false);
    }
  }

  async function remove() {
    if (!photo || working.current) return;
    working.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api("/profile/photo", "DELETE");
      setPhoto(null);
      setSelected(null);
      setNotice("Foto rimossa.");
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Foto non rimossa. Riprova.");
    } finally {
      working.current = false;
      setBusy(false);
    }
  }

  return (
    <section
      className="panel profile-photo-panel"
      aria-labelledby={`${inputId}-title`}
    >
      <div className="profile-photo-preview">
        <ProfileAvatar
          photo={
            selected
              ? { id: selected.id, url: selected.url, width: 128, height: 128 }
              : photo
          }
        />
        <span className="small-copy">
          {selected
            ? "Anteprima · da salvare"
            : photo
              ? "Foto salvata"
              : "Nessuna foto"}
        </span>
      </div>
      <div className="profile-photo-controls">
        <div className="panel-title">
          <h2 id={`${inputId}-title`}>Foto del profilo</h2>
          <span className="profile-photo-optional">Facoltativa</span>
        </div>
        <p className="small-copy" id={`${inputId}-help`}>
          La foto sarà visibile ai proprietari con cui apri una conversazione.
          Puoi cambiarla o rimuoverla quando vuoi.
        </p>
        <div className="actions wrap">
          <label
            className={`button secondary profile-photo-picker${busy ? " disabled" : ""}`}
            htmlFor={inputId}
          >
            {photo || selected ? "Cambia foto" : "Scegli una foto"}
            <input
              id={inputId}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={busy}
              aria-describedby={`${inputId}-help ${inputId}-formats`}
              onChange={(event) => {
                choose(event.currentTarget.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
          </label>
          {selected ? (
            <>
              <button
                type="button"
                className="button"
                disabled={busy}
                onClick={save}
              >
                {busy ? "Caricamento…" : "Salva foto"}
              </button>
              <button
                type="button"
                className="text-link"
                disabled={busy}
                onClick={() => {
                  setSelected(null);
                  setError("");
                  setNotice("");
                }}
              >
                Annulla
              </button>
            </>
          ) : photo ? (
            <button
              type="button"
              className="text-link"
              disabled={busy}
              onClick={remove}
            >
              {busy ? "Rimozione…" : "Rimuovi foto"}
            </button>
          ) : null}
        </div>
        <p className="field-hint" id={`${inputId}-formats`}>
          JPG, PNG o WebP · massimo 5 MB
        </p>
        {error && (
          <p className="photo-error" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="photo-notice" role="status">
            {notice}
          </p>
        )}
      </div>
    </section>
  );
}
