console.log('Fetched from Chicago');
const apiEndpoint = 'https://api.artic.edu/api/v1/artworks';
const iiifBaseUrl = 'https://www.artic.edu/iiif/2';

const artworkContainer = document.getElementById('artworkContainer');
let displayedArtworkIds = [];

// Call the function to get and display artworks on page load
getRandomArtworks();

function getRandomArtworks() {
    // Generate a random page number
    const randomPage = Math.floor(Math.random() * 10295) + 1;

    console.log('Fetching artworks from page:', randomPage);

    fetch(`${apiEndpoint}?page=${randomPage}`)
        .then(response => response.json())
        .then(data => {
            const artworks = data.data;

            // Filter the artworks to include only those with an image_id and not already displayed
            const artworksWithImages = artworks.filter(artwork => artwork.image_id && !displayedArtworkIds.includes(artwork.id));

            // Shuffle the array to get random artworks
            const shuffledArtworks = shuffleArray(artworksWithImages);

            // Display the artworks
            shuffledArtworks.forEach(artwork => {
                displayedArtworkIds.push(artwork.id); // Add displayed artwork to the list
                displayArtwork(artwork);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function displayArtwork(artwork) {
    const artworkDiv = document.createElement('div');
    artworkDiv.innerHTML = `
        <img src="${iiifBaseUrl}/${artwork.image_id}/full/843,/0/default.jpg" alt="Artwork">
        <p>Title: ${artwork.title}</p>
        <p>Artist: ${artwork.artist_display}</p>
    `;
    artworkContainer.appendChild(artworkDiv);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Chicago.js
const chicagoTab = document.getElementById('chicagoTab');

chicagoTab.addEventListener('scroll', () => {
    // Calculate the scroll percentage
    const scrollPercentage = (chicagoTab.scrollTop + chicagoTab.clientHeight) / chicagoTab.scrollHeight * 100;

    // Check if the user has scrolled to 80% from the bottom of the Chicago tab content
    if (scrollPercentage >= 80) {
        // Load more artworks for Chicago
        console.log('Fetched from Chicago');
        getRandomArtworks();
    }
});

