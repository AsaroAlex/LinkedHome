import { describe, expect, it } from "vitest";
import { PDFDocument, PDFName, PDFString } from "pdf-lib";
import { validateIncomePdf } from "../server/income-pdf";

async function genuinePdf(
  options: {
    pages?: number;
    objectStreams?: boolean;
    activeName?: string;
    indirect?: boolean;
    encrypted?: boolean;
  } = {},
) {
  const pdf = await PDFDocument.create();
  for (let index = 0; index < (options.pages ?? 1); index++)
    pdf.addPage([250, 300]).drawText("Prova sintetica del reddito");
  if (options.activeName) {
    const payload = pdf.context.obj({
      S: PDFName.of(options.activeName),
      Payload: PDFString.of("synthetic-only"),
    });
    const value = options.indirect ? pdf.context.register(payload) : payload;
    pdf.catalog.set(PDFName.of("SyntheticDocumentTest"), value);
  }
  if (options.encrypted)
    pdf.context.trailerInfo.Encrypt = pdf.context.register(
      pdf.context.obj({ Filter: "Standard", V: 1, R: 2 }),
    );
  return Buffer.from(
    await pdf.save({
      useObjectStreams: options.objectStreams ?? false,
      addDefaultPage: false,
    }),
  );
}

describe("bounded structural PDF validation", () => {
  it("accepts a genuine plain PDF without altering the source bytes", async () => {
    const body = await genuinePdf();
    const before = Buffer.from(body);
    await expect(validateIncomePdf(body)).resolves.toBeUndefined();
    expect(body).toEqual(before);
  });

  it("accepts genuine compressed object streams and the 50-page boundary", async () => {
    await expect(
      validateIncomePdf(await genuinePdf({ pages: 50, objectStreams: true })),
    ).resolves.toBeUndefined();
  });

  it.each([
    Buffer.alloc(0),
    Buffer.from("not a PDF"),
    Buffer.from("%PDF-1.7\nnot a document\n%%EOF"),
    Buffer.from("%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF"),
    Buffer.alloc(5 * 1024 * 1024 + 1, 0),
  ])("rejects malformed or oversized bytes with a safe error", async (body) => {
    await expect(validateIncomePdf(body)).rejects.toMatchObject({
      statusCode: 415,
    });
  });

  it("rejects PDFs without pages and PDFs exceeding 50 pages", async () => {
    await expect(
      validateIncomePdf(await genuinePdf({ pages: 0 })),
    ).rejects.toMatchObject({ statusCode: 415 });
    await expect(
      validateIncomePdf(await genuinePdf({ pages: 51 })),
    ).rejects.toMatchObject({ statusCode: 415 });
  });

  it.each([
    "JavaScript",
    "JS",
    "Launch",
    "OpenAction",
    "AA",
    "EmbeddedFile",
    "RichMedia",
    "XFA",
    "Encrypt",
  ])(
    "rejects active PDF name %s after structural parsing",
    async (activeName) => {
      await expect(
        validateIncomePdf(await genuinePdf({ activeName })),
      ).rejects.toMatchObject({ statusCode: 415 });
    },
  );

  it.each([
    ["JavaScript", "Java#53cript"],
    ["JS", "#4a#53"],
    ["Launch", "#4c#61unch"],
  ])("rejects escaped PDF name %s", async (activeName, escapedName) => {
    const body = await genuinePdf({ activeName });
    const escaped = Buffer.from(
      body.toString("latin1").replace(`/${activeName}`, `/${escapedName}`),
      "latin1",
    );
    // PDF readers permit a repaired xref; validation must inspect parsed names.
    const parsed = await PDFDocument.load(escaped, {
      throwOnInvalidObject: true,
      updateMetadata: false,
    });
    expect(parsed.getPageCount()).toBe(1);
    await expect(validateIncomePdf(escaped)).rejects.toMatchObject({
      statusCode: 415,
    });
  });

  it("rejects active names inside compressed indirect objects", async () => {
    const body = await genuinePdf({
      activeName: "JavaScript",
      indirect: true,
      objectStreams: true,
    });
    expect(body.includes(Buffer.from("/JavaScript"))).toBe(false);
    await expect(validateIncomePdf(body)).rejects.toMatchObject({
      statusCode: 415,
    });
  });

  it("rejects encrypted documents without exposing parser details", async () => {
    await expect(
      validateIncomePdf(await genuinePdf({ encrypted: true })),
    ).rejects.toMatchObject({
      statusCode: 415,
      message:
        "Usa un PDF leggibile di massimo 50 pagine, senza password, allegati o contenuti interattivi.",
    });
  });

  it("caps concurrent parsing and frees capacity after workers finish", async () => {
    const body = await genuinePdf();
    const first = validateIncomePdf(body);
    const second = validateIncomePdf(body);
    await expect(validateIncomePdf(body)).rejects.toMatchObject({
      statusCode: 429,
    });
    await Promise.all([first, second]);
    await expect(validateIncomePdf(body)).resolves.toBeUndefined();
  });
});
