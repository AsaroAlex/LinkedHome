import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import net, { type Socket } from "node:net";
import nodemailer from "nodemailer";
import { z } from "zod";
import { brand } from "../src/brand.js";
import { localDir, appOrigin } from "./config.js";

export type MailPurpose = "verify" | "reset";
export type MailConfiguration =
  | { transport: "local" }
  | { transport: "disabled" }
  | {
      transport: "smtp";
      host: string;
      port: 465 | 587;
      user: string;
      password: string;
      from: string;
    };

type Environment = Record<string, string | undefined>;
const deployedEnvironment = (env: Environment) =>
  ["preview", "staging", "production"].includes(env.APP_ENV || "local");
const emailAddress = z.email().max(254);
const validAddress = (address: string) =>
  emailAddress.safeParse(address).success;

/** Pure validation, shared by startup and the explicit deployment preflight. */
export function validateMailConfiguration(
  env: Environment = process.env,
  deployed = deployedEnvironment(env),
): MailConfiguration {
  const transport = env.MAIL_TRANSPORT ?? "local";
  if (env.APP_ENV === "preview") {
    if (transport !== "disabled")
      throw new Error("Preview requires MAIL_TRANSPORT=disabled.");
    return { transport };
  }
  if (transport === "disabled")
    throw new Error("MAIL_TRANSPORT=disabled is available only in preview.");
  if (transport === "local") {
    if (deployed)
      throw new Error("Deployed environments require MAIL_TRANSPORT=smtp.");
    return { transport };
  }
  if (transport !== "smtp")
    throw new Error("MAIL_TRANSPORT must be local, disabled or smtp.");
  const required = (name: string) => {
    const value = env[name];
    if (!value || !value.trim() || /[\r\n\0]/.test(value))
      throw new Error(`${name} must be configured.`);
    return value;
  };
  const host = required("SMTP_HOST");
  if (
    host.length > 253 ||
    !host
      .split(".")
      .every((label) =>
        /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(label),
      )
  )
    throw new Error("SMTP_HOST must be a hostname.");
  const rawPort = required("SMTP_PORT");
  if (rawPort !== "465" && rawPort !== "587")
    throw new Error("SMTP_PORT must be 465 (TLS) or 587 (STARTTLS).");
  const user = required("SMTP_USER");
  const password = required("SMTP_PASSWORD");
  const from = required("MAIL_FROM");
  if (!validAddress(from))
    throw new Error("MAIL_FROM must contain one email address.");
  return {
    transport,
    host,
    port: Number(rawPort) as 465 | 587,
    user,
    password,
    from,
  };
}

/** Local development only: private files, without delivering any email. */
export async function localMail(
  to: string,
  purpose: MailPurpose,
  secret: string,
) {
  if (deployedEnvironment(process.env))
    throw new Error("Local mail is unavailable in deployed environments.");
  const folder = path.join(localDir, "mail");
  await mkdir(folder, { recursive: true, mode: 0o700 });
  await writeFile(
    path.join(folder, `${Date.now()}-${randomUUID()}.json`),
    JSON.stringify(
      {
        to,
        purpose,
        url: accountUrl(purpose, secret),
        created_at: new Date().toISOString(),
      },
      null,
      2,
    ),
    { mode: 0o600, flag: "wx" },
  );
}

function accountUrl(purpose: MailPurpose, secret: string) {
  const url = new URL(`/account/${purpose}`, appOrigin);
  // Fragments never enter HTTP requests or access logs when the link is opened.
  url.hash = secret;
  return url.href;
}

const htmlEscape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]!,
  );

function smtpTransport(
  config: Extract<MailConfiguration, { transport: "smtp" }>,
  trackSocket: (socket: Socket) => void,
) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    requireTLS: config.port === 587,
    ignoreTLS: false,
    opportunisticTLS: false,
    auth: { user: config.user, pass: config.password },
    forceAuth: true,
    tls: { rejectUnauthorized: true, minVersion: "TLSv1.2" },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    logger: false,
    debug: false,
    disableFileAccess: true,
    disableUrlAccess: true,
    // Own the TCP socket so the overall deadline also aborts active SMTP I/O.
    getSocket(options, callback) {
      const socket = net.createConnection({
        host: options.host!,
        port: Number(options.port),
      });
      trackSocket(socket);
      let completed = false;
      const finish = (error: Error | null) => {
        if (completed) return;
        completed = true;
        socket.removeListener("error", failed);
        socket.removeListener("timeout", timedOut);
        socket.setTimeout(0);
        if (error) {
          socket.destroy();
          callback(error, false);
        } else callback(null, { connection: socket });
      };
      const failed = (error: Error) => finish(error);
      const timedOut = () => finish(new Error("SMTP connection timeout."));
      socket.once("connect", () => finish(null));
      socket.once("error", failed);
      socket.once("timeout", timedOut);
      socket.setTimeout(10_000);
    },
  });
}

async function withSmtp(
  config: Extract<MailConfiguration, { transport: "smtp" }>,
  action: (transport: ReturnType<typeof smtpTransport>) => Promise<unknown>,
  failureMessage: string,
) {
  let transport: ReturnType<typeof smtpTransport> | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let socket: Socket | undefined;
  try {
    transport = smtpTransport(config, (connectedSocket) => {
      socket = connectedSocket;
    });
    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("SMTP timeout.")), 20_000);
    });
    await Promise.race([action(transport), deadline]);
  } catch {
    // SMTP responses can contain addresses, tokens or credentials. Never expose them.
    throw new Error(failureMessage);
  } finally {
    if (timer) clearTimeout(timer);
    socket?.destroy();
    transport?.close();
  }
}

export async function sendMail(
  to: string,
  purpose: MailPurpose,
  secret: string,
): Promise<void> {
  const config = validateMailConfiguration();
  if (config.transport === "disabled")
    throw new Error("Email is disabled in the synthetic preview.");
  if (config.transport === "local") return localMail(to, purpose, secret);
  if (!validAddress(to)) throw new Error("Email recipient is invalid.");
  const url = accountUrl(purpose, secret);
  const verify = purpose === "verify";
  const subject = verify
    ? `Conferma la tua email su ${brand.name}`
    : `Reimposta la password di ${brand.name}`;
  const introduction = verify
    ? `Conferma il tuo indirizzo email per usare il tuo account ${brand.name}.`
    : `Hai richiesto di reimpostare la password del tuo account ${brand.name}.`;
  const label = verify ? "Conferma email" : "Reimposta password";
  const expiry =
    "Questo link scade tra 30 minuti e può essere usato una sola volta.";
  await withSmtp(
    config,
    async (transport) => {
      const result = await transport.sendMail({
        from: { name: brand.name, address: config.from },
        to: { address: to, name: "" },
        subject,
        text: `${introduction}\n\n${label}: ${url}\n\n${expiry}\n\nSe non hai richiesto questa email, puoi ignorarla.`,
        html: `<p>${introduction}</p><p><a href="${htmlEscape(url)}">${label}</a></p><p>${expiry}</p><p>Se non hai richiesto questa email, puoi ignorarla.</p>`,
      });
      if (result.rejected.length || !result.accepted.length)
        throw new Error("SMTP recipient was not accepted.");
    },
    "Email delivery failed.",
  );
}

/** Explicit network preflight: authenticates without sending a message. */
export async function verifyMailTransport(
  config = validateMailConfiguration(),
): Promise<void> {
  if (config.transport !== "smtp") return;
  await withSmtp(
    config,
    (transport) => transport.verify(),
    "SMTP transport verification failed.",
  );
}
