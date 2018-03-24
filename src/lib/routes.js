export default app => {
    app.get(`/`, IndexController);
    app.get(`/sort`, SortController);
};