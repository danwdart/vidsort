import config from '../../config/config.json';
import cursor from './cursor';
import google from 'googleapis';
import {promisify} from 'util';

export default class CustomSearch
{
    constructor()
    {
        this.gcustomsearch = google.customsearch(
            {
                version: `v1`,
                auth: config.api.google.service.apiKey
            }
        );
    }

    async search(q)
    {
        return promisify(this.gcustomsearch.cse.list)(
            {
                q,
                cx: config.api.google.service.customSearch.cx,
                fields: `items`
            }
        );
    }
}