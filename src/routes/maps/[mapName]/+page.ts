// Copyright 2025 The Kuloran Players.
// SPDX-License-Identifier: 	AGPL-3.0-or-later

import { GameState } from "$lib/game/gameState";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
    const { mapName } = params;

    try {
        const response = await fetch(`/maps/${mapName}.map`);
        if (!response.ok) {
            throw error(404, `Map not found: ${mapName}`);
        }
        const rawData = await response.text();
        const gameState = new GameState(mapName, rawData);

        return {
            mapName,
            gameState,
        };
    } catch (e) {
        throw error(500, `Could not load map: ${mapName}`);
    }
};
