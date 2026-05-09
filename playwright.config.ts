import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { defineConfig, devices } from "@playwright/test";

/** Carga `.env.test.local` para E2E_EMAIL / E2E_PASSWORD sin dependencia extra. */
function loadEnvTestLocal() {
  const envPath = path.join(process.cwd(), ".env.test.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

loadEnvTestLocal();

const hasE2EAuth = Boolean(
  process.env.E2E_EMAIL?.trim() && process.env.E2E_PASSWORD,
);

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

/** Placeholder Supabase values so middleware can boot in CI/e2e without a real project. */
const e2eSupabaseEnv = {
  NEXT_PUBLIC_SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    ...(hasE2EAuth
      ? [{ name: "setup" as const, testMatch: /auth\.setup\.ts/ }]
      : []),
    {
      name: "unauthenticated",
      testMatch: /smoke\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    ...(hasE2EAuth
      ? [
          {
            name: "authenticated" as const,
            testMatch: /directorio-auth\.spec\.ts/,
            use: {
              ...devices["Desktop Chrome"],
              storageState: "e2e/.auth/user.json" as const,
            },
            dependencies: ["setup" as const],
          },
          {
            name: "authenticated-mobile" as const,
            testMatch: /directorio-auth\.spec\.ts/,
            use: {
              ...devices["Pixel 7"],
              storageState: "e2e/.auth/user.json" as const,
            },
            dependencies: ["setup" as const],
          },
        ]
      : []),
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: { ...process.env, ...e2eSupabaseEnv },
      },
});
