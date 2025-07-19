<!--
 Copyright 2025 The Kuloran Players.
 SPDX-License-Identifier: 	AGPL-3.0-or-later
-->

<script lang="ts">
    import type { PlayerPosition } from "$lib/game/types";

    export let zoneText: string;
    export let playerPosition: PlayerPosition;
</script>

<div class="card bg-body-tertiary text-center p-3 mx-auto">
    <div class="card-body">
        <h5 class="card-title">{zoneText}</h5>
        <p class="card-subtitle text-body-secondary">
            X: {playerPosition.x}, Y: {playerPosition.y}
        </p>
    </div>
</div>
