import YouTube from '../lib/youtube';
import config from '../../config/config.json';
import {writeFile, readFile} from 'fs';
import {promisify} from 'util';

export default async (req, res) => {

    try {
        const file = await promisify(readFile)('cache.json');

        return res.send(file.toString());
    } catch (err) {
        // ok
    }

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

        const playlistItems = await youtube.getPlaylistItems(playlist.id)

        // access point
        playlists.data.items[i].items = playlistItems.data.items;

        if (playlist.snippet.title.includes(`VidSort`)) {
            console.debug(`That's one of ours, skipping.`);
            continue;
        }

        if ('undefined' === typeof playlistItems.data.items) {
            console.error('No items here.');
            continue;
        }

        for (let j = 0; j < playlistItems.data.items.length; j++) {
            const playlistItem = playlistItems.data.items[j];

            if ('undefined' === typeof playlistItem.snippet) {
                console.error('No playlist item snippet here.');
                continue;
            }
            console.debug(`Found video ID ${playlistItem.snippet.resourceId.videoId}, title = ${playlistItem.snippet.title}`);

            const videoResponse = await youtube.getVideoById(
                playlistItem.snippet.resourceId.videoId
            );
            
            const video = videoResponse.data.items[0];

            if ('undefined' === typeof video) {
                console.error(`No video here. May have been deleted. Video Id = ${playlistItem.snippet.resourceId.videoId}`);
                continue;
            }

            if ('undefined' === typeof video.snippet) {
                console.error('No video snippet here.');
                continue;
            }

            if ('undefined' === typeof video.snippet.tags) {
                console.error('No tags here');
                continue;
            }

            const tags = video.snippet.tags;

            for (let k = 0; k < tags.length; k++) {
                const tag = tags[k].toLowerCase();

                if (config.pointlessTags.includes(tag)) {
                    continue;
                }

                if ('undefined' === typeof videosByTag[tag]) {
                    videosByTag[tag] = [];
                }

                videosByTag[tag].push(
                    {
                        title: playlistItem.snippet.title,
                        id: playlistItem.snippet.resourceId.videoId,
                        fromPlaylist: {
                            title: playlist.snippet.title,
                            id: playlist.id,
                            itemId: playlistItem.id
                        },
                        url: `https://youtube.com/watch?v=${playlistItem.snippet.resourceId.videoId}`
                    }
                );
            }
        }
    }

    const arrVideosByTag = [];
    for (const key in videosByTag) {
        arrVideosByTag.push({
            key,
            videos: videosByTag[key],
            length: videosByTag[key].length
        });
    }

    arrVideosByTag.sort((a, b) => a.length > b.length ? -1 : (a.length < b.length ? 1 : 0));
    console.log(arrVideosByTag);

    await promisify(writeFile)('cache.json', JSON.stringify(arrVideosByTag));

    return res.json(arrVideosByTag);
}