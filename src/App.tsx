import {
  useEffect,
  useRef,
  useState,
  useId,
  createContext,
  useContext,
  type FormEvent,
  type ReactNode,
} from "react";
import { api, useLoad, formValues, dateLabel, ApiError } from "./api";
import { brand, statuses, reasonLabels } from "./brand";
import { cities } from "../server/domain";
import type { User } from "../server/auth";
type RuntimeConfig = {
  environment: "local" | "staging" | "production";
  mailTransport: "local" | "smtp";
};
const RuntimeContext = createContext<RuntimeConfig | null>(null);
function validRuntime(value: unknown): RuntimeConfig | null {
  if (!value || typeof value !== "object") return null;
  const config = value as Partial<RuntimeConfig>;
  return ["local", "staging", "production"].includes(
    config.environment || "",
  ) && ["local", "smtp"].includes(config.mailTransport || "")
    ? (config as RuntimeConfig)
    : null;
}
function verificationInstructions(runtime: RuntimeConfig | null) {
  if (runtime?.mailTransport === "local")
    return "Il link è nel messaggio locale disponibile all’operatore. Nessuna email viene inviata: questa conferma non prova il controllo di una casella reale, l’identità o il reddito.";
  if (runtime?.mailTransport === "smtp")
    return "Apri il link di conferma dalla tua casella email. Controlla anche la cartella spam. La conferma riguarda l’indirizzo email, non l’identità o il reddito.";
  return "Apri un link di conferma valido per confermare l’indirizzo. Questa conferma non verifica l’identità o il reddito.";
}
const initialDay = () =>
  new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
