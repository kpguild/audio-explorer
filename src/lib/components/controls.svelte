<!--
 Copyright 2025 The Kuloran Players.
 SPDX-License-Identifier: 	AGPL-3.0-or-later
-->

<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { MovementDirection } from "$lib/game/types";
    import ArrowUp from "svelte-bootstrap-icons/lib/ArrowUp.svelte";
    import ArrowLeft from "svelte-bootstrap-icons/lib/ArrowLeft.svelte";
    import ArrowDown from "svelte-bootstrap-icons/lib/ArrowDown.svelte";
    import ArrowRight from "svelte-bootstrap-icons/lib/ArrowRight.svelte";

    const dispatch = createEventDispatcher<{
        start: MovementDirection;
        stop: MovementDirection;
    }>();

    const handlePointerDown = (direction: MovementDirection) =>
        dispatch("start", direction);
    const handlePointerUp = (direction: MovementDirection) =>
        dispatch("stop", direction);
</script>

<div
    class="card bg-body-tertiary p-3 mx-auto mb-4"
    role="group"
    aria-label="Touch Movement controls"
>
    <div class="row justify-content-center">
        <div class="col-4 d-grid">
            <button
                class="btn btn-secondary btn-lg"
                aria-label="Move up"
                on:pointerdown={() => handlePointerDown("up")}
                on:pointerup={() => handlePointerUp("up")}
                on:pointerleave={() => handlePointerUp("up")}><ArrowUp /></button
            >
        </div>
    </div>
    <div class="row justify-content-center mt-2">
        <div class="col-4 d-grid">
            <button
                class="btn btn-secondary btn-lg"
                aria-label="Move left"
                on:pointerdown={() => handlePointerDown("left")}
                on:pointerup={() => handlePointerUp("left")}
                on:pointerleave={() => handlePointerUp("left")}><ArrowLeft /></button
            >
        </div>
        <div class="col-4 d-grid">
            <button
                class="btn btn-secondary btn-lg"
                aria-label="Move down"
                on:pointerdown={() => handlePointerDown("down")}
                on:pointerup={() => handlePointerUp("down")}
                on:pointerleave={() => handlePointerUp("down")}><ArrowDown /></button
            >
        </div>
        <div class="col-4 d-grid">
            <button
                class="btn btn-secondary btn-lg"
                aria-label="Move right"
                on:pointerdown={() => handlePointerDown("right")}
                on:pointerup={() => handlePointerUp("right")}
                on:pointerleave={() => handlePointerUp("right")}><ArrowRight /></button
            >
        </div>
    </div>
</div>
