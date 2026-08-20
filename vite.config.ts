import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import { clayGatewayPlugin } from "./server/clayGateway.ts";

export default defineConfig(({ mode }) => {
  const localEnv = loadEnv(mode, process.cwd(), "");
  for (const key of ["CLAY_LOOM", "CLAY_TUTOR_MODEL", "CLAY_TUTOR_TIMEOUT_MS", "CLAY_PYTHON"]) {
    if (localEnv[key] && !process.env[key]) process.env[key] = localEnv[key];
  }

  return {
    plugins: [react(), clayGatewayPlugin()],
    test: {
      environment: "jsdom",
    },
  };
});
