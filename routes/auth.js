const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && user.password === password) {
        req.session.userId = user._id;
        req.session.username = user.username;
        res.redirect('/chat');
    } else {
        res.send('Invalid credentials');
    }
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    await new User({ username, password }).save();
    res.redirect('/login');
});

module.exports = router;
