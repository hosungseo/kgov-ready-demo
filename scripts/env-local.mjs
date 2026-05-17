import fs from "node:fs";
import path from "node:path";

export function loadEnvLocal(file = ".env.local") {
  const envPath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(envPath)) return false;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match || process.env[match[1]]) continue;

    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }

  return true;
}
