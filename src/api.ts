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
  description: "Descrizione: usa da 10 a 1500 caratteri.",
  password: "Password: usa da 12 a 128 caratteri.",
  details: "Descrizione del problema: usa da 5 a 500 caratteri.",
  reason: "Motivo: inserisci almeno 5 caratteri.",
  budget: "Budget: inserisci un valore tra 100 e 20.000 euro.",
  rent: "Costo mensile: inserisci un valore tra 100 e 20.000 euro.",
  move_in: "Controlla il giorno di ingresso.",
  available_from: "Controlla la data di disponibilità.",
};
export async function api<T = any>(
  url: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch("/api" + url, {
    method,
    credentials: "same-origin",
    headers: method === "GET" ? {} : { "Content-Type": "application/json" },
    body: method === "GET" ? undefined : JSON.stringify(body ?? {}),
  });
  const data = await response.json();
  if (!response.ok) {
    const details = (data.details || []).map(
      (d: { field: string; message: string }) => ({
        ...d,
        message:
          fields[d.field] ||
          (d.field ? `Controlla il campo ${d.field}.` : d.message),
      }),
    );
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
    setState({ url, data: null, error: "" });
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
