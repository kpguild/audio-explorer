import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
    const res = await fetch("/maps.json");
    const maps = await res.json();
    return { maps };
};
