import { createHash } from "node:crypto";
import sharp from "sharp";
import { Problem } from "./domain.js";
import { validateIncomePdf } from "./income-pdf.js";

export const incomeDocumentLimits = {
  countPerPerson: 3,
  bytes: 5 * 1024 * 1024,
  pixels: 25_000_000,
  dimension: 3200,
} as const;

export function incomeDocumentKey(id: string, extension: "pdf" | "webp") {
  if (
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(
      id,
    ) ||
    !["pdf", "webp"].includes(extension)
  )
    throw new Error("Invalid income document object key.");
  return `income-documents/${id}.${extension}`;
}

// Format checks never certify a document or the income written in it. PDFs
// remain download-only. Images are re-encoded to remove embedded metadata.
export async function normalizeIncomeDocument(body: Buffer, mimetype: string) {
  if (body.length > incomeDocumentLimits.bytes)
    throw new Problem(413, "Ogni documento può pesare al massimo 5 MB.");
  if (!body.length)
    throw new Problem(400, "Il file è vuoto. Scegli un altro documento.");
  let data: Buffer;
  let mime: "application/pdf" | "image/webp";
  let extension: "pdf" | "webp";
  if (mimetype === "application/pdf") {
    await validateIncomePdf(body);
    data = body;
    mime = "application/pdf";
    extension = "pdf";
  } else {
    const formats: Record<string, string> = {
      "image/jpeg": "jpeg",
      "image/png": "png",
      "image/webp": "webp",
    };
    if (!formats[mimetype])
      throw new Problem(415, "Scegli un PDF oppure una foto JPG, PNG o WebP.");
    try {
      const image = sharp(body, {
        limitInputPixels: incomeDocumentLimits.pixels,
        animated: false,
        failOn: "warning",
      });
      const metadata = await image.metadata();
      if (metadata.format !== formats[mimetype] || (metadata.pages || 1) > 1)
        throw new Error("Unsupported image format.");
      data = await image
        .rotate()
        .resize({
          width: incomeDocumentLimits.dimension,
          height: incomeDocumentLimits.dimension,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 90 })
        .toBuffer();
    } catch {
      throw new Problem(415, "La foto non è leggibile. Scegli un altro file.");
    }
    if (data.length > incomeDocumentLimits.bytes)
      throw new Problem(413, "Usa una foto più leggera, massimo 5 MB.");
    mime = "image/webp";
    extension = "webp";
  }
  return {
    data,
    mime,
    extension,
    sha256: createHash("sha256").update(data).digest("hex"),
  };
}
