<script lang="ts">
	import { onMount } from 'svelte';
	import { Toast, ToastBody, ToastHeader } from 'sveltestrap';
	import { currentPlayer } from '../../stores/playerStore';

	let innerVoiceText = '';
	let voice: SpeechSynthesisVoice | null = null;

	onMount(() => {
		speechSynthesis.addEventListener('voiceschanged', setVoice);
		setVoice();
		innerVoiceText = 'Hallo Spieler in';
		if ($currentPlayer) {
			innerVoiceText += ` ${$currentPlayer.id}`;
		}
		sayIt();
	});

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
