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
    artworkInfo.classList.add('art-card');

    if (artwork.images && artwork.images.web) {
        const imageElement = document.createElement('img');
        imageElement.src = artwork.images.web.url;
        imageElement.alt = 'Artwork';
        imageElement.className = 'artImage';
        artworkInfo.appendChild(imageElement);
    }

    const artInfoContainer = document.createElement('div');
    artInfoContainer.classList.add('artInfo');

    const artistElement = document.createElement('p');
    artistElement.className = 'artistName'; // Set the class here
    artistElement.innerHTML = `<strong>Artist:</strong> ${(artwork.creators && artwork.creators.length > 0) ? artwork.creators[0].description : 'Unknown Artist'}`;
    artworkInfo.appendChild(artistElement);

    const titleElement = document.createElement('p');
    titleElement.className = 'artTitle'; // Set the class here
    titleElement.innerHTML = `<strong>Title:</strong> ${artwork.title}`;
    artworkInfo.appendChild(titleElement);


    const dateElement = document.createElement('p');
    titleElement.className = 'artDate'; // Set the class here
    dateElement.innerHTML = `<strong>Date:</strong> ${artwork.creation_date}`;
    artworkInfo.appendChild(dateElement);

    const mediumElement = document.createElement('p');
    titleElement.className = 'artMedium'; // Set the class here
    mediumElement.innerHTML = `<strong>Medium:</strong> ${artwork.type}`;
    artworkInfo.appendChild(mediumElement);

    const descriptionElement = document.createElement('p');
    titleElement.className = 'artDescription'; // Set the class here
    descriptionElement.innerHTML = `<strong>Description:</strong> ${artwork.description}`;
    artworkInfo.appendChild(descriptionElement);



    return artworkInfo;
}

// Cleveland.js
const clevelandTab = document.getElementById('clevelandTab');

let isFetching = false;

clevelandTab.addEventListener('scroll', () => {
    const scrollPercentage = (clevelandTab.scrollTop + clevelandTab.clientHeight) / clevelandTab.scrollHeight * 100;

    if (scrollPercentage >= 80 && !isFetching) {
        isFetching = true;

        // Load more artworks for Cleveland
        console.log('Fetched from Cleveland');
        getRandomArtworksCleveland();

        // Allow the next request after a certain delay (e.g., 2 seconds)
        setTimeout(() => {
            isFetching = false;
        }, 2000);
    }
});
