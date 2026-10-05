import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { api } from "./api";
import {
  ProfileAvatar,
  ProfilePhotoEditor,
  type ProfilePhoto,
} from "./ProfilePhoto";

export type HouseholdMember = {
  id: string;
  display_name: string;
  photo: ProfilePhoto | null;
};
export type ProfileHousehold = {
  mode: "group" | "individual";
  members: HouseholdMember[];
};
const emptyHousehold: ProfileHousehold = { mode: "group", members: [] };
const memberLimit = 11;

function MemberEditor({
  member,
  onSaved,
  onPhotoEditing,
}: {
  member: HouseholdMember;
  onSaved: () => void;
  onPhotoEditing: (id: string, editing: boolean) => void;
}) {
  const labelId = useId();
  const [name, setName] = useState(member.display_name);
  const [busy, setBusy] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(false);
  const working = useRef(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const editingListener = useRef(onPhotoEditing);
  editingListener.current = onPhotoEditing;
  useEffect(() => setName(member.display_name), [member.display_name]);
  useEffect(() => {
    editingListener.current(
      member.id,
      editingPhoto || busy || name.trim() !== member.display_name,
    );
  }, [member.id, editingPhoto, busy, name, member.display_name]);
  useEffect(() => () => editingListener.current(member.id, false), [member.id]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (working.current) return;
    working.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api(`/profile/members/${member.id}`, "PUT", {
        display_name: name.trim(),
      });
      setNotice("Nome salvato.");
      onSaved();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Nome non salvato. Riprova.",
      );
    } finally {
      working.current = false;
      setBusy(false);
    }
  }
  async function remove() {
    if (working.current || editingPhoto) return;
    working.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api(`/profile/members/${member.id}`, "DELETE");
      onSaved();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Persona non rimossa. Riprova.",
      );
    } finally {
      working.current = false;
      setBusy(false);
    }
  }
  return (
    <section className="household-member" aria-labelledby={`${labelId}-title`}>
      <div className="panel-title">
        <h3 id={`${labelId}-title`}>{member.display_name}</h3>
        <button
          type="button"
          className="text-link"
          disabled={busy || editingPhoto}
          onClick={remove}
        >
          Rimuovi persona
        </button>
      </div>
      <form className="household-name-form" onSubmit={save}>
        <div className="field">
          <label htmlFor={labelId}>Nome da mostrare</label>
          <input
            id={labelId}
            value={name}
            maxLength={80}
            required
            disabled={busy}
            onChange={(event) => setName(event.currentTarget.value)}
          />
        </div>
        {name.trim() !== member.display_name && (
          <>
            <button type="submit" className="button secondary" disabled={busy}>
              {busy ? "Salvataggio…" : "Salva nome"}
            </button>
            <button
              type="button"
              className="text-link"
              disabled={busy}
              onClick={() => {
                setName(member.display_name);
                setError("");
                setNotice("");
              }}
            >
              Annulla modifiche al nome
            </button>
          </>
        )}
      </form>
      <ProfilePhotoEditor
        initialPhoto={member.photo}
        onSaved={onSaved}
        endpoint={`/profile/members/${member.id}/photo`}
        title={`Foto di ${member.display_name}`}
        headingLevel={4}
        embedded
        disabled={busy}
        description="Puoi aggiungere la foto adesso o in un secondo momento."
        onEditingChange={(editing) => {
          setEditingPhoto(editing);
        }}
      />
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
    </section>
  );
}

export function ProfileHouseholdEditor({
  household = emptyHousehold,
  photo,
  occupants = 1,
  onSaved,
}: {
  household?: ProfileHousehold;
  photo?: ProfilePhoto | null;
  occupants?: number;
  onSaved: () => void;
}) {
  const labelId = useId();
  const [mode, setMode] = useState(household.mode);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingPhotos, setEditingPhotos] = useState<Set<string>>(new Set());
  const working = useRef(false);
  const newMemberId = useRef<string | null>(null);
  useEffect(() => setMode(household.mode), [household.mode]);
  const photoPending = editingPhotos.size > 0;
  function onPhotoEditing(id: string, editing: boolean) {
    setEditingPhotos((previous) => {
      if (previous.has(id) === editing) return previous;
      const next = new Set(previous);
      if (editing) next.add(id);
      else next.delete(id);
      return next;
    });
  }
  async function chooseMode(next: ProfileHousehold["mode"]) {
    if (next === mode || working.current || photoPending) return;
    working.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api("/profile/household", "PUT", { mode: next });
      setMode(next);
      setNotice(
        photo
          ? "La foto principale è stata mantenuta: puoi cambiarla per la nuova opzione."
          : "Scelta salvata.",
      );
      onSaved();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Scelta non salvata. Riprova.",
      );
    } finally {
      working.current = false;
      setBusy(false);
    }
  }
  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (working.current) return;
    working.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    newMemberId.current ||= crypto.randomUUID();
    try {
      await api("/profile/members", "POST", {
        id: newMemberId.current,
        display_name: name.trim(),
      });
      newMemberId.current = null;
      setName("");
      setNotice("Persona aggiunta. Ora puoi caricare la sua foto.");
      onSaved();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Persona non aggiunta. Riprova.",
      );
    } finally {
      working.current = false;
      setBusy(false);
    }
  }
  return (
    <section
      className="panel household-panel"
      aria-labelledby={`${labelId}-title`}
    >
      <div className="panel-title">
        <h2 id={`${labelId}-title`}>Foto del profilo</h2>
        <span className="profile-photo-optional">Facoltative</span>
      </div>
      <p className="small-copy">
        Cerchi casa da solo, in coppia o con coinquilini? Scegli come
        presentarvi.
      </p>
      <fieldset className="household-choice" disabled={busy || photoPending}>
        <legend>Come vuoi aggiungere le foto?</legend>
        <div className="household-modes">
          <label className={mode === "group" ? "selected" : ""}>
            <input
              type="radio"
              name={`${labelId}-mode`}
              aria-labelledby={`${labelId}-group-title`}
              aria-describedby={`${labelId}-group-description`}
              checked={mode === "group"}
              onChange={() => chooseMode("group")}
            />
            <span>
              <strong id={`${labelId}-group-title`}>Una sola foto</strong>
              <small id={`${labelId}-group-description`}>
                Tua o di tutto il gruppo
              </small>
            </span>
          </label>
          <label className={mode === "individual" ? "selected" : ""}>
            <input
              type="radio"
              name={`${labelId}-mode`}
              aria-labelledby={`${labelId}-individual-title`}
              aria-describedby={`${labelId}-individual-description`}
              checked={mode === "individual"}
              onChange={() => chooseMode("individual")}
            />
            <span>
              <strong id={`${labelId}-individual-title`}>
                Una foto per persona
              </strong>
              <small id={`${labelId}-individual-description`}>
                Per coppie o coinquilini
              </small>
            </span>
          </label>
        </div>
      </fieldset>
      <p className="field-hint">
        Nomi e foto saranno visibili solo ai proprietari con cui apri una
        conversazione. Puoi modificarli o rimuoverli quando vuoi.
      </p>
      {photoPending && (
        <p className="field-hint">
          Salva o annulla le foto e i nomi in modifica prima di cambiare
          opzione.
        </p>
      )}
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
      <ProfilePhotoEditor
        initialPhoto={photo}
        onSaved={onSaved}
        embedded
        headingLevel={3}
        disabled={busy}
        title={
          mode === "group" && occupants > 1 ? "Foto del gruppo" : "La tua foto"
        }
        description={
          mode === "group"
            ? "Puoi usare una tua foto o una foto insieme alle persone con cui cerchi casa."
            : "Questa è la foto collegata al tuo account. Aggiungi qui sotto le altre persone."
        }
        onEditingChange={(editing) => onPhotoEditing("primary", editing)}
      />
      {mode === "individual" ? (
        <div className="household-people">
          <h3>Con chi cerchi casa?</h3>
          <p className="small-copy">
            Aggiungi il nome e, se vuoi, una foto di ogni persona. Usa nomi e
            foto degli altri solo se sono d’accordo.
          </p>
          {household.members.map((member) => (
            <MemberEditor
              key={member.id}
              member={member}
              onSaved={onSaved}
              onPhotoEditing={onPhotoEditing}
            />
          ))}
          {household.members.length < memberLimit ? (
            <form
              className="household-name-form household-add-form"
              onSubmit={add}
            >
              <div className="field">
                <label htmlFor={`${labelId}-name`}>Nome della persona</label>
                <input
                  id={`${labelId}-name`}
                  value={name}
                  maxLength={80}
                  required
                  disabled={busy}
                  autoComplete="off"
                  placeholder="Es. Alessio"
                  onChange={(event) => setName(event.currentTarget.value)}
                />
              </div>
              <button
                type="submit"
                className="button secondary"
                disabled={busy}
              >
                {busy ? "Salvataggio…" : "Aggiungi persona"}
              </button>
            </form>
          ) : (
            <p className="field-hint">
              Hai aggiunto tutte le 11 persone disponibili oltre a te.
            </p>
          )}
          {household.members.length > 0 && (
            <p className="field-hint">
              Tu + {household.members.length}{" "}
              {household.members.length === 1
                ? "persona aggiunta"
                : "persone aggiunte"}
              . Nel numero totale di persone, conta anche chi non ha una foto.
            </p>
          )}
          {household.members.length + 1 > occupants && (
            <p className="draft-notice">
              Nelle preferenze hai indicato {occupants}{" "}
              {occupants === 1 ? "persona" : "persone"}. Aggiorna il numero
              totale per includere tutti quelli che abiteranno in casa.
            </p>
          )}
        </div>
      ) : household.members.length > 0 ? (
        <p className="field-hint">
          Le schede personali sono conservate e non vengono condivise mentre
          scegli una sola foto. Ritrovale selezionando “Una foto per persona”.
        </p>
      ) : null}
    </section>
  );
}

export function HouseholdSummary({
  household,
}: {
  household?: ProfileHousehold | null;
}) {
  if (household?.mode !== "individual" || !household.members.length)
    return null;
  return (
    <section className="household-summary">
      <h3>Chi abiterà in casa</h3>
      <p className="small-copy">
        Le altre persone che cercano casa con il titolare del profilo.
      </p>
      <ul>
        {household.members.map((member) => (
          <li key={member.id}>
            <ProfileAvatar photo={member.photo} name={member.display_name} />
            <strong>{member.display_name}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
