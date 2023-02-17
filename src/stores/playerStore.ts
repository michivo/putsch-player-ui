import { writable, type Writable } from 'svelte/store';
import type { Player } from '../types/player';

export const currentPlayer: Writable<Player | null> = writable(null);