<!--
 Copyright 2025 The Kuloran Players.
 SPDX-License-Identifier: 	AGPL-3.0-or-later
-->

<script lang="ts">
    import { onMount } from "svelte";
    import type { PageData } from "./$types";
    import type { MovementDirection, POI } from "$lib/game/types";

    import Header from "$lib/components/header.svelte";
    import Controls from "$lib/components/controls.svelte";
    import ActionButtons from "$lib/components/actionButtons.svelte";
    import StatusDisplay from "$lib/components/statusDisplay.svelte";
    import PoiDialog from "$lib/components/poiDialog.svelte";

    export let data: PageData;
    const { mapName, gameState: gameStateObject } = data;
    const {
        currentZoneText,
        currentPlatformType,
        playerPosition,
        trackingPOI,
        pois,
    } = gameStateObject;

    let liveRegion: HTMLElement;
    let lastAnnouncedZone = "";
    let poiDialogOpen = false;

    const speak = (text: string, assertive = true) => {
        if (!liveRegion) return;
        liveRegion.setAttribute(
            "aria-live",
            assertive ? "assertive" : "polite"
        );
        liveRegion.textContent = text;
    };

    const playSound = (type: string) => {
        if (!type || type === "unknown") return;
        try {
            const audio = new Audio(`/sounds/${type}.ogg`);
            audio.volume = 0.3;
            audio.play().catch(console.warn);
        } catch (e) {
            console.warn(`Could not create audio for ${type}.ogg:`, e);
        }
    };

    // Event Handlers:
    const handleMovementStart = (e: CustomEvent<MovementDirection>) =>
        gameStateObject.startMovement(e.detail);
    const handleMovementStop = (e: CustomEvent<MovementDirection>) =>
        gameStateObject.stopMovement(e.detail);
    const handleTrackPoi = (e: CustomEvent<POI>) => {
        trackingPOI.set(e.detail);
        speak(`Tracking ${e.detail.text}.`);
        poiDialogOpen = false;
    };

    const handleOpenPoiDialog = () => {
        poiDialogOpen = true;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        const keyMap: Record<string, MovementDirection> = {
            ArrowUp: "up",
            ArrowDown: "down",
            ArrowLeft: "left",
            ArrowRight: "right",
        };

        if (keyMap[e.key]) {
            e.preventDefault();
            gameStateObject.startMovement(keyMap[e.key]);
        } else {
            const key = e.key.toLowerCase();
            if (key === "b") {
                e.preventDefault();
                handleAnnounceZone();
            } else if (key === "c") {
                e.preventDefault();
                handleAnnounceCoords();
            } else if (key === "t") {
                e.preventDefault();
                handleOpenPoiDialog();
            } else if (key === "y") {
                e.preventDefault();
                handleAnnounceDirection();
            }
        }
    };

    const handleAnnounceZone = () => speak($currentZoneText);
    const handleAnnounceCoords = () =>
        speak(`${$playerPosition.x}, ${$playerPosition.y}`);
    const handleAnnounceDirection = () => {
        const tracked = $trackingPOI;
        if (tracked) {
            speak(gameStateObject.getDirectionToPOI(tracked, $playerPosition));
        } else {
            speak("No point of interest is being tracked.");
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        const keyMap: Record<string, MovementDirection> = {
            ArrowUp: "up",
            ArrowDown: "down",
            ArrowLeft: "left",
            ArrowRight: "right",
        };
        if (keyMap[e.key]) {
            e.preventDefault();
            gameStateObject.stopMovement(keyMap[e.key]);
        }
    };

    // Reactive Subscriptions:
    currentZoneText.subscribe((zoneText) => {
        if (zoneText !== lastAnnouncedZone) {
            speak(zoneText, false);
            lastAnnouncedZone = zoneText;
        }
    });

    onMount(() => {
        lastAnnouncedZone = $currentZoneText;

        gameStateObject.onFootstep((platformType) => {
            if (typeof window !== "undefined") {
                playSound(platformType);
            }
        });
    });
</script>

<svelte:head>
    <title>Audio Explorer - {mapName}</title>
</svelte:head>

<svelte:window on:keydown={handleKeyDown} on:keyup={handleKeyUp} />

<div
    bind:this={liveRegion}
    aria-live="assertive"
    aria-atomic="true"
    class="visually-hidden"
></div>

<div class="container d-flex flex-column flex-grow-1">
    <Header {mapName} />

    <main class="d-flex flex-column justify-content-center flex-grow-1">
        <Controls on:start={handleMovementStart} on:stop={handleMovementStop} />

        <ActionButtons
            on:announceZone={handleAnnounceZone}
            on:announceCoords={handleAnnounceCoords}
            on:openPoiDialog={handleOpenPoiDialog}
            on:announceDirection={handleAnnounceDirection}
        />

        <StatusDisplay
            zoneText={$currentZoneText}
            playerPosition={$playerPosition}
        />
    </main>
</div>

<PoiDialog {pois} bind:open={poiDialogOpen} on:track={handleTrackPoi} />