function go(path: string) {
  history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
function Link({
  to,
  children,
  className = "",
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      className={className}
      href={to}
      onClick={(e) => {
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
          e.preventDefault();
          go(to);
        }
      }}
    >
      {children}
    </a>
  );
}
function Mark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 36 36">
        <path d="M8 29V15a10 10 0 0 1 20 0v14M5 29h26M18 29V17h6" />
      </svg>
    </span>
  );
}
function ErrorBox({ text }: { text: string | ApiError }) {
  const id = useId(),
    ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!text) return;
    ref.current?.focus();
    const inputs: HTMLElement[] = [];
    if (text instanceof ApiError)
      for (const detail of text.details) {
        if (!detail.field) continue;
        document
          .querySelectorAll<HTMLElement>(`[name="${CSS.escape(detail.field)}"]`)
          .forEach((input) => {
            input.setAttribute("aria-invalid", "true");
            input.setAttribute("aria-describedby", id);
            inputs.push(input);
          });
      }
    return () =>
      inputs.forEach((input) => {
        input.removeAttribute("aria-invalid");
        input.removeAttribute("aria-describedby");
      });
  }, [text, id]);
  return text ? (
    <div ref={ref} id={id} tabIndex={-1} role="alert" className="alert error">
      {text instanceof ApiError ? (
        <>
          {text.message}
          {text.details.length > 0 && (
            <ul>
              {text.details.map((d, i) => (
                <li key={i}>{d.message}</li>
              ))}
            </ul>
          )}
        </>
      ) : (
        text
      )}
    </div>
  ) : null;
}
function Notice({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="alert success">
      {children}
    </div>
  );
}
function Empty({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="empty">
      <span aria-hidden="true" className="empty-icon">
        <Arrow />
      </span>
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
}
function Loading() {
  return (
    <p role="status" className="loading">
      Un momento, stiamo caricando…
    </p>
  );
}
function Badge({ status }: { status: string }) {
  return (
    <span className={"badge " + status}>{statuses[status] || status}</span>
  );
}
function Field({
  label,
  name,
  type = "text",
  value,
  required = true,
  min,
  max,
  children,
  autoComplete,
}: {
  autoComplete?: string;
  label: string;
  name: string;
  type?: string;
  value?: string | number;
  required?: boolean;
  min?: number;
  max?: number;
  children?: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children || (
        <input
          name={name}
          type={type}
          defaultValue={value}
          required={required}
          min={min}
          max={max}
          autoComplete={
            autoComplete ??
            (type === "email"
              ? "email"
              : type === "password"
                ? "current-password"
                : undefined)
          }
          minLength={
            type === "password"
              ? 12
              : name === "title"
                ? 5
                : name === "display_name" || name === "area"
                  ? 2
                  : undefined
          }
          maxLength={type === "password" ? 128 : undefined}
        />
      )}
    </label>
  );
}
function City({ value }: { value?: string }) {
  return (
    <Field name="city" label="Città">
      <select name="city" defaultValue={value || "Bologna"}>
        {cities.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
    </Field>
  );
}
function PageHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1 tabIndex={-1}>{title}</h1>
      {children && <p>{children}</p>}
    </div>
  );
}
function Checks({ value }: { value: any }) {
  return value ? (
    <ul className="checks">
      {value.checks.map((c: any) => (
        <li key={c.key}>
          <span aria-hidden="true">{c.matches ? "✓" : "–"}</span>
          <div>
            <strong>{c.label}</strong>
            <small>{c.detail}</small>
          </div>
        </li>
      ))}
    </ul>
  ) : null;
}
function useAction() {
  const [error, setError] = useState<string | ApiError>(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function run(
    fn: () => Promise<unknown>,
    success = "Operazione completata.",
  ) {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      await fn();
      setMessage(success);
    } catch (e) {
      setError(e instanceof ApiError ? e : (e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return { error, message, busy, run };
}

export function App() {
  const config = useLoad<unknown>("/config"),
    runtime = validRuntime(config.data);
  const [path, setPath] = useState(location.pathname),
    [user, setUser] = useState<User | null>(null),
    [ready, setReady] = useState(false),
    [sessionError, setSessionError] = useState("");
  async function refresh() {
    setSessionError("");
    try {
      setUser((await api("/session")).user);
    } catch {
      setSessionError(
        "Impossibile verificare l’accesso. Controlla la connessione e riprova.",
      );
    } finally {
      setReady(true);
    }
  }
  useEffect(() => {
    void refresh();
    const change = () => setPath(location.pathname);
    window.addEventListener("popstate", change);
    return () => window.removeEventListener("popstate", change);
  }, []);
  useEffect(() => {
    const titles: Record<string, string> = {
      "/dashboard": "Il tuo spazio",
      "/profile": "Il mio profilo",
      "/properties": "Immobili",
      "/discover": "Scopri profili",
      "/invitations": "Inviti",
      "/settings": "Account",
      "/staff": "Segnalazioni",
    };
    document.title = `${brand.name} — ${titles[path] || brand.tagline}`;
    window.scrollTo(0, 0);
    const focus = () => {
      const heading = document.querySelector<HTMLElement>("h1");
      if (heading) {
        heading.focus();
        return true;
      }
      return false;
    };
    if (focus()) return;
    const observer = new MutationObserver(() => {
      if (focus()) observer.disconnect();
    });
    observer.observe(document.getElementById("main") || document.body, {
      subtree: true,
      childList: true,
    });
    return () => observer.disconnect();
  }, [path, ready]);
  const privatePath = ![
    "/",
    "/login",
    "/register",
    "/forgot",
    "/safeguards",
    "/account/verify",
    "/account/reset",
  ].includes(path);
  return (
    <RuntimeContext.Provider value={runtime}>
      <a className="skip-link" href="#main">
        Vai al contenuto
      </a>
      {runtime?.environment === "local" ? (
        <div className="environment">
          Ambiente dimostrativo · dati sintetici · nessun annuncio reale
        </div>
      ) : runtime?.environment === "staging" ? (
        <div className="environment">
          Ambiente di test · non usare dati o documenti reali
        </div>
      ) : null}
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo">
            <Mark />
            {brand.name}
            <span className="brand-dot">.</span>
          </Link>
          <nav aria-label="Navigazione principale">
            {user ? (
              <>
                <Link to="/dashboard">Il tuo spazio</Link>
                <Link to="/settings" className="account-link">
                  Account <Arrow />
                </Link>
              </>
            ) : (
              <>
                <Link to="/safeguards" className="nav-secondary">
                  Come funziona
                </Link>
                <Link to="/login">Accedi</Link>
                <Link to="/register" className="button small">
                  Inizia qui <Arrow />
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      {user && privatePath && (
        <div className="subnav">
          <nav aria-label="Il tuo spazio">
            <Link
              to="/dashboard"
              className={path === "/dashboard" ? "active" : ""}
            >
              Panoramica
            </Link>
            {user.role !== "landlord" && (
              <Link
                to="/profile"
                className={path === "/profile" ? "active" : ""}
              >
                Il mio profilo
              </Link>
            )}
            {user.role !== "tenant" && (
              <>
                <Link
                  to="/properties"
                  className={path === "/properties" ? "active" : ""}
                >
                  Immobili
                </Link>
                <Link
                  to="/discover"
                  className={path === "/discover" ? "active" : ""}
                >
                  Scopri profili
                </Link>
              </>
            )}
            <Link
              to="/invitations"
              className={path === "/invitations" ? "active" : ""}
            >
              Inviti e messaggi
            </Link>
            <Link
              to="/verification"
              className={path === "/verification" ? "active" : ""}
            >
              Verifiche
            </Link>
            {user.staff_role && (
              <Link
                to="/staff"
                className={path.startsWith("/staff") ? "active" : ""}
              >
                Gestione
              </Link>
            )}
          </nav>
        </div>
      )}
      <main id="main" className={path === "/" ? "" : "container main"}>
        {sessionError ? (
          <>
            <PageHeading
              eyebrow="Accesso"
              title="Un momento, la connessione."
            />
            <ErrorBox text={sessionError} />
            <button className="button" onClick={() => void refresh()}>
              Riprova
            </button>
          </>
        ) : !ready && privatePath ? (
          <Loading />
        ) : user?.suspended && privatePath && path !== "/settings" ? (
          <Suspended user={user} />
        ) : privatePath && !user ? (
          <>
            <PageHeading eyebrow="Il tuo spazio" title="Bentornato a casa." />
            <Empty title="Accedi per continuare">
              <p>I profili e le conversazioni sono privati.</p>
              <Link to="/login" className="button">
                Accedi
              </Link>
            </Empty>
          </>
        ) : path === "/" ? (
          <Landing />
        ) : path === "/safeguards" ? (
          <Safeguards />
        ) : path === "/login" || path === "/register" ? (
          <Auth register={path === "/register"} refresh={refresh} />
        ) : path === "/forgot" || path.startsWith("/account/") ? (
          <Recovery key={path} path={path} refresh={refresh} />
        ) : path === "/dashboard" ? (
          <Dashboard user={user!} />
        ) : path === "/profile" ? (
          <ProfilePage />
        ) : path === "/properties" ? (
          <PropertiesPage />
        ) : path === "/discover" ? (
          <DiscoverPage />
        ) : path === "/invitations" ? (
          <InvitationsPage user={user!} />
        ) : path.startsWith("/conversations/") ? (
          <Conversation id={path.split("/")[2]} user={user!} />
        ) : path === "/verification" ? (
          <VerificationPage />
        ) : path === "/settings" ? (
          <Settings user={user!} refresh={refresh} />
        ) : path.startsWith("/staff") ? (
          <Staff key={path} path={path} user={user!} />
        ) : (
          <>
            <PageHeading eyebrow="404" title="Questa porta non si apre." />
            <Link to="/dashboard" className="button">
              Torna al tuo spazio
            </Link>
          </>
        )}
      </main>
      <footer className="footer">
        <div>
          <Link to="/" className="logo">
            <Mark />
            {brand.name}.
          </Link>
          <p>Più chiarezza. Il tuo prossimo inizio.</p>
        </div>
        <div>
          <Link to="/safeguards">Controllo e trasparenza</Link>
          <p>
            {runtime?.environment === "local"
              ? "Prototipo locale · nome di lavoro"
              : runtime?.environment === "staging"
                ? "Ambiente di test · nome di lavoro"
                : "Nome di lavoro"}
          </p>
        </div>
      </footer>
    </RuntimeContext.Provider>
  );
}
function Landing() {
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="tiny-line" /> Affittare, con un altro punto di
            vista
          </span>
          <h1 tabIndex={-1}>
            La prossima casa
            <br />
            comincia <em>da te.</em>
          </h1>
          <p className="hero-description">
            Racconta cosa cerchi. Lascia che siano i proprietari a invitarti.
            Scegli tu con chi iniziare una conversazione.
          </p>
          <div className="actions">
            <Link to="/register" className="button">
              Cerco casa <Arrow />
            </Link>
            <Link to="/register?role=landlord" className="text-link">
              Offro un immobile <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="hero-note">
            <span className="leaf" aria-hidden="true">
              ✳
            </span>
            <span>
              Il tuo profilo, le tue scelte.
              <br />
              <strong>Nessun costo per ricevere inviti.</strong>
            </span>
          </div>
        </div>
        <div
          className="hero-visual"
          aria-label="Illustrazione del percorso: preferenze, invito e conversazione"
        >
          <div className="arch">
            <div className="arch-window">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="arch-floor" />
            <div className="plant">
              <i />
              <i />
              <i />
              <b />
            </div>
          </div>
          <div className="floating-card profile-example">
            <span className="mini-label">ESEMPIO DI PROFILO</span>
            <div className="example-line">
              <span className="abstract-avatar" aria-hidden="true">
                ⌂
              </span>
              <div>
                <strong>Un nuovo inizio a Bologna</strong>
                <small>2 persone · da novembre</small>
              </div>
            </div>
            <div className="tags">
              <span>Fino a €1.100 / mese</span>
              <span>12 mesi</span>
            </div>
          </div>
          <div className="floating-card invite-example">
            <span className="circle-check" aria-hidden="true">
              <Arrow />
            </span>
            <div>
              <span className="mini-label">IL PRIMO PASSO</span>
              <strong>Un invito che ti somiglia.</strong>
              <small>Tu decidi se aprire la conversazione.</small>
            </div>
          </div>
          <span className="visual-caption">
            Meno rincorse, più incontri pertinenti.
          </span>
        </div>
      </section>
      <section className="principles">
        <div className="container principle-row">
          <span>Preferenze chiare</span>
          <i aria-hidden="true">✳</i>
          <span>Inviti legati a un immobile</span>
          <i aria-hidden="true">✳</i>
          <span>Condivisione sotto controllo</span>
        </div>
      </section>
      <section className="container how">
        <div className="section-heading">
          <span className="eyebrow">COME FUNZIONA</span>
          <h2>Tre passi. Una nuova possibilità.</h2>
          <p>
            Un modo più semplice di iniziare, da entrambi i lati della porta.
          </p>
        </div>
        <div className="steps">
          {[
            [
              "01",
              "Prepara il tuo profilo",
              "Città, budget, tempi e persone. Parti dalle cose che contano e pubblica solo quando sei pronto.",
            ],
            [
              "02",
              "Ricevi un invito pertinente",
              "Un proprietario vede le preferenze compatibili con il suo immobile e ti invita a parlarne.",
            ],
            [
              "03",
              "Apri la conversazione",
              "Leggi l’offerta, scegli se accettare e inizia a conoscere chi c’è dall’altra parte.",
            ],
          ].map(([n, t, d]) => (
            <article key={n}>
              <span className="step-number">{n}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="container trust-section">
        <div>
          <span className="eyebrow">
            SPAZIO ALLA FIDUCIA, SENZA SCORCIATOIE
          </span>
          <h2>
            Le persone non
            <br />
            sono un punteggio.
          </h2>
        </div>
        <div>
          <p>
            La compatibilità riguarda le preferenze e l’immobile. Nessuna
            classifica di affidabilità, nessuna promessa sulla solvibilità.
          </p>
          <p>
            Prima del match, il tuo nome e la tua email restano privati. Puoi
            mettere in pausa il profilo, bloccare un contatto o segnalare un
            problema.
          </p>
          <Link to="/safeguards" className="text-link">
            Scopri cosa condividi <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
function Safeguards() {
  const runtime = useContext(RuntimeContext);
  return (
    <>
      <PageHeading
        eyebrow="Come funziona"
        title="Chiarezza, prima del primo messaggio."
      >
        Tu scegli quando renderti visibile e con chi parlare.
      </PageHeading>
      <div className="three-grid">
        <article className="panel">
          <span className="step-number">01</span>
          <h2>Prima dell’invito</h2>
          <p>
            I proprietari con un immobile pubblicato vedono solo città, budget
            totale, ingresso, durata e numero di persone. Il profilo usa un
            identificatore, non il tuo nome.
          </p>
        </article>
        <article className="panel">
          <span className="step-number">02</span>
          <h2>Quando accetti</h2>
          <p>
            Entrambe le parti vedono il nome scelto, che può essere uno
            pseudonimo, e possono scriversi. Email e documenti non vengono
            condivisi automaticamente.
          </p>
        </article>
        <article className="panel">
          <span className="step-number">03</span>
          <h2>Se cambi idea</h2>
          <p>
            Una pausa annulla gli inviti pendenti e ferma nuovi contatti. Le
            conversazioni già accettate restano disponibili finché non le chiudi
            o blocchi il contatto.
          </p>
        </article>
      </div>
      <div className="panel narrow">
        <h2>Cosa significa compatibile?</h2>
        <p>
          Confrontiamo città, costo totale mensile, ingresso, durata e capienza.
          Ogni criterio è spiegato; non usiamo reddito, età, origine, lingua o
          verifiche per ordinare le persone.
        </p>
        <h2>Verifiche e segnalazioni</h2>
        <p>
          {verificationInstructions(runtime)} I servizi di verifica d’identità e
          reddito non sono disponibili. L’autorizzazione a offrire un immobile è
          autodichiarata.
        </p>
        <p>
          Una segnalazione rende visibili agli operatori la tua identità di
          account, l’invito, il motivo e l’eventuale messaggio selezionato. Non
          apre l’intera conversazione.
        </p>
        {runtime?.environment === "local" ? (
          <>
            <h2>Una dimostrazione locale</h2>
            <p>
              Questo ambiente contiene esempi sintetici: non caricare dati o
              documenti reali. Non è un servizio aperto al pubblico. Prima del
              lancio serviranno un titolare operativo, assistenza e condizioni e
              informative definitive.
            </p>
          </>
        ) : runtime?.environment === "staging" ? (
          <>
            <h2>Un ambiente di test</h2>
            <p>
              Usa questo ambiente per provare il servizio con dati di esempio.
              Non caricare dati o documenti reali.
            </p>
          </>
        ) : (
          <>
            <h2>Il controllo resta tuo</h2>
            <p>
              Pubblica solo le preferenze e gli immobili che vuoi condividere.
              Non inserire documenti, credenziali bancarie o dati finanziari nei
              messaggi. Non gestiamo pagamenti o contratti di affitto.
            </p>
          </>
        )}
        <Link to="/register" className="button">
          Crea il tuo spazio
        </Link>
      </div>
    </>
  );
}
function Auth({
  register,
  refresh,
}: {
  register: boolean;
  refresh: () => Promise<void>;
}) {
  const a = useAction();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = formValues(e.currentTarget);
    await a.run(async () => {
      await api(register ? "/auth/register" : "/auth/login", "POST", v);
      await refresh();
      go("/dashboard");
    });
  }
  return (
    <div className="auth-layout">
      <div className="auth-intro">
        <span className="eyebrow">IL TUO PROSSIMO INIZIO</span>
        <h1 tabIndex={-1}>
          {register
            ? "Facciamo spazio\nal tuo progetto."
            : "Bentornato\nnel tuo spazio."}
        </h1>
        <p>
          {register
            ? "Cerchi casa, offri un immobile o entrambe le cose? Comincia da qui."
            : "Riprendi le conversazioni e ritrova le tue preferenze."}
        </p>
        <div className="auth-art" aria-hidden="true">
          <Mark />
        </div>
      </div>
      <form
        className="panel auth-form"
        onSubmit={submit}
        key={String(register)}
      >
        <h2>{register ? "Crea un account" : "Accedi"}</h2>
        <ErrorBox text={a.error} />
        {register && (
          <Field name="display_name" label="Come vuoi essere chiamato?" />
        )}
        <Field name="email" label="Email" type="email" />
        <Field
          name="password"
          label="Password"
          type="password"
          autoComplete={register ? "new-password" : "current-password"}
        />
        {register && (
          <>
            <p className="field-hint">
              Almeno 12 caratteri. Il nome può essere uno pseudonimo.
            </p>
            <Field name="role" label="Il tuo progetto">
              <select
                name="role"
                defaultValue={
                  new URLSearchParams(location.search).get("role") ===
                  "landlord"
                    ? "landlord"
                    : "tenant"
                }
              >
                <option value="tenant">Cerco casa</option>
                <option value="landlord">Offro un immobile</option>
                <option value="both">Entrambe le cose</option>
              </select>
            </Field>
            <p className="small-copy">
              Il profilo sarà privato finché non scegli di pubblicarlo.{" "}
              <Link to="/safeguards">Leggi cosa condividi.</Link>
            </p>
          </>
        )}
        <button className="button full" disabled={a.busy}>
          {a.busy
            ? "Un momento…"
            : register
              ? "Crea account"
              : "Entra nel tuo spazio"}{" "}
          <span aria-hidden="true">→</span>
        </button>
        {!register && (
          <Link to="/forgot" className="muted-link">
            Password dimenticata?
          </Link>
        )}
        <p className="small-copy">
          {register ? "Hai già un account?" : "È il tuo primo accesso?"}{" "}
          <Link to={register ? "/login" : "/register"}>
            {register ? "Accedi" : "Crea account"}
          </Link>
        </p>
      </form>
    </div>
  );
}
function Recovery({
  path,
  refresh,
}: {
  path: string;
  refresh: () => Promise<void>;
}) {
  const a = useAction(),
    runtime = useContext(RuntimeContext);
  const [secret] = useState(() =>
    /^[a-f0-9]{64}$/.test(location.hash.slice(1)) ? location.hash.slice(1) : "",
  );
  useEffect(() => {
    if (location.hash) history.replaceState({}, "", location.pathname);
  }, []);
  const verify = path.endsWith("/verify"),
    reset = path.endsWith("/reset");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = formValues(e.currentTarget);
    await a.run(
      async () => {
        await api(
          verify ? "/auth/verify" : reset ? "/auth/reset" : "/auth/forgot",
          "POST",
          verify
            ? { token: secret }
            : reset
              ? { token: secret, password: v.password }
              : v,
        );
        await refresh();
      },
      verify
        ? runtime?.mailTransport === "local"
          ? "Conferma locale completata. Puoi continuare nel tuo spazio."
          : runtime?.mailTransport === "smtp"
            ? "Email confermata. Puoi continuare nel tuo spazio."
            : "Conferma completata. Puoi continuare nel tuo spazio."
        : reset
          ? "Password aggiornata. Accedi con la nuova password."
          : runtime?.mailTransport === "local"
            ? "Se l’indirizzo è registrato, le istruzioni sono nel messaggio locale disponibile all’operatore. Nessuna email viene inviata."
            : runtime?.mailTransport === "smtp"
              ? "Se l’indirizzo è registrato, controlla la tua casella email e la cartella spam per le istruzioni di recupero."
              : "Se l’indirizzo è registrato, la richiesta di recupero è stata ricevuta.",
    );
  }
  return (
    <div className="narrow">
      <PageHeading
        eyebrow="Accesso sicuro"
        title={
          verify
            ? "Conferma la tua email."
            : reset
              ? "Un nuovo accesso."
              : "Ritrova il tuo spazio."
        }
      />
      <form className="panel" onSubmit={submit}>
        <ErrorBox text={a.error} />
        {a.message ? (
          <>
            <Notice>{a.message}</Notice>
            <Link to={verify ? "/dashboard" : "/login"} className="button">
              Continua
            </Link>
          </>
        ) : (
          <>
            {verify ? (
              <p>{verificationInstructions(runtime)}</p>
            ) : (
              <Field
                name={reset ? "password" : "email"}
                type={reset ? "password" : "email"}
                autoComplete={reset ? "new-password" : "email"}
                label={
                  reset
                    ? "Nuova password (almeno 12 caratteri)"
                    : "La tua email"
                }
              />
            )}
            <button
              className="button"
              disabled={a.busy || ((verify || reset) && !secret)}
            >
              {verify
                ? "Conferma email"
                : reset
                  ? "Salva password"
                  : "Invia istruzioni"}
            </button>
            {(verify || reset) && !secret && (
              <p role="alert">
                {runtime?.mailTransport === "local"
                  ? "Apri il link completo del messaggio locale."
                  : "Apri il link completo di conferma o recupero."}{" "}
                <Link to="/forgot">Richiedi un nuovo recupero</Link> oppure{" "}
                <Link to="/verification">reinvia la conferma</Link>.
              </p>
            )}
          </>
        )}
      </form>
    </div>
  );
}
function Dashboard({ user }: { user: User }) {
  const inv = useLoad("/dashboard"),
    runtime = useContext(RuntimeContext);
  const pending = inv.data?.pending ?? "—",
    accepted = inv.data?.accepted ?? "—";
  return (
    <>
      <PageHeading
        eyebrow="IL TUO SPAZIO"
        title={`Ciao, ${user.display_name}.`}
      >
        Un passo alla volta, verso il tuo prossimo incontro.
      </PageHeading>
      {!user.email_verified && (
        <div className="alert">
          <strong>Conferma la tua email per pubblicare e contattare.</strong>{" "}
          {verificationInstructions(runtime)}{" "}
          <Link to="/verification">Vai alle verifiche →</Link>
        </div>
      )}
      <div className="dashboard-stats">
        <div>
          <span className="stat-number">{pending}</span>
          <span>Inviti in attesa</span>
        </div>
        <div>
          <span className="stat-number">{accepted}</span>
          <span>Conversazioni aperte</span>
        </div>
        <div className="stat-note">
          <span aria-hidden="true">✳</span>
          <p>
            Le tue scelte restano tue.
            <br />
            Puoi fermarti quando vuoi.
          </p>
        </div>
      </div>
      <ErrorBox text={inv.error} />
      <div className="two-grid">
        {user.role !== "landlord" && (
          <article className="feature-card">
            <span className="eyebrow">CERCO CASA</span>
            <h2>
              Una casa che incontra
              <br />
              le tue preferenze.
            </h2>
            <p>
              Racconta cosa cerchi. Il tuo nome resta privato prima di un invito
              accettato.
            </p>
            <Link to="/profile" className="button">
              Prepara il tuo profilo <Arrow />
            </Link>
          </article>
        )}
        {user.role !== "tenant" && (
          <article className="feature-card warm">
            <span className="eyebrow">OFFRO UN IMMOBILE</span>
            <h2>
              Incontra chi cerca
              <br />
              proprio quello spazio.
            </h2>
            <p>
              Pubblica le caratteristiche dell’immobile e scopri preferenze
              compatibili.
            </p>
            <Link to="/properties" className="button">
              I tuoi immobili <Arrow />
            </Link>
          </article>
        )}
        <article className="panel">
          <span className="eyebrow">DA UN INVITO A UN INCONTRO</span>
          <h2>
            La conversazione
            <br />
            inizia con una scelta.
          </h2>
          <p>
            Leggi gli inviti, controlla i dettagli e decidi se iniziare a
            parlare.
          </p>
          <Link to="/invitations" className="text-link">
            Apri inviti e messaggi →
          </Link>
        </article>
      </div>
    </>
  );
}
function ProfilePage() {
  const l = useLoad("/profile"),
    a = useAction();
  if (l.error) return <ErrorBox text={l.error} />;
  if (!l.data) return <Loading />;
  const p = l.data.profile;
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = formValues(e.currentTarget);
    await a.run(async () => {
      await api("/profile", "PUT", {
        ...v,
        budget: Number(v.budget),
        duration: Number(v.duration),
        occupants: Number(v.occupants),
      });
      l.reload();
    }, "Preferenze salvate. Gli eventuali inviti pendenti sono stati annullati.");
  }
  async function status(value: string) {
    await a.run(
      async () => {
        await api("/profile/status", "POST", { status: value });
        l.reload();
      },
      value === "published"
        ? "Il tuo profilo è visibile ai proprietari con un immobile pertinente."
        : "Profilo in pausa. Nessun nuovo invito e inviti pendenti annullati.",
    );
  }
  return (
    <>
      <PageHeading eyebrow="CERCO CASA" title="Partiamo da ciò che cerchi.">
        Poche preferenze concrete. Nessun punteggio su di te.
      </PageHeading>
      <ErrorBox text={a.error} />
      {a.message && <Notice>{a.message}</Notice>}
      <div className="form-layout">
        <form className="panel" onSubmit={save} key={p?.revision || 0}>
          <div className="panel-title">
            <h2>Le tue preferenze</h2>
            <Badge status={p?.status || "draft"} />
          </div>
          <div className="form-grid">
            <City value={p?.city} />
            <Field
              name="budget"
              label="Budget totale mensile (€), spese obbligatorie incluse"
              type="number"
              value={p?.budget || 1000}
              min={100}
              max={20000}
            />
            <Field
              name="move_in"
              label="Giorno desiderato di ingresso"
              type="date"
              value={p?.move_in || initialDay()}
            />
            <Field
              name="duration"
              label="Durata desiderata (mesi)"
              type="number"
              value={p?.duration || 12}
              min={1}
              max={120}
            />
            <Field
              name="occupants"
              label="Numero totale di persone"
              type="number"
              value={p?.occupants || 1}
              min={1}
              max={12}
            />
          </div>
          <p className="field-hint">
            Una modifica annulla gli inviti ancora in attesa. Le conversazioni
            già aperte restano disponibili.
          </p>
          <button className="button" disabled={a.busy}>
            Salva preferenze
          </button>
        </form>
        <aside className="panel preview">
          <span className="eyebrow">PRIMA DI PUBBLICARE</span>
          <h2>
            Questo è ciò
            <br />
            che condividi.
          </h2>
          <p>
            Città, budget, ingresso, durata e numero di persone saranno visibili
            ai proprietari autenticati con un immobile pertinente.
          </p>
          <p>
            <strong>
              Nome, email e verifiche restano esclusi dalla scoperta.
            </strong>
          </p>
          {p && (
            <div className="profile-summary">
              <strong>{p.city}</strong>
              <p>
                Fino a €{p.budget} al mese · {p.occupants} persone
              </p>
              <p>
                Dal {dateLabel(p.move_in)} · {p.duration} mesi
              </p>
            </div>
          )}
          {p ? (
            <>
              <button
                className="button full"
                disabled={a.busy}
                onClick={() =>
                  status(p.status === "published" ? "paused" : "published")
                }
              >
                {p.status === "published"
                  ? "Metti in pausa e annulla inviti"
                  : "Pubblica queste preferenze"}
              </button>
              <small>
                La pausa ferma la scoperta e annulla gli inviti pendenti. Puoi
                pubblicare di nuovo.
              </small>
            </>
          ) : (
            <p className="field-hint">
              Salva le preferenze per vederne l’anteprima e pubblicarle.
            </p>
          )}
        </aside>
      </div>
    </>
  );
}
function PropertyForm({
  property,
  onDone,
}: {
  property?: any;
  onDone: () => void;
}) {
  const a = useAction(),
    formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    formRef.current?.querySelector<HTMLInputElement>("input")?.focus();
  }, []);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = formValues(e.currentTarget);
    const p = {
      ...v,
      rent: Number(v.rent),
      min_months: Number(v.min_months),
      max_months: Number(v.max_months),
      capacity: Number(v.capacity),
      sqm: Number(v.sqm),
      rooms: Number(v.rooms),
      furnished: v.furnished === "on",
      authority_attested: v.authority_attested === "on",
    };
    await a.run(async () => {
      await api(
        property ? `/properties/${property.id}` : "/properties",
        property ? "PUT" : "POST",
        p,
      );
      onDone();
    });
  }
  return (
    <form ref={formRef} className="panel" onSubmit={save}>
      <h2>{property ? "Modifica immobile" : "Descrivi il tuo immobile"}</h2>
      <ErrorBox text={a.error} />
      <Field name="title" label="Titolo" value={property?.title} />
      <div className="form-grid">
        <City value={property?.city} />
        <Field
          name="area"
          label="Quartiere o zona (senza indirizzo preciso)"
          value={property?.area}
        />
        <Field
          name="rent"
          label="Costo totale mensile (€), spese obbligatorie incluse"
          type="number"
          value={property?.rent || 850}
          min={100}
          max={20000}
        />
        <Field
          name="available_from"
          label="Disponibile dal"
          type="date"
          value={property?.available_from || initialDay()}
        />
        <Field
          name="min_months"
          label="Durata minima (mesi)"
          type="number"
          value={property?.min_months || 6}
          min={1}
          max={120}
        />
        <Field
          name="max_months"
          label="Durata massima (mesi)"
          type="number"
          value={property?.max_months || 36}
          min={1}
          max={120}
        />
        <Field
          name="capacity"
          label="Capienza totale (persone)"
          type="number"
          value={property?.capacity || 2}
          min={1}
          max={12}
        />
        <Field
          name="sqm"
          label="Superficie (m²)"
          type="number"
          value={property?.sqm || 60}
          min={10}
          max={2000}
        />
        <Field
          name="rooms"
          label="Numero locali"
          type="number"
          value={property?.rooms || 2}
          min={1}
          max={20}
        />
      </div>
      <Field name="description" label="Descrizione">
        <textarea
          name="description"
          rows={4}
          minLength={10}
          maxLength={1500}
          required
          defaultValue={property?.description}
          placeholder="Descrivi gli spazi e le condizioni, senza dati personali o richieste discriminatorie."
        />
      </Field>
      <label className="check-label">
        <input
          type="checkbox"
          name="furnished"
          defaultChecked={property?.furnished}
        />{" "}
        Arredato
      </label>
      <label className="check-label">
        <input
          type="checkbox"
          name="authority_attested"
          defaultChecked={property?.authority_attested}
        />{" "}
        Dichiaro di essere autorizzato a offrire questo immobile.
      </label>
      <p className="field-hint">
        È un’autodichiarazione, non una verifica di proprietà. Le modifiche
        annullano gli inviti pendenti.
      </p>
      <div className="actions">
        <button className="button" disabled={a.busy}>
          Salva immobile
        </button>
        <button type="button" className="button secondary" onClick={onDone}>
          Annulla
        </button>
      </div>
    </form>
  );
}
function PropertiesPage() {
  const l = useLoad("/properties"),
    a = useAction();
  const [edit, setEdit] = useState<any>(undefined);
  async function status(p: any) {
    await a.run(async () => {
      await api(`/properties/${p.id}/status`, "POST", {
        status: p.status === "published" ? "paused" : "published",
      });
      l.reload();
    });
  }
  return (
    <>
      <PageHeading
        eyebrow="OFFRO UN IMMOBILE"
        title="Ogni spazio, una possibilità."
      >
        Pubblica dettagli chiari. Riconferma la disponibilità almeno ogni 30
        giorni.
      </PageHeading>
      <ErrorBox text={l.error || a.error} />
      {a.message && <Notice>{a.message}</Notice>}
      {edit !== undefined ? (
        <PropertyForm
          property={edit}
          onDone={() => {
            setEdit(undefined);
            l.reload();
          }}
        />
      ) : (
        <>
          <div className="toolbar">
            <span>
              {l.data?.properties.length || 0} immobili nel tuo spazio
            </span>
            <button className="button" onClick={() => setEdit(null)}>
              + Aggiungi immobile
            </button>
          </div>
          {!l.data && !l.error ? (
            <Loading />
          ) : l.data?.properties.length === 0 ? (
            <Empty title="La tua prima porta da aprire">
              <p>Aggiungi un immobile per scoprire preferenze compatibili.</p>
            </Empty>
          ) : (
            <div className="two-grid">
              {l.data?.properties.map((p: any) => (
                <article className="property-card panel" key={p.id}>
                  <div className="property-art" aria-hidden="true">
                    <span className="building">
                      <i />
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className="property-art-text">{p.city}</span>
                  </div>
                  <div className="panel-title">
                    <span className="eyebrow">
                      {p.city} · {p.area}
                    </span>
                    <Badge status={p.status} />
                  </div>
                  <h2>{p.title}</h2>
                  <p className="price">
                    €{p.rent}
                    <small> / mese, spese incluse</small>
                  </p>
                  <p>
                    {p.sqm} m² · {p.rooms} locali · fino a {p.capacity} persone
                  </p>
                  <p className="small-copy">
                    Disponibile dal {dateLabel(p.available_from)}.
                    Autorizzazione autodichiarata.
                  </p>
                  <p className="field-hint">
                    Mettere in pausa annulla gli inviti pendenti: non potranno
                    essere riaperti. Riconfermare senza modifiche li mantiene
                    validi.
                  </p>
                  <div className="actions wrap">
                    <button
                      className="button secondary small"
                      onClick={() => setEdit(p)}
                    >
                      Modifica
                    </button>
                    <button
                      className="button small"
                      disabled={a.busy}
                      onClick={() => status(p)}
                    >
                      {p.status === "published" ? "Metti in pausa" : "Pubblica"}
                    </button>
                    {p.status === "published" && (
                      <button
                        className="text-link"
                        disabled={a.busy}
                        onClick={() =>
                          a.run(async () => {
                            await api(`/properties/${p.id}/status`, "POST", {
                              status: "published",
                            });
                            l.reload();
                          }, "Disponibilità riconfermata. Gli inviti pendenti restano validi.")
                        }
                      >
                        Riconferma disponibilità
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
function DiscoverPage() {
  const properties = useLoad("/properties"),
    [selected, setSelected] = useState(""),
    [page, setPage] = useState(0),
    [cursors, setCursors] = useState<string[]>([""]);
  const id =
    selected ||
    properties.data?.properties.find((p: any) => p.status === "published")
      ?.id ||
    "";
  const l = useLoad(
      id
        ? `/discover/${id}${cursors[page] ? `?after=${encodeURIComponent(cursors[page])}` : ""}`
        : null,
    ),
    a = useAction();
  async function invite(p: any) {
    await a.run(async () => {
      await api("/invitations", "POST", {
        property_id: id,
        tenant_id: p.id,
        property_revision: l.data.property.revision,
        profile_revision: p.revision,
      });
      l.reload();
    }, "Invito inviato. Il destinatario sceglierà se aprire la conversazione.");
  }
  return (
    <>
      <PageHeading
        eyebrow="INCONTRI POSSIBILI"
        title="Le preferenze incontrano il tuo spazio."
      >
        Criteri chiari, nessuna classifica delle persone.
      </PageHeading>
      <ErrorBox text={properties.error || l.error || a.error} />
      {a.message && <Notice>{a.message}</Notice>}
      {!properties.data ? (
        <Loading />
      ) : !id ? (
        <Empty title="Prima, raccontaci il tuo immobile">
          <p>
            Serve un immobile pubblicato e riconfermato negli ultimi 30 giorni.
          </p>
          <Link to="/properties" className="button">
            Vai agli immobili
          </Link>
        </Empty>
      ) : (
        <>
          <div className="discovery-toolbar">
            <label className="field">
              <span>Stai cercando per</span>
              <select
                value={id}
                onChange={(e) => {
                  setSelected(e.target.value);
                  setPage(0);
                  setCursors([""]);
                }}
              >
                {properties.data.properties
                  .filter((p: any) => p.status === "published")
                  .map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.title} · {p.city}
                    </option>
                  ))}
              </select>
            </label>
            <p>
              Vedi solo preferenze compatibili e profili non ancora invitati.
            </p>
          </div>
          <p className="disclosure">
            Quando un invito viene accettato, entrambi vedrete il nome scelto e
            potrete scrivervi. Email e documenti restano privati.
          </p>
          {!l.data && !l.error ? (
            <Loading />
          ) : l.data?.profiles.length === 0 ? (
            <Empty title="Qui c’è spazio per il prossimo incontro">
              <p>
                Nessun nuovo profilo compatibile in questa pagina. Potresti aver
                già invitato i profili disponibili.
              </p>
              <Link to="/invitations" className="text-link">
                Controlla i tuoi inviti →
              </Link>
              <p>
                Ritorna più avanti o correggi eventuali dati inesatti
                dell’immobile.
              </p>
            </Empty>
          ) : (
            <div className="two-grid">
              {l.data?.profiles.map((p: any) => (
                <article key={p.id} className="panel tenant-card">
                  <div className="panel-title">
                    <span className="abstract-avatar" aria-hidden="true">
                      ⌂
                    </span>
                    <span className="badge">Preferenze compatibili</span>
                  </div>
                  <h2>{p.alias}</h2>
                  <p className="muted">Cerca a {p.city}</p>
                  <Checks value={p.compatibility} />
                  <button
                    className="button full"
                    disabled={a.busy}
                    onClick={() => invite(p)}
                  >
                    Invita per questo immobile <Arrow />
                  </button>
                </article>
              ))}
            </div>
          )}
          <div className="pagination">
            <button
              className="button secondary small"
              disabled={page === 0}
              onClick={() => setPage((x) => x - 1)}
            >
              Precedenti
            </button>
            <span>Pagina {page + 1}</span>
            <button
              className="button secondary small"
              disabled={!l.data?.hasMore}
              onClick={() => {
                setCursors((c) => [...c.slice(0, page + 1), l.data.nextCursor]);
                setPage((x) => x + 1);
              }}
            >
              Successivi
            </button>
          </div>
        </>
      )}
    </>
  );
}
function ReportForm({
  invitationId,
  messageId,
  onDone,
}: {
  invitationId: string;
  messageId?: string;
  onDone: () => void;
}) {
  const a = useAction();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = formValues(e.currentTarget);
    await a.run(async () => {
      await api("/reports", "POST", {
        ...v,
        invitation_id: invitationId,
        ...(messageId ? { message_id: messageId } : {}),
      });
    }, "Segnalazione ricevuta. Puoi anche bloccare il contatto.");
  }
  return (
    <form className="report-form panel" onSubmit={submit}>
      <h3>Segnala un problema</h3>
      <p className="small-copy">
        Gli operatori vedranno il tuo identificatore, questo invito, il motivo e{" "}
        {messageId ? "il messaggio selezionato" : "la tua descrizione"}. Non
        avranno accesso all’intera chat. Non inserire documenti o dati
        sensibili.
      </p>
      <ErrorBox text={a.error} />
      {a.message ? (
        <>
          <Notice>{a.message}</Notice>
          <button type="button" className="button secondary" onClick={onDone}>
            Chiudi
          </button>
        </>
      ) : (
        <>
          <Field label="Motivo" name="reason">
            <select name="reason">
              {["scam", "harassment", "discrimination", "other"].map((x) => (
                <option key={x} value={x}>
                  {reasonLabels[x]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Descrivi il problema" name="details">
            <textarea
              name="details"
              minLength={5}
              maxLength={500}
              required
              rows={3}
            />
          </Field>
          <div className="actions">
            <button className="button" disabled={a.busy}>
              Invia segnalazione
            </button>
            <button type="button" className="button secondary" onClick={onDone}>
              Annulla
            </button>
          </div>
        </>
      )}
    </form>
  );
}
function InvitationsPage({ user }: { user: User }) {
  const [page, setPage] = useState(0),
    l = useLoad(`/invitations?page=${page}`),
    a = useAction(),
    [report, setReport] = useState("");
  async function action(i: any, value: string) {
    await a.run(
      async () => {
        await api(`/invitations/${i.id}/action`, "POST", {
          action: value,
          property_revision: i.property_revision,
          profile_revision: i.profile_revision,
        });
        l.reload();
      },
      value === "accept"
        ? "Invito accettato. La conversazione è aperta."
        : "Invito aggiornato.",
    );
  }
  return (
    <>
      <PageHeading
        eyebrow="IL PRIMO CONTATTO"
        title="Da qui può nascere qualcosa."
      >
        Ogni invito riguarda un immobile preciso. Scegli con calma.
      </PageHeading>
      <HistoryPager
        page={page}
        next={l.data?.invitations.length === 100}
        onChange={setPage}
      />
      <ErrorBox text={l.error || a.error} />
      {a.message && <Notice>{a.message}</Notice>}
      {!l.data && !l.error ? (
        <Loading />
      ) : l.data?.invitations.length === 0 ? (
        <Empty title="Nessun invito, per ora">
          <p>
            {user.role === "landlord"
              ? "Scopri i profili compatibili con il tuo immobile."
              : "Un profilo pubblicato è il primo passo per ricevere un invito."}
          </p>
          <Link
            to={user.role === "landlord" ? "/discover" : "/profile"}
            className="button"
          >
            Il prossimo passo
          </Link>
        </Empty>
      ) : (
        <div className="invitation-list">
          {l.data?.invitations.map((i: any) => (
            <article className="panel invitation-card" key={i.id}>
              <div className="panel-title">
                <span className="eyebrow">
                  {i.tenant_id === user.id
                    ? "INVITO RICEVUTO"
                    : "INVITO INVIATO"}{" "}
                  · {i.property.city}
                </span>
                <Badge status={i.status} />
              </div>
              <h2>{i.property.title}</h2>
              <p>
                {i.property.area} · €{i.property.rent}/mese, spese incluse ·{" "}
                {i.property.min_months}–{i.property.max_months} mesi
              </p>
              <p className="small-copy">
                Disponibile dal {dateLabel(i.property.available_from)} · fino a{" "}
                {i.property.capacity} persone · autorizzazione autodichiarata
              </p>
              <p>
                {i.property.sqm} m² · {i.property.rooms} locali ·{" "}
                {i.property.furnished ? "Arredato" : "Non arredato"}
              </p>
              <p>{i.property.description}</p>
              {i.property_changed &&
                ["accepted", "closed"].includes(i.status) && (
                  <p className="disclosure">
                    L’immobile è stato modificato dopo l’invito. Qui sono
                    conservati i dettagli dell’offerta accettata; chiarite le
                    eventuali nuove condizioni in conversazione.
                  </p>
                )}
              {i.status === "unavailable" && (
                <p className="disclosure">
                  Il proprietario deve riconfermare la disponibilità prima che
                  tu possa accettare.
                </p>
              )}
              {i.other_name && (
                <p>
                  In conversazione con <strong>{i.other_name}</strong>
                </p>
              )}
              {i.compatibility && (
                <details>
                  <summary>Confronto con le preferenze attuali</summary>
                  <Checks value={i.compatibility} />
                </details>
              )}
              {i.status === "pending" && (
                <p className="disclosure">
                  Accettando, condividi il nome scelto con l’altra persona e
                  apri la chat. Nessuna email o documento viene condiviso. Scade
                  il {dateLabel(i.expires_at)}.
                </p>
              )}
              <div className="actions wrap">
                {["pending", "unavailable"].includes(i.status) &&
                  (i.tenant_id === user.id ? (
                    <>
                      {i.status === "pending" && (
                        <button
                          className="button"
                          disabled={a.busy}
                          onClick={() => action(i, "accept")}
                        >
                          Accetta e apri la conversazione
                        </button>
                      )}
                      <button
                        className="button secondary"
                        disabled={a.busy}
                        onClick={() => action(i, "decline")}
                      >
                        Declina
                      </button>
                    </>
                  ) : (
                    <button
                      className="button secondary"
                      disabled={a.busy}
                      onClick={() => action(i, "withdraw")}
                    >
                      Ritira invito
                    </button>
                  ))}
                {["accepted", "closed"].includes(i.status) && (
                  <Link to={`/conversations/${i.id}`} className="button">
                    {i.status === "closed"
                      ? "Leggi conversazione"
                      : "Apri conversazione"}{" "}
                    →
                  </Link>
                )}
                <button
                  className="text-link"
                  onClick={() => setReport(report === i.id ? "" : i.id)}
                >
                  Segnala
                </button>
                <button
                  className="text-link danger-text"
                  disabled={a.busy}
                  onClick={() =>
                    a.run(async () => {
                      await api("/blocks", "POST", { invitation_id: i.id });
                      l.reload();
                    }, "Contatto bloccato. Gli inviti e le conversazioni sono chiusi.")
                  }
                >
                  Blocca contatto
                </button>
              </div>
              {!["pending", "accepted", "unavailable"].includes(i.status) && (
                <p className="field-hint">
                  Questo invito non può essere riaperto. Una nuova pubblicazione
                  non lo riattiva.
                </p>
              )}
              {report === i.id && (
                <ReportForm invitationId={i.id} onDone={() => setReport("")} />
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
function Conversation({ id, user }: { id: string; user: User }) {
  const runtime = useContext(RuntimeContext),
    [before, setBefore] = useState(""),
    l = useLoad(`/conversations/${id}${before ? `?before=${before}` : ""}`),
    inv = useLoad(`/invitations/${id}`),
    a = useAction(),
    [report, setReport] = useState<string | null>(null),
    form = useRef<HTMLFormElement>(null);
  const info = inv.data?.invitation;
  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = formValues(e.currentTarget);
    await a.run(async () => {
      await api(`/conversations/${id}/messages`, "POST", v);
      form.current?.reset();
      setBefore("");
      l.reload();
    }, "Messaggio inviato.");
  }
  return (
    <>
      <Link to="/invitations" className="back-link">
        ← Torna agli inviti
      </Link>
      <PageHeading
        eyebrow="UNO SPAZIO PER PARLARSI"
        title={
          info?.other_name ? `Con ${info.other_name}.` : "La tua conversazione."
        }
      >
        {info?.property.title}
      </PageHeading>
      <ErrorBox text={l.error || a.error} />
      <div className="chat-layout">
        <section className="panel chat">
          <div className="panel-title">
            <Badge status={l.data?.status || "accepted"} />
            <button
              className="text-link"
              onClick={() => {
                setBefore("");
                l.reload();
              }}
            >
              Messaggi recenti
            </button>
          </div>
          <div className="actions wrap">
            {l.data?.hasMore && (
              <button
                className="text-link"
                onClick={() => setBefore(l.data.before)}
              >
                Leggi messaggi precedenti
              </button>
            )}
            {before && (
              <span className="small-copy">Stai leggendo la cronologia.</span>
            )}
          </div>
          <div className="messages" aria-label="Messaggi">
            {!l.data && !l.error ? (
              <Loading />
            ) : l.data?.messages.length === 0 ? (
              <div className="chat-empty">
                <h2>Comincia con un saluto.</h2>
                <p>
                  Parla dell’immobile e delle tue domande. Non inviare documenti
                  o dati sensibili.
                </p>
              </div>
            ) : (
              l.data?.messages.map((m: any) => (
                <article
                  className={
                    "message " + (m.sender_id === user.id ? "own" : "")
                  }
                  key={m.id}
                >
                  <span className="message-author">
                    {m.sender_id === user.id
                      ? "Tu"
                      : info?.other_name || "L’altra persona"}
                  </span>
                  <p>{m.body}</p>
                  <div className="message-meta">
                    <time dateTime={m.created_at}>
                      {new Date(m.created_at).toLocaleTimeString("it-IT", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                    <button onClick={() => setReport(m.id)}>
                      Segnala messaggio
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
          {l.data?.status === "accepted" ? (
            <form className="composer" onSubmit={send} ref={form}>
              <label className="field">
                <span>Il tuo messaggio</span>
                <textarea
                  name="body"
                  maxLength={2000}
                  required
                  rows={3}
                  placeholder="Ciao, grazie per l’invito…"
                />
              </label>
              <button className="button" disabled={a.busy}>
                Invia messaggio →
              </button>
            </form>
          ) : (
            <p className="disclosure">
              Conversazione chiusa. Non si possono inviare altri messaggi.
            </p>
          )}
          {a.message && <Notice>{a.message}</Notice>}
        </section>
        <aside className="panel chat-aside">
          <span className="eyebrow">IL CONTROLLO RESTA TUO</span>
          <h2>
            Sentiti libero
            <br />
            di fermarti.
          </h2>
          <p>
            Non condividere documenti, credenziali bancarie o denaro qui.{" "}
            {runtime?.environment === "local"
              ? "Questo spazio è una dimostrazione locale."
              : runtime?.environment === "staging"
                ? "Questo è un ambiente di test: usa solo dati di esempio."
                : "Puoi segnalare un messaggio o bloccare un contatto."}
          </p>
          <button
            className="button secondary full"
            disabled={a.busy || l.data?.status !== "accepted"}
            onClick={() =>
              a.run(async () => {
                await api(`/invitations/${id}/action`, "POST", {
                  action: "close",
                });
                l.reload();
              }, "Conversazione chiusa.")
            }
          >
            Chiudi conversazione
          </button>
          <button
            className="text-link danger-text"
            disabled={a.busy}
            onClick={() =>
              a.run(async () => {
                await api("/blocks", "POST", { invitation_id: id });
                l.reload();
              }, "Contatto bloccato.")
            }
          >
            Blocca contatto
          </button>
        </aside>
      </div>
      {report && (
        <ReportForm
          invitationId={id}
          messageId={report}
          onDone={() => setReport(null)}
        />
      )}
    </>
  );
}
function VerificationPage() {
  const l = useLoad("/verification"),
    a = useAction(),
    runtime = useContext(RuntimeContext);
  return (
    <>
      <PageHeading
        eyebrow="TRASPARENZA"
        title="Ogni verifica ha un significato."
      >
        Una conferma precisa, mai un giudizio sulla persona.
      </PageHeading>
      <ErrorBox text={l.error || a.error} />
      {a.message && <Notice>{a.message}</Notice>}
      <div className="two-grid">
        <article className="panel">
          <span className="eyebrow">IL TUO INDIRIZZO</span>
          <h2>
            {runtime?.mailTransport === "local" ? "Conferma locale" : "Email"}{" "}
            {l.data?.email_verified ? "confermata" : "da confermare"}
          </h2>
          <p>{verificationInstructions(runtime)}</p>
          {!l.data?.email_verified && (
            <button
              className="button"
              disabled={a.busy}
              onClick={() =>
                a.run(
                  () => api("/auth/resend", "POST"),
                  runtime?.mailTransport === "local"
                    ? "Nuovo messaggio di conferma preparato per l’operatore locale. Nessuna email viene inviata."
                    : runtime?.mailTransport === "smtp"
                      ? "Richiesta ricevuta. Controlla la tua casella email e la cartella spam per il link di conferma."
                      : "Richiesta di conferma ricevuta.",
                )
              }
            >
              Invia di nuovo la conferma
            </button>
          )}
        </article>
        <article className="panel muted-panel">
          <span className="eyebrow">IDENTITÀ E REDDITO</span>
          <h2>
            Non disponibili
            <br />
            in questo ambiente.
          </h2>
          <p>
            Nessun provider è collegato. Non caricare documenti o dati
            finanziari.
          </p>
          <span className="badge">Nessun esito simulato</span>
          <p className="small-copy">
            Le verifiche opzionali non aumentano la visibilità e non sono
            richieste per ricevere inviti.
          </p>
        </article>
      </div>
      {l.data?.checks.map((v: any) => (
        <article className="panel" key={v.id}>
          <h2>{v.kind === "identity" ? "Identità" : "Reddito"}</h2>
          <Badge status={v.status} />
          <p>
            Provider: {v.provider || "non disponibile"}. Controllo:{" "}
            {v.checked_at ? dateLabel(v.checked_at) : "non disponibile"}.
            Scadenza:{" "}
            {v.expires_at ? dateLabel(v.expires_at) : "non disponibile"}.
          </p>
          {["VERIFIED", "FAILED", "EXPIRED"].includes(v.status) && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const reason = String(formValues(e.currentTarget).reason);
                void a.run(async () => {
                  await api(`/verification/${v.id}/dispute`, "POST", {
                    reason,
                  });
                  l.reload();
                }, "Contestazione registrata.");
              }}
            >
              <Field label="Motivo della contestazione" name="reason" />
              <button className="button secondary" disabled={a.busy}>
                Contesta esito
              </button>
            </form>
          )}
        </article>
      ))}
    </>
  );
}
function Settings({
  user,
  refresh,
}: {
  user: User;
  refresh: () => Promise<void>;
}) {
  const a = useAction(),
    l = useLoad(user.suspended ? null : "/blocks"),
    [deleting, setDeleting] = useState(false);
  async function exportData() {
    await a.run(async () => {
      const data = await api("/account/export");
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `${brand.slug}-dati.json`;
      link.click();
      URL.revokeObjectURL(url);
    }, "Esportazione preparata. Conserva il file in un luogo sicuro.");
  }
  async function remove(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = formValues(e.currentTarget);
    await a.run(async () => {
      await api("/account", "DELETE", values);
      await refresh();
      go("/");
    });
  }
  return (
    <>
      <PageHeading
        eyebrow="IL TUO ACCOUNT"
        title="Le tue scelte, in un solo posto."
      >
        Gestisci dati, contatti e accesso.
      </PageHeading>
      <ErrorBox text={a.error || l.error} />
      {a.message && <Notice>{a.message}</Notice>}
      <div className="two-grid">
        <section className="panel">
          <h2>{user.display_name}</h2>
          <p>{user.email}</p>
          <p>
            Ruolo:{" "}
            {user.role === "tenant"
              ? "cerco casa"
              : user.role === "landlord"
                ? "offro immobile"
                : "cerco e offro casa"}
          </p>
          <button
            className="button secondary"
            onClick={() =>
              a.run(async () => {
                await api("/auth/logout", "POST");
                await refresh();
                go("/login");
              })
            }
          >
            Esci dall’account
          </button>
        </section>
        <section className="panel">
          <h2>Una copia dei tuoi dati</h2>
          <p>
            Scarica account, preferenze, immobili e messaggi inviati da te. I
            dati privati delle altre persone sono esclusi.
          </p>
          <button
            className="button secondary"
            disabled={a.busy}
            onClick={exportData}
          >
            Scarica i miei dati
          </button>
        </section>
        <section className="panel">
          <h2>Contatti bloccati</h2>
          {l.data?.blocks.length === 0 ? (
            <p>Non hai bloccato nessun contatto.</p>
          ) : (
            l.data?.blocks.map((b: any) => (
              <div className="block-row" key={b.blocked_id}>
                <span>Contatto {b.blocked_id.slice(0, 6)}</span>
                <button
                  className="text-link"
                  disabled={a.busy}
                  onClick={() =>
                    a.run(async () => {
                      await api(`/blocks/${b.blocked_id}`, "DELETE");
                      l.reload();
                    }, "Blocco rimosso. Inviti e conversazioni restano chiusi.")
                  }
                >
                  Sblocca
                </button>
              </div>
            ))
          )}
        </section>
        <section className="panel">
          <h2>Elimina il tuo account</h2>
          <p>
            Rimuove profilo, immobili, messaggi inviati e conversazioni
            collegate. Le altre persone potrebbero non vederle più. Non revoca
            copie già scaricate. Le segnalazioni di altre persone conservano il
            solo contesto selezionato. L’operatore elimina i casi più vecchi di
            30 giorni tramite la pulizia periodica; la cancellazione non è
            automatica.
          </p>
          {deleting ? (
            <form onSubmit={remove}>
              <Field label="Password attuale" type="password" name="password" />
              <Field label="Scrivi ELIMINA per confermare" name="confirm" />
              <button className="button danger" disabled={a.busy}>
                Elimina definitivamente
              </button>
            </form>
          ) : (
            <button
              className="text-link danger-text"
              onClick={() => setDeleting(true)}
            >
              Voglio eliminare l’account
            </button>
          )}
        </section>
      </div>
    </>
  );
}
function Staff({ path, user }: { path: string; user: User }) {
  const [page, setPage] = useState(0),
    runtime = useContext(RuntimeContext);
  const isUsers = path === "/staff/users",
    analytics = path === "/staff/analytics",
    allowed =
      Boolean(user.staff_role) &&
      (!(isUsers || analytics) || user.staff_role === "admin");
  const l = useLoad(
      allowed
        ? isUsers
          ? `/staff/users?page=${page}`
          : analytics
            ? "/staff/analytics"
            : `/staff/reports?page=${page}`
        : null,
    ),
    a = useAction();
  if (!allowed)
    return <ErrorBox text="Accesso riservato agli operatori autorizzati." />;
  return (
    <>
      <PageHeading
        eyebrow="GESTIONE"
        title={
          analytics
            ? "Attività dell’ambiente."
            : isUsers
              ? "Gestione degli account."
              : "Uno spazio da proteggere."
        }
      >
        Accesso riservato. Le azioni degli operatori sono registrate.
      </PageHeading>
      <div className="toolbar wrap">
        <Link to="/staff" className="button secondary small">
          Segnalazioni
        </Link>
        {user.staff_role === "admin" && (
          <>
            <Link to="/staff/users" className="button secondary small">
              Account
            </Link>
            <Link to="/staff/analytics" className="button secondary small">
              Attività
            </Link>
          </>
        )}
      </div>
      <HistoryPager
        page={page}
        next={
          !analytics &&
          (isUsers
            ? l.data?.users.length === 100
            : l.data?.reports.length === 100)
        }
        onChange={setPage}
      />
      <ErrorBox text={l.error || a.error} />
      {a.message && <Notice>{a.message}</Notice>}
      {!l.data && !l.error ? (
        <Loading />
      ) : analytics && l.data ? (
        <>
          <p className="disclosure">
            {runtime?.environment === "local"
              ? "Conteggi del workflow locale con dati sintetici."
              : runtime?.environment === "staging"
                ? "Conteggi dell’attività nell’ambiente di test."
                : "Conteggi dell’attività nell’ambiente corrente."}{" "}
            Non misurano domanda, liquidità o risultati di mercato.
          </p>
          <div className="three-grid">
            {[
              [l.data.users, "Account"],
              [l.data.profiles, "Profili pubblicati"],
              [l.data.properties, "Immobili correnti"],
            ].map(([v, label]) => (
              <div className="panel" key={label}>
                <span className="stat-number">{v}</span>
                <p>{label}</p>
              </div>
            ))}
          </div>
          <div className="two-grid">
            <section className="panel">
              <h2>Eventi negli ultimi 30 giorni</h2>
              {l.data.events.length === 0 ? (
                <p>Nessun evento.</p>
              ) : (
                l.data.events.map((e: any) => (
                  <p key={e.name}>
                    {
                      (
                        {
                          profile_published: "Azioni di pubblicazione profilo",
                          property_published:
                            "Pubblicazioni e riconferme immobile",
                          invitation_sent: "Inviti inviati",
                          invitation_accepted: "Inviti accettati",
                          message_sent: "Messaggi inviati",
                          report_submitted: "Segnalazioni",
                          account_deleted: "Account eliminati",
                        } as Record<string, string>
                      )[e.name]
                    }
                    : <strong>{e.count}</strong>
                  </p>
                ))
              )}
            </section>
            <section className="panel">
              <h2>Registro delle azioni</h2>
              {l.data.audit.length === 0 ? (
                <p>Nessuna azione registrata.</p>
              ) : (
                l.data.audit.map((x: any, n: number) => (
                  <p key={n}>
                    {x.action} · {reasonLabels[x.reason_code] || x.reason_code}{" "}
                    · {dateLabel(x.created_at)}
                  </p>
                ))
              )}
            </section>
          </div>
        </>
      ) : isUsers ? (
        <div className="two-grid">
          {l.data?.users.map((u: any) => (
            <article className="panel" key={u.id}>
              <h2>{u.display_name}</h2>
              <p className="small-copy">
                Account {u.id} · {u.staff_role || u.role}
              </p>
              <Badge status={u.suspended ? "Sospeso" : "Attivo"} />
              {u.appeal_reason && (
                <div className="disclosure">
                  <strong>Richiesta di revisione ({u.appeal_status})</strong>
                  <p>{u.appeal_reason}</p>
                </div>
              )}
              {!u.staff_role && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const reason = String(formValues(e.currentTarget).reason);
                    void a.run(async () => {
                      await api(`/staff/users/${u.id}/status`, "POST", {
                        suspended: !u.suspended,
                        reason,
                      });
                      l.reload();
                    }, "Stato aggiornato e azione registrata.");
                  }}
                >
                  <Field name="reason" label="Motivo dell’azione">
                    <select name="reason">
                      {(u.suspended
                        ? ["appeal_accepted"]
                        : ["abuse", "security"]
                      ).map((x) => (
                        <option key={x} value={x}>
                          {reasonLabels[x]}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <button className="button secondary" disabled={a.busy}>
                    {u.suspended ? "Ripristina account" : "Sospendi account"}
                  </button>
                </form>
              )}
            </article>
          ))}
        </div>
      ) : l.data?.reports.length === 0 ? (
        <Empty title="Nessuna segnalazione da esaminare">
          <p>I casi compariranno qui con il solo contesto autorizzato.</p>
        </Empty>
      ) : (
        <div className="two-grid">
          {l.data?.reports.map((r: any) => (
            <article className="panel" key={r.id}>
              <div className="panel-title">
                <h2>{reasonLabels[r.reason]}</h2>
                <Badge status={r.status} />
              </div>
              <p>{r.details}</p>
              <p className="small-copy">
                Caso {r.id}
                <br />
                Segnalante {r.reporter_id}
                <br />
                Contatto segnalato {r.reported_user_id || "account eliminato"}
                <br />
                Invito {r.invitation_id || "eliminato"} ·{" "}
                {dateLabel(r.created_at)}
              </p>
              {r.selected_message && (
                <p className="small-copy">
                  Autore del messaggio:{" "}
                  {r.selected_sender_id || "account eliminato"}
                </p>
              )}
              {r.selected_message && (
                <blockquote>{r.selected_message}</blockquote>
              )}
              {r.status === "open" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const resolution = String(
                      formValues(e.currentTarget).resolution,
                    );
                    void a.run(async () => {
                      await api(`/staff/reports/${r.id}/resolve`, "POST", {
                        resolution,
                      });
                      l.reload();
                    }, "Caso risolto e azione registrata.");
                  }}
                >
                  <Field name="resolution" label="Esito">
                    <select name="resolution">
                      <option value="reviewed">Esaminato</option>
                      <option value="action_taken">Intervento eseguito</option>
                      <option value="insufficient_context">
                        Contesto insufficiente
                      </option>
                    </select>
                  </Field>
                  <button className="button" disabled={a.busy}>
                    Chiudi caso
                  </button>
                </form>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
function HistoryPager({
  page,
  next,
  onChange,
}: {
  page: number;
  next: boolean;
  onChange: (n: number) => void;
}) {
  return page > 0 || next ? (
    <div className="pagination">
      <button
        className="button secondary small"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
      >
        Pagina precedente
      </button>
      <span>Pagina {page + 1}</span>
      <button
        className="button secondary small"
        disabled={!next}
        onClick={() => onChange(page + 1)}
      >
        Pagina successiva
      </button>
    </div>
  ) : null;
}
function Suspended({ user }: { user: User }) {
  const a = useAction(),
    runtime = useContext(RuntimeContext);
  return (
    <>
      <PageHeading
        eyebrow="REVISIONE ACCOUNT"
        title="Il tuo account è sospeso."
      >
        Puoi accedere ai tuoi dati e chiedere una revisione, senza contattare
        altre persone.
      </PageHeading>
      <div className="panel narrow">
        <p>
          Motivo: {reasonLabels[user.suspension_reason || "security"]}.
          Riferimento account: {user.id}.
        </p>
        <p>
          {runtime?.environment === "local"
            ? "In questo ambiente dimostrativo la richiesta è registrata per l’operatore locale. Non è attivo un servizio di assistenza per utenti reali."
            : runtime?.environment === "staging"
              ? "La richiesta è registrata per l’operatore dell’ambiente di test."
              : "La richiesta è registrata per gli operatori autorizzati. Puoi consultare i tuoi dati dalla pagina Account."}
        </p>
        <ErrorBox text={a.error} />
        {a.message && <Notice>{a.message}</Notice>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const reason = String(formValues(e.currentTarget).reason);
            void a.run(
              () => api("/account/appeal", "POST", { reason }),
              runtime?.environment === "local"
                ? "Richiesta di revisione registrata per l’amministratore locale."
                : "Richiesta di revisione registrata per gli operatori autorizzati.",
            );
          }}
        >
          <Field name="reason" label="Motivo della richiesta di revisione">
            <textarea
              name="reason"
              required
              minLength={5}
              maxLength={500}
              rows={3}
            />
          </Field>
          <button className="button" disabled={a.busy}>
            Richiedi revisione
          </button>
        </form>
        <Link to="/settings" className="text-link">
          Esporta i dati o elimina l’account →
        </Link>
      </div>
    </>
  );
}

function Arrow() {
  return (
    <svg className="arrow-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 18 18 6M6 6h12v12" />
    </svg>
  );
}
