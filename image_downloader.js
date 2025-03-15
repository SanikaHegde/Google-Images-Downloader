###this is all in one code##
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();

const GOOGLE_API_KEY = '#####';
const SEARCH_ENGINE_ID = '#####';/// change ur api and search engine id

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

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
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Google Image Downloader</title>
        <style>
            /* Basic Reset */
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Arial', sans-serif;
                background: url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlS4BVA3cXSDwbO8W1n5989kzhjZhhlHh2bw&s') no-repeat center center fixed;
                background-size: 100px 100px;
                background-attachment: fixed;
                background-position: center;
                background-repeat: repeat;
                color: #fff;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100vh;
                text-align: center;
                padding: 20px;
                overflow: hidden;
            }

            h1 {
                font-size: 3rem;
                margin-bottom: 20px;
                letter-spacing: 2px;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
                color: #007BFF;
                background-color: #fff; /* White background for title */
                padding: 10px 20px;
                border-radius: 5px;
            }

            input {
                padding: 12px 20px;
                margin-top: 20px;
                width: 100%;
                max-width: 400px;
                border-radius: 30px;
                border: 2px solid #fff;
                font-size: 1rem;
                outline: none;
                background-color: #f8c8d2; /* Light pink color */
                color: #333; /* Dark text for contrast */
                transition: border-color 0.3s ease-in-out;
            }

            input:focus {
                border-color: #ff6f61; /* Highlight on focus */
            }

            button {
                padding: 12px 24px;
                background-color: #ff6f61;
                color: white;
                font-size: 1rem;
                border: none;
                border-radius: 30px;
                cursor: pointer;
                transition: background-color 0.3s ease-in-out;
                margin-top: 15px;
            }

            button:hover {
                background-color: #e65a4f;
            }

            #imageResults {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 20px;
                margin-top: 30px;
                width: 100%;
                max-width: 1200px;
                transition: opacity 0.3s ease;
            }

            .image-container {
                background-color: #fff;
                border-radius: 15px;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                overflow: hidden;
                text-align: center;
                transition: transform 0.3s ease;
            }

            .image-container:hover {
                transform: translateY(-10px);
            }

            .image-container img {
                width: 100%;
                height: 200px;
                object-fit: cover;
                border-bottom: 2px solid #f1f1f1;
                border-radius: 15px 15px 0 0;
            }

            .download-btn {
                padding: 10px 15px;
                background-color: #28a745;
                color: white;
                border: none;
                border-radius: 30px;
                font-size: 0.9rem;
                cursor: pointer;
                margin-top: 10px;
                transition: background-color 0.3s ease;
            }

            .download-btn:hover {
                background-color: #218838;
            }

            .no-results {
                font-size: 1.2rem;
                color: #ffcc00;
                margin-top: 20px;
            }

            @media (max-width: 600px) {
                input {
                    width: 80%;
                }

                button {
                    width: 80%;
                }
            }
        </style>
    </head>
    <body>
        <h1>Google Image Downloader</h1>
        <input type="text" id="searchQuery" placeholder="Search for images...">
        <button onclick="searchImages()">Search</button>

        <div id="imageResults"></div>
        <div class="no-results" id="noResults" style="display: none;">No results found. Try a different search.</div>

        <script>
            async function searchImages() {
                const query = document.getElementById('searchQuery').value;
                const response = await fetch('/search?query=' + encodeURIComponent(query));
                const images = await response.json();
                const resultsDiv = document.getElementById('imageResults');
                const noResultsDiv = document.getElementById('noResults');
                
                resultsDiv.innerHTML = '';
                noResultsDiv.style.display = 'none';

                if (images.length === 0) {
                    noResultsDiv.style.display = 'block';
                    return;
                }

                images.forEach(imgUrl => {
                    const imgElement = document.createElement('img');
                    imgElement.src = imgUrl;

                    const downloadBtn = document.createElement('button');
                    downloadBtn.innerText = 'Download';
                    downloadBtn.classList.add('download-btn');
                    downloadBtn.onclick = () => downloadImage(imgUrl);

                    const container = document.createElement('div');
                    container.classList.add('image-container');
                    container.appendChild(imgElement);
                    container.appendChild(downloadBtn);

                    resultsDiv.appendChild(container);
                });
            }

            async function downloadImage(url) {
                const downloadLink = document.createElement('a');
                downloadLink.href = '/download?url=' + encodeURIComponent(url);
                downloadLink.download = 'image.jpg';
                downloadLink.click();
            }
        </script>
    </body>
    </html>
    `);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
