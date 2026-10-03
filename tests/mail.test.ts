import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFile, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import net, { type Socket } from "node:net";
import tls, { type TLSSocket } from "node:tls";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

const mocks = vi.hoisted(() => ({
  createTransport: vi.fn(),
  localDir: `/tmp/linkedhome-mail-tests-${process.pid}-${Date.now()}`,
}));
vi.mock("nodemailer", async (importOriginal) => {
  const actual = await importOriginal<typeof import("nodemailer")>();
  return {
    ...actual,
    default: { ...actual.default, createTransport: mocks.createTransport },
  };
});
vi.mock("../server/config.js", () => ({
  localDir: mocks.localDir,
  appOrigin: "https://linkedhome.example",
}));

import {
  localMail,
  sendMail,
  validateMailConfiguration,
  verifyMailTransport,
} from "../server/mail";

const environment = {
  APP_ENV: "local",
  MAIL_TRANSPORT: "smtp",
  SMTP_HOST: "smtp.example.test",
  SMTP_PORT: "587",
  SMTP_USER: "synthetic-user",
  SMTP_PASSWORD: "synthetic-password",
  MAIL_FROM: "no-reply@example.test",
};
const recipient = "person@example.test";
const secret = "synthetic-token";
const transport = () => ({
  sendMail: vi.fn().mockResolvedValue({ accepted: [recipient], rejected: [] }),
  verify: vi.fn().mockResolvedValue(true),
  close: vi.fn(),
});
let stub = transport();
beforeEach(() => {
  for (const [name, value] of Object.entries(environment))
    vi.stubEnv(name, value);
  stub = transport();
  mocks.createTransport.mockReset().mockReturnValue(stub);
});
afterEach(async () => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  await rm(mocks.localDir, { recursive: true, force: true });
});

describe("mail configuration", () => {
  it("keeps local development private and requires SMTP for either deployment", () => {
    expect(validateMailConfiguration({})).toEqual({ transport: "local" });
    for (const APP_ENV of ["staging", "production"])
      expect(() => validateMailConfiguration({ APP_ENV })).toThrow(
        "Deployed environments require MAIL_TRANSPORT=smtp.",
      );
    expect(() => validateMailConfiguration({}, true)).toThrow();
  });
  it.each([
    ["MAIL_TRANSPORT", "unexpected"],
    ["SMTP_HOST", ""],
    ["SMTP_HOST", "https://smtp.example.test"],
    ["SMTP_HOST", "smtp.-invalid.test"],
    ["SMTP_HOST", "smtp..example.test"],
    ["SMTP_HOST", "smtp.example.test\r\ninjected"],
    ["SMTP_PORT", "25"],
    ["SMTP_PORT", "587garbage"],
    ["SMTP_USER", ""],
    ["SMTP_PASSWORD", ""],
    ["MAIL_FROM", ""],
    ["MAIL_FROM", "sender@example.test,other@example.test"],
    ["MAIL_FROM", ".sender@example.test"],
    ["MAIL_FROM", "sender@example.test\r\nBcc:other@example.test"],
  ])("rejects invalid %s without exposing its value", (name, value) => {
    expect(() =>
      validateMailConfiguration({ ...environment, [name]: value }),
    ).toThrow();
  });
  it("accepts both supported encrypted SMTP ports", () => {
    for (const port of ["465", "587"])
      expect(
        validateMailConfiguration({ ...environment, SMTP_PORT: port }),
      ).toMatchObject({ transport: "smtp", port: Number(port) });
  });
  it("keeps sensitive configuration values out of validation errors", () => {
    try {
      validateMailConfiguration({
        ...environment,
        SMTP_HOST: `https://${secret}/${environment.SMTP_PASSWORD}`,
      });
      throw new Error("Expected configuration rejection.");
    } catch (error) {
      expect((error as Error).message).toBe("SMTP_HOST must be a hostname.");
    }
  });
});

