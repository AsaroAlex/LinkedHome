import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { promisify } from "node:util";
const scrypt = promisify(scryptCallback);
export const token = () => randomBytes(32).toString("hex");
export const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export async function hashPassword(password: string) {
  const salt = token();
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}
export async function checkPassword(password: string, stored: string) {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  const original = Buffer.from(expected, "hex");
  return hash.length === original.length && timingSafeEqual(hash, original);
}
export interface User {
  id: string;
  email: string;
  display_name: string;
  role: "tenant" | "landlord" | "both";
  staff_role: "admin" | "moderator" | null;
  email_verified: boolean;
  suspended: boolean;
  suspension_reason: string | null;
}
export const userColumns =
  "id,email,display_name,role,staff_role,email_verified,suspended,suspension_reason";
