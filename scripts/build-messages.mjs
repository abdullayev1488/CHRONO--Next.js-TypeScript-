// messages/_parts/<Namespace>.<locale>.json fraqmentlərini messages/<locale>.json faylına birləşdirir
import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "messages");
const parts = path.join(dir, "_parts");
const locales = ["az", "en", "ru"];
const out = Object.fromEntries(locales.map((l) => [l, {}]));

for (const file of fs.readdirSync(parts).sort()) {
  const m = file.match(/^(.+)\.(az|en|ru)\.json$/);
  if (!m) continue;
  out[m[2]][m[1]] = JSON.parse(fs.readFileSync(path.join(parts, file), "utf8"));
}

// Açar uyğunluğunu yoxla (en əsas götürülür)
const keys = (o, p = "") =>
  Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === "object" ? keys(v, `${p}${k}.`) : [`${p}${k}`]
  );
const base = new Set(keys(out.en));
for (const l of locales) {
  const have = new Set(keys(out[l]));
  for (const k of base) if (!have.has(k)) console.warn(`[${l}] çatışmır: ${k}`);
  for (const k of have) if (!base.has(k)) console.warn(`[${l}] artıqdır: ${k}`);
}

for (const l of locales) {
  fs.writeFileSync(path.join(dir, `${l}.json`), JSON.stringify(out[l], null, 2) + "\n");
}
console.log("messages birləşdirildi:", [...new Set(keys(out.en).map((k) => k.split(".")[0]))].join(", "));
