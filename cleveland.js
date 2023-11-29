const apiEndpointCleveland = 'https://api.artic.edu/api/v1/artworks';
const iiifBaseUrlCleveland = 'https://www.artic.edu/iiif/2';

const artworkContainerCleveland = document.getElementById('artworkContainerCleveland');
let displayedArtworkIdsCleveland = [];

// Call the function to get and display artworks on page load
getRandomArtworks();

function getRandomArtworks() {
    // Generate a random page number
    const randomPage = Math.floor(Math.random() * 10295) + 1;

    console.log('Fetching artworks from page:', randomPage);

    fetch(`${apiEndpointCleveland}?page=${randomPage}`)
        .then(response => response.json())
        .then(data => {
            const artworks = data.data;

            // Filter the artworks to include only those with an image_id and not already displayed
            const artworksWithImages = artworks.filter(artwork => artwork.image_id && !displayedArtworkIds.includes(artwork.id));

            // Shuffle the array to get random artworks
            const shuffledArtworks = shuffleArray(artworksWithImages);

            // Display the artworks
            shuffledArtworks.forEach(artwork => {
                displayedArtworkIdsCleveland.push(artwork.id); // Add displayed artwork to the list
                displayArtworkCleveland(artwork);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function displayArtworkCleveland(artwork) {
    const artworkDiv = document.createElement('div');
    artworkDiv.innerHTML = `
        <img src="${iiifBaseUrlCleveland}/${artwork.image_id}/full/843,/0/default.jpg" alt="Artwork">
        <p>Title: ${artwork.title}</p>
        <p>Artist: ${artwork.artist_display}</p>
    `;
    artworkContainerCleveland.appendChild(artworkDiv);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Add event listener for scrolling
window.addEventListener('scroll', () => {
    // Check if the user has scrolled to the bottom of the page
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        // Load more artworks
        getRandomArtworks();
    }
});

console.log('Fetched from Cleveland:'); 
