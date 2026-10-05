import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { api, ApiError, dateLabel, useLoad } from "./api";
import {
  documentKinds,
  documentKindLabels,
  incomeSources,
  sourceLabels,
  euroToCents,
  centsToEuros,
  formatIncomeCents,
  incomeMonthLabel,
  incomeTotals,
  incomeDossierInput,
  incomeReviewInput,
  type IncomePerson,
  type IncomeDocumentKind,
  type IncomeSource,
  type IncomeTotals,
  type IncomeComparison,
} from "../shared/income-dossier";
import "./income-dossier.css";

type IncomeDocument = {
  id: string;
  person_id: string;
  kind: IncomeDocumentKind;
  mime: string;
  bytes: number;
  created_at: string;
  url: string;
};
type Dossier = {
  id: string;
  revision: number;
  tenants: IncomePerson[];
  guarantor: IncomePerson | null;
  totals: IncomeTotals;
  documents: IncomeDocument[];
  updated_at: string;
  synthetic: boolean;
};
type Share = {
  id: string;
  dossier_id: string;
  revision: number;
  invitation_id: string;
  property_title: string;
  recipient_label: string;
  available: boolean;
  revoked_at: string | null;
};
type Review = {
  id: string;
  person_id: string;
  document_id: string;
  revision: number;
  observed_net_cents: number;
  period_from: string;
  period_to: string;
  reviewed_at: string;
  method: string;
};
type WorkspaceData = { dossier: Dossier | null; shares: Share[] };
type InvitationData = {
  status: "available" | "unavailable";
  dossier: Dossier | null;
  share: Share | null;
  can_share: boolean;
  comparison: IncomeComparison | null;
  reviews: Review[];
};
type PersonDraft = Omit<IncomePerson, "monthly_net_cents"> & { amount: string };

function monthOffset(offset: number) {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1))
    .toISOString()
    .slice(0, 7);
}
function newPerson(label: string): PersonDraft {
  return {
    id: crypto.randomUUID(),
    label,
    source: "not_specified",
    amount: "",
    period_from: monthOffset(-3),
    period_to: monthOffset(-1),
  };
}
function personDraft(person: IncomePerson): PersonDraft {
  const { monthly_net_cents, ...rest } = person;
  return {
    ...rest,
    amount:
      monthly_net_cents === null ? "" : String(centsToEuros(monthly_net_cents)),
  };
}
function personValue(person: PersonDraft): IncomePerson {
  const { amount, ...rest } = person;
  return { ...rest, monthly_net_cents: euroToCents(amount) };
}
function errorText(error: unknown) {
  return error instanceof ApiError && error.details.length
    ? `${error.message} ${error.details.map((detail) => detail.message).join(" ")}`
    : error instanceof Error
      ? error.message
      : "Operazione non riuscita. Riprova.";
}
function Feedback({
  error = "",
  notice = "",
}: {
  error?: string;
  notice?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (error || notice) ref.current?.focus();
  }, [error, notice]);
  return error || notice ? (
    <p
      ref={ref}
      tabIndex={-1}
      role={error ? "alert" : "status"}
      className={`income-dossier-feedback ${error ? "income-dossier-error" : ""}`}
    >
      {error || notice}
    </p>
  ) : null;
}
function SyntheticNotice({ synthetic }: { synthetic?: boolean }) {
  return synthetic ? (
    <p className="synthetic-label">
      Dati e documenti di prova · nessun reddito reale verificato
    </p>
  ) : null;
}
function Totals({
  totals,
  comparison,
  draft = false,
}: {
  totals: IncomeTotals;
  comparison?: IncomeComparison | null;
  draft?: boolean;
}) {
  return (
    <div className="income-dossier-totals">
      <span className="income-dossier-total-label">
        {draft ? "Totale affittuari · da salvare" : "Totale affittuari"}
      </span>
      <strong className="income-dossier-total-value">
        {formatIncomeCents(totals.declared_total_cents)}
        <small> netti / mese</small>
      </strong>
      <p className="income-dossier-coverage">
        {totals.complete
          ? `Importi indicati per ${totals.total_count === 1 ? "l’affittuario" : `tutti i ${totals.total_count} affittuari`}.`
          : `Totale parziale · importi indicati per ${totals.declared_count} su ${totals.total_count} affittuari.`}
      </p>
      <p className="field-hint">L’eventuale garante è escluso dal totale.</p>
      {comparison && (
        <div className="income-dossier-comparison">
          <p>
            Costo dell’offerta:{" "}
            <strong>
              {formatIncomeCents(Math.round(comparison.rent * 100))} / mese
            </strong>
          </p>
          <p>
            Affitto:{" "}
            <strong>
              {comparison.percent_of_income.toLocaleString("it-IT")}% delle
              entrate dichiarate
            </strong>
          </p>
        </div>
      )}
    </div>
  );
}

