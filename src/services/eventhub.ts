import type { Player } from '../types/player';
import type { Playlist } from '../types/playlist';

async function getPlayers(): Promise<Player[]> {
    const response = await fetch(
        'https://putsch-event-hub.uc.r.appspot.com/api/v1/game-data/players',
        { method: 'GET' }
    );
    const data = await response.json() as Player[];
    return data;
}


async function getPlaylist(name: string): Promise<Playlist> {
    const response = await fetch(
        `https://putsch-event-hub.uc.r.appspot.com/api/v1/playlists/${name}`,
        { method: 'GET' }
    );
    const data = await response.json() as Playlist;
    return data;
}

export { getPlayers, getPlaylist };