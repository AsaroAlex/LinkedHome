import { describe, it, expect, vi } from "vitest";
import { migrate } from "../scripts/migrate";
import type { DB } from "../server/db";

describe("migration failure recovery", () => {
  it("destroys the borrowed client even when cleanup fails and preserves the initial error", async () => {
    const original = new Error("Database connection lost");
    const release = vi.fn();
    const query = vi
      .fn()
      .mockRejectedValueOnce(original)
      .mockRejectedValue(new Error("Unlock connection unavailable"));
    const pool = { connect: async () => ({ query, release }) } as unknown as DB;
    await expect(migrate(pool)).rejects.toBe(original);
    expect(release).toHaveBeenCalledExactlyOnceWith(true);
  });
});
