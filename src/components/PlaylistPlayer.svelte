<script lang="ts">
    import type { Playlist } from "../types/playlist";
    import PlaylistEntry from "./PlaylistEntry.svelte";

    export let playlist: Playlist | undefined;
    let currentIndex = 0;

    $: {
        playlist: () => currentIndex = 0
    }

    function updateIndex() {
        if(playlist && currentIndex < playlist.audioFiles.length - 1) {
            currentIndex++;
        }
    }
</script>

{#if !playlist}
    <h2>Keine Playlist ausgewählt</h2>
{:else if playlist.audioFiles.length === 0}
    <h2>Playlist existiert nicht oder ist leer</h2>
{:else}
    <h2>Playlist <i>{ playlist.name }</i></h2>
    {#each playlist.audioFiles as audioFile, index}
        <PlaylistEntry {audioFile} {index} {currentIndex} on:ended="{() => updateIndex()}"></PlaylistEntry>
    {/each}
{/if}
