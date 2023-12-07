// Debounce function
function debounce(func, wait) {
    let timeout;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

// Global variables
let ongoingRequests = 0;
const maxConcurrentRequests = 3; // Adjust the number as needed

// Function to fetch the tombstone data and primary image for a random object
function fetchRandomObjectPrinceton() {
    // Generate a random object ID (you can adjust the range as needed)
    const randomObjectIdPrinceton = Math.floor(Math.random() * 50000) + 1; // Change the range as needed

    if (ongoingRequests >= maxConcurrentRequests) {
        console.log('Too many ongoing requests. Skipping fetch for object ID:', randomObjectIdPrinceton);
        return;
    }

    ongoingRequests++;

    // Fetch the tombstone data
    fetch(`https://data.artmuseum.princeton.edu/objects/${randomObjectIdPrinceton}/tombstone`)
        .then(response => {
            // Check the HTTP status code
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        })
        .then(data => {
            // Check if the data includes a primary image
            if (data.primaryimage) {
                // Create a new div for each artwork
                const artDiv = document.createElement('div');
                artDiv.classList.add('art-card');

                // Display the tombstone data on the webpage
                artDiv.innerHTML = `
                    <img class="artImage" src="${data.primaryimage}/full/!400,400/0/default.jpg" alt="Art Image">
                    <h2 class="artTitle">${data.displaytitle}</h2>
                    <p><strong>Artist:</strong> <span>${data.displaymaker || 'Unknown'}</span></p>
                    <p><strong>Medium:</strong> <span>${data.medium}</span></p>
                `;

                // Append the artwork div to the artwork-container container
                document.getElementById('artwork-container').appendChild(artDiv);
            } else {
                // Retry with another object if there is no primary image
                console.log('Retrying fetch for object ID:', randomObjectIdPrinceton);
                fetchRandomObjectPrinceton();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Retry in case of an error
            console.log('Retrying fetch for object ID:', randomObjectIdPrinceton);
            fetchRandomObjectPrinceton();
        })
        .finally(() => {
            ongoingRequests--;
        });
}

// Function to fetch and display more artworks when the user scrolls
function fetchMoreArtworksPrinceton() {
    for (let i = 0; i < 5; i++) {
        fetchRandomObjectPrinceton();
    }
}

// Call the fetchRandomObject function when the page loads
window.addEventListener('load', () => {
    for (let i = 0; i < 5; i++) {
        fetchRandomObjectPrinceton();
    }
});

// Add event listener for scrolling with debouncing
const princetonTab = document.getElementById('princetonTab');
const debouncedFetchMoreArtworksPrinceton = debounce(fetchMoreArtworksPrinceton, 300); // Adjust the wait time as needed
princetonTab.addEventListener('scroll', () => {
    const scrollPercentage = (princetonTab.scrollTop + princetonTab.clientHeight) / princetonTab.scrollHeight * 100;
    if (scrollPercentage >= 80) {
        console.log('Fetched from Princeton');
        debouncedFetchMoreArtworksPrinceton();
    }
});

console.log('Fetched from Princeton:');
