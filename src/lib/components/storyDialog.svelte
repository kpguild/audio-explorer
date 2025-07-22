<!--
 Copyright 2025 The Kuloran Players.
 SPDX-License-Identifier: 	AGPL-3.0-or-later
-->

<script lang="ts">
    import { tick } from "svelte";
    import Modal from "./modal.svelte";
    import type { Story } from "../game/types";

    export let open = false;
    export let story: Story | null = null;

    let headingElement: HTMLHeadingElement;

    const handleClose = () => {
        open = false;
    };

    $: if (open && headingElement) {
        // Wait for the next DOM update cycle.
        tick().then(() => {
            headingElement.focus();
        });
    }
</script>

<Modal bind:visible={open}>
    {#if story}
        <div role="document">
            <h5 class="mb-3" bind:this={headingElement} tabindex="-1">
                Extra Content
            </h5>

            <div class="mb-4">
                {#each story.lines as line}
                    <p>{line}</p>
                {/each}
            </div>

            <div class="text-end">
                <button
                    type="button"
                    class="btn btn-secondary"
                    on:click={handleClose}
                >
                    Close
                </button>
            </div>
        </div>
    {/if}
</Modal>
