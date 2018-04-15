import YouTube from '../lib/youtube';
import CustomSearch from '../lib/custom-search';

export default async (req, res) => {
    const youtube = new YouTube(req),
        customsearch = new CustomSearch();

    const playlists = await youtube.getPlaylists();

    const missingVideosByPlaylist = {};

    for (let i = 0; i < playlists.data.items.length; i++) {
        const playlist = playlists.data.items[i];

        console.debug(`Checking ${playlist.snippet.title}`);

        if (playlist.snippet.title.includes(`VidSort`)) {
            console.debug(`That's one of ours, skipping.`);
            continue;
        }

        missingVideosByPlaylist[playlist.id] = [];

        const playlistItems = await youtube.getPlaylistItems(playlist.id);

        if (`undefined` === typeof playlistItems.data.items) {
            console.error(`No items here.`);
            continue;
        }

        for (let j = 0; j < playlistItems.data.items.length; j++) {
            const playlistItem = playlistItems.data.items[j];

            if (`undefined` === typeof playlistItem.snippet) {
                console.error(`No playlist item snippet here.`);
                continue;
            }
            // console.debug(`Found video ID ${playlistItem.snippet.resourceId.videoId}, title = ${playlistItem.snippet.title}`);

            const videoResponse = await youtube.getVideoById(
                playlistItem.snippet.resourceId.videoId
            );
            
            const video = videoResponse.data.items[0];

            if (`undefined` !== typeof video) {
                // Not missing
                continue;
            }

            console.debug(`Found missing video ID ${playlistItem.snippet.resourceId.videoId}, title = ${playlistItem.snippet.title}`);
            missingVideosByPlaylist[playlist.id].push(playlistItem.snippet.resourceId.videoId);

            const customSearchResponse = await customsearch.search(playlistItem.snippet.resourceId.videoId);

            console.log(customSearchResponse.data);
        }
    }

    console.log(`Done.`);
    res.json(missingVideosByPlaylist);
};