import { createRequire } from "node:module";
import { Worker } from "node:worker_threads";
import { Problem } from "./domain.js";

const pdfLibPath = createRequire(import.meta.url).resolve("pdf-lib");
const maxBytes = 5 * 1024 * 1024;
const maxConcurrent = 2;
const timeoutMs = 5_000;
let activeWorkers = 0;

// Parsing is structural validation, not an authenticity or malware check.
// Keep untrusted PDF parsing outside the API thread, with bounded time and heap.
const workerSource = `
const { parentPort, workerData } = require('node:worker_threads');
const { PDFDocument, PDFName, PDFDict, PDFArray, PDFRef, PDFStream } = require(workerData.pdfLibPath);
const forbidden = new Set(['JavaScript', 'JS', 'Launch', 'OpenAction', 'AA', 'EmbeddedFile', 'RichMedia', 'XFA', 'Encrypt']);
(async () => {
  try {
    const pdf = await PDFDocument.load(workerData.body, {
      ignoreEncryption: false,
      throwOnInvalidObject: true,
      updateMetadata: false,
    });
    const count = pdf.getPageCount();
    if (pdf.isEncrypted || count < 1 || count > 50) throw new Error();
    const pending = [pdf.catalog, pdf.context.trailerInfo.Encrypt,
      ...pdf.context.enumerateIndirectObjects().map((entry) => entry[1])];
    const visited = new Set();
    while (pending.length) {
      const object = pending.pop();
      if (!object || visited.has(object)) continue;
      visited.add(object);
      if (visited.size > 20_000) throw new Error();
      if (object instanceof PDFName) {
        // PDF name escapes allow both upper- and lower-case hex digits. Some
        // pdf-lib name normalization paths preserve a lower-case escape.
        const name = object.decodeText().replace(/#([0-9a-f]{2})/gi,
          (_, hex) => String.fromCharCode(parseInt(hex, 16)));
        if (forbidden.has(name)) throw new Error();
      } else if (object instanceof PDFRef) {
        const target = pdf.context.lookup(object);
        if (!target) throw new Error();
        pending.push(target);
      } else if (object instanceof PDFDict) {
        for (const [key, value] of object.entries()) pending.push(key, value);
      } else if (object instanceof PDFArray) {
        for (let index = 0; index < object.size(); index++) pending.push(object.get(index));
      } else if (object instanceof PDFStream) {
        pending.push(object.dict);
      }
    }
    parentPort.postMessage(true);
  } catch {
    parentPort.postMessage(false);
  }
})();
`;

const invalidPdf = () =>
  new Problem(
    415,
    "Usa un PDF leggibile di massimo 50 pagine, senza password, allegati o contenuti interattivi.",
  );

export async function validateIncomePdf(body: Buffer): Promise<void> {
  if (!body.length || body.length > maxBytes) throw invalidPdf();
  if (activeWorkers >= maxConcurrent)
    throw new Problem(
      429,
      "Stiamo controllando altri documenti. Attendi qualche secondo e riprova.",
    );
  activeWorkers++;
  try {
    await new Promise<void>((resolve, reject) => {
      const worker = new Worker(workerSource, {
        eval: true,
        workerData: { body, pdfLibPath },
        resourceLimits: {
          maxOldGenerationSizeMb: 64,
          maxYoungGenerationSizeMb: 8,
          stackSizeMb: 4,
        },
        stdout: true,
        stderr: true,
      });
      // Parser warnings and errors must never expose document content in logs.
      worker.stdout?.resume();
      worker.stderr?.resume();
      let finished = false;
      const finish = async (valid: boolean) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        await worker.terminate().catch(() => {});
        if (valid) resolve();
        else reject(invalidPdf());
      };
      const timer = setTimeout(() => void finish(false), timeoutMs);
      worker.once("message", (valid) => void finish(valid === true));
      worker.once("error", () => void finish(false));
      worker.once("exit", () => void finish(false));
    });
  } catch (error) {
    throw error instanceof Problem ? error : invalidPdf();
  } finally {
    activeWorkers--;
  }
}
