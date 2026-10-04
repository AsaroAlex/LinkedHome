import type { PoolClient } from "pg";
import type { DB } from "./db.js";
import { digest, token } from "./auth.js";

export const previewCookieName = "__Host-linkedhome-preview";
export const previewLifetime = 7 * 86400;
export interface PreviewWorkspace {
  tenant_id: string;
  landlord_id: string;
}

export async function findPreviewWorkspace(
  db: DB | PoolClient,
  secret: string | undefined,
): Promise<PreviewWorkspace | null> {
  if (!secret || !/^[a-f0-9]{64}$/.test(secret)) return null;
  const { rows } = await db.query(
    "SELECT tenant_id,landlord_id FROM preview_workspaces WHERE token_hash=$1 AND expires_at>now()",
    [digest(secret)],
  );
  return rows[0] || null;
}

export async function createPreviewWorkspace(c: PoolClient) {
  const secret = token();
  const accounts: string[] = [];
  for (const [role, name] of [
    ["tenant", "Giulia · demo"],
    ["landlord", "Andrea · demo"],
  ]) {
    const { rows } = await c.query(
      // This marker cannot pass checkPassword, including if a preview database
      // is later opened by another runtime. Preview never accepts passwords.
      "INSERT INTO users(email,password_hash,display_name,role,email_verified) VALUES($1,'preview-disabled',$2,$3,true) RETURNING id",
      [`${role}-${token()}@example.test`, name, role],
    );
    accounts.push(rows[0].id);
  }
  const workspace = { tenant_id: accounts[0], landlord_id: accounts[1] };
  await c.query(
    "INSERT INTO profiles(user_id,city,budget,move_in,duration,occupants,status,published_at) VALUES($1,'Bologna',1100,(current_date+60),12,2,'published',now())",
    [workspace.tenant_id],
  );
  await c.query(
    `INSERT INTO properties(owner_id,title,city,area,description,rent,available_from,min_months,max_months,capacity,sqm,rooms,furnished,authority_attested,status,published_at)
    VALUES($1,'Trilocale dimostrativo a Bologna','Bologna','Saragozza','Immobile sintetico per provare ricerca, inviti e conversazioni nella preview.',850,(current_date+30),6,36,2,65,3,true,true,'published',now())`,
    [workspace.landlord_id],
  );
  await c.query(
    "INSERT INTO preview_workspaces(token_hash,tenant_id,landlord_id,expires_at) VALUES($1,$2,$3,now()+interval '7 days')",
    [digest(secret), workspace.tenant_id, workspace.landlord_id],
  );
  return { workspace, secret };
}
