import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const USER_ID = "c697e83a-3a0a-40c4-b834-18788aca69ad";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  db: { schema: "iba" },
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const MONTHS: Record<string, number> = {
  janeiro: 1, fevereiro: 2, março: 3, abril: 4,
  maio: 5, junho: 6, julho: 7, agosto: 8,
  setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
};

function parseDate(raw: string): string {
  // "27/dezembro/1988" -> "1988-12-27"
  const parts = raw.trim().split("/");
  const day = parts[0].padStart(2, "0");
  const month = MONTHS[parts[1].toLowerCase()];
  const year = parts[2];
  return `${year}-${String(month).padStart(2, "0")}-${day}`;
}

function splitVehicle(raw: string): { brand: string; model: string } {
  const parts = raw.trim().split(/\s+/);
  const brand = parts[0];
  const model = parts.slice(1).join(" ") || "-";
  return { brand, model };
}

async function main() {
  const csv = readFileSync(resolve(__dirname, "../iucs.csv"), "utf-8");
  const lines = csv.split("\n").slice(1).filter((l) => l.trim());

  // Parse rows
  const rows = lines.map((line) => {
    // Handle quoted fields with commas
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        fields.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    fields.push(current);

    const name = fields[0].trim();
    const nif = fields[1].trim();
    const vehicleRaw = fields[2].trim();
    const plate = fields[3].trim();
    const regDateRaw = fields[4].trim();
    const paidRaw = fields[7]?.trim().toUpperCase();

    const { brand, model } = splitVehicle(vehicleRaw);
    const registrationDate = parseDate(regDateRaw);
    const iucMonth = new Date(registrationDate).getMonth() + 1;

    return { name, nif, brand, model, plate, registrationDate, iucMonth, paid: paidRaw === "TRUE" };
  });

  // Get unique clients
  const clientMap = new Map<string, string>(); // nif -> name
  for (const row of rows) {
    if (!clientMap.has(row.nif)) {
      clientMap.set(row.nif, row.name);
    }
  }

  console.log(`Found ${clientMap.size} unique clients and ${rows.length} vehicles\n`);

  // Insert clients
  const clientIdMap = new Map<string, string>(); // nif -> client uuid

  for (const [nif, name] of clientMap) {
    // Check if client already exists
    const { data: existing } = await supabase
      .from("iba_clients")
      .select("id")
      .eq("user_id", USER_ID)
      .eq("nif", nif)
      .maybeSingle();

    if (existing) {
      clientIdMap.set(nif, existing.id);
      console.log(`  Client exists: ${name} (${nif})`);
      continue;
    }

    const { data, error } = await supabase
      .from("iba_clients")
      .insert({ user_id: USER_ID, name, nif })
      .select("id")
      .single();

    if (error) {
      console.error(`  ERROR inserting client ${name} (${nif}):`, error.message);
      continue;
    }

    clientIdMap.set(nif, data.id);
    console.log(`  Inserted client: ${name} (${nif})`);
  }

  console.log(`\nInserting ${rows.length} vehicles...\n`);

  // Insert vehicles
  for (const row of rows) {
    const clientId = clientIdMap.get(row.nif);
    if (!clientId) {
      console.error(`  SKIP vehicle ${row.plate}: no client for NIF ${row.nif}`);
      continue;
    }

    // Check if vehicle already exists
    const { data: existing } = await supabase
      .from("iba_vehicles")
      .select("id")
      .eq("user_id", USER_ID)
      .eq("license_plate", row.plate)
      .maybeSingle();

    if (existing) {
      console.log(`  Vehicle exists: ${row.plate} (${row.brand} ${row.model})`);
      continue;
    }

    const { error } = await supabase.from("iba_vehicles").insert({
      client_id: clientId,
      user_id: USER_ID,
      brand: row.brand,
      model: row.model,
      license_plate: row.plate,
      registration_date: row.registrationDate,
      iuc_month: row.iucMonth,
    });

    if (error) {
      console.error(`  ERROR inserting vehicle ${row.plate}:`, error.message);
    } else {
      console.log(`  Inserted: ${row.plate} — ${row.brand} ${row.model} (${row.registrationDate})`);
    }
  }

  console.log("\nDone!");
}

main().catch(console.error);
