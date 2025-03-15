const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();

const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY';
const SEARCH_ENGINE_ID = 'YOUR_SEARCH_ENGINE_ID';

// Middleware to serve static files (CSS, JS)
app.use(express.static(path.join(__dirname, 'public'))); // Serving static files from "public" folder
app.use(express.json());

// Route to fetch images
app.get('/search', async (req, res) => {
    const { query } = req.query;
    const url = `https://www.googleapis.com/customsearch/v1?q=${query}&key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&searchType=image`;

    try {
        const response = await axios.get(url);
        const images = response.data.items.map(item => item.link);
        res.json(images);
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).send('Error fetching images');
    }
});

// Route to download an image
app.get('/download', async (req, res) => {
    const { url } = req.query;
    const imageName = path.basename(new URL(url).pathname);
    const imagePath = path.join(__dirname, imageName);

    try {
        const response = await axios({
            method: 'GET',
            url,
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(imagePath);
        response.data.pipe(writer);

        writer.on('finish', () => res.download(imagePath, () => fs.unlinkSync(imagePath)));
        writer.on('error', () => res.status(500).send('Error downloading image'));
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).send('Download failed');
    }
});

// HTML Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serve index.html from "public" folder
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
