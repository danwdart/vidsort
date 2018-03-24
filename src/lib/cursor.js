export default async (method, req, output = []) => {
    console.debug(`Start cursor`);
    const res = await method(req);
    
    if (res.nextPageToken) {
        console.debug(`There's more, retrieving next lot...`);
        return await cursor(
            method,
            {
                ...req,
                pageToken: res.nextPageToken
            },
            [...output, ...res.data.items]
        );
    }

    console.debug(`Completed cursor`);
    return {
        ...res,
        data: {
            ...res.data,
            items: [...output, ...res.data.items]
        }
    };
}
/*
const method = ({i, pageToken = 0}) => Promise.resolve({
    data: {
        items: [
            {
                i: pageToken
            }
        ]
    },
    nextPageToken: 10 === pageToken ? null : pageToken + 1
});

(async () => {
    console.log(await cursor(method, {i: 1}));
    process.exit(1);
})();
*/