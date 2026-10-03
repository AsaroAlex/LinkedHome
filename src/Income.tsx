import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { api, dateLabel, useLoad } from "./api";

export const incomeLabels: Record<string, string> = {
  not_requested: "Non richiesta",
  pending: "In corso",
  completed: "Esempio completato",
  insufficient: "Dati insufficienti",
  failed: "Controllo non riuscito",
  expired: "Scaduta",
  revoked: "Revocata",
  disputed: "Contestata",
};
const categoryLabels: Record<string, string> = {
  employment: "Lavoro dipendente",
  self_employment: "Lavoro autonomo",
  variable: "Entrate variabili",
};
const recovery: Record<string, string> = {
  not_requested:
    "Puoi ricevere inviti e aprire conversazioni senza un’attestazione.",
  pending:
    "Il controllo è in corso. Puoi continuare a usare il tuo profilo; nulla viene condiviso.",
  insufficient:
    "Le evidenze non bastano per descrivere il periodo. Non è un giudizio sulla tua situazione economica. In un servizio reale servirebbe un’alternativa assistita.",
  failed:
    "Il controllo non è stato completato. Puoi riprovare; un problema tecnico non dice nulla sul tuo reddito.",
  expired:
    "Il periodo di validità è terminato. Il proprietario non può più consultare l’esempio. Un aggiornamento richiederà una nuova scelta di condivisione.",
  revoked:
    "Hai ritirato l’attestazione: ogni accesso futuro è interrotto. Le copie già ottenute non possono essere richiamate.",
  disputed:
    "Hai contestato l’esito. Gli accessi sono interrotti fino a una nuova attestazione. Questa demo registra la contestazione e non offre una revisione da parte di un provider.",
};

