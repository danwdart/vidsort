
import passport from 'passport';
import config from '../../config/config.json';
import {Strategy as YouTubeStrategy} from 'passport-youtube-v3';

export default app => {
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
    
    app.use(passport.initialize());
    app.use(passport.session());
    
    
    passport.use(new YouTubeStrategy(
        config.api.google.oauth,
        async (accessToken, refreshToken, profile, done) => {
            done(null, {
                profile,
                accessToken,
                refreshToken,
            });
        }
    ));

    app.get(`/auth/youtube`,
        passport.authenticate(
            `youtube`,
            {
                scope: config.api.google.oauth.scope
            }
        )
    );

    app.get(`/auth/youtube/callback`,
        passport.authenticate(
            `youtube`,
            {
                successRedirect: `/`,
                failureRedirect: `/`
            }
        )
    );
};