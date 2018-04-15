import express from 'express';
import http from 'http';
import config from '../config/config.json';
import appSetup from './lib/app';
import routes from './lib/routes';
import passportSetup from './lib/passport';

let app = express(),
    server = http.Server(app),
    port = (`undefined` === typeof process.env.PORT)?
        config.port:
        process.env.PORT,
    ip = (`undefined` === typeof process.env.IP)?
        config.ip:
        process.env.IP;

appSetup(app);
passportSetup(app);
routes(app);

process.on(`SIGINT`, () => {
    console.log(`SIGINT caught, exiting...`);
    server.close(() => process.exit());
});

server.listen(
    port,
    ip,
    () => console.log(`Server listening on `, ip, `:`, port)
);
