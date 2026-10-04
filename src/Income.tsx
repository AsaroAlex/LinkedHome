import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { api, dateLabel, useLoad } from "./api";
import { brand } from "./brand";

export const incomeLabels: Record<string, string> = {
  not_requested: "Da iniziare",
  pending: "In corso",
  completed: "Esempio pronto",
  insufficient: "Dati insufficienti",
  failed: "Verifica non riuscita",
  expired: "Da aggiornare",
  revoked: "Riepilogo ritirato",
  disputed: "Errore segnalato",
};
const categoryLabels: Record<string, string> = {
  employment: "Lavoro dipendente",
  self_employment: "Lavoro autonomo",
  variable: "Entrate variabili",
};
const recovery: Record<string, string> = {
  not_requested:
    "Puoi ricevere inviti e parlare con i proprietari anche senza verificare il reddito.",
  pending:
    "Il controllo è in corso. Puoi continuare a usare il tuo profilo; nulla viene condiviso.",
  insufficient:
    "I dati non bastano per descrivere le entrate del periodo. Questo non è un giudizio sulla tua situazione economica. Puoi provare un altro esempio.",
  failed:
    "Il controllo non è stato completato. Puoi riprovare; un problema tecnico non dice nulla sul tuo reddito.",
  expired:
    "Il riepilogo è scaduto e il proprietario non può più vederlo. Se ne prepari uno nuovo, dovrai scegliere di nuovo con chi condividerlo.",
  revoked:
    "Hai ritirato il riepilogo: i proprietari non possono più vederlo qui. Non puoi cancellare eventuali copie già salvate.",
  disputed:
    "Hai segnalato un errore. Il riepilogo non è più visibile ai proprietari. Per condividerlo di nuovo devi prepararne uno nuovo. La demo salva la segnalazione, ma non prevede una revisione del risultato.",
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
        Dati di esempio · nessun reddito reale verificato
      </p>
      <h3>Riepilogo del reddito di esempio</h3>
      <dl className="income-summary">
        <div>
          <dt>Entrate nette al mese</dt>
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
          <dt>Periodo considerato</dt>
          <dd>
            {value.period_from && value.period_to
              ? `${dateLabel(value.period_from)} – ${dateLabel(value.period_to)}`
              : "Non disponibile"}
          </dd>
        </div>
        <div>
          <dt>Chi ha preparato il riepilogo</dt>
          <dd>{value.provider || `Simulatore locale ${brand.name}`}</dd>
        </div>
        <div>
          <dt>Da dove arrivano i dati</dt>
          <dd>
            {value.source_description ||
              "Movimenti generati per la dimostrazione; nessun controllo su fonti reali"}
          </dd>
        </div>
        <div>
          <dt>Data e scadenza</dt>
          <dd>
            {value.checked_at
              ? dateLabel(value.checked_at)
              : "Data non disponibile"}
            {value.expires_at
              ? ` · valida fino al ${dateLabel(value.expires_at)}`
              : ""}
          </dd>
        </div>
      </dl>
      <p className="small-copy">
        Mostra le entrate del periodo indicato. Non garantisce il pagamento
        degli affitti futuri. L’esempio non contiene documenti, dati del datore
        di lavoro o del conto bancario, né singoli movimenti.
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
        <h2>Verifica del reddito</h2>
        <p role="alert" className="alert error">
          {l.error}
        </p>
        <button className="button secondary" onClick={l.reload}>
          Riprova a caricare
        </button>
      </section>
    );
  if (!l.data)
    return <p role="status">Caricamento della verifica del reddito…</p>;
  return (
    <section className="income-section" aria-labelledby="income-heading">
      <div className="income-intro">
        <span className="eyebrow">UNA SCELTA FACOLTATIVA</span>
        <h2 id="income-heading">Il reddito, solo quando scegli tu.</h2>
        <p>
          La verifica del reddito prepara un riepilogo delle tue entrate. Prima
          lo controlli, poi scegli se condividerlo con un proprietario
          dall’invito o dalla conversazione. Prepararlo non lo rende pubblico.
        </p>
        <p className="disclosure">
          Puoi partecipare senza verifica. Non cambia la compatibilità o
          l’ordine dei profili.
        </p>
      </div>
      <ol
        className="onboarding-steps"
        aria-label="Come funziona la verifica del reddito"
      >
        <li>
          <strong>Prepara</strong>
          <span>Un riepilogo delle entrate</span>
        </li>
        <li>
          <strong>Controlla</strong>
          <span>Da dove arrivano i dati e a quale periodo si riferiscono</span>
        </li>
        <li>
          <strong>Scegli</strong>
          <span>Con quale proprietario condividerlo</span>
        </li>
      </ol>
      <Feedback error={a.error} message={a.message} />
      <div className="income-layout">
        <article className="panel">
          <div className="panel-title">
            <h3>La verifica del tuo reddito</h3>
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
                  Segnala un errore
                </button>
                <button
                  className="text-link danger-text"
                  onClick={() => setConfirmRevoke(!confirmRevoke)}
                  aria-expanded={confirmRevoke}
                >
                  Ritira il riepilogo
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
                }, "Errore segnalato. Il riepilogo non è più visibile ai proprietari.");
              }}
            >
              <label className="field">
                <span>Che cosa non è corretto?</span>
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
                Invia segnalazione
              </button>
            </form>
          )}
          {confirmRevoke && (
            <div className="income-share-panel">
              <p>
                Tutti i proprietari con cui hai condiviso il riepilogo non
                potranno più vederlo qui. Non puoi cancellare eventuali copie
                già salvate.
              </p>
              <button
                className="button secondary"
                disabled={a.busy}
                onClick={() =>
                  void a.run(async () => {
                    await api(`/income/${check.id}/revoke`, "POST");
                    setConfirmRevoke(false);
                    l.reload();
                  }, "Riepilogo ritirato. I proprietari non possono più vederlo qui.")
                }
              >
                Conferma ritiro
              </button>
            </div>
          )}
          <a className="text-link" href="/invitations">
            Scegli con chi condividere il riepilogo →
          </a>
        </article>
        <aside className="panel muted-panel">
          <span className="eyebrow">DISPONIBILITÀ DEL SERVIZIO</span>
          <h3>Verifica reale non disponibile</h3>
          <p>
            Nella demo puoi usare solo dati di esempio. La verifica del reddito
            reale non è ancora disponibile e non puoi caricare documenti
            finanziari.
          </p>
          <button className="button secondary full" disabled>
            Verifica reale non disponibile
          </button>
          <p className="field-hint">
            La verifica del reddito è facoltativa. Puoi comunque ricevere inviti
            e parlare con i proprietari.
          </p>
          {l.data.demo_available && (
            <details className="income-demo">
              <summary>Prova con dati di esempio</summary>
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
                  <span>Risultato da provare</span>
                  <select name="scenario" defaultValue="completed">
                    <option value="completed">Esempio pronto</option>
                    <option value="pending">In corso</option>
                    <option value="insufficient">Dati insufficienti</option>
                    <option value="error">Errore tecnico</option>
                    <option value="expired">Riepilogo scaduto</option>
                  </select>
                </label>
                <p className="field-hint">
                  Un nuovo esempio sostituisce quello attuale e interrompe le
                  precedenti condivisioni.
                </p>
                <button className="button" disabled={a.busy}>
                  Crea riepilogo di prova
                </button>
              </form>
            </details>
          )}
        </aside>
      </div>
      <article className="panel income-shares">
        <h3>Con chi hai condiviso il riepilogo</h3>
        <p>
          Ogni condivisione riguarda un proprietario e un invito. Il riepilogo
          non è più visibile se lo ritiri, scade, segnali un errore o l’invito
          viene chiuso. Puoi anche interrompere una singola condivisione.
        </p>
        {l.data.shares.length === 0 ? (
          <p>
            Non hai condiviso il riepilogo con nessuno. Pubblicare il profilo
            non rende visibile il tuo reddito.
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
                      ? "Condivisione interrotta"
                      : s.available === false
                        ? "Riepilogo non più visibile"
                        : "Riepilogo condiviso"}
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
                      }, "Condivisione interrotta per questo proprietario.")
                    }
                  >
                    Interrompi la condivisione
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
                <strong>Con chi condividi:</strong>{" "}
                {otherName || `Proprietario dell’immobile «${propertyTitle}»`} ·
                invito {invitationId.slice(0, 8)}.
              </p>
              {shared ? (
                <>
                  <p role="status">
                    Hai condiviso questo esempio con il proprietario di questo
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
                      }, "Condivisione interrotta per questo proprietario.")
                    }
                  >
                    Interrompi la condivisione
                  </button>
                </>
              ) : l.data?.can_share ? (
                <>
                  <h3>Anteprima per questo proprietario</h3>
                  <IncomeSummary value={l.data.attestation} />
                  <p id={id}>
                    Solo il proprietario di questo invito potrà vedere il
                    riepilogo. Nessun documento o conto viene condiviso. Puoi
                    interrompere la condivisione quando vuoi, ma non puoi
                    cancellare eventuali copie già salvate.
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
                    Puoi continuare senza verificare il reddito. Per condividere
                    serve un esempio completato e in corso di validità.
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
              Qui vedrai il riepilogo del reddito solo se la persona sceglie di
              condividerlo con te. Se non c’è, non significa che la persona non
              possa pagare l’affitto: puoi continuare la conversazione.
            </p>
          )}
        </div>
      )}
    </details>
  );
}
