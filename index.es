import 'babel-polyfill';
import express from 'express';
import http from 'http';
import sessions from 'client-sessions';
import bodyParser from 'body-parser';
import passport from 'passport';
import config from './config/config.json';
import engines from 'consolidate';
import google from 'googleapis';
import {Strategy as YouTubeStrategy} from 'passport-youtube-v3';

let app = express(),
    server = http.Server(app),
    port = ('undefined' === typeof process.env.PORT)?
        config.port:
        process.env.PORT,
    ip = ('undefined' === typeof process.env.IP)?
        config.ip:
        process.env.IP;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname+'/views');
app.engine('html', engines.hogan);
app.set('view engine', 'html');

app.use(sessions({
    cookieName: 'session',
    secret: 'YouShouldProbablyReplaceThisBecauseItsASecurityRisk',
    duration: 24 * 60 * 60 * 1000,
    activeDuration: 1000 * 60 * 5,
    httpOnly: true,
    ephemeral: false
}));


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(new YouTubeStrategy(
    config.oauth.youtube,
    async (accessToken, refreshToken, profile, done) => {
        let user = await User.findById(req.session.user._id);
        req.session.user = user;
        done(null, {});
    }
));



app.get('/', (req, res) => {
    return res.render('index', {user: req.session.user});
});

app.get('/auth/youtube',
    passport.authenticate(
        'youtube',
        {
            scope: config.oauth.youtube.scope
        }
    )
);

app.get('/auth/youtube/callback',
    passport.authenticate(
        'youtube',
        {
            successRedirect: '/',
            failureRedirect: '/'
        }
    )
);

app.get('/sort', (req, res) => {
    let oauth2Client = new google.auth.OAuth2(
        config.oauth.youtube.clientID,
        config.oauth.youtube.clientSecret,
        config.oauth.youtube.callbackURL
    );

    console.log({session: req.session});

    oauth2Client.setCredentials({
      access_token: req.session.access_token,
      refresh_token: req.session.refresh_token
    });

    let youtube = google.youtube('v3');

    youtube.playlists.list({mine: true, part: 'snippet'}, function(data) {
        console.log(data);
    });

    return res.send('um yeah');

})

process.on('SIGINT', () => {
    console.log('SIGINT caught, exiting...');
    server.close(() => process.exit());
});

server.listen(
    port,
    ip,
    () => console.log('Server listening on ', ip, ':', port)
);
