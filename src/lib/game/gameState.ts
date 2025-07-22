// Copyright 2025 The Kuloran Players.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { writable, type Writable } from "svelte/store";
import type {
    PlayerPosition,
    Platform,
    Zone,
    POI,
    MovementDirection,
    Ambience,
    Story,
} from "./types";
import { parseMapData, type ParsedMapData } from "./parser";

// This class is pretty ridgid, but it's probably fine. We're not building a full game engine here.
export class GameState {
    // Static Data
    private mapData: ParsedMapData;
    private mapName: string;

    // Player State
    public playerPosition: Writable<PlayerPosition>;
    public currentZoneText: Writable<string>;
    public currentPlatformType: Writable<string>;

    // Movement State
    private moveSpeed = 4.7;
    private movementIntervalMs = 50;
    private tileDurationMs = 1000 / this.moveSpeed;
    private movementIntervals = new Map<MovementDirection, number>();
    private timeAccumulators = { x: 0, y: 0 };
    private activeDirections = new Set<MovementDirection>();

    // POI Tracking
    public pois: POI[];
    public trackingPOI: Writable<POI | null> = writable(null);

    // Story Tracking
    public stories: Story[];
    public currentStory: Writable<Story | null> = writable(null);
    private previousStory: Story | null = null;

    // Ambience Tracking
    public ambiences: Ambience[];
    public currentAmbiences: Writable<Ambience[]> = writable([]);
    private previousAmbiences: Set<Ambience> = new Set();

    private footstepListeners: ((platformType: string) => void)[] = [];
    private ambienceEnterListeners: ((ambience: Ambience) => void)[] = [];
    private ambienceExitListeners: ((ambience: Ambience) => void)[] = [];

    constructor(mapName: string, rawData: string) {
        this.mapName = mapName;
        this.mapData = parseMapData(rawData);
        this.pois = this.mapData.pois;
        this.ambiences = this.mapData.ambiences;
        this.stories = this.mapData.stories;

        const initialPosition = { ...this.mapData.spawn };
        this.playerPosition = writable(initialPosition);
        this.currentZoneText = writable(
            this.getZoneAt(initialPosition.x, initialPosition.y)?.text ||
                "Uncharted territory"
        );
        const initialPlatformType =
            this.getPlatformAt(initialPosition.x, initialPosition.y)?.type ||
            "unknown";

        this.currentPlatformType = writable(initialPlatformType);
        this.updateAmbiences(initialPosition.x, initialPosition.y);
        this.updateStory(initialPosition.x, initialPosition.y);
    }

    private getPlatformAt(x: number, y: number): Platform | undefined {
        // Iterate backwards to find the top-most platform
        for (let i = this.mapData.platforms.length - 1; i >= 0; i--) {
            const p = this.mapData.platforms[i];
            if (x >= p.minX && x <= p.maxX && y >= p.minY && y <= p.maxY) {
                return p;
            }
        }
        return undefined;
    }

    private getZoneAt(x: number, y: number): Zone | undefined {
        for (let i = this.mapData.zones.length - 1; i >= 0; i--) {
            const z = this.mapData.zones[i];
            if (x >= z.minX && x <= z.maxX && y >= z.minY && y <= z.maxY) {
                return z;
            }
        }
        return undefined;
    }

    private getStoryAt(x: number, y: number): Story | undefined {
        for (let i = this.mapData.stories.length - 1; i >= 0; i--) {
            const s = this.mapData.stories[i];
            if (x >= s.minX && x <= s.maxX && y >= s.minY && y <= s.maxY) {
                return s;
            }
        }
        return undefined;
    }

    public getUniquePlatformTypes(): string[] {
        const platformTypes = new Set<string>();
        for (const platform of this.mapData.platforms) {
            if (platform.type !== "unknown") {
                platformTypes.add(platform.type);
            }
        }
        return Array.from(platformTypes);
    }

    public startMovement(direction: MovementDirection) {
        if (this.activeDirections.has(direction)) return;
        this.activeDirections.add(direction);

        const [dx, dy] = this.getDirectionVector(direction);
        this.updatePlayerPosition(dx, dy, true);

        const intervalId = setInterval(() => {
            if (!this.activeDirections.has(direction)) {
                clearInterval(intervalId);
                this.movementIntervals.delete(direction);
                return;
            }
            this.updatePlayerPosition(dx, dy, false);
        }, this.movementIntervalMs);

        this.movementIntervals.set(direction, intervalId as unknown as number);
    }

    public stopMovement(direction: MovementDirection) {
        if (!this.activeDirections.has(direction)) return;
        this.activeDirections.delete(direction);

        const intervalId = this.movementIntervals.get(direction);
        if (intervalId) {
            clearInterval(intervalId);
            this.movementIntervals.delete(direction);
        }
    }

