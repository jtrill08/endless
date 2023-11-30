document.addEventListener('DOMContentLoaded', function () {
    getRandomArtworksCleveland();
});

function getRandomArtworksCleveland() {
    fetch('https://openaccess-api.clevelandart.org/api/artworks/?format=json&has_image=1')
        .then(response => response.json())
        .then(data => {
            const randomArtworks = [];
            for (let i = 0; i < 3; i++) {
                const randomIndex = Math.floor(Math.random() * data.data.length);
                const randomArtwork = data.data[randomIndex];
                randomArtworks.push(fetch(`https://openaccess-api.clevelandart.org/api/artworks/${randomArtwork.id}`)
                    .then(response => response.json())
                    .then(data => data.data)
                );
            }
            return Promise.all(randomArtworks);
        })
        .then(artworks => {
            const artworkContainerCleveland = document.getElementById('artworkContainerCleveland');
            artworks.forEach(artwork => {
                const artworkInfo = createArtworkElement(artwork);
                artworkContainerCleveland.appendChild(artworkInfo);
            });
        })
        .catch(error => {
            console.error('Error fetching artworks:', error);
        });
}

function createArtworkElement(artwork) {
    const artworkInfo = document.createElement('div');
    artworkInfo.classList.add('artwork-info');

    const titleElement = document.createElement('p');
    titleElement.innerHTML = `<strong>Title:</strong> ${artwork.title}`;
    artworkInfo.appendChild(titleElement);

    const artistElement = document.createElement('p');
    artistElement.innerHTML = `<strong>Artist:</strong> ${(artwork.creators && artwork.creators.length > 0) ? artwork.creators[0].description : 'Unknown Artist'}`;
    artworkInfo.appendChild(artistElement);

    const dateElement = document.createElement('p');
    dateElement.innerHTML = `<strong>Date:</strong> ${artwork.creation_date}`;
    artworkInfo.appendChild(dateElement);

    const mediumElement = document.createElement('p');
    mediumElement.innerHTML = `<strong>Medium:</strong> ${artwork.type}`;
    artworkInfo.appendChild(mediumElement);

    const descriptionElement = document.createElement('p');
    descriptionElement.innerHTML = `<strong>Description:</strong> ${artwork.description}`;
    artworkInfo.appendChild(descriptionElement);

    const didyouknowElement = document.createElement('p');
    didyouknowElement.innerHTML = `<strong>Did you know:</strong> ${artwork.did_you_know}`;
    artworkInfo.appendChild(didyouknowElement);

    if (artwork.images && artwork.images.web) {
        const imageElement = document.createElement('img');
        imageElement.src = artwork.images.web.url;
        imageElement.alt = 'Artwork';
        artworkInfo.appendChild(imageElement);
    }

    return artworkInfo;
}

// Cleveland.js
const clevelandTab = document.getElementById('clevelandTab');

clevelandTab.addEventListener('scroll', () => {
    // Calculate the scroll percentage
    const scrollPercentage = (clevelandTab.scrollTop + clevelandTab.clientHeight) / clevelandTab.scrollHeight * 100;

    // Check if the user has scrolled to 80% from the bottom of the Cleveland tab content
    if (scrollPercentage >= 80) {
        // Load more artworks for Cleveland
        console.log('Fetched from Cleveland');
        getRandomArtworksCleveland();
    }
});
