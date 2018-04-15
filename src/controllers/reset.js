import YouTube from '../lib/youtube';

export default async (req, res) => {
    const youtube = new YouTube(req);

    const playlists = await youtube.getPlaylists();

    for (let i = 0; i < playlists.data.items.length; i++) {
        const playlist = playlists.data.items[i];

        console.debug(`Found playlist ${playlist.snippet.title}`);

        if (playlist.snippet.title.includes(`VidSort`)) {
            console.warn(`VidSort playlist found (${playlist.snippet.title})`);
            console.warn(`Deleting playlist ID ${playlist.id} title = ${playlist.snippet.title}`);
            await youtube.deletePlaylist(playlist.id);
            console.warn(`Deleted playlist ID ${playlist.id} title = ${playlist.snippet.title}`);
        }
    }

    res.json({done: true});
}