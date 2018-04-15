import bodyParser from 'body-parser';
import express from 'express';
import engines from 'consolidate';
import sessions from 'client-sessions';

export default app => {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(express.static(__dirname + `/../../public`));
    app.set(`views`, __dirname+`/../../views`);
    app.engine(`html`, engines.hogan);
    app.set(`view engine`, `html`);

    app.use(sessions({
        cookieName: `session`,
        secret: `YouShouldProbablyReplaceThisBecauseItsASecurityRisk`,
        duration: 24 * 60 * 60 * 1000,
        activeDuration: 1000 * 60 * 5,
        httpOnly: true,
        ephemeral: false
    }));
};