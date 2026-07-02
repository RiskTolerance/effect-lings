import adapter from '@risk-tolerance/svelte-adapter-bun'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// A Bun-native adapter — the generated server runs on Bun.serve:
		//   bun run build && bun build/index.js
		// websockets:false since this app is plain HTTP (no hooks.server export).
		adapter: adapter({ websockets: false })
	}
}

export default config
