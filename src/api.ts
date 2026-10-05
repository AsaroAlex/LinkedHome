import { useEffect, useState, useCallback } from "react";
export class ApiError extends Error {
  constructor(
    message: string,
    public details: Array<{ field: string; message: string }> = [],
  ) {
    super(message);
  }
}
const fields: Record<string, string> = {
  display_name: "Nome: usa da 2 a 60 caratteri.",
  title: "Titolo: usa da 5 a 100 caratteri.",
  area: "Zona: usa da 2 a 60 caratteri.",
  street:
    "Via o piazza: usa da 2 a 120 caratteri per mostrare l’indirizzo completo.",
  street_number: "Indica il numero civico, per esempio 12, 12/A oppure SNC.",
  address_visibility:
    "Scegli se mostrare solo il quartiere o l’indirizzo completo.",
  locations: "Scegli almeno una città e controlla le zone selezionate.",
  description: "Descrizione: usa da 10 a 1500 caratteri.",
  password: "Password: usa da 12 a 128 caratteri.",
  details: "Descrizione del problema: usa da 5 a 500 caratteri.",
  reason: "Motivo: inserisci almeno 5 caratteri.",
  budget: "Budget: inserisci un valore tra 100 e 20.000 euro.",
  rent: "Costo mensile: inserisci un valore tra 100 e 20.000 euro.",
  move_in: "Controlla il mese o il giorno di ingresso.",
  move_in_precision: "Scegli un mese, un periodo o un giorno preciso.",
  move_in_end: "Scegli un mese finale uguale o successivo al mese iniziale.",
  available_from: "Controlla la data di disponibilità.",
  min_months: "Permanenza minima: inserisci da 1 a 120 mesi.",
  max_months: "Permanenza massima: inserisci da 1 a 120 mesi.",
  duration: "Permanenza: inserisci da 1 a 120 mesi.",
  contract_preference: "Scegli il tipo di contratto che cerchi.",
  contract_type: "Scegli il tipo di contratto offerto.",
  occupants: "Persone: inserisci un numero intero da 1 a 12.",
  pets: "Scegli una delle opzioni sugli animali domestici.",
  pets_details: "Usa al massimo 200 caratteri per i dettagli sugli animali.",
  furnishing_preference: "Scegli una delle opzioni per l’arredamento.",
  housing_needs: "Controlla le caratteristiche della casa selezionate.",
  accessibility_needs: "Controlla le esigenze di accessibilità selezionate.",
  about: "Usa al massimo 600 caratteri per la presentazione.",
  capacity: "Capienza: inserisci un numero intero da 1 a 12.",
  sqm: "Superficie: inserisci un valore da 10 a 2.000 m².",
  rooms: "Locali: inserisci un numero intero da 1 a 20.",
};
export async function api<T = any>(
  url: string,
  method = "GET",
  body?: unknown,
  extraHeaders: Record<string, string> = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch("/api" + url, {
      method,
      credentials: "same-origin",
      headers: {
        ...(method === "GET" || body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...extraHeaders,
      },
      body:
        method === "GET"
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body ?? {}),
    });
  } catch {
    throw new ApiError(
      "Impossibile collegarsi al server. Controlla la connessione e riprova.",
    );
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(
      "Il server ha restituito una risposta non valida. Riprova tra poco.",
    );
  }
  if (!response.ok) {
    const rawDetails = (data.details || []).flatMap(
      (d: { field: string; message: string }) =>
        !d.field && d.message === "Durata massima inferiore alla minima"
          ? [
              { ...d, field: "min_months" },
              { ...d, field: "max_months" },
            ]
          : [d],
    );
    const details = rawDetails.map((d: { field: string; message: string }) => ({
      ...d,
      message:
        d.message === "Durata massima inferiore alla minima"
          ? `${d.message}. Controlla la durata ${d.field === "min_months" ? "minima" : "massima"}.`
          : fields[d.field?.split(".")[0]] ||
            (d.field ? `Controlla il campo ${d.field}.` : d.message),
    }));
    throw new ApiError(data.error || "Operazione non riuscita.", details);
  }
  return data;
}
export function useLoad<T = any>(url: string | null) {
  const [state, setState] = useState<{
      url: string | null;
      data: T | null;
      error: string;
    }>({ url: null, data: null, error: "" }),
    [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((x) => x + 1), []);
  useEffect(() => {
    let active = true;
    setState((previous) => ({
      url,
      data: previous.url === url ? previous.data : null,
      error: "",
    }));
    if (url)
      api<T>(url)
        .then((data) => {
          if (active) setState({ url, data, error: "" });
        })
        .catch((e) => {
          if (active) setState({ url, data: null, error: e.message });
        });
    return () => {
      active = false;
    };
  }, [url, version]);
  return {
    data: state.url === url ? state.data : null,
    error: state.url === url ? state.error : "",
    reload,
  };
}
export const formValues = (form: HTMLFormElement) =>
  Object.fromEntries(new FormData(form));
export const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
