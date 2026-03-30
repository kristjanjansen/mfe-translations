import { describe, it, expect, beforeAll } from "vitest";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

beforeAll(() => {
  execSync("npm run build", { stdio: "ignore" });
});

const LANGS = ["en", "et"];
const NAMESPACES = ["billing", "dashboard", "cookiebot"];

describe("translation build", () => {
  for (const lang of LANGS) {
    for (const ns of NAMESPACES) {
      it(`outputs ${lang}/${ns}.json`, () => {
        const file = path.join("public", lang, `${ns}.json`);
        expect(fs.existsSync(file)).toBe(true);
      });

      it(`${lang}/${ns}.json is valid JSON with keys`, () => {
        const file = path.join("public", lang, `${ns}.json`);
        const data = JSON.parse(fs.readFileSync(file, "utf8"));
        expect(typeof data).toBe("object");
        expect(Object.keys(data).length).toBeGreaterThan(0);
      });
    }
  }
});

describe("translation verification", () => {
  it("all keys exist in all languages", () => {
    for (const ns of NAMESPACES) {
      const allKeys = new Set<string>();

      for (const lang of LANGS) {
        const file = path.join("public", lang, `${ns}.json`);
        const data = JSON.parse(fs.readFileSync(file, "utf8"));
        Object.keys(data).forEach((k) => allKeys.add(k));
      }

      for (const lang of LANGS) {
        const file = path.join("public", lang, `${ns}.json`);
        const data = JSON.parse(fs.readFileSync(file, "utf8"));
        for (const key of allKeys) {
          expect(data, `Missing ${lang}/${ns}: "${key}"`).toHaveProperty(key);
        }
      }
    }
  });

  it("no empty values", () => {
    for (const lang of LANGS) {
      for (const ns of NAMESPACES) {
        const file = path.join("public", lang, `${ns}.json`);
        const data = JSON.parse(fs.readFileSync(file, "utf8"));
        for (const [key, value] of Object.entries(data)) {
          expect(value, `Empty: ${lang}/${ns} "${key}"`).not.toBe("");
        }
      }
    }
  });
});
