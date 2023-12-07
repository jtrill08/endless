function displayArtworkMet(artwork) {
    const artContainer = document.getElementById('art-containerMet');

    const artCardDiv = document.createElement('div');
    artCardDiv.classList.add('art-card'); // Add a class for styling if needed

    const title = artwork.title || '';
    const artist = artwork.artistDisplayName || '';

    artCardDiv.innerHTML = `
        <img class="artImage" src="${artwork.primaryImage}" alt="${title}">
        <p>Title: ${title}</p>
        <p>Artist: ${artist}</p>
    `;

    artContainer.appendChild(artCardDiv);
}

async function fetchAndDisplayRandomArtworksMet(retryCount = 10) {
    try {
        const apiUrl = 'https://collectionapi.metmuseum.org/public/collection/v1/objects';
        const response = await fetch(apiUrl);

        if (!response.ok) {
            if (response.status === 404) {
                console.log('404 error encountered. Skipping to the next fact.');
                return await fetchAndDisplayRandomArtworksMet();
            } else if (response.status === 429) {
                if (retryCount > 0) {
                    const retryDelay = Math.pow(2, 4 - retryCount) * 1000;
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    return await fetchAndDisplayRandomArtworksMet(retryCount - 1);
                } else {
                    throw new Error('Rate limit exceeded, and maximum retry count reached.');
                }
            } else {
                throw new Error(`API request failed with status: ${response.status}`);
            }
        }

        const data = await response.json();

        if (data && data.objectIDs) {
            const randomObjectID = data.objectIDs[Math.floor(Math.random() * data.objectIDs.length)];
            const objectDetailResponse = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${randomObjectID}`);
            const objectDetailData = await objectDetailResponse.json();

                if (objectDetailData && objectDetailData.primaryImage) {
                    const artwork = {
                        title: objectDetailData.title || '',
                        artistDisplayName: objectDetailData.artistDisplayName || '',
                        primaryImage: objectDetailData.primaryImage || '',
                    };

                    displayArtworkMet(artwork);
                } else {
                    console.log('Invalid data received from the API: Missing image');
                } return await fetchAndDisplayRandomArtworksMet(retryCount - 1);
            
        } else {
            console.log('Artwork skipped because it has no data.');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Function to fetch and display more artworks when the user scrolls
function fetchMoreArtworksMet() {
    fetchAndDisplayRandomArtworksMet();
}

// Set up the Intersection Observer for scrolling
const optionsMet = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5,
};

const observerMet = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            // Load more artworks when the bottom of the page is reached
            fetchMoreArtworksMet();
        }
    });
}, optionsMet);

// Get the metTab container element
const metTab = document.getElementById('metTab');

// Start observing the container
observerMet.observe(metTab);

let isFetchingMet = false;

metTab.addEventListener('scroll', () => {
    const scrollPercentage = (metTab.scrollTop + metTab.clientHeight) / metTab.scrollHeight * 100;

    if (scrollPercentage >= 80 && !isFetching) {
        isFetching = true;

        // Load more artworks for the Met Museum
        console.log('Fetched from the Met Museum');
        fetchAndDisplayRandomArtworksMet();

        // Allow the next request after a certain delay (e.g., 2 seconds)
        setTimeout(() => {
            isFetchingMet = false;
        }, 2000);
    }
});



console.log('Fetched from the Met Museum:');
