<script lang="ts">
    import type { PlaylistEntry } from "../types/playlist";
    import { createEventDispatcher, onMount } from 'svelte';

    export let audioFile: PlaylistEntry;
    export let index: number;
    export let currentIndex: number;

    let audioElement: HTMLAudioElement;

    const dispatch = createEventDispatcher();

    onMount(() => {
        if(index === 0 && currentIndex === 0) {
            onCurrentIndexChanged(0);
        }
    })

    $: {
        onCurrentIndexChanged(currentIndex)
    }

    function onCurrentIndexChanged(newIndex: number) {
        if(newIndex === index && audioElement) {
            audioElement.play();
        }
    }

    function onEnded() {
        dispatch('ended');
    }

</script>

<figure>
    <figcaption>{audioFile.name}</figcaption>
    <audio bind:this={audioElement} controls src="https://drive.google.com/uc?id={audioFile.id}&export=download" id="audio{index}" on:ended="{() => onEnded()}">
            Your browser does not support the <code>audio</code> element.
    </audio>
</figure>