    private updatePlayerPosition(
        dx: number,
        dy: number,
        isInitialMove: boolean
    ) {
        this.playerPosition.update((pos) => {
            let newX = pos.x;
            let newY = pos.y;
            let moved = false;

            if (dx !== 0) {
                if (isInitialMove) {
                    this.timeAccumulators.x = 0;
                    const tentativeX = newX + dx;
                    const clampedX = Math.max(
                        0,
                        Math.min(tentativeX, this.mapData.maxX)
                    );
                    if (clampedX !== newX) {
                        newX = clampedX;
                        moved = true;
                    }
                } else {
                    this.timeAccumulators.x += this.movementIntervalMs;
                    while (this.timeAccumulators.x >= this.tileDurationMs) {
                        const tentativeX = newX + dx;
                        const clampedX = Math.max(
                            0,
                            Math.min(tentativeX, this.mapData.maxX)
                        );
                        if (clampedX === newX) {
                            this.timeAccumulators.x = 0;
                            break;
                        }
                        newX = clampedX;
                        moved = true;
                        this.timeAccumulators.x -= this.tileDurationMs;
                    }
                }
            }

            if (dy !== 0) {
                if (isInitialMove) {
                    this.timeAccumulators.y = 0;
                    const tentativeY = newY + dy;
                    const clampedY = Math.max(
                        0,
                        Math.min(tentativeY, this.mapData.maxY)
                    );
                    if (clampedY !== newY) {
                        newY = clampedY;
                        moved = true;
                    }
                } else {
                    this.timeAccumulators.y += this.movementIntervalMs;
                    while (this.timeAccumulators.y >= this.tileDurationMs) {
                        const tentativeY = newY + dy;
                        const clampedY = Math.max(
                            0,
                            Math.min(tentativeY, this.mapData.maxY)
                        );
                        if (clampedY === newY) {
                            this.timeAccumulators.y = 0;
                            break;
                        }
                        newY = clampedY;
                        moved = true;
                        this.timeAccumulators.y -= this.tileDurationMs;
                    }
                }
            }

            if (moved) {
                const platform = this.getPlatformAt(newX, newY);
                const platformType = platform?.type || "unknown";
                this.currentPlatformType.set(platformType);
                this.emitFootstep(platformType);

                const zone = this.getZoneAt(newX, newY);
                this.currentZoneText.set(zone?.text || "Uncharted territory");

                this.updateAmbiences(newX, newY);
                this.updateStory(newX, newY);
            }

            return { x: newX, y: newY };
        });
    }

    private getDirectionVector(direction: MovementDirection): [number, number] {
        switch (direction) {
            case "up":
                return [0, 1];
            case "down":
                return [0, -1];
            case "left":
                return [-1, 0];
            case "right":
                return [1, 0];
            default:
                return [0, 0];
        }
    }

    public getDirectionToPOI(poi: POI, playerPos: PlayerPosition): string {
        const closestX = Math.max(poi.minX, Math.min(playerPos.x, poi.maxX));
        const closestY = Math.max(poi.minY, Math.min(playerPos.y, poi.maxY));

        const dx = closestX - playerPos.x;
        const dy = closestY - playerPos.y;

        if (dx === 0 && dy === 0) {
            return `You are at ${poi.text}.`;
        }

        const parts = [];
        if (Math.abs(dy) > 0) {
            parts.push(`${Math.abs(dy)} ${dy > 0 ? "North" : "South"}`);
        }
        if (Math.abs(dx) > 0) {
            parts.push(`${Math.abs(dx)} ${dx > 0 ? "East" : "West"}`);
        }
        return `${parts.join(" and ")} to ${poi.text}.`;
    }

    public onFootstep(callback: (platformType: string) => void): void {
        this.footstepListeners.push(callback);
    }

    public offFootstep(callback: (platformType: string) => void): void {
        const index = this.footstepListeners.indexOf(callback);
        if (index > -1) {
            this.footstepListeners.splice(index, 1);
        }
    }

    private emitFootstep(platformType: string): void {
        this.footstepListeners.forEach((callback) => callback(platformType));
    }

    private updateStory(x: number, y: number): void {
        const newStory = this.getStoryAt(x, y) || null;
        if (newStory !== this.previousStory) {
            this.currentStory.set(newStory);
            this.previousStory = newStory;
        }
    }

    private updateAmbiences(x: number, y: number): void {
        const currentAmbiences = new Set<Ambience>();

        for (const ambience of this.ambiences) {
            if (this.isInsideAmbience(x, y, ambience)) {
                currentAmbiences.add(ambience);
            }
        }

        // Find newly entered ambiences
        for (const ambience of currentAmbiences) {
            if (!this.previousAmbiences.has(ambience)) {
                this.emitAmbienceEnter(ambience);
            }
        }

        // Find exited ambiences
        for (const ambience of this.previousAmbiences) {
            if (!currentAmbiences.has(ambience)) {
                this.emitAmbienceExit(ambience);
            }
        }

        // Update state
        this.previousAmbiences = currentAmbiences;
        this.currentAmbiences.set(Array.from(currentAmbiences));
    }

    public isInsideAmbience(x: number, y: number, ambience: Ambience): boolean {
        // Check if player is within ambience bounds
        if (
            x < ambience.minX ||
            x > ambience.maxX ||
            y < ambience.minY ||
            y > ambience.maxY
        ) {
            return false;
        }

        // Check if player is within any exclusion zones
        for (const exclusion of ambience.exclusions) {
            if (
                x >= exclusion.minX &&
                x <= exclusion.maxX &&
                y >= exclusion.minY &&
                y <= exclusion.maxY
            ) {
                return false;
            }
        }

        return true;
    }

    public onAmbienceEnter(callback: (ambience: Ambience) => void): void {
        this.ambienceEnterListeners.push(callback);
    }

    public offAmbienceEnter(callback: (ambience: Ambience) => void): void {
        const index = this.ambienceEnterListeners.indexOf(callback);
        if (index > -1) {
            this.ambienceEnterListeners.splice(index, 1);
        }
    }

    public onAmbienceExit(callback: (ambience: Ambience) => void): void {
        this.ambienceExitListeners.push(callback);
    }

    public offAmbienceExit(callback: (ambience: Ambience) => void): void {
        const index = this.ambienceExitListeners.indexOf(callback);
        if (index > -1) {
            this.ambienceExitListeners.splice(index, 1);
        }
    }

    private emitAmbienceEnter(ambience: Ambience): void {
        this.ambienceEnterListeners.forEach((callback) => callback(ambience));
    }

    private emitAmbienceExit(ambience: Ambience): void {
        this.ambienceExitListeners.forEach((callback) => callback(ambience));
    }
}
