import google from 'googleapis';
import config from '../../config/config.json';

export default req => {
    const oauth2Client = new google.auth.OAuth2(
        config.oauth.youtube.clientID,
        config.oauth.youtube.clientSecret,
        config.oauth.youtube.callbackURL
    );

    oauth2Client.setCredentials({
        access_token: req.session.passport.user.accessToken,
        refresh_token: req.session.passport.user.refreshToken
    });

    google.options(
        {
            auth: oauth2Client
        }
    );

    return google;
}