<!--
 Copyright 2025 The Kuloran Players.
 SPDX-License-Identifier: 	AGPL-3.0-or-later
-->

<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { POI } from "$lib/game/types";
    import Modal from "./modal.svelte";

    export let pois: POI[];
    export let open = false;
    let selectedPoiIndex = 0;

    const dispatch = createEventDispatcher<{ track: POI; close: void }>();

    const handleTrack = (poi: POI) => {
        dispatch("track", poi);
        open = false;
    };

    const handleItemClick = (index: number) => {
        selectedPoiIndex = index;
        handleTrack(pois[index]);
    };

    const handleClose = () => {
        open = false;
        dispatch("close");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
            e.preventDefault();
            e.stopPropagation();
            selectedPoiIndex = Math.min(pois.length - 1, selectedPoiIndex + 1);
            focusSelectedItem();
        } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
            e.preventDefault();
            e.stopPropagation();
            selectedPoiIndex = Math.max(0, selectedPoiIndex - 1);
            focusSelectedItem();
        }
    };

    const focusSelectedItem = () => {
        setTimeout(() => {
            const selectedButton = document.querySelector(
                '.list-group-item[aria-selected="true"]'
            ) as HTMLButtonElement;
            if (selectedButton) {
                selectedButton.focus();
            }
        }, 0);
    };

    $: if (open && pois.length > 0) {
        focusSelectedItem();
    }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div>
    <Modal bind:visible={open}>
        <h5 class="mb-3">Points of Interest</h5>

        <div
            class="list-group mb-3"
            on:keydown={handleKeyDown}
            role="listbox"
            tabindex="0"
        >
            {#each pois as poi, index}
                <button
                    type="button"
                    class="list-group-item list-group-item-action"
                    class:active={index === selectedPoiIndex}
                    role="option"
                    aria-selected={index === selectedPoiIndex}
                    tabindex={index === selectedPoiIndex ? 0 : -1}
                    on:click={() => handleItemClick(index)}
                >
                    {poi.text}
                </button>
            {:else}
                <p class="text-center text-body-secondary mb-0">
                    No points of interest on this map.
                </p>
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
    </Modal>
</div>
