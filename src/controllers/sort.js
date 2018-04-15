import YouTube from '../lib/youtube';
import config from '../../config/config.json';

export default async (req, res) => {
    const youtube = new YouTube(req);

    const playlists = await youtube.getPlaylists();

    const videosByTag = {};

    for (let i = 0; i < playlists.data.items.length; i++) {
        const playlist = playlists.data.items[i];

        console.debug(`Found playlist ${playlist.snippet.title}`);

        if (config.pointlessTags.find(tag => playlist.snippet.title === `VidSort: ${tag}`)) {
            console.warn(`Pointless playlist found (${playlist.snippet.title})`);
            console.warn(`Deleting playlist ID ${playlist.id}`);
            await youtube.deletePlaylist(playlist.id);
            console.log(`Deleted playlist ${playlist.snippet.title}.`);

            continue;
        }

        const playlistItems = await youtube.getPlaylistItems(playlist.id);

        // access point
        playlists.data.items[i].items = playlistItems.data.items;

        if (playlist.snippet.title.includes(`VidSort`)) {
            console.debug(`That's one of ours, skipping.`);
            continue;
        }

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
            console.debug(`Found video ID ${playlistItem.snippet.resourceId.videoId}, title = ${playlistItem.snippet.title}`);

            const videoResponse = await youtube.getVideoById(
                playlistItem.snippet.resourceId.videoId
            );
            
            const video = videoResponse.data.items[0];

            if (`undefined` === typeof video) {
                console.error(`No video here. May have been deleted. Video Id = ${playlistItem.snippet.resourceId.videoId}`);
                continue;
            }

            if (`undefined` === typeof video.snippet) {
                console.error(`No video snippet here.`);
                continue;
            }

            if (`undefined` === typeof video.snippet.tags) {
                console.error(`No tags here`);
                continue;
            }

            const tags = video.snippet.tags;

            for (let k = 0; k < tags.length; k++) {
                const tag = tags[k].toLowerCase();

                if (config.pointlessTags.includes(tag)) {
                    continue;
                }

                if (`undefined` === typeof videosByTag[tag]) {
                    videosByTag[tag] = [];
                }

                videosByTag[tag].push(
                    {
                        title: playlistItem.snippet.title,
                        id: playlistItem.snippet.resourceId.videoId,
                        url: `https://youtube.com/watch?v=${playlistItem.snippet.resourceId.videoId}`
                    }
                );
            }
        }
    }

    // remove uniques and boring tags
    for (const key in videosByTag) {
        if (2 >= videosByTag[key].length) {
            delete videosByTag[key];
        }
    }

    console.debug(`Tag extraction complete`);

    for (const tag in videosByTag) {
        const videoList = videosByTag[tag];
        
        const playlistName = `VidSort: ${tag}`;

        const foundPlaylist = playlists.data.items.find(
            playlist =>
                playlistName === playlist.snippet.title
        );

        let playlistId = null;

        if (foundPlaylist) {
            console.debug(`You have a ${playlistName} playlist already.`);
            playlistId = foundPlaylist.id;
        } else {
            console.debug(`Creating you a ${playlistName} playlist.`);
            const createPlaylistResponse = await youtube.createPlaylist(
                playlistName,
                `Created by JolHarg VidSort for the tag "${tag}"`
            );
            playlistId = createPlaylistResponse.data.id;
        }

        for (let l = 0; l < videoList.length; l++) {
            const videoDetails = videoList[l];

            if (`undefined` === typeof videoDetails.id) {
                console.error(`No id for a video, index = ${l}`);
                continue;
            }

            if (foundPlaylist) {
                console.debug(`Given playlist already existed, checking if item existed.`);

                if (`undefined` === typeof foundPlaylist.items) {
                    console.error(`Cannot determine items for playlist.`);
                    continue;
                }

                const foundPlaylistItem = foundPlaylist.items.find(
                    playlistItem =>
                        videoDetails.id === playlistItem.snippet.resourceId.videoId
                );

                if (foundPlaylistItem) {
                    console.debug(`Item already existed, skipping.`);
                    continue;
                }
            }

            console.debug(`Inserting video ${videoDetails.id} (${videoDetails.title}) into playlist ${playlistId} (${playlistName})`);
            await youtube.insertPlaylistItem(
                playlistId,
                videoDetails.id
            );
            
            console.debug(`Inserted.`);
        }
    }

    console.log(`Done.`);
    res.json(videosByTag);
};