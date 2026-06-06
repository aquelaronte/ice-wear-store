import { $ } from "bun";

const baseUrl = process.env.VITE_API_BASE_URL;
if (!baseUrl) {
  console.error("VITE_API_BASE_URL is not set. Add it to .env or export it.");
  process.exit(1);
}

await $`openapi-typescript ${`${baseUrl}/openapi.json`} -o src/api/schema.gen.ts`;
