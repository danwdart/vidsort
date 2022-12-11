import config from '../../config/config.json';
import cursor from './cursor';
import google from 'googleapis';
import {promisify} from 'util';

export default class YouTube
{
    constructor(req)
    {
        const oauth2Client = new google.auth.OAuth2(
            config.api.google.oauth.clientID,
            config.api.google.oauth.clientSecret,
            config.api.google.oauth.callbackURL
        );

        if (req) {
            if (!req.session || !req.session.passport || !req.session.passport.user) {
                throw new Error(`User not logged in`);
            }

            oauth2Client.setCredentials({
                access_token: req.session.passport.user.accessToken,
                refresh_token: req.session.passport.user.refreshToken
            });
        }

        this.gyoutube = google.youtube(
            {
                version: `v3`,
                auth: oauth2Client
            }
        );
    }

    async getPlaylists()
    {
        return cursor(promisify(this.gyoutube.playlists.list),
            {
                maxResults: 50,
                mine: true,
                part: `snippet`
            }
        );
    }

    async deletePlaylist(id)
    {
        return promisify(this.gyoutube.playlists.delete)(
            {
                id
            }
        );
    }

    async getPlaylistItems(playlistId)
    {
        return cursor(promisify(this.gyoutube.playlistItems.list),
            {
                part: `snippet`,
                maxResults: 50,
                playlistId
            }
        );
    }

    async getVideoById(id)
    {
        return promisify(this.gyoutube.videos.list)(
            {
                part: `snippet`,
                id
            }
        );
    }

    async createPlaylist(playlistName, description)
    {
        return promisify(this.gyoutube.playlists.insert)(
            {
                "part": `snippet`,
                "resource": {
                    "snippet": {
                        "title": playlistName,
                        "description": description
                    }
                }
            }
        );
    }

    async insertPlaylistItem(playlistId, videoId)
    {
        return promisify(this.gyoutube.playlistItems.insert)(
            {
                part: `snippet`,
                resource: {
                    snippet: {
                        playlistId,
                        resourceId: {
                            kind: `youtube#video`,
                            videoId
                        }
                    }
                }
            }
        );
    }
}