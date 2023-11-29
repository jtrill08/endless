  // Function to generate a random object ID
  function getRandomObjectID() {
    // Generate a random object ID between 1 and 1000000 (adjust the range as needed)
    return Math.floor(Math.random() * 1000000) + 1;
}

// Function to fetch and display object data with an image
function fetchAndDisplayObjectWithImage() {
    const randomObjectID = getRandomObjectID();
    const apiUrlVa = `https://api.vam.ac.uk/v2/museumobject/O${randomObjectID}`;

    // Fetch data from the API
    fetch(apiUrlVa)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data); // Log the entire API response for inspection

            if (data.record && data.record.briefDescription && data.meta && data.meta.images && data.meta.images._iiif_image) {
                // Extract relevant information from the API response
                const objectTitle = data.record.briefDescription;
                const objectDescription = data.record.contentDescription || 'Description not available';
                const iiifImageUrl = data.meta.images._iiif_image;

                // Construct the IIIF thumbnail URL
                const thumbnailUrl = `${iiifImageUrl}full/!1000,1000/0/default.jpg`;

                // Create HTML elements for the artwork
                const artworkDivVa = document.createElement('div');
                artworkDivVa.classList.add('artwork-containerVa');
                artworkDivVa.innerHTML = `
                    <img src="${thumbnailUrl}" alt="Object Image">
                    <p>Title: ${objectTitle}</p>
                    <p>Description: ${objectDescription}</p>
                `;

                // Append the artwork to the container
                artworkContainerVa.appendChild(artworkDivVa);
            } else {
                // If the object doesn't have an image, retry with another object
                fetchAndDisplayObjectWithImage();
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            // Retry with another object in case of an error
            fetchAndDisplayObjectWithImage();
        });
}

// Function to handle intersection observer events
function handleIntersection(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Load more artworks when the bottom of the page is reached
            fetchAndDisplayObjectWithImage();
        }
    });
}

// Set up the Intersection Observer
const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5,
};

const observer = new IntersectionObserver(handleIntersection, options);

// Get the artwork container element
const artworkContainerVa = document.getElementById('artwork-containerVa');

// Start observing the container
observer.observe(artworkContainerVa);

// Add event listener for scrolling
window.addEventListener('scroll', () => {
    // Check if the user has scrolled to the bottom of the page
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        // Load more artworks
        fetchAndDisplayObjectWithImage();
    }
});

// Load initial artworks
fetchAndDisplayObjectWithImage();
fetchAndDisplayObjectWithImage();


console.log('Fetched from V&A:'); 
