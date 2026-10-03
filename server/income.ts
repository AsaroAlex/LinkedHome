import { randomUUID } from "node:crypto";
import { Problem } from "./domain.js";

export type IncomeStatus =
  | "not_requested"
  | "pending"
  | "completed"
  | "insufficient"
  | "failed"
  | "expired"
  | "revoked"
  | "disputed";
export type IncomeSourceCategory =
  "employment" | "self_employment" | "pension" | "other";
export interface IncomeSummary {
  monthly_net_band: { min: number; max: number; currency: "EUR" };
  source_categories: IncomeSourceCategory[];
}
export interface IncomeProviderResult {
  status: "PENDING" | "VERIFIED" | "INSUFFICIENT" | "FAILED";
  provider: string;
  provider_reference: string;
  synthetic: boolean;
  category: "employment" | "self_employment" | "variable";
  checked_at: Date;
  expires_at: Date;
  period_from: string;
  period_to: string;
  summary: IncomeSummary | null;
}
// A future real adapter receives a provider authorization reference, never raw
// bank credentials or uploaded financial documents from this application.
export interface IncomeProvider {
  readonly available: boolean;
  readonly synthetic: boolean;
  request(input: {
    subject_id: string;
    authorization_reference: string;
  }): Promise<IncomeProviderResult>;
}
export const unavailableIncomeProvider: IncomeProvider = {
  available: false,
  synthetic: false,
  async request() {
    throw new Problem(
      503,
      "Il servizio per una verifica reale del reddito non è collegato.",
      "provider_unavailable",
    );
  },
};

export const incomeCaveat =
  "Descrive soltanto entrate nette osservate nel periodo indicato. Non garantisce redditi futuri, solvibilità o pagamento del canone. Non è una raccomandazione sul candidato.";
export type DemoIncomeScenario =
  "pending" | "completed" | "insufficient" | "error" | "expired";
export type DemoIncomeCategory = "employment" | "self_employment" | "variable";
export function demoIncomeResult(
  scenario: DemoIncomeScenario,
  category: DemoIncomeCategory = "employment",
  now = new Date(),
): IncomeProviderResult {
  const checkedAt = new Date(
    now.getTime() - (scenario === "expired" ? 91 * 86400000 : 0),
  );
  const periodEnd = new Date(
    Date.UTC(checkedAt.getUTCFullYear(), checkedAt.getUTCMonth(), 0),
  );
  const periodStart = new Date(
    Date.UTC(checkedAt.getUTCFullYear(), checkedAt.getUTCMonth() - 3, 1),
  );
  return {
    status:
      scenario === "pending"
        ? "PENDING"
        : scenario === "insufficient"
          ? "INSUFFICIENT"
          : scenario === "error"
            ? "FAILED"
            : "VERIFIED",
    provider: "Simulatore locale Soglia · dati sintetici",
    provider_reference: `local-synthetic:${randomUUID()}`,
    synthetic: true,
    category,
    checked_at: checkedAt,
    expires_at: new Date(checkedAt.getTime() + 90 * 86400000),
    period_from: periodStart.toISOString().slice(0, 10),
    period_to: periodEnd.toISOString().slice(0, 10),
    summary:
      scenario === "completed" || scenario === "expired"
        ? {
            monthly_net_band: {
              min:
                category === "self_employment"
                  ? 2500
                  : category === "variable"
                    ? 1500
                    : 2000,
              max:
                category === "self_employment"
                  ? 2999
                  : category === "variable"
                    ? 1999
                    : 2499,
              currency: "EUR",
            },
            source_categories: [category === "variable" ? "other" : category],
          }
        : null,
  };
}

export function incomeStatus(row: any, now = new Date()): IncomeStatus {
  if (row.status === "VERIFIED")
    return row.expires_at && new Date(row.expires_at) > now
      ? "completed"
      : "expired";
  const states: Record<string, IncomeStatus> = {
    UNVERIFIED: "not_requested",
    PENDING: "pending",
    INSUFFICIENT: "insufficient",
    FAILED: "failed",
    EXPIRED: "expired",
    REVOKED: "revoked",
    DISPUTED: "disputed",
  };
  return states[row.status] || "not_requested";
}

// Explicit projection is shared by holder and consented recipient. It excludes
// subject IDs, exact income, provider references, disputes and raw sources.
export function incomeAttestation(row: any) {
  const status = incomeStatus(row);
  return {
    id: row.id,
    status,
    synthetic: row.synthetic,
    provider: row.provider,
    scope: row.scope,
    category: row.category,
    source_description:
      "Movimenti sintetici del simulatore locale, senza collegamento a conti o documenti reali.",
    checked_at: row.checked_at,
    expires_at: row.expires_at,
    period_from: row.period_from,
    period_to: row.period_to,
    summary:
      row.monthly_net_min !== null && row.monthly_net_min !== undefined
        ? {
            monthly_net_band: {
              min: row.monthly_net_min,
              max: row.monthly_net_max,
              currency: row.currency,
            },
            source_categories: row.source_categories,
          }
        : null,
    caveat: incomeCaveat,
  };
}

export const incomeSelect = `SELECT v.id,v.user_id,v.status,v.provider,v.checked_at,v.expires_at,v.created_at,
 a.synthetic,a.scope,a.category,a.period_from,a.period_to,a.monthly_net_min,a.monthly_net_max,a.currency,a.source_categories
 FROM verification_checks v JOIN income_attestations a ON a.check_id=v.id`;

export function incomeShare(row: any) {
  return {
    id: row.id,
    attestation_id: row.check_id,
    invitation_id: row.invitation_id,
    recipient_id: row.recipient_id,
    property_title: row.property_title,
    recipient_label: row.recipient_label,
    consent_version: row.consent_version,
    consented_at: row.consented_at,
    revoked_at: row.revoked_at,
    available: row.available ?? !row.revoked_at,
    status: row.revoked_at
      ? "revoked"
      : row.available === false
        ? "unavailable"
        : "shared",
  };
}
