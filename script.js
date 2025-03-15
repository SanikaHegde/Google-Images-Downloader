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
