export default (req, res) => {
    return res.render(`index`, {
        user: req.session.user
    });
};