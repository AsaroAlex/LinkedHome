import { useId, useState } from "react";
import { useLoad } from "./api";
import "./experience.css";

const guides = {
  tenant: [
    [
      "Indica cosa cerchi",
      "Scegli città, budget complessivo, mese o periodo di ingresso, tipo di contratto, permanenza e numero di persone. Salva e pubblica il tuo profilo quando sei pronto.",
    ],
    [
      "Valuta gli inviti",
      "I proprietari ti propongono un immobile compatibile. Controlla costo, disponibilità e caratteristiche prima di rispondere.",
    ],
    [
      "Parla con il proprietario",
      "Accetta l’invito per aprire la chat. Fai domande e concorda una visita: accettare un invito non significa affittare la casa.",
    ],
  ],
  landlord: [
    [
      "Aggiungi il tuo immobile",
      "Descrivi gli spazi, il costo complessivo e le date. Pubblica l’immobile e riconferma la disponibilità almeno ogni 30 giorni.",
    ],
    [
      "Trova profili compatibili",
      "Confronta le preferenze con le caratteristiche dell’immobile. Ogni criterio è spiegato, così sai perché un profilo è compatibile.",
    ],
    [
      "Invita e inizia a parlare",
      "Invia un invito per quell’immobile. Quando la persona accetta, potete scrivervi e concordare i prossimi passi.",
    ],
  ],
} as const;

