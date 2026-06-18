import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// https://vite.dev/config/
export default defineConfig({
  // Read the centralized root .env (one level up). Only VITE_-prefixed vars are
  // exposed to the client bundle, so other services' secrets stay safe.
  envDir: path.resolve(__dirname, ".."),
  plugins: [
    tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
		}),
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
})