describe("transactional email", () => {
  it.each(["verify", "reset"] as const)(
    "builds %s text and HTML with a fragment token and no tracking",
    async (purpose) => {
      await sendMail(recipient, purpose, secret);
      expect(stub.sendMail).toHaveBeenCalledOnce();
      const message = stub.sendMail.mock.calls[0]![0];
      expect(message.text).toContain(
        `https://linkedhome.example/account/${purpose}#${secret}`,
      );
      expect(message.html).toContain(
        `href="https://linkedhome.example/account/${purpose}#${secret}"`,
      );
      expect(message.html).not.toMatch(/<img|<script|\?token=/);
      expect(message.from).toEqual({
        name: "Soglia",
        address: environment.MAIL_FROM,
      });
      expect(message.text).toContain("30 minuti");
      expect(message.text).toContain("una sola volta");
      expect(stub.close).toHaveBeenCalledOnce();
    },
  );
  it.each(["465", "587"])(
    "enforces TLS and certificate verification on port %s",
    async (port) => {
      vi.stubEnv("SMTP_PORT", port);
      await sendMail(recipient, "verify", secret);
      expect(mocks.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          secure: port === "465",
          requireTLS: port === "587",
          ignoreTLS: false,
          opportunisticTLS: false,
          tls: { rejectUnauthorized: true, minVersion: "TLSv1.2" },
          connectionTimeout: 10_000,
          greetingTimeout: 10_000,
          socketTimeout: 20_000,
          logger: false,
          debug: false,
          disableFileAccess: true,
          disableUrlAccess: true,
        }),
      );
    },
  );
  it("verifies authentication without sending a message", async () => {
    await verifyMailTransport();
    expect(stub.verify).toHaveBeenCalledOnce();
    expect(stub.sendMail).not.toHaveBeenCalled();
    expect(stub.close).toHaveBeenCalledOnce();
  });
  it("sanitizes SMTP failures and rejected recipients without local fallback", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      stub.sendMail.mockRejectedValueOnce(
        new Error(`535 ${recipient} ${secret} ${environment.SMTP_PASSWORD}`),
      );
      await expect(sendMail(recipient, "reset", secret)).rejects.toThrow(
        /^Email delivery failed\.$/,
      );
      stub.sendMail.mockResolvedValueOnce({
        accepted: [],
        rejected: [recipient],
      });
      await expect(sendMail(recipient, "verify", secret)).rejects.toThrow(
        /^Email delivery failed\.$/,
      );
      stub.verify.mockRejectedValueOnce(new Error("sensitive SMTP response"));
      await expect(verifyMailTransport()).rejects.toThrow(
        /^SMTP transport verification failed\.$/,
      );
      expect(log).not.toHaveBeenCalled();
      await expect(readdir(mocks.localDir)).rejects.toMatchObject({
        code: "ENOENT",
      });
    } finally {
      log.mockRestore();
    }
  });
  it("closes stalled operations after the overall 20 second deadline", async () => {
    vi.useFakeTimers();
    stub.sendMail.mockImplementationOnce(() => new Promise(() => {}));
    const sending = sendMail(recipient, "verify", secret);
    const rejected = expect(sending).rejects.toThrow(
      /^Email delivery failed\.$/,
    );
    await vi.advanceTimersByTimeAsync(20_000);
    await rejected;
    expect(stub.close).toHaveBeenCalledOnce();
  });
  it("writes local messages with mode 0600 and refuses direct deployed use", async () => {
    vi.stubEnv("MAIL_TRANSPORT", "local");
    await sendMail(recipient, "verify", secret);
    const folder = path.join(mocks.localDir, "mail");
    const files = await readdir(folder);
    expect(files).toHaveLength(1);
    const file = path.join(folder, files[0]!);
    expect((await stat(file)).mode & 0o777).toBe(0o600);
    expect((await stat(folder)).mode & 0o777).toBe(0o700);
    expect(JSON.parse(await readFile(file, "utf8"))).toMatchObject({
      to: recipient,
      purpose: "verify",
      url: `https://linkedhome.example/account/verify#${secret}`,
    });
    expect(mocks.createTransport).not.toHaveBeenCalled();
    vi.stubEnv("APP_ENV", "staging");
    await expect(localMail(recipient, "verify", secret)).rejects.toThrow(
      "Local mail is unavailable in deployed environments.",
    );
  });
});

