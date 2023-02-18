<script lang="ts">
	import type { Player } from '../types/player';
	import { Button, Spinner } from 'sveltestrap';
	import { onMount } from 'svelte';
	import { getPlayers } from '../services/eventhub';
	import { currentPlayer } from '../stores/playerStore';

	let players: Player[] | undefined = undefined;
	let selectedPlayer: Player | null = null;

	onMount(async () => {
		players = await getPlayers();
		if (players.length > 0) {
			selectedPlayer = players[0];
			currentPlayer.set(selectedPlayer);
		}
	});
</script>

<h2 class="m-3">Welche*r Spieler*in bist du?</h2>
{#if !players}
	<Spinner />
{:else}
	<div class="form-group">
		<select bind:value={selectedPlayer} on:change={() => currentPlayer.set(selectedPlayer)} class="form-control">
			{#each players as player}
				<option value={player}>{player.id}</option>
			{/each}
		</select>
		<Button color="success" class="w-100 btn-lg mt-2" href="game">OK</Button>
	</div>
{/if}

<style>
	select {
		font-size: 1.25rem;
	}
</style>
