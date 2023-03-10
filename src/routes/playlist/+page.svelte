<script lang="ts">
  import { Button, Form, FormGroup, Input, Label, Navbar, NavbarBrand, Spinner } from 'sveltestrap';
  import PlaylistPlayer from '../../components/PlaylistPlayer.svelte';
  import { getPlaylist } from '../../services/eventhub';
  import type { Playlist, PlaylistEntry } from '../../types/playlist';

  let playlist: Playlist | undefined = undefined;
  let playlistName: string = '';
  let loading = false;

  async function loadPlaylist() {
    loading = true;
    try {
      const newPlaylist = await getPlaylist(playlistName);
      newPlaylist.audioFiles.sort(comparePlaylistEntries);
      playlist = newPlaylist;
    } catch (err) {
      console.log(err);
      playlist = undefined;
    } finally {
      loading = false;
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
</script>

<Navbar color="light"
  ><NavbarBrand>Playlist Test</NavbarBrand><Button class="btn-lg" color="warning" href=".."
    >X</Button
  >
</Navbar>

<Form>
  <FormGroup>
    <Label for="playlistName">Playlist-Name</Label>
    <Input
      bind:value={playlistName}
      type="text"
      name="playlistName"
      id="playlistName"
      placeholder="test_r2-6x"
    />
  </FormGroup>
  <Button on:click={loadPlaylist} disabled={!playlistName} color="primary" class="w-100 btn-lg my-2"
    >Abspielen</Button
  >
</Form>

{#if loading}
  <Spinner />
{:else}
  <PlaylistPlayer {playlist} />
{/if}
