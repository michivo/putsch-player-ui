import type { Player } from '../types/player';

async function getPlayers(): Promise<Player[]> {
    const response = await fetch(
        'https://putsch-event-hub.uc.r.appspot.com/api/v1/game-data/players',
        { method: 'GET' }
    );
    const data = await response.json() as Player[];
    return data;
}

export { getPlayers };