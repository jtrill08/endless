console.log('Fetched from Chicago');
const apiEndpoint = 'https://api.artic.edu/api/v1/artworks';
const iiifBaseUrl = 'https://www.artic.edu/iiif/2';

const artworkContainer = document.getElementById('artworkContainer');
let displayedArtworkIds = [];
let isLoading = false; // Flag to track whether a request is in progress

// Call the function to get and display artworks on page load
getRandomArtworks();

function getRandomArtworks() {
    if (isLoading) {
        return; // If a request is in progress, do not initiate another one
    }

    isLoading = true; // Set the flag to true as a request is now in progress

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
            console.error('API may be overloaded or there is an issue with the request.');
        })
        .finally(() => {
            isLoading = false; // Reset the flag when the request is completed, whether successful or not
        });
}

function displayArtwork(artwork) {
    const artCardDiv = document.createElement('div');
    artCardDiv.classList.add('art-card'); // Add a class for styling if needed

    const imageElement = document.createElement('img');
    imageElement.classList.add('artImage');

    // Attempt to load the default image size
    imageElement.src = `${iiifBaseUrl}/${artwork.image_id}/full/843,/0/default.jpg`;

    // Add an event listener to handle errors
    imageElement.addEventListener('error', () => {
        // If an error occurs, try alternative image sizes
        const alternativeSizes = [200, 400, 600];
        for (const size of alternativeSizes) {
            const alternativeSrc = `${iiifBaseUrl}/${artwork.image_id}/full/${size},/0/default.jpg`;
            // Check if the alternative image size is available
            fetch(alternativeSrc)
                .then(response => {
                    if (response.ok) {
                        imageElement.src = alternativeSrc;
                    }
                })
                .catch(error => {
                    console.error(`Error fetching alternative image: ${error}`);
                });
        }
    });

    artCardDiv.appendChild(imageElement);
    artCardDiv.innerHTML += `
    <div class="artInfo">
        <p class="artistName">Artist: ${artwork.artist_display}</p>
        <p class="artTitle">Title: ${artwork.title}</p>
        <p class="artMedium">Medium: ${artwork.medium_display}</p>
    </div>
    `;

    artworkContainer.appendChild(artCardDiv);
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

let scrollTimeout;
chicagoTab.addEventListener('scroll', () => {
    // Clear the previous timeout
    clearTimeout(scrollTimeout);

    // Set a new timeout to debounce the scroll event
    scrollTimeout = setTimeout(() => {
        // Check if the user has reached the bottom of the Chicago tab content
        if (chicagoTab.scrollHeight - chicagoTab.scrollTop === chicagoTab.clientHeight) {
            // Load more artworks for Chicago
            console.log('Fetched from Chicago');
            getRandomArtworks();
        }
    }, 200); // Adjust the debounce time as needed
});
