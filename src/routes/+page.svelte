<!--
 Copyright 2025 The Kuloran Players.
 SPDX-License-Identifier: 	AGPL-3.0-or-later
-->

<script lang="ts">
    import type { PageData } from "./$types";

    export let data: PageData;
</script>

<svelte:head>
    <title>Audio Explorer - Home</title>
</svelte:head>

<main class="container text-center my-5">
    <h1 class="display-4" id="page-title">Audio Explorer</h1>
    <p class="lead">Welcome! Please select a map to explore.</p>
    <section aria-label="Maps" class="list-group mx-auto mt-4">
        {#each data.maps as map}
            <a
                href="/maps/{map.id}"
                class="list-group-item list-group-item-action fs-5"
            >
                {map.name}
            </a>
        {/each}
    </section>
</main>
