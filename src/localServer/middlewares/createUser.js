const express = require('express');
const router = express.Router();

router.post('/create', (req, res, next) => {
    const user = req.body;
    user.succesed = true;
    res.json(user);
    next();
});

module.exports = router;