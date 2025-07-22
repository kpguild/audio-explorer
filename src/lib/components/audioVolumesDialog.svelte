<!--
 Copyright 2025 The Kuloran Players.
 SPDX-License-Identifier: 	AGPL-3.0-or-later
-->

<script lang="ts">
    import Modal from "./modal.svelte";

    export let open = false;
    export let musicVolume = 50;
    export let ambienceVolume = 75;

    const handleClose = () => {
        open = false;
    };
</script>

<Modal bind:visible={open}>
    <h5 class="mb-3">Audio Volumes</h5>

    <div class="mb-4">
        <label for="music-volume" class="form-label"> Music Volume</label>
        <input
            id="music-volume"
            type="range"
            class="form-range"
            min="0"
            max="100"
            bind:value={musicVolume}
        />
    </div>

    <div class="mb-4">
        <label for="ambience-volume" class="form-label"> Ambience Volume</label>
        <input
            id="ambience-volume"
            type="range"
            class="form-range"
            min="0"
            max="100"
            bind:value={ambienceVolume}
        />
    </div>

    <div class="text-end">
        <button type="button" class="btn btn-secondary" on:click={handleClose}>
            Close
        </button>
    </div>
</Modal>
