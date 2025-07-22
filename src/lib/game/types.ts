// Copyright 2025 The Kuloran Players.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

export interface MapRect {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

export interface Platform extends MapRect {
    type: string;
}

export interface Zone extends MapRect {
    text: string;
}

export interface POI extends MapRect {
    text: string;
}

export interface PlayerPosition {
    x: number;
    y: number;
}

export type MovementDirection = "up" | "down" | "left" | "right";
