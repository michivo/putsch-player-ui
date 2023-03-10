<script lang="ts">
  import { doc, getDoc, getDocs, onSnapshot, type Unsubscribe } from 'firebase/firestore';
  import { onDestroy, onMount } from 'svelte';
  import { Spinner, Toast, ToastBody, ToastHeader } from 'sveltestrap';
    import PlaylistPlayer from '../../components/PlaylistPlayer.svelte';
  import { getPlaylist } from '../../services/eventhub';
  import { currentPlayer } from '../../stores/playerStore';
  import { putschFirestore } from '../../tools/firebase';
  import type { Playlist, PlaylistEntry } from '../../types/playlist';
  import type { PlayerQuestStage } from '../../types/quest';

  let innerVoiceText = '';
  let voice: SpeechSynthesisVoice | null = null;
  let firestoreUnsubscribe: Unsubscribe;
  let currentStage: PlayerQuestStage | undefined = undefined;
  let playlist: Playlist | undefined = undefined;
  let loading = false;

  onMount(async () => {
    try {
      speechSynthesis.addEventListener('voiceschanged', setVoice);
      setVoice();
      innerVoiceText = 'Hallo Spieler in';
      if ($currentPlayer) {
        innerVoiceText += ` ${$currentPlayer.id}`;
      }
      sayIt();
    } catch {
      console.log('Error initializing speech synthesis.');
    }

    await initFirestore();
  });

  onDestroy(() => {
    if (firestoreUnsubscribe) {
      firestoreUnsubscribe();
    }
  });

  async function initFirestore() {
    if (!$currentPlayer) {
      return;
    }

    const docRef = doc(putschFirestore, 'playerQuests', $currentPlayer.id);
    const querySnapshot = await getDoc(docRef);
    if (querySnapshot.exists()) {
      currentStage = querySnapshot.data() as PlayerQuestStage;
      if (currentStage.text) {
        innerVoiceText = currentStage.text;
        sayIt();
      }
    }

    firestoreUnsubscribe = onSnapshot(docRef, (data) => {
      if (data.exists()) {
        currentStage = data.data() as PlayerQuestStage;
        if (currentStage.text) {
          innerVoiceText = currentStage.text;
        }
        console.log(currentStage);
        if (currentStage.playlistName) {
          loadPlaylist();
        } else {
          playlist = undefined;
        }
      }
    });
  }

  function setVoice() {
    let voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      var germanVoices = voices.filter((v) => v.lang === 'de-DE' || v.lang === 'de');
      if (germanVoices.length > 0) {
        voice = germanVoices[0];
      } else {
        voice = voices[0];
      }
    }
  }

  function sayIt() {
    if (voice) {
      let u = new SpeechSynthesisUtterance(innerVoiceText);
      u.voice = voice;
      speechSynthesis.speak(u);
    }
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
  <p>
    Sobald die innere Stimme zu dir spricht, solltest du etwas hören oder den Text hier sehen:
    <Toast class="me-1">
      <ToastHeader>Die innere Stimme spricht:</ToastHeader>
      <ToastBody>
        {innerVoiceText}
      </ToastBody>
    </Toast>
    {#if loading}
      <Spinner />
    {:else}
      <PlaylistPlayer {playlist} />
    {/if}
  </p>
{:else}
  <div class="p-3 bg-danger mb-3">
    <Toast class="me-1">
      <ToastHeader>Kein*e Spieler*in ausgewählt</ToastHeader>
      <ToastBody>
        <a href="/..">Zurück zur Auswahl</a>
      </ToastBody>
    </Toast>
  </div>
{/if}
