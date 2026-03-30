import fs from "node:fs";
import path from "node:path";

const LANGS = ["en", "et"];
const OUT_DIR = "public";

const namespaces = fs
  .readdirSync(OUT_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .flatMap((langDir) =>
    fs
      .readdirSync(path.join(OUT_DIR, langDir.name))
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""))
  )
  .filter((v, i, a) => a.indexOf(v) === i);

const errors = [];

for (const ns of namespaces) {
  const allKeys = new Set();

  for (const lang of LANGS) {
    const file = path.join(OUT_DIR, lang, `${ns}.json`);
    if (!fs.existsSync(file)) {
      errors.push(`Missing file: ${file}`);
      continue;
    }
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    Object.keys(data).forEach((k) => allKeys.add(k));
  }

  for (const lang of LANGS) {
    const file = path.join(OUT_DIR, lang, `${ns}.json`);
    if (!fs.existsSync(file)) continue;
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    for (const key of allKeys) {
      if (!(key in data)) {
        errors.push(`Missing: ${lang}/${ns}.json -> "${key}"`);
      }
    }
  }
}

if (errors.length) {
  console.error("Translation verification failed:");
  errors.forEach((e) => console.error(`  ${e}`));
  process.exit(1);
}

console.log(
  `Verified ${namespaces.length} namespaces x ${LANGS.length} languages`
);