function PersonFields({
  person,
  title,
  onChange,
  onRemove,
}: {
  person: PersonDraft;
  title: string;
  onChange: (person: PersonDraft) => void;
  onRemove?: () => void;
}) {
  const id = useId();
  function sourceChanged(source: IncomeSource) {
    onChange({
      ...person,
      source,
      amount:
        source === "no_income"
          ? "0"
          : source === "not_specified"
            ? ""
            : person.amount,
    });
  }
  return (
    <>
      <div className="income-person-header">
        <h3>{title}</h3>
        {onRemove && (
          <button
            type="button"
            className="text-link danger-text"
            onClick={onRemove}
          >
            Rimuovi {title === "Garante" ? "garante" : "affittuario"}
          </button>
        )}
      </div>
      <div className="field">
        <label htmlFor={`${id}-label`}>Nome o etichetta</label>
        <input
          id={`${id}-label`}
          type="text"
          value={person.label}
          required
          minLength={2}
          maxLength={60}
          onChange={(e) =>
            onChange({ ...person, label: e.currentTarget.value })
          }
        />
      </div>
      <div className="income-person-grid">
        <div className="field">
          <label htmlFor={`${id}-source`}>Da dove arrivano le entrate?</label>
          <select
            id={`${id}-source`}
            value={person.source}
            onChange={(e) =>
              sourceChanged(e.currentTarget.value as IncomeSource)
            }
          >
            {incomeSources.map((source) => (
              <option key={source} value={source}>
                {sourceLabels[source]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${id}-amount`}>Netto al mese (€)</label>
          <input
            id={`${id}-amount`}
            type="text"
            inputMode="decimal"
            pattern="[0-9]+([.,][0-9]{1,2})?"
            maxLength={12}
            value={person.amount}
            disabled={["no_income", "not_specified"].includes(person.source)}
            onChange={(e) =>
              onChange({ ...person, amount: e.currentTarget.value })
            }
            aria-describedby={`${id}-amount-help`}
          />
          <small className="input-hint" id={`${id}-amount-help`}>
            {person.source === "not_specified"
              ? "Scegli una fonte per indicare l’importo. Non indicato è diverso da zero."
              : person.source === "no_income"
                ? "Nessuna entrata: importo zero."
                : "Indica il netto medio, senza sommare altri affittuari o il garante. Puoi lasciare vuoto se non lo conosci."}
          </small>
        </div>
      </div>
      <div className="income-person-grid">
        <div className="field">
          <label htmlFor={`${id}-from`}>Dal mese</label>
          <input
            id={`${id}-from`}
            type="month"
            required
            max={monthOffset(0)}
            value={person.period_from}
            onChange={(e) =>
              onChange({ ...person, period_from: e.currentTarget.value })
            }
          />
        </div>
        <div className="field">
          <label htmlFor={`${id}-to`}>Al mese</label>
          <input
            id={`${id}-to`}
            type="month"
            required
            max={monthOffset(0)}
            value={person.period_to}
            onChange={(e) =>
              onChange({ ...person, period_to: e.currentTarget.value })
            }
          />
        </div>
      </div>
      <p className="field-hint">
        {person.source === "self_employment"
          ? "Per il lavoro autonomo, indica una media degli ultimi 12 mesi: considera anche costi e imposte."
          : person.source === "employment"
            ? "Per il lavoro dipendente, usa il netto delle ultime tre buste paga."
            : "Scegli il periodo a cui si riferisce l’importo, fino a 24 mesi."}
      </p>
      {person.source === "self_employment" && (
        <button
          className="text-link"
          type="button"
          onClick={() =>
            onChange({
              ...person,
              period_from: monthOffset(-12),
              period_to: monthOffset(-1),
            })
          }
        >
          Usa gli ultimi 12 mesi
        </button>
      )}
    </>
  );
}

type Upload = {
  id: string;
  file: File;
  kind: IncomeDocumentKind;
  revision?: number;
};
function DocumentsEditor({
  person,
  documents,
  revision,
  disabled,
  upload,
  remove,
}: {
  person: IncomePerson;
  documents: IncomeDocument[];
  revision: number;
  disabled: boolean;
  upload: (
    personId: string,
    selected: Upload & { revision: number },
  ) => Promise<void>;
  remove: (id: string, revision: number) => Promise<void>;
}) {
  const id = useId();
  const [kind, setKind] = useState<IncomeDocumentKind>(
    person.source === "employment"
      ? "payslip"
      : person.source === "pension"
        ? "pension"
        : person.source === "self_employment"
          ? "tax_return"
          : "other",
  );
  const [selected, setSelected] = useState<Upload | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const working = useRef(false);
  async function save() {
    if (!selected || disabled || working.current) return;
    working.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    const attempt = { ...selected, revision: selected.revision ?? revision };
    setSelected(attempt);
    try {
      await upload(person.id, attempt);
      setSelected(null);
      setNotice("Documento caricato. Non è ancora controllato.");
    } catch (e) {
      setError(errorText(e));
    } finally {
      working.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="income-dossier-documents">
      <h4>Prove del reddito</h4>
      <p className="field-hint">
        Fino a tre documenti per persona · PDF, JPG, PNG o WebP · massimo 5 MB
        ciascuno.
      </p>
      {documents.map((document, index) => (
        <div className="income-dossier-document" key={document.id}>
          <div>
            <strong>{documentKindLabels[document.kind]}</strong>
            <a className="text-link" href={document.url} download>
              Scarica documento {index + 1}
            </a>
          </div>
          <button
            type="button"
            className="text-link danger-text"
            disabled={disabled || busy}
            onClick={async () => {
              if (working.current) return;
              working.current = true;
              setBusy(true);
              setError("");
              setNotice("");
              try {
                await remove(document.id, revision);
                setNotice("Documento rimosso.");
              } catch (e) {
                setError(errorText(e));
              } finally {
                working.current = false;
                setBusy(false);
              }
            }}
          >
            Rimuovi documento {index + 1}
          </button>
        </div>
      ))}
      <fieldset
        disabled={disabled || busy || (!selected && documents.length >= 3)}
        className="income-document-controls"
      >
        <div className="field">
          <label htmlFor={`${id}-kind`}>Tipo di documento</label>
          <select
            id={`${id}-kind`}
            value={kind}
            disabled={Boolean(selected)}
            onChange={(e) =>
              setKind(e.currentTarget.value as IncomeDocumentKind)
            }
          >
            {documentKinds.map((value) => (
              <option key={value} value={value}>
                {documentKindLabels[value]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${id}-file`}>Scegli un documento</label>
          <input
            id={`${id}-file`}
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            disabled={Boolean(selected)}
            onChange={(e) => {
              const file = e.currentTarget.files?.[0];
              e.currentTarget.value = "";
              if (!file) return;
              setError("");
              setNotice("");
              if (!file.size || file.size > 5 * 1024 * 1024) {
                setError(
                  file.size
                    ? "Il documento supera 5 MB. Scegli un file più piccolo."
                    : "Il file è vuoto.",
                );
                return;
              }
              if (
                ![
                  "application/pdf",
                  "image/jpeg",
                  "image/png",
                  "image/webp",
                ].includes(file.type)
              ) {
                setError("Scegli un PDF oppure una foto JPG, PNG o WebP.");
                return;
              }
              setSelected({ id: crypto.randomUUID(), file, kind });
            }}
          />
        </div>
        {selected && (
          <div className="income-document-selection">
            <p>{selected.file.name} · da caricare</p>
            <div className="actions wrap">
              <button
                type="button"
                className="button secondary"
                onClick={() => void save()}
              >
                {busy
                  ? "Caricamento…"
                  : error
                    ? "Riprova caricamento"
                    : "Carica documento"}
              </button>
              <button
                type="button"
                className="text-link"
                onClick={() => {
                  setSelected(null);
                  setError("");
                }}
              >
                Annulla documento selezionato
              </button>
            </div>
          </div>
        )}
      </fieldset>
      {documents.length >= 3 && !selected && (
        <p className="field-hint">
          Hai caricato tre documenti. Rimuovine uno per aggiungerne un altro.
        </p>
      )}
      <Feedback error={error} notice={notice} />
    </div>
  );
}

function DossierEditor({
  initial,
  onUpdated,
}: {
  initial: Dossier | null;
  onUpdated: () => void;
}) {
  const [saved, setSaved] = useState(initial);
  const [tenants, setTenants] = useState<PersonDraft[]>(
    () => initial?.tenants.map(personDraft) || [newPerson("Tu")],
  );
  const [guarantor, setGuarantor] = useState<PersonDraft | null>(
    initial?.guarantor ? personDraft(initial.guarantor) : null,
  );
  const [permission, setPermission] = useState(Boolean(initial));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const working = useRef(false);
  const values = {
    tenants: tenants.map(personValue),
    guarantor: guarantor ? personValue(guarantor) : null,
  };
  const dirty =
    !saved ||
    !permission ||
    JSON.stringify(values) !==
      JSON.stringify({
        tenants: saved.tenants.map((person) =>
          personValue(personDraft(person)),
        ),
        guarantor: saved.guarantor
          ? personValue(personDraft(saved.guarantor))
          : null,
      });
  async function mutate(work: () => Promise<{ dossier: Dossier }>) {
    if (working.current)
      throw new Error("Un’operazione è già in corso. Attendi un momento.");
    working.current = true;
    setBusy(true);
    try {
      const result = await work();
      setSaved(result.dossier);
      onUpdated();
      return result.dossier;
    } finally {
      working.current = false;
      setBusy(false);
    }
  }
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setNotice("");
    const people = [...tenants, ...(guarantor ? [guarantor] : [])];
    if (
      people.some(
        (person) => person.amount.trim() && euroToCents(person.amount) === null,
      )
    ) {
      setError(
        "Controlla gli importi: usa euro e al massimo due decimali, fino a 100.000 €.",
      );
      return;
    }
    const parsed = incomeDossierInput.safeParse({
      ...values,
      people_permission: permission,
      expected_revision: saved?.revision ?? null,
    });
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join(" "));
      return;
    }
    try {
      const result = await mutate(() =>
        api("/income/dossier", "PUT", parsed.data),
      );
      setTenants(result.tenants.map(personDraft));
      setGuarantor(result.guarantor ? personDraft(result.guarantor) : null);
      setPermission(true);
      setNotice(
        "Redditi salvati. Restano privati: le precedenti condivisioni sono interrotte.",
      );
    } catch (e) {
      setError(errorText(e));
    }
  }
  async function reloadSaved() {
    if (working.current) return;
    working.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const data = await api<WorkspaceData>("/income/dossier");
      if (data.dossier) {
        setSaved(data.dossier);
        setTenants(data.dossier.tenants.map(personDraft));
        setGuarantor(
          data.dossier.guarantor ? personDraft(data.dossier.guarantor) : null,
        );
        setPermission(true);
        setNotice(
          "Redditi salvati ricaricati. Le modifiche al modulo sono state annullate.",
        );
        onUpdated();
      }
    } catch (e) {
      setError(errorText(e));
    } finally {
      working.current = false;
      setBusy(false);
    }
  }
  const docsFor = (id: string) =>
    saved?.documents.filter((document) => document.person_id === id) || [];
  const upload = async (
    personId: string,
    selected: Upload & { revision: number },
  ) => {
    const body = new FormData();
    body.append("document", selected.file);
    await mutate(() =>
      api(
        `/income/dossier/people/${personId}/documents?revision=${selected.revision}&kind=${selected.kind}`,
        "POST",
        body,
        { "Idempotency-Key": selected.id },
      ),
    );
  };
  const remove = async (id: string, revision: number) => {
    await mutate(() =>
      api(`/income/dossier/documents/${id}?revision=${revision}`, "DELETE"),
    );
  };
  const savedPerson = (id: string) =>
    [
      ...(saved?.tenants || []),
      ...(saved?.guarantor ? [saved.guarantor] : []),
    ].find((person) => person.id === id);
  function documentsFor(person: PersonDraft) {
    const original = savedPerson(person.id);
    return original && saved ? (
      <DocumentsEditor
        person={original}
        documents={docsFor(person.id)}
        revision={saved.revision}
        disabled={busy || dirty}
        upload={upload}
        remove={remove}
      />
    ) : (
      <p className="field-hint">
        Salva la scheda per aggiungere le prove del reddito.
      </p>
    );
  }
  return (
    <form
      className="income-dossier-form"
      onSubmit={(e) => void save(e)}
      aria-busy={busy}
    >
      <SyntheticNotice synthetic={saved?.synthetic} />
      <Feedback error={error} notice={notice} />
      <fieldset disabled={busy} className="income-dossier-roster">
        <legend>Chi pagherà l’affitto?</legend>
        {tenants.map((person, index) => (
          <section
            className="income-dossier-person"
            key={person.id}
            aria-label={`Affittuario ${index + 1}`}
          >
            <PersonFields
              person={person}
              title={`Affittuario ${index + 1}`}
              onChange={(next) =>
                setTenants((current) =>
                  current.map((value) => (value.id === next.id ? next : value)),
                )
              }
              onRemove={
                tenants.length > 1
                  ? () =>
                      setTenants((current) =>
                        current.filter((value) => value.id !== person.id),
                      )
                  : undefined
              }
            />
            {documentsFor(person)}
          </section>
        ))}
        <button
          type="button"
          className="button secondary"
          disabled={tenants.length >= 12}
          onClick={() => {
            setTenants((current) => [
              ...current,
              newPerson(`Affittuario ${current.length + 1}`),
            ]);
            setPermission(false);
          }}
        >
          Aggiungi affittuario
        </button>
        <label className="check-label income-guarantor-choice">
          <input
            type="checkbox"
            checked={Boolean(guarantor)}
            onChange={(e) => {
              setGuarantor(
                e.currentTarget.checked ? newPerson("Garante") : null,
              );
              setPermission(false);
            }}
          />
          Aggiungi un garante
        </label>
        {guarantor && (
          <section
            className="income-dossier-person income-dossier-guarantor"
            aria-label="Garante"
          >
            <PersonFields
              person={guarantor}
              title="Garante"
              onChange={setGuarantor}
              onRemove={() => {
                setGuarantor(null);
                setPermission(false);
              }}
            />
            <p className="field-hint">
              Il reddito del garante resta separato: non viene sommato alle
              entrate degli affittuari.
            </p>
            {documentsFor(guarantor)}
          </section>
        )}
        <Totals totals={incomeTotals(values.tenants)} draft={dirty} />
        <label className="check-label income-people-permission">
          <input
            type="checkbox"
            required
            checked={permission}
            onChange={(e) => setPermission(e.currentTarget.checked)}
          />
          Ho il permesso delle persone indicate di inserire e condividere questi
          dati.
        </label>
        {dirty && saved && (
          <p className="income-dossier-draft-notice">
            Modifiche non salvate. Salva prima di caricare o rimuovere
            documenti. Le modifiche salvate interrompono le condivisioni e
            richiedono un nuovo controllo.
          </p>
        )}
        <div className="actions wrap">
          <button className="button" disabled={busy}>
            {busy ? "Salvataggio…" : "Salva redditi"}
          </button>
          {saved && (
            <button
              type="button"
              className="text-link"
              onClick={() => void reloadSaved()}
            >
              Ricarica i redditi salvati
            </button>
          )}
        </div>
      </fieldset>
      <p className="field-hint income-dossier-save-hint">
        Salvare e caricare documenti non li rende pubblici. Dopo un invito
        accettato, scegli il proprietario con cui condividere.
      </p>
    </form>
  );
}

export function IncomeDossierWorkspace({
  syntheticEnvironment = false,
}: {
  syntheticEnvironment?: boolean;
}) {
  const [value, setValue] = useState<WorkspaceData | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const id = useId();
  useEffect(() => {
    let active = true;
    api<WorkspaceData>("/income/dossier")
      .then((data) => {
        if (active) setValue(data);
      })
      .catch((e) => {
        if (active) setError(errorText(e));
      });
    return () => {
      active = false;
    };
  }, []);
  async function refresh() {
    try {
      setValue(await api<WorkspaceData>("/income/dossier"));
      setError("");
    } catch (e) {
      setError(errorText(e));
    }
  }
  return (
    <section
      className="income-dossier-workspace"
      aria-labelledby={`${id}-heading`}
    >
      <h2 id={`${id}-heading`}>Redditi per l’affitto</h2>
      <p>
        Una scheda per ogni affittuario, un totale chiaro e le prove del
        reddito. Il proprietario scelto può leggerle e registrare il proprio
        controllo.
      </p>
      {syntheticEnvironment && (
        <p className="field-hint">
          Nell’area di prova, usa solo dati e documenti di esempio.
        </p>
      )}
      <Feedback error={error} notice={notice} />
      {!value ? (
        error ? (
          <button className="button secondary" onClick={() => void refresh()}>
            Riprova caricamento redditi
          </button>
        ) : (
          <p role="status">Caricamento dei redditi…</p>
        )
      ) : (
        <>
          <DossierEditor
            initial={value.dossier}
            onUpdated={() => void refresh()}
          />
          <article className="panel income-dossier-shares">
            <h3>Con chi hai condiviso i redditi</h3>
            {!value.shares.length ? (
              <p>I redditi e i documenti non sono condivisi con nessuno.</p>
            ) : (
              <ul>
                {value.shares.map((share) => (
                  <li key={share.id}>
                    <div>
                      <strong>{share.property_title}</strong>
                      <p>
                        {share.recipient_label ||
                          "Proprietario di questo immobile"}{" "}
                        ·{" "}
                        {share.revoked_at || !share.available
                          ? "Condivisione interrotta"
                          : "Redditi e documenti condivisi"}
                      </p>
                    </div>
                    {share.available && !share.revoked_at && (
                      <button
                        type="button"
                        className="button secondary small"
                        disabled={busy}
                        onClick={async () => {
                          setBusy(true);
                          setError("");
                          setNotice("");
                          try {
                            await api(
                              `/income/dossier/shares/${share.id}`,
                              "DELETE",
                            );
                            await refresh();
                            setNotice(
                              "Condivisione interrotta per questo proprietario.",
                            );
                          } catch (e) {
                            setError(errorText(e));
                          } finally {
                            setBusy(false);
                          }
                        }}
                      >
                        Interrompi la condivisione
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <a className="text-link" href="/invitations">
              Scegli un invito per condividere i redditi →
            </a>
          </article>
        </>
      )}
    </section>
  );
}

function ReviewForm({
  person,
  documents,
  dossier,
  share,
  onReviewed,
}: {
  person: IncomePerson;
  documents: IncomeDocument[];
  dossier: Dossier;
  share: Share;
  onReviewed: () => void;
}) {
  const id = useId();
  const [documentId, setDocumentId] = useState(documents[0]?.id || "");
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());
  const [amount, setAmount] = useState(
    person.monthly_net_cents === null
      ? ""
      : String(centsToEuros(person.monthly_net_cents)),
  );
  const [from, setFrom] = useState(person.period_from),
    [to, setTo] = useState(person.period_to);
  const [confirm, setConfirm] = useState(false),
    [busy, setBusy] = useState(false);
  const [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const canReview = downloaded.has(documentId);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setNotice("");
    const parsed = incomeReviewInput.safeParse({
      person_id: person.id,
      document_id: documentId,
      revision: dossier.revision,
      observed_net_cents: euroToCents(amount),
      period_from: from,
      period_to: to,
      confirm,
    });
    if (!parsed.success) {
      setError(
        "Controlla l’importo, il periodo e la conferma di lettura del documento.",
      );
      return;
    }
    setBusy(true);
    try {
      await api(
        `/income/dossier/shares/${share.id}/reviews`,
        "POST",
        parsed.data,
      );
      setConfirm(false);
      setNotice("Controllo dei documenti registrato per questo invito.");
      onReviewed();
    } catch (e) {
      setConfirm(false);
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="income-dossier-review">
      {documents.map((document, index) => (
        <div className="income-dossier-document" key={document.id}>
          <strong>{documentKindLabels[document.kind]}</strong>
          <a
            className="text-link"
            href={document.url}
            download
            onClick={() => {
              setDocumentId(document.id);
              setDownloaded((current) => new Set(current).add(document.id));
              setConfirm(false);
            }}
          >
            Scarica documento {index + 1}
          </a>
        </div>
      ))}
      {!documents.length ? (
        <p className="field-hint">Nessuna prova allegata per questa persona.</p>
      ) : (
        <form
          className="income-dossier-review-form"
          onSubmit={(e) => void save(e)}
        >
          <h4>Confronta il documento con la dichiarazione</h4>
          {documents.length > 1 && (
            <div className="field">
              <label htmlFor={`${id}-doc`}>Documento da controllare</label>
              <select
                id={`${id}-doc`}
                value={documentId}
                onChange={(e) => {
                  setDocumentId(e.currentTarget.value);
                  setConfirm(false);
                }}
              >
                {documents.map((document, index) => (
                  <option key={document.id} value={document.id}>
                    {documentKindLabels[document.kind]} · documento {index + 1}
                  </option>
                ))}
              </select>
            </div>
          )}
          {!canReview && (
            <p className="field-hint">
              Scarica prima il documento che vuoi controllare.
            </p>
          )}
          <fieldset
            disabled={!canReview || busy}
            className="income-review-fields"
          >
            <div className="field">
              <label htmlFor={`${id}-amount`}>
                Netto letto nel documento (€)
              </label>
              <input
                id={`${id}-amount`}
                type="text"
                inputMode="decimal"
                pattern="[0-9]+([.,][0-9]{1,2})?"
                required
                value={amount}
                onChange={(e) => setAmount(e.currentTarget.value)}
              />
            </div>
            <div className="income-person-grid">
              <div className="field">
                <label htmlFor={`${id}-from`}>Dal mese</label>
                <input
                  id={`${id}-from`}
                  type="month"
                  max={monthOffset(0)}
                  required
                  value={from}
                  onChange={(e) => setFrom(e.currentTarget.value)}
                />
              </div>
              <div className="field">
                <label htmlFor={`${id}-to`}>Al mese</label>
                <input
                  id={`${id}-to`}
                  type="month"
                  max={monthOffset(0)}
                  required
                  value={to}
                  onChange={(e) => setTo(e.currentTarget.value)}
                />
              </div>
            </div>
            <label className="check-label">
              <input
                type="checkbox"
                required
                checked={confirm}
                onChange={(e) => setConfirm(e.currentTarget.checked)}
              />
              Ho letto il documento e confrontato l’importo e il periodo con la
              dichiarazione.
            </label>
            <button className="button secondary" disabled={!confirm || busy}>
              {busy ? "Registrazione…" : "Conferma controllo"}
            </button>
          </fieldset>
          <p className="field-hint">
            Il controllo è tuo e riguarda questo documento. Gli importi letti e
            quelli dichiarati non si sommano.
          </p>
          <Feedback error={error} notice={notice} />
        </form>
      )}
    </div>
  );
}

function DossierSummary({
  dossier,
  comparison,
  reviews = [],
  share,
  owner = false,
  onReviewed,
}: {
  dossier: Dossier;
  comparison?: IncomeComparison | null;
  reviews?: Review[];
  share?: Share | null;
  owner?: boolean;
  onReviewed?: () => void;
}) {
  return (
    <div className="income-dossier-summary">
      <SyntheticNotice synthetic={dossier.synthetic} />
      <Totals totals={dossier.totals} comparison={comparison} />
      {[
        ...dossier.tenants,
        ...(dossier.guarantor ? [dossier.guarantor] : []),
      ].map((person) => {
        const guarantor = person.id === dossier.guarantor?.id;
        const documents = dossier.documents.filter(
          (document) => document.person_id === person.id,
        );
        const review = [...reviews]
          .reverse()
          .find(
            (value) =>
              value.person_id === person.id &&
              value.revision === dossier.revision,
          );
        return (
          <section
            className={`income-dossier-person ${guarantor ? "income-dossier-guarantor" : ""}`}
            key={person.id}
            aria-label={person.label}
          >
            <div className="income-person-header">
              <h3>
                {person.label}
                {guarantor && <small> · Garante</small>}
              </h3>
              <span className="income-dossier-person-status">
                {review
                  ? "Documento controllato da questo proprietario"
                  : documents.length
                    ? "Documento caricato"
                    : "Dichiarato"}
              </span>
            </div>
            <strong className="income-person-amount">
              {person.monthly_net_cents === null
                ? "Non indicato"
                : `${formatIncomeCents(person.monthly_net_cents)} netti / mese`}
            </strong>
            <p className="small-copy">
              {sourceLabels[person.source]} ·{" "}
              {incomeMonthLabel(person.period_from)} –{" "}
              {incomeMonthLabel(person.period_to)}
            </p>
            {guarantor && (
              <p className="field-hint">Escluso dal totale degli affittuari.</p>
            )}
            {review && (
              <p className="income-dossier-review-result">
                Letto nel documento:{" "}
                <strong>
                  {formatIncomeCents(review.observed_net_cents)} netti / mese
                </strong>{" "}
                · {incomeMonthLabel(review.period_from)} –{" "}
                {incomeMonthLabel(review.period_to)}. Controllo manuale
                registrato il {dateLabel(review.reviewed_at)}.
              </p>
            )}
            {owner && share ? (
              <ReviewForm
                key={`${share.id}:${dossier.revision}:${person.id}`}
                person={person}
                documents={documents}
                dossier={dossier}
                share={share}
                onReviewed={onReviewed || (() => {})}
              />
            ) : (
              <div className="income-dossier-documents">
                {documents.map((document, index) => (
                  <div className="income-dossier-document" key={document.id}>
                    <strong>{documentKindLabels[document.kind]}</strong>
                    <a className="text-link" href={document.url} download>
                      Scarica documento {index + 1}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
      <p className="field-hint">
        Il controllo manuale del proprietario non certifica l’autenticità dei
        documenti o l’identità e non garantisce pagamenti futuri.
      </p>
    </div>
  );
}

export function InvitationIncomeDossier({
  invitationId,
  isTenant,
  propertyTitle,
  otherName,
  expanded = false,
}: {
  invitationId: string;
  isTenant: boolean;
  propertyTitle: string;
  otherName?: string;
  expanded?: boolean;
}) {
  const [open, setOpen] = useState(expanded),
    [consent, setConsent] = useState(false),
    [documentsConsent, setDocumentsConsent] = useState(false);
  const l = useLoad<InvitationData>(
    open ? `/invitations/${invitationId}/income-dossier` : null,
  );
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const working = useRef(false);
  const id = useId();
  useEffect(() => {
    setConsent(false);
    setDocumentsConsent(false);
  }, [l.data?.dossier?.id, l.data?.dossier?.revision, invitationId]);
  const shared = l.data?.status === "available" && l.data.share;
  async function changeSharing(revoke = false) {
    if (working.current || !l.data?.dossier) return;
    working.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (revoke && l.data.share) {
        await api(`/income/dossier/shares/${l.data.share.id}`, "DELETE");
        setNotice("Condivisione interrotta per questo proprietario.");
      } else {
        await api("/income/dossier/shares", "POST", {
          invitation_id: invitationId,
          dossier_id: l.data.dossier.id,
          revision: l.data.dossier.revision,
          consent: true,
          documents_consent: true,
        });
        setNotice(
          "Redditi e documenti condivisi solo con il proprietario di questo invito.",
        );
      }
      setConsent(false);
      setDocumentsConsent(false);
      l.reload();
    } catch (e) {
      setConsent(false);
      setDocumentsConsent(false);
      setError(errorText(e));
      l.reload();
    } finally {
      working.current = false;
      setBusy(false);
    }
  }
  return (
    <details
      className="income-dossier-invitation"
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary>
        {isTenant
          ? "Redditi: scegli cosa condividere"
          : "Redditi condivisi con te"}
      </summary>
      {open && (
        <div className="income-dossier-invitation-content">
          <Feedback error={l.error || error} notice={notice} />
          <button
            type="button"
            className="text-link"
            disabled={busy}
            onClick={() => {
              setConsent(false);
              setDocumentsConsent(false);
              setError("");
              setNotice("");
              l.reload();
            }}
          >
            Ricarica anteprima
          </button>
          {!l.data ? (
            !l.error && <p role="status">Caricamento dei redditi…</p>
          ) : isTenant ? (
            <>
              <p>
                <strong>Con chi condividi:</strong>{" "}
                {otherName || `Proprietario dell’immobile «${propertyTitle}»`}.
              </p>
              {l.data.dossier ? (
                <>
                  <DossierSummary
                    dossier={l.data.dossier}
                    comparison={l.data.comparison}
                    reviews={l.data.reviews}
                  />
                  {shared ? (
                    <>
                      <p className="income-dossier-shared-note">
                        Redditi e documenti condivisi per questo invito.
                      </p>
                      <button
                        type="button"
                        className="button secondary"
                        disabled={busy}
                        onClick={() => void changeSharing(true)}
                      >
                        Interrompi la condivisione
                      </button>
                    </>
                  ) : l.data.can_share ? (
                    <div className="income-dossier-consent">
                      <p id={`${id}-consent-help`}>
                        Solo questo proprietario potrà leggere il riepilogo e
                        scaricare i documenti allegati. Puoi interrompere
                        l’accesso qui; eventuali copie già scaricate restano al
                        destinatario.
                      </p>
                      <label className="check-label">
                        <input
                          type="checkbox"
                          checked={consent}
                          onChange={(e) => setConsent(e.currentTarget.checked)}
                          aria-describedby={`${id}-consent-help`}
                        />
                        Condivido questo riepilogo con il proprietario di questo
                        invito.
                      </label>
                      <label className="check-label">
                        <input
                          type="checkbox"
                          checked={documentsConsent}
                          onChange={(e) =>
                            setDocumentsConsent(e.currentTarget.checked)
                          }
                          aria-describedby={`${id}-consent-help`}
                        />
                        Condivido anche i documenti allegati con questo
                        proprietario.
                      </label>
                      <button
                        type="button"
                        className="button"
                        disabled={!consent || !documentsConsent || busy}
                        onClick={() => void changeSharing()}
                      >
                        Condividi redditi e documenti
                      </button>
                    </div>
                  ) : (
                    <p className="field-hint">
                      Puoi condividere solo da un invito accettato e
                      disponibile.
                    </p>
                  )}
                </>
              ) : (
                <p>
                  Prepara il riepilogo e aggiungi le prove del reddito nella
                  pagina{" "}
                  <a className="text-link" href="/verification">
                    Redditi per l’affitto
                  </a>
                  .
                </p>
              )}
            </>
          ) : shared && l.data.dossier ? (
            <DossierSummary
              dossier={l.data.dossier}
              comparison={l.data.comparison}
              reviews={l.data.reviews}
              share={l.data.share}
              owner
              onReviewed={l.reload}
            />
          ) : (
            <p>
              Qui vedrai i redditi e i documenti solo se l’inquilino sceglie di
              condividerli per questo invito.
            </p>
          )}
        </div>
      )}
    </details>
  );
}
