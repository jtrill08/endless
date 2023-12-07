// Function to debounce a callback function
function debounce(callback, delay) {
    let timeoutId;
    return function () {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            callback.apply(this, arguments);
        }, delay);
    };
}
  // Function to generate a random object ID
  function getRandomObjectIDVa() {
    // Generate a random object ID between 1 and 1000000 (adjust the range as needed)
    return Math.floor(Math.random() * 1000000) + 1;
}

// Function to fetch and display object data with an image
// Function to fetch and display object data with an image
function fetchAndDisplayObjectWithImage() {
    const randomObjectIDVa = getRandomObjectIDVa();
    const apiUrlVa = `https://api.vam.ac.uk/v2/museumobject/O${randomObjectIDVa}`;

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
                artworkDivVa.classList.add('art-card');
                artworkDivVa.innerHTML = `
                    <div class="artInfo">
                            <img class="artImage" src="${thumbnailUrl}" alt="Object Image">
                            <p>Title: ${objectTitle}</p>
                            <p>Description: ${objectDescription}</p>
                    </div>
                `;

                // Append the artwork card to the container
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

// Add event listener for scrolling with debouncing
const vaTab = document.getElementById('vaTab');

// Define the debounced version of the scroll handler
const debouncedScrollHandler = debounce(() => {
    // Calculate the scroll percentage
    const scrollPercentage = (vaTab.scrollTop + vaTab.clientHeight) / vaTab.scrollHeight * 100;

    // Check if the user has scrolled to 80% from the bottom of the VA tab content
    if (scrollPercentage >= 80) {
        // Load more artworks for VA
        console.log('Fetched from VA');
        fetchAndDisplayObjectWithImage();
    }
}, 300); // Adjust the delay (in milliseconds) according to your needs

// Add the debounced scroll event listener
vaTab.addEventListener('scroll', debouncedScrollHandler);



// Load initial artworks
fetchAndDisplayObjectWithImage();
fetchAndDisplayObjectWithImage();


console.log('Fetched from V&A:'); 
