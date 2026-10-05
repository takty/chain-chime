import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [tailwindcss()],
	// Resolve built assets relative to the deployment directory.
	base: './',
});