function Feedback({ error, message }: { error: string; message: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (error || message) ref.current?.focus();
  }, [error, message]);
  return (
    <>
      {error && (
        <p ref={ref} tabIndex={-1} role="alert" className="alert error">
          {error}
        </p>
      )}
      {message && (
        <p ref={ref} tabIndex={-1} role="status" className="alert success">
          {message}
        </p>
      )}
    </>
  );
}
function useIncomeAction() {
  const [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function run(work: () => Promise<unknown>, success: string) {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      await work();
      setMessage(success);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return { error, message, busy, run };
}

export function IncomeSummary({ value }: { value: any }) {
  if (!value) return null;
  return (
    <div className="income-card">
      <p className="synthetic-label">
        Esempio sintetico · nessun reddito reale verificato
      </p>
      <h3>Attestazione dimostrativa di reddito</h3>
      <dl className="income-summary">
        <div>
          <dt>Entrate nette mensili nel periodo</dt>
          <dd>
            {value.summary?.monthly_net_band
              ? `€${value.summary.monthly_net_band.min}–${value.summary.monthly_net_band.max}`
              : "Non disponibili"}
          </dd>
        </div>
        <div>
          <dt>Tipo di entrate</dt>
          <dd>
            {categoryLabels[value.category] || value.category || "Esempio"}
          </dd>
        </div>
        <div>
          <dt>Periodo di riferimento</dt>
          <dd>
            {value.period_from && value.period_to
              ? `${dateLabel(value.period_from)} – ${dateLabel(value.period_to)}`
              : "Non disponibile"}
          </dd>
        </div>
        <div>
          <dt>Emittente</dt>
          <dd>{value.provider || "Simulatore locale Soglia"}</dd>
        </div>
        <div>
          <dt>Fonte e controllo</dt>
          <dd>
            {value.source_description ||
              "Movimenti generati per la dimostrazione; nessun controllo su fonti reali"}
          </dd>
        </div>
        <div>
          <dt>Data e scadenza</dt>
          <dd>
            {value.checked_at ? dateLabel(value.checked_at) : "Non emessa"}
            {value.expires_at
              ? ` · valida fino al ${dateLabel(value.expires_at)}`
              : ""}
          </dd>
        </div>
      </dl>
      <p className="small-copy">
        Descrive evidenze relative a un periodo. Non garantisce pagamenti
        futuri. L’esempio non contiene documenti, datore di lavoro, conto
        bancario o movimenti.
      </p>
    </div>
  );
}

export function IncomeWorkspace() {
  const l = useLoad("/income"),
    a = useIncomeAction();
  const [confirmRevoke, setConfirmRevoke] = useState(false),
    [contest, setContest] = useState(false);
  const check = l.data?.attestation;
  async function demo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = new FormData(e.currentTarget);
    await a.run(async () => {
      await api("/income/demo", "POST", {
        scenario: values.get("scenario"),
        category: values.get("category"),
      });
      setConfirmRevoke(false);
      setContest(false);
      l.reload();
    }, "Esempio aggiornato. Non è condiviso automaticamente; gli accessi al precedente sono interrotti.");
  }
  if (l.error)
    return (
      <section className="panel income-section">
        <h2>Attestazione di reddito</h2>
        <p role="alert" className="alert error">
          {l.error}
        </p>
        <button className="button secondary" onClick={l.reload}>
          Riprova a caricare
        </button>
      </section>
    );
  if (!l.data) return <p role="status">Caricamento dell’attestazione…</p>;
  return (
    <section className="income-section" aria-labelledby="income-heading">
      <div className="income-intro">
        <span className="eyebrow">UNA SCELTA FACOLTATIVA</span>
        <h2 id="income-heading">Il reddito, solo quando scegli tu.</h2>
        <p>
          Un’attestazione può aiutare un proprietario a comprendere le entrate
          di un periodo. Prepararla non la pubblica: scegli cosa mostrare e a
          quale proprietario, dall’invito o dalla conversazione.
        </p>
        <p className="disclosure">
          Puoi partecipare senza verifica. Non cambia la compatibilità o
          l’ordine dei profili.
        </p>
      </div>
      <ol className="onboarding-steps" aria-label="Percorso dell’attestazione">
        <li>
          <strong>Prepara</strong>
          <span>Un controllo facoltativo</span>
        </li>
        <li>
          <strong>Controlla</strong>
          <span>Fonte, periodo e anteprima</span>
        </li>
        <li>
          <strong>Scegli</strong>
          <span>Un destinatario per volta</span>
        </li>
      </ol>
      <Feedback error={a.error} message={a.message} />
      <div className="income-layout">
        <article className="panel">
          <div className="panel-title">
            <h3>La tua attestazione</h3>
            <span className="badge">
              {incomeLabels[l.data.status] || l.data.status}
            </span>
          </div>
          {recovery[l.data.status] && <p>{recovery[l.data.status]}</p>}
          {check && <IncomeSummary value={check} />}
          {check &&
            ["completed", "expired", "failed", "insufficient"].includes(
              l.data.status,
            ) && (
              <div className="actions wrap">
                <button
                  className="text-link"
                  onClick={() => setContest(!contest)}
                  aria-expanded={contest}
                >
                  Contesta esito
                </button>
                <button
                  className="text-link danger-text"
                  onClick={() => setConfirmRevoke(!confirmRevoke)}
                  aria-expanded={confirmRevoke}
                >
                  Ritira attestazione
                </button>
              </div>
            )}
          {contest && (
            <form
              className="income-share-panel"
              onSubmit={(e) => {
                e.preventDefault();
                const reason = String(
                  new FormData(e.currentTarget).get("reason"),
                );
                void a.run(async () => {
                  await api(`/income/${check.id}/dispute`, "POST", { reason });
                  setContest(false);
                  l.reload();
                }, "Contestazione registrata. Gli accessi all’attestazione sono interrotti.");
              }}
            >
              <label className="field">
                <span>Motivo della contestazione</span>
                <textarea
                  name="reason"
                  required
                  minLength={5}
                  maxLength={300}
                  rows={3}
                />
              </label>
              <p className="field-hint">
                Descrivi il problema dell’esempio. Non inserire dati finanziari
                o documenti reali.
              </p>
              <button className="button secondary" disabled={a.busy}>
                Conferma contestazione
              </button>
            </form>
          )}
          {confirmRevoke && (
            <div className="income-share-panel">
              <p>
                Interromperai tutti gli accessi futuri. Le copie già ottenute
                non possono essere richiamate.
              </p>
              <button
                className="button secondary"
                disabled={a.busy}
                onClick={() =>
                  void a.run(async () => {
                    await api(`/income/${check.id}/revoke`, "POST");
                    setConfirmRevoke(false);
                    l.reload();
                  }, "Attestazione ritirata. Gli accessi futuri sono interrotti.")
                }
              >
                Conferma ritiro
              </button>
            </div>
          )}
          <a className="text-link" href="/invitations">
            Scegli un invito per condividere →
          </a>
        </article>
        <aside className="panel muted-panel">
          <span className="eyebrow">DISPONIBILITÀ DEL SERVIZIO</span>
          <h3>Verifica reale non disponibile</h3>
          <p>
            Nessun servizio di verifica è collegato. Non è possibile emettere
            un’attestazione reale o caricare documenti finanziari.
          </p>
          <button className="button secondary full" disabled>
            Verifica reale non disponibile
          </button>
          <p className="field-hint">
            Per una verifica reale serviranno un emittente identificabile,
            copertura delle fonti italiane e assistenza per errori e redditi non
            supportati. Costi e soggetto pagante restano da validare.
          </p>
          {l.data.demo_available && (
            <details className="income-demo">
              <summary>Prova il percorso con dati sintetici</summary>
              <p className="synthetic-label">
                Solo esempi generati: non inserire il tuo reddito.
              </p>
              <form onSubmit={demo}>
                <label className="field">
                  <span>Tipo di esempio</span>
                  <select name="category" defaultValue="employment">
                    <option value="employment">Lavoro dipendente</option>
                    <option value="self_employment">Lavoro autonomo</option>
                    <option value="variable">Entrate variabili</option>
                  </select>
                </label>
                <label className="field">
                  <span>Esito da esplorare</span>
                  <select name="scenario" defaultValue="completed">
                    <option value="completed">Completata</option>
                    <option value="pending">In corso</option>
                    <option value="insufficient">Dati insufficienti</option>
                    <option value="error">Errore tecnico</option>
                    <option value="expired">Scaduta</option>
                  </select>
                </label>
                <p className="field-hint">
                  Un nuovo esempio sostituisce quello attuale e interrompe le
                  precedenti condivisioni.
                </p>
                <button className="button" disabled={a.busy}>
                  Crea esempio sintetico
                </button>
              </form>
            </details>
          )}
        </aside>
      </div>
      <article className="panel income-shares">
        <h3>Accessi che hai autorizzato</h3>
        <p>
          Ogni accesso riguarda un proprietario e un invito. Revoca, scadenza,
          contestazione e chiusura dell’invito interrompono la consultazione
          futura.
        </p>
        {l.data.shares.length === 0 ? (
          <p>
            Nessun accesso autorizzato. Il profilo pubblicato non condivide il
            reddito.
          </p>
        ) : (
          <ul>
            {l.data.shares.map((s: any) => (
              <li key={s.id}>
                <div>
                  <strong>
                    {s.property_title ||
                      `Invito ${s.invitation_id.slice(0, 8)}`}
                  </strong>
                  <p className="small-copy">
                    {s.recipient_label || "Proprietario di questo immobile"} ·{" "}
                    {s.revoked_at
                      ? "Accesso revocato"
                      : s.available === false
                        ? "Accesso non più disponibile"
                        : "Accesso autorizzato"}
                  </p>
                </div>
                {!s.revoked_at && s.available !== false && (
                  <button
                    className="button secondary small"
                    disabled={a.busy}
                    onClick={() =>
                      void a.run(async () => {
                        await api(`/income/shares/${s.id}`, "DELETE");
                        l.reload();
                      }, "Accesso futuro revocato per questo destinatario.")
                    }
                  >
                    Revoca accesso
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}

export function InvitationIncome({
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
    [consent, setConsent] = useState(false);
  const l = useLoad(open ? `/invitations/${invitationId}/income` : null),
    a = useIncomeAction(),
    id = useId();
  useEffect(() => {
    setConsent(false);
  }, [l.data?.attestation?.id]);
  const shared = l.data?.status === "available" && l.data?.share;
  return (
    <details
      className="income-invitation"
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary>
        {isTenant
          ? "Reddito: scegli cosa condividere"
          : "Informazioni sul reddito condivise"}
      </summary>
      {open && (
        <div className="income-share-panel">
          <Feedback error={l.error || a.error} message={a.message} />
          {(l.error || a.error) && (
            <button
              className="button secondary small"
              onClick={() => {
                setConsent(false);
                l.reload();
              }}
            >
              Ricarica anteprima
            </button>
          )}
          {!l.data && !l.error ? (
            <p role="status">Caricamento della condivisione…</p>
          ) : isTenant ? (
            <>
              <p>
                <strong>Destinatario:</strong>{" "}
                {otherName || `Proprietario dell’immobile «${propertyTitle}»`} ·
                invito {invitationId.slice(0, 8)}.
              </p>
              {shared ? (
                <>
                  <p role="status">
                    Hai autorizzato l’accesso a questo esempio per questo
                    invito.
                  </p>
                  <IncomeSummary value={l.data.attestation} />
                  <button
                    className="button secondary"
                    disabled={a.busy}
                    onClick={() =>
                      void a.run(async () => {
                        await api(
                          `/income/shares/${l.data.share.id}`,
                          "DELETE",
                        );
                        setConsent(false);
                        l.reload();
                      }, "Accesso futuro revocato per questo proprietario.")
                    }
                  >
                    Revoca accesso
                  </button>
                </>
              ) : l.data?.can_share ? (
                <>
                  <h3>Anteprima per questo proprietario</h3>
                  <IncomeSummary value={l.data.attestation} />
                  <p id={id}>
                    Solo questo riepilogo sarà consultabile per questo invito.
                    Nessun documento o conto viene condiviso. Puoi revocare
                    l’accesso futuro; le copie già ottenute non possono essere
                    richiamate.
                  </p>
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      aria-describedby={id}
                    />{" "}
                    Scelgo di condividere questo esempio con questo
                    proprietario.
                  </label>
                  <button
                    className="button"
                    disabled={!consent || a.busy}
                    onClick={() =>
                      void a.run(async () => {
                        await api("/income/shares", "POST", {
                          invitation_id: invitationId,
                          attestation_id: l.data.attestation.id,
                          consent: true,
                        });
                        setConsent(false);
                        l.reload();
                      }, "Esempio condiviso solo con il proprietario di questo invito.")
                    }
                  >
                    Condividi con questo proprietario
                  </button>
                </>
              ) : (
                <>
                  <p>
                    Puoi continuare senza attestazione. Per condividere serve un
                    esempio completato e in corso di validità.
                  </p>
                  <a className="text-link" href="/verification">
                    Prepara e controlla un esempio →
                  </a>
                </>
              )}
            </>
          ) : shared ? (
            <IncomeSummary value={l.data.attestation} />
          ) : (
            <p>
              Qui vedrai un’attestazione solo se la persona sceglie di
              condividerla con te. La sua assenza non esprime un giudizio
              economico: puoi continuare la conversazione.
            </p>
          )}
        </div>
      )}
    </details>
  );
}