export function RoleGuide() {
  const [role, setRole] = useState<"tenant" | "landlord">("tenant");
  const contentId = useId();
  return (
    <section className="container how" aria-labelledby="how-heading">
      <div className="section-heading">
        <span className="eyebrow">COME FUNZIONA</span>
        <h2 id="how-heading">Dalle preferenze al primo messaggio.</h2>
        <p>Scegli il tuo percorso e scopri da dove iniziare.</p>
      </div>
      <div
        className="role-switch"
        role="group"
        aria-label="Scegli il tuo percorso"
      >
        <button
          type="button"
          aria-pressed={role === "tenant"}
          aria-controls={contentId}
          onClick={() => setRole("tenant")}
        >
          Cerco casa
        </button>
        <button
          type="button"
          aria-pressed={role === "landlord"}
          aria-controls={contentId}
          onClick={() => setRole("landlord")}
        >
          Voglio affittare
        </button>
      </div>
      <div id={contentId} className="steps">
        {guides[role].map(([title, description], index) => (
          <article key={title}>
            <span className="step-number">0{index + 1}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
      <div className="guide-action">
        <a
          className="button"
          href={role === "tenant" ? "/register" : "/register?role=landlord"}
        >
          {role === "tenant"
            ? "Crea il tuo profilo"
            : "Aggiungi il tuo immobile"}{" "}
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}

export function ProductFAQ() {
  return (
    <section className="container product-faq" aria-labelledby="faq-heading">
      <div>
        <span className="eyebrow">PRIMA DI INIZIARE</span>
        <h2 id="faq-heading">Domande frequenti</h2>
        <p>Come cercare casa o proporre il tuo immobile su LinkedHome.</p>
      </div>
      <div>
        {[
          [
            "Come funziona LinkedHome?",
            "Se cerchi casa, pubblichi le tue preferenze e ricevi inviti dai proprietari. Se vuoi affittare, pubblichi l’immobile e contatti i profili compatibili. Quando l’invito viene accettato, potete scrivervi e organizzare una visita.",
          ],
          [
            "Chi può vedere il mio profilo?",
            "Solo i proprietari autenticati con un immobile pertinente possono scoprire le preferenze che pubblichi: città, budget, ingresso, contratto e numero di persone. I mesi di permanenza servono per la scelta flessibile, studenti e transitorio. Se li indichi, vedono anche animali, arredamento ed esigenze della casa. Il tuo nome, la foto e la presentazione diventano visibili quando accetti un invito.",
          ],
          [
            "Accettare un invito mi impegna ad affittare?",
            "No. Accettare apre una conversazione e rende visibili il nome scelto, la foto e la presentazione del profilo, se le hai aggiunte. Puoi chiedere informazioni e valutare l’immobile. L’invito non è una prenotazione o un contratto.",
          ],
          [
            "Posso interrompere la ricerca?",
            "Sì. Metti in pausa il profilo per fermare nuovi inviti e annullare quelli in attesa. Le conversazioni già accettate restano disponibili: puoi chiuderle o bloccare un contatto.",
          ],
          [
            "Come vengono scelti i profili compatibili?",
            "Confrontiamo città, costo mensile complessivo, ingresso, contratto e capienza. La permanenza in mesi conta per scelta flessibile, studenti e transitorio; per 4+4 e 3+2 vale la formula del contratto. Animali, arredamento ed esigenze della casa aiutano il proprietario a valutare il profilo e non cambiano l’ordine dei risultati. Identità, reddito e verifiche non vengono usati per assegnare un punteggio o dare più visibilità a una persona.",
          ],
          [
            "Come funziona la verifica del reddito?",
            "L’inquilino prepara un riepilogo del reddito, guarda l’anteprima e sceglie con quale proprietario condividerlo, da un invito o da una conversazione. Il proprietario vede la fascia di entrate al mese, da dove arrivano, il periodo considerato e fino a quando il riepilogo è valido. Può confrontare queste informazioni con l’affitto. La verifica del reddito reale non è ancora disponibile.",
          ],
          [
            "Posso firmare il contratto o pagare qui?",
            "Puoi conoscere il proprietario, valutare l’immobile e concordare i prossimi passi. La firma del contratto, i pagamenti e i depositi avvengono al di fuori della piattaforma.",
          ],
        ].map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function RoleSelection({ defaultRole }: { defaultRole: string }) {
  return (
    <fieldset className="role-selection">
      <legend>Come vuoi usare la piattaforma?</legend>
      {[
        [
          "tenant",
          "Cerco casa",
          "Crea un profilo e ricevi inviti per immobili compatibili.",
        ],
        [
          "landlord",
          "Offro un immobile",
          "Pubblica il tuo immobile e invita chi cerca casa.",
        ],
        [
          "both",
          "Entrambe le cose",
          "Gestisci la tua ricerca e i tuoi immobili nello stesso account.",
        ],
      ].map(([value, title, detail]) => (
        <label className="role-option" key={value}>
          <input
            type="radio"
            name="role"
            value={value}
            defaultChecked={defaultRole === value}
            required
          />
          <span>
            <strong>{title}</strong>
            <small>{detail}</small>
          </span>
        </label>
      ))}
    </fieldset>
  );
}

export function PasswordField({ register }: { register: boolean }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <div className="field">
      <label htmlFor={id}>Password</label>
      <div className="password-input">
        <input
          id={id}
          name="password"
          type={visible ? "text" : "password"}
          autoComplete={register ? "new-password" : "current-password"}
          minLength={12}
          maxLength={128}
          required
        />
        <button
          type="button"
          aria-controls={id}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? "Nascondi password" : "Mostra password"}
        </button>
      </div>
    </div>
  );
}

type Profile = { status: string };
type Property = {
  status: string;
  published_at: string;
  authority_attested: boolean;
};
type Step = {
  title: string;
  detail: string;
  href: string;
  action: string;
  done: boolean;
};

export function NextSteps({
  role,
  verified,
}: {
  role: string;
  verified: boolean;
}) {
  const profile = useLoad<{ profile: Profile | null }>(
    role !== "landlord" ? "/profile" : null,
  );
  const properties = useLoad<{ properties: Property[] }>(
    role !== "tenant" ? "/properties" : null,
  );
  const freshProperty =
    properties.data?.properties.some(
      (p) =>
        p.status === "published" &&
        p.authority_attested &&
        new Date(p.published_at).getTime() > Date.now() - 30 * 86400000,
    ) ?? false;
  const steps: Step[] = [
    {
      title: "Conferma la tua email",
      detail: "Per pubblicare e inviare o accettare inviti.",
      href: "/verification",
      action: "Conferma email",
      done: verified,
    },
    ...(role !== "landlord"
      ? [
          {
            title: "Pubblica il tuo profilo",
            detail:
              "Salva le preferenze, controlla l’anteprima e scegli di renderle visibili.",
            href: "/profile",
            action: profile.data?.profile
              ? "Controlla il profilo"
              : "Prepara il tuo profilo",
            done: profile.data?.profile?.status === "published",
          },
        ]
      : []),
    ...(role !== "tenant"
      ? [
          {
            title: "Pubblica un immobile disponibile",
            detail:
              "Aggiungi i dettagli e mantieni aggiornata la disponibilità.",
            href: "/properties",
            action: properties.data?.properties.length
              ? "Gestisci i tuoi immobili"
              : "Aggiungi un immobile",
            done: freshProperty,
          },
        ]
      : []),
  ];
  const loading =
    (role !== "landlord" && !profile.data && !profile.error) ||
    (role !== "tenant" && !properties.data && !properties.error);
  const error = profile.error || properties.error;
  const next = steps.find((step) => !step.done);
  const ready = !loading && !error && !next;
  return (
    <section className="panel onboarding" aria-labelledby="next-steps-heading">
      <div className="onboarding-intro">
        <span className="eyebrow">DA DOVE INIZIARE</span>
        <h2 id="next-steps-heading">
          {loading || error || next
            ? "Completa i primi passi"
            : "È tutto pronto"}
        </h2>
        <p>
          {ready
            ? role === "landlord"
              ? "Il tuo immobile è pubblicato. Scegli i profili a cui proporlo."
              : role === "both"
                ? "Puoi ricevere proposte e invitare profili per il tuo immobile."
                : "Il tuo profilo è pubblicato. Controlla gli inviti e parla con i proprietari."
            : role === "landlord"
              ? "Prepara l’immobile, poi invita i profili compatibili."
              : role === "both"
                ? "Prepara la tua ricerca e i tuoi immobili, poi gestisci inviti e conversazioni."
                : "Prepara la tua ricerca, poi valuta gli inviti ricevuti."}
        </p>
      </div>
      {loading ? (
        <p role="status">Caricamento dei tuoi progressi…</p>
      ) : error ? (
        <div>
          <p role="status">
            Non riusciamo a caricare i tuoi progressi. Riprova.
          </p>
          <button
            className="button secondary"
            onClick={() => {
              profile.reload();
              properties.reload();
            }}
          >
            Ricarica i progressi
          </button>
        </div>
      ) : (
        <>
          <ol className="onboarding-steps">
            {steps.map((step, index) => (
              <li key={step.title} className={step.done ? "complete" : ""}>
                <span
                  className="progress-marker"
                  role="img"
                  aria-label={step.done ? "Completato" : "Da completare"}
                >
                  {step.done ? (
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d="m4 10 4 4 8-8" />
                    </svg>
                  ) : (
                    <span aria-hidden="true">{index + 1}</span>
                  )}
                </span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
          <a
            className="button"
            href={
              next?.href ?? (role === "landlord" ? "/discover" : "/invitations")
            }
          >
            {next?.action ??
              (role === "landlord"
                ? "Scopri profili compatibili"
                : "Controlla gli inviti")}{" "}
            <span aria-hidden="true">→</span>
          </a>
        </>
      )}
    </section>
  );
}

export const quickReplies = {
  tenant: [
    [
      "Disponibilità",
      "Ciao, grazie per l’invito. L’immobile è ancora disponibile per la data di ingresso indicata?",
    ],
    [
      "Spese incluse",
      "Potresti indicarmi quali spese sono incluse nel costo mensile e quali eventuali costi restano a parte?",
    ],
    [
      "Organizza una visita",
      "Mi piacerebbe vedere l’immobile. Quando sarebbe possibile organizzare una visita?",
    ],
  ],
  landlord: [
    [
      "Proponi una visita",
      "Ciao, grazie per aver accettato l’invito. Quando saresti disponibile per una visita all’immobile?",
    ],
    [
      "Data di ingresso",
      "La data di ingresso indicata nel profilo è ancora quella che cerchi? Possiamo parlarne insieme.",
    ],
    [
      "Domande sull’immobile",
      "Hai domande sugli spazi, sulle spese o sulle condizioni dell’immobile? Sono a disposizione.",
    ],
  ],
} as const;
