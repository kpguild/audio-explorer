<!--
 Copyright 2025 The Kuloran Players.
 SPDX-License-Identifier: 	AGPL-3.0-or-later
-->

<script lang="ts">
    import { onMount } from "svelte";
    import type { PageData } from "./$types";
    import type { MovementDirection, POI, Ambience } from "$lib/game/types";

    import Header from "$lib/components/header.svelte";
    import Controls from "$lib/components/controls.svelte";
    import ActionButtons from "$lib/components/actionButtons.svelte";
    import StatusDisplay from "$lib/components/statusDisplay.svelte";
    import PoiDialog from "$lib/components/poiDialog.svelte";
    import AudioVolumesDialog from "$lib/components/audioVolumesDialog.svelte";

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
    let volumeDialogOpen = false;
    let musicVolume = 50;
    let ambienceVolume = 85;
    let isLoading = true;

    let audioContext: AudioContext;
    const footstepBuffers: Record<string, AudioBuffer> = {};

    const preloadFootstep = async (type: string) => {
        if (!audioContext || !type || type === "unknown") return;
        if (footstepBuffers[type]) return;
        try {
            const response = await fetch(`/sounds/${type}.ogg`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            footstepBuffers[type] = audioBuffer;
        } catch (e) {
            console.warn(`Could not load footstep sound ${type}.ogg:`, e);
        }
    };

    const speak = (text: string, assertive = true) => {
        if (!liveRegion) return;
        liveRegion.setAttribute(
            "aria-live",
            assertive ? "assertive" : "polite"
        );
        liveRegion.textContent = text;
    };

    const playSound = (type: string) => {
        if (!type || type === "unknown" || !footstepBuffers[type]) return;
        try {
            const source = audioContext.createBufferSource();
            source.buffer = footstepBuffers[type];
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0.3;
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
            source.start();
        } catch (e) {
            console.warn(`Could not play audio for ${type}.ogg:`, e);
        }
    };

    const calculateAmbienceVolume = (ambience: Ambience) => {
        const baseVolumePercent = Math.max(
            0,
            Math.min(1, (ambience.volume + 100) / 100)
        );
        const isMusicTrack =
            ambience.sound.startsWith("loop_music") ||
            ambience.sound.startsWith("music");
        const masterVolumePercent = isMusicTrack
            ? musicVolume / 100
            : ambienceVolume / 100;
        return baseVolumePercent * masterVolumePercent;
    };

    const handleAmbienceEnter = (ambience: Ambience) => {
        try {
            if (!ambience.audioElement) {
                ambience.audioElement = new Audio(`/sounds/${ambience.sound}`);
                ambience.audioElement.loop = true;
            }

            ambience.audioElement.volume = calculateAmbienceVolume(ambience);
            ambience.audioElement.playbackRate = ambience.pitch / 100;
            ambience.audioElement.play().catch(console.warn);
        } catch (e) {
            console.warn(
                `Could not handle ambience enter for ${ambience.sound}: `,
                e
            );
        }
    };

    const handleAmbienceExit = (ambience: Ambience) => {
        try {
            if (ambience.audioElement) {
                ambience.audioElement.pause();
            }
        } catch (e) {
            console.warn(
                `Could not handle ambience exit for ${ambience.sound}:`,
                e
            );
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

    const handleOpenVolumeDialog = () => {
        volumeDialogOpen = true;
    };

    // To update ambience volumes when sliders change
    $: if (musicVolume !== undefined || ambienceVolume !== undefined) {
        updateCurrentAmbienceVolumes();
    }

    const updateCurrentAmbienceVolumes = () => {
        gameStateObject.ambiences.forEach((ambience: Ambience) => {
            if (ambience.audioElement && !ambience.audioElement.paused) {
                ambience.audioElement.volume =
                    calculateAmbienceVolume(ambience);
            }
        });
    };

    const movementKeyMap: Record<string, MovementDirection> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (poiDialogOpen || volumeDialogOpen || e.altKey || e.metaKey) {
            return;
        }

        if (movementKeyMap[e.key]) {
            e.preventDefault();
            gameStateObject.startMovement(movementKeyMap[e.key]);
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
            } else if (key === "v" && e.shiftKey) {
                e.preventDefault();
                handleOpenVolumeDialog();
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
        if (movementKeyMap[e.key]) {
            if (!poiDialogOpen && !volumeDialogOpen) {
                e.preventDefault();
            }
            gameStateObject.stopMovement(movementKeyMap[e.key]);
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
        const init = async () => {
            // Can't do async in onMount directly
            audioContext = new window.AudioContext();
            lastAnnouncedZone = $currentZoneText;

            const uniquePlatformTypes =
                gameStateObject.getUniquePlatformTypes();
            const footstepPromises = uniquePlatformTypes.map(preloadFootstep);

            await Promise.all([...footstepPromises]);

            isLoading = false;

            gameStateObject.ambiences.forEach((ambience) => {
                if (
                    gameStateObject.isInsideAmbience(
                        $playerPosition.x,
                        $playerPosition.y,
                        ambience
                    )
                ) {
                    handleAmbienceEnter(ambience);
                }
            });

            gameStateObject.onFootstep((platformType) => {
                if (typeof window !== "undefined") {
                    playSound(platformType);
                }
            });

            gameStateObject.onAmbienceEnter(handleAmbienceEnter);
            gameStateObject.onAmbienceExit(handleAmbienceExit);
        };

        init();

        return () => {
            gameStateObject.offAmbienceEnter(handleAmbienceEnter);
            gameStateObject.offAmbienceExit(handleAmbienceExit);
            gameStateObject.ambiences.forEach(handleAmbienceExit);
            if (audioContext) {
                audioContext.close();
            }
        };
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

{#if isLoading}
    <div
        class="container d-flex flex-column flex-grow-1 justify-content-center align-items-center"
    >
        <p>Loading...</p>
    </div>
{:else}
    <div class="container d-flex flex-column flex-grow-1">
        <Header {mapName} />

        <main class="d-flex flex-column justify-content-center flex-grow-1">
            <Controls
                on:start={handleMovementStart}
                on:stop={handleMovementStop}
            />

            <ActionButtons
                on:announceZone={handleAnnounceZone}
                on:announceCoords={handleAnnounceCoords}
                on:openPoiDialog={handleOpenPoiDialog}
                on:announceDirection={handleAnnounceDirection}
                on:openVolumeDialog={handleOpenVolumeDialog}
            />

            <StatusDisplay
                zoneText={$currentZoneText}
                playerPosition={$playerPosition}
            />
        </main>
    </div>
{/if}

<PoiDialog {pois} bind:open={poiDialogOpen} on:track={handleTrackPoi} />

<AudioVolumesDialog
    bind:open={volumeDialogOpen}
    bind:musicVolume
    bind:ambienceVolume
/>
