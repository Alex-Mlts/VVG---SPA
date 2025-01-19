const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken'); // Added for authentication
const bodyParser = require('body-parser'); // Added for parsing request bodies

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key'; // Added for JWT secret

app.use(express.static('public'));
app.use(bodyParser.json()); // Added for parsing JSON requests

// Mock user database for authentication
const users = [
    { username: 'admin', password: 'password' } // Added for login
];

// Login Endpoint - Added for authentication
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).send('Invalid credentials');
    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

// Middleware to Verify Token - Added for securing endpoints
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// File paths for storing data
const linksData = './data/links.json';
const exhibitionsData = './data/exhibitions.json';

// Fetch links or exhibitions by category
app.get('/api/:category', (req, res) => {
    const { category } = req.params;
    const dataPath = category === 'videos' || category === 'text' || category === 'images' 
        ? linksData 
        : exhibitionsData;

    fs.readFile(dataPath, (err, data) => {
        if (err) return res.sendStatus(500);
        const items = JSON.parse(data);
        const filtered = items.filter(item => item.category === category);
        res.json(filtered);
    });
});

// Add new link (secured with authentication) - Added
app.post('/api/links', authenticateToken, (req, res) => {
    const newLink = req.body;
    fs.readFile(linksData, (err, data) => {
        if (err) return res.sendStatus(500);
        const links = JSON.parse(data);
        links.push(newLink);
        fs.writeFile(linksData, JSON.stringify(links), (err) => {
            if (err) return res.sendStatus(500);
            res.status(201).json(newLink);
        });
    });
});

// Add new exhibition (secured with authentication) - Added
app.post('/api/exhibitions', authenticateToken, (req, res) => {
    const newExhibition = req.body;
    fs.readFile(exhibitionsData, (err, data) => {
        if (err) return res.sendStatus(500);
        const exhibitions = JSON.parse(data);
        exhibitions.push(newExhibition);
        fs.writeFile(exhibitionsData, JSON.stringify(exhibitions), (err) => {
            if (err) return res.sendStatus(500);
            res.status(201).json(newExhibition);
        });
    });
});

// Start the server
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