// Isolated, self-signed localhost CA. Trusted explicitly by these tests only.
const testCertificate = `-----BEGIN CERTIFICATE-----
MIIDHzCCAgegAwIBAgIUWuGMgkLPnACbl1ks8pcvMhn0q8EwDQYJKoZIhvcNAQEL
BQAwFDESMBAGA1UEAwwJbG9jYWxob3N0MB4XDTI2MTAwMzE5MTYxN1oXDTM2MDkz
MDE5MTYxN1owFDESMBAGA1UEAwwJbG9jYWxob3N0MIIBIjANBgkqhkiG9w0BAQEF
AAOCAQ8AMIIBCgKCAQEA6FSd8xTmi+fewM3ltdKhXWYOidsmz6HJ0lhOnPCItH6J
svaKigqfUAdjjjM1Ka4mxWOhb+ZiOoH944XomIMY1/Pr4P+dM50KeDXRfU+OEx1/
PS3VIvOK/zwC+0x+wDaW5F7+b6NDv2lauwyNASQTpThwp6IKLdaM5pFgWkkqf0Ni
njNowYfmiP1vp4zphNQbKtnLNwOWkaQmdfPprvlNK3DyPtlMeon6re0AwkAPYqob
kavt5ELAIpcKEaq8dFuy3VE/xdUEQmCwLInYXtD/0FIg50tkFQV1MSVM+Puyf18e
FAjSPytRiJFCiV0nAKDuVE+U5o4j1P5+sNVPHLWp4wIDAQABo2kwZzAdBgNVHQ4E
FgQUqipbEkD+rRaaszu5H+SJrLTLLZ8wHwYDVR0jBBgwFoAUqipbEkD+rRaaszu5
H+SJrLTLLZ8wFAYDVR0RBA0wC4IJbG9jYWxob3N0MA8GA1UdEwEB/wQFMAMBAf8w
DQYJKoZIhvcNAQELBQADggEBAH11DRq+26iZtE8aHRHc+J3D8qezCbJhDGHsBjcs
Ywx4s6yUdG/ycDfUxZQ3nyyNCdskd3E9tI4mAJAx8S14FMfmVTs520iLnW8R0qn4
QyB8z294OMW4JeIKqTVuR5X+07Tn4k3b+uF6e9Ygw2QBCN2g6EyugJx9kajXtOow
MSsHDm57LgUSOpzlAcBJ3zDLzVPLj3Hp4FYaM0dKpZlFbzoixMHj++9ze7X6lnql
ebT+JBNXb6YNxB1CTkYs/nJNs2BHRZfA6rwEHz5owZAKtckdPZyjBAAhQCNQe27o
LeJieZQoRIuHz70SmE2WCInzYQnkoVZlF2/sZ9J9u58f7ww=
-----END CERTIFICATE-----
`;
const testKey = `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDoVJ3zFOaL597A
zeW10qFdZg6J2ybPocnSWE6c8Ii0fomy9oqKCp9QB2OOMzUpribFY6Fv5mI6gf3j
heiYgxjX8+vg/50znQp4NdF9T44THX89LdUi84r/PAL7TH7ANpbkXv5vo0O/aVq7
DI0BJBOlOHCnogot1ozmkWBaSSp/Q2KeM2jBh+aI/W+njOmE1Bsq2cs3A5aRpCZ1
8+mu+U0rcPI+2Ux6ifqt7QDCQA9iqhuRq+3kQsAilwoRqrx0W7LdUT/F1QRCYLAs
idhe0P/QUiDnS2QVBXUxJUz4+7J/Xx4UCNI/K1GIkUKJXScAoO5UT5TmjiPU/n6w
1U8ctanjAgMBAAECggEAFeAzInp4fiTo4Fj4GlIzt80jwk7nInbL6j6UDF/zp0x2
NRUqFKG3wCZ/Sm+U6mXyUvS0yd9fUWirBMY3kUtgG/lk35csm08GoiytxdxR9t0j
UsSNhJB6U9pijNH2P1gEhjVRmiZn0HlK6JY1HViNxv6qUNvHlJWr8mEu5DbDxclf
GDB5hs2XidfRmMMsuDHD6lnMRZnyoB6rxqtf2hOqN38jMmeGxJ8KPI7fIyPgbYWT
iKOTPOfZaQGViwwQQD0s7C2FOymrLh2MZNJgt3yFkgd2p4vlz4wLdjyINS6AVfL9
srEDT7XNW9YbrCw8bRPY31s0hEEklvO3SNOvJb9TTQKBgQD1JPnlG5Um1U1dqFTh
Z7qEP8SqI+hKPrxyOBmMsfJ9KBUNW8fjboJcmHLKX7WJCeNf0nnz8uK0LVP/R5qi
ZZ4Yakm5iVtuQwTOvE4jLmkrGbgYFVEvXYbJUVeTe+CoUKq9mztdXvgbgrBVUQDA
p2Ya1dP1yFHL91fN2PIll5WpfwKBgQDynmEDZ7OGTXIgyHz+wdiqxzIWgAD64pIj
Ph3MCIDpsyOVVjq3P3dEjBf+jw3w6dK9uq6/wNx4JPTja8olGBBolwGvg3tEBG5w
JZ4DT9d5EBWgPCL1Hy/Vs193IzuD6OmW9mCVrnmYX1RhX/EfA9yw1Nh1H2XJaiEJ
Foup2CjJnQKBgQCzLv7Vnw6rXtf48FRymZ40kmPOtQZSVn7pweWy+FK1drnElOSL
cbgptGibUc/gRfEDllX7oPpiFovCGXWG5F3lnLMcwbCp7KSz8+HtRzwp+9ebCuHX
jDY8Ko+nxrFUdfoHM1L2EbeqbCE1i0rQhstULB2NFonrW3S7iqqcHauQQwKBgQCJ
h5n6sigj83bEeqHQT9YgSLZt5rWnghPRAn8lj5Rz5WZAWxcBlWpoYvmfBTyj2gfq
IQ66B/tx55Eh8ZIvIMr8Xs1HzsJrNg/cZpaBzhqYt7Nql2xBgyI8g2eUQ1aTWc5A
Ev2BG9w1saRFZntqV2gcnSruiZPLbuu3GR6mcq/8SQKBgQCfR+qFmZIB3INOuSRM
zQ9cfdUg0DcQQ6o5YcQqwB4gs5NoCD3Mz891a2m9pY40tZD7bGm5sLd2XZ91rsNc
yU/MbFQEvSYZTNFebXv1POtH3C5+iBQe94iN7aYOdlww2jw4C3QHOvDW5s+5aQa3
uk4M5nPEHoO7MkfEgye1kdzygA==
-----END PRIVATE KEY-----
`;

