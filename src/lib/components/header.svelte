<script lang="ts">
    export let mapName: string;
</script>

<header class="text-center my-4">
    <h1>{mapName} Audio Explorer</h1>
    <div class="card bg-body-tertiary p-3 mx-auto">
        <small class="text-body-secondary">
            <strong>Controls:</strong> Arrow keys for movement. 'B' for zone, 'C'
            for coordinates, 'T' for points of interest, 'Y' for direction, 'E' for
            extra content, and 'Shift+V' for volume. Touch controls are also available.
        </small>
        <p class="mt-2">
            <strong>Note:</strong> If you are using a screen reader on desktop, you
            may need to put your screen reader to focus mode, which may also be called
            forms mode.
        </p>
    </div>
</header>
