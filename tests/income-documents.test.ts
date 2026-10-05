import { createHash } from "node:crypto";
import { PDFDocument, PDFName, PDFString } from "pdf-lib";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import {
  incomeDocumentKey,
  incomeDocumentLimits,
  normalizeIncomeDocument,
} from "../server/income-documents";

async function samplePdf(active = false) {
  const pdf = await PDFDocument.create();
  pdf
    .addPage([250, 300])
    .drawText("Documento sintetico per il test del reddito.");
  if (active)
    pdf.catalog.set(
      PDFName.of("OpenAction"),
      pdf.context.obj({
        S: PDFName.of("JavaScript"),
        JS: PDFString.of("synthetic-only"),
      }),
    );
  return Buffer.from(await pdf.save());
}

async function sampleImage(format: "jpeg" | "png" | "webp") {
  return sharp({
    create: { width: 320, height: 240, channels: 3, background: "#447788" },
  })
    [format]()
    .toBuffer();
}

describe("private financial-document image normalization", () => {
  it.each([
    ["jpeg", "image/jpeg"],
    ["png", "image/png"],
    ["webp", "image/webp"],
  ] as const)(
    "decodes %s and stores a readable normalized WebP",
    async (format, mime) => {
      const body = await sampleImage(format);
      const result = await normalizeIncomeDocument(body, mime);
      expect(result).toMatchObject({ mime: "image/webp", extension: "webp" });
      expect(result.sha256).toBe(
        createHash("sha256").update(result.data).digest("hex"),
      );
      const metadata = await sharp(result.data).metadata();
      expect(metadata).toMatchObject({
        format: "webp",
        width: 320,
        height: 240,
      });
      expect(result.data.length).toBeLessThanOrEqual(
        incomeDocumentLimits.bytes,
      );
      expect(metadata.exif).toBeUndefined();
      expect(metadata.xmp).toBeUndefined();
    },
  );

  it("rotates a scanned image, bounds its dimensions and strips source metadata", async () => {
    const body = await sharp({
      create: { width: 4800, height: 3600, channels: 3, background: "white" },
    })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .withExif({
        IFD0: {
          Artist: "Synthetic Test Person",
          Copyright: "Synthetic document only",
        },
      })
      .toBuffer();
    const original = await sharp(body).metadata();
    expect(original.orientation).toBe(6);
    expect(original.exif).toBeDefined();
    const result = await normalizeIncomeDocument(body, "image/jpeg");
    const metadata = await sharp(result.data).metadata();
    expect(metadata).toMatchObject({
      format: "webp",
      width: 2400,
      height: 3200,
    });
    expect(metadata.exif).toBeUndefined();
    expect(metadata.orientation).toBeUndefined();
    expect(metadata.icc).toBeUndefined();
    expect(metadata.xmp).toBeUndefined();
    expect(result.data.toString("latin1")).not.toContain(
      "Synthetic Test Person",
    );
  });

  it("rejects decoded images beyond the pixel budget even when compressed bytes are small", async () => {
    const body = await sharp({
      create: { width: 5001, height: 5000, channels: 3, background: "white" },
    })
      .png()
      .toBuffer();
    expect(body.length).toBeLessThan(incomeDocumentLimits.bytes);
    await expect(
      normalizeIncomeDocument(body, "image/png"),
    ).rejects.toMatchObject({ statusCode: 415 });
  });

  it("rejects multi-frame WebP documents rather than silently taking one frame", async () => {
    const body = await sharp(
      Buffer.concat([
        Buffer.alloc(4 * 4 * 3, 255),
        Buffer.alloc(4 * 4 * 3, 80),
      ]),
      { raw: { width: 4, height: 8, channels: 3, pageHeight: 4 } },
    )
      .webp({ delay: [200, 200], loop: 0 })
      .toBuffer();
    expect((await sharp(body, { animated: true }).metadata()).pages).toBe(2);
    await expect(
      normalizeIncomeDocument(body, "image/webp"),
    ).rejects.toMatchObject({ statusCode: 415 });
  });

  it("rejects a truncated image whose header still claims a supported format", async () => {
    const body = (await sampleImage("png")).subarray(0, 30);
    await expect(
      normalizeIncomeDocument(body, "image/png"),
    ).rejects.toMatchObject({ statusCode: 415 });
  });
});

describe("financial-document format and size checks", () => {
  it("retains a structurally valid PDF as download-only source bytes", async () => {
    const body = await samplePdf();
    const before = Buffer.from(body);
    const result = await normalizeIncomeDocument(body, "application/pdf");
    expect(result).toMatchObject({ mime: "application/pdf", extension: "pdf" });
    expect(result.data).toEqual(before);
    expect(body).toEqual(before);
    expect(result.sha256).toBe(
      createHash("sha256").update(before).digest("hex"),
    );
  });

  it("uses structural PDF validation rather than accepting a signature or active PDF", async () => {
    for (const body of [
      Buffer.from("%PDF-1.7\nnot a document\n%%EOF"),
      await samplePdf(true),
    ])
      await expect(
        normalizeIncomeDocument(body, "application/pdf"),
      ).rejects.toMatchObject({ statusCode: 415 });
  });

  it.each(["application/pdf", "image/png"])(
    "rejects an empty %s and oversized bytes before decoding",
    async (mime) => {
      await expect(
        normalizeIncomeDocument(Buffer.alloc(0), mime),
      ).rejects.toMatchObject({ statusCode: 400 });
      await expect(
        normalizeIncomeDocument(
          Buffer.alloc(incomeDocumentLimits.bytes + 1),
          mime,
        ),
      ).rejects.toMatchObject({ statusCode: 413 });
    },
  );

  it.each([
    "text/html",
    "image/svg+xml",
    "image/gif",
    "application/octet-stream",
  ])("rejects unsupported media type %s", async (mime) => {
    await expect(
      normalizeIncomeDocument(Buffer.from("synthetic body"), mime),
    ).rejects.toMatchObject({ statusCode: 415 });
  });

  it("rejects image MIME spoofing, a PDF posing as an image and an image posing as PDF", async () => {
    const png = await sampleImage("png");
    for (const [body, mime] of [
      [png, "image/jpeg"],
      [png, "application/pdf"],
      [await samplePdf(), "image/png"],
    ] as const)
      await expect(normalizeIncomeDocument(body, mime)).rejects.toMatchObject({
        statusCode: 415,
      });
  });
});

describe("private income-document storage keys", () => {
  const id = "abcdefab-cdef-4abc-8def-123456789abc";
  it.each(["pdf", "webp"] as const)(
    "accepts a generated UUID and the permitted %s extension",
    (extension) => {
      expect(incomeDocumentKey(id, extension)).toBe(
        `income-documents/${id}.${extension}`,
      );
    },
  );

  it.each([
    "",
    "../document",
    `${id}/../other`,
    `income-documents/${id}`,
    id.toUpperCase(),
    `${id}.pdf`,
    "../../../etc/passwd",
  ])("rejects an unsafe or noncanonical document identifier %s", (unsafe) =>
    expect(() => incomeDocumentKey(unsafe, "pdf")).toThrow(
      "Invalid income document object key.",
    ),
  );

  it.each(["jpg", "PDF", "pdf/../other", "pdf\u0000"])(
    "rejects unsafe extension %s even through an untyped caller",
    (extension) => {
      expect(() => incomeDocumentKey(id, extension as "pdf")).toThrow(
        "Invalid income document object key.",
      );
    },
  );
});
