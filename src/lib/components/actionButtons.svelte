<!--
 Copyright 2025 The Kuloran Players.
 SPDX-License-Identifier: 	AGPL-3.0-or-later
-->

<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import GeoAlt from "svelte-bootstrap-icons/lib/GeoAlt.svelte";
    import GraphUp from "svelte-bootstrap-icons/lib/GraphUp.svelte";
    import Map from "svelte-bootstrap-icons/lib/Map.svelte";
    import Compass from "svelte-bootstrap-icons/lib/Compass.svelte";
    import VolumeUp from "svelte-bootstrap-icons/lib/VolumeUp.svelte";

    const dispatch = createEventDispatcher<{
        announceZone: void;
        announceCoords: void;
        openPoiDialog: void;
        announceDirection: void;
        openVolumeDialog: void;
    }>();
</script>

<div
    class="d-flex flex-wrap gap-2 justify-content-center mb-4"
    role="group"
    aria-label="Actions"
>
    <button
        class="btn btn-info"
        on:click={() => dispatch("announceZone")}
        aria-label="Announce current zone"><GeoAlt /> Zone</button
    >
    <button
        class="btn btn-info"
        on:click={() => dispatch("announceCoords")}
        aria-label="Announce current coordinates"><GraphUp /> Coords</button
    >
    <button
        class="btn btn-info"
        on:click={() => dispatch("openPoiDialog")}
        aria-label="Open points of interest dialog"><Map /> POI</button
    >
    <button
        class="btn btn-info"
        on:click={() => dispatch("announceDirection")}
        aria-label="Announce current direction"><Compass /> Direction</button
    >
    <button
        class="btn btn-info"
        on:click={() => dispatch("openVolumeDialog")}
        aria-label="Audio volume"><VolumeUp /> Volume</button
    >
</div>
