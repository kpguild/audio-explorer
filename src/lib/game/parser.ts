// Copyright 2025 The Kuloran Players.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import type {
    Platform,
    Zone,
    POI,
    PlayerPosition,
    Ambience,
    MapRect,
} from "./types";

export interface ParsedMapData {
    maxX: number;
    maxY: number;
    platforms: Platform[];
    zones: Zone[];
    pois: POI[];
    ambiences: Ambience[];
    spawn: PlayerPosition;
}

export function parseMapData(rawData: string): ParsedMapData {
    const lines = rawData.trim().split("\n");
    const data: ParsedMapData = {
        maxX: 0,
        maxY: 0,
        platforms: [],
        zones: [],
        pois: [],
        ambiences: [],
        spawn: { x: 0, y: 0 },
    };

    for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const command = parts[0];

        try {
            if (command === "maxx") {
                data.maxX = parseInt(parts[1]);
            } else if (command === "maxy") {
                data.maxY = parseInt(parts[1]);
            } else if (command === "platform") {
                const [minX, maxX, minY, maxY] = parts.slice(1, 5).map(Number);
                const type = parts[6];
                data.platforms.push({ minX, maxX, minY, maxY, type });
            } else if (command === "zone") {
                const [minX, maxX, minY, maxY] = parts.slice(1, 5).map(Number);
                const text = parts.slice(7).join(" ");
                data.zones.push({ minX, maxX, minY, maxY, text });
            } else if (command === "mpoi") {
                const [minX, maxX, minY, maxY] = parts.slice(1, 5).map(Number);
                const text = parts.slice(7).join(" ");
                data.pois.push({ minX, maxX, minY, maxY, text });
            } else if (command === "poi") {
                const [x, y] = parts.slice(1, 3).map(Number);
                const text = parts.slice(4).join(" ");
                data.pois.push({ minX: x, maxX: x, minY: y, maxY: y, text });
            } else if (command === "spawn") {
                data.spawn.x = parseInt(parts[1]);
                data.spawn.y = parseInt(parts[2]);
            } else if (command === "ambience") {
                const [minX, maxX, minY, maxY] = parts.slice(1, 5).map(Number);
                const sound = parts[7];
                const volume = parseInt(parts[8]);
                const pitch = parseInt(parts[9]);
                data.ambiences.push({
                    minX,
                    maxX,
                    minY,
                    maxY,
                    sound,
                    volume,
                    pitch,
                    exclusions: [],
                    audioElement: null,
                });
            } else if (command === "xambience") {
                const [minX, maxX, minY, maxY] = parts.slice(1, 5).map(Number);
                const sound = parts[7];
                const volume = parseInt(parts[8]);
                const pitch = parseInt(parts[9]);

                const exclusions: MapRect[] = [];
                if (parts.length > 10) {
                    const exclusionString = parts.slice(10).join(" ");
                    const exclusionGroups = exclusionString.split("||");

                    for (const group of exclusionGroups) {
                        const coords = group.trim().split(/\s+/).map(Number);
                        if (coords.length >= 4) {
                            exclusions.push({
                                minX: coords[0],
                                maxX: coords[1],
                                minY: coords[2],
                                maxY: coords[3],
                            });
                        }
                    }
                }

                data.ambiences.push({
                    minX,
                    maxX,
                    minY,
                    maxY,
                    sound,
                    volume,
                    pitch,
                    exclusions,
                    audioElement: null,
                });
            }
        } catch (e) {
            console.error(`Failed to parse line: "${line}"`, e);
        }
    }
    return data;
}
