<!--
 Copyright 2025 The Kuloran Players.
 SPDX-License-Identifier: 	AGPL-3.0-or-later
-->

<script lang="ts">
    import { onMount } from "svelte";
    import "bootstrap/dist/css/bootstrap.min.css";

    onMount(async () => {
        // @ts-ignore - Bootstrap JS doesn't have TypeScript declarations for the bundle file
        await import("bootstrap/dist/js/bootstrap.bundle.min.js");
    });
</script>

<slot />

<footer class="mt-auto py-3 text-center text-muted">
    <small>
        Powered by <a
            href="https://github.com/kpguild/audio-explorer"
            target="_blank"
            rel="noopener">audio-explorer</a
        >. This is open source software. The Code is licensed under the GNU
        AFFERO GENERAL PUBLIC LICENSE.
    </small>
</footer>