async function smtpServer(
  options: {
    implicit?: boolean;
    advertiseTls?: boolean;
    rejectAuth?: boolean;
    rejectRecipient?: boolean;
    stallAfterData?: boolean;
  } = {},
) {
  const context = tls.createSecureContext({
    key: testKey,
    cert: testCertificate,
  });
  const sockets = new Set<Socket | TLSSocket>();
  const commands: Array<{ command: string; encrypted: boolean }> = [];
  const messages: string[] = [];
  const attach = (socket: Socket | TLSSocket, encrypted: boolean) => {
    sockets.add(socket);
    socket.on("error", () => {});
    socket.once("close", () => sockets.delete(socket));
    let buffer = "";
    let data: string[] | undefined;
    const consume = (chunk: Buffer) => {
      buffer += chunk.toString();
      while (buffer.includes("\r\n")) {
        const end = buffer.indexOf("\r\n");
        const line = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        if (data) {
          if (line === ".") {
            if (!options.stallAfterData) messages.push(data.join("\r\n"));
            data = undefined;
            if (!options.stallAfterData) socket.write("250 accepted\r\n");
          } else data.push(line);
          continue;
        }
        const command = line.split(" ", 1)[0]!;
        commands.push({ command, encrypted });
        if (command === "EHLO") {
          socket.write(
            `250-localhost\r\n${!encrypted && options.advertiseTls !== false ? "250-STARTTLS\r\n" : ""}250 AUTH PLAIN\r\n`,
          );
        } else if (command === "STARTTLS") {
          if (options.advertiseTls === false) {
            socket.write("454 TLS unavailable\r\n");
            continue;
          }
          socket.write("220 Ready to start TLS\r\n");
          socket.removeListener("data", consume);
          const secured = new tls.TLSSocket(socket, {
            isServer: true,
            secureContext: context,
          });
          attach(secured, true);
          return;
        } else if (command === "AUTH") {
          const supplied = Buffer.from(
            line.split(" ")[2] ?? "",
            "base64",
          ).toString();
          const authenticated =
            encrypted &&
            supplied ===
              `\0${environment.SMTP_USER}\0${environment.SMTP_PASSWORD}`;
          socket.write(
            authenticated && !options.rejectAuth
              ? "235 Authenticated\r\n"
              : "535 Authentication refused\r\n",
          );
        } else if (command === "MAIL") socket.write("250 Sender accepted\r\n");
        else if (command === "RCPT")
          socket.write(
            options.rejectRecipient
              ? "550 Recipient refused\r\n"
              : "250 Recipient accepted\r\n",
          );
        else if (command === "DATA") {
          data = [];
          socket.write("354 End with a dot\r\n");
        } else if (command === "QUIT") socket.end("221 Bye\r\n");
        else socket.write("250 OK\r\n");
      }
    };
    socket.on("data", consume);
  };
  const connected = (socket: Socket | TLSSocket) => {
    attach(socket, Boolean(options.implicit));
    socket.write("220 localhost isolated test server\r\n");
  };
  const server = options.implicit
    ? tls.createServer({ key: testKey, cert: testCertificate }, connected)
    : net.createServer(connected);
  server.on("tlsClientError", () => {});
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });
  const address = server.address() as net.AddressInfo;
  return {
    port: address.port,
    commands,
    messages,
    openSockets: () => sockets.size,
    close: async () => {
      for (const socket of sockets) socket.destroy();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}

async function useRealTransport(port: number, trusted = true) {
  const actual =
    await vi.importActual<typeof import("nodemailer")>("nodemailer");
  mocks.createTransport.mockImplementation((options: SMTPTransport.Options) =>
    actual.default.createTransport({
      ...options,
      host: "localhost",
      port,
      tls: {
        ...options.tls,
        ...(trusted ? { ca: testCertificate } : {}),
      },
    }),
  );
}

describe("isolated SMTP protocol", () => {
  it.each([false, true])(
    "delivers only after authenticated TLS (implicit=%s)",
    async (implicit) => {
      const server = await smtpServer({ implicit });
      try {
        vi.stubEnv("SMTP_PORT", implicit ? "465" : "587");
        await useRealTransport(server.port);
        await sendMail(recipient, "verify", secret);
        expect(server.messages).toHaveLength(1);
        expect(server.messages[0]!.replace(/=\r\n/g, "")).toContain(
          `/account/verify#${secret}`,
        );
        expect(
          server.commands
            .filter(({ command }) =>
              ["AUTH", "MAIL", "RCPT", "DATA"].includes(command),
            )
            .every(({ encrypted }) => encrypted),
        ).toBe(true);
        expect(server.commands.some(({ command }) => command === "AUTH")).toBe(
          true,
        );
      } finally {
        await server.close();
      }
    },
  );
  it("verifies a real SMTP session without delivering anything", async () => {
    const server = await smtpServer();
    try {
      await useRealTransport(server.port);
      await verifyMailTransport();
      expect(server.commands.some(({ command }) => command === "AUTH")).toBe(
        true,
      );
      expect(server.commands.some(({ command }) => command === "MAIL")).toBe(
        false,
      );
      expect(server.messages).toHaveLength(0);
    } finally {
      await server.close();
    }
  });
  it("aborts the live TCP connection when the overall deadline expires", async () => {
    const server = await smtpServer({ stallAfterData: true });
    const originalTimeout = globalThis.setTimeout;
    const timeout = vi.spyOn(globalThis, "setTimeout").mockImplementation(((
      ...args: Parameters<typeof setTimeout>
    ) => {
      const [callback, milliseconds, ...callbackArgs] = args;
      return originalTimeout(
        callback,
        milliseconds === 20_000 ? 1_000 : milliseconds,
        ...callbackArgs,
      );
    }) as typeof setTimeout);
    try {
      await useRealTransport(server.port);
      await expect(sendMail(recipient, "reset", secret)).rejects.toThrow(
        /^Email delivery failed\.$/,
      );
      await new Promise((resolve) => originalTimeout(resolve, 25));
      expect(server.commands.some(({ command }) => command === "DATA")).toBe(
        true,
      );
      expect(server.openSockets()).toBe(0);
      expect(server.messages).toHaveLength(0);
    } finally {
      timeout.mockRestore();
      await server.close();
    }
  });
  it.each([
    { name: "untrusted certificate", trusted: false },
    { name: "TLS unavailable", advertiseTls: false },
    { name: "authentication refused", rejectAuth: true },
    { name: "recipient refused", rejectRecipient: true },
  ])("fails safely when $name", async ({ trusted = true, ...options }) => {
    const server = await smtpServer(options);
    try {
      await useRealTransport(server.port, trusted);
      await expect(sendMail(recipient, "reset", secret)).rejects.toThrow(
        /^Email delivery failed\.$/,
      );
      expect(server.messages).toHaveLength(0);
      expect(
        server.commands
          .filter(({ command }) => command === "AUTH")
          .every(({ encrypted }) => encrypted),
      ).toBe(true);
    } finally {
      await server.close();
    }
  });
});
