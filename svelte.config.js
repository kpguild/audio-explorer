// Copyright 2025 The Kuloran Players.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://svelte.dev/docs/kit/integrations
    // for more information about preprocessors
    preprocess: vitePreprocess(),

    kit: {
        // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
        // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
        // See https://svelte.dev/docs/kit/adapters for more information about adapters.
        adapter: adapter({
            pages: process.env.BUILD_PATH || "build",
            assets: process.env.BUILD_PATH || "build",
            fallback: "index.html",
        }),
    },
};

export default config;
