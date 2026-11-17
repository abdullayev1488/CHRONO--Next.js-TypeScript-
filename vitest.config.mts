import os from "node:os";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [{ find: /^@\//, replacement: `${path.resolve(import.meta.dirname)}/` }],
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Bütün testlər eyni müvəqqəti bazanı paylaşır
    fileParallelism: false,
    // mongod binary-nin ilk yüklənməsi üçün ehtiyatlı vaxt limiti
    testTimeout: 30_000,
    hookTimeout: 300_000,
    env: {
      NODE_ENV: "test",
      SESSION_SECRET: "test-session-secret-at-least-32-characters-long",
      // Həqiqi ünvan tests/helpers.ts-də memory server başlayanda təyin olunur
      MONGO_URI: "mongodb://127.0.0.1:1/placeholder",
      UPLOADS_DIR: path.join(os.tmpdir(), "chrono-test-uploads"),
    },
  },
});
