<script lang="ts">
  import { doc, getDoc, getDocs, onSnapshot, type Unsubscribe } from 'firebase/firestore';
  import { onDestroy, onMount } from 'svelte';
  import { Toast, ToastBody, ToastHeader } from 'sveltestrap';
  import { currentPlayer } from '../../stores/playerStore';
  import { putschFirestore } from '../../tools/firebase';
  import type { PlayerQuestStage } from '../../types/quest';

  let innerVoiceText = '';
  let voice: SpeechSynthesisVoice | null = null;
  let firestoreUnsubscribe: Unsubscribe;
  let currentStage: PlayerQuestStage | undefined = undefined;

  onMount(async () => {
    speechSynthesis.addEventListener('voiceschanged', setVoice);
    setVoice();
    innerVoiceText = 'Hallo Spieler in';
    if ($currentPlayer) {
      innerVoiceText += ` ${$currentPlayer.id}`;
    }
    sayIt();

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
          sayIt();
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
</script>

{#if $currentPlayer}
  <h2>Du bist Spieler*in {$currentPlayer.id}</h2>
  {#if currentStage}
    <h3>Du bist in Stage {currentStage.name} von Quest {currentStage.questId}</h3>
  {/if}
  <p>
    Sobald die innere Stimme zu dir spricht, solltest du etwas hören oder den Text hier sehen:
    <Toast class="me-1">
      <ToastHeader>Die innere Stimme spricht:</ToastHeader>
      <ToastBody>
        {innerVoiceText}
      </ToastBody>
    </Toast>
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
