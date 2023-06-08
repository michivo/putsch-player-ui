<script lang="ts">
  import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
  import { onDestroy, onMount } from 'svelte';
  import { Spinner, Toast, ToastBody, ToastHeader } from 'sveltestrap';
  import PlaylistPlayer from '../../components/PlaylistPlayer.svelte';
  import { getPlayers, getPlaylist } from '../../services/eventhub';
  import { currentPlayer } from '../../stores/playerStore';
  import { putschFirestore } from '../../tools/firebase';
  import type { Playlist, PlaylistEntry } from '../../types/playlist';
  import type { PlayerQuestStage } from '../../types/quest';
  import { page } from '$app/stores';

  let firestoreUnsubscribe: Unsubscribe;
  let currentStage: PlayerQuestStage | undefined = undefined;
  let playlist: Playlist | undefined = undefined;
  let loading = true;

  onMount(async () => {
    try {
      await initFirestore();
    } finally {
      loading = false;
    }
  });

  onDestroy(() => {
    if (firestoreUnsubscribe) {
      firestoreUnsubscribe();
    }
  });

  async function initFirestore() {
    if (!$currentPlayer) {
      const playerId = $page.url.searchParams.get('playerId');
      if (playerId) {
        let players = await getPlayers();
        if (players.length > 0) {
          const player = players.find((p) => p.id === playerId);
          if (player) {
            currentPlayer.set(player);
          }
        }
      }
    }
    if (!$currentPlayer) {
      return;
    }

    const docRef = doc(putschFirestore, 'playerQuests', $currentPlayer.id);

    firestoreUnsubscribe = onSnapshot(docRef, (data) => {
      if (data.exists()) {
        const previousStage = currentStage;
        currentStage = data.data() as PlayerQuestStage;
        console.log(currentStage);
        if (currentStage.playlistName) {
          if(previousStage && previousStage.playlistName === currentStage.playlistName) {
            console.log(`Skipping update, since playlist ${currentStage.playlistName} has not changed`);
            return;
          }
          loadPlaylist();
        } else {
          playlist = undefined;
        }
      }
    });
  }

  function getIndex(entry: PlaylistEntry) {
    const regex = /\d+\./;
    const matches = regex.exec(entry.name);
    if (!matches) {
      return 0;
    }

    const match = matches[matches.length - 1];
    return parseInt(match.substring(0, match.length - 1));
  }

  function comparePlaylistEntries(one: PlaylistEntry, other: PlaylistEntry): number {
    return getIndex(one) - getIndex(other);
  }

  async function loadPlaylist() {
    if (!currentStage || !currentStage.playlistName) {
      return;
    }
    loading = true;
    try {
      const newPlaylist = await getPlaylist(currentStage.playlistName);
      newPlaylist.audioFiles.sort(comparePlaylistEntries);
      playlist = newPlaylist;
    } catch (err) {
      playlist = undefined;
    } finally {
      loading = false;
    }
  }
</script>

{#if $currentPlayer}
  <h2>Du bist Spieler*in {$currentPlayer.id}</h2>
  {#if currentStage}
    <h3>Du bist in Stage {currentStage.name} von Quest {currentStage.questId}</h3>
    {#if currentStage.currentLocation}
      <b>Du bist an Ort {currentStage.currentLocation}</b>
    {/if}
  {/if}
  {#if loading}
    <Spinner />
  {:else}
    <PlaylistPlayer {playlist} />
  {/if}
{:else if loading}
  <Spinner />
{:else}
  <div class="p-3 bg-danger mb-3">
    <Toast class="me-1">{loading}
      <ToastHeader>Kein*e Spieler*in ausgewählt</ToastHeader>
      <ToastBody>
        <a href="/..">Zurück zur Auswahl</a>
      </ToastBody>
    </Toast>
  </div>
{/if}
