const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.connect('mongodb+srv://hemali:123@cluster0.5xkxt.mongodb.net/chatApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// Store connected users
const users = {};

// Routes
app.get('/', (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    res.render('chat', { username: req.session.username });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user._id;
        req.session.username = user.username;
        res.redirect('/');
    } else {
        res.send('Invalid credentials');
    }
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await new User({ username, password: hashedPassword }).save();
    res.redirect('/login');
});

// WebSocket Logic
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('registerUser', (username) => {
        users[username] = socket.id;
    });

    socket.on('privateMessage', async ({ sender, recipient, message }) => {
        const msg = new Message({ sender, recipient, text: message });
        await msg.save();
        if (users[recipient]) {
            io.to(users[recipient]).emit('receiveMessage', { sender, message });
        }
    });

    socket.on('disconnect', () => {
        for (let username in users) {
            if (users[username] === socket.id) {
                delete users[username];
                break;
            }
        }
        console.log('User disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